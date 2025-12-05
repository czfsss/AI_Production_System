import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

// 获取用户列表
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.SystemManage.UserList>({
    url: '/user/list',
    params
  })
}

// 新增用户
export function fetchAddUser(data: any) {
  return request.post({ url: '/user/add', data })
}

// 更新用户
export function fetchUpdateUser(data: any) {
  return request.post({ url: '/user/update', data })
}

// 删除用户
export function fetchDeleteUser(data: { userId: number }) {
  return request.post({ url: '/user/delete', data })
}

// 获取角色列表
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/role/list',
    params
  })
}

// 新增角色
export function fetchAddRole(data: any) {
  return request.post({ url: '/role/add', data })
}

// 更新角色
export function fetchUpdateRole(data: any) {
  return request.post({ url: '/role/update', data })
}

// 删除角色
export function fetchDeleteRole(data: { roleId: number }) {
  return request.post({ url: '/role/delete', data })
}

// 获取角色权限
export function fetchRolePermissions(params: { roleId: number }) {
  return request.get({ url: '/role/permissions', params })
}

// 保存角色权限
export function fetchSaveRolePermissions(data: any) {
  return request.post({ url: '/role/permissions/save', data })
}

// 获取所有权限列表
export function fetchPermissionList() {
  return request.get({ url: '/permission/list' })
}

interface MenuResponse {
  menuList: AppRouteRecord[]
}

// 获取菜单数据（优先请求后端，失败则回退到本地模拟）
export async function fetchGetMenuList(): Promise<MenuResponse> {
  const resp = await request.get<any>({ url: '/menu/list' })
  const list = resp?.menuList ?? resp?.menus ?? resp?.data?.menuList ?? resp?.data?.menus ?? []
  return { menuList: Array.isArray(list) ? list : [] }
}
// 部门管理
export function fetchGetDepartmentList() {
  return request.get<{
    records: Array<{
      id: number
      name: string
      code?: string
      description?: string
      enabled: boolean
      create_time: string
    }>
  }>({
    url: '/department/list'
  })
}

export function fetchAddDepartment(data: { name: string; code?: string; description?: string }) {
  return request.post({ url: '/department/add', data })
}

export function fetchUpdateDepartment(data: {
  id: number
  name?: string
  code?: string
  description?: string
  enabled?: boolean
}) {
  return request.post({ url: '/department/update', data })
}

export function fetchDeleteDepartment(data: { id: number }) {
  return request.post({ url: '/department/delete', data })
}

export function fetchDepartmentPermissions(params: { departmentId: number }) {
  return request.get({ url: '/department/permissions', params })
}

export function fetchSaveDepartmentPermissions(data: {
  departmentId: number
  authMarks: string[]
}) {
  return request.post({ url: '/department/permissions/save', data })
}

export function fetchAddMenu(data: any) {
  return request.post({ url: '/menu/add', data })
}

export function fetchUpdateMenu(data: any) {
  return request.post({ url: '/menu/update', data })
}

export function fetchDeleteMenu(data: { id: number }) {
  return request.post({ url: '/menu/delete', data })
}
