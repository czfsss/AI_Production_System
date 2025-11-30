import { ArrowUpBold, ArrowDownBold } from '@element-plus/icons-vue';
import { useWindowSize } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { ElForm, ElFormItem, ElInput, ElInputNumber, ElSelect, ElOption, ElDatePicker, ElSwitch, ElCheckbox, ElCheckboxGroup, ElRadioGroup, ElButton, ElIcon, ElRate, ElSlider, ElRow, ElCol, ElCascader, ElTimePicker, ElTimeSelect, ElTreeSelect } from 'element-plus';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtSearchBar' });
const componentMap = {
    input: ElInput, // 输入框
    number: ElInputNumber, // 数字输入框
    select: ElSelect, // 选择器
    switch: ElSwitch, // 开关
    checkbox: ElCheckbox, // 复选框
    checkboxgroup: ElCheckboxGroup, // 复选框组
    radiogroup: ElRadioGroup, // 单选框组
    date: ElDatePicker, // 日期选择器
    daterange: ElDatePicker, // 日期范围选择器
    datetime: ElDatePicker, // 日期时间选择器
    datetimerange: ElDatePicker, // 日期时间范围选择器
    rate: ElRate, // 评分
    slider: ElSlider, // 滑块
    cascader: ElCascader, // 级联选择器
    timepicker: ElTimePicker, // 时间选择器
    timeselect: ElTimeSelect, // 时间选择
    treeselect: ElTreeSelect // 树选择器
};
const { width } = useWindowSize();
const { t } = useI18n();
const isMobile = computed(() => width.value < 500);
const formInstance = useTemplateRef('formRef');
const props = withDefaults(defineProps(), {
    items: () => [],
    span: 6,
    gutter: 12,
    isExpand: false,
    labelPosition: 'right',
    labelWidth: '70px',
    showExpand: true,
    defaultExpanded: false,
    buttonLeftLimit: 2,
    showReset: true,
    showSearch: true,
    disabledSearch: false
});
const emit = defineEmits();
const modelValue = defineModel({ default: {} });
/**
 * 是否展开状态
 */
const isExpanded = ref(props.defaultExpanded);
const rootProps = ['label', 'labelWidth', 'key', 'type', 'hidden', 'span', 'slots'];
const getProps = (item) => {
    if (item.props)
        return item.props;
    const props = { ...item };
    rootProps.forEach((key) => delete props[key]);
    return props;
};
// 获取插槽
const getSlots = (item) => {
    if (!item.slots)
        return {};
    const validSlots = {};
    Object.entries(item.slots).forEach(([key, slotFn]) => {
        if (slotFn) {
            validSlots[key] = slotFn;
        }
    });
    return validSlots;
};
// 组件
const getComponent = (item) => {
    const { type } = item;
    if (type && typeof item.type !== 'string')
        return type;
    // type不传递、默认使用 input
    return componentMap[type] || componentMap['input'];
};
/**
 * 可见的表单项
 */
const visibleFormItems = computed(() => {
    const filteredItems = props.items.filter((item) => !item.hidden);
    const shouldShowLess = !props.isExpand && !isExpanded.value;
    if (shouldShowLess) {
        const maxItemsPerRow = Math.floor(24 / props.span) - 1;
        return filteredItems.slice(0, maxItemsPerRow);
    }
    return filteredItems;
});
/**
 * 是否应该显示展开/收起按钮
 */
const shouldShowExpandToggle = computed(() => {
    const filteredItems = props.items.filter((item) => !item.hidden);
    return (!props.isExpand && props.showExpand && filteredItems.length > Math.floor(24 / props.span) - 1);
});
/**
 * 展开/收起按钮文本
 */
const expandToggleText = computed(() => {
    return isExpanded.value ? t('table.searchBar.collapse') : t('table.searchBar.expand');
});
/**
 * 操作按钮样式
 */
