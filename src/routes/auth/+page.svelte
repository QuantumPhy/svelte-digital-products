<script lang="ts">
 import {templateHref} from "#lib/template-href.js";
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto(templateHref('/auth/login'), { replaceState: true });
	});
</script>

<svelte:head>
	<title>Account access | DigitalVault</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-background">
	<div class="text-center">
		<p class="text-muted-foreground">Redirecting to login...</p>
	</div>
</div>
