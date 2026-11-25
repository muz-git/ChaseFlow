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