import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useElementHover } from '@vueuse/core';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtTextScroll' });
const emit = defineEmits(['close']);
const props = withDefaults(defineProps(), {
    speed: 70,
    direction: 'left',
    type: 'default',
    showClose: false,
    typewriter: false,
    typewriterSpeed: 100
});
// 状态管理
const containerRef = ref(null);
const isHovered = useElementHover(containerRef);
const scrollContent = ref(null);
const animationDuration = ref(0);
// 添加打字机效果相关的响应式变量
const currentText = ref('');
let typewriterTimer = null;
// 添加打字机完成状态
const isTypewriterComplete = ref(false);
// 修改滚动状态计算属性
const shouldScroll = computed(() => {
    if (props.typewriter) {
        return !isHovered.value && isTypewriterComplete.value;
    }
    return !isHovered.value;
});
// 修改 sanitizedContent 计算属性
const sanitizedContent = computed(() => (props.typewriter ? currentText.value : props.text));
// 修改 scrollStyle 计算属性
const scrollStyle = computed(() => ({
    '--animation-duration': `${animationDuration.value}s`,
    '--animation-play-state': shouldScroll.value ? 'running' : 'paused',
    '--animation-direction': props.direction === 'left' ? 'normal' : 'reverse'
}));
// 计算动画持续时间
const calculateDuration = () => {
    if (scrollContent.value) {
        const contentWidth = scrollContent.value.scrollWidth / 2;
        animationDuration.value = contentWidth / props.speed;
    }
};
// 处理右图标点击事件
const handleRightIconClick = () => {
    emit('close');
};
// 修改打字机效果实现
const startTypewriter = () => {
    let index = 0;
    currentText.value = '';
    isTypewriterComplete.value = false; // 重置状态
    const type = () => {
        if (index < props.text.length) {
            currentText.value += props.text[index];
            index++;
            typewriterTimer = setTimeout(type, props.typewriterSpeed);
        }
        else {
            isTypewriterComplete.value = true; // 打字完成后设置状态
        }
    };
    type();
};
// 生命周期钩子
onMounted(() => {
    calculateDuration();
    window.addEventListener('resize', calculateDuration);
    if (props.typewriter) {
        startTypewriter();
    }
});
onUnmounted(() => {
    window.removeEventListener('resize', calculateDuration);
    if (typewriterTimer) {
        clearTimeout(typewriterTimer);
    }
});
// 监听文本变化，重新启动打字机效果
watch(() => props.text, () => {
    if (props.typewriter) {
        if (typewriterTimer) {
            clearTimeout(typewriterTimer);
        }
        startTypewriter();
    }
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    speed: 70,
    direction: 'left',
    type: 'default',
    showClose: false,
    typewriter: false,
    typewriterSpeed: 100
});
const __VLS_fnComponent = (await import('vue')).defineComponent({
    emits: {},
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
    __VLS_styleScopedClasses['left-icon'];
    __VLS_styleScopedClasses['right-icon'];
    __VLS_styleScopedClasses['left-icon'];
    __VLS_styleScopedClasses['right-icon'];
    __VLS_styleScopedClasses['scroll-item'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ref: ("containerRef"), ...{ class: ("text-scroll-container") }, ...{ class: (([`text-scroll--${props.type}`])) }, });
    // @ts-ignore navigation for `const containerRef = ref()`
    __VLS_ctx.containerRef;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("left-icon") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("scroll-wrapper") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("text-scroll-content") }, ...{ class: (({ scrolling: __VLS_ctx.shouldScroll })) }, ...{ style: ((__VLS_ctx.scrollStyle)) }, ref: ("scrollContent"), });
    // @ts-ignore navigation for `const scrollContent = ref()`
    __VLS_ctx.scrollContent;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("scroll-item") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.sanitizedContent) }, null, null);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("scroll-item") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.sanitizedContent) }, null, null);
    if (__VLS_ctx.showClose) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.handleRightIconClick) }, ...{ class: ("right-icon") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
    }
    __VLS_styleScopedClasses['text-scroll-container'];
    __VLS_styleScopedClasses['left-icon'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['scroll-wrapper'];
    __VLS_styleScopedClasses['text-scroll-content'];
    __VLS_styleScopedClasses['scrolling'];
    __VLS_styleScopedClasses['scroll-item'];
    __VLS_styleScopedClasses['scroll-item'];
    __VLS_styleScopedClasses['right-icon'];
    __VLS_styleScopedClasses['iconfont-sys'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "containerRef": __VLS_nativeElements['div'],
        "scrollContent": __VLS_nativeElements['div'],
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
            containerRef: containerRef,
            scrollContent: scrollContent,
            shouldScroll: shouldScroll,
            sanitizedContent: sanitizedContent,
            scrollStyle: scrollStyle,
            handleRightIconClick: handleRightIconClick,
        };
    },
    emits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    __typeProps: {},
    props: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map