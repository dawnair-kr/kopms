<template>
  <v-container class="main-page-wrapper">
    <!-- ▶ 재무 정보 조회 -->
    <v-card
      variant="outlined"
      class="mx-2 flex-grow-1"
      style="border-color: #1867c0"
    >
      <div
        class="pa-2 font-weight-bold d-flex align-center ga-2"
        style="border-bottom: 1px solid #e0e0e0"
      >
        <span class="mx-1">재무 정보 조회</span>
        <v-select
          v-model="searchParams.energySrc"
          :items="energySrcItems"
          hide-details
          variant="outlined"
          style="max-width: 200px"
        >
          <template #prepend-inner><span class="form-unit">에너지원</span></template>
        </v-select>
        <v-text-field
          v-model="searchParams.bizTitle"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 350px"
          @keyup.enter="fetchList"
        >
          <template #prepend-inner><span class="form-unit">사업명</span></template>
        </v-text-field>
        <v-btn
          variant="flat"
          size="small"
          prepend-icon="mdi-magnify"
          text="검색"
          @click="fetchList"
        />
        <v-btn
          variant="outlined"
          size="small"
          text="초기화"
          prepend-icon="mdi-refresh"
          @click="resetForm"
        />
      </div>

      <div style="overflow-x: auto">
        <table class="fin-table">
          <thead>
            <tr>
              <th rowspan="2" class="fin-th" style="min-width: 140px">
                사업명
              </th>
              <th colspan="4" class="fin-th">사업(총투자)</th>
              <th colspan="5" class="fin-th">자기자본(주주)</th>
              <th rowspan="2" class="fin-th" style="min-width: 70px">
                재무모델
              </th>
              <th rowspan="2" class="fin-th" style="min-width: 60px">삭제</th>
            </tr>
            <tr>
              <th class="fin-th" style="min-width: 100px">
                세후<br />사업수익률
              </th>
              <th class="fin-th" style="min-width: 90px">NPV<br />(억원)</th>
              <th class="fin-th" style="min-width: 90px">
                B/C<br />(할인율 적용 후)
              </th>
              <th class="fin-th" style="min-width: 80px">회수기간<br />(년)</th>
              <th class="fin-th" style="min-width: 100px">
                자기자본<br />수익률(FCFE)
              </th>
              <th class="fin-th" style="min-width: 100px">
                자기자본<br />수익률(배당)
              </th>
              <th class="fin-th" style="min-width: 90px">NPV<br />(억원)</th>
              <th class="fin-th" style="min-width: 90px">
                B/C<br />(할인율 적용 후)
              </th>
              <th class="fin-th" style="min-width: 80px">회수기간<br />(년)</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in tableList"
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
            <tr v-if="tableList.length === 0">
              <td colspan="12" class="fin-td text-center text-grey py-3">
                등록된 데이터가 없습니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </v-card>

    <!-- ▶ 재무 정보 등록 -->
    <v-card class="ma-2 flex-grow-0" variant="outlined" style="border-color: #1867c0">
      <div
        class="pa-2 font-weight-bold"
        style="border-bottom: 1px solid #e0e0e0"
      >
        <span class="mx-1">재무 정보 등록</span>
      </div>

      <div class="pa-4 reg-grid">
        <!-- Row 1: 사업명 -->
        <v-row no-gutters class="mb-6">
          <v-col style="grid-column: 1 / -1">
            <div class="field-item">
              <span class="field-label">사업명</span>
              <v-text-field
                v-model="form.bizTitle"
                variant="outlined"
                density="compact"
                hide-details
              />
            </div>
          </v-col>
        </v-row>

        <!-- Row 2: 기준일(1) | 에너지원(1) | 재무모델파일첨부(2) | spacer(1) -->
        <v-row no-gutters class="ga-6 mb-6">
          <v-col>
            <div class="field-item">
              <span class="field-label">기준일</span>
              <v-menu v-model="standDateMenu" :close-on-content-click="false">
                <template #activator="{ props: menuProps }">
                  <BrDateField
                    v-bind="menuProps"
                    v-model="form.standDate"
                    variant="outlined"
                    density="compact"
                    hide-details
                    append-inner-icon="mdi-calendar"
                  />
                </template>
                <v-date-picker
                  v-model="standDatePicker"
                  @update:model-value="onStandDateSelected"
                  hide-header
                />
              </v-menu>
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">에너지원</span>
              <v-btn-toggle
                v-model="form.energySrc"
                mandatory
                density="compact"
                class="toggle-group"
              >
                <v-btn value="60" variant="text" class="toggle-btn">해상풍력</v-btn>
                <v-btn value="40" variant="text" class="toggle-btn">태양광</v-btn>
                <v-btn value="70" variant="text" class="toggle-btn">육상풍력</v-btn>
                <v-btn value="90" variant="text" class="toggle-btn">BESS</v-btn>
              </v-btn-toggle>
            </div>
          </v-col>
          <v-col class="col-span-2">
            <div class="field-item">
              <span class="field-label">재무모델 파일 첨부</span>
              <div class="d-flex align-center ga-1">
                <v-text-field
                  v-model="attachFileName"
                  variant="outlined"
                  density="compact"
                  hide-details
                  readonly
                  placeholder="파일을 선택하세요"
                />
                <v-btn variant="flat" size="small" text="찾아보기" @click="openFilePicker"/>
                <input ref="fileInput" type="file" style="display: none" @change="onFileSelected"/>
              </div>
            </div>
          </v-col>
          <v-col style="visibility: hidden;" aria-hidden="true"/>
        </v-row>

        <!-- 사업(총투자): 4 fields + spacer = 5 cols -->
        <div class="form-section-header mb-3">
          <div class="d-flex align-center" style="gap: 8px;">
            <div class="section-bar" />
            <span>사업(총투자)</span>
          </div>
        </div>
        <v-row no-gutters class="ga-6 mb-6">
          <v-col>
            <div class="field-item">
              <span class="field-label">세후 사업수익률</span>
              <BrNumberField v-model="form.ticAtrRoi" hide-details allow-decimal/>
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">NPV(억원)</span>
              <BrNumberField v-model="form.ticNpvVal" hide-details/>
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">B/C(할인율 적용 후)</span>
              <BrNumberField v-model="form.ticBcrDsc" hide-details allow-decimal/>
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">회수기간(년)</span>
              <BrNumberField v-model="form.ticPbpYrs" hide-details/>
            </div>
          </v-col>
          <v-col style="visibility: hidden;" aria-hidden="true"/>
        </v-row>

        <!-- 자기자본(주주): 5 fields -->
        <div class="form-section-header mb-3">
          <div class="d-flex align-center" style="gap: 8px;">
            <div class="section-bar" />
            <span>자기자본(주주)</span>
          </div>
        </div>
        <v-row no-gutters class="ga-6 mb-4">
          <v-col>
            <div class="field-item">
              <span class="field-label">자기자본수익률(FCFE)</span>
              <BrNumberField v-model="form.eqtRoeFcf" hide-details allow-decimal/>
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">자기자본수익률(배당)</span>
              <BrNumberField v-model="form.eqtRoeDiv" hide-details allow-decimal/>
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">NPV(억원)</span>
              <BrNumberField v-model="form.eqtNpvVal" hide-details/>
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">B/C(할인율 적용 후)</span>
              <BrNumberField v-model="form.eqtBcrDsc" hide-details allow-decimal/>
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">회수기간(년)</span>
              <BrNumberField v-model="form.eqtPbpYrs" hide-details/>
            </div>
          </v-col>
        </v-row>

        <!-- 버튼 -->
        <div class="d-flex justify-end ga-1">
          <v-btn
            variant="flat"
            text="저장"
            prepend-icon="mdi-content-save-outline"
            color="primary"
            @click="saveForm"
          />
        </div>
      </div>
    </v-card>

    <!-- 삭제 확인 다이얼로그 -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-subtitle-1 font-weight-bold pa-4"
          >삭제 확인</v-card-title
        >
        <v-card-text>
          <strong>{{ deleteTarget?.bizTitle }}</strong> 의 재무정보를
          삭제하시겠습니까?
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="outlined" text="취소" @click="deleteDialog = false" />
          <v-btn
            variant="flat"
            color="red-darken-1"
            text="삭제"
            @click="doDelete"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
