import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'vue-sonner'
import type { Land, LandInsert } from '@/types'

export const useLandStore = defineStore('land', () => {
  // State
  const lands = ref<Land[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const landCount = computed(() => lands.value.length)
  const pendingLands = computed(() => lands.value.filter(land => land.status === 'pending'))
  const approvedLands = computed(() => lands.value.filter(land => land.status === 'approved'))

  // Actions
  const fetchLands = async () => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('land')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      lands.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch land records'
      toast.error(`Failed to load land records: ${error.value}`)
    } finally {
      loading.value = false
    }
  }

  const addLand = async (landData: Omit<LandInsert, 'supporting_documents' | 'status'> & { ownership_proof: File }) => {
    loading.value = true
    error.value = null

    try {
      // 1. Upload the ownership proof file
      const file = landData.ownership_proof
      const fileExt = file.name.split('.').pop()
      const filePath = `land-documents/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) {
        throw new Error(`File upload failed: ${uploadError.message}`)
      }

      // 2. Get the public URL of the uploaded file
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      if (!urlData) {
        throw new Error('Could not get public URL for the document.')
      }

      // 3. Insert the land record into the database
      const { data, error: dbError } = await supabase
        .from('land')
        .insert({
          parcel_id: landData.parcel_id,
          size: landData.size,
          ownership_type: landData.ownership_type,
          supporting_documents: urlData.publicUrl,
          status: 'pending'
        })
        .select()
        .single()

      if (dbError) {
        // Attempt to delete the uploaded file if DB insert fails
        await supabase.storage.from('documents').remove([filePath])
        throw new Error(`Database error: ${dbError.message}`)
      }

      // Add to local state
      lands.value.unshift(data)
      toast.success('Land registration submitted successfully!')
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to register land'
      toast.error(`Registration failed: ${error.value}`)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateLandStatus = async (id: number, status: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('land')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        throw new Error(updateError.message)
      }

      // Update local state
      const index = lands.value.findIndex(land => land.id === id)
      if (index !== -1) {
        lands.value[index] = data
      }

      toast.success('Land status updated successfully!')
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update land status'
      toast.error(`Status update failed: ${error.value}`)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteLand = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('land')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      // Remove from local state
      lands.value = lands.value.filter(land => land.id !== id)
      toast.success('Land record deleted successfully!')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete land record'
      toast.error(`Delete failed: ${error.value}`)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    lands,
    loading,
    error,
    // Getters
    landCount,
    pendingLands,
    approvedLands,
    // Actions
    fetchLands,
    addLand,
    updateLandStatus,
    deleteLand,
    clearError
  }
})
