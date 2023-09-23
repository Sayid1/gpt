<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useHelperCache, useChatCache, helperObj, parseMarkdown } from '../utils'
import { useGlobalState } from '../store'
import Modal from './modal.vue'
import message from './message/message.js'

const { helper, remove } = useHelperCache()
const { chat, set, remove: removeChat } = useChatCache()
const store = useGlobalState()
const isShowModal = ref(false)
const router = useRouter()

let removeHelperId
function confirmRemoveHelper(id) {
  removeHelperId = id
  showModal()
}

function checkChat() {
  if (store.isGenerating.value) {
    message({ type: 'warning', message: '对话进行中，请稍后再试'})
    return true
  }
  return false
}

function removeHelper() {
  if (checkChat()) return
  if (removeHelperId === store.activeChatId.value) {
    //todo 删除助手对话
    store.msgRecord.value.splice(0, store.msgRecord.value.length)
    store.activeChatId.value = null
  }
  // 删除助手列表缓存
  remove(removeHelperId)
  //删除助手聊天缓存
  removeChat(removeHelperId)
  closeModal()
}

function clickHelper(id) {
  if (checkChat()) return
  router.push('/')
  store.url.value = 'http://8.129.170.108/api/xfws?assistantId=' + id
  store.showChat.value = true
  store.activeChatId.value = id
  set(id, helperObj[id].title)

  // 设置当前的对话消息记录
  const records = JSON.parse(JSON.stringify(chat.value[id].chatRecords|| [])).map(record => {
    if (record.role === 'assistant') {
      return { ...record, content: parseMarkdown(record.content) }
    }
    return record
  })
  
  store.msgRecord.value.splice(0, store.msgRecord.value.length, {
    role: 'welcome_bot',
  }, ...records)
}

function closeModal() {
  removeHelperId = undefined
  isShowModal.value = false
}
function showModal() {
  isShowModal.value = true
}
</script>

<template>
  <div class="list_container overflow-y-scroll hidden-scroll-bar" v-if="helper.length">
    <Modal size="xs" v-if="isShowModal" @close="closeModal" :overlayer="true">
      <template #body>
        <div class="flex gap-x-2 items-center px-3 py-2 pt-9 w-96 text-base">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" class="stroke-orange-400	w-7 h-7">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>

          <span class="font-semibold">确定删除当前对话窗口？</span>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-x-4">
          <button @click="closeModal" type="button" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 ">
            取消
          </button>
          <button @click="removeHelper" type="button" class="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ">
            确定
          </button>
        </div>
      </template>
    </Modal>
    <div
      class="list_item"
      @click="clickHelper(id)"
      v-for="id in helper" :key="id"
      :class="{
        'list_item__active': store.activeChatId.value === id
      }"
    >
      <div class="icon_bot" :style="{color: helperObj[id].badgeBg}">
        <span role="img" class="anticon" style="pointer-events: none;"><svg version="1.1" width="24px" height="26px" viewBox="0 0 24.0 26.0"><defs><clipPath id="i01"><path d="M1440,0 L1440,796 L0,796 L0,0 L1440,0 Z"></path></clipPath><clipPath id="i11"><path d="M14.6,0.923760431 L22.6583302,5.57623957 C23.6484137,6.14786451 24.2583302,7.20427097 24.2583302,8.34752086 L24.2583302,17.6524791 C24.2583302,18.795729 23.6484137,19.8521355 22.6583302,20.4237604 L14.6,25.0762396 C13.6099166,25.6478645 12.3900834,25.6478645 11.4,25.0762396 L3.34166975,20.4237604 C2.35158631,19.8521355 1.74166975,18.795729 1.74166975,17.6524791 L1.74166975,8.34752086 C1.74166975,7.20427097 2.35158631,6.14786451 3.34166975,5.57623957 L11.4,0.923760431 C12.3900834,0.352135487 13.6099166,0.352135487 14.6,0.923760431 Z"></path></clipPath></defs><g transform="translate(-21.0 -192.0)"><g clip-path="url(#i01)"><g transform="translate(20.0 192.0)"><g clip-path="url(#i11)"><polygon points="1.74166975,0.495041723 24.2583302,0.495041723 24.2583302,25.5049583 1.74166975,25.5049583 1.74166975,0.495041723" stroke="none" fill="currentColor"></polygon></g></g></g></g></svg></span>
        <span class="text-white">{{ helperObj[id].badge }}</span>
      </div>
      <div class="info">
        <div class="title">{{ helperObj[id].title }}</div>
        <div class="desc">{{ helperObj[id].desc }}</div>
      </div>
      <div class="control_btn">
        <div class="img_wrap" @click.stop="confirmRemoveHelper(id)">
          <img src="../assets/close1.svg" alt="" srcset="">
        </div>
      </div>
    </div>
  </div>
  <div class="empty" v-else>
    <img class="empty-image" src="../assets/document.svg" alt="">
    <div class="empty-description">您还没有添加助手，去星火助手中心添加一个试试吧</div>
  </div>
</template>

<style scoped lang="scss">
.anticon {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: inherit;
  display: inline-block;
  font-style: normal;
  line-height: 0;
  text-align: center;
  text-rendering: optimizelegibility;
  text-transform: none;
  vertical-align: -0.125em;
}
.list_container {
  box-sizing: border-box;
  height: 100%;
  overflow-y: auto;
  position: relative;
  scrollbar-color: hsla(0,0%,100%,.2) transparent;
  scrollbar-width: thin;
  width: 100%;
}
.list_item {
  align-items: center;
  color: #fff;
  cursor: pointer;
  display: flex;
  font-size: 14px;
  height: 60px;
  padding-left: 20px;
  padding-right: 20px;
  position: relative;
  width: 100%;
  &:last-child {
    margin-bottom: 0;
  }
  &:hover, &.list_item__active {
    // background: linear-gradient(270deg,#417df4,#5270f8);
    background: rgba($color: #ffffff, $alpha: .2);
    padding-right: 38px;
    .control_btn {
      align-items: center;
      display: flex;
      justify-content: center;
    }
  }
  .control_btn {
    cursor: pointer;
    display: none;
    height: 46px;
    position: absolute;
    right: 0;
    top: 50%;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
    width: 34px;
    .img_wrap {
      align-items: center;
      display: flex;
      flex-shrink: 0;
      height: 22px;
      justify-content: center;
      width: 22px;
      &:hover {
        background-color: #5d8cf5;
      }
    }
  }
  .info {
    flex-shrink: 1;
    overflow: hidden;
    .title {
      display: block;
      overflow: hidden;
      position: relative;
      top: -2px;
      white-space: nowrap;
    }
    .desc {
      color: hsla(0,0%,100%,.5);
      display: block;
      font-size: 12px;
      overflow: hidden;
      white-space: nowrap;
    }
  }
  .icon_bot {
    align-items: flex-start;
    display: flex;
    flex-shrink: 0;
    height: 26px;
    justify-content: center;
    margin-right: 10px;
    position: relative;
    top: -3px;
    width: 26px;
    color: rgb(253, 232, 233);
    & > span {
      font-size: 12px;
      left: 50%;
      position: absolute;
      top: 50%;
      -webkit-transform: translate(-50%,-50%);
      transform: translate(-50%,-50%);
    }
  }
}
.empty-image {
  height: auto;
  width: 70px;
  margin-bottom: 11px;
}
.empty {
  line-height: 1.5715;
  margin: 0 8px;
  text-align: center;
  color: #fff;
  font-size: 12px;
  opacity: .6;
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  padding: 0 28px;
}
</style>
