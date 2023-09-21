<script setup>
import { nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import Modal from './modal.vue'
import { useGlobalState } from '../store'
import { useSendMsg, useChatCache, genChatId } from '../utils'

const commonQuestions = [
  '给老板10个理由帮我升职加薪',
  '不会写活动策划方案，怎么办',
  '请给我的女朋友写一封感人的情书',
  '怎样高效总结我的年度工作，获得老板赞赏',
  '请用一首诗歌赞美秋天',
  '说一个笑话',
]

const store = useGlobalState()
const { set } = useChatCache()
const { fetch, abort, data } = useSendMsg()
const isShowModal = ref(false)
const router = useRouter()

function clickQuestion(q) {
  if (store.userInfo.id && store.userInfo.chatExpiredTime < +new Date()) {
    showModal()
    return
  }
  store.manualStop.value = false
  store.isReanswer.value = false
  let id = store.activeChatId.value
  if (!id) id = genChatId()
  
  // 缓存对话的标题
  set(id, q)
  nextTick(() => {
    // 请求对话
    fetch(id, q)
    // 设置当前的对话消息记录
    store.msgRecord.value.push({
      role: 'user',
      content: q
    }, {
      role: 'assistant',
      content: '',
      status: 'loading',
    })
  })
  // 设置侧边栏激活的对话id
  // store.activeChatId.value = id
}
function closeModal() {
  isShowModal.value = false
}
function showModal() {
  isShowModal.value = true
}
function renewal() {
  router.push('/plans')
}
</script>

<template>
  <div>
    <div class="chat_content">
      <img src="../assets/bot.png" class="user_image" alt="">
      <div class="content_welcome_gpt">
        <!-- <img src="../assets/welcome-right.png" alt=""> -->
        <p class="hello" style="font-size: 16px;">您好，我是讯飞星火认知大模型</p>
        <p class="">能够学习和理解人类的语言，进行多轮对话</p>
        <p class="">回答问题，高效便捷地帮助人们获取信息、知识和灵感</p>
      </div>
    </div>
    <div class="prompt_wrapper">
      <div class="welcome_prompt">
        <div class="flex flex-col gap-y-2  text-[#4257e9]">
          <p class="text-gray-600">您可以在下方的输入框中输入您的问题，如：</p>
          <p class="cursor-pointer hover:font-bold" @click="clickQuestion(q)" v-for="q in commonQuestions" :key="q">{{ q }}</p>
        </div>
      </div>
    </div>
    <Modal size="xs" v-if="isShowModal" @close="closeModal" :overlayer="true">
    <template #body>
      <div class="flex gap-x-2 items-center px-3 py-2 pt-9 w-96 text-base">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" class="stroke-orange-400	w-7 h-7">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>

        <span class="font-semibold">服务已到期，是否续费服务？</span>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-x-4">
        <button @click="closeModal" type="button" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 ">
          取消
        </button>
        <button @click="renewal" type="button" class="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ">
          续费
        </button>
      </div>
    </template>
  </Modal>
  </div>
</template>

<style scoped lang="scss">
.prompt_wrapper {
  border-radius: 8px;
  color: #43436b;
  display: flex;
  font-size: 15px;
  height: auto;
  margin: 0 auto;
  min-height: 43px;
  margin-left: 46px;
  .welcome_prompt {
    background: hsla(0,0%,100%,.5);
    border-radius: 8px;
    box-sizing: border-box;
    margin: 0 auto 56px;
    padding: 20px 28px;
    width: 100%;
  }
  // @media screen and (max-width: 1300px) {
  //   .welcome_prompt {
  //     width: 780px;
  //   }
  // }
  .top {
    align-items: center;
    color: #43436b;
    display: flex;
    font-size: 18px;
    justify-content: space-between;
    margin-bottom: 10px;
    & .title > span {
      color: #b7b8cc;
      font-size: 12px;
      margin-left: 16px;
    }
  }
  .change_prompt {
    align-items: center;
    color: #9194bf;
    cursor: pointer;
    display: flex;
    font-size: 16px;
    img {
      height: auto;
      margin-right: 8px;
      width: 18px;
    }
  }
}
.chat_content {
  display: flex;
  font-size: 15px;
  height: auto;
  // left: -22px;
  margin: 0 auto;
  min-height: 43px;
  padding-top: 42px;
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
    background: #e2eeff;
    border-radius: 8px;
    box-sizing: border-box;
    color: #41416d;
    margin-bottom: 30px;
    padding: 25px 38px;
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
// @media screen and (max-width: 1300px) {
//   .chat_content {
//     position: relative;
//     width: 826px;
//   }
// }
</style>
