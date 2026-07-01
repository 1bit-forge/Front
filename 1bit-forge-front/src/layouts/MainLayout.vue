<template>
  <div class="common-layout">
    <el-container class="layout-container">
      <el-aside width="240px" class="layout-aside">
        <div class="aside-inner">
          <nav class="aside-nav">
            <router-link
              v-for="item in mainNavItems"
              :key="item.name"
              :to="{ name: item.name }"
              class="nav-item"
              active-class="is-active"
              :exact-active-class="item.exact ? 'is-active' : undefined"
            >
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.label }}</span>
            </router-link>
          </nav>
          <div class="aside-footer">
            <div class="aside-divider" />
            <router-link
              v-for="item in footerNavItems"
              :key="item.name"
              :to="{ name: item.name }"
              class="nav-item"
              active-class="is-active"
            >
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.label }}</span>
            </router-link>
          </div>
        </div>
      </el-aside>
      <el-container>
        <el-header v-if="showHeader" class="layout-header" />
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Calendar, Setting } from '@element-plus/icons-vue'

const route = useRoute()
const showHeader = computed(() => route.meta.header !== false)

const navItems = [
  { name: 'calendar', label: 'Calendar', icon: Calendar, exact: true, footer: false },
  { name: 'settings', label: 'Settings', icon: Setting, exact: false, footer: true },
]

const mainNavItems = computed(() => navItems.filter((item) => !item.footer))
const footerNavItems = computed(() => navItems.filter((item) => item.footer))
</script>

<style scoped>
.common-layout,
.layout-container {
  height: 100vh;
}

.layout-aside {
  background: var(--background-color);
  padding: 16px 12px;
  border-right: 1px solid rgba(60, 60, 60, 0.12);
}

.aside-inner {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  color: var(--Black);
  text-decoration: none;
  font-size: 15px;
}

.nav-item.is-active {
  background: #f2ede4;
}

.aside-divider {
  height: 1px;
  background: rgba(60, 60, 60, 0.12);
  margin-bottom: 8px;
}

.layout-header {
  background: var(--White);
  height: 64px;
}
</style>
