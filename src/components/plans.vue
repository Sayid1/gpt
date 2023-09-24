<script setup async>
import { ref, reactive, computed, watch, onUnmounted, onBeforeUnmount, toRef } from "vue";
import { useFetch } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { useGlobalState } from '../store'
import QRCode from 'qrcode'
import Modal from './modal.vue'
import message from './message/message.js'

const store = useGlobalState()
const payType = ref('WECHAT')
const qrcode = ref('')
const payStatusTimer = ref('')
const qrcodeStatusTimer = ref('')
const qrcodeFetchig = ref(false)
const planRef = reactive({})
const orderInfo = reactive({})
const isShowModal = ref(false)
const router = useRouter()

// 查询套餐列表
const { data, error, isFetching, } = useFetch('http://att.miclink.net/api/goods?type=CHATGPT').json()
const INDEX = {
  0: '一',
  1: '二',
  2: '三',
  3: '四',
}

function closeModal() {
  if (payStatusTimer.value) clearInterval(payStatusTimer.value)
  isShowModal.value = false
}
function showModal() {
  isShowModal.value = true
  // qrcodeStatusTimer.value = setInterval(async () => {
  //   if (orderInfo.value.orderId) {
  //     const { data } = await useFetch(`http://att.miclink.net/api/getPayCode?orderNo=${orderInfo.value.orderId}`).post().json()
  //     setQrcodeUrl(data.value.data.codeUrl)
  //   }
  // }, 1000 * 1 * 3);
}

// 支付类型 和 套餐计划
watch([payType, planRef], async () => {
  if (payStatusTimer.value) clearInterval(payStatusTimer.value)
  qrcodeFetchig.value = true
  // 生成订单获取二维码url
  const { data, error, isFetching, } = await useFetch(`http://att.miclink.net/api/pay?goodsId=${planRef.value.goodsId}&goodsSpecsId=${planRef.value.id}&goodsType=CHATGPT&payType=${payType.value}&token=${store.userInfo.value.token}&source=NATIVE`).json()
  orderInfo.value = data.value.data
  setQrcodeUrl(data.value.data.codeUrl)
})

async function refreshQrcode() {
  if (orderInfo.value.orderId) {
    const { data } = await useFetch(`http://att.miclink.net/api/getPayCode?orderNo=${orderInfo.value.orderId}`).post().json()
    setQrcodeUrl(data.value.data.codeUrl)
  }
}

function setQrcodeUrl(codeUrl) {
  QRCode.toDataURL(codeUrl)
  .then(url => {
    qrcodeFetchig.value = false
    qrcode.value = url
    payStatusTimer.value = setInterval(() => {
      loopStatus()
    }, 3000);
  })
  .catch(err => {
    console.error(err)
  })
}
onBeforeUnmount(() => {
  if (payStatusTimer.value) clearInterval(payStatusTimer.value)
})
onUnmounted(() => {
  if (payStatusTimer.value) clearInterval(payStatusTimer.value)
})

async function loopStatus() {
  const { data, error, isFetching, } = await useFetch(`http://att.miclink.net/api/queryOrderStatus?orderNo=${orderInfo.value.orderId}`).json()
  if (data.value.data.orderStatus === 'SUCCESS') {
    message('购买成功！')
    const urlParams = new URLSearchParams(window.location.search)
    const sno = urlParams.get('sno')
    const { data: userData } = await useFetch(`http://att.miclink.net/api/register?account=${sno}&code=${sno}&password=${sno}&type=VISITOR`).post().json()
    store.userInfo.value = userData.value.data
    if (payStatusTimer.value) clearInterval(payStatusTimer.value)
    router.push('/orders')
    return true
  } else {
    return false
  }
}

function manualCheckPayStatus() {
  if (payStatusTimer.value) clearInterval(payStatusTimer.value)
  loopStatus().then(ret => {
    if (!ret) {
      message({ type: 'warning', message: '未支付'})
      payStatusTimer.value = setInterval(() => {
        loopStatus()
      }, 3000);
    }
  })
}

function buy(plan) {
  showModal()
  planRef.value = plan
}

function toCustomer() {
  closeModal()
  router.push('/contact-us')
}
</script>

<template>
  <div class=" h-full p-4">
    <div class="bg-white h-full flex flex-col">
      <div v-if="error">Oops! Error encountered: {{ error.message }}</div>
      <div v-else-if="isFetching"></div>
      <div v-else class="flex justify-center gap-x-8 rounded-md pt-5 flex-wrap px-10 overflow-y-scroll">
        <div class="w-[300px] flex flex-col items-center mt-5" v-for="(plan, index) in data?.data?.[0]?.goodsSpecs" :key="plan.id">
          <h2 class="text-red-600 text-xl font-medium ">套餐{{ INDEX[index] }}</h2>
          <div class="border h-52 w-full mt-2 rounded-md relative flex flex-col items-center py-4">
            <p class="text-2xl text-gray-900 font-bold">{{ plan.name }}</p>
            <p class="text-sm text-gray-400 mt-2 mb-4">{{ plan.remark }}</p>
            <p class="text-2xl font-bold">{{ plan.priceShow }}</p>
            <button type="button" @click="buy(plan)" class="absolute left-1/2 -translate-x-1/2 bottom-4 text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-8 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"> 购买 </button>
          </div>
        </div>
      </div>
    </div>

    <Modal v-if="isShowModal" @close="closeModal">
      <template #header>
        购买套餐
      </template>
      <template #body>
        <div class="w-[600px] flex flex-col items-center justify-center pb-12">
          <div class="flex flex-col gap-y-2 items-center">
            <p>订单号：{{ orderInfo?.value?.orderId }}</p>
            <p>金额：{{ planRef?.value?.priceShow }}</p>
            <p>状态：待支付</p>
          </div>
          <div class="border shadow-sm w-80 mt-6">
            <div class="flex cursor-pointer">
              <span @click="payType='ALIPAY'" class="py-3 flex-1 text-center bg-gray-100 text-gray-500" :class="{'!text-blue-600 !bg-white font-bold': payType === 'ALIPAY'}">支付宝扫码付款</span>
              <span @click="payType='WECHAT'" class="py-3 flex-1 text-center bg-gray-100 text-gray-500" :class="{'!text-blue-600 !bg-white font-bold': payType === 'WECHAT'}">微信扫码付款</span>
            </div>
            <div class="w-full h-80 relative">
              <div v-if="qrcodeFetchig" class="absolute z-10 bg-gray-900/80 inset-0 opac80 flex justify-center items-center">
                <svg class="animate-spin h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="#fff" stroke-width="4"></circle>
                  <path class="opacity-75" fill="#fff" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <img @click="refreshQrcode" :src="qrcode" class="w-full h-auto">
            </div>
          </div>
          <div class="flex justify-center gap-x-4 mt-4">
            <button @click="manualCheckPayStatus" type="button" class="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              我已完成支付
            </button>
            <button @click="toCustomer" type="button" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
              支付异常，寻找客服
            </button>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped lang="scss">
</style>
