<template>
  <v-defaults-provider :defaults="{ global: { readonly: readonly } }">
  <v-sheet rounded="lg" class="pa-4 mb-3 form-card">

    <!-- 섹션 헤더 -->
    <div class="form-section-header mb-3">
      <div class="d-flex align-center" style="gap: 8px; cursor: pointer;" @click="$emit('collapse')">
        <div class="section-bar" />
        <span>컨소시엄</span>
        <v-icon size="16" class="ml-1">mdi-chevron-up</v-icon>
      </div>
      <div class="d-flex ga-1">
        <v-btn variant="flat" prepend-icon="mdi-plus" height="32" text="추가" :disabled="readonly" @click="addConsortium"/>
        <v-btn variant="flat" prepend-icon="mdi-minus" height="32" text="삭제" :disabled="readonly" @click="removeConsortium"/>
      </div>
    </div>

    <!-- 컨소시엄 항목 반복 -->
    <div v-for="(item, index) in modelValue.consortium" :key="index">

      <v-divider v-if="index > 0" class="mb-4"/>

      <div class="consort-grid">

        <!-- Row 1: 업체명 + 대표자 + 주소(span 2) -->
        <v-row no-gutters class="ga-6 mb-6">
          <v-col>
            <div class="field-item">
              <span class="field-label">업체명</span>
              <v-text-field v-model="item.companyName" hide-details/>
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">대표자</span>
              <v-text-field v-model="item.ceoName" hide-details/>
            </div>
          </v-col>
          <v-col class="col-span-2">
            <div class="field-item">
              <span class="field-label">주소</span>
              <v-text-field v-model="item.comAddr" hide-details/>
            </div>
          </v-col>
        </v-row>

        <!-- Row 2: 홈페이지 + 전화 + 휴대폰 + 이메일 -->
        <v-row no-gutters class="ga-6 mb-6">
          <v-col>
            <div class="field-item">
              <span class="field-label">홈페이지</span>
              <v-text-field v-model="item.comHomepage" hide-details/>
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">전화</span>
              <v-text-field v-model="item.comTel" hide-details/>
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">휴대폰</span>
              <v-text-field v-model="item.comHp" hide-details/>
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">이메일</span>
              <v-text-field v-model="item.comFax" hide-details/>
            </div>
          </v-col>
        </v-row>

        <!-- Row 3: 사업분야 + 참여지분 -->
        <v-row no-gutters class="ga-6" :class="index < (modelValue.consortium?.length - 1) ? 'mb-4' : ''">
          <v-col>
            <div class="field-item">
              <span class="field-label">사업분야</span>
              <v-text-field v-model="item.bizField" hide-details/>
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">참여지분</span>
              <v-text-field v-model="item.bizStake" hide-details/>
            </div>
          </v-col>
          <v-col style="visibility: hidden;" aria-hidden="true"/>
          <v-col style="visibility: hidden;" aria-hidden="true"/>
        </v-row>

      </div>

    </div>

  </v-sheet>
  </v-defaults-provider>
</template>

<script setup>
import { getCurrentInstance, onMounted } from 'vue';
const { proxy } = getCurrentInstance();

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  readonly: {
    type: Boolean,
    default: false
  },
})

const emit = defineEmits(['update:modelValue', 'collapse']);

onMounted(() => {
  if (!props.modelValue.consortium?.length) {
    addConsortium();
  }
});

const addConsortium = () => {
  const currentList = Array.isArray(props.modelValue.consortium) ? props.modelValue.consortium : [];
  const newList = [...currentList, {
    companyName: '',
    ceoName: '',
    comAddr: '',
    comHomepage: '',
    comTel: '',
    comHp: '',
    comFax: '',
    bizField: '',
    bizStake: '',
  }];
  emit('update:modelValue', { ...props.modelValue, consortium: newList });
};

const removeConsortium = () => {
  const currentList = props.modelValue.consortium || [];
  if (currentList.length > 1) {
    const newList = [...currentList];
    newList.pop();
    emit('update:modelValue', { ...props.modelValue, consortium: newList });
  } else {
    proxy.$dialog.error({ title: '삭제 불가', text: '최소 한 개의 컨소시엄 업체는 필요합니다.' });
  }
};

const validate = () => true;

defineExpose({ validate });
</script>

<style scoped lang="scss">
// 전역 공통: .form-card, .form-section-header, .section-bar, .field-item, .field-label → settings.scss

// CSS Grid로 4열 정렬 (flexbox의 gap 미포함 span 문제 해결)
.consort-grid {
  :deep(.v-row) {
    display: grid !important;
    grid-template-columns: repeat(4, 1fr);
    flex-wrap: unset !important;
  }
  :deep(.col-span-2) {
    grid-column: span 2;
  }
}
</style>
