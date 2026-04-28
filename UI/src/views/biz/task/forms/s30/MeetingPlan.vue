<template>
  <v-form ref="form">

    <!-- 사업정보 검토회의개최계획 -->
    <v-sheet rounded="lg" class="pa-4 mb-3 form-card">
      <div class="form-section-header mb-3">
        <div class="d-flex align-center" style="gap: 8px;">
          <div class="section-bar" />
          <span>사업정보 검토회의개최계획</span>
        </div>
      </div>

      <!-- 요약정보 -->
      <v-row no-gutters class="mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label required">요약정보</span>
            <v-textarea
              v-model="modelValue.bizInfo.bizSummary"
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
      <v-row no-gutters class="ga-6 mb-4">
        <v-col>
          <div class="field-item">
            <span class="field-label">평가방법</span>
            <v-btn-toggle
              v-model="modelValue.bizInfo.reportMethod"
              mandatory
              density="compact"
              :disabled="isCompleted"
              class="toggle-group"
            >
              <v-btn value="manager" variant="text" class="toggle-btn">담당자종합평가</v-btn>
              <v-btn value="committee" variant="text" class="toggle-btn">평가위원개별평가</v-btn>
            </v-btn-toggle>
          </div>
        </v-col>
        <v-col style="visibility: hidden;" aria-hidden="true" />
        <v-col style="visibility: hidden;" aria-hidden="true" />
        <v-col style="visibility: hidden;" aria-hidden="true" />
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

      <!-- 첨부파일 / 결재정보 -->
      <v-row no-gutters class="ga-6">
        <v-col>
          <div class="field-item">
            <span class="field-label">첨부파일</span>
            <div class="text-body-2 text-grey">— 준비 중 —</div>
          </div>
        </v-col>
        <v-col>
          <div class="field-item">
            <span class="field-label">결재정보</span>
            <div class="text-body-2 text-grey">— 준비 중 —</div>
          </div>
        </v-col>
        <v-col style="visibility: hidden;" aria-hidden="true" />
        <v-col style="visibility: hidden;" aria-hidden="true" />
      </v-row>

      <!-- 저장 -->
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
