export type SiteVariant = 'main' | 'tutoring'

export function getSiteVariantFromHost(host?: string | null): SiteVariant {
  const hostname = (host || '').toLowerCase().split(':')[0]
  if (hostname === 'tutoring.elevateos.org' || hostname.startsWith('tutoring.')) {
    return 'tutoring'
  }
  return 'main'
}

export function isTutoringVariant(host?: string | null) {
  return getSiteVariantFromHost(host) === 'tutoring'
}
