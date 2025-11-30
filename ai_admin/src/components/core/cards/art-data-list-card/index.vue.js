/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtDataListCard' });
const ITEM_HEIGHT = 66;
const DEFAULT_MAX_COUNT = 5;
const props = withDefaults(defineProps(), {
    maxCount: DEFAULT_MAX_COUNT
});
const maxHeight = computed(() => `${ITEM_HEIGHT * props.maxCount}px`);
const emit = defineEmits();
const handleMore = () => emit('more'); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    maxCount: DEFAULT_MAX_COUNT
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("basic-list-card") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("art-card art-custom-card") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("card-header") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("card-title") }, });
    (__VLS_ctx.title);
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("card-subtitle") }, });
    (__VLS_ctx.subtitle);
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElScrollbar;
    /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.ElScrollbar, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ style: (({ height: __VLS_ctx.maxHeight })) }, }));
    const __VLS_2 = __VLS_1({ ...{ style: (({ height: __VLS_ctx.maxHeight })) }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.list))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((index)), ...{ class: ("list-item") }, });
        if (item.icon) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("item-icon") }, ...{ class: ((item.class)) }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
            __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (item.icon) }, null, null);
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("item-content") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("item-title") }, });
        (item.title);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("item-status") }, });
        (item.status);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("item-time") }, });
        (item.time);
    }
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    if (__VLS_ctx.showMoreButton) {
        const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ 'onClick': {} }, ...{ class: ("more-btn") }, }));
        const __VLS_8 = __VLS_7({ ...{ 'onClick': {} }, ...{ class: ("more-btn") }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
        let __VLS_12;
        const __VLS_13 = {
            onClick: (__VLS_ctx.handleMore)
        };
        let __VLS_9;
        let __VLS_10;
        __VLS_nonNullable(__VLS_11.slots).default;
        var __VLS_11;
    }
    __VLS_styleScopedClasses['basic-list-card'];
    __VLS_styleScopedClasses['art-card'];
    __VLS_styleScopedClasses['art-custom-card'];
    __VLS_styleScopedClasses['card-header'];
    __VLS_styleScopedClasses['card-title'];
    __VLS_styleScopedClasses['card-subtitle'];
    __VLS_styleScopedClasses['list-item'];
    __VLS_styleScopedClasses['item-icon'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['item-content'];
    __VLS_styleScopedClasses['item-title'];
    __VLS_styleScopedClasses['item-status'];
    __VLS_styleScopedClasses['item-time'];
    __VLS_styleScopedClasses['more-btn'];
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
            maxHeight: maxHeight,
            handleMore: handleMore,
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