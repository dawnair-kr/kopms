<template>
  <v-container class="main-page-wrapper">
    <v-card variant="outlined" class="ma-2 bg-white">

      <!-- 제목 / 구분 -->
      <v-table class="form-table" density="compact">
        <tbody>
          <tr>
            <th class="label-col">
              <v-icon icon="mdi-circle-small" color="orange" />제목
            </th>
            <td colspan="3">
              <v-text-field
                v-model="form.title"
                variant="outlined"
                density="compact"
                hide-details
              />
            </td>
            <th class="label-col">
              <v-icon icon="mdi-circle-small" color="orange" />구분
            </th>
            <td>
              <v-select
                v-model="form.meetGubun"
                :items="roomTypeItems"
                item-title="text"
                item-value="value"
                variant="outlined"
                density="compact"
                hide-details
                style="min-width: 130px"
              />
            </td>
          </tr>

          <!-- 작성자 / 신청일 / 시간 -->
          <tr>
            <th class="label-col">작성자</th>
            <td>
              <span class="text-body-2">{{ userStore.getUserInfo()?.name }}</span>
            </td>
            <th class="label-col">
              <v-icon icon="mdi-circle-small" color="orange" />신청일
            </th>
            <td>
              <v-menu v-model="dateMenu" :close-on-content-click="false">
                <template #activator="{ props: menuProps }">
                  <BrDateField
                    v-bind="menuProps"
                    v-model="form.rsvDate"
                    variant="outlined"
                    density="compact"
                    hide-details
                    append-inner-icon="mdi-calendar"
                    style="min-width: 150px"
                  />
                </template>
                <v-date-picker
                  v-model="datePicker"
                  @update:model-value="onDateSelected"
                  hide-header
                />
              </v-menu>
            </td>
            <th class="label-col">
              <v-icon icon="mdi-circle-small" color="orange" />시간
            </th>
            <td>
              <div class="d-flex align-center ga-1">
                <v-select
                  v-model="form.srtTime"
                  :items="hourItems"
                  item-title="text"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  style="min-width: 90px"
                />
                <span>~</span>
                <v-select
                  v-model="form.endTime"
                  :items="hourItems"
                  item-title="text"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  style="min-width: 90px"
                />
              </div>
            </td>
          </tr>

          <!-- 내용 -->
          <tr>
            <th class="label-col">
              <v-icon icon="mdi-circle-small" color="orange" />내용
            </th>
            <td colspan="5" class="content-cell">
              <v-textarea
                v-model="form.contents"
                variant="outlined"
                hide-details
                rows="10"
                no-resize
              />
            </td>
          </tr>

          <!-- 첨부파일 -->
          <tr>
            <th class="label-col">첨부파일</th>
            <td colspan="5">
              <div class="d-flex align-center ga-1">
                <v-text-field
                  :model-value="selectedFileName"
                  variant="outlined"
                  density="compact"
                  hide-details
                  readonly
                  style="max-width: 350px"
                />
                <v-btn
                  size="small"
                  variant="outlined"
                  @click="triggerFileInput"
                >
                  찾아보기
                </v-btn>
                <v-btn
                  size="small"
                  variant="outlined"
                  prepend-icon="mdi-plus-thick"
                  color="red"
                  @click="addFile"
                >
                  추가
                </v-btn>
                <v-btn
                  size="small"
                  variant="outlined"
                  prepend-icon="mdi-trash-can-outline"
                  color="blue"
                  @click="removeFile"
                >
                  삭제
                </v-btn>
                <input ref="fileInput" type="file" style="display: none" @change="onFileChange" />
              </div>
              <!-- 추가된 파일 목록 -->
              <div v-if="fileList.length > 0" class="mt-1">
                <v-chip
                  v-for="(f, i) in fileList"
                  :key="i"
                  closable
                  size="small"
                  class="mr-1"
                  @click:close="fileList.splice(i, 1)"
                >
                  {{ f.name }}
                </v-chip>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- 저장 / 목록 버튼 -->
    <v-row no-gutters class="mx-2 mb-2 justify-end ga-1">
      <v-btn
        variant="outlined"
        prepend-icon="mdi-content-save-outline"
        @click="saveMeeting"
      >
        저장
      </v-btn>
      <v-btn
        variant="outlined"
        prepend-icon="mdi-format-list-bulleted"
        @click="$router.push('/meeting')"
      >
        목록
      </v-btn>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, getCurrentInstance } from 'vue';
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user.js';
import { useSelectMenuStore } from '@/store/selectMenuStore.js';
import BrDateField from '@/components/BrDateField.jsx';

