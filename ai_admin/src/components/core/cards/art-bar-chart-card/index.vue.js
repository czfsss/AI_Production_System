/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useChartOps, useChartComponent } from '@/composables/useChart';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtBarChartCard' });
const props = withDefaults(defineProps(), {
    height: 11,
    barWidth: '26%'
});
// 使用新的图表组件抽象
const { chartRef } = useChartComponent({
    props: {
        height: `${props.height}rem`,
        loading: false,
        isEmpty: !props.chartData?.length || props.chartData.every((val) => val === 0)
    },
    checkEmpty: () => !props.chartData?.length || props.chartData.every((val) => val === 0),
    watchSources: [() => props.chartData, () => props.color, () => props.barWidth],
    generateOptions: () => {
        const computedColor = props.color || useChartOps().themeColor;
        return {
            grid: {
                top: 0,
                right: 0,
                bottom: 15,
                left: 0
            },
            xAxis: {
                type: 'category',
                show: false
            },
            yAxis: {
                type: 'value',
                show: false
            },
            series: [
                {
                    data: props.chartData,
                    type: 'bar',
                    barWidth: props.barWidth,
                    itemStyle: {
                        color: computedColor,
                        borderRadius: 2
                    }
                }
            ]
        };
    }
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    height: 11,
    barWidth: '26%'
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
    __VLS_styleScopedClasses['is-mini-chart'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("bar-chart-card art-custom-card") }, ...{ style: (({ height: `${__VLS_ctx.height}rem` })) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("card-body") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("chart-header") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("metric") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("value") }, });
    (__VLS_ctx.value);
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("label") }, });
    (__VLS_ctx.label);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("percentage") }, ...{ class: (({ 'is-increase': __VLS_ctx.percentage > 0, 'is-mini-chart': __VLS_ctx.isMiniChart })) }, });
    (__VLS_ctx.percentage > 0 ? '+' : '');
    (__VLS_ctx.percentage);
    if (__VLS_ctx.date) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("date") }, ...{ class: (({ 'is-mini-chart': __VLS_ctx.isMiniChart })) }, });
        (__VLS_ctx.date);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ref: ("chartRef"), ...{ class: ("chart-container") }, ...{ class: (({ 'is-mini-chart': __VLS_ctx.isMiniChart })) }, ...{ style: (({ height: `calc(${__VLS_ctx.height}rem - 5rem)` })) }, });
    // @ts-ignore navigation for `const chartRef = ref()`
    __VLS_ctx.chartRef;
    __VLS_styleScopedClasses['bar-chart-card'];
    __VLS_styleScopedClasses['art-custom-card'];
    __VLS_styleScopedClasses['card-body'];
    __VLS_styleScopedClasses['chart-header'];
    __VLS_styleScopedClasses['metric'];
    __VLS_styleScopedClasses['value'];
    __VLS_styleScopedClasses['label'];
    __VLS_styleScopedClasses['percentage'];
    __VLS_styleScopedClasses['is-increase'];
    __VLS_styleScopedClasses['is-mini-chart'];
    __VLS_styleScopedClasses['date'];
    __VLS_styleScopedClasses['is-mini-chart'];
    __VLS_styleScopedClasses['chart-container'];
    __VLS_styleScopedClasses['is-mini-chart'];
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