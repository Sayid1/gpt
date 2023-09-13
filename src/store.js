import { ref } from 'vue'
import { createGlobalState } from '@vueuse/core'

export const useGlobalState = createGlobalState(
  () => {
    // 当前输入框输入的消息
    const content = ref('')

    // 侧边栏激活的对话id
    const activeChatId = ref('')

    // ai正在回答中
    const isGenerating = ref(false)
    // 当前的对话消息记录
    const msgRecord = ref([])

    // 关闭ws连接
    const close = ref(() => {})
    return { content, msgRecord, activeChatId, isGenerating, close }
  }
)