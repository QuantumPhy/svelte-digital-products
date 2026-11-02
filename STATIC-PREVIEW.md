# Static gallery preview and optional server application

`pnpm build` first runs all application tests and compiles the complete server application. It then copies the frontend routes into an ignored generated directory and produces strict prerendered HTML with adapter-static. The generated preview graph excludes server endpoints and server loaders; original server source, auth, Stripe integration and tests remain in the repository and remix archive. No SPA fallback is supplied.

`pnpm build:server` retains the server application for an independently configured remix deployment. Server credentials, durable account storage, provider catalog/ownership, fulfillment, abuse controls and business policies require deployment-specific configuration and qualification. The source's sample account data is not a production identity database.

The static gallery clearly labels illustrative data. Account and checkout controls are read-only; no personal/payment details should be entered. Newsletter delivery and checkout receipt verification are unavailable. Cart and other local UI examples do not create real orders. This separation does not certify real billing or business operations. Unknown dynamic identities must return real 404s; the static preview must not use a catch-all fallback.

`COCODING_TEMPLATE_BASE` is a validated mount path. Both source builds and the final artifact remain subject to the existing sealed-source, frozen dependency, audit, browser, CSP and static resource checks. This change does not authorize a release or relax those checks.

This frame is an unqualified delivery candidate. Source-specific identities, local workflows, fonts/assets, accessibility and browser checks remain to be completed; no publication or provider acceptance is implied.
