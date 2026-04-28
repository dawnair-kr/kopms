<template>
<div>
    <v-row no-gutters align="center" justify="center" class="pageperrows file-list">
      <v-col align="left" class="px-0" style="overflow-x: auto">
        
        <v-data-table class="border custom-table" :headers="getFileHeaders()" :items="files" :page="currentPage" 
          fixed-header
          hide-default-footer
          item-value="name" :loading="loading" color="#ff0000" :items-per-page="pagePerRow" hide-actions>

          <template v-slot:item.title="{ item }">
            <div v-if="item.status != 'upload'" class="d-flex justify-start">
              <span class="text-subtitle-2 font-weight-bold text-light-blue-darken-4 ">{{ item.title }}</span>
            </div>
            <div v-if="item.status == 'upload'" class="d-flex justify-start">
              <span class="text-subtitle-2 font-weight-bold text-black">
                {{ item.title }}</span>
            </div>
          </template>
          
          <template v-slot:item.taskTypeName="{ item }">
            <div v-if="item.status != 'upload'" class="d-flex justify-start">
              <span class="text-subtitle-2 font-weight-bold text-light-blue-darken-4 ">{{ item.taskTypeName }}</span>
            </div>
            <div v-if="item.status == 'upload'" class="d-flex justify-start">
              <span class="text-subtitle-2 font-weight-bold text-black">
                {{ item.taskTypeName }}</span>
            </div>
          </template>

          <template v-slot:item.taskName="{ item }">
            <div v-if="item.status != 'upload'" class="d-flex justify-start">
              <span class="text-subtitle-2 font-weight-bold text-light-blue-darken-4 ">{{ item.taskName }}</span>
            </div>
            <div v-if="item.status == 'upload'" class="d-flex justify-start">
              <span class="text-subtitle-2 font-weight-bold text-black">
                {{ item.taskName }}</span>
            </div>
          </template>

          <template v-slot:item.fileName="{ item }">
            <div v-if="item.status != 'upload'" class="d-flex justify-start">
              <a href="javascript:void(0);" style="text-decoration: none; color: #0000ff;" @click="fileDownloadHandler(item)">
                <span class="text-subtitle-2 font-weight-bold text-light-blue-darken-4 ">{{ item.fileName }}</span>
              </a>
            </div>
            <div v-if="item.status == 'upload'" class="d-flex justify-start">
              <span class="text-subtitle-2 font-weight-bold text-black">
                {{ item.fileName }}</span>
            </div>
          </template>

          <template v-slot:item.checked="{ item }">
            <v-checkbox v-if="item.status !== 'upload'"
              v-model="item.checked"
              true-value="Y"
              false-value="N"
              density="compact"
              hide-details
            />
          </template>

          <template v-slot:item.no="{ item }">
            <span v-if="item.status != 'upload'" class="text-subtitle-2 text-black ">{{ item.no }}</span>
            <v-icon v-if="item.status == 'upload'" size="30" color="red">{{ 'mdi-new-box' }}</v-icon>
          </template>

          <template v-slot:item.fileSize="{ value }">
            <div class="d-flex justify-end">{{ formatBytes(value) }}</div>
          </template>

          <template v-slot:item.fileExt="{ value }">
            <v-icon>{{ icons[value.toLowerCase()] || 'mdi-file-outline' }}</v-icon>
          </template>

          <template v-slot:item.jobs="{ item }">
            <v-btn class="" variant="text" color="grey-darken-2" density="comfortable" icon="mdi-delete-forever" size="small" @click="deleteFile(item)"></v-btn>
          </template>

          <template v-slot:loading>
            <v-skeleton-loader type="table"></v-skeleton-loader>
          </template>

          <template v-slot:no-data>
            <v-row no-gutters justify="center" align="center" class="my-2">
              <v-col align="center">
                <span class="text-subtitle-1 text-black">등록된 파일이 없습니다</span>
              </v-col>
            </v-row>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <v-row no-gutters align="center" justify="center" class="mx-1 mt-0 border-b">
        <v-col align="left" cols="3" class="pa-1" style="display: flex">
            <v-select v-model="pagePerRow" variant="outlined" rounded="md" hide-details hide-no-data class="pageperrows" :items="pagePerRows"
                style="--v-input-control-height: 30px; --v-field-padding-top: 4px; --v-input-padding-top: 2px; max-width: 100px;" :menu-props="{ 'content-props': { 'class': 'pageperrows' } }">

                <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props"></v-list-item>
                </template>
                <template v-slot:append>Rows</template>
            </v-select>
        </v-col>

        <v-col align="center" class="pa-1">
            <v-pagination :model-value="currentPage"
                @update:model-value="$emit('update:currentPage', $event)"
                :length="getPageCount" 
                rounded="circle" :total-visible="7" show-first-last-page size="small" first-icon="mdi-page-first" prev-icon="mdi-menu-left"
                next-icon="mdi-menu-right" last-icon="mdi-page-last">
            </v-pagination>
        </v-col>

        <v-col class="pa-1 d-flex justify-end">
            <v-btn class="pa-1" variant="text" density="comfortable" size="large" @click="downloadSelectedHandler()">
                <v-icon>mdi-tray-arrow-down</v-icon>
                선택파일 다운로드
            </v-btn>
        </v-col>
    </v-row>

    <v-row v-if="enableUpload" no-gutters class="file-list" align="center" justify="center">
        <v-col align="center" class="px-2 pt-1 pb-2">
            <v-sheet border="lg dotted" class="pa-2" rounded="md" max-width="600" min-width="250" height="100" ref="dropzone">
                <p><span class="text-subtitle-2 text-disabled font-weight-bold">파일 업로드</span></p>
                <p><span class="text-subtitle-2 text-disabled font-weight-bold">파일을 드래그 하거나 선택하여 등록하세요.</span></p>
                <v-btn class="pb-2" variant="text" density="comfortable" icon="mdi-plus-circle-outline" size="large" @click="$refs.inputUpload.click()"></v-btn>
                <input v-show="false" ref="inputUpload" type="file" multiple @change="add" />
            </v-sheet>
        </v-col>
    </v-row>

