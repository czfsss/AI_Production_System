import { ElMessage } from 'element-plus';
import { IconTypeEnum } from '@/enums/appEnum';
import { formatMenuTitle } from '@/router/utils/utils';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const props = withDefaults(defineProps(), {
    visible: false,
    type: 'menu',
    lockType: false
});
const emit = defineEmits();
const formRef = ref();
const menuType = ref('menu');
const isEdit = ref(false);
const iconType = ref(IconTypeEnum.UNICODE);
const form = reactive({
    id: 0,
    name: '',
    path: '',
    label: '',
    component: '',
    icon: '',
    isEnable: true,
    sort: 1,
    isMenu: true,
    keepAlive: true,
    isHide: false,
    isHideTab: false,
    link: '',
    isIframe: false,
    showBadge: false,
    showTextBadge: '',
    fixedTab: false,
    activePath: '',
    roles: [],
    authName: '',
    authLabel: '',
    authIcon: '',
    authSort: 1
});
const rules = reactive({
    name: [
        { required: true, message: '请输入菜单名称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
    label: [{ required: true, message: '输入权限标识', trigger: 'blur' }],
    component: [{ required: false, message: '请输入组件路径', trigger: 'blur' }],
    authName: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
    authLabel: [{ required: true, message: '请输入权限标识', trigger: 'blur' }]
});
const dialogTitle = computed(() => {
    const type = menuType.value === 'menu' ? '菜单' : '权限';
    return isEdit.value ? `编辑${type}` : `新建${type}`;
});
const disableMenuType = computed(() => {
    if (isEdit.value)
        return true;
    if (!isEdit.value && menuType.value === 'menu' && props.lockType)
        return true;
    return false;
});
const rolesString = computed({
    get: () => form.roles.join(','),
    set: (value) => {
        form.roles = value
            ? value
                .split(',')
                .map((role) => role.trim())
                .filter((role) => role)
            : [];
    }
});
const resetForm = () => {
    formRef.value?.resetFields();
    Object.assign(form, {
        id: 0,
        name: '',
        path: '',
        label: '',
        component: '',
        icon: '',
        isEnable: true,
        sort: 1,
        isMenu: true,
        keepAlive: true,
        isHide: false,
        isHideTab: false,
        link: '',
        isIframe: false,
        showBadge: false,
        showTextBadge: '',
        fixedTab: false,
        activePath: '',
        roles: [],
        authName: '',
        authLabel: '',
        authIcon: '',
        authSort: 1
    });
};
const loadFormData = () => {
    if (!props.editData)
        return;
    isEdit.value = true;
    if (menuType.value === 'menu') {
        const row = props.editData;
        form.id = row.id || 0;
        form.name = formatMenuTitle(row.meta?.title || '');
        form.path = row.path || '';
        form.label = row.name || '';
        form.component = row.component || '';
        form.icon = row.meta?.icon || '';
        form.sort = row.meta?.sort || 1;
        form.isMenu = row.meta?.isMenu ?? true;
        form.keepAlive = row.meta?.keepAlive ?? false;
        form.isHide = row.meta?.isHide ?? false;
        form.isHideTab = row.meta?.isHideTab ?? false;
        form.isEnable = row.meta?.isEnable ?? true;
        form.link = row.meta?.link || '';
        form.isIframe = row.meta?.isIframe ?? false;
        form.showBadge = row.meta?.showBadge ?? false;
        form.showTextBadge = row.meta?.showTextBadge || '';
        form.fixedTab = row.meta?.fixedTab ?? false;
        form.activePath = row.meta?.activePath || '';
        form.roles = row.meta?.roles || [];
    }
    else {
        const row = props.editData;
        form.authName = row.title || '';
        form.authLabel = row.authMark || '';
        form.authIcon = row.icon || '';
        form.authSort = row.sort || 1;
    }
};
const handleSubmit = async () => {
    if (!formRef.value)
        return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                emit('submit', { ...form });
                ElMessage.success(`${isEdit.value ? '编辑' : '新增'}成功`);
                handleCancel();
            }
            catch {
                ElMessage.error(`${isEdit.value ? '编辑' : '新增'}失败`);
            }
        }
    });
};
const handleCancel = () => {
    emit('update:visible', false);
};
const handleClosed = () => {
    resetForm();
    isEdit.value = false;
};
watch(() => props.visible, (newVal) => {
    if (newVal) {
        menuType.value = props.type;
        nextTick(() => {
            if (props.editData) {
                loadFormData();
            }
        });
    }
});
// 监听 type 变化
watch(() => props.type, (newType) => {
    if (props.visible) {
        menuType.value = newType;
    }
}); /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    visible: false,
    type: 'menu',
    lockType: false
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
    let __VLS_resolvedLocalAndGlobalComponents;
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.ElDialog, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onUpdate:modelValue': {} }, ...{ 'onClosed': {} }, title: ((__VLS_ctx.dialogTitle)), modelValue: ((__VLS_ctx.visible)), width: ("800px"), alignCenter: (true), ...{ class: ("menu-dialog") }, }));
    const __VLS_2 = __VLS_1({ ...{ 'onUpdate:modelValue': {} }, ...{ 'onClosed': {} }, title: ((__VLS_ctx.dialogTitle)), modelValue: ((__VLS_ctx.visible)), width: ("800px"), alignCenter: (true), ...{ class: ("menu-dialog") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    let __VLS_7;
    const __VLS_8 = {
        'onUpdate:modelValue': (__VLS_ctx.handleCancel)
    };
    const __VLS_9 = {
        onClosed: (__VLS_ctx.handleClosed)
    };
    let __VLS_3;
    let __VLS_4;
    const __VLS_10 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({ ref: ("formRef"), model: ((__VLS_ctx.form)), rules: ((__VLS_ctx.rules)), labelWidth: ("85px"), }));
    const __VLS_12 = __VLS_11({ ref: ("formRef"), model: ((__VLS_ctx.form)), rules: ((__VLS_ctx.rules)), labelWidth: ("85px"), }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_16 = {};
    const __VLS_17 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({ label: ("菜单类型"), }));
    const __VLS_19 = __VLS_18({ label: ("菜单类型"), }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    const __VLS_23 = __VLS_resolvedLocalAndGlobalComponents.ElRadioGroup;
    /** @type { [typeof __VLS_components.ElRadioGroup, typeof __VLS_components.ElRadioGroup, ] } */
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({ modelValue: ((__VLS_ctx.menuType)), disabled: ((__VLS_ctx.disableMenuType)), }));
    const __VLS_25 = __VLS_24({ modelValue: ((__VLS_ctx.menuType)), disabled: ((__VLS_ctx.disableMenuType)), }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    const __VLS_29 = __VLS_resolvedLocalAndGlobalComponents.ElRadioButton;
    /** @type { [typeof __VLS_components.ElRadioButton, typeof __VLS_components.ElRadioButton, ] } */
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({ value: ("menu"), label: ("menu"), }));
    const __VLS_31 = __VLS_30({ value: ("menu"), label: ("menu"), }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    __VLS_nonNullable(__VLS_34.slots).default;
    var __VLS_34;
    const __VLS_35 = __VLS_resolvedLocalAndGlobalComponents.ElRadioButton;
    /** @type { [typeof __VLS_components.ElRadioButton, typeof __VLS_components.ElRadioButton, ] } */
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({ value: ("button"), label: ("button"), }));
    const __VLS_37 = __VLS_36({ value: ("button"), label: ("button"), }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    __VLS_nonNullable(__VLS_40.slots).default;
    var __VLS_40;
    __VLS_nonNullable(__VLS_28.slots).default;
    var __VLS_28;
    __VLS_nonNullable(__VLS_22.slots).default;
    var __VLS_22;
    if (__VLS_ctx.menuType === 'menu') {
        const __VLS_41 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
        /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({ gutter: ((20)), }));
        const __VLS_43 = __VLS_42({ gutter: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_42));
        const __VLS_47 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({ span: ((12)), }));
        const __VLS_49 = __VLS_48({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_48));
        const __VLS_53 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({ label: ("菜单名称"), prop: ("name"), }));
        const __VLS_55 = __VLS_54({ label: ("菜单名称"), prop: ("name"), }, ...__VLS_functionalComponentArgsRest(__VLS_54));
        const __VLS_59 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({ modelValue: ((__VLS_ctx.form.name)), placeholder: ("菜单名称"), }));
        const __VLS_61 = __VLS_60({ modelValue: ((__VLS_ctx.form.name)), placeholder: ("菜单名称"), }, ...__VLS_functionalComponentArgsRest(__VLS_60));
        __VLS_nonNullable(__VLS_58.slots).default;
        var __VLS_58;
        __VLS_nonNullable(__VLS_52.slots).default;
        var __VLS_52;
        const __VLS_65 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({ span: ((12)), }));
        const __VLS_67 = __VLS_66({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_66));
        const __VLS_71 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({ label: ("路由地址"), prop: ("path"), }));
        const __VLS_73 = __VLS_72({ label: ("路由地址"), prop: ("path"), }, ...__VLS_functionalComponentArgsRest(__VLS_72));
        const __VLS_77 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({ modelValue: ((__VLS_ctx.form.path)), placeholder: ("路由地址"), }));
        const __VLS_79 = __VLS_78({ modelValue: ((__VLS_ctx.form.path)), placeholder: ("路由地址"), }, ...__VLS_functionalComponentArgsRest(__VLS_78));
        __VLS_nonNullable(__VLS_76.slots).default;
        var __VLS_76;
        __VLS_nonNullable(__VLS_70.slots).default;
        var __VLS_70;
        __VLS_nonNullable(__VLS_46.slots).default;
        var __VLS_46;
        const __VLS_83 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
        /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
        // @ts-ignore
        const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({ gutter: ((20)), }));
        const __VLS_85 = __VLS_84({ gutter: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_84));
        const __VLS_89 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({ span: ((12)), }));
        const __VLS_91 = __VLS_90({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_90));
        const __VLS_95 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_96 = __VLS_asFunctionalComponent(__VLS_95, new __VLS_95({ label: ("权限标识"), prop: ("label"), }));
        const __VLS_97 = __VLS_96({ label: ("权限标识"), prop: ("label"), }, ...__VLS_functionalComponentArgsRest(__VLS_96));
        const __VLS_101 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({ modelValue: ((__VLS_ctx.form.label)), placeholder: ("权限标识"), }));
        const __VLS_103 = __VLS_102({ modelValue: ((__VLS_ctx.form.label)), placeholder: ("权限标识"), }, ...__VLS_functionalComponentArgsRest(__VLS_102));
        __VLS_nonNullable(__VLS_100.slots).default;
        var __VLS_100;
        __VLS_nonNullable(__VLS_94.slots).default;
        var __VLS_94;
        const __VLS_107 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_108 = __VLS_asFunctionalComponent(__VLS_107, new __VLS_107({ span: ((12)), }));
        const __VLS_109 = __VLS_108({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_108));
        const __VLS_113 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({ label: ("组件路径"), prop: ("component"), }));
        const __VLS_115 = __VLS_114({ label: ("组件路径"), prop: ("component"), }, ...__VLS_functionalComponentArgsRest(__VLS_114));
        const __VLS_119 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({ modelValue: ((__VLS_ctx.form.component)), placeholder: ("组件路径"), }));
        const __VLS_121 = __VLS_120({ modelValue: ((__VLS_ctx.form.component)), placeholder: ("组件路径"), }, ...__VLS_functionalComponentArgsRest(__VLS_120));
        __VLS_nonNullable(__VLS_118.slots).default;
        var __VLS_118;
        __VLS_nonNullable(__VLS_112.slots).default;
        var __VLS_112;
        __VLS_nonNullable(__VLS_88.slots).default;
        var __VLS_88;
        const __VLS_125 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
        /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
        // @ts-ignore
        const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({ gutter: ((20)), }));
        const __VLS_127 = __VLS_126({ gutter: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_126));
        const __VLS_131 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_132 = __VLS_asFunctionalComponent(__VLS_131, new __VLS_131({ span: ((12)), }));
        const __VLS_133 = __VLS_132({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_132));
        const __VLS_137 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({ label: ("图标"), prop: ("icon"), }));
        const __VLS_139 = __VLS_138({ label: ("图标"), prop: ("icon"), }, ...__VLS_functionalComponentArgsRest(__VLS_138));
        const __VLS_143 = __VLS_resolvedLocalAndGlobalComponents.ArtIconSelector;
        /** @type { [typeof __VLS_components.ArtIconSelector, ] } */
        // @ts-ignore
        const __VLS_144 = __VLS_asFunctionalComponent(__VLS_143, new __VLS_143({ modelValue: ((__VLS_ctx.form.icon)), iconType: ((__VLS_ctx.iconType)), width: ("100%"), }));
        const __VLS_145 = __VLS_144({ modelValue: ((__VLS_ctx.form.icon)), iconType: ((__VLS_ctx.iconType)), width: ("100%"), }, ...__VLS_functionalComponentArgsRest(__VLS_144));
        __VLS_nonNullable(__VLS_142.slots).default;
        var __VLS_142;
        __VLS_nonNullable(__VLS_136.slots).default;
        var __VLS_136;
        const __VLS_149 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({ span: ((12)), }));
        const __VLS_151 = __VLS_150({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_150));
        const __VLS_155 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_156 = __VLS_asFunctionalComponent(__VLS_155, new __VLS_155({ label: ("角色权限"), prop: ("roles"), }));
        const __VLS_157 = __VLS_156({ label: ("角色权限"), prop: ("roles"), }, ...__VLS_functionalComponentArgsRest(__VLS_156));
        const __VLS_161 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_162 = __VLS_asFunctionalComponent(__VLS_161, new __VLS_161({ modelValue: ((__VLS_ctx.rolesString)), placeholder: ("角色权限，多个用逗号分隔"), }));
        const __VLS_163 = __VLS_162({ modelValue: ((__VLS_ctx.rolesString)), placeholder: ("角色权限，多个用逗号分隔"), }, ...__VLS_functionalComponentArgsRest(__VLS_162));
        __VLS_nonNullable(__VLS_160.slots).default;
        var __VLS_160;
        __VLS_nonNullable(__VLS_154.slots).default;
        var __VLS_154;
        __VLS_nonNullable(__VLS_130.slots).default;
        var __VLS_130;
        const __VLS_167 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
        /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
        // @ts-ignore
        const __VLS_168 = __VLS_asFunctionalComponent(__VLS_167, new __VLS_167({ gutter: ((20)), }));
        const __VLS_169 = __VLS_168({ gutter: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_168));
        const __VLS_173 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({ span: ((12)), }));
        const __VLS_175 = __VLS_174({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_174));
        const __VLS_179 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_180 = __VLS_asFunctionalComponent(__VLS_179, new __VLS_179({ label: ("菜单排序"), prop: ("sort"), }));
        const __VLS_181 = __VLS_180({ label: ("菜单排序"), prop: ("sort"), }, ...__VLS_functionalComponentArgsRest(__VLS_180));
        const __VLS_185 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
        /** @type { [typeof __VLS_components.ElInputNumber, ] } */
        // @ts-ignore
        const __VLS_186 = __VLS_asFunctionalComponent(__VLS_185, new __VLS_185({ modelValue: ((__VLS_ctx.form.sort)), ...{ style: ({}) }, min: ((1)), controlsPosition: ("right"), }));
        const __VLS_187 = __VLS_186({ modelValue: ((__VLS_ctx.form.sort)), ...{ style: ({}) }, min: ((1)), controlsPosition: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_186));
        __VLS_nonNullable(__VLS_184.slots).default;
        var __VLS_184;
        __VLS_nonNullable(__VLS_178.slots).default;
        var __VLS_178;
        const __VLS_191 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_192 = __VLS_asFunctionalComponent(__VLS_191, new __VLS_191({ span: ((12)), }));
        const __VLS_193 = __VLS_192({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_192));
        const __VLS_197 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_198 = __VLS_asFunctionalComponent(__VLS_197, new __VLS_197({ label: ("外部链接"), prop: ("link"), }));
        const __VLS_199 = __VLS_198({ label: ("外部链接"), prop: ("link"), }, ...__VLS_functionalComponentArgsRest(__VLS_198));
        const __VLS_203 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_204 = __VLS_asFunctionalComponent(__VLS_203, new __VLS_203({ modelValue: ((__VLS_ctx.form.link)), placeholder: ("外部链接/内嵌地址(https://www.baidu.com)"), }));
        const __VLS_205 = __VLS_204({ modelValue: ((__VLS_ctx.form.link)), placeholder: ("外部链接/内嵌地址(https://www.baidu.com)"), }, ...__VLS_functionalComponentArgsRest(__VLS_204));
        __VLS_nonNullable(__VLS_202.slots).default;
        var __VLS_202;
        __VLS_nonNullable(__VLS_196.slots).default;
        var __VLS_196;
        __VLS_nonNullable(__VLS_172.slots).default;
        var __VLS_172;
        const __VLS_209 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
        /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
        // @ts-ignore
        const __VLS_210 = __VLS_asFunctionalComponent(__VLS_209, new __VLS_209({ gutter: ((20)), }));
        const __VLS_211 = __VLS_210({ gutter: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_210));
        const __VLS_215 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_216 = __VLS_asFunctionalComponent(__VLS_215, new __VLS_215({ span: ((12)), }));
        const __VLS_217 = __VLS_216({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_216));
        const __VLS_221 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_222 = __VLS_asFunctionalComponent(__VLS_221, new __VLS_221({ label: ("文本徽章"), prop: ("showTextBadge"), }));
        const __VLS_223 = __VLS_222({ label: ("文本徽章"), prop: ("showTextBadge"), }, ...__VLS_functionalComponentArgsRest(__VLS_222));
        const __VLS_227 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_228 = __VLS_asFunctionalComponent(__VLS_227, new __VLS_227({ modelValue: ((__VLS_ctx.form.showTextBadge)), placeholder: ("文本徽章内容"), }));
        const __VLS_229 = __VLS_228({ modelValue: ((__VLS_ctx.form.showTextBadge)), placeholder: ("文本徽章内容"), }, ...__VLS_functionalComponentArgsRest(__VLS_228));
        __VLS_nonNullable(__VLS_226.slots).default;
        var __VLS_226;
        __VLS_nonNullable(__VLS_220.slots).default;
        var __VLS_220;
        const __VLS_233 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_234 = __VLS_asFunctionalComponent(__VLS_233, new __VLS_233({ span: ((12)), }));
        const __VLS_235 = __VLS_234({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_234));
        const __VLS_239 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_240 = __VLS_asFunctionalComponent(__VLS_239, new __VLS_239({ label: ("激活路径"), prop: ("activePath"), }));
        const __VLS_241 = __VLS_240({ label: ("激活路径"), prop: ("activePath"), }, ...__VLS_functionalComponentArgsRest(__VLS_240));
        const __VLS_245 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_246 = __VLS_asFunctionalComponent(__VLS_245, new __VLS_245({ modelValue: ((__VLS_ctx.form.activePath)), placeholder: ("详情页激活选中的菜单路径"), }));
        const __VLS_247 = __VLS_246({ modelValue: ((__VLS_ctx.form.activePath)), placeholder: ("详情页激活选中的菜单路径"), }, ...__VLS_functionalComponentArgsRest(__VLS_246));
        __VLS_nonNullable(__VLS_244.slots).default;
        var __VLS_244;
        __VLS_nonNullable(__VLS_238.slots).default;
        var __VLS_238;
        __VLS_nonNullable(__VLS_214.slots).default;
        var __VLS_214;
        const __VLS_251 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
        /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
        // @ts-ignore
        const __VLS_252 = __VLS_asFunctionalComponent(__VLS_251, new __VLS_251({ gutter: ((20)), }));
        const __VLS_253 = __VLS_252({ gutter: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_252));
        const __VLS_257 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_258 = __VLS_asFunctionalComponent(__VLS_257, new __VLS_257({ span: ((6)), }));
        const __VLS_259 = __VLS_258({ span: ((6)), }, ...__VLS_functionalComponentArgsRest(__VLS_258));
        const __VLS_263 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_264 = __VLS_asFunctionalComponent(__VLS_263, new __VLS_263({ label: ("是否启用"), prop: ("isEnable"), }));
        const __VLS_265 = __VLS_264({ label: ("是否启用"), prop: ("isEnable"), }, ...__VLS_functionalComponentArgsRest(__VLS_264));
        const __VLS_269 = __VLS_resolvedLocalAndGlobalComponents.ElSwitch;
        /** @type { [typeof __VLS_components.ElSwitch, ] } */
        // @ts-ignore
        const __VLS_270 = __VLS_asFunctionalComponent(__VLS_269, new __VLS_269({ modelValue: ((__VLS_ctx.form.isEnable)), }));
        const __VLS_271 = __VLS_270({ modelValue: ((__VLS_ctx.form.isEnable)), }, ...__VLS_functionalComponentArgsRest(__VLS_270));
        __VLS_nonNullable(__VLS_268.slots).default;
        var __VLS_268;
        __VLS_nonNullable(__VLS_262.slots).default;
        var __VLS_262;
        const __VLS_275 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_276 = __VLS_asFunctionalComponent(__VLS_275, new __VLS_275({ span: ((6)), }));
        const __VLS_277 = __VLS_276({ span: ((6)), }, ...__VLS_functionalComponentArgsRest(__VLS_276));
        const __VLS_281 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_282 = __VLS_asFunctionalComponent(__VLS_281, new __VLS_281({ label: ("页面缓存"), prop: ("keepAlive"), }));
        const __VLS_283 = __VLS_282({ label: ("页面缓存"), prop: ("keepAlive"), }, ...__VLS_functionalComponentArgsRest(__VLS_282));
        const __VLS_287 = __VLS_resolvedLocalAndGlobalComponents.ElSwitch;
        /** @type { [typeof __VLS_components.ElSwitch, ] } */
        // @ts-ignore
        const __VLS_288 = __VLS_asFunctionalComponent(__VLS_287, new __VLS_287({ modelValue: ((__VLS_ctx.form.keepAlive)), }));
        const __VLS_289 = __VLS_288({ modelValue: ((__VLS_ctx.form.keepAlive)), }, ...__VLS_functionalComponentArgsRest(__VLS_288));
        __VLS_nonNullable(__VLS_286.slots).default;
        var __VLS_286;
        __VLS_nonNullable(__VLS_280.slots).default;
        var __VLS_280;
        const __VLS_293 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_294 = __VLS_asFunctionalComponent(__VLS_293, new __VLS_293({ span: ((6)), }));
        const __VLS_295 = __VLS_294({ span: ((6)), }, ...__VLS_functionalComponentArgsRest(__VLS_294));
        const __VLS_299 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_300 = __VLS_asFunctionalComponent(__VLS_299, new __VLS_299({ label: ("隐藏菜单"), prop: ("isHide"), }));
        const __VLS_301 = __VLS_300({ label: ("隐藏菜单"), prop: ("isHide"), }, ...__VLS_functionalComponentArgsRest(__VLS_300));
        const __VLS_305 = __VLS_resolvedLocalAndGlobalComponents.ElSwitch;
        /** @type { [typeof __VLS_components.ElSwitch, ] } */
        // @ts-ignore
        const __VLS_306 = __VLS_asFunctionalComponent(__VLS_305, new __VLS_305({ modelValue: ((__VLS_ctx.form.isHide)), }));
        const __VLS_307 = __VLS_306({ modelValue: ((__VLS_ctx.form.isHide)), }, ...__VLS_functionalComponentArgsRest(__VLS_306));
        __VLS_nonNullable(__VLS_304.slots).default;
        var __VLS_304;
        __VLS_nonNullable(__VLS_298.slots).default;
        var __VLS_298;
        const __VLS_311 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_312 = __VLS_asFunctionalComponent(__VLS_311, new __VLS_311({ span: ((6)), }));
        const __VLS_313 = __VLS_312({ span: ((6)), }, ...__VLS_functionalComponentArgsRest(__VLS_312));
        const __VLS_317 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_318 = __VLS_asFunctionalComponent(__VLS_317, new __VLS_317({ label: ("是否内嵌"), prop: ("isIframe"), }));
        const __VLS_319 = __VLS_318({ label: ("是否内嵌"), prop: ("isIframe"), }, ...__VLS_functionalComponentArgsRest(__VLS_318));
        const __VLS_323 = __VLS_resolvedLocalAndGlobalComponents.ElSwitch;
        /** @type { [typeof __VLS_components.ElSwitch, ] } */
        // @ts-ignore
        const __VLS_324 = __VLS_asFunctionalComponent(__VLS_323, new __VLS_323({ modelValue: ((__VLS_ctx.form.isIframe)), }));
        const __VLS_325 = __VLS_324({ modelValue: ((__VLS_ctx.form.isIframe)), }, ...__VLS_functionalComponentArgsRest(__VLS_324));
        __VLS_nonNullable(__VLS_322.slots).default;
        var __VLS_322;
        __VLS_nonNullable(__VLS_316.slots).default;
        var __VLS_316;
        const __VLS_329 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_330 = __VLS_asFunctionalComponent(__VLS_329, new __VLS_329({ span: ((6)), }));
        const __VLS_331 = __VLS_330({ span: ((6)), }, ...__VLS_functionalComponentArgsRest(__VLS_330));
        const __VLS_335 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_336 = __VLS_asFunctionalComponent(__VLS_335, new __VLS_335({ label: ("显示徽章"), prop: ("showBadge"), }));
        const __VLS_337 = __VLS_336({ label: ("显示徽章"), prop: ("showBadge"), }, ...__VLS_functionalComponentArgsRest(__VLS_336));
        const __VLS_341 = __VLS_resolvedLocalAndGlobalComponents.ElSwitch;
        /** @type { [typeof __VLS_components.ElSwitch, ] } */
        // @ts-ignore
        const __VLS_342 = __VLS_asFunctionalComponent(__VLS_341, new __VLS_341({ modelValue: ((__VLS_ctx.form.showBadge)), }));
        const __VLS_343 = __VLS_342({ modelValue: ((__VLS_ctx.form.showBadge)), }, ...__VLS_functionalComponentArgsRest(__VLS_342));
        __VLS_nonNullable(__VLS_340.slots).default;
        var __VLS_340;
        __VLS_nonNullable(__VLS_334.slots).default;
        var __VLS_334;
        const __VLS_347 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_348 = __VLS_asFunctionalComponent(__VLS_347, new __VLS_347({ span: ((6)), }));
        const __VLS_349 = __VLS_348({ span: ((6)), }, ...__VLS_functionalComponentArgsRest(__VLS_348));
        const __VLS_353 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_354 = __VLS_asFunctionalComponent(__VLS_353, new __VLS_353({ label: ("固定标签"), prop: ("fixedTab"), }));
        const __VLS_355 = __VLS_354({ label: ("固定标签"), prop: ("fixedTab"), }, ...__VLS_functionalComponentArgsRest(__VLS_354));
        const __VLS_359 = __VLS_resolvedLocalAndGlobalComponents.ElSwitch;
        /** @type { [typeof __VLS_components.ElSwitch, ] } */
        // @ts-ignore
        const __VLS_360 = __VLS_asFunctionalComponent(__VLS_359, new __VLS_359({ modelValue: ((__VLS_ctx.form.fixedTab)), }));
        const __VLS_361 = __VLS_360({ modelValue: ((__VLS_ctx.form.fixedTab)), }, ...__VLS_functionalComponentArgsRest(__VLS_360));
        __VLS_nonNullable(__VLS_358.slots).default;
        var __VLS_358;
        __VLS_nonNullable(__VLS_352.slots).default;
        var __VLS_352;
        const __VLS_365 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_366 = __VLS_asFunctionalComponent(__VLS_365, new __VLS_365({ span: ((6)), }));
        const __VLS_367 = __VLS_366({ span: ((6)), }, ...__VLS_functionalComponentArgsRest(__VLS_366));
        const __VLS_371 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_372 = __VLS_asFunctionalComponent(__VLS_371, new __VLS_371({ label: ("标签隐藏"), prop: ("isHideTab"), }));
        const __VLS_373 = __VLS_372({ label: ("标签隐藏"), prop: ("isHideTab"), }, ...__VLS_functionalComponentArgsRest(__VLS_372));
        const __VLS_377 = __VLS_resolvedLocalAndGlobalComponents.ElSwitch;
        /** @type { [typeof __VLS_components.ElSwitch, ] } */
        // @ts-ignore
        const __VLS_378 = __VLS_asFunctionalComponent(__VLS_377, new __VLS_377({ modelValue: ((__VLS_ctx.form.isHideTab)), }));
        const __VLS_379 = __VLS_378({ modelValue: ((__VLS_ctx.form.isHideTab)), }, ...__VLS_functionalComponentArgsRest(__VLS_378));
        __VLS_nonNullable(__VLS_376.slots).default;
        var __VLS_376;
        __VLS_nonNullable(__VLS_370.slots).default;
        var __VLS_370;
        __VLS_nonNullable(__VLS_256.slots).default;
        var __VLS_256;
    }
    if (__VLS_ctx.menuType === 'button') {
        const __VLS_383 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
        /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
        // @ts-ignore
        const __VLS_384 = __VLS_asFunctionalComponent(__VLS_383, new __VLS_383({ gutter: ((20)), }));
        const __VLS_385 = __VLS_384({ gutter: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_384));
        const __VLS_389 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_390 = __VLS_asFunctionalComponent(__VLS_389, new __VLS_389({ span: ((12)), }));
        const __VLS_391 = __VLS_390({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_390));
        const __VLS_395 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_396 = __VLS_asFunctionalComponent(__VLS_395, new __VLS_395({ label: ("权限名称"), prop: ("authName"), }));
        const __VLS_397 = __VLS_396({ label: ("权限名称"), prop: ("authName"), }, ...__VLS_functionalComponentArgsRest(__VLS_396));
        const __VLS_401 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_402 = __VLS_asFunctionalComponent(__VLS_401, new __VLS_401({ modelValue: ((__VLS_ctx.form.authName)), placeholder: ("权限名称"), }));
        const __VLS_403 = __VLS_402({ modelValue: ((__VLS_ctx.form.authName)), placeholder: ("权限名称"), }, ...__VLS_functionalComponentArgsRest(__VLS_402));
        __VLS_nonNullable(__VLS_400.slots).default;
        var __VLS_400;
        __VLS_nonNullable(__VLS_394.slots).default;
        var __VLS_394;
        const __VLS_407 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_408 = __VLS_asFunctionalComponent(__VLS_407, new __VLS_407({ span: ((12)), }));
        const __VLS_409 = __VLS_408({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_408));
        const __VLS_413 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_414 = __VLS_asFunctionalComponent(__VLS_413, new __VLS_413({ label: ("权限标识"), prop: ("authLabel"), }));
        const __VLS_415 = __VLS_414({ label: ("权限标识"), prop: ("authLabel"), }, ...__VLS_functionalComponentArgsRest(__VLS_414));
        const __VLS_419 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
        /** @type { [typeof __VLS_components.ElInput, ] } */
        // @ts-ignore
        const __VLS_420 = __VLS_asFunctionalComponent(__VLS_419, new __VLS_419({ modelValue: ((__VLS_ctx.form.authLabel)), placeholder: ("权限标识"), }));
        const __VLS_421 = __VLS_420({ modelValue: ((__VLS_ctx.form.authLabel)), placeholder: ("权限标识"), }, ...__VLS_functionalComponentArgsRest(__VLS_420));
        __VLS_nonNullable(__VLS_418.slots).default;
        var __VLS_418;
        __VLS_nonNullable(__VLS_412.slots).default;
        var __VLS_412;
        __VLS_nonNullable(__VLS_388.slots).default;
        var __VLS_388;
        const __VLS_425 = __VLS_resolvedLocalAndGlobalComponents.ElRow;
        /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.ElRow, ] } */
        // @ts-ignore
        const __VLS_426 = __VLS_asFunctionalComponent(__VLS_425, new __VLS_425({ gutter: ((20)), }));
        const __VLS_427 = __VLS_426({ gutter: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_426));
        const __VLS_431 = __VLS_resolvedLocalAndGlobalComponents.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.ElCol, ] } */
        // @ts-ignore
        const __VLS_432 = __VLS_asFunctionalComponent(__VLS_431, new __VLS_431({ span: ((12)), }));
        const __VLS_433 = __VLS_432({ span: ((12)), }, ...__VLS_functionalComponentArgsRest(__VLS_432));
        const __VLS_437 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
        // @ts-ignore
        const __VLS_438 = __VLS_asFunctionalComponent(__VLS_437, new __VLS_437({ label: ("权限排序"), prop: ("authSort"), }));
        const __VLS_439 = __VLS_438({ label: ("权限排序"), prop: ("authSort"), }, ...__VLS_functionalComponentArgsRest(__VLS_438));
        const __VLS_443 = __VLS_resolvedLocalAndGlobalComponents.ElInputNumber;
        /** @type { [typeof __VLS_components.ElInputNumber, ] } */
        // @ts-ignore
        const __VLS_444 = __VLS_asFunctionalComponent(__VLS_443, new __VLS_443({ modelValue: ((__VLS_ctx.form.authSort)), ...{ style: ({}) }, min: ((1)), controlsPosition: ("right"), }));
        const __VLS_445 = __VLS_444({ modelValue: ((__VLS_ctx.form.authSort)), ...{ style: ({}) }, min: ((1)), controlsPosition: ("right"), }, ...__VLS_functionalComponentArgsRest(__VLS_444));
        __VLS_nonNullable(__VLS_442.slots).default;
        var __VLS_442;
        __VLS_nonNullable(__VLS_436.slots).default;
        var __VLS_436;
        __VLS_nonNullable(__VLS_430.slots).default;
        var __VLS_430;
    }
    __VLS_nonNullable(__VLS_15.slots).default;
    var __VLS_15;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("dialog-footer") }, });
        const __VLS_449 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_450 = __VLS_asFunctionalComponent(__VLS_449, new __VLS_449({ ...{ 'onClick': {} }, }));
        const __VLS_451 = __VLS_450({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_450));
        let __VLS_455;
        const __VLS_456 = {
            onClick: (__VLS_ctx.handleCancel)
        };
        let __VLS_452;
        let __VLS_453;
        __VLS_nonNullable(__VLS_454.slots).default;
        var __VLS_454;
        const __VLS_457 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_458 = __VLS_asFunctionalComponent(__VLS_457, new __VLS_457({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_459 = __VLS_458({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_458));
        let __VLS_463;
        const __VLS_464 = {
            onClick: (__VLS_ctx.handleSubmit)
        };
        let __VLS_460;
        let __VLS_461;
        __VLS_nonNullable(__VLS_462.slots).default;
        var __VLS_462;
    }
    var __VLS_5;
    __VLS_styleScopedClasses['menu-dialog'];
    __VLS_styleScopedClasses['dialog-footer'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "formRef": __VLS_16,
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
            formRef: formRef,
            menuType: menuType,
            iconType: iconType,
            form: form,
            rules: rules,
            dialogTitle: dialogTitle,
            disableMenuType: disableMenuType,
            rolesString: rolesString,
            handleSubmit: handleSubmit,
            handleCancel: handleCancel,
            handleClosed: handleClosed,
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
//# sourceMappingURL=menu-dialog.vue.js.map