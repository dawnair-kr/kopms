<template>
  <div class="rounded">

    <v-sheet rounded="lg" class="pa-4 mb-3 form-card">

      <!-- 섹션 헤더 -->
      <div class="form-section-header mb-3">
        <div class="d-flex align-center" style="gap: 8px;">
          <div class="section-bar" />
          <span>기본정보</span>
        </div>
        <v-select
          :model-value="selectedVersion"
          :items="versionList"
          item-title="text"
          item-value="value"
          density="compact"
          variant="outlined"
          hide-details
          style="max-width: 130px;"
          @update:model-value="$emit('update:selectedVersion', $event)"
        />
      </div>

      <!-- 사업명 -->
      <div class="biz-title-wrap mb-6">
        <span class="field-label required">사업명</span>
        <v-text-field
          v-model="modelValue.bizTitle"
          variant="underlined"
          density="compact"
          hide-details
          :readonly="readonly"
          placeholder="사업명을 입력하세요"
          class="biz-title-input"
        />
      </div>

      <!-- Row 1: 관리번호 + 입력일 -->
      <v-row no-gutters class="ga-6 mb-6">
        <v-col>
          <div class="field-item">
            <span class="field-label">관리번호</span>
            <v-text-field
              :model-value="modelValue.docNo"
              variant="outlined"
              density="compact"
              hide-details
              readonly
            />
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label">입력일</span>
            <v-text-field
              :model-value="modelValue.regiDate || today"
              variant="outlined"
              density="compact"
              hide-details
              readonly
            />
          </div>
        </v-col>
        <v-col style="visibility: hidden;" aria-hidden="true"/>
        <v-col style="visibility: hidden;" aria-hidden="true"/>
      </v-row>

      <!-- Row 2: 정보입력자 -->
      <v-row no-gutters class="ga-6 mb-6">
        <v-col>
          <div class="field-item">
            <span class="field-label required">정보입력자 소속</span>
            <v-text-field
              v-model="modelValue.deptName"
              variant="outlined"
              density="compact"
              hide-details
              readonly
            />
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label">직명</span>
            <v-text-field
              v-model="modelValue.posName"
              variant="outlined"
              density="compact"
              hide-details
              readonly
            />
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label">성명</span>
            <v-text-field
              v-model="modelValue.writerName"
              variant="outlined"
              density="compact"
              hide-details
              readonly
            />
          </div>
        </v-col>
        <v-col style="visibility: hidden;" aria-hidden="true"/>
      </v-row>

      <!-- Row 3: 국가분류 + 사업방식 -->
      <v-row no-gutters class="ga-6">
        <v-col>
          <div class="field-item">
            <span class="field-label required">국가분류</span>
            <div class="d-flex align-center ga-4">
              <v-btn-toggle
                v-model="countrySection"
                mandatory
                density="compact"
                :disabled="readonly"
                class="toggle-group"
                @update:model-value="onBizSectionChange"
              >
                <v-btn
                  v-for="item in countrySectionItem"
                  :key="item.value"
                  :value="item.value"
                  variant="text"
                  class="toggle-btn"
                >{{ item.label }}</v-btn>
              </v-btn-toggle>
              <v-autocomplete
                v-model="modelValue.nationCode"
                :items="allNations"
                item-title="codeName"
                item-value="codeValue"
                density="compact"
                variant="outlined"
                hide-details
                :disabled="readonly || !isOverseas"
                placeholder="대상국가"
                autocomplete="off"
                @update:model-value="onNationChange"
              />
            </div>
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label required">사업방식</span>
            <v-btn-toggle
              v-model="modelValue.bizSection"
              mandatory
              density="compact"
              :disabled="readonly"
              class="toggle-group"
            >
              <v-btn
                v-for="item in codes['102']"
                :key="item.codeValue"
                :value="item.codeValue"
                variant="text"
                class="toggle-btn"
              >{{ item.codeName }}</v-btn>
            </v-btn-toggle>
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label required">사업유형</span>
            <v-btn-toggle
              v-model="modelValue.bizType"
              mandatory
              density="compact"
              :disabled="readonly"
              class="toggle-group"
            >
              <v-btn
                v-for="item in codes['101']"
                :key="item.codeValue"
                :value="item.codeValue"
                variant="text"
                class="toggle-btn"
              >{{ item.codeName }}</v-btn>
            </v-btn-toggle>
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label required">투자유형</span>
            <v-btn-toggle
              v-model="modelValue.investType"
              mandatory
              density="compact"
              :disabled="readonly"
              class="toggle-group"
            >
              <v-btn
                v-for="item in codes['140']"
                :key="item.codeValue"
                :value="item.codeValue"
                variant="text"
                class="toggle-btn"
              >{{ item.codeName }}</v-btn>
            </v-btn-toggle>
          </div>
        </v-col>
      </v-row>

    </v-sheet>
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance } from 'vue';
const { proxy } = getCurrentInstance();
import dayjs from 'dayjs';

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
  selectedVersion: {
    type: [String, Number],
    default: null
  },
  versionList: {
    type: Array,
    default: () => []
  },
})

