<template no-gutters>
  <v-row v-if="isVisible==false" no-gutters class="login_area" align="center" justify="center" style="height: calc(100vh - 0px);">
    <v-col align="left" align-self="center" style="height:100%;">
      <v-row no-gutters align="center" justfy="center" style="height:100%;">
        <v-col align="center" align-self="center">
          <v-row no-gutters align="center" justfy="center" class="mb-5">
            <v-col align="center" align-self="center">
              <span class="text-h2 font-weight-bold"> KOPMS </span>              
            </v-col>
          </v-row>
          <v-row no-gutters align="center" justfy="center" style="width: 450px">
            <v-col align="center">
              <v-card borderd color="white" rounded="md" class="mx-auto pa-5">
                <template v-slot:text>
                  <v-row justify="center">
                    <v-col>
                      <span class="text-h4 font-weight-bold">
                        로그인
                      </span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters justify="center" class="mt-10">
                    <v-col align="left">
                      <span class="text-h7 mr-4">
                        사번
                      </span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters justify="center" class="mt-2">
                    <v-col>
                      <!-- <v-text-field v-model="inputData.empno" v-on:keydown.enter="loginHandler()" variant="outlined" ref="email" type="text" rounded="md" hide-details density="compact" -->
                      <v-text-field v-model="inputData.ssoToken" v-on:keydown.enter="loginHandler()" variant="outlined" ref="email" type="text" rounded="md" hide-details density="compact"
                        label="사번을 입력하세요" prepend-inner-icon="mdi-email-outline">
                          <template v-slot:append-inner>
                            <v-icon v-if="inputData.empno" tabindex="-1" @click="inputData.empno=''" icon="mdi-close-circle"/>
                          </template>
                      </v-text-field>
                    </v-col>
                  </v-row>

                  <v-row no-gutters justify="center" class="mt-10">
                    <v-col align="center">
                      <v-btn class="login_bu text-subtitle-1" color="#5874c8" flat rounded="md" size="large" append-icon="" @click="loginHandler">로그인</v-btn>
                    </v-col>
                  </v-row>
                </template>
              </v-card>
            </v-col>
          </v-row>
          
        </v-col>
      </v-row>
    </v-col>    
  </v-row>
  
  <v-row v-if="isVisible" no-gutters class="login_area" align="center" justify="center" style="height: 100vh;">
    <v-col cols="12" class="d-flex justify-center">
      <v-img max-width="400" contain src="/koen.svg"></v-img>
    </v-col>
  </v-row>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n';     // 다국어 : 추후 제거
import { useLocale } from 'vuetify'
import { useRouter, useRoute } from 'vue-router'
import { getApiBaseUrl } from '@/util/util.js';
import axios from 'axios';

const router = useRouter()
const route = useRoute()

const { current } = useLocale()
const t = useI18n();

const setLocale = (locale) => {
  t.locale.value = locale;
  current.value = locale;
}

const getLocale = () => {
  return t.locale.value;
}

onMounted(() => {
  
})

</script>

<script>

import crypto from "@/plugins/crypto.js";
import { useUserStore } from '@/store/user.js';
import { useMenuStore } from '@/store/menu.js';
import { useSelectMenuStore } from '@/store/selectMenuStore.js';
import { useMenuAuthStore } from '@/store/menuAuth.js';    // 26.04.02 Add
import { mapActions, mapState } from 'pinia';
import { isValidEmail, isValidPassword } from '@/util/Validator.js';
import { useAppStore } from "@/store/app.js";

const appStore = useAppStore();
const userStore = useUserStore();
const authStore = useMenuAuthStore();   // 26.04.02 Add

