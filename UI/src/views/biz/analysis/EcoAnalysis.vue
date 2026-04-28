<template>
  <v-container class="main-page-wrapper">

    <!-- 메인 컨텐츠 영역 -->
    <v-card class="ma-2" variant="outlined" style="border-color: #1867c0;">
      <div class="ma-2 px-1 d-flex align-center ga-2">
        <span class="mx-1 font-weight-bold">경제성 분석</span>
        <v-select
          v-model="searchParams.energySrc"
          :items="energySrcItems"
          hide-details
          placeholder="선택"
          variant="outlined"
          style="max-width: 200px"
        >
          <template #prepend-inner><span class="form-unit">에너지원</span></template>
        </v-select>
        <v-btn
          variant="flat"
          size="small"
          text="분석실행"
          @click="runAnalysis"
        />
        <v-spacer />
        <v-btn variant="flat" size="small" text="재무정보" @click="goEcoFinance" />
        <!-- 조회이력 -->
        <span class="text-body-2 text-grey-darken-1 font-weight-bold">조회이력</span>
        <v-select
          v-model="selectedVersion"
          :items="versionItems"
          item-title="label"
          item-value="value"
          hide-details
          style="max-width: 300px"
          variant="outlined"
          @update:model-value="onVersionChange"
        />
      </div>

      <div>
        <table class="eco-table">
          <colgroup>
            <col style="width: 9%">
            <col style="width: 10%">
            <col style="width: 27%">
            <col style="width: 27%">
            <col style="width: 27%">
          </colgroup>
          <tbody>
            <!-- 사업명 -->
            <tr>
              <td colspan="2" class="eco-th">사업명</td>
              <td><v-text-field v-model="form.bizTitle" variant="outlined" density="compact" hide-details :readonly="isHistoryView" /></td>
              <td class="eco-center">{{ latestItem?.bizTitle ?? '-' }}</td>
              <td rowspan="2" class="eco-center font-weight-bold">{{ energySrcLabel }} 평균값</td>
            </tr>
            <!-- 기준일 -->
            <tr>
              <td colspan="2" class="eco-th">기준일</td>
              <td>
                <v-menu v-model="stdDateMenu" :close-on-content-click="false">
                  <template #activator="{ props: menuProps }">
                    <BrDateField
                      v-bind="menuProps"
                      v-model="form.stdDt"
                      variant="outlined"
                      density="compact"
                      hide-details
                      append-inner-icon="mdi-calendar"
                      :readonly="isHistoryView"
                    />
                  </template>
                  <v-date-picker
                    v-model="stdDatePicker"
                    @update:model-value="onStdDateSelected"
                    hide-header
                  />
                </v-menu>
              </td>
              <td class="eco-center">{{ latestItem?.standDate ?? '-' }}</td>
            </tr>
            <!-- 사업(총투자) -->
            <tr v-for="(row, i) in ticRows" :key="row.field">
              <td v-if="i === 0" rowspan="4" class="eco-th eco-section">사업(총투자)</td>
              <td class="eco-th">{{ row.label }}</td>
              <td><BrNumberField v-model="inputForm[row.field]" hide-details allow-decimal :readonly="isHistoryView" /></td>
              <td class="eco-center">{{ formatVal(latestItem?.[row.field]) }}</td>
              <td class="eco-center">{{ calcAvg(row.field) }}</td>
            </tr>
            <!-- 자기자본(주주) -->
            <tr v-for="(row, i) in eqtRows" :key="row.field">
              <td v-if="i === 0" rowspan="5" class="eco-th eco-section">자기자본(주주)</td>
              <td class="eco-th">{{ row.label }}</td>
              <td><BrNumberField v-model="inputForm[row.field]" hide-details allow-decimal :readonly="isHistoryView" /></td>
              <td class="eco-center">{{ formatVal(latestItem?.[row.field]) }}</td>
              <td class="eco-center">{{ calcAvg(row.field) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </v-card>

    <!-- 재무 정보 조회 -->
    <!-- <v-card variant="outlined" class="mx-2 mb-2 flex-grow-1" style="border-color: #1867c0">
      <div class="pa-2 font-weight-bold d-flex align-center" style="border-bottom: 1px solid #e0e0e0">
        <span class="mx-1">재무 정보 조회</span>
      </div>
      <div style="overflow-x: auto">
        <table class="fin-table">
          <thead>
            <tr>
              <th rowspan="2" class="fin-th" style="min-width: 140px">사업명</th>
              <th colspan="4" class="fin-th">사업(총투자)</th>
              <th colspan="5" class="fin-th">자기자본(주주)</th>
              <th rowspan="2" class="fin-th" style="min-width: 70px">재무모델</th>
              <th rowspan="2" class="fin-th" style="min-width: 60px">삭제</th>
            </tr>
            <tr>
              <th class="fin-th" style="min-width: 100px">세후<br />사업수익률</th>
              <th class="fin-th" style="min-width: 90px">NPV<br />(억원)</th>
              <th class="fin-th" style="min-width: 90px">B/C<br />(할인율 적용 후)</th>
              <th class="fin-th" style="min-width: 80px">회수기간<br />(년)</th>
              <th class="fin-th" style="min-width: 100px">자기자본<br />수익률(FCFE)</th>
              <th class="fin-th" style="min-width: 100px">자기자본<br />수익률(배당)</th>
              <th class="fin-th" style="min-width: 90px">NPV<br />(억원)</th>
              <th class="fin-th" style="min-width: 90px">B/C<br />(할인율 적용 후)</th>
              <th class="fin-th" style="min-width: 80px">회수기간<br />(년)</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in analysisList"
              :key="item.anlSeq"
              class="fin-row"
              :class="{ 'fin-row-selected': selectedAnlSeq === item.anlSeq }"
              @click="selectRow(item)"
            >
              <td class="fin-td text-center">{{ item.bizTitle }}</td>
              <td class="fin-td text-right">{{ formatVal(item.ticAtrRoi) }}</td>
              <td class="fin-td text-right">{{ formatVal(item.ticNpvVal) }}</td>
              <td class="fin-td text-right">{{ formatVal(item.ticBcrDsc) }}</td>
              <td class="fin-td text-right">{{ formatVal(item.ticPbpYrs) }}</td>
              <td class="fin-td text-right">{{ formatVal(item.eqtRoeFcf) }}</td>
              <td class="fin-td text-right">{{ formatVal(item.eqtRoeDiv) }}</td>
              <td class="fin-td text-right">{{ formatVal(item.eqtNpvVal) }}</td>
              <td class="fin-td text-right">{{ formatVal(item.eqtBcrDsc) }}</td>
              <td class="fin-td text-right">{{ formatVal(item.eqtPbpYrs) }}</td>
              <td class="fin-td text-center">
                <v-btn
                  v-if="item.attachFileSeq"
                  variant="text"
                  size="small"
                  icon="mdi-download"
                  @click.stop="downloadFile(item)"
                />
                <span v-else class="text-grey text-caption">-</span>
              </td>
              <td class="fin-td text-center">
                <v-btn
                  variant="text"
                  size="small"
                  icon="mdi-delete-outline"
                  color="red-darken-1"
                  @click.stop="confirmDelete(item)"
                />
              </td>
            </tr>
            <tr v-if="analysisList.length === 0">
              <td colspan="12" class="fin-td text-center text-grey py-3">등록된 데이터가 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </v-card> -->

    <!-- 삭제 확인 다이얼로그 -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-subtitle-1 font-weight-bold pa-4">삭제 확인</v-card-title>
        <v-card-text><strong>{{ deleteTarget?.bizTitle }}</strong> 의 재무정보를 삭제하시겠습니까?</v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="outlined" text="취소" @click="deleteDialog = false" />
          <v-btn variant="flat" color="red-darken-1" text="삭제" @click="doDelete" />
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, watch, getCurrentInstance, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCommonCode } from '@/composables/useCommonCode';
import dayjs from 'dayjs';
import BrDateField from '@/components/BrDateField.jsx';
import BrNumberField from '@/components/BrNumberField.jsx';

const { proxy } = getCurrentInstance();
const router = useRouter();
const { loadCodes } = useCommonCode();

// ============================================================
// [1] 에너지원 코드 (COM_CODE 105)
// ============================================================
const energySrcCodes = ref([]);
const energySrcItems = [
  { title: '해상풍력', value: '60' },
  { title: '태양광',   value: '40' },
  { title: '육상풍력', value: '70' },
  { title: 'BESS',    value: '90' },
];

// ============================================================
// [2] 검색 파라미터
// ============================================================
const searchParams = ref({
  energySrc: null,
});

const energySrcLabel = computed(() => {
  const found = energySrcCodes.value.find(c => c.codeValue === searchParams.value.energySrc);
  return found ? found.codeName : '';
});

// ============================================================
// [3] 버전 선택 (조회이력)
// ============================================================
const selectedVersion  = ref('current');
const versionItems     = ref([{ label: '현재', value: 'current' }]);
const historyList      = ref([]);
const isHistoryView    = ref(false);

watch(() => searchParams.value.energySrc, () => {
  selectedVersion.value = 'current';
  isHistoryView.value   = false;
  fetchHistoryList();
});

const fetchHistoryList = () => {
  proxy.$br_trans([{
    url: '/kopms-api/ecoAnl/historyDirectList',
    method: 'post',
    data: { energySrc: searchParams.value.energySrc || '' },
  }], (_url, code, _msg, data) => {
    if (code < 0) return;
    historyList.value = data.list || [];
    versionItems.value = [
      { label: '현재', value: 'current' },
      ...historyList.value.map(item => ({
        label: `${item.inwriterId} (${item.regiDate})`,
        value: item.anlSeq,
      })),
    ];
  });
};

const onVersionChange = (val) => {
  if (!val || val === 'current') {
    isHistoryView.value = false;
    form.value.bizTitle = null;
    form.value.stdDt    = null;
    Object.keys(inputForm.value).forEach(k => { inputForm.value[k] = null; });
  } else {
    proxy.$br_trans([{
      url: '/kopms-api/ecoAnl/historyData',
      method: 'post',
      data: { anlSeq: val, version: 1 },
    }], (_url, code, _msg, data) => {
      if (code < 0) return;
      const item = data.data;
      if (!item) return;
      isHistoryView.value = true;
      form.value.bizTitle = item.bizTitle ?? null;
      form.value.stdDt    = item.standDate ?? null;
      inputForm.value = {
        ticAtrRoi: item.ticAtrRoi ?? null,
        ticNpvVal: item.ticNpvVal ?? null,
        ticBcrDsc: item.ticBcrDsc ?? null,
        ticPbpYrs: item.ticPbpYrs ?? null,
        eqtRoeFcf: item.eqtRoeFcf ?? null,
        eqtRoeDiv: item.eqtRoeDiv ?? null,
        eqtNpvVal: item.eqtNpvVal ?? null,
        eqtBcrDsc: item.eqtBcrDsc ?? null,
        eqtPbpYrs: item.eqtPbpYrs ?? null,
      };
    });
  }
};

// ============================================================
// [4] 분석 데이터 조회
// ============================================================
const analysisList = ref([]);

const fetchAnalysis = () => {
  proxy.$br_trans([{
    url: '/kopms-api/ecoAnl/list',
    method: 'post',
    data: {
      energySrc: searchParams.value.energySrc || '',
    },
  }], (_url, code, _msg, data) => {
    if (code < 0) return;
    analysisList.value = data.list || [];
  });
};

// ============================================================
// [5] 입력 폼
// ============================================================
const form = ref({ stdDt: null, bizTitle: null });

const inputForm = ref({
  ticAtrRoi: null, ticNpvVal: null, ticBcrDsc: null, ticPbpYrs: null,
  eqtRoeFcf: null, eqtRoeDiv: null, eqtNpvVal: null, eqtBcrDsc: null, eqtPbpYrs: null,
});

const stdDateMenu   = ref(false);
const stdDatePicker = ref(null);

const onStdDateSelected = (val) => {
  form.value.stdDt = dayjs(val).format('YYYY-MM-DD');
  stdDateMenu.value = false;
};

// ============================================================
// [6] 분석 실행 (히스토리 저장 + 목록 갱신)
// ============================================================
const runAnalysis = () => {
  proxy.$br_trans([{
    url: '/kopms-api/ecoAnl/saveHistory',
    method: 'post',
    data: {
      bizTitle:  form.value.bizTitle,
      energySrc: searchParams.value.energySrc,
      standDate: form.value.stdDt,
      ...inputForm.value,
    },
  }], (_url, code) => {
    if (code < 0) return;
    selectedVersion.value = 'current';
    isHistoryView.value   = false;
    fetchAnalysis();
    fetchHistoryList();
  });
};

// ============================================================
// [7] 최근 데이터
// ============================================================
const latestItem = computed(() => analysisList.value[0] ?? null);

// ============================================================
// [8] 테이블 행 정의
// ============================================================
const ticRows = [
  { label: '세후 사업수익률',     field: 'ticAtrRoi' },
  { label: 'NPV(억원)',           field: 'ticNpvVal' },
  { label: 'B/C(할인율 적용 후)', field: 'ticBcrDsc' },
  { label: '회수기간(년)',         field: 'ticPbpYrs' },
];

const eqtRows = [
  { label: '자기자본수익률(FCFE)', field: 'eqtRoeFcf' },
  { label: '자기자본수익률(배당)', field: 'eqtRoeDiv' },
  { label: 'NPV(억원)',            field: 'eqtNpvVal' },
  { label: 'B/C(할인율 적용 후)',  field: 'eqtBcrDsc' },
  { label: '회수기간(년)',          field: 'eqtPbpYrs' },
];

// ============================================================
// [9] 헬퍼
// ============================================================
const formatVal = (val) => {
  if (val === null || val === undefined || val === '') return '-';
  return Number(val).toLocaleString();
};

const calcAvg = (field) => {
  const values = analysisList.value
    .map(item => Number(item[field]))
    .filter(v => !isNaN(v) && v !== null);
  if (values.length === 0) return '-';
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return avg.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

// ============================================================
// [10] 그리드 행 선택
// ============================================================
const selectedAnlSeq = ref(null);

const selectRow = (item) => {
  selectedAnlSeq.value = item.anlSeq;
};

// ============================================================
// [11] 파일 다운로드
// ============================================================
const downloadFile = (item) => {
  if (!item.attachFileSeq) return;
  window.open(`/kopms-api/file/download?attachFileSeq=${item.attachFileSeq}`, '_blank');
};

// ============================================================
// [12] 삭제
// ============================================================
const deleteDialog = ref(false);
const deleteTarget = ref(null);

const confirmDelete = (item) => {
  deleteTarget.value = item;
  deleteDialog.value = true;
};

const doDelete = () => {
  proxy.$br_trans([{
    url: '/kopms-api/ecoAnl/delete',
    method: 'post',
    data: { anlSeq: deleteTarget.value.anlSeq },
  }], (_url, code) => {
    deleteDialog.value = false;
    if (code < 0) return;
    if (selectedAnlSeq.value === deleteTarget.value.anlSeq) selectedAnlSeq.value = null;
    fetchAnalysis();
  });
};

// ============================================================
// [13] 재무정보 화면 이동
// ============================================================
const goEcoFinance = () => {
  router.push('/re/ecoanalysis/finance');
};

// ============================================================
// [14] 초기화
// ============================================================
onMounted(async () => {
  const codesMap = await loadCodes([105]);
  energySrcCodes.value = codesMap['105'] || [];
});
</script>

<style scoped lang="scss">
.eco-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  td {
    border: 1px solid #e0e0e0;
    padding: 4px 8px;
    vertical-align: middle;
  }

  .eco-th {
    background-color: #f5f5f5;
    font-weight: 600;
    text-align: center;
  }

  .eco-section {
    text-align: center;
  }

  .eco-center {
    text-align: center;
  }
}

.fin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  .fin-th {
    background-color: #e3f2fd;
    color: #1565c0;
    font-weight: bold;
    border: 1px solid #dee2e6;
    padding: 6px 8px;
    text-align: center;
    white-space: nowrap;
  }

  .fin-td {
    border: 1px solid #dee2e6;
    padding: 5px 8px;
  }

  .fin-row {
    cursor: pointer;
    &:hover { background-color: #f5f5f5; }
  }

  .fin-row-selected {
    background-color: #e3f2fd !important;
  }
}
</style>
