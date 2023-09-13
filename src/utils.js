import { useStorage, useFetch, useWebSocket } from '@vueuse/core'
import { ref, watch, reactive, watchEffect } from 'vue'
import { useGlobalState } from './store'

export function genChatId() {
  const id = +new Date() + ''
  store.activeChatId.value = id
  return id
}

const store = useGlobalState()
/**
 * @param { Object } record  {  record: [{ msg: strig, type: assistant | user }] | string }
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
  return { chat, set }
}

const { set, chat } = useChatCache()

export function useSendMsg() {
  const { isFetching, data, error, abort, statusCode, post } = useFetch('http://8.129.170.108/api/xfws', { immediate: false })

  function fetch(id, userInput) {
    post().json().execute().then(() => {
      ws(id, data.value.data, userInput)
    })
  }
  return { fetch, isFetching, abort, data }
}

function ws(id, path, userInput) {

  const chatRecords = chat.value[id].chatRecords
  let text = []
  if (chatRecords) {
    text = chatRecords.slice(0, 6)
    text.push({ "role": "user", "content":  userInput })
    // text = content.splice(content.length - 1, 1)
  } else {
    text = [{ "role": "user", "content":  userInput }]
  }
  console.log(JSON.stringify(text))
  
  var textresult = ''
  let flag = true
  var i = 0
  var completed = 0
  let timer = []
  const { status, data, send, open, close, ws } = useWebSocket(path, {
    onMessage(w, e) {
      var dd = eval("("+e.data+")");
      textresult += dd.payload.choices.text[0].content;
      for(var j=i; j<textresult.length; j++) {
        var delay = j * 12;
        timer.push(setTimeout(function () {
          flag = false;
          i++
          var text = textresult.slice(0, i)
      //     var mark = marked.parse(text);
          store.msgRecord.value.splice(store.msgRecord.value.length - 1, 1, {
            type: 'assistant',
            msg: text
          })
          var textOld = textresult.slice(0, i-1)
          if (text === textOld&&!completed) {
            i--
          }
          if (i < textresult.length) {
            flag = false;
          } else if (completed){
            flag = true
            console.log('first')
          }
          console.log(text)
      //     if (body.length % 2 != 0) {
      //       body.push({
      //         role: 'assistant',
      //         content: text
      //       }) 
      //     } else {
      //       body[body.length-1] = {
      //         role: 'assistant',
      //         content: text
      //       }
      //     }
      //     handleResponse(mark, flag);
        }, delay));
      }
    },
    onDisconnected() {
      completed = textresult
      set(id, [{
        type: 'user',
        msg: userInput
      }, {
        type: 'assistant',
        msg: textresult
      }])
    }
  })
  watch(status, () => {
    if (status.value === 'OPEN') {
      var params = {
        "header": { "app_id": "5fcf2c5f", "uid": new Date().getTime() + "" },
        "parameter": { "chat": { "domain": "generalv2", "max_tokens":4096 } },
        "payload": { "message": { "text": text} }
      }
      send(JSON.stringify(params))

    }
  })

}