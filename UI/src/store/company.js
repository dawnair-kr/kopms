// Utilities
import { defineStore } from 'pinia';

export const useCompanyStore = defineStore('companyInfo', {
  state: () => ({
    companyInfo: null,
  }),
  /*  */
  getters: {
    getCompanyInfo: (state) => {
      return () => {
        return state.companyInfo;
      };
    },
  },

  actions: {
    setCompanyInfo(companyInfo) {
      
      this.companyInfo = companyInfo;
    },
    $clear() {
      this.companyInfo = null;
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