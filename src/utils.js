import { useStorage, useFetch, useWebSocket } from '@vueuse/core'
import { ref, watch, reactive, watchEffect } from 'vue'
import { useGlobalState } from './store'

const store = useGlobalState()
/**
 * @param { Object } record  { id: string, record: { msg: strig, type: bot | user } }
 */
export function useChatCache() {
  const chat = useStorage('history-chat', {}, localStorage)
  function set(id, record) {
    if (!chat.value[id]) {
      console.log(chat.value, id)
      console.log('333')
      chat.value[id] = [record]
    } else if (chat.value[id].length === 2) {
      chat.value[id].splice(0, 2, record)
      // chat.value[id][0] = record
    } else if (chat.value[id].length === 1) {
  
      console.log('44')
      chat.value[id].push(record)
    }
  }
  return { chat, set }
  // console.log(val)
}

export function useSendMsg() {
  const { isFetching, data, error, abort, statusCode, post } = useFetch('http://8.129.170.108/api/xfws', { immediate: false })

  function fetch(id, userInput) {
    post().json().execute().then(() => {
      ws(id, data.value.data, [{
        "role": "user",
        "content":  userInput
      }])
    })
  }
  return { fetch, isFetching, abort, data }
}

function ws(id, path, content) {
  const { set } = useChatCache()
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
            type: 'bot',
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
      set(id, {
        type: 'bot',
        msg: textresult
      })
    }
  })
  watch(status, () => {
    if (status.value === 'OPEN') {
      var params = {
        "header": { "app_id": "5fcf2c5f", "uid": new Date().getTime() + "" },
        "parameter": { "chat": { "domain": "generalv2", "max_tokens":4096 } },
        "payload": { "message": { "text": content } }
      }
      send(JSON.stringify(params))

    }
  })

}