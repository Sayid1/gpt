<script setup>
import { ref } from 'vue'
</script>

<template>
  <div class="  h-full p-4">
    <div class="bg-white h-full flex flex-col">

      <div class=" bg-white shadow-md rounded-sm">
        <h1 class="border-gray-100 border-b p-4 text-lg font-semibold">欢迎关注公众号办理以下业务</h1>
        <ul class="list-disc pl-8 py-4 border border-transparent gap-y-1 flex flex-col">
          <li>套餐购买使用疑问</li>
          <li>ChatGPT账号购买</li>
          <li>ChatGPT技术实践交流</li>
          <li>文案工具需求建议</li>
        </ul>
      </div>
      <div class="mt-20 flex gap-x-28 justify-center items-center flex-1 -translate-y-[10%]">
        <img src="../assets/qrcode.png" class="w-52 h-52">
        <div class="flex flex-col items-center">
          <div class="flex text-3xl items-center gap-x-4">
            <img src="../assets/wechat.svg" alt="">
            <span>微信搜一搜</span>
          </div>
          <div class="bg-[rgb(87_188_106)] text-white text-3xl flex items-center rounded-md p-2 pl-4 pr-16 mt-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" stroke="currentcolor" fill="currentcolor" viewBox="0 0 30 30"><path d="M 13 3 C 7.4889971 3 3 7.4889971 3 13 C 3 18.511003 7.4889971 23 13 23 C 15.396508 23 17.597385 22.148986 19.322266 20.736328 L 25.292969 26.707031 A 1.0001 1.0001 0 1 0 26.707031 25.292969 L 20.736328 19.322266 C 22.148986 17.597385 23 15.396508 23 13 C 23 7.4889971 18.511003 3 13 3 z M 13 5 C 17.430123 5 21 8.5698774 21 13 C 21 17.430123 17.430123 21 13 21 C 8.5698774 21 5 17.430123 5 13 C 5 8.5698774 8.5698774 5 13 5 z"/></svg>
            <p>AI文本工具站</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped lang="scss">
</style>
