<template>
  <div class="submit-container">
    <el-card v-loading="loading" class="form-card">
      <template #header>
        <div class="text-center">
          <h2>{{ form.name }}</h2>
          <p class="text-gray-500" v-if="form.description">{{ form.description }}</p>
        </div>
      </template>

      <div
        v-if="!submitted && !loading && form.schema && Object.keys(form.schema).length > 0"
        class="form-content"
      >
        <EBuilder ref="kfb" :pageSchema="form.schema" />

        <div class="mt-8 text-center">
          <el-space size="large" alignment="center">
            <el-button
              type="warning"
              size="large"
              :loading="savingDraft"
              @click="handleSaveDraft"
              style="width: 200px"
              >暂存</el-button
            >
            <el-button
              type="primary"
              size="large"
              @click="handleSubmit"
              :loading="submitting"
              style="width: 200px"
              >提交</el-button
            >
          </el-space>
        </div>
      </div>

      <div v-else class="success-container">
        <el-result icon="success" title="提交成功" sub-title="您的反馈已收到，感谢您的参与">
          <template #extra>
            <el-button type="primary" @click="reload">再填一份</el-button>
          </template>
        </el-result>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { getPublicForm, submitForm, saveFormDraft, getFormDraft } from '@/api/form'
  import { ElMessage } from 'element-plus'

  const route = useRoute()
  const uuid = route.params.uuid as string

  // Debug log
  console.log('Submit Page Mounted')
  console.log('UUID from route:', uuid)
  console.log('Full Route Params:', route.params)

  const loading = ref(false)
  const submitting = ref(false)
  const savingDraft = ref(false)
  const submitted = ref(false)
  const form = ref<any>({ schema: {} })
  const kfb = ref<any>(null)
  const submissionData = ref<any>({})

  async function loadForm() {
    console.log('loadForm called with uuid:', uuid)
    if (!uuid) {
      console.error('No UUID found!')
      return
    }
    loading.value = true
    try {
      console.log('Calling getPublicForm...')
      const res = await getPublicForm(uuid)
      console.log('getPublicForm response:', res)
      const resAny: any = res
      form.value = resAny

      try {
        const normalized = normalizeSchema(resAny?.schema)
        if (normalized) {
          form.value.schema = normalized
        }
      } catch (e) {
        console.warn('normalize schema failed:', e)
      }

      // 初始化提交数据
      submissionData.value = {}

      // 尝试获取当前用户草稿并进行预填
      try {
        const draftRes: any = await getFormDraft(uuid)
        if (draftRes && draftRes.data && typeof draftRes.data === 'object') {
          submissionData.value = draftRes.data
          // 将草稿数据写入 schema 的默认值，达到预填效果
          form.value.schema = applyValuesToSchema(form.value.schema, submissionData.value, false)
          console.log('Loaded draft and applied to schema')
        }
      } catch (e) {
        // 无草稿或未登录情况下忽略
        console.warn('No draft found or fetch failed:', e)
      }

      if (form.value.schema) {
        console.log('Form Schema Type:', typeof form.value.schema)
        console.log('Form Schema Keys:', Object.keys(form.value.schema))
        console.log('Form Schema Content:', JSON.stringify(form.value.schema))
      }
    } catch (error) {
      console.error('getPublicForm error:', error)
      ElMessage.error('表单加载失败或不存在')
    } finally {
      loading.value = false
    }
  }

  function normalizeSchema(schema: any) {
    if (!schema || !Array.isArray(schema.schemas)) return schema
    const root = schema.schemas[0]
    if (!root || !Array.isArray(root.children)) return schema

    const children = root.children
    let formNode = children.find((c: any) => c?.type === 'form')

    const inputsOutsideForm: any[] = []
    const remainChildren: any[] = []
    for (const c of children) {
      if (c?.type === 'form') {
        remainChildren.push(c)
        continue
      }
      if (c?.input === true && typeof c?.field === 'string' && c.field) {
        inputsOutsideForm.push(c)
      } else {
        remainChildren.push(c)
      }
    }

    if (!formNode && inputsOutsideForm.length > 0) {
      formNode = {
        id: `auto_form_${Date.now()}`,
        type: 'form',
        label: '表单',
        children: [],
        componentProps: {
          name: 'default',
          labelWidth: 100,
          labelPosition: 'right',
          size: 'default'
        }
      }
      remainChildren.unshift(formNode)
    }

    if (formNode && inputsOutsideForm.length > 0) {
      formNode.children = Array.isArray(formNode.children) ? formNode.children : []
      formNode.children.push(...inputsOutsideForm)
      root.children = remainChildren
    }

    return schema
  }

  // 将数据应用到表单 schema 中的默认值，以实现预填；可选只读控制
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

  async function handleSubmit() {
    try {
      if (!kfb.value) return

      console.log('kfb instance:', kfb.value)
      console.log('kfb pageManager:', kfb.value.pageManager)
      if (kfb.value.pageManager) {
        console.log('kfb pageManager forms:', kfb.value.pageManager.forms)
        console.log('kfb pageManager componentInstances:', kfb.value.pageManager.componentInstances)
      }

      // 1. 首选：调用 EBuilder 的 validate 获取数据（标准方式）
      console.log('Calling validate()...')
      let data: Record<string, any> = {}
      try {
        const validateResult = await kfb.value.validate()
        if (validateResult && typeof validateResult === 'object') {
          data = validateResult
        }
        console.log('validate() result:', validateResult)
      } catch (e) {
        console.warn('validate() failed or rejected:', e)
        ElMessage.warning('请检查表单必填项')
      }

      // 2. 合并 UI 表单模型与 pageManager.forms，补齐布局内字段
      try {
        const formInstance: any = await kfb.value?.getFormInstance?.()
        const instances = Array.isArray(formInstance) ? formInstance : [formInstance]
        const merged: Record<string, any> = {}
        for (const inst of instances) {
          if (!inst) continue
          if (typeof inst.validate === 'function') {
            try {
              await inst.validate()
            } catch (err) {
              console.warn('ElForm.validate 校验失败:', err)
            }
          }
          if (inst.model && typeof inst.model === 'object') {
            Object.assign(merged, inst.model)
          }
        }
        try {
          const formsMap = kfb.value?.pageManager?.forms || {}
          if (formsMap && typeof formsMap === 'object') {
            for (const key in formsMap) {
              const m = formsMap[key]
              if (m && typeof m === 'object') Object.assign(merged, m)
            }
          }
        } catch (e2) {
          console.warn('pageManager.forms 读取失败:', e2)
        }

        data = Object.assign({}, merged, data)
        console.log('Merged final data:', data)
      } catch (e) {
        console.warn('getFormInstance() 读取失败:', e)
      }

      console.log('Final Form Data to submit:', data)

      // 如果数据仍然为空，发出警告
      if (!data || Object.keys(data).length === 0) {
        console.warn('Warning: Submitting empty data!')
        ElMessage.warning(
          '未获取到有效的填报数据，请检查字段配置（是否在表单组件内、字段field是否设置）'
        )
        return
      }

      submitting.value = true
      await submitForm(uuid, data || {})
      submitted.value = true
      ElMessage.success('提交成功')
    } catch (error) {
      console.error('Submit error:', error)
      ElMessage.error('提交失败，请重试')
    } finally {
      submitting.value = false
    }
  }

  async function handleSaveDraft() {
    try {
      if (!kfb.value) return
      let data: Record<string, any> = {}
      // 尝试直接读取模型，不做必填校验
      try {
        const formInstance: any = await kfb.value?.getFormInstance?.()
        const instances = Array.isArray(formInstance) ? formInstance : [formInstance]
        for (const inst of instances) {
          if (!inst) continue
          if (inst.model && typeof inst.model === 'object') {
            Object.assign(data, inst.model)
          }
        }
      } catch (e) {
        console.warn('读取模型失败:', e)
      }

      // 兜底：尝试从 pageManager.forms 读取
      try {
        const formsMap = kfb.value?.pageManager?.forms || {}
        if (formsMap && typeof formsMap === 'object') {
          for (const key in formsMap) {
            const m = formsMap[key]
            if (m && typeof m === 'object') Object.assign(data, m)
          }
        }
      } catch (e) {
        console.warn('pageManager.forms 读取失败:', e)
      }

      savingDraft.value = true
      await saveFormDraft(uuid, data || {})
      ElMessage.success('已暂存')
    } catch (error) {
      console.error('Save draft error:', error)
      ElMessage.error('暂存失败，请重试')
    } finally {
      savingDraft.value = false
    }
  }

  function reload() {
    submitted.value = false
    window.location.reload()
  }

  onMounted(() => {
    loadForm()
  })
</script>

<style scoped>
  .submit-container {
    display: flex;
    justify-content: center;
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
  }
  .form-card {
    width: 100%;
    max-width: 800px;
    margin-bottom: 40px;
  }
  .text-center {
    text-align: center;
  }
  .text-gray-500 {
    color: #909399;
    margin-top: 10px;
  }
  .mt-8 {
    margin-top: 32px;
  }
  .form-content {
    padding: 10px;
  }
</style>
