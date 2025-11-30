<template>
  <ElDialog
    v-model="visible"
    title="菜单权限"
    width="520px"
    align-center
    class="el-dialog-border"
    @close="handleClose"
  >
    <ElScrollbar height="70vh">
      <ElTree
        ref="treeRef"
        :data="processedMenuList"
        show-checkbox
        node-key="name"
        :default-expand-all="isExpandAll"
        :props="defaultProps"
        @check="handleTreeCheck"
      >
        <template #default="{ data }">
          <div style="display: flex; align-items: center">
            <span v-if="data.isAuth">{{ data.label }}</span>
            <span v-else>{{ defaultProps.label(data) }}</span>
          </div>
        </template>
      </ElTree>
    </ElScrollbar>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="toggleExpandAll">{{ isExpandAll ? '全部收起' : '全部展开' }}</ElButton>
        <ElButton @click="toggleSelectAll" style="margin-left: 8px">{{ isSelectAll ? '取消全选' : '全部选择' }}</ElButton>
        <ElButton type="primary" @click="savePermission">保存</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { useMenuStore } from '@/store/modules/menu'
import { ElMessage } from 'element-plus'
import { formatMenuTitle } from '@/router/utils/utils'
import { fetchDepartmentPermissions, fetchSaveDepartmentPermissions } from '@/api/system-manage'

interface Props {
  modelValue: boolean
  departmentData?: { id: number; name: string }
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), { modelValue: false, departmentData: undefined })
const emit = defineEmits<Emits>()

const visible = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
const { menuList } = storeToRefs(useMenuStore())
const treeRef = ref()
const isExpandAll = ref(true)
const isSelectAll = ref(false)

const processedMenuList = computed(() => {
  const processNode = (node: any) => {
    const processed = { ...node }
    if (node.meta && node.meta.authList && node.meta.authList.length) {
      const authNodes = node.meta.authList.map((auth: any) => ({
        id: `${node.id}_${auth.authMark}`,
        name: `${node.name}_${auth.authMark}`,
        label: auth.title,
        authMark: auth.authMark,
        isAuth: true,
        checked: auth.checked || false
      }))
      processed.children = processed.children ? [...processed.children, ...authNodes] : authNodes
    }
    if (processed.children) processed.children = processed.children.map(processNode)
    return processed
  }
  return menuList.value.map(processNode)
})

const defaultProps = { children: 'children', label: (data: any) => formatMenuTitle(data.meta?.title) || '' }

watch(
  () => props.modelValue,
  async (newVal) => {
    if (newVal && props.departmentData) {
      try {
        const res = await fetchDepartmentPermissions({ departmentId: props.departmentData.id })
        // @ts-ignore
        if (res && res.authMarks) treeRef.value?.setCheckedKeys(res.authMarks)
      } catch {}
    }
  }
)

const handleClose = () => {
  visible.value = false
  treeRef.value?.setCheckedKeys([])
}

const savePermission = async () => {
  if (!props.departmentData) return
  const tree = treeRef.value
  if (!tree) return
  const checkedKeys = tree.getCheckedKeys()
  const halfCheckedKeys = tree.getHalfCheckedKeys()
  const allKeys = [...checkedKeys, ...halfCheckedKeys]
  await fetchSaveDepartmentPermissions({ departmentId: props.departmentData.id, authMarks: allKeys })
  ElMessage.success('权限保存成功')
  emit('success')
  handleClose()
}

const toggleExpandAll = () => {
  const tree = treeRef.value
  if (!tree) return
  const nodes = tree.store.nodesMap
  Object.values(nodes).forEach((node: any) => { node.expanded = !isExpandAll.value })
  isExpandAll.value = !isExpandAll.value
}

const getAllNodeKeys = (nodes: any[]): string[] => {
  const keys: string[] = []
  const traverse = (nodeList: any[]) => {
    nodeList.forEach((node) => {
      if (node.name) keys.push(node.name)
      if (node.children && node.children.length > 0) traverse(node.children)
    })
  }
  traverse(nodes)
  return keys
}

const toggleSelectAll = () => {
  const tree = treeRef.value
  if (!tree) return
  if (!isSelectAll.value) {
    const allKeys = getAllNodeKeys(processedMenuList.value)
    tree.setCheckedKeys(allKeys)
  } else {
    tree.setCheckedKeys([])
  }
  isSelectAll.value = !isSelectAll.value
}

const handleTreeCheck = () => {
  const tree = treeRef.value
  if (!tree) return
  const checkedKeys = tree.getCheckedKeys()
  const allKeys = getAllNodeKeys(processedMenuList.value)
  isSelectAll.value = checkedKeys.length === allKeys.length && allKeys.length > 0
}
</script>

<style lang="scss" scoped>
.dialog-footer { display: flex; gap: 12px; justify-content: flex-end; }
</style>
