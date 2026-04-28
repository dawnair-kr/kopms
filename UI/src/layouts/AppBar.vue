<template>
  <v-app-bar flat height="48">
    <v-app-bar-title>
      <v-img src="/koen.svg" max-height="28" alt="KOEN Logo" @click="loGoClick" style="cursor: pointer"/>
    </v-app-bar-title>

    <v-spacer/>

    <!-- 상단 메뉴 영역 -->
    <div>

      <template v-for="menu in menuTree" :key="menu.menuNo">

        <!-- 1레벨 (children 있음) -->
        <v-menu
          v-if="menu.children?.length"
          location="bottom"
          open-on-hover
          :open-delay="100"
          :close-delay="200"
          :close-on-content-click="false"
          min-width="200"
          transition="fade-transition"
        >

          <template #activator="{ props }">

            <!-- TOP MENU BUTTON -->
            <v-btn
              v-bind="props"
              variant="text"
              class="appbar-top-btn"
              :class="{ 'menu-active': isActive(menu) }"
              :ripple="false"
            >
              <!-- <v-icon v-if="menu.menuImage" start> {{ menu.menuImage }} </v-icon> -->
              {{ menu.menuName }}
              <!-- <v-icon end> mdi-menu-down </v-icon> -->
              <span v-if="isActive(menu)" class="menu-indicator"></span>
            </v-btn>

          </template>

          <!-- 2레벨 -->
          <v-list class="appbar-dropdown">

            <template v-for="child in menu.children" :key="child.menuNo">

              <!-- 2레벨 + 하위 존재 -->
              <v-menu
                v-if="child.children?.length"
                location="end top"
                open-on-hover
                :open-delay="100"
                :close-delay="200"
                :close-on-content-click="false"
                min-width="200"
                transition="fade-transition"
              >

                <template #activator="{ props }">

                  <v-list-item
                    v-bind="props"
                    class="appbar-sub-item"
                  >
                    <v-list-item-title>
                      {{ child.menuName }}
                    </v-list-item-title>

                    <template #append>
                      <v-icon size="16"> mdi-chevron-right </v-icon>
                    </template>

                  </v-list-item>

                </template>

                <!-- 3레벨 -->
                <v-list class="appbar-dropdown">

                  <v-list-item
                    v-for="sub in child.children"
                    :key="sub.menuNo"
                    class="appbar-sub-item"
                    :class="{ 'menu-active': isActive(sub) }"
                    @click="goMenu(sub)"
                  >
                    <v-list-item-title>
                      {{ sub.menuName }}
                    </v-list-item-title>
                  </v-list-item>

                </v-list>

              </v-menu>

              <!-- 2레벨 leaf -->
              <v-list-item
                v-else
                class="appbar-sub-item"
                :class="{ 'menu-active': isActive(child) }"
                @click="goMenu(child)"
              >
                <v-list-item-title>
                  {{ child.menuName }}
                </v-list-item-title>
              </v-list-item>

            </template>

          </v-list>

        </v-menu>

        <!-- 1레벨 leaf -->
        <v-btn
          v-else
          variant="text"
          class="appbar-top-btn"
          :class="{ 'menu-active': isActive(menu) }"
          @click="goMenu(menu)"
        >
          <!-- <v-icon v-if="menu.menuImage" start> {{ menu.menuImage }} </v-icon> -->
          {{ menu.menuName }}
          <span v-if="isActive(menu)" class="menu-indicator"></span>
        </v-btn>

      </template>

    </div>

    <v-spacer/>

    <!-- 구동환경, 사용자 액션 기능 -->
    <template v-slot:append>

      <!-- 구동환경 -->
      <span v-if="nodeEnv != 'production'" class="mx-2 text-h6 font-weight-bold text-red">
        [환경 : {{ shortEnv }}]
      </span>

      <div class="d-flex ga-2">
        <span>{{ today }}</span>
        <span>{{ time }}</span>
      </div>

      <div class="d-flex mx-2" style="opacity: 0.75;">

        <v-btn variant="text" size="36">
          <v-icon icon="mdi-account-edit" size="24"/>
          <v-tooltip activator="parent" location="bottom">
            정보 수정
          </v-tooltip>
        </v-btn>

        <v-btn variant="text" size="36">
          <v-icon icon="mdi-cog-outline" size="24"/>
          <v-tooltip activator="parent" location="bottom">
            설정
          </v-tooltip>
        </v-btn>

        <!--
        <v-btn variant="text" size="36" @click="logoutHandler">
          <v-icon icon="mdi-logout" size="24"/>
          <v-tooltip activator="parent" location="bottom">
            로그아웃
          </v-tooltip>
        </v-btn>
        -->

      </div>

      <!-- 사용자 액션 기능 -->
      <!--
      <div class="d-flex flex-column align-start ga-1 pr-4">
        <div class="d-flex align-center text-caption">
          <span class="font-weight-bold text-grey-darken-3">
            <v-icon icon="mdi-account-outline" size="small" class="mr-1" />
              {{ userStore.getUserInfo().name }}
          </span>
          <span class="text-grey-darken-1">님 안녕하세요</span>
        </div>
        <div class="d-flex rounded overflow-hidden border">
          <div class="bg-blue-darken-1 px-3 py-1 d-flex align-center ga-4">
            <span class="text-white text-caption font-weight-bold">개발업무</span>
            <span class="text-white font-weight-black">0</span>
          </div>
          <div class="bg-teal-accent-4 px-3 py-1 d-flex align-center ga-4">
            <span class="text-white text-caption font-weight-bold">운영업무</span>
            <span class="text-white font-weight-black">0</span>
          </div>
        </div>
      </div>
      -->

    </template>

  </v-app-bar>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router';
