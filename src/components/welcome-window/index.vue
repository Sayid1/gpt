<script setup>
import { ref } from 'vue'

defineProps({
  msg: String,
})

const count = ref(0)
</script>

<template>
  <div>
    <div class="chat_content">
      <img src="../../assets/bot.png" class="user_image" alt="">
      <div class="content_welcome_gpt">
        <img src="../../assets/welcome-right.png" alt="">
        <p class="hello">您好，我是讯飞星火认知大模型</p>
        <p class="text-sm	mt-2.5">能够学习和理解人类的语言，进行多轮对话</p>
        <p class="text-sm">回答问题，高效便捷地帮助人们获取信息、知识和灵感</p>
      </div>
    </div>
    <div class="prompt_wrapper">
      <div class="welcome_prompt">
        <div class="top">
          <div class="title">推荐助手 <span>使用星火助手，场景任务一键搞定</span></div>
          <div class="change_prompt"><img src="../../assets/change.png" alt="">换一批</div>
        </div>
        <div class="card_wrapper">
          
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
  .welcome_prompt {
    background: hsla(0,0%,100%,.5);
    border-radius: 8px;
    box-sizing: border-box;
    margin: 0 auto 56px;
    padding: 25px 24px;
    width: 950px;
  }
  @media screen and (max-width: 1300px) {
    .welcome_prompt {
      width: 780px;
    }
  }
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
  left: -22px;
  margin: 0 auto;
  min-height: 43px;
  padding-top: 42px;
  position: relative;
  width: 996px;
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
    width: 950px;
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
@media screen and (max-width: 1300px) {
  .chat_content {
    position: relative;
    width: 826px;
  }
}
</style>
