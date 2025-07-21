<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import LandRegistrationForm from '@/components/land/LandRegistrationForm.vue'
import RegistrationList from '@/components/land/RegistrationList.vue'

const isRegistrationDialogOpen = ref(false)
const formRef = ref<InstanceType<typeof LandRegistrationForm> | null>(null)

const handleFormSuccess = () => {
  isRegistrationDialogOpen.value = false
}

watch(isRegistrationDialogOpen, (isOpen) => {
  if (!isOpen) {
    setTimeout(() => {
      if (formRef.value && typeof formRef.value.resetForm === 'function') {
        formRef.value.resetForm()
      }
    }, 100)
  }
})
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-end">
      <Dialog v-model:open="isRegistrationDialogOpen">
        <DialogTrigger as-child>
          <Button>
            <Plus class="mr-2 h-4 w-4" />
            Register New Land
          </Button>
        </DialogTrigger>
        <DialogContent class="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Register New Land</DialogTitle>
            <DialogDescription>
              Fill out the form below to submit your land for registration.
            </DialogDescription>
          </DialogHeader>



          <LandRegistrationForm
            ref="formRef"
            @success="handleFormSuccess"
          />
        </DialogContent>
      </Dialog>
    </div>

    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">My Registrations</h2>
      <RegistrationList />
    </div>
  </div>
</template>
