import { ref } from 'vue'
import { createGlobalState } from '@vueuse/core'

export const useGlobalState = createGlobalState(
  () => {
    const msg = ref('')
    const msgRecord = ref([])
    return { msg, msgRecord }
  }
)