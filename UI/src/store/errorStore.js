// Utilities
import { defineStore } from 'pinia';


export const useErrorStore = defineStore('error', {
  state: () => ({
    error: null,
  }),

  actions: {
    setError(error) {
      this.error = error;
    },
    /**
     * 에러를 발생시키고 즉시 다이얼로그를 띄운 뒤 초기화합니다.
     * @param {Object} err - Axios 또는 일반적인 Error 객체
     */
    handleError(err, router) {
      
      const status = err?.response?.status || err?.status || 500

      // if (status === 403) router.push('/403')
      // else if (status === 404) router.replace('/404')
      // else if (status === 500) router.push('/500')

      // 동일 에러 중복 방지
      if (this.error?.message === err?.message) {
        return
      }

      this.clear()

      this.error = {
        message:
          err?.response?.data?.message ||
          err?.message ||
          '알 수 없는 오류가 발생했습니다.',
        status,
        code: err?.response?.data?.code
      }
      
    },

    /**
     * 에러 데이터 초기화
     */
    clear() {
      this.error = null;
    }
  }
});