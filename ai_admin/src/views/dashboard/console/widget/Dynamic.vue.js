/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { reactive } from 'vue-demi';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const list = reactive([
    {
        username: '中小鱼',
        type: '关注了',
        target: '誶誶淰'
    },
    {
        username: '何小荷',
        type: '发表文章',
        target: 'Vue3 + Typescript + Vite 项目实战笔记'
    },
    {
        username: '誶誶淰',
        type: '提出问题',
        target: '主题可以配置吗'
    },
    {
        username: '发呆草',
        type: '兑换了物品',
        target: '《奇特的一生》'
    },
    {
        username: '甜筒',
        type: '关闭了问题',
        target: '发呆草'
    },
    {
        username: '冷月呆呆',
        type: '兑换了物品',
        target: '《高效人士的七个习惯》'
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text-success") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("list") }, });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.list))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((index)), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("user") }, });
        (item.username);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("type") }, });
        (item.type);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("target") }, });
        (item.target);
    }
    __VLS_styleScopedClasses['card'];
    __VLS_styleScopedClasses['art-custom-card'];
    __VLS_styleScopedClasses['card-header'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['box-title'];
    __VLS_styleScopedClasses['subtitle'];
    __VLS_styleScopedClasses['text-success'];
    __VLS_styleScopedClasses['list'];
    __VLS_styleScopedClasses['user'];
    __VLS_styleScopedClasses['type'];
    __VLS_styleScopedClasses['target'];
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
//# sourceMappingURL=Dynamic.vue.js.map