<script setup>
import { nextTick, ref, defineModel, computed } from 'vue'
import { useGlobalState } from '../store'
import { useHelperCache, useChatCache, helperList, helperObj } from '../utils'
// import Modal from './modal.vue'
import message from './message/message.js'

// const isShowModal = ref(false)
const store = useGlobalState()
const serachText = ref('')
const { chat, set } = useChatCache()
const { add, helper: addedHelper } = useHelperCache()

const filterHelper = computed(() => helperList.filter(help => help.title.includes(serachText.value)))
function clickHelperItem(id) {
  if (!addedHelper.value.includes(id)) {
    message('添加成功！')

    set(id, helperObj[id].title)
    // 添加小助手缓存
    add(id)
  }

  store.url.value = 'http://att.miclink.net/api/xfws?assistantId=' + id
  store.activeChatId.value = id
  // 设置当前的对话消息记录
  const records = JSON.parse(JSON.stringify(chat.value[id].chatRecords || []))
  store.msgRecord.value.splice(0, store.msgRecord.value.length, {
    role: 'welcome_bot',
  }, ...records)

  nextTick(() => {
    store.showChat.value = true
  })
}
</script>

<template>
  <div class="bot_welcome_panel">
    <div class="title flex justify-between">
      <div class="t1">助手中心<span>场景任务一键搞定，打造高效的生产力工具！</span></div>
      <div class="relative w-[300px] transform px-4 transition-all opacity-100 scale-100">
        <div class="overflow-hidden rounded-lg bg-white">
          <div class="relative">
            <input v-model="serachText" class="block w-full appearance-none bg-transparent py-2.5 pl-4 pr-12 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-sm" placeholder="请输入你要查找的助手" type="text" aria-expanded="false" aria-autocomplete="list" style="caret-color: rgb(107, 114, 128);" tabindex="0">
            <svg class="cursor-pointer transition-all absolute right-4 top-2.5 h-6 w-6 fill-slate-400" xmlns="http://www.w3.org/2000/svg"><path d="M20.47 21.53a.75.75 0 1 0 1.06-1.06l-1.06 1.06Zm-9.97-4.28a6.75 6.75 0 0 1-6.75-6.75h-1.5a8.25 8.25 0 0 0 8.25 8.25v-1.5ZM3.75 10.5a6.75 6.75 0 0 1 6.75-6.75v-1.5a8.25 8.25 0 0 0-8.25 8.25h1.5Zm6.75-6.75a6.75 6.75 0 0 1 6.75 6.75h1.5a8.25 8.25 0 0 0-8.25-8.25v1.5Zm11.03 16.72-5.196-5.197-1.061 1.06 5.197 5.197 1.06-1.06Zm-4.28-9.97c0 1.864-.755 3.55-1.977 4.773l1.06 1.06A8.226 8.226 0 0 0 18.75 10.5h-1.5Zm-1.977 4.773A6.727 6.727 0 0 1 10.5 17.25v1.5a8.226 8.226 0 0 0 5.834-2.416l-1.061-1.061Z"></path></svg>
          </div>
        </div>
      </div>
    </div>
    <div class="card_wrapper gap-x-8 overflow-y-scroll hidden-scroll-bar" style="height:calc(100% - 70px)">
      <div class="card_item" :class="{added: addedHelper.includes(helper.id)}" @click="clickHelperItem(helper.id)" v-for="helper in filterHelper" :key="helper.id">
        <div class="name_wrap " :style="{color: helper.badgeBg}">
          <span role="img" class="anticon" style="pointer-events: none;">
            <svg version="1.1" width="38px" height="41px" viewBox="0 0 42.0 41.0">
              <defs>
                <clipPath id="i0">
                  <path d="M1440,0 L1440,796 L0,796 L0,0 L1440,0 Z"></path>
                </clipPath>
                <clipPath id="i1">
                  <path d="M34,0 C38.418278,-8.11624501e-16 42,3.581722 42,8 L42,33 C42,37.418278 38.418278,41 34,41 L8,41 C3.581722,41 5.41083001e-16,37.418278 0,33 L0,8 C-5.41083001e-16,3.581722 3.581722,8.11624501e-16 8,0 L34,0 Z"></path>
                </clipPath>
                <clipPath id="i2">
                  <path d="M19.354826,0 C20.0078224,2.98867098e-15 20.6493145,0.171887305 21.214826,0.498385502 L38.843194,10.6761285 C39.994166,11.3406425 40.703194,12.568715 40.703194,13.897743 L40.703194,33.102257 C40.703194,34.431285 39.994166,35.6593575 38.843194,36.3238715 L22.211597,45.9261285 C21.060625,46.5906425 19.642569,46.5906425 18.491597,45.9261285 L1.86000001,36.3238715 C0.709028,35.6593575 -2.05768706e-15,34.431285 0,33.102257 L0.00089241045,11.7092657 L0.257419751,0 L19.354826,0 Z"></path>
                </clipPath>
              </defs>
              <g transform="translate(-384.0 -301.0)">
                <g clip-path="url(#i0)">
                  <g transform="translate(384.0 301.0)">
                    <g clip-path="url(#i1)">
                      <g transform="translate(0.14840301106569243 -8.0)">
                        <g clip-path="url(#i2)"><polygon points="0,8 40.703194,8 40.703194,46.424514 0,46.424514 0,8" stroke="none" fill="currentColor"></polygon></g></g></g></g></g></g></svg>
          </span>
          <p class="!text-white">{{ helper.badge }}</p>
        </div>
        <div class="card_header">
          <div class="card_title">
            {{ helper.title }}
          </div>
        </div>
        <div class="card_desc">
          {{ helper.desc }}
        </div>
        <div class="card_actions">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
            </svg>
          </span>
          添加
        </div>
        <div class="card_actions text-green-600 card_actions__added">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class=" w-5 h-5 mr-1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        已添加
      </div>
      </div>
    </div>
    <!-- <Modal v-if="isShowModal" @close="closeModal" :overlayer="false">
      <template #body>
        <div class="flex gap-x-2 items-center px-3 py-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="fill-green-600 w-8 h-8">
            <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
          </svg>
          <span>添加成功</span>
        </div>
      </template>
    </Modal> -->
  </div>
