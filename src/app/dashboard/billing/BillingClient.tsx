'use client'

import { useState } from 'react'
import { Check, CreditCard, Sparkles, ExternalLink } from 'lucide-react'
import { PLANS, type PlanId } from '@/lib/plans'

interface BillingClientProps {
  currentPlan: PlanId
  subscriptionStatus: string
  hasStripeCustomer: boolean
}

const ORDERED_PLANS: PlanId[] = ['starter', 'practice', 'firm']

export function BillingClient({
  currentPlan,
  subscriptionStatus,
  hasStripeCustomer,
}: BillingClientProps) {
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null)
  const [openingPortal, setOpeningPortal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSelectPlan(plan: PlanId) {
    setError(null)
    setLoadingPlan(plan)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await res.json()
      if (!res.ok || !data.url) {
        setError(data.error || 'Unable to start checkout session.')
        setLoadingPlan(null)
        return
      }

      window.location.href = data.url
    } catch {
      setError('Network error starting checkout. Please try again.')
      setLoadingPlan(null)
    }
  }

  async function handleOpenPortal() {
    setError(null)
    setOpeningPortal(true)

    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      const data = await res.json()
      if (!res.ok || !data.url) {
        setError(data.error || 'Unable to open Stripe billing portal.')
        setOpeningPortal(false)
        return
      }

      window.location.href = data.url
    } catch {
      setError('Network error opening billing portal. Please try again.')
      setOpeningPortal(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Summary Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Current Plan
            </span>
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 capitalize">
              {PLANS[currentPlan].name} ({subscriptionStatus || 'trialing'})
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-600">
            {PLANS[currentPlan].monthlyRequestLimit
              ? `${PLANS[currentPlan].monthlyRequestLimit} client requests/month • ${PLANS[currentPlan].storageLimitGb} GB storage`
              : `Unlimited client requests • ${PLANS[currentPlan].storageLimitGb} GB storage • Up to 5 team seats`}
          </p>
        </div>

        {hasStripeCustomer && (
          <button
            type="button"
            onClick={handleOpenPortal}
            disabled={openingPortal}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-xs transition hover:bg-slate-50 disabled:opacity-50"
          >
            <CreditCard className="h-4 w-4 text-slate-600" />
            {openingPortal ? 'Opening Portal...' : 'Manage Billing & Invoices'}
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {error}
        </div>
      )}

      {/* Three-Tier Pricing Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {ORDERED_PLANS.map((planId) => {
          const plan = PLANS[planId]
          const isCurrent = currentPlan === planId && hasStripeCustomer
          const isPopular = planId === 'practice'

          const featureBullets = [
            plan.monthlyRequestLimit
              ? `Up to ${plan.monthlyRequestLimit} document requests / month`
              : 'Unlimited document requests',
            `${plan.storageLimitGb} GB encrypted UK/EU document storage`,
            plan.maxTeamSeats === 1
              ? '1 accountant seat'
              : `Up to ${plan.maxTeamSeats} team seats`,
            plan.features.automatedReminders
              ? 'Automated weekday client reminder emails'
              : 'Manual 1-click reminder emails',
            plan.features.customBranding
              ? 'White-label firm logo & custom brand accent'
              : 'Standard FetchDocs client portal',
            plan.features.zipExport
              ? '1-Click ZIP pack export per client request'
              : 'Individual document downloads',
          ]

          return (
            <div
              key={planId}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 shadow-xs transition ${
                isPopular
                  ? 'border-slate-900 bg-white ring-1 ring-slate-900'
                  : 'border-slate-200 bg-white'
              }`}
            >
              {isPopular && (
                <span className="absolute -top-3 right-5 inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-0.5 text-xs font-semibold text-white">
                  <Sparkles className="h-3 w-3 text-emerald-400" />
                  Most Popular
                </span>
              )}

              <div>
                <h2 className="text-lg font-bold text-slate-900">{plan.name}</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {plan.priceLabel.replace('/mo', '')}
                  </span>
                  <span className="text-sm font-medium text-slate-500">/month</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Includes 14-day free trial • Cancel anytime
                </p>

                <ul className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm text-slate-700">
                  {featureBullets.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                {isCurrent ? (
                  <button
                    type="button"
                    disabled
                    className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800"
                  >
                    Active Plan
                  </button>
                ) : hasStripeCustomer ? (
                  <button
                    type="button"
                    onClick={handleOpenPortal}
                    disabled={openingPortal}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    {openingPortal ? 'Opening Portal...' : `Switch to ${plan.name}`}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(planId)}
                    disabled={loadingPlan !== null}
                    className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition disabled:opacity-50 ${
                      isPopular
                        ? 'bg-slate-900 hover:bg-slate-800'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {loadingPlan === planId
                      ? 'Redirecting to Stripe...'
                      : `Start 14-Day Free Trial`}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}