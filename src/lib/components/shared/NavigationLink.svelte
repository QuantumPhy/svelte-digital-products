<script lang="ts">
  import { resolve } from '$app/paths';
  import { base } from '#lib/template-base.js';
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';
  import { navigationTarget } from '#lib/template-navigation.js';

  type Props = Omit<HTMLAnchorAttributes, 'children'> & {
    children?: Snippet;
    ref?: HTMLElement | null;
  };
  let { href, children, ref = $bindable(null), ...attributes }: Props = $props();
  let destination = $derived(navigationTarget(href, base));
</script>

{#if destination.kind === 'external'}
  <a bind:this={ref} {...attributes} href={destination.href} rel="external noopener noreferrer">
    {@render children?.()}
  </a>
{:else if destination.kind === 'fragment'}
  <a bind:this={ref} {...attributes} href={'#' + destination.fragment}>
    {@render children?.()}
  </a>
{:else if destination.kind === 'internal'}
  <a bind:this={ref} {...attributes} href={resolve(...([destination.path] as Parameters<typeof resolve>))}>
    {@render children?.()}
  </a>
{:else}
  <a bind:this={ref} {...attributes} aria-disabled="true">
    {@render children?.()}
  </a>
{/if}
