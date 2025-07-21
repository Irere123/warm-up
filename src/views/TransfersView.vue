<script setup lang="ts">
import { ref, watch } from 'vue'
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
import TransferForm from '@/components/transfers/TransferForm.vue'
import TransferList from '@/components/transfers/TransferList.vue'

const isTransferDialogOpen = ref(false)
const dialogError = ref<string | null>(null)
const formRef = ref<InstanceType<typeof TransferForm> | null>(null)

const handleFormSuccess = () => {
  isTransferDialogOpen.value = false
  dialogError.value = null
}

const handleFormError = (message: string) => {
  dialogError.value = message
}

watch(isTransferDialogOpen, (isOpen) => {
  if (!isOpen) {
    dialogError.value = null
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
      <Dialog v-model:open="isTransferDialogOpen">
        <DialogTrigger as-child>
          <Button>
            <Plus class="mr-2 h-4 w-4" />
            Initiate Transfer
          </Button>
        </DialogTrigger>
        <DialogContent class="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Initiate Land Transfer</DialogTitle>
            <DialogDescription>
              Complete the form to start a land transfer process.
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

          <TransferForm ref="formRef" @success="handleFormSuccess" @error="handleFormError" />
        </DialogContent>
      </Dialog>
    </div>

    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">All Transfers</h2>
      <TransferList />
    </div>
  </div>
</template>
