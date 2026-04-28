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

    <FeasibilityStudy
      v-show="activeTab === 'feasibility'"
      :biz-id="bizId"
      v-model="model"
      @save="emit('save')"
    />
    <BusinessEval
      v-show="activeTab === 'business'"
      :biz-id="bizId"
      v-model="model"
    />
    <EconomicEval
      v-show="activeTab === 'economic'"
      :biz-id="bizId"
      v-model="model"
    />
  </div>

</template>

<script setup>
import { ref } from 'vue';
import { useBizBreadcrumb } from '@/composables/useBizBreadcrumb.js';

import FeasibilityStudy from './s40/FeasibilityStudy.vue';
import BusinessEval from './s40/BusinessEval.vue';
import EconomicEval from './s40/EconomicEval.vue';

const props = defineProps({ bizId: { type: String } });
const emit = defineEmits(['save']);
const model = defineModel();
const activeTab = ref('feasibility');

useBizBreadcrumb('사업타당성기초조사');

const tabButtons = [
  { title: '사업타당성기초조사', key: 'feasibility' },
  { title: '사업성평가', key: 'business' },
  { title: '사전경제성평가', key: 'economic' },
];
</script>
