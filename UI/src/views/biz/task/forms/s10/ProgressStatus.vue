<template>
  <v-defaults-provider :defaults="{ global: { readonly: readonly } }">
  <v-sheet rounded="lg" class="pa-4 mb-3 form-card">

    <!-- 섹션 헤더 -->
    <div class="form-section-header mb-3">
      <div class="d-flex align-center" style="gap: 8px; cursor: pointer;" @click="$emit('collapse')">
        <div class="section-bar" />
        <span>협약현황</span>
        <v-icon size="16" class="ml-1">mdi-chevron-up</v-icon>
      </div>
    </div>

    <!-- 비밀유지협약 체결여부 -->
    <div class="field-item mb-4">
      <span class="field-label">비밀유지협약 체결여부</span>
      <v-row no-gutters class="ga-2 align-center">
        <v-col style="flex: 3;">
          <div class="d-flex align-center ga-2">
            <v-btn-toggle v-model="modelValue.bizInfo.pactSelect" mandatory density="compact" :disabled="readonly" class="toggle-group">
              <v-btn value="Y" variant="text" class="toggle-btn">YES</v-btn>
              <v-btn value="N" variant="text" class="toggle-btn toggle-btn-danger">NO</v-btn>
            </v-btn-toggle>
            <v-text-field v-model="modelValue.bizInfo.pactDocNo" hide-details>
              <template #prepend-inner><span class="form-unit">문서번호</span></template>
            </v-text-field>
            <v-text-field hide-details readonly>
              <template #prepend-inner><span class="form-unit">파일</span></template>
            </v-text-field>
            <v-btn size="small" variant="outlined" :disabled="readonly">찾아보기</v-btn>
          </div>
        </v-col>
        <v-col style="visibility: hidden;" aria-hidden="true"/>
      </v-row>
    </div>

    <!-- Teaser (or PIM) 접수 -->
    <div class="field-item mb-4">
      <span class="field-label">Teaser (or PIM) 접수</span>
      <v-row no-gutters class="ga-2 align-center">
        <v-col style="flex: 3;">
          <div class="d-flex align-center ga-2">
            <v-btn-toggle v-model="modelValue.bizInfo.teaserSelect" mandatory density="compact" :disabled="readonly" class="toggle-group">
              <v-btn value="Y" variant="text" class="toggle-btn">YES</v-btn>
              <v-btn value="N" variant="text" class="toggle-btn toggle-btn-danger">NO</v-btn>
            </v-btn-toggle>
            <v-text-field v-model="modelValue.bizInfo.teaserDocNo" hide-details>
              <template #prepend-inner><span class="form-unit">문서번호</span></template>
            </v-text-field>
            <v-text-field hide-details readonly>
              <template #prepend-inner><span class="form-unit">파일</span></template>
            </v-text-field>
            <v-btn size="small" variant="outlined" :disabled="readonly">찾아보기</v-btn>
          </div>
        </v-col>
        <v-col style="visibility: hidden;" aria-hidden="true"/>
      </v-row>
    </div>

    <!-- LOI 제출 여부 -->
    <div class="field-item mb-4">
      <span class="field-label">LOI 제출 여부</span>
      <v-row no-gutters class="ga-2 align-center">
        <v-col style="flex: 3;">
          <div class="d-flex align-center ga-2">
            <v-btn-toggle v-model="modelValue.bizInfo.loiSelect" mandatory density="compact" :disabled="readonly" class="toggle-group">
              <v-btn value="Y" variant="text" class="toggle-btn">YES</v-btn>
              <v-btn value="N" variant="text" class="toggle-btn toggle-btn-danger">NO</v-btn>
            </v-btn-toggle>
            <v-text-field v-model="modelValue.bizInfo.loiDocNo" hide-details>
              <template #prepend-inner><span class="form-unit">문서번호</span></template>
            </v-text-field>
            <v-text-field hide-details readonly>
              <template #prepend-inner><span class="form-unit">파일</span></template>
            </v-text-field>
            <v-btn size="small" variant="outlined" :disabled="readonly">찾아보기</v-btn>
          </div>
        </v-col>
        <v-col style="visibility: hidden;" aria-hidden="true"/>
      </v-row>
    </div>

    <!-- CA 제출 여부 -->
    <div class="field-item">
      <span class="field-label">CA 제출 여부</span>
      <v-row no-gutters class="ga-2 align-center">
        <v-col style="flex: 3;">
          <div class="d-flex align-center ga-2">
            <v-btn-toggle v-model="modelValue.bizInfo.caSelect" mandatory density="compact" :disabled="readonly" class="toggle-group">
              <v-btn value="Y" variant="text" class="toggle-btn">YES</v-btn>
              <v-btn value="N" variant="text" class="toggle-btn toggle-btn-danger">NO</v-btn>
            </v-btn-toggle>
            <v-text-field v-model="modelValue.bizInfo.caDocNo" hide-details>
              <template #prepend-inner><span class="form-unit">문서번호</span></template>
            </v-text-field>
            <v-text-field hide-details readonly>
              <template #prepend-inner><span class="form-unit">파일</span></template>
            </v-text-field>
            <v-btn size="small" variant="outlined" :disabled="readonly">찾아보기</v-btn>
          </div>
        </v-col>
        <v-col style="visibility: hidden;" aria-hidden="true"/>
      </v-row>
    </div>

  </v-sheet>
  </v-defaults-provider>
</template>

<script setup>
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

defineEmits(['update:modelValue', 'collapse'])

const validate = () => true;
defineExpose({ validate });
</script>

<style scoped lang="scss">
// 전역 공통: .form-card, .form-section-header, .section-bar, .field-item, .field-label → settings.scss
</style>
