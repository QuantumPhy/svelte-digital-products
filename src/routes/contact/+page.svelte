<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { ArrowLeft } from '@lucide/svelte';
</script>

<svelte:head>
	<title>Contact Us</title>
	<meta name="description" content="Get support for your downloads." />
</svelte:head>

<div class="min-h-screen bg-background">
	<div class="container mx-auto px-4 py-16 max-w-4xl">
		<Button variant="ghost" href="/" class="mb-8">
			<ArrowLeft class="h-4 w-4 mr-2" />
			Back to Home
		</Button>

		<h1 class="text-4xl font-bold mb-6">Contact Us</h1>

		<div class="prose prose-lg dark:prose-invert max-w-none">
			<p class="text-xl text-muted-foreground mb-8">
				Get support for your downloads.
			</p>

			<div class="bg-card border rounded-xl p-8 text-center">
				<p class="text-muted-foreground">
					Live support messaging is not connected in this preview. You can browse the original sample FAQs and check sample form fields locally; no message is sent or saved.
				</p>
			<Button href="/support" variant="outline" class="mt-6">Browse sample support</Button>
			</div>
		</div>
	</div>
</div>
