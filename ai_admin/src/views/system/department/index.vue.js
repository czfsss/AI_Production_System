/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ElMessage, ElMessageBox } from 'element-plus';
import { fetchGetDepartmentList, fetchAddDepartment, fetchUpdateDepartment, fetchDeleteDepartment } from '@/api/system-manage';
import DepartmentPermissionDialog from '@views/system/department/modules/department-permission-dialog.vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'Department' });
const list = ref([]);
const dialog = reactive({
    visible: false,
    mode: 'add',
    form: { name: '', code: '', description: '' }
});
const load = async () => {
    const resp = await fetchGetDepartmentList();
    list.value = resp.records || [];
};
onMounted(load);
const openAdd = () => {
    dialog.mode = 'add';
    dialog.form = { name: '', code: '', description: '' };
    dialog.visible = true;
};
const openEdit = (row) => {
    dialog.mode = 'edit';
    dialog.form = { id: row.id, name: row.name, code: row.code, description: row.description };
    dialog.visible = true;
};
const onSubmit = async () => {
    try {
        if (!dialog.form.name?.trim()) {
            ElMessage.warning('请输入部门名称');
            return;
        }
        const payload = { name: dialog.form.name.trim() };
        const code = dialog.form.code?.trim();
        const desc = dialog.form.description?.trim();
        if (code)
            payload.code = code;
        if (desc)
            payload.description = desc;
        if (dialog.mode === 'add') {
            await fetchAddDepartment(payload);
        }
        else {
            payload.id = dialog.form.id;
            await fetchUpdateDepartment(payload);
        }
        ElMessage.success('保存成功');
        dialog.visible = false;
        await load();
    }
    catch (e) {
        ElMessage.error(e?.detail || '操作失败');
    }
};
const onDelete = async (row) => {
    try {
        await ElMessageBox.confirm(`确定删除部门「${row.name}」?`, '提示', { type: 'warning' });
        await fetchDeleteDepartment({ id: row.id });
        ElMessage.success('删除成功');
        await load();
    }
    catch {
        void 0;
    }
};
const onToggleEnabled = async (row, val) => {
    try {
        await fetchUpdateDepartment({ id: row.id, enabled: val });
        ElMessage.success('状态已更新');
    }
    catch {
        row.enabled = !val;
    }
};
const permissionDialog = ref(false);
const currentDepartment = ref(undefined);
const openPermission = (row) => {
    permissionDialog.value = true;
    currentDepartment.value = { id: row.id, name: row.name };
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
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("page-content") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("box-style") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClick': {} }, type: ("primary"), }));
    const __VLS_2 = __VLS_1({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
    let __VLS_6;
    const __VLS_7 = {
        onClick: (__VLS_ctx.openAdd)
    };
    let __VLS_3;
    let __VLS_4;
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.ElTable, ] } */
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ data: ((__VLS_ctx.list)), ...{ style: (({ width: '100%' })) }, size: ("small"), }));
    const __VLS_10 = __VLS_9({ data: ((__VLS_ctx.list)), ...{ style: (({ width: '100%' })) }, size: ("small"), }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, ] } */
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ prop: ("id"), label: ("ID"), width: ("80"), }));
    const __VLS_16 = __VLS_15({ prop: ("id"), label: ("ID"), width: ("80"), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, ] } */
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ prop: ("name"), label: ("名称"), }));
    const __VLS_22 = __VLS_21({ prop: ("name"), label: ("名称"), }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, ] } */
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ prop: ("code"), label: ("编码"), }));
    const __VLS_28 = __VLS_27({ prop: ("code"), label: ("编码"), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, ] } */
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ prop: ("description"), label: ("描述"), }));
    const __VLS_34 = __VLS_33({ prop: ("description"), label: ("描述"), }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    const __VLS_38 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ] } */
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({ label: ("启用"), width: ("100"), }));
    const __VLS_40 = __VLS_39({ label: ("启用"), width: ("100"), }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_43.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_44 = __VLS_resolvedLocalAndGlobalComponents.ElSwitch;
        /** @type { [typeof __VLS_components.ElSwitch, ] } */
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({ ...{ 'onChange': {} }, modelValue: ((!!row.enabled)), }));
        const __VLS_46 = __VLS_45({ ...{ 'onChange': {} }, modelValue: ((!!row.enabled)), }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        let __VLS_50;
        const __VLS_51 = {
            onChange: ((val) => __VLS_ctx.onToggleEnabled(row, Boolean(val)))
        };
        let __VLS_47;
        let __VLS_48;
        var __VLS_49;
    }
    var __VLS_43;
    const __VLS_52 = __VLS_resolvedLocalAndGlobalComponents.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ] } */
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({ label: ("操作"), width: ("300"), }));
    const __VLS_54 = __VLS_53({ label: ("操作"), width: ("300"), }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_nonNullable(__VLS_57.slots);
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_58 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({ ...{ 'onClick': {} }, text: (true), type: ("primary"), }));
        const __VLS_60 = __VLS_59({ ...{ 'onClick': {} }, text: (true), type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_59));
        let __VLS_64;
        const __VLS_65 = {
            onClick: (...[$event]) => {
                __VLS_ctx.openEdit(row);
            }
        };
        let __VLS_61;
        let __VLS_62;
        __VLS_nonNullable(__VLS_63.slots).default;
        var __VLS_63;
        const __VLS_66 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({ ...{ 'onClick': {} }, text: (true), type: ("danger"), }));
        const __VLS_68 = __VLS_67({ ...{ 'onClick': {} }, text: (true), type: ("danger"), }, ...__VLS_functionalComponentArgsRest(__VLS_67));
        let __VLS_72;
        const __VLS_73 = {
            onClick: (...[$event]) => {
                __VLS_ctx.onDelete(row);
            }
        };
        let __VLS_69;
        let __VLS_70;
        __VLS_nonNullable(__VLS_71.slots).default;
        var __VLS_71;
        const __VLS_74 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({ ...{ 'onClick': {} }, text: (true), }));
        const __VLS_76 = __VLS_75({ ...{ 'onClick': {} }, text: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_75));
        let __VLS_80;
        const __VLS_81 = {
            onClick: (...[$event]) => {
                __VLS_ctx.openPermission(row);
            }
        };
        let __VLS_77;
        let __VLS_78;
        __VLS_nonNullable(__VLS_79.slots).default;
        var __VLS_79;
    }
    var __VLS_57;
    __VLS_nonNullable(__VLS_13.slots).default;
    var __VLS_13;
    const __VLS_82 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.ElDialog, ] } */
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({ modelValue: ((__VLS_ctx.dialog.visible)), title: ((__VLS_ctx.dialog.mode === 'add' ? '新增部门' : '编辑部门')), width: ("480px"), }));
    const __VLS_84 = __VLS_83({ modelValue: ((__VLS_ctx.dialog.visible)), title: ((__VLS_ctx.dialog.mode === 'add' ? '新增部门' : '编辑部门')), width: ("480px"), }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    const __VLS_88 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({ model: ((__VLS_ctx.dialog.form)), labelWidth: ("72px"), }));
    const __VLS_90 = __VLS_89({ model: ((__VLS_ctx.dialog.form)), labelWidth: ("72px"), }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    const __VLS_94 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({ label: ("名称"), required: (true), }));
    const __VLS_96 = __VLS_95({ label: ("名称"), required: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_95));
    const __VLS_100 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({ modelValue: ((__VLS_ctx.dialog.form.name)), }));
    const __VLS_102 = __VLS_101({ modelValue: ((__VLS_ctx.dialog.form.name)), }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    __VLS_nonNullable(__VLS_99.slots).default;
    var __VLS_99;
    const __VLS_106 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({ label: ("编码"), }));
    const __VLS_108 = __VLS_107({ label: ("编码"), }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    const __VLS_112 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({ modelValue: ((__VLS_ctx.dialog.form.code)), }));
    const __VLS_114 = __VLS_113({ modelValue: ((__VLS_ctx.dialog.form.code)), }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    __VLS_nonNullable(__VLS_111.slots).default;
    var __VLS_111;
    const __VLS_118 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({ label: ("描述"), }));
    const __VLS_120 = __VLS_119({ label: ("描述"), }, ...__VLS_functionalComponentArgsRest(__VLS_119));
    const __VLS_124 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({ modelValue: ((__VLS_ctx.dialog.form.description)), }));
    const __VLS_126 = __VLS_125({ modelValue: ((__VLS_ctx.dialog.form.description)), }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    __VLS_nonNullable(__VLS_123.slots).default;
    var __VLS_123;
    __VLS_nonNullable(__VLS_93.slots).default;
    var __VLS_93;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_87.slots);
        const __VLS_130 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({ ...{ 'onClick': {} }, }));
        const __VLS_132 = __VLS_131({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_131));
        let __VLS_136;
        const __VLS_137 = {
            onClick: (...[$event]) => {
                __VLS_ctx.dialog.visible = false;
            }
        };
        let __VLS_133;
        let __VLS_134;
        __VLS_nonNullable(__VLS_135.slots).default;
        var __VLS_135;
        const __VLS_138 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_140 = __VLS_139({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_139));
        let __VLS_144;
        const __VLS_145 = {
            onClick: (__VLS_ctx.onSubmit)
        };
        let __VLS_141;
        let __VLS_142;
        __VLS_nonNullable(__VLS_143.slots).default;
        var __VLS_143;
    }
    var __VLS_87;
    // @ts-ignore
    [DepartmentPermissionDialog,];
    // @ts-ignore
    const __VLS_146 = __VLS_asFunctionalComponent(DepartmentPermissionDialog, new DepartmentPermissionDialog({ ...{ 'onSuccess': {} }, modelValue: ((__VLS_ctx.permissionDialog)), departmentData: ((__VLS_ctx.currentDepartment)), }));
    const __VLS_147 = __VLS_146({ ...{ 'onSuccess': {} }, modelValue: ((__VLS_ctx.permissionDialog)), departmentData: ((__VLS_ctx.currentDepartment)), }, ...__VLS_functionalComponentArgsRest(__VLS_146));
    let __VLS_151;
    const __VLS_152 = {
        onSuccess: (__VLS_ctx.load)
    };
    let __VLS_148;
    let __VLS_149;
    var __VLS_150;
    __VLS_styleScopedClasses['page-content'];
    __VLS_styleScopedClasses['box-style'];
    __VLS_styleScopedClasses['header'];
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
            DepartmentPermissionDialog: DepartmentPermissionDialog,
            list: list,
            dialog: dialog,
            load: load,
            openAdd: openAdd,
            openEdit: openEdit,
            onSubmit: onSubmit,
            onDelete: onDelete,
            onToggleEnabled: onToggleEnabled,
            permissionDialog: permissionDialog,
            currentDepartment: currentDepartment,
            openPermission: openPermission,
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
//# sourceMappingURL=index.vue.js.map