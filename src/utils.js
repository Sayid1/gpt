import { useStorage, useFetch, useWebSocket } from '@vueuse/core'
import { ref, watch, computed, watchEffect, nextTick } from 'vue'
import { useGlobalState } from './store'
import { marked } from 'marked';
import hljs from 'highlight.js';
import markedKatex from "marked-katex-extension";
import 'highlight.js/styles/dark.css';


marked.use(markedKatex({ throwOnError: false }))
const customRenderer = new marked.Renderer();
customRenderer.code = (code, lang) => {
  const id = +new Date()
  const highlightedCode = lang ? hljs.highlight(lang, code).value : hljs.highlightAuto(code).value;
  return `<pre class="!m-0 !p-0"><div class="bg-black rounded-md mb-4"><div class="flex items-center relative text-gray-200 bg-gray-800 px-4 py-3 text-xs font-sans justify-between rounded-t-md"><span>${lang}</span><button class="flex ml-auto gap-2 copy-code" onclick="copyCode(${id})"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 stroke-2	" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>Copy code</button></div><code class="hljs ${lang}" id="code_${id}">${highlightedCode}</code></div></pre>`;
};
const mathRegex = /\$(.*?)\$/g;
const parser = new DOMParser();
// 重写渲染文本方法以支持数学公式
customRenderer.text = function (text) {
  return text.replace(mathRegex, (match, formula) => {
    const parseHtml = marked.parse(parser.parseFromString(`<!doctype html><body>${match}`, 'text/html').body.textContent)
    const parseHtmlWithoutPTag = /<p>(.*?)<\/p>/.exec(parseHtml)
    if (parseHtmlWithoutPTag[1]) return parseHtmlWithoutPTag[1]
    return parseHtml
  });
};
marked.setOptions({
  renderer: customRenderer,
});

export function parseMarkdown(content) {
  return marked.parse(content)
}
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
const genText = ref('')
const completedText = ref('')
const isCompleted = computed(() => genText.value !== '' && genText.value === completedText.value)

export function useSendMsg() {
  const { isFetching, data, error, abort, statusCode, post } = useFetch(store.url, { immediate: false })

  function fetch(id, userInput, reanswer=false) {
    genText.value = ''
    completedText.value = ''
    store.isGenerating.value = true
    post().json().execute().then(() => {
      ws(id, data.value.data, userInput, reanswer)
    })
  }
  return { fetch, isFetching, abort, data }
}

watch(isCompleted, newVal => {
  if (newVal) {
    store.isGenerating.value = false
    const userInput = store.msgRecord.value[store.msgRecord.value.length - 2].content
    store.msgRecord.value.splice(store.msgRecord.value.length - 1, 1, {
      role: 'assistant',
      content: marked.parse(genText.value),
      rawContent: genText.value,
      isPPT: isPPT(userInput),
      finished: true,
    })
  }
})
watch(genText, newVal => {
  if (newVal) {
    const userInput = store.msgRecord.value[store.msgRecord.value.length - 2].content
    store.msgRecord.value.splice(store.msgRecord.value.length - 1, 1, {
      role: 'assistant',
      content: marked.parse(newVal),
      rawContent: newVal,
      isPPT: isPPT(userInput),
      finished: store.wsClosed.value ? store.wsClosed.value : newVal === completedText.value,
    })
  }
})

