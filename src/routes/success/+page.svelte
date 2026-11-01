<script lang="ts">
 import {isStaticPreview} from "#lib/preview.js";
 import NavigationLink from "#lib/components/shared/NavigationLink.svelte";
	import { resolve } from '$app/paths';
	import {checkoutCopy} from '#lib/commerce-copy.js';
	import {confirmedCheckout,CheckoutStatusError,canClearPurchasedCart,pendingCheckoutKey,isPendingCheckout} from '#lib/checkout-state.js';
	import { page } from '$app/state';
	import { Button } from '#lib/components/ui/button/index.js';
	import { CheckCircle, Package, ArrowRight, Loader2 } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import {cart,getCartItemsForCheckout} from '#lib/stores/cart.js';

	let loading = $state(true);
	let orderDetails = $state<ReturnType<typeof confirmedCheckout>|null>(null);
	let error = $state('');

	onMount(async () => {
		if(isStaticPreview){error=checkoutCopy.unavailable;loading=false;return;}
 const sessionId = page.url.searchParams.get('session_id');

		if (!sessionId) {
			error=checkoutCopy.noSession;
			loading = false;
			return;
		}

		try {
			const response = await fetch(resolve('/api/checkout')+'?'+new URLSearchParams({session_id:sessionId}));
			const data = await response.json();

			if (response.ok) {
				orderDetails=confirmedCheckout(data,sessionId);
				// Clear only a verified one-time purchase whose captured cart is unchanged.
				try {
					const key=pendingCheckoutKey(resolve('/api/checkout')),pending=sessionStorage.getItem(key);
					if(canClearPurchasedCart(orderDetails,pending,getCartItemsForCheckout()))cart.clear();
					if(isPendingCheckout(pending,orderDetails.id))sessionStorage.removeItem(key);
				} catch { /* Keep the cart when storage is unavailable. */ }
			} else {
				error = data.message || 'Failed to retrieve order details';
			}
		} catch (err) {
			error=err instanceof CheckoutStatusError?err.message:checkoutCopy.unavailable;
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>{checkoutCopy.title}</title>
	<meta name="description" content="View a checkout result verified for the signed-in account." />
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div class="min-h-screen bg-background flex items-center justify-center px-4">
	<div class="max-w-md w-full text-center space-y-6">
		<h1 class="sr-only">{checkoutCopy.title}</h1>
		{#if loading}
			<div class="flex flex-col items-center gap-4">
				<Loader2 class="h-12 w-12 text-primary animate-spin" />
				<p class="text-muted-foreground">Loading order details...</p>
			</div>
		{:else if error}
			<div class="space-y-4">
				<div class="bg-destructive/10 text-destructive p-4 rounded-lg">
					{error}
				</div>
				<Button href="/">Return to Home</Button>
			</div>
		{:else}
			<div class="bg-card border rounded-xl p-8 shadow-sm space-y-6">
				<div class="flex justify-center">
					<div class="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
						<CheckCircle class="h-12 w-12 text-green-600 dark:text-green-400" />
					</div>
				</div>

				<div class="space-y-2">
					<h2 class="text-2xl font-bold">{orderDetails?.paymentStatus==='paid'?checkoutCopy.paidHeading:checkoutCopy.completedHeading}</h2>
					<p class="text-muted-foreground">
						{checkoutCopy.confirmedDetails}
					</p>
				</div>

				{#if orderDetails}
					<div class="bg-muted/50 rounded-lg p-4 space-y-2">
						<div class="flex justify-between text-sm">
							<span class="text-muted-foreground">Order ID</span>
							<span class="font-mono">{orderDetails.id.slice(0, 16)}...</span>
						</div>
						<div class="flex justify-between text-sm">
							<span class="text-muted-foreground">Total</span>
							<span class="font-semibold">
								${orderDetails.amount.toFixed(2)} {orderDetails.currency}
							</span>
						</div>
					</div>
				{/if}

				<div class="space-y-3">
					<Button href="/account/orders" class="w-full">
						<Package class="h-4 w-4 mr-2" />
						View Order
					</Button>
					<Button variant="outline" href="/shop" class="w-full">
						Continue Shopping
						<ArrowRight class="h-4 w-4 ml-2" />
					</Button>
				</div>
			</div>

			<p class="text-sm text-muted-foreground">
				Questions about your order?
				<NavigationLink href="/contact" class="text-primary hover:underline">Contact us</NavigationLink>
			</p>
		{/if}
	</div>
</div>
