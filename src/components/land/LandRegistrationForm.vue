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
  z
    .object({
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
        .instanceof(File)
        .refine((file) => file.size <= 10 * 1024 * 1024, {
          message: 'File size must be less than 10MB',
        })
        .refine(
          (file) => ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type),
          {
            message: 'File must be PDF, JPG, JPEG, or PNG format',
          },
        )
        .optional(),
      ownership_proof_url: z.string().url({ message: 'Please provide a valid URL' }).optional(),
    })
    .refine((data) => data.ownership_proof || data.ownership_proof_url, {
      message: 'Please provide either a file upload or a document URL',
      path: ['ownership_proof'],
    }),
)

const { handleSubmit, setFieldValue, resetForm } = useForm({
  validationSchema: formSchema,
})

const { mutate, isPending, error } = useLandRegistration()

const onSubmit = handleSubmit(async (values) => {
  try {
    // Convert file to data URL
    let ownershipProofUrl = values.ownership_proof_url || ''

    if (values.ownership_proof && !ownershipProofUrl) {
      ownershipProofUrl = await fileToDataUrl(values.ownership_proof)
    }

    const formData = {
      parcel_id: values.parcel_id,
      size: values.size,
      ownership_type: values.ownership_type,
      ownership_proof_url: ownershipProofUrl,
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
  } catch (error) {
    emit('error', error instanceof Error ? error.message : 'Failed to process file')
  }
})

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    setFieldValue('ownership_proof', target.files[0])
    // Clear the URL field when a file is selected
    setFieldValue('ownership_proof_url', '')
  }
}

const handleUrlChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.value.trim()) {
    // Clear the file input when a URL is entered
    setFieldValue('ownership_proof', undefined)
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

// Helper function to convert file to data URL
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

defineExpose({
  resetForm,
})
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

      <div class="space-y-4">
        <h3 class="text-sm font-medium">Ownership Proof Document *</h3>
        <p class="text-sm text-muted-foreground">
          Choose one option: upload a file or provide a URL to your document
        </p>

        <FormField v-slot="{ componentField }" name="ownership_proof">
          <FormItem>
            <FormLabel>Option 1: Upload File</FormLabel>
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

        <div class="text-center text-sm text-muted-foreground">OR</div>

        <FormField v-slot="{ componentField }" name="ownership_proof_url">
          <FormItem>
            <FormLabel>Option 2: Document URL</FormLabel>
            <FormControl>
              <Input
                type="url"
                placeholder="https://example.com/document.pdf"
                v-bind="componentField"
                @input="handleUrlChange"
              />
            </FormControl>
            <p class="text-sm text-muted-foreground mt-1">
              Provide a direct link to your ownership proof document
            </p>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <Button type="submit" class="w-full" :disabled="isPending">
        {{ isPending ? 'Registering...' : 'Register Land' }}
      </Button>
    </form>
  </div>
</template>
