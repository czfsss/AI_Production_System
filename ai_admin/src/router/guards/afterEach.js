import { useSettingStore } from '@/store/modules/setting';
import NProgress from 'nprogress';
import { useCommon } from '@/composables/useCommon';
/** 路由全局后置守卫 */
export function setupAfterEachGuard(router) {
    router.afterEach(() => {
        useCommon().scrollToTop();
        if (useSettingStore().showNprogress)
            NProgress.done();
    });
}
//# sourceMappingURL=afterEach.js.map