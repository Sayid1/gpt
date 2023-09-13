import {createApp} from 'vue';
import './style.css';
import App from './App.vue';

const app = createApp (App)

app.mount ('#app');

// app.directive('click-outside', {
//   mounted (el, binding, vnode) {
//     el.clickOutsideEvent = event => {
//       if (!(el === event.target || el.contains (event.target))) {
//         vnode.context[binding.expression] (event);
//       }
//     };
//     document.body.addEventListener ('click', el.clickOutsideEvent);
//   },
//   unmounted (el) {
//     document.body.removeEventListener ('click', el.clickOutsideEvent);
//   },
// });
