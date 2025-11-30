/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useFastEnter } from '@/composables/useFastEnter';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtFastEnter' });
const router = useRouter();
const popoverRef = ref();
// 使用快速入口配置
const { enabledApplications, enabledQuickLinks } = useFastEnter();
const isExternalLink = (path) => path.startsWith('http');
const handleNavigate = (path) => {
    if (isExternalLink(path)) {
        window.open(path, '_blank');
    }
    else {
        router.push(path);
    }
    popoverRef.value?.hide();
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElPopover;
    /** @type { [typeof __VLS_components.ElPopover, typeof __VLS_components.ElPopover, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ref: ("popoverRef"), width: ((700)), trigger: ("hover"), popperClass: ("fast-enter-popover"), showArrow: ((false)), placement: ("bottom-start"), offset: ((0)), popperStyle: (({
            border: '1px solid var(--art-border-dashed-color)',
            borderRadius: 'calc(var(--custom-radius) / 2 + 4px)'
        })), }));
    const __VLS_2 = __VLS_1({ ref: ("popoverRef"), width: ((700)), trigger: ("hover"), popperClass: ("fast-enter-popover"), showArrow: ((false)), placement: ("bottom-start"), offset: ((0)), popperStyle: (({
            border: '1px solid var(--art-border-dashed-color)',
            borderRadius: 'calc(var(--custom-radius) / 2 + 4px)'
        })), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    // @ts-ignore navigation for `const popoverRef = ref()`
    __VLS_ctx.popoverRef;
    var __VLS_6 = {};
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { reference: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("fast-enter-trigger") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("btn") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("fast-enter") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("apps-section") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("apps-grid") }, });
    for (const [application] of __VLS_getVForSourceType((__VLS_ctx.enabledApplications))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.handleNavigate(application.path);
                } }, key: ((application.name)), ...{ class: ("app-item") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("app-icon") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, ...{ style: (({ color: application.iconColor })) }, });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (application.icon) }, null, null);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("app-info") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (application.name);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (application.description);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("quick-links") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
    for (const [quickLink] of __VLS_getVForSourceType((__VLS_ctx.enabledQuickLinks))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.handleNavigate(quickLink.path);
                } }, key: ((quickLink.name)), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (quickLink.name);
    }
    var __VLS_5;
    __VLS_styleScopedClasses['fast-enter-trigger'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['fast-enter'];
    __VLS_styleScopedClasses['apps-section'];
    __VLS_styleScopedClasses['apps-grid'];
    __VLS_styleScopedClasses['app-item'];
    __VLS_styleScopedClasses['app-icon'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['app-info'];
    __VLS_styleScopedClasses['quick-links'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "popoverRef": __VLS_6,
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
            popoverRef: popoverRef,
            enabledApplications: enabledApplications,
            enabledQuickLinks: enabledQuickLinks,
            handleNavigate: handleNavigate,
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
//# sourceMappingURL=index.vue.js.map