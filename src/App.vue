<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Toaster } from 'vue-sonner'
import AppLayout from './layouts/AppLayout.vue'
</script>

<template>
  <Toaster />
  <AppLayout>
    <RouterView />
  </AppLayout>
</template>
