/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppConfig from '@/config';
import { useUserStore } from '@/store/modules/user';
import defaultAvatar from '@imgs/user/avatar.webp';
// 导入头像图片
import avatar1 from '@/assets/img/avatar/avatar1.webp';
import avatar2 from '@/assets/img/avatar/avatar2.webp';
import avatar3 from '@/assets/img/avatar/avatar3.webp';
import avatar4 from '@/assets/img/avatar/avatar4.webp';
import avatar5 from '@/assets/img/avatar/avatar5.webp';
import avatar6 from '@/assets/img/avatar/avatar6.webp';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtNotification' });
const { t } = useI18n();
const userStore = useUserStore();
const { getUserInfo } = storeToRefs(userStore);
const userAvatar = computed(() => getUserInfo.value.avatar || defaultAvatar);
const onAvatarError = (e) => {
    const img = e.target;
    if (img && img.src !== defaultAvatar)
        img.src = defaultAvatar;
};
const props = defineProps();
const show = ref(false);
const visible = ref(false);
const barActiveIndex = ref(0);
const useNotificationData = () => {
    // 通知数据
    const noticeList = ref([
        {
            title: '新增国际化',
            time: '2024-6-13 0:10',
            type: 'notice'
        },
        {
            title: '冷月呆呆给你发了一条消息',
            time: '2024-4-21 8:05',
            type: 'message'
        },
        {
            title: '小肥猪关注了你',
            time: '2020-3-17 21:12',
            type: 'collection'
        },
        {
            title: '新增使用文档',
            time: '2024-02-14 0:20',
            type: 'notice'
        },
        {
            title: '小肥猪给你发了一封邮件',
            time: '2024-1-20 0:15',
            type: 'email'
        },
        {
            title: '菜单mock本地真实数据',
            time: '2024-1-17 22:06',
            type: 'notice'
        }
    ]);
    // 消息数据
    const msgList = ref([
        {
            title: '池不胖 关注了你',
            time: '2021-2-26 23:50',
            avatar: avatar1
        },
        {
            title: '唐不苦 关注了你',
            time: '2021-2-21 8:05',
            avatar: avatar2
        },
        {
            title: '中小鱼 关注了你',
            time: '2020-1-17 21:12',
            avatar: avatar3
        },
        {
            title: '何小荷 关注了你',
            time: '2021-01-14 0:20',
            avatar: avatar4
        },
        {
            title: '誶誶淰 关注了你',
            time: '2020-12-20 0:15',
            avatar: avatar5
        },
        {
            title: '冷月呆呆 关注了你',
            time: '2020-12-17 22:06',
            avatar: avatar6
        }
    ]);
    // 待办数据
    const pendingList = ref([]);
    // 标签栏数据
    const barList = computed(() => [
        {
            name: computed(() => t('notice.bar[0]')),
            num: noticeList.value.length
        },
        {
            name: computed(() => t('notice.bar[1]')),
            num: msgList.value.length
        },
        {
            name: computed(() => t('notice.bar[2]')),
            num: pendingList.value.length
        }
    ]);
    return {
        noticeList,
        msgList,
        pendingList,
        barList
    };
};
// 样式管理
const useNotificationStyles = () => {
    const noticeStyleMap = {
        email: {
            icon: '&#xe72e;',
            iconColor: 'rgb(var(--art-warning))',
            backgroundColor: 'rgb(var(--art-bg-warning))'
        },
        message: {
            icon: '&#xe747;',
            iconColor: 'rgb(var(--art-success))',
            backgroundColor: 'rgb(var(--art-bg-success))'
        },
        collection: {
            icon: '&#xe714;',
            iconColor: 'rgb(var(--art-danger))',
            backgroundColor: 'rgb(var(--art-bg-danger))'
        },
        user: {
            icon: '&#xe608;',
            iconColor: 'rgb(var(--art-info))',
            backgroundColor: 'rgb(var(--art-bg-info))'
        },
        notice: {
            icon: '&#xe6c2;',
            iconColor: 'rgb(var(--art-primary))',
            backgroundColor: 'rgb(var(--art-bg-primary))'
        }
    };
    const getRandomColor = () => {
        const index = Math.floor(Math.random() * AppConfig.systemMainColor.length);
        return AppConfig.systemMainColor[index];
    };
    const getNoticeStyle = (type) => {
        const defaultStyle = {
            icon: '&#xe747;',
            iconColor: '#FFFFFF',
            backgroundColor: getRandomColor()
        };
        return noticeStyleMap[type] || defaultStyle;
    };
    return {
        getNoticeStyle
    };
};
// 动画管理
const useNotificationAnimation = () => {
    const showNotice = (open) => {
        if (open) {
            visible.value = open;
            setTimeout(() => {
                show.value = open;
            }, 5);
        }
        else {
            show.value = open;
            setTimeout(() => {
                visible.value = open;
            }, 350);
        }
    };
    return {
        showNotice
    };
};
// 标签页管理
const useTabManagement = (noticeList, msgList, pendingList, businessHandlers) => {
    const changeBar = (index) => {
        barActiveIndex.value = index;
    };
    // 检查当前标签页是否为空
    const currentTabIsEmpty = computed(() => {
        const tabDataMap = [noticeList.value, msgList.value, pendingList.value];
        const currentData = tabDataMap[barActiveIndex.value];
        return currentData && currentData.length === 0;
    });
    const handleViewAll = () => {
        // 查看全部处理器映射
        const viewAllHandlers = {
            0: businessHandlers.handleNoticeAll,
            1: businessHandlers.handleMsgAll,
            2: businessHandlers.handlePendingAll
        };
        const handler = viewAllHandlers[barActiveIndex.value];
        handler?.();
    };
    return {
        changeBar,
        currentTabIsEmpty,
        handleViewAll
    };
};
// 业务逻辑处理
const useBusinessLogic = () => {
    const handleNoticeAll = () => {
        // 处理查看全部通知
        console.log('查看全部通知');
    };
    const handleMsgAll = () => {
        // 处理查看全部消息
        console.log('查看全部消息');
    };
    const handlePendingAll = () => {
        // 处理查看全部待办
        console.log('查看全部待办');
    };
    return {
        handleNoticeAll,
        handleMsgAll,
        handlePendingAll
    };
};
// 组合所有逻辑
const { noticeList, msgList, pendingList, barList } = useNotificationData();
const { getNoticeStyle } = useNotificationStyles();
const { showNotice } = useNotificationAnimation();
const { handleNoticeAll, handleMsgAll, handlePendingAll } = useBusinessLogic();
const { changeBar, currentTabIsEmpty, handleViewAll } = useTabManagement(noticeList, msgList, pendingList, { handleNoticeAll, handleMsgAll, handlePendingAll });
// 监听属性变化
watch(() => props.value, (newValue) => {
    showNotice(newValue);
}); /* PartiallyEnd: #3632/scriptSetup.vue */
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (__VLS_ctx.) }, ...{ class: ("notice") }, ...{ style: (({
                transform: __VLS_ctx.show ? 'scaleY(1)' : 'scaleY(0.9)',
                opacity: __VLS_ctx.show ? 1 : 0
            })) }, });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.visible) }, null, null);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("text") }, });
    (__VLS_ctx.$t('notice.title'));
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("btn") }, });
    (__VLS_ctx.$t('notice.btnRead'));
    __VLS_elementAsFunction(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({ ...{ class: ("bar") }, });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.barList))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.changeBar(index);
                } }, key: ((index)), ...{ class: (({ active: __VLS_ctx.barActiveIndex === index })) }, });
        (item.name);
        (item.num);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("content") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("scroll") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({ ...{ class: ("notice-list") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.barActiveIndex === 0) }, null, null);
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.noticeList))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ key: ((index)), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("icon") }, ...{ style: (({ background: __VLS_ctx.getNoticeStyle(item.type).backgroundColor + '!important' })) }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, ...{ style: (({ color: __VLS_ctx.getNoticeStyle(item.type).iconColor + '!important' })) }, });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.getNoticeStyle(item.type).icon) }, null, null);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("text") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        (item.title);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (item.time);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({ ...{ class: ("user-list") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.barActiveIndex === 1) }, null, null);
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.msgList))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ key: ((index)), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("avatar") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({ ...{ onError: (__VLS_ctx.onAvatarError) }, src: ((__VLS_ctx.userAvatar)), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("text") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        (item.title);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (item.time);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({ ...{ class: ("base") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.barActiveIndex === 2) }, null, null);
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.pendingList))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({ key: ((index)), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        (item.title);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (item.time);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("empty-tips") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.currentTabIsEmpty) }, null, null);
    __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.$t('notice.text[0]'));
    (__VLS_ctx.barList[__VLS_ctx.barActiveIndex].name);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("btn-wrapper") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClick': {} }, ...{ class: ("view-all") }, }));
    const __VLS_2 = __VLS_1({ ...{ 'onClick': {} }, ...{ class: ("view-all") }, }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
    let __VLS_6;
    const __VLS_7 = {
        onClick: (__VLS_ctx.handleViewAll)
    };
    let __VLS_3;
    let __VLS_4;
    (__VLS_ctx.$t('notice.viewAll'));
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ style: ({}) }, });
    __VLS_styleScopedClasses['notice'];
    __VLS_styleScopedClasses['header'];
    __VLS_styleScopedClasses['text'];
    __VLS_styleScopedClasses['btn'];
    __VLS_styleScopedClasses['bar'];
    __VLS_styleScopedClasses['active'];
    __VLS_styleScopedClasses['content'];
    __VLS_styleScopedClasses['scroll'];
    __VLS_styleScopedClasses['notice-list'];
    __VLS_styleScopedClasses['icon'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['text'];
    __VLS_styleScopedClasses['user-list'];
    __VLS_styleScopedClasses['avatar'];
    __VLS_styleScopedClasses['text'];
    __VLS_styleScopedClasses['base'];
    __VLS_styleScopedClasses['empty-tips'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['btn-wrapper'];
    __VLS_styleScopedClasses['view-all'];
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
            userAvatar: userAvatar,
            onAvatarError: onAvatarError,
            show: show,
            visible: visible,
            barActiveIndex: barActiveIndex,
            noticeList: noticeList,
            msgList: msgList,
            pendingList: pendingList,
            barList: barList,
            getNoticeStyle: getNoticeStyle,
            changeBar: changeBar,
            currentTabIsEmpty: currentTabIsEmpty,
            handleViewAll: handleViewAll,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=index.vue.js.map