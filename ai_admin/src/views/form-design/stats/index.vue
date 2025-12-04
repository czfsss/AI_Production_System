<template>
  <div class="stats-container p-4">
    <el-card v-loading="loading">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <el-button :icon="Back" circle @click="$router.back()" />
            <span class="font-bold text-lg">{{ form.name }} - 统计</span>
          </div>
          <div class="flex items-center gap-2">
            <!-- 中文注释：筛选条件，与数据页一致 -->
            <el-select
              v-model="selectedField"
              placeholder="选择字段"
              clearable
              style="width: 160px"
            >
              <el-option v-for="f in fields" :key="f.prop" :label="f.label" :value="f.prop" />
            </el-select>
            <el-input v-model="keyword" placeholder="关键词" clearable style="width: 180px" />
            <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              style="width: 320px"
              :shortcuts="dateShortcuts"
            />
            <!-- 中文注释：统计字段选择 -->
            <el-select v-model="selectedStatField" placeholder="统计字段" style="width: 180px">
              <el-option v-for="f in fields" :key="f.prop" :label="f.label" :value="f.prop" />
            </el-select>
            <el-button @click="resetFilters">重置</el-button>
          </div>
        </div>
      </template>

      <div class="grid grid-cols-2 gap-4">
        <el-card>
          <template #header>
            <span>趋势（按天提交数量）</span>
          </template>
          <ArtLineChart :data="trendData" :xAxisData="trendXAxis" :showAreaColor="true" />
        </el-card>

        <el-card>
          <template #header>
            <span>分类分布（{{ getFieldLabel(selectedStatField) }}）</span>
          </template>
          <ArtBarChart :data="categoryCounts" :xAxisData="categoryXAxis" />
        </el-card>

        <el-card class="col-span-2">
          <template #header>
            <span>占比（{{ getFieldLabel(selectedStatField) }}）</span>
          </template>
          <ArtRingChart :data="ringData" :showLegend="true" legendPosition="right" />
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  // 中文注释：表单图表统计页面，仅展示图表分析
  import { ref, onMounted, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { Back } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import { getForm, getFormSubmissions } from '@/api/form'

  const route = useRoute()
  const id = Number(route.params.id)
  const loading = ref(false)
  const form = ref<any>({})
  const submissions = ref<any[]>([])
  const fields = ref<any[]>([])
  // 筛选状态
  const selectedField = ref<string>('')
  const keyword = ref<string>('')
  const dateRange = ref<any>(null)
  const selectedStatField = ref<string>('')
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

  // 中文注释：加载表单信息与提交记录
  async function loadStats() {
    if (!id) return
    loading.value = true
    try {
      const [formRes, subRes] = await Promise.all([getForm(id), getFormSubmissions(id)])
      const formAny: any = formRes as any
      const subAny: any[] = subRes as any
      form.value = formAny
      submissions.value = subAny
      parseSchema(formAny.schema)
      selectedStatField.value = fields.value[0]?.prop || ''
    } catch (error) {
      console.error(error)
      ElMessage.error('加载统计数据失败')
    } finally {
      loading.value = false
    }
  }

  // 中文注释：解析 schema，提取可统计的字段
  function parseSchema(schema: any) {
    if (!schema || !schema.schemas) return
    const list: any[] = []
    function traverse(schemas: any[]) {
      if (!Array.isArray(schemas)) return
      schemas.forEach((item: any) => {
        if (item.field && item.label && item.type !== 'grid' && item.type !== 'card') {
          list.push({ prop: item.field, label: item.label })
        }
        if (item.children) traverse(item.children)
        if (item.columns) item.columns.forEach((col: any) => col.children && traverse(col.children))
      })
    }
    traverse(schema.schemas)
    fields.value = list
  }

  function getFieldLabel(prop: string) {
    return fields.value.find((f) => f.prop === prop)?.label || prop || '未选择字段'
  }

  // 过滤后的提交记录
  const filteredSubmissions = computed(() => {
    let arr = submissions.value
    if (dateRange && Array.isArray(dateRange.value) && dateRange.value.length === 2) {
      const [start, end] = dateRange.value
      const startMs = new Date(start).getTime()
      const endMs = new Date(end).getTime()
      arr = arr.filter((item) => {
        const t = new Date(item.create_time).getTime()
        return t >= startMs && t <= endMs
      })
    }
    const kw = keyword.value?.trim()
    if (kw) {
      const field = selectedField.value
      const test = (v: any) => String(v ?? '').includes(kw)
      arr = arr.filter((item) => {
        if (field) return test(item.data?.[field])
        return fields.value.some((f) => test(item.data?.[f.prop]))
      })
    }
    return arr
  })

  // 中文注释：趋势（按天数量）
  const trendXAxis = computed(() => {
    const map = new Map<string, number>()
    filteredSubmissions.value.forEach((s) => {
      const d = new Date(s.create_time)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      map.set(key, (map.get(key) || 0) + 1)
    })
    return Array.from(map.keys()).sort()
  })

  const trendData = computed(() => {
    const map = new Map<string, number>()
    filteredSubmissions.value.forEach((s) => {
      const d = new Date(s.create_time)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      map.set(key, (map.get(key) || 0) + 1)
    })
    const keys = Array.from(map.keys()).sort()
    return keys.map((k) => map.get(k) || 0)
  })

  // 中文注释：分类统计与占比（按选定字段）
  const categoryXAxis = computed(() => {
    const field = selectedStatField.value
    const map = new Map<string, number>()
    filteredSubmissions.value.forEach((s) => {
      const v = s.data?.[field]
      const key = v === undefined || v === null || v === '' ? '未填' : String(v)
      map.set(key, (map.get(key) || 0) + 1)
    })
    return Array.from(map.keys())
  })

  const categoryCounts = computed(() => {
    const field = selectedStatField.value
    const map = new Map<string, number>()
    filteredSubmissions.value.forEach((s) => {
      const v = s.data?.[field]
      const key = v === undefined || v === null || v === '' ? '未填' : String(v)
      map.set(key, (map.get(key) || 0) + 1)
    })
    const keys = Array.from(map.keys())
    return keys.map((k) => map.get(k) || 0)
  })

  const ringData = computed(() => {
    const field = selectedStatField.value
    const map = new Map<string, number>()
    filteredSubmissions.value.forEach((s) => {
      const v = s.data?.[field]
      const key = v === undefined || v === null || v === '' ? '未填' : String(v)
      map.set(key, (map.get(key) || 0) + 1)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  })

  onMounted(() => {
    loadStats()
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
  .stats-container {
    height: 100%;
  }
  .grid {
    display: grid;
  }
  .grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .gap-4 {
    gap: 1rem;
  }
  .col-span-2 {
    grid-column: span 2 / span 2;
  }
</style>
