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
        node-key="id"
        :default-expand-all="isExpandAll"
        :props="defaultProps"
        @check="handleTreeCheck"
      >
        <template #default="{ data }">
          <div style="display: flex; align-items: center">
            <span>{{ defaultProps.label(data) }}</span>
          </div>
        </template>
      </ElTree>
    </ElScrollbar>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="toggleExpandAll">{{ isExpandAll ? '全部收起' : '全部展开' }}</ElButton>
        <ElButton @click="toggleSelectAll" style="margin-left: 8px">{{
          isSelectAll ? '取消全选' : '全部选择'
        }}</ElButton>
        <ElButton type="primary" @click="savePermission">保存</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ElMessage, ElTree } from 'element-plus'
  import { formatMenuTitle } from '@/router/utils/utils'
  import {
    fetchDepartmentPermissions,
    fetchSaveDepartmentPermissions,
    fetchGetMenuList
  } from '@/api/system-manage'

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

  const visible = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v)
  })

  const treeRef = ref<InstanceType<typeof ElTree>>()
  const isExpandAll = ref(true)
  const isSelectAll = ref(false)
  const rawMenuList = ref<any[]>([])

  // 处理菜单数据 (不包含按钮，因为部门权限仅涉及查看)
  const processedMenuList = computed(() => {
    const processNode = (node: any) => {
      const processed = { ...node }
      // Department only manages Menu visibility, so we DO NOT add authList (buttons) as children here.

      if (processed.children) {
        processed.children = processed.children.map(processNode)
      }
      return processed
    }
    return rawMenuList.value.map(processNode)
  })

  const defaultProps = {
    children: 'children',
    label: (data: any) => formatMenuTitle(data.meta?.title) || data.meta?.title || '未命名'
  }

  watch(
    () => props.modelValue,
    async (newVal) => {
      if (newVal && props.departmentData) {
        try {
          // 1. Fetch full menu list
          const menuRes = await fetchGetMenuList()
          if (menuRes && menuRes.menuList) {
            rawMenuList.value = menuRes.menuList
          }

          // 2. Fetch department permissions
          const res = await fetchDepartmentPermissions({ departmentId: props.departmentData.id })
          // @ts-ignore
          if (res && res.menuIds) {
            nextTick(() => {
              // @ts-ignore
              treeRef.value?.setCheckedKeys(res.menuIds)
            })
          }
        } catch (error) {
          console.error(error)
        }
      }
    }
  )

  const handleClose = () => {
    visible.value = false
    treeRef.value?.setCheckedKeys([])
    rawMenuList.value = []
  }

  const savePermission = async () => {
    if (!props.departmentData) return
    const tree = treeRef.value
    if (!tree) return

    const checkedKeys = tree.getCheckedKeys()
    const halfCheckedKeys = tree.getHalfCheckedKeys()
    const allKeys = [...checkedKeys, ...halfCheckedKeys]

    try {
      await fetchSaveDepartmentPermissions({
        departmentId: props.departmentData.id,
        menuIds: allKeys
      })
      ElMessage.success('权限保存成功')
      emit('success')
      handleClose()
    } catch (error) {
      console.error(error)
    }
  }

  const toggleExpandAll = () => {
    const tree = treeRef.value
    if (!tree) return
    const nodes = tree.store.nodesMap
    Object.values(nodes).forEach((node: any) => {
      node.expanded = !isExpandAll.value
    })
    isExpandAll.value = !isExpandAll.value
  }

  const getAllNodeKeys = (nodes: any[]): number[] => {
    const keys: number[] = []
    const traverse = (nodeList: any[]) => {
      nodeList.forEach((node) => {
        if (node.id) keys.push(node.id)
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
    // Optional: logic to sync isSelectAll
  }
</script>

<style lang="scss" scoped>
  .dialog-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
</style>
