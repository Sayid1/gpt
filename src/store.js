import { ref, reactive } from 'vue'
import { createGlobalState } from '@vueuse/core'

export const useGlobalState = createGlobalState(
  () => {
    // 当前输入框输入的消息
    const content = ref('')
    const userInfo = reactive({})

    // 侧边栏激活的对话id
    const activeChatId = ref('')

    // ai正在回答中
    const isGenerating = ref(false)
    const isReanswer = ref(false)
    const manualStop = ref(false)
    const wsClosed = ref(false)

    const showChat = ref(true)
    // 当前的对话消息记录
    const msgRecord = ref([])

    // 手动关闭ws连接
    const close = ref(() => {})
    // 侧边栏激活的tab
    const activeTab = ref('history-chat')
    const url = ref('http://8.129.170.108/api/xfws')
    return { userInfo, content, msgRecord, activeChatId, isGenerating, close, showChat, activeTab, url, isReanswer, manualStop, wsClosed }
  }
)