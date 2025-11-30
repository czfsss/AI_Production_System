/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtProgressCard' });
const props = withDefaults(defineProps(), {
    strokeWidth: 5,
    iconBgRadius: 8,
    color: '#67C23A'
});
const animationDuration = 500;
const currentPercentage = ref(0);
const animateProgress = () => {
    const startTime = Date.now();
    const startValue = currentPercentage.value;
    const endValue = props.percentage;
    const animate = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        currentPercentage.value = startValue + (endValue - startValue) * progress;
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    requestAnimationFrame(animate);
};
onMounted(() => {
    animateProgress();
});
// 当 percentage 属性变化时重新执行动画
watch(() => props.percentage, () => {
    animateProgress();
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    strokeWidth: 5,
    iconBgRadius: 8,
    color: '#67C23A'
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("progress-card art-custom-card") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("progress-info") }, ...{ style: (({ justifyContent: __VLS_ctx.icon ? 'space-between' : 'flex-start' })) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("left") }, });
    if (__VLS_ctx.icon) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, ...{ style: (({
                    color: __VLS_ctx.iconColor,
                    backgroundColor: __VLS_ctx.iconBgColor,
                    fontSize: __VLS_ctx.iconSize + 'px',
                    borderRadius: __VLS_ctx.iconBgRadius + 'px'
                })) }, });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.icon) }, null, null);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("right") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ArtCountTo;
    /** @type { [typeof __VLS_components.ArtCountTo, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ class: ("percentage") }, target: ((__VLS_ctx.percentage)), duration: ((2000)), suffix: ("%"), ...{ style: (({ textAlign: __VLS_ctx.icon ? 'right' : 'left' })) }, }));
    const __VLS_2 = __VLS_1({ ...{ class: ("percentage") }, target: ((__VLS_ctx.percentage)), duration: ((2000)), suffix: ("%"), ...{ style: (({ textAlign: __VLS_ctx.icon ? 'right' : 'left' })) }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("title") }, });
    (__VLS_ctx.title);
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElProgress;
    /** @type { [typeof __VLS_components.ElProgress, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ percentage: ((__VLS_ctx.currentPercentage)), strokeWidth: ((__VLS_ctx.strokeWidth)), showText: ((false)), color: ((__VLS_ctx.color)), }));
    const __VLS_8 = __VLS_7({ percentage: ((__VLS_ctx.currentPercentage)), strokeWidth: ((__VLS_ctx.strokeWidth)), showText: ((false)), color: ((__VLS_ctx.color)), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_styleScopedClasses['progress-card'];
    __VLS_styleScopedClasses['art-custom-card'];
    __VLS_styleScopedClasses['progress-info'];
    __VLS_styleScopedClasses['left'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['right'];
    __VLS_styleScopedClasses['percentage'];
    __VLS_styleScopedClasses['title'];
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
            currentPercentage: currentPercentage,
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