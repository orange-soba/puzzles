<template>
  <div class="layout">
    <SidebarLeft />

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import SidebarLeft from './components/SidebarLeft.vue'
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}

.content {
  margin-left: 250px;
  width: 100%;
  padding: 20px;
}
</style>
