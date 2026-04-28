<template>
  <!-- 기본계획(품의) -->
  <div class="section-header">
    <span class="section-title">기본계획(품의)</span>
  </div>
  <v-sheet border class="mb-4">
    <v-row no-gutters class="border-b">
      <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
        <span class="required">용역명</span>
      </v-col>
      <v-col cols="4" class="pa-2 d-flex align-center">
        <span class="font-weight-bold">{{ task.taskName }}</span>
      </v-col>
      <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
        <span class="font-weight-bold">문서번호</span>
      </v-col>
      <v-col cols="4" class="pa-2">
        <v-text-field v-model="modelValue.serviceInfo.mikepDocNo" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
      </v-col>
    </v-row>
    <v-row no-gutters class="border-b">
      <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
        <span class="required">용역기간</span>
      </v-col>
      <v-col cols="4" class="pa-2 d-flex align-center ga-2">
        <span>착수 후</span>
        <v-text-field v-model="modelValue.serviceInfo.svcDays" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
        <span>개월</span>
      </v-col>
    </v-row>
    <v-row no-gutters class="border-b">
      <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
        <span class="required">계약방식</span>
      </v-col>
      <v-col class="pa-2">
        <v-radio-group v-model="modelValue.serviceInfo.conMth" inline hide-details density="compact" :readonly="isCompleted">
          <v-radio
            v-for="item in codes['184']"
            :key="item.codeValue"
            :label="item.codeName"
            :value="item.codeValue"
          />
        </v-radio-group>
      </v-col>
    </v-row>
    <v-row no-gutters class="border-b">
      <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
        <span class="required">평가방법</span>
      </v-col>
      <v-col class="pa-2">
        <v-radio-group v-model="modelValue.serviceInfo.evaluation" inline hide-details density="compact" :readonly="isCompleted">
          <v-radio
            v-for="item in codes['185']"
            :key="item.codeValue"
            :label="item.codeName"
            :value="item.codeValue"
          />
        </v-radio-group>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
        <span class="required">평가기준</span>
      </v-col>
      <v-col class="pa-2 d-flex align-center ga-2 border-e">
        <span>기술평가</span>
        <v-text-field v-model="modelValue.serviceInfo.evcTec" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
        <span>점</span>
      </v-col>
      <v-col class="pa-2 d-flex align-center ga-2">
        <span>가격평가</span>
        <v-text-field v-model="modelValue.serviceInfo.evcPrc" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
        <span>점</span>
      </v-col>
    </v-row>
  </v-sheet>

  <!-- 입찰 및 평가 -->
  <div class="section-header">
    <span class="section-title">입찰 및 평가</span>
  </div>
  <v-sheet border class="mb-2">
    <v-row no-gutters>
      <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
        <span class="font-weight-bold">입찰공고</span>
      </v-col>
      <v-col cols="4" class="pa-2">
        <v-text-field v-model="modelValue.serviceInfo.bidTndNo" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
      </v-col>
      <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
        <span class="font-weight-bold">PQ심사</span>
      </v-col>
      <v-col class="pa-2 d-flex align-center ga-2">
        <v-text-field v-model="modelValue.serviceInfo.pqNo" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
        <span class="font-weight-bold">적격심사</span>
      </v-col>
      <v-col cols="4" class="pa-2">
        <v-text-field v-model="modelValue.serviceInfo.elgNo" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
      </v-col>
      <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
        <span class="font-weight-bold">계약체결</span>
      </v-col>
      <v-col class="pa-2 d-flex align-center ga-2">
        <v-text-field v-model="modelValue.serviceInfo.conNo" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
      </v-col>
    </v-row>
  </v-sheet>

  <!-- 양식 다운로드 -->
  <div class="mb-4 mt-1">
    <span class="text-caption text-grey-darken-1">&#8226; 양식 다운로드 : </span>
    <span class="text-caption text-blue-darken-2 panel-download-link">기본계획.hwpx</span>
    <span class="text-caption text-blue-darken-2 panel-download-link">용역설계서.hwpx</span>
    <span class="text-caption text-blue-darken-2 panel-download-link">사업수행능력 평가기준.hwpx</span>
    <span class="text-caption text-blue-darken-2 panel-download-link">적격심사 세부기준.hwpx</span>
    <span class="text-caption text-blue-darken-2 panel-download-link">용역비 산출내역서.xlsx</span>
    <span class="text-caption text-blue-darken-2 panel-download-link">용역결과보고.hwpx</span>
    <span class="text-caption text-blue-darken-2 panel-download-link">입찰공고문.hwpx</span>
    <span class="text-caption text-blue-darken-2 panel-download-link">PQ심사.hwpx</span>
    <span class="text-caption text-blue-darken-2 panel-download-link">PQ심사표.xlsx</span>
    <span class="text-caption text-blue-darken-2 panel-download-link">PQ심사 결과보고.hwpx</span>
    <span class="text-caption text-blue-darken-2 panel-download-link">적격심사 결과보고.hwpx</span>
  </div>

  <!-- 계약체결 -->
  <div class="section-header ga-1">
    <span class="section-title mr-1">계약체결</span>
    <v-btn variant="flat" prepend-icon="mdi-plus" size="x-small" text="추가" :disabled="isCompleted" @click="addContract"/>
    <v-btn variant="flat" prepend-icon="mdi-minus" size="x-small" text="삭제" :disabled="isCompleted" @click="removeContract"/>
  </div>

  <v-sheet v-for="(contract, index) in modelValue.contracts" :key="index" border class="mb-4">
    <v-row no-gutters>
      <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
        <span class="required">문서번호</span>
      </v-col>
      <v-col cols="10" class="pa-2 d-flex align-center ga-1">
        <v-text-field v-model="contract.mikepDocNo" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
        <v-btn variant="flat" size="small" :disabled="isCompleted">불러오기</v-btn>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
        <span class="font-weight-bold">계약대상자</span>
      </v-col>
      <v-col cols="4" class="pa-2">
        <v-text-field v-model="contract.contractor" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
      </v-col>
      <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
        <span class="font-weight-bold">계약금액(원)</span>
      </v-col>
      <v-col cols="4" class="pa-2">
        <v-text-field v-model="contract.conAmt" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
        <span class="required">용역시작일</span>
      </v-col>
      <v-col cols="4" class="pa-2">
        <v-menu v-model="contract._startMenu" :close-on-content-click="false" :disabled="isCompleted">
          <template #activator="{ props: menuProps }">
            <BrDateField
              v-bind="menuProps"
              v-model="contract.svcStart"
              variant="outlined"
              density="compact"
              hide-details
              append-inner-icon="mdi-calendar"
              class="br-date-field"
              :readonly="isCompleted"
            />
          </template>
          <v-date-picker
            :model-value="parseDate(contract.svcStart)"
            @update:model-value="val => onDateSelected(contract, 'svcStart', '_startMenu', val)"
            hide-header
          />
        </v-menu>
      </v-col>
      <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
        <span class="required">용역완료일</span>
      </v-col>
      <v-col cols="4" class="pa-2">
        <v-menu v-model="contract._endMenu" :close-on-content-click="false" :disabled="isCompleted">
          <template #activator="{ props: menuProps }">
            <BrDateField
              v-bind="menuProps"
              v-model="contract.svcEnd"
              variant="outlined"
              density="compact"
              hide-details
              append-inner-icon="mdi-calendar"
              class="br-date-field"
              :readonly="isCompleted"
            />
          </template>
          <v-date-picker
            :model-value="parseDate(contract.svcEnd)"
            @update:model-value="val => onDateSelected(contract, 'svcEnd', '_endMenu', val)"
            hide-header
          />
        </v-menu>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
        <span class="font-weight-bold">계약번호</span>
      </v-col>
      <v-col cols="10" class="pa-2">
        <v-text-field v-model="contract.conNo" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
      </v-col>
    </v-row>
  </v-sheet>

  <!-- 용역결과 -->
  <div class="section-header">
    <span class="section-title">용역결과</span>
  </div>
  <v-sheet border class="mb-4">
    <v-row no-gutters>
      <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
        <span class="font-weight-bold">관련 인허가</span>
      </v-col>
      <v-col class="pa-2">
        <v-text-field v-model="modelValue.serviceInfo.relatedLic" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
        <span class="font-weight-bold">후속업무</span>
      </v-col>
      <v-col class="pa-2">
        <v-text-field v-model="modelValue.serviceInfo.afterTask" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
      </v-col>
    </v-row>
  </v-sheet>

  <!-- 관련문서 목록 -->
  <div class="section-header">
    <span class="section-title">관련문서 목록</span>
  </div>
  <v-sheet border>
    <div class="pa-4 text-center text-grey">
      관련문서가 여기에 표시됩니다.
    </div>
  </v-sheet>
