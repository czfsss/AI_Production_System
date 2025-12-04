<template>
  <div class="form-design-container">
    <!-- 开启单表单模式，根节点默认切换为表单组件，确保后续 EBuilder 能正确校验并收集数据 -->
    <EDesigner @save="handleSubmit" :formMode="true" />

    <el-dialog v-model="dialogVisible" title="保存表单" width="500px">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="表单名称" required>
          <el-input v-model="formData.name" placeholder="请输入表单名称" />
        </el-form-item>
        <el-form-item label="表单描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入表单描述"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSave" :loading="saving"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue'
  import { ElMessage } from 'element-plus'
  import { type PageSchema, EDesigner } from 'epic-designer'
  import { createForm } from '@/api/form'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const dialogVisible = ref(false)
  const saving = ref(false)
  const currentSchema = ref<PageSchema | null>(null)
  const formData = reactive({
    name: '',
    description: ''
  })

  function handleSubmit(schema: PageSchema) {
    currentSchema.value = schema
    formData.name = ''
    formData.description = ''
    dialogVisible.value = true
  }

  async function confirmSave() {
    if (!formData.name.trim()) {
      ElMessage.warning('请输入表单名称')
      return
    }

    saving.value = true
    try {
      await createForm({
        name: formData.name,
        description: formData.description,
        schema: currentSchema.value
      })

      ElMessage.success('表单保存成功！')
      dialogVisible.value = false
      router.push('/form/list')
    } catch (error) {
      console.error(error)
    } finally {
      saving.value = false
    }
  }
</script>

<style scoped>
  .form-design-container {
    height: calc(100vh - 100px);
    width: 100%;
    background-color: var(--el-bg-color);
  }
</style>
