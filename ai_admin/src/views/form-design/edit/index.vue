<template>
  <div class="form-edit-container">
    <!-- 表单设计器：加载已保存的 schema 作为默认模板 -->
    <EDesigner @save="handleSave" :defaultSchema="formSchema as any" />

    <!-- 编辑名称/描述弹窗 -->
    <el-dialog v-model="dialogVisible" title="保存表单" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="表单名称" required>
          <el-input v-model="editForm.name" placeholder="请输入表单名称" />
        </el-form-item>
        <el-form-item label="表单描述">
          <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="请输入表单描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmUpdate" :loading="saving">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  // 中文注释：编辑已创建的表单，支持修改 schema、名称、描述
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { type PageSchema } from 'epic-designer'
  import { getForm, updateForm } from '@/api/form'

  const route = useRoute()
  const router = useRouter()

  // 中文注释：当前编辑的表单ID
  const id = Number(route.params.id)

  // 中文注释：保存弹窗显隐与加载状态
  const dialogVisible = ref(false)
  const saving = ref(false)

  // 中文注释：设计器默认加载的 schema（从后端获取）
  const formSchema = ref<PageSchema | null>(null)

  // 中文注释：表单的名称与描述
  const editForm = ref({
    name: '',
    description: ''
  })

  // 中文注释：页面挂载后获取表单详情并初始化设计器
  onMounted(async () => {
    if (!id) return
    try {
      const form: any = await getForm(id)
      editForm.value.name = form.name || ''
      editForm.value.description = form.description || ''
      formSchema.value = form.schema as PageSchema
    } catch (error) {
      console.error('加载表单失败:', error)
      ElMessage.error('表单不存在或已删除')
      router.push('/form/list')
    }
  })

  // 中文注释：设计器触发保存事件，接收用户在画布上编辑后的 schema
  const currentSchema = ref<PageSchema | null>(null)
  function handleSave(schema: PageSchema) {
    currentSchema.value = schema
    dialogVisible.value = true
  }

  // 中文注释：确认更新到后端
  async function confirmUpdate() {
    if (!editForm.value.name.trim()) {
      ElMessage.warning('请输入表单名称')
      return
    }
    saving.value = true
    try {
      await updateForm(id, {
        name: editForm.value.name,
        description: editForm.value.description,
        schema: currentSchema.value || formSchema.value
      })
      ElMessage.success('更新成功！')
      dialogVisible.value = false
      router.push('/form/list')
    } catch (error) {
      console.error('更新失败:', error)
      ElMessage.error('更新失败，请重试')
    } finally {
      saving.value = false
    }
  }
</script>

<style scoped>
  .form-edit-container {
    height: calc(100vh - 100px);
    width: 100%;
    background-color: var(--el-bg-color);
  }
</style>