</template>

<script setup>
import { ref, inject, onMounted, getCurrentInstance } from "vue";
import BrDateField from "@/components/BrDateField.jsx";
import { useCommonCode } from '@/composables/useCommonCode';

const props = defineProps({
  task: { type: Object, default: () => ({}) },
  modelValue: { type: Object, required: true },
});

const emit = defineEmits(['update:modelValue']);

const isCompleted = inject('isCompleted', ref(false));

const { proxy } = getCurrentInstance();
const codes = ref({});
const { loadCodes } = useCommonCode();

// ── 날짜 유틸 ──
const parseDate = (str) => str && str.length === 10 ? new Date(str + 'T00:00:00') : null;
const formatDate = (val) => {
  const d = new Date(val);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const onDateSelected = (item, dateField, menuField, val) => {
  if (val) item[dateField] = formatDate(val);
  item[menuField] = false;
};

// ── 계약체결 추가/삭제 (Consortium.vue 패턴) ──
const newContract = () => ({
  mikepDocNo: '', contractor: '', conAmt: '',
  svcStart: '', svcEnd: '', conNo: '',
  _startMenu: false, _endMenu: false,
});

const addContract = () => {
  const list = [...(props.modelValue.contracts || [])];
  list.push(newContract());
  emit('update:modelValue', { ...props.modelValue, contracts: list });
};

const removeContract = () => {
  const list = props.modelValue.contracts || [];
  if (list.length > 1) {
    const newList = [...list];
    newList.pop();
    emit('update:modelValue', { ...props.modelValue, contracts: newList });
  }
};

onMounted(() => {
  // 계약체결 최소 1건 보장
  if (!props.modelValue.contracts?.length) {
    addContract();
  }

  // 공통코드 로드 (184: 계약방식, 185: 평가방법)
  loadCodes(['184', '185']).then(groupCodes => {
    codes.value = groupCodes;
  });
});
</script>

<style scoped>
.panel-download-link {
  cursor: pointer;
  margin-right: 6px;
  text-decoration: underline;
  &:hover { opacity: 0.7; }
}
</style>
