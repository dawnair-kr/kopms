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
      <MeetingSetup
        :biz-id="bizId"
        v-model="model"
        @save="saveSection('setup')"
      />
      <MeetingResult
        :biz-id="bizId"
        v-model="model"
        @save="saveSection('result')"
      />
    </div>
    <BusinessEval
      v-show="activeTab === 'evaluation'"
      :biz-id="bizId"
      v-model="model"
      @save="saveSection('eval')"
      @confirm="saveSection('eval')"
    />
  </div>

</template>

<script setup>
import { ref } from 'vue';
import { useBizBreadcrumb } from '@/composables/useBizBreadcrumb.js';

import MeetingSetup from './s50/MeetingSetup.vue';
import MeetingResult from './s50/MeetingResult.vue';
import BusinessEval from './s50/BusinessEval.vue';

const props = defineProps({ bizId: { type: String } });
const emit = defineEmits(['save']);
const model = defineModel();
const activeTab = ref('meeting');

useBizBreadcrumb('사업개발심사회의');

const tabButtons = [
  { title: '사업개발심사 회의구성', key: 'meeting' },
  { title: '사업적합평가', key: 'evaluation' },
];

const SETUP_FIELDS = [
  'selectSummary', 'selectMethod', 'meetingTime', 'meetingPlace',
  'attachFileSeq1', 'approvalLink', 'mikepState', 'mikepState1', 'approvalLink1',
  'selectRegiDate', 'selectUpdateDate', 'selectFinishDate', 'selectState',
];
const RESULT_FIELDS = [
  'resultSummary', 'convResult', 'attachFileSeq2',
  'resultRegiDate', 'resultUpdateDate', 'resultAppDate', 'resultFinishDate', 'resultState',
  'mikepState2', 'approvalLink2',
];
const EVAL_FIELDS = ['selectContents', 'checkMethod'];
const ALL_FIELDS = [...SETUP_FIELDS, ...RESULT_FIELDS, ...EVAL_FIELDS];

const saveSection = (section, overrides = {}) => {
  const fieldMap = { setup: SETUP_FIELDS, result: RESULT_FIELDS, eval: EVAL_FIELDS };
  const activeFields = fieldMap[section];

  const bizInfoPayload = {
    ...ALL_FIELDS.reduce((acc, key) => {
      acc[key] = activeFields.includes(key) ? model.value.bizInfo[key] : null;
      return acc;
    }, {}),
    bizOmitReason: null,
    mikepDelState: null,
    approvalDelLink: null,
    mikepDocNo: null,
    ...overrides,
  };

  emit('save', { bizInfo: bizInfoPayload });
};
</script>
