/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useChartOps, useChartComponent } from '@/composables/useChart';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtDonutChartCard' });
const props = withDefaults(defineProps(), {
    height: 9,
    radius: () => ['70%', '90%'],
    data: () => [0, 0]
});
const formatNumber = (num) => {
    return num.toLocaleString();
};
// 使用新的图表组件抽象
const { chartRef } = useChartComponent({
    props: {
        height: `${props.height}rem`,
        loading: false,
        isEmpty: props.data.every((val) => val === 0)
    },
    checkEmpty: () => props.data.every((val) => val === 0),
    watchSources: [
        () => props.data,
        () => props.color,
        () => props.radius,
        () => props.currentValue,
        () => props.previousValue
    ],
    generateOptions: () => {
        const computedColor = props.color || useChartOps().themeColor;
        return {
            series: [
                {
                    type: 'pie',
                    radius: props.radius,
                    avoidLabelOverlap: false,
                    label: {
                        show: false
                    },
                    data: [
                        {
                            value: props.data[0],
                            name: props.currentValue,
                            itemStyle: { color: computedColor }
                        },
                        {
                            value: props.data[1],
                            name: props.previousValue,
                            itemStyle: { color: '#e6e8f7' }
                        }
                    ]
                }
            ]
        };
    }
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    height: 9,
    radius: () => ['70%', '90%'],
    data: () => [0, 0]
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("donut-chart-card art-custom-card") }, ...{ style: (({ height: `${__VLS_ctx.height}rem` })) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("card-body") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("card-content") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("data-section") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("title") }, });
    (__VLS_ctx.title);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("value") }, });
    (__VLS_ctx.formatNumber(__VLS_ctx.value));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("percentage") }, ...{ class: (({ 'is-increase': __VLS_ctx.percentage > 0 })) }, });
    (__VLS_ctx.percentage > 0 ? '+' : '');
    (__VLS_ctx.percentage);
    if (__VLS_ctx.percentageLabel) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.percentageLabel);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("chart-legend") }, });
    if (__VLS_ctx.currentValue) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("legend-item current") }, });
        (__VLS_ctx.currentValue);
    }
    if (__VLS_ctx.previousValue) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("legend-item previous") }, });
        (__VLS_ctx.previousValue);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("chart-section") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ref: ("chartRef"), ...{ class: ("chart-container") }, });
    // @ts-ignore navigation for `const chartRef = ref()`
    __VLS_ctx.chartRef;
    __VLS_styleScopedClasses['donut-chart-card'];
    __VLS_styleScopedClasses['art-custom-card'];
    __VLS_styleScopedClasses['card-body'];
    __VLS_styleScopedClasses['card-content'];
    __VLS_styleScopedClasses['data-section'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['value'];
    __VLS_styleScopedClasses['percentage'];
    __VLS_styleScopedClasses['is-increase'];
    __VLS_styleScopedClasses['chart-legend'];
    __VLS_styleScopedClasses['legend-item'];
    __VLS_styleScopedClasses['current'];
    __VLS_styleScopedClasses['legend-item'];
    __VLS_styleScopedClasses['previous'];
    __VLS_styleScopedClasses['chart-section'];
    __VLS_styleScopedClasses['chart-container'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "chartRef": __VLS_nativeElements['div'],
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
            formatNumber: formatNumber,
            chartRef: chartRef,
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