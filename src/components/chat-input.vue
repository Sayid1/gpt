<script setup>
import { v4 } from 'uuid'
import { ref, watch } from 'vue'
import { useGlobalState } from '../store'
import { useSendMsg, useChatCache, genChatId } from '../utils'

const store = useGlobalState()
const { set } = useChatCache()
const showPrompt = ref(false)
const textareaRef = ref(null)


watch(store.msg, newInput => {
  if (newInput === '/') {
    showPrompt.value = true
  } else {
    showPrompt.value = false
  }
})

const promptList = [
  { title: '标题推荐', text: '我想让你充当标题生成器。请以[文房四宝]为主题，[传承、匠心]为关键词，你将生成五个吸引人的标题。要求保持标题简洁，不超过[20]个字' },
  { title: '文章续写', text: '你是一位文案助理，以[星期日早上，我坐在床上读着《安徒生童话》中《卖火柴的小女孩》。]为开头，续写一篇小学生日记，要求表意清晰，主题鲜明，分段表述' },
  { title: '文章润色', text: '我希望你是一位文章改写助手，我给出一段话，你对文本内容进行修改润色，以达到[更为简洁、有吸引力]的目标，要[用到成语和修辞手法]。文本内容为：[今天的天气真是好极了，我在上学路上看到了一只小猫在花丛里玩耍，它看起来非常开心。放学回家后，我向妈妈分享了这个有趣的经历。' },
  { title: '文章大纲', text: '我希望你是一位文案助理，帮助我生成文章大纲，这篇大纲的主题是[人工智能发展史]，要求逻辑清晰，分条表述' },
  { title: '活力方案', text: '你现在是个活动企划，公司要举办[新品发布会]，请制定一份详细的活动方案，包括活动主题、时间点、流程、人员安排、预算' },
  { title: '演讲稿', text: '现在你准备参加[时间的重量]的主题演讲，给出一份800字演讲稿，要求文字简洁、情真意切' },
]

const { fetch, isFetching, abort, data } = useSendMsg()

function  sendMsg() {
  let id = store.activeChatId.value
  if (!id) id = genChatId()
  // 缓存对话的标题
  set(id, store.msg.value)
  // 请求对话
  fetch(id, store.msg.value)
  // 设置当前的对话消息记录
  store.msgRecord.value.push({
    type: 'user',
    msg: store.msg.value
  }, {
    type: 'assistant',
    msg: '',
    status: 'loading',
  })
  // 设置侧边栏激活的对话id
  store.activeChatId.value = id
  // 重置输入框
  store.msg.value = ''
}

</script>

<template>
  <div class="ask-window">
    <div class="ask_window__bg"></div>
    <div class="ask_prompt" :class="{'ask_prompt_visible': showPrompt}">
        <div class="prompt_wrap">
            <span>推荐模板</span>
            <div class="list">
            <div @click="store.msg.value = prompt.text" class="item" v-for="prompt in promptList" :key="prompt.title">{{ prompt.title }}</div>
            </div>
        </div>
    </div>
    <textarea ref="textareaRef" @keyup.enter="sendMsg" v-model="store.msg.value" maxlength="7000" placeholder="在此输入您想了解的内容，输入“/”可获取模板，Shift+Enter换行" style="height: 75px;"></textarea>
    <div class="send" @click="sendMsg">发送</div>
</div>
</template>

<style scoped lang="scss">
.ask-window {
  border-radius: 6px;
  height: 95px;
  margin: 0 auto;
  position: relative;
  width: 100%;
  .ask_window__bg {
    background: #fff;
    border-radius: 6px;
    bottom: 0;
    left: 0;
    margin: 0 auto;
    max-height: 186px;
    min-height: 98px;
    position: absolute;
    width: 100%;
    z-index: 31;
  }
  // @media screen and (max-width: 1300px) {
  //   .ask_window__bg {
  //     width: 780px;
  //   }
  // }
  textarea {
    background: transparent;
    border: none;
    border-radius: 8px;
    bottom: 2px;
    color: #07133e;
    font-size: 14px;
    left: 2px;
    line-height: 25px;
    max-height: 180px;
    min-height: 95px;
    outline: none;
    padding: 10px 100px 10px 32px;
    position: absolute;
    resize: none;
    width: calc(100% - 4px);
    z-index: 32;
  }
}
.ask_prompt {
  background: url(../assets/prompt_bg.png) 50%/104% 104% no-repeat;
  background-color: #fff;
  border: 1px solid transparent;
  border-bottom: 0!important;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  box-sizing: border-box;
  height: 0;
  left: 0;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  top: 6px;
  -webkit-transform: translateY(-100%);
  transform: translateY(-100%);
  transition: height .3s,opacity .3s;
  width: 100%;
  z-index: 35;
  &.ask_prompt_visible {
    display: block;
    height: 98px;
    opacity: 1;
  }
  .prompt_wrap {
    align-items: center;
    display: flex;
    margin-top: 20px;
    padding: 0 26px;
    & > span {
      color: #43436b;
      flex-shrink: 0;
      font-size: 14px;
      margin-right: 8px;
      -webkit-user-select: none;
      user-select: none;
    }
    & > .list {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      height: 34px;
      margin-right: 8px;
      overflow: hidden;
      .item {
        align-items: center;
        background: hsla(0,0%,100%,.9);
        border: 1px solid #e1eaff;
        border-radius: 4px;
        color: #777a9c;
        cursor: pointer;
        display: flex;
        flex-shrink: 0;
        height: 34px;
        justify-content: center;
        margin-right: 8px;
        padding: 0 11px;
      }
    }
  }
}
.send {
  background: linear-gradient(#597eff,#6278ff);
  border-radius: 8px;
  bottom: 10px;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  height: 38px;
  line-height: 38px;
  margin-left: 20px;
  position: absolute;
  right: 10px;
  text-align: center;
  transition: all .3s;
  width: 70px;
  z-index: 35;
  &:hover {
    opacity: .9;
  }
}
</style>