export function manualStop() {
  completedText.value = genText.value
  store.wsClosed.value = true
  const userInput = store.msgRecord.value[store.msgRecord.value.length - 2].content
  nextTick(() => {
    store.msgRecord.value.splice(store.msgRecord.value.length - 1, 1, {
      role: 'assistant',
      content: genText.value,
      isPPT: isPPT(userInput),
      finished: true,
      manualStop: true,
    })
  })

  const cache = [{ role: 'user',  content: store.msgRecord.value[store.msgRecord.value.length - 2].content }, { role: 'assistant', content: genText.value, finished: true, manualStop: true, isPPT: isPPT(userInput), }]
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
        // console.log(j, textresult, genText.value ,completedText.value)
        if (genText.value === '' || genText.value !== completedText.value) {
          timer.push(setTimeout(function () {
            i++
            var text1 = textresult.slice(0, i)
            genText.value = text1
            if ((genText.value !== '' && genText.value === completedText.value) || store.wsClosed.value) {
              timer.forEach(t => clearTimeout(t))
            } else {

              console.log(text1)
              // store.msgRecord.value.splice(store.msgRecord.value.length - 1, 1, {
              //   role: 'assistant',
              //   content: marked.parse(text1),
              //   finished: text1 === completedText.value,
              // })
              var textOld = textresult.slice(0, i-1)
              if (text === textOld) {
                i--
              }
            }
          }, delay));
        }
      }
    },
    onDisconnected() {
      if (!store.wsClosed.value) {
        completedText.value = textresult
        const cache = [{ role: 'user',  content: userInput }, { role: 'assistant', content: textresult, finished: true, isPPT: isPPT(userInput) }]
        if (reanswer) {
          cache.splice(0, 1)
        }
        set(id, cache)
      }
    }
  })
  watch(status, () => {
    console.log('status.value', status.value)
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

const arr = [
  {
    title: '市场分析师',
    id: 'c1lza4kp9cto_v1',
    desc: '告诉我行业，我能给出该行业的市场分析报告，比如“新能源汽车”',
  },
  {
    title: '七言绝句作家',
    id: 'dgh7wtvz8gf8_v1',
    desc: '请输入七言绝句的主题，我来写首诗，比如输入“星火”',
  },
  {
    title: '商业文案',
    id: 'h4txtxw8txm7_v1',
    desc: '填写商业领域及受众群体，助手为您设计商业文案，比如“连锁咖啡品牌，面向都市白领人群”',
  },
  {
    title: '小说畅想家',
    id: '42qndzvbtk7c_v1',
    desc: '请您输入小说主题，我将为您写一篇小说，比如“决战紫禁之巅”',
  },
  {
    title: '小红书种草文案助手',
    id: '5vgdcmqrdk1i_v1',
    desc: '告诉我笔记主题，我来帮您写种草文案，比如“滋润养护女士洗发水”',
  },
  {
    title: '文言文大师',
    id: 'ebj4jhx5zyig_v1',
    desc: '请输入一段白话文，我来帮你翻译成文言文，例如“你吃饭了吗”',
  },
  {
    title: '故事对话共创',
    id: '1fz495eaoo3x_v1',
    desc: '你一句，我一句，让我们一起通过对话的方式共创童话吧，比如输入“小王子问，生活的意义是什么”',
  },
  {
    title: '中英互译小助手',
    id: 'zkluu6pb8kg4_v1',
    desc: `中英文互译，我是专业的。比如输入：今天天气如何/what's your name，我会翻译成相对应的英文/中文`,
  },
  {
    title: '景点推荐',
    id: 'euwiw1rxpcms_v1',
    desc: '告诉我您的旅行目的地，我将为您推荐景点，比如“青岛”',
  },
  {
    title: '述职报告小能手',
    id: 'x3zufibpzp9f_v1',
    desc: '请填写您的工作目标、策略和成果概述，小助手会给出供您参考的述职报告，比如“二季度销售额2300W，完成率110%；回款率50%；组织3场客户活动，获取有效商机15个”',
  },
  {
    title: '性格测试助手',
    id: 'q4qoblqkvbi2_v1',
    desc: '根据你的名字，测试性格',
  },
  {
    title: '产品功能设计助手',
    id: '6yr9umrt22i6_v1',
    desc: '提供此款产品的描述和产品需求，我将帮您制定功能设计方案，比如“老年人学习类APP，内容要包含电子产品、常用出行购物软件的使用教学”',
  },
  {
    title: '故事创作助手',
    id: 'kqipio2dldwm_v1',
    desc: '我是童话创作助手，让我们来合作，写一个童话故事吧，比如输入故事开头”小兔子来到了森林里”',
  },
  {
    title: 'OKR助手',
    id: 'ctv5aswr6g3h_v1',
    desc: '输入工作目标概述，高效制定OKR，比如输入“APP下载量突破百万”',
  },
  {
    title: '公司起名大师',
    id: 'b14dbee2lzqj_v1',
    desc: '输入您公司的产品类别，我会为您策划3个富有创意的企业名称，比如“主营运动饮料”',
  },
  {
    title: '职场健身计划',
    id: 'tm1lbvmr91ve_v1',
    desc: '我是一位职场健身教练计划的制定者，我会根据您的工作特性，为您制定健身计划，比如您可以输入：“我经常低头伏案工作”',
  },
  {
    title: '竞品分析报告助手',
    id: 'imbxxw9lxjtc_v1',
    desc: '竞品分析不知如何下手？输入分析主题，助手会给出从哪些角度进行竞品分析的建议，比如“汽车行业”，',
  },
  {
    title: '职场演说家',
    id: 'dxjlgnsgncij_v1',
    desc: '请给我一个主题，我将为您带来一篇能够引起听众共鸣的职场演讲稿，比如“沉淀”',
  },
  {
    title: '自我介绍助手',
    id: 'ps8yz4lj4ais_v1',
    desc: '请输入您的基本信息，我将为您写一个幽默风趣的自我介绍，比如“我今年25岁，性别女，计算机专业硕士，性格开朗活泼，热爱音乐和阅读”',
  },
  {
    title: '工作汇报指导师',
    id: 'gafdpgxztbdk_v1',
    desc: '输入汇报主题，就可获得汇报技巧和建议，比如“公众号运营”',
  },
  {
    title: '商业计划书助手',
    id: 'djm1ry2adf6k_v1',
    desc: '输入商业计划的要求和概述，快速完成一份有条理的商业计划书，比如“关于家庭陪伴机器人的商业计划”',
  },
  {
    title: '通知文案助手',
    id: 'blbxe3ijgl1y_v1',
    desc: '输入关键词，我将帮助您拟一份好用的通知文案，比如“元旦节放假通知”',
  },
  {
    title: '产品需求文档助手',
    id: 'xbdpd246rjwv_v1',
    desc: '告诉我具体需求，就能给出一份清晰明了的产品需求文档，比如“面向个人消费者的智能耳机产品”',
  },
  {
    title: '生产流程设计器',
    id: 'o1x43dwd3uyy_v1',
    desc: '请输入产品名称，我将为您设计相关产品的生产流程，比如“汽车发动机”',
  },
  {
    title: '英文邮件撰写',
    id: 'rcmidj88mun7_v1',
    desc: '请输入你的邮件主题和发送对象，我来帮你写一封英文邮件，比如“Holiday?Notice?Email,?Sent?to?all?Employees?in?the?Department”',
  },
  {
    title: '业务咨询师',
    id: 'qfessbq7luw6_v1',
    desc: '请给出您要分析的业务，我会提供几点分析角度建议，比如“数据异动分析”',
  },
  {
    title: '中文邮件助手',
    id: 'fn5e3xe6sqlp_v1',
    desc: '请输入邮件主题、发送对象、邮件内容概括，我将为您撰写一封工作邮件，比如“向教导主任发送一份学期报告，内容为本学期的一些工作”',
  },
  {
    title: '演示脚本小助手',
    id: '96fknbpbt7m3_v1',
    desc: '请输入演示主题或简要描述，我将为您提供演示脚本灵感，比如您可以输入：“AI技术发展”',
  },
  {
    title: '职场服装搭配师',
    id: 'zh4z6rbazbtj_v1',
    desc: '请输入您需要出席的不同工作场合，我会给到您合适的穿衣建议，比如您可以输入：“面试”',
  },
  {
    title: '域名推荐官',
    id: 'ng8aemupwkl7_v1',
    desc: '请输入所属行业名称，我将以表格形式为您输出10个域名，比如您可以输入：“新能源汽车”',
  },
  {
    title: '中文邀请函助手',
    id: 'xto71mpk4tj8_v1',
    desc: '输入邀请场景，我将为您生成一份邀请函，比如您可以输入：“邀请客户来公司交流沟通”',
  },
  {
    title: '晋升答辩助手',
    id: 'ta3vp3e74k75_v1',
    desc: '请给出您的工作内容描述和晋升职位，我来给您晋升答辩材料大纲，比如，您可以输入“初级产品经理，晋升中级产品经理。主要负责APP产品功能设计”',
  },
  {
    title: '职场欢迎语',
    id: 'vxk5pv5pu7k1_v1',
    desc: '请输入职场欢迎场景，我将为您撰写欢迎语，比如您可以输入：“欢迎客户参观展厅”',
  },
  {
    title: '英文邀请函助手',
    id: 'jsj632hve7zd_v1',
    desc: '请告诉我您要邀请的人物和场景，我来帮您写一份英文邀请函，比如您可以输入：“我想邀请我的数学老师参加我的升学宴”',
  },
  {
    title: '短视频脚本助手',
    id: 'qs8i75hc8bwb_v1',
    desc: '填写短视频主题，我就可以写一份脚本，比如输入“冰淇淋、动物奶油和品质坚果”',
  },
  {
    title: '小红书标题',
    id: 'rt2uvbesivxz_v1',
    desc: '根据主题或笔记原文，助手会您提供3个标题建议，比如输入“抗皱面霜”',
  },
  {
    title: '账号涨粉助手',
    id: '4547p1d2h733_v1',
    desc: '输入您的行业类别，我会给您一些快速涨粉的建议，比如“教育学习”',
  },
  {
    title: '广告语创意达人',
    id: '2h91op4jjn8x_v1',
    desc: '一键创作广告语，比如“护眼屏幕”，我会给出一句有吸引力的广告语',
  },
  {
    title: '活动策划小助手',
    id: 'cnloc139qpuo_v1',
    desc: '给我活动主题，我来帮您策划，比如输入“新店开业”',
  },
  {
    title: 'Slogan创意助手',
    id: 'fhchhwzik5l9_v1',
    desc: '告诉我品牌名称，我将为你创作三句中文Slogan，比如输入“宇宙牌香水”',
  },
  {
    title: '活动复盘报告',
    id: 'zcaflwvq1l19_v1',
    desc: '告诉我您的活动名称，我会帮您输出复盘报告，比如“大学生辩论赛”',
  },
  {
    title: '广告方案助手',
    id: 'r5ble6vutsta_v1',
    desc: '输入产品名称，我将提供一份包含目标受众、口号、推广渠道等内容的广告方案，比如“翻译笔”',
  },
  {
    title: '直播带货话术师',
    id: 'uehfcf93o6hf_v1',
    desc: '填写产品名称或特性，我将为您策划主播带货话术大纲，比如输入“学习机”“学习资源多”',
  },
  {
    title: '品牌方案助手',
    id: 'cxo38p1kcjac_v1',
    desc: '请输入主要的产品信息，我将为你设计合适的品牌方案，比如“产品是运动鞋，主打轻盈、时尚，适合年轻人”',
  },
  {
    title: '信息流广告文案助手',
    id: 'xmd8t8livrti_v1',
    desc: '输入产品和功能，我会根据产品及功能特性创作一篇信息流广告文案，比如“办公本高效办公”',
  },
  {
    title: '情感色彩分析师',
    id: 'f7bw3by9vcre_v1',
    desc: '您告诉我一句话，我将为您分析出这句话的情感倾向，比如“我觉得您要是稍微打扮一下就更漂亮了”',
  },
  {
    title: '小红书账号介绍文案',
    id: '2ygfcs3e5iwa_v1',
    desc: '请输入您的小红书账号类型，我将为您提供小红书风格的账号介绍，比如“美妆博主”',
  },
  {
    title: '新店开业助手',
    id: 'fbtv1x2sqpix_v1',
    desc: '我是您的新店开业小助手，输入新店类型，我会为您策划开业前期的工作，比如“美容店”',
  },
  {
    title: '销冠咨询师',
    id: 'punqdaj9x1tj_v1',
    desc: '作为一名销售员，请输入产品和目标客户，我将为您提供一些销售手段和锁客建议，比如您可以输入：“我想向年轻群体销售奶茶冰淇淋”',
  },
  {
    title: '用户手册宝典',
    id: 't9178ie3ka17_v1',
    desc: '请输入产品名称，我会秉持用户至上的理念，为您编写用户手册，比如您可以输入：“电磁炉”',
  },
  {
    title: '消费者调研问卷助手',
    id: 'nnhc7i22ji8d_v1',
    desc: '请填写调研对象和调研目的，我将为您拟一份面向消费者的调查问卷，比如您可以输入：“我想调查大学生消费者对于外卖饮食的看法”',
  },
  {
    title: '跨界联名营销专家',
    id: 'pxb9efq5ts6n_v1',
    desc: '请输入您要联名的两个品牌，我来为您定制联名营销方案，比如您可以输入：“恰恰和老乡鸡”',
  },
  {
    title: '小红书笔记达人',
    id: 'jsdwsg39mela_v1',
    desc: '我是小红书笔记达人，告诉我您的小红书笔记主题，我来帮您写笔记。输入笔记主题，如：抗皱眼霜',
  },
  {
    title: '评书人',
    id: 'c2l9w8jvn4ej_v1',
    desc: '告诉我书名，我来试试赏析这部作品，例如“红楼梦”',
  },
  {
    title: '影评助手',
    id: '4soviu4juhcx_v1',
    desc: '告诉我你想了解的影视作品，我就会告诉你我的评价，比如“楚门的世界”',
  },
  {
    title: '商品好评神器',
    id: 'xnrydj55kniw_v1',
    desc: '帮你轻松写出商品好评，例如“单反相机”，我会为你生成对应的商品好评',
  },
  {
    title: '探店笔记达人',
    id: 'u4u4uk1x6s73_v1',
    desc: '输入店铺名称或特征，我会为您创作一篇高质量探店笔记，比如“隐藏在巷子里的糕点店”',
  },
  {
    title: '古诗词点评解析',
    id: 'nnpucoa9cg4c_v1',
    desc: '输入作品名，一起赏析古诗，比如“静夜思”',
  },
  {
    title: '餐厅点评小助手',
    id: 'ouw2arjh1cwy_v1',
    desc: '输入餐厅或食物信息，即刻获得小红书风格的点评文案，比如“麻辣鸡丁”',
  },
  {
    title: '数码产品测评专家',
    id: 'eckdsx6nvch2_v1',
    desc: '请您提供该产品的详细信息，包括名称、功能、优势等，我将会为您生成一份相关的产品测评，比如“讯飞录音笔支持快速语音转写，更加方便快捷高效”',
  },
  {
    title: '歌曲评价小助手',
    id: 'jtsp9etzxpgf_v1',
    desc: '告诉我您感兴趣的歌曲，我将为您写一篇歌曲评价，比如输入“让我们荡起双桨”',
  },
  {
    title: '数码评测达人',
    id: 'c1hzsvrmjzwo_v1',
    desc: '输入数码产品的信息，我来帮您完成一篇专业且全面的评测文章，比如“投影仪”',
  },
  {
    title: '店铺点评助手',
    id: '1clqrubgyz6w_v1',
    desc: '请输入店铺或者商品信息，我将会给您一段店铺商品的点评，比如“甜点店铺的奶油蛋糕不腻，十分清爽，令人心情愉悦”',
  },
  {
    title: '诗歌达人',
    id: 'r53etls12jw5_v1',
    desc: '填写诗作主题，为您写一首现代诗歌，例如“孤独的星球”',
  },
  {
    title: '文本摘要创作',
    id: '62pwlf12bv2l_v1',
    desc: '输入文本，我将帮您输出概要，您可以尝试复制一段文本',
  },
  {
    title: '提炼达人',
    id: 'l5uxdkzyxqu4_v1',
    desc: '给我一段文本，我来帮你提炼关键信息，您可以尝试复制一段文本',
  },
  {
    title: '故事续写达人',
    id: '7219xu4rniya_v1',
    desc: '根据你的故事开头，一键创作故事，比如输入“一只小熊猫在森林中觅食”',
  },
  {
    title: '助威大运会',
    id: 'ycyfxdhganby_v1',
    desc: '为大运会加油，为大运会呐喊，成为大运会最靓的崽！输入你的要求，如：用王家卫的风格为大运会加油。我将提供一些可参考的大运会加油宣传语',
  },
  {
    title: '穿越小说写作助手',
    id: 'e6jne2d81g2r_v1',
    desc: '提供穿越小说主题，就能为你创作一份简洁、逻辑清晰的小说大纲，比如“20岁女生穿越到清朝”',
  },
  {
    title: '新闻标题创作家',
    id: 'csmi7fempv5g_v1',
    desc: '输入新闻事件/新闻内容，我会为您提供3个新闻标题，比如“划龙舟比赛”',
  },
  {
    title: '微博文案小助手',
    id: '9afiune9dbx5_v1',
    desc: '只需要关键语句，我就可以写出一篇微博风格的文案，比如“毕业季迎来就业热”',
  },
  {
    title: '演讲大纲',
    id: 'bvehew1pxnmp_v1',
    desc: '我是一位演讲大师，请填写您的演讲需求，如主题、核心内容、演讲时长等，我将为您生成一份演讲大纲，比如“企业运营”',
  },
  {
    title: '关键词提取器',
    id: 'kzp8i555j76k_v1',
    desc: '请您输入一段话，我能为您提取出关键词及权重，比如您可以输入：“今天天气很好，我心情也很好”',
  },
  {
    title: '同义词助手',
    id: '9psjw1qxpop7_v1',
    desc: '请输入成语/词语，我将为您推荐3个同义词，比如您可以输入：“和睦”',
  },
  {
    title: '文章扩写',
    id: 'fzxn7mk3rsfw_v1',
    desc: '我是文章扩写助手，您输入要扩写的内容，我将给您一篇扩写后的文章',
  },
  {
    title: '编程命令行/脚本编写',
    id: 'r75pudmudoxw_v1',
    desc: '我能为你编写任何你想要的命令行或脚本，让你绝对省心，比如“生成表格”',
  },
  {
    title: 'Python代码解释',
    id: '7oca13rmr32q_v1',
    desc: '请输入您需要解释的Python代码，例如“print("hello world")”，我将为您提供解释',
  },
  {
    title: 'Java代码解释',
    id: 'a4ehs3lrhqvw_v1',
    desc: '请输入您需要解释的Java代码，我将快速为这些代码添加注释',
  },
  {
    title: '代码纠错小助手',
    id: 'vag89nf1ovrj_v1',
    desc: '输入你需要检查的代码，我将自动对这些代码进行纠错检查',
  },
  {
    title: '正则小助手',
    id: '565pojc5wobq_v1',
    desc: '根据特定规则，输出正则语法，比如“8位字符串包含大写字母和数字”',
  },
  {
    title: 'CodeNotes（代码注释）',
    id: 'lynyo4u9v7pb_v1',
    desc: '想要为代码注释吗？输入您的代码，我将自动针对这段代码进行注释。',
  },
  {
    title: '代码补全器',
    id: '8a9956prfqhi_v1',
    desc: '为你补全想要的代码，比如输入“在Python中，定义一个函数，接受一个字符串参数，返回该字符串的反转。”',
  },
  {
    title: '计算机术语解释器',
    id: 'i5rjejuehhsw_v1',
    desc: '我是一款帮助人们理解计算机领域专业术语的工具，请输入您想了解的专业词汇，我会对这个词进行解释，比如“带宽”',
  },
  {
    title: '测试用例设计师',
    id: 'fcah5nge4nyu_v1',
    desc: '我可以根据提供的代码，自动化输出与之匹配的测试用例；',
  },{
    title: 'CodeTrans',
    id: 'ha342zbth3d8_v1',
    desc: '我能够将代码从一种语言或格式转换为另一种语言或格式哦，您可以将需要转换语言或格式的代码提供给我',
  },{
    title: 'SQLGenius',
    id: 'vgte655j875e_v1',
    desc: '我能够根据提供的数据库表结构描述信息，自动输出SQL查询语句，比如“查询学生表student(id,?name,?class,?score)中每个班级的平均成绩，并按照平均成绩降序排列。”',
  },{
    title: 'Python代码转换为Java代码',
    id: 'eax1vobjweab_v1',
    desc: '输入需要转换的Python代码，我会将此代码直接转换为Java代码',
  },
];

export const helperList = Object.keys(helperObj).map(key => helperObj[key]);