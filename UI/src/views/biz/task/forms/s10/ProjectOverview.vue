<template>
  <v-defaults-provider :defaults="{ global: { readonly: readonly } }">
  <v-sheet rounded="lg" class="pa-4 mb-3 form-card">

    <!-- 섹션 헤더 -->
    <div class="form-section-header mb-3">
      <div class="d-flex align-center" style="gap: 8px;">
        <div class="section-bar" />
        <span>사업개요</span>
      </div>
    </div>

    <!-- Row 1: 관련문서 -->
    <v-row no-gutters class="ga-6 mb-6">
      <v-col>
        <div class="field-item">
          <span class="field-label required">관련문서</span>
          <div class="d-flex align-center ga-1">
            <v-text-field hide-details variant="outlined" density="compact">
              <template #prepend-inner><span class="form-unit">문서 번호</span></template>
            </v-text-field>
            <v-text-field hide-details variant="outlined" density="compact">
              <template #prepend-inner><span class="form-unit">파일</span></template>
            </v-text-field>
            <v-btn variant="flat" height="32" text="찾아보기"/>
            <v-btn variant="flat" prepend-icon="mdi-plus" height="32" text="추가"/>
            <v-btn variant="flat" prepend-icon="mdi-minus" height="32" text="삭제"/>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Row 2: 사업요약 -->
    <v-row no-gutters class="ga-6 mb-6">
      <v-col>
        <div class="field-item">
          <span class="field-label">사업요약 <span class="text-caption text-medium-emphasis">(조건, 구도 등)</span></span>
          <v-textarea v-model="modelValue.bizInfo.bizContents" density="compact" hide-details no-resize variant="outlined" rows="3"/>
        </div>
      </v-col>
    </v-row>

    <!-- Row 3: 총 사업비 + 설비용량 -->
    <v-row no-gutters class="ga-6 mb-6">
      <v-col>
        <div class="field-item">
          <span class="field-label required">총 사업기간</span>
          <BrNumberField v-model="modelValue.bizInfo.bizDate" hide-details :readonly="readonly">
            <template #append-inner><span class="form-unit">년</span></template>
          </BrNumberField>
        </div>
      </v-col>
      <v-col>
        <div class="field-item">
          <span class="field-label">착공일 / 준공일</span>
          <div class="d-flex align-center ga-1">
            <v-menu v-model="useDateMenu" :close-on-content-click="false" :disabled="readonly">
              <template #activator="{ props: menuProps }">
                <BrDateField v-bind="menuProps" v-model="modelValue.bizInfo.useDate" hide-details append-inner-icon="mdi-calendar"/>
              </template>
              <v-date-picker v-model="useDatePicker" @update:model-value="onUseDateSelected" hide-header/>
            </v-menu>
            <span class="form-unit">/</span>
            <v-menu v-model="startDateMenu" :close-on-content-click="false" :disabled="readonly">
              <template #activator="{ props: menuProps }">
                <BrDateField v-bind="menuProps" v-model="modelValue.bizInfo.startDate" hide-details append-inner-icon="mdi-calendar"/>
              </template>
              <v-date-picker v-model="startDatePicker" @update:model-value="onStartDateSelected" hide-header/>
            </v-menu>
          </div>
        </div>
      </v-col>
      <v-col>
        <div class="field-item">
          <span class="field-label">총 사업비</span>
          <div class="d-flex align-center ga-2">
            <BrNumberField v-model="modelValue.bizInfo.bizMoney" hide-details :readonly="readonly"/>
            <v-autocomplete
              v-model="modelValue.bizInfo.amtUnit"
              :items="codes['186'] || []"
              item-title="codeName"
              item-value="codeValue"
              density="compact"
              hide-details
              variant="outlined"
              style="max-width: 160px;"
            >
              <template #prepend-inner><span class="form-unit">단위</span></template>
            </v-autocomplete>
          </div>
        </div>
      </v-col>
      <v-col>
        <div class="field-item">
          <span class="field-label">설비용량</span>
          <div class="d-flex align-center ga-2">
            <BrNumberField v-model="modelValue.bizInfo.powerVolume" hide-details variant="outlined" density="compact" :readonly="readonly"/>
            <v-autocomplete
              v-model="modelValue.bizInfo.powerUnit"
              :items="codes['187'] || []"
              item-title="codeName"
              item-value="codeValue"
              density="compact"
              hide-details
              variant="outlined"
              style="max-width: 160px;"
            >
              <template #prepend-inner><span class="form-unit">단위</span></template>
            </v-autocomplete>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Row 4: 에너지원 (3fr + 1fr spacer) -->
    <div class="energy-row">
      <div class="field-item">
        <span class="field-label required">에너지원</span>
        <div class="d-flex ga-4">
          <div class="energy-section">
            <span class="energy-label" :class="{ 'is-active': isThermalActive }">화력</span>
            <v-btn-toggle v-model="modelValue.powerType" density="compact" class="toggle-group" mandatory :disabled="readonly">
              <v-btn v-for="item in thermalList" :key="item.codeValue" :value="item.codeValue" variant="text" class="toggle-btn">{{ item.codeName }}</v-btn>
            </v-btn-toggle>
          </div>
          <div class="energy-section">
            <span class="energy-label" :class="{ 'is-active': isRenewableActive }">재생에너지</span>
            <v-btn-toggle v-model="modelValue.powerType" density="compact" class="toggle-group" mandatory :disabled="readonly">
              <v-btn v-for="item in renewableList" :key="item.codeValue" :value="item.codeValue" variant="text" class="toggle-btn">{{ item.codeName }}</v-btn>
            </v-btn-toggle>
          </div>
          <div class="energy-section">
            <span class="energy-label" :class="{ 'is-active': isOtherEnergyActive }">기타 에너지</span>
            <v-btn-toggle v-model="modelValue.powerType" density="compact" class="toggle-group" mandatory :disabled="readonly">
              <v-btn v-for="item in otherEnergyList" :key="item.codeValue" :value="item.codeValue" variant="text" class="toggle-btn">{{ item.codeName }}</v-btn>
            </v-btn-toggle>
          </div>
        </div>
      </div>
      <div/>
    </div>

  </v-sheet>
  </v-defaults-provider>
