import { AppRouteRecordRaw } from '../utils/utils'
import { RoutesAlias } from '../routesAlias'

/**
 * 静态路由配置
 * 不需要权限就能访问的路由
 *
 * 注意事项：
 * 1、path、name 不要和动态路由冲突，否则会导致路由冲突无法访问
 * 2、不需要登录就能访问的路由，在 meta 中添加 noLogin: true
 */
export const staticRoutes: AppRouteRecordRaw[] = [
  {
    path: '/submit-form/:uuid',
    name: 'FormSubmit',
    component: () => import('@/views/form-design/submit/index.vue'),
    meta: { title: '表单填报', noLogin: true, isHideTab: true }
  },
  // 不需要登录就能访问的路由示例
  // {
  //   path: '/welcome',
  //   name: 'WelcomeStatic',
  //   component: () => import('@views/dashboard/console/index.vue'),
  //   meta: { title: 'menus.dashboard.title', noLogin: true }
  // },
  {
    path: RoutesAlias.Login,
    name: 'Login',
    component: () => import('@views/auth/login/index.vue'),
    meta: { title: 'menus.login.title', isHideTab: true, setTheme: true }
  },
  {
    path: RoutesAlias.Register,
    name: 'Register',
    component: () => import('@views/auth/register/index.vue'),
    meta: { title: 'menus.register.title', isHideTab: true, noLogin: true, setTheme: true }
  },
  {
    path: RoutesAlias.ForgetPassword,
    name: 'ForgetPassword',
    component: () => import('@views/auth/forget-password/index.vue'),
    meta: { title: 'menus.forgetPassword.title', isHideTab: true, noLogin: true, setTheme: true }
  },
  {
    path: '/403',
    name: 'Exception403',
    component: () => import('@views/exception/403/index.vue'),
    meta: { title: '403', noLogin: true }
  },

  {
    path: '/500',
    name: 'Exception500',
    component: () => import('@views/exception/500/index.vue'),
    meta: { title: '500', noLogin: true }
  },
  {
    path: '/form/view/:id',
    name: 'FormView',
    component: () => import('@/views/form-design/viewer/index.vue'),
    meta: { title: 'Form View', noLogin: true, isHideTab: true }
  },
  {
    path: '/form/edit/:id',
    name: 'FormEditStatic',
    component: () => import('@/views/form-design/edit/index.vue'),
    meta: { title: '编辑表单', isHideTab: true }
  },
  {
    path: '/form/data/:id',
    name: 'FormDataStatic',
    component: () => import('@/views/form-design/data/index.vue'),
    meta: { title: '表单数据', isHideTab: true }
  },
  {
    path: '/form/stats/:id',
    name: 'FormStatsStatic',
    component: () => import('@/views/form-design/stats/index.vue'),
    meta: { title: '图表统计', isHideTab: true }
  },
  {
    path: '/outside',
    component: () => import('@views/index/index.vue'),
    name: 'Outside',
    meta: { title: 'menus.outside.title' },
    children: [
      {
        path: '/outside/iframe/:path',
        name: 'Iframe',
        component: () => import('@/views/outside/Iframe.vue'),
        meta: { title: 'iframe' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'Exception404',
    component: () => import('@views/exception/404/index.vue'),
    meta: { title: '404' }
  }
]
