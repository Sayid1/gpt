<script setup>
import { ref, onMounted } from 'vue'
import { useGlobalState } from './store'
import { useClipboard } from '@vueuse/core'
import { useRouter, useRoute } from 'vue-router'
import historyChat from './components/history-chat.vue'
import welcome from './components/welcome-window.vue'
import helperList from './components/helper-list.vue'
import contactUs from './components/contact-us.vue'
import Modal from './components/modal.vue'
import dayjs from 'dayjs'

import { genChatId, useChatCache } from './utils'

const { copy } = useClipboard()

const sidebarCollapse = ref(false)
const showMask = ref(true)
const isShowModal = ref(false)

const store = useGlobalState()
const { set, remove } = useChatCache()
const router = useRouter()

function checkChat() {
  if (store.isGenerating.value) {
    message({ type: 'warning', message: '对话进行中，请稍后再试'})
    return true
  }
  return false
}

function addChat() {
  if (checkChat()) return
  router.push('/')
  store.url.value = 'http://8.129.170.108/api/xfws'
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
  router.push(route)
}

window.copyCode = function(id) {
  copy(document.getElementById('code_' + id).textContent)
  message('复制成功')
}

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const sno = urlParams.get('sno')
  if (sno) showMask.value = false
})

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
  <div class="root">
    <div class="sidebar" :class="{'sidebar__collapse': sidebarCollapse }">
      <div v-show="!sidebarCollapse">
        <div class="logo">
          <img src="./assets/logo.png" alt="">
        </div>
        <div class="actions-btn" v-show="!sidebarCollapse">
          <div class="btn help-center" @click="changeToHelperCenterRoot">
            <img src="./assets/spark-bot-logo.svg" alt="">&nbsp;助手中心
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
        <img src="./assets/logo.svg" class="mt-[16px] mb-10  mx-auto w-5" alt="">
        <div class="box !mb-5" @click="addChat">
          <img src="./assets/add.svg" alt="">
        </div>
        <div class="box" @click="changeToHelperCenterRoot">
          <img src="./assets/bot.svg" alt="">
        </div>
      </div>

      <div class="silder-content" v-show="!sidebarCollapse" :style="{height: store.userInfo.id ? 'calc(100% - 310px)' : 'calc(100% - 246px)'}">
        <helper-list v-show="store.activeTab.value !== 'history-chat'" />
        <history-chat v-show="store.activeTab.value === 'history-chat'" />
      </div>
      <div v-show="!sidebarCollapse" class="absolute bottom-4 inset-x-0 w-[266px] py-2" :class="{'h-[102px]': store.userInfo.id}">
        <div class="text-gray-600 pl-4 mb-4" v-if="store.userInfo.id">
          <p class="mb-1">设备号：{{ store.userInfo.mac }}</p>
          <p v-if="store.userInfo.chatExpiredTime">服务有效期：{{ dayjs(store.userInfo.chatExpiredTime).format('YYYY-MM-DD HH:mm:ss') }}</p>
        </div>
        <div class="grid grid-cols-1 divide-x text-sm text-center" :class="{'!grid-cols-3': store.userInfo.id}">
          <span @click.stop="toPage('/contact-us')" class="cursor-pointer text-white">联系我们</span>
          <span v-if="store.userInfo.id" @click.stop="toPage('/orders')" class="cursor-pointer text-white">我的订单</span>
          <span v-if="store.userInfo.id" @click.stop="toPage('/plans')" class="cursor-pointer text-white">购买套餐</span>
        </div>
      </div>
    </div>
    <div class="stretch_box" :class="{'stretch_box__collapse': sidebarCollapse }" @click="sidebarCollapse=!sidebarCollapse">
      <img v-show="!sidebarCollapse" src="./assets/open.svg" alt="">
      <img v-show="sidebarCollapse" src="./assets/close.svg" alt="">
    </div>
    <main :class="{'main__collapse': sidebarCollapse}">
      <router-view></router-view>
    </main>

    <div class="fixed inset-0 z-[9999]" v-if="showMask" @click="showModal"></div>
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
.logo {
  align-items: center;
  color: #9190ff;
  display: flex;
  height: 64px;
  justify-content: space-between;
  padding: 0 34px;
  width: 100%;
  img {
    display: block;
    height: auto;
    width: 85px;
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
