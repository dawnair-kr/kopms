// Utilities
import { defineStore } from 'pinia';
//import router from '@/router';
//import { generateRoutesFromStore } from '@/util/routeGenerator'

export const useMenuStore = defineStore('menuInfo', {
  state: () => ({
    menuInfo: [],
  //  isRouteAdded: false,   // 동적 라우터 생성을 위해 추가
  }),
  /*  */
  getters: {
    getMenus: (state) => {
      return () => {
        return state.menuInfo || [];
      };
    },

    // URL을 인자로 받아 메뉴 정보를 찾는 함수형 Getter : 26.04.02
    getMenuByUrl: (state) => (url) => {
      const menu = state.menuInfo.find(m => m.menuUrl === url);
      return menu ? { menuCode: menu.menuCode, menuNo: menu.menuNo } : null;
    },

    // menuCode + menuNo  체크
    getMenuByCodeNo: (state) => (menuCode, menuNo) => {
      if (!Array.isArray(state.menuInfo)) return []; // null 체크 및 배열 확인

      if (!state.menuInfo) return [];
      return state.menuInfo.find(item => item.menuCode === menuCode && item.menuNo === menuNo );

    },

    mainMenus: (state) => {
      if (!state.menuInfo) return [];
      return state.menuInfo.filter(item => item.level === 1 );
    },

    // 만약 상황에 따라 특정 레벨을 골라내고 싶다면 (인자 전달 방식)
    getMenusByLevel: (state) => {
      return (levels) => {
        if (!state.menuInfo) return [];
        // levels는 [0, 1] 처럼 배열로 받을 수 있습니다.
        return state.menuInfo.filter(item => levels.includes(item.level));
      };
    },

    // menuNo를 받아 본인 또는 상위 Level 1 메뉴의 menuImage를 반환
    resolveMenuIcon: (state) => (menuNo) => {
      const flat = state.menuInfo;
      let current = flat.find(m => m.menuNo === menuNo);
      while (current) {
        if (current.menuImage) return current.menuImage;
        if (!current.upMenuNo) return null;
        current = flat.find(m => m.menuNo === current.upMenuNo);
      }
      return null;
    },

    // 메뉴 트리 구조 변환
    menuTree: (state) => {
      const list = state.menuInfo;
      const tree = [];
      const lookup = {};

      if (!list) return [];

      // 1. 모든 항목을 lookup 객체에 담기
      list.forEach(item => {
        lookup[item.menuNo] = { ...item, children: [] };
      });

      // 2. 부모-자식 연결
      list.forEach(item => {
        if (item.upMenuNo && lookup[item.upMenuNo]) {
          lookup[item.upMenuNo].children.push(lookup[item.menuNo]);
        } else {
          // 부모가 없으면 최상위(Root) 메뉴
          tree.push(lookup[item.menuNo]);
        }
      });

      return tree;
    }
   
  },

  actions: {
    setMenuInfo(menus) {      
      this.menuInfo = menus;
      //isRouteAdded: false;   // 동적 라우터 생성을 위해 추가
    },
    // 동적 라우터 생성
    // async initRoutes(menuTree) {      
    //   if (this.isRouteAdded) return;
      
    //   const routes = generateRoutesFromStore(menuTree);
    //   //console.log('===== 생성된 routes (addRoute 전) =====');
    //   //routes.forEach(r => console.log(r));

    //   routes.forEach(route => {
    //     router.addRoute(route);
    //   });

    //   // addRoute 이후 전체 확인
    //   //console.log('===== router.getRoutes() =====');
    //   //console.log(router.getRoutes());
    //   //routes.forEach(r => console.log(r));

    //   router.addRoute({
    //     path: '/:pathMatch(.*)*',
    //     name: 'NotFound',
    //     component: () => import('@/views/error/NotFound.vue'),
    //     meta: { noMenu: true }
    //   });

    //   this.isRouteAdded = true;
    // },

    $clear() {
      //this.menuInfo = null;
      this.menuInfo = [];
      //this.isRouteAdded = false; // 같이 초기화
    }
  },
  persist: true,
  // persist: {
  //   enabled: true, //storage 저장유무
  //   strategies: [
  //     {
  //       key: 'userInfo', //storage key값 설정
  //       // storage: sessionStorage, // localStorage, sessionStorage storage 선택 default sessionStorage
  //     },
  //   ],
  // },

});