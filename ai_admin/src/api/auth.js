import request from '@/utils/http';
/**
 * 登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function fetchLogin(params) {
    return request.post({
        url: '/user/login',
        data: params
        // showSuccessMessage: true // 显示成功消息
        // showErrorMessage: false // 不显示错误消息
    });
}
/**
 * 注册
 * @param params 注册参数
 * @returns 注册响应
 */
export function fetchRegister(params) {
    return request.post({
        url: '/user/register',
        data: params
        // showSuccessMessage: true // 显示成功消息
        // showErrorMessage: false // 不显示错误消息
    });
}
/**
 * 获取用户信息
 * @returns 用户信息
 */
export function fetchGetUserInfo() {
    return request.get({
        url: '/user/profile'
        // 自定义请求头
        // headers: {
        //   'X-Custom-Header': 'your-custom-value'
        // }
    });
}
export function fetchUpdateNickname(params) {
    return request.post({
        url: '/user/update_nickname',
        data: params,
        showSuccessMessage: true
    });
}
export function fetchUpdatePassword(params) {
    return request.post({
        url: '/user/update_password',
        params,
        showSuccessMessage: true
    });
}
export function fetchUpdateProfile(params) {
    return request.post({
        url: '/user/update_profile',
        data: params,
        showSuccessMessage: true
    });
}
//# sourceMappingURL=auth.js.map