import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { getStripePriceId, type PlanId } from '@/lib/plans'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const plan = body.plan as PlanId

  if (plan !== 'starter' && plan !== 'practice' && plan !== 'firm') {
    return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
  }

  const priceId = getStripePriceId(plan)
  if (!priceId) {
    return NextResponse.json(
      { error: `Stripe price ID not configured for ${plan}` },
      { status: 500 }
    )
  }

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, organizations(id, name, stripe_customer_id, stripe_subscription_id)')
    .eq('user_id', user.id)
    .single()

  const org = Array.isArray(membership?.organizations)
    ? membership.organizations[0]
    : membership?.organizations

  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: org.stripe_customer_id || undefined,
    customer_email: org.stripe_customer_id ? undefined : user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    subscription_data: {
      // Offer 14-day free trial only on first-time subscriptions
      trial_period_days: org.stripe_subscription_id ? undefined : 14,
      metadata: {
        organization_id: org.id,
        plan,
      },
    },
    metadata: {
      organization_id: org.id,
      plan,
    },
    success_url: `${appUrl}/dashboard/billing?success=1`,
    cancel_url: `${appUrl}/dashboard/billing?canceled=1`,
  })

  return NextResponse.json({ url: session.url })
}