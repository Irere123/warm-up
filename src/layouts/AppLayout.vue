<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
        <SidebarTrigger class="-ml-1" />
        <LanguageSwitcher />
      </header>

      <div class="flex flex-1 flex-col gap-4 p-4">
        <slot />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import AppSidebar from '../components/AppSidebar.vue'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
</script>
