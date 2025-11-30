/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtTimelineListCard' });
// 常量配置
const ITEM_HEIGHT = 65;
const TIMELINE_PLACEMENT = 'top';
const DEFAULT_MAX_COUNT = 5;
const props = withDefaults(defineProps(), {
    title: '',
    subtitle: '',
    maxCount: DEFAULT_MAX_COUNT
});
// 计算最大高度
const maxHeight = computed(() => `${ITEM_HEIGHT * props.maxCount}px`); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    title: '',
    subtitle: '',
    maxCount: DEFAULT_MAX_COUNT
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("timeline-list-card") }, });
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
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElTimeline;
    /** @type { [typeof __VLS_components.ElTimeline, typeof __VLS_components.ElTimeline, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({}));
    const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.list))) {
        const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElTimelineItem;
        /** @type { [typeof __VLS_components.ElTimelineItem, typeof __VLS_components.ElTimelineItem, ] } */
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ key: ((item.time)), timestamp: ((item.time)), placement: ((__VLS_ctx.TIMELINE_PLACEMENT)), color: ((item.status)), center: ((true)), }));
        const __VLS_14 = __VLS_13({ key: ((item.time)), timestamp: ((item.time)), placement: ((__VLS_ctx.TIMELINE_PLACEMENT)), color: ((item.status)), center: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("timeline-item") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("timeline-content") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("timeline-text") }, });
        (item.content);
        if (item.code) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("timeline-code") }, });
            (item.code);
        }
        __VLS_nonNullable(__VLS_17.slots).default;
        var __VLS_17;
    }
    __VLS_nonNullable(__VLS_11.slots).default;
    var __VLS_11;
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    __VLS_styleScopedClasses['timeline-list-card'];
    __VLS_styleScopedClasses['art-card'];
    __VLS_styleScopedClasses['art-custom-card'];
    __VLS_styleScopedClasses['card-header'];
    __VLS_styleScopedClasses['card-title'];
    __VLS_styleScopedClasses['card-subtitle'];
    __VLS_styleScopedClasses['timeline-item'];
    __VLS_styleScopedClasses['timeline-content'];
    __VLS_styleScopedClasses['timeline-text'];
    __VLS_styleScopedClasses['timeline-code'];
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
            TIMELINE_PLACEMENT: TIMELINE_PLACEMENT,
            maxHeight: maxHeight,
        };
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