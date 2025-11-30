/**
 * 全局组件配置
 * 用于管理应用中的全局组件，如设置面板、搜索、锁屏等
 */
import { defineAsyncComponent } from 'vue';
// 全局组件配置列表
export const globalComponentsConfig = [
    {
        name: '设置面板',
        key: 'settings-panel',
        component: defineAsyncComponent(() => import('@/components/core/layouts/art-settings-panel/index.vue')),
        enabled: true
    },
    {
        name: '全局搜索',
        key: 'global-search',
        component: defineAsyncComponent(() => import('@/components/core/layouts/art-global-search/index.vue')),
        enabled: true
    },
    {
        name: '锁屏',
        key: 'screen-lock',
        component: defineAsyncComponent(() => import('@/components/core/layouts/art-screen-lock/index.vue')),
        enabled: true
    },
    {
        name: '聊天窗口',
        key: 'chat-window',
        component: defineAsyncComponent(() => import('@/components/core/layouts/art-chat-window/index.vue')),
        enabled: true
    },
    {
        name: '礼花效果',
        key: 'fireworks-effect',
        component: defineAsyncComponent(() => import('@/components/core/layouts/art-fireworks-effect/index.vue')),
        enabled: true
    },
    {
        name: '水印效果',
        key: 'watermark',
        component: defineAsyncComponent(() => import('@/components/core/others/art-watermark/index.vue')),
        enabled: true
    }
];
// 获取启用的全局组件
export const getEnabledGlobalComponents = () => {
    return globalComponentsConfig.filter((config) => config.enabled !== false);
};
// 根据key获取组件配置
export const getGlobalComponentByKey = (key) => {
    return globalComponentsConfig.find((config) => config.key === key);
};
//# sourceMappingURL=component.js.map