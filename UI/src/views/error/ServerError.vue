<template>
  <div class="error-page">
    <h1>500</h1>
    <p>서버 오류가 발생했습니다.</p>
    <p>잠시 후 다시 시도해주세요.</p>

    <div class="actions">
      <!-- <button @click="reload">새로고침</button> -->
       <button @click="goBack">이전 페이지</button>
      <button @click="goHome">홈으로 이동</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const reload = () => {
  window.location.reload()
}

const goHome = () => {
  //router.push('/home')
  router.push('/')    // 로그인 ... 추후 포털창으로..
}
</script>

<style scoped>
.error-page {
  text-align: center;
  padding: 100px;
}
h1 {
  font-size: 100px;
  margin-bottom: 20px;
}
.actions button {
  margin: 10px;
}
</style>