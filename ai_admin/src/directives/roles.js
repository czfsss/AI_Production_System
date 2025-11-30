import { useUserStore } from '@/store/modules/user';
function checkRolePermission(el, binding) {
    const userStore = useUserStore();
    const userRoles = userStore.getUserInfo.roles;
    // 如果用户角色为空或未定义，移除元素
    if (!userRoles?.length) {
        removeElement(el);
        return;
    }
    // 确保指令值为数组格式
    const requiredRoles = Array.isArray(binding.value) ? binding.value : [binding.value];
    // 检查用户是否具有所需角色之一
    const hasPermission = requiredRoles.some((role) => userRoles.includes(role));
    // 如果没有权限，安全地移除元素
    if (!hasPermission) {
        removeElement(el);
    }
}
function removeElement(el) {
    if (el.parentNode) {
        el.parentNode.removeChild(el);
    }
}
const rolesDirective = {
    mounted: checkRolePermission,
    updated: checkRolePermission
};
export function setupRolesDirective(app) {
    app.directive('roles', rolesDirective);
}
function checkDepartmentPermission(el, binding) {
    const userStore = useUserStore();
    const userDept = userStore.getUserInfo.department;
    if (!userDept) {
        removeElement(el);
        return;
    }
    const requiredDepts = Array.isArray(binding.value) ? binding.value : [binding.value];
    const hasPermission = requiredDepts.some((dept) => dept === userDept);
    if (!hasPermission) {
        removeElement(el);
    }
}
const departmentsDirective = {
    mounted: checkDepartmentPermission,
    updated: checkDepartmentPermission
};
export function setupDepartmentsDirective(app) {
    app.directive('departments', departmentsDirective);
}
//# sourceMappingURL=roles.js.map