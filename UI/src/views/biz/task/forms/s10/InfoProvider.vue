<template>
  <v-defaults-provider :defaults="{ global: { readonly: readonly } }">
  <v-sheet rounded="lg" class="pa-4 mb-3 form-card">

    <!-- 섹션 헤더 -->
    <div class="form-section-header mb-3">
      <div class="d-flex align-center" style="gap: 8px; cursor: pointer;" @click="$emit('collapse')">
        <div class="section-bar" />
        <span>사업정보 입수경로</span>
        <v-icon size="16" class="ml-1">mdi-chevron-up</v-icon>
      </div>
      <div class="d-flex ga-1">
        <v-btn variant="flat" prepend-icon="mdi-plus" height="32" text="추가" :disabled="readonly" @click="addInformant"/>
        <v-btn variant="flat" prepend-icon="mdi-minus" height="32" text="삭제" :disabled="readonly" @click="removeInformant"/>
      </div>
    </div>

    <!-- 입수경로 항목 반복 -->
    <div v-for="(item, index) in modelValue.bizInfo?.informants" :key="index">

      <!-- 항목 구분선 (첫 항목 제외) -->
      <v-divider v-if="index > 0" class="mb-4"/>

      <!-- Row 1: 공고번호 + 공고명 + 공고기관명 -->
      <v-row no-gutters class="ga-6 mb-6">
        <v-col>
          <div class="field-item">
            <span class="field-label">공고번호</span>
            <v-text-field v-model="item.gonggoNum" hide-details variant="outlined" density="compact"/>
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label">공고명</span>
            <v-text-field v-model="item.gonggoName" hide-details variant="outlined" density="compact"/>
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label">공고기관명</span>
            <v-text-field v-model="item.gonggoOrg" hide-details variant="outlined" density="compact"/>
          </div>
        </v-col>
        <v-col style="visibility: hidden;" aria-hidden="true"/>
      </v-row>

      <!-- Row 2: 담당자 성명 + 직함 + 전화 + 이메일 -->
      <v-row no-gutters class="ga-6" :class="index < (modelValue.bizInfo?.informants?.length - 1) ? 'mb-4' : ''">
        <v-col>
          <div class="field-item">
            <span class="field-label">담당자 성명</span>
            <v-text-field v-model="item.infoName" hide-details variant="outlined" density="compact"/>
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label">담당자 직함</span>
            <v-text-field v-model="item.infoPos" hide-details variant="outlined" density="compact"/>
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label">담당자 전화</span>
            <v-text-field v-model="item.infoTel" hide-details variant="outlined" density="compact"/>
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label">담당자 이메일</span>
            <v-text-field v-model="item.infoFax" hide-details variant="outlined" density="compact"/>
          </div>
        </v-col>
      </v-row>

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
  if (!props.modelValue.bizInfo?.informants?.length) {
    addInformant();
  }
});

const addInformant = () => {
  const currentList = props.modelValue.bizInfo?.informants || [];
  const newList = [...currentList, {
    gonggoNum: '',
    gonggoName: '',
    gonggoOrg: '',
    infoName: '',
    infoPos: '',
    infoTel: '',
    infoFax: '',
  }];
  emit('update:modelValue', {
    ...props.modelValue,
    bizInfo: { ...props.modelValue.bizInfo, informants: newList }
  });
};

const removeInformant = () => {
  const currentList = props.modelValue.bizInfo?.informants || [];
  if (currentList.length > 1) {
    const newList = [...currentList];
    newList.pop();
    emit('update:modelValue', {
      ...props.modelValue,
      bizInfo: { ...props.modelValue.bizInfo, informants: newList }
    });
  } else {
    proxy.$dialog.error({ title: '삭제 불가', text: '최소 한 개의 항목은 필요합니다.' });
  }
};

const validate = () => true;

defineExpose({ validate });
</script>

<style scoped lang="scss">
// 전역 공통: .form-card, .form-section-header, .section-bar, .field-item, .field-label → settings.scss
</style>
