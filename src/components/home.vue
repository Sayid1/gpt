<script setup>
import { nextTick, ref } from 'vue'
import { useGlobalState } from '../store'
import welcome from './welcome-window.vue'
import chatInput from './chat-input.vue'
import helperCenter from './helper-center.vue'
import chatContiner from './chat-continer.vue'

const store = useGlobalState()
</script>

<template>
  <div class="chat_window">
    <div class="out_wrap" :style="{height: store.showChat.value ? 'calc(100% - 200px)' : 'calc(100% - 30px)'}">
      <template v-if="store.showChat.value">

        <chat-continer v-if="store.msgRecord.value?.length" />

        <div class="chat_content_wrapper" v-else>
          <welcome />
        </div>
      </template>
      <helper-center v-else />
    </div>
    <chat-input v-if="store.showChat.value" />

    <div class="tip">
      <p>所有内容均由人工智能模型输出，其内容的准确性和完整性无法保证，不代表我们的态度或观点。</p>
    </div>
  </div>
</template>
<style scoped lang="scss">
.tip {
  color: #5798ff;
  font-size: 14px;
  margin-top: 12px;
  text-align: center;
  width: 100%;
  position: absolute;
  bottom: 0;
}
.chat_window {
  background-color: #ecf6ff;
  box-sizing: border-box;
  height: 100%;
  position: relative;
  width: 100%;
  padding: 0 2.5%;
  z-index: 1;
  .out_wrap {
    display: flex;
    flex-direction: column;
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