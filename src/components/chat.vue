<script setup>
import { ref } from 'vue'
import { marked } from 'marked';

const props = defineProps({
  record: Object
})

const count = ref(0)
</script>

<template>
  <div>
    <div class="chat_content">
      <img src="../assets/avatar.png" class="user_image" alt="">
      <div class="content_welcome_gpt mb-8" v-if="props.record.type === 'user'">
        {{ props.record.msg }}
      </div>
      <template v-else>
        <div v-if="props.record.status=== 'loading'" class="mb-10 bg-[#d0e3ff] py-[25px] px-[38px]">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <div class="content_welcome_gpt mb-10 bg-[#d0e3ff] py-[25px] px-[38px]" v-else v-html="marked.parse(props.record.msg)"></div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat_content {
  display: flex;
  font-size: 15px;
  height: auto;
  // left: -22px;
  margin: 0 auto;
  min-height: 43px;
  // padding-top: 22px;
  position: relative;
  width: 100%;
  .user_image {
    border-radius: 13px;
    flex-shrink: 0;
    height: 26px;
    margin-right: 20px;
    width: 26px;
  }
  .content_welcome_gpt {
    // background: #d0e3ff;
    border-radius: 8px;
    box-sizing: border-box;
    color: #41416d;
    // margin-bottom: 56px;
    // padding: 25px 38px;
    position: relative;
    width: 100%;
    img {
      height: auto;
      position: absolute;
      right: 0;
      top: 0;
      width: 495px;
    }
    p {
      line-height: 28px;
    }
    .hello {
      font-size: 22px;
      font-weight: 600;
      color: rgb(66, 87, 233);
    }
  }
}
</style>
