import { useQuery } from '@tanstack/vue-query'
import { supabase } from '@/lib/supabaseClient'
import type { LandRegistration } from '@/types'

const fetchLandRegistrations = async () => {
  const { data, error } = await supabase
    .from('land_registrations')
    .select()
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error((error as any).message)
  }

  return data as LandRegistration[]
}

export const useLandRegistrations = () => {
  return useQuery({
    queryKey: ['land_registrations'],
    queryFn: fetchLandRegistrations,
  })
}
