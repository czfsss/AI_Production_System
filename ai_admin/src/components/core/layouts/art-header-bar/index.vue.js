/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { useFullscreen, useWindowSize } from '@vueuse/core';
import { MenuTypeEnum } from '@/enums/appEnum';
import { useSettingStore } from '@/store/modules/setting';
import { useUserStore } from '@/store/modules/user';
import { useMenuStore } from '@/store/modules/menu';
import AppConfig from '@/config';
import { languageOptions } from '@/locales';
import { WEB_LINKS } from '@/utils/constants';
import { mittBus } from '@/utils/sys';
import { themeAnimation } from '@/utils/theme/animation';
import { useCommon } from '@/composables/useCommon';
import { useHeaderBar } from '@/composables/useHeaderBar';
import userIconRaw from '@/用户.svg?raw';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtHeaderBar' });
// 检测操作系统类型
const isWindows = navigator.userAgent.includes('Windows');
const router = useRouter();
const { locale, t } = useI18n();
const { width } = useWindowSize();
const settingStore = useSettingStore();
const userStore = useUserStore();
const menuStore = useMenuStore();
// 顶部栏功能配置
const { shouldShowMenuButton, shouldShowRefreshButton, shouldShowFastEnter, shouldShowBreadcrumb, shouldShowGlobalSearch, shouldShowFullscreen, shouldShowNotification, shouldShowChat, shouldShowLanguage, shouldShowSettings, shouldShowThemeToggle, fastEnterMinWidth: headerBarFastEnterMinWidth } = useHeaderBar();
const { menuOpen, systemThemeColor, showSettingGuide, menuType, isDark, tabStyle } = storeToRefs(settingStore);
const { language, getUserInfo: userInfo } = storeToRefs(userStore);
const { menuList } = storeToRefs(menuStore);
const showNotice = ref(false);
const notice = ref(null);
const userMenuPopover = ref();
// 菜单类型判断
const isLeftMenu = computed(() => menuType.value === MenuTypeEnum.LEFT);
const isDualMenu = computed(() => menuType.value === MenuTypeEnum.DUAL_MENU);
const isTopMenu = computed(() => menuType.value === MenuTypeEnum.TOP);
const isTopLeftMenu = computed(() => menuType.value === MenuTypeEnum.TOP_LEFT);
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
onMounted(() => {
    initLanguage();
    document.addEventListener('click', bodyCloseNotice);
});
onUnmounted(() => {
    document.removeEventListener('click', bodyCloseNotice);
});
/**
 * 切换全屏状态
 */
const toggleFullScreen = () => {
    toggleFullscreen();
};
/**
 * 切换菜单显示/隐藏状态
 */
const visibleMenu = () => {
    settingStore.setMenuOpen(!menuOpen.value);
};
/**
 * 页面跳转
 * @param {string} path - 目标路径
 */
const goPage = (path) => {
    router.push(path);
};
/**
 * 打开文档页面
 */
const toDocs = () => {
    window.open(WEB_LINKS.DOCS);
};
/**
 * 跳转到首页
 */
const toHome = () => {
    router.push(useCommon().homePath.value);
};
/**
 * 用户登出确认
 */
const loginOut = () => {
    closeUserMenu();
    setTimeout(() => {
        ElMessageBox.confirm(t('common.logOutTips'), t('common.tips'), {
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
            customClass: 'login-out-dialog'
        }).then(() => {
            userStore.logOut();
        });
    }, 200);
};
/**
 * 刷新页面
 * @param {number} time - 延迟时间，默认为0毫秒
 */
const reload = (time = 0) => {
    setTimeout(() => {
        useCommon().refresh();
    }, time);
};
/**
 * 初始化语言设置
 */
const initLanguage = () => {
    locale.value = language.value;
};
/**
 * 切换系统语言
 * @param {LanguageEnum} lang - 目标语言类型
 */
const changeLanguage = (lang) => {
    if (locale.value === lang)
        return;
    locale.value = lang;
    userStore.setLanguage(lang);
    reload(50);
};
/**
 * 打开设置面板
 */
const openSetting = () => {
    mittBus.emit('openSetting');
    // 隐藏设置引导提示
    if (showSettingGuide.value) {
        settingStore.hideSettingGuide();
    }
};
/**
 * 打开全局搜索对话框
 */
