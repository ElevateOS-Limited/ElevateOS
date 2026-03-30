export type SiteVariant = 'main' | 'tutoring'

export function getSiteVariantFromHost(host?: string | null): SiteVariant {
  const hostname = (host || '').toLowerCase().split(':')[0]
  if (hostname === 'tutoring.elevateos.org' || hostname.startsWith('tutoring.')) {
    return 'tutoring'
  }
  return 'main'
}

export function getSiteVariantFromHeaders(
  headerStore: Pick<Headers, 'get'> | { get(name: string): string | null },
): SiteVariant {
  const explicitVariant = headerStore.get('x-site-variant')
  if (explicitVariant === 'main' || explicitVariant === 'tutoring') {
    return explicitVariant
  }

  const forwardedHost = headerStore.get('x-forwarded-host')
  if (forwardedHost) {
    return getSiteVariantFromHost(forwardedHost)
  }

  return getSiteVariantFromHost(headerStore.get('host'))
}

export function isTutoringVariant(host?: string | null) {
  return getSiteVariantFromHost(host) === 'tutoring'
}
