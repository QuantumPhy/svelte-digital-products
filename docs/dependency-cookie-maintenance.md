# Cookie dependency maintenance

Jenkins fleet #6 reports cookie 0.6.0 / GHSA-pxg6-pf52-xh8x in this source.
The upstream advisory patches versions below 0.7.0. Resolve cookie 0.7.2 under
the reviewed pnpm authority, consistent with the catalog security policy.

Source: https://github.com/jshttp/cookie/security/advisories/GHSA-pxg6-pf52-xh8x

Regenerate the lock only inside the credential-free Jenkins repair worker.
Require complete advisory/secret scans and independent frozen source/build,
real browser, accessibility/navigation and final desktop/mobile capture review.
Preserve the existing application code and visual design; this dependency patch
does not imply any runtime deployment or all-latest dependency claim. Other
major/outdated upgrades remain in the full fleet report.
