<script setup>
import { nextTick, ref } from 'vue'
import { useGlobalState } from '../store'
import welcome from './welcome-window.vue'
import chatInput from './chat-input.vue'
import helperCenter from './helper-center.vue'
import chatContiner from './chat-continer.vue'

const store = useGlobalState()
const chatRef = ref(null)

function enter() {
  nextTick(() => {
    chatRef.value.scrollIntoView()
  })
}
</script>

<template>
  <div class="chat_window">
    <div class="out_wrap">
      <template v-if="store.showChat.value">

        <chat-continer ref="chatRef" v-if="store.msgRecord.value?.length" />

        <div class="chat_content_wrapper" v-else>
          <welcome />
        </div>
      </template>
      <helper-center v-else />
    </div>
    <chat-input @enter="enter" v-if="store.showChat.value" />

    <div class="tip">
      <p>所有内容均由人工智能模型输出，其内容的准确性和完整性无法保证，不代表我们的态度或观点。</p>
    </div>
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
    height: calc(100% - 200px);
    margin: 0 auto;
    overflow-y: auto;
    position: relative;
    scrollbar-color: rgba(7,18,59,.14) transparent;
    scrollbar-width: none;
    width: 100%;
    overflow-y: auto;
    &::-webkit-scrollbar {
  display: none;
}
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