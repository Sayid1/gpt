import { ref, reactive, computed, watch } from 'vue'
import { createGlobalState } from '@vueuse/core'

export const useGlobalState = createGlobalState(
  () => {
    // 当前输入框输入的消息
    const content = ref('')
    const userInfo = ref(null)

    // 侧边栏激活的对话id
    const activeChatId = ref('')

    // ai正在回答中
    const isGenerating = ref(false)
    const isReanswer = ref(false)
    const manualStop = ref(false)
    const wsClosed = ref(false)
    //支付免费换 ，true 支付  false 免费
    const showMask = ref(true) 

    const showChat = ref(true)
    // 当前的对话消息记录
    const msgRecord = ref([])

    // 登录过期
    const loginExpired = ref(false)

    // 手动关闭ws连接
    const close = ref(() => {})//对话区域字号
    const chatFontSize = ref('inherit')
    // 侧边栏激活的tab
    const activeTab = ref('history-chat')
    const url = ref('http://att.miclink.net/api/xfws')

    const url1 = computed(() => {
      if (userInfo.value.id) {
        if (url.value.indexOf('?assistantId=') >= 0) {
          return url.value + "&token=" + userInfo.value.token
        }
        return url.value + "?token=" + userInfo.value.token
      }
      return url.value 
    })
    return { userInfo, content, msgRecord, activeChatId, isGenerating, close, showChat, activeTab, url, url1, isReanswer, manualStop, wsClosed, showMask, chatFontSize, loginExpired }
  }
)