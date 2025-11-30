/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { echarts, graphic } from '@/utils/echarts';
import { getCssVar, hexToRgba } from '@/utils/ui';
import { useChartOps, useChart } from '@/composables/useChart';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtLineChart' });
const props = withDefaults(defineProps(), {
    // 基础配置
    height: useChartOps().chartHeight,
    loading: false,
    isEmpty: false,
    colors: () => useChartOps().colors,
    // 数据配置
    data: () => [0, 0, 0, 0, 0, 0, 0],
    xAxisData: () => [],
    lineWidth: 2.5,
    showAreaColor: false,
    smooth: true,
    symbol: 'none',
    symbolSize: 6,
    animationDelay: 200,
    // 轴线显示配置
    showAxisLabel: true,
    showAxisLine: true,
    showSplitLine: true,
    // 交互配置
    showTooltip: true,
    showLegend: false,
    legendPosition: 'bottom'
});
// 使用基础的 useChart hook
const { chartRef, isDark, initChart, getAxisLineStyle, getAxisLabelStyle, getAxisTickStyle, getSplitLineStyle, getTooltipStyle, getLegendStyle, getGridWithLegend } = useChart();
// 动画状态和定时器管理
const isAnimating = ref(false);
const animationTimer = ref();
const animatedData = ref([]);
// 清理定时器
const clearAnimationTimer = () => {
    if (animationTimer.value) {
        clearTimeout(animationTimer.value);
        animationTimer.value = undefined;
    }
};
// 检查是否为空数据
const isEmpty = computed(() => {
    if (props.isEmpty)
        return true;
    // 检查单数据情况
    if (Array.isArray(props.data) && typeof props.data[0] === 'number') {
        const singleData = props.data;
        return !singleData.length || singleData.every((val) => val === 0);
    }
    // 检查多数据情况
    if (Array.isArray(props.data) && typeof props.data[0] === 'object') {
        const multiData = props.data;
        return (!multiData.length ||
            multiData.every((item) => !item.data?.length || item.data.every((val) => val === 0)));
    }
    return true;
});
// 判断是否为多数据
const isMultipleData = computed(() => {
    return (Array.isArray(props.data) &&
        props.data.length > 0 &&
        typeof props.data[0] === 'object' &&
        'name' in props.data[0]);
});
// 缓存计算的最大值，避免重复计算
const maxValue = computed(() => {
    if (isMultipleData.value) {
        const multiData = props.data;
        return multiData.reduce((max, item) => {
            if (item.data?.length) {
                const itemMax = Math.max(...item.data);
                return Math.max(max, itemMax);
            }
            return max;
        }, 0);
    }
    else {
        const singleData = props.data;
        return singleData?.length ? Math.max(...singleData) : 0;
    }
});
// 初始化动画数据
const initAnimationData = () => {
    if (isMultipleData.value) {
        const multiData = props.data;
        return multiData.map((item) => ({
            ...item,
            data: new Array(item.data.length).fill(0)
        }));
    }
    else {
        const singleData = props.data;
        return new Array(singleData.length).fill(0);
    }
};
// 复制真实数据
const copyRealData = () => {
    return isMultipleData.value
        ? [...props.data]
        : [...props.data];
};
// 获取颜色配置
const getColor = (customColor, index) => {
    if (customColor)
        return customColor;
    if (index !== undefined) {
        return props.colors[index % props.colors.length];
    }
    return getCssVar('--el-color-primary');
};
// 生成区域样式
const generateAreaStyle = (item, color) => {
    // 如果有 areaStyle 配置，或者显式开启了区域颜色，则显示区域样式
    if (!item.areaStyle && !item.showAreaColor && !props.showAreaColor)
        return undefined;
    const areaConfig = item.areaStyle || {};
    if (areaConfig.custom)
        return areaConfig.custom;
    return {
        color: new graphic.LinearGradient(0, 0, 0, 1, [
            {
                offset: 0,
                color: hexToRgba(color, areaConfig.startOpacity || 0.2).rgba
            },
            {
                offset: 1,
                color: hexToRgba(color, areaConfig.endOpacity || 0.02).rgba
            }
        ])
    };
};
// 生成单数据区域样式
const generateSingleAreaStyle = () => {
    if (!props.showAreaColor)
        return undefined;
    const color = getColor(props.colors[0]);
    return {
        color: new graphic.LinearGradient(0, 0, 0, 1, [
            {
                offset: 0,
                color: hexToRgba(color, 0.2).rgba
            },
            {
                offset: 1,
                color: hexToRgba(color, 0.02).rgba
            }
        ])
    };
};
// 创建系列配置
const createSeriesItem = (config) => {
    return {
        name: config.name,
        data: config.data,
        type: 'line',
        color: config.color,
        smooth: config.smooth ?? props.smooth,
        symbol: config.symbol ?? props.symbol,
        symbolSize: config.symbolSize ?? props.symbolSize,
        lineStyle: {
            width: config.lineWidth ?? props.lineWidth,
            color: config.color
        },
        areaStyle: config.areaStyle,
        emphasis: {
            focus: 'series',
            lineStyle: {
                width: (config.lineWidth ?? props.lineWidth) + 1
            }
        }
    };
};
// 生成图表配置
const generateChartOptions = (isInitial = false) => {
    const options = {
        animation: true,
        animationDuration: isInitial ? 0 : 1300,
        animationDurationUpdate: isInitial ? 0 : 1300,
        grid: getGridWithLegend(props.showLegend && isMultipleData.value, props.legendPosition, {
            top: 15,
            right: 15,
            left: 0
        }),
        tooltip: props.showTooltip ? getTooltipStyle() : undefined,
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: props.xAxisData,
            axisTick: getAxisTickStyle(),
            axisLine: getAxisLineStyle(props.showAxisLine),
            axisLabel: getAxisLabelStyle(props.showAxisLabel)
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: maxValue.value,
            axisLabel: getAxisLabelStyle(props.showAxisLabel),
            axisLine: getAxisLineStyle(props.showAxisLine),
            splitLine: getSplitLineStyle(props.showSplitLine)
        }
    };
    // 添加图例配置
    if (props.showLegend && isMultipleData.value) {
        options.legend = getLegendStyle(props.legendPosition);
    }
    // 生成系列数据
    if (isMultipleData.value) {
        const multiData = animatedData.value;
        options.series = multiData.map((item, index) => {
            const itemColor = getColor(props.colors[index], index);
            const areaStyle = generateAreaStyle(item, itemColor);
            return createSeriesItem({
                name: item.name,
                data: item.data,
                color: itemColor,
                smooth: item.smooth,
                symbol: item.symbol,
                lineWidth: item.lineWidth,
                areaStyle
            });
        });
    }
    else {
        // 单数据情况
        const singleData = animatedData.value;
        const computedColor = getColor(props.colors[0]);
        const areaStyle = generateSingleAreaStyle();
        options.series = [
            createSeriesItem({
                data: singleData,
                color: computedColor,
                areaStyle
            })
        ];
    }
    return options;
};
// 更新图表
const updateChart = (options) => {
    initChart(options, isEmpty.value);
};
// 初始化动画函数（优化多数据阶梯式动画效果）
const initChartWithAnimation = () => {
    if (!isEmpty.value) {
        clearAnimationTimer();
        isAnimating.value = true;
        // 如果是多数据情况，使用阶梯式动画
        if (isMultipleData.value) {
            const multiData = props.data;
            // 先将数据初始化为0
            animatedData.value = initAnimationData();
            updateChart(generateChartOptions(true));
            // 阶梯式更新每组数据
            multiData.forEach((item, index) => {
                setTimeout(() => {
                    // 逐个更新数据组
                    const currentAnimatedData = animatedData.value;
                    currentAnimatedData[index] = { ...item };
                    animatedData.value = [...currentAnimatedData];
                    updateChart(generateChartOptions(false));
                }, index * props.animationDelay + 100);
            });
            // 标记动画完成
            const totalDelay = (multiData.length - 1) * props.animationDelay + 1500;
            setTimeout(() => {
                isAnimating.value = false;
            }, totalDelay);
        }
        else {
            // 单数据情况保持原有的简单动画
            animatedData.value = initAnimationData();
            updateChart(generateChartOptions(true));
            animationTimer.value = setTimeout(() => {
                animatedData.value = copyRealData();
                updateChart(generateChartOptions(false));
                isAnimating.value = false;
            }, 100);
        }
    }
    else {
        animatedData.value = copyRealData();
        updateChart(generateChartOptions(false));
    }
};
// 图表渲染函数
const renderChart = () => {
    initChartWithAnimation();
};
// 处理图表进入可视区域时的动画
const handleChartVisible = () => {
    // 当图表变为可见时，也使用相同的动画逻辑
    initChartWithAnimation();
};
// 监听数据变化 - 优化监听器，减少不必要的重新渲染
watch([() => props.data, () => props.xAxisData, () => props.colors], () => {
    // 只有在不播放动画时才触发重新渲染
    if (!isAnimating.value) {
        renderChart();
    }
}, { deep: true });
// 监听主题变化 - 使用setOption更新而不是重新渲染
watch(isDark, () => {
    // 获取图表实例
    const chartInstance = chartRef.value?.__echart__ || echarts.getInstanceByDom(chartRef.value);
    if (chartInstance && !isEmpty.value) {
        // 重新生成配置并更新图表，避免重新渲染
        const newOptions = generateChartOptions(false);
        chartInstance.setOption(newOptions);
    }
});
// 生命周期
onMounted(() => {
    renderChart();
    // 监听图表可见事件
    if (chartRef.value) {
        chartRef.value.addEventListener('chartVisible', handleChartVisible);
    }
});
onBeforeUnmount(() => {
    clearAnimationTimer();
    // 清理事件监听器
    if (chartRef.value) {
        chartRef.value.removeEventListener('chartVisible', handleChartVisible);
    }
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    // 基础配置
    height: useChartOps().chartHeight,
    loading: false,
    isEmpty: false,
    colors: () => useChartOps().colors,
    // 数据配置
    data: () => [0, 0, 0, 0, 0, 0, 0],
    xAxisData: () => [],
    lineWidth: 2.5,
    showAreaColor: false,
    smooth: true,
    symbol: 'none',
    symbolSize: 6,
    animationDelay: 200,
    // 轴线显示配置
    showAxisLabel: true,
    showAxisLine: true,
    showSplitLine: true,
    // 交互配置
    showTooltip: true,
    showLegend: false,
    legendPosition: 'bottom'
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ref: ("chartRef"), ...{ class: ("art-line-chart") }, ...{ style: (({ height: props.height })) }, });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (props.loading) }, null, null);
    // @ts-ignore navigation for `const chartRef = ref()`
    __VLS_ctx.chartRef;
    __VLS_styleScopedClasses['art-line-chart'];
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