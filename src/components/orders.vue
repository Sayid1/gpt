<script setup>
import { computed, ref } from "vue";
import { useFetch } from '@vueuse/core'
import { useGlobalState } from '../store'
import dayjs from 'dayjs'

const store = useGlobalState()
const { isFetching, data, error } = useFetch(`http://8.129.170.108/api/orderList?token=${store.userInfo.value.token}&type=CHATGPT`).json()

const STATUS = {
  SUCCESS: '已支付',
  CANCEL: '已取消',
  NOT_PAY: '未支付',
  REFUND: '已退款',
}

const PAYMENT_CHANNEL = {
  'WECHAT': '微信支付',
  'ALIPAY': '支付宝'
}

const orders = computed(() => {
  console.log(isFetching)
  if (isFetching.value) return []
  // console.log(data.value.data)
  return (data.value?.data.map(order => {
    order.goodsSnapchat = JSON.parse(order.goodsSnapchat)
    return order
  }).reverse() || [])
})
</script>

<template>
  
  <div class="  h-full p-4">
    <div class="bg-white h-full flex flex-col">
    <div
      class="not-prose relative bg-slate-50 rounded-xl overflow-hidden"
    >
      <div
        class="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"
        style="background-position: 10px 10px"
      ></div>
      <div class="relative rounded-xl h-full pb-8">
        <div class="shadow-sm h-full my-8 overflow-y-scroll">
          <table class="border-collapse table-auto w-full text-sm overflow-y-scroll">
            <thead class="sticky top-0 bg-slate-50">
              <tr>
                <th
                  class="border-b dark:border-slate-600 font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left"
                >
                  产品
                </th>
                <th
                  class="border-b dark:border-slate-600 font-medium p-4 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left"
                >
                  订单号
                </th>
                <th
                  class="border-b dark:border-slate-600 font-medium p-4 pr-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left"
                >
                  创建时间
                </th>
                <th
                  class="border-b dark:border-slate-600 font-medium p-4 pr-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left"
                >
                  金额
                </th>
                <th
                  class="border-b dark:border-slate-600 font-medium p-4 pr-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left"
                >
                  状态
                </th>
                <th
                  class="border-b dark:border-slate-600 font-medium p-4 pr-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left"
                >
                  支付渠道
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-slate-800">
              <tr v-if="isFetching">
                <td class="border-b border-slate-100 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400" colspan="6">
                  <div class="flex justify-center">
                    <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </td>
              </tr>
              <tr v-else-if="orders.length" v-for="order in orders" :key="order.orderNo">
                <td
                  class="border-b border-slate-100 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400"
                >
                  {{ order.goodsSnapchat.name }}
                </td>
                <td
                  class="border-b border-slate-100 dark:border-slate-700 p-4 text-slate-500 dark:text-slate-400"
                >
                  {{ order.orderNo }}
                </td>
                <td
                class="border-b border-slate-100 dark:border-slate-700 p-4 pr-8 text-slate-500 dark:text-slate-400"
                >
                {{ dayjs(order.createDate).format('YYYY-MM-DD HH:mm:ss') }}
              </td>
              <td
              class="border-b border-slate-100 dark:border-slate-700 p-4 pr-8 text-slate-500 dark:text-slate-400"
              >
                {{ order.goodsSnapchat.priceShow }}
                </td>
                <td
                  class="border-b border-slate-100 dark:border-slate-700 p-4 pr-8 text-slate-500 dark:text-slate-400"
                >
                  {{ STATUS[order.status] }}
                </td>
                <td
                  class="border-b border-slate-100 dark:border-slate-700 p-4 pr-8 text-slate-500 dark:text-slate-400"
                >
                  {{ PAYMENT_CHANNEL[order.payType] }}
                </td>
              </tr>

              <tr v-else>
                <td class="border-b border-slate-100 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400 text-center" colspan="6">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div
        class="absolute inset-0 pointer-events-none border border-black/5 rounded-xl dark:border-white/5"
      ></div>
    </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
