/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue';
import { ElMessageBox, ElMessage, ElTag } from 'element-plus';
import { useTable } from '@/composables/useTable';
import { fetchGetUserList, fetchDeleteUser } from '@/api/system-manage';
import UserSearch from './modules/user-search.vue';
import UserDialog from './modules/user-dialog.vue';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
defineOptions({ name: 'User' });
// 弹窗相关
const dialogType = ref('add');
const dialogVisible = ref(false);
const currentUserData = ref({});
// 选中行
const selectedRows = ref([]);
// 搜索表单
const searchForm = ref({
    userName: undefined,
    userGender: undefined,
    userPhone: undefined,
    userEmail: undefined,
    status: '1'
});
// 用户状态配置
const USER_STATUS_CONFIG = {
    '1': { type: 'success', text: '在线' },
    '2': { type: 'info', text: '离线' },
    '3': { type: 'warning', text: '异常' },
    '4': { type: 'danger', text: '注销' }
};
/**
 * 获取用户状态配置
 */
const getUserStatusConfig = (status) => {
    return (USER_STATUS_CONFIG[status] || {
        type: 'info',
        text: '未知'
    });
};
const { columns, columnChecks, data, loading, pagination, getData, searchParams, resetSearchParams, handleSizeChange, handleCurrentChange, refreshData } = useTable({
    // 核心配置
    core: {
        apiFn: fetchGetUserList,
        apiParams: {
            current: 1,
            size: 20,
            ...searchForm.value
        },
        // 排除 apiParams 中的属性
        excludeParams: [],
        columnsFactory: () => [
            { type: 'selection' }, // 勾选列
            { type: 'index', width: 60, label: '序号' }, // 序号
            {
                prop: 'userName',
                label: '用户名',
                width: 200,
                formatter: (row) => h('span', {}, row.userName)
            },
            {
                prop: 'userGender',
                label: '性别',
                sortable: true,
                // checked: false, // 隐藏列
                formatter: (row) => row.userGender
            },
            { prop: 'userPhone', label: '手机号' },
            {
                prop: 'status',
                label: '状态',
                formatter: (row) => {
                    const statusConfig = getUserStatusConfig(row.status);
                    return h(ElTag, { type: statusConfig.type }, () => statusConfig.text);
                }
            },
            {
                prop: 'createTime',
                label: '创建日期',
                sortable: true
            },
            {
                prop: 'operation',
                label: '操作',
                width: 120,
                fixed: 'right', // 固定列
                formatter: (row) => h('div', [
                    h(ArtButtonTable, {
                        type: 'edit',
                        onClick: () => showDialog('edit', row)
                    }),
                    h(ArtButtonTable, {
                        type: 'delete',
                        onClick: () => deleteUser(row)
                    })
                ])
            }
        ]
    },
    // 数据处理
    transform: {
        dataTransformer: (records) => (Array.isArray(records) ? records : [])
    }
});
/**
 * 搜索处理
 * @param params 参数
 */
const handleSearch = (params) => {
    // 搜索参数赋值
    Object.assign(searchParams, params);
    getData();
};
/**
 * 显示用户弹窗
 */
const showDialog = (type, row) => {
    console.log('打开弹窗:', { type, row });
    dialogType.value = type;
    currentUserData.value = row || {};
    nextTick(() => {
        dialogVisible.value = true;
    });
};
/**
 * 删除用户
 */
const deleteUser = (row) => {
    console.log('删除用户:', row);
    ElMessageBox.confirm(`确定要删除该用户吗？`, '删除用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        await fetchDeleteUser({ userId: row.id });
        ElMessage.success('删除成功');
        refreshData();
    });
};
/**
 * 处理弹窗提交事件
 */
const handleDialogSubmit = async () => {
    try {
        dialogVisible.value = false;
        currentUserData.value = {};
        refreshData();
    }
    catch (error) {
        console.error('提交失败:', error);
    }
};
/**
 * 处理表格行选择变化
 */
