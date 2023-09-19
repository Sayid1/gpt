<script setup>
import { computed, ref, nextTick, onMounted, onUnmounted, toRefs } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useChatCache, helperObj } from '../utils'
import { useGlobalState } from '../store'
import Modal from './modal.vue'
import message from './message/message.js'

const editId = ref('')
const isShowModal = ref(false)
const inputRefs = ref([])
const { chat, remove, update } = useChatCache()
const store = useGlobalState()
const router = useRouter()

const keys = computed(() => Object.keys(chat.value).reverse().filter(key => !helperObj[key]))

function checkChat() {
  if (store.isGenerating.value) {
    message({ type: 'warning', message: '对话进行中，请稍后再试'})
    return true
  }
  return false
}
async function modifyChat(id, index) {
  console.log(1)
  if (checkChat()) return
  editId.value = id
  await nextTick()
  inputRefs.value[index].focus()
}

function cancel() {
  editId.value = ''
}

let removeChatId
function confirmRemoveChat(id) {
  console.log(3)
  if (checkChat()) return
  removeChatId = id
  showModal()
}

function removeChat() {
  if (removeChatId === store.activeChatId.value) {
    store.msgRecord.value.splice(0, store.msgRecord.value.length)
    store.activeChatId.value = null
  }
  remove(removeChatId)
  closeModal()
}
function updateChat(id, index) {
  console.log(4)
  if (checkChat()) return
  update(id, inputRefs.value[index].value)
  editId.value = ''
}

function clickHistoryChatItem(id) {
  console.log(5)
  if (checkChat()) return
  router.push('/')
  store.showChat.value = true
  // 设置侧边栏激活的对话id
  store.activeChatId.value = id
  store.url.value = 'http://8.129.170.108/api/xfws'
  // 设置当前的对话消息记录
  store.msgRecord.value = JSON.parse(JSON.stringify(chat.value[id].chatRecords || []))
}

function closeModal() {
  removeChatId = undefined
  isShowModal.value = false
}
function showModal() {
  isShowModal.value = true
}

onMounted(() => document.body.addEventListener ('click', cancel))
onUnmounted(() => document.body.removeEventListener('click', cancel))
</script>

<template>
  <div class="h-full overflow-y-scroll hidden-scroll-bar">
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
          <button @click="removeChat" type="button" class="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ">
            确定
          </button>
        </div>
      </template>
    </Modal>
    <div
      @click.stop="clickHistoryChatItem(id)"
      v-for="(id, index) in keys" :key="id"
      class="chat-item"
      :class="{
        'border-y border-white	border-solid': editId === id,
        'chat-item__active': store.activeChatId.value === id
      }"
    >
      <span class="chat-icon"><svg width="16px" height="16px" viewBox="0 0 16 16"><g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="gpt纯净版-欢迎页" transform="translate(-23.000000, -280.000000)" fill="currentColor" fill-rule="nonzero"><g id="对话备份" transform="translate(21.000000, 278.000000)"><polygon id="路径" fill-opacity="0" points="0 0 20 0 20 20 0 20"></polygon><path d="M14.9230661,6.10216688 L14.717938,6.10216688 L14.717938,5.07662517 C14.7161291,3.37820178 13.339604,2.00180876 11.6410176,2 L5.07692056,2 C3.37833416,2.00180876 2.00180902,3.37820178 2,5.07662517 L2,13.280959 C2,13.531099 2.15118618,13.7564266 2.38279354,13.8509695 C2.61440091,13.9455125 2.88019767,13.8904533 3.05517868,13.7116865 L4.48204928,12.2554172 L5.2820486,12.2554172 L5.2820486,13.280959 C5.28385754,14.9793823 6.66038267,16.3557754 8.35896907,16.3575841 L15.5179374,16.3575841 L16.944808,17.8138534 C17.119481,17.9934835 17.3857275,18.0490925 17.6177079,17.9543973 C17.8496883,17.8597021 18.0009446,17.633667 18,17.3831258 L18,9.17879205 C17.9981776,7.48036867 16.6216525,6.10397565 14.9230661,6.10216688 Z M4.22358796,11.0247672 C4.05813249,11.0246805 3.89961227,11.0912171 3.78379344,11.2093647 L3.23076828,11.7738228 L3.23076828,5.07662517 C3.23167305,4.05749624 4.05769381,3.23155475 5.07692056,3.23065007 L11.6410176,3.23065007 C12.6602443,3.23155475 13.4862651,4.05749624 13.4871699,5.07662517 L13.4871699,9.17879205 C13.4862651,10.197921 12.6602443,11.0238625 11.6410176,11.0247672 L4.22358796,11.0247672 Z M16.7692184,15.8759897 L16.2161932,15.3115316 C16.1004276,15.1933056 15.9418728,15.1267545 15.7763987,15.1269341 L8.35896907,15.1269341 C7.33974232,15.1260294 6.51372156,14.3000879 6.51281679,13.280959 L6.51281679,12.2554172 L11.6410176,12.2554172 C13.339604,12.2536085 14.7161291,10.8772154 14.717938,9.17879205 L14.717938,7.33281695 L14.9230661,7.33281695 C15.9422928,7.33372163 16.7683136,8.15966312 16.7692184,9.17879205 L16.7692184,15.8759897 L16.7692184,15.8759897 Z" id="形状"></path></g></g></g></svg></span>
      <span class="title" v-show="id !== editId">{{ chat[id].title }}</span>
      <input :ref="el => inputRefs[index] = el" :autocomplete="false" v-show="id === editId" type="text" class="text-white outline-none bg-transparent w-[88%]" :value="chat[id].title">
      <div class="control">
        <template v-if="id !== editId">
          <div class="img_wrap" @click.stop="modifyChat(id, index)">
            <img src="../assets/edit.svg" alt="">
          </div>
          <div class="img_wrap" @click.stop="confirmRemoveChat(id)">
            <img src="../assets/delete.svg" alt="">
          </div>
        </template>
        <template v-else>
          <div class="img_wrap" @click.stop="updateChat(id, index)">
            <img src="../assets/check.svg" alt="">
          </div>
          <div class="img_wrap" @click.stop="cancel">
            <img src="../assets/close1.svg" alt="">
          </div>

        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.control {
  cursor: pointer;
  display: none;
  height: 46px;
  position: absolute;
  right: 16px;
  top: 50%;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  width: 46px;
  .img_wrap {
    align-items: center;
    display: flex;
    flex-shrink: 0;
    height: 22px;
    justify-content: center;
    width: 22px;
    &:first-child {
      margin-right: 5px;
    }
    &:hover {
      background-color: #5d8cf5;
    }
  }
}
.chat-item {
  align-items: center;
  color: #fff;
  cursor: pointer;
  display: flex;
  font-size: 14px;
  height: 46px;
  padding-left: 20px;
  padding-right: 30px;
  position: relative;
  width: 100%;
  &:hover, &.chat-item__active {
    background: linear-gradient(270deg,#417df4,#5270f8);
    padding-right: 70px;
    .control {
      align-items: center;
      display: flex;
    }
  }
  .chat-icon {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    height: 17px;
    margin-right: 5px;
    width: 17px;
    pointer-events: none;
  }
  .title {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    width: 88%;
  }
}
</style>
