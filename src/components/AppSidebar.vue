<script setup lang="ts">
import { Building2, FileText, Home, MapPin, Users } from 'lucide-vue-next'

import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavUser from '@/components/NavUser.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  type SidebarProps,
} from '@/components/ui/sidebar'

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon',
})

const route = useRoute()
const router = useRouter()

// Land management navigation data
const data = {
  user: {
    name: 'Land Owner',
    email: 'owner@landchain.com',
    avatar: '/avatars/user.jpg',
  },
  navMain: [
    {
      title: 'My Land',
      url: '/my-land',
      icon: Home,
      routeName: 'my-land',
    },
    {
      title: 'Transfers',
      url: '/transfers',
      icon: FileText,
      routeName: 'transfers',
    },
  ],
}

const isActiveRoute = (routeName: string) => {
  return route.name === routeName
}

const navigateTo = (url: string) => {
  router.push(url)
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <a href="#">
              <div
                class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
              >
                <Building2 class="size-4" />
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-medium">Cadestra</span>
                <span class="truncate text-xs">Land Registry</span>
              </div>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in data.navMain" :key="item.title">
              <SidebarMenuButton
                :is-active="isActiveRoute(item.routeName)"
                @click="navigateTo(item.url)"
              >
                <component :is="item.icon" />
                <span>{{ item.title }}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
  </Sidebar>
</template>
