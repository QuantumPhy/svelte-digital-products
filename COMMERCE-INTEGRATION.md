# Storefront commerce integration

The payment routes require a signed-in server session. Customer IDs, account ownership, line prices, currency, trials and return URLs are no longer taken from the request body. The existing Stripe SDK helpers and verified webhook remain available; the public routes use the shared guarded service. A small typed provider adapter preserves each template's existing lazy getter or proxy convention and its SDK configuration.

## Required server configuration

Keep `COCODING_PRICE_CATALOG` empty until the store owner configures authoritative prices. Missing or invalid configuration returns HTTP 501 without a provider call. Merely adding a Stripe key cannot enable arbitrary client-priced checkout.

- `STRIPE_SECRET_KEY`: the store owner's appropriate Stripe key, supplied through their private server configuration.
- `COCODING_COMMERCE_BASE_URL`: the store's HTTPS base URL, including any approved mount path. It must not contain credentials, a query or a fragment. It determines the allowed write origin and checkout return URLs.
- `COCODING_PRICE_CATALOG`: a server-only JSON object. Product keys join the percent-encoded product ID, variant, size and color with `|`. Empty options retain empty segments: `shirt|||` or `shirt||M|navy`.

An illustrative catalog, to be deliberately replaced with the store's verified configuration:

```json
{
  "shirt|||": {"kind": "one-time", "name": "Sample shirt", "unitAmount": 1999},
  "shirt||M|navy": {"kind": "one-time", "name": "Sample shirt, M navy", "unitAmount": 2499},
  "monthly|||": {"kind": "recurring", "priceId": "price_replace_me", "trialDays": 7}
}
```

One-time amounts are integer USD minor units. Recurring prices must be active USD recurring prices in the configured Stripe account. Trial periods are optional server settings, not client options. The catalog is bounded; quantities, combined duplicate quantities, checkout modes and order totals are checked before creating a payment object. See [Stripe's Checkout documentation](https://docs.stripe.com/payments/checkout).

## Account and request boundaries

The current account comes only from the existing server session. New Stripe customers are bound to that account's generated ID in provider metadata; customer lookup never selects another account by a submitted email. Session, intent and subscription reads and changes require matching provider ownership metadata. Legacy records without an ownership binding are rejected and need verified migration before reuse.

Writes require the configured origin and JSON where a body is expected. Streamed bodies are bounded to 64 KiB. Unauthenticated and unconfigured creation requests do not consume submitted fields. GET requests never create a customer. Removing catalog entries does not block an authorized cancellation or resumption. Provider failures return a generic failure without logging or returning raw provider details.

The subscription card uses hosted checkout; it does not place a client secret in a URL or depend on an absent custom payment-completion page. The existing direct subscription API remains available for an authorized custom integration.

## Receipt and cart state

The return page verifies the requested checkout reference, completed status, payment status, mode and supported amount before displaying a confirmed result. It does not claim that a confirmation email or delivery occurred. A one-time purchase clears the cart only when its per-tab captured cart still matches; subscription returns and changed carts are preserved. The short-lived functional session record contains only the checkout reference and cart fingerprint. No analytics or visitor beacon is added.

## Remaining release requirements

The supplied users and sessions still live in memory. Durable account storage, abuse limits, verified account/provider lifecycle, webhook idempotency and actual fulfillment must be implemented and qualified for a real business. This change does not certify the entire account or commerce system as production-ready.

The default template gallery delivery remains held because these storefronts contain server endpoints. Their source features must be preserved in a compatible isolated preview/server strategy. Do not turn off the shared source guards, static-artifact checker, preview CSP, resource bounds or ownership checks to get a deployment pass. Never inject platform billing credentials into template previews.

Unit tests exercise the real shared handlers and service with only the Stripe network boundary simulated. They do not create charges, customers or subscriptions, and do not qualify a real provider, browser payment flow, worker or deployment. Fresh source checks, suitable worker/runtime qualification and each template's own Jenkins/public/remix acceptance are still required.
