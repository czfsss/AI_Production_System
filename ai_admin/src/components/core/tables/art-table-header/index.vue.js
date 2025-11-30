/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { TableSizeEnum } from '@/enums/formEnum';
import { useTableStore } from '@/store/modules/table';
import { ElPopover, ElCheckbox, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';
import { VueDraggable } from 'vue-draggable-plus';
import { useI18n } from 'vue-i18n';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtTableHeader' });
const { t } = useI18n();
const props = withDefaults(defineProps(), {
    showZebra: true,
    showBorder: true,
    showHeaderBackground: true,
    fullClass: 'art-page-view',
    layout: 'search,refresh,size,fullscreen,columns,settings',
    showSearchBar: undefined
});
const columns = defineModel('columns', {
    required: false,
    default: () => []
});
const emit = defineEmits();
/** 表格大小选项配置 */
const tableSizeOptions = [
    { value: TableSizeEnum.SMALL, label: t('table.sizeOptions.small') },
    { value: TableSizeEnum.DEFAULT, label: t('table.sizeOptions.default') },
    { value: TableSizeEnum.LARGE, label: t('table.sizeOptions.large') }
];
const tableStore = useTableStore();
const { tableSize, isZebra, isBorder, isHeaderBackground } = storeToRefs(tableStore);
/** 解析 layout 属性，转换为数组 */
const layoutItems = computed(() => {
    return props.layout.split(',').map((item) => item.trim());
});
/**
 * 检查组件是否应该显示
 * @param componentName 组件名称
 * @returns 是否显示
 */
const shouldShow = (componentName) => {
    return layoutItems.value.includes(componentName);
};
/** 搜索事件处理 */
const search = () => {
    // 切换搜索栏显示状态
    emit('update:showSearchBar', !props.showSearchBar);
    emit('search');
};
/** 刷新事件处理 */
const refresh = () => {
    isManualRefresh.value = true;
    emit('refresh');
};
/**
 * 表格大小变化处理
 * @param command 表格大小枚举值
 */
const handleTableSizeChange = (command) => {
    useTableStore().setTableSize(command);
};
/** 是否手动点击刷新 */
const isManualRefresh = ref(false);
/** 加载中 */
const isFullScreen = ref(false);
/** 保存原始的 overflow 样式，用于退出全屏时恢复 */
const originalOverflow = ref('');
/**
 * 切换全屏状态
 * 进入全屏时会隐藏页面滚动条，退出时恢复原状态
 */
const toggleFullScreen = () => {
    const el = document.querySelector(`.${props.fullClass}`);
    if (!el)
        return;
    isFullScreen.value = !isFullScreen.value;
    if (isFullScreen.value) {
        // 进入全屏：保存原始样式并隐藏滚动条
        originalOverflow.value = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        el.classList.add('el-full-screen');
        tableStore.setIsFullScreen(true);
    }
    else {
        // 退出全屏：恢复原始样式
        document.body.style.overflow = originalOverflow.value;
        el.classList.remove('el-full-screen');
        tableStore.setIsFullScreen(false);
    }
};
/**
 * ESC键退出全屏的事件处理器
 * 需要保存引用以便在组件卸载时正确移除监听器
 */
const handleEscapeKey = (e) => {
    if (e.key === 'Escape' && isFullScreen.value) {
        toggleFullScreen();
    }
};
/** 组件挂载时注册全局事件监听器 */
onMounted(() => {
    document.addEventListener('keydown', handleEscapeKey);
});
/** 组件卸载时清理资源 */
onUnmounted(() => {
    // 移除事件监听器
    document.removeEventListener('keydown', handleEscapeKey);
    // 如果组件在全屏状态下被卸载，恢复页面滚动状态
    if (isFullScreen.value) {
        document.body.style.overflow = originalOverflow.value;
        const el = document.querySelector(`.${props.fullClass}`);
        if (el) {
            el.classList.remove('el-full-screen');
        }
    }
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    showZebra: true,
    showBorder: true,
    showHeaderBackground: true,
    fullClass: 'art-page-view',
    layout: 'search,refresh,size,fullscreen,columns,settings',
    showSearchBar: undefined
});
const __VLS_fnComponent = (await import('vue')).defineComponent({
    __typeEmits: {},
});
;
let __VLS_functionalComponentProps;
const __VLS_defaults = {
    columns: () => [],
};
const __VLS_modelEmit = defineEmits();
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
    __VLS_styleScopedClasses['el-dropdown-menu__item'];
    __VLS_styleScopedClasses['table-header'];
    __VLS_styleScopedClasses['right'];
    __VLS_styleScopedClasses['btn'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("table-header") }, id: ("art-table-header"), });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("left") }, });
    var __VLS_0 = {};
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("right") }, });
    if (__VLS_ctx.showSearchBar != null) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.search) }, ...{ class: ("btn") }, ...{ class: (({ active: __VLS_ctx.showSearchBar })) }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
    }
    if (__VLS_ctx.shouldShow('refresh')) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.refresh) }, ...{ class: ("btn") }, ...{ class: (({ loading: __VLS_ctx.loading && __VLS_ctx.isManualRefresh })) }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
    }
    if (__VLS_ctx.shouldShow('size')) {
        const __VLS_1 = __VLS_resolvedLocalAndGlobalComponents.ElDropdown;
        /** @type { [typeof __VLS_components.ElDropdown, typeof __VLS_components.ElDropdown, ] } */
        // @ts-ignore
        const __VLS_2 = __VLS_asFunctionalComponent(__VLS_1, new __VLS_1({ ...{ 'onCommand': {} }, }));
        const __VLS_3 = __VLS_2({ ...{ 'onCommand': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_2));
        let __VLS_7;
        const __VLS_8 = {
            onCommand: (__VLS_ctx.handleTableSizeChange)
        };
        let __VLS_4;
        let __VLS_5;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("btn") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { dropdown: __VLS_thisSlot } = __VLS_nonNullable(__VLS_6.slots);
            const __VLS_9 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownMenu;
            /** @type { [typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.ElDropdownMenu, ] } */
            // @ts-ignore
            const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({}));
            const __VLS_11 = __VLS_10({}, ...__VLS_functionalComponentArgsRest(__VLS_10));
            for (const [item] of __VLS_getVForSourceType((__VLS_ctx.tableSizeOptions))) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((item.value)), ...{ class: ("table-size-btn-item") }, });
                const __VLS_15 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.ElDropdownItem, ] } */
                // @ts-ignore
                const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({ key: ((item.value)), command: ((item.value)), ...{ class: (({ 'is-selected': __VLS_ctx.tableSize === item.value })) }, }));
                const __VLS_17 = __VLS_16({ key: ((item.value)), command: ((item.value)), ...{ class: (({ 'is-selected': __VLS_ctx.tableSize === item.value })) }, }, ...__VLS_functionalComponentArgsRest(__VLS_16));
                (item.label);
                __VLS_nonNullable(__VLS_20.slots).default;
                var __VLS_20;
            }
            __VLS_nonNullable(__VLS_14.slots).default;
            var __VLS_14;
        }
        var __VLS_6;
    }
    if (__VLS_ctx.shouldShow('fullscreen')) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.toggleFullScreen) }, ...{ class: ("btn") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
        (__VLS_ctx.isFullScreen ? '&#xe62d;' : '&#xe8ce;');
    }
    if (__VLS_ctx.shouldShow('columns')) {
        const __VLS_21 = __VLS_resolvedLocalAndGlobalComponents.ElPopover;
        /** @type { [typeof __VLS_components.ElPopover, typeof __VLS_components.ElPopover, ] } */
        // @ts-ignore
        const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({ placement: ("bottom"), trigger: ("click"), }));
        const __VLS_23 = __VLS_22({ placement: ("bottom"), trigger: ("click"), }, ...__VLS_functionalComponentArgsRest(__VLS_22));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { reference: __VLS_thisSlot } = __VLS_nonNullable(__VLS_26.slots);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("btn") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_27 = __VLS_resolvedLocalAndGlobalComponents.VueDraggable;
        /** @type { [typeof __VLS_components.VueDraggable, typeof __VLS_components.VueDraggable, ] } */
        // @ts-ignore
        const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({ modelValue: ((__VLS_ctx.columns)), disabled: ((false)), filter: (".fixed-column"), preventOnFilter: ((false)), }));
        const __VLS_29 = __VLS_28({ modelValue: ((__VLS_ctx.columns)), disabled: ((false)), filter: (".fixed-column"), preventOnFilter: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_28));
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.columns))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((item.prop || item.type)), ...{ class: ("column-option") }, ...{ class: (({ 'fixed-column': item.fixed })) }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("drag-icon") }, ...{ class: (({ disabled: item.fixed })) }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
            (item.fixed ? '&#xe648;' : '&#xe648;');
            const __VLS_33 = __VLS_resolvedLocalAndGlobalComponents.ElCheckbox;
            /** @type { [typeof __VLS_components.ElCheckbox, typeof __VLS_components.ElCheckbox, ] } */
            // @ts-ignore
            const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({ modelValue: ((item.checked)), disabled: ((item.disabled)), }));
            const __VLS_35 = __VLS_34({ modelValue: ((item.checked)), disabled: ((item.disabled)), }, ...__VLS_functionalComponentArgsRest(__VLS_34));
            (item.label || (item.type === 'selection' ? __VLS_ctx.t('table.selection') : ''));
            __VLS_nonNullable(__VLS_38.slots).default;
            var __VLS_38;
        }
        __VLS_nonNullable(__VLS_32.slots).default;
        var __VLS_32;
        var __VLS_26;
    }
    if (__VLS_ctx.shouldShow('settings')) {
        const __VLS_39 = __VLS_resolvedLocalAndGlobalComponents.ElPopover;
        /** @type { [typeof __VLS_components.ElPopover, typeof __VLS_components.ElPopover, ] } */
        // @ts-ignore
        const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({ placement: ("bottom"), trigger: ("click"), }));
        const __VLS_41 = __VLS_40({ placement: ("bottom"), trigger: ("click"), }, ...__VLS_functionalComponentArgsRest(__VLS_40));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { reference: __VLS_thisSlot } = __VLS_nonNullable(__VLS_44.slots);
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("btn") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, ...{ style: ({}) }, });
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        if (__VLS_ctx.showZebra) {
            const __VLS_45 = __VLS_resolvedLocalAndGlobalComponents.ElCheckbox;
            /** @type { [typeof __VLS_components.ElCheckbox, typeof __VLS_components.ElCheckbox, ] } */
            // @ts-ignore
            const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({ modelValue: ((__VLS_ctx.isZebra)), value: ((true)), }));
            const __VLS_47 = __VLS_46({ modelValue: ((__VLS_ctx.isZebra)), value: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_46));
            (__VLS_ctx.t('table.zebra'));
            __VLS_nonNullable(__VLS_50.slots).default;
            var __VLS_50;
        }
        if (__VLS_ctx.showBorder) {
            const __VLS_51 = __VLS_resolvedLocalAndGlobalComponents.ElCheckbox;
            /** @type { [typeof __VLS_components.ElCheckbox, typeof __VLS_components.ElCheckbox, ] } */
            // @ts-ignore
            const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({ modelValue: ((__VLS_ctx.isBorder)), value: ((true)), }));
            const __VLS_53 = __VLS_52({ modelValue: ((__VLS_ctx.isBorder)), value: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_52));
            (__VLS_ctx.t('table.border'));
            __VLS_nonNullable(__VLS_56.slots).default;
            var __VLS_56;
        }
        if (__VLS_ctx.showHeaderBackground) {
            const __VLS_57 = __VLS_resolvedLocalAndGlobalComponents.ElCheckbox;
            /** @type { [typeof __VLS_components.ElCheckbox, typeof __VLS_components.ElCheckbox, ] } */
            // @ts-ignore
            const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({ modelValue: ((__VLS_ctx.isHeaderBackground)), value: ((true)), }));
            const __VLS_59 = __VLS_58({ modelValue: ((__VLS_ctx.isHeaderBackground)), value: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_58));
            (__VLS_ctx.t('table.headerBackground'));
            __VLS_nonNullable(__VLS_62.slots).default;
            var __VLS_62;
        }
        var __VLS_44;
    }
    var __VLS_63 = {};
    __VLS_styleScopedClasses['table-header'];
    __VLS_styleScopedClasses['left'];
    __VLS_styleScopedClasses['right'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['active'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['loading'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['table-size-btn-item'];
    __VLS_styleScopedClasses['is-selected'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['column-option'];
    __VLS_styleScopedClasses['fixed-column'];
    __VLS_styleScopedClasses['drag-icon'];
    __VLS_styleScopedClasses['disabled'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['iconfont-sys'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {};
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
            ElPopover: ElPopover,
            ElCheckbox: ElCheckbox,
            ElDropdown: ElDropdown,
            ElDropdownMenu: ElDropdownMenu,
            ElDropdownItem: ElDropdownItem,
            VueDraggable: VueDraggable,
            t: t,
            columns: columns,
            tableSizeOptions: tableSizeOptions,
            tableSize: tableSize,
            isZebra: isZebra,
            isBorder: isBorder,
            isHeaderBackground: isHeaderBackground,
            shouldShow: shouldShow,
            search: search,
            refresh: refresh,
            handleTableSizeChange: handleTableSizeChange,
            isManualRefresh: isManualRefresh,
            isFullScreen: isFullScreen,
            toggleFullScreen: toggleFullScreen,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
    __typeEl: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map