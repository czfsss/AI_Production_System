/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { BgColorEnum } from '@/enums/appEnum';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtButtonTable' });
const props = withDefaults(defineProps(), {});
const emit = defineEmits();
// 默认按钮配置
const defaultButtons = {
    add: { icon: '&#xe602;', color: BgColorEnum.PRIMARY },
    edit: { icon: '&#xe642;', color: BgColorEnum.SECONDARY },
    delete: { icon: '&#xe783;', color: BgColorEnum.ERROR },
    view: { icon: '&#xe689;', color: BgColorEnum.INFO },
    more: { icon: '&#xe6df;', color: '' }
};
// 获取图标内容
const iconContent = computed(() => {
    return props.icon || (props.type ? defaultButtons[props.type]?.icon : '') || '';
});
// 获取按钮样式类
const buttonClass = computed(() => {
    return props.iconClass || (props.type ? defaultButtons[props.type]?.color : '') || '';
});
const handleClick = () => {
    emit('click');
}; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({});
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.handleClick) }, ...{ class: ((['btn-text', __VLS_ctx.buttonClass])) }, ...{ style: (({ backgroundColor: __VLS_ctx.buttonBgColor, color: __VLS_ctx.iconColor })) }, });
    if (__VLS_ctx.iconContent) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.iconContent) }, null, null);
    }
    __VLS_styleScopedClasses['btn-text'];
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
            iconContent: iconContent,
            buttonClass: buttonClass,
            handleClick: handleClick,
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