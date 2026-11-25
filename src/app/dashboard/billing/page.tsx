import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { CheckCircle2, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getPlanConfig } from '@/lib/plans'
import { BillingClient } from './BillingClient'

async function BillingContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ success?: string; canceled?: string }>
}) {
  await connection()
  const searchParams = await searchParamsPromise
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organizations(plan, stripe_customer_id, subscription_status)')
    .eq('user_id', user.id)
    .single()

  const org = Array.isArray(membership?.organizations)
    ? membership.organizations[0]
    : membership?.organizations

  const planConfig = getPlanConfig(org?.plan)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Plan & Billing</h1>
        <p className="mt-1 text-sm text-slate-600">
          Choose the FetchDocs tier that fits your accounting practice. Upgrade, downgrade, or cancel anytime.
        </p>
      </div>

      {searchParams.success === '1' && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>
            Subscription activated! Your FetchDocs plan features have been unlocked.
          </span>
        </div>
      )}

      {searchParams.canceled === '1' && (
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          <Info className="h-5 w-5 shrink-0 text-slate-400" />
          <span>Checkout was canceled—no charges were made.</span>
        </div>
      )}

      <BillingClient
        currentPlan={planConfig.id}
        subscriptionStatus={org?.subscription_status || 'trialing'}
        hasStripeCustomer={Boolean(org?.stripe_customer_id)}
      />
    </div>
  )
}

export default function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>
}) {
  return (
    <Suspense fallback={<div className="text-sm text-slate-600">Loading billing details...</div>}>
      <BillingContent searchParamsPromise={searchParams} />
    </Suspense>
  )
}