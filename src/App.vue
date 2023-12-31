<script setup async>
import { computed, ref, onMounted,onUnmounted, onBeforeUnmount } from 'vue'
import { useGlobalState, } from './store'
import { useClipboard, useFetch } from '@vueuse/core'
import { useRouter, useRoute } from 'vue-router'
import historyChat from './components/history-chat.vue'
import welcome from './components/welcome-window.vue'
import helperList from './components/helper-list.vue'
import contactUs from './components/contact-us.vue'
import Modal from './components/modal.vue'
import message from './components/message/message.js'
import dayjs from 'dayjs'

import { genChatId, useChatCache, helperObj, reset } from './utils'

const { copy } = useClipboard()

const sidebarCollapse = ref(false)
const showMask = ref(true)
const isShowModal = ref(false)
const nowTime = ref('')
const scroll = ref(null)
const bar = ref(null)
const mask = ref(null)
const isFontShow = ref(false)
const maskWidth = ref('32px')

const store = useGlobalState()
const { set, remove, chat } = useChatCache()
const router = useRouter()

function checkChat(tab) {
  if (store.isGenerating.value) {
    message({ type: 'warning', message: '对话进行中，请稍后再试'})
    return true
  } else {
    const keys = computed(() => Object.keys(chat.value).reverse().filter(key => !helperObj[key]))
    const index = keys.value.findIndex(item => {
      return !chat.value[item].chatRecords
    })
    // tab === 'chat-list' 只拦截新建对话操作
    if (index != -1 && tab==='chat-list') {
      store.activeChatId.value = keys.value[index]
      store.activeTab.value = 'history-chat'
      store.msgRecord.value = []
      store.showChat.value = true
      router.push('/')
      message({ type: 'warning', message: '请先尝试问我一个问题，再新建对话窗口吧!'})
      return true
    }
    return false
  }
}

function addChat() {
  if (checkChat('chat-list')) return
  router.push('/')
  store.url.value = 'http://att.miclink.net/api/xfws'
  store.activeTab.value = 'history-chat'
  store.showChat.value = true
  let id = genChatId()
  // 缓存对话的标题
  set(id, '新对话窗口', true)

  store.msgRecord.value.splice(0, store.msgRecord.value.length)
}

function changeToHelperCenterRoot() {
  if (checkChat()) return
  router.push('/')
  store.activeTab.value = 'bot-list'
  store.showChat.value = false
  store.activeChatId.value = null
}
function changeToHistoryTab() {
  if (checkChat()) return
  store.activeTab.value = 'history-chat'
}

function toPage(route) {
  if (checkChat()) return
  store.activeChatId.value = null
  router.push(route)
}

window.copyCode = function(id) {
  const content = document.getElementById('code_' + id).textContent
  if (navigator.clipboard) {
    copy(content)
  } else {
    const inputDom = document.createElement('textarea');
    inputDom.setAttribute('readonly', 'readonly');
    inputDom.value = content;
    inputDom.style.opacity = 0
    document.body.appendChild(inputDom);
    inputDom.select();
    document.execCommand('copy');
    document.body.removeChild(inputDom);
  }
  message('复制成功')
}

onMounted(() => {
  showMask.value = store.showMask.value
  const urlParams = new URLSearchParams(window.location.search)
  let sno = urlParams.get('sno')
  if (sno&&store.showMask.value) {
    store.showMask.value = false
    showMask.value = false
    loopUser(sno)
  }
  
})

onBeforeUnmount(() => {
  if (nowTime.value) clearInterval(nowTime.value)
})
onUnmounted(() => {
  if (nowTime.value) clearInterval(nowTime.value)
})
function loopUser (sno) {
  sno = 'CHAT_'+ sno
  nowTime.value = setInterval(async () => {
    const { data } = await useFetch(`http://att.miclink.net/api/register?account=${sno}&code=${sno}&password=${sno}&type=VISITOR`).post().json()
    store.userInfo.value = data.value.data
  },1000 * 60 * 30)
}

function closeModal() {
  isShowModal.value = false
}
function showModal() {
  isShowModal.value = true
}
function showFontModal() {
  if (checkChat()) return
  isFontShow.value = true
  setTimeout(() => {
    changeFontSize()
  },1000)
}
function closeFontModal() {
  isFontShow.value = false
}
function renewal() {
  router.push('/plans')
}
function clearStorage() {
  reset()
  router.push('./')
}

