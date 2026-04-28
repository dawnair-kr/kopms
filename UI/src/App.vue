<template>
  
  <component :is="$route.meta.layout || 'div'">
    <router-view></router-view>
  </component>

</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, getCurrentInstance } from 'vue'   // 26.02.03 - 1
import { useErrorStore } from '@/store/errorStore.js'

// Pinia store : 26.02.03 - 2
const errorStore = useErrorStore();

// 전역 plugin 접근 (this.$dialog 대체) : 26.02.03 - 3
const { proxy } = getCurrentInstance();

// 탭 간 사용자 변경 감지 핸들러 : 26.03.04 - 동일 브라우저에서 탭 간 서로 다른 사용자 로그인 시
const handleStorageChange = (event) => {
 // console.log("App.VUE handleStorageChange - : event.key" , event.key);
  
  // 로그인 시 저장하는 키가 'empno'라고 가정 (localStorage에 저장되어 있어야 함)
  if (event.key === 'empno') {    
    let oldValue = event.oldValue;
    let newValue = event.newValue;
    // console.log("App.VUE handleStorageChange - : oldValue" , oldValue);
    // console.log("App.VUE handleStorageChange - : newValue" , newValue);
    
    if (!event.newValue) {
      //console.log("App.VUE handleStorageChange - : 현재 탭");
      // 1. 다른 탭에서 로그아웃 시 현재 탭도 정리
      // userStore.$reset();
      // sessionStorage.clear();
      // alert("다른 탭에서 로그아웃되었습니다. 로그인 페이지로 이동합니다.");
      // window.location.replace('/login');
    } else if (event.oldValue && event.oldValue !== event.newValue) {
      //console.log("App.VUE handleStorageChange - : 이전 탭");
      // 2. 다른 사용자로 로그인 시 세션 꼬임 방지를 위해 새로고침
      //window.location.reload(); 
      alert("동일브라우저에서 다른 사용자로 로그인이 감지되었습니다.");
      // 포털로 이동
      const envMode = import.meta.env.MODE;
      const potalUrl = import.meta.env.VITE_POTAL_URL;
      window.location.replace(potalUrl);

    }
  }
};

onMounted(() => {  
  //console.log("App.VUE onMounted");

  // 리스너 등록 : 26.03.04 
  window.addEventListener('storage', handleStorageChange);
});

onUnmounted(() => {
  // 리스너 해제 (메모리 누수 방지) : 26.03.04 
  window.removeEventListener('storage', handleStorageChange);
});

/** 26.02.02 - 4
 * 전역 에러 감시
 * - router.beforeEach
 * - API interceptor
 * - 어디서 발생해도 여기서 잡힘
 */
watch(
  () => errorStore.error,
  (error) => {
    if (!error) return
    //console.log('App.vue :: global error detected', error)

    proxy.$dialog.error({
      title: error.status === 403 ? '권한 오류' : '시스템 오류',
      text: error.message,
      persistent: true,
    })
    // 처리 후 초기화 (중복 방지)
    errorStore.clear()
  },
  {
    immediate: true, // beforeEach에서 이미 발생한 에러도 처리
  }
)

</script>

<style>
</style>
