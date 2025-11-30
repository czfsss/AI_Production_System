/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtStatsCard' });
const __VLS_props = withDefaults(defineProps(), {
    iconSize: 30,
    iconBgRadius: 50,
    decimals: 0,
    separator: ','
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    iconSize: 30,
    iconBgRadius: 50,
    decimals: 0,
    separator: ','
});
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stats-card art-custom-card") }, ...{ style: (({ backgroundColor: __VLS_ctx.backgroundColor })) }, });
    if (__VLS_ctx.icon) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stats-card__icon") }, ...{ style: (({ backgroundColor: __VLS_ctx.iconBgColor, borderRadius: __VLS_ctx.iconBgRadius + 'px' })) }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, ...{ style: (({
                    color: __VLS_ctx.iconColor,
                    fontSize: __VLS_ctx.iconSize + 'px'
                })) }, });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.icon) }, null, null);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stats-card__content") }, });
    if (__VLS_ctx.title) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("stats-card__title") }, ...{ style: (({ color: __VLS_ctx.textColor })) }, });
        (__VLS_ctx.title);
    }
    if (__VLS_ctx.count) {
        const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtCountTo;
        /** @type { [typeof __VLS_components.ArtCountTo, ] } */
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ class: ("stats-card__count") }, target: ((__VLS_ctx.count)), duration: ((2000)), decimals: ((__VLS_ctx.decimals)), separator: ((__VLS_ctx.separator)), }));
        const __VLS_2 = __VLS_1({ ...{ class: ("stats-card__count") }, target: ((__VLS_ctx.count)), duration: ((2000)), decimals: ((__VLS_ctx.decimals)), separator: ((__VLS_ctx.separator)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    }
    if (__VLS_ctx.description) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("stats-card__description") }, ...{ style: (({ color: __VLS_ctx.textColor })) }, });
        (__VLS_ctx.description);
    }
    if (__VLS_ctx.showArrow) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("stats-card__arrow") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
    }
    __VLS_styleScopedClasses['stats-card'];
    __VLS_styleScopedClasses['art-custom-card'];
    __VLS_styleScopedClasses['stats-card__icon'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['stats-card__content'];
    __VLS_styleScopedClasses['stats-card__title'];
    __VLS_styleScopedClasses['stats-card__count'];
    __VLS_styleScopedClasses['stats-card__description'];
    __VLS_styleScopedClasses['stats-card__arrow'];
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
        return {};
    },
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    props: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map