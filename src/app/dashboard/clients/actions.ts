'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const clientSchema = z.object({
  name: z.string().min(2, 'Client name must be at least 2 characters'),
  email: z.string().email('Please enter a valid client email address'),
})

export async function addClient(formData: FormData) {
  const parsed = clientSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: membership, error: memberError } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (memberError || !membership) {
    return { error: 'Could not verify your firm membership' }
  }

  const { error } = await supabase.from('clients').insert({
    organization_id: membership.organization_id,
    name: parsed.data.name.trim(),
    email: parsed.data.email.trim().toLowerCase(),
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/clients')
  return { success: true }
}

export async function deleteClient(clientId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/clients')
  return { success: true }
}