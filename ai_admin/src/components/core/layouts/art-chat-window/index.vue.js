/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { Picture, Paperclip } from '@element-plus/icons-vue';
import { mittBus } from '@/utils/sys';
import meAvatar from '@/assets/img/avatar/avatar5.webp';
import aiAvatar from '@/assets/img/avatar/avatar10.webp';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtChatWindow' });
// 常量定义
const MOBILE_BREAKPOINT = 500;
const SCROLL_DELAY = 100;
const BOT_NAME = 'Art Bot';
const USER_NAME = 'Ricky';
// 响应式布局
const { width } = useWindowSize();
const isMobile = computed(() => width.value < MOBILE_BREAKPOINT);
// 组件状态
const isDrawerVisible = ref(false);
const isOnline = ref(true);
// 消息相关状态
const messageText = ref('');
const messageId = ref(10);
const messageContainer = ref(null);
// 初始化聊天消息数据
const initializeMessages = () => [
    {
        id: 1,
        sender: BOT_NAME,
        content: '你好！我是你的AI助手，有什么我可以帮你的吗？',
        time: '10:00',
        isMe: false,
        avatar: aiAvatar
    },
    {
        id: 2,
        sender: USER_NAME,
        content: '我想了解一下系统的使用方法。',
        time: '10:01',
        isMe: true,
        avatar: meAvatar
    },
    {
        id: 3,
        sender: BOT_NAME,
        content: '好的，我来为您介绍系统的主要功能。首先，您可以通过左侧菜单访问不同的功能模块...',
        time: '10:02',
        isMe: false,
        avatar: aiAvatar
    },
    {
        id: 4,
        sender: USER_NAME,
        content: '听起来很不错，能具体讲讲数据分析部分吗？',
        time: '10:05',
        isMe: true,
        avatar: meAvatar
    },
    {
        id: 5,
        sender: BOT_NAME,
        content: '当然可以。数据分析模块可以帮助您实时监控关键指标，并生成详细的报表...',
        time: '10:06',
        isMe: false,
        avatar: aiAvatar
    },
    {
        id: 6,
        sender: USER_NAME,
        content: '太好了，那我如何开始使用呢？',
        time: '10:08',
        isMe: true,
        avatar: meAvatar
    },
    {
        id: 7,
        sender: BOT_NAME,
        content: '您可以先创建一个项目，然后在项目中添加相关的数据源，系统会自动进行分析。',
        time: '10:09',
        isMe: false,
        avatar: aiAvatar
    },
    {
        id: 8,
        sender: USER_NAME,
        content: '明白了，谢谢你的帮助！',
        time: '10:10',
        isMe: true,
        avatar: meAvatar
    },
    {
        id: 9,
        sender: BOT_NAME,
        content: '不客气，有任何问题随时联系我。',
        time: '10:11',
        isMe: false,
        avatar: aiAvatar
    }
];
const messages = ref(initializeMessages());
// 工具函数
const formatCurrentTime = () => {
    return new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
};
const scrollToBottom = () => {
    nextTick(() => {
        setTimeout(() => {
            if (messageContainer.value) {
                messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
            }
        }, SCROLL_DELAY);
    });
};
// 消息处理方法
const sendMessage = () => {
    const text = messageText.value.trim();
    if (!text)
        return;
    const newMessage = {
        id: messageId.value++,
        sender: USER_NAME,
        content: text,
        time: formatCurrentTime(),
        isMe: true,
        avatar: meAvatar
    };
    messages.value.push(newMessage);
    messageText.value = '';
    scrollToBottom();
};
// 聊天窗口控制方法
const openChat = () => {
    isDrawerVisible.value = true;
    scrollToBottom();
};
const closeChat = () => {
    isDrawerVisible.value = false;
};
// 生命周期
onMounted(() => {
    scrollToBottom();
    mittBus.on('openChat', openChat);
});
onUnmounted(() => {
    mittBus.off('openChat', openChat);
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("layout-chat") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDrawer;
    /** @type { [typeof __VLS_components.ElDrawer, typeof __VLS_components.ElDrawer, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ modelValue: ((__VLS_ctx.isDrawerVisible)), size: ((__VLS_ctx.isMobile ? '100%' : '480px')), withHeader: ((false)), }));
    const __VLS_2 = __VLS_1({ modelValue: ((__VLS_ctx.isDrawerVisible)), size: ((__VLS_ctx.isMobile ? '100%' : '480px')), withHeader: ((false)), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header-left") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("name") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("status") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("dot") }, ...{ class: (({ online: __VLS_ctx.isOnline, offline: !__VLS_ctx.isOnline })) }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("status-text") }, });
    (__VLS_ctx.isOnline ? '在线' : '离线');
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header-right") }, });
    const __VLS_6 = __VLS_resolvedLocalAndGlobalComponents.ElIcon;
    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.ElIcon, ] } */
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ 'onClick': {} }, ...{ class: ("icon-close") }, size: ((20)), }));
    const __VLS_8 = __VLS_7({ ...{ 'onClick': {} }, ...{ class: ("icon-close") }, size: ((20)), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    let __VLS_12;
    const __VLS_13 = {
        onClick: (__VLS_ctx.closeChat)
    };
    let __VLS_9;
    let __VLS_10;
    const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.Close;
    /** @type { [typeof __VLS_components.Close, ] } */
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({}));
    const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
    __VLS_nonNullable(__VLS_11.slots).default;
    var __VLS_11;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("chat-container") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("chat-messages") }, ref: ("messageContainer"), });
    // @ts-ignore navigation for `const messageContainer = ref()`
    __VLS_ctx.messageContainer;
    for (const [message, index] of __VLS_getVForSourceType((__VLS_ctx.messages))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ((['message-item', message.isMe ? 'message-right' : 'message-left'])) }, });
        const __VLS_20 = __VLS_resolvedLocalAndGlobalComponents.ElAvatar;
        /** @type { [typeof __VLS_components.ElAvatar, ] } */
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ size: ((32)), src: ((message.avatar)), ...{ class: ("message-avatar") }, }));
        const __VLS_22 = __VLS_21({ size: ((32)), src: ((message.avatar)), ...{ class: ("message-avatar") }, }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("message-content") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("message-info") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("sender-name") }, });
        (message.sender);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({ ...{ class: ("message-time") }, });
        (message.time);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("message-text") }, });
        (message.content);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("chat-input") }, });
    const __VLS_26 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.messageText)), type: ("textarea"), rows: ((3)), placeholder: ("输入消息"), resize: ("none"), }));
    const __VLS_28 = __VLS_27({ ...{ 'onKeyup': {} }, modelValue: ((__VLS_ctx.messageText)), type: ("textarea"), rows: ((3)), placeholder: ("输入消息"), resize: ("none"), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    let __VLS_32;
    const __VLS_33 = {
        onKeyup: (__VLS_ctx.sendMessage)
    };
    let __VLS_29;
    let __VLS_30;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { append: __VLS_thisSlot } = __VLS_nonNullable(__VLS_31.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("input-actions") }, });
        const __VLS_34 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({ icon: ((__VLS_ctx.Paperclip)), circle: (true), plain: (true), }));
        const __VLS_36 = __VLS_35({ icon: ((__VLS_ctx.Paperclip)), circle: (true), plain: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        const __VLS_40 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({ icon: ((__VLS_ctx.Picture)), circle: (true), plain: (true), }));
        const __VLS_42 = __VLS_41({ icon: ((__VLS_ctx.Picture)), circle: (true), plain: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        const __VLS_46 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({ ...{ 'onClick': {} }, type: ("primary"), }));
        const __VLS_48 = __VLS_47({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_47));
        __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
        let __VLS_52;
        const __VLS_53 = {
            onClick: (__VLS_ctx.sendMessage)
        };
        let __VLS_49;
        let __VLS_50;
        __VLS_nonNullable(__VLS_51.slots).default;
        var __VLS_51;
    }
    var __VLS_31;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("chat-input-actions") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("left") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
    const __VLS_54 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({ ...{ 'onClick': {} }, type: ("primary"), }));
    const __VLS_56 = __VLS_55({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
    let __VLS_60;
    const __VLS_61 = {
        onClick: (__VLS_ctx.sendMessage)
    };
    let __VLS_57;
    let __VLS_58;
    __VLS_nonNullable(__VLS_59.slots).default;
    var __VLS_59;
    __VLS_nonNullable(__VLS_5.slots).default;
    var __VLS_5;
    __VLS_styleScopedClasses['layout-chat'];
    __VLS_styleScopedClasses['header'];
    __VLS_styleScopedClasses['header-left'];
    __VLS_styleScopedClasses['name'];
    __VLS_styleScopedClasses['status'];
    __VLS_styleScopedClasses['dot'];
    __VLS_styleScopedClasses['online'];
    __VLS_styleScopedClasses['offline'];
    __VLS_styleScopedClasses['status-text'];
    __VLS_styleScopedClasses['header-right'];
    __VLS_styleScopedClasses['icon-close'];
    __VLS_styleScopedClasses['chat-container'];
    __VLS_styleScopedClasses['chat-messages'];
    __VLS_styleScopedClasses['message-item'];
    __VLS_styleScopedClasses['message-avatar'];
    __VLS_styleScopedClasses['message-content'];
    __VLS_styleScopedClasses['message-info'];
    __VLS_styleScopedClasses['sender-name'];
    __VLS_styleScopedClasses['message-time'];
    __VLS_styleScopedClasses['message-text'];
    __VLS_styleScopedClasses['chat-input'];
    __VLS_styleScopedClasses['input-actions'];
    __VLS_styleScopedClasses['chat-input-actions'];
    __VLS_styleScopedClasses['left'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['iconfont-sys'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "messageContainer": __VLS_nativeElements['div'],
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
            Picture: Picture,
            Paperclip: Paperclip,
            isMobile: isMobile,
            isDrawerVisible: isDrawerVisible,
            isOnline: isOnline,
            messageText: messageText,
            messageContainer: messageContainer,
            messages: messages,
            sendMessage: sendMessage,
            closeChat: closeChat,
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