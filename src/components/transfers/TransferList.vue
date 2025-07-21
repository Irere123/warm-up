<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLandTransfers } from '@/composables/useLandTransfers'
import { useDeleteLandTransfer } from '@/composables/useDeleteLandTransfer'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import UpdateTransferDialog from './UpdateTransferDialog.vue'

const { data: transfers, isLoading, isError, error } = useLandTransfers()
const { mutate: deleteTransfer } = useDeleteLandTransfer()

const isConfirmDialogOpen = ref(false)
const transferIdToDelete = ref<string | null>(null)

const isUpdateDialogOpen = ref(false)
const selectedTransfer = ref<any | null>(null)

const statusVariant = computed(() => {
  return (status: string) => {
    switch (status) {
      case 'approved':
        return 'default'
      case 'processing':
        return 'secondary'
      case 'pending':
        return 'outline'
      case 'rejected':
        return 'destructive'
      default:
        return 'secondary'
    }
  }
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const handleUpdate = (transfer: any) => {
  selectedTransfer.value = transfer
  isUpdateDialogOpen.value = true
}

const handleDelete = (id: string) => {
  transferIdToDelete.value = id
  isConfirmDialogOpen.value = true
}

const confirmDelete = () => {
  if (transferIdToDelete.value) {
    deleteTransfer(transferIdToDelete.value)
  }
  closeDialog()
}

const closeDialog = () => {
  isConfirmDialogOpen.value = false
  transferIdToDelete.value = null
}
</script>

<template>
  <div class="mt-6 border rounded-lg">
    <div v-if="isLoading" class="p-4 space-y-4">
      <Skeleton class="h-8 w-full" v-for="n in 3" :key="n" />
    </div>

    <div v-else-if="isError" class="p-4 text-red-500">
      <p>Error fetching transfers: {{ error?.message }}</p>
    </div>

    <Table v-else-if="transfers && transfers.length">
      <TableHeader>
        <TableRow>
          <TableHead>Parcel ID</TableHead>
          <TableHead>Recipient ID</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date Initiated</TableHead>
          <TableHead class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="transfer in transfers" :key="transfer.id">
          <TableCell class="font-medium">{{ transfer.parcel_id }}</TableCell>
          <TableCell>{{ transfer.recipient_id }}</TableCell>
          <TableCell>
            <Badge :variant="statusVariant(transfer.status)">
              {{ transfer.status.replace('_', ' ') }}
            </Badge>
          </TableCell>
          <TableCell>{{ formatDate(transfer.created_at) }}</TableCell>
          <TableCell class="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" class="w-8 h-8 p-0">
                  <span class="sr-only">Open menu</span>
                  <i class="i-lucide-more-horizontal" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="handleUpdate(transfer)">Update</DropdownMenuItem>
                <DropdownMenuItem @click="handleDelete(transfer.id)" class="text-red-600"
                  >Delete</DropdownMenuItem
                >
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <div v-else class="p-6 text-center text-muted-foreground">
      <p>No land transfers have been initiated yet.</p>
    </div>

    <ConfirmDialog
      :open="isConfirmDialogOpen"
      title="Are you sure?"
      description="This action cannot be undone. This will permanently delete the transfer record."
      @confirm="confirmDelete"
      @cancel="closeDialog"
    />

    <UpdateTransferDialog v-model:open="isUpdateDialogOpen" :transfer="selectedTransfer" />
  </div>
</template>
