<script setup>
import { ref } from 'vue'
import { useGlobalState } from './store'
import { useClipboard } from '@vueuse/core'
import { useRouter, useRoute } from 'vue-router'
import welcome from './components/welcome-window.vue'
import helperList from './components/helper-list.vue'
import historyChat from './components/history-chat.vue'
import chatItem from './components/chat.vue'
import chatInput from './components/chat-input.vue'
import helperCenter from './components/helper-center.vue'
import contactUs from './components/contact-us.vue'
// import orders from './components/orders.vue'
import plans from './components/plans.vue'
import message from './components/message/message.js'
import dayjs from 'dayjs'

import { genChatId, useChatCache } from './utils'

const { copy } = useClipboard()

const sidebarCollapse = ref(false)
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
        <div class="box">
          <img src="./assets/bot.svg" alt="">
        </div>
      </div>

      <div class="silder-content" v-show="!sidebarCollapse">
        <helper-list v-show="store.activeTab.value !== 'history-chat'" />
        <history-chat v-show="store.activeTab.value === 'history-chat'" />
      </div>
      <div v-show="!sidebarCollapse" class="absolute bottom-4 inset-x-0 w-[266px] h-[102px] py-2">
        <div class="text-gray-600 pl-4 mb-4">
          <p class="mb-1">设备号：{{ store.userInfo.mac }}</p>
          <p>服务有效期：{{ dayjs(store.userInfo.expiredTime).format('YYYY-MM-DD HH:mm:ss') }}</p>
        </div>
        <div class="grid grid-cols-3 divide-x  text-sm text-center">
          <span @click.stop="toPage('/contact-us')" class="cursor-pointer text-white">联系我们</span>
          <span @click.stop="toPage('/orders')" class="cursor-pointer text-white">我的订单</span>
          <span @click.stop="toPage('/plans')" class="cursor-pointer text-white">购买套餐</span>
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
    background: hsla(0,0%,100%,.16);
    border: 1px solid hsla(0,0%,100%,.46);
    border-radius: 5px;
    color: #fff;
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
      background: hsla(0,0%,100%,.3);
      border: 1px solid hsla(0,0%,100%,.46);
    }
    span {
      font-size: 20px;
      margin-top: -4px;
    }
  }
}
.root {
  background: linear-gradient(#f2f5ff,#f2f5ff 49%,#e4ebf9 100%);
  display: flex;
  height: 100vh;
  min-width: 1200px;
  overflow: hidden;
  position: relative;
  width: 100vw;
}
.sidebar {
  background: linear-gradient(135deg,#7958ff,#00caff);
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
  height: calc(100% - 310px);
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
