/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { getIframeRoutes } from '@/router/utils/menuToRouter';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const route = useRoute();
const isLoading = ref(true);
const iframeUrl = ref('');
const iframeRef = ref(null);
onMounted(() => {
    const iframeRoute = getIframeRoutes().find((item) => item.path === route.path);
    if (iframeRoute?.meta) {
        iframeUrl.value = iframeRoute.meta.link || '';
    }
});
const handleIframeLoad = () => {
    isLoading.value = false;
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("iframe-container") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.isLoading) }, null, null);
    __VLS_elementAsFunction(__VLS_intrinsicElements.iframe, __VLS_intrinsicElements.iframe)({ ...{ onLoad: (__VLS_ctx.handleIframeLoad) }, ref: ("iframeRef"), src: ((__VLS_ctx.iframeUrl)), frameborder: ("0"), ...{ class: ("iframe-content") }, });
    // @ts-ignore navigation for `const iframeRef = ref()`
    __VLS_ctx.iframeRef;
    __VLS_styleScopedClasses['iframe-container'];
    __VLS_styleScopedClasses['iframe-content'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "iframeRef": __VLS_nativeElements['iframe'],
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
            isLoading: isLoading,
            iframeUrl: iframeUrl,
            iframeRef: iframeRef,
            handleIframeLoad: handleIframeLoad,
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
//# sourceMappingURL=Iframe.vue.js.map