/**
 * 路由相关工具函数
 */

import { AppRouteRecord } from '@/types'

// 检查是否为 iframe 路由
export function isIframe(url: string): boolean {
  return url.startsWith('/outside/iframe/')
}

/**
 * 验证菜单项是否有效
 * @param menuItem 菜单项
 * @returns 是否为有效菜单项
 */
const isValidMenuItem = (menuItem: AppRouteRecord): boolean => {
  return !!(menuItem.path && menuItem.path.trim() && !menuItem.meta?.isHide)
}

/**
 * 解析路径
 * @param parent 父路径
 * @param child 子路径
 * @returns 完整路径
 */
const resolvePath = (parent: string, child: string): string => {
  // 如果子路径是绝对路径，直接返回子路径
  if (child.startsWith('/')) return child
  const p = parent.replace(/\/$/, '')
  const c = child.replace(/^\//, '')
  return p ? `${p}/${c}` : `/${c}`
}

/**
 * 递归获取菜单的第一个有效路径
 * @param menuList 菜单列表
 * @param parentPath 父级路径
 * @returns 第一个有效路径，如果没有找到则返回空字符串
 */
export const getFirstMenuPath = (menuList: AppRouteRecord[], parentPath = ''): string => {
  if (!Array.isArray(menuList) || menuList.length === 0) {
    return ''
  }

  for (const menuItem of menuList) {
    if (!isValidMenuItem(menuItem)) {
      continue
    }

    const currentPath = menuItem.path!.startsWith('/')
      ? menuItem.path!
      : resolvePath(parentPath, menuItem.path!)

    // 如果有子菜单，优先查找子菜单
    if (menuItem.children?.length) {
      const childPath = getFirstMenuPath(menuItem.children, currentPath)
      if (childPath) {
        return childPath
      }
    }

    // 返回当前菜单项的完整路径
    return currentPath
  }

  return ''
}
