<template>
  <div class="markdown-renderer" :class="[customClass, { 'fill-container': fillContainer }]">
    <div v-if="loading" class="markdown-loading">
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p>{{ loadingText }}</p>
    </div>
    <div v-else class="markdown-content" :class="contentClass" v-html="renderedContent"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

// 定义组件属性
interface Props {
  content: string
  loading?: boolean
  loadingText?: string
  customClass?: string
  contentClass?: string
  maxHeight?: string
  showScrollbar?: boolean
  fillContainer?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loadingText: '加载中...',
  customClass: '',
  contentClass: '',
  maxHeight: '300px',
  showScrollbar: true,
  fillContainer: false
})

// Markdown配置
const md: MarkdownIt = new MarkdownIt({
  html: true, // 允许HTML标签
  breaks: true, // 自动转换换行
  linkify: true, // 自动识别链接
  typographer: true, // 启用智能引号和符号替换
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
        )
      } catch {}
    }
    return '<pre class="hljs"><code>' + MarkdownIt.prototype.utils.escapeHtml(str) + '</code></pre>'
  },
  // 优化列表渲染
  list: {
    loose: false,
    tight: true
  }
})

// 自定义渲染规则，确保列表项正确缩进
md.renderer.rules.list_item_open = function (tokens, idx, options, env, self) {
  return '<li style="margin-bottom: 6px; padding-left: 4px;">';
}

// 自定义引用渲染规则
md.renderer.rules.blockquote_open = function (tokens, idx, options, env, self) {
  return '<blockquote style="border-left: 4px solid #409eff; padding: 8px 12px; margin: 10px 0; background: #f8f9ff; border-radius: 4px; color: #666;">';
}

// 计算渲染后的内容
const renderedContent = computed(() => {
  return props.content ? md.render(props.content) : ''
})
</script>

<style scoped>
/* Markdown渲染器容器 */
.markdown-renderer {
  width: 100%;
}

/* 充满父容器的样式 */
.markdown-renderer.fill-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  max-height: inherit;
  overflow: hidden;
}

.markdown-renderer.fill-container .markdown-content {
  flex: 1;
  height: 100%;
  max-height: inherit;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}

.markdown-renderer.fill-container .markdown-content::-webkit-scrollbar {
  width: 6px;
}

.markdown-renderer.fill-container .markdown-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.markdown-renderer.fill-container .markdown-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.markdown-renderer.fill-container .markdown-content::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* 加载状态 */
.markdown-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #909399;
}

