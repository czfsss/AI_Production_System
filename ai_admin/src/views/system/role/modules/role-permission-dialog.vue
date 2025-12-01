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
            <span v-if="data.isAuth">
              {{ data.label }} <ElTag size="small" type="info" style="margin-left: 5px">按钮</ElTag>
            </span>
            <span v-else>{{ defaultProps.label(data) }}</span>
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
    fetchRolePermissions,
    fetchSaveRolePermissions,
    fetchGetMenuList
  } from '@/api/system-manage'

  type RoleListItem = Api.SystemManage.RoleListItem

  interface Props {
    modelValue: boolean
    roleData?: RoleListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    roleData: undefined
  })

  const emit = defineEmits<Emits>()

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const treeRef = ref<InstanceType<typeof ElTree>>()
  const isExpandAll = ref(true)
  const isSelectAll = ref(false)
  const rawMenuList = ref<any[]>([])

  // 处理菜单数据，将 authList 转换为子节点
  const processedMenuList = computed(() => {
    const processNode = (node: any) => {
      const processed = { ...node }

      // 如果有 authList，将其转换为子节点
      if (node.meta && node.meta.authList && node.meta.authList.length) {
        const authNodes = node.meta.authList.map((auth: any) => ({
          id: auth.id, // 使用按钮的真实ID
          label: auth.title,
          authMark: auth.authMark,
          isAuth: true,
          parentId: node.id
        }))

        processed.children = processed.children ? [...processed.children, ...authNodes] : authNodes
      }

      // 递归处理子节点
      if (processed.children) {
        processed.children = processed.children.map(processNode)
      }

      return processed
    }

    return rawMenuList.value.map(processNode)
  })

  const defaultProps = {
    children: 'children',
    label: (data: any) =>
      data.isAuth ? data.label : formatMenuTitle(data.meta?.title) || data.meta?.title || '未命名'
  }

  // 监听弹窗打开，初始化权限数据
  watch(
    () => props.modelValue,
    async (newVal) => {
      if (newVal && props.roleData) {
        try {
          // 1. 获取所有菜单 (树形结构)
          const menuRes = await fetchGetMenuList()
          if (menuRes && menuRes.menuList) {
            rawMenuList.value = menuRes.menuList
          }

          // 2. 获取角色已有权限
          const res = await fetchRolePermissions({ roleId: props.roleData.roleId })
          // @ts-ignore
          if (res && res.menuIds) {
            nextTick(() => {
              // @ts-ignore
              treeRef.value?.setCheckedKeys(res.menuIds)
            })
          }
        } catch (error) {
          console.error('获取权限失败:', error)
        }
      }
    }
  )

  const handleClose = () => {
    visible.value = false
    treeRef.value?.setCheckedKeys([])
    rawMenuList.value = []
  }

  const handleTreeCheck = () => {
    // Optional: Handle check events if needed
  }

  const savePermission = async () => {
    if (!props.roleData) return

    const tree = treeRef.value
    if (!tree) return

    const checkedKeys = tree.getCheckedKeys()
    const halfCheckedKeys = tree.getHalfCheckedKeys()
    const allKeys = [...checkedKeys, ...halfCheckedKeys]

    try {
      await fetchSaveRolePermissions({
        roleId: props.roleData.roleId,
        menuIds: allKeys // 传递 menuIds
      })
      ElMessage.success('权限保存成功')
      emit('success')
      handleClose()
    } catch (error) {
      console.error('保存权限失败:', error)
    }
  }

  const toggleExpandAll = () => {
    const tree = treeRef.value
    if (!tree) return

    // 使用store.nodesMap直接控制所有节点的展开状态
    const nodes = tree.store.nodesMap
    Object.values(nodes).forEach((node: any) => {
      node.expanded = !isExpandAll.value
    })

    isExpandAll.value = !isExpandAll.value
  }

  const toggleSelectAll = () => {
    const tree = treeRef.value
    if (!tree) return

    if (!isSelectAll.value) {
      // 全选：获取所有节点的key并设置为选中
      const allKeys = getAllNodeKeys(processedMenuList.value)
      tree.setCheckedKeys(allKeys)
    } else {
      // 取消全选：清空所有选中
      tree.setCheckedKeys([])
    }

    isSelectAll.value = !isSelectAll.value
  }

  const getAllNodeKeys = (nodes: any[]): number[] => {
    const keys: number[] = []
    const traverse = (nodeList: any[]) => {
      nodeList.forEach((node) => {
        if (node.id) {
          keys.push(node.id)
        }
        if (node.children && node.children.length > 0) {
          traverse(node.children)
        }
      })
    }
    traverse(nodes)
    return keys
  }
</script>
