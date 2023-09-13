import { useStorage, useFetch, useWebSocket } from '@vueuse/core'
import { ref, watch, computed, watchEffect } from 'vue'
import { useGlobalState } from './store'
import dayjs from 'dayjs'

export function genChatId() {
  const id = +new Date() + ''
  store.activeChatId.value = id
  return id
}

const store = useGlobalState()
/**
 * @param { Object } record  {  record: [{ content: strig, role: assistant | user }] | string }
 */
export function useChatCache() {
  const chat = useStorage('history-chat', {}, localStorage)
  function set(id, record) {
    // 对话标题
    if (typeof record === 'string' ) {
      if (!chat.value[id])
        chat.value[id] = { title: record }
    } else {
      if (chat.value[id].chatRecords) {
        if (chat.value[id].chatRecords.length === 6) {
          chat.value[id].chatRecords.splice(0, 2)
        }
        chat.value[id].chatRecords.push(...record)
      } else {
        chat.value[id].chatRecords = record
      }
    }
  }

  function remove(id, length) {
    if (length) {
      chat.value[id].chatRecords.splice(chat.value[id].chatRecords.length - length, length)
      console.log(JSON.stringify(chat.value[id].chatRecords))
    } else {
      chat.value[id] = null
    }
  }
  return { chat, set, remove }
}

const { set, chat } = useChatCache()

export function useSendMsg() {
  const { isFetching, data, error, abort, statusCode, post } = useFetch('http://8.129.170.108/api/xfws', { immediate: false })

  function fetch(id, userInput, reanswer=false) {
    store.isGenerating.value = true
    post().json().execute().then(() => {
      ws(id, data.value.data, userInput, reanswer)
    })
  }
  return { fetch, isFetching, abort, data }
}

const genText = ref('')
const completedText = ref('')
const isCompleted = computed(() => genText.value === completedText.value)
watch(isCompleted, newVal => {
  if (newVal) {
    store.isGenerating.value = false
    store.msgRecord.value.splice(store.msgRecord.value.length - 1, 1, {
      role: 'assistant',
      content: genText.value,
      finished: true
    })
  }
})
watch(genText, newVal => {
  store.msgRecord.value.splice(store.msgRecord.value.length - 1, 1, {
    role: 'assistant',
    content: newVal,
    finished: newVal === completedText.value
  })
})

function ws(id, path, userInput, reanswer) {
  const chatRecords = chat.value[id].chatRecords
  let text = []
  if (chatRecords) {
    text = chatRecords.slice(0, 6)
    if (!reanswer) text.push({ "role": "user", "content":  userInput })
  } else {
    text = [{ "role": "user", "content":  userInput }]
  }
  var textresult = ''
  var completed = 0
  var i = 0
  let timer = []
  const { status, data, send, open, close, ws } = useWebSocket(path, {
    onMessage(w, e) {
      var dd = eval("("+e.data+")");
      textresult += dd.payload.choices.text[0].content;
      for(var j=i; j<textresult.length; j++) {
        var delay = j * 12;
        timer.push(setTimeout(function () {
          i++
          var text = textresult.slice(0, i)
          genText.value = text
          var textOld = textresult.slice(0, i-1)
          if (text === textOld) {
            i--
          }
        }, delay));
      }
    },
    onDisconnected() {
      completed = textresult
      completedText.value = textresult
      const cache = [{ role: 'user',  content: userInput }, { role: 'assistant', content: textresult, finished: true }]
      if (reanswer) {
        cache.splice(0, 1)
      }
      set(id, cache)
    }
  })
  watch(status, () => {
    if (status.value === 'OPEN') {
      var params = {
        "header": { "app_id": "5fcf2c5f", "uid": new Date().getTime() + "" },
        "parameter": { "chat": { "domain": "generalv2", "max_tokens":4096 } },
        "payload": { "message": { "text": text} }
      }
      console.log(JSON.stringify(text))
      send(JSON.stringify(params))
    }
  })
  store.close.value = close
}