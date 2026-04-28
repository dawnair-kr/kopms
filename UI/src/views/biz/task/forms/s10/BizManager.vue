<template>
  <v-sheet rounded="lg" class="pa-4 mb-3 form-card">

    <!-- 섹션 헤더 -->
    <div class="form-section-header mb-3">
      <div class="d-flex align-center" style="gap: 8px;">
        <div class="section-bar" />
        <span>사업 담당자 지정</span>
      </div>
    </div>

    <v-row no-gutters class="ga-6">
      <!-- PM(담당자) -->
      <v-col>
        <div class="field-item">
          <span class="field-label">PM(담당자)</span>
          <EmpSearchField
            v-model="modelValue.pmUser"
            :display-name="modelValue.pmUserName"
            variant="outlined"
            density="compact"
            :readonly="readonly"
            :disabled="readonly"
            @select="({ empName }) => modelValue.pmUserName = empName"
          />
        </div>
      </v-col>

      <!-- 파트너(열람자) -->
      <v-col>
        <div class="field-item">
          <span class="field-label">파트너(열람자)</span>
          <EmpSearchField
            v-model="modelValue.partnerUser"
            :display-name="modelValue.partnerUserName"
            variant="outlined"
            density="compact"
            :readonly="readonly"
            :disabled="readonly"
            @select="({ empName }) => modelValue.partnerUserName = empName"
          />
        </div>
      </v-col>

      <v-col style="visibility: hidden;" aria-hidden="true"/>
      <v-col style="visibility: hidden;" aria-hidden="true"/>
    </v-row>

  </v-sheet>
</template>

<script setup>
import EmpSearchField from '@/components/EmpSearchField.vue';

defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  readonly: {
    type: Boolean,
    default: false
  },
})

defineEmits(['update:modelValue'])
</script>

<style scoped lang="scss">
// 전역 공통: .form-card, .form-section-header, .section-bar, .field-item, .field-label → settings.scss
</style>
