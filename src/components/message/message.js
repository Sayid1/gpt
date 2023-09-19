import { createVNode, render, shallowReactive, isVNode } from 'vue'
import { isFunction, isString } from '@vue/shared'
import MessageConstructor from './message.vue'

const isElement = (e) => {
  if (typeof e === 'undefined') return false
  return e instanceof Element
}
let seed = 1

export const instances = shallowReactive([])
export const messageDefaults = {
  customClass: '',
  center: false,
  dangerouslyUseHTMLString: false,
  duration: 3000,
  icon: undefined,
  id: '',
  message: '',
  onClose: undefined,
  showClose: false,
  type: 'success',
  offset: 16,
  zIndex: 0,
  grouping: false,
  repeatNum: 1,
  appendTo: document.body
}

const normalizeOptions = (params) => {
  const options =
    !params || isString(params) || isVNode(params) || isFunction(params)
      ? { message: params }
      : params

  const normalized = {
    ...messageDefaults,
    ...options,
  }

  if (!normalized.appendTo) {
    normalized.appendTo = document.body
  } else if (isString(normalized.appendTo)) {
    let appendTo = document.querySelector(normalized.appendTo)

    // should fallback to default value with a warning
    if (!isElement(appendTo)) {
      console.error(
        'ElMessage',
        'the appendTo option is not an HTMLElement. Falling back to document.body.'
      )
      appendTo = document.body
    }

    normalized.appendTo = appendTo
  }

  return normalized
}

const closeMessage = instance => {
  console.log(instances)
  console.log(instance)
  const idx = instances.indexOf(instance)
  console.log(idx)
  if (idx === -1) return

  instances.splice(idx, 1)
  const { handler } = instance
  handler.close()
}
const createMessage = ({ appendTo, ...options }, context) => {
  const id = `message_${seed++}`
  const userOnClose = options.onClose

  const container = document.createElement('div')

  const props = {
    ...options,
    // now the zIndex will be used inside the message.vue component instead of here.
    // zIndex: nextIndex() + options.zIndex
    id,
    onClose: () => {
      userOnClose?.()
      closeMessage(instance)
    },

    // clean message element preventing mem leak
    onDestroy: () => {
      // since the element is destroy, then the VNode should be collected by GC as well
      // we do not want cause any mem leak because we have returned vm as a reference to users
      // so that we manually set it to false.
      render(null, container)
    },
  }
  console.log(props)
  const vnode = createVNode(
    MessageConstructor,
    props,
    isFunction(props.message) || isVNode(props.message) ?
      {
        default: isFunction(props.message) ?
          props.message :
          () => props.message,
      } :
      null
  )
  vnode.appContext = context || message._context

  render(vnode, container)
  // instances will remove this item when close function gets called. So we do not need to worry about it.
  appendTo.appendChild(container.firstElementChild)

  const vm = vnode.component

  const handler = {
    // instead of calling the onClose function directly, setting this value so that we can have the full lifecycle
    // for out component, so that all closing steps will not be skipped.
    close: () => {
      vm.exposed.visible.value = false
      appendTo.removeChild(vnode.el)

    },
  }

  const instance = {
    id,
    vnode,
    vm,
    handler,
    props: vnode.component.props,
  }

  return instance
}

const message = (options = {}, context) => {

  // if (isNumber(messageConfig.max) && instances.length >= messageConfig.max) {
  //   return { close: () => undefined }
  // }

  const normalized = normalizeOptions(options)

  if (normalized.grouping && instances.length) {
    const instance = instances.find(
      ({ vnode: vm }) => vm.props?.message === normalized.message
    )
    if (instance) {
      instance.props.repeatNum += 1
      instance.props.type = normalized.type
      return instance.handler
    }
  }

  const instance = createMessage(normalized, context)

  instances.push(instance)
  return instance.handler
}
export default message