const handleSelectionChange = (selection) => {
    selectedRows.value = selection;
    console.log('选中行数据:', selectedRows.value);
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("user-page art-full-height") }, });
    // @ts-ignore
    [UserSearch, UserSearch,];
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(UserSearch, new UserSearch({ ...{ 'onSearch': {} }, ...{ 'onReset': {} }, modelValue: ((__VLS_ctx.searchForm)), }));
    const __VLS_1 = __VLS_0({ ...{ 'onSearch': {} }, ...{ 'onReset': {} }, modelValue: ((__VLS_ctx.searchForm)), }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    let __VLS_5;
    const __VLS_6 = {
        onSearch: (__VLS_ctx.handleSearch)
    };
    const __VLS_7 = {
        onReset: (__VLS_ctx.resetSearchParams)
    };
    let __VLS_2;
    let __VLS_3;
    var __VLS_4;
    const __VLS_8 = __VLS_resolvedLocalAndGlobalComponents.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ] } */
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ ...{ class: ("art-table-card") }, shadow: ("never"), }));
    const __VLS_10 = __VLS_9({ ...{ class: ("art-table-card") }, shadow: ("never"), }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_14 = __VLS_resolvedLocalAndGlobalComponents.ArtTableHeader;
    /** @type { [typeof __VLS_components.ArtTableHeader, typeof __VLS_components.ArtTableHeader, ] } */
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ ...{ 'onRefresh': {} }, columns: ((__VLS_ctx.columnChecks)), loading: ((__VLS_ctx.loading)), }));
    const __VLS_16 = __VLS_15({ ...{ 'onRefresh': {} }, columns: ((__VLS_ctx.columnChecks)), loading: ((__VLS_ctx.loading)), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    let __VLS_20;
    const __VLS_21 = {
        onRefresh: (__VLS_ctx.refreshData)
    };
    let __VLS_17;
    let __VLS_18;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { left: __VLS_thisSlot } = __VLS_nonNullable(__VLS_19.slots);
        const __VLS_22 = __VLS_resolvedLocalAndGlobalComponents.ElSpace;
        /** @type { [typeof __VLS_components.ElSpace, typeof __VLS_components.ElSpace, ] } */
        // @ts-ignore
        const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({ wrap: (true), }));
        const __VLS_24 = __VLS_23({ wrap: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_23));
        const __VLS_28 = __VLS_resolvedLocalAndGlobalComponents.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.ElButton, ] } */
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({ ...{ 'onClick': {} }, }));
        const __VLS_30 = __VLS_29({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_asFunctionalDirective(__VLS_directives.vRipple)(null, { ...__VLS_directiveBindingRestFields, modifiers: {}, }, null, null);
        let __VLS_34;
        const __VLS_35 = {
            onClick: (...[$event]) => {
                __VLS_ctx.showDialog('add');
            }
        };
        let __VLS_31;
        let __VLS_32;
        __VLS_nonNullable(__VLS_33.slots).default;
        var __VLS_33;
        __VLS_nonNullable(__VLS_27.slots).default;
        var __VLS_27;
    }
    var __VLS_19;
    const __VLS_36 = __VLS_resolvedLocalAndGlobalComponents.ArtTable;
    /** @type { [typeof __VLS_components.ArtTable, typeof __VLS_components.ArtTable, ] } */
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({ ...{ 'onSelectionChange': {} }, ...{ 'onPagination:sizeChange': {} }, ...{ 'onPagination:currentChange': {} }, loading: ((__VLS_ctx.loading)), data: ((__VLS_ctx.data)), columns: ((__VLS_ctx.columns)), pagination: ((__VLS_ctx.pagination)), }));
    const __VLS_38 = __VLS_37({ ...{ 'onSelectionChange': {} }, ...{ 'onPagination:sizeChange': {} }, ...{ 'onPagination:currentChange': {} }, loading: ((__VLS_ctx.loading)), data: ((__VLS_ctx.data)), columns: ((__VLS_ctx.columns)), pagination: ((__VLS_ctx.pagination)), }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    let __VLS_42;
    const __VLS_43 = {
        onSelectionChange: (__VLS_ctx.handleSelectionChange)
    };
    const __VLS_44 = {
        'onPagination:sizeChange': (__VLS_ctx.handleSizeChange)
    };
    const __VLS_45 = {
        'onPagination:currentChange': (__VLS_ctx.handleCurrentChange)
    };
    let __VLS_39;
    let __VLS_40;
    var __VLS_41;
    // @ts-ignore
    [UserDialog,];
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(UserDialog, new UserDialog({ ...{ 'onSubmit': {} }, visible: ((__VLS_ctx.dialogVisible)), type: ((__VLS_ctx.dialogType)), userData: ((__VLS_ctx.currentUserData)), }));
    const __VLS_47 = __VLS_46({ ...{ 'onSubmit': {} }, visible: ((__VLS_ctx.dialogVisible)), type: ((__VLS_ctx.dialogType)), userData: ((__VLS_ctx.currentUserData)), }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    let __VLS_51;
    const __VLS_52 = {
        onSubmit: (__VLS_ctx.handleDialogSubmit)
    };
    let __VLS_48;
    let __VLS_49;
    var __VLS_50;
    __VLS_nonNullable(__VLS_13.slots).default;
    var __VLS_13;
    __VLS_styleScopedClasses['user-page'];
    __VLS_styleScopedClasses['art-full-height'];
    __VLS_styleScopedClasses['art-table-card'];
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
            UserSearch: UserSearch,
            UserDialog: UserDialog,
            dialogType: dialogType,
            dialogVisible: dialogVisible,
            currentUserData: currentUserData,
            searchForm: searchForm,
            columns: columns,
            columnChecks: columnChecks,
            data: data,
            loading: loading,
            pagination: pagination,
            resetSearchParams: resetSearchParams,
            handleSizeChange: handleSizeChange,
            handleCurrentChange: handleCurrentChange,
            refreshData: refreshData,
            handleSearch: handleSearch,
            showDialog: showDialog,
            handleDialogSubmit: handleDialogSubmit,
            handleSelectionChange: handleSelectionChange,
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