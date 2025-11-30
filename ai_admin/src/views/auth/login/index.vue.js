/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import AppConfig from '@/config';
import { RoutesAlias } from '@/router/routesAlias';
import { ElNotification, ElMessage } from 'element-plus';
import { useUserStore } from '@/store/modules/user';
import { getCssVar } from '@/utils/ui';
import { languageOptions } from '@/locales';
import { useI18n } from 'vue-i18n';
import { HttpError } from '@/utils/http/error';
import { themeAnimation } from '@/utils/theme/animation';
import { fetchLogin } from '@/api/auth';
import { useHeaderBar } from '@/composables/useHeaderBar';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'Login' });
const { t } = useI18n();
import { useSettingStore } from '@/store/modules/setting';
const accounts = computed(() => [
    {
        key: 'super',
        label: t('login.roles.super'),
        userName: 'admin',
        password: '123456', // 对应reset_users.py中的密码
        roles: ['R_SUPER']
    },
    {
        key: 'admin',
        label: t('login.roles.admin'),
        userName: 'admin', // 目前只重置了一个admin用户，暂时都用admin
        password: '123456',
        roles: ['R_ADMIN']
    },
    {
        key: 'user',
        label: t('login.roles.user'),
        userName: 'admin', // 目前只重置了一个admin用户，暂时都用admin
        password: '123456',
        roles: ['R_USER']
    }
]);
const settingStore = useSettingStore();
const { isDark } = storeToRefs(settingStore);
const { shouldShowThemeToggle, shouldShowLanguage } = useHeaderBar();
const dragVerify = ref();
const userStore = useUserStore();
const router = useRouter();
const isPassing = ref(false);
const isClickPass = ref(false);
const systemName = AppConfig.systemInfo.name;
const formRef = ref();
const formData = reactive({
    account: '',
    username: '',
    password: '',
    rememberPassword: true
});
const rules = computed(() => ({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: t('login.placeholder[1]'), trigger: 'blur' },
        { min: 6, message: '密码必须至少为6位', trigger: 'blur' }
    ]
}));
const loading = ref(false);
onMounted(() => {
    setupAccount('super');
});
// 设置账号
const setupAccount = (key) => {
    const selectedAccount = accounts.value.find((account) => account.key === key);
    formData.account = key;
    formData.username = selectedAccount?.userName ?? '';
    formData.password = selectedAccount?.password ?? '';
};
// 登录
const handleSubmit = async () => {
    if (!formRef.value)
        return;
    try {
        // 表单验证
        const valid = await formRef.value.validate();
        if (!valid)
            return;
        // 拖拽验证
        if (!isPassing.value) {
            isClickPass.value = true;
            return;
        }
        loading.value = true;
        // 登录请求
        const { username, password } = formData;
        const { access_token, refresh_token, user_info } = await fetchLogin({
            username,
            password
        });
        // 验证token
        if (!access_token) {
            throw new Error('Login failed - no token received');
        }
        // 存储token和用户信息
        userStore.setToken(access_token, refresh_token);
        userStore.setUserInfo(user_info);
        userStore.setLoginStatus(true);
        // 登录成功处理
        showLoginSuccessNotice();
        router.push('/');
    }
    catch (error) {
        // 处理 HttpError
        if (error instanceof HttpError) {
            // console.log(error.code)
        }
        else {
            // 处理非 HttpError
            ElMessage.error('登录失败，请稍后重试');
            console.error('[Login] Unexpected error:', error);
        }
    }
    finally {
        loading.value = false;
        resetDragVerify();
    }
};
// 重置拖拽验证
const resetDragVerify = () => {
    dragVerify.value.reset();
};
// 登录成功提示
const showLoginSuccessNotice = () => {
    setTimeout(() => {
        ElNotification({
            title: t('login.success.title'),
            type: 'success',
            duration: 2500,
            zIndex: 10000,
            message: `${t('login.success.message')}, ${systemName}!`
        });
    }, 150);
};
// 切换语言
const { locale } = useI18n();
const changeLanguage = (lang) => {
    if (locale.value === lang)
        return;
    locale.value = lang;
    userStore.setLanguage(lang);
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("login") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.LoginLeftView;
    /** @type { [typeof __VLS_components.LoginLeftView, typeof __VLS_components.LoginLeftView, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("right-wrap") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("top-right-wrap") }, });
    if (__VLS_ctx.shouldShowThemeToggle) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.themeAnimation) }, ...{ class: ("btn theme-btn") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
        (__VLS_ctx.isDark ? '&#xe6b5;' : '&#xe725;');
    }
    if (__VLS_ctx.shouldShowLanguage) {
        const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElDropdown;
        /** @type { [typeof __VLS_components.ElDropdown, typeof __VLS_components.ElDropdown, ] } */
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ 'onCommand': {} }, popperClass: ("langDropDownStyle"), }));
        const __VLS_8 = __VLS_7({ ...{ 'onCommand': {} }, popperClass: ("langDropDownStyle"), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        let __VLS_12;
        const __VLS_13 = {
            onCommand: (__VLS_ctx.changeLanguage)
        };
        let __VLS_9;
        let __VLS_10;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("btn language-btn") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys icon-language") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { dropdown: __VLS_thisSlot } = __VLS_nonNullable(__VLS_11.slots);
            const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownMenu;
            /** @type { [typeof __VLS_components.ElDropdownMenu, typeof __VLS_components.ElDropdownMenu, ] } */
            // @ts-ignore
            const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({}));
            const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
            for (const [lang] of __VLS_getVForSourceType((__VLS_ctx.languageOptions))) {
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((lang.value)), ...{ class: ("lang-btn-item") }, });
                const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElDropdownItem;
                /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.ElDropdownItem, ] } */
                // @ts-ignore
                const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ command: ((lang.value)), ...{ class: (({ 'is-selected': __VLS_ctx.locale === lang.value })) }, }));
                const __VLS_22 = __VLS_21({ command: ((lang.value)), ...{ class: (({ 'is-selected': __VLS_ctx.locale === lang.value })) }, }, ...__VLS_functionalComponentArgsRest(__VLS_21));
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("menu-txt") }, });
                (lang.label);
                if (__VLS_ctx.locale === lang.value) {
                    __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys icon-check") }, });
                }
                __VLS_nonNullable(__VLS_25.slots).default;
                var __VLS_25;
            }
            __VLS_nonNullable(__VLS_19.slots).default;
            var __VLS_19;
        }
        var __VLS_11;
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header") }, });
    const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ArtLogo;
    /** @type { [typeof __VLS_components.ArtLogo, ] } */
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ ...{ class: ("icon") }, }));
    const __VLS_28 = __VLS_27({ ...{ class: ("icon") }, }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    (__VLS_ctx.systemName);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("login-wrap") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("form") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({ ...{ class: ("title") }, });
    (__VLS_ctx.$t('login.title'));
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("sub-title") }, });
    (__VLS_ctx.$t('login.subTitle'));
    const __VLS_32 = __VLS_resolvedLocalAndGlobalComponents.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.ElForm, ] } */
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ ...{ 'onKeyup': {} }, ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.rules)), ...{ style: ({}) }, }));
    const __VLS_34 = __VLS_33({ ...{ 'onKeyup': {} }, ref: ("formRef"), model: ((__VLS_ctx.formData)), rules: ((__VLS_ctx.rules)), ...{ style: ({}) }, }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    // @ts-ignore navigation for `const formRef = ref()`
    __VLS_ctx.formRef;
    var __VLS_38 = {};
    let __VLS_39;
    const __VLS_40 = {
        onKeyup: (__VLS_ctx.handleSubmit)
    };
    let __VLS_35;
    let __VLS_36;
    const __VLS_41 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({ prop: ("account"), }));
    const __VLS_43 = __VLS_42({ prop: ("account"), }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    const __VLS_47 = __VLS_resolvedLocalAndGlobalComponents.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.ElSelect, ] } */
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({ ...{ 'onChange': {} }, modelValue: ((__VLS_ctx.formData.account)), ...{ class: ("account-select") }, }));
    const __VLS_49 = __VLS_48({ ...{ 'onChange': {} }, modelValue: ((__VLS_ctx.formData.account)), ...{ class: ("account-select") }, }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    let __VLS_53;
    const __VLS_54 = {
        onChange: (__VLS_ctx.setupAccount)
    };
    let __VLS_50;
    let __VLS_51;
    for (const [account] of __VLS_getVForSourceType((__VLS_ctx.accounts))) {
        const __VLS_55 = __VLS_resolvedLocalAndGlobalComponents.ElOption;
        /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.ElOption, ] } */
        // @ts-ignore
        const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({ key: ((account.key)), label: ((account.label)), value: ((account.key)), }));
        const __VLS_57 = __VLS_56({ key: ((account.key)), label: ((account.label)), value: ((account.key)), }, ...__VLS_functionalComponentArgsRest(__VLS_56));
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (account.label);
        __VLS_nonNullable(__VLS_60.slots).default;
        var __VLS_60;
    }
    __VLS_nonNullable(__VLS_52.slots).default;
    var __VLS_52;
    __VLS_nonNullable(__VLS_46.slots).default;
    var __VLS_46;
    const __VLS_61 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({ prop: ("username"), }));
    const __VLS_63 = __VLS_62({ prop: ("username"), }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    const __VLS_67 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({ placeholder: ("请输入用户名"), modelValue: ((__VLS_ctx.formData.username)), }));
    const __VLS_69 = __VLS_68({ placeholder: ("请输入用户名"), modelValue: ((__VLS_ctx.formData.username)), }, ...__VLS_functionalComponentArgsRest(__VLS_68));
    __VLS_nonNullable(__VLS_66.slots).default;
    var __VLS_66;
    const __VLS_73 = __VLS_resolvedLocalAndGlobalComponents.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.ElFormItem, ] } */
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({ prop: ("password"), }));
    const __VLS_75 = __VLS_74({ prop: ("password"), }, ...__VLS_functionalComponentArgsRest(__VLS_74));
    const __VLS_79 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({ placeholder: ("请输入密码"), modelValue: ((__VLS_ctx.formData.password)), type: ("password"), radius: ("8px"), autocomplete: ("off"), showPassword: (true), }));
    const __VLS_81 = __VLS_80({ placeholder: ("请输入密码"), modelValue: ((__VLS_ctx.formData.password)), type: ("password"), radius: ("8px"), autocomplete: ("off"), showPassword: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_80));
    __VLS_nonNullable(__VLS_78.slots).default;
    var __VLS_78;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("drag-verify") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("drag-verify-content") }, ...{ class: (({ error: !__VLS_ctx.isPassing && __VLS_ctx.isClickPass })) }, });
    const __VLS_85 = __VLS_resolvedLocalAndGlobalComponents.ArtDragVerify;
    /** @type { [typeof __VLS_components.ArtDragVerify, ] } */
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({ ref: ("dragVerify"), value: ((__VLS_ctx.isPassing)), text: ((__VLS_ctx.$t('login.sliderText'))), textColor: ("var(--art-gray-800)"), successText: ((__VLS_ctx.$t('login.sliderSuccessText'))), progressBarBg: ((__VLS_ctx.getCssVar('--el-color-primary'))), background: ("var(--art-gray-200)"), handlerBg: ("var(--art-main-bg-color)"), }));
    const __VLS_87 = __VLS_86({ ref: ("dragVerify"), value: ((__VLS_ctx.isPassing)), text: ((__VLS_ctx.$t('login.sliderText'))), textColor: ("var(--art-gray-800)"), successText: ((__VLS_ctx.$t('login.sliderSuccessText'))), progressBarBg: ((__VLS_ctx.getCssVar('--el-color-primary'))), background: ("var(--art-gray-200)"), handlerBg: ("var(--art-main-bg-color)"), }, ...__VLS_functionalComponentArgsRest(__VLS_86));
    // @ts-ignore navigation for `const dragVerify = ref()`
    __VLS_ctx.dragVerify;
    var __VLS_91 = {};
    var __VLS_90;
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("error-text") }, ...{ class: (({ 'show-error-text': !__VLS_ctx.isPassing && __VLS_ctx.isClickPass })) }, });
    (__VLS_ctx.$t('login.placeholder[2]'));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("forget-password") }, });
    const __VLS_92 = __VLS_resolvedLocalAndGlobalComponents.ElCheckbox;
    /** @type { [typeof __VLS_components.ElCheckbox, typeof __VLS_components.ElCheckbox, ] } */
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({ modelValue: ((__VLS_ctx.formData.rememberPassword)), }));
    const __VLS_94 = __VLS_93({ modelValue: ((__VLS_ctx.formData.rememberPassword)), }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    (__VLS_ctx.$t('login.rememberPwd'));
    __VLS_nonNullable(__VLS_97.slots).default;
    var __VLS_97;
    const __VLS_98 = __VLS_resolvedLocalAndGlobalComponents.RouterLink;
    /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ] } */
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({ to: ((__VLS_ctx.RoutesAlias.ForgetPassword)), }));
    const __VLS_100 = __VLS_99({ to: ((__VLS_ctx.RoutesAlias.ForgetPassword)), }, ...__VLS_functionalComponentArgsRest(__VLS_99));
    (__VLS_ctx.$t('login.forgetPwd'));
    __VLS_nonNullable(__VLS_103.slots).default;
    var __VLS_103;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ style: ({}) }, });
    const __VLS_104 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({ ...{ 'onClick': {} }, ...{ class: ("login-btn") }, type: ("primary"), loading: ((__VLS_ctx.loading)), }));
    const __VLS_106 = __VLS_105({ ...{ 'onClick': {} }, ...{ class: ("login-btn") }, type: ("primary"), loading: ((__VLS_ctx.loading)), }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
    let __VLS_110;
    const __VLS_111 = {
        onClick: (__VLS_ctx.handleSubmit)
    };
    let __VLS_107;
    let __VLS_108;
    (__VLS_ctx.$t('login.btnText'));
    __VLS_nonNullable(__VLS_109.slots).default;
    var __VLS_109;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("footer") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.$t('login.noAccount'));
    const __VLS_112 = __VLS_resolvedLocalAndGlobalComponents.RouterLink;
    /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ] } */
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({ to: ((__VLS_ctx.RoutesAlias.Register)), }));
    const __VLS_114 = __VLS_113({ to: ((__VLS_ctx.RoutesAlias.Register)), }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    (__VLS_ctx.$t('login.register'));
    __VLS_nonNullable(__VLS_117.slots).default;
    var __VLS_117;
    __VLS_nonNullable(__VLS_37.slots).default;
    var __VLS_37;
    __VLS_styleScopedClasses['login'];
    __VLS_styleScopedClasses['right-wrap'];
    __VLS_styleScopedClasses['top-right-wrap'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['theme-btn'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['language-btn'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['icon-language'];
    __VLS_styleScopedClasses['lang-btn-item'];
    __VLS_styleScopedClasses['is-selected'];
    __VLS_styleScopedClasses['menu-txt'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['icon-check'];
    __VLS_styleScopedClasses['header'];
    __VLS_styleScopedClasses['icon'];
    __VLS_styleScopedClasses['login-wrap'];
    __VLS_styleScopedClasses['form'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['sub-title'];
    __VLS_styleScopedClasses['account-select'];
    __VLS_styleScopedClasses['drag-verify'];
    __VLS_styleScopedClasses['drag-verify-content'];
    __VLS_styleScopedClasses['error'];
    __VLS_styleScopedClasses['error-text'];
    __VLS_styleScopedClasses['show-error-text'];
    __VLS_styleScopedClasses['forget-password'];
    __VLS_styleScopedClasses['login-btn'];
    __VLS_styleScopedClasses['footer'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "formRef": __VLS_38,
        "dragVerify": __VLS_91,
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
            getCssVar: getCssVar,
            languageOptions: languageOptions,
            themeAnimation: themeAnimation,
            accounts: accounts,
            isDark: isDark,
            shouldShowThemeToggle: shouldShowThemeToggle,
            shouldShowLanguage: shouldShowLanguage,
            dragVerify: dragVerify,
            isPassing: isPassing,
            isClickPass: isClickPass,
            systemName: systemName,
            formRef: formRef,
            formData: formData,
            rules: rules,
            loading: loading,
            setupAccount: setupAccount,
            handleSubmit: handleSubmit,
            locale: locale,
            changeLanguage: changeLanguage,
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