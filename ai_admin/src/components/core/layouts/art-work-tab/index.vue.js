/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { computed, onMounted, ref, watch, nextTick, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ArrowDown, Close } from '@element-plus/icons-vue';
import { storeToRefs } from 'pinia';
import { useWorktabStore } from '@/store/modules/worktab';
import { useUserStore } from '@/store/modules/user';
import { formatMenuTitle } from '@/router/utils/utils';
import { useSettingStore } from '@/store/modules/setting';
import { useCommon } from '@/composables/useCommon';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtWorkTab' });
// 基础设置
const { t } = useI18n();
const store = useWorktabStore();
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const { currentRoute } = router;
const settingStore = useSettingStore();
const { tabStyle, showWorkTab } = storeToRefs(settingStore);
// DOM 引用
const scrollRef = ref(null);
const tabsRef = ref(null);
const menuRef = ref();
// 状态管理
const scrollState = ref({
    translateX: 0,
    transition: ''
});
const touchState = ref({
    startX: 0,
    currentX: 0
});
const clickedPath = ref('');
// 计算属性
const list = computed(() => store.opened);
const activeTab = computed(() => currentRoute.value.path);
const activeTabIndex = computed(() => list.value.findIndex((tab) => tab.path === activeTab.value));
// 右键菜单逻辑
const useContextMenu = () => {
    const getClickedTabInfo = () => {
        const clickedIndex = list.value.findIndex((tab) => tab.path === clickedPath.value);
        const currentTab = list.value[clickedIndex];
        return {
            clickedIndex,
            currentTab,
            isLastTab: clickedIndex === list.value.length - 1,
            isOneTab: list.value.length === 1,
            isCurrentTab: clickedPath.value === activeTab.value
        };
    };
    // 检查标签页是否固定
    const checkTabsFixedStatus = (clickedIndex) => {
        const leftTabs = list.value.slice(0, clickedIndex);
        const rightTabs = list.value.slice(clickedIndex + 1);
        const otherTabs = list.value.filter((_, index) => index !== clickedIndex);
        return {
            areAllLeftTabsFixed: leftTabs.length > 0 && leftTabs.every((tab) => tab.fixedTab),
            areAllRightTabsFixed: rightTabs.length > 0 && rightTabs.every((tab) => tab.fixedTab),
            areAllOtherTabsFixed: otherTabs.length > 0 && otherTabs.every((tab) => tab.fixedTab),
            areAllTabsFixed: list.value.every((tab) => tab.fixedTab)
        };
    };
    // 右键菜单选项
    const menuItems = computed(() => {
        const { clickedIndex, currentTab, isLastTab, isOneTab, isCurrentTab } = getClickedTabInfo();
        const fixedStatus = checkTabsFixedStatus(clickedIndex);
        return [
            {
                key: 'refresh',
                label: t('worktab.btn.refresh'),
                icon: '&#xe6b3;',
                disabled: !isCurrentTab
            },
            {
                key: 'fixed',
                label: currentTab?.fixedTab ? t('worktab.btn.unfixed') : t('worktab.btn.fixed'),
                icon: '&#xe644;',
                disabled: false,
                showLine: true
            },
            {
                key: 'left',
                label: t('worktab.btn.closeLeft'),
                icon: '&#xe866;',
                disabled: clickedIndex === 0 || fixedStatus.areAllLeftTabsFixed
            },
            {
                key: 'right',
                label: t('worktab.btn.closeRight'),
                icon: '&#xe865;',
                disabled: isLastTab || fixedStatus.areAllRightTabsFixed
            },
            {
                key: 'other',
                label: t('worktab.btn.closeOther'),
                icon: '&#xe83a;',
                disabled: isOneTab || fixedStatus.areAllOtherTabsFixed
            },
            {
                key: 'all',
                label: t('worktab.btn.closeAll'),
                icon: '&#xe71a;',
                disabled: isOneTab || fixedStatus.areAllTabsFixed
            }
        ];
    });
    return { menuItems };
};
// 滚动逻辑
const useScrolling = () => {
    const setTransition = () => {
        scrollState.value.transition = 'transform 0.5s cubic-bezier(0.15, 0, 0.15, 1)';
        setTimeout(() => {
            scrollState.value.transition = '';
        }, 250);
    };
    const getCurrentTabElement = () => {
        return document.getElementById(`scroll-li-${activeTabIndex.value}`);
    };
    const calculateScrollPosition = () => {
        if (!scrollRef.value || !tabsRef.value)
            return;
        const scrollWidth = scrollRef.value.offsetWidth;
        const ulWidth = tabsRef.value.offsetWidth;
        const curTabEl = getCurrentTabElement();
        if (!curTabEl)
            return;
        const { offsetLeft, clientWidth } = curTabEl;
        const curTabRight = offsetLeft + clientWidth;
        const targetLeft = scrollWidth - curTabRight;
        return {
            scrollWidth,
            ulWidth,
            offsetLeft,
            clientWidth,
            curTabRight,
            targetLeft
        };
    };
    const autoPositionTab = () => {
        const positions = calculateScrollPosition();
        if (!positions)
            return;
        const { scrollWidth, ulWidth, offsetLeft, curTabRight, targetLeft } = positions;
        if ((offsetLeft > Math.abs(scrollState.value.translateX) && curTabRight <= scrollWidth) ||
            (scrollState.value.translateX < targetLeft && targetLeft < 0)) {
            return;
        }
        requestAnimationFrame(() => {
            if (curTabRight > scrollWidth) {
                scrollState.value.translateX = Math.max(targetLeft - 6, scrollWidth - ulWidth);
            }
            else if (offsetLeft < Math.abs(scrollState.value.translateX)) {
                scrollState.value.translateX = -offsetLeft;
            }
        });
    };
    const adjustPositionAfterClose = () => {
        const positions = calculateScrollPosition();
        if (!positions)
            return;
        const { scrollWidth, ulWidth, offsetLeft, clientWidth } = positions;
        const curTabLeft = offsetLeft + clientWidth;
        requestAnimationFrame(() => {
            scrollState.value.translateX = curTabLeft > scrollWidth ? scrollWidth - ulWidth : 0;
        });
    };
    return {
        setTransition,
        autoPositionTab,
        adjustPositionAfterClose
    };
};
// 事件处理逻辑
const useEventHandlers = () => {
    const { setTransition, adjustPositionAfterClose } = useScrolling();
    const handleWheelScroll = (event) => {
        if (!scrollRef.value || !tabsRef.value)
            return;
        event.preventDefault();
        if (tabsRef.value.offsetWidth <= scrollRef.value.offsetWidth)
            return;
        const xMax = 0;
        const xMin = scrollRef.value.offsetWidth - tabsRef.value.offsetWidth;
        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        scrollState.value.translateX = Math.min(Math.max(scrollState.value.translateX - delta, xMin), xMax);
    };
    const handleTouchStart = (event) => {
        touchState.value.startX = event.touches[0].clientX;
    };
    const handleTouchMove = (event) => {
        if (!scrollRef.value || !tabsRef.value)
            return;
        touchState.value.currentX = event.touches[0].clientX;
        const deltaX = touchState.value.currentX - touchState.value.startX;
        const xMin = scrollRef.value.offsetWidth - tabsRef.value.offsetWidth;
        scrollState.value.translateX = Math.min(Math.max(scrollState.value.translateX + deltaX, xMin), 0);
        touchState.value.startX = touchState.value.currentX;
    };
    const handleTouchEnd = () => {
        setTransition();
    };
    const setupEventListeners = () => {
        if (tabsRef.value) {
            tabsRef.value.addEventListener('wheel', handleWheelScroll, { passive: false });
            tabsRef.value.addEventListener('touchstart', handleTouchStart, { passive: true });
            tabsRef.value.addEventListener('touchmove', handleTouchMove, { passive: true });
            tabsRef.value.addEventListener('touchend', handleTouchEnd, { passive: true });
        }
    };
    const cleanupEventListeners = () => {
        if (tabsRef.value) {
            tabsRef.value.removeEventListener('wheel', handleWheelScroll);
            tabsRef.value.removeEventListener('touchstart', handleTouchStart);
            tabsRef.value.removeEventListener('touchmove', handleTouchMove);
            tabsRef.value.removeEventListener('touchend', handleTouchEnd);
        }
    };
    return {
        setupEventListeners,
        cleanupEventListeners,
        adjustPositionAfterClose
    };
};
// 标签页操作逻辑
const useTabOperations = (adjustPositionAfterClose) => {
    const clickTab = (item) => {
        router.push({
            path: item.path,
            query: item.query
        });
    };
    const closeWorktab = (type, tabPath) => {
        const path = typeof tabPath === 'string' ? tabPath : route.path;
        const closeActions = {
            current: () => store.removeTab(path),
            left: () => store.removeLeft(path),
            right: () => store.removeRight(path),
            other: () => store.removeOthers(path),
            all: () => store.removeAll()
        };
        closeActions[type]?.();
        setTimeout(() => {
            adjustPositionAfterClose();
        }, 100);
    };
    const showMenu = (e, path) => {
        clickedPath.value = path || '';
        menuRef.value?.show(e);
        e.preventDefault();
        e.stopPropagation();
    };
    const handleSelect = (item) => {
        const { key } = item;
        if (key === 'refresh') {
            useCommon().refresh();
            return;
        }
        if (key === 'fixed') {
            useWorktabStore().toggleFixedTab(clickedPath.value);
            return;
        }
        const activeIndex = list.value.findIndex((tab) => tab.path === activeTab.value);
        const clickedIndex = list.value.findIndex((tab) => tab.path === clickedPath.value);
        const navigationRules = {
            left: activeIndex < clickedIndex,
            right: activeIndex > clickedIndex,
            other: true
        };
        const shouldNavigate = navigationRules[key];
        if (shouldNavigate) {
            router.push(clickedPath.value);
        }
        closeWorktab(key, clickedPath.value);
    };
    return {
        clickTab,
        closeWorktab,
        showMenu,
        handleSelect
    };
};
// 组合所有逻辑
const { menuItems } = useContextMenu();
const { setTransition, autoPositionTab } = useScrolling();
const { setupEventListeners, cleanupEventListeners, adjustPositionAfterClose } = useEventHandlers();
const { clickTab, closeWorktab, showMenu, handleSelect } = useTabOperations(adjustPositionAfterClose);
// 生命周期
onMounted(() => {
    setupEventListeners();
    autoPositionTab();
});
onUnmounted(() => {
    cleanupEventListeners();
});
// 监听器
watch(() => currentRoute.value, () => {
    setTransition();
    autoPositionTab();
});
watch(() => userStore.language, () => {
    scrollState.value.translateX = 0;
    nextTick(() => {
        autoPositionTab();
    });
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_fnComponent = (await import('vue')).defineComponent({});
;
let __VLS_functionalComponentProps;
function __VLS_template() {
    const __VLS_ctx = {};
    const __VLS_localComponents = {
        ...{},
        ...{},
        ...__VLS_ctx,
    };
    let __VLS_components;
    const __VLS_localDirectives = {
        ...{},
        ...__VLS_ctx,
    };
    let __VLS_directives;
    let __VLS_styleScopedClasses;
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    if (__VLS_ctx.showWorkTab) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("worktab") }, ...{ class: (([__VLS_ctx.tabStyle])) }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("scroll-view") }, ref: ("scrollRef"), });
        // @ts-ignore navigation for `const scrollRef = ref()`
        __VLS_ctx.scrollRef;
        __VLS_elementAsFunction(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({ ...{ class: ("tabs") }, ref: ("tabsRef"), ...{ style: (({
                    transform: `translateX(${__VLS_ctx.scrollState.translateX}px)`,
                    transition: `${__VLS_ctx.scrollState.transition}`
                })) }, });
        // @ts-ignore navigation for `const tabsRef = ref()`
        __VLS_ctx.tabsRef;
        for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.list))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ ...{ onClick: (...[$event]) => {
                        if (!((__VLS_ctx.showWorkTab)))
                            return;
                        __VLS_ctx.clickTab(item);
                    } }, ...{ onContextmenu: ((e) => __VLS_ctx.showMenu(e, item.path)) }, ...{ class: ("art-custom-card") }, key: ((item.path)), ref: ((item.path)), ...{ class: (({ 'activ-tab': item.path === __VLS_ctx.activeTab })) }, id: ((`scroll-li-${index}`)), ...{ style: (({ padding: item.fixedTab ? '0 10px' : '0 8px 0 12px' })) }, });
            (item.customTitle || __VLS_ctx.formatMenuTitle(item.title));
            if (__VLS_ctx.list.length > 1 && !item.fixedTab) {
                const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
                /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
                // @ts-ignore
                const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClick': {} }, }));
                const __VLS_2 = __VLS_1({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
                let __VLS_6;
                const __VLS_7 = {
                    onClick: (...[$event]) => {
                        if (!((__VLS_ctx.showWorkTab)))
                            return;
                        if (!((__VLS_ctx.list.length > 1 && !item.fixedTab)))
                            return;
                        __VLS_ctx.closeWorktab('current', item.path);
                    }
                };
                let __VLS_3;
                let __VLS_4;
                const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.Close;
                /** @type { [typeof __VLS_components.Close, ] } */
                // @ts-ignore
                const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
                const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
                __VLS_nonNullable(__VLS_5.slots).default;
                var __VLS_5;
            }
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("line") }, });
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("right") }, });
        const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ ...{ 'onClick': {} }, ...{ class: ("btn console-box art-custom-card") }, }));
        const __VLS_16 = __VLS_15({ ...{ 'onClick': {} }, ...{ class: ("btn console-box art-custom-card") }, }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        let __VLS_20;
        const __VLS_21 = {
            onClick: ((e) => __VLS_ctx.showMenu(e, __VLS_ctx.activeTab))
        };
        let __VLS_17;
        let __VLS_18;
        const __VLS_22 = __VLS_resolvedLocalAndGlobalComponents.ArrowDown;
        /** @type { [typeof __VLS_components.ArrowDown, ] } */
        // @ts-ignore
        const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({}));
        const __VLS_24 = __VLS_23({}, ...__VLS_functionalComponentArgsRest(__VLS_23));
        __VLS_nonNullable(__VLS_19.slots).default;
        var __VLS_19;
        const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.ArtMenuRight;
        /** @type { [typeof __VLS_components.ArtMenuRight, ] } */
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({ ...{ 'onSelect': {} }, ref: ("menuRef"), menuItems: ((__VLS_ctx.menuItems)), menuWidth: ((140)), borderRadius: ((10)), }));
        const __VLS_30 = __VLS_29({ ...{ 'onSelect': {} }, ref: ("menuRef"), menuItems: ((__VLS_ctx.menuItems)), menuWidth: ((140)), borderRadius: ((10)), }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        // @ts-ignore navigation for `const menuRef = ref()`
        __VLS_ctx.menuRef;
        var __VLS_34 = {};
        let __VLS_35;
        const __VLS_36 = {
            onSelect: (__VLS_ctx.handleSelect)
        };
        let __VLS_31;
        let __VLS_32;
        var __VLS_33;
    }
    __VLS_styleScopedClasses['worktab'];
    __VLS_styleScopedClasses['scroll-view'];
    __VLS_styleScopedClasses['tabs'];
    __VLS_styleScopedClasses['art-custom-card'];
    __VLS_styleScopedClasses['activ-tab'];
    __VLS_styleScopedClasses['line'];
    __VLS_styleScopedClasses['right'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['console-box'];
    __VLS_styleScopedClasses['art-custom-card'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "scrollRef": __VLS_nativeElements['div'],
        "tabsRef": __VLS_nativeElements['ul'],
        "menuRef": __VLS_34,
    };
    var $refs;
    var $el;
    return {
        attrs: {},
        slots: __VLS_slots,
        refs: $refs,
        rootEl: $el,
    };
}
;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ArrowDown: ArrowDown,
            Close: Close,
            formatMenuTitle: formatMenuTitle,
            tabStyle: tabStyle,
            showWorkTab: showWorkTab,
            scrollRef: scrollRef,
            tabsRef: tabsRef,
            menuRef: menuRef,
            scrollState: scrollState,
            list: list,
            activeTab: activeTab,
            menuItems: menuItems,
            clickTab: clickTab,
            closeWorktab: closeWorktab,
            showMenu: showMenu,
            handleSelect: handleSelect,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map