</template>

<style scoped lang="scss">
.bot_welcome_panel {
  background: url(../assets/bot-welcome-bg.png) 100% 0 no-repeat;
  height: 100%;
  margin: 0 auto;
  padding-top: 30px;
  position: relative;
  width: 100%;
  .title {
    .t1 {
      align-items: center;
      color: #4c75f6;
      display: flex;
      font-size: 24px;
      font-weight: 600;
      span {
        color: #9295bf;
        font-size: 14px;
        font-weight: 400;
        padding-left: 20px;
      }
    }
  }
  .card_wrapper {
    color: #43436b;
    display: flex;
    flex-wrap: wrap;
    height: auto;
    // justify-content: space-between;
    margin-top: 18px;
    overflow-y: auto;
    padding-right: 30px;
    padding-top: 1px;
    scrollbar-color: #dde7f7 transparent;
    scrollbar-width: thin;
    width: 100%;
    .card_item {
      cursor: pointer;
      background: #fff;
      border: 1px solid #edf2fe;
      border-radius: 8px;
      // height: 108px;
      margin-bottom: 20px;
      overflow: hidden;
      padding: 14px 14px 12px;
      position: relative;
      width: 230px;
      &.added {

      cursor: default;
        .card_actions {
          display: none;
        }
        .card_actions__added {
          display: flex;
        }
      }
      &:hover {
        border: 1px solid #3f6dff;
        box-shadow: 0 2px 5px 0 rgba(131,233,231,.3);
      }
      .name_wrap {
        cursor: default;
        left: -1px;
        position: absolute;
        top: -2px;
        // color: rgb(226, 236, 254);
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
        p {
          left: 50%;
          position: absolute;
          top: 50%;
          transform: translate(-50%,-16px);
          color: rgb(56, 116, 240);
        }
      }
      .card_header {
        align-items: center;
        display: flex;
        font-size: 16px;
        padding-left: 35px;
        width: 100%;
        .card_title {
          overflow: hidden;
          position: relative;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      .card_desc {
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        color: #9295bf;
        display: -webkit-box;
        font-size: 12px;
        height: 38px;
        margin-top: 4px;
        overflow: hidden;
        text-align: justify;
        text-overflow: ellipsis;
      }
      .card_actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 12px;
        span {
          background: #4c75f6;
          color: #fff;
          border-radius: 50%;
          margin-right: 6px;
        }
        font-size: 12px;
        align-items: center;
      }
      .card_actions__added {
          display: none;
        }
    }
  }
}
</style>
