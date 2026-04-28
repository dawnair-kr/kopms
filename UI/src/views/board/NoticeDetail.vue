<template>
  <!-- 공지사항 상세 -->
  <v-card-title class="d-flex align-center justify-space-between px-6 pt-5 pb-3">
    <span class="text-subtitle-1 font-weight-bold">공지사항 상세</span>
    <v-btn icon="mdi-close" variant="text" density="compact" @click="emit('close')" />
  </v-card-title>

  <v-divider />

  <v-card-text class="px-6 py-4">
    <div v-if="notice" class="notice-detail-wrap">

      <!-- 제목 -->
      <div class="notice-title">{{ notice.title }}</div>

      <!-- 메타 -->
      <div class="notice-meta d-flex align-center ga-4">
        <span><v-icon size="14" class="mr-1">mdi-account-outline</v-icon>{{ notice.empName }}</span>
        <span><v-icon size="14" class="mr-1">mdi-calendar-outline</v-icon>{{ notice.regiDate }}</span>
        <span><v-icon size="14" class="mr-1">mdi-eye-outline</v-icon>{{ notice.cnt }}</span>
      </div>

      <v-divider class="my-4" />

      <!-- 본문 -->
      <div class="notice-contents">{{ notice.contents }}</div>

    </div>
    <div v-else class="text-center py-10 text-medium-emphasis">불러오는 중...</div>
  </v-card-text>

  <v-divider />

  <!-- 액션 버튼 -->
  <v-card-actions class="px-6 py-3 d-flex justify-space-between">
    <v-btn
      variant="outlined"
      density="comfortable"
      prepend-icon="mdi-format-list-bulleted"
      class="text-none"
      text="목록"
      @click="emit('close')"
    />
    <div class="d-flex ga-2" v-if="notice && canEdit">
      <v-btn
        variant="flat"
        density="comfortable"
        prepend-icon="mdi-pencil-outline"
        class="text-none"
        text="수정"
        @click="emit('edit', notice)"
      />
      <v-btn
        variant="flat"
        density="comfortable"
        color="error"
        prepend-icon="mdi-delete-outline"
        class="text-none"
        text="삭제"
        @click="onDelete"
      />
    </div>
  </v-card-actions>
</template>

<script setup>
// ============================================================
// [1] Vue / 플러그인 임포트
// ============================================================
import { ref, computed, getCurrentInstance, onMounted } from 'vue';
import { useUserStore } from '@/store/user.js';

// ============================================================
// [2] Props / Emits
// ============================================================
const props = defineProps({
  noticeSeq: { type: [Number, String], required: true },
});
const emit = defineEmits(['close', 'edit', 'deleted']);

// ============================================================
// [3] 글로벌 도구 / 스토어
// ============================================================
const { proxy } = getCurrentInstance();
const userStore = useUserStore();

// ============================================================
// [4] 데이터
// ============================================================
const notice = ref(null);

// ============================================================
// [5] 권한 계산
// ============================================================
const canEdit = computed(() => {
  if (!notice.value) return false;
  const gubun = userStore.memberInfo?.userGubun;
  if (gubun === 'A' || gubun === 'V') return true;
  return notice.value.empId === userStore.memberInfo?.empno;
});

// ============================================================
// [6] 조회
// ============================================================
const fetchDetail = () => {
  proxy.$br_trans([{
    url: '/kopms-api/notice/getNoticeDetail',
    method: 'post',
    data: { noticeSeq: props.noticeSeq },
  }], (_url, code, _msg, data) => {
    if (code < 0) return;
    notice.value = data.notice || null;
  });
};

// ============================================================
// [7] 삭제
// ============================================================
const onDelete = () => {
  proxy.$dialog.confirm({
    title: '삭제 확인',
    text: '해당 공지사항을 삭제하시겠습니까?',
    onOk: () => {
      proxy.$br_trans([{
        url: '/kopms-api/notice/deleteNotice',
        method: 'post',
        data: { noticeSeq: props.noticeSeq },
      }], (_url, code, _msg, _data) => {
        if (code < 0) return;
        emit('deleted');
      });
    },
  });
};

// ============================================================
// [9] 생명주기
// ============================================================
onMounted(() => {
  fetchDetail();
});
</script>

<style scoped lang="scss">
.notice-detail-wrap {
  .notice-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1a237e;
    margin-bottom: 10px;
    line-height: 1.5;
  }

  .notice-meta {
    font-size: 0.8rem;
    color: #78909c;
    margin-bottom: 4px;
  }

  .notice-contents {
    font-size: 0.9rem;
    color: #334155;
    line-height: 1.8;
    white-space: pre-wrap;
    min-height: 200px;
  }
}
</style>
