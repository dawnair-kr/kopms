<template>
  <v-container>
    <v-row align="center" justify="center">
      <v-col cols="auto">
        <v-btn density="compact" @click="exportEx" >Export Excel </v-btn>
      </v-col>
      
      <v-col cols="auto">
        <v-btn density="default" @click="tranMenus" >Tr - Export Excel : 메뉴정보</v-btn>
      </v-col>

      <v-col cols="auto">
        <v-btn density="default" @click="tranMenuDownload" >downloadExcel : 대용랑</v-btn>
      </v-col>
      
    </v-row>
    <v-row align="center" justify="center">
      <v-col cols="auto">
        <input
              type="file"
              ref="fileInput"
              style="display: none"
              accept=".xlsx, .xls"
              @change="handleImport"
            />
            <v-btn
              prepend-icon="mdi-upload"
              :loading="isUploading"
              :disabled="isUploading"
              @click="triggerFileInput"
            >
              엑셀 업로드
            </v-btn>
      </v-col>
      
      <v-col cols="auto">
        <v-file-input
          label="엑셀 파일 선택"
          accept=".xlsx, .xls"
          prepend-icon="mdi-microsoft-excel"
          variant="filled"
          @change="handleImport"
          @click:clear="onClear"
        ></v-file-input>
      </v-col>
      
    </v-row>

  </v-container>
</template>


<script setup>
import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';

import { ref } from 'vue';

const fileInput = ref(null);

</script>


<script>

