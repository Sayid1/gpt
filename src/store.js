import { ref } from 'vue'
import { createGlobalState } from '@vueuse/core'

export const useGlobalState = createGlobalState(
  () => {
    // 当前输入框输入的消息
    const msg = ref('')

    // 侧边栏激活的对话id
    const activeChatId = ref('')

    // 当前的对话消息记录
    const msgRecord = ref([])
    return { msg, msgRecord, activeChatId }
  }
)