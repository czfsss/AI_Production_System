<template>
  <div class="markdown-test">
    <h2>Markdown 渲染测试</h2>
    
    <div class="test-container">
      <div class="test-content">
        <h3>测试内容区域 (固定宽度)</h3>
        <div class="markdown-content analysis-result" v-html="md.render(testMarkdown)"></div>
      </div>
      
      <div class="side-panel">
        <h3>侧边栏</h3>
        <p>这里是侧边栏内容，用来测试布局是否会被撑开。</p>
        <p>左侧内容再长也不应该影响这里的宽度。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

// Markdown配置
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true,
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>'
      } catch {}
    }
    return '<pre class="hljs"><code>' + MarkdownIt.prototype.utils.escapeHtml(str) + '</code></pre>'
  }
})

const testMarkdown = `
# 设备故障分析报告

## 基本信息
- **设备型号**: 卷接机-1号
- **故障名称**: SE跑条
- **发生时间**: 2024-01-15 14:30:25
- **班次**: 甲班

## 故障现象描述

设备在运行过程中出现 **SE跑条** 故障，具体表现为：

1. 烟条在传输过程中偏离正常轨道
2. 设备自动停机保护
3. 报警指示灯亮起

> **重要提示**: 此故障可能影响产品质量，需要立即处理。

## 可能原因分析

### 机械方面
- [ ] 导轮磨损或松动
- [ ] 传输带张紧度不当  
- [ ] 轴承润滑不足
- [x] 导向装置位置偏移

### 电气方面
- [ ] 传感器故障
- [ ] 控制系统程序异常
- [ ] 电机转速不稳定

## 处理步骤

### 第一步：安全检查
```bash
# 确保设备完全停机
sudo systemctl stop equipment
# 检查安全装置
check_safety_devices.sh
```

### 第二步：机械检查
1. **检查导轮**: 观察导轮是否有明显磨损
2. **调整导向装置**: 使用专用工具调整导向装置位置
3. **检查传输带**: 确认传输带张紧度是否合适

### 第三步：测试运行
运行测试程序验证故障是否解决：

\`\`\`python
def test_equipment():
    """设备测试函数"""
    equipment.start_test_mode()
    
    for i in range(10):
        result = equipment.run_cycle()
        if result.status != "OK":
            return False
    
    return True
\`\`\`

## 数据记录

| 参数 | 故障前 | 故障后 | 标准值 |
|------|--------|--------|--------|
| 转速 | 1200rpm | 0rpm | 1150-1250rpm |
| 温度 | 65°C | 63°C | 60-70°C |
| 压力 | 1.8MPa | 1.7MPa | 1.5-2.0MPa |

## 预防措施

为避免类似故障再次发生，建议：

1. **定期维护**
   - 每周检查导轮磨损情况
   - 每月校准导向装置位置
   - 每季度更换润滑油

2. **监控优化**
   - 增加关键部位的监控传感器
   - 完善预警系统
   - 建立故障预测模型

## 相关文档

- [设备维护手册](./maintenance_manual.pdf)
- [故障排除指南](./troubleshooting_guide.pdf)
- [安全操作规程](./safety_procedures.pdf)

---

**报告生成时间**: 2024-01-15 15:45:30  
**分析人员**: AI智能分析系统  
**审核状态**: ✅ 已审核
`

</script>

<style scoped>
.markdown-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-container {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.test-content {
  flex: 2;
  min-width: 0; /* 防止flex容器被撑开 */
}

.side-panel {
  flex: 1;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  min-width: 250px;
  max-width: 300px;
}

/* 复用主项目的markdown样式 */
.markdown-content {
  line-height: 1.8;
  color: #333;
  font-size: 14px;
  max-width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

.markdown-content.analysis-result {
  max-height: 400px;
  overflow-y: auto;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}

.markdown-content.analysis-result::-webkit-scrollbar {
  width: 6px;
}

.markdown-content.analysis-result::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.markdown-content.analysis-result::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

/* 标题样式 */
.markdown-content :deep(h1) {
  color: #303133;
  font-size: 20px;
  font-weight: 700;
  margin: 16px 0 12px 0;
  padding-bottom: 6px;
  border-bottom: 2px solid #409eff;
}

.markdown-content :deep(h2) {
  color: #409eff;
  font-size: 18px;
  font-weight: 600;
  margin: 14px 0 10px 0;
  padding-bottom: 4px;
  border-bottom: 1px solid #ebeef5;
}

.markdown-content :deep(h3) {
  color: #409eff;
  font-size: 16px;
  font-weight: 600;
  margin: 12px 0 8px 0;
  padding-bottom: 2px;
  border-bottom: 1px dotted #ebeef5;
}

/* 段落样式 */
.markdown-content :deep(p) {
  margin-bottom: 10px;
  line-height: 1.6;
}

/* 列表样式 */
.markdown-content :deep(ul), .markdown-content :deep(ol) {
  margin: 10px 0;
  padding-left: 20px;
}

.markdown-content :deep(li) {
  margin-bottom: 6px;
  line-height: 1.5;
}

/* 强调样式 */
.markdown-content :deep(strong) {
  color: #409eff;
  font-weight: 700;
}

/* 代码样式 */
.markdown-content :deep(code) {
  background: #f1f2f6;
  padding: 2px 5px;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  color: #e83e8c;
  border: 1px solid #e9ecef;
}

.markdown-content :deep(pre) {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 12px 0;
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
  margin: 12px 0;
  background: #f8f9ff;
  border-radius: 4px;
  color: #666;
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

.markdown-content :deep(tbody tr:nth-child(even)) {
  background-color: #fafafa;
}

/* 任务列表样式 */
.markdown-content :deep(input[type="checkbox"]) {
  margin-right: 6px;
  transform: scale(1.1);
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

/* 分割线样式 */
.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid #ebeef5;
  margin: 16px 0;
}
</style>