</div>
</template>

<script setup>

</script>

<script>
// import { mapState } from 'pinia';
import { useUserStore } from '@/store/user.js'; // 1. 스토어 가져오기
import { formatBytes } from "@/util/fmt";
const imageMimeTypes = ["image/png", "image/jpeg"];

export default {

  props: {
    // files: { type: Object, default: [], },
    files: { type: Array, default: () => [] },
    pagePerCount: { type: Number, default: 5, },    // 페이지당 보여줄 개수
    currentPage: { type: Number, default: 1 },      // 현재 페이지 (부모와 .sync 연결 권장)
    
    enableUpload: { type: Boolean,default: true,},  // enableUpload = false - 조회전용
  },
  
  components: {

  },

  computed: {
    // 2. 다른 화면에서도 똑같이 등록 (this.userStore로 접근 가능)
    userStore() {
      return useUserStore();
    },

    getPageCount() {      
      // old
      //if (!this.pagePerRow || this.pagePerRow <= 0) return 1;
      //return Math.ceil(this.files.length / this.pagePerRow);
      // New
      // files가 없거나 빈 배열일 때 처리
      if (!this.files || this.files.length === 0) return 1;
      // pagePerRow가 0이거나 없을 때 처리
      const rowsPerPage = this.pagePerRow || this.pagePerCount || 5;
      return Math.ceil(this.files.length / rowsPerPage);
      
    },

  },

  watch: {
    pagePerCount(newVal) {
      this.pagePerRow = newVal;
    },
    // 페이지 변경 시 부모에게 알림
    handlePageChange(newPage) {
      this.$emit('update:currentPage', newPage); 
      // 부모는 @update:currentPage="parentVar = $event"로 받음
    },

    // 전체 파일 배열이 변경될 때(삭제 등) 실행
    files: {
      deep: true,
      handler(newVal) {
        // 데이터 삭제로 인해 현재 페이지가 최대 페이지보다 커진 경우
        if (this.currentPage > this.totalPage) {
          // 부모에게 변경된 페이지 번호를 알림 (자동으로 한 페이지 뒤로 이동)
          this.$emit('update:currentPage', this.totalPage);
        }
      }
    }

  },
   
  mounted() {
    
    //console.log("mounted :", "FileList.vue");
    //console.log("mounted :enableUpload - ", this.enableUpload);

    if (this.enableUpload == true) {
      this.$el.addEventListener("dragenter", this.dragenter);
      this.$el.addEventListener("dragover", this.dragover);
      this.$el.addEventListener("dragleave", this.dragleave);
      this.$refs.dropzone.$el.addEventListener("drop", this.drop);
    }
  },

  beforeUnmount() {
    
    if (this.enableUpload == true) {
      this.$el.removeEventListener("dragenter", this.dragenter);
      this.$el.removeEventListener("dragover", this.dragover);
      this.$el.removeEventListener("dragleave", this.dragleave);
      this.$refs.dropzone.$el.removeEventListener("drop", this.drop);
    }
  },

  methods: {
    
    fileDownloadHandler(item) {
      
      //this.$log.debug(" fileDownloadHandler - item : " , item);

      let fileData = {
        attachFileSeq: item.attachFileSeq, 
        orderNo: item.orderNo, 
        fileSeq: item.fileSeq, 
        //saveFileLoc: item.saveFileLoc,
        fileName: item.fileName,
        //saveFileNm: item.saveFileNm
      };

      this.$br_trans([{
        url: "/kopms-api/file/download",
        method: "post",
        data: fileData,
        options: {
          responseType: 'blob'
        }
        //isWait: false,
      }], (url, code, msg, data, fileNm) => {
        
        // console.log("fileDownloadHandler :: data : " , data);  
        // console.log("fileDownloadHandler :: code : " , code);  
        // console.log("fileDownloadHandler :: msg : " , msg);  
        this.$log.debug(" fileDownloadHandler - fileNm : " , fileNm);

        if (code == 0) {

          if (typeof window.navigator.msSaveBlob !== 'undefined') {
            window.navigator.msSaveBlob(data, fileNm);
          } else {
            let URL = window.URL || window.webkitURL;
            var fileURL = URL.createObjectURL(data);
            var fileLink = document.querySelector("a.wg-download");

            if (!fileLink) {
              fileLink = document.createElement('a');
              fileLink.className = "wg-download";
              document.body.appendChild(fileLink);
            }

            fileLink.href = fileURL;
            // Http Header에 파일명을 가져오려면 CORS를 적용하고, HTTPS로 통신해야한다.
            // 운영서버로 넘기는 경우에는 ENV를 확인해서 적용해야 한다.
            // if (process.env.NODE_ENV === 'development') {
            if (import.meta.env.MODE === 'development') {
              fileLink.setAttribute('download', item.fileName);
            }
            else {
              fileLink.setAttribute('download', item.fileName);
            }

            fileLink.click();
            
            // 메모리 해제
            window.URL.revokeObjectURL(fileURL);
          }
        }
        //else if (code == -902) {
        else if (code == 902) {
          //this.$log.debug(" fileDownloadHandler - code : " , code);
          //this.$log.debug(" fileDownloadHandler - msg : " , msg);
          
          this.$dialog.error({
            title: "알림",
            text: msg,
            persistent: true
          }).then(res => {
          });
        }
      });
    },

    // Selected : Zip
    downloadSelectedHandler() {
      
      const selectedDown = this.files.filter(f => f.checked=='Y');
      //this.$log.debug(" downloadSelectedHandler - selectedDown : " , selectedDown);

      if (!selectedDown.length) {
        this.$dialog.error({
          title: "알림",
          text: "선택된 파일이 없습니다."
        });
        return;
      }

      const fileSeqList = selectedDown.map(f => ({
                                                fileSeq: f.fileSeq,
                                                fileName: f.fileName
                                              }));
      //this.$log.debug(" downloadSelectedHandler - fileSeqList : " , fileSeqList);      
      
      this.$br_trans([{
        url: "/kopms-api/file/downloadZip",
        method: "post",
        data: fileSeqList,
        options: {
          responseType: 'blob'    // 파일 다운로드 모드
        }
        //isWait: false,
      }], (url, code, msg, data, fileNm, failList) => {

        this.$log.debug(" Call back downloadSelectedHandler - data : " , data);      
        //this.$log.debug(" Call back downloadSelectedHandler - fileNm : " , fileNm);      

        if (code == 0) {

          if (typeof window.navigator.msSaveBlob !== 'undefined') {   // IE 대응
            window.navigator.msSaveBlob(data, fileNm);
          } else {
            let URL = window.URL || window.webkitURL;
            var fileURL = URL.createObjectURL(data);
            var fileLink = document.querySelector("a.wg-download");

            if (!fileLink) {
              fileLink = document.createElement('a');
              fileLink.className = "wg-download";
              document.body.appendChild(fileLink);
            }

            fileLink.href = fileURL;
            // Http Header에 파일명을 가져오려면 CORS를 적용하고, HTTPS로 통신해야한다.
            // 운영서버로 넘기는 경우에는 ENV를 확인해서 적용해야 한다.
            // if (process.env.NODE_ENV === 'development') {
            if (import.meta.env.MODE === 'development') {
              fileLink.setAttribute('download', fileNm || "files.zip");
            }
            else {
              fileLink.setAttribute('download', fileNm || "files.zip");
            }

            fileLink.click();
            // console.log("-------------------1-----------------");
            // console.log("failList :: ", failList);
            // console.log("-------------------2-----------------");
            if ( failList ) {
                this.$dialog.message.success('다운로드 실패 파일 : [' + failList + ']');  
            } else {
                //this.$dialog.message.success('다운로드 성공');  
            }
            
            // 메모리 해제
            window.URL.revokeObjectURL(fileURL);
          }
        }
        //else if (code == -902) {
        else if (code == 902) {
          //this.$log.debug(" downloadSelectedHandler - code : " , code);
          //this.$log.debug(" downloadSelectedHandler - msg : " , msg);
          
          this.$dialog.error({
            title: "알림",
            text: msg,
            persistent: true
          }).then(res => {
          });
        }
      });
    },

    deleteFile(item) {
      //this.$log.debug(" deleteFile - item : " , item);
      // const index = this.files.findIndex((element, index, array) => {
      //   return element.fileName == item.fileName && element.fileSize == item.fileSize
      // });

      // 1. item 객체에서 fileKey 추출
      const targetKey = item.fileKey;

      // 2. 리스트에서 인덱스 찾기 (fileKey 기반으로 정확한 대상 식별)
      const index = this.files.findIndex(f => f.fileKey === targetKey);

      if (index < 0) return;
      // 파일이 업로드 대상이면 서버는 호출하지 않음.
      if (item.status == "upload") {
        // let file = this.files.splice(index, 1);
        
        // 메모리 저장소(orgUploadFiles)에서 실제 파일 객체 제거
        if (this.orgUploadFiles && this.orgUploadFiles[targetKey]) {
          delete this.orgUploadFiles[targetKey];
        }
        // UI 리스트에서 제거
        this.files.splice(index, 1);
        this.$emit('addFiles', this.files); // 부모에게 변경 알림
        return;

      }
      //this.$log.debug("FileList.vue :: item.writerId ~~~", item.writerId);
      //this.$log.debug("FileList.vue :: userStore.name ~~~", this.userStore.memberInfo.empno);
      // A : 시스템관리자, V : 업무관리자
      const userGubun = this.userStore.memberInfo.userGubun; 
      if ( userGubun !== 'A' && userGubun !== 'V' ) {
        if ( item.writerId !== this.userStore.memberInfo.empno ) {
          this.$dialog.error({
            title: "알림",
            text: "삭제권한이 없습니다.[등록자만 삭제 가능]"
          });
          return;
        }
      } 
      
      // 삭제 대상 키 : 기저장 데이터
      const delFileSeq = item.attachFileSeq;
      const delOrderNo = item.orderNo;

      let fileData = {
        attachFileSeq: delFileSeq, 
        orderNo: delOrderNo, 
        fileSeq: item.fileSeq, 
        fileName: item.fileName,
      };

      this.$br_trans([{
        url: "/kopms-api/file/deleteFile",
        method: "post",
        data: fileData,
        //isWait: false,
      }], (url, code, msg, data) => {

        if (code == 0) {
          this.$dialog.message.success("파일이 삭제되었습니다.");

          // old - 1. 로컬 배열에서 삭제 (화면 즉시 반영)
          //let file = this.files.splice(index, 1);
          //this.$emit('addFiles', this.files); // 부모에게 변경 알림
          // New 
          // file Uniq 로 찾기.
          const delIdx = this.files.findIndex(f => f.attachFileSeq === delFileSeq && f.orderNo === delOrderNo ); 
          if (delIdx > -1) {
            this.files.splice(delIdx, 1);
          }
          // 전체 개수 대비 마지막 페이지 계산
          const totalCount = this.files.length;
          const maxPage = Math.ceil(totalCount / this.pagePerRow) || 1;

          if (this.currentPage > maxPage) {
            this.currentPage = maxPage; // 현재 페이지를 마지막 페이지로 강제 이동
          }

        }
      });
    },

    dragover(e) {

      e.preventDefault();
      this.$refs.dropzone.$el.classList.add('drop-zone');
      let vaild = e.dataTransfer.types.indexOf('Files') >= 0;
      if (!vaild) {
      }
      else {
      }
    },
    dragenter(e) {
      this.$refs.dropzone.$el.classList.add('drop-zone');
    },
    dragleave(e) {
      this.$refs.dropzone.$el.classList.remove('drop-zone')
    },

    // async drop(e) {
    //   this.$refs.dropzone.$el.classList.remove('drop-zone')
    //   e.preventDefault();

    //   let files = e.dataTransfer.files;

    //   const fileMaps = await this.filesMap(files, "upload");
    //   for (let i = 0; i < fileMaps.length; i++) {
    //     const file = {
    //       file: fileMaps[i].file,
    //       fileName: fileMaps[i].fileName,
    //       fileType: fileMaps[i].fileType,
    //       fileSize: fileMaps[i].fileSize,
    //       fileExt: fileMaps[i].fileExt,
    //       status: fileMaps[i].status,
    //     }
    //     this.files[this.files.length] = file;

    //     // 변경된 전체 파일 배열을 부모에게 전달
    //     this.$emit('addFiles', this.files);

    //   }
    // },
    // async add(event) {
    //   let addFiles = Array.from(event.target.files);
    //   const fileMaps = await this.filesMap(addFiles, "upload");

    //   for (let i = 0; i < fileMaps.length; i++) {
    //     const file = {
    //       file: fileMaps[i].file,
    //       fileName: fileMaps[i].fileName,
    //       fileType: fileMaps[i].fileType,
    //       fileSize: fileMaps[i].fileSize,
    //       fileExt: fileMaps[i].fileExt,
    //       status: fileMaps[i].status,
    //     }
    //     this.files[this.files.length] = file;
    //   }
      
    //   // 변경된 전체 파일 배열을 부모에게 전달
    //   this.$emit('addFiles', this.files);
    //   this.$refs.inputUpload.value = "";
      
    // },

    async drop(e) {
      this.$refs.dropzone.$el.classList.remove('drop-zone');
      e.preventDefault();

      const droppedFiles = Array.from(e.dataTransfer.files);
      let duplicateCount = 0;
      const newFilesToAdd = [];

      for (const file of droppedFiles) {
        // 1. 하이브리드 고유 키 생성 (파일명 + 사이즈 + 수정일시)
        const newFileKey = `${file.name}_${file.size}_${file.lastModified}`;

        // 2. 전체 리스트(this.files)에서 중복 여부 확인
        const isDuplicate = this.files.some(f => f.fileKey === newFileKey);

        if (isDuplicate) {
          duplicateCount++;
          continue; // 중복된 파일은 리스트에 넣지 않고 스킵
        }

        // 3. 중복이 아닌 경우에만 처리
        // filesMap 함수 내부에서 this.orgUploadFiles[fileKey] = file 처리가 되어야 합니다.
        const mappedResult = await this.filesMap([file], "upload");
        if (mappedResult && mappedResult.length > 0) {
          newFilesToAdd.push(mappedResult[0]);
        }
      }

      // 4. 반응성을 유지하며 리스트 업데이트
      if (newFilesToAdd.length > 0) {
        // 기존 배열에 새로운 파일들을 합침 (Vue 3 반응성 보장)
        this.files.push(...newFilesToAdd);
        
        // 부모에게 최종 업데이트된 전체 리스트 전달
        this.$emit('addFiles', this.files);
      }

      // 5. 중복 알림
      if (duplicateCount > 0) {
        this.$dialog.message.warn(`${duplicateCount}개의 중복된 파일은 제외되었습니다.`);
      }
    },

    async add(event) {
      let addFiles = Array.from(event.target.files);
      let duplicateCount = 0;
      
      for (const file of addFiles) {
        // 1. 새 파일의 고유 키 생성
        const newFileKey = `${file.name}_${file.size}_${file.lastModified}`;

        // 2. 기존 리스트(this.files) 또는 메모리 저장소에 키가 있는지 확인
        const isDuplicate = this.files.some(f => f.fileKey === newFileKey);

        if (isDuplicate) {
          duplicateCount++;
          continue; // 중복된 파일은 건너뜀
        }

        // 3. 중복이 아닐 때만 처리 (기존 filesMap 로직 실행)
        const fileMap = await this.filesMap([file], "upload");
        this.files.push(fileMap[0]);
      }

      if (duplicateCount > 0) {
        this.$dialog.message.warn(`${duplicateCount}개의 중복된 파일은 제외되었습니다.`);
      }

      this.$emit('addFiles', this.files);
      this.$refs.inputUpload.value = ""; // 동일 파일 재선택 가능하게 초기화
    },

    async filesMap(files, status) {
      let totalFileSize = 0;
      let promises = Array.from(files).map(file => {
        totalFileSize += file.size;

        // 1. 파일 고유 키 생성: 이름 + 사이즈 + 마지막수정일 [밀리초]
        const fileKey = `${file.name}_${file.size}_${file.lastModified}`;
        // 2. 상태 관리 저장소에 실제 파일 객체 저장 (참조 고정)
        this.orgUploadFiles[fileKey] = file;

        let result = {
          file,
          fileKey: fileKey,   // 참조용 키 추가 : 이 키를 프론트엔드 전역에서 ID로 사용
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileExt: file.name.split(".").pop(),
          status,
          // DB PK 정보 (신규일 땐 null)
          attachFileSeq: null,
          orderNo: null,
        };
        return new Promise(resolve => {
          if (!imageMimeTypes.includes(result.type)) {
            return resolve(result);
          }
          // 이미지인 경우에.....
          var reader = new FileReader();
          reader.onload = function (e) {
            let tempImage = new Image();
            tempImage.src = e.target.result; //data-uri를 이미지 객체에 주입
            tempImage.onload = function () {
              result.image_width = tempImage.width;
              result.image_height = tempImage.height;
              let w_size = 34;
              let h_size = 34;
              if (result.image_width > 34 && result.image_height > 34) {
                w_size = result.image_width;
                h_size = result.image_height;
              }
              let canvas = document.createElement('canvas');
              let canvasContext = canvas.getContext("2d");
              //캔버스 크기 설정
              canvas.width = w_size; //가로 100px
              canvas.height = h_size; //세로 100px
              canvasContext.drawImage(this, 0, 0, w_size, h_size);
              var dataURI = canvas.toDataURL("image/png");
              result.snap_image = dataURI;
              resolve(result);
            }
            //result.preview = e.target.result;

          };
          reader.readAsDataURL(file);
        });
      });
      return await Promise.all(promises);
    },

    getFileHeaders() {

      const headers = [
        { title: '선택', key: 'checked', width: '60', align: 'center', sortable: false },       // checked
        { title: '번호', key: 'no', width: '60', align: 'center', sortable: false },            // No
        { title: '제목', key: 'title', align: 'center' },                                       // title
        { title: '1차분류', key: 'taskTypeName', align: 'center' },                             // taskTypeName
        { title: '2차분류', key: 'taskName', align: 'center' },                                 // taskName
        { title: '파일명', key: 'fileName', align: 'center' },                                  // Name
        { title: '등록일자', key: 'writeDate', width: '100', align: 'center' },                 // Created Date
        { title: '파일크기', key: 'fileSize', width: '100', align: 'center', sortable: false }, // Size
        { title: '유형', key: 'fileExt', width: '60', align: 'center', sortable: false },       // Type
        { title: '', key: 'jobs', width: '40', },
      ];

      return headers;
    }
  },
  data() {

    return {
      // enableUpload: true,
      formatBytes,
      // files: this.files,
      icons: {
        zip: "mdi-folder-zip-outline",
        rar: "mdi-folder-zip-outline",
        htm: "mdi-language-html5",
        html: "mdi-language-html5",
        js: "mdi-nodejs",
        json: "mdi-json",
        md: "mdi-markdown",
        pdf: "mdi-file-pdf-box",
        png: "mdi-file-image",
        jpg: "mdi-file-image",
        jpeg: "mdi-file-image",
        mp4: "mdi-filmstrip",
        mkv: "mdi-filmstrip",
        avi: "mdi-filmstrip",
        wmv: "mdi-filmstrip",
        mov: "mdi-filmstrip",
        txt: "mdi-file-document-outline",
        xls: "mdi-file-excel",
        xlsx: "mdi-file-excel",
        pptx: "mdi-file-powerpoint",
        ppt: "mdi-file-powerpoint",
        docx: "mdi-file-document",
        doc: "mdi-file-document",
      },

      filters: [],
      filterStep: [],
      selectedDown: [],   // 
      //currentPage: 1,   // 부모의 currentPage 를 받아서 처리하기 위해 주석처리
      options: {},
      pagePerRows: [5, 10, 15, 20, 30],
      pagePerRow: this.pagePerCount,
      loading: false,
      orgUploadFiles: {}, // 실제 전송할 File 객체만 따로 보관하는 저장소
    }
  },
}
</script>

