<template no-gutters>
  
  <v-container class="main-page-wrapper">
    <!-- 메인 컨텐츠 영역 : Tree, Detail, Input-->
    <v-row>
      <v-col cols="4">
        <v-card class="flex-grow-1 bg-white" variant="outlined">
          <v-row no-gutters justify="center" align="center" class="ma-2">
            <v-col>
              <v-text-field variant="outlined" density="compact" hide-details label="사원명을 입력하세요" ref="keyWord" type="text"
                v-model="keyWord" v-on:keydown.enter="setKeydown()"   
              >
              </v-text-field>
            </v-col>
            <v-col class="d-flex justify-end">
              <v-btn variant="outlined" density="compact" prepend-icon="mdi-magnify" text="검색" @click="setKeydown"/>
            </v-col>
          </v-row>
          <v-row class="ma-2">
            <v-col class="px-1">
              <DeptTree :tree-items="treeItems" :openNodes="openNodes" :activeNodes="activeNodes" 
                @select="onSelectDept" 
                @update:opened="val => openNodes = val"
                @update:activated="val => activeNodes = val"
              />
            </v-col>
          </v-row>
        </v-card>
      </v-col>        
      <v-col >
        <v-card class="flex-grow-1 bg-white" variant="outlined">
          <v-data-table :headers="headers" :items="employLst" item-key="empno" class="custom-table overflow-y-auto" 
            @click:row="onRowClick"
            fixed-header hide-default-footer>        
            <template v-slot:no-data>
              <v-row no-gutters justify="center" align="center" class="my-2">
                <v-col align="center">
                  <span class="text-subtitle-1 text-black">데이터가 존재하지 않습니다.</span>
                </v-col>
              </v-row>
            </template>

            <!-- 수정 -->
            <template #item.actionMod="{ item }">
              <v-icon size="small" class="cursor-pointer" color="error"
                @click.stop="updateEmployee(item)"
              >
                mdi-pencil
              </v-icon>
            </template>

            <!-- 삭제 -->
            <template #item.actionDel="{ item }">
              <v-icon size="small" class="cursor-pointer" color="error"
                @click.stop="deleteEmployee(item)"
              >
                mdi-delete
              </v-icon>
            </template>

            <!-- <template v-slot:bottom>
              <v-divider></v-divider>
              <v-row no-gutters align="center" justify="center" class="mx-1 mt-0">
                <v-col align="center" class="pa-2">
                  <v-pagination v-model="currentPage" :length="totalPage" rounded="circle" :total-visible="7" show-first-last-page
                    size="small" first-icon="mdi-page-first" prev-icon="mdi-menu-left" next-icon="mdi-menu-right" last-icon="mdi-page-last"
                    @update:modelValue="getLoginHistory">
                  </v-pagination>
                </v-col>
              </v-row>
            </template> -->
          </v-data-table>
        </v-card>
        
        <v-divider class="my-1"></v-divider>
        
        <v-card class="flex-grow-1 bg-white" variant="outlined">
          <v-card-title justify="center" align="center" class="text-subtitle-2 bg-grey-lighten-3" >사용자정보</v-card-title>
          <v-row no-gutters justify="center" align="center" class="ma-1">
            <v-col class="d-flex flex-column align-center">
              <span class="text-subtitle-2">부서코드</span>
              <span class="text-body2">{{ selectedEmploy.deptno }}</span>
            </v-col>
            <v-col class="d-flex flex-column align-center">
              <span class="text-subtitle-2">부서명</span>
              <span class="text-body2">{{ selectedEmploy.deptName }}</span>
            </v-col>
          </v-row>
          <v-row no-gutters justify="center" align="center" class="ma-1">
            <v-col class="pa-1">
              <v-text-field v-model="selectedEmploy.empno" readonly
                ref="empno" maxlength="8" hide-details variant="outlined" label="사번" placeholder="사번을 입력하세요" >
              </v-text-field>
            </v-col>
            <v-col class="pa-1">
              <v-text-field v-model="selectedEmploy.name"
                ref="name" maxlength="20" hide-details variant="outlined" label="이름" placeholder="이름을 입력하세요" >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row no-gutters justify="center" align="center" class="ma-1">
            <v-col class="pa-1">
              <v-text-field v-model="selectedEmploy.mobilePhn" :readonly="isReadonly"
                ref="mobilePhn" maxlength="50" hide-details variant="outlined" label="휴대전화" placeholder="휴대전화를 입력하세요" >
              </v-text-field>
            </v-col>
            <v-col class="pa-1">
              <v-text-field v-model="selectedEmploy.mailno" :readonly="isReadonly"
                ref="mailno" maxlength="50" hide-details variant="outlined" label="이메일" placeholder="이메일을 입력하세요" >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row no-gutters justify="center" align="center" class="ma-1">
            <v-col class="pa-1">
              <v-text-field v-model="selectedEmploy.extelno" :readonly="isReadonly"
                ref="extelno" maxlength="50" hide-details variant="outlined" label="전화번호" placeholder="전화번호를 입력하세요" >
              </v-text-field>
            </v-col>
            <v-col class="pa-1">
              <v-text-field v-model="selectedEmploy.exfaxno" :readonly="isReadonly"
                ref="exfaxno" maxlength="50" hide-details variant="outlined" label="팩스번호" placeholder="팩스번호를 입력하세요" >
              </v-text-field>
            </v-col>
          </v-row>

          <v-row no-gutters justify="center" align="center" class="ma-1">
            <v-col class="pa-1">
              <v-select
                v-model="selectedEmploy.userGubun"
                :items="userType"
                item-title="codeName"
                item-value="codeValue"
                label="사용자구분"
                variant="outlined"
                hide-details
                ref="userGubun" 
              />
            </v-col>
            <v-col class="pa-1">
              <v-row no-gutters >
                <v-col class="py-1 mr-1">
                  <v-text-field v-model="selectedEmploy.ipaddr" :readonly="isReadonly"
                    ref="ipaddr" maxlength="16" hide-details variant="outlined" label="IP Adress" placeholder="IP Adress를 입력하세요" >
                  </v-text-field>
                </v-col>
                <v-col class="py-1 ml-1">
                  <v-select
                    v-model="selectedEmploy.deptGubun"
                    :items="orgType"
                    item-title="codeName"
                    item-value="codeValue"
                    label="조직구분"
                    variant="outlined"
                    hide-details
                    ref="deptGubun"
                    readonly
                  />
                  </v-col>
              </v-row>
            </v-col>
          </v-row>
          
          <v-row class="ma-1">
            <v-col align="right" class="pa-1">
              <v-btn variant="outlined" density="compact" prepend-icon="mdi-card-text-outline" class="mx-1 text-none text-subtitle-4 font-weight-bold" flat text="권한내역" 
                @click="accessList"/>
              <v-btn variant="outlined" density="compact" prepend-icon="mdi-content-save-plus-outline" class="mx-1 text-none text-subtitle-4 font-weight-bold" flat text="저장" 
                :disabled="viewMode === 'view'"
                @click="saveEmpy"/>
              <v-btn variant="outlined" density="compact" prepend-icon="mdi-refresh" class="mx-1 text-none text-subtitle-4 font-weight-bold" flat text="초기화" 
                @click="intEmpy"/>
              <!-- {{ selectedEmploy }} -->
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <!-- 메인 컨텐츠 영역 끝 -->    

  </v-container>

