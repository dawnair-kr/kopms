import 'core-js/actual/array/at'              // 26.03.18 남동 크롬 구동시 globalStack.at is not a function    at stack.ts:46 대응 

import App from './App.vue'
import { createApp as createVueApp, defineComponent, h, markRaw, reactive } from 'vue'

import {createRouter} from './router'

import { createHead } from '@vueuse/head';    // HTML의 <head> 섹션(메타 태그, 타이틀 등)을 동적으로 관리하기 위한 라이브러리
// Plugins
import { registerPlugins } from '@/plugins';  // 외부 라이브러리와 설정들을 한꺼번에 등록(초기화) -> index.js : 플러그인 정보
import dayjs from 'dayjs';                    // 자바스크립트에서 날짜와 시간 라이브러리
import 'dayjs/locale/ko';                     // dayjs 한국어 설정
import VueLogger from 'vuejs3-log';           // Log 관리 라이브러리
/* e-Chart 설정 26.01.21 제거 */
// import * as echarts from "echarts" 
import { saveAs } from 'file-saver';          // file-saver : export wxcel
import VueApexCharts from 'vue3-apexcharts'; // 차트 라이브러리

/* dayjs 설정 */
dayjs.locale('ko') // use locale globally
import VueGtag from 'vue-gtag-next';          // 서비스의 방문자 분석을 위해 구글 애널리틱스(GA4) 도구

export async function createApp() {

  console.log('main createApp ----- 현재 모드:', import.meta.env.MODE);  
  // const isProduction = process.env.NODE_ENV === 'production';
  // const isTest = process.env.NODE_ENV === 'test';

  const isProduction = import.meta.env.MODE === 'production';
  const isTest = import.meta.env.MODE === 'test';

  /* Log 관리 설정 */
  const options = {
    isEnabled: true,    // 로그 활성화 여부
    logLevel: isTest || isProduction ? 'error' : 'debug',   // development 시 debug
    stringifyArguments: false,  // 인자들을 문자열로 변환할지 여부
    showLogLevel: true,         // 로그 레벨(INFO, DEBUG 등) 표시 여부
    showMethodName: true,       // 호출된 메소드 이름 표시 여부
    separator: '|',             // 로그 구분자
    showConsoleColors: true     // 색상 적용 여부
  };

  // const app = await createSSRApp(App);
  const app = createVueApp(App);
  const head = createHead();

  app.use(head);                // 앱에 head 매니저 등록
  app.use(VueLogger, options);  // 앱에 VueLogger 등록
  app.use(VueApexCharts);       // ApexCharts 등록
  // app.config.globalProperties.$log = VueLogger;
  app.config.globalProperties.$dayjs = dayjs;         // dayjs 라이브러리를 전역 변수로 등록
  //app.config.globalProperties.$echarts = echarts;   /* e-Chart 26.01.21 제거 */

  app.config.globalProperties.$fileSaver = { saveAs };  // fileSaver

  // vuetify, router, pinia 생성
  const { router, pinia } = registerPlugins(app);

  if (isProduction) { // env Product에만 추적 ID를 저장하여 운영서버만 활성화 
    app.use(
      VueGtag,
      {
        config: {
          id: 'G-L56C7TXKTW',
          params: {
            send_page_view: false,
          },
        },
      },
      router
    );
  }

  return { app, router, head, pinia };
}

createApp().then(({ app }) => {
  // console.log('main createApp.then -----> ');
  app.mount('#app');
});