<script setup>
import { ref } from 'vue'
import { useFetch } from '@vueuse/core'

defineProps({
  msg: String,
})

const helperList = ref([])
</script>

<template>
  <div class="empty">
    <img class="empty-image" src="../assets/document.svg" alt="">
    <div class="empty-description">您还没有添加助手，去星火助手中心添加一个试试吧</div>
  </div>
</template>

<style scoped>
.empty-image {
  height: auto;
  width: 70px;
  margin-bottom: 11px;
}
.empty {
  line-height: 1.5715;
  margin: 0 8px;
  text-align: center;
  color: #fff;
  font-size: 12px;
  opacity: .6;
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  padding: 0 28px;
}
</style>
