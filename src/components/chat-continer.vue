<script setup>
import { onMounted, ref, watch } from 'vue'
import { useGlobalState } from '../store'
import chatItem from './chat.vue'
const store = useGlobalState()
const containerRef = ref(null)

watch(store.msgRecord.value, () => {
  scrollIntoView()
}, { deep: true })

onMounted(scrollIntoView)

function scrollIntoView() {
  containerRef.value.scrollIntoView({
    // behavior: 'smooth',
    block: "end",
    inline: "nearest"
  });
}

defineExpose({
  scrollIntoView
})

</script>

<template>
  <div ref="containerRef" class="my-10">
    <chat-item :record="record" :last="i === store.msgRecord.value.length - 1" v-for="(record, i) in store.msgRecord.value" :key="i" />
  </div>
</template>
<style scoped lang="scss">
.tip {
  color: #9197c1;
  font-size: 12px;
  margin-top: 12px;
  text-align: center;
  width: 100%;
}
.chat_window {
  background-color: #e4ebf9;
  box-sizing: border-box;
  height: 100%;
  position: relative;
  width: 100%;
  padding: 0 2.5%;
  z-index: 1;
  .out_wrap {
    display: flex;
    flex-direction: column;
    height: calc(100% - 150px);
    margin: 0 auto;
    overflow-y: auto;
    position: relative;
    scrollbar-color: rgba(7,18,59,.14) transparent;
    scrollbar-width: none;
    width: 100%;
    overflow-y: auto;
    .chat_content_wrapper {
      display: flex;
      flex-direction: column-reverse;
      height: auto;
      padding-top: 26px;
      scroll-behavior: smooth;
      scrollbar-color: rgba(7,18,59,.14) transparent;
      scrollbar-width: none;
      padding-top: 0;
    }
  }
}
</style>