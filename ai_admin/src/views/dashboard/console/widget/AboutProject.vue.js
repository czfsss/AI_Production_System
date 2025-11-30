/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import AppConfig from '@/config';
import { WEB_LINKS } from '@/utils/constants';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const systemName = AppConfig.systemInfo.name;
const goPage = (url) => {
    window.open(url);
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
    __VLS_styleScopedClasses['about-project'];
    __VLS_styleScopedClasses['button-wrap'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['button-wrap'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['right-img'];
    __VLS_styleScopedClasses['about-project'];
    __VLS_styleScopedClasses['btn'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("card about-project art-custom-card") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({ ...{ class: ("box-title") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.systemName);
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("button-wrap") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                __VLS_ctx.goPage(__VLS_ctx.WEB_LINKS.DOCS);
            } }, ...{ class: ("btn art-custom-card") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                __VLS_ctx.goPage(__VLS_ctx.WEB_LINKS.INTRODUCE);
            } }, ...{ class: ("btn art-custom-card") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                __VLS_ctx.goPage(__VLS_ctx.WEB_LINKS.BLOG);
            } }, ...{ class: ("btn art-custom-card") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ ...{ class: ("right-img") }, src: ("@imgs/draw/draw1.png"), alt: ("draw1"), });
    __VLS_styleScopedClasses['card'];
    __VLS_styleScopedClasses['about-project'];
    __VLS_styleScopedClasses['art-custom-card'];
    __VLS_styleScopedClasses['box-title'];
    __VLS_styleScopedClasses['button-wrap'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['art-custom-card'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['art-custom-card'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['art-custom-card'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['right-img'];
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
            WEB_LINKS: WEB_LINKS,
            systemName: systemName,
            goPage: goPage,
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
//# sourceMappingURL=AboutProject.vue.js.map