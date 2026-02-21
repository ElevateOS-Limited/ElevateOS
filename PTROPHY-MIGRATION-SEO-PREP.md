# ptrophy.com Migration SEO Prep (from crystalcentury.com dev)

## Current state
- Dev domain: `www.crystalcentury.com`
- Indexing: discouraged (`blog_public=0`) while in development
- Legal pages published and linked in footer:
  - /terms-of-service/
  - /privacy-policy/
  - /cookie-policy/
  - /disclaimer/

## Pre-migration checklist
1. Finalize production domain DNS + SSL for `ptrophy.com` and `www.ptrophy.com`.
2. Keep site architecture/slugs stable before cutover.
3. Export a full redirect map from old URLs to new URLs (1:1 where possible).
4. Prepare 301 redirects at web server/CDN level (not 302).
5. Verify canonical tags point to `https://www.ptrophy.com/...` after launch.
6. Generate and submit new sitemap in Search Console/Bing Webmaster.
7. Keep old domain redirects for at least 12 months.
8. Re-enable indexing (`blog_public=1`) only on production.

## Redirect policy
- Preferred host: `www.ptrophy.com`
- Protocol: HTTPS only
- Rule: old URL path should map to same path on new host whenever possible.

Example:
- `https://www.crystalcentury.com/products/trophy-a` -> `https://www.ptrophy.com/products/trophy-a`

## Day-0 validation
- [ ] homepage 200 on new domain
- [ ] top 20 old URLs return 301 to intended new URLs
- [ ] no redirect chains (>1 hop)
- [ ] robots.txt reachable and correct
- [ ] sitemap.xml valid and reachable
- [ ] canonical URL host switched to `www.ptrophy.com`
- [ ] Search Console property verified

## Day-7 validation
- [ ] crawl errors reviewed
- [ ] 404s mapped or redirected
- [ ] index coverage improving
- [ ] Core Web Vitals and server logs reviewed