<style lang="scss">
.file-list {
  .v-data-table .v-table__wrapper .v-data-table__th.v-data-table__td {
    background-color: #efefef !important;

    .v-data-table-header__content {
      color: #000000;
      font-size: 0.9rem;
      font-weight: bold;
    }
  }

  .v-data-table .v-select.v-input--density-default .v-field--variant-outlined {
    --v-field-padding-bottom: 0px;
  }

  .v-table .v-table__wrapper>table>thead>tr>th:not(:last-child) {
    border-right: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  .v-table .v-table__wrapper>table>tbody>tr>td:not(:last-child),
  .v-table .v-table__wrapper>table>tbody>tr>th:not(:last-child) {
    border-right: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  .drop-zone {
    background-color: #f4f5a1;
  }

  .custom-table {
    /* 최대 높이를 설정하고, 내용이 넘칠 때만 스크롤 생성 */
    max-height: calc(80vh - 300px); 
    display: flex;
    flex-direction: column;
  }
/* 데이터 영역이 남은 높이를 다 차지하고 스크롤이 생기도록 강제 */
.custom-table :deep(.v-table__wrapper) {
  flex-grow: 1;
  overflow-y: auto;
}
  /* 데이터 영역(tbody)의 스크롤바 디자인을 조절하고 싶을 때 유용합니다 */
  :deep(.v-table__wrapper) {
    overflow-y: auto;
  }

}
</style>