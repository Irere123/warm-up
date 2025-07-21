<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useUpdateLandTransfer } from '@/composables/useUpdateLandTransfer'
import type { LandTransfer } from '@/types'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'

const props = defineProps<{
  open: boolean
  transfer: LandTransfer | null
}>()

const emit = defineEmits(['update:open'])

const internalOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const formSchema = toTypedSchema(
  z.object({
    recipient_id: z.string().min(10, 'Recipient ID is required'),
    parcel_id: z.string().min(5, 'Parcel ID must be at least 5 characters'),
    contract: z.union([z.instanceof(File), z.string()]).optional(),
  }),
)

const { handleSubmit, setFieldValue, resetForm, setValues } = useForm({
  validationSchema: formSchema,
})

const { mutate: updateTransfer, isPending } = useUpdateLandTransfer()

watch(
  () => props.transfer,
  (newTransfer) => {
    if (newTransfer) {
      setValues({
        recipient_id: newTransfer.recipient_id,
        parcel_id: newTransfer.parcel_id,
        contract: newTransfer.contract_url,
      })
    } else {
      resetForm()
    }
  },
)

const onSubmit = handleSubmit((values) => {
  if (!props.transfer) return

  updateTransfer(
    { ...values, id: props.transfer.id },
    {
      onSuccess: () => {
        emit('update:open', false)
      },
    },
  )
})

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    setFieldValue('contract', target.files[0])
  }
}
</script>

<template>
  <Dialog v-model:open="internalOpen">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Land Transfer</DialogTitle>
      </DialogHeader>
      <form class="space-y-6 py-4" @submit.prevent="onSubmit">
        <FormField v-slot="{ componentField }" name="recipient_id">
          <FormItem>
            <FormLabel>Recipient National ID</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="parcel_id">
          <FormItem>
            <FormLabel>Parcel ID</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="contract">
          <FormItem>
            <FormLabel>Update Signed Contract (Optional)</FormLabel>
            <FormControl>
              <Input type="file" @change="handleFileChange" accept="image/*,application/pdf" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <DialogFooter>
          <DialogClose as-child>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="submit" :disabled="isPending">
            <span v-if="isPending">Saving...</span>
            <span v-else>Save Changes</span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
