/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ElMessage } from 'element-plus';
import { fetchAddRole, fetchUpdateRole } from '@/api/system-manage';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = withDefaults(defineProps(), {
    modelValue: false,
    dialogType: 'add',
    roleData: undefined
});
const emit = defineEmits();
const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});
const formRef = ref();
const rules = reactive({
    roleName: [
        { required: true, message: '请输入角色名称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    roleCode: [
        { required: true, message: '请输入角色编码', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    description: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
});
const form = reactive({
    roleId: 0,
    roleName: '',
    roleCode: '',
    description: '',
    createTime: '',
    enabled: true
});
// 监听弹窗打开，初始化表单数据
watch(() => props.modelValue, (newVal) => {
    if (newVal) {
        initForm();
    }
}, { immediate: true });
// 监听角色数据变化
watch(() => props.roleData, (newData) => {
    if (newData && props.modelValue) {
        initForm();
    }
}, { deep: true });
const initForm = () => {
    if (props.dialogType === 'edit' && props.roleData) {
        Object.assign(form, {
            roleId: props.roleData.roleId,
            roleName: props.roleData.roleName,
            roleCode: props.roleData.roleCode,
            description: props.roleData.description,
            createTime: props.roleData.createTime,
            enabled: props.roleData.enabled
        });
    }
    else {
        Object.assign(form, {
            roleId: 0,
            roleName: '',
            roleCode: '',
            description: '',
            createTime: '',
            enabled: true
        });
    }
};
const handleClose = () => {
    visible.value = false;
    formRef.value?.resetFields();
};
const handleSubmit = async () => {
    if (!formRef.value)
        return;
    try {
        await formRef.value.validate();
        if (props.dialogType === 'add') {
            await fetchAddRole({
                name: form.roleName,
                code: form.roleCode,
                description: form.description,
                enabled: form.enabled
            });
            ElMessage.success('新增成功');
        }
        else {
            await fetchUpdateRole({
                roleId: form.roleId,
                name: form.roleName,
                code: form.roleCode,
                description: form.description,
                enabled: form.enabled
            });
            ElMessage.success('修改成功');
        }
        emit('success');
        handleClose();
    }
    catch (error) {
        console.log('提交失败:', error);
    }
}; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    modelValue: false,
    dialogType: 'add',
    roleData: undefined
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
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.ElDialog, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.visible)), title: ((__VLS_ctx.dialogType === 'add' ? '新增角色' : '编辑角色')), width: ("30%"), alignCenter: (true), }));
    const __VLS_2 = __VLS_1({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.visible)), title: ((__VLS_ctx.dialogType === 'add' ? '新增角色' : '编辑角色')), width: ("30%"), alignCenter: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    let __VLS_7;
    const __VLS_8 = {
        onClose: (__VLS_ctx.handleClose)
    };
    let __VLS_3;
    let __VLS_4;
    const __VLS_9 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({ ref: ("formRef"), model: ((__VLS_ctx.form)), rules: ((__VLS_ctx.rules)), labelWidth: ("120px"), }));
    const __VLS_11 = __VLS_10({ ref: ("formRef"), model: ((__VLS_ctx.form)), rules: ((__VLS_ctx.rules)), labelWidth: ("120px"), }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_15 = {};
    const __VLS_16 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({ label: ("角色名称"), prop: ("roleName"), }));
    const __VLS_18 = __VLS_17({ label: ("角色名称"), prop: ("roleName"), }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    const __VLS_22 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({ modelValue: ((__VLS_ctx.form.roleName)), }));
    const __VLS_24 = __VLS_23({ modelValue: ((__VLS_ctx.form.roleName)), }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    __VLS_nonNullable(__VLS_21.slots).default;
    var __VLS_21;
    const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({ label: ("角色编码"), prop: ("roleCode"), }));
    const __VLS_30 = __VLS_29({ label: ("角色编码"), prop: ("roleCode"), }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    const __VLS_34 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({ modelValue: ((__VLS_ctx.form.roleCode)), }));
    const __VLS_36 = __VLS_35({ modelValue: ((__VLS_ctx.form.roleCode)), }, ...__VLS_functionalComponentArgsRest(__VLS_35));
    __VLS_nonNullable(__VLS_33.slots).default;
    var __VLS_33;
    const __VLS_40 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({ label: ("描述"), prop: ("description"), }));
    const __VLS_42 = __VLS_41({ label: ("描述"), prop: ("description"), }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    const __VLS_46 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({ modelValue: ((__VLS_ctx.form.description)), type: ("textarea"), rows: ((3)), }));
    const __VLS_48 = __VLS_47({ modelValue: ((__VLS_ctx.form.description)), type: ("textarea"), rows: ((3)), }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    __VLS_nonNullable(__VLS_45.slots).default;
    var __VLS_45;
    const __VLS_52 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({ label: ("启用"), }));
    const __VLS_54 = __VLS_53({ label: ("启用"), }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    const __VLS_58 = __VLS_resolvedLocalAndGlobalComponents.ElSwitch;
    /** @type { [typeof __VLS_components.ElSwitch, ] } */
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({ modelValue: ((__VLS_ctx.form.enabled)), }));
    const __VLS_60 = __VLS_59({ modelValue: ((__VLS_ctx.form.enabled)), }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    __VLS_nonNullable(__VLS_57.slots).default;
    var __VLS_57;
    __VLS_nonNullable(__VLS_14.slots).default;
    var __VLS_14;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("dialog-footer") }, });
        const __VLS_64 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({ ...{ 'onClick': {} }, }));
        const __VLS_66 = __VLS_65({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        let __VLS_70;
        const __VLS_71 = {
            onClick: (__VLS_ctx.handleClose)
        };
        let __VLS_67;
        let __VLS_68;
        __VLS_nonNullable(__VLS_69.slots).default;
        var __VLS_69;
        const __VLS_72 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_74 = __VLS_73({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_73));
        let __VLS_78;
        const __VLS_79 = {
            onClick: (__VLS_ctx.handleSubmit)
        };
        let __VLS_75;
        let __VLS_76;
        __VLS_nonNullable(__VLS_77.slots).default;
        var __VLS_77;
    }
    var __VLS_5;
    __VLS_styleScopedClasses['dialog-footer'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "formRef": __VLS_15,
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
            visible: visible,
            formRef: formRef,
            rules: rules,
            form: form,
            handleClose: handleClose,
            handleSubmit: handleSubmit,
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
//# sourceMappingURL=role-edit-dialog.vue.js.map