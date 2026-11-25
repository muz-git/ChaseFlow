export type PlanId = 'starter' | 'practice' | 'firm'

export interface PlanConfig {
  id: PlanId
  name: string
  priceLabel: string
  monthlyRequestLimit: number | null // null = unlimited
  storageLimitGb: number
  maxTeamSeats: number
  features: {
    automatedReminders: boolean
    customBranding: boolean
    zipExport: boolean
  }
}

export const PLANS: Record<PlanId, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    priceLabel: '£9.99/mo',
    monthlyRequestLimit: 10,
    storageLimitGb: 10,
    maxTeamSeats: 1,
    features: {
      automatedReminders: false,
      customBranding: false,
      zipExport: false,
    },
  },
  practice: {
    id: 'practice',
    name: 'Practice',
    priceLabel: '£19.99/mo',
    monthlyRequestLimit: 50,
    storageLimitGb: 50,
    maxTeamSeats: 1,
    features: {
      automatedReminders: true,
      customBranding: true,
      zipExport: false,
    },
  },
  firm: {
    id: 'firm',
    name: 'Firm',
    priceLabel: '£39.99/mo',
    monthlyRequestLimit: null,
    storageLimitGb: 250,
    maxTeamSeats: 5,
    features: {
      automatedReminders: true,
      customBranding: true,
      zipExport: true,
    },
  },
}

export function getPlanConfig(plan?: string | null): PlanConfig {
  if (plan === 'practice' || plan === 'firm') {
    return PLANS[plan]
  }
  return PLANS.starter
}

export function getStripePriceId(plan: PlanId): string | undefined {
  switch (plan) {
    case 'starter':
      return process.env.STRIPE_PRICE_STARTER
    case 'practice':
      return process.env.STRIPE_PRICE_PRACTICE
    case 'firm':
      return process.env.STRIPE_PRICE_FIRM
  }
}

export function getPlanFromPriceId(priceId?: string | null): PlanId {
  if (!priceId) return 'starter'
  if (priceId === process.env.STRIPE_PRICE_FIRM) return 'firm'
  if (priceId === process.env.STRIPE_PRICE_PRACTICE) return 'practice'
  return 'starter'
}