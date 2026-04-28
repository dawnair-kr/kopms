<template>
  <div>
    <!-- 인허가 -->
    <div class="section-header">
      <span class="section-title">인허가</span>
    </div>
    <v-sheet border class="mb-4">
      <v-row no-gutters class="border-b">
        <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
          <span class="required">인허가명</span>
        </v-col>
        <v-col cols="4" class="pa-2 d-flex align-center">
          <span class="font-weight-bold">{{ task.taskName }}</span>
        </v-col>
        <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
          <span class="required">승인기관</span>
        </v-col>
        <v-col cols="4" class="pa-2">
          <v-text-field v-model="modelValue.licenseInfo.licOrg" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
          <span class="required">문서번호</span>
        </v-col>
        <v-col cols="10" class="pa-2 d-flex align-center ga-1">
          <v-text-field v-model="modelValue.licenseInfo.mikepDocNo" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
          <v-btn variant="flat" size="small" :disabled="isCompleted">불러오기</v-btn>
        </v-col>
      </v-row>
      <v-row no-gutters class="border-b">
        <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
          <span class="required">등록일자</span>
        </v-col>
        <v-col cols="4" class="pa-2">
          <v-menu v-model="licDateMenu" :close-on-content-click="false" :disabled="isCompleted">
            <template #activator="{ props: menuProps }">
              <BrDateField
                v-bind="menuProps"
                v-model="modelValue.licenseInfo.licDate"
                variant="outlined"
                density="compact"
                hide-details
                append-inner-icon="mdi-calendar"
                class="br-date-field"
                :readonly="isCompleted"
              />
            </template>
            <v-date-picker
              :model-value="parseDate(modelValue.licenseInfo.licDate)"
              @update:model-value="onLicDateSelected"
              hide-header
            />
          </v-menu>
        </v-col>
      </v-row>
      <v-row no-gutters class="border-b">
        <v-col class="bg-grey-lighten-4 pa-2 d-flex align-center">
          <span class="font-weight-bold">담당자 연락처</span>
        </v-col>
      </v-row>
      <v-row no-gutters class="border-b">
        <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
          <span class="font-weight-bold">성명</span>
        </v-col>
        <v-col cols="4" class="pa-2">
          <v-text-field v-model="modelValue.licenseInfo.picName" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
        </v-col>
        <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
          <span class="font-weight-bold">직함</span>
        </v-col>
        <v-col cols="4" class="pa-2">
          <v-text-field v-model="modelValue.licenseInfo.picPos" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
        </v-col>
      </v-row>
      <v-row no-gutters class="border-b">
        <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
          <span class="font-weight-bold">전화</span>
        </v-col>
        <v-col cols="4" class="pa-2">
          <v-text-field v-model="modelValue.licenseInfo.picTel" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
        </v-col>
        <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
          <span class="font-weight-bold">이메일</span>
        </v-col>
        <v-col cols="4" class="pa-2">
          <v-text-field v-model="modelValue.licenseInfo.picEmail" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="2" class="bg-grey-lighten-4 px-2 d-flex align-center">
          <span class="font-weight-bold">후속업무</span>
        </v-col>
        <v-col cols="10" class="pa-2">
          <v-text-field v-model="modelValue.licenseInfo.afterTask" density="compact" hide-details variant="outlined" :readonly="isCompleted"/>
        </v-col>
      </v-row>
    </v-sheet>

    <!-- 파일첨부 -->
    <div class="section-header ga-2">
      <span class="section-title">파일첨부</span>
      <v-btn variant="outlined" size="x-small">내 PC</v-btn>
      <v-btn variant="outlined" size="x-small">웹하드</v-btn>
    </div>
    <v-sheet border class="mb-4">
      <v-row no-gutters class="bg-grey-lighten-4 text-center">
        <v-col cols="1" class="pa-2 d-flex align-center justify-center">
          <v-checkbox hide-details density="compact" />
        </v-col>
        <v-col cols="4" class="pa-2 d-flex align-center justify-center">
          <span class="font-weight-bold text-caption">파일명</span>
        </v-col>
        <v-col cols="2" class="pa-2 d-flex align-center justify-center">
          <span class="font-weight-bold text-caption">용량</span>
        </v-col>
        <v-col cols="2" class="pa-2 d-flex align-center justify-center">
          <span class="font-weight-bold text-caption">첨부방식</span>
        </v-col>
        <v-col cols="3" class="pa-2 d-flex align-center justify-center">
          <span class="font-weight-bold text-caption">사용기간</span>
        </v-col>
      </v-row>
      <div class="pa-8 text-center text-grey-darken-1" style="border-top: 1px solid #e0e0e0;">
        <v-icon size="24" color="#bdbdbd" class="mr-1">mdi-cloud-upload-outline</v-icon>
        마우스로 파일을 끌어 넣으세요.
      </div>
    </v-sheet>

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
  modelValue: { type: Object, default: () => ({ licenseInfo: {} }) },
});

// ── 등록일자 ──
const licDateMenu = ref(false);

const parseDate = (str) => str && str.length === 10 ? new Date(str + 'T00:00:00') : null;
const formatDate = (val) => {
  const d = new Date(val);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const onLicDateSelected = (val) => {
  if (val) props.modelValue.licenseInfo.licDate = formatDate(val);
  licDateMenu.value = false;
};
</script>

<style scoped>

</style>
