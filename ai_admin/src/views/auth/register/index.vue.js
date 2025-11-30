/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import AppConfig from '@/config';
import { RoutesAlias } from '@/router/routesAlias';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { fetchRegister } from '@/api/auth';
import { useUserStore } from '@/store/modules/user';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'Register' });
const { t } = useI18n();
const userStore = useUserStore();
const router = useRouter();
const formRef = ref();
const systemName = AppConfig.systemInfo.name;
const loading = ref(false);
const formData = reactive({
    username: '',
    department: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    agreement: false
});
const validatePass = (rule, value, callback) => {
    if (value === '') {
        callback(new Error(t('register.placeholder[1]')));
    }
    else {
        if (formData.confirmPassword !== '') {
            formRef.value?.validateField('confirmPassword');
        }
        callback();
    }
};
const validatePass2 = (rule, value, callback) => {
    if (value === '') {
        callback(new Error(t('register.rule[0]')));
    }
    else if (value !== formData.password) {
        callback(new Error(t('register.rule[1]')));
    }
    else {
        callback();
    }
};
const rules = reactive({
    username: [
        { required: true, message: '请输入工号', trigger: 'blur' },
        { pattern: /^\d{7}$/, message: '工号必须为7位数字', trigger: 'blur' }
    ],
    department: [
        { required: true, message: '请输入部门', trigger: 'blur' },
        { min: 1, max: 50, message: '部门长度为1-50个字符', trigger: 'blur' }
    ],
    nickname: [
        { required: true, message: '请输入昵称', trigger: 'blur' },
        { min: 1, max: 20, message: '昵称长度为1-20个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, validator: validatePass, trigger: 'blur' },
        { min: 8, message: '密码必须至少为8位', trigger: 'blur' }
    ],
    confirmPassword: [{ required: true, validator: validatePass2, trigger: 'blur' }],
    agreement: [
        {
            validator: (rule, value, callback) => {
                if (!value) {
                    callback(new Error(t('register.rule[4]')));
                }
                else {
                    callback();
                }
            },
            trigger: 'change'
        }
    ]
});
const register = async () => {
    if (!formRef.value)
        return;
    try {
        await formRef.value.validate();
        loading.value = true;
        // 注册请求
        const { access_token, refresh_token, user_info } = await fetchRegister({
            username: formData.username,
            password: formData.password,
            confirm_password: formData.confirmPassword,
            nickname: formData.nickname,
            department: formData.department
        });
        if (!access_token) {
            throw new Error('注册失败 - 未收到token');
        }
        // 存储token和用户信息
        userStore.setToken(access_token, refresh_token);
        userStore.setUserInfo(user_info);
        userStore.setLoginStatus(true);
        ElMessage.success('注册成功');
        router.push('/');
    }
    catch (error) {
        console.log('注册失败', error);
        ElMessage.error('注册失败，请检查输入信息');
    }
    finally {
        loading.value = false;
    }
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("login register") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.LoginLeftView;
    /** @type { [typeof __VLS_components.LoginLeftView, typeof __VLS_components.LoginLeftView, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("right-wrap") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header") }, });
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ArtLogo;
    /** @type { [typeof __VLS_components.ArtLogo, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ class: ("icon") }, }));
    const __VLS_8 = __VLS_7({ ...{ class: ("icon") }, }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    (__VLS_ctx.systemName);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("login-wrap") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("form") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({ ...{ class: ("title") }, });
    (__VLS_ctx.$t('register.title'));
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("sub-title") }, });
    (__VLS_ctx.$t('register.subTitle'));
    const __VLS_12 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.rules)), labelPosition: ("top"), }));
    const __VLS_14 = __VLS_13({ ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.rules)), labelPosition: ("top"), }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_18 = {};
    const __VLS_19 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({ prop: ("username"), }));
    const __VLS_21 = __VLS_20({ prop: ("username"), }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    const __VLS_25 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({ modelValue: ((__VLS_ctx.formData.username)), placeholder: ("请输入7位工号"), }));
    const __VLS_27 = __VLS_26({ modelValue: ((__VLS_ctx.formData.username)), placeholder: ("请输入7位工号"), }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    __VLS_nonNullable(__VLS_24.slots).default;
    var __VLS_24;
    const __VLS_31 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({ prop: ("department"), }));
    const __VLS_33 = __VLS_32({ prop: ("department"), }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    const __VLS_37 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({ modelValue: ((__VLS_ctx.formData.department)), placeholder: ("请输入部门"), }));
    const __VLS_39 = __VLS_38({ modelValue: ((__VLS_ctx.formData.department)), placeholder: ("请输入部门"), }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    __VLS_nonNullable(__VLS_36.slots).default;
    var __VLS_36;
    const __VLS_43 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({ prop: ("nickname"), }));
    const __VLS_45 = __VLS_44({ prop: ("nickname"), }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    const __VLS_49 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({ modelValue: ((__VLS_ctx.formData.nickname)), placeholder: ("请输入昵称"), }));
    const __VLS_51 = __VLS_50({ modelValue: ((__VLS_ctx.formData.nickname)), placeholder: ("请输入昵称"), }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    __VLS_nonNullable(__VLS_48.slots).default;
    var __VLS_48;
    const __VLS_55 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({ prop: ("password"), }));
    const __VLS_57 = __VLS_56({ prop: ("password"), }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    const __VLS_61 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({ modelValue: ((__VLS_ctx.formData.password)), placeholder: ("请输入至少8位密码"), type: ("password"), autocomplete: ("off"), showPassword: (true), }));
    const __VLS_63 = __VLS_62({ modelValue: ((__VLS_ctx.formData.password)), placeholder: ("请输入至少8位密码"), type: ("password"), autocomplete: ("off"), showPassword: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    __VLS_nonNullable(__VLS_60.slots).default;
    var __VLS_60;
    const __VLS_67 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({ prop: ("confirmPassword"), }));
    const __VLS_69 = __VLS_68({ prop: ("confirmPassword"), }, ...__VLS_functionalComponentArgsRest(__VLS_68));
    const __VLS_73 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.formData.confirmPassword)), placeholder: ((__VLS_ctx.$t('register.placeholder[2]'))), type: ("password"), autocomplete: ("off"), showPassword: (true), }));
    const __VLS_75 = __VLS_74({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.formData.confirmPassword)), placeholder: ((__VLS_ctx.$t('register.placeholder[2]'))), type: ("password"), autocomplete: ("off"), showPassword: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_74));
    let __VLS_79;
    const __VLS_80 = {
        onKeyup: (__VLS_ctx.register)
    };
    let __VLS_76;
    let __VLS_77;
    var __VLS_78;
    __VLS_nonNullable(__VLS_72.slots).default;
    var __VLS_72;
    const __VLS_81 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({ prop: ("agreement"), }));
    const __VLS_83 = __VLS_82({ prop: ("agreement"), }, ...__VLS_functionalComponentArgsRest(__VLS_82));
    const __VLS_87 = __VLS_resolvedLocalAndGlobalComponents.ElCheckbox;
    /** @type { [typeof __VLS_components.ElCheckbox, typeof __VLS_components.ElCheckbox, ] } */
    // @ts-ignore
    const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({ modelValue: ((__VLS_ctx.formData.agreement)), }));
    const __VLS_89 = __VLS_88({ modelValue: ((__VLS_ctx.formData.agreement)), }, ...__VLS_functionalComponentArgsRest(__VLS_88));
    (__VLS_ctx.$t('register.agreeText'));
    const __VLS_93 = __VLS_resolvedLocalAndGlobalComponents.RouterLink;
    /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ] } */
    // @ts-ignore
    const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({ ...{ style: ({}) }, to: ("/privacy-policy"), }));
    const __VLS_95 = __VLS_94({ ...{ style: ({}) }, to: ("/privacy-policy"), }, ...__VLS_functionalComponentArgsRest(__VLS_94));
    (__VLS_ctx.$t('register.privacyPolicy'));
    __VLS_nonNullable(__VLS_98.slots).default;
    var __VLS_98;
    __VLS_nonNullable(__VLS_92.slots).default;
    var __VLS_92;
    __VLS_nonNullable(__VLS_86.slots).default;
    var __VLS_86;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ style: ({}) }, });
    const __VLS_99 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_100 = __VLS_asFunctionalComponent(__VLS_99, new __VLS_99({ ...{ 'onClick': {} }, ...{ class: ("register-btn") }, type: ("primary"), loading: ((__VLS_ctx.loading)), }));
    const __VLS_101 = __VLS_100({ ...{ 'onClick': {} }, ...{ class: ("register-btn") }, type: ("primary"), loading: ((__VLS_ctx.loading)), }, ...__VLS_functionalComponentArgsRest(__VLS_100));
    __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
    let __VLS_105;
    const __VLS_106 = {
        onClick: (__VLS_ctx.register)
    };
    let __VLS_102;
    let __VLS_103;
    (__VLS_ctx.$t('register.submitBtnText'));
    __VLS_nonNullable(__VLS_104.slots).default;
    var __VLS_104;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("footer") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.$t('register.hasAccount'));
    const __VLS_107 = __VLS_resolvedLocalAndGlobalComponents.RouterLink;
    /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ] } */
    // @ts-ignore
    const __VLS_108 = __VLS_asFunctionalComponent(__VLS_107, new __VLS_107({ to: ((__VLS_ctx.RoutesAlias.Login)), }));
    const __VLS_109 = __VLS_108({ to: ((__VLS_ctx.RoutesAlias.Login)), }, ...__VLS_functionalComponentArgsRest(__VLS_108));
    (__VLS_ctx.$t('register.toLogin'));
    __VLS_nonNullable(__VLS_112.slots).default;
    var __VLS_112;
    __VLS_nonNullable(__VLS_17.slots).default;
    var __VLS_17;
    __VLS_styleScopedClasses['login'];
    __VLS_styleScopedClasses['register'];
    __VLS_styleScopedClasses['right-wrap'];
    __VLS_styleScopedClasses['header'];
    __VLS_styleScopedClasses['icon'];
    __VLS_styleScopedClasses['login-wrap'];
    __VLS_styleScopedClasses['form'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['sub-title'];
    __VLS_styleScopedClasses['register-btn'];
    __VLS_styleScopedClasses['footer'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "formRef": __VLS_18,
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
            RoutesAlias: RoutesAlias,
            formRef: formRef,
            systemName: systemName,
            loading: loading,
            formData: formData,
            rules: rules,
            register: register,
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