<script setup>
import { v4 } from 'uuid'
import { useRouter } from 'vue-router'
import { ref, watch, nextTick, onMounted } from 'vue'
import Modal from './modal.vue'
import { useGlobalState } from '../store'
import { useSendMsg, useChatCache, genChatId, manualStop, helperObj } from '../utils'

const store = useGlobalState()
const { set } = useChatCache()
const showPrompt = ref(false)
const textareaRef = ref(null)
const isShowModal = ref(false)
const router = useRouter()
const helperKeys = Object.keys(helperObj)

watch(store.content, newInput => {
  if (newInput === '/') {
    showPrompt.value = true
  } else {
    showPrompt.value = false
  }
})

const promptList = [
  { title: '标题推荐', text: '我想让你充当标题生成器。请以[文房四宝]为主题，[传承、匠心]为关键词，你将生成五个吸引人的标题。要求保持标题简洁，不超过[20]个字' },
  { title: '文章续写', text: '你是一位文案助理，以[星期日早上，我坐在床上读着《安徒生童话》中《卖火柴的小女孩》。]为开头，续写一篇小学生日记，要求表意清晰，主题鲜明，分段表述' },
  { title: '文章润色', text: '我希望你是一位文章改写助手，我给出一段话，你对文本内容进行修改润色，以达到[更为简洁、有吸引力]的目标，要[用到成语和修辞手法]。文本内容为：[今天的天气真是好极了，我在上学路上看到了一只小猫在花丛里玩耍，它看起来非常开心。放学回家后，我向妈妈分享了这个有趣的经历。' },
  { title: '文章大纲', text: '我希望你是一位文案助理，帮助我生成文章大纲，这篇大纲的主题是[人工智能发展史]，要求逻辑清晰，分条表述' },
  { title: '活力方案', text: '你现在是个活动企划，公司要举办[新品发布会]，请制定一份详细的活动方案，包括活动主题、时间点、流程、人员安排、预算' },
  { title: '演讲稿', text: '现在你准备参加[时间的重量]的主题演讲，给出一份800字演讲稿，要求文字简洁、情真意切' },
]
const emit = defineEmits(['enter'])

const { fetch, isFetching, abort, data } = useSendMsg()

function handleEnterKey(event) {
  if (event.shiftKey && event.keyCode === 13) {
    // 如果按下了Shift + Enter，则插入换行符
    store.content.value += '\n';
  } else if (!event.shiftKey && event.keyCode === 13) {
    // 如果只按下Enter，则提交表单
    event.preventDefault();
    sendMsg()
  }
}

onMounted(() => {
  window.handlInputValue = function(text,state) {
    if (store.showMask.value) {
      return false
    }
    store.content.value = text
    if (state === 2) {
      sendMsg()
    }
  }
})

