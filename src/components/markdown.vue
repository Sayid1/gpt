<script setup>
import { marked } from 'marked';

defineProps({
    content: String
})
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
