import { useUserStore } from '@/store/modules/user'
import { App, Directive, DirectiveBinding } from 'vue'

interface RolesBinding extends DirectiveBinding {
  value: string | string[]
}

function checkRolePermission(el: HTMLElement, binding: RolesBinding): void {
  const userStore = useUserStore()
  const userRoles = userStore.getUserInfo.roles

  // 如果用户角色为空或未定义，移除元素
  if (!userRoles?.length) {
    removeElement(el)
    return
  }

  // 确保指令值为数组格式
  const requiredRoles = Array.isArray(binding.value) ? binding.value : [binding.value]

  // 检查用户是否具有所需角色之一
  const hasPermission = requiredRoles.some((role: string) => userRoles.includes(role))

  // 如果没有权限，安全地移除元素
  if (!hasPermission) {
    removeElement(el)
  }
}

function removeElement(el: HTMLElement): void {
  if (el.parentNode) {
    el.parentNode.removeChild(el)
  }
}

const rolesDirective: Directive = {
  mounted: checkRolePermission,
  updated: checkRolePermission
}

export function setupRolesDirective(app: App): void {
  app.directive('roles', rolesDirective)
}
interface DepartmentsBinding extends DirectiveBinding {
  value: string | string[]
}

function checkDepartmentPermission(el: HTMLElement, binding: DepartmentsBinding): void {
  const userStore = useUserStore()
  const userDept = userStore.getUserInfo.department
  if (!userDept) {
    removeElement(el)
    return
  }
  const requiredDepts = Array.isArray(binding.value) ? binding.value : [binding.value]
  const hasPermission = requiredDepts.some((dept: string) => dept === userDept)
  if (!hasPermission) {
    removeElement(el)
  }
}

const departmentsDirective: Directive = {
  mounted: checkDepartmentPermission,
  updated: checkDepartmentPermission
}

export function setupDepartmentsDirective(app: App): void {
  app.directive('departments', departmentsDirective)
}