function clickFontSize(e) {
  var event = event || window.event;
  let barleft = event.offsetX
  if (barleft >29) {
    mask.value.style.width = barleft +'px' ;
    bar.value.style.left = barleft + "px";
    maskWidth.value = barleft + "px";
    store.chatFontSize.value = (barleft / 2).toFixed(0)
  }
}

function changeFontSize() {
  let barleft = 0;
  bar.value.onmousedown = function (event)  {
    var event = event || window.event;
    var leftVal = event.clientX - bar.value.offsetLeft;
    document.onmousemove = function(event){
      var event = event || window.event;
      barleft = event.clientX - leftVal;     
      if(barleft < 0)
      barleft = 0;
      else if(barleft > scroll.value.offsetWidth - bar.value.offsetWidth)
      barleft = scroll.value.offsetWidth - bar.value.offsetWidth;
      if (barleft >29) {
        mask.value.style.width = barleft +'px' ;
        bar.value.style.left = barleft + "px";
        maskWidth.value = barleft + "px";
        store.chatFontSize.value = (barleft / 2).toFixed(0)
      }
      //防止选择内容--当拖动鼠标过快时候，弹起鼠标，bar也会移动，修复bug
      window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
    }
  }
  document.onmouseup = function(){
    document.onmousemove = null; //弹起鼠标不做任何操作
  }
}
</script>

