// import { defineConfig } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

import dotenv from 'dotenv';

import { fileURLToPath, URL } from 'node:url'

// import { defineConfig } from 'vite'
// import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'


dotenv.config();


console.log("vite.config 1>> VITE_API_BASE ::" ,process.env.VITE_API_BASE);

// https://vite.dev/config/
export default defineConfig({

  // 1. 플러그인: Vue, Vuetify 등 확장 기능 연결
  plugins: [
    vue(),
    //vueDevTools(),
  ],

  // 3. 개발 서버 설정: 포트 번호, 프록시(Proxy) 등
  server: {
		proxy: {
		  // 프론트엔드(5173)와 백엔드(8080)의 포트가 다를 때 발생하는 CORS 문제를 해결합니다. 브라우저의 요청을 Vite 서버가 가로채서 백엔드로 대신 전달해 주는 가상 통로 역할
		  '/kopms-api': {
			target: 'http://localhost:8080',
			changeOrigin: true,
			rewrite: (path) => path.replace(/^\/kopms-api/, '') 
		  }
		}
	},

  // 2. 경로 별칭(Alias): ../../ 대신 @ 등으로 경로 간소화
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  
  // 4. 빌드 설정: 배포 경로, 결과물 폴더 등
  // build: {
  //   chunkSizeWarningLimit: 8192,
  //   rollupOptions: {
  //     external: [
  //       /^\/sockjs\//
  //     ]
  //   }
  // },
  

})