export default {

  async beforeMount() {
    // this.getUserSession();
  },

  data() {

    return {
      nodeEnv: "development",
      isLogin: true,
      loginType: '',
      inputData: {
        type: '',           // 'SSO' or ''
        //ssoToken:'DEV00001'         // 사용유무 추후 결정 ssoToken or empno 
        ssoToken:'DEV00007'         // 사용유무 추후 결정 ssoToken or empno 
      },
      isVisible: true,
    };
  },

  computed: {

  },

  mounted() {
    //console.log("Login mounted ~~~~~");
    this.nodeEnv = import.meta.env.MODE;
    console.log("Login mounted ~~~~~ this.nodeEnv : " , this.nodeEnv);
    
    // 1 — Query String 사용
    // http://localhost:5173/?ssoToken=DEV00006
    // http://localhost:5173/?ssoToken=ABC123%2B%2F%3DXYZ%3D%3D
    const params = new URLSearchParams(window.location.search);
    const ssoToken = params.get('ssoToken');
    console.log("Login mounted ~~~~~ssoToken : " , ssoToken);

    // 2 — Hash 사용
    // http://localhost:5173/#ssoToken=DEV00006
    // const params = new URLSearchParams(window.location.hash.substring(1));
    // const ssoToken = params.get('ssoToken');
    // console.log("Login mounted ~~~~~ssoToken : " , ssoToken);
    if ( ssoToken ) {      
      this.inputData.loginType = "SSO";
      this.inputData.ssoToken = ssoToken;
      
      this.isVisible = true;
      
      this.loginHandler();
    } else {
      this.isVisible = false;

      console.log("import.meta.env.VITE_POTAL_URL :: ", import.meta.env.VITE_POTAL_URL);
      // 포털로 이동
      const potalUrl = import.meta.env.VITE_POTAL_URL;      
      
      if ( this.nodeEnv == "development") {        
        //window.location.replace(potalUrl);
        //window.location.href = "https://naver.com";
        //window.location.replace("https://naver.com");
      } else if ( this.nodeEnv == "test") {
        //window.location.replace(potalUrl)
      } else {
        window.location.replace(potalUrl);
      } 

    }

  },

  methods: {
    ...mapActions(useUserStore, ['setUserInfo']),
    ...mapActions(useMenuStore, ['setMenuInfo']),
    ...mapActions(useSelectMenuStore, ['setSelectMenuInfo']),
    ...mapActions(useMenuAuthStore, ['setMenuAuthInfo']),     // 26.04.02 Add

    loginHandler() {
      console.log("loginHandler ~~~~~");
      // localStorage 제거
      // localStorage.clear();
      localStorage.removeItem('SSO_TOKEN');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('menuInfo');
      localStorage.removeItem('selectMenuInfo');
      localStorage.removeItem('menuAuth');

      // Store clear
      const userStore = useUserStore();
      const menuStore = useMenuStore();
      const selectMenuStore = useSelectMenuStore();
      const menuAuthStore = useMenuAuthStore();
      userStore.$clear();
      menuStore.$clear();
      selectMenuStore.$clear();
      menuAuthStore.$clear();
      
      if (!this.inputData.ssoToken || this.inputData.ssoToken.length == 0) {
        this.$dialog.error({
          title: "로그인 정보 오류",
          text: "사번을 입력하세요"
        });
        this.$refs.password.focus();
        return;
      }

      localStorage.setItem("SSO_TOKEN", this.inputData.ssoToken);

      let loginType =  this.inputData.loginType;
      let ssoToken =  this.inputData.ssoToken;
      let loginData = {
            loginType: loginType,
            ssoToken: ssoToken
          };
      
      this.$log.info("loginData ~~~", loginData);
      // 로그인 : 
      this.$br_trans([
        {
          url: "/kopms-api/ssoLogin",
          method: "post",
          data: loginData,
        }
      ], (url, code, msg, data) => {

        if (code == 0) {          
          // this.$log.info(url, code, msg, data);

          this.setUserInfo(data.memberInfo);
          this.setMenuInfo(data.menus);
          this.setMenuAuthInfo(data.menuAuth);  // 26.04.02 Add
          
          // 로그인 이후 화면 이동
          this.$router.push("/home");
          return;
        
        } else {
          let title = "로그인 오류";
          this.$log.info(url, code, msg, data);
          if (data.status && data.status !== 0) {
            
            this.$dialog.error({
              title: title,
              text: data.detail,
              persistent: true
            }).then(res => {
              if (data.status == 201) {
                this.$refs.email.focus();
              }
              else if (data.status == 202) {
                // this.$refs.password.focus();
              }
              else if (data.status == 203) {
                //this.$router.push("/companyinitpassword");
              }
              else if (data.status == 204) {
                //this.$router.push("/changePassword");
              }
            });

            return;
          
          }
        }        
        
      });
      
      return;
    },
    
    setFocusPassword() {
      //if (!this.inputData.email || this.inputData.email.length == 0) {
      if (!this.inputData.empno || this.inputData.empno.length == 0) {
        return;
      }

      this.$refs.password.focus();
    },
    
  },
}

</script>
<style lang="scss">
.login-right {
  height: 100%;
  background: linear-gradient(90deg, #1d225b, #19227b);
}
</style>