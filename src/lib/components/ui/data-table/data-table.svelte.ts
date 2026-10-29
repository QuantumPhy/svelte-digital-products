/**
 * Svelte 5 / TanStack Table v9 integration.
 * Declare enabled features with tableFeatures(), pass reactive options through
 * getters, and read state through table.atoms or table.store.
 *
 * The existing entrypoint remains available; v9 options intentionally follow
 * the upstream feature-based contract. No v8 state/options shim is applied.
 * https://tanstack.com/table/latest/docs/framework/svelte/guide/migrating
 */
export { createTable as createSvelteTable } from "@tanstack/svelte-table";
