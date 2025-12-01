<template>
  <div class="form-viewer-container">
    <div v-if="schema">
      <h2 class="form-title" v-if="formName">{{ formName }}</h2>
      <p class="form-desc" v-if="formDesc">{{ formDesc }}</p>
      <EBuilder :pageSchema="schema" ref="eBuilderRef" />
      <div class="actions">
        <el-button type="primary" @click="submit">提交</el-button>
      </div>
    </div>
    <div v-else class="loading">
      <el-empty description="表单加载中或不存在..." />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { getPublicForm } from '@/api/form'

  const route = useRoute()
  const schema = ref(null)
  const formName = ref('')
  const formDesc = ref('')
  const eBuilderRef = ref<any>(null)

  onMounted(async () => {
    const id = Number(route.params.id)
    if (!id) return

    try {
      const form = await getPublicForm(id)
      schema.value = form.schema
      formName.value = form.name
      formDesc.value = form.description
    } catch (error) {
      console.error(error)
      ElMessage.error('表单不存在或已删除')
    }
  })

  async function submit() {
    if (!eBuilderRef.value) return
    try {
      const data = await eBuilderRef.value.validate()
      console.log('Form Data:', data)
      // TODO: Submit to backend
      ElMessage.success('提交成功！')
    } catch (e) {
      console.error(e)
      ElMessage.error('表单校验失败')
    }
  }
</script>

<style scoped>
  .form-viewer-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px;
    background-color: var(--el-bg-color);
    min-height: 100vh;
  }
  .form-title {
    text-align: center;
    margin-bottom: 10px;
  }
  .form-desc {
    text-align: center;
    color: #666;
    margin-bottom: 30px;
  }
  .actions {
    margin-top: 20px;
    text-align: center;
  }
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
</style>
