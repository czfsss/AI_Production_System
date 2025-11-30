/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useCommon } from '@/composables/useCommon';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const router = useRouter();
const __VLS_props = withDefaults(defineProps(), {});
const backHome = () => {
    router.push(useCommon().homePath.value);
}; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({});
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
    __VLS_styleScopedClasses['state-page'];
    __VLS_styleScopedClasses['tips'];
    __VLS_styleScopedClasses['right-wrap'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("page-content state-page") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("tips") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ThemeSvg;
    /** @type { [typeof __VLS_components.ThemeSvg, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ src: ((__VLS_ctx.data.imgUrl)), size: ("100%"), }));
    const __VLS_2 = __VLS_1({ src: ((__VLS_ctx.data.imgUrl)), size: ("100%"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("right-wrap") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.data.desc);
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ 'onClick': {} }, type: ("primary"), size: ("large"), }));
    const __VLS_8 = __VLS_7({ ...{ 'onClick': {} }, type: ("primary"), size: ("large"), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
    let __VLS_12;
    const __VLS_13 = {
        onClick: (__VLS_ctx.backHome)
    };
    let __VLS_9;
    let __VLS_10;
    (__VLS_ctx.data.btnText);
    __VLS_nonNullable(__VLS_11.slots).default;
    var __VLS_11;
    __VLS_styleScopedClasses['page-content'];
    __VLS_styleScopedClasses['state-page'];
    __VLS_styleScopedClasses['tips'];
    __VLS_styleScopedClasses['right-wrap'];
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
            backHome: backHome,
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
//# sourceMappingURL=ArtException.vue.js.map