.loading-dots {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #409eff;
  animation: loading-dot 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loading-dot {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* Markdown内容样式 */
.markdown-content {
  line-height: 1.6;
  color: #333;
  font-size: 14px;
  max-width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.markdown-content.analysis-result {
  max-height: inherit;
  height: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
  flex: 1;
}

.markdown-content.analysis-result::-webkit-scrollbar {
  width: 8px;
}

.markdown-content.analysis-result::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.markdown-content.analysis-result::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.markdown-content.analysis-result::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* 标题样式 */
.markdown-content :deep(h1) {
  color: #303133;
  font-size: 20px;
  font-weight: 700;
  margin: 12px 0 8px 0;
  padding-bottom: 4px;
  border-bottom: 2px solid #409eff;
}

.markdown-content :deep(h2) {
  color: #409eff;
  font-size: 18px;
  font-weight: 600;
  margin: 10px 0 6px 0;
  padding-bottom: 3px;
  border-bottom: 1px solid #ebeef5;
}

.markdown-content :deep(h3) {
  color: #409eff;
  font-size: 16px;
  font-weight: 600;
  margin: 8px 0 5px 0;
  padding-bottom: 2px;
  border-bottom: 1px dotted #ebeef5;
}

.markdown-content :deep(h4) {
  color: #409eff;
  font-size: 15px;
  font-weight: 600;
  margin: 8px 0 4px 0;
}

.markdown-content :deep(h5) {
  color: #409eff;
  font-size: 14px;
  font-weight: 600;
  margin: 6px 0 3px 0;
}

.markdown-content :deep(h6) {
  color: #409eff;
  font-size: 13px;
  font-weight: 600;
  margin: 5px 0 2px 0;
}

/* 段落样式 */
.markdown-content :deep(p) {
  margin-bottom: 6px;
  line-height: 1.4;
}

/* 空段落样式 - 不显示边距 */
.markdown-content :deep(p:empty) {
  margin-bottom: 0;
  height: 0;
  display: none;
}

/* 列表样式 */
.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 8px 0;
  padding-left: 28px;
}

.markdown-content :deep(li) {
  margin-bottom: 6px;
  line-height: 1.6;
  text-align: justify;
}

.markdown-content :deep(ul ul),
.markdown-content :deep(ol ol) {
  margin: 6px 0;
  padding-left: 24px;
}

/* 强调样式 */
.markdown-content :deep(strong) {
  color: #409eff;
  font-weight: 700;
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(mark) {
  background-color: #fff8e1;
  padding: 2px 4px;
  border-radius: 3px;
}

/* 代码样式 */
.markdown-content :deep(code) {
  background: #f1f2f6;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  color: #e83e8c;
  border: 1px solid #e9ecef;
}

.markdown-content :deep(pre) {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
  border: 1px solid #e9ecef;
  font-size: 12px;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
  color: #333;
  border: none;
}

/* 引用样式 */
.markdown-content :deep(blockquote) {
  border-left: 4px solid #409eff;
  padding: 8px 12px;
  margin: 10px 0;
  background: #f8f9ff;
  border-radius: 4px;
  color: #666;
}

.markdown-content :deep(blockquote p) {
  margin-bottom: 6px;
  line-height: 1.6;
}

.markdown-content :deep(blockquote p:last-child) {
  margin-bottom: 0;
}

/* 表格样式 */
.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-radius: 4px;
  overflow: hidden;
}

.markdown-content :deep(thead) {
  background: linear-gradient(135deg, #409eff 0%, #36a3f7 100%);
}

.markdown-content :deep(th) {
  background: linear-gradient(135deg, #409eff 0%, #36a3f7 100%);
  color: white;
  font-weight: 600;
  padding: 8px 6px;
  text-align: left;
  border: none;
}

.markdown-content :deep(td) {
  padding: 6px;
  border-bottom: 1px solid #ebeef5;
  border-right: 1px solid #ebeef5;
}

/* 增强的斑马线效果 */
.markdown-content :deep(tbody tr:nth-child(odd)) {
  background-color: #ffffff;
}

.markdown-content :deep(tbody tr:nth-child(even)) {
  background-color: #e8f4fd;
}

.markdown-content :deep(tbody tr:hover) {
  background-color: #c6e2ff;
}

/* 故障弹窗中的表格样式 */
.markdown-content.fault-alert-markdown :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0;
  font-size: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-radius: 4px;
  overflow: hidden;
}

.markdown-content.fault-alert-markdown :deep(thead) {
  background: linear-gradient(135deg, #d32f2f 0%, #e53935 100%);
}

.markdown-content.fault-alert-markdown :deep(th) {
  background: linear-gradient(135deg, #d32f2f 0%, #e53935 100%);
  color: white;
  font-weight: 600;
  padding: 6px 4px;
  text-align: left;
  border: none;
}

.markdown-content.fault-alert-markdown :deep(td) {
  padding: 4px;
  border-bottom: 1px solid #ebeef5;
  border-right: 1px solid #ebeef5;
}

/* 故障弹窗中的斑马线效果 */
.markdown-content.fault-alert-markdown :deep(tbody tr:nth-child(odd)) {
  background-color: #ffffff;
}

.markdown-content.fault-alert-markdown :deep(tbody tr:nth-child(even)) {
  background-color: #ffcdd2;
}

.markdown-content.fault-alert-markdown :deep(tbody tr:hover) {
  background-color: #ef9a9a;
}

/* 链接样式 */
.markdown-content :deep(a) {
  color: #409eff;
  text-decoration: none;
  border-bottom: 1px dotted #409eff;
}

.markdown-content :deep(a:hover) {
  color: #66b1ff;
  border-bottom: 1px solid #66b1ff;
}

/* 图片样式 */
.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 8px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* 分割线样式 */
.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid #ebeef5;
  margin: 16px 0;
}

/* 复选框样式 */
.markdown-content :deep(input[type='checkbox']) {
  margin-right: 6px;
}

/* 上标样式 */
.markdown-content :deep(sup) {
  font-size: 0.8em;
  vertical-align: super;
}

/* 键盘样式 */
.markdown-content :deep(kbd) {
  background-color: #f7f7f7;
  border: 1px solid #ccc;
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
  color: #333;
  display: inline-block;
  font-size: 0.85em;
  line-height: 1;
  padding: 2px 4px;
  white-space: nowrap;
}
</style>