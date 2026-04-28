<template no-gutters>
  
  <v-container class="main-page-wrapper">
    <!-- 메인 컨텐츠 영역 : Tree, Detail-->
     <!--  :key="treeItems.length"  -->
    <v-row>
      <v-col cols="4">
        <v-card class="flex-grow-1 bg-white" variant="outlined">
          <v-row no-gutters justify="center" align="center" class="ma-2">
            <v-col align="right" >
              <!--
              <v-btn variant="outlined" density="compact" prepend-icon="mdi-plus" class="mx-1 text-none text-subtitle-4 font-weight-bold" flat text="신규" @click="addDept"/>
              <v-btn variant="outlined" density="compact" prepend-icon="mdi-content-save-plus-outline" class="mx-1 text-none text-subtitle-4 font-weight-bold" flat text="저장" 
                :disabled="isReadonly && viewMode === 'view'"
                @click="saveDept"/>
              -->
              <v-btn variant="outlined" density="compact" prepend-icon="mdi-plus" class="mx-1 text-none text-subtitle-4 font-weight-bold" flat text="트리조회" @click="getDataBoardTree"/>
            </v-col>
          </v-row>
          <!-- <v-row no-gutters justify="center" align="center" class="ma-2">
            <v-col cols="8" class="pl-1">
              <v-text-field variant="outlined" density="compact" hide-details label="부서명을 입력하세요" ref="keyWord" type="text"
                v-model="keyWord" v-on:keydown.enter="setKeydown()"   
              >
              </v-text-field>
            </v-col>
            <v-col align="right" class="pr-1">
              <v-btn variant="outlined" density="compact" prepend-icon="mdi-magnify" class="mr-2" text="검색" @click="setKeydown"/>
            </v-col>
          </v-row> -->
          <v-row class="ma-2">
            <v-col class="px-1">
              <DataTree :tree-items="treeItems" :openNodes="openNodes" :activeNodes="activeNodes"
                @select="onSelectCode" 
                @update:opened="val => openNodes = val"
                @update:activated="val => activeNodes = val"
              />
              <!-- <DataTree :tree-items="treeItems" :openNodes="openNodes" :activeNodes="activeNodes" 
                @select="onSelectDept" 
                @update:opened="val => openNodes = val"
                @update:activated="val => activeNodes = val"
              /> -->
            </v-col>
          </v-row>
        </v-card>
      </v-col>        
      <v-col cols="8">
        
        <v-data-table :headers="headers" :items="dataItems" class="custom-table overflow-y-auto" fixed-header>
        
        <template v-slot:no-data>
          <v-row no-gutters justify="center" align="center" class="my-2">
            <v-col align="center">
              <span class="text-subtitle-1 text-black">데이터가 존재하지 않습니다.</span>
            </v-col>
          </v-row>
        </template>
        
        <template v-slot:bottom>
          <v-divider></v-divider>
          <v-row no-gutters align="center" justify="center" class="mx-1 mt-0">
            <v-col align="center" class="pa-2">
              <v-pagination v-model="currentPage" :length="totalPage" rounded="circle" :total-visible="7" show-first-last-page
                size="small" first-icon="mdi-page-first" prev-icon="mdi-menu-left" next-icon="mdi-menu-right" last-icon="mdi-page-last"
                @update:modelValue="getDataBoard">
              </v-pagination>
            </v-col>
          </v-row>
        </template>

      </v-data-table>

      </v-col>
    </v-row>
    <!-- 메인 컨텐츠 영역 끝 -->    

  </v-container>

</template>

<script setup>
import { ref } from "vue";
//import DataTree from '@/pages/test/DataTree.vue';
import DataTree from '@/views/test/DataTree.vue';
//src\views\test\DataTree.vue
</script>
/** 참조 테이블 : DATA_TYPE
  **** 신규[저장] 시 '부서코드' 생성 룰 필요 
  1. 검색 : 부서 트리 내에서 부서명으로 검색
  2. 수정[저장] : '임시조직' 만 수정 가능
  3. 삭제 : 불가
  4. 신규[저장] : '임시조직' 만 추가 가능
 */

<script>

