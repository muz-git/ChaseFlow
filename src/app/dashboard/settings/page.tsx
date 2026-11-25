import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPlanConfig } from '@/lib/plans'
import { BrandingForm } from './BrandingForm'

async function SettingsContent() {
  await connection()
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, organizations(id, name, plan, logo_url, brand_color)')
    .eq('user_id', user.id)
    .single()

  const org = Array.isArray(membership?.organizations)
    ? membership.organizations[0]
    : membership?.organizations

  const planConfig = getPlanConfig(org?.plan)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Practice Branding</h1>
        <p className="mt-1 text-sm text-slate-600">
          Customise how your firm appears when clients open your magic-link upload portals.
        </p>
      </div>

      <BrandingForm
        initialName={org?.name || ''}
        initialLogoUrl={org?.logo_url || null}
        initialBrandColor={org?.brand_color || '#059669'}
        planName={planConfig.name}
        canCustomize={planConfig.features.customBranding}
      />
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-600">Loading branding settings...</div>}>
      <SettingsContent />
    </Suspense>
  )
}