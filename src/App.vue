<script setup>
import welcome from './components/welcome-window/index.vue'
import { ref } from 'vue'
const sidebarCollapse = ref(false)
const showUserWindow = ref(false)
const activeTab = ref('history-chat')

</script>

<template>
  <div class="root">
    <div class="sidebar" :class="{'sidebar__collapse': sidebarCollapse }">
      <div v-show="!sidebarCollapse">
        <div class="logo">
          <img src="./assets/logo.png" alt="">
        </div>
        <div class="actions-btn" v-show="!sidebarCollapse">
          <div class="btn help-center">
            <img src="./assets/spark-bot-logo.svg" alt="">&nbsp;助手中心
          </div>
          <div class="btn new-chat">
            <span>+</span>&nbsp;新建对话
          </div>
        </div>
        <div class="tabs" v-show="!sidebarCollapse">
          <div :class="{active: activeTab === 'history-chat'}" @click="activeTab='history-chat'">历史对话</div>
          <div :class="{active: activeTab !== 'history-chat'}" @click="activeTab='bot-list'">助手列表</div>
        </div>
        <div class="chat-list" v-show="!sidebarCollapse"></div>
      </div>

      <div v-show="sidebarCollapse">
        <img src="./assets/logo.svg" class="mt-[16px] mb-10  mx-auto w-5" alt="">
        <div class="box !mb-5">
          <img src="./assets/add.svg" alt="">
        </div>
        <div class="box">
          <img src="./assets/bot.svg" alt="">
        </div>
      </div>
    </div>
    <div class="stretch_box" :class="{'stretch_box__collapse': sidebarCollapse }" @click="sidebarCollapse=!sidebarCollapse">
      <img v-show="!sidebarCollapse" src="./assets/open.svg" alt="">
      <img v-show="sidebarCollapse" src="./assets/close.svg" alt="">
    </div>
    <main :class="{'main__collapse': sidebarCollapse}">
      <!-- <div class="header">
        <div class="items-center flex text-[#616b97]">
          <img src="./assets/header_logo.svg" class="h-[23px] bg-[length:177px_29px]" alt="">
        </div>
        <div class="control_btn_wrap justify-end h-full flex text-[#d0d7e8] items-center">
          <div class="version text-[#616b97] text-sm mr-2.5">通用版</div>
          <div class="user_img items-center flex h-full justify-center mr-1 w-12" @mouseover="showUserWindow=true" @mouseleave="showUserWindow = false">
            <img src="./assets/avatar.png" class="w-[26px] h-[26px] rounded-full" alt="">
          </div>
        </div>
        <div class="userinfo_window" v-show="showUserWindow" @mouseover="showUserWindow=true" @mouseleave="showUserWindow = false">
          <div class="user_info_item username">185xxxx5945</div>
          <div class="user_info_item">个人资料</div>
          <div class="user_info_item">修改密码</div>
          <div class="user_info_item">退出登录</div>
        </div>
      </div> -->
      <div class="chat_window">
        <div class="out_wrap">
          <div class="chat_content_wrapper">
            <welcome />
          </div>
        </div>
        <div class="ask-window">
          <div class="ask_window__bg"></div>
          <textarea class="" maxlength="7000" placeholder="在此输入您想了解的内容，输入“/”可获取模板，Shift+Enter换行" style="height: 75px;"></textarea>
          <div class="send">发送</div>
        </div>
        <div class="tip">
          <p>所有内容均由人工智能模型输出，其内容的准确性和完整性无法保证，不代表我们的态度或观点。</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.tip {
  color: #9197c1;
  font-size: 12px;
  margin-top: 12px;
  text-align: center;
  width: 100%;
}
.voice_input {
  align-items: center;
  bottom: 10px;
  cursor: pointer;
  display: flex;
  height: 38px;
  overflow: hidden;
  position: absolute;
  right: 94px;
  z-index: 95;
  & > span {
    color: #9194bf;
    position: relative;
    top: 2px;
    transform: scaleY(1.1);
    visibility: visible;
    &:hover>span {
      color: #5a7dff;
    }
  }
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
    pointer-events: none;
  }
}
.upload_wrapper {
  align-items: center;
  bottom: 10px;
  cursor: pointer;
  display: flex;
  height: 38px;
  overflow: hidden;
  position: absolute;
  right: 128px;
  z-index: 95;
  & > span {
    color: #9194bf;
    position: relative;
    top: 2px;
    transform: scaleY(1.1);
    visibility: visible;
    &:hover>span {
      color: #5a7dff;
    }
  }
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
    pointer-events: none;
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
.ask-window {
  border-radius: 6px;
  height: 95px;
  margin: 0 auto;
  position: relative;
  width: 95%;
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
// @media screen and (max-width: 1300px) {
//   .ask-window {
//     width: 780px;
//   }
// }
.chat_window {
  background-color: #e4ebf9;
  box-sizing: border-box;
  height: 100%;
  position: relative;
  width: 100%;
  z-index: 1;
  .out_wrap {
    display: flex;
    flex-direction: column;
    height: calc(100% - 150px);
    margin: 0 auto;
    overflow-y: auto;
    position: relative;
    scrollbar-color: rgba(7,18,59,.14) transparent;
    scrollbar-width: none;
    width: 100%;
    overflow-y: auto;
    .chat_content_wrapper {
      display: flex;
      flex-direction: column-reverse;
      height: auto;
      padding-top: 26px;
      scroll-behavior: smooth;
      scrollbar-color: rgba(7,18,59,.14) transparent;
      scrollbar-width: none;
      padding-top: 0;
    }
  }
}
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
.header {
  align-items: center;
  background-color: #f2f5ff;
  flex-wrap: nowrap;
  height: 64px;
  padding-left: 40px;
  padding-right: 10px;
  position: relative;
  width: 100%;
  z-index: 70;
  display: flex;
  justify-content: space-between;
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
  z-index: 76;
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
  justify-content: space-between;
  padding: 0 34px;
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
    background: hsla(0,0%,100%,.16);
    border: 1px solid hsla(0,0%,100%,.46);
    border-radius: 5px;
    color: #fff;
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
      background: hsla(0,0%,100%,.3);
      border: 1px solid hsla(0,0%,100%,.46);
    }
    span {
      font-size: 20px;
      margin-top: -4px;
    }
  }
}
.root {
  background: linear-gradient(#f2f5ff,#f2f5ff 49%,#e4ebf9 50%);
  display: flex;
  height: 100vh;
  min-width: 1200px;
  overflow: hidden;
  position: relative;
  width: 100vw;
}
.sidebar {
  background: linear-gradient(135deg,#7958ff,#00caff);
  border-radius: 0 20px 20px 0;
  box-shadow: 4px 0 16px 0 rgba(113,155,255,.58);
  height: 100%;
  left: 0;
  overflow: hidden;
  position: absolute;
  top: 0;
  transition: width .3s;
  width: 266px;
  z-index: 75;
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
