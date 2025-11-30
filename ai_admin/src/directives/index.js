import { setupAuthDirective } from './auth';
import { setupHighlightDirective } from './highlight';
import { setupRippleDirective } from './ripple';
import { setupRolesDirective, setupDepartmentsDirective } from './roles';
export function setupGlobDirectives(app) {
    setupAuthDirective(app); // 权限指令
    setupRolesDirective(app); // 角色权限指令
    setupDepartmentsDirective(app); // 部门权限指令
    setupHighlightDirective(app); // 高亮指令
    setupRippleDirective(app); // 水波纹指令
}
//# sourceMappingURL=index.js.map