function sendMsg() {
  if (store.userInfo.id && store.userInfo.chatExpiredTime < store.userInfo.now) {
    showModal()
    return
  }
  emit('enter')
  store.isReanswer.value = false
  store.manualStop.value = false
  if (store.isGenerating.value) return
  if (!store.content.value.trim()) return
  let id = store.activeChatId.value
  if (!id) id = genChatId()
  if (store.activeTab.value === 'history-chat') {
    // 缓存对话的标题 todo 如果是助手对话 不需要再缓存标题
    set(id, store.content.value)
  }
  // 请求对话
  fetch(id, store.content.value)
  // 设置当前的对话消息记录
  store.msgRecord.value.push({
    role: 'user',
    content: store.content.value.replaceAll('\n','<br/>')
  }, {
    role: 'assistant',
    content: '',
    status: 'loading',
  })
  // // 设置侧边栏激活的对话id
  // store.activeChatId.value = id
  // 重置输入框
  store.content.value = ''
  nextTick(() => {
    document.querySelector('.out_wrap > div > div:last-of-type').scrollIntoView({
      // behavior: 'smooth',
      block: "end",
      inline: "nearest"
    });
  })
}
function stop() {
  manualStop()
  store.manualStop.value = true
  store.close.value(4001, 'manual close')
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

function backHome() {
  store.activeTab.value = 'history-chat'
  store.msgRecord.value = []
  store.activeChatId.value = ''
  store.url.value = 'http://8.129.170.108/api/xfws'
}
</script>

<template>
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
  <div class="flex justify-between mt-4">
    <div
      class="invisible mb-6 cursor-pointer mt-0.5 bg-[rgb(255_255_255_/_37%)] hover:bg-[rgb(255_255_255_/_57%)] hover:text-gray-900 text-gray-600 flex justify-center gap-x-1 items-center w-32 py-1 rounded-2xl text-sm"
      @click="backHome"
      :class="{'!visible': !store.isGenerating.value && helperKeys.includes(store.activeChatId.value)}"
    >
      <span>
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="w-6 h-6" viewBox="0,0,256,256"><g fill="currentColor" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M9,4c-4.96668,0.00936 -8.99064,4.03332 -9,9v24c0.00936,4.96668 4.03332,8.99064 9,9h32c4.96668,-0.00936 8.99064,-4.03332 9,-9v-24c-0.00936,-4.96668 -4.03332,-8.99064 -9,-9zM9,6h32c1.8579,-0.00453 3.64101,0.73152 4.95475,2.04525c1.31374,1.31374 2.04978,3.09685 2.04525,4.95475v24c0.00453,1.8579 -0.73152,3.64101 -2.04525,4.95475c-1.31374,1.31374 -3.09685,2.04978 -4.95475,2.04525h-32c-1.8579,0.00453 -3.64101,-0.73152 -4.95475,-2.04525c-1.31374,-1.31374 -2.04978,-3.09685 -2.04525,-4.95475v-24c-0.00453,-1.8579 0.73152,-3.64101 2.04525,-4.95475c1.31374,-1.31374 3.09685,-2.04978 4.95475,-2.04525zM11,17c-0.55228,0 -1,0.44772 -1,1v14c0,0.55228 0.44772,1 1,1c0.55228,0 1,-0.44772 1,-1v-14c0,-0.55228 -0.44772,-1 -1,-1zM20.9707,19c-0.18741,0.00563 -0.36947,0.06383 -0.52539,0.16797l-6,5c-0.04151,0.03021 -0.08068,0.06351 -0.11719,0.09961c-0.015,0.014 -0.03187,0.02602 -0.04687,0.04102c-0.0752,0.08052 -0.13657,0.17291 -0.18164,0.27344c-0.011,0.023 -0.01834,0.04631 -0.02734,0.07031c-0.09314,0.22241 -0.09314,0.4729 0,0.69531c0.009,0.024 0.01634,0.04731 0.02734,0.07031c0.04626,0.1008 0.10896,0.19321 0.18555,0.27344c0.015,0.015 0.02992,0.02506 0.04492,0.03906c0.0365,0.0361 0.07568,0.0694 0.11719,0.09961l6,5c0.3065,0.20329 0.69984,0.22193 1.02419,0.04854c0.32435,-0.17339 0.52734,-0.51083 0.52854,-0.87862v-4h17c0.55228,0 1,-0.44772 1,-1c0,-0.55228 -0.44772,-1 -1,-1h-17v-4c0.00012,-0.27037 -0.10925,-0.52927 -0.30317,-0.71767c-0.19392,-0.1884 -0.45587,-0.29025 -0.72612,-0.28233z"></path></g></g></svg>
      </span>
      返回AI问答
    </div>
    <div
      class="invisible mb-6 cursor-pointer mt-0.5 bg-[rgb(255_255_255_/_37%)] hover:bg-[rgb(255_255_255_/_57%)] hover:text-gray-900 text-gray-600 flex justify-center gap-x-1 items-center w-32 py-1 rounded-md text-sm"
      :class="{'!visible': store.isGenerating.value}"
      @click="stop">
      <span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </span>
      停止输出
    </div>
  </div>
  <div class="ask-window">
    <div class="ask_window__bg"></div>
    <div class="ask_prompt" :class="{'ask_prompt_visible': showPrompt}">
        <div class="prompt_wrap">
            <span>推荐模板</span>
            <div class="list">
            <div @click="store.content.value = prompt.text" class="item" v-for="prompt in promptList" :key="prompt.title">{{ prompt.title }}</div>
            </div>
        </div>
    </div>
    <textarea ref="textareaRef" @keydown.enter.prevent="handleEnterKey" v-model="store.content.value" maxlength="7000" placeholder="在此输入您想了解的内容，输入“/”可获取模板，Shift+Enter换行" style="height: 75px;"></textarea>
    <div class="send" :class="{'!cursor-not-allowed': store.isGenerating.value}" @click="sendMsg">发送</div>
</div>
</template>

<style scoped lang="scss">
.ask-window {
  border-radius: 6px;
  height: 95px;
  margin: 0 auto;
  position: relative;
  width: 100%;
  .ask_window__bg {
    background: #fff;
    border-radius: 6px;
    bottom: 0;
    left: 0;
    margin: 0 auto;
    max-height: 186px;
    min-height: 98px;
    position: absolute;
    width: 100%;
    z-index: 31;
  }
  // @media screen and (max-width: 1300px) {
  //   .ask_window__bg {
  //     width: 780px;
  //   }
  // }
  textarea {
    background: transparent;
    border: none;
    border-radius: 8px;
    bottom: 2px;
    color: #07133e;
    font-size: 14px;
    left: 2px;
    line-height: 25px;
    max-height: 180px;
    min-height: 95px;
    outline: none;
    padding: 10px 100px 10px 32px;
    position: absolute;
    resize: none;
    width: calc(100% - 4px);
    z-index: 32;
  }
}
.ask_prompt {
  // background: url(../assets/prompt_bg.png) 50%/104% 104% no-repeat;
  background-color: #fff;
  border: 1px solid transparent;
  border-bottom: 0!important;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  box-sizing: border-box;
  height: 0;
  left: 0;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  top: 6px;
  -webkit-transform: translateY(-100%);
  transform: translateY(-100%);
  transition: height .3s,opacity .3s;
  width: 100%;
  z-index: 35;
  &.ask_prompt_visible {
    display: block;
    height: 98px;
    opacity: 1;
  }
  .prompt_wrap {
    align-items: center;
    display: flex;
    margin-top: 20px;
    padding: 0 26px;
    & > span {
      color: #43436b;
      flex-shrink: 0;
      font-size: 14px;
      margin-right: 8px;
      -webkit-user-select: none;
      user-select: none;
    }
    & > .list {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      height: 34px;
      margin-right: 8px;
      overflow: hidden;
      .item {
        align-items: center;
        background: hsla(0,0%,100%,.9);
        border: 1px solid #e1eaff;
        border-radius: 4px;
        color: #777a9c;
        cursor: pointer;
        display: flex;
        flex-shrink: 0;
        height: 34px;
        justify-content: center;
        margin-right: 8px;
        padding: 0 11px;
      }
    }
  }
}
.send {
  background: #2961f7;
  border-radius: 8px;
  bottom: 10px;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  height: 38px;
  line-height: 38px;
  margin-left: 20px;
  position: absolute;
  right: 10px;
  text-align: center;
  transition: all .3s;
  width: 70px;
  z-index: 35;
  &:hover {
    opacity: .9;
  }
}
</style>
