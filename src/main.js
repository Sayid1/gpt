import {createApp} from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router'
import { useFetch } from '@vueuse/core'
import {marked} from 'marked';
import Prism from 'prismjs';
import {markedHighlight} from "marked-highlight";
import hljs from 'highlight.js';
import { useGlobalState } from './store'
import './style.css';
import { useHelperCache } from './utils'
// import './prism.css'
import App from './App.vue';
import Home from './components/home.vue'
import Orders from './components/orders.vue'
import Plans from './components/plans.vue'
import ContactUs from './components/contact-us.vue'

const store = useGlobalState()
const urlParams = new URLSearchParams(window.location.search)
let sno = urlParams.get('sno')
const ppt = urlParams.get('ppt')
if (ppt) {
  localStorage.setItem('ppt', ppt)
}
if (sno){
  sno = 'CHAT_'+ sno
  localStorage.setItem('sno', sno)
  // CHATGPT00009999
  const { data, error, isFetching } = await useFetch(`http://8.129.170.108/api/register?account=${sno}&code=${sno}&password=${sno}&type=VISITOR`).post().json()
  store.userInfo.value = data.value.data
}
// const marked = new Marked({
//   mangle: false,
//   headerIds: false,
//   highlight: function (code, lang) {
//     if (Prism.languages[lang]) {
//       console.log(code)
//       return Prism.highlight(code, Prism.languages[lang], lang);
//     } else {
//       return code;
//     }
//   }
// }
  // markedHighlight({
  //   langPrefix: 'hljs language-',
  //   highlight(code, lang) {
  //     const language = hljs.getLanguage(lang) ? lang : 'plaintext';
  //     return hljs.highlight(code, { language }).value;
  //   }
  // })
// )


const routes = [
  { path: '/', component: Home },
  { path: '/contact-us', component: ContactUs },
  { path: '/orders', component: Orders },
  { path: '/plans', component: Plans },
]

const router = createRouter({
  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHashHistory(),
  routes, // `routes: routes` 的缩写
})
const app = createApp (App)
app.use(router)
app.mount ('#app');

app.config.globalProperties.router = router

const { init } = useHelperCache()
init()
