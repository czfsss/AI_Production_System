/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { reactive } from 'vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const dataList = reactive([
    {
        des: '总访问次数',
        icon: '&#xe721;',
        startVal: 0,
        duration: 1000,
        num: 9120,
        change: '+20%'
    },
    {
        des: '在线访客数',
        icon: '&#xe724;',
        startVal: 0,
        duration: 1000,
        num: 182,
        change: '+10%'
    },
    {
        des: '点击量',
        icon: '&#xe7aa;',
        startVal: 0,
        duration: 1000,
        num: 9520,
        change: '-12%'
    },
    {
        des: '新用户',
        icon: '&#xe82a;',
        startVal: 0,
        duration: 1000,
        num: 156,
        change: '+30%'
    }
]); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    __VLS_styleScopedClasses['card-list'];
    __VLS_styleScopedClasses['art-custom-card'];
    __VLS_styleScopedClasses['iconfont-sys'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ gutter: ((20)), ...{ class: ("card-list") }, }));
    const __VLS_2 = __VLS_1({ gutter: ((20)), ...{ class: ("card-list") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.dataList))) {
        const __VLS_7 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({ key: ((index)), sm: ((12)), md: ((6)), lg: ((6)), }));
        const __VLS_9 = __VLS_8({ key: ((index)), sm: ((12)), md: ((6)), lg: ((6)), }, ...__VLS_functionalComponentArgsRest(__VLS_8));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("card art-custom-card") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("des subtitle") }, });
        (item.des);
        const __VLS_13 = __VLS_resolvedLocalAndGlobalComponents.ArtCountTo;
        /** @type { [typeof __VLS_components.ArtCountTo, ] } */
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({ ...{ class: ("number box-title") }, target: ((item.num)), duration: ((1300)), }));
        const __VLS_15 = __VLS_14({ ...{ class: ("number box-title") }, target: ((item.num)), duration: ((1300)), }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("change-box") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("change-text") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("change") }, ...{ class: (([item.change.indexOf('+') === -1 ? 'text-danger' : 'text-success'])) }, });
        (item.change);
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (item.icon) }, null, null);
        __VLS_nonNullable(__VLS_12.slots).default;
        var __VLS_12;
    }
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    __VLS_styleScopedClasses['card-list'];
    __VLS_styleScopedClasses['card'];
    __VLS_styleScopedClasses['art-custom-card'];
    __VLS_styleScopedClasses['des'];
    __VLS_styleScopedClasses['subtitle'];
    __VLS_styleScopedClasses['number'];
    __VLS_styleScopedClasses['box-title'];
    __VLS_styleScopedClasses['change-box'];
    __VLS_styleScopedClasses['change-text'];
    __VLS_styleScopedClasses['change'];
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
            dataList: dataList,
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
//# sourceMappingURL=CardList.vue.js.map