<template>
  <div class="root">
    <div class="sidebar" :class="{'sidebar__collapse': sidebarCollapse }">
      <div v-show="!sidebarCollapse">
        <div class="logo items-center gap-x-3">
          <img src="./assets/miclink.svg" alt="" style="width:200px">
          <!-- <img src="./assets/miclink_ai.svg" alt=""> -->
          <!-- <span class="text-white text-3xl font-semibold">MicLink-AI</span> -->
          <!-- <img src="./assets/logo.svg" alt=""> -->
          <!-- <span @click.stop="toPage('/contact-us')" class="cursor-pointer text-white">联系我们</span> -->
          <!-- <div class="xh_logo" style="display: flex;align-items: center;flex:1;justify-content: center">
             <img src="./assets/xh_logo.png" alt="">
          </div>
          <div class="logo_m" style="display: flex;align-items: center;flex:1;justify-content: center">
             <img src="./assets/logo_m_2.png" alt="">
            <span class="text-white text-lg font-semibold pl-1">MicLink</span>
          </div> -->
         
        </div>
        <div class="text-white text-base font-semibold text-center">由讯飞星火认知大模型技术支持</div>
        <div class="actions-btn" v-show="!sidebarCollapse">
          <div class="btn help-center" @click="changeToHelperCenterRoot">
            <!-- <img src="./assets/spark-bot-logo.svg" alt="">&nbsp; -->
            助手中心
          </div>
          <div class="btn new-chat" @click="addChat">
            <span>+</span>&nbsp;新建对话
          </div>
        </div>
        <div class="tabs" v-show="!sidebarCollapse">
          <div :class="{active: store.activeTab.value === 'history-chat'}" @click="changeToHistoryTab">历史对话</div>
          <div :class="{active: store.activeTab.value !== 'history-chat'}" @click="store.activeTab.value='bot-list'">助手列表</div>
        </div>
        <div class="chat-list" v-show="!sidebarCollapse"></div>
      </div>

      <div v-show="sidebarCollapse">
        <img src="./assets/logo_m_2.png" class="mt-[16px] mb-10  mx-auto w-5" alt="">
        <div class="box !mb-5" @click="addChat">
          <img src="./assets/add.svg" alt="">
        </div>
        <div class="box text-[#ffffff]" @click="changeToHelperCenterRoot" style="font-size:12px">
          助手
          <!-- <img src="./assets/bot.svg" alt=""> -->
        </div>
      </div>

      <div class="silder-content" v-show="!sidebarCollapse" :style="{height: store.userInfo.value?.id ? 'calc(100% - 340px)' : 'calc(100% - 276px)'}">
        <helper-list v-show="store.activeTab.value !== 'history-chat'" />
        <history-chat v-show="store.activeTab.value === 'history-chat'" />
      </div>
      <div v-show="!sidebarCollapse" class="absolute bottom-4 inset-x-0 w-[266px] py-2" :class="{'h-[102px]': store.userInfo.value?.id}">
        <div class="text-gray-600 pl-4 mb-4" v-if="store.userInfo.value?.id">
          <p class="mb-1">设备号：{{ store.userInfo.value.mac }}</p>
          <p>服务有效期：{{ store.userInfo.value.chatExpiredTime ? dayjs(store.userInfo.value.chatExpiredTime).format('YYYY-MM-DD HH:mm:ss') : '已过期'}}</p>
        </div>
        <div class="grid grid-cols-1 divide-x text-sm text-center" :class="{'!grid-cols-3': store.userInfo.value?.id}">
          <!-- <span @click.stop="toPage('/contact-us')" class="cursor-pointer text-white">联系我们</span> -->
          <span class="cursor-pointer text-white" @click.stop="showFontModal">界面设置</span>
          <span v-if="store.userInfo.value?.id" @click.stop="toPage('/orders')" class="cursor-pointer text-white">我的订单</span>
          <span v-if="store.userInfo.value?.id" @click.stop="toPage('/plans')" class="cursor-pointer text-white">购买套餐</span>
        </div>
        <!-- <div class="pl-4 mb-4">
         <div class="set-item-container grid  grid-cols-1">
            <div class="txt" style="opacity:0.8;">字体大小：</div>
            <div class="scroll" ref="scroll">
              <div class="bar" ref="bar" ></div>
              <div class="mask" ref="mask"></div>
            </div>
        </div>
        <p style="opacity:0.5;font-size: 12px;">对话区域默认字体大小为：16号</p>
        </div> -->
      </div>
    </div>
    <div class="stretch_box" :class="{'stretch_box__collapse': sidebarCollapse }" @click="sidebarCollapse=!sidebarCollapse">
      <img v-show="!sidebarCollapse" src="./assets/open.svg" alt="">
      <img v-show="sidebarCollapse" src="./assets/close.svg" alt="">
    </div>
    <main :class="{'main__collapse': sidebarCollapse}">
      <router-view></router-view>
    </main>

    <!-- <div class="fixed inset-0 z-[9999]" v-if="showMask" @click="showModal"></div> -->
    <Modal size="xs" v-if="showMask" @close="closeModal" :overlayer="true">
      <template #body>
        <div class="flex gap-x-2 items-center px-3 py-2 w-52 text-base">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" class="stroke-orange-400	w-7 h-7">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span class="font-semibold">缺少当前设备号</span>
        </div>
      </template>
    </Modal>
    <Modal size="xs" v-if="store.loginExpired.value" :overlayer="true">
      <template #body>
        <div class="flex gap-x-2 items-center px-3 py-2 w-60 text-base">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" class="stroke-orange-400	w-7 h-7">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span class="font-semibold">登录信息已过期，请退出重试</span>
        </div>
      </template>
    </Modal>
    <Modal v-if="isFontShow" @close="closeFontModal">
      <template #header>
        界面设置
      </template>
      <template #body>
        <div class="w-[600px] flex flex-col items-center justify-center pb-12">
          <div class="flex flex-col gap-y-2 items-center">
            <div class="set-item-container grid  grid-cols-1 text-lg">
              <div>字体大小：</div>
              <div class="scroll" ref="scroll" @click="clickFontSize">
                <div class="bar" ref="bar" :style="{'left': maskWidth}"></div>
                <div class="mask bg-blue-500" ref="mask" :style="{'width': maskWidth}"></div>
              </div>
            </div>
            <p class="text-sm">对话区域字体大小为：{{store.chatFontSize.value}}号</p>
          </div>
          <div class="flex justify-center gap-x-4 mt-4">
            <button @click="closeFontModal" type="button" class="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              关闭
            </button>
            <button @click.stop="clearStorage" type="button" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
              清除缓存
            </button>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped lang="scss">
