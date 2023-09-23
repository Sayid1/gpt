import { useStorage, useFetch, useWebSocket } from '@vueuse/core'
import { ref, watch, computed, watchEffect, nextTick } from 'vue'
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
  function set(id, record, manual=false) {
    // 对话标题
    if (typeof record === 'string' ) {
      if (!chat.value[id]) {
        const orderKeys = Object.keys(chat.value).map(i => Number(i)).filter(i => !isNaN(i)).sort()
        if (orderKeys.length > 19) {
          orderKeys.reverse().forEach((key, i) => {
            if (i > 18) remove(key)
          })
        }
        chat.value[id] = { title: record, manual }
      }
      // 如果是手动创建的会话，第一次聊天的时候修改会话名称
      else if (chat.value[id].manual) {
        chat.value[id].title = record
        chat.value[id].manual = false
      }
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
    } else {
      delete chat.value[id]
    }
  }

  function update(id, title) {
    chat.value[id].title = title
    console.log( chat.value[id], title)
  }
  return { chat, set, update, remove }
}
const isInitHelper = useStorage('helper-init', false, localStorage)
export function useHelperCache() {
  const helper = useStorage('helper-list', [], localStorage)
  function add(id) {
    // 对话标题
    helper.value.push(id)
  }

  function remove(id) {
    const index = helper.value.findIndex(id1 => id1 === id)
    helper.value.splice(index, 1)
  }
  function init() {
    const { set } = useChatCache()
    if (isInitHelper.value) return
    helperList.forEach(helper => {
      add(helper.id)
      set(helper.id, helperObj[helper.id].title)
    })
    isInitHelper.value = true
  }
  return { helper, add, remove, init }
}

const { set, chat } = useChatCache()

export function useSendMsg() {
  const { isFetching, data, error, abort, statusCode, post } = useFetch(store.url, { immediate: false })

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
      finished: true,
    })
  }
})
// watch(genText, newVal => {
//   store.msgRecord.value.splice(store.msgRecord.value.length - 1, 1, {
//     role: 'assistant',
//     content: newVal,
//     finished: newVal === completedText.value,
//   })
// })

