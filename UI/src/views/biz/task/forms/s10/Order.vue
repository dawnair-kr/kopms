<template>
  <v-defaults-provider :defaults="{ global: { readonly: readonly } }">
  <v-sheet rounded="lg" class="pa-4 mb-3 form-card">

    <!-- 섹션 헤더 -->
    <div class="form-section-header mb-3">
      <div class="d-flex align-center" style="gap: 8px; cursor: pointer;" @click="$emit('collapse')">
        <div class="section-bar" />
        <span>발주처</span>
        <v-icon size="16" class="ml-1">mdi-chevron-up</v-icon>
      </div>
      <div class="d-flex ga-1">
        <v-btn variant="flat" prepend-icon="mdi-plus" height="32" text="추가" :disabled="readonly" @click="addOrder"/>
        <v-btn variant="flat" prepend-icon="mdi-minus" height="32" text="삭제" :disabled="readonly" @click="removeOrder"/>
      </div>
    </div>

    <!-- 발주처 항목 반복 -->
    <div v-for="(item, index) in modelValue.bizInfo?.order" :key="index">

      <v-divider v-if="index > 0" class="mb-4"/>

      <!-- Row 1: 사업명 + 대표자 + 주소 + 홈페이지 -->
      <v-row no-gutters class="ga-6 mb-6">
        <v-col>
          <div class="field-item">
            <span class="field-label">사업명</span>
            <v-text-field v-model="item.orderCompany" hide-details variant="outlined" density="compact"/>
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label">대표자</span>
            <v-text-field v-model="item.orderOwner" hide-details variant="outlined" density="compact"/>
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label">주소</span>
            <v-text-field v-model="item.orderAddr" hide-details variant="outlined" density="compact"/>
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label">홈페이지</span>
            <v-text-field v-model="item.orderHompage" hide-details variant="outlined" density="compact"/>
          </div>
        </v-col>
      </v-row>

      <!-- 담당자 서브헤더 -->
      <div class="sub-section-header mb-3">담당자</div>

      <!-- Row 3: 소속 + 직함 + 성명 -->
      <v-row no-gutters class="ga-6 mb-6">
        <v-col>
          <div class="field-item">
            <span class="field-label">소속</span>
            <v-text-field v-model="item.orderDept" hide-details variant="outlined" density="compact"/>
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label">직함</span>
            <v-text-field v-model="item.orderPos" hide-details variant="outlined" density="compact"/>
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label">성명</span>
            <v-text-field v-model="item.orderName" hide-details variant="outlined" density="compact"/>
          </div>
        </v-col>
        <v-col style="visibility: hidden;" aria-hidden="true"/>
      </v-row>

      <!-- Row 4: 전화 + 휴대폰 + 이메일 -->
      <v-row no-gutters class="ga-6" :class="index < (modelValue.bizInfo?.order?.length - 1) ? 'mb-4' : ''">
        <v-col>
          <div class="field-item">
            <span class="field-label">전화</span>
            <v-text-field v-model="item.orderTel" hide-details variant="outlined" density="compact"/>
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label">휴대폰</span>
            <v-text-field v-model="item.orderHp" hide-details variant="outlined" density="compact"/>
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label">이메일</span>
            <v-text-field v-model="item.orderFax" hide-details variant="outlined" density="compact"/>
          </div>
        </v-col>
        <v-col style="visibility: hidden;" aria-hidden="true"/>
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
  if (!props.modelValue.bizInfo?.order?.length) {
    addOrder();
  }
});

const addOrder = () => {
  const currentList = props.modelValue.bizInfo?.order || [];
  const newList = [...currentList, {
    orderCompany: '',
    orderOwner: '',
    orderAddr: '',
    orderHompage: '',
    orderDept: '',
    orderPos: '',
    orderName: '',
    orderTel: '',
    orderHp: '',
    orderFax: '',
  }];
  emit('update:modelValue', {
    ...props.modelValue,
    bizInfo: { ...props.modelValue.bizInfo, order: newList }
  });
};

const removeOrder = () => {
  const currentList = props.modelValue.bizInfo?.order || [];
  if (currentList.length > 1) {
    const newList = [...currentList];
    newList.pop();
    emit('update:modelValue', {
      ...props.modelValue,
      bizInfo: { ...props.modelValue.bizInfo, order: newList }
    });
  } else {
    proxy.$dialog.error({ title: '삭제 불가', text: '최소 한 개의 발주처는 필요합니다.' });
  }
};

const validate = () => true;

defineExpose({ validate });
</script>

<style scoped lang="scss">
// 전역 공통: .form-card, .form-section-header, .section-bar, .field-item, .field-label → settings.scss

.sub-section-header {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1565c0;
  padding: 2px 0 2px 10px;
  border-left: 3px solid #1565c0;
}
</style>
