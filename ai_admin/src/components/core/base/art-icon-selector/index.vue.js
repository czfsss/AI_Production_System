/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { IconTypeEnum } from '@/enums/appEnum';
import { extractIconClasses } from '@/utils/constants';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtIconSelector' });
const props = withDefaults(defineProps(), {
    iconType: IconTypeEnum.CLASS_NAME,
    modelValue: '',
    text: '图标选择器',
    width: '200px',
    size: 'default',
    disabled: false
});
const emits = defineEmits();
// 响应式数据
const selectValue = ref(props.modelValue);
const visible = ref(false);
const activeName = ref('icons');
// 图标列表 - 使用计算属性优化性能
const iconsList = computed(() => extractIconClasses());
// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
    selectValue.value = newVal;
}, { immediate: true });
// 选择图标
const selectorIcon = (icon) => {
    const iconValue = props.iconType === IconTypeEnum.CLASS_NAME ? icon.className : icon.unicode || '';
    selectValue.value = iconValue;
    visible.value = false;
    // 发射 v-model 更新事件和自定义事件
    emits('update:modelValue', iconValue);
    emits('getIcon', iconValue);
};
// 处理点击事件
const handleClick = () => {
    if (!props.disabled) {
        visible.value = true;
    }
};
// 清除图标
const clearIcon = () => {
    selectValue.value = '';
    // 发射 v-model 更新事件和自定义事件
    emits('update:modelValue', '');
    emits('getIcon', '');
};
// 计算属性：当前图标类型（用于模板中的判断）
const iconType = computed(() => props.iconType); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    iconType: IconTypeEnum.CLASS_NAME,
    modelValue: '',
    text: '图标选择器',
    width: '200px',
    size: 'default',
    disabled: false
});
const __VLS_fnComponent = (await import('vue')).defineComponent({
    __typeEmits: {},
});
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
    __VLS_styleScopedClasses['clear-icon'];
    __VLS_styleScopedClasses['is-disabled'];
    __VLS_styleScopedClasses['icon'];
    __VLS_styleScopedClasses['text'];
    __VLS_styleScopedClasses['arrow'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("icon-selector") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.handleClick) }, ...{ class: ("select") }, ...{ style: (({ width: props.width })) }, ...{ class: (([__VLS_ctx.size, { 'is-disabled': __VLS_ctx.disabled }, { 'has-icon': __VLS_ctx.selectValue }])) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("icon") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ((`iconfont-sys ${__VLS_ctx.selectValue}`)) }, });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (props.iconType === __VLS_ctx.IconTypeEnum.CLASS_NAME) }, null, null);
    __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.selectValue) }, null, null);
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (props.iconType === __VLS_ctx.IconTypeEnum.UNICODE) }, null, null);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("text") }, });
    (props.text);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("arrow") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys arrow-icon") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ onClick: (__VLS_ctx.clearIcon) }, ...{ class: ("iconfont-sys clear-icon") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ title: ("选择图标"), width: ("40%"), modelValue: ((__VLS_ctx.visible)), alignCenter: (true), }));
    const __VLS_2 = __VLS_1({ title: ("选择图标"), width: ("40%"), modelValue: ((__VLS_ctx.visible)), alignCenter: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElScrollbar;
    /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ height: ("400px"), }));
    const __VLS_8 = __VLS_7({ height: ("400px"), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_elementAsFunction(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({ ...{ class: ("icons-list") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.activeName === 'icons') }, null, null);
    for (const [icon] of __VLS_getVForSourceType((__VLS_ctx.iconsList))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.selectorIcon(icon);
                } }, key: ((icon.className)), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ((`iconfont-sys ${icon.className}`)) }, });
        __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.iconType === __VLS_ctx.IconTypeEnum.CLASS_NAME) }, null, null);
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (icon.unicode) }, null, null);
        __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.iconType === __VLS_ctx.IconTypeEnum.UNICODE) }, null, null);
    }
    __VLS_nonNullable(__VLS_11.slots).default;
    var __VLS_11;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("dialog-footer") }, });
        const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ ...{ 'onClick': {} }, }));
        const __VLS_14 = __VLS_13({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        let __VLS_18;
        const __VLS_19 = {
            onClick: (...[$event]) => {
                __VLS_ctx.visible = false;
            }
        };
        let __VLS_15;
        let __VLS_16;
        __VLS_nonNullable(__VLS_17.slots).default;
        var __VLS_17;
        const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_22 = __VLS_21({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        let __VLS_26;
        const __VLS_27 = {
            onClick: (...[$event]) => {
                __VLS_ctx.visible = false;
            }
        };
        let __VLS_23;
        let __VLS_24;
        __VLS_nonNullable(__VLS_25.slots).default;
        var __VLS_25;
    }
    var __VLS_5;
    __VLS_styleScopedClasses['icon-selector'];
    __VLS_styleScopedClasses['select'];
    __VLS_styleScopedClasses['is-disabled'];
    __VLS_styleScopedClasses['has-icon'];
    __VLS_styleScopedClasses['icon'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['text'];
    __VLS_styleScopedClasses['arrow'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['arrow-icon'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['clear-icon'];
    __VLS_styleScopedClasses['icons-list'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['dialog-footer'];
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
            IconTypeEnum: IconTypeEnum,
            selectValue: selectValue,
            visible: visible,
            activeName: activeName,
            iconsList: iconsList,
            selectorIcon: selectorIcon,
            handleClick: handleClick,
            clearIcon: clearIcon,
            iconType: iconType,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map