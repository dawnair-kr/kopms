<template>
  <div class="error-page">
    <h1>404</h1>
    <p>페이지를 찾을 수 없습니다.</p>

    <div class="actions">
      <button @click="goHome">홈으로 이동</button>
      <button @click="goBack">이전 페이지</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/home')
}

const goBack = () => {
  router.back()
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