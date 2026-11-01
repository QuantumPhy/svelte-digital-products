<script lang="ts">
 import type {PageData} from './$types';
 import NavigationLink from '#lib/components/shared/NavigationLink.svelte';
 let {data}:{data:PageData}=$props();
</script>
<svelte:head><title>{data.article.title} | DigitalVault Support</title><meta name="description" content={data.article.description} /></svelte:head>
<div class="container mx-auto px-4 py-16 max-w-4xl space-y-8">
 <NavigationLink href="/support" class="text-primary underline">Back to Support</NavigationLink>
 <div><p class="text-muted-foreground mb-3">{data.article.category} · Sample support index</p><h1 class="text-4xl font-bold">{data.article.title}</h1></div>
 <p class="border rounded-xl p-5 text-muted-foreground">The title and category come from the supplied support index. Full article text was not supplied; the information below describes this preview's actual availability.</p>
 <section class="bg-card border rounded-xl p-8 space-y-4"><h2 class="text-2xl font-semibold">{data.article.availabilityTitle}</h2><p>{data.article.body}</p><p class="text-sm text-muted-foreground">Illustrative index reads: {data.article.reads}. This is supplied sample data, not a live view counter.</p></section>
 <NavigationLink href={'/'+data.article.destination} class="text-primary underline">{data.article.destinationLabel}</NavigationLink>
</div>
