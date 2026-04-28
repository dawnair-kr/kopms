<template>

  <div class="mx-2 flex-grow-1">
    <v-defaults-provider :defaults="{ global: { readonly: false } }">
      <div class="d-flex ma-2 ga-1">
        <v-btn
          v-for="btn in tabButtons"
          :key="btn.key"
          variant="flat"
          :class="{ 'is-active': activeTab === btn.key }"
          @click="activeTab = btn.key"
        >
          {{ btn.title }}
        </v-btn>
      </div>
    </v-defaults-provider>

    <div v-show="activeTab === 'meeting'">
      <MeetingPlan
        :biz-id="bizId"
        v-model="model"
        @save="saveSection('plan')"
      />
      <MeetingResult
        :biz-id="bizId"
        v-model="model"
        @save="saveSection('result')"
      />
    </div>
    <Evaluation
      v-show="activeTab === 'evaluation'"
      :biz-id="bizId"
      v-model="model"
      @save="saveSection('eval')"
      @confirm="saveSection('eval', { checkMethod: 'Y' })"
    />
  </div>

</template>

<script setup>
import { ref } from 'vue';
import { useBizBreadcrumb } from '@/composables/useBizBreadcrumb.js';

import Evaluation from './s30/Evaluation.vue';
import MeetingPlan from './s30/MeetingPlan.vue';
import MeetingResult from './s30/MeetingResult.vue';

const props = defineProps({ bizId: { type: String } });
const emit = defineEmits(['save']);
const model = defineModel();
const activeTab = ref('meeting');

useBizBreadcrumb('사업정보검토회의');

const tabButtons = [
  { title: '사업정보검토회의구성', key: 'meeting' },
  { title: '사업적합평가', key: 'evaluation' },
];

const PLAN_FIELDS = [
  'bizSummary',
  'reportMethod',
  'reportContents',
  'attachFileSeq1',
  'approvalLink',
  'chairman', 'chairmanEmpno',
  'secretary', 'secretaryEmpno',
  'members',  'membersEmpno',
];
const RESULT_FIELDS = [
  'bizResultSummary',
  'bizConResult',
  'resultState',
  'infoDisclosure',
  'attachFileSeq2',
  'approvalLink2',
  'pmName', 'pmEmpno',
];
const EVAL_FIELDS = ['proSummary', 'riskChekMethod'];
const ALL_FIELDS = [...PLAN_FIELDS, ...RESULT_FIELDS, ...EVAL_FIELDS];

const saveSection = (section, overrides = {}) => {
  const fieldMap = { plan: PLAN_FIELDS, result: RESULT_FIELDS, eval: EVAL_FIELDS };
  const activeFields = fieldMap[section];

  const bizInfoPayload = {
    ...ALL_FIELDS.reduce((acc, key) => {
      acc[key] = activeFields.includes(key) ? model.value.bizInfo[key] : null;
      return acc;
    }, {}),
    checkMethod: null,
    ...overrides,
  };

  emit('save', { bizInfo: bizInfoPayload });
};

</script>

<style scoped lang="scss">
</style>
