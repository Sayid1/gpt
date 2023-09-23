<script setup async>
import { ref, onMounted,onUnmounted, onBeforeUnmount } from 'vue'
import { useGlobalState } from './store'
import { useClipboard, useFetch } from '@vueuse/core'
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
const nowTime = ref('')

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
  showMask.value = store.showMask.value
  const urlParams = new URLSearchParams(window.location.search)
  let sno = urlParams.get('sno')
  if (sno) {
    store.showMask.value = false
    showMask.value = false
    console.log(showMask.value)
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
    const { data } = await useFetch(`http://8.129.170.108/api/register?account=${sno}&code=${sno}&password=${sno}&type=VISITOR`).post().json()
    store.userInfo.value = data.value.data
  },1000 * 60 * 30)
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
  <div class="root">
    <div class="sidebar" :class="{'sidebar__collapse': sidebarCollapse }">
      <div v-show="!sidebarCollapse">
        <div class="logo items-center gap-x-3">
          <svg version="1.1" width="28.5px" height="34.5px" viewBox="0 0 19.0 23.0" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><clipPath id="i0"><path d="M1440,0 L1440,796 L0,796 L0,0 L1440,0 Z"></path></clipPath><clipPath id="i1"><path d="M8.11618549,0.00056428363 C9.74225263,0.258475235 12.979378,1.77423241 12.3307505,4.99992691 L12.2791237,5.22775542 C11.9554133,6.3366313 11.4314026,7.37686429 10.7330126,8.29699775 C9.69927972,9.58027712 6.16685037,9.58925361 4.05988804,9.01942587 C1.77195963,8.40184318 0.118489701,6.95770506 0,6.85178245 C0.935937838,7.58060043 2.08838881,7.97612362 3.27462448,7.97563931 C6.24548445,7.97563931 8.65405693,5.54588231 8.65405693,2.54881099 C8.65532831,1.68897975 8.45291874,0.841074396 8.06340372,0.0745305821 C8.05454903,0.0575208027 8.05598737,0.0369811915 8.06712631,0.0213715157 C8.07826526,0.00576183986 8.09722075,-0.0022776628 8.11618549,0.00056428363 Z"></path></clipPath><radialGradient id="i2" cx="-0.0294428955px" cy="6.91749037px" r="12.3913873px" gradientUnits="userSpaceOnUse"><stop stop-color="rgba(255, 255, 255, 0)" offset="0%"></stop><stop stop-color="rgba(255, 255, 255, 0.3)" offset="21%"></stop><stop stop-color="rgba(255, 255, 255, 0.55)" offset="42%"></stop><stop stop-color="rgba(255, 255, 255, 0.74)" offset="60%"></stop><stop stop-color="rgba(255, 255, 255, 0.88)" offset="76%"></stop><stop stop-color="rgba(255, 255, 255, 0.97)" offset="89%"></stop><stop stop-color="#FFFFFF" offset="97%"></stop></radialGradient><clipPath id="i3"><path d="M0.0865333881,0.0144398927 L6.30939707,6.12671319 L6.77078879,6.58128277 C8.19133935,8.07328658 9.08650008,9.98790442 9.32047173,12.0346815 C9.32340016,12.059585 9.30778612,12.0829211 9.28364904,12.0897153 C9.25951196,12.0965094 9.23401765,12.0847445 9.22352561,12.0619701 C8.43359427,10.3607452 7.04582852,9.85734349 5.37799621,9.4821261 C4.11087452,9.19739176 3.28108755,8.78375498 2.9144876,8.57370506 L2.79644672,8.49875134 L2.67643101,8.42684964 C0.182712866,6.90860936 0.0119326371,4.35066962 0.00075615692,4.07857165 L0,0.0503458629 C0.000256562389,0.0299702792 0.012620395,0.0117041692 0.0314416493,0.00389452008 C0.0502629037,-0.00391512904 0.0719266856,0.000231638857 0.0865333881,0.0144398927 Z"></path></clipPath><clipPath id="i4"><path d="M7.20755915,0.00639878346 C7.22733464,0.017412982 7.23739581,0.0402159274 7.2322009,0.0622476221 C7.16505673,0.349495383 7.058416,0.975336443 7.12807358,1.83169383 C7.20958013,2.84496031 7.53847882,4.18317582 8.47095687,5.67363264 C9.05658324,6.6104194 9.88062525,7.60788725 11.0314116,8.62330808 L11.2417308,8.80606947 L11.4590517,8.98883086 C11.9852294,9.53462105 12.2784345,10.2637064 12.2766306,11.0218269 C12.2766306,12.634005 10.9811432,13.9406232 9.38332757,13.9406232 C8.72904216,13.9413622 8.09422003,13.7180974 7.58443846,13.30796 C7.56560894,13.2924348 7.56042112,13.2657438 7.57206434,13.2442958 C7.58370755,13.2228477 7.60891649,13.2126578 7.6321934,13.2199904 C7.73315009,13.2529999 7.83871836,13.269726 7.9449344,13.2695406 C8.390487,13.264603 8.78217008,12.9732841 8.91507544,12.547987 C9.03469026,12.1652195 8.92020014,11.7523136 8.63114269,11.4856571 L8.52840642,11.4024302 C7.89977897,10.9064087 7.31147121,10.3613236 6.76901388,9.77229913 C6.08392797,9.02150529 5.57980815,8.28974162 5.21356725,7.59460204 C4.29547237,8.73260426 3.87240505,10.1914104 4.03919305,11.6440388 C4.20598106,13.0966671 4.94867459,14.4216228 6.10080378,15.3219259 C6.22611561,15.4353887 7.87958554,16.8777316 10.167514,17.4953142 C12.2759125,18.0629876 15.8083419,18.0540111 16.8384841,16.7750405 C15.123615,19.0328079 12.4220498,20.488795 9.38512287,20.488795 C4.20173702,20.488795 0,16.2518905 0,11.0218269 C-0.0050307498,8.58521647 0.928646901,6.24028525 2.60715288,4.47401417 L3.08003451,4.00939092 L7.14710375,0.0148517415 C7.16309986,-0.00116409281 7.18778366,-0.00461541507 7.20755915,0.00639878346 Z"></path></clipPath></defs><g transform="translate(-1412.0 -328.0)"><g clip-path="url(#i0)"><g transform="translate(1412.0 328.0)"><g transform="translate(6.109421209151573 10.58567040015953)"><g clip-path="url(#i1)"><polygon points="0,1.00267017e-15 12.415472,1.00267017e-15 12.415472,9.38116968 0,9.38116968 0,1.00267017e-15" stroke="none" fill="url(#i2)"></polygon></g></g><g transform="translate(9.386559104673978 -5.329070518200751e-15)"><g clip-path="url(#i3)"><polygon points="0,-1.01264483e-15 9.3208237,-1.01264483e-15 9.3208237,12.0916298 0,12.0916298 0,-1.01264483e-15" stroke="none" fill="#FFFFFF"></polygon></g></g><g transform="translate(1.5987211554602254e-14 2.112654494570487)"><g clip-path="url(#i4)"><polygon points="-2.02244231e-05,4.18068358e-16 16.8384841,4.18068358e-16 16.8384841,20.488795 -2.02244231e-05,20.488795 -2.02244231e-05,4.18068358e-16" stroke="none" fill="#FFFFFF"></polygon></g></g></g></g></g></svg>
          <span class="text-white text-lg font-semibold">讯飞星火认知大模型</span>
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

      <div class="silder-content" v-show="!sidebarCollapse" :style="{height: store.userInfo.value.id ? 'calc(100% - 310px)' : 'calc(100% - 246px)'}">
        <helper-list v-show="store.activeTab.value !== 'history-chat'" />
        <history-chat v-show="store.activeTab.value === 'history-chat'" />
      </div>
      <div v-show="!sidebarCollapse" class="absolute bottom-4 inset-x-0 w-[266px] py-2" :class="{'h-[102px]': store.userInfo.value.id}">
        <div class="text-gray-600 pl-4 mb-4" v-if="store.userInfo.value.id">
          <p class="mb-1">设备号：{{ store.userInfo.value.mac }}</p>
          <p>服务有效期：{{ store.userInfo.value.chatExpiredTime ? dayjs(store.userInfo.value.chatExpiredTime).format('YYYY-MM-DD HH:mm:ss') : '已过期'}}</p>
        </div>
        <div class="grid grid-cols-1 divide-x text-sm text-center" :class="{'!grid-cols-3': store.userInfo.value.id}">
          <!-- <span @click.stop="toPage('/contact-us')" class="cursor-pointer text-white">联系我们</span> -->
          <span v-if="store.userInfo.value.id" @click.stop="toPage('/orders')" class="cursor-pointer text-white">我的订单</span>
          <span v-if="store.userInfo.value.id" @click.stop="toPage('/plans')" class="cursor-pointer text-white">购买套餐</span>
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
  padding: 0 24px;
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
