<template>
  <!-- 주민상생 -->
  <div>
    <div class="section-header">
      <span class="section-title">주민상생</span>
    </div>
    <v-sheet border class="mb-2">
      <v-row no-gutters>
        <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
          <span class="font-weight-bold required">제목</span>
        </v-col>
        <v-col cols="4" class="pa-2 d-flex align-center">
          <span class="font-weight-bold">{{ task.taskName }}</span>
        </v-col>
        <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
          <span class="font-weight-bold required">시행일자</span>
        </v-col>
        <v-col cols="4" class="pa-2">
          <v-menu v-model="implDateMenu" :close-on-content-click="false" :disabled="isCompleted">
            <template #activator="{ props: menuProps }">
              <BrDateField
                v-bind="menuProps"
                v-model="props.modelValue.publicTaskInfo.effectiveDate"
                variant="outlined"
                density="compact"
                hide-details
                append-inner-icon="mdi-calendar"
                class="br-date-field"
                :readonly="isCompleted"
              />
            </template>
            <v-date-picker
              :model-value="parseDate(props.modelValue.publicTaskInfo.effectiveDate)"
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
          <v-text-field v-model="props.modelValue.publicTaskInfo.afterTask" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
        </v-col>
        <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
          <span class="font-weight-bold">문서번호</span>
        </v-col>
        <v-col cols="4" class="pa-2">
          <v-text-field v-model="props.modelValue.publicTaskInfo.mikepDocNo" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
        </v-col>
      </v-row>
    </v-sheet>

    <!-- 양식 다운로드 -->
    <div class="d-flex align-center justify-space-between mb-4 mt-1">
      <div>
        <span class="text-caption text-grey-darken-1">&#8226; 양식 다운로드 : </span>
        <span class="text-caption text-blue-darken-2 panel-download-link">주민설명회 계획.hwpx</span>
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
  modelValue: { type: Object, default: () => ({ publicTaskInfo: {} }) },
});

// ── 시행일자 ──
const implDateMenu = ref(false);

const parseDate = (str) => str && str.length === 10 ? new Date(str + 'T00:00:00') : null;
const formatDate = (val) => {
  const d = new Date(val);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const onImplDateSelected = (val) => {
  if (val) props.modelValue.publicTaskInfo.effectiveDate = formatDate(val);
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
