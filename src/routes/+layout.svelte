<script lang="ts">
 import {onMount} from 'svelte';
 import {cart} from '#lib/stores/cart.js';
 onMount(()=>cart.restore());
 import {catalogProduct} from "#lib/catalog-products.js";
 import {page} from "$app/state";
 import {isStaticPreview} from "#lib/preview.js";
 import {previewCopy} from "#lib/preview-copy.js";
 const currentProduct=$derived(catalogProduct(page.params.id??""));
 const routeLabel=$derived((page.route.id??"/").split('/').filter(Boolean).map(part=>part.startsWith('[')?Object.entries(page.params).find(([key])=>key===part.slice(1,-1))?.[1]??part:part).join(' ').replaceAll('-',' ')||"Home");
 const pageDescription=$derived(currentProduct ? (currentProduct.description??currentProduct.name+" — "+currentProduct.category+" sample catalog entry.") : routeLabel+" — "+"DigitalVault"+" sample storefront. Explore the supplied catalog and local preview information; connected services require configuration.");
 const readOnly=$derived(isStaticPreview&&/^\/(auth|account|checkout|success|tracking|custom-design|gift)(\/|$)/.test(page.route.id??''));
  import "../app.css";
  import Header from "#lib/components/Header.svelte";
  import Footer from "#lib/components/Footer.svelte";

  let { children } = $props();
</script>

<svelte:head>
  <title>DigitalVault - Premium Digital Products Marketplace</title>
  <meta name="description" content={pageDescription} />
</svelte:head>

<div class="min-h-screen flex flex-col dark bg-background text-foreground">
  <Header />
  <main class="flex-1">
    {#if isStaticPreview}<p class="border-b px-4 py-3 text-sm" role="note">{previewCopy.notice}</p>{/if}
 {#if readOnly}<p class="px-4 py-3 text-sm" role="note">{previewCopy.readonly}</p><fieldset disabled class="m-0 min-w-0 border-0 p-0"><legend class="sr-only">Read-only sample screen</legend>{@render children()}</fieldset>{:else}{@render children()}{/if}
  </main>
  <Footer />
</div>