export default {
  
  props: {
    // dataComm: {
    //   type: Object,
    //   default: {}
    // },
  },

  components: {
  },

  watch: {
  },

  computed: {
  },

  mounted() {
    
  },

  methods: {

    exportEx() {
      this.$log.debug(" exportEx ~~~");
      
      const data = this.dataExcel;
      const fileName = 'export.xlsx';
      const sheetName = '사번 리스트';

      this.exportExcel(data, fileName, sheetName);

    },

    exportExcel ( data, fileNm, sheetNm) {
      
      this.$log.debug(" exportExcel - fileNm : " , fileNm , " :::: - sheetNm : " , sheetNm );

      const fileName = `${fileNm}_${new Date().getTime()}.xlsx`;
      // const nowDt = new Date().toLocaleString('ko-KR', { hour12: false }).replace(/[^0-9]/g, "");      
      // const fileName = `${fileNm}_${nowDt}.xlsx`;
      const sheetName = sheetNm == null ? 'Sheet1' : sheetNm;
      
      // 1. JSON → Sheet 변환
      const worksheet = XLSX.utils.json_to_sheet(data);

      // 1.2. 컬럼 너비 자동 조절 (선택사항: 데이터 길이에 맞춰 너비 계산)
      const colWidths = Object.keys(data[0] || {}).map(key => ({
                        wch: Math.max(key.length, ...data.map(obj => obj[key]?.toString().length || 0)) + 5
                      }));
      worksheet['!cols'] = colWidths;

      // 2. Workbook 생성 및 시트 추가
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // 3. 엑셀 파일을 바이너리(Buffer) 형태로 변환
      const excelBuffer = XLSX.write(workbook, {
                                    bookType: 'xlsx',
                                    type: 'array'
                                  });
      
      // 4. Blob 객체 생성
      const excelType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      const blob = new Blob([excelBuffer], {
                            //type: 'application/octet-stream'
                            type: excelType
                          });

      this.$fileSaver.saveAs(blob, fileName);

    },

    tranMenus() {
      this.$log.debug(" tranMenus ~~~");
      // Post
      const inputData = {
        userType: '',
        useYn: 'Y',
      };

      this.$br_trans([
        {
          url: "/kopms-api/getMenus",
          method: "post",
          data: inputData,
          //isWait: false,
        }
      ], (url, code, msg, data) => {
        this.$log.debug(" tranMenus - url : " , url , " :::: - code : " , code , " :::: - msg : " , msg);
        this.dataMenus = data.menus;

        // 서버에서 온 영문 Key를 엑셀용 한글 헤더로 매핑.
        const excelData = this.dataMenus.map(item => ({
              '메뉴 코드': item.menuCode,
              '메 뉴 명': item.menuName,
              '메뉴 No': item.menuNo,
              '메뉴 레벨': item.level, 
              '메뉴 Url': item.menuUrl, 
              '메뉴 경로': item.menuPath, 
              '최상위메뉴 No': item.topNo,
              '상위메뉴 No': item.upMenuNo,
              '메뉴 이미지': item.menuImage, 
              'Leaf 여부': item.isLeaf,
              '상위메뉴 리스트': item.topMenuList, 
              '사용유무': item.useYn, 
            }));

        const fileName = 'exportMenu';
        const sheetName = '메뉴정보';
        
        this.exportExcel(excelData, fileName, sheetName);
        
      });

    },

    tranMenuDownload() {
      this.$log.debug(" tranMenuDownload ~~~");
      // Post
      const inputData = {
        userType: '',
        useYn: 'Y',
      };

      this.$br_trans([
        {
          url: "/kopms-api/downloadMenusExcel",
          method: "post",
          data: inputData,
          //isWait: false,
          // [중요] 서버에서 파일 스트림을 보내므로 blob으로 받아야 함
          options: { responseType: 'blob' }
        }
      ], (url, code, msg, data, filename) => {
        //this.$log.debug(" tranMenuDownload - url : " , url , " :::: - code : " , code , " :::: - msg : " , msg);
        //this.$log.debug(" data : " , data);
        
        if (code === 0 && data instanceof Blob && data.type !== 'application/json') {
          // 4. 성공 시 file-saver를 이용해 저장
          // 서버 응답 헤더(Content-Disposition)에 파일명이 있다면 filename을 사용
          const saveName = filename || `Download.xlsx`;
          // const saveName = `Menu_List_${new Date().getTime()}.xlsx`;
          
          this.$fileSaver.saveAs(data, saveName);          
          
        } else {
          
          this.$dialog.error({
            title: "다운로드",
            //text: data.detail,
            text: msg,
            persistent: true
          }).then(res => {
          });
          
        }        
        
      });

    },
    
    /**
     * 1. 버튼 클릭 시 숨겨진 input을 강제로 클릭시키는 함수
     */
    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    /**
     * 2. 파일이 선택되었을 때 실행되는 메인 로직
     */
    handleImport( event ) {
      this.$log.debug(" handleImport ~~~");
      
      // Vuetify의 @change 이벤트 객체에서 파일을 가져옵.
      const file = event.target.files[0];
      if ( !file ) return;
      
      this.isUploading = true; // 로딩 시작
      // 이후 XLSX.read 로직 실행 (앞서 가이드드린 내용과 동일)
      this.$log.debug("선택된 파일:", file.name);

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target.result;
          // 1. 바이너리 형태로 엑셀 읽기
          const workbook = XLSX.read(data, { type: 'array' });
          // 2. 첫 번째 시트 이름 가져오기
          const firstSheetName = workbook.SheetNames[0];          
          // 3. 시트 데이터를 JSON으로 변환
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          console.log("변환된 데이터:", jsonData);

          const mappedData = jsonData.map(item => ({
                            menuCode: item['메뉴코드'],
                            menuNo: item['메뉴번호'],
                            menuName: item['메뉴명'],
                            menuLevel: item['메뉴레벨'],
                            upMenuNo: item['상위메뉴번호'],
                            menuUrl: item['메뉴URL'],
                            menuImage: item['메뉴이미지'],
                            useYn: item['사용여부'],
                            topMenuList: item['상위메뉴목록'],
                            topNo: item['최상위번호']
                          }));

          console.log("저장대상 데이터:", mappedData);

          // 4. 서버 전송
          this.saveImportMenu(mappedData);
        
        } catch (error) {
          console.error("엑셀 파일 읽기 오류:", error);
          // 필요 시 Vuetify 다이얼로그나 알림 표시
        } finally {
          this.isUploading = false; // 로딩 종료
          // [중요] 같은 파일 재업로드 가능하도록 input 초기화
          event.target.value = '';
        }
      
      };

      reader.onerror = (error) => {
        console.error("파일 로드 오류:", error);
        this.isUploading = false;
      };

      reader.readAsArrayBuffer(file);

    },

    /**
     * 2.1 파일 선택 취소 
     */
    onClear(  ) {
      this.$log.debug(" 파일 선택 취소 ~~~");
    },

    // Import Data 저장 
    saveImportMenu(mappedData) {
      this.$log.debug("saveImportMenu ::  ");       

      const inputData = {    
        importMenu: mappedData
      };

      this.loading = true;
      this.$br_trans([
        {
          url: "/kopms-api/insertMenu",
          method: "post",
          data: inputData,
          //isWait: false,
        }
      ], (url, code, msg, data) => {
        this.loading = false;
        this.$log.debug("insertMenu - url : ", url , " code : ", code , "msg : " , msg);  
        
        if (code == 0) {
          
          this.$log.debug("insertMenu - data : " , data);  

        } else {
          this.$dialog.error({
            title: "시스템 오류",
            text: data.detail
          }).then(res => {

          });
        }        
      });      
    },
    

  },

  data() {

    return {
      dataExcel: [
                  { 사번: '202401', 이름: '홍길동', 부서: '개발팀' },
                  { 사번: '202402', 이름: '김철수', 부서: '인사팀' },
                ],
      dataMenus: [],
      // 업로드 중 버튼 로딩 상태를 제어하는 변수
      isUploading: false,
    }
  
  }

}
</script>