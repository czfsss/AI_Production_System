/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
// 导入默认图标
import defaultIcon from '@imgs/3d/icon1.webp';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtCardBanner' });
const props = withDefaults(defineProps(), {
    height: '24rem',
    image: defaultIcon,
    title: '',
    description: '',
    // 主按钮默认配置
    button: () => ({
        show: true,
        text: '查看详情',
        color: 'var(--main-color)',
        textColor: '#fff'
    }),
    // 取消按钮默认配置
    cancelButton: () => ({
        show: false,
        text: '取消',
        color: '#f5f5f5',
        textColor: '#666'
    })
});
const emit = defineEmits();
// 主按钮点击处理函数
const handleClick = () => {
    emit('click');
};
// 取消按钮点击处理函数
const handleCancel = () => {
    emit('cancel');
}; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    height: '24rem',
    image: defaultIcon,
    title: '',
    description: '',
    // 主按钮默认配置
    button: () => ({
        show: true,
        text: '查看详情',
        color: 'var(--main-color)',
        textColor: '#fff'
    }),
    // 取消按钮默认配置
    cancelButton: () => ({
        show: false,
        text: '取消',
        color: '#f5f5f5',
        textColor: '#666'
    })
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("card-banner art-custom-card") }, ...{ style: (({ height: props.height })) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("banner-content") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("banner-icon") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ src: ((props.image)), alt: ((props.title)), });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("banner-text") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("banner-title") }, });
    (props.title);
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("banner-description") }, });
    (props.description);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("banner-buttons") }, });
    if (props.cancelButton?.show) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.handleCancel) }, ...{ class: ("banner-button cancel-button") }, ...{ style: (({
                    backgroundColor: props.cancelButton?.color,
                    color: props.cancelButton?.textColor
                })) }, });
        (props.cancelButton?.text);
    }
    if (props.button?.show) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.handleClick) }, ...{ class: ("banner-button") }, ...{ style: (({ backgroundColor: props.button?.color, color: props.button?.textColor })) }, });
        (props.button?.text);
    }
    __VLS_styleScopedClasses['card-banner'];
    __VLS_styleScopedClasses['art-custom-card'];
    __VLS_styleScopedClasses['banner-content'];
    __VLS_styleScopedClasses['banner-icon'];
    __VLS_styleScopedClasses['banner-text'];
    __VLS_styleScopedClasses['banner-title'];
    __VLS_styleScopedClasses['banner-description'];
    __VLS_styleScopedClasses['banner-buttons'];
    __VLS_styleScopedClasses['banner-button'];
    __VLS_styleScopedClasses['cancel-button'];
    __VLS_styleScopedClasses['banner-button'];
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
            handleClick: handleClick,
            handleCancel: handleCancel,
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