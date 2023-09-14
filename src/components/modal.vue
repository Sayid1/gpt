<template>
  <Teleport to="body">
    <div
      v-if="overlayer"
      class="bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40"
    />
    <div
      tabindex="0"
      ref="modalRef"
      class=" fixed top-0 right-0 left-0 z-50 justify-center items-center flex  outline-none"
      @keyup.esc="closeWithEsc"
      @click.self="clickOutside"
    >
      <div class="relative p-4 h-auto">
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <!-- Modal header -->
          <div
            v-if="$slots.header"
            class="p-4 rounded-t flex justify-between items-center"
            :class="
              $slots.header
                ? 'border-b border-gray-200 dark:border-gray-600'
                : ''
            "
          >
            <slot name="header" />
            <button
              @click="closeModal"
              aria-label="close"
              type="button"
              class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <slot name="close-icon">
                <svg
                  class="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </slot>
            </button>
          </div>
          <!-- Modal body -->
          <div
            class="py-6"
            :class="{
              // $slots.header ? '' : 'pt-0'
              'pt-0': !$slots.header,
              'pb-0': !$slots.footer,
            }"
          >
            <slot name="body" />
          </div>
          <!-- Modal footer -->
          <div v-if="$slots.footer" class="pb-6 pr-6 rounded-b">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
<script setup>
import { onMounted, ref } from "vue";

// interface ModalProps {
//   size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl',
//   escapable?: boolean,
//   persistent?: boolean
// }
const props = defineProps({
  escapable: {
    type: Boolean,
    default: true
  },
  persistent: {
    type: Boolean,
    default: false
  },
  overlayer: {
    type: Boolean,
    default: true
  },
});

const emit = defineEmits(["close", "click:outside"]);

function closeModal() {
  emit("close");
}
function clickOutside() {
  if (!props.persistent) {
    emit("click:outside");
    closeModal();
  }
}

function closeWithEsc() {
  if (props.escapable && !props.persistent) closeModal();
}
const modalRef = ref(null);
onMounted(() => {
  if (modalRef.value) {
    modalRef.value.focus();
  }
});
</script>
