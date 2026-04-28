<template>
  <v-app full-height style="background-color: #F6F8FB;">
    <v-layout class="kopms-menubar">

      <default-bar />

      <!-- <v-navigation-drawer v-model="drawer"
        width="280"
        permanent
        class="left-menu-bar mr-0"
        :rail="isRail"
        :rail-width="80"
      >
        <div class="pa-2 d-flex align-center">
          <v-btn variant="text" icon="mdi-menu" @click.stop="isRail = !isRail" />

          <div class="d-flex align-center user-info">
            <v-avatar color="blue-lighten-4" size="40" class="ml-2 flex-shrink-0">
              <v-icon icon="mdi-account" color="blue-darken-2"></v-icon>
            </v-avatar>

            <div class="ml-3 d-flex flex-column" style="line-height: 1.2">
              <span class="text-subtitle-2 font-weight-bold text-grey-darken-4 text-no-wrap">
                {{ userStore.getUserInfo().name }}
              </span>
              <span class="text-caption text-grey-darken-1 text-no-wrap">
                {{ userStore.getUserInfo().deptName }}
              </span>
            </div>
          </div>
        </div>
        
        <v-list
          nav
          v-if="menuStore.menuTree.length > 0"
          density="compact"
          v-model:opened="menuOpen"
          open-strategy="multiple"
          mandatory
        >
          <v-list-item
            v-for="menu in menuStore.menuTree" 
            v-if="isRail"
            :value="menu.value"
            mandatory
          >
            <template v-slot:prepend>
              <v-icon :icon="menu.menuImage" style="padding: 2px 0 0 10px;" @click.stop="isRail = !isRail"/>
            </template>
            <v-tooltip activator="parent" location="right">{{ menu.menuName }}</v-tooltip>
          </v-list-item>
          
          <NaviMenuItem
            v-else
            v-for="menu in menuStore.menuTree" 
            :key="menu.menuNo" 
            :menu="menu"
            @click-item="onMenuClick"
          />
          </v-list>
        
      </v-navigation-drawer>  -->

      <default-view />

    </v-layout>
  </v-app>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue';

let drawer = ref(true);
const naviDrawer = ref(null);

const isRail = ref(false);

</script>

<script>
import { ref, reactive } from 'vue';
import DefaultBar from './AppBar.vue';
import DefaultView from './View.vue';

import { useUserStore } from '@/store/user.js';
import { useMenuStore } from '@/store/menu.js';
import { useSelectMenuStore } from '@/store/selectMenuStore.js';
import { useCompanyStore } from '@/store/company.js';

import NaviMenuItem from '@/components/NaviMenuItem.vue';

export default {
  setup() {
  },
  props: {
  },
  components: {
    // NaviMenuItem,
  },
  created() {

    
  },
  beforeMount() {

  },
  watch: {
    
  },

  computed: {

    // // store를 여기에 등록하여 'this' 가시성 확보
    // // 로그인 사용자 정보
    // userStore() {
    //   return useUserStore();
    // },
    // // 메뉴 구성    
    // menuStore() {
    //   return useMenuStore();
    // },
    // // 3Depth를 위한 트리 데이터 가공된 Getter 연결
    // menuTree() {
    //   return this.menuStore.menuTree; 
    // },
    // // 선택메뉴 정보
    // selectMenuStore() {
    //   return useSelectMenuStore(); 
    // },    

 
  },

  mounted() {

    // this.$log.debug("DefaultLayout.vue :: mounted ~~~");

    //this.$log.debug("DefaultLayout.vue :: userStore ~~~", this.userStore);
    //this.$log.debug("DefaultLayout.vue :: userStore.name ~~~", this.userStore.name);
    // this.$log.debug("DefaultLayout.vue ::", this.menuTree );
    
    // this.menuOpen = [];
    // const userStore = useUserStore();
    // const companyStore = useCompanyStore();

    // if (userStore.getUserInfo() && userStore.isAuthenticated()) {
    //   this.isLogin = userStore.isAuthenticated();
    //   this.userName = userStore.getUserNameTypeKo();
    //   this.companyName = userStore.getCompanyName();
    //   if (companyStore.getCompanyInfo()) {
    //     this.companyAvatar = companyStore.getCompanyInfo().imgLogo;
    //   }
    // }

    // const menuStore = useMenuStore();
    // this.selectedMenuId = this.$router.currentRoute.value.fullPath;
    // if (!menuStore.getMenus()) return
    // if (menuStore.getMenus().length == 0) return;

    // let index = menuStore.getMenus().findIndex((menu, index, array) => {
    //   return menu.url == this.selectedMenuId;
    // });
    // if (index < 0) {
    //   index = menuStore.getMenus().findIndex((menu, index, array) => {
    //     return menu.appendUrl == this.selectedMenuId;
    //   });
    // }

    // if (index < 0) return;
    // this.selectedMenu[0] = menuStore.getMenus()[index].menuId;
  },

  data() {
    
    return {
      // selectedMenu: [0],
      // selectedMenuId: "",
      // isLogin: false,
      // companyAvatar: null,
      // userName: null,
      // companyName: null,
      // menuOpen: ["ALLOPEN"]
    };
  },

  methods: {

    
  },  
}

