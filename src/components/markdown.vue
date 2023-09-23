<script setup>
import { marked } from 'marked';
import { v4 } from 'uuid'
import {markedHighlight} from "marked-highlight";
import hljs from 'highlight.js';
// import katex from 'katex';
import markedKatex from "marked-katex-extension";
import 'highlight.js/styles/dark.css';

defineProps({
  content: String
})

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

</script>

<template>
  
 <div className="prose w-full max-w-none" v-html="marked.parse(content)"></div>
</template>

<style scoped lang="scss">
 .aa p {
    background-color: transparent;
    color: #43436b;
    line-height: 26px;
    word-break: break-word;
    white-space: pre-wrap;
    display: block;
    margin-block-start: 1em;
    margin-block-end: 1em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
}
</style>
