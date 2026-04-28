import { defineConfig, loadEnv } from 'vite'    // 환경경변수 로드
import vue from '@vitejs/plugin-vue'

import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import { fileURLToPath, URL } from 'node:url'

import vueDevTools from 'vite-plugin-vue-devtools'
import vueJsx from '@vitejs/plugin-vue-jsx'

// console.log("vite.config 1>> VITE_API_BASE ::" ,process.env.VITE_API_BASE);

// https://vite.dev/config/
//export default defineConfig({
export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd())
  console.log("VITE" , env);

  return {
    
    // 0. Vue build base path : 프론트엔드 배포 경로
    //base: env.VITE_APP_CONTEXT_PATH+ "/",
    base: "/",
    
    // 1. 플러그인: Vue, Vuetify 등 확장 기능 연결
    plugins: [
      vue({
        template: {
          ssr: true,            // 템플릿 컴파일 시 **서버 사이드 렌더링(SSR)**을 위한 코드를 생성하도록 설정
          transformAssetUrls,   // 이미지, 폰트 등 정적 자원의 경로 자동 관리 : Vue 플러그인에 전달하여 경로 최적화
        },
        // HTML 표준 외의 특수 태그 사용 시 에러 방지
        compilerOptions: {      
          //isCustomElement: (tag) => ['pages'].includes(tag),
        },
      }),
      // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
      vuetify({
        autoImport: true,       // Vuetify 플러그인 실행 (자동 컴포넌트 불러오기)
        styles: {
          configFile: 'src/styles/settings.scss',   // 기본 스타일 변수를 수정할 사용자 정의 설정 파일 지정
        },
      }),
      // vueDevTools(),  // 개발확장도구
      vueJsx({
        //exclude: /.vue$/
      }),
    ],

    // 3. 개발 서버 설정: 포트 번호, 프록시(Proxy) 등
    server: {
      hmr: {            // 코드가 수정되면 전체 페이지를 다시 불러오는 대신, 수정된 모듈만 실시간으로 교체
        port: 24678,    // HMR 데이터를 주고받을 전용 포트 번호를 24678로 고정
        protocol: 'ws'  // 통신 규약을 WebSocket(ws) 으로 설정
      },
      proxy: {
        // 프론트엔드(5173)와 백엔드(8080)의 포트가 다를 때 발생하는 CORS 문제를 해결. 브라우저의 요청을 Vite 서버가 가로채서 백엔드로 대신 전달해 주는 가상 통로 역할
        // rewrite는 "프론트용 URL prefix[kopms-api]를 제거해서 백엔드 API 경로와 맞추기 위한 설정"
        //'/kopms-api': {
        [env.VITE_API_BASE]: {
          //target: 'http://localhost:8081',
          target: `${env.VITE_API_PROTOCOL}://${env.VITE_API_HOST}:${env.VITE_API_PORT}`,
          // ws: true, // WebSocket 프록시 활성화
          changeOrigin: true,
          secure: false,
          ws: true,
          // 대용량 파일 업로드를 위한 타임아웃 설정 (밀리초 단위)
          timeout: 600000, 
          proxyTimeout: 600000,
          //rewrite: (path) => path.replace(new RegExp(`^${env.VITE_API_BASE}`), ''),
          //rewrite: (path) => path.replace(/^\/kopms-api/, '') ,
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              //console.log('Proxy Error 상세:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              //console.log('백엔드로 요청 보냄:', req.method, req.url);
              //console.log(`[Proxy Request] ${req.method} ${req.url} -> ${options.target}${req.url}`);
            });
            //proxy.on('proxyReq', (proxy, req, res) => {
            //  console.log('보내는 요청 주소:', req.url);
            //});
          },
        }
      }

    },

    // 2. 경로 별칭(Alias): ../../ 대신 @ 등으로 경로 간소화
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
      // 파일을 임포트(import)할 때, 파일 확장자를 생략해도 자동으로 찾아줄 목록
      extensions: [
        '.js',      // 표준 자바스크립트 및 모듈 파일
        '.json',
        '.jsx',     // 리액트 스타일의 자바스크립트 파일
        '.mjs',     // 표준 자바스크립트 및 모듈 파일
        '.ts',      // 타입스크립트 및 React 스타일의 타입스크립트 파일
        '.tsx',     // 타입스크립트 및 React 스타일의 타입스크립트 파일
        '.vue',
      ],

    },
  
    // 4. 빌드 설정: 배포 경로, 결과물 폴더 등
    build: {
      chunkSizeWarningLimit: 8192,   // 빌드 시 생성되는 파일(Chunk) 한 개당 용량 경고 수치
      rollupOptions: {               // 시작하는 경로의 모듈을 빌드 결과물에 포함하지 않고 외부(External)로 처리
        external: [
          /^\/sockjs\//
        ]
      }
    },
    // SSR(Server-Side Rendering, 서버 사이드 렌더링) 관련 설정
    // 특정 라이브러리들을 외부 모듈로 취급하지 말고, 빌드할 때 서버용 번들 파일 안에 직접 포함
    ssr: { 
      noExternal: [
        /\.css$/,
        /^vuetify/,
        // /^resize-detector$/,
        // /^echarts/,
        // /^zrender/,
        // /^@syncfusion/,
      ],
    },
    // 빌드(Build)하거나 코드를 변환할 때, **특정 키워드를 지정한 값으로 강제로 치환(Replace)**해주는 설정
    // 환경 변수를 주입할 때 사용
    define: {
      // 'process.env': process.env,      // 소스 코드에서 import.meta.env.VITE_~ 사용하면 문제 없음
      __CSP__: "false",
      // global: 변경하면 소캣통신이 안된다. 절대 바꾸지 마라~~~, global 키워드를 브라우저의 최상위 객체인 window로 치환
      // 브라우저에는 global이 없음
      global: 'window'
      // global: {}
    },
  
  }

});
