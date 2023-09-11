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
      <div class="header">
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
      </div>
      <div class="chat_window">
        <div class="out_wrap">
          <div class="chat_content_wrapper">
            <welcome />
          </div>
        </div>
        <div class="ask-window">
          <div class="ask_window__bg"></div>
          <textarea class="" maxlength="7000" placeholder="在此输入您想了解的内容，输入“/”可获取模板，Shift+Enter换行" style="height: 75px;"></textarea>
          <div class="voice_input">
            <span>
              <span class="anticon">
                <svg width="17px" height="26px" viewBox="0 0 17 26" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                  <title>录音</title>
                  <desc>Created with Sketch.</desc>
                  <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                      <g id="多模态" transform="translate(-1172.000000, -721.000000)" fill="currentColor" fill-rule="nonzero">
                          <g id="录音" transform="translate(1172.158074, 721.547072)">
                              <path d="M12,4.33680902 L12,13.6632234 C12,16.0583642 10.2091273,18 8,18 C5.79087269,18 4,16.0583642 4,13.6632234 L4,4.33680902 C4,1.94165553 5.790861,0 8,0 C10.209139,0 12,1.94165553 12,4.33680902 Z M8,1.56000324 C6.58551531,1.56000324 5.43884892,2.80322153 5.43884892,4.33680902 L5.43884892,13.6632234 C5.43884892,15.1968109 6.58551531,16.4400292 8,16.4400292 C9.41448469,16.4400292 10.5611511,15.1968109 10.5611511,13.6632234 L10.5611511,4.33680902 C10.5611511,2.80322153 9.41448469,1.56000324 8,1.56000324 Z" id="形状"></path>
                              <path d="M8.9600729,25 L8.9600729,20.8400246 C12.9633546,20.3486217 15.9807441,16.9079901 16,12.8126237 C16,12.5223171 15.8475797,12.2540424 15.6000421,12.1088753 C15.3525045,11.9637082 15.047512,11.9637082 14.7999744,12.1088753 C14.5524368,12.2540424 14.3999695,12.5223171 14.4000166,12.8126237 C14.3998086,16.4022809 11.5345216,19.3121611 8.00008286,19.3121611 C4.4656441,19.3121611 1.60035708,16.4022809 1.60014915,12.8126237 C1.60014915,12.3638978 1.24198065,12.0001337 0.800157424,12.0001337 C0.358334195,12.0001337 0.000165700734,12.3638978 0.000165700734,12.8126237 C-0.0132298158,17.0578327 3.19355715,20.5979267 7.36008947,20.9375234 L7.36008947,25 L8.9600729,25 Z" id="路径"></path>
                          </g>
                      </g>
                  </g>
              </svg>
              </span>
            </span>
            <div class="upload-div"></div>
          </div>
          <div class="upload_wrapper">
            <span>
              <span class="anticon">
                <svg version="1.1" width="22px" height="22px" viewBox="0 0 22.0 22.0"><defs><clipPath id="UploadIconi0"><path d="M1440,0 L1440,796 L0,796 L0,0 L1440,0 Z"></path></clipPath><clipPath id="UploadIconi1"><path d="M2.14756879,0 C3.33363828,0 4.29513758,0.947396277 4.29513758,2.11606881 C4.29513758,3.28474135 3.33363828,4.23213762 2.14756879,4.23213762 C0.961499298,4.23213762 0,3.28474135 0,2.11606881 C0,0.947396277 0.961499298,0 2.14756879,0 Z"></path></clipPath><clipPath id="UploadIconi2"><path d="M17.8463123,0 C20.0554513,-4.05812251e-16 21.8463123,1.790861 21.8463123,4 L21.8463123,18 C21.8463123,20.209139 20.0554513,22 17.8463123,22 L4,22 C1.790861,22 1.15871992e-15,20.209139 0,18 L0,4 C-2.705415e-16,1.790861 1.790861,4.05812251e-16 4,0 L17.8463123,0 Z"></path></clipPath></defs><g transform="translate(-1177.0 -702.0)"><g clip-path="url(#UploadIconi0)"><g transform="translate(1177.15368768597 702.0)"><g transform="translate(4.854736069784849 4.767862376528228)"><g clip-path="url(#UploadIconi1)"><polygon points="0,0 4.29513758,0 4.29513758,4.23213762 0,4.23213762 0,0" stroke="none" fill="#FDFDFE"></polygon><path d="M2.14756879,4.23213762 C3.33363828,4.23213762 4.29513758,3.28474135 4.29513758,2.11606881 C4.29513758,0.947396277 3.33363828,0 2.14756879,0 C0.961499298,0 0,0.947396277 0,2.11606881 C0,3.28474135 0.961499298,4.23213762 2.14756879,4.23213762 Z" stroke="currentColor" stroke-width="2.6" fill="none" stroke-miterlimit="5"></path></g></g><g clip-path="url(#UploadIconi2)"><path d="M4,0 L17.8463123,0 C20.0554513,-4.05812251e-16 21.8463123,1.790861 21.8463123,4 L21.8463123,18 C21.8463123,20.209139 20.0554513,22 17.8463123,22 L4,22 C1.790861,22 1.15871992e-15,20.209139 0,18 L0,4 C-2.705415e-16,1.790861 1.790861,4.05812251e-16 4,0 Z" stroke="currentColor" stroke-width="3" fill="none" stroke-miterlimit="5"></path></g><g transform="translate(1.8181555495725927 9.0)"><path d="M0,5.98710092 L8.83269629,1.19494218 C10.2188437,0.442891118 11.8785519,0.388868653 13.3106711,1.04918689 L19.0888554,3.71337891 L19.0888554,3.71337891" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></g></g></g></g></svg>
              </span>
            </span>
            <div class="upload-div"></div>
          </div>
          <div class="send">发送</div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
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
  width: 950px;
  .ask_window__bg {
    background: #fff;
    border-radius: 6px;
    bottom: 0;
    left: 0;
    margin: 0 auto;
    max-height: 186px;
    min-height: 98px;
    position: absolute;
    width: 950px;
    z-index: 31;
  }
  @media screen and (max-width: 1300px) {
    .ask_window__bg {
      width: 780px;
    }
  }
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
@media screen and (max-width: 1300px) {
  .ask-window {
    width: 780px;
  }
}
.chat_window {
  background-color: #e4ebf9;
  box-sizing: border-box;
  height: calc(100% - 66px);
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
