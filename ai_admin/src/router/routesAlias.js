/**
 * 路由别名，方便快速找到页面，同时可以用作路由跳转
 */
export var RoutesAlias;
(function (RoutesAlias) {
    // 布局和认证
    RoutesAlias["Layout"] = "/index/index";
    RoutesAlias["Login"] = "/auth/login";
    RoutesAlias["Register"] = "/auth/register";
    RoutesAlias["ForgetPassword"] = "/auth/forget-password";
    // 异常页面
    RoutesAlias["Exception403"] = "/exception/403";
    RoutesAlias["Exception404"] = "/exception/404";
    RoutesAlias["Exception500"] = "/exception/500";
    // 结果页面
    RoutesAlias["Success"] = "/result/success";
    RoutesAlias["Fail"] = "/result/fail";
    // 仪表板
    RoutesAlias["Dashboard"] = "/dashboard/console";
    // 系统管理
    RoutesAlias["User"] = "/system/user";
    RoutesAlias["Role"] = "/system/role";
    RoutesAlias["UserCenter"] = "/system/user-center";
    RoutesAlias["Menu"] = "/system/menu";
    RoutesAlias["Department"] = "/system/department"; // 部门管理
})(RoutesAlias || (RoutesAlias = {}));
//# sourceMappingURL=routesAlias.js.map