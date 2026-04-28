import { h } from 'vue'
import { RouterView } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const modules = import.meta.glob('@/views/**/*.vue')

// 중간 그룹 메뉴용 pass-through (레이아웃 중첩 방지)
const PassThrough = { render: () => h(RouterView) }

// 컴포넌트 매핑
function resolveComponent(component) {
  if (!component) return PassThrough

  const clean = component.replace(/^\/+/, '')
  const key = `/src/views/${clean}.vue`

  const mod = modules[key]

  if (!mod) {
    console.error(`컴포넌트 없음: ${key}`)
    return () => import('@/views/error/NotFound.vue')    
  }

  return mod
}

// 부모 path 자동 생성 (/about)
function getParentPath(menu) {
  if (menu.menuUrl) return menu.menuUrl

  const child = menu.children?.find(c => c.menuUrl)
  if (!child) return '/'

  return '/' + child.menuUrl.split('/')[1]
}

// child path → 상대경로
function getChildPath(fullPath, parentPath) {
  return fullPath.replace(parentPath + '/', '')
}

// 핵심 재귀
function buildRoute(menu, parentPath = '') {
  const currentPath = getParentPath(menu)

  const route = {
    path: parentPath
      ? getChildPath(currentPath, parentPath)
      : currentPath,
    name: menu.menuCode + menu.menuNo,
    component: menu.level === 1
      ? DefaultLayout
      : resolveComponent(menu.component),
    meta: {
      menuCode: menu.menuCode,
      menuNo: menu.menuNo,
      title: menu.menuName
    }
  }

  if (menu.children && menu.children.length > 0) {
    route.children = menu.children.map(child =>
      buildRoute(child, currentPath)
    )
  }

  return route
}

// 최종 export
export function generateRoutesFromStore(menuTree) {
  return menuTree.map(menu => buildRoute(menu))
}