</template>

<script setup>
import { ref, computed, getCurrentInstance } from 'vue';
import BrNumberField from '@/components/BrNumberField.jsx';
import BrDateField from '@/components/BrDateField.jsx';
import dayjs from 'dayjs';
const { proxy } = getCurrentInstance();

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  codes: {
    type: Object,
    required: true
  },
  readonly: {
    type: Boolean,
    default: false
  },
})

const emit = defineEmits(['update:modelValue']);

// 착공일 피커
const useDateMenu = ref(false);
const useDatePicker = ref(null);
const onUseDateSelected = (val) => {
  props.modelValue.bizInfo.useDate = dayjs(val).format('YYYY-MM-DD');
  useDateMenu.value = false;
};

// 준공일 피커
const startDateMenu = ref(false);
const startDatePicker = ref(null);
const onStartDateSelected = (val) => {
  props.modelValue.bizInfo.startDate = dayjs(val).format('YYYY-MM-DD');
  startDateMenu.value = false;
};

// 유효성 검사
const validate = async () => {
  const err = (text) => proxy.$dialog.error({ title: '필수항목 누락', text })
  if (!props.modelValue.bizInfo?.bizDate) {
    await err('총 사업기간을 입력해주세요.')
    return false
  }
  if (!props.modelValue.powerType) {
    await err('에너지원을 선택해주세요.')
    return false
  }
  return true
}

// 화력 리스트 (10 ~ 30)
const thermalList = computed(() => {
  return (props.codes['105'] || []).filter(item => {
    const val = Number(item.codeValue);
    return val >= 10 && val <= 30;
  });
});

// 재생에너지 리스트 (40 ~ 70)
const renewableList = computed(() => {
  return (props.codes['105'] || []).filter(item => {
    const val = Number(item.codeValue);
    return val >= 40 && val <= 70;
  });
});

// 기타 에너지 리스트 (80 ~ 120)
const otherEnergyList = computed(() => {
  return (props.codes['105'] || []).filter(item => {
    const val = Number(item.codeValue);
    return val >= 80 && val <= 120;
  });
});

// 선택된 에너지원이 속한 그룹 활성 여부
const isThermalActive = computed(() => { const v = Number(props.modelValue.powerType); return v >= 10 && v <= 30; });
const isRenewableActive = computed(() => { const v = Number(props.modelValue.powerType); return v >= 40 && v <= 70; });
const isOtherEnergyActive = computed(() => { const v = Number(props.modelValue.powerType); return v >= 80 && v <= 120; });

// 외부에서 호출 가능하도록 expose
defineExpose({
  validate,
})

</script>

<style scoped lang="scss">
// 전역 공통: .form-card, .form-section-header, .section-bar, .field-item, .field-label → settings.scss

.energy-row {
  display: grid;
  grid-template-columns: 3fr 1fr;
}

.energy-section {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .energy-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #94a3b8;
    letter-spacing: 0.01em;
    transition: color 0.15s;

    &.is-active {
      color: #004098;
      font-weight: 700;
    }
  }
}
</style>