const actionButtonsStyle = computed(() => ({
    'justify-content': isMobile.value
        ? 'flex-end'
        : props.items.filter((item) => !item.hidden).length <= props.buttonLeftLimit
            ? 'flex-start'
            : 'flex-end'
}));
/**
 * 切换展开/收起状态
 */
const toggleExpand = () => {
    isExpanded.value = !isExpanded.value;
};
/**
 * 处理重置事件
 */
const handleReset = () => {
    // 重置表单字段（UI 层）
    formInstance.value?.resetFields();
    // 清空所有表单项值（包含隐藏项）
    Object.assign(modelValue.value, Object.fromEntries(props.items.map(({ key }) => [key, undefined])));
    // 触发 reset 事件
    emit('reset');
};
/**
 * 处理搜索事件
 */
const handleSearch = () => {
    emit('search');
};
const __VLS_exposed = {
    ref: formInstance,
    validate: (...args) => formInstance.value?.validate(...args),
    reset: handleReset
};
defineExpose({
    ref: formInstance,
    validate: (...args) => formInstance.value?.validate(...args),
    reset: handleReset
});
// 解构 props 以便在模板中直接使用
const { span, gutter, labelPosition, labelWidth } = toRefs(props); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    items: () => [],
    span: 6,
    gutter: 12,
    isExpand: false,
    labelPosition: 'right',
    labelWidth: '70px',
    showExpand: true,
    defaultExpanded: false,
    buttonLeftLimit: 2,
    showReset: true,
    showSearch: true,
    disabledSearch: false
});
const __VLS_fnComponent = (await import('vue')).defineComponent({
    __typeEmits: {},
});
;
let __VLS_functionalComponentProps;
const __VLS_defaults = {
    modelValue: {},
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
    __VLS_styleScopedClasses['art-search-bar'];
    __VLS_styleScopedClasses['action-column'];
    __VLS_styleScopedClasses['action-buttons-wrapper'];
    __VLS_styleScopedClasses['form-buttons'];
    __VLS_styleScopedClasses['filter-toggle'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({ ...{ class: ("art-search-bar art-custom-card") }, ...{ class: (({ 'is-expanded': __VLS_ctx.isExpanded })) }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ref: ("formRef"), model: ((__VLS_ctx.modelValue)), labelPosition: ((__VLS_ctx.labelPosition)), ...({ ...__VLS_ctx.$attrs }), }));
    const __VLS_2 = __VLS_1({ ref: ("formRef"), model: ((__VLS_ctx.modelValue)), labelPosition: ((__VLS_ctx.labelPosition)), ...({ ...__VLS_ctx.$attrs }), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_6 = {};
    const __VLS_7 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({ ...{ class: ("search-form-row") }, gutter: ((__VLS_ctx.gutter)), }));
    const __VLS_9 = __VLS_8({ ...{ class: ("search-form-row") }, gutter: ((__VLS_ctx.gutter)), }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.visibleFormItems))) {
        const __VLS_13 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({ key: ((item.key)), xs: ((24)), sm: ((12)), md: ((8)), lg: ((item.span || __VLS_ctx.span)), xl: ((item.span || __VLS_ctx.span)), }));
        const __VLS_15 = __VLS_14({ key: ((item.key)), xs: ((24)), sm: ((12)), md: ((8)), lg: ((item.span || __VLS_ctx.span)), xl: ((item.span || __VLS_ctx.span)), }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        const __VLS_19 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({ label: ((item.label)), prop: ((item.key)), labelWidth: ((item.label ? item.labelWidth || __VLS_ctx.labelWidth : undefined)), }));
        const __VLS_21 = __VLS_20({ label: ((item.label)), prop: ((item.key)), labelWidth: ((item.label ? item.labelWidth || __VLS_ctx.labelWidth : undefined)), }, ...__VLS_functionalComponentArgsRest(__VLS_20));
        var __VLS_25 = {
            item: ((item)), modelValue: ((__VLS_ctx.modelValue)),
        };
        var __VLS_26 = (item.key);
        const __VLS_27 = ((__VLS_ctx.getComponent(item)));
        // @ts-ignore
        const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({ modelValue: ((__VLS_ctx.modelValue[item.key])), ...(__VLS_ctx.getProps(item)), }));
        const __VLS_29 = __VLS_28({ modelValue: ((__VLS_ctx.modelValue[item.key])), ...(__VLS_ctx.getProps(item)), }, ...__VLS_functionalComponentArgsRest(__VLS_28));
        if (item.type === 'select' && __VLS_ctx.getProps(item)?.options) {
            for (const [option] of __VLS_getVForSourceType((__VLS_ctx.getProps(item).options))) {
                const __VLS_33 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
                /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */
                // @ts-ignore
                const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({ ...(option), key: ((option.value)), }));
                const __VLS_35 = __VLS_34({ ...(option), key: ((option.value)), }, ...__VLS_functionalComponentArgsRest(__VLS_34));
            }
        }
        if (item.type === 'checkboxgroup' && __VLS_ctx.getProps(item)?.options) {
            for (const [option] of __VLS_getVForSourceType((__VLS_ctx.getProps(item).options))) {
                const __VLS_39 = __VLS_resolvedLocalAndGlobalComponents.ElCheckbox;
                /** @type { [typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ] } */
                // @ts-ignore
                const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({ ...(option), key: ((option.value)), }));
                const __VLS_41 = __VLS_40({ ...(option), key: ((option.value)), }, ...__VLS_functionalComponentArgsRest(__VLS_40));
            }
        }
        if (item.type === 'radiogroup' && __VLS_ctx.getProps(item)?.options) {
            for (const [option] of __VLS_getVForSourceType((__VLS_ctx.getProps(item).options))) {
                const __VLS_45 = __VLS_resolvedLocalAndGlobalComponents.ElRadio;
                /** @type { [typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ] } */
                // @ts-ignore
                const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({ ...(option), key: ((option.value)), }));
                const __VLS_47 = __VLS_46({ ...(option), key: ((option.value)), }, ...__VLS_functionalComponentArgsRest(__VLS_46));
            }
        }
        for (const [slotFn, slotName] of __VLS_getVForSourceType((__VLS_ctx.getSlots(item)))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({ key: ((slotName)), });
            {
                const { [__VLS_tryAsConstant(slotName)]: __VLS_thisSlot } = __VLS_nonNullable(__VLS_32.slots);
                const __VLS_51 = ((slotFn));
                // @ts-ignore
                const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({}));
                const __VLS_53 = __VLS_52({}, ...__VLS_functionalComponentArgsRest(__VLS_52));
            }
        }
        var __VLS_32;
        __VLS_nonNullable(__VLS_24.slots).default;
        __VLS_nonNullable(__VLS_24.slots).default;
        var __VLS_24;
        __VLS_nonNullable(__VLS_18.slots).default;
        var __VLS_18;
    }
    const __VLS_57 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({ xs: ((24)), sm: ((24)), md: ((__VLS_ctx.span)), lg: ((__VLS_ctx.span)), xl: ((__VLS_ctx.span)), ...{ class: ("action-column") }, }));
    const __VLS_59 = __VLS_58({ xs: ((24)), sm: ((24)), md: ((__VLS_ctx.span)), lg: ((__VLS_ctx.span)), xl: ((__VLS_ctx.span)), ...{ class: ("action-column") }, }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("action-buttons-wrapper") }, ...{ style: ((__VLS_ctx.actionButtonsStyle)) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("form-buttons") }, });
    if (__VLS_ctx.showReset) {
        const __VLS_63 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({ ...{ 'onClick': {} }, ...{ class: ("reset-button") }, }));
        const __VLS_65 = __VLS_64({ ...{ 'onClick': {} }, ...{ class: ("reset-button") }, }, ...__VLS_functionalComponentArgsRest(__VLS_64));
        __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
        let __VLS_69;
        const __VLS_70 = {
            onClick: (__VLS_ctx.handleReset)
        };
        let __VLS_66;
        let __VLS_67;
        (__VLS_ctx.t('table.searchBar.reset'));
        __VLS_nonNullable(__VLS_68.slots).default;
        var __VLS_68;
    }
    if (__VLS_ctx.showSearch) {
        const __VLS_71 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({ ...{ 'onClick': {} }, type: ("primary"), ...{ class: ("search-button") }, disabled: ((__VLS_ctx.disabledSearch)), }));
        const __VLS_73 = __VLS_72({ ...{ 'onClick': {} }, type: ("primary"), ...{ class: ("search-button") }, disabled: ((__VLS_ctx.disabledSearch)), }, ...__VLS_functionalComponentArgsRest(__VLS_72));
        __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
        let __VLS_77;
        const __VLS_78 = {
            onClick: (__VLS_ctx.handleSearch)
        };
        let __VLS_74;
        let __VLS_75;
        (__VLS_ctx.t('table.searchBar.search'));
        __VLS_nonNullable(__VLS_76.slots).default;
        var __VLS_76;
    }
    if (__VLS_ctx.shouldShowExpandToggle) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.toggleExpand) }, ...{ class: ("filter-toggle") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.expandToggleText);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("icon-wrapper") }, });
        const __VLS_79 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */
        // @ts-ignore
        const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({}));
        const __VLS_81 = __VLS_80({}, ...__VLS_functionalComponentArgsRest(__VLS_80));
        if (__VLS_ctx.isExpanded) {
            const __VLS_85 = __VLS_resolvedLocalAndGlobalComponents.ArrowUpBold;
            /** @type { [typeof __VLS_components.ArrowUpBold, ] } */
            // @ts-ignore
            const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({}));
            const __VLS_87 = __VLS_86({}, ...__VLS_functionalComponentArgsRest(__VLS_86));
        }
        else {
            const __VLS_91 = __VLS_resolvedLocalAndGlobalComponents.ArrowDownBold;
            /** @type { [typeof __VLS_components.ArrowDownBold, ] } */
            // @ts-ignore
            const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({}));
            const __VLS_93 = __VLS_92({}, ...__VLS_functionalComponentArgsRest(__VLS_92));
        }
        __VLS_nonNullable(__VLS_84.slots).default;
        var __VLS_84;
    }
    __VLS_nonNullable(__VLS_62.slots).default;
    var __VLS_62;
    __VLS_nonNullable(__VLS_12.slots).default;
    var __VLS_12;
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    __VLS_styleScopedClasses['art-search-bar'];
    __VLS_styleScopedClasses['art-custom-card'];
    __VLS_styleScopedClasses['is-expanded'];
    __VLS_styleScopedClasses['search-form-row'];
    __VLS_styleScopedClasses['action-column'];
    __VLS_styleScopedClasses['action-buttons-wrapper'];
    __VLS_styleScopedClasses['form-buttons'];
    __VLS_styleScopedClasses['reset-button'];
    __VLS_styleScopedClasses['search-button'];
    __VLS_styleScopedClasses['filter-toggle'];
    __VLS_styleScopedClasses['icon-wrapper'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "formRef": __VLS_6,
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
            ArrowUpBold: ArrowUpBold,
            ArrowDownBold: ArrowDownBold,
            ElForm: ElForm,
            ElFormItem: ElFormItem,
            ElOption: ElOption,
            ElCheckbox: ElCheckbox,
            ElButton: ElButton,
            ElIcon: ElIcon,
            ElRow: ElRow,
            ElCol: ElCol,
            t: t,
            modelValue: modelValue,
            isExpanded: isExpanded,
            getProps: getProps,
            getSlots: getSlots,
            getComponent: getComponent,
            visibleFormItems: visibleFormItems,
            shouldShowExpandToggle: shouldShowExpandToggle,
            expandToggleText: expandToggleText,
            actionButtonsStyle: actionButtonsStyle,
            toggleExpand: toggleExpand,
            handleReset: handleReset,
            handleSearch: handleSearch,
            span: span,
            gutter: gutter,
            labelPosition: labelPosition,
            labelWidth: labelWidth,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
    __typeEl: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map