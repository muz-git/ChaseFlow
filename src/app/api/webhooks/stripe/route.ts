import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlanFromPriceId, type PlanId } from '@/lib/plans'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const organizationId = session.metadata?.organization_id
      const plan = (session.metadata?.plan as PlanId) || 'starter'

      if (organizationId && session.customer && session.subscription) {
        await admin
          .from('organizations')
          .update({
            plan,
            stripe_customer_id: String(session.customer),
            stripe_subscription_id: String(session.subscription),
            subscription_status: 'active',
          })
          .eq('id', organizationId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const priceId = subscription.items.data[0]?.price?.id
      const resolvedPlan = getPlanFromPriceId(priceId)
      const isEntitled =
        subscription.status === 'active' || subscription.status === 'trialing'

      await admin
        .from('organizations')
        .update({
          plan: isEntitled ? resolvedPlan : 'starter',
          stripe_subscription_id: subscription.id,
          subscription_status: subscription.status,
        })
        .eq('stripe_customer_id', String(subscription.customer))
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription

      await admin
        .from('organizations')
        .update({
          plan: 'starter',
          stripe_subscription_id: null,
          subscription_status: 'canceled',
        })
        .eq('stripe_customer_id', String(subscription.customer))
      break
    }
  }

  return NextResponse.json({ received: true })
}