export default {
  setup() {
  },
  props: {

  },
  components: {
    DataTree,   // tree 컴포넌트 등록
    
  },
  created() {

  },
  beforeMount() {

  },
  watch: {

    //상위 부서 변경 시 
    'selectedDept.upCode'(newUpCode) {
      // if ( !newUpCode ) {
      //   this.selectedDept.minlevelno = "";
      //   return
      // }

      // // 신규/수정일 때만 계산
      // if (this.viewMode === 'view') return;

      // // 상위부서 찾기
      // const parentDept = this.deptCode.find(
      //   dept => dept.deptno === newUpCode
      // )

      // if (parentDept && parentDept.minlevelno) {
      //   this.selectedDept.minlevelno = Number(parentDept.minlevelno) + 1;
      // } else {
      //   // 최상위 부서 선택 시
      //   this.selectedDept.minlevelno = 1;
      // }
    }

  },

  computed: {
    
    isReadonly() {
      return Number( this.selectedDept?.deptGubun ) !== 20;
    },

    filteredDeptCode() {
      // 신규
      // if ( this.viewMode === 'new' ) {
      //   return this.deptCode.filter(
      //     d => d.deptno !== this.selectedDept.deptno
      //   );
      // }
      // // 조회/수정
      // if ( !this.selectedDept.minlevelno ) {
      //   return this.deptCode
      // }

      // return this.deptCode.filter(dept => {
      //   // 자기 자신 제외 및 자신의 레벨보다 작은 경우
      //   return dept.deptno !== this.selectedDept.deptno && 
      //         Number(dept.minlevelno) <= Number(this.selectedDept.minlevelno) 
      // })
    },

  },

  mounted() {

    //this.getDept();
    //this.getDataBoardTree();
    
  },

  data() {
    return {
      dataBoardTree: [ 
        //{
        // brotherOrder : "1"
        // deptno: "COM"
        // isLeaf: 0
        // lvl: 1
        // status: "Y"
        // treeName: "자료실"
        // typeCode: "0000"
        // typeName: "자료실"
        // typeNm: "자료싷"
        // typeNo: "1"
        // typeOrder: "1"
        // typePath: "0000/"
        //},  
      ],
      treeItems: [],
      selectedCode: {
        // brotherOrder : "1"
        // deptno: "COM"
        // isLeaf: 0
        // lvl: 1
        // status: "Y"
        // treeName: "자료실"
        // typeCode: "0000"
        // typeName: "자료실"
        // typeNm: "자료싷"
        // typeNo: "1"
        // typeOrder: "1"
        // typePath: "0000/"
      },  

      // 펼치고(Expand), 선택(Active)
      openNodes: [],    // 자식 트리의 펼침 상태 제어 : 열려있는 노드 목록
      activeNodes: [],  // 자식 트리의 선택 상태 제어 : 선택 활성화된 노드

      paramTypeCode: "",

      currentPage: 1,
      pagePerRow: 20,
      loading: false,
      totalPage: 0,

      headers: [
        { title: "NO", key: "no", minWidth: "", align: "center", sortable: false },
        { title: "제목", key: "title", minWidth: "", align: "center", sortable: false },
        { title: "등록일", key: "regiDate", minWidth: "", align: "center", sortable: false },
        { title: "등록자", key: "empName", minWidth: "", align: "center", sortable: false },
        { title: "조회수", key: "viewCnt", minWidth: "", align: "center", sortable: false },
        
        
      ],
      dataItems: [
        // { cateId: "2110"
        //    dataSeq: 1
        //    empName: "시스템관리자"
        //   empno: "DEV00006"
        //    maxCnt: 1
        //    no: 1
        //    regiDate: "2026-04-16 17:13:13"
        //    title: "정책현황-test",
        //    contents: "정책현황-test CONTENTS",
        //    attachFileSeq:"",
        //    totalPage:1
        //    viewCnt: 0
        // },
        
      ],
      
      // ---- 하기 재사용 체크
      depts: [],
      
      selectedDept: {
        aliasName : "",
        branchYn : "N",
        deptGubun : "",
        deptName : "",
        deptOrder : "1",
        deptPath : "",
        deptno : "",
        hostname : "",
        isLeaf : "",
        level : "",
        manager : "",
        minlevelno : "",
        upCode : "",
      },
      // 신규 입력 or 인지 수정인지 구분 (저장 시 필요)
      viewMode : 'view', // 'view', 'new', 'edit'
      // 트리내 검색 
      keyWord: '',

      

      // 공통코드
      orgType : [],   // 조직구붖
      useType : [],   // 사용구분
      deptCode : [],  // 상위부서 선택용

    };
  },

  methods: {
    
    getDataBoardTree() {
      // this.$log.debug("getDataBoardTree~~~~~~~~~~~~~~~~~~~~~~" ); 
      const inputData = {    
        deptno: "DV01"
      };

      this.loading = true;
      this.$br_trans([
        {
          url: "/kopms-api/databoard/getDataBoardTree",
          method: "post",
          data: inputData,
          //isWait: false,
        }
      ], (url, code, msg, data) => {
        this.loading = false;
        // this.$log.debug("getDept - url : ", url, " code : ", code ,"msg : ", msg);  
        this.$log.debug("data : ", data);
        if (code == 0) {
          
          this.dataBoardTree = data.dataBoardTree;          
          //this.$log.debug("dataBoardTree---------------------------- : ", this.dataBoardTree); 
          this.treeItems = this.buildTree(this.dataBoardTree);          
          //this.$log.debug("treeItems---------------------------- : ", this.treeItems);
          
          // 최초 전체 펼침
          this.openNodes.push(this.treeItems[0]);     // 코드 : 배열 - ["0000", "2000"]

          // "재생에너지사업"  openNodes 지정, activeNodes 지정 , 선택
          const targetCode = '2000';
          // const targetCode = '2104';
          
          // const findNode = this.findNode(this.treeItems, targetCode);
          // const path = this.findPath(this.treeItems, targetCode);
          //  this.$log.debug("findNode  : ", findNode);
          //  this.$log.debug("path  : ", path);
          
          // this.openNodes.push(path);
          // this.activeNodes = [ findNode ];      // 객체
          // this.onSelectCode( findNode );

          // // DOM 렌더 후 스크롤
          // this.$nextTick(() => {
          //   this.scrollToNode(targetCode);
          // });

          //this.selectNodeByCode(targetCode);

        } else {
          this.$dialog.error({
            title: "시스템 오류",
            text: data.detail
          }).then(res => {
          });
        }                
      });
    },

    // tree 구성
    buildTree(data) {
      const map = {};
      const tree = [];

      this.openNodes = [];   // openNodes clear
      this.activeNodes = []; // 선택 해제

      // 1. map 생성
      data.forEach(item => {
        map[item.typeCode] = { 
          ...item, 
          children: item.isLeaf == 0 ? [] : undefined
        };
      });
      
      // 2. 트리 구성
      data.forEach(item => {
        const key = String(item.typeCode);
        const parentKey = item.upTypeCode ? String(item.upTypeCode).trim() : null;

        // 1) ROOT 판단
        //if (!parentKey || parentKey === '0000') {
        if (!parentKey ) {
          tree.push(map[key]);
          // 최상위만 open
          //this.openNodes.push(key);
        // 2) 정상 자식
        } else if (map[parentKey]) {
          map[parentKey].children?.push(map[key]);

        // 3) 부모 없는 데이터 (에러)
        } else {
          console.warn('부모 없음 (데이터 오류):', item);
          // fallback: 루트에 붙이되 open 안함
          tree.push(map[key]);
        }
      });

      // children이 빈 배열인 노드는 Vuetify가 expand 아이콘을 표시하므로,
      // 실제 자식이 없는 리프 노드의 children 키를 제거해 아이콘이 나타나지 않게 함
      const clean = (nodes) => nodes.forEach(n => {
        if (n.children) {
          if (n.children.length === 0) delete n.children;
          else clean(n.children);
        }
      });
      
      clean(tree);
      return tree;

    },

    // 트리에서 해당 노드 찾기 : 노드 객체 전체 리턴
    findNode(nodes, targetCode) {
      for (const node of nodes) {
        if (node.typeCode === targetCode) return node;
        if (node.children) {
          const found = this.findNode(node.children, targetCode);
          if (found) return found;
        }
      }
      return null;
    },

    // 부모 경로 찾기
    findPath(nodes, targetCode, path = []) {
      for (const node of nodes) {
        const newPath = [...path, node.typeCode];

        if (node.typeCode === targetCode) {
          return newPath;
        }

        if (node.children) {
          const found = this.findPath(node.children, targetCode, newPath);
          if (found) return found;
        }
      }
      return null;
    },

    // 코드로 선택 & 스크롤 이동
    // selectNodeByCode(targetCode) {
    //     const node = this.findNode(this.treeItems, targetCode);
    //     if (!node) return;

    //     const path = this.findPath(this.treeItems, targetCode);

    //     // 선택
    //     this.internalActive = [node];

    //     // DOM 렌더 후 스크롤
    //     this.$nextTick(() => {
    //       this.scrollToNode(targetCode);
    //     });
    //   }
    // },

    // 스크롤 이동
    // scrollToNode(code) {
    //   this.$log.debug("scrollToNode --- code  : ", code);
    //   const container = this.$refs.treeRef?.$el;
    //   if (!container) return;

    //   const el = container.querySelector(`[data-key="${code}"]`);
    //   if (!el) return;

    //   el.scrollIntoView({
    //     behavior: 'smooth',
    //     block: 'center'
    //   });
    // },

    onSelectCode(selId) {
      this.$log.debug("onSelectCode :: selId ", selId);

      this.paramTypeCode = selId.typeCode;

      this.getDataBoard( );

    },

    // 자료실 페이징
    getDataBoard( pageNum ) {
      // this.$log.debug("getDataBoard~~~~ typeCode :: " , this.paramTypeCode , " -- pageNum ::", pageNum); 
      if (pageNum == null) pageNum = 1;
      const inputData = {    
        cateId: this.paramTypeCode,
        pageNum: pageNum,
        pagePerRow: this.pagePerRow,
      };

      this.loading = true;

      this.$br_trans([
        {
          url: "/kopms-api/databoard/getDataBoard",
          method: "post",
          data: inputData,
          //isWait: false,
        }
      ], (url, code, msg, data) => {
        this.loading = false;
        
        this.$log.debug("getDept - url : ", url, " code : ", code ,"msg : ", msg);  
        this.$log.debug("data : ", data);

        if (code == 0) {
          
          this.dataItems = data.boardList;

          if (this.dataItems.length > 0) {
            this.maxCnt = this.dataItems[0].maxCnt;
            this.totalPage = this.dataItems[0].totalPage;

            // this.$log.debug("dataItems : ", this.dataItems);  
            // this.$log.debug("dataItems - maxCnt: ", this.dataItems[0].maxCnt);  
            // this.$log.debug("dataItems - totalPage: ", this.dataItems[0].totalPage);  
          
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

    // treeItems 재구성
    listToTree(list) {
      const map = {};
      const tree = [];

      list.forEach(item => {
        map[item.deptno] = { ...item, children: [] };
      });

      list.forEach(item => {
        if (item.upCode && item.upCode != '0000000000') {
          map[item.upCode].children.push(map[item.deptno]);
        } else {
          // 최상위(Root)
          tree.push(map[item.deptno]);
          this.openNodes.push( item.deptno );  // 최상위(Root) 펼침 상태로
        }
      });
      // children이 빈 배열인 노드는 Vuetify가 expand 아이콘을 표시하므로,
      // 실제 자식이 없는 리프 노드의 children 키를 제거해 아이콘이 나타나지 않게 함
      const clean = (nodes) => nodes.forEach(n => {
        if (n.children.length === 0) delete n.children;
        else clean(n.children);
      });
      clean(tree);
      return tree;
    },

    onSelectDept(selId) {
      //this.$log.debug("onSelectDept :: selId ", selId);
      //this.$log.debug("onSelectDept :: viewMode ", this.viewMode);
      // 신규 입력 중이면 트리 선택 무시
      // if (this.viewMode === 'new') {
      //   return; 
      // }
      const dept = this.depts.find(d => d.deptno === selId);
      if ( dept ) {
        // 참조를 유지하며 데이터만 덮어쓰기
        Object.assign(this.selectedDept, dept); 
     
        // 임시조직만 수정 가능
        if ( this.selectedDept.deptGubun == '20' ) {
          this.viewMode = 'edit';
        } else {
          this.viewMode = 'view';
        }
      } 

    },

    // 펼치고(Expand), 선택(Active), 나머지는 접는(Collapse) 기능
    setKeydown() {
      if ( !this.keyWord || this.keyWord.length == 0) {
        this.openNodes = [];   // 검색어 없으면 다 접기
        this.activeNodes = []; // 선택 해제
        return;
      }
      // LIKE '%관리%'
      let target = null;
      const result = this.depts.filter(item => item.deptName.includes(this.keyWord));
      if ( result.length > 0 ) {
        target = result[0];
      } else {
        return;
      }
      
      if (target) {
        const pathIds = [];
        this.getParentIds(target.deptno, pathIds);

        // 2. 오픈 상태 업데이트 (상위 노드들을 펼침)
        this.openNodes = pathIds; 

        // 3. 선택 상태 업데이트 (해당 노드 하이라이트)
        this.activeNodes = [target.deptno];
        // 상세 Info
        this.onSelectDept( target.deptno );

      } else {
        this.$log.debug("setKeydown :: 검색 결과가 없습니다. ");  
      }
    
    },

    // 재귀적으로 부모 ID 리스트를 만드는 함수
    getParentIds(deptno, pathIds) {
      const node = this.depts.find(d => d.deptno === deptno);
      if (node.upCode && node.upCode !== '0000000000') {
        pathIds.push( String(node.upCode) );      // 부모 ID 추가
        this.getParentIds(node.upCode, pathIds);  // 더 상위로 이동
      }
      //console.log("pathIds :: " , pathIds);
    },

    addDept() {
      
      this.viewMode = 'new';

      // 1. 현재 선택된 노드 정보 저장 (상위 부서 지정을 위해)
      const parentDeptNo = this.activeNodes.length > 0 ? this.activeNodes[0] : "";

      // 2. 객체 초기화 (정석 방식)
      // this.$options.data()는 data() 함수가 리턴하는 초기 객체를 새로 생성.
      const initialForm = this.$options.data().selectedDept;
      Object.assign(this.selectedDept, initialForm);

      // 3. 신규에 필요한 기본값 세팅
      this.selectedDept.upCode = parentDeptNo;  // 상위부서
      this.selectedDept.deptGubun = "20";       // 임시조직
      // 정렬순서
      const childrenCount = this.depts.filter(d => d.upCode === parentDeptNo).length;
      this.selectedDept.deptOrder = childrenCount + 1;
      // minlevelno : watch 에서 계산
      
      this.$nextTick(() => {
        this.$refs.deptno.focus();
      });
      
    },

    saveDept() {
      //this.$log.debug("saveDept ::  ", this.selectedDept); 
      const title = "입력오류";
      let text = "부서코드는 필수 입력항목입니다.";
      if ( !this.selectedDept.deptno || this.selectedDept.deptno.length == 0  ) {
        this.$dialog.error({
              title: title,
              text: text,
              persistent: true
            }).then(res => {
              this.$refs.deptno.focus();
            });
        return;
      }

      text = "부서명은 필수 입력항목입니다.";
      if ( !this.selectedDept.deptName || this.selectedDept.deptName.length == 0  ) {
        this.$dialog.error({
              title: title,
              text: text,
              persistent: true
            }).then(res => {
              this.$refs.deptName.focus();
            });        
        return;
      }

      text = "상위부서는 필수 입력항목입니다.";
      if ( !this.selectedDept.upCode || this.selectedDept.upCode.length == 0  ) {
        this.$dialog.error({
              title: title,
              text: text,
              persistent: true
            }).then(res => {
              this.$refs.upCode.focus();    
            });
        return;
      }

      const inputData = {    
        selectedDept: this.selectedDept
      };

      this.loading = true;
      this.$br_trans([
        {
          url: "/kopms-api/dept/saveDept",
          method: "post",
          data: inputData,
          //isWait: false,
        }
      ], (url, code, msg, data) => {
        this.loading = false;
        // this.$log.debug("getDept - url : ", url, " code : ", code ,"msg : ", msg);  
        // this.$log.debug("data : ", data);

        if (code == 0) {
          this.getDept();
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
};
</script>

<style scoped>
.con{
  background-color: #F6F8FB;
  border-radius: 20px 0 0 0;
  margin-top: 8px;
}

:deep(.v-field__input) {
  min-height: 28px;
  padding-top: 0;
  padding-bottom: 0;
  font-size: 13px;
}

</style>

