<template>
  <div class="common-layout">
    <el-container class="layout-container">
      <el-aside class="layout-aside" :class="{ 'is-collapsed': collapsed }">
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
            <div class="aside-footer-row">
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
              <button type="button" class="collapse-toggle" @click="collapsed = !collapsed">
                <el-icon><component :is="collapsed ? Expand : Fold" /></el-icon>
              </button>
            </div>
          </div>
        </div>
      </el-aside>
      <el-container>
        <el-header v-if="showHeader" class="layout-header">
          <span class="layout-header__title">{{ route.meta.title }}</span>
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Calendar, Setting, Fold, Expand } from '@element-plus/icons-vue'

const route = useRoute()
const showHeader = computed(() => route.meta.header !== false)
const collapsed = ref(false)

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
  width: 10vw;
  min-width: 150px;
  background: var(--background-color);
  padding: 16px 12px;
  border-right: 1px solid rgba(60, 60, 60, 0.12);
  transition: width 0.2s ease, min-width 0.2s ease;
  overflow: hidden;
}

.layout-aside.is-collapsed {
  width: 64px;
  min-width: 64px;
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
  width: 100%;
}

.nav-item.is-active {
  background: #f2ede4;
}

.aside-divider {
  height: 1px;
  background: rgba(60, 60, 60, 0.12);
  margin-bottom: 8px;
}

.aside-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.is-collapsed .aside-footer-row {
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.is-collapsed .nav-item span {
  display: none;
}

.collapse-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--Black);
  cursor: pointer;
}

.collapse-toggle:hover {
  background: #f2ede4;
}

.layout-header {
  background: var(--White);
  height: 64px;
  display: flex;
  align-items: center;
}

.layout-header__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--Black);
}
</style>
