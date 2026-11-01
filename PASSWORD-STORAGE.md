# Sample account password storage

The former fast digest used a password-derived constant in place of a random salt. The server-only sample now derives a256-bit key with PBKDF2-HMAC-SHA256 at600,000 iterations and a fresh128-bit cryptographic salt for each password. It compares fixed-size derived keys with the Node constant-time comparison, rejects unknown/legacy hash formats and work factors, and bounds UTF-8 input before derivation. Account registration completes derivation before inserting the sample user and rechecks concurrent duplicates.

No new package or locked dependency is added. This uses the existing Node server profile. See the [OWASP password-storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). This is not a FIPS certification or a claim that the whole authentication service is production-ready.

Users and sessions remain in memory. There is no persistent account migration: server restarts lose sample accounts. Real account persistence, abuse limits, session lifecycle/authorization, OAuth/provider setup and supported server deployment need separate implementation and qualification. The static preview does not acquire a working backend from this hash change.

Payment endpoints are separately held: the existing examples trust client-provided price/amount and lack server-owned order/ownership checks. Do not enable them for a real payment service. This password fix does not resolve that scope or qualify a storefront release.
