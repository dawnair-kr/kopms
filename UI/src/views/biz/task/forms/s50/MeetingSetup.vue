<template>
  <v-form ref="form">

    <v-sheet rounded="lg" class="pa-4 mb-3 form-card">
      <div class="form-section-header mb-3">
        <div class="d-flex align-center" style="gap: 8px;">
          <div class="section-bar" />
          <span>사업개발심사 회의구성</span>
        </div>
      </div>

      <!-- 요약정보 -->
      <v-row no-gutters class="mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label required">요약정보</span>
            <v-textarea
              v-model="modelValue.bizInfo.selectSummary"
              variant="outlined"
              density="compact"
              rows="3"
              no-resize
              hide-details="auto"
              :rules="isCompleted ? [] : [v => !!v || '필수입력항목 입니다.']"
              :readonly="isCompleted"
              :disabled="isCompleted"
            />
          </div>
        </v-col>
      </v-row>

      <!-- 평가방법 -->
      <v-row no-gutters class="mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label">평가방법</span>
            <v-btn-toggle
              v-model="modelValue.bizInfo.selectMethod"
              mandatory
              density="compact"
              :disabled="isCompleted"
              class="toggle-group"
            >
              <v-btn value="1" variant="text" class="toggle-btn">담당자종합평가</v-btn>
              <v-btn value="2" variant="text" class="toggle-btn">평가위원개별평가</v-btn>
            </v-btn-toggle>
          </div>
        </v-col>
      </v-row>

      <!-- 위원장 / 간사 / 위원 -->
      <v-row no-gutters class="ga-6 mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label">위원장</span>
            <EmpSearchField
              v-model="modelValue.bizInfo.chairmanEmpno"
              :display-name="modelValue.bizInfo.chairman"
              variant="outlined"
              density="compact"
              :disabled="isCompleted"
              @select="e => modelValue.bizInfo.chairman = e.empName"
            />
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label">간사</span>
            <EmpSearchField
              v-model="modelValue.bizInfo.secretaryEmpno"
              :display-name="modelValue.bizInfo.secretary"
              variant="outlined"
              density="compact"
              :disabled="isCompleted"
              @select="e => modelValue.bizInfo.secretary = e.empName"
            />
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label">위원</span>
            <EmpSearchField
              v-model="modelValue.bizInfo.membersEmpno"
              :display-name="modelValue.bizInfo.members"
              variant="outlined"
              density="compact"
              :disabled="isCompleted"
              @select="e => modelValue.bizInfo.members = e.empName"
            />
          </div>
        </v-col>
        <v-col style="visibility: hidden;" aria-hidden="true" />
      </v-row>

      <!-- TF -->
      <v-row no-gutters class="mb-2">
        <v-col>
          <div class="d-flex align-center ga-2">
            <span class="field-label">TF</span>
            <v-btn v-if="!isCompleted" size="small" variant="text" color="primary" class="text-decoration-underline pa-0" style="min-width: auto; height: auto;">
              사업개발심사회의 위원구성
            </v-btn>
          </div>
        </v-col>
      </v-row>
      <v-row no-gutters class="ga-6 mb-4">
        <v-col>
          <div class="d-flex align-center ga-1">
            <v-text-field density="compact" hide-details variant="outlined" :readonly="isCompleted" :disabled="isCompleted">
              <template #prepend-inner><span class="form-unit">출자</span></template>
            </v-text-field>
            <v-btn v-if="!isCompleted" size="small" prepend-icon="mdi-plus" color="primary">추가</v-btn>
          </div>
        </v-col>
        <v-col>
          <div class="d-flex align-center ga-1">
            <v-text-field density="compact" hide-details variant="outlined" :readonly="isCompleted" :disabled="isCompleted">
              <template #prepend-inner><span class="form-unit">재무</span></template>
            </v-text-field>
            <v-btn v-if="!isCompleted" size="small" prepend-icon="mdi-plus" color="primary">추가</v-btn>
          </div>
        </v-col>
        <v-col>
          <div class="d-flex align-center ga-1">
            <v-text-field density="compact" hide-details variant="outlined" :readonly="isCompleted" :disabled="isCompleted">
              <template #prepend-inner><span class="form-unit">경제성</span></template>
            </v-text-field>
            <v-btn v-if="!isCompleted" size="small" prepend-icon="mdi-plus" color="primary">추가</v-btn>
          </div>
        </v-col>
        <v-col style="visibility: hidden;" aria-hidden="true" />
      </v-row>

      <!-- 첨부파일 -->
      <v-row no-gutters class="mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label">첨부파일</span>
            <div class="text-body-2 text-grey">— 준비 중 —</div>
          </div>
        </v-col>
      </v-row>

      <!-- 관련파일 -->
      <v-row no-gutters class="mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label">관련파일</span>
            <div class="d-flex align-center ga-1">
              <v-text-field density="compact" hide-details variant="outlined" style="width: 180px; flex-shrink: 0" :readonly="isCompleted" :disabled="isCompleted">
                <template #prepend-inner><span class="form-unit">검색키워드</span></template>
              </v-text-field>
              <v-text-field density="compact" hide-details variant="outlined" readonly :disabled="isCompleted">
                <template #prepend-inner><span class="form-unit">파일</span></template>
              </v-text-field>
              <v-btn v-if="!isCompleted" size="small" variant="outlined">찾아보기</v-btn>
              <v-btn v-if="!isCompleted" size="small" prepend-icon="mdi-plus" color="primary">추가</v-btn>
              <v-btn v-if="!isCompleted" size="small" prepend-icon="mdi-minus" color="error">삭제</v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- 결재정보 -->
      <v-row no-gutters class="mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label">결재정보</span>
            <div class="text-body-2 text-grey">— 준비 중 —</div>
          </div>
        </v-col>
      </v-row>

      <!-- 저장/결재 -->
      <v-row v-if="!isCompleted" no-gutters class="d-flex justify-end mt-3">
        <div class="d-flex ga-1">
          <v-btn variant="flat" text="저장" @click="handleSave" />
          <v-btn variant="flat" text="결재" />
        </div>
      </v-row>
    </v-sheet>

  </v-form>
</template>

<script setup>
import { ref, inject } from 'vue';
import EmpSearchField from '@/components/EmpSearchField.vue';

const isCompleted = inject('isCompleted', false);

defineProps({
  bizId: String,
  modelValue: Object,
});

const emit = defineEmits(['save']);
const form = ref(null);

const handleSave = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;
  emit('save');
};
</script>
