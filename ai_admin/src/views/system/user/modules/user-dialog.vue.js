/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ElMessage } from 'element-plus';
import { fetchGetRoleList, fetchAddUser, fetchUpdateUser } from '@/api/system-manage';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = defineProps();
const emit = defineEmits();
// 角色列表数据
const roleList = ref([]);
onMounted(async () => {
    const res = await fetchGetRoleList({ current: 1, size: 100 });
    if (res && res.records) {
        roleList.value = res.records;
    }
});
// 对话框显示控制
const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
});
const dialogType = computed(() => props.type);
// 表单实例
const formRef = ref();
// 表单数据
const formData = reactive({
    username: '',
    password: '',
    phone: '',
    gender: '男',
    role: []
});
// 表单验证规则
const rules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ],
    gender: [{ required: true, message: '请选择性别', trigger: 'blur' }],
    role: [{ required: true, message: '请选择角色', trigger: 'blur' }]
};
// 初始化表单数据
const initFormData = () => {
    const isEdit = props.type === 'edit' && props.userData;
    const row = props.userData;
    // Map role names to ids if editing?
    // The backend returns roleNames list. But we need roleIds for editing.
    // This is a problem. UserList API returns roleNames.
    // I should change UserList API to return roleIds as well, or mapping is hard.
    // For now, if we don't have roleIds, we might lose the selection in Edit mode.
    // Let's assume userRoles contains roleIds if I change backend? 
    // Or I fetch user detail.
    // But for now, let's just clear roles or try to map by name if names are unique.
    // Wait, userRoles in UserListItem (from backend) is string[] (names).
    // I need IDs.
    // I will update backend to return roleIds in user list or add user detail API.
    // Or I can map names to IDs using roleList.
    let currentRoleIds = [];
    if (isEdit && row.userRoles) {
        currentRoleIds = roleList.value
            .filter(r => row.userRoles.includes(r.roleName))
            .map(r => r.roleId);
    }
    Object.assign(formData, {
        username: isEdit ? row.userName || '' : '',
        password: '',
        phone: isEdit ? row.userPhone || '' : '',
        gender: isEdit ? row.userGender || '男' : '男',
        role: currentRoleIds
    });
};
// 统一监听对话框状态变化
watch(() => [props.visible, props.type, props.userData], ([visible]) => {
    if (visible) {
        // Ensure role list is loaded
        if (roleList.value.length === 0) {
            fetchGetRoleList({ current: 1, size: 100 }).then(res => {
                if (res && res.records)
                    roleList.value = res.records;
                initFormData();
            });
        }
        else {
            initFormData();
        }
        nextTick(() => {
            formRef.value?.clearValidate();
        });
    }
}, { immediate: true });
// 提交表单
const handleSubmit = async () => {
    if (!formRef.value)
        return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                if (dialogType.value === 'add') {
                    await fetchAddUser({
                        username: formData.username,
                        password: formData.password,
                        nickname: formData.username,
                        phone: formData.phone,
                        gender: formData.gender,
                        roleIds: formData.role
                    });
                    ElMessage.success('添加成功');
                }
                else {
                    await fetchUpdateUser({
                        userId: props.userData.id,
                        username: formData.username,
                        phone: formData.phone,
                        gender: formData.gender,
                        roleIds: formData.role
                    });
                    ElMessage.success('更新成功');
                }
                dialogVisible.value = false;
                emit('submit');
            }
            catch (e) {
                console.error(e);
            }
        }
    });
}; /* PartiallyEnd: #3632/scriptSetup.vue */
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
    let __VLS_resolvedLocalAndGlobalComponents;
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.ElDialog, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ modelValue: ((__VLS_ctx.dialogVisible)), title: ((__VLS_ctx.dialogType === 'add' ? '添加用户' : '编辑用户')), width: ("30%"), alignCenter: (true), }));
    const __VLS_2 = __VLS_1({ modelValue: ((__VLS_ctx.dialogVisible)), title: ((__VLS_ctx.dialogType === 'add' ? '添加用户' : '编辑用户')), width: ("30%"), alignCenter: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    const __VLS_7 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({ ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.rules)), labelWidth: ("80px"), }));
    const __VLS_9 = __VLS_8({ ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.rules)), labelWidth: ("80px"), }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_13 = {};
    const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ label: ("用户名"), prop: ("username"), }));
    const __VLS_16 = __VLS_15({ label: ("用户名"), prop: ("username"), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ modelValue: ((__VLS_ctx.formData.username)), }));
    const __VLS_22 = __VLS_21({ modelValue: ((__VLS_ctx.formData.username)), }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_nonNullable(__VLS_19.slots).default;
    var __VLS_19;
    if (__VLS_ctx.dialogType === 'add') {
        const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ label: ("密码"), prop: ("password"), }));
        const __VLS_28 = __VLS_27({ label: ("密码"), prop: ("password"), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
        const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ modelValue: ((__VLS_ctx.formData.password)), type: ("password"), showPassword: (true), }));
        const __VLS_34 = __VLS_33({ modelValue: ((__VLS_ctx.formData.password)), type: ("password"), showPassword: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        __VLS_nonNullable(__VLS_31.slots).default;
        var __VLS_31;
    }
    const __VLS_38 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({ label: ("手机号"), prop: ("phone"), }));
    const __VLS_40 = __VLS_39({ label: ("手机号"), prop: ("phone"), }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    const __VLS_44 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({ modelValue: ((__VLS_ctx.formData.phone)), }));
    const __VLS_46 = __VLS_45({ modelValue: ((__VLS_ctx.formData.phone)), }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_nonNullable(__VLS_43.slots).default;
    var __VLS_43;
    const __VLS_50 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({ label: ("性别"), prop: ("gender"), }));
    const __VLS_52 = __VLS_51({ label: ("性别"), prop: ("gender"), }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    const __VLS_56 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.ElSelect, ] } */
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({ modelValue: ((__VLS_ctx.formData.gender)), }));
    const __VLS_58 = __VLS_57({ modelValue: ((__VLS_ctx.formData.gender)), }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    const __VLS_62 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, ] } */
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({ label: ("男"), value: ("男"), }));
    const __VLS_64 = __VLS_63({ label: ("男"), value: ("男"), }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    const __VLS_68 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
    /** @type { [typeof __VLS_components.ElOption, ] } */
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({ label: ("女"), value: ("女"), }));
    const __VLS_70 = __VLS_69({ label: ("女"), value: ("女"), }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    __VLS_nonNullable(__VLS_61.slots).default;
    var __VLS_61;
    __VLS_nonNullable(__VLS_55.slots).default;
    var __VLS_55;
    const __VLS_74 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({ label: ("角色"), prop: ("role"), }));
    const __VLS_76 = __VLS_75({ label: ("角色"), prop: ("role"), }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    const __VLS_80 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.ElSelect, ] } */
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({ modelValue: ((__VLS_ctx.formData.role)), multiple: (true), }));
    const __VLS_82 = __VLS_81({ modelValue: ((__VLS_ctx.formData.role)), multiple: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    for (const [role] of __VLS_getVForSourceType((__VLS_ctx.roleList))) {
        const __VLS_86 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
        /** @type { [typeof __VLS_components.ElOption, ] } */
        // @ts-ignore
        const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({ key: ((role.roleId)), value: ((role.roleId)), label: ((role.roleName)), }));
        const __VLS_88 = __VLS_87({ key: ((role.roleId)), value: ((role.roleId)), label: ((role.roleName)), }, ...__VLS_functionalComponentArgsRest(__VLS_87));
    }
    __VLS_nonNullable(__VLS_85.slots).default;
    var __VLS_85;
    __VLS_nonNullable(__VLS_79.slots).default;
    var __VLS_79;
    __VLS_nonNullable(__VLS_12.slots).default;
    var __VLS_12;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("dialog-footer") }, });
        const __VLS_92 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({ ...{ 'onClick': {} }, }));
        const __VLS_94 = __VLS_93({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        let __VLS_98;
        const __VLS_99 = {
            onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
            }
        };
        let __VLS_95;
        let __VLS_96;
        __VLS_nonNullable(__VLS_97.slots).default;
        var __VLS_97;
        const __VLS_100 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_102 = __VLS_101({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_101));
        let __VLS_106;
        const __VLS_107 = {
            onClick: (__VLS_ctx.handleSubmit)
        };
        let __VLS_103;
        let __VLS_104;
        __VLS_nonNullable(__VLS_105.slots).default;
        var __VLS_105;
    }
    var __VLS_5;
    __VLS_styleScopedClasses['dialog-footer'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "formRef": __VLS_13,
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
            roleList: roleList,
            dialogVisible: dialogVisible,
            dialogType: dialogType,
            formRef: formRef,
            formData: formData,
            rules: rules,
            handleSubmit: handleSubmit,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=user-dialog.vue.js.map