const openSearchDialog = () => {
    mittBus.emit('openSearchDialog');
};
/**
 * 点击页面其他区域关闭通知面板
 * @param {Event} e - 点击事件对象
 */
const bodyCloseNotice = (e) => {
    let { className } = e.target;
    if (showNotice.value) {
        if (typeof className === 'object') {
            showNotice.value = false;
            return;
        }
        if (className.indexOf('notice-btn') === -1) {
            showNotice.value = false;
        }
    }
};
/**
 * 切换通知面板显示状态
 */
const visibleNotice = () => {
    showNotice.value = !showNotice.value;
};
/**
 * 打开聊天窗口
 */
const openChat = () => {
    mittBus.emit('openChat');
};
/**
 * 打开锁屏功能
 */
const lockScreen = () => {
    mittBus.emit('openLockScreen');
};
/**
 * 关闭用户菜单弹出层
 */
const closeUserMenu = () => {
    setTimeout(() => {
        userMenuPopover.value.hide();
    }, 100);
}; /* PartiallyEnd: #3632/scriptSetup.vue */
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
    __VLS_styleScopedClasses['svg-icon'];
    __VLS_styleScopedClasses['svg-icon'];
    __VLS_styleScopedClasses['svg-icon'];
    __VLS_styleScopedClasses['svg-icon'];
    __VLS_styleScopedClasses['cover'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("layout-top-bar") }, ...{ class: (([__VLS_ctx.tabStyle])) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("menu") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("left") }, ...{ style: ({}) }, });
    if (__VLS_ctx.isTopMenu) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.toHome) }, ...{ class: ("top-header") }, });
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtLogo;
        /** @type { [typeof __VLS_components.ArtLogo, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ class: ("logo") }, }));
        const __VLS_2 = __VLS_1({ ...{ class: ("logo") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        if (__VLS_ctx.width >= 1400) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            (__VLS_ctx.AppConfig.systemInfo.name);
        }
    }
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ArtLogo;
    /** @type { [typeof __VLS_components.ArtLogo, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ 'onClick': {} }, ...{ class: ("logo2") }, }));
    const __VLS_8 = __VLS_7({ ...{ 'onClick': {} }, ...{ class: ("logo2") }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    let __VLS_12;
    const __VLS_13 = {
        onClick: (__VLS_ctx.toHome)
    };
    let __VLS_9;
    let __VLS_10;
    var __VLS_11;
    if (__VLS_ctx.isLeftMenu && __VLS_ctx.shouldShowMenuButton) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("btn-box") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("btn menu-btn") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ onClick: (__VLS_ctx.visibleMenu) }, ...{ class: ("iconfont-sys") }, });
    }
    if (__VLS_ctx.shouldShowRefreshButton) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("btn-box") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("btn refresh-btn") }, ...{ style: (({ marginLeft: !__VLS_ctx.isLeftMenu ? '10px' : '0' })) }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ onClick: (...[$event]) => {
                    if (!((__VLS_ctx.shouldShowRefreshButton)))
                        return;
                    __VLS_ctx.reload();
                } }, ...{ class: ("iconfont-sys") }, });
    }
    if (__VLS_ctx.shouldShowFastEnter && __VLS_ctx.width >= __VLS_ctx.headerBarFastEnterMinWidth) {
        const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ArtFastEnter;
        /** @type { [typeof __VLS_components.ArtFastEnter, ] } */
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({}));
        const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
    }
    if ((__VLS_ctx.shouldShowBreadcrumb && __VLS_ctx.isLeftMenu) || (__VLS_ctx.shouldShowBreadcrumb && __VLS_ctx.isDualMenu)) {
        const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ArtBreadcrumb;
        /** @type { [typeof __VLS_components.ArtBreadcrumb, ] } */
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
        const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
    }
    if (__VLS_ctx.isTopMenu) {
        const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ArtHorizontalMenu;
        /** @type { [typeof __VLS_components.ArtHorizontalMenu, ] } */
        // @ts-ignore
        const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ list: ((__VLS_ctx.menuList)), }));
        const __VLS_28 = __VLS_27({ list: ((__VLS_ctx.menuList)), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    }
    if (__VLS_ctx.isTopLeftMenu) {
        const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ArtMixedMenu;
        /** @type { [typeof __VLS_components.ArtMixedMenu, ] } */
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ list: ((__VLS_ctx.menuList)), }));
        const __VLS_34 = __VLS_33({ list: ((__VLS_ctx.menuList)), }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("right") }, });
    if (__VLS_ctx.shouldShowGlobalSearch) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("search-wrap") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.openSearchDialog) }, ...{ class: ("search-input") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("left") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.$t('topBar.search.title'));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("search-keydown") }, });
        if (__VLS_ctx.isWindows) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
        }
        else {
            __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    if (__VLS_ctx.shouldShowFullscreen) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.toggleFullScreen) }, ...{ class: ("btn-box screen-box") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("btn") }, ...{ class: (({ 'full-screen-btn': !__VLS_ctx.isFullscreen, 'exit-full-screen-btn': __VLS_ctx.isFullscreen })) }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
        (__VLS_ctx.isFullscreen ? '&#xe62d;' : '&#xe8ce;');
    }
    if (__VLS_ctx.shouldShowNotification) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.visibleNotice) }, ...{ class: ("btn-box notice-btn") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("btn notice-button") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys notice-btn") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("count notice-btn") }, });
    }
    if (__VLS_ctx.shouldShowChat) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.openChat) }, ...{ class: ("btn-box chat-btn") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("btn chat-button") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("dot") }, });
    }
    if (__VLS_ctx.shouldShowLanguage) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("btn-box") }, });
        const __VLS_38 = __VLS_resolvedLocalAndGlobalComponents.ElDropdown;
        /** @type { [typeof __VLS_components.ElDropdown, typeof __VLS_components.ElDropdown, ] } */
        // @ts-ignore
        const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({ ...{ 'onCommand': {} }, popperClass: ("langDropDownStyle"), }));
        const __VLS_40 = __VLS_39({ ...{ 'onCommand': {} }, popperClass: ("langDropDownStyle"), }, ...__VLS_functionalComponentArgsRest(__VLS_39));
        let __VLS_44;
        const __VLS_45 = {
            onCommand: (__VLS_ctx.changeLanguage)
        };
        let __VLS_41;
        let __VLS_42;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("btn language-btn") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { dropdown: __VLS_thisSlot } = __VLS_nonNullable(__VLS_43.slots);
            const __VLS_46 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownMenu;
            /** @type { [typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.ElDropdownMenu, ] } */
            // @ts-ignore
            const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({}));
            const __VLS_48 = __VLS_47({}, ...__VLS_functionalComponentArgsRest(__VLS_47));
            for (const [item] of __VLS_getVForSourceType((__VLS_ctx.languageOptions))) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((item.value)), ...{ class: ("lang-btn-item") }, });
                const __VLS_52 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.ElDropdownItem, ] } */
                // @ts-ignore
                const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({ command: ((item.value)), ...{ class: (({ 'is-selected': __VLS_ctx.locale === item.value })) }, }));
                const __VLS_54 = __VLS_53({ command: ((item.value)), ...{ class: (({ 'is-selected': __VLS_ctx.locale === item.value })) }, }, ...__VLS_functionalComponentArgsRest(__VLS_53));
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("menu-txt") }, });
                (item.label);
                if (__VLS_ctx.locale === item.value) {
                    __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
                }
                __VLS_nonNullable(__VLS_57.slots).default;
                var __VLS_57;
            }
            __VLS_nonNullable(__VLS_51.slots).default;
            var __VLS_51;
        }
        var __VLS_43;
    }
    if (__VLS_ctx.shouldShowSettings) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.openSetting) }, ...{ class: ("btn-box") }, });
        const __VLS_58 = __VLS_resolvedLocalAndGlobalComponents.ElPopover;
        /** @type { [typeof __VLS_components.ElPopover, typeof __VLS_components.ElPopover, ] } */
        // @ts-ignore
        const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({ visible: ((__VLS_ctx.showSettingGuide)), placement: ("bottom-start"), width: ((190)), offset: ((0)), }));
        const __VLS_60 = __VLS_59({ visible: ((__VLS_ctx.showSettingGuide)), placement: ("bottom-start"), width: ((190)), offset: ((0)), }, ...__VLS_functionalComponentArgsRest(__VLS_59));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { reference: __VLS_thisSlot } = __VLS_nonNullable(__VLS_63.slots);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("btn setting-btn") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_63.slots);
            __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            (__VLS_ctx.$t('topBar.guide.title'));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ style: (({ color: __VLS_ctx.systemThemeColor })) }, });
            (__VLS_ctx.$t('topBar.guide.theme'));
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ style: (({ color: __VLS_ctx.systemThemeColor })) }, });
            (__VLS_ctx.$t('topBar.guide.menu'));
            (__VLS_ctx.$t('topBar.guide.description'));
        }
        var __VLS_63;
    }
    if (__VLS_ctx.shouldShowThemeToggle) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.themeAnimation) }, ...{ class: ("btn-box") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("btn theme-btn") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
        (__VLS_ctx.isDark ? '&#xe6b5;' : '&#xe725;');
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("user") }, });
    const __VLS_64 = __VLS_resolvedLocalAndGlobalComponents.ElPopover;
    /** @type { [typeof __VLS_components.ElPopover, typeof __VLS_components.ElPopover, ] } */
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({ ref: ("userMenuPopover"), placement: ("bottom-end"), width: ((240)), hideAfter: ((0)), offset: ((10)), trigger: ("hover"), showArrow: ((false)), popperClass: ("user-menu-popover"), popperStyle: ("border: 1px solid var(--art-border-dashed-color); border-radius: calc(var(--custom-radius) / 2 + 4px); padding: 5px 16px;"), }));
    const __VLS_66 = __VLS_65({ ref: ("userMenuPopover"), placement: ("bottom-end"), width: ((240)), hideAfter: ((0)), offset: ((10)), trigger: ("hover"), showArrow: ((false)), popperClass: ("user-menu-popover"), popperStyle: ("border: 1px solid var(--art-border-dashed-color); border-radius: calc(var(--custom-radius) / 2 + 4px); padding: 5px 16px;"), }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    // @ts-ignore navigation for `const userMenuPopover = ref()`
    __VLS_ctx.userMenuPopover;
    var __VLS_70 = {};
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { reference: __VLS_thisSlot } = __VLS_nonNullable(__VLS_69.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("cover svg-icon") }, });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.userIconRaw) }, null, null);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_69.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("user-menu-box") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("user-head") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("user-wrap") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("name") }, });
        (__VLS_ctx.userInfo.nickname || __VLS_ctx.userInfo.username);
        __VLS_elementAsFunction(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({ ...{ class: ("user-menu") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.goPage('/system/user-center');
                } }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("menu-icon iconfont-sys") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("menu-txt") }, });
        (__VLS_ctx.$t('topBar.user.userCenter'));
        __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.toDocs();
                } }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("menu-icon iconfont-sys") }, ...{ style: ({}) }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("menu-txt") }, });
        (__VLS_ctx.$t('topBar.user.docs'));
        __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.lockScreen();
                } }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("menu-icon iconfont-sys") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("menu-txt") }, });
        (__VLS_ctx.$t('topBar.user.lockScreen'));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("line") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.loginOut) }, ...{ class: ("logout-btn") }, });
        (__VLS_ctx.$t('topBar.user.logout'));
    }
    var __VLS_69;
    const __VLS_71 = __VLS_resolvedLocalAndGlobalComponents.ArtWorkTab;
    /** @type { [typeof __VLS_components.ArtWorkTab, ] } */
    // @ts-ignore
    const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({}));
    const __VLS_73 = __VLS_72({}, ...__VLS_functionalComponentArgsRest(__VLS_72));
    const __VLS_77 = __VLS_resolvedLocalAndGlobalComponents.ArtNotification;
    /** @type { [typeof __VLS_components.ArtNotification, ] } */
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({ value: ((__VLS_ctx.showNotice)), ref: ("notice"), }));
    const __VLS_79 = __VLS_78({ value: ((__VLS_ctx.showNotice)), ref: ("notice"), }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    // @ts-ignore navigation for `const notice = ref()`
    __VLS_ctx.notice;
    var __VLS_83 = {};
    var __VLS_82;
    __VLS_styleScopedClasses['layout-top-bar'];
    __VLS_styleScopedClasses['menu'];
    __VLS_styleScopedClasses['left'];
    __VLS_styleScopedClasses['top-header'];
    __VLS_styleScopedClasses['logo'];
    __VLS_styleScopedClasses['logo2'];
    __VLS_styleScopedClasses['btn-box'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['menu-btn'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['btn-box'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['refresh-btn'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['right'];
    __VLS_styleScopedClasses['search-wrap'];
    __VLS_styleScopedClasses['search-input'];
    __VLS_styleScopedClasses['left'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['search-keydown'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['btn-box'];
    __VLS_styleScopedClasses['screen-box'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['full-screen-btn'];
    __VLS_styleScopedClasses['exit-full-screen-btn'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['btn-box'];
    __VLS_styleScopedClasses['notice-btn'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['notice-button'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['notice-btn'];
    __VLS_styleScopedClasses['count'];
    __VLS_styleScopedClasses['notice-btn'];
    __VLS_styleScopedClasses['btn-box'];
    __VLS_styleScopedClasses['chat-btn'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['chat-button'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['dot'];
    __VLS_styleScopedClasses['btn-box'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['language-btn'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['lang-btn-item'];
    __VLS_styleScopedClasses['is-selected'];
    __VLS_styleScopedClasses['menu-txt'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['btn-box'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['setting-btn'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['btn-box'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['theme-btn'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['user'];
    __VLS_styleScopedClasses['cover'];
    __VLS_styleScopedClasses['svg-icon'];
    __VLS_styleScopedClasses['user-menu-box'];
    __VLS_styleScopedClasses['user-head'];
    __VLS_styleScopedClasses['user-wrap'];
    __VLS_styleScopedClasses['name'];
    __VLS_styleScopedClasses['user-menu'];
    __VLS_styleScopedClasses['menu-icon'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['menu-txt'];
    __VLS_styleScopedClasses['menu-icon'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['menu-txt'];
    __VLS_styleScopedClasses['menu-icon'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['menu-txt'];
    __VLS_styleScopedClasses['line'];
    __VLS_styleScopedClasses['logout-btn'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "userMenuPopover": __VLS_70,
        "notice": __VLS_83,
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
            AppConfig: AppConfig,
            languageOptions: languageOptions,
            themeAnimation: themeAnimation,
            userIconRaw: userIconRaw,
            isWindows: isWindows,
            locale: locale,
            width: width,
            shouldShowMenuButton: shouldShowMenuButton,
            shouldShowRefreshButton: shouldShowRefreshButton,
            shouldShowFastEnter: shouldShowFastEnter,
            shouldShowBreadcrumb: shouldShowBreadcrumb,
            shouldShowGlobalSearch: shouldShowGlobalSearch,
            shouldShowFullscreen: shouldShowFullscreen,
            shouldShowNotification: shouldShowNotification,
            shouldShowChat: shouldShowChat,
            shouldShowLanguage: shouldShowLanguage,
            shouldShowSettings: shouldShowSettings,
            shouldShowThemeToggle: shouldShowThemeToggle,
            headerBarFastEnterMinWidth: headerBarFastEnterMinWidth,
            systemThemeColor: systemThemeColor,
            showSettingGuide: showSettingGuide,
            isDark: isDark,
            tabStyle: tabStyle,
            userInfo: userInfo,
            menuList: menuList,
            showNotice: showNotice,
            notice: notice,
            userMenuPopover: userMenuPopover,
            isLeftMenu: isLeftMenu,
            isDualMenu: isDualMenu,
            isTopMenu: isTopMenu,
            isTopLeftMenu: isTopLeftMenu,
            isFullscreen: isFullscreen,
            toggleFullScreen: toggleFullScreen,
            visibleMenu: visibleMenu,
            goPage: goPage,
            toDocs: toDocs,
            toHome: toHome,
            loginOut: loginOut,
            reload: reload,
            changeLanguage: changeLanguage,
            openSetting: openSetting,
            openSearchDialog: openSearchDialog,
            visibleNotice: visibleNotice,
            openChat: openChat,
            lockScreen: lockScreen,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map