.set-item-container{
  display: flex;
  align-items: center;
  // font-size: 14px;
}
 .scroll{
    width: 200px;
    height: 4px;
    background: rgba($color: #000000, $alpha: .2);
    position: relative;
    cursor: pointer;
  }
  .bar{
    width: 4px;
    height: 12px;
    background: #5798ff;
    position: absolute;
    top: -4px;
    left: 32px;
    cursor: pointer;
  }
  .mask{
    position: absolute;
    left: 0;
    top: 0;
    background: #5798ff;
    width: 32px;
    height: 4px;
  }
// @media screen and (max-width: 1300px) {
//   .ask-window {
//     width: 780px;
//   }
// }
.userinfo_window {
  background: hsla(0,0%,100%,.8);
  border-radius: 6px;
  box-shadow: 0 1px 12px 0 hsla(0,0%,47%,.22);
  overflow: hidden;
  padding: 0 12px;
  position: absolute;
  right: 30px;
  top: 58px;
  transition: all .3s;
  width: 115px;
  .user_info_item {
    border-bottom: 1px solid #dfe4ee;
    cursor: default;
    height: 50px;
    line-height: 50px;
    text-align: center;
    white-space: nowrap;
    cursor: default;
    &:last-child {
      border-bottom: 0;
    }
  }
  .username {
    -webkit-text-fill-color: transparent;
    background: -webkit-linear-gradient(left,#ab9dff,#4478f5);
    -webkit-background-clip: text;
    background-clip: text;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
  }
}
.box {
  align-items: center;
  background: hsla(0,0%,100%,.16);
  border: 1px solid hsla(0,0%,100%,.46);
  border-radius: 15px;
  cursor: pointer;
  display: flex;
  height: 31px;
  justify-content: center;
  margin: auto;
  opacity: .96;
  width: 31px;
  &:hover {
    background: hsla(0,0%,100%,.3);
    border: 1px solid hsla(0,0%,100%,.46);
  }
}
.stretch_box {
  align-items: center;
  background: url(./assets/stretch_white.svg) 50%/100% 100% no-repeat;
  bottom: 50px;
  cursor: pointer;
  display: flex;
  height: 38px;
  left: 266px;
  position: absolute;
  transition: left .3s;
  width: 12px;
  z-index: 6;
  img {
    height: 10px;
    opacity: .8;
    transform: translateX(-6px);
    width: 10px;
  }
}
.stretch_box__collapse {
  left: 64px;
}
// .logo {
//   align-items: center;
//   color: #9190ff;
//   display: flex;
//   height: 64px;
//   justify-content: space-between;
//   // padding: 0 34px;
//   width: 100%;
//   .xh_logo img {
//     display: block;
//     height: auto;
//     width: 95px;
//   }
//   .logo_m img {
//     display: block;
//     height: auto;
//     width: 26px;
//   }
// }
.logo {
  align-items: center;
  color: #9190ff;
  display: flex;
  height: 64px;
  padding: 0 10px;
  width: 100%;
  justify-content: center;
  img {
    display: block;
    height: auto;
    // width: 35px;
  }
}
.tabs {
  align-items: center;
  border-bottom: 1px solid hsla(0,0%,100%,.1);
  display: flex;
  height: 30px;
  justify-content: space-between;
  padding: 43px 50px 25px;
  width: 266px;
  & > div {
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    height: 30px;
    line-height: 30px;
    opacity: .6;
    text-align: center;
    &:hover {
      position: relative;
      opacity: 1;
      &::after {
        background: #fff;
        border-radius: 5px;
        bottom: -10px;
        content: "";
        height: 2px;
        left: 0;
        position: absolute;
        width: 100%;
      }
    }
    &.active {
      position: relative;
      opacity: 1;
      &::after {
        background: #fff;
        border-radius: 5px;
        bottom: -10px;
        content: "";
        height: 2px;
        left: 0;
        position: absolute;
        width: 100%;
      }
    }
  }
}
.help-center {
  
}
.new-chat {

}
.actions-btn {
  display: flex;
  justify-content: space-between;
  padding: 16px 20px 0;
  width: 266px;
  .btn {
    cursor: pointer;
    align-items: center;
    background: hsla(0,0%,100%,1);
    border: 1px solid hsla(0,0%,100%,.46);
    border-radius: 5px;
    color: #4257e9;
    cursor: pointer;
    display: flex;
    font-size: 14px;
    height: 43px;
    justify-content: center;
    opacity: .96;
    transition: all .3s;
    -webkit-user-select: none;
    user-select: none;
    width: 106px;
    &:hover {
      background: hsla(0,0%,100%,1);
      border: 1px solid hsla(0,0%,100%,.46);
    }
    span {
      font-size: 20px;
      margin-top: -4px;
    }
  }
}
.root {
  background: #ecf6ff;
  display: flex;
  height: 100vh;
  min-width: 1040px;
  overflow: hidden;
  position: relative;
  width: 100vw;
}
.sidebar {
  background: #5798ff;
  border-radius: 0 20px 20px 0;
  box-shadow: 4px 0 16px 0 rgba(113,155,255,.58);
  height: 100%;
  left: 0;
  overflow: hidden;
  position: absolute;
  top: 0;
  transition: width .3s;
  width: 266px;
  z-index: 5;
}
.silder-content {
  padding-top: 8px;
  position: relative;
  width: 100%;
}
.sidebar__collapse {
  width: 64px;
  overflow: auto;
}
main {
  height: 100%;
  padding-left: 266px;
  position: relative;
  transition: padding-left .3s;
  width: 100%;
  &.main__collapse {
    padding-left: 64px;
  }
}
</style>
