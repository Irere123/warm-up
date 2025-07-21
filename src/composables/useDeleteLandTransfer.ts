import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'vue-sonner'

const deleteLandTransfer = async (id: string) => {
  const { error } = await supabase.from('land_transfers').delete().match({ id })

  if (error) {
    throw new Error(error.message)
  }

  return id
}

export const useDeleteLandTransfer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteLandTransfer,
    onSuccess: () => {
      toast.success('Land transfer deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['land_transfers'] })
    },
    onError: (error) => {
      toast.error(`Deletion failed: ${error.message}`)
    },
  })
}