import { mapActions, mapState } from 'pinia';
import { storeToRefs } from 'pinia';

import dayjs from 'dayjs';

const today = ref(dayjs().format('YYYY-MM-DD'));
const time = ref(dayjs().format('HH:mm:ss'));

let timer = null

onMounted(() => {
  timer = setInterval(() => {
    const now = dayjs();
    time.value = now.format('HH:mm:ss');
    
    // 자정이 넘었을 때를 대비해 날짜도 매초(혹은 매분) 같이 갱신
    today.value = now.format('YYYY-MM-DD'); 
  }, 1000)
})

onUnmounted(() => {
  // 컴포넌트가 사라질 때 타이머를 해제해서 메모리 누수를 방지합니다.
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<script>

import { useRouter } from 'vue-router';

// 스토어 임포트
import { useMenuStore } from '@/store/menu.js';
import { useUserStore } from '@/store/user.js';
import { useSelectMenuStore } from '@/store/selectMenuStore.js';
// import { useCompanyStore } from '@/store/company.js';

export default {
  
  props: {
    businessId: {
      type: String,
    },
  },
  components: {

  },
  watch: {
    // route 감지 : Active Menu
    $route() {
      this.syncMenuWithRoute();
    },
    // 메뉴 트리 로드 완료 감지 : 초기 로드 시 menuAnchorPath 세팅
    menuTree(newVal) {
      if (newVal?.length) {
        this.syncMenuWithRoute();
      }
    },
  },

  computed: {
    // store를 여기에 등록하여 'this' 가시성 확보
    // 메뉴 구성    
    menuStore() {
      return useMenuStore();
    },
    // 로그인 사용자 정보
    userStore() {
      return useUserStore();
    },
    // 선택메뉴 정보
    selectMenuStore() {
      return useSelectMenuStore(); 
    },
    // 02.19 메뉴 트리 구성
    menuTree() {
      return this.menuStore.menuTree; 
    },
    
    // 구동환경
    shortEnv() {
      return this.nodeEnv?.slice(0, 3) || ''
    }
  },

  mounted() {
    this.$log.debug("AppBar.vue ::"," mounted~~~~~");
    this.nodeEnv = import.meta.env.MODE;

    this.currentRoute = this.$route;
    this.syncMenuWithRoute();

    // console.log("AppBar.vue :: menuStore ", this.menuTree);
    // this.$log.debug("AppBar.vue :: userStore ~~~", this.menuTree);
    // this.$log.debug("AppBar.vue :: userStore ~~~", this.userStore);
    // this.$log.debug("AppBar.vue :: userStore.name ~~~", this.userStore.memberInfo.name);
    //this.$log.debug('AppBar.vue ::userStore full:', this.userStore.$state);
    //this.$log.debug("AppBar.vue :: userStore.getUserInfo ~~~", this.userStore.getUserInfo().name); 
    
    // 새로고침 시 route 기준 자동 active 세팅
    this.syncMenuWithRoute();
  },
  
  methods: {
    // 하기 테스트 용도로 잠시 주석 ~~~~~ Start
    // ...mapActions(useUserStore, ['$clear']),
    // ...mapActions(useMenuStore, ['$clear']),
    // ...mapActions(useCompanyStore, ['$clear']),
    // 하기 테스트 용도로 잠시 주석 ~~~~~ End

    loGoClick() {
      //this.$log.debug("AppBar.vue :: loGoClick ~~~", this.userStore);
      this.selectMenuStore.$reset();
      //this.selectMenuStore.$clear();
      if (this.userStore) {
        this.$router.push('/home')  // 로그인 O
      } else {
        this.$router.push('/')      // 로그인 X
      }
      
    },

    // 메뉴 이동
    async goMenu (menu) {
      this.$log.debug("AppBar.vue :: goMenu ~~~", menu);
      if (!menu.menuUrl || !menu.component) return;     
      this.$router.push({ path: menu.menuUrl });

    },

    // goMenu_old (menu) {
    //   this.$log.debug("AppBar.vue :: goMenu ~~~", menu);
    //   if ( menu.menuUrl && menu.menuUrl.length ) {
    //     this.$router.push({ path: menu.menuUrl });
    //   }
      
    // },

    // active menu 판별 함수
    isActive(menu) {
      if (!menu) return false
      const currentPath = this.$route.path
      const currentMenuCode = this.$route.query.menuNo
      if (menu.menuUrl && currentPath.startsWith(menu.menuUrl)) {
        // menuNo가 URL에 있으면 정확히 일치하는 메뉴만 active
        if (currentMenuCode) {
          return menu.menuNo === currentMenuCode
        }
        return true
      }
      if (menu.children?.length) {
        return menu.children.some(child => this.isActive(child))
      }
      return false
    },

    syncMenuWithRoute() {
      const currentPath = this.$route.path;
      const currentMenuCode = this.$route.query.menuNo;
      const findMenu = (menus) => {
        for (const menu of menus) {
          if (menu.menuUrl && currentPath.startsWith(menu.menuUrl)) {
            // menuNo가 있으면 정확히 일치하는 메뉴만 반환
            if (!currentMenuCode || menu.menuNo === currentMenuCode) {
              return menu;
            }
          }
          if (menu.children?.length) {
            const found = findMenu(menu.children);
            if (found) return found;
          }
        }
        return null;
      };

      // 26.04.09 하기 주석
      // const matched = findMenu(this.menuTree);      
      // if (matched) {
      //   this.selectMenuStore.setSelectMenuInfo(matched);
      //   this.selectMenuStore.setMenuAnchorPath(matched.menuPath);
      // }
    },

    async logoutHandler() {
      
      this.$log.debug("AppBar.vue ::"," logoutHandler~~~~~");
      this.$router.push("/");

      // this.$log.debug("AppBar.vue - test ::",his.userStore.getUserInfo() );
      
      return;

      await this.$br_trans([
        {
          url: "/logout",
          method: "post",
        }
      ], (url, code, msg, data) => {

        // console.log(url, code, msg, data);

        if (code == 0) {
        }
        else {
          this.$dialog.error({
            title: "사용자 오류",
            text: msg
          });
        }
        // this.userStore.$reset()
        // this.setUserInfo({
        //   authenticated: false,
        // });
        const userStore = useUserStore();
        const menuStore = useMenuStore();
        const companyStore = useCompanyStore();
        userStore.$clear();
        menuStore.$clear();
        companyStore.$clear();

        this.$router.push("/");
        return;
      });
    },

    changeLocale(locale) {

      let postData = {
        locale: locale
      };
      this.$br_trans([
        {
          url: "/changeLocale",
          method: "post",
          data: postData,
        }
      ], (url, code, msg, data) => {
        // this.$vuetify.locale.current = locale;
      });
    },
    getLocales() {
      return [
        {
          value: 'ko',
          title: this.$t('common.locale.ko'),
          image: '/images/flags/16/s/South Korea.png'
        },
        {
          value: 'en',
          title: this.$t('common.locale.en'),
          image: '/images/flags/16/u/United States of America.png'
        },
      ];
    },
    
  },

  data() {

    return {
      nodeEnv: "development",
      userName: "",
      currentRoute: null,
    }
  }

}
</script>
