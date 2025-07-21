<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useLandRegistration } from '@/composables/useLandRegistration'

const emit = defineEmits<{
  success: []
  error: [message: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const formSchema = toTypedSchema(
  z.object({
    parcel_id: z
      .number({ message: 'Parcel ID is required' })
      .int({ message: 'Parcel ID must be a whole number' })
      .positive({ message: 'Parcel ID must be a positive number' }),
    size: z
      .number({ message: 'Land size is required' })
      .positive({ message: 'Land size must be a positive number' })
      .max(1000000, { message: 'Land size cannot exceed 1,000,000 square meters' }),
    ownership_type: z
      .string({ message: 'Ownership type is required' })
      .min(1, { message: 'Please select an ownership type' }),
    ownership_proof: z
      .instanceof(File, { message: 'Please upload an ownership proof document' })
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

const { mutate, isPending, error } = useLandRegistration()

const onSubmit = handleSubmit((values) => {
  const formData = {
    parcel_id: values.parcel_id,
    size: values.size,
    ownership_type: values.ownership_type,
    ownership_proof: values.ownership_proof,
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
    setFieldValue('ownership_proof', target.files[0])
  }
}
</script>

<template>
  <div class="space-y-6">
    <form class="space-y-6" @submit="onSubmit">
      <FormField v-slot="{ componentField }" name="parcel_id">
        <FormItem>
          <FormLabel>Land Parcel ID *</FormLabel>
          <FormControl>
            <Input type="number" placeholder="e.g., 12345 (numeric ID)" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="size">
        <FormItem>
          <FormLabel>Land Size (square meters) *</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder="e.g., 1000 (must be greater than 0)"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="ownership_type">
        <FormItem>
          <FormLabel>Ownership Type *</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder="e.g., Freehold, Leasehold, etc."
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="ownership_proof">
        <FormItem>
          <FormLabel>Ownership Proof Document *</FormLabel>
          <FormControl>
            <Input
              ref="fileInput"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              @change="handleFileChange"
            />
          </FormControl>
          <p class="text-sm text-muted-foreground mt-1">
            Upload PDF, JPG, JPEG, or PNG files (max 10MB)
          </p>
          <FormMessage />
        </FormItem>
      </FormField>

      <Button type="submit" class="w-full" :disabled="isPending">
        {{ isPending ? 'Registering...' : 'Register Land' }}
      </Button>
    </form>
  </div>
</template>
