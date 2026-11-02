import type Stripe from 'stripe';
import {assertOwner, CommerceError, configuredPlan, objectInput, ownerKey, paymentTotal, recordId, requireActor, resolveCart, type CommerceActor, type CommerceCatalog} from './commerce-policy.js';

export function createCommerceService(provider: () => Stripe, catalog: () => CommerceCatalog, urls: () => {success:string;cancel:string}) {
  const pendingCustomers = new Map<string, Promise<Stripe.Customer>>();
  async function checkedPlan(priceId: string) {
    const price=await provider().prices.retrieve(priceId);
    if(!price.active||price.currency!=='usd'||price.type!=='recurring')throw new CommerceError(400,'The configured recurring price is unavailable.');
  }
  async function customer(actor: CommerceActor): Promise<Stripe.Customer> {
    requireActor(actor);
    if (actor.stripeCustomerId) {
      const found = await provider().customers.retrieve(recordId(actor.stripeCustomerId));
      if (found.deleted) throw new CommerceError(404, 'Customer not found.');
      assertOwner(found.metadata, actor); return found;
    }
    let pending = pendingCustomers.get(actor.id);
    if (!pending) {
      pending = provider().customers.create({email:actor.email, name:actor.name ?? undefined, metadata:{[ownerKey]:actor.id}});
      pendingCustomers.set(actor.id, pending);
    }
    try { const found = await pending; assertOwner(found.metadata, actor); actor.stripeCustomerId = found.id; return found; }
    finally { if (pendingCustomers.get(actor.id) === pending) pendingCustomers.delete(actor.id); }
  }
  async function ownedSubscription(actor: CommerceActor, id: unknown) {
    requireActor(actor); const sub = await provider().subscriptions.retrieve(recordId(id));
    assertOwner(sub.metadata, actor); return sub;
  }
  function summary(sub: Stripe.Subscription) {
    const first = sub.items.data[0];
    return {id:sub.id,status:sub.status,currentPeriodStart:first?new Date(first.current_period_start*1000).toISOString():null,currentPeriodEnd:first?new Date(first.current_period_end*1000).toISOString():null,cancelAtPeriodEnd:sub.cancel_at_period_end,priceId:first?.price.id,canceledAt:sub.canceled_at?new Date(sub.canceled_at*1000).toISOString():null};
  }
  return {
    async checkout(actor: CommerceActor, value: unknown) {
      requireActor(actor); const input = objectInput(value), mode = input.mode ?? 'payment';
      if (mode !== 'payment' && mode !== 'subscription') throw new CommerceError(400, 'Unsupported checkout mode.');
      const prices=catalog();
      const hostedPlan=mode==='subscription'&&input.priceId!==undefined?configuredPlan(input.priceId,prices):null;
      const lines=hostedPlan?[{key:'',quantity:1,product:hostedPlan}]:resolveCart(input.items,prices,mode), paths=urls();
      if(mode==='subscription')await Promise.all(lines.map(line=>line.product.kind==='recurring'?checkedPlan(line.product.priceId):Promise.resolve()));
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = lines.map(line => ({quantity:line.quantity,...(line.product.kind==='one-time'?{price_data:{currency:'usd',product_data:{name:line.product.name},unit_amount:line.product.unitAmount}}:{price:line.product.priceId})}));
      const owned = await customer(actor);
      const session = await provider().checkout.sessions.create({customer:owned.id,line_items:lineItems,mode,metadata:{[ownerKey]:actor.id},...(mode==='subscription'?{subscription_data:{metadata:{[ownerKey]:actor.id},...(hostedPlan?.trialDays?{trial_period_days:hostedPlan.trialDays}:{})}}:{payment_intent_data:{metadata:{[ownerKey]:actor.id}}}),success_url:paths.success+'?session_id={CHECKOUT_SESSION_ID}',cancel_url:paths.cancel});
      return {sessionId:session.id,url:session.url};
    },
    async readCheckout(actor: CommerceActor, id: unknown) {
      requireActor(actor); const session = await provider().checkout.sessions.retrieve(recordId(id));
      assertOwner(session.metadata, actor);
      if(session.currency&&session.currency!=='usd')throw new CommerceError(501,'This sample supports USD order summaries only.');
      return {id:session.id,mode:session.mode,status:session.status,paymentStatus:session.payment_status,customerEmail:session.customer_details?.email,amountTotal:session.amount_total===null?null:session.amount_total/100,currency:session.currency};
    },
    async intent(actor: CommerceActor, value: unknown) {
      requireActor(actor); const input=objectInput(value), amount=paymentTotal(resolveCart(input.items,catalog(),'payment'));
      const owned=await customer(actor);
      const intent=await provider().paymentIntents.create({amount,currency:'usd',customer:owned.id,metadata:{[ownerKey]:actor.id},automatic_payment_methods:{enabled:true}});
      return {clientSecret:intent.client_secret,paymentIntentId:intent.id};
    },
    async readIntent(actor: CommerceActor, id: unknown) {
      requireActor(actor); const intent=await provider().paymentIntents.retrieve(recordId(id));
      assertOwner(intent.metadata,actor);if(intent.currency!=='usd')throw new CommerceError(501,'This sample supports USD order summaries only.');return {id:intent.id,status:intent.status,amount:intent.amount/100,currency:intent.currency};
    },
    async subscribe(actor: CommerceActor, value: unknown) {
      requireActor(actor); const input=objectInput(value), plan=configuredPlan(input.priceId,catalog());await checkedPlan(plan.priceId);const owned=await customer(actor);
      const sub=await provider().subscriptions.create({customer:owned.id,items:[{price:plan.priceId}],payment_behavior:'default_incomplete',payment_settings:{save_default_payment_method:'on_subscription'},expand:['latest_invoice.confirmation_secret'],metadata:{[ownerKey]:actor.id},...(plan.trialDays?{trial_period_days:plan.trialDays}:{})});
      const invoice=sub.latest_invoice;return {subscriptionId:sub.id,customerId:owned.id,clientSecret:invoice&&typeof invoice!=='string'?invoice.confirmation_secret?.client_secret??null:null,status:sub.status};
    },
    async subscriptions(actor: CommerceActor, requestedCustomer: unknown) {
      requireActor(actor);
      if(requestedCustomer && requestedCustomer!==actor.stripeCustomerId) throw new CommerceError(404,'Customer not found.');
      if(!actor.stripeCustomerId) return {subscriptions:[]};
      const owned=await customer(actor), list=await provider().subscriptions.list({customer:owned.id,status:'all'});
      return {subscriptions:list.data.filter(sub=>sub.metadata[ownerKey]===actor.id).map(summary)};
    },
    async subscription(actor: CommerceActor,id: unknown) {return summary(await ownedSubscription(actor,id));},
    async updateSubscription(actor: CommerceActor,id: unknown,value: unknown) {
      requireActor(actor); const input=objectInput(value), data: Stripe.SubscriptionUpdateParams={};
      if(input.priceId!==undefined) {const plan=configuredPlan(input.priceId,catalog());const sub=await ownedSubscription(actor,id);await checkedPlan(plan.priceId);data.proration_behavior='create_prorations';if(!sub.items.data[0])throw new CommerceError(400,'No subscription item is available.');data.items=[{id:sub.items.data[0].id,price:plan.priceId}];}
      else await ownedSubscription(actor,id);
      if(input.cancelAtPeriodEnd!==undefined){if(typeof input.cancelAtPeriodEnd!=='boolean')throw new CommerceError(400,'A boolean cancellation setting is required.');data.cancel_at_period_end=input.cancelAtPeriodEnd;}
      if(!Object.keys(data).length)throw new CommerceError(400,'No supported subscription change was supplied.');
      return summary(await provider().subscriptions.update(recordId(id),data));
    },
    async cancelSubscription(actor: CommerceActor,id: unknown,immediately: boolean) {await ownedSubscription(actor,id);return summary(immediately?await provider().subscriptions.cancel(recordId(id)):await provider().subscriptions.update(recordId(id),{cancel_at_period_end:true}));},
    async resumeSubscription(actor: CommerceActor,id: unknown) {await ownedSubscription(actor,id);return summary(await provider().subscriptions.update(recordId(id),{cancel_at_period_end:false}));}
  };
}
export type CommerceService=ReturnType<typeof createCommerceService>;