</script>

<style lang="scss">
// Left 메뉴 layout 변경
.kopms-menubar {

  .user-info {
    overflow: hidden;
  }

  .left-menu-bar.v-navigation-drawer {

    border: none;

    background-color: #F6F8FB;

    .v-navigation-drawer__content {

      margin: 8px;
      background: #E3F0FF;
      border-radius: 8px;

      // x축 y축 흐림범위 색상 및 투명도
      box-shadow: 0 4px 15px -2px rgba(0, 0, 0, 0.1),
                  0 2px 6px -1px rgba(0, 0, 0, 0.06);
    }

    .v-list {

      .v-list-group__header .v-list-item-title {
        font-weight: 600 !important;
        font-size: 0.95rem !important;
        color: #0d396b !important;
      }

      // 3. 하위 메뉴 스타일 (2뎁스, 3뎁스)
      .v-list-item-title {
        font-weight: 500 !important;
        font-size: 0.875rem !important;
        color: #37474f;
      }

      .v-list-item {
        border-radius: 8px;
        opacity: 1 !important;
        --v-theme-overlay-multiplier: 0;

        &:hover {
          background-color: #BBDDF2 !important;
          
          .v-list-item-title {
            color: #0d396b !important;
            font-weight: 600 !important;
          }
        }

        // 이미 선택된(Active) 아이템은 호버 시에도 색상이 유지되도록 예외 처리
        &.v-list-item--active:hover {

          background-color: #0d396b !important;
          --v-theme-overlay-multiplier: 0.5;

          .v-list-item-title {
            color: #FFFFFF !important;
          }
        }
      }

      .v-list-group {
        --prepend-width: 0px !important;

        .v-list-group {
          .v-list-group__items {
            .v-list-item {
              padding-inline-start: 32px !important;
              margin: 0px 16px 4px !important;
            }
          }
        }
      }

      // 공통: 모든 그룹이 열렸을 때의 기본 스타일
      .v-list-group--open {

        // 1. [1뎁스 그룹]이 열렸을 때
        // background-color: #DCE6F9 !important;
        color: #0d396b;
        padding-bottom: 3px;

        // 2. [2뎁스 그룹]이 열렸을 때, 1뎁스 오픈 박스 안에 또 오픈된 그룹이 있는 경우입니다.
        .v-list-group--open {
          // background-color: #C6D8F4 !important;
          margin: 4px 8px !important;
          color: #0d396b;
          padding-bottom: 3px;

          // 3뎁스 아이템들
          .v-list-item {
            margin: 0px !important;
          }

          .v-list-group__items {

            .v-list-item {
              padding-inline-start: 32px !important;
              margin: 4px 8px !important;
            }
          }
        }
      }
      
      // 그룹 내부 아이템들의 컨테이너
      .v-list-group__items {
        color: #2C3E50;
        // 2뎁스 아이템(사업현황 등) 스타일
        .v-list-item {
          margin: 4px 8px !important;
        }
      }

      .v-icon {
        --v-medium-emphasis-opacity: 1;
        color: #0d396b !important;
      }

      // Active 스타일 (선택된 메뉴)
      .v-list-item--active {

        .v-list-item-title {
          font-weight: 700 !important;
          color: #ffffff !important;
        }

        background-color: #0d396b !important;
        color: #FFFFFF !important;
        
        .v-list-item__prepend .v-icon {
          opacity: 1;
        }
      }
      
    }
  }
}
</style>
