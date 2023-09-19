<template>
  <div v-show="visible" tabindex="0" class=" fixed top-0 right-0 left-0 z-50 justify-center items-center flex  outline-none"
    >
    <div class="relative pt-8 h-auto">
      <div class="relative bg-white rounded-lg shadow ">
        <div class="py-3 px-6 flex items-center gap-x-2">
          <svg v-if="type === 'success' " xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="fill-green-600 w-6 h-6">
            <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
          </svg>
          <svg v-if="type === 'warning' " xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="fill-red-600 w-6 h-6">
            <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" />
          </svg>

          {{ props.message }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useTimeoutFn } from '@vueuse/core'

const visible = ref(false)

function startTimer() {
  if (props.duration === 0) return
  useTimeoutFn(() => {
    close()
  }, props.duration)
}


const props = defineProps({
  customClass: {
    type: String,
    default: '',
  },
  /**
   * @description whether to center the text
   */
  center: {
    type: Boolean,
    default: false,
  },
  /**
   * @description whether `message` is treated as HTML string
   */
  dangerouslyUseHTMLString: {
    type: Boolean,
    default: false,
  },
  /**
   * @description display duration, millisecond. If set to 0, it will not turn off automatically
   */
  duration: {
    type: Number,
    default: 3000,
  },
  /**
   * @description custom icon component, overrides `type`
   */
  icon: {
    type: [
      String,
      Object,
      Function,
    ],
    default: undefined,
  },
  /**
   * @description message dom id
   */
  id: {
    type: String,
    default: '',
  },
  /**
   * @description message text
   */
  message: {
    type: [
      String,
      Object,
      Function,
    ],
    default: '',
  },
  /**
   * @description callback function when closed with the message instance as the parameter
   */
  onClose: {
    type: Function,
    required: false,
  },
  /**
   * @description whether to show a close button
   */
  showClose: {
    type: Boolean,
    default: false,
  },
  /**
   * @description message type
   */
  type: {
    type: String,
    values: ['success', 'info', 'warning', 'error'],
    default: 'success',
  },
  /**
   * @description set the distance to the top of viewport
   */
  offset: {
    type: Number,
    default: 16,
  },
  /**
   * @description input box size
   */
  zIndex: {
    type: Number,
    default: 10,
  },
  /**
   * @description merge messages with the same content, type of VNode message is not supported
   */
  grouping: {
    type: Boolean,
    default: false,
  },
  /**
   * @description The number of repetitions, similar to badge, is used as the initial number when used with `grouping`
   */
  repeatNum: {
    type: Number,
    default: 1,
  },
});

function close() {
  visible.value = false
  props.onClose()
}
onMounted(() => {
  console.log(props)
  startTimer()
  visible.value = true
});

defineExpose({
  visible,
  // bottom,
  close,
})
</script>
  