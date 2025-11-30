import { router } from '@/router';
function checkAuthPermission(el, binding) {
    // 获取当前路由的权限列表
    const authList = router.currentRoute.value.meta.authList || [];
    // 检查是否有对应的权限标识
    const hasPermission = authList.some((item) => item.authMark === binding.value);
    // 如果没有权限，移除元素
    if (!hasPermission) {
        removeElement(el);
    }
}
function removeElement(el) {
    if (el.parentNode) {
        el.parentNode.removeChild(el);
    }
}
const authDirective = {
    mounted: checkAuthPermission,
    updated: checkAuthPermission
};
export function setupAuthDirective(app) {
    app.directive('auth', authDirective);
}
//# sourceMappingURL=auth.js.map