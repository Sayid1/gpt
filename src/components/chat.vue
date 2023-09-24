<script setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import { useClipboard } from '@vueuse/core'
import message from './message/message.js'
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { v4 } from 'uuid'
import Chart from 'chart.js/auto'
// import { Marked } from 'marked';
import markdown from './markdown.vue'
import { useGlobalState } from '../store'
import Modal from './modal.vue'
import { useSendMsg, useChatCache, helperObj, manualStop } from '../utils'

const { copy } = useClipboard()
// const marked = new Marked(
//   markedHighlight({
//     langPrefix: 'hljs language-',
//     highlight(code, lang) {
//       const language = hljs.getLanguage(lang) ? lang : 'plaintext';
//       return hljs.highlight(code, { language }).value;
//     }
//   })
// );

const id = v4()
const props = defineProps({
  record: Object,
  last: Boolean
})
const store = useGlobalState()
const { remove } = useChatCache()
const { fetch } = useSendMsg()
const chatElRef = ref(null)
const showExcel = ref(false)
const showPPT = ref(false)
const checkChart = ref([])

function checkChat() {
  if (store.isGenerating.value) {
    message({ type: 'warning', message: '对话进行中，请稍后再试'})
    return true
  }
  return false
}

watch(props, () => {
  if (chatElRef.value) {
    chatElRef.value.scrollIntoView({block: "end", inline: "nearest"})
  }
  if (props.record.finished && props.last) {
    nextTick(() => {
      chatElRef.value.scrollIntoView({block: "end", inline: "nearest"})
      const tables = Array.from(document.querySelector(`#markdown_body_${id}`).getElementsByTagName('table'))
      if(tables.length) {
        showExcel.value = true
      }
    })
  }
}, {
  immediate: true,
  deep: true,
})

onMounted(() => {
  nextTick(() => {
    // if (store.activeChatId.value === 'kroow5t8nyx3_v1') {
    //   showPPT.value = true
    // }
    const markdownBody = document.querySelector(`#markdown_body_${id}`)
    if (markdownBody) {
      const tables = Array.from(markdownBody.getElementsByTagName('table'))
      if(tables.length) {
        console.log(tables)
        // document.querySelector(`#markdown_body_${id} .excel`)
        showExcel.value = true
      }
    }
  })
})

function copyToClipboard(content) {
  if (checkChat()) return
  if (navigator.clipboard) {
    copy(content)
  } else {
    const inputDom = document.createElement('textarea');
    inputDom.setAttribute('readonly', 'readonly');
    inputDom.value = content;
    inputDom.style.opacity = 0
    document.body.appendChild(inputDom);
    inputDom.select();
    document.execCommand('copy');
    document.body.removeChild(inputDom);
  }
  message('复制成功')
}

function reanswer() {
  store.isReanswer.value = true
  store.manualStop.value = false
  store.msgRecord.value.splice(store.msgRecord.value.length - 1, 1)
  const id = store.activeChatId.value
  remove(id, 1)

  const userMsg = store.msgRecord.value[store.msgRecord.value.length - 1].content
  // 请求对话
  fetch(id, userMsg, true)

  // 设置当前的对话消息记录
  store.msgRecord.value.push({
    role: 'assistant',
    content: '',
    status: 'loading',
  })
}

