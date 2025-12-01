<template>
  <div class="form-list-container p-4">
    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <span>表单列表</span>
          <div class="flex gap-4">
            <el-input
              v-model="queryParams.name"
              placeholder="搜索表单名称或创建人"
              clearable
              @clear="loadForms"
              @keyup.enter="loadForms"
              style="width: 200px"
            >
              <template #append>
                <el-button @click="loadForms">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
            <el-button type="primary" @click="$router.push('/form/design')">创建新表单</el-button>
          </div>
        </div>
      </template>
      <el-table :data="forms" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="表单名称" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="creator.real_name" label="创建人" width="120" />
        <el-table-column prop="create_time" label="创建时间">
          <template #default="scope">
            {{ formatTime(scope.row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" type="success" @click="handlePreview(scope.row)"
              >预览</el-button
            >
            <el-button size="small" @click="handleShare(scope.row.id)">查看 (公开链接)</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container" v-if="total > 0">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="loadForms"
        />
      </div>
    </el-card>

    <!-- 预览弹窗 -->
    <el-dialog v-model="previewVisible" title="表单预览" width="80%" top="5vh" destroy-on-close>
      <div class="preview-container">
        <EBuilder :pageSchema="previewSchema" />
      </div>
    </el-dialog>

    <!-- 分享弹窗 -->
    <el-dialog v-model="shareVisible" title="公开链接" width="500px">
      <div class="share-container">
        <div class="share-item">
          <div class="label">链接地址：</div>
          <div class="content">
            <el-input v-model="shareUrl" readonly>
              <template #append>
                <el-button @click="copyUrl">复制</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <div class="share-item">
          <div class="label">二维码：</div>
          <div class="content flex flex-col items-center gap-4">
            <div class="qrcode-wrapper" ref="qrcodeWrapperRef">
              <QrcodeVue :value="shareUrl" :size="200" level="H" />
            </div>
            <div class="flex gap-4">
              <el-button type="primary" @click="saveQrcode">保存二维码</el-button>
              <el-button @click="copyQrcode">复制二维码</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Search } from '@element-plus/icons-vue'
  import { getFormList, deleteForm } from '@/api/form'
  import QrcodeVue from 'qrcode.vue'
  import { useClipboard } from '@vueuse/core'

  const router = useRouter()
  const forms = ref([])
  const loading = ref(false)
  const total = ref(0)
  const queryParams = reactive({
    page: 1,
    size: 10,
    name: ''
  })

  // 预览相关
  const previewVisible = ref(false)
  const previewSchema = ref({})

  function handlePreview(row: any) {
    previewSchema.value = row.schema
    previewVisible.value = true
  }

  // 分享相关
  const shareVisible = ref(false)
  const shareUrl = ref('')
  const qrcodeWrapperRef = ref<HTMLElement | null>(null)
  const { copy, isSupported } = useClipboard()

  function handleShare(id: number) {
    if (!id) {
      ElMessage.warning('无法获取表单ID')
      return
    }

    // 构建完整 URL
    const baseUrl = window.location.href.split('#')[0]
    shareUrl.value = `${baseUrl}#/form/view/${id}`
    shareVisible.value = true
  }

  function copyUrl() {
    if (!isSupported.value) {
      ElMessage.error('当前浏览器不支持自动复制，请手动复制')
      return
    }
    copy(shareUrl.value)
    ElMessage.success('复制成功')
  }

  function saveQrcode() {
    const canvas = qrcodeWrapperRef.value?.querySelector('canvas')
    if (!canvas) {
      ElMessage.error('无法获取二维码')
      return
    }

    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.download = `form-qrcode-${new Date().getTime()}.png`
    a.href = url
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  async function copyQrcode() {
    const canvas = qrcodeWrapperRef.value?.querySelector('canvas')
    if (!canvas) {
      ElMessage.error('无法获取二维码')
      return
    }

    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve))
      if (!blob) {
        ElMessage.error('生成图片失败')
        return
      }

      // @ts-ignore
      const item = new ClipboardItem({ 'image/png': blob })
      // @ts-ignore
      await navigator.clipboard.write([item])
      ElMessage.success('二维码已复制到剪贴板')
    } catch (error) {
      console.error(error)
      ElMessage.error('复制失败，请尝试手动保存')
    }
  }

  async function loadForms() {
    loading.value = true
    try {
      const res = await getFormList(queryParams)
      forms.value = res.items
      total.value = res.total
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  function handleDelete(id: number) {
    ElMessageBox.confirm('确认删除该表单吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        await deleteForm(id)
        ElMessage.success('已删除')
        loadForms()
      })
      .catch(() => {})
  }

  function formatTime(time: string) {
    return new Date(time).toLocaleString()
  }

  onMounted(() => {
    loadForms()
  })
</script>

<style scoped>
  .form-list-container {
    padding: 20px;
  }
  .flex {
    display: flex;
  }
  .justify-between {
    justify-content: space-between;
  }
  .items-center {
    align-items: center;
  }
  .gap-4 {
    gap: 1rem;
  }
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  .preview-container {
    padding: 10px;
    min-height: 400px;
    overflow-y: auto;
  }
  .share-container {
    padding: 10px;
  }
  .share-item {
    margin-bottom: 20px;
  }
  .share-item .label {
    margin-bottom: 8px;
    font-weight: bold;
  }
  .flex-col {
    flex-direction: column;
  }
  .justify-center {
    justify-content: center;
  }
  .qrcode-wrapper {
    display: flex;
    justify-content: center;
    padding: 10px;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 4px;
  }
</style>
