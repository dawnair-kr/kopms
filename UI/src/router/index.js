// import { createRouter, createWebHistory } from 'vue-router'

import { createMemoryHistory, createRouter as _createRouter, createWebHistory } from 'vue-router';
import { useAppStore } from '../store/app.js';
import LoginLayout from '@/layouts/LoginLayout.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import axios from 'axios';

import { useUserStore } from '@/store/user.js';
import { useMenuStore } from '@/store/menu.js';
import { useErrorStore } from '@/store/errorStore.js';
import { useSelectMenuStore } from '@/store/selectMenuStore.js';    // 26.04.02 Add
import { useMenuAuthStore } from '@/store/menuAuth.js';             // 26.04.02 Add
import { generateRoutesFromStore } from '@/util/routeGenerator.js'; // 26.04.02 Add

import { useCompanyStore } from '@/store/company.js';
import { getApiBaseUrl } from '@/util/util.js';

/**
 * 라우터 정보 생성 규칙
 * 1. [메뉴 : MENU_LIST] 의 'MENU_URL' 정보 설정은 계층형 구조를 기본으로 한다.
 * 예) /about
 *	/about/goal
 *	/about/process
 * 2. 정적 vs 동적 역할 분리
 * 정적 : 로그인, 설정, 상세 (/task/:id)
 * 동적 : 메뉴
 * 3. path unique 보장
 * 4. name unique 보장
**/
// 정적 라우터 정보
const routes = [
  {
    path: "/",
    component: () => import('@/views/Login.vue'),
    name: 'Login',
    props: true,
    meta: { layout: LoginLayout }
  },
  {
    path: "/home",
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { layout: DefaultLayout }
  },

  // 500 : ServerError
  {
    path: '/500',
    name: 'ServerError',
    component: () => import('@/views/error/ServerError.vue'),
    meta: { layout: DefaultLayout,
            noMenu: true
          }
  },

  // 
  {
    path: "/bizportal",
    name: 'BizPortal',
    props: true,
    component: () => import('@/views/biz/portal/BizPortal.vue'),
    meta: { layout: DefaultLayout }
  },
  {
    path: '/biz/task/:taskCode',
    name: 'TaskDetail',
    component: () => import('@/views/biz/task/TaskDetail.vue'),
    meta: { layout: DefaultLayout }
  },
  {
    path: '/operation/regist',
    name: 'OperRegist',
    component: () => import('@/views/operation/OperRegist.vue'),
    meta: { layout: DefaultLayout }
  },
  {
    path: '/operation/:nbmId/edit',
    name: 'OperEdit',
    props: true,
    component: () => import('@/views/operation/OperRegist.vue'),
    meta: { layout: DefaultLayout }
  },
  {
    path: '/operation/:nbmId',
    name: 'OperInfo',
    props: true,
    component: () => import('@/views/operation/oper/OperInfo.vue'),
    meta: { layout: DefaultLayout }
  },
  // 권한
  {
    path: '/authority/edit',
    name: 'AuthorityEdit',
    component: () => import('@/views/sys/AuthorityEdit.vue'),
    meta: { layout: DefaultLayout }
  },
  {
    path: '/meeting',
    name: 'MeetingRoomList',
    component: () => import('@/views/meeting/MeetingList.vue'),
    meta: { layout: DefaultLayout }
  },
  {
    path: '/meeting/regist',
    name: 'MeetingRegist',
    component: () => import('@/views/meeting/MeetingRegist.vue'),
    meta: { layout: DefaultLayout }
  },
  {
    path: '/re/ecoanalysis/finance',
    name: 'EcoFinance',
    component: () => import('@/views/biz/analysis/EcoFinance.vue'),
    meta: { layout: DefaultLayout }
  },

]

// Route 동적 생성 확인 용 
function printRoutes(routes, depth = 0) {
  routes.forEach(r => {
    console.log(
      `${' '.repeat(depth * 2)}- ${r.path} (${r.name})`
    )

    if (r.children && r.children.length > 0) {
      printRoutes(r.children, depth + 1)
    }
  })
}