// ============================================================
// [1] Vue / 플러그인 임포트
// ============================================================
import { ref, getCurrentInstance, onMounted } from "vue";
import dayjs from "dayjs";
import { useBizBreadcrumb } from "@/composables/useBizBreadcrumb.js";
import { useDialog } from "@/plugins/dialogHelp";
import BrDateField from "@/components/BrDateField.jsx";
import BrNumberField from "@/components/BrNumberField.jsx";

// ============================================================
// [2] 스토어 / 글로벌 도구
// ============================================================
const { proxy } = getCurrentInstance();
const dialog = useDialog();
useBizBreadcrumb('재무 정보 관리', { base: 'anchor', fallback: '경제성분석', watchMenu: true });

// ============================================================
// [3] 검색 조건 / 목록
// ============================================================
const energySrcItems = [
  { title: '해상풍력', value: '60' },
  { title: '태양광',   value: '40' },
  { title: '육상풍력', value: '70' },
  { title: 'BESS',    value: '90' },
];
const searchParams = ref({
  energySrc: null,
  bizTitle: "",
});

const tableList = ref([]);

const fetchList = () => {
  proxy.$br_trans(
    [
      {
        url: "/kopms-api/ecoAnl/list",
        method: "post",
        data: {
          energySrc: searchParams.value.energySrc || "",
          bizTitle: searchParams.value.bizTitle || "",
        },
      },
    ],
    (_url, code, _msg, data) => {
      if (code < 0) return;
      tableList.value = data.list || [];
    },
  );
};

// ============================================================
// [4] 행 선택
// ============================================================
const selectedAnlSeq = ref(null);

