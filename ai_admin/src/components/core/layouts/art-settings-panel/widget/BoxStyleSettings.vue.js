/// <reference types="../../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import SectionTitle from './SectionTitle.vue';
import { useSettingStore } from '@/store/modules/setting';
import { useSettingsConfig } from '../composables/useSettingsConfig';
import { useSettingsHandlers } from '../composables/useSettingsHandlers';
import { storeToRefs } from 'pinia';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const settingStore = useSettingStore();
const { boxBorderMode } = storeToRefs(settingStore);
const { boxStyleOptions } = useSettingsConfig();
const { boxStyleHandlers } = useSettingsHandlers();
// 判断当前选项是否激活
const isActive = (type) => {
    return type === 'border-mode' ? boxBorderMode.value : !boxBorderMode.value;
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
    __VLS_styleScopedClasses['is-active'];
    __VLS_styleScopedClasses['box-style-settings'];
    __VLS_styleScopedClasses['box-style'];
    __VLS_styleScopedClasses['button'];
    __VLS_styleScopedClasses['is-active'];
    __VLS_styleScopedClasses['is-active'];
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("box-style-settings") }, });
    // @ts-ignore
    [SectionTitle,];
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(SectionTitle, new SectionTitle({ title: ((__VLS_ctx.$t('setting.box.title'))), ...{ style: (({ marginTop: '40px' })) }, }));
    const __VLS_1 = __VLS_0({ title: ((__VLS_ctx.$t('setting.box.title'))), ...{ style: (({ marginTop: '40px' })) }, }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("box-style") }, });
    for (const [option] of __VLS_getVForSourceType((__VLS_ctx.boxStyleOptions))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.boxStyleHandlers.setBoxMode(option.type);
                } }, key: ((option.value)), ...{ class: ("button") }, ...{ class: (({ 'is-active': __VLS_ctx.isActive(option.type) })) }, });
        (option.label);
    }
    __VLS_styleScopedClasses['box-style-settings'];
    __VLS_styleScopedClasses['box-style'];
    __VLS_styleScopedClasses['button'];
    __VLS_styleScopedClasses['is-active'];
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
            SectionTitle: SectionTitle,
            boxStyleOptions: boxStyleOptions,
            boxStyleHandlers: boxStyleHandlers,
            isActive: isActive,
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
//# sourceMappingURL=BoxStyleSettings.vue.js.map