export const createRouter = () => {
  // 서버 사이드 렌더링(SSR) 여부에 따라 history 옵션 설정
  // 서버 : RL 히스토리를 메모리(서버 메모리) 에만 저장
  // Client : HTML5 History API 사용 - 주소가 표현됨 : /login
  const router = _createRouter({
    history: import.meta.env.SSR
      ? createMemoryHistory("/")
      : createWebHistory("/"),
    routes,
  });
  // 2026.03.16
  // const router = _createRouter({
  //   history: import.meta.env.SSR
  //     ? createMemoryHistory("/")
  //     : createWebHistory(import.meta.env.VITE_API_BASE),
  //   routes,
  // });
  
  let isRouteAdded = false;   // 라우터 동적생성
  // 권한 체크, 라우터 동적생성
  router.beforeEach((to, from, next) => {

    if (!to.path || to.path === '/' || to.path === '/home'  || to.path ==='/500') {
      next();
      return;
    }

    // 메뉴 없는 라우터
    if (to.meta.noMenu) {
      return next()
    }

    const userStore = useUserStore();
    const menuStore = useMenuStore();
    const menus = menuStore.getMenus();
    const errorStore = useErrorStore();
    const selectMenu = useSelectMenuStore();
    const menuAuth = useMenuAuthStore(); 
    
    // 라우터 동적생성 Start ~~~~~~~~~
    // 1. 최초 1회만 라우터 생성
    if ( !isRouteAdded ) {
      try {        
        // : store -> route 변환
        const routes = generateRoutesFromStore(menuStore.menuTree);

        routes.forEach(route => {
          router.addRoute(route);
        });
        //console.log('===== 동적 라우터 구조 확인 =====');
        //printRoutes(routes);
        router.addRoute({
          path: '/:pathMatch(.*)*',
          name: 'NotFound',
          component: () => import('@/views/error/NotFound.vue'),
          meta: { layout: DefaultLayout,
                  noMenu: true 
                }
        })

        isRouteAdded = true;

        // 재진입 필수 (중요)
        return next({ ...to, replace: true });

      } catch (e) {
        console.error("라우터 생성 실패", e);
        return next(from.fullPath || '/home');
      }
    }
    // 라우터 동적생성 End

    // 권한 체크는 여기서 
    //console.log("router - beforeEach :: to - " , to);  
    //console.log("router - beforeEach :: from - " , from);  
    
    //if (typeof location == "object") {
      let menuCode = to.meta.menuCode;
      let menuNo = to.meta.menuNo;
      
      // 상세 메뉴 : 이전 선택 메뉴의 권한 상속 
      if ( !menuCode || !menuNo ) {
        menuCode = selectMenu.getSelectMenuInfo.menuCode;
        menuNo = selectMenu.getSelectMenuInfo.menuNo;
      }
      //console.log("router - beforeEach :: menuCode - " , menuCode);  
      //console.log("router - beforeEach :: menuNo - " , menuNo);  

      // 권한 유무 체크 
      let rtnAuth = true;
      if ( !menuCode && !menuNo ) {
        rtnAuth = menuAuth.hasMenuAuth(menuCode, menuNo);
      }
      //console.log("router - beforeEach :: rtnAuth - " , rtnAuth);  

      if ( !rtnAuth) {
        let err =  { message : "해당 메뉴에 대한 권한이 없습니다. 관리자에게 문의하세요", status : 403};
        errorStore.handleError( err, router );
        next(from.fullPath || '/home');
        //next(false); // 이동 취소
      } else {
        next();
      }
     
    //}
    
  });

  // 메뉴 로그 기록
  let lastPath = null;
  let lastLogTime = 0;
  let logUrl = "";

  router.afterEach((to) => {
    //console.log('===== 전체 라우터 확인 (flat) =====');
    //printRoutes(router.getRoutes());
    
    // if (to.redirectedFrom) return;
    if (!to.path || to.path === '/404' || to.path === '/' || to.path === '/home' || to.path ==='/500' ) return;
    if (to.path === lastPath) return;
    // 현재 경로를 마지막 경로로 저장
    lastPath = to.path;

    // 선택된 메뉴 info 설정
    const menuStore = useMenuStore();
    const selectMenu = useSelectMenuStore();
    //console.log("router - afterEach :: to - " , to);      
    
    let menuCode = to.meta.menuCode;
    let menuNo = to.meta.menuNo;
    // 상세 메뉴인 경우 이전 선택 메뉴 정보
    if ( !menuCode || !menuNo ) {
      if ( selectMenu.getSelectMenuInfo ) {
        menuCode = selectMenu.getSelectMenuInfo.menuCode;
        menuNo = selectMenu.getSelectMenuInfo.menuNo;
      }
    }

    if (menuCode && menuNo) {
      const selectMenuInfo = menuStore.getMenuByCodeNo(menuCode, menuNo);
      //console.log("찾은 메뉴:", selectMenuInfo);
      if ( selectMenu.getSelectMenuInfo && menuCode === selectMenu.getSelectMenuInfo.menuCode && menuNo === selectMenu.getSelectMenuInfo.menuNo && selectMenuInfo.menuPath === selectMenu.getSelectMenuInfo.menuPath ) {
      } else {
        const resolvedIcon = menuStore.resolveMenuIcon(selectMenuInfo.menuNo);
        selectMenu.setSelectMenuInfo({ ...selectMenuInfo, menuImage: resolvedIcon });
        selectMenu.setMenuAnchorPath(selectMenuInfo.menuPath);
        if (to.meta.menuCode) selectMenu.setPortalBasePath(null); // 진짜 새 메뉴 진입 시만 초기화
      }
    } else {
      selectMenu.$reset();
      //selectMenu.$clear();
      //console.log("선택메뉴 클리어", selectMenu);
    }
    //console.log("router - afterEach 선택메뉴 :: ", selectMenu.getSelectMenuInfo);

    const now = Date.now()
    if (now - lastLogTime < 500) return;
    lastLogTime = now;
    
    //console.log("Log 남기기 - lastPath : ", lastPath, " menuCode :: ", to.meta.menuCode, " menuNo :: ", to.meta.menuNo);
    // log 는 MENU_LIST 등록된 메뉴만 ..
    let logMenuCode = to.meta.menuCode;
    let logMmenuNo = to.meta.menuNo;

    if ( !lastPath || !logMenuCode || !logMmenuNo ) return ;

    //if (typeof location == "object") {
      axios.defaults.withCredentials = true; // withCredentials 전역 설정
      logUrl = "/kopms-api/setLogMenu";

      let data = {
        menuUrl: lastPath,
        menuCode: logMenuCode,
        menuNo: logMmenuNo,
      };

      axios.post(logUrl, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(function (response) {
        //console.log("setLogMenu >>>> response :  ", response);
        let data = response.data;
      }).catch(function (error) {
        console.log("setLogMenu >>>> error :  ", error);
      })
    
    //}

  });

  return router;
}

const router = createRouter();
export default router;