<template>
  <v-container>
    <v-card class="pa-2">
    <v-card-title>파일 업로드</v-card-title>

    <v-card-text>
      <v-row no-gutters justify="center" align="center" class="mt-2">
        <v-col class="mx-1">
          <!-- <fileList :enableUpload="isUploadMode" :files="upLoadDataInfo.files" :pagePerCount="pagePerCount" @addFiles="addFiles" /> -->
          <!-- 부모에서 자식을 호출할 때, 페이지 번호가 부모-자식 간에 서로 연동되도록 .sync (Vue 3에서는 v-model:propName) 패턴을 사용 -->
          <fileList ref="fileListRef" :enableUpload="isUploadMode" :files="upLoadDataInfo.files" 
            v-model:currentPage="currentPage"  v-model:pagePerCount="pagePerCount"
            @addFiles="addFiles" 
          />
        </v-col>
      </v-row>
      <v-spacer style="height: 10px;" />
      <v-divider class="border-opacity-50"></v-divider>
      
      <!-- 추가 입력 -->

      <v-row no-gutters justify="center" align="center">
        <v-col>
          <v-text-field variant="outlined"
            label="Job : Gen - 일반, Biz = Biz"
            v-model="upLoadDataInfo.job"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-text-field variant="outlined" label="제목 : 일반"
            v-model="upLoadDataInfo.title"
          ></v-text-field>
        </v-col>
      </v-row>  
      <v-row no-gutters justify="center" align="center">
        <v-col>
          <v-text-field variant="outlined"
            label="마스터번호 : Gen & Biz"
            v-model="upLoadDataInfo.masterNo"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-text-field variant="outlined"
            label="attachFileSeq : Gen & Biz"
            v-model="upLoadDataInfo.attachFileSeq"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-text-field variant="outlined"
            label="orderNo : Gen & Biz"
            v-model="upLoadDataInfo.orderNo"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row no-gutters justify="center" align="center">
        <v-col>
          <v-text-field variant="outlined"
            label="taskType : Biz"
            v-model="upLoadDataInfo.taskType"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-text-field variant="outlined"
            label="TaskCode  : Biz"
            v-model="upLoadDataInfo.taskCode"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-text-field variant="outlined"
            label="fileGubun : A-첨부, R- 연관"
            v-model="upLoadDataInfo.fileGubun"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row no-gutters justify="center" align="center">
        <v-col>
          <v-btn color="primary" variant="outlined" density="compact"  @click="uploadFile">
            저장
          </v-btn>
        </v-col>
        <v-col>
          <v-btn color="primary" variant="outlined" density="compact"  @click="getFile">
            조회
          </v-btn>
        </v-col>
      </v-row>
      <!-- image -->
      <v-row no-gutters justify="center" align="center" >
        <v-col align="center" >
          <imageAttatch 
            v-model:image="image"
            @addImageFile="addImageFile"
          />
          <!-- type="image" logo 아니면 안보임 -->
        </v-col>        
        <v-spacer style="height: 10px;" />
        <v-divider class="border-opacity-50"></v-divider>
      </v-row>
      <v-row no-gutters justify="center" align="center">
        <v-col align="right" >
          <v-btn color="primary" variant="outlined" density="compact"  @click="uploadImageFile">
            저장
          </v-btn>
          <v-btn color="primary" variant="outlined" density="compact"  @click="getImageFile">
            조회
          </v-btn>
        </v-col>
        
      </v-row>
      
    </v-card-text>
  </v-card>
    

  </v-container>
</template>


<script setup>


</script>


<script>
import lodash from 'lodash';
import fileList from '@/views/file/FileList.vue';
import imageAttatch from '@/views/file/ImageAttatch.vue';
import { getApiBaseUrl } from '@/util/util.js';
// import { useUserStore } from '@/store/user.js' // 1. 스토어 가져오기

