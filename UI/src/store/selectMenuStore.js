// Utilities
import { defineStore } from 'pinia';

export const useSelectMenuStore = defineStore('selectMenuInfo', {
  state: () => ({
    selectMenuInfo: null,

    // AppBar가 DB 메뉴 트리에서 현재 route와 매칭된 메뉴를 찾을 때만 세팅.
    // DB에 없는 페이지(BizPortal, task form 등)가 breadcrumb를 갱신해도 이 값은 유지됨.
    // BizPortal이 자신의 basePath를 계산할 때 이 값을 기준점으로 사용.
    menuAnchorPath: null,

    // BizPortal이 onMounted에서 계산하여 세팅 (`${menuAnchorPath} > 사업진행포털`).
    // 하위 task form(S10~S50, D10~D70)들이 각자의 breadcrumb를 만들 때 이 값을 prefix로 사용.
    // task form이 직접 계산하지 않고 이 값을 읽음으로써 경로 누적 버그를 방지.
    portalBasePath: null,

    // breadcrumb에서 강조할 세그먼트 텍스트 (예: 사업명)
    // null이면 강조 없음
    highlightSegment: null,
  }),
  getters: {
    getSelectMenuInfo: (state) => state.selectMenuInfo,
  },

  actions: {
    setSelectMenuInfo(menuInfo) {
      // console.log('===== setMenuInfo :: menuInfo =====', menuInfo);
      // 원본 객체의 주소값을 복사하는 것이 아니라, 
      // 내부의 값들만 쏙 뽑아서 "새 객체"를 만들어 할당
      //this.selectMenuInfo = { ...menuInfo };
      // 04.09 : child 구조까지 복사되는 경우 방지 ... 필요한 요소만 
      const { menuCode, menuNo, menuUrl, menuName, menuPath, menuCodeNo, menuImage } = menuInfo;
      this.selectMenuInfo = { menuCode, menuNo, menuUrl, menuName, menuPath, menuCodeNo, menuImage }
    },
    setMenuAnchorPath(path) {
      this.menuAnchorPath = path;
    },
    setPortalBasePath(path) {
      this.portalBasePath = path;
    },
    setMenuName(menuName) {
      if (!this.selectMenuInfo) {
        console.warn('selectMenuInfo is null');
        return;
      }
      this.selectMenuInfo.menuName = menuName;
    },
    setMenuPath(menuPath) {
      if (!this.selectMenuInfo) {
        console.warn('selectMenuInfo is null');
        return;
      }
      this.selectMenuInfo.menuPath = menuPath;
    },
    setMenuIcon(menuImage) {
      if (!this.selectMenuInfo) return;
      this.selectMenuInfo.menuImage = menuImage;
    },
    setHighlightSegment(text) {
      this.highlightSegment = text ?? null;
    },
    $clear() {
      this.selectMenuInfo = null;
    }
  },
  persist: true,
  // persist: {
  //   enabled: true, //storage 저장유무
  //   strategies: [
  //     {
  //       key: 'selectMenuInfo', //storage key값 설정
  //       // storage: sessionStorage, // localStorage, sessionStorage storage 선택 default sessionStorage
  //     },
  //   ],
  // },

});