const { proxy } = getCurrentInstance();
const router = useRouter();
const userStore = useUserStore();
const selectMenuStore = useSelectMenuStore();

// 메뉴 menuNo → 부서코드 areaCode 매핑
const AREA_CODE_MAP = {
  '4402': 'OB',  // 해외사업
  '5700': 'BO'   // 사업운영
};

// ============================================================
// [1] 폼 데이터
// ============================================================
const form = ref({
  title: '',
  meetGubun: 'SM',
  rsvDate: dayjs().format('YYYY-MM-DD'),
  srtTime: '08',
  endTime: '09',
  contents: '',
  areaCode: AREA_CODE_MAP[selectMenuStore.selectMenuInfo?.menuNo] ?? '',
});

// ============================================================
// [2] 구분 / 시간 목록
// ============================================================
const roomTypeItems = [
  { text: '소회의실', value: 'SM' },
  { text: '대회의실', value: 'LG' },
];

const hourItems = Array.from({ length: 24 }, (_, i) => {
  const h = String(i).padStart(2, '0');
  return { text: `${h} 시`, value: h };
});

// ============================================================
// [3] 날짜 피커
// ============================================================
const dateMenu = ref(false);

const parseDate = (str) => str ? dayjs(str).toDate() : null;
const formatDate = (val) => dayjs(val).format('YYYY-MM-DD');

const datePicker = computed({
  get: () => parseDate(form.value.rsvDate),
  set: () => {},
});

const onDateSelected = (val) => {
  if (val) form.value.rsvDate = formatDate(val);
  dateMenu.value = false;
};

// ============================================================
// [4] 파일 첨부
// ============================================================
const fileInput = ref(null);
const fileList = ref([]);
const selectedFile = ref(null);
const selectedFileName = computed(() => selectedFile.value?.name ?? '');

const triggerFileInput = () => fileInput.value?.click();

const onFileChange = (e) => {
  selectedFile.value = e.target.files[0] ?? null;
};

const addFile = () => {
  if (!selectedFile.value) return;
  fileList.value.push(selectedFile.value);
  selectedFile.value = null;
  fileInput.value.value = '';
};

const removeFile = () => {
  selectedFile.value = null;
  if (fileInput.value) fileInput.value.value = '';
};

// ============================================================
// [5] 저장
// ============================================================
const saveMeeting = () => {
  if (!form.value.title.trim()) {
    proxy.$dialog.message.warning('제목을 입력해주세요.');
    return;
  }

  const inputData = {
    title:     form.value.title,
    meetGubun: form.value.meetGubun,
    rsvDate:   form.value.rsvDate,
    srtTime:   form.value.srtTime + ':00',
    endTime:   form.value.endTime  + ':00',
    contents:  form.value.contents,
    areaCode:  form.value.areaCode,
  };

  proxy.$br_trans([{
    url: '/kopms-api/meeting/saveMeeting',
    method: 'post',
    data: inputData
  }], (url, code, msg, data) => {
      if (code < 0) return;
      proxy.$dialog.message.success('저장되었습니다.');
      router.push('/meeting');
    }
  );
};
</script>

<style scoped lang="scss">
.form-table {
  width: 100%;
  border-collapse: collapse;

  th, td {
    border: 1px solid #e0e0e0;
    padding: 6px 10px;
    vertical-align: middle;
  }

  .label-col {
    background-color: #e8eef7;
    font-weight: 600;
    white-space: nowrap;
    min-width: 90px;
    text-align: center;
  }

  .content-cell {
    padding: 8px 10px;
  }
}

:deep(.v-field__input) {
  min-height: 28px;
  padding-top: 0;
  padding-bottom: 0;
  font-size: 13px;
}
</style>