const selectRow = (item) => {
  selectedAnlSeq.value = item.anlSeq;
  form.value = {
    anlSeq: item.anlSeq,
    bizTitle: item.bizTitle || "",
    energySrc: item.energySrc || "",
    standDate: item.standDate || "",
    ticAtrRoi: item.ticAtrRoi ?? "",
    ticNpvVal: item.ticNpvVal ?? "",
    ticBcrDsc: item.ticBcrDsc ?? "",
    ticPbpYrs: item.ticPbpYrs ?? "",
    eqtRoeFcf: item.eqtRoeFcf ?? "",
    eqtRoeDiv: item.eqtRoeDiv ?? "",
    eqtNpvVal: item.eqtNpvVal ?? "",
    eqtBcrDsc: item.eqtBcrDsc ?? "",
    eqtPbpYrs: item.eqtPbpYrs ?? "",
    attachFileSeq: item.attachFileSeq || "",
  };
  attachFileName.value = item.attachFileSeq ? "첨부파일 있음" : "";
  standDatePicker.value = item.standDate ? new Date(item.standDate) : null;
};

// ============================================================
// [5] 입력 폼
// ============================================================
const initForm = () => ({
  anlSeq: null,
  bizTitle: "",
  energySrc: "",
  standDate: "",
  ticAtrRoi: "",
  ticNpvVal: "",
  ticBcrDsc: "",
  ticPbpYrs: "",
  eqtRoeFcf: "",
  eqtRoeDiv: "",
  eqtNpvVal: "",
  eqtBcrDsc: "",
  eqtPbpYrs: "",
  attachFileSeq: "",
});

const form = ref(initForm());

const resetForm = () => {
  form.value = initForm();
  selectedAnlSeq.value = null;
  attachFileName.value = "";
  standDatePicker.value = null;
};

// ============================================================
// [6] 기준일 날짜 피커
// ============================================================
const standDateMenu = ref(false);
const standDatePicker = ref(null);

const onStandDateSelected = (val) => {
  form.value.standDate = dayjs(val).format("YYYY-MM-DD");
  standDateMenu.value = false;
};

// ============================================================
// [7] 파일 첨부
// ============================================================
const fileInput = ref(null);
const attachFileName = ref("");
const selectedFile = ref(null);

const openFilePicker = () => {
  fileInput.value?.click();
};

const onFileSelected = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  selectedFile.value = file;
  attachFileName.value = file.name;
};

// ============================================================
// [8] 저장 / 삭제
// ============================================================
const saveForm = () => {
  if (!form.value.bizTitle) {
    proxy.$dialog?.warning({
      title: "입력 오류",
      text: "사업명을 입력하세요.",
    });
    return;
  }

  const saveData = { ...form.value };

  proxy.$br_trans(
    [
      {
        url: "/kopms-api/ecoAnl/save",
        method: "post",
        data: saveData,
      },
    ],
    (_url, code, _msg, _data) => {
      if (code < 0) return;
      dialog.message.success('저장되었습니다.');
      fetchList();
      //resetForm();
    },
  );
};

// -----------------------------------------------------------
const deleteDialog = ref(false);
const deleteTarget = ref(null);

const confirmDelete = (item) => {
  deleteTarget.value = item;
  deleteDialog.value = true;
};

const doDelete = () => {
  proxy.$br_trans(
    [
      {
        url: "/kopms-api/ecoAnl/delete",
        method: "post",
        data: { anlSeq: deleteTarget.value.anlSeq },
      },
    ],
    (_url, code, _msg, _data) => {
      deleteDialog.value = false;
      if (code < 0) return;
      if (selectedAnlSeq.value === deleteTarget.value.anlSeq) resetForm();
      fetchList();
    },
  );
};

// ============================================================
// [9] 헬퍼 / 파일 다운로드
// ============================================================
const downloadFile = (item) => {
  if (!item.attachFileSeq) return;
  window.open(
    `/kopms-api/file/download?attachFileSeq=${item.attachFileSeq}`,
    "_blank",
  );
};

// -----------------------------------------------------------
const formatVal = (val) => {
  if (val === null || val === undefined || val === "") return "-";
  return Number(val).toLocaleString();
};

// ============================================================
// [10] 생명주기
// ============================================================
onMounted(() => {
  fetchList();
});
</script>

<style scoped lang="scss">
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
    padding: 0px 8px;
  }

  .fin-row {
    cursor: pointer;
    &:hover {
      background-color: #f5f5f5;
    }
  }

  .fin-row-selected {
    background-color: #e3f2fd !important;
  }
}

// 등록 폼: CSS Grid로 5열 정렬 (flexbox의 gap 미포함 span 문제 해결)
.reg-grid {
  :deep(.v-row) {
    display: grid !important;
    grid-template-columns: repeat(5, 1fr);
    flex-wrap: unset !important;
  }
  :deep(.v-col) {
    flex: unset !important;
    max-width: unset !important;
    min-width: 0;
  }
  :deep(.col-span-2) {
    grid-column: span 2;
  }
}
</style>
