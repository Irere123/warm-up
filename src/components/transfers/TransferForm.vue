<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { useLandTransfer } from '@/composables/useLandTransfer'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const emit = defineEmits<{
  success: []
  error: [message: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const formSchema = toTypedSchema(
  z.object({
    recipient_name: z
      .string({ message: 'Recipient name is required' })
      .min(2, { message: 'Recipient name must be at least 2 characters' })
      .max(100, { message: 'Recipient name must not exceed 100 characters' }),
    parcel_id: z
      .string({ message: 'Parcel ID is required' })
      .min(1, { message: 'Parcel ID is required' })
      .max(50, { message: 'Parcel ID must not exceed 50 characters' }),
    contract: z
      .instanceof(File, { message: 'Please upload a contract document' })
      .refine((file) => file.size > 0, { message: 'Please select a valid contract file' })
      .refine((file) => file.size <= 10 * 1024 * 1024, {
        message: 'File size must be less than 10MB',
      })
      .refine(
        (file) => ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type),
        {
          message: 'File must be PDF, JPG, JPEG, or PNG format',
        },
      ),
  }),
)

const { handleSubmit, setFieldValue, resetForm } = useForm({
  validationSchema: formSchema,
})

const { mutate, isPending, error } = useLandTransfer()

const onSubmit = handleSubmit((values) => {
  const formData = {
    recipient_name: values.recipient_name,
    parcel_id: values.parcel_id,
    contract: values.contract,
  }
  mutate(formData, {
    onSuccess: () => {
      resetForm()
      emit('success')
    },
    onError: (error) => {
      emit('error', error.message)
    },
  })
})

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    setFieldValue('contract', target.files[0])
  }
}
</script>

<template>
  <div class="space-y-6">
    <form class="space-y-6" @submit="onSubmit">
      <FormField v-slot="{ componentField }" name="recipient_name">
        <FormItem>
          <FormLabel>Recipient Name *</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder="e.g., John Doe (full name of recipient)"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="parcel_id">
        <FormItem>
          <FormLabel>Land Parcel ID *</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder="e.g., PARCEL-12345 or any valid parcel identifier"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField name="contract">
        <FormItem>
          <FormLabel>Transfer Contract Document *</FormLabel>
          <FormControl>
            <Input
              type="file"
              ref="fileInput"
              @change="handleFileChange"
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </FormControl>
          <p class="text-sm text-muted-foreground mt-1">
            Upload PDF, JPG, JPEG, or PNG files (max 10MB)
          </p>
          <FormMessage />
        </FormItem>
      </FormField>

      <Button type="submit" class="w-full" :disabled="isPending">
        <span v-if="isPending">Initiating...</span>
        <span v-else>Initiate Transfer</span>
      </Button>
    </form>
  </div>
</template>