</template>



<script setup>
import { ref } from "vue";
import DeptTree from '@/pages/dept/DeptTree.vue';
import AccessList from "@/popups/employ/AccessList.vue";
import { useUserStore } from '@/store/user.js';

</script>
/** 참조 테이블 : PDNM.DEPT, EMPLOYEE
  1. 부서검색 : DEPT
  2. 사원검색 : EMPLOYEE
  3. 평가위원 등록 : 등록 테이블 확인 필요 [ MDSETT1 ???? ]
    >>>>>> 업무 프로세스 확인 필요
  3.1 내부 평가위원은 기존 남동발전 직원을 선택하여 저장
    >>>>>> [ MDSETT1 ???? 만 Insert ???] 
  3.2 외부 평가위원은 기초정보를 입력하여 저장 [사번 : 자동채번? 채번룰이 있으면 UUID 사용 X, 채번룰 적용 하면됨]
    >>>>>> [ EMPLOYEE ???? Insert ???] -> 일단 임의로 UUID 사용 (숫자형 8자리 문자) 사용 
    >>>>>> [ MDSETT1 ???? Insert ???] 
    - WST_NUM[관리번호], WST_NUM_SEQ[일련번호] 생성규칙 ???
    - WST_NM[신청권한] 에는 어떤 내용이 입력되는지?... 일단 임의로 신청 권한 코드 로 처리함 : O - 외부평가위원, I - 내부평가위원
  4. 수정 : 업무 프로세스 확인 필요
    - 평가위원 권한 신청을 수정하는 건지 아니면 평가위원 정보를 수정하는 건지 ...
  5. 삭제 : 업무 프로세스 확인 필요  
    - 평가위원 권한 신청을 삭제하는 건지 아니면 평가위원 정보를 삭제하는 건지 ...
 */

