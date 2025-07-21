<script setup lang="ts">
import { ref } from 'vue'
import { Plus, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert/index'
import { AlertCircle } from 'lucide-vue-next'
import LandRegistrationForm from '@/components/land/LandRegistrationForm.vue'
import RegistrationList from '@/components/land/RegistrationList.vue'

const isRegistrationDialogOpen = ref(false)
const dialogError = ref<string | null>(null)

const handleFormSuccess = () => {
  isRegistrationDialogOpen.value = false
  dialogError.value = null
}

const handleFormError = (message: string) => {
  dialogError.value = message
}
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

          <Alert v-if="dialogError" variant="destructive" class="mb-4">
            <AlertCircle class="h-4 w-4" />
            <AlertDescription class="flex items-center justify-between">
              {{ dialogError }}
              <Button variant="ghost" size="sm" @click="dialogError = null" class="h-auto p-1 ml-2">
                <X class="h-3 w-3" />
              </Button>
            </AlertDescription>
          </Alert>

          <LandRegistrationForm @success="handleFormSuccess" @error="handleFormError" />
        </DialogContent>
      </Dialog>
    </div>

    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">My Registrations</h2>
      <RegistrationList />
    </div>
  </div>
</template>
