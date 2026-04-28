<template>
  <v-container class="h-100 d-flex flex-column">

    <div class="view-layout d-flex flex-column">
      <BizInfoCard
        class="mb-3"
        :biz-master="bizMaster"
        :members="members"
      />
      <v-row no-gutters class="bottom-panel ga-2">
        <v-col cols="8">
          <ContribCard :contributions="contributions" :project-cost="bizMaster.projectCost"/>
        </v-col>
        <v-col>
          <ProgressCard :progress-list="progressList"/>
        </v-col>
      </v-row>
    </div>

    <!-- ── 액션 버튼 ──────────────────────────────────────────────────────── -->
    <div class="d-flex justify-end flex-shrink-0 ga-1 pt-2">
      <v-btn variant="flat" color="grey-darken-1" prepend-icon="mdi-list-box" text="목록" @click="goList"/>
      <v-btn variant="flat" color="error"         prepend-icon="mdi-delete"   text="삭제" @click="onDelete"/>
      <v-btn variant="flat" color="primary"       prepend-icon="mdi-pencil"   text="수정" @click="goEdit"/>
    </div>

  </v-container>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import BizInfoCard  from './outline/BizInfoCard.vue';
import ContribCard  from './outline/ContribCard.vue';
import ProgressCard from './outline/ProgressCard.vue';

const props = defineProps({
  nbmId:      { type: String, default: null },
  nbmDetail:  { type: Object, default: null },
});

const router    = useRouter();
const { proxy } = getCurrentInstance();

// ── 조회 데이터 (OperInfo.vue에서 props로 전달) ────────────────────────────
const bizMaster     = computed(() => props.nbmDetail?.bizMaster     ?? {});
const members       = computed(() => props.nbmDetail?.members       ?? []);
const contributions = computed(() => props.nbmDetail?.contributions ?? []);
const progressList  = computed(() => props.nbmDetail?.progressList  ?? []);

// ── 삭제 ───────────────────────────────────────────────────────────────────
const onDelete = () => {
  if (!confirm('사업을 삭제하시겠습니까?')) return;
  proxy.$br_trans([{
    url: '/kopms-api/nbm/deleteNbm',
    method: 'post',
    data: { masterNo: props.nbmId },
    isWait: true,
  }], (_url, code, _msg) => {
    if (code < 0) return;
    router.push('/bo/operation');
  });
};

// ── 네비게이션 ─────────────────────────────────────────────────────────────
const goEdit = () => router.push(`/operation/${props.nbmId}/edit`);
const goList = () => router.push('/bo/operation');

</script>

<style scoped lang="scss">
.view-layout {
  flex: 1;
  min-height: 0;
}

.bottom-panel {
  flex: 1;
  min-height: 0;

  :deep(.v-col) {
    height: 100%;
    display: flex;
    flex-direction: column;

    > * { flex: 1; min-height: 0; }
  }
}


</style>
