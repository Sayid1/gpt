<script setup>
import { nextTick, ref } from 'vue'
import { useGlobalState } from '../store'
import { useSendMsg, useChatCache, genChatId } from '../utils'

const commonQuestions = [
  '给老板10个理由帮我升职加薪',
  '不会写活动策划方案，怎么办',
  '请给我的女朋友写一封感人的情书',
  '怎样高效总结我的年度工作，获得老板赞赏',
  '请用一首诗歌赞美秋天',
  '说一个笑话',
]

const store = useGlobalState()
const { set } = useChatCache()
const { fetch, abort, data } = useSendMsg()

function clickQuestion(q) {
  store.manualStop.value = false
  store.isReanswer.value = false
  let id = store.activeChatId.value
  if (!id) id = genChatId()
  
  // 缓存对话的标题
  set(id, q)
  nextTick(() => {
    // 请求对话
    fetch(id, q)
    // 设置当前的对话消息记录
    store.msgRecord.value.push({
      role: 'user',
      content: q
    }, {
      role: 'assistant',
      content: '',
      status: 'loading',
    })
  })
  // 设置侧边栏激活的对话id
  // store.activeChatId.value = id
}
</script>

<template>
  <div>
    <div class="chat_content">
      <img src="../assets/bot.png" class="user_image" alt="">
      <div class="content_welcome_gpt">
        <img src="../assets/welcome-right.png" alt="">
        <p class="hello">您好，我是讯飞星火认知大模型</p>
        <p class="	mt-2.5">能够学习和理解人类的语言，进行多轮对话</p>
        <p class="">回答问题，高效便捷地帮助人们获取信息、知识和灵感</p>
      </div>
    </div>
    <div class="prompt_wrapper">
      <div class="welcome_prompt">
        <div class="flex flex-col gap-y-2  text-[#4257e9]">
          <p class="text-gray-600">您可以在下方的输入框中输入您的问题，如：</p>
          <p class="cursor-pointer" @click="clickQuestion(q)" v-for="q in commonQuestions" :key="q">{{ q }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.prompt_wrapper {
  border-radius: 8px;
  color: #43436b;
  display: flex;
  font-size: 15px;
  height: auto;
  margin: 0 auto;
  min-height: 43px;
  margin-left: 46px;
  .welcome_prompt {
    background: hsla(0,0%,100%,.5);
    border-radius: 8px;
    box-sizing: border-box;
    margin: 0 auto 56px;
    padding: 25px 24px;
    width: 100%;
  }
  // @media screen and (max-width: 1300px) {
  //   .welcome_prompt {
  //     width: 780px;
  //   }
  // }
  .top {
    align-items: center;
    color: #43436b;
    display: flex;
    font-size: 18px;
    justify-content: space-between;
    margin-bottom: 10px;
    & .title > span {
      color: #b7b8cc;
      font-size: 12px;
      margin-left: 16px;
    }
  }
  .change_prompt {
    align-items: center;
    color: #9194bf;
    cursor: pointer;
    display: flex;
    font-size: 16px;
    img {
      height: auto;
      margin-right: 8px;
      width: 18px;
    }
  }
}
.chat_content {
  display: flex;
  font-size: 15px;
  height: auto;
  // left: -22px;
  margin: 0 auto;
  min-height: 43px;
  padding-top: 42px;
  position: relative;
  width: 100%;
  .user_image {
    border-radius: 13px;
    flex-shrink: 0;
    height: 26px;
    margin-right: 20px;
    width: 26px;
  }
  .content_welcome_gpt {
    background: #d0e3ff;
    border-radius: 8px;
    box-sizing: border-box;
    color: #41416d;
    margin-bottom: 56px;
    padding: 25px 38px;
    position: relative;
    width: 100%;
    img {
      height: auto;
      position: absolute;
      right: 0;
      top: 0;
      width: 495px;
    }
    p {
      line-height: 28px;
    }
    .hello {
      font-size: 22px;
      font-weight: 600;
      color: rgb(66, 87, 233);
    }
  }
}
// @media screen and (max-width: 1300px) {
//   .chat_content {
//     position: relative;
//     width: 826px;
//   }
// }
</style>