export default {
  
  props: {
    // 부모에서 컨트롤 하기 위해 주석처리
    // pagePerCount: {
    //   type: Number,
    //   default: 5,
    // },
    
    
  },

  components: {
    fileList,     // FileList 컴포넌트 등록 필수!
    imageAttatch, // ImageAttatch 컴포넌트 등록 필수!
  },

  watch: {
  },

  computed: {
    // 2. 다른 화면에서도 똑같이 등록 (this.userStore로 접근 가능)
    // userStore() {
    //   return useUserStore();
    // },
  },

  mounted() {
    // this.$log.debug("FileTest.vue :: userStore.name ~~~", this.userStore.memberInfo.name)
    // this.$log.debug("FileTest.vue :: userStore.name ~~~", this.userStore.memberInfo)
  },

  methods: {

    addFiles(files) {
      console.log("addFiles >>>>>");
      this.upLoadDataInfo.files = files;

      // 2. 마지막 페이지 계산 및 이동
      // $nextTick을 사용하여 데이터가 반영된 후 계산하는 것이 안전.
      this.$nextTick(() => {
        const totalFiles = this.upLoadDataInfo.files.length;
        const rowsPerPage = this.pagePerCount; // 부모가 가지고 있는 페이지당 행 수
        
        if (totalFiles > 0) {
          // 마지막 페이지 번호 = 올림(전체 개수 / 페이지당 개수)
          const lastPage = Math.ceil(totalFiles / rowsPerPage);
          this.currentPage = lastPage;
        }
      });

    },
    
    // ======================
    // 파일 업로드
    // ======================
    // uploadFile_old() {

    //   let formData = new FormData();

    //   const files = [];
    //   const infos = [];
    //   // 상태가 "upload"인 파일들만 골라내
    //   lodash.forEach(this.upLoadDataInfo.files, o => {
    //     console.log("o.status : ", o.status);
    //     if (o.status == "upload") {
    //       files.push(o.file);     // 실제 파일 데이터(Binary, Blob 등)를 files 배열에
    //       infos.push({
    //         ...o,
    //         file: null            // file 속성만 null로 덮어씁
    //       });
    //     }
    //   });


    //   // 데이터 구조화
    //   this.upLoadDataInfo.uploadfiles = infos;    // 파일 정보 배열(infos)을 uploadfiles라는 키값에 할당
    //   // FormData 조립 
    //   // 1. 실제 파일 데이터들을 FormData에 추가, 서버는 files라는 이름의 배열이나 리스트로 이 파일들을 받게 됨
    //   for (let file of files) {
    //     formData.append("files", file);
    //   }
    //   // 2. 정보 객체 추가 : 데이터베이스(DB)에 기록용 정보
    //   formData.append("upLoadDataInfo", JSON.stringify(this.upLoadDataInfo));   // 서버가 읽을 수 있도록 JSON 문자열로 변환

    //   //console.log("formData~~~~~~~~~~~~~~~");
    //   //console.dir(formData);

    //   //console.log("파일들 확인:", formData.getAll("files"));
    //   //console.log("데이터 정보 확인:", formData.get("upLoadDataInfo"));

    //   // const infoString = formData.get("upLoadDataInfo");
    //   // if (infoString) {
    //   //   console.log("상세 정보 객체:", JSON.parse(infoString));
    //   // }

    //   this.$br_trans([
    //     {
    //       url: "/kopms-api/file/upload",
    //       method: "post",
    //       data: formData,
    //       isWait: false,
    //       options: {
    //         headers: {
    //           'Content-Type': 'multipart/form-data'
    //         },
    //         onUploadProgress: progressEvent => {
    //           //console.log(progressEvent);
    //           this.progress =
    //             Math.ceil((progressEvent.loaded / progressEvent.total) * 100);
    //         }
    //       }
    //     }
    //   ], (url, code, msg, data) => {
    //     this.$log.debug(" upload - url : " , url , " :::: - code : " , code , " :::: - msg : " , msg);
    //     if (code == 0) {
          
    //       this.$dialog.message.success("업로드 완료 되었습니다.");

    //       this.upLoadDataInfo.files = data.fileList;
    //       if ( this.upLoadDataInfo.files.length > 0 ) {
    //         this.upLoadDataInfo.attachFileSeq = data.fileList[0].attachFileSeq;
    //       }
    //     } else {

    //       this.$dialog.error({
    //         title: "시스템 오류",
    //         text: data.detail
    //       }).then(res => {

    //       });

    //     }

    //   });

    // },

    // ======================
    // 파일 업로드 - new
    // ======================
    uploadFile() {

      const formData = new FormData();
      const files = [];
      const infos = [];

      // 자식 컴포넌트(FileList) 인스턴스 참조 (ref="fileListRef" 가정)
      const fileListComp = this.$refs.fileListRef;
      if (!fileListComp) {
        console.error("파일 리스트 컴포넌트를 찾을 수 없습니다.");
        return;
      }

      // 1. 상태가 "upload"인 파일들만 골라내기
      lodash.forEach(this.upLoadDataInfo.files, o => {
        if (o.status === "upload") {
          // 핵심 수정: o.file(유실될 수 있는 참조) 대신 
          // 자식 컴포넌트가 메모리에 꽉 잡고 있는 orgUploadFiles에서 실제 파일 객체 추출
          const actualFile = fileListComp.orgUploadFiles[o.fileKey];

          if (actualFile) {
            files.push(actualFile); // 실제 바이너리 데이터
            infos.push({
              ...o,
              file: null // 전송 데이터 경량화를 위해 file 객체는 null 처리
            });
          } else {
            console.warn(`파일 객체를 찾을 수 없습니다: ${o.fileName}. 페이지 이동 중 유실되었는지 확인이 필요합니다.`);
          }
        }
      });

      // 전송할 신규 파일이 없는 경우 예외 처리
      if (files.length === 0) {
        this.$dialog.message.info("업로드할 신규 파일이 없습니다.");
        return;
      }

      // 2.데이터 구조화
      this.upLoadDataInfo.uploadfiles = infos;    // 파일 정보 배열(infos)을 uploadfiles라는 키값에 할당

      // 3. FormData 조립
      // 3.1 실제 파일 데이터들을 FormData에 추가, 서버는 files라는 이름의 배열이나 리스트로 이 파일들을 받게 됨
      for (const file of files) {
        formData.append("files", file);
      }
      // 메타 정보(JSON) 추가
      // 3.2 정보 객체 추가 : 데이터베이스(DB)에 기록용 정보, 서버가 읽을 수 있도록 JSON 문자열로 변환
      formData.append("upLoadDataInfo", JSON.stringify(this.upLoadDataInfo));

      // 4. 전송 실행
      this.$br_trans([
        {
          url: "/kopms-api/file/upload",
          method: "post",
          data: formData,
          isWait: false,
          options: {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: progressEvent => {
              //console.log(progressEvent);
              this.progress =
                Math.ceil((progressEvent.loaded / progressEvent.total) * 100);
            }
          }
        }
      ], (url, code, msg, data) => {
        this.$log.debug(" upload - url : " , url , " :::: - code : " , code , " :::: - msg : " , msg);
        if (code == 0) {
          
          this.$dialog.message.success("업로드 완료 되었습니다.");
          
          // 업로드 성공 후 자식 컴포넌트의 메모리 저장소 비우기
          fileListComp.orgUploadFiles = {};

          // 서버에서 내려준 최신 파일 목록으로 교체
          this.upLoadDataInfo.files = data.fileList;
          if ( this.upLoadDataInfo.files.length > 0 ) {
            this.upLoadDataInfo.attachFileSeq = data.fileList[0].attachFileSeq;
          }

        } else {

          this.$dialog.error({
            title: "시스템 오류",
            text: data.detail
          }).then(res => {

          });

        }

      });

    },

    // ======================
    // 파일 목록 조회
    // ======================
    getFile() {
      // 로그인 사용자 정보 가져오기
      // 1. 메소드 시작 시점에 직접 스토어를 변수에 담습니다.
      //const userStore = useUserStore();
      // 2. 이제 안전하게 접근 (Optional Chaining 활용)
      // this.$log.debug("FileList.vue :: 삭제 시도 사용자 ~~~", userStore.memberInfo);
      // const memberName = userStore.memberInfo?.name;
      // this.$log.debug("FileList.vue :: 삭제 시도 사용자 ~~~", memberName);

      const inputData = {
        attachFileSeq: this.upLoadDataInfo.attachFileSeq, //'A20260004145',
        orderNo: '',
        title: this.upLoadDataInfo.title,
      };

      this.$br_trans([
        {
          url: "/kopms-api/file/getFile",
          method: "post",
          data: inputData,
          //isWait: false,
        }

      ], (url, code, msg, data) => {
        this.$log.debug(" getFile - url : " , url , " :::: - code : " , code , " :::: - msg : " , msg);
        //this.upLoadDataInfo.files = data.fileList;        
        this.upLoadDataInfo.files = data.fileList.map(item => ({ ...item, checked: item.checked === 'Y' }) );

        // attachFileSeq 설정 시 
        if ( this.upLoadDataInfo.files.length > 0 ) {
          //this.upLoadDataInfo.attachFileSeq = data.fileList[0].attachFileSeq;
        }
        // this.$log.debug(this.upLoadDataInfo.files);
      });

      // 조회 시 현재 페이지 1 페이지로 설정
      this.currentPage = 1;
    },
    
    addImageFile(fileItem, file) {

      // fileItem : 화면/DB용 정보
      // file : 실제 업로드 파일 
      this.upLoadImageInfo.fileItem = fileItem;
      this.upLoadImageInfo.file = file;

    },

    // ======================
    // 파일 업로드 - Image
    // ======================
    uploadImageFile() {

      this.$log.debug(" uploadImageFile - : " );

      this.upLoadImageInfo.fileGubun = "I";
      this.upLoadImageInfo.job = "Biz";     // Biz : 사업업무, Gen : 미확정 - 자료실, 게시판,.. 등등 구분 용도  
      this.upLoadImageInfo.masterNo = "TestImg";

      const formData = new FormData();
      const files = [];
      const infos = [];

      // 이미지 추가 
      if (this.upLoadImageInfo.file) {
        files.push(this.upLoadImageInfo.file);
        infos.push({
          ...this.upLoadImageInfo.fileItem,
          file: null
        });
      }
      
      // 전송할 신규 파일이 없는 경우 예외 처리
      if (files.length === 0) {
        this.$dialog.message.info("업로드할 신규 파일이 없습니다.");
        return;
      }

      // 2.데이터 구조화
      this.upLoadImageInfo.uploadfiles = infos;    // 파일 정보 배열(infos)을 uploadfiles라는 키값에 할당

      // 3. FormData 조립
      // 3.1 실제 파일 데이터들을 FormData에 추가, 서버는 files라는 이름의 배열이나 리스트로 이 파일들을 받게 됨
      for (const file of files) {
        formData.append("files", file);
      }
      // 메타 정보(JSON) 추가
      // 3.2 정보 객체 추가 : 데이터베이스(DB)에 기록용 정보, 서버가 읽을 수 있도록 JSON 문자열로 변환
      formData.append("upLoadDataInfo", JSON.stringify(this.upLoadImageInfo));

      // 4. 전송 실행
      this.$br_trans([
        {
          url: "/kopms-api/file/upload",
          method: "post",
          data: formData,
          isWait: false,
          options: {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: progressEvent => {
              //console.log(progressEvent);
              this.progress =
                Math.ceil((progressEvent.loaded / progressEvent.total) * 100);
            }
          }
        }
      ], (url, code, msg, data) => {
        this.$log.debug(" upload - url : " , url , " :::: - code : " , code , " :::: - msg : " , msg);
        if (code == 0) {
          this.image = "";
          this.$dialog.message.success("업로드 완료 되었습니다.");

          this.upLoadImageInfo.fileInfo = data.fileList;
          //this.$log.debug(" upload - this.upLoadImageInfo.fileInfo[0].fileSeq : " , this.upLoadImageInfo.fileInfo[0].fileSeq);
          //this.$log.debug(" upload - this.upLoadImageInfo.fileInfo[0].fileUrl : " , this.upLoadImageInfo.fileInfo[0].fileUrl);

          const fileUrl = this.upLoadImageInfo.fileInfo[0].fileUrl;
          //baseUrl = baseUrl.replace("kopms-api/", "");
          //http://127.0.0.1:9040/kopms-api/
          ///upload/TestImg/20260421105909904.TestImg.32115491.png

          const baseUrl = getApiBaseUrl().replace(/kopms-api\/?$/, "");
          const fullUrl = new URL(fileUrl, baseUrl).href;

          this.$log.debug(" baseUrl : " , baseUrl );
          this.$log.debug(" fileUrl : " , fileUrl );
          this.$log.debug(" fullUrl : " , fullUrl );

          this.image = fullUrl;

         // this.image = this.upLoadImageInfo.fileInfo[0].fileSeq;

          /*
          // 업로드 성공 후 자식 컴포넌트의 메모리 저장소 비우기
          fileListComp.orgUploadFiles = {};

          // 서버에서 내려준 최신 파일 목록으로 교체
          
          if ( this.upLoadDataInfo.files.length > 0 ) {
            this.upLoadDataInfo.attachFileSeq = data.fileList[0].attachFileSeq;
          }
          */

        } else {

          this.$dialog.error({
            title: "시스템 오류",
            text: data.detail
          }).then(res => {

          });

        }

      });

    },

    getImageFile() {
      this.$log.debug("getImageFile ~~~~~~~~~~~~~~~~~~" );

      const inputData = {
        attachFileSeq: 'I20260004199',
        orderNo: '1',
      };

      this.$br_trans([
        {
          url: "/kopms-api/file/getFile",
          method: "post",
          data: inputData,
          //isWait: false,
        }

      ], (url, code, msg, data) => {
        this.$log.debug(" getFile - url : " , url , " :::: - code : " , code , " :::: - msg : " , msg);
        this.$log.debug(" fileList : " , data.fileList);
        
        // Url 방식
        const fileUrl = data.fileList[0].fileUrl;
        //baseUrl = baseUrl.replace("kopms-api/", "");
        //http://127.0.0.1:9040/kopms-api/
        ///upload/TestImg/20260421105909904.TestImg.32115491.png

        const baseUrl = getApiBaseUrl().replace(/kopms-api\/?$/, "");
        const fullUrl = new URL(fileUrl, baseUrl).href;

        this.$log.debug(" baseUrl : " , baseUrl );
        this.$log.debug(" fileUrl : " , fileUrl );
        this.$log.debug(" fullUrl : " , fullUrl );

        this.image = fullUrl;
        

        /*
        // Base64 변환 방식
        const file = data.fileList?.[0];
        //this.$log.debug(" file : " , file);
        this.$log.debug(" file.imageType : " , file.imageType);
        this.$log.debug(" file.imageBase64 : " , file.imageBase64);

        this.image = `data:${file.imageType};base64,${file.imageBase64}`;
        */

      });

      // 라우터를 통한 메뉴 호출 및 파라메너 전달
      // /test/CodeTest
      // menu.menuCode + menu.menuNo
      //"DT"
      //"DT9901"
      //this.$router.push({ name: 'DT9901', query: { id: 123 } });
      //this.$router.push({ name: 'DT9901', state: { id: 123 } });

      
    }
    
    

  },

  data() {

    return {
      // 부모에서 관리하기 --- Start
      pagePerCount : 5,
      currentPage: 1,
      // 부모에서 관리하기 --- End
      fileList: null,
      
      isUploadMode: true,

      upLoadDataInfo: {
        job: "Biz",       // Biz : 사업업무, Gen : 미확정 - 자료실, 게시판,.. 등등 구분 용도  
        attachFileSeq: "",
        masterNo: "",
        taskType: "",
        taskCode: "",
        fileGubun:"A",    // A : 첨부, R : 관련파일, D : Data, I : Image
        title : "",
        files: [],
      },

      // 하기 이미지
      image: "",

      upLoadImageInfo: {
        job: "Biz",       // Biz : 사업업무, Gen : 미확정 - 자료실, 게시판,.. 등등 구분 용도  
        attachFileSeq: "",
        masterNo: "",
        fileGubun:"I",    // A : 첨부, R : 관련파일, D : Data, I : Image
        title : "",
        file: null,
        fileItem: null,
        fileInfo:[]
      },
      // 
      
    }
  
  }

}
</script>