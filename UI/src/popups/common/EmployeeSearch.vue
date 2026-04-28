<template>
  <v-card>
    <v-card-title class="d-flex pa-4 orange darken-2 white--text align-center">
      <span class="text-h6 flex-shrink-0">사원 검색</span>
      
      <v-spacer></v-spacer>
      <div class="d-flex align-center mr-5" style="max-width: 300px;">
        <v-text-field
          v-model="searchKeyword"
          dense
          hide-details
          background-color="white"
          light
          width="300"
          density="compact"
          variant="outlined"
          @keyup.enter="searchUser"
        ></v-text-field>
        <v-btn color="primary" class="ml-2" @click="searchUser">
          검색
        </v-btn>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-0">
      <v-container fluid class="fill-height pa-0">
        <v-row no-gutters class="fill-height">
          <v-col cols="4" class="border-right pa-2 overflow-y-auto">
            <v-treeview
              :items="orgTree"
              item-key="id"
              item-text="name"
              activatable
              hoverable
              open-on-click
              height="50vh"
              @update:active="onTreeSelect"
            >
              <template v-slot:prepend="{ item, open }">
                <v-icon v-if="item.children">
                  {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                </v-icon>
                <v-icon v-else>mdi-file-document-outline</v-icon>
              </template>
            </v-treeview>
          </v-col>

          <v-col cols="8" class="d-flex flex-column pa-2">

            <v-data-table
              :headers="headers"
              :items="userList"
              :items-per-page="10"
              fixed-header
              height="50vh"
              @click:row="selectUser"
              hide-default-footer
            >
              <template v-slot:no-data>
                조직도를 선택하거나 사원을 검색해주세요.
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-container>

    </v-card-text>

    <v-divider></v-divider>

    <v-row no-gutters>
      <v-card width="100%">
        <div class="d-flex align-center pa-4 ga-1">
          <v-btn class="px-2" variant="outlined">
            <span class="mr-1">서국인</span>
            <v-icon size="20" color="red" @click="deleteEmployee()" icon="mdi-alpha-x-box-outline" />
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="orange darken-2" dark @click="confirmSelection">선택 완료</v-btn>
          <v-btn color="grey lighten-1" @click="closeHandler()">취소</v-btn>
        </div>
      </v-card>
    </v-row>

    <!-- <v-card-actions class="pa-4">
      <v-spacer></v-spacer>
      <v-btn color="orange darken-2" dark @click="confirmSelection">선택 완료</v-btn>
      <v-btn color="grey lighten-1" @click="closeHandler()">취소</v-btn>
    </v-card-actions> -->
  </v-card>
</template>

<script>
export default {
  props: {
    value: Boolean, // v-model 연동
  },
  data() {
    return {
      searchKeyword: '',
      selectedUser: null,
      headers: [
        { title: '사번', value: 'empNo', align: 'start' },
        { title: '이름', value: 'name' },
        { title: '직위', value: 'position' },
      ],
      // 더미 데이터 (조직도)
      orgTree: [
        {
          id: 1,
          title: '한국남동발전(주)',
          children: [
            { id: 1, title: '상임감사위원', children: [{ id: 11, title: '기획처' }] },
            { id: 2, title: '경영혁신본부', children: [{ id: 21, title: '기획처' }] },
            { id: 3, title: '안전기술본부', children: [{ id: 31, title: '한국발전공기업협력본부' }] },
            { id: 4, title: '안전경영단', children: [{ id: 41, title: '기획처' }] },
            { id: 5, title: '신성장본부',
              children: [
                { id: 51, title: '조달계약처',
                  children: [
                    { id: 511, title: '기획처' },
                  ]
                },
                { id: 52, title: '해외사업처',
                  children: [
                    { id: 521, title: '기획처' },
                  ]
                },
                { id: 53, title: '조달계약처',
                  children: [
                    { id: 531, title: '출자사업부' },
                    { id: 532, title: '출자운영부' },
                  ]
                }
              ]
            },
            { id: 6, title: '사업소', children: [{ id: 61, title: '기획처' }] },
            { id: 7, title: '평가조직', children: [{ id: 71, title: '기획처' }] },
          ],
        },
      ],
      userList: [
        { empNo: '13140189', position: '3직급', name: '권혁' },
        { empNo: '05141244', position: '3직급', name: '김희영' },
        { empNo: '09140158', position: '3직급', name: '엄준호' },
        { empNo: '12140371', position: '3직급', name: '윤종석' },
        { empNo: '19140130', position: '4직급(나)', name: '손진빈' },
        { empNo: '24240177', position: '4직급(나)', name: '이혜인' },
      ],
    };
  },
  computed: {
    visible: {
      get() { return this.value; },
      set(val) { this.$emit('input', val); }
    }
  },
  methods: {
    onTreeSelect(activeIds) {
      if (activeIds.length > 0) {
        console.log("부서 아이디로 사원 조회:", activeIds[0]);
        // API 호출 로직 추가
      }
    },
    searchUser() {
      console.log("키워드로 사원 검색:", this.searchKeyword);
    },
    selectUser(item) {
      this.selectedUser = item;
    },
    confirmSelection() {
      this.$emit('selected', this.selectedUser);
      this.close();
    },
    close() {
      this.visible = false;
    },
    closeHandler() {
      this.$emit("submit", null);
    },
  }
};
</script>

<style scoped>
.border-right {
  border-right: 1px solid #e0e0e0;
}

</style>