function exportExcel() {
  if (checkChat()) return
  var workbook = XLSX.utils.book_new();
  
  const tables = Array.from(document.querySelector(`#markdown_body_${id}`).getElementsByTagName('table'))
  for(var i = 0; i < tables.length; ++i) {
    var worksheet = XLSX.utils.table_to_sheet(tables[i]);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Table" + (i + 1));
  }

  XLSX.writeFileXLSX(workbook, "SheetJSVueAoO.xlsx")
}
const exportWord = () => {
  if (checkChat()) return
  const dom = document.querySelector(`#markdown_body_${id} .prose`)
  const fileName = `word_${new Date().getTime()}.doc`
  if (!dom) {
    return Promise.reject("未获取到元素选择器对应的元素");
  }
  console.log(dom.outerHTML)
  const exportHtml = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>'+fileName+'</title></head><body>'+dom.outerHTML+"</"+"body></html>";

  const url =	"data:application/vnd.ms-word;charset=utf-8," +	encodeURIComponent(exportHtml);
  downloads(url, fileName);

  return Promise.resolve(true);
}
const downloads = (url, fileName) => {
  try {
    let link = document.createElement("a");
    link.style.display = "none";
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    return false;
  }
}
function pptExport(i){
  if (checkChat()) return
  var content= store.msgRecord.value[store.msgRecord.value.length-1].content;
  console.log(content)
  var start = content.indexOf("\n\n```markdown");
  if(content.indexOf("#")!=0){
    if(start!=-1){
      content = content.substr(start+"\n\n```markdown".length+1);
      start = content.indexOf("```\n\n");
      if(start!=-1){
        content = content.substr(0, start);
      }
    }else{
      start = content.indexOf("\n\n```");
      if(start!=-1){
        content = content.substr(start+"\n\n```".length+1);
        start = content.indexOf("```\n\n");
        if(start!=-1){
          content = content.substr(0, start);
        }
      }else{
        
          start = content.indexOf("\n\n#");
          if(start!=-1){
            content = content.substr(start+"\n\n".length);
            start = lastSearch(content,"\n\n");
            if(start!=-1){
              content = content.substr(0, start);
            }
          }
        }
      }
  }			
  // const url =	"https://mindshow.fun/#/home?channel=miclink&markdown="+encodeURIComponent(content);
  // window.open(url,"_blank");		
  const urlParams = new URLSearchParams(window.location.search)
  // const ppt = urlParams.get('ppt')
  let sno = urlParams.get('sno')
  // const url =	"https://mindshow.fun/#/home?channel=miclink&markdown="+encodeURIComponent(content);
  // window.open(url,"_blank");		
  // if(ppt === 'iframe'){ 
    if(!sno){ 
      sno = 'MicLink'; 
    } 
    var tdata = encodeURIComponent(content); 
    var tkey = new Date().getTime(); 
    localStorage.setItem(tkey,tdata)
    const http = window.location.host
    const url = http + "/ppt.html?sno="+sno+"&markdown="+tkey;
    window.open(url,"_blank"); 
  // }else{ 
  //   const url = "https://mindshow.fun/#/home?channel=miclink&markdown="+encodeURIComponent(content); 
  //   window.open(url,"_blank");  
  // }
}

function table2json(table) {
  const labelData = [];
  const legendData = []

  const theadRow = table.querySelector('thead tr');
  const theadCol = table.querySelectorAll('thead th');
  const tbodyRows = table.querySelectorAll('tbody tr');
  const seriData = Array.from(theadCol).slice(1).map(() => [])
  tbodyRows.forEach((row, i) => {
    // if (i === 1) seriData[i] = []
    // 创建一个空对象来存储当前行的数据
    // const rowData = {};
    // 获取当前行的所有单元格
    const cells = row.querySelectorAll('td');
    // 遍历表头行中的每个单元格，使用表头作为属性名
    theadRow.querySelectorAll('th').forEach((header, j) => {
      const headerText = header.textContent;
      const text = cells[j].textContent
      // const numberText = Number(text)
      const num = text.replace(/[^0-9]/g, '')
      const numberText = Number(num)
      if (i === 0) legendData.push(headerText)
      if (j === 0) labelData.push(text)
      else {
        if (isNaN(numberText)) seriData[j - 1][i] = 0;
        else seriData[j - 1][i] = numberText;
      }
    });
  });
  return {
    legendData,
    seriData,
    labelData
  }
}