export function manualStop() {
  completedText.value = genText.value
  store.wsClosed.value = true
  nextTick(() => {

    store.msgRecord.value.splice(store.msgRecord.value.length - 1, 1, {
      role: 'assistant',
      content: genText.value,
      finished: true,
      manualStop: true,
    })
  })

  const cache = [{ role: 'user',  content: store.msgRecord.value[store.msgRecord.value.length - 2].content }, { role: 'assistant', content: genText.value, finished: true, manualStop: true, }]
  if (store.isReanswer.value) {
    cache.splice(0, 1)
  }
  set(store.activeChatId.value, cache)
}
function isPPT(text) {
  var regex = /(做|生成|写|制作|提供|输出).*?PPT|ppt/ig;
  return regex.test(text);
}
function isTable(text) {
  var regex = /(做|写|建|生成|制|创).*?表/ig;
  return regex.test(text);
}
function ws(id, path, userInput, reanswer) {
  const chatRecords = chat.value[id].chatRecords
  let text = []
  let paramUserInput = userInput
  if (isPPT(userInput)) {
    if (paramUserInput.toLowerCase().indexOf('markdown') === -1) {
      paramUserInput += ",请使用MarkDown格式输出内容"
    }
  } else if (isTable(userInput)) {
    paramUserInput += ",请使用Markdown的表格格式输出内容"
  }
  if (chatRecords) {
    text = chatRecords.filter(record => record.role !== 'welcome_bot').slice(0, 6)
    if (!reanswer) text.push({ "role": "user", "content":  paramUserInput })
  } else {
    text = [{ "role": "user", "content":  paramUserInput }]
  }
  var textresult = ''
  var i = 0
  let timer = []
  const { status, data, send, open, close, ws } = useWebSocket(path, {
    onMessage(w, e) {
      var dd = eval("("+e.data+")");
      textresult += dd.payload.choices.text[0].content;
      for(var j=i; j<textresult.length; j++) {
        var delay = j * 50;
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
      if (!store.wsClosed.value) {
        completedText.value = textresult
        const cache = [{ role: 'user',  content: userInput }, { role: 'assistant', content: textresult, finished: true }]
        if (reanswer) {
          cache.splice(0, 1)
        }
        set(id, cache)
      }
    }
  })
  watch(status, () => {
    if (status.value === 'OPEN') {
      store.wsClosed.value = false
      var params = {
        "header": { "app_id": "5fcf2c5f", "uid": new Date().getTime() + "" },
        "parameter": { "chat": { "domain": "generalv2", "max_tokens":4096 } },
        "payload": { "message": { "text": text} }
      }
      send(JSON.stringify(params))
    }
  })
  store.close.value = close
}

export const helperObj = {
  "kroow5t8nyx3_v1": {
    id: "kroow5t8nyx3_v1",
    title: "PPT生成大师",
    desc: "请填写您PPT的核心内容，助手会提供PPT大纲，并生成PPT",
    welcome: '请填写您PPT的核心内容，助手会提供PPT大纲，比如“Q2门店销售情况复盘”',
    badge: 'P',
    hot: true,
    badgeBg: 'rgb(244, 205, 88)',
  },
  // "2x": {
  //   id: "2x",
  //   title: "思维导图生成助手",
  //   desc: "思维导图牛成助手，让您的恩考更加高效、粘准",
  //   welcome: '输入你的需求，星火大模型会将其拆解为一级、二级分支。 将其复制到wps思维导图中即可一键生成分支。',
  //   badge: '思',
  //   hot: false,
  //   badgeBg: 'rgb(148, 61, 212)',
  // },
  // "3x": {
  //   id: "3x",
  //   title: "Word转PPT",
  //   desc: "请上传word文档，助手将会帮你转话为PPT",
  //   welcome: '请上传word文档，助手将会帮你转话为PPT',
  //   badge: 'W',
  //   hot: false,
  //   badgeBg: 'rgb(65, 104, 243)',
  // },
  "61l7lnzu9kot_v1": {
    id: "61l7lnzu9kot_v1",
    title: "写作助理",
    desc: "请说出您要创作的文章类型，以及文章的要求",
    welcome: '你好，我是你的写作助理，请提供文本内容，我可以帮你进行润色。',
    badge: '写',
    hot: false,
    badgeBg: 'rgb(230, 125, 59)',
  },
  "1ajruc2aglo3_v1": {
    id: "1ajruc2aglo3_v1",
    title: "演讲稿助理",
    desc: "请给我一个主题，我可以帮助你写一篇适合的演讲稿",
    welcome: '请给我一个主题，我将为您带来一篇能够引起听众共鸣的职场演讲稿，比如“沉淀”',
    badge: '演',
    hot: false,
    badgeBg: 'rgb(139 ,196, 60)',
  },
  "og8n92sxc6jd_v1": {
    id: "og8n92sxc6jd_v1",
    title: "周报小助理",
    desc: "请直接输入周报的提示内容或关键词，小助理会帮您润色周报",
    welcome: '请直接输入本周工作概要，小助理会帮您润色周报，比如输入“用户激励活动上线，用户活跃率提升15%”',
    badge: '周',
    hot: false,
    badgeBg: 'rgb(93, 195, 207)',
  },
  "dvpd3ds7xkeh_v1": {
    id: "dvpd3ds7xkeh_v1",
    title: "标题小达人",
    desc: "输入你想起标题的文本，即可输出5个文章标题",
    welcome: '输入你想起标题的文本，即可输出5个文章标题',
    badge: '标',
    hot: false,
    badgeBg: 'rgb(216, 146, 61)',
  },
  "3hkeq3n9bkr1_v1": {
    id: "3hkeq3n9bkr1_v1",
    title: "SWOT分析",
    desc: "请填写事件描述，助手会根据事件作出SWOT分析",
    welcome: '请填写事件描述，助手会根据事件做出SWOT分析，比如“翻译机新产品发布”',
    badge: 'S',
    hot: false,
    badgeBg: 'rgb(61, 80, 172)',
  },
  "vwck6olu9h8q_v1": {
    id: "vwck6olu9h8q_v1",
    title: "稿件校队员",
    desc: "输入稿件内容，我能找出错别字和语法错误哦",
    welcome: '输入稿件内容，我能找出错别字和语法错误，您可以尝试复制一段文本',
    badge: '稿',
    hot: false,
    badgeBg: 'rgb(128, 127, 38)',
  },
  "ojkwj3un8omc_v1": {
    id: "ojkwj3un8omc_v1",
    title: "课程设计",
    desc: "请输入授课的主题或主要内容，助手会为你定制一份课程设计",
    welcome: '写出你的课程名称，帮你设计大概念教学计划',
    badge: '课',
    hot: false,
    badgeBg: 'rgb(46, 113, 160)',
  },
  "g5wrtd2jx1s1_v1": {
    id: "g5wrtd2jx1s1_v1",
    title: "代码魔术师",
    desc: "根据要求写出代码",
    welcome: '我将根据您的要求写出示例代码，您可以尝试这样问我：“开发一款消消乐小游戏界面，用python语言”',
    badge: '代',
    hot: false,
    badgeBg: 'rgb(103, 199, 249)',
  },
  "lohuy8eicunq_v1": {
    id: "lohuy8eicunq_v1",
    title: "朋友圈创作助手",
    desc: "告诉我你想写的内容关键词，如：夏天最爱的就是冰淇淋",
    welcome: '告诉你想写的内容关键词，如：夏天最爱的就是冰淇淋',
    badge: '朋',
    hot: false,
    badgeBg: 'rgb(74, 155, 88)',
  }
}


export const helperList = Object.keys(helperObj).map(key => helperObj[key]);