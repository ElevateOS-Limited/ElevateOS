param(
    [string]$AppId = '7f7b18d4-e50c-4b84-a472-8139cbe320a9',
    [string]$DigitalOceanApiToken = $env:DO_API_TOKEN,
    [string]$GoogleServiceAccountKeyPath = 'C:\Users\School\Downloads\arched-science-483612-j6-f013a175bf5e.json',
    [string]$AppOrigin = 'https://elevateos.org',
    [string]$GoogleCloudProject = '',
    [string]$GoogleCloudLocation = 'us-central1',
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

function Get-DoHeaders {
    param([string]$Token)

    if ([string]::IsNullOrWhiteSpace($Token)) {
        throw 'DigitalOcean API token is required. Pass -DigitalOceanApiToken or set DO_API_TOKEN.'
    }

    return @{
        Authorization = "Bearer $Token"
        'Content-Type' = 'application/json'
    }
}

function New-EnvObject {
    param(
        [Parameter(Mandatory = $true)][string]$Key,
        [Parameter(Mandatory = $true)][string]$Value,
        [string]$Scope = 'RUN_TIME',
        [string]$Type
    )

    $entry = [ordered]@{
        key   = $Key
        value = $Value
        scope = $Scope
    }

    if (-not [string]::IsNullOrWhiteSpace($Type)) {
        $entry.type = $Type
    }

    return [pscustomobject]$entry
}

function Upsert-Env {
    param(
        [Parameter(Mandatory = $true)][System.Collections.Generic.List[object]]$EnvList,
        [Parameter(Mandatory = $true)][string]$Key,
        [Parameter(Mandatory = $true)][string]$Value,
        [string]$Scope = 'RUN_TIME',
        [string]$Type
    )

    $existing = $EnvList | Where-Object { $_.key -eq $Key } | Select-Object -First 1
    if ($null -ne $existing) {
        $existing.value = $Value
        $existing.scope = $Scope
        if (-not [string]::IsNullOrWhiteSpace($Type)) {
            $existing.type = $Type
        }
        return
    }

    $EnvList.Add((New-EnvObject -Key $Key -Value $Value -Scope $Scope -Type $Type)) | Out-Null
}

function Set-JsonProperty {
    param(
        [Parameter(Mandatory = $true)]$Object,
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)]$Value
    )

    if ($Object.PSObject.Properties.Name -contains $Name) {
        $Object.$Name = $Value
        return
    }

    $Object | Add-Member -NotePropertyName $Name -NotePropertyValue $Value
}

if (-not (Test-Path -LiteralPath $GoogleServiceAccountKeyPath)) {
    throw "Google service account key not found at $GoogleServiceAccountKeyPath"
}

$headers = Get-DoHeaders -Token $DigitalOceanApiToken
$appResponse = Invoke-RestMethod -Method Get -Uri "https://api.digitalocean.com/v2/apps/$AppId" -Headers $headers
$app = $appResponse.app
if (-not $app -or -not $app.spec) {
    throw "Could not load DigitalOcean app spec for app ID $AppId"
}

$spec = $app.spec

if ($null -eq $spec.envs) {
    $spec.envs = @()
}

$envList = [System.Collections.Generic.List[object]]::new()
foreach ($env in @($spec.envs)) {
    $envList.Add($env) | Out-Null
}

$keyJson = Get-Content -Raw -LiteralPath $GoogleServiceAccountKeyPath
$serviceAccount = $keyJson | ConvertFrom-Json
if ([string]::IsNullOrWhiteSpace($GoogleCloudProject)) {
    $GoogleCloudProject = $serviceAccount.project_id
}

if ([string]::IsNullOrWhiteSpace($GoogleCloudProject)) {
    throw 'GoogleCloudProject could not be inferred from the service account key.'
}

$keyBase64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($keyJson))
$hasDatabaseUrl = $envList | Where-Object { $_.key -eq 'DATABASE_URL' -and -not [string]::IsNullOrWhiteSpace($_.value) }

Upsert-Env -EnvList $envList -Key 'NEXTAUTH_URL' -Value $AppOrigin -Scope 'RUN_TIME'
Upsert-Env -EnvList $envList -Key 'NEXT_PUBLIC_APP_URL' -Value $AppOrigin -Scope 'RUN_AND_BUILD_TIME'
Upsert-Env -EnvList $envList -Key 'GOOGLE_GENAI_USE_VERTEXAI' -Value 'true' -Scope 'RUN_TIME'
Upsert-Env -EnvList $envList -Key 'GOOGLE_CLOUD_PROJECT' -Value $GoogleCloudProject -Scope 'RUN_TIME'
Upsert-Env -EnvList $envList -Key 'GOOGLE_CLOUD_LOCATION' -Value $GoogleCloudLocation -Scope 'RUN_TIME'
Upsert-Env -EnvList $envList -Key 'GOOGLE_APPLICATION_CREDENTIALS_JSON_B64' -Value $keyBase64 -Scope 'RUN_TIME' -Type 'SECRET'

if (-not $hasDatabaseUrl) {
    Upsert-Env -EnvList $envList -Key 'DEMO_MODE' -Value 'true' -Scope 'RUN_TIME'
    Upsert-Env -EnvList $envList -Key 'NEXT_PUBLIC_DEMO_MODE' -Value 'true' -Scope 'RUN_AND_BUILD_TIME'
}

$spec.envs = @($envList)

if ($spec.services -and $spec.services.Count -gt 0) {
    $healthCheck = [pscustomobject]@{
        http_path             = '/healthz'
        port                  = 8080
        initial_delay_seconds = 10
        period_seconds        = 10
        timeout_seconds       = 5
        failure_threshold     = 3
        success_threshold     = 1
    }

    $livenessHealthCheck = [pscustomobject]@{
        http_path             = '/healthz'
        port                  = 8080
        initial_delay_seconds = 30
        period_seconds        = 30
        timeout_seconds       = 5
        failure_threshold     = 3
        success_threshold     = 1
    }

    Set-JsonProperty -Object $spec.services[0] -Name 'health_check' -Value $healthCheck
    Set-JsonProperty -Object $spec.services[0] -Name 'liveness_health_check' -Value $livenessHealthCheck
    $spec.services[0].http_port = 8080
    if ([string]::IsNullOrWhiteSpace($spec.services[0].run_command)) {
        $spec.services[0].run_command = 'npm start'
    }
}

$payload = @{ spec = $spec } | ConvertTo-Json -Depth 40

if ($DryRun) {
    Write-Host "Dry run only. App spec prepared for $AppId."
    Write-Host "Updated env keys:"
    $envList | Select-Object key, scope, type | Sort-Object key | Format-Table -AutoSize
    exit 0
}

$updateResponse = Invoke-RestMethod -Method Put -Uri "https://api.digitalocean.com/v2/apps/$AppId" -Headers $headers -Body $payload

Write-Host "Submitted DigitalOcean app update for $AppId."
Write-Host "App origin: $AppOrigin"
Write-Host "Google project: $GoogleCloudProject"
Write-Host "Demo mode enabled: $([bool](-not $hasDatabaseUrl))"
Write-Host "Update status: $($updateResponse.app.active_deployment.phase)"
