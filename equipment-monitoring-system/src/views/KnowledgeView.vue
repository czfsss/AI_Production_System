<script setup lang="ts">
// 只保留必要的导入
import { ref } from 'vue'
</script>

<template>
  <div class="iframe-container">
    <iframe
      src="http://10.43.32.231:1130/chatbot/rOK3d8Jw8zm8Ur7p"
      style="width: 100%; height: 100vh; border: none;"
      allow="microphone">
    </iframe>
  </div>
</template>

<style scoped>
.iframe-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
