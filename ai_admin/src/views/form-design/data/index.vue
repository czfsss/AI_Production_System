<template>
  <div class="data-container p-4">
    <el-card v-loading="loading">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <el-button :icon="Back" circle @click="$router.back()" />
            <span class="font-bold text-lg">{{ form.name }} - 提交记录</span>
          </div>
          <div class="flex items-center gap-2">
            <!-- 中文注释：按字段筛选 -->
            <el-select
              v-model="selectedField"
              placeholder="选择字段"
              clearable
              style="width: 160px"
            >
              <el-option v-for="f in fields" :key="f.prop" :label="f.label" :value="f.prop" />
            </el-select>
            <!-- 中文注释：关键词搜索（按字段或全局） -->
            <el-input v-model="keyword" placeholder="请输入关键词" clearable style="width: 200px" />
            <!-- 中文注释：时间范围筛选 -->
            <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              style="width: 360px"
              :shortcuts="dateShortcuts"
            />
            <el-button @click="resetFilters">重置</el-button>
            <!-- 中文注释：刷新提交记录 -->
            <el-button @click="handleRefresh">刷新</el-button>
            <el-button type="primary" @click="exportExcel">导出Excel</el-button>
            <el-button type="warning" @click="$router.push(`/form/stats/${id}`)"
              >图表统计</el-button
            >
          </div>
        </div>
      </template>

      <el-table
        :data="filteredSubmissions"
        style="width: 100%"
        border
        stripe
        height="calc(100vh - 200px)"
        @row-click="openSubmissionDialog"
      >
        <el-table-column type="index" label="序号" width="60" align="center" fixed />
        <el-table-column prop="create_time" label="提交时间" width="180" align="center" fixed>
          <template #default="scope">
            {{ formatTime(scope.row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="user" label="填报人" width="150" align="center">
          <template #default="scope">
            {{ scope.row.user?.real_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="is_draft" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.is_draft ? 'warning' : 'success'">
              {{ scope.row.is_draft ? '草稿' : '已提交' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          v-for="field in fields"
          :key="field.prop"
          :prop="field.prop"
          :label="field.label"
          min-width="150"
          show-overflow-tooltip
        >
          <template #default="scope">
            {{ formatValue(scope.row.data[field.prop]) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 中文注释：图表分析已拆分为独立页面（图表统计），此处不再展示 -->

    <!-- 中文注释：提交详情弹窗，展示用户填报的表单 -->
    <el-dialog v-model="dialogVisible" title="提交详情" width="80%" top="5vh" destroy-on-close>
      <div ref="dialogContainer" class="preview-container">
        <EBuilder ref="dialogEBuilder" :pageSchema="previewSchema" />
      </div>
      <template #footer>
        <el-button @click="exportRecordImage">导出图片</el-button>
        <el-button type="primary" @click="exportRecordPDF">导出PDF</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { getForm, getFormSubmissions } from '@/api/form'
  import { Back } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import * as XLSX from 'xlsx'
  import { nextTick } from 'vue'

  const route = useRoute()
  const router = useRouter()
  const id = Number(route.params.id)
  const loading = ref(false)
  const form = ref<any>({})
  const submissions = ref<any[]>([])
  const fields = ref<any[]>([])
  // 弹窗展示填报表单
  const dialogVisible = ref(false)
  const previewSchema = ref<any>({})
  const dialogEBuilder = ref<any>(null)
  const dialogContainer = ref<HTMLElement | null>(null)
  // 中文注释：筛选状态
  const selectedField = ref<string>('')
  const keyword = ref<string>('')
  const dateRange = ref<any>(null)
  // 图表统计已拆分为独立页面，本页不再维护图表相关状态

  // 中文注释：日期快捷选择
  const dateShortcuts = [
    {
      text: '最近7天',
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - 7)
        return [start, end]
      }
    },
    {
      text: '最近30天',
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - 30)
        return [start, end]
      }
    }
  ]

  async function loadData() {
    if (!id) return
    loading.value = true
    try {
      const [formRes, subRes] = await Promise.all([getForm(id), getFormSubmissions(id)])

      const formAny: any = formRes as any
      const subAny: any[] = subRes as any
      form.value = formAny
      submissions.value = subAny

      parseSchema(formAny.schema)
      // 图表统计页面会自行选择统计字段
    } catch (error) {
      console.error(error)
      ElMessage.error('加载数据失败')
    } finally {
      loading.value = false
    }
  }

  function parseSchema(schema: any) {
    if (!schema || !schema.schemas) return

    const list: any[] = []

    function traverse(schemas: any[]) {
      if (!Array.isArray(schemas)) return

      schemas.forEach((item: any) => {
        // 只有带有 field 的组件才是输入项
        if (item.field && item.label) {
          // 排除布局组件本身带有 field 的情况（如果有）
          if (item.type !== 'grid' && item.type !== 'card') {
            list.push({
              prop: item.field,
              label: item.label
            })
          }
        }

        // 递归查找子元素
        if (item.children) {
          traverse(item.children)
        }
        // 处理 tabs 等特殊结构，通常也在 children 里，或者 columns
        if (item.columns) {
          item.columns.forEach((col: any) => {
            if (col.children) traverse(col.children)
          })
        }
      })
    }

    traverse(schema.schemas)
    fields.value = list
  }

  // 图表统计相关逻辑已移至独立页面

  // 中文注释：过滤后的提交记录
  const filteredSubmissions = computed(() => {
    let arr = submissions.value
    // 时间范围筛选
    if (dateRange.value && dateRange.value.length === 2) {
      const [start, end] = dateRange.value
      const startMs = start.getTime()
      const endMs = end.getTime()
      arr = arr.filter((item) => {
        const t = new Date(item.create_time).getTime()
        return t >= startMs && t <= endMs
      })
    }
    // 关键词筛选
    const kw = keyword.value.trim()
    if (kw) {
      const field = selectedField.value
      const test = (v: any) => String(v ?? '').includes(kw)
      arr = arr.filter((item) => {
        if (field) {
          return test(item.data?.[field])
        }
        // 全字段匹配
        return fields.value.some((f) => test(item.data?.[f.prop]))
      })
    }
    return arr
  })

  // 中文注释：重置筛选
  function resetFilters() {
    selectedField.value = ''
    keyword.value = ''
    dateRange.value = null
  }

  // 中文注释：刷新提交记录（重新请求后端数据）
  function handleRefresh() {
    loadData()
  }

  // 图表统计相关逻辑已移至独立页面

  // 中文注释：导出 Excel
  function exportExcel() {
    try {
      const rows = filteredSubmissions.value.map((s) => {
        const row: Record<string, any> = {
          提交时间: formatTime(s.create_time)
        }
        fields.value.forEach((f) => {
          row[f.label] = s.data?.[f.prop] ?? ''
        })
        return row
      })
      const sheet = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, sheet, '提交记录')
      XLSX.writeFile(wb, `${form.value.name || '表单'}_提交记录.xlsx`)
    } catch (e) {
      console.error('导出失败:', e)
      ElMessage.error('导出失败，请重试')
    }
  }

  function formatTime(time: string) {
    return new Date(time).toLocaleString()
  }

  function formatValue(val: any) {
    if (val === null || val === undefined) return '-'
    if (typeof val === 'object') return JSON.stringify(val)
    return val
  }

  // 打开提交详情弹窗
  async function openSubmissionDialog(row: any) {
    try {
      // 深拷贝 schema，写入默认值并设置只读/禁用，确保初始渲染就带值且不可编辑
      previewSchema.value = applyValuesToSchema(form.value.schema, row.data || {}, true)
      dialogVisible.value = true
      await nextTick()

      const fillOnce = async () => {
        // 方式一：优先通过 getForms 获取所有表单的模型对象
        if (typeof dialogEBuilder.value?.getForms === 'function') {
          try {
            const formsMap: any = await dialogEBuilder.value.getForms()
            if (formsMap && typeof formsMap === 'object') {
              for (const key in formsMap) {
                const model = formsMap[key]
                if (model && typeof model === 'object') {
                  Object.assign(model, row.data || {})
                }
              }
            }
          } catch (e) {
            console.warn('getForms() 读取失败:', e)
          }
        }

        // 方式二：兜底通过表单实例的 model 回填
        try {
          const inst = await dialogEBuilder.value?.getFormInstance?.()
          const instances = Array.isArray(inst) ? inst : [inst]
          for (const f of instances) {
            if (!f) continue
            if (f.model && typeof f.model === 'object') {
              Object.assign(f.model, row.data || {})
            }
          }
        } catch (e) {
          console.warn('getFormInstance() 读取失败:', e)
        }
      }

      // 回填多次，确保异步组件渲染完成
      await fillOnce()
      setTimeout(fillOnce, 50)
      setTimeout(fillOnce, 150)
    } catch (e) {
      console.error('打开提交详情失败:', e)
      ElMessage.error('无法显示提交详情')
    }
  }

  // 将数据写入 schema 的默认值，保证 EBuilder 初始渲染即显示
  function applyValuesToSchema(schema: any, data: Record<string, any>, readonly = false) {
    try {
      const cloned = JSON.parse(JSON.stringify(schema || {}))
      const patchNode = (node: any) => {
        if (!node || typeof node !== 'object') return
        if (node.field) {
          node.componentProps = node.componentProps || {}
          const val = data[node.field]
          if (val !== undefined) {
            node.componentProps.defaultValue = val
          }
          if (readonly) {
            node.componentProps.readonly = true
            node.componentProps.disabled = true
            node.componentProps.editable = false
          }
        }
        if (Array.isArray(node.children)) node.children.forEach(patchNode)
        if (Array.isArray(node.columns))
          node.columns.forEach((col: any) => col.children && col.children.forEach(patchNode))
      }
      if (cloned && Array.isArray(cloned.schemas)) cloned.schemas.forEach(patchNode)
      return cloned
    } catch (_) {
      return schema
    }
  }

  // 动态加载脚本
  async function loadScript(src: string) {
    return new Promise<void>((resolve, reject) => {
      const existed = Array.from(document.getElementsByTagName('script')).find((s) => s.src === src)
      if (existed) return resolve()
      const script = document.createElement('script')
      script.src = src
      script.async = true
      script.onload = () => resolve()
      script.onerror = (e) => reject(e)
      document.head.appendChild(script)
    })
  }

  // 导出为图片
  async function exportRecordImage() {
    try {
      await loadScript(
        'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
      )
      const html2canvas = (window as any).html2canvas
      if (!html2canvas) {
        ElMessage.error('截图库加载失败')
        return
      }
      const target = dialogContainer.value
      if (!target) return
      const canvas = await html2canvas(target, { useCORS: true, allowTaint: true, scale: 2 })
      canvas.toBlob((blob) => {
        if (!blob) return
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `${form.value.name || '表单'}_提交详情.png`
        a.click()
        URL.revokeObjectURL(a.href)
      })
    } catch (e) {
      console.error('导出图片失败:', e)
      ElMessage.error('导出图片失败')
    }
  }

  // 导出为PDF
  async function exportRecordPDF() {
    try {
      await loadScript(
        'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
      )
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
      const html2canvas = (window as any).html2canvas
      const { jsPDF } = (window as any).jspdf || {}
      if (!html2canvas || !jsPDF) {
        ElMessage.error('导出PDF依赖加载失败')
        return
      }
      const target = dialogContainer.value
      if (!target) return
      const canvas = await html2canvas(target, { useCORS: true, allowTaint: true, scale: 2 })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'pt', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth - 40
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let y = 20
      if (imgHeight < pageHeight - 40) {
        pdf.addImage(imgData, 'PNG', 20, y, imgWidth, imgHeight)
      } else {
        // 分页
        let remaining = imgHeight
        const pageImgHeight = pageHeight - 40
        let position = y
        const scale = imgWidth / canvas.width
        const onePageHeightPx = pageImgHeight / scale
        let sY = 0
        while (remaining > 0) {
          const sectionCanvas = document.createElement('canvas')
          sectionCanvas.width = canvas.width
          const takeHeightPx = Math.min(onePageHeightPx, canvas.height - sY)
          sectionCanvas.height = takeHeightPx
          const ctx = sectionCanvas.getContext('2d')
          ctx?.drawImage(
            canvas,
            0,
            sY,
            canvas.width,
            takeHeightPx,
            0,
            0,
            canvas.width,
            takeHeightPx
          )
          const sectionImg = sectionCanvas.toDataURL('image/png')
          pdf.addImage(sectionImg, 'PNG', 20, position, imgWidth, takeHeightPx * scale)
          remaining -= pageImgHeight
          sY += takeHeightPx
          if (remaining > 0) {
            pdf.addPage()
            position = 20
          }
        }
      }
      pdf.save(`${form.value.name || '表单'}_提交详情.pdf`)
    } catch (e) {
      console.error('导出PDF失败:', e)
      ElMessage.error('导出PDF失败')
    }
  }

  onMounted(() => {
    loadData()
  })
</script>

<style scoped>
  .flex {
    display: flex;
  }
  .justify-between {
    justify-content: space-between;
  }
  .items-center {
    align-items: center;
  }
  .gap-2 {
    gap: 0.5rem;
  }
  .font-bold {
    font-weight: bold;
  }
  .text-lg {
    font-size: 1.125rem;
  }
  .data-container {
    height: 100%;
  }
</style>
