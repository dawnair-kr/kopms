<template>
  <div class="mx-2 flex-grow-1">
    <BizResult
      :biz-id="bizId"
      v-model="model"
      @save="saveSection('biz')"
    />
    <TFManagement
      :biz-id="bizId"
      v-model="model"
      @save="saveSection('tf')"
    />
  </div>
</template>

<script setup>
import { useBizBreadcrumb } from '@/composables/useBizBreadcrumb.js';

import BizResult from './d10/BizResult.vue';
import TFManagement from './d10/TFManagement.vue';

const props = defineProps({ bizId: { type: String } });
const emit = defineEmits(['save']);
const model = defineModel();

useBizBreadcrumb('사업착수');

const BIZ_FIELDS = [
  'bizSummary', 'attachFileSeq1', 'approvalLink1', 'mikepState1',
];
const TF_FIELDS = [
  'tfSummary', 'projectLeader', 'bizAdmin', 'tech', 'externalExpert',
  'meetingTime', 'meetingPlace', 'attachFileSeq2', 'approvalLink2', 'mikepState2',
];
const ALL_FIELDS = [...BIZ_FIELDS, ...TF_FIELDS];

const saveSection = (section, overrides = {}) => {
  const fieldMap = { biz: BIZ_FIELDS, tf: TF_FIELDS };
  const activeFields = fieldMap[section];

  const bizInfoPayload = {
    ...ALL_FIELDS.reduce((acc, key) => {
      acc[key] = activeFields.includes(key) ? model.value.bizInfo[key] : null;
      return acc;
    }, {}),
    ...overrides,
  };

  emit('save', { bizInfo: bizInfoPayload });
};
</script>
