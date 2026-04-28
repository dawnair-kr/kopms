<template>
  <!-- 공지사항 목록 -->
  <v-container class="main-page-wrapper">
    <v-sheet rounded="lg" class="pa-4 ma-2 form-card d-flex flex-column flex-grow-1" style="min-height: 0;">

      <!-- 헤더 -->
      <div class="form-section-header mb-4 d-flex align-center flex-shrink-0">
        <div class="d-flex align-center" style="gap: 8px;">
          <div class="section-bar" />
          <span>공지사항</span>
        </div>
      </div>

      <!-- 검색 영역 -->
      <div class="d-flex align-center ga-3 mb-3 flex-shrink-0">
        <v-text-field
          v-model="searchParam.title"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          style="max-width: 350px;"
          @keydown.enter="onSearch"
        >
          <template #prepend-inner>
            <span class="form-unit">제목</span>
          </template>
        </v-text-field>
        <EmpSearchField
          v-model="searchEmpno"
          variant="outlined"
          density="compact"
          clearable
          style="max-width: 250px;"
          @select="({ empName }) => searchParam.empName = empName"
        >
        <template #prepend-inner>
          <span class="form-unit">작성자</span>
        </template>
        </EmpSearchField>
        <v-btn
          variant="flat"
          density="comfortable"
          prepend-icon="mdi-magnify"
          class="text-none"
          text="검색"
          @click="onSearch"
        />
      </div>

      <!-- 테이블 -->
      <div class="br-table-wrap notice-table-wrap">
        <div class="table-scroll-area">
          <table class="notice-table">
            <thead>
              <tr>
                <th style="width: 60px;">번호</th>
                <th>제목</th>
                <th style="width: 100px;">작성자</th>
                <th style="width: 100px;">등록일</th>
                <th style="width: 70px;">조회수</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="noticeList.length === 0">
                <td colspan="5" class="text-center empty-row">등록된 공지사항이 없습니다.</td>
              </tr>
              <tr
                v-for="item in noticeList"
                :key="item.noticeSeq"
                class="clickable-row"
                @click="openDetail(item)"
              >
                <td class="text-center">{{ item.no }}</td>
                <td>{{ item.title }}</td>
                <td class="text-center">{{ item.empName }}</td>
                <td class="text-center">{{ item.regiDate }}</td>
                <td class="text-center">{{ item.cnt }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <v-row no-gutters justify="center" align="center" class="pagination-row">
          <v-col class="d-flex justify-center">
            <v-pagination
              v-model="currentPage"
              :length="totalPage"
              :total-visible="7"
              rounded="circle"
              size="small"
              show-first-last-page
              first-icon="mdi-page-first"
              prev-icon="mdi-menu-left"
              next-icon="mdi-menu-right"
              last-icon="mdi-page-last"
              @update:modelValue="fetchList"
            />
          </v-col>
        </v-row>
      </div>

      <!-- 하단 버튼 -->
      <div class="d-flex justify-end mt-3 flex-shrink-0">
        <v-btn
          variant="flat"
          color="primary"
          prepend-icon="mdi-pencil-plus-outline"
          class="text-none"
          text="공지 등록"
          @click="openForm(null)"
        />
      </div>

    </v-sheet>

    <!-- 팝업 다이얼로그 -->
    <v-dialog v-model="dialog" max-width="960" persistent scrollable>
      <v-card rounded="lg">
        <component
          :is="currentComponent"
          v-bind="componentProps"
          @close="closeDialog"
          @saved="onSaved"
          @edit="switchToForm"
          @deleted="onDeleted"
          @cancel="onCancel"
        />
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
// ============================================================
// [1] Vue / 플러그인 임포트
// ============================================================
import { ref, watch, getCurrentInstance } from 'vue';
import { onMounted } from 'vue';
import NoticeDetail from './NoticeDetail.vue';
import NoticeForm from './NoticeForm.vue';
import EmpSearchField from '@/components/EmpSearchField.vue';

// ============================================================
// [2] 글로벌 도구
// ============================================================
const { proxy } = getCurrentInstance();

// ============================================================
// [3] 검색 / 페이징 상태
// ============================================================
const PAGE_SIZE = 15;

const searchParam = ref({ title: '', empName: '' });
const searchEmpno = ref('');
const currentPage = ref(1);
const totalPage   = ref(1);
const noticeList  = ref([]);

watch(searchEmpno, (val) => {
  if (!val) searchParam.value.empName = '';
});

// ============================================================
// [4] 다이얼로그 상태
// ============================================================
const dialog           = ref(false);
const currentComponent = ref(null);
const componentProps   = ref({});

// ============================================================
// [5] 조회
// ============================================================
const fetchList = () => {
  proxy.$br_trans([{
    url: '/kopms-api/notice/getNoticeList',
    method: 'post',
    data: {
      ...searchParam.value,
      pageNum:    currentPage.value,
      pagePerRow: PAGE_SIZE,
    },
  }], (_url, code, _msg, data) => {
    if (code < 0) return;
    noticeList.value = data.noticeList || [];
    if (noticeList.value.length > 0) {
      totalPage.value = noticeList.value[0].totalPage || 1;
    } else {
      totalPage.value = 1;
    }
  });
};

const onSearch = () => {
  currentPage.value = 1;
  fetchList();
};

// ============================================================
// [6] 다이얼로그 제어
// ============================================================
const openDetail = (item) => {
  currentComponent.value = NoticeDetail;
  componentProps.value    = { noticeSeq: item.noticeSeq };
  dialog.value = true;
};

const openForm = (item) => {
  currentComponent.value = NoticeForm;
  componentProps.value    = { noticeSeq: item ? item.noticeSeq : null, noticeData: item };
  dialog.value = true;
};

const switchToForm = (noticeData) => {
  currentComponent.value = NoticeForm;
  componentProps.value    = { noticeSeq: noticeData.noticeSeq, noticeData };
};

const onCancel = (noticeData) => {
  if (noticeData && noticeData.noticeSeq) {
    currentComponent.value = NoticeDetail;
    componentProps.value    = { noticeSeq: noticeData.noticeSeq };
  } else {
    closeDialog();
  }
};

const closeDialog = () => {
  dialog.value = false;
  currentComponent.value = null;
  componentProps.value   = {};
};

const onSaved = () => {
  closeDialog();
  fetchList();
};

const onDeleted = () => {
  closeDialog();
  fetchList();
};

// ============================================================
// [9] 생명주기
// ============================================================
onMounted(() => {
  fetchList();
});
</script>

<style scoped lang="scss">
.notice-table-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  .table-scroll-area {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .pagination-row {
    flex: 0;
    border-top: 1px solid #cfd8dc;
    padding: 4px 0;
  }
}

.notice-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;

  thead tr {
    background-color: #e8edf5;
  }

  th {
    padding: 10px 12px;
    font-weight: 600;
    font-size: 0.85rem;
    color: #1a237e;
    text-align: center;
    border-bottom: 1px solid #cfd8dc;
    border-right: 1px solid #e8edf5;
    white-space: nowrap;

    &:last-child { border-right: none; }
  }

  td {
    padding: 8px 12px;
    border-bottom: 1px solid #f0f4f8;
    border-right: 1px solid #f0f4f8;
    vertical-align: middle;
    color: #334155;

    &:last-child { border-right: none; }
  }

  tbody tr:last-child td { border-bottom: none; }

  .empty-row {
    padding: 32px;
    color: #90a4ae;
  }

  .clickable-row {
    cursor: pointer;
    &:hover td {
      background-color: #f5f8ff;
      font-weight: 600;
    }
  }

  tfoot .pagination-cell {
    padding: 4px 0;
    border-top: 1px solid #cfd8dc;
    border-right: none;
    border-bottom: none;
    text-align: center;
  }
}
</style>
