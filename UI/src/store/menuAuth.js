// Utilities
import { defineStore } from 'pinia';

export const useMenuAuthStore = defineStore('menuAuth', {
  state: () => ({
    menuAuth: [],
  }),
  /*  */
  getters: {
    // 전체 반환
    getMenuAuth: (state) => state.menuAuth,

    // menuNo 기준 체크
    hasMenuNo: (state) => (menuNo) => {
      return state.menuAuth.some(item => item.menuNo === menuNo)
    },

    // menuCode 기준 체크
    hasMenuCode: (state) => (menuCode) => {
      return state.menuAuth.some(item => item.menuCode === menuCode)
    },

    // menuNo + menuCode  체크
    hasMenuAuth: (state) => (menuCode, menuNo) => {
      return state.menuAuth.some(
        item => item.menuCode === menuCode && item.menuNo === menuNo
      )
    }
  },

  actions: {
    // 전체 세팅
    setMenuAuthInfo(menuAuth) {      
      this.menuAuth = menuAuth || [];
    },
    // 초기화
    $clear() {
      this.menuAuth = [];
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