<template>
  <v-dialog v-model="dialog" width="480" persistent>
    <v-card>
      <v-card-title class="dialog-title">
        회사관리 {{ isNew ? '등록' : '수정' }}
      </v-card-title>

      <v-card-text class="pt-4">
        <v-row dense>
          <!-- 구분 -->
          <v-col cols="12">
            <v-row no-gutters align="center">
              <v-col cols="4" class="form-label required">구분</v-col>
              <v-col cols="8">
                <v-select
                  v-model="form.gubun"
                  :items="gubunItems"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  placeholder="선택"
                />
              </v-col>
            </v-row>
          </v-col>

          <!-- 회사명 -->
          <v-col cols="12">
            <v-row no-gutters align="center">
              <v-col cols="4" class="form-label required">회사명</v-col>
              <v-col cols="8">
                <v-text-field
                  v-model="form.companyName"
                  variant="outlined"
                  density="compact"
                  hide-details
                  placeholder="회사명 입력"
                />
              </v-col>
            </v-row>
          </v-col>

          <!-- 종류 (TYPE) -->
          <v-col cols="12">
            <v-row no-gutters align="center">
              <v-col cols="4" class="form-label">종류</v-col>
              <v-col cols="8">
                <v-select
                  v-model="form.type"
                  :items="typeItems"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </v-col>
            </v-row>
          </v-col>

          <!-- 사용여부 -->
          <v-col cols="12">
            <v-row no-gutters align="center">
              <v-col cols="4" class="form-label required">사용여부</v-col>
              <v-col cols="8">
                <v-select
                  v-model="form.used"
                  :items="usedItems"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="px-4 pb-3 d-flex ga-1 justify-end">
        <v-btn variant="flat" color="primary" size="small" prepend-icon="mdi-content-save" text="저장" @click="onSave" />
        <v-btn v-if="!isNew" variant="flat" color="error" size="small" prepend-icon="mdi-delete" text="삭제" @click="onDelete" />
        <v-btn variant="outlined" size="small" prepend-icon="mdi-close" text="취소" @click="close" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, getCurrentInstance } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  company:    { type: Object, default: null },
  gubunItems: { type: Array,  default: () => [] },
});
const emit = defineEmits(['update:modelValue', 'saved']);
const { proxy } = getCurrentInstance();

const dialog = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const isNew = computed(() => !props.company?.companyCode);

// ── 폼 초기값 ──────────────────────────────────────────────────
const defaultForm = () => ({
  companyCode:  '',
  gubun:        '',
  companyName:  '',
  type:         'SELF',
  used:         'Y',
});

const form = ref(defaultForm());

watch(dialog, (v) => {
  if (v) {
    form.value = props.company
      ? { ...defaultForm(), ...props.company }
      : defaultForm();
  }
});

// ── 선택 항목 ──────────────────────────────────────────────────
const typeItems = [
  { title: 'EIS회사정보',      value: 'EIS'  },
  { title: '자체생성회사정보', value: 'SELF' },
];

const usedItems = [
  { title: '사용',   value: 'Y' },
  { title: '미사용', value: 'N' },
];

// ── 저장 ──────────────────────────────────────────────────────
const onSave = () => {
  if (!form.value.gubun) {
    proxy.$dialog.error({ title: '입력 오류', text: '구분을 선택해주세요.' });
    return;
  }
  if (!form.value.companyName?.trim()) {
    proxy.$dialog.error({ title: '입력 오류', text: '회사명을 입력해주세요.' });
    return;
  }

  proxy.$br_trans([{
    url: '/kopms-api/nbm/saveCompany',
    method: 'post',
    data: { ...form.value },
    isWait: true,
  }], (_url, code) => {
    if (code < 0) return;
    emit('saved');
    close();
  });
};

// ── 삭제 ──────────────────────────────────────────────────────
const onDelete = () => {
  if (!confirm(`'${form.value.companyName}' 회사를 삭제하시겠습니까?`)) return;
  proxy.$br_trans([{
    url: '/kopms-api/nbm/deleteCompany',
    method: 'post',
    data: { companyCode: form.value.companyCode },
    isWait: true,
  }], (_url, code) => {
    if (code < 0) return;
    emit('saved');
    close();
  });
};

const close = () => {
  dialog.value = false;
};
</script>

<style scoped lang="scss">
.dialog-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1a237e;
  border-bottom: 1px solid #e0e0e0;
  padding: 14px 20px;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #37474f;
  padding-right: 12px;

  &.required::before {
    content: '•';
    color: #e53935;
    margin-right: 4px;
  }
}
</style>