function getChart(chartType, data) {
  if (chartType === 'bar') return getBarChart(data)
  if (chartType === 'line') return getLinechart(data)
  return getPiechart(data)
}
function getBarChart(data) {
  const canvas = document.createElement('canvas');
  canvas.className = 'hidden removeable'
  canvas.width = 408/2;
  canvas.height = 256/2;
  // canvas.style.display = "none";
  document.body.appendChild(canvas);
  const { legendData, seriData, labelData } = data

  const barChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labelData,
      datasets: seriData.map((data, i) => ({
        data,
        label: legendData[i],
        // borderColor: "#55CC55",
        backgroundColor: '#' + Math.floor(Math.random()*16777215).toString(16),
      }))
    },
    options: {
      animation: false,
      // backgroundColor: "#fff"
    },
  });
  return barChart
}
function getLinechart(data) {
  const canvas = document.createElement('canvas');
  canvas.className = 'hidden removeable'
  canvas.width = 408 / 2;
  canvas.height = 256 /2;
  // canvas.style.display = "none";
  document.body.appendChild(canvas);
  const { legendData, seriData, labelData } = data
  const lineChart = new Chart(canvas, {
    type: "line",
    data: {
      labels: labelData,
      datasets: seriData.map((data, i) => ({
        data,
        label: legendData[i],
        fill: false,
        borderColor: '#' + Math.floor(Math.random()*16777215).toString(16),
        tension: 0.1
      }))
    },
    options: {
      animation: false,
      // backgroundColor: "#fff"
    },
  });
  return lineChart
}
function getPiechart(data) {
  const canvas = document.createElement('canvas');
  canvas.className = 'hidden removeable'
  canvas.width = 200;
  canvas.height = 200;
  // canvas.style.display = "none";
  document.body.appendChild(canvas);
  const { legendData, seriData, labelData } = data
  let data1 = seriData.find(data => data.every(val => val > 0))
  if (!data1) data1 = seriData[0]
  const pieChart = new Chart(canvas, {
    type: "pie",
    data: {
      labels: labelData,
      datasets: [{
        data: data1,
        backgroundColor: data1.map(() => '#' + Math.floor(Math.random()*16777215).toString(16))
      }]
    },
    options: {
      animation: false,
    },
  });
  window.pieChart = pieChart
  return pieChart
}
async function exportChart() {
  if (!checkChart.value.length) {
    message({type: 'warning', message: '请选择图表形式'})
    return
  }
  if (checkChat()) return
  const workbook = new ExcelJS.Workbook();

  const tables = Array.from(document.querySelector(`#markdown_body_${id}`).getElementsByTagName('table'))
  for(var i = 0; i < tables.length; ++i) {
    const data = table2json(tables[i])
    
    const charts = checkChart.value.map(chartType => getChart(chartType, data))

    const worksheet = workbook.addWorksheet('Sheet ' + (i + 1));
    const rows = tables[i].querySelectorAll('tr');
    
    charts.forEach((chart, i) => {
      const chartImage = chart.toBase64Image(({
        pixelRatio: 2, // 导出图片的分辨率比例，默认为1，即图片的分辨率为屏幕分辨率的一倍
        backgroundColor: '#fff' // 导出图片的背景色
      }));
      const image = workbook.addImage({
        base64: chartImage,
        extension: "png"
      });
      worksheet.addImage(image, {
        tl: { col: 1, row: rows.length + 4 + i * 34 },
        ext: { width: chart.width / 2, height: chart.height / 2}
      });
    })

    rows.forEach((row, rowIndex) => {
      const cells = row.querySelectorAll('th, td');
      let columnIndex = 1; // Track the current column index

      cells.forEach((cell) => {
        // Check if the cell has a colspan attribute
        const colspan = parseInt(cell.getAttribute('colspan'), 10) || 1;

        // Check if the cell has a rowspan attribute
        const rowspan = parseInt(cell.getAttribute('rowspan'), 10) || 1;

        // Set the cell value in the Excel worksheet
        worksheet.getCell(rowIndex + 1, columnIndex).value = cell.textContent;

        // Merge cells if necessary
        if (colspan > 1 || rowspan > 1) {
          worksheet.mergeCells(rowIndex + 1, columnIndex, rowIndex + rowspan, columnIndex + colspan - 1);
        }

        // Increment the column index based on colspan
        columnIndex += colspan;
      });
    });
  }
  
  // Create an Excel file (workbook)
  const buffer = await workbook.xlsx.writeBuffer();

  // Save the Excel file or open it for download
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `excel_${new Date().getTime()}.xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);

  document.body.removeChild(a);
  
  const elementsToDelete = document.querySelectorAll('canvas.removeable');
  for (const element of elementsToDelete) {
    element.remove();
  }
  closeModal()
}

const isShowModal = ref(false)
function closeModal() {
  isShowModal.value = false
}
function showModal() {
  isShowModal.value = true
}
</script>

<template>
  <div ref="chatElRef">
    <div class="chat_content">
      <img v-if="props.record.role === 'user'" src="../assets/avatar.png" class="user_image" alt="">
      <img v-else src="../assets/bot.png" class="user_image" alt="">
      <div class="content_welcome_gpt mb-8" v-if="props.record.role === 'user'" v-html="props.record.content " :style="{'font-size': store.chatFontSize.value}">
       
      </div>
      <template v-else-if="props.record.role === 'assistant'">
        <div v-if="props.record.status=== 'loading'" class="mb-10 bg-[rgb(255_255_255_/_57%)] py-[25px] px-[38px] w-full text-gray-400">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <div v-else class="w-full">
          <div :id="'markdown_body_' + id" class="content_welcome_gpt mb-6 bg-[rgb(255_255_255_/_100%)] pt-[25px] pb-[15px] px-[38px]">
            <!-- <div v-html="marked.parse(props.record.content)"></div> -->
            <markdown :content="props.record.content" />
            <div class="flex justify-end mt-6">

              <!-- <div class="re_answer invisible" :class="{ '!visible': props.last && !store.isGenerating.value }" @click="reanswer">
                <span class="mr-1.5"><svg width="18px" height="16px" viewBox="0 0 18 16"><title>刷新</title><desc>Created with Sketch.</desc><g id="页面-1" stroke="none" stroke-width="1" fill-rule="evenodd"><g id="gpt沉浸版" transform="translate(-407.000000, -452.000000)" fill-rule="nonzero"><g id="刷新" transform="translate(407.000000, 452.000000)" fill="currentColor"><path d="M12.8399955,13.3052511 C11.7364403,13.9789482 10.463092,14.3999941 9.18974373,14.3999941 C5.45457554,14.3999941 2.4834362,11.5368308 2.4834362,7.9157928 C2.4834362,6.98946423 2.65320934,6.14737247 3.07767203,5.30526098 L3.16254865,5.894741 C3.24744517,6.23156981 3.67188796,6.40000395 4.01145413,6.31578688 C4.3510203,6.23156981 4.52079344,5.81052393 4.43589692,5.47367538 L3.67188796,3.19999211 C3.58701134,2.8631633 3.16254865,2.69472916 2.82300237,2.77894623 L0.446078967,3.62105772 C0.106512796,3.70525506 -0.0632603415,4.12632067 0.0216361753,4.46314948 C0.106512796,4.79999803 0.530975484,4.96841243 0.870521759,4.8842151 L1.80432376,4.63158362 C1.29498445,5.72630686 0.955418276,6.82104983 0.955418276,8.0842072 C0.955418276,12.4631593 4.60568995,16 9.10484722,16 C10.7177617,16 12.2457796,15.5789344 13.6040045,14.7368426 C13.9435714,14.4842111 14.0284672,14.0631455 13.8586741,13.7263167 C13.6040045,13.2210538 13.1795617,13.0526196 12.8399955,13.3052511 Z M17.9333886,11.7052649 C17.7636155,11.3684164 17.4240493,11.200002 17.084503,11.3684164 L16.3204941,11.7052649 C16.9996065,10.5263049 17.3391727,9.26314751 17.3391727,7.9157928 C17.3391727,3.53684065 13.688901,0 9.18974373,0 C7.49193277,0 5.96391485,0.50526295 4.60568995,1.34737445 C4.26612305,1.60000592 4.18122727,2.0210518 4.3510203,2.35790035 C4.60568995,2.69472916 5.03013275,2.77894623 5.36969892,2.52631475 C6.47325416,1.8526374 7.74660243,1.43157178 9.10484722,1.43157178 C12.8399955,1.43157178 15.8111547,4.29473508 15.8111547,7.9157928 C15.8111547,9.01051603 15.5564851,10.0210419 15.0471458,10.9473705 C15.0471458,10.9473705 15.0471458,11.0315678 14.9622493,11.0315678 L14.7075796,10.3578905 C14.5378065,10.0210419 14.1982403,9.85262753 13.8586741,10.0210419 C13.5191279,10.1894761 13.3493348,10.5263049 13.5191279,10.8631534 L14.45291,13.1368367 C14.6226831,13.4736852 14.9622493,13.6420997 15.3018154,13.4736852 L17.5938423,12.5473567 C17.9333886,12.3789423 18.1031816,12.0420937 17.9333886,11.7052649 L17.9333886,11.7052649 Z" id="形状"></path></g></g></g></svg></span>
                重新回答
              </div> -->

              <div class="flex gap-x-2" v-if="props.record.finished">
                <span class="flex text-xs items-center gap-x-1 cursor-pointer" @click.stop="copyToClipboard(props.record.rawContent)">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" class="w-5 h-5 stroke-[#7e84a3] ">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
                  </svg>
                  复制
                </span>
                <span class="flex text-xs items-center gap-x-1 cursor-pointer text-[#1d93ff]" @click.stop="exportWord">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="w-4 h-4 stroke-[#1d93ff] fill-[#1d93ff]" viewBox="0,0,256,256"><g fill-rule="nonzero" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M28.875,0c-0.01953,0.00781 -0.04297,0.01953 -0.0625,0.03125l-28,5.3125c-0.47656,0.08984 -0.82031,0.51172 -0.8125,1v37.3125c-0.00781,0.48828 0.33594,0.91016 0.8125,1l28,5.3125c0.28906,0.05469 0.58984,-0.01953 0.82031,-0.20703c0.22656,-0.1875 0.36328,-0.46484 0.36719,-0.76172v-5h17c1.09375,0 2,-0.90625 2,-2v-34c0,-1.09375 -0.90625,-2 -2,-2h-17v-5c0.00391,-0.28906 -0.12109,-0.5625 -0.33594,-0.75391c-0.21484,-0.19141 -0.50391,-0.28125 -0.78906,-0.24609zM28,2.1875v4.5c-0.05859,0.19531 -0.05859,0.39844 0,0.59375v35.53125c-0.02734,0.13281 -0.02734,0.27344 0,0.40625v4.59375l-26,-4.96875v-35.6875zM30,8h17v34h-17v-5h14v-2h-14v-6h14v-2h-14v-5h14v-2h-14v-5h14v-2h-14zM4.625,15.65625l3.8125,18.6875h3.75l2.46875,-11.96875c0.11328,-0.55078 0.21875,-1.27344 0.28125,-2.125h0.03125c0.02734,0.77344 0.08984,1.5 0.21875,2.125l2.40625,11.96875h3.625l3.84375,-18.6875h-3.3125l-2,12.46875c-0.11719,0.70313 -0.19141,1.40625 -0.21875,2.09375h-0.03125c-0.06641,-0.87891 -0.13281,-1.53906 -0.21875,-2l-2.375,-12.5625h-3.5l-2.625,12.40625c-0.16797,0.79297 -0.28516,1.51953 -0.3125,2.1875h-0.0625c-0.03906,-0.89453 -0.09766,-1.625 -0.1875,-2.15625l-2.03125,-12.4375z"></path></g></g></svg>
                  Word
                </span>
                <span class="text-xs items-center gap-x-1 hidden cursor-pointer text-[#27c45c]" :class="{'!flex': showExcel}" @click.stop="exportExcel">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="w-4 h-4 stroke-[#27c45c] fill-[#27c45c]" viewBox="0,0,256,256"><g fill-rule="nonzero" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M28.875,0c-0.01953,0.00781 -0.04297,0.01953 -0.0625,0.03125l-28,5.3125c-0.47656,0.08984 -0.82031,0.51172 -0.8125,1v37.3125c-0.00781,0.48828 0.33594,0.91016 0.8125,1l28,5.3125c0.28906,0.05469 0.58984,-0.01953 0.82031,-0.20703c0.22656,-0.1875 0.36328,-0.46484 0.36719,-0.76172v-5h17c1.09375,0 2,-0.90625 2,-2v-34c0,-1.09375 -0.90625,-2 -2,-2h-17v-5c0.00391,-0.28906 -0.12109,-0.5625 -0.33594,-0.75391c-0.21484,-0.19141 -0.50391,-0.28125 -0.78906,-0.24609zM28,2.1875v4.34375c-0.13281,0.27734 -0.13281,0.59766 0,0.875v35.40625c-0.02734,0.13281 -0.02734,0.27344 0,0.40625v4.59375l-26,-4.96875v-35.6875zM30,8h17v34h-17v-5h4v-2h-4v-6h4v-2h-4v-5h4v-2h-4v-5h4v-2h-4zM36,13v2h8v-2zM6.6875,15.6875l5.46875,9.34375l-5.96875,9.34375h5l3.25,-6.03125c0.22656,-0.58203 0.375,-1.02734 0.4375,-1.3125h0.03125c0.12891,0.60938 0.25391,1.02344 0.375,1.25l3.25,6.09375h4.96875l-5.75,-9.4375l5.59375,-9.25h-4.6875l-2.96875,5.53125c-0.28516,0.72266 -0.48828,1.29297 -0.59375,1.65625h-0.03125c-0.16406,-0.60937 -0.35156,-1.15234 -0.5625,-1.59375l-2.6875,-5.59375zM36,20v2h8v-2zM36,27v2h8v-2zM36,35v2h8v-2z"></path></g></g></svg>
                  Excel
                </span>
                <span class="text-xs items-center gap-x-1 cursor-pointer hidden text-[#1dd0f0]" :class="{'!flex': showExcel}"  @click.stop="showModal">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="w-4 h-4 stroke-[#1dd0f0] fill-[#1dd0f0]" viewBox="0,0,256,256"><g fill-rule="nonzero" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M45,2c-1.10547,0 -2,0.89453 -2,2c0,0.29297 0.07422,0.5625 0.1875,0.8125l-8,11.1875c-0.0625,-0.00391 -0.125,0 -0.1875,0c-0.39844,0 -0.78125,0.10938 -1.09375,0.3125l-6.90625,-3.4375c-0.06641,-1.04687 -0.9375,-1.875 -2,-1.875c-1.10547,0 -2,0.89453 -2,2c0,0.10547 0.01563,0.21094 0.03125,0.3125l-7.3125,5.8125c-0.22266,-0.08594 -0.46484,-0.125 -0.71875,-0.125c-1,0 -1.82031,0.73047 -1.96875,1.6875l-6.8125,2.75c-0.33984,-0.26562 -0.75781,-0.4375 -1.21875,-0.4375c-1.10547,0 -2,0.89453 -2,2c0,1.10547 0.89453,2 2,2c1.00781,0 1.83203,-0.74609 1.96875,-1.71875l6.8125,-2.71875c0.33984,0.26563 0.75781,0.4375 1.21875,0.4375c1.10547,0 2,-0.89453 2,-2c0,-0.10547 -0.01562,-0.21094 -0.03125,-0.3125l7.3125,-5.8125c0.22266,0.08594 0.46484,0.125 0.71875,0.125c0.39844,0 0.78125,-0.10937 1.09375,-0.3125l6.90625,3.4375c0.06641,1.04688 0.9375,1.875 2,1.875c1.10547,0 2,-0.89453 2,-2c0,-0.29297 -0.07422,-0.5625 -0.1875,-0.8125l8,-11.1875c0.0625,0.00391 0.125,0 0.1875,0c1.10547,0 2,-0.89453 2,-2c0,-1.10547 -0.89453,-2 -2,-2zM41,15v35h8v-35zM43,17h4v31h-4zM21,24v26h8v-26zM23,26h4v22h-4zM31,29v21h8v-21zM33,31h4v17h-4zM11,32v18h8v-18zM13,34h4v14h-4zM1,36v14h8v-14zM3,38h4v10h-4z"></path></g></g></svg>
                  图表
                </span>
                <span class="text-xs items-center gap-x-1 cursor-pointer hidden text-[#fd613f]" :class="{'!flex': store.activeChatId.value === 'kroow5t8nyx3_v1' || props.record.isPPT}"  @click.stop="pptExport">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="w-4 h-4 stroke-[#fd613f] fill-[#fd613f]" viewBox="0,0,256,256"><g fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(9.84615,9.84615)"><path d="M8,0c-2.19922,0 -4,1.80078 -4,4v7h-3c-0.60156,0 -1,0.5 -1,1v6c0,0.5 0.39844,1 1,1h3v3c0,2.19922 1.80078,4 4,4h12c2.19922,0 4,-1.80078 4,-4v-14c0,-1.10156 -0.98828,-2.11328 -2.6875,-3.8125c-0.30078,-0.19922 -0.51172,-0.48828 -0.8125,-0.6875c-0.19922,-0.30078 -0.48828,-0.51172 -0.6875,-0.8125c-1.69922,-1.69922 -2.71094,-2.6875 -3.8125,-2.6875zM8,2h7.3125c0.69922,0.19922 0.6875,1.10156 0.6875,2v3c0,0.60156 0.39844,1 1,1h3c1,0 2,0 2,1v13c0,1.10156 -0.89844,2 -2,2h-12c-1.10156,0 -2,-0.89844 -2,-2v-3h11c0.60156,0 1,-0.5 1,-1v-6c0,-0.5 -0.39844,-1 -1,-1h-11v-7c0,-1.10156 0.89844,-2 2,-2zM3.8125,12.1875c0.80078,0 1.28906,0.19922 1.6875,0.5c0.39844,0.30078 0.59375,0.8125 0.59375,1.3125c0,0.5 -0.19922,1.01172 -0.5,1.3125c-0.39844,0.39844 -1.08203,0.59375 -1.78125,0.59375h-0.3125v1.78125c0,0.10156 -0.09375,0.125 -0.09375,0.125h-1.3125c-0.10156,0 -0.09375,-0.125 -0.09375,-0.125v-5.28125c0,-0.10156 -0.00781,-0.09375 0.09375,-0.09375c0.39844,-0.10156 1.01953,-0.125 1.71875,-0.125zM8.90625,12.1875c0.80078,0 1.28906,0.19922 1.6875,0.5c0.39844,0.30078 0.59375,0.8125 0.59375,1.3125c0,0.5 -0.19531,1.01172 -0.59375,1.3125c-0.39844,0.39844 -1.08203,0.59375 -1.78125,0.59375h-0.3125v1.78125c0,0.10156 -0.09375,0.125 -0.09375,0.125h-1.21875c-0.10156,0 -0.09375,-0.125 -0.09375,-0.125v-5.28125c0,-0.10156 -0.00781,-0.09375 0.09375,-0.09375c0.39844,-0.10156 1.01953,-0.125 1.71875,-0.125zM12,12.1875h4c0.10156,0 0.09375,0.125 0.09375,0.125v1c0,0.10156 -0.09375,0.09375 -0.09375,0.09375h-1.3125v4.1875c0,0.10156 -0.09375,0.09375 -0.09375,0.09375h-1.1875c-0.10156,0 -0.09375,-0.09375 -0.09375,-0.09375v-4.1875h-1.3125c-0.10156,0 -0.09375,-0.09375 -0.09375,-0.09375v-1c0,-0.10156 0.09375,-0.125 0.09375,-0.125zM3.40625,13.3125v1.375h0.28125c0.60156,0 0.90625,-0.28906 0.90625,-0.6875c0.10156,-0.60156 -0.48047,-0.6875 -0.78125,-0.6875zM8.5,13.3125v1.375h0.3125c0.60156,0 0.875,-0.28906 0.875,-0.6875c0,-0.60156 -0.48047,-0.6875 -0.78125,-0.6875z"></path></g></g></svg>
                  PPT
                </span>
              </div>
            </div>
          </div>
          <!-- <div
            v-if="store.isGenerating.value && props.last"
            class="mb-10 cursor-pointer mt-0.5 bg-[rgb(255_255_255_/_37%)] hover:bg-[rgb(255_255_255_/_57%)] hover:text-gray-900 text-gray-600 flex justify-center gap-x-1 items-center w-32 py-1 rounded-md text-sm"
            @click="stop">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            停止输出
          </div> -->
        </div>
      </template>
      <template v-else>
        <div class="helper_welcome">
          <div class="first" :style="{'font-size': store.chatFontSize.value}">
            <span style="color: rgb(76, 117, 246); font-weight: 600;">您已进入助手模式，当前选择的助手为：{{ helperObj[store.activeChatId.value].title }}</span>
            <br>{{ helperObj[store.activeChatId.value].desc }}<br>
          </div>
        </div>
      </template>
    </div>
    <Modal v-if="isShowModal" @close="closeModal" :overlayer="true">
      <template #header>
        <div class="flex gap-x-2 items-center px-3 py-2 w-96 text-base">
          <span class="font-semibold">请选择你需要生成的图表形式（可多选）：</span>
        </div>
      </template>
      <template #body>
        <div class="pb-6 flex flex-col items-center">
          <div class="flex gap-x-8 px-10 pb-6">
            <div class="flex flex-col gap-y-3 items-center">
              <img src="../assets/pie.jpg" class="w-52 rounded-md" />
              <div class="relative flex gap-x-1.5 items-center">
                <input id="pie" name="pie" value="pie" v-model="checkChart" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
                <label for="pie">饼状图</label>
              </div>
            </div>
            <div class="flex flex-col gap-y-3 items-center">
              <img src="../assets/bar.jpg" class="w-52 rounded-md" />
              <div class="relative flex gap-x-1.5 items-center">
                <input id="bar" name="bar" value="bar" v-model="checkChart" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
                <label for="bar">柱状图</label>
              </div>
            </div>
            <div class="flex flex-col gap-y-3 items-center">
              <img src="../assets/line.jpg" class="w-52 rounded-md" />
              <div class="relative flex gap-x-1.5 items-center">
                <input id="line" name="line" value="line" v-model="checkChart" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
                <label for="line">折线图</label>
              </div>
            </div>
          </div>
          <button @click="exportChart" type="button" class="text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-base px-8 py-2.5 text-center ">
            导出
          </button>
          <div class="flex text-gray-400 mt-2 gap-x-1 items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" class="stroke-gray-400	w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>图表由AI自动生成，内容准确性无法保证</span>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped lang="scss">
.helper_welcome {
  width: 100%;
  .first {
    background: #e2eeff;
    border-radius: 8px;
    box-sizing: border-box;
    letter-spacing: .5px;
    // line-height: 24px;
    margin-bottom: 12px;
    overflow: hidden;
    padding: 20px 28px;
    position: relative;
    width: 100%;
    word-break: break-all;
    .welcome_txt_bg {
      height: 100%;
      pointer-events: none;
      position: absolute;
      right: -2px;
      top: 0;
      width: auto;
    }
  }
}
.re_answer {
  align-items: center;
  color: #9194bf;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-size: 14px;
  position: relative;
  -webkit-user-select: none;
  user-select: none;
  width: 120px;
  pointer-events: all;
  cursor: pointer;
  &:hover {
    color: #6b89ff;

  }
}
.chat_content {
  display: flex;
  font-size: 16px;
  height: auto;
  // left: -22px;
  margin: 0 auto;
  min-height: 43px;
  // padding-top: 22px;
  position: relative;
  width: 100%;
  .user_image {
    border-radius: 13px;
    flex-shrink: 0;
    height: 26px;
    margin-right: 20px;
    width: 26px;
  }
  .content_welcome_gpt {
    // background: #d0e3ff;
    border-radius: 8px;
    box-sizing: border-box;
    color: #41416d;
    // margin-bottom: 56px;
    // padding: 25px 38px;
    position: relative;
    width: 100%;
    img {
      height: auto;
      position: absolute;
      right: 0;
      top: 0;
      width: 495px;
    }
    p {
      line-height: 28px;
    }
    .hello {
      font-size: 22px;
      font-weight: 600;
      color: rgb(66, 87, 233);
    }
  }
}
ol, ul, menu {
  list-style: inherit !important;
}
// * {
//   white-space: break-spaces;
// }
</style>
