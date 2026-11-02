<script lang="ts">
 import {page} from "$app/state";
 import {isStaticPreview} from "#lib/preview.js";
 import {previewCopy} from "#lib/preview-copy.js";
 const readOnly=$derived(isStaticPreview&&/^\/(auth|account|checkout|success|tracking|custom-design|gift)(\/|$)/.test(page.route.id??''));
  import "../app.css";
  import Header from "#lib/components/Header.svelte";
  import Footer from "#lib/components/Footer.svelte";

  let { children } = $props();
</script>

<svelte:head>
  <title>DigitalVault - Premium Digital Products Marketplace</title>
  <meta name="description" content="Your trusted marketplace for premium digital products. Software, templates, courses, ebooks, and digital assets from top creators worldwide." />
</svelte:head>

<div class="min-h-screen flex flex-col dark bg-background text-foreground">
  <Header />
  <main class="flex-1">
    {#if isStaticPreview}<p class="border-b px-4 py-3 text-sm" role="note">{previewCopy.notice}</p>{/if}
 {#if readOnly}<p class="px-4 py-3 text-sm" role="note">{previewCopy.readonly}</p><fieldset disabled class="m-0 min-w-0 border-0 p-0"><legend class="sr-only">Read-only sample screen</legend>{@render children()}</fieldset>{:else}{@render children()}{/if}
  </main>
  <Footer />
</div>