<script>

export default {
  setup() {
  },
  props: {

  },
  components: {
    DeptTree,   // tree 컴포넌트 등록
    
  },
  created() {

  },
  beforeMount() {

  },
  watch: {
  },

  computed: {

    // store를 여기에 등록하여 'this' 가시성 확보
    // 로그인 사용자 정보
    userStore() {
      return useUserStore().getUserInfo();
    },
    
    isReadonly() {       
      if ( Number( this.selectedEmploy?.deptGubun ) !== 20 ) {
        return true;
      } else {
        return false;
      }
    },

  },

  mounted() {

    this.getDept();
    
    //this.$log.debug("intEmpy :: userStore ~~~", this.userStore.userGubun);
  },

  data() {
    return {
      depts: [],
      treeItems: [],
      selectedDept : "",
      employLst: [],
      selectedEmploy: {
          classno : "",
          deptGubun : "",
          deptName : "",
          deptno : "",
          download : 0,
          empOrder : 0,
          empno : "",
          exfaxno : "",
          exist : "",
          extelno : "",
          hostname : "",
          intelno : "",
          ipaddr : "",
          jikgubName : "",
          leveldate : "",
          levelno : "",
          mCount : "",
          mailno : "",
          mobilePhn: "",
          name: "",
          notremove : 0,
          title : "",
          userGubun : "",
          vpnYn : "",
          regUser : "",
      },
      
      // key 반드시 존재해야 슬롯 사용
      headers: [
        { title: "사번", key: "empno", minWidth: "", align: "center", sortable: false },
        { title: "이름", key: "name", minWidth: "", align: "center", sortable: false },
        { title: "부서", key: "deptName", minWidth: "", align: "center", sortable: false },
        { title: "수정", key: "actionMod", minWidth: "", align: "center", sortable: false },
        { title: "삭제", key: "actionDel", minWidth: "", align: "center", sortable: false },
      ],

      
      // 신규 입력 or 인지 수정인지 구분 (저장 시 필요)
      viewMode : 'view', // 'view', 'new', 'edit'
      // 사원명 검색 
      keyWord: '',

      // Tree : 펼치고(Expand), 선택(Active)
      openNodes: [],    // 자식 트리의 펼침 상태 제어 : 열려있는 노드 목록
      activeNodes: [],  // 자식 트리의 선택 상태 제어 : 선택 활성화된 노두

      // 공통코드
      orgType : [],   // 조직구붖
      userType : [],  // 사용자구분
      
    };
  },

  methods: {
    // 전체 조직 조회
    getDept() {
      // this.$log.debug("getDept~~~~~~~~~~~~~~~~~~~~~~" ); 
      const inputData = {    
        comCodes: [
          { groupCode: "117", codeName: "orgType", useYn: 'Y' },  // 조직구분
          { groupCode: "116", codeName: "userType", useYn: 'Y' },  // 사용자구분
        ]    
      };

      this.loading = true;
      this.$br_trans([
        {
          url: "/kopms-api/employee/getDepts",
          method: "post",
          data: inputData,
          //isWait: false,
        }
      ], (url, code, msg, data) => {
        this.loading = false;
        // this.$log.debug("getDept - url : ", url, " code : ", code ,"msg : ", msg);  
        //this.$log.debug("data : ", data);
        if (code == 0) {
          // 공통코드
          this.orgType = data.orgType;  
          this.userType = data.userType;
          // 상위부서 선택용
          // this.deptCode = data.deptCode;
          // 트리용
          this.depts = data.depts;
          this.treeItems = this.listToTree(this.depts);
          //this.$log.debug("dataItems---------------------------- : ", this.treeItems);  
          
          this.openNodes = [];   // openNodes clear
          this.activeNodes = []; // 선택 해제

          this.onSelectDept( this.treeItems[0].deptno );
          this.openNodes.push( this.treeItems[0].deptno );
          this.activeNodes.push( this.treeItems[0].deptno );

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
      return tree;
    },

    // 부서 선택
    onSelectDept(selId) {
      //this.$log.debug("onSelectDept :: selId ", selId);
      this.selectedDept = selId;
      const searchData = {    
        deptno: selId,
        name : ""
      };

      this.getEmployee(searchData);
    },

    // 사원명 검색
    setKeydown() {
      const searchData = {    
        deptno: "",
        name : ""
      };

      if ( !this.keyWord || this.keyWord.length == 0) {
        searchData.deptno = this.selectedDept;
        searchData.name = "";
      } else {
        searchData.deptno = "";
        searchData.name = this.keyWord;
      }

      this.getEmployee(searchData);
    
    },

    // 사원 조회
    getEmployee(searchData) {
      //this.$log.debug("getEmployee~~~~~~~~~~~~~~~~~~~~~~", searchData ); 
      this.viewMode = "view";

      // const initialForm = this.$options.data().selectedEmploy;
      // Object.assign(this.selectedEmploy, initialForm);
      this.selectedEmploy = {};

      this.loading = true;
      this.$br_trans([
        {
          url: "/kopms-api/employee/getEmployee",
          method: "post",
          data: searchData,
          //isWait: false,
        }
      ], (url, code, msg, data) => {
        this.loading = false;
        //this.$log.debug("getEmployee - url : ", url, " code : ", code ,"msg : ", msg);  
        //this.$log.debug("data : ", data);
        if (code == 0) {
          this.employLst = data.employLst;
        } else {
          this.$dialog.error({
            title: "시스템 오류",
            text: data.detail
          }).then(res => {
          });
        }                
      });
    },

    // 사원 리스트 Click
    onRowClick(event, item) {
      console.log('클릭한 row 데이터:', item.item);
      this.viewMode = "edit";
      this.selectedEmploy = item.item;
      //this.$log.debug("selectedEmploy : ", this.selectedEmploy);
    },

    // 사원리스트 수정 Click
    updateEmployee(item) {
      this.viewMode = "edit";
      //this.$log.debug("updateEmployee : ", item);
      this.$dialog.confirm({
          title:  "수정 확인",
          text: `${item.name} 평가위원 정보를 수정하시겠습니까? .... 업무 프로세스 확인 요함`,
          actions: {
            true: { text: "확인", color: 'primary' },
            false: "취소"
          },
        }).then(res => {
          if (res) {
            console.log("확인 눌렀다.");
          }
          else {
            console.log("취소 눌렀다.");
          }
        });

    },
    // 사원리스트 삭제 Click
    deleteEmployee(item) {
      this.viewMode = "edit";
      this.$log.debug("deleteEmployee : ", item);
      
      this.$dialog.confirm({
          title:  "삭제 확인",
          text: `${item.name} 평가위원 정보를 삭제하시겠습니까?.... 업무 프로세스 확인 요함`,
          actions: {
            true: { text: "확인", color: 'primary' },
            false: "취소"
          },
        }).then(res => {
          if (res) {
            console.log("확인 눌렀다.");
          }
          else {
            console.log("취소 눌렀다.");
          }
        });

    },

    // 초기화
    intEmpy() {
      this.viewMode = 'new';

      // 1. 현재 선택된 노드 정보 저장 (부서 지정)
      const pDeptNo = this.activeNodes.length > 0 ? this.activeNodes[0] : "";
      const deptInfo = this.depts.find(dept => dept.deptno === pDeptNo);
      const deptName = deptInfo.deptName;
      const deptGubun = deptInfo.deptGubun;

      if ( deptGubun !== '20' ) {
        this.$dialog.error({
              title: "입력확인",
              text: '[남동조직]에는 신규 등록할 수 없습니다.',
              persistent: true
            }).then(res => {
              
            });        
        return;
      }

      this.$log.debug("intEmpy :: userStore ~~~", this.userStore);
      
      // 3. 신규에 필요한 기본값 세팅
      this.selectedEmploy = {};
      this.selectedEmploy.deptno = pDeptNo;       // 상위부서
      this.selectedEmploy.deptName = deptName;
      this.selectedEmploy.deptGubun = deptGubun;  // 임시조직
      
      this.$log.debug("selectedEmploy : ", this.selectedEmploy);

      this.$nextTick(() => {
        this.$refs.name.focus();
      });
      
    },

    // 저장
    saveEmpy() {
      this.$log.debug("saveEmpy ::  ", this.selectedEmploy); 
      
      const title = "입력오류";
      let text = "사번은 필수 입력항목입니다.";
      // if ( !this.selectedEmploy.empno || this.selectedEmploy.empno.length == 0  ) {
      //   this.$dialog.error({
      //         title: title,
      //         text: text,
      //         persistent: true
      //       }).then(res => {
      //         this.$refs.empno.focus();
      //       });
      //   return;
      // }

      text = "이름은 필수 입력항목입니다.";
      if ( !this.selectedEmploy.name || this.selectedEmploy.name.length == 0  ) {
        this.$dialog.error({
              title: title,
              text: text,
              persistent: true
            }).then(res => {
              this.$refs.name.focus();
            });        
        return;
      }

      text = "전화번호는 필수 입력항목입니다.";
      if ( !this.selectedEmploy.extelno || this.selectedEmploy.extelno.length == 0  ) {
        this.$dialog.error({
              title: title,
              text: text,
              persistent: true
            }).then(res => {
              this.$refs.extelno.focus();    
            });
        return;
      }

      text = "사용자구분은 필수 입력항목입니다.";
      if ( !this.selectedEmploy.userGubun || this.selectedEmploy.userGubun.length == 0  ) {
        this.$dialog.error({
              title: title,
              text: text,
              persistent: true
            }).then(res => {
              this.$refs.userGubun.focus();    
            });
        return;
      }

      this.selectedEmploy.regUser = this.userStore.empno ;  // 등록자, 신청자 : 추후 로그인 사용자로 프레임웍에서 처리 하자...

    
      const inputData = {    
        selectedEmploy: this.selectedEmploy
      };
      
      this.loading = true;
      this.$br_trans([
        {
          url: "/kopms-api/employee/saveEmploy",
          method: "post",
          data: inputData,
          //isWait: false,
        }
      ], (url, code, msg, data) => {
        this.loading = false;
        this.$log.debug("getDept - url : ", url, " code : ", code ,"msg : ", msg);  
        // this.$log.debug("data : ", data);

        if (code == 0) {
          const searchData = {    
            deptno: this.selectedEmploy.deptno,
            name : ""
          };

          this.getEmployee(searchData);

        } else {
          this.$dialog.error({
            title: "정보확인",
            text: data.detail
          }).then(res => {

          });
        }        
      });      
    },

    // 권한신청내역 팝업
    async accessList() {

      let headerTitle = "권한신청내역"; 
      let dialogWidth = 600;
      let dialogHeight = 550;
      const accessList = await this.$dialog.showAndWait(
        { AccessList },
        {
          title: headerTitle,
          width: dialogWidth,
          minWidth: dialogWidth,
          height: dialogHeight,
          maxHeight: dialogHeight
        },
      );
      
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

