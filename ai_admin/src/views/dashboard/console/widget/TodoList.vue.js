/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { reactive } from 'vue-demi';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const list = reactive([
    {
        username: '查看今天工作内容',
        date: '上午 09:30',
        complate: true
    },
    {
        username: '回复邮件',
        date: '上午 10:30',
        complate: true
    },
    {
        username: '工作汇报整理',
        date: '上午 11:00',
        complate: true
    },
    {
        username: '产品需求会议',
        date: '下午 02:00',
        complate: false
    },
    {
        username: '整理会议内容',
        date: '下午 03:30',
        complate: false
    },
    {
        username: '明天工作计划',
        date: '下午 06:30',
        complate: false
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("card art-custom-card") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("card-header") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("title") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({ ...{ class: ("box-title") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("subtitle") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-danger") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("list") }, });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.list))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((index)), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("title") }, });
        (item.username);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("date subtitle") }, });
        (item.date);
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElCheckbox;
        /** @type { [typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ modelValue: ((item.complate)), }));
        const __VLS_2 = __VLS_1({ modelValue: ((item.complate)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    }
    __VLS_styleScopedClasses['card'];
    __VLS_styleScopedClasses['art-custom-card'];
    __VLS_styleScopedClasses['card-header'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['box-title'];
    __VLS_styleScopedClasses['subtitle'];
    __VLS_styleScopedClasses['text-danger'];
    __VLS_styleScopedClasses['list'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['date'];
    __VLS_styleScopedClasses['subtitle'];
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
            list: list,
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
//# sourceMappingURL=TodoList.vue.js.map