<script lang="ts">
 import NavigationLink from "#lib/components/shared/NavigationLink.svelte";
</script>
<svelte:head><title>Account access | DigitalVault</title></svelte:head>
<section class="max-w-xl mx-auto px-6 py-20 text-center">
 <h1 class="text-3xl font-semibold mb-4">Your account</h1>
 <p class="text-muted-foreground mb-8">Explore the sign-in and registration screens. Account services are not connected in this static sample.</p>
 <div class="flex flex-wrap justify-center gap-4">
  <NavigationLink href="/auth/login" class="rounded-lg bg-primary text-primary-foreground px-6 py-3 font-medium">Sign in</NavigationLink>
  <NavigationLink href="/auth/register" class="rounded-lg border border-border px-6 py-3 font-medium">Create an account</NavigationLink>
 </div>
</section>
