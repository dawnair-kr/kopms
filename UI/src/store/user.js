// Utilities
import { defineStore } from 'pinia';

export const useUserStore = defineStore('userInfo', {
  state: () => ({
    memberInfo: null,
    // 초기 로드시 localStorage에 값이 있으면 가져오고, 없으면 null
    empno: localStorage.getItem('empno') || null
  }),
  /*  */
  getters: {
    getUserInfo: (state) => {
      return () => {
        return state.memberInfo;
      };
    },
    
    isAuthenticated: (state) => {
      return () => {
        return state.memberInfo.authenticated;
      };
    }, 
  },

  actions: {
    setUserInfo(member) {
      //console.log("setUserInfo ~~~~~ ", member);
      this.memberInfo = member;

      // 다중 탭 감지를 위해 localStorage에 반드시 저장
      localStorage.setItem('empno', member.empno);
    },
    // setLocale(locale) {
    //   this.memberInfo.locale = locale;
    // },
    $reset() {
      this.memberInfo = {
        authenticated: false,
      }

      // 저장소 데이터 삭제
      localStorage.removeItem('empno');
    },
    $clear() {
      this.memberInfo = null;
    }
  },

  persist: true,      // localStorage 저장유무
  // persist: false,      // 테스트 용도임 추후 변경요함  26.01.26
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