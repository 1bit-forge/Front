<script setup>
import { Sunny } from '@element-plus/icons-vue'
import { APP_NAME } from '@/constants/app'
</script>

<template>
  <div class="auth-page">
    <header class="auth-header">
      <router-link to="/login" class="auth-brand">
        <span class="auth-brand__icon" aria-hidden="true">
          <el-icon :size="18"><Sunny /></el-icon>
        </span>
        {{ APP_NAME }}
      </router-link>
      <a href="#" class="auth-support" @click.prevent>Support</a>
    </header>

    <main class="auth-main">
      <slot />
      <p class="auth-disclaimer">
        By using {{ APP_NAME }}, you agree to our Terms of Service and Privacy Policy.
      </p>
    </main>

    <footer class="auth-bottom">
      <span>{{ APP_NAME }} © 2026. All rights reserved.</span>
      <nav class="auth-bottom__links" aria-label="Legal">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Cookie Settings</a>
      </nav>
    </footer>
  </div>
</template>
