import axios from 'axios';
import { messageDefaults } from 'element-plus';
import lodash from 'lodash';
import { inject } from 'vue';
import { useUserStore } from '@/store/user.js';
import { getApiBaseUrl } from '@/util/util.js';

import { useMenuStore } from '@/store/menu.js';
import { useSelectMenuStore } from '@/store/selectMenuStore.js';


function br_trans(jobs, callback) {

  this.$log.debug("vue-axios >> br_trans ~~~~~~ ::");

  if (typeof window != "object") {
    console.info(`SSR STATE Call`);
    return;
  }
  /**
   * job spec
   * {
   *    url : base 제외한 나머지 url,
   *    method : post or get == default get,
   *    params: get 방식일때 전달하는 값,
   *    data: postData,
   *    options: 
   * }
   */
  if (Array.isArray(jobs) && jobs.length) {

    const total_job_cnt = jobs.length;
    //this.$http.defaults.headers.common['X-CSRF-TOKEN'] = this.$store.getters.csrf_token;

    let loader;


    let baseUrl = getApiBaseUrl();
    
    //console.log("baseUrl", baseUrl, this, this.$dialog);
    //console.log("~~~~~하기 잠시 주석 01.16  ::: 주석 해제하면 vite.config,js 의 proxy 설정이 안되......");
    // axios.defaults.baseURL = baseUrl;       // 주석 해제하면 vite.config,js 의 proxy 설정이 안되......
    axios.defaults.withCredentials = true;    // withCredentials 전역 설정 : 서로 다른 도메인 간 쿠키 전송 허용 여부

    const origin = `${location.protocol}` + `/` + `${location.hostname}` + `:` + `${location.port}`;
    //console.log("origin :: ", origin);
    axios.defaults.headers['Access-Control-Allow-Origin'] = origin;

    const then_func = (res, job) => {
      const url = res.config.url;
      let data = res.data;
      
      if (data instanceof Blob) {      
        this.$log.debug("~~~~ 1 then_func ~~~~ res.config.url ", res.config.url);
        //console.log("~~~~ 2 then_func ~~~~ data ::: ", data);
        if (data.type == "application/json") {
          //console.log("~~~~3 then_func ~~~~ data.type ::: ", data.type);
          const reader = new FileReader();
          reader.onload = () => {
            let retjson = "";
            try {
              retjson = JSON.parse(reader.result);
            } catch (e) {
              retjson = {};
            }
            //console.log("~~~~3 then_func ~~~~ retjson ::: ", retjson);
            //callback(job.url, retjson.code, retjson.message);
            callback(job.url, retjson.code, retjson.data.detail);   // 26.04.06 
            
          };
          reader.readAsText(data);
        }
        else {

          this.$log.debug("~~~~ 2 then_func file ~~~~ res.config.url ", res.config.url);
          let filename = "";
          let failInfo = "";
          // header 기반 파일명
          let disposition = res?.headers?.['content-disposition'];
          // let disposition = res.headers['Content-Disposition'];

          // if (disposition && disposition.indexOf('attachment') !== -1) {
          //   let filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/gm;
          //   let m;

          //   while ((m = filenameRegex.exec(disposition)) !== null) {
          //     // This is necessary to avoid infinite loops with zero-width matches
          //     if (m.index === filenameRegex.lastIndex) {
          //       filenameRegex.lastIndex++;
          //     }

          //     // The result can be accessed through the `m`-variable.
          //     m.forEach(function (match, groupIndex) {
          //       if (groupIndex == 1) {
          //         if (match.startsWith("utf-8''")) {
          //           filename = match.replace("utf-8''", '');
          //         } else {
          //           filename = match.replace(/['"]/g, '');
          //         }
          //         // console.log(`filename ${filename}`);
          //         // console.log("filename " + filename);
          //       }
          //     });
          //   }
          // }

          // 2026.04.07 수정
          if (disposition) {
            const match = disposition.match(/filename\*=UTF-8''(.+)|filename="?([^"]+)"?/);
            if (match) {
              filename = decodeURIComponent(match[1] || match[2]);
            }
          }

          // 2026.04.07 추가 : 실패 파일 리스트
          const failHeader = res?.headers?.['x-fail-files'];
          //console.log("~~~~ 22221 then_func ~~~~failHeader :: ", failHeader);
          if (failHeader) {
            const failList = JSON.parse(decodeURIComponent(failHeader));

            if (failList.length > 0) {
              // this.$dialog.warning({
              //   title: "다운로드 일부 실패",
              //   text: failList.join('\n')
              // });
              failInfo = failList.join(',');
              //this.$log.debug("~~~~ 2 then_func file ~~~~ FailList ", failInfo);

            }
          }
          this.$log.debug("~~~~ 2 then_func file ~~~~ filename ", filename);
          this.$log.debug("~~~~ 2 then_func file ~~~~ FailList ", failInfo);

          //callback(job.url, 0, "succ", data, filename);
          callback(job.url, 0, "succ", data, filename, failInfo);
        }
      } else {
        this.$log.debug("~~~~ 3 then_func ~~~~", res.config.url);
        // console.log("2 then_func data :: ", data);
        //this.$log.debug("2 then_func data.code :: ", data.code);
        if (!(data instanceof Blob) && data.code < 0) {
          throw new Error(data.message);
        } else {

          //console.log("then_func ", res, job);
          if (typeof callback == 'function') {
            if (data instanceof Blob) {
              callback(job.url, 0, "succ", data);
            } else {
              //console.log("job.url ::: ", data);
              callback(job.url, data.code, data.message, data.data);
              // callback(job.url, data.code, data.message, data);
            }
          }
        }
      }
    };


    const catch_func = (error, job) => {
      this.$log.debug("~~~~ catch_func ~~~~");
      if (error.code == "ERR_NETWORK") {
        this.$router.push("/500");
        return;
      }
      /**/
      else if (error.response) {
        
        // 401 - Session expired", 419 - 토큰 만료
        if (error.response.status == 401 || error.response.status == 419) {
          this.$dialog.error({
            title: 'Login',
            text: "정상적인 사용자가 아닙니다.\n재로그인 후 사용하십시요."
          }).then(res => {
            // 사용자 정보, 메뉴 정보, 선택 메뉴 reset
            const userStore = useUserStore();
            userStore.$reset();
            const menuStore = useMenuStore();
            menuStore.$reset();
            const selectMenuStore = useSelectMenuStore();
            selectMenuStore.$reset();
            
            console.log("import.meta.env.MODE : ", import.meta.env.MODE);
            console.log("import.meta.env.VITE_POTAL_URL :: ", import.meta.env.VITE_POTAL_URL);
            // 포털로 이동
            const envMode = import.meta.env.MODE;
            const potalUrl = import.meta.env.VITE_POTAL_URL;
            
            //window.location.href = potalUrl;
            window.location.replace(potalUrl);
            
          });

          // this.$router.push("/");
          //this.$router.push("/401");
          /*
          if ( this.$router.currentRoute && this.$router.currentRoute.meta && this.$router.currentRoute.meta.requiresLogin ) {
            this.$router.go(0);
          }
          this.$store.dispatch('acl/setLogin', false);
          */
          return;
        }

        // 권한 없음
        if (error.response.status == 403) {
          if (typeof document == "object") {
            let lang = document.head.lang;
            if (lang == 'en') {
              this.$dialog.error({
                title: 'Error',
                text: "You do not have permission to process it."
              });
            } else {
              this.$dialog.error({
                title: 'Error',
                text: "처리 권한이 없습니다."
              });
            }
          } else {
            this.$dialog.error({
              title: 'Error',
              text: "처리 권한이 없습니다."
            });
          }
          return;
        }
      }

      /**
       * 서버에서 오류가 발생하면 나오는 메세지 예시
       * {
       * "title": "Business Service Error",
       * "status": 201,
       * "detail": "등록되지 않은 사용자입니다.",
       * "timeStamp": 1712286102,
       * "path": null,
       * "developerMessage": "com.bren.base.exception.BizException",
       * "errors": {}
       * }
       */

      const url = error && error.config && error.config.url;
      const data = error && error.response && error.response.data ? error.response.data : null;

      if (typeof callback == 'function') {
        if (data) {
          if (data && data.status < 0) {
            if (job.errorAlert !== false && this.$dialog) {
              this.$dialog.error({
                title: data.title,
                text: data.detail
              });
            }
            callback(job.url, data.status, data.detail);
          } else {
            if (job.errorAlert !== false && this.$dialog) {

              this.$dialog.error({
                title: data.title,
                text: data.detail
              });
            }
            callback(job.url, -100, error.message);
          }
        }
        else {

          this.$log.error("TR 호출 후 콜백함수 오류 !!!!!!!!!!!!");
          this.$router.push("/500");  // 서버 로직 오류, DB 에러시스템 점검 안내
        }
      }
    };

    const task_call = (task) => {

      this.$log.debug("~~~~ task_call 실 Tran ~~ task.url~~", task.url );
      
      let token = localStorage.getItem("SSO_TOKEN");    // 26.03.18 포탈에서 전달된 토큰

      let options = task.options || {};     // Axios의 추가 설정 (Headers 등)
      options.headers = options.headers || {};          // 26.03.18 포탈에서 전달된 토큰 설정 위해

      // 26.03.18 HTTP 요청 헤더에 Authorization이라는 필드를 추가하고, 값으로 Bearer [토큰값]을 넣는다.
      if (token) {
        options.headers["Authorization"] = "Bearer " + token;
      }

      let method = task.method || 'get';    // 'get', 'post', 'put', 'delete' 등 (기본값 'get')
      let api_url = task.url;               // 호출할 API 경로 (예: /comm/code/list)
      
      return axios[method](               // axios['get'](...) 또는 axios['post'](...)와 같이 동적 호출
        api_url,                          // 첫 번째 인자: URL [Proxy 개입 시점]
        method == 'get' ?                 // 두 번째 인자: GET과 POST일 때 데이터 전달 방식이 다름
          lodash.merge(                   // GET이면 params와 options를 합침
            {
              params: task.params,        // GET 방식일 때 URL 뒤에 붙는 쿼리 스트링
            },
            options
          ) :
          task.data || {},                // POST/PUT 방식일 때 Body에 담길 데이터
        method == 'get' ?                 // 세 번째 인자: POST/PUT일 때만 옵션(Headers 등)을 따로 보냄
          null :
          options,
      );
    };


    if (total_job_cnt > 1) {
      this.$log.debug("~~~~ task_call ~~ total_job_cnt :: ", total_job_cnt );
      const multijob = async () => {
        let i = 0;
        try {
          let isWait = jobs.every((j) => {
            return j.isWait === false;
          });

          isWait = !isWait;
          if (isWait && this.$dialog) {
            loader = this.$dialog.loading({ size: 70, width: 7, color: '#283C46' });
          }

          let res;
          for (i = 0; i < jobs.length; i++) {
            if (i == jobs.length - 1) {
              res = await task_call(jobs[i]);
              //console.log("multijob res 0 ===>", res);
              then_func(res, jobs[i]);
              if (loader) loader.hide();
            } else {
              res = await task_call(jobs[i]);
              //console.log("multijob res ===>", res);
              then_func(res, jobs[i]);
            }
          }

        } catch (error) {
          //console.log("multijob errr", error);
          if (loader) loader.hide();
          catch_func(error, jobs[i]);
        }
      };

      multijob();

    } else {

      if (jobs[0].isWait !== false && this.$dialog) {
        loader = this.$dialog.loading({ size: 70, width: 7, color: '#283C46' });
      }

      task_call(jobs[0]).then((res) => {
        // console.log("single job", res);

        then_func(res, jobs[0]);
        if (loader) loader.hide();
      }).catch((error) => {
        // console.log("single job catch", error);
        this.$log.fatal("single job catch", error);
        if (loader) loader.hide();
        catch_func(error, jobs[0]);
      });

    }
  } else {
    throw new Error("In br_trans, Jobs arguments is array type and length > 0.")
  }
}

const property = "$br_trans";

function install(app, options = {}) {

  if (!app.config.globalProperties[property]) {
    Object.defineProperty(app.config.globalProperties, property, {
      get() {
        return br_trans
      },
      configurable: true
    });
    app.provide(property, br_trans);
  } else {
    this.$log.warn(`Property ${property} is already defined in Vue prototype`)
  }

}

export function useBrTrans() {
  return inject(property);
}

const Plugin = {
  install
}

export default Plugin;