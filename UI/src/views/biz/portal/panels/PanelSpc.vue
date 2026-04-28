<template>
  <!-- SPC -->
  <div>
    <div class="section-header">
      <span class="section-title">SPC</span>
    </div>
    <v-sheet border class="mb-2">
      <v-row no-gutters>
        <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
          <span class="required">제목</span>
        </v-col>
        <v-col cols="4" class="pa-2 d-flex align-center">
          <span class="font-weight-bold">{{ task.taskName }}</span>
        </v-col>
        <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
          <span class="required">시행일자</span>
        </v-col>
        <v-col cols="4" class="pa-2">
          <v-menu v-model="implDateMenu" :close-on-content-click="false" :disabled="isCompleted">
            <template #activator="{ props: menuProps }">
              <BrDateField
                v-bind="menuProps"
                v-model="props.modelValue.spcInfo.effectiveDate"
                variant="outlined"
                density="compact"
                hide-details
                append-inner-icon="mdi-calendar"
                class="br-date-field"
                :readonly="isCompleted"
              />
            </template>
            <v-date-picker
              :model-value="parseDate(props.modelValue.spcInfo.effectiveDate)"
              @update:model-value="onImplDateSelected"
              hide-header
            />
          </v-menu>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
          <span class="font-weight-bold">후속업무</span>
        </v-col>
        <v-col cols="4" class="pa-2">
          <v-text-field v-model="props.modelValue.spcInfo.afterTask" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
        </v-col>
        <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
          <span class="font-weight-bold">문서번호</span>
        </v-col>
        <v-col cols="4" class="pa-2">
          <v-text-field v-model="props.modelValue.spcInfo.mikepDocNo" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
          <span class="font-weight-bold">안건</span>
        </v-col>
        <v-col cols="10" class="pa-2 d-flex align-center ga-1">
          <v-btn variant="outlined" size="small" prepend-icon="mdi-plus" :disabled="isCompleted">추가</v-btn>
          <v-select
            density="compact"
            hide-details
            variant="outlined"
            :items="['의결사항', '보고사항']"
            style="max-width: 150px;"
            :readonly="isCompleted"
          />
          <v-text-field density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
        </v-col>
      </v-row>
    </v-sheet>

    <!-- 양식 다운로드 -->
    <div class="d-flex align-center justify-space-between mb-4 mt-1">
      <div>
        <span class="text-caption text-grey-darken-1">&#8226; 양식 다운로드 : </span>
        <span class="text-caption text-blue-darken-2 panel-download-link">운영위원회 상정안건 보고.hwpx</span>
        <span class="text-caption text-blue-darken-2 panel-download-link">회의록.hwpx</span>
      </div>
    </div>

    <!-- 관련문서 목록 -->
    <div class="section-header">
      <span class="section-title">관련문서 목록</span>
    </div>
    <v-sheet border>
      <div class="pa-4 text-center text-grey">
        관련문서가 여기에 표시됩니다.
      </div>
    </v-sheet>
  </div>
</template>

<script setup>
import { ref, inject } from "vue";
import BrDateField from "@/components/BrDateField.jsx";

const isCompleted = inject('isCompleted', ref(false));

const props = defineProps({
  task: { type: Object, default: () => ({}) },
  modelValue: { type: Object, default: () => ({ spcInfo: {} }) },
});

// ── 시행일자 ──
const implDateMenu = ref(false);

const parseDate = (str) => str && str.length === 10 ? new Date(str + 'T00:00:00') : null;
const formatDate = (val) => {
  const d = new Date(val);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const onImplDateSelected = (val) => {
  if (val) props.modelValue.spcInfo.effectiveDate = formatDate(val);
  implDateMenu.value = false;
};
</script>

<style scoped>
.panel-download-link {
  cursor: pointer;
  margin-right: 6px;
  text-decoration: underline;
  &:hover { opacity: 0.7; }
}
</style>
