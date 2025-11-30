/// <reference types="../../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { useUserStore } from '@/store/modules/user';
import { Search } from '@element-plus/icons-vue';
import { mittBus } from '@/utils/sys';
import { useMenuStore } from '@/store/modules/menu';
import { formatMenuTitle } from '@/router/utils/utils';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'ArtGlobalSearch' });
const router = useRouter();
const userStore = useUserStore();
const { menuList } = storeToRefs(useMenuStore());
const showSearchDialog = ref(false);
const searchVal = ref('');
const searchResult = ref([]);
const historyMaxLength = 10;
const { searchHistory: historyResult } = storeToRefs(userStore);
const searchInput = ref(null);
const highlightedIndex = ref(0);
const historyHIndex = ref(0);
const searchResultScrollbar = ref();
const isKeyboardNavigating = ref(false); // 新增状态：是否正在使用键盘导航
// 生命周期钩子
onMounted(() => {
    mittBus.on('openSearchDialog', openSearchDialog);
    document.addEventListener('keydown', handleKeydown);
});
onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
});
// 键盘快捷键处理
const handleKeydown = (event) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isCommandKey = isMac ? event.metaKey : event.ctrlKey;
    if (isCommandKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        showSearchDialog.value = true;
        focusInput();
    }
    // 当搜索对话框打开时，处理方向键和回车键
    if (showSearchDialog.value) {
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            highlightPrevious();
        }
        else if (event.key === 'ArrowDown') {
            event.preventDefault();
            highlightNext();
        }
        else if (event.key === 'Enter') {
            event.preventDefault();
            selectHighlighted();
        }
        else if (event.key === 'Escape') {
            event.preventDefault();
            showSearchDialog.value = false;
        }
    }
};
const focusInput = () => {
    setTimeout(() => {
        searchInput.value?.focus();
    }, 100);
};
// 搜索逻辑
const search = (val) => {
    if (val) {
        searchResult.value = flattenAndFilterMenuItems(menuList.value, val);
    }
    else {
        searchResult.value = [];
    }
};
const flattenAndFilterMenuItems = (items, val) => {
    const lowerVal = val.toLowerCase();
    const result = [];
    const flattenAndMatch = (item) => {
        if (item.meta?.isHide)
            return;
        const lowerItemTitle = formatMenuTitle(item.meta.title).toLowerCase();
        if (item.children && item.children.length > 0) {
            item.children.forEach(flattenAndMatch);
            return;
        }
        if (lowerItemTitle.includes(lowerVal) && item.path) {
            result.push({ ...item, children: undefined });
        }
    };
    items.forEach(flattenAndMatch);
    return result;
};
// 高亮控制并实现滚动条跟随
const highlightPrevious = () => {
    isKeyboardNavigating.value = true;
    if (searchVal.value) {
        highlightedIndex.value =
            (highlightedIndex.value - 1 + searchResult.value.length) % searchResult.value.length;
        scrollToHighlightedItem();
    }
    else {
        historyHIndex.value =
            (historyHIndex.value - 1 + historyResult.value.length) % historyResult.value.length;
        scrollToHighlightedHistoryItem();
    }
    // 延迟重置键盘导航状态，防止立即被 hover 覆盖
    setTimeout(() => {
        isKeyboardNavigating.value = false;
    }, 100);
};
const highlightNext = () => {
    isKeyboardNavigating.value = true;
    if (searchVal.value) {
        highlightedIndex.value = (highlightedIndex.value + 1) % searchResult.value.length;
        scrollToHighlightedItem();
    }
    else {
        historyHIndex.value = (historyHIndex.value + 1) % historyResult.value.length;
        scrollToHighlightedHistoryItem();
    }
    setTimeout(() => {
        isKeyboardNavigating.value = false;
    }, 100);
};
const scrollToHighlightedItem = () => {
    nextTick(() => {
        if (!searchResultScrollbar.value || !searchResult.value.length)
            return;
        const scrollWrapper = searchResultScrollbar.value.wrapRef;
        if (!scrollWrapper)
            return;
        const highlightedElements = scrollWrapper.querySelectorAll('.result .box');
        if (!highlightedElements[highlightedIndex.value])
            return;
        const highlightedElement = highlightedElements[highlightedIndex.value];
        const itemHeight = highlightedElement.offsetHeight;
        const scrollTop = scrollWrapper.scrollTop;
        const containerHeight = scrollWrapper.clientHeight;
        const itemTop = highlightedElement.offsetTop;
        const itemBottom = itemTop + itemHeight;
        if (itemTop < scrollTop) {
            searchResultScrollbar.value.setScrollTop(itemTop);
        }
        else if (itemBottom > scrollTop + containerHeight) {
            searchResultScrollbar.value.setScrollTop(itemBottom - containerHeight);
        }
    });
};
const scrollToHighlightedHistoryItem = () => {
    nextTick(() => {
        if (!searchResultScrollbar.value || !historyResult.value.length)
            return;
        const scrollWrapper = searchResultScrollbar.value.wrapRef;
        if (!scrollWrapper)
            return;
        const historyItems = scrollWrapper.querySelectorAll('.history-result .box');
        if (!historyItems[historyHIndex.value])
            return;
        const highlightedElement = historyItems[historyHIndex.value];
        const itemHeight = highlightedElement.offsetHeight;
        const scrollTop = scrollWrapper.scrollTop;
        const containerHeight = scrollWrapper.clientHeight;
        const itemTop = highlightedElement.offsetTop;
        const itemBottom = itemTop + itemHeight;
        if (itemTop < scrollTop) {
            searchResultScrollbar.value.setScrollTop(itemTop);
        }
        else if (itemBottom > scrollTop + containerHeight) {
            searchResultScrollbar.value.setScrollTop(itemBottom - containerHeight);
        }
    });
};
const selectHighlighted = () => {
    if (searchVal.value && searchResult.value.length) {
        searchGoPage(searchResult.value[highlightedIndex.value]);
    }
    else if (!searchVal.value && historyResult.value.length) {
        searchGoPage(historyResult.value[historyHIndex.value]);
    }
};
const isHighlighted = (index) => {
    return highlightedIndex.value === index;
};
const searchBlur = () => {
    highlightedIndex.value = 0;
};
const searchGoPage = (item) => {
    showSearchDialog.value = false;
    addHistory(item);
    router.push(item.path);
    searchVal.value = '';
    searchResult.value = [];
};
// 历史记录管理
const updateHistory = () => {
    if (Array.isArray(historyResult.value)) {
        userStore.setSearchHistory(historyResult.value);
    }
};
const addHistory = (item) => {
    const hasItemIndex = historyResult.value.findIndex((historyItem) => historyItem.path === item.path);
    if (hasItemIndex !== -1) {
        historyResult.value.splice(hasItemIndex, 1);
    }
    else if (historyResult.value.length >= historyMaxLength) {
        historyResult.value.pop();
    }
    const cleanedItem = { ...item };
    delete cleanedItem.children;
    delete cleanedItem.meta.authList;
    historyResult.value.unshift(cleanedItem);
    updateHistory();
};
const deleteHistory = (index) => {
    historyResult.value.splice(index, 1);
    updateHistory();
};
// 对话框控制
const openSearchDialog = () => {
    showSearchDialog.value = true;
    focusInput();
};
const closeSearchDialog = () => {
    searchVal.value = '';
    searchResult.value = [];
    highlightedIndex.value = 0;
    historyHIndex.value = 0;
};
// 修改 hover 高亮逻辑，只有在非键盘导航时才生效
const highlightOnHover = (index) => {
    if (!isKeyboardNavigating.value && searchVal.value) {
        highlightedIndex.value = index;
    }
};
const highlightOnHoverHistory = (index) => {
    if (!isKeyboardNavigating.value && !searchVal.value) {
        historyHIndex.value = index;
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("layout-search") }, });
    const __VLS_0 = __VLS_resolvedLocalAndGlobalComponents.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.ElDialog, ] } */
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.showSearchDialog)), width: ("600"), showClose: ((false)), lockScroll: ((false)), modalClass: ("search-modal"), }));
    const __VLS_2 = __VLS_1({ ...{ 'onClose': {} }, modelValue: ((__VLS_ctx.showSearchDialog)), width: ("600"), showClose: ((false)), lockScroll: ((false)), modalClass: ("search-modal"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_6;
    const __VLS_7 = {
        onClose: (__VLS_ctx.closeSearchDialog)
    };
    let __VLS_3;
    let __VLS_4;
    const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.ElInput, ] } */
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ ...{ 'onInput': {} }, ...{ 'onBlur': {} }, modelValue: ((__VLS_ctx.searchVal)), placeholder: ((__VLS_ctx.$t('search.placeholder'))), ref: ("searchInput"), prefixIcon: ((__VLS_ctx.Search)), }));
    const __VLS_10 = __VLS_9({ ...{ 'onInput': {} }, ...{ 'onBlur': {} }, modelValue: ((__VLS_ctx.searchVal)), placeholder: ((__VLS_ctx.$t('search.placeholder'))), ref: ("searchInput"), prefixIcon: ((__VLS_ctx.Search)), }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    // @ts-ignore navigation for `const searchInput = ref()`
    __VLS_ctx.searchInput;
    var __VLS_14 = {};
    let __VLS_15;
    const __VLS_16 = {
        onInput: (__VLS_ctx.search)
    };
    const __VLS_17 = {
        onBlur: (__VLS_ctx.searchBlur)
    };
    let __VLS_11;
    let __VLS_12;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { suffix: __VLS_thisSlot } = __VLS_nonNullable(__VLS_13.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("search-keydown") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
    }
    var __VLS_13;
    const __VLS_18 = __VLS_resolvedLocalAndGlobalComponents.ElScrollbar;
    /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.ElScrollbar, ] } */
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({ ...{ class: ("search-scrollbar") }, maxHeight: ("370px"), ref: ("searchResultScrollbar"), always: (true), }));
    const __VLS_20 = __VLS_19({ ...{ class: ("search-scrollbar") }, maxHeight: ("370px"), ref: ("searchResultScrollbar"), always: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    // @ts-ignore navigation for `const searchResultScrollbar = ref()`
    __VLS_ctx.searchResultScrollbar;
    var __VLS_24 = {};
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("result") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.searchResult.length) }, null, null);
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.searchResult))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("box") }, key: ((index)), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.searchGoPage(item);
                } }, ...{ onMouseenter: (...[$event]) => {
                    __VLS_ctx.highlightOnHover(index);
                } }, ...{ class: (({ highlighted: __VLS_ctx.isHighlighted(index) })) }, });
        (__VLS_ctx.formatMenuTitle(item.meta.title));
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("selected-icon iconfont-sys") }, });
        __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (__VLS_ctx.isHighlighted(index)) }, null, null);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("history-box") }, });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, value: (!__VLS_ctx.searchVal && __VLS_ctx.searchResult.length === 0 && __VLS_ctx.historyResult.length > 0) }, null, null);
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("title") }, });
    (__VLS_ctx.$t('search.historyTitle'));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("history-result") }, });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.historyResult))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.searchGoPage(item);
                } }, ...{ onMouseenter: (...[$event]) => {
                    __VLS_ctx.highlightOnHoverHistory(index);
                } }, ...{ class: ("box") }, key: ((index)), ...{ class: (({ highlighted: __VLS_ctx.historyHIndex === index })) }, });
        (__VLS_ctx.formatMenuTitle(item.meta.title));
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ onClick: (...[$event]) => {
                    __VLS_ctx.deleteHistory(index);
                } }, ...{ class: ("selected-icon iconfont-sys") }, });
    }
    __VLS_nonNullable(__VLS_23.slots).default;
    var __VLS_23;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_nonNullable(__VLS_5.slots);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("dialog-footer") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.$t('search.selectKeydown'));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.$t('search.switchKeydown'));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({ ...{ class: ("iconfont-sys esc") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.$t('search.exitKeydown'));
    }
    var __VLS_5;
    __VLS_styleScopedClasses['layout-search'];
    __VLS_styleScopedClasses['search-keydown'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['search-scrollbar'];
    __VLS_styleScopedClasses['result'];
    __VLS_styleScopedClasses['box'];
    __VLS_styleScopedClasses['highlighted'];
    __VLS_styleScopedClasses['selected-icon'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['history-box'];
    __VLS_styleScopedClasses['title'];
    __VLS_styleScopedClasses['history-result'];
    __VLS_styleScopedClasses['box'];
    __VLS_styleScopedClasses['highlighted'];
    __VLS_styleScopedClasses['selected-icon'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['dialog-footer'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['iconfont-sys'];
    __VLS_styleScopedClasses['esc'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {
        "searchInput": __VLS_14,
        "searchResultScrollbar": __VLS_24,
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
            Search: Search,
            formatMenuTitle: formatMenuTitle,
            showSearchDialog: showSearchDialog,
            searchVal: searchVal,
            searchResult: searchResult,
            historyResult: historyResult,
            searchInput: searchInput,
            historyHIndex: historyHIndex,
            searchResultScrollbar: searchResultScrollbar,
            search: search,
            isHighlighted: isHighlighted,
            searchBlur: searchBlur,
            searchGoPage: searchGoPage,
            deleteHistory: deleteHistory,
            closeSearchDialog: closeSearchDialog,
            highlightOnHover: highlightOnHover,
            highlightOnHoverHistory: highlightOnHoverHistory,
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