const emit = defineEmits(['update:modelValue', 'update:selectedVersion'])

// data 선언
const today = ref(dayjs().format('YYYY-MM-DD'));

const countrySectionItem = [
  { label: '국내사업', value: '1' },
  { label: '해외사업', value: '2' },
];

// 전체 국가 목록
const allNations = computed(() => props.codes['107'] || []);

// 해외사업 선택 후 국가 미선택 상태를 보관하는 로컬 플래그 (modelValue와 무관)
const overseasSelected = ref(false);

// 국가분류 라디오 바인딩: nationCode/continentCode에서 국내(1)/해외(2) 파생
const countrySection = computed({
  get: () => {
    if (props.modelValue.nationCode === 'KR') return '1';                         // 국내사업
    if (props.modelValue.nationCode || props.modelValue.continentCode) return '2'; // 해외사업
    return overseasSelected.value ? '2' : null;  // 해외사업 선택 후 국가 미선택 상태 유지
  },
  set: (val) => { overseasSelected.value = val === '2'; }
});

// 해외사업 여부
const isOverseas = computed(() => countrySection.value === '2');

// 국가분류(국내/해외) 변경 시
const onBizSectionChange = (newVal) => {
  const isDomestic = newVal !== '2';

  if (isDomestic) {
    // 국내사업: 대한민국/아시아 자동 설정
    const koreaItem = allNations.value.find(n => n.codeName === '대한민국');
    props.modelValue.nationCode = koreaItem?.codeValue || null;
    props.modelValue.continentCode = koreaItem?.upCode || null;
  } else {
    // 해외사업: 초기화
    props.modelValue.nationCode = null;
    props.modelValue.continentCode = null;
  }
};

// 국가 선택 시 대륙 자동 매핑
const onNationChange = (nationCode) => {
  const nation = allNations.value.find(n => n.codeValue === nationCode);
  props.modelValue.continentCode = nation?.upCode || null;
};

// 유효성 검사
const validate = async () => {
  const err = (text) => proxy.$dialog.error({ title: '필수항목 누락', text })
  if (!props.modelValue.bizTitle?.trim()) {
    await err('사업명을 입력해주세요.')
    return false
  }
  if (!countrySection.value) {
    await err('국가분류를 선택해주세요.')
    return false
  }
  if (countrySection.value === '2' && !props.modelValue.nationCode) {
    await err('대상국가를 선택해주세요.')
    return false
  }
  if (!props.modelValue.bizSection) {
    await err('사업방식을 선택해주세요.')
    return false
  }
  if (!props.modelValue.bizType) {
    await err('사업유형을 선택해주세요.')
    return false
  }
  if (!props.modelValue.investType) {
    await err('투자유형을 선택해주세요.')
    return false
  }
  return true
}

// 외부에서 호출 가능하도록 expose
defineExpose({
  validate,
})

</script>

<style scoped lang="scss">
// 전역 공통: .form-card, .form-section-header, .section-bar, .field-item, .field-label → settings.scss

:deep(.v-autocomplete__selection-text) {
  color: #0f172a;
  font-weight: 600;
}

:deep(.v-input--disabled .v-autocomplete__selection-text) {
  color: #0f172a !important;
  font-weight: 600;
  opacity: 1;
}

:deep(.v-input--disabled .v-field__input input::placeholder) {
  color: #475569 !important;
  opacity: 1;
}

:deep(.v-autocomplete input::placeholder) {
  color: #475569;
  font-weight: 600;
}


.biz-title-wrap {
  padding: 0 2px;
}

:deep(.biz-title-input .v-field__input) {
  font-size: 1.45rem;
  font-weight: 700;
  color: #0f172a;
  padding-bottom: 6px;
}
</style>
