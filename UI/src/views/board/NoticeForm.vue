<template>
  <!-- 공지사항 등록/수정 -->
  <v-card-title class="d-flex align-center justify-space-between px-6 pt-5 pb-3">
    <span class="text-subtitle-1 font-weight-bold">{{ isEdit ? '공지사항 수정' : '공지사항 등록' }}</span>
    <v-btn icon="mdi-close" variant="text" density="compact" @click="onCancel" />
  </v-card-title>

  <v-divider />

  <v-card-text class="px-6 py-4">
    <div class="d-flex flex-column ga-4">

      <!-- 제목 -->
      <div class="field-item">
        <span class="field-label">제목</span>
        <v-text-field
          v-model="form.title"
          variant="outlined"
          density="compact"
          hide-details="auto"
          :rules="[v => !!v || '제목을 입력하세요.']"
          maxlength="200"
          counter
        />
      </div>

      <!-- 내용 -->
      <div class="field-item">
        <span class="field-label">내용</span>
        <v-textarea
          v-model="form.contents"
          variant="outlined"
          density="compact"
          hide-details="auto"
          :rules="[v => !!v || '내용을 입력하세요.']"
          rows="12"
          maxlength="4000"
          counter
          no-resize
        />
      </div>

    </div>
  </v-card-text>

  <!-- 액션 버튼 -->
  <v-card-actions class="px-6 d-flex justify-space-between">
    <v-btn
      variant="outlined"
      density="comfortable"
      prepend-icon="mdi-arrow-left"
      class="text-none"
      :text="isEdit ? '상세로' : '목록'"
      @click="onCancel"
    />
    <v-btn
      variant="flat"
      color="primary"
      prepend-icon="mdi-content-save-outline"
      class="text-none"
      text="저장"
      @click="onSave"
    />
  </v-card-actions>
</template>

<script setup>
// ============================================================
// [1] Vue / 플러그인 임포트
// ============================================================
import { ref, computed, getCurrentInstance, onMounted } from 'vue';

// ============================================================
// [2] Props / Emits
// ============================================================
const props = defineProps({
  noticeSeq:  { type: [Number, String], default: null },
  noticeData: { type: Object, default: null },
});
const emit = defineEmits(['close', 'saved', 'cancel']);

// ============================================================
// [3] 글로벌 도구
// ============================================================
const { proxy } = getCurrentInstance();

// ============================================================
// [4] 상태
// ============================================================
const isEdit = computed(() => !!props.noticeSeq);

const form = ref({
  title:    '',
  contents: '',
});

// ============================================================
// [5] 초기화
// ============================================================
onMounted(() => {
  if (props.noticeData) {
    form.value.title    = props.noticeData.title    || '';
    form.value.contents = props.noticeData.contents || '';
  }
  // 수정 모드이고 noticeData에 contents가 없으면(목록에서는 contents를 내려주지 않음) 상세 조회
  if (isEdit.value && !form.value.contents) {
    fetchDetail();
  }
});

const fetchDetail = () => {
  proxy.$br_trans([{
    url: '/kopms-api/notice/getNoticeDetail',
    method: 'post',
    data: { noticeSeq: props.noticeSeq },
  }], (_url, code, _msg, data) => {
    if (code < 0) return;
    const notice = data.notice || {};
    form.value.title    = notice.title    || '';
    form.value.contents = notice.contents || '';
  });
};

// ============================================================
// [6] 저장
// ============================================================
const onSave = () => {
  if (!form.value.title.trim()) {
    proxy.$dialog.error({ title: '알림', text: '제목을 입력하세요.' });
    return;
  }
  if (!form.value.contents.trim()) {
    proxy.$dialog.error({ title: '알림', text: '내용을 입력하세요.' });
    return;
  }

  proxy.$br_trans([{
    url: '/kopms-api/notice/saveNotice',
    method: 'post',
    data: {
      noticeSeq: props.noticeSeq || '',
      title:     form.value.title,
      contents:  form.value.contents,
    },
  }], (_url, code, _msg, _data) => {
    if (code < 0) return;
    emit('saved');
  });
};

// ============================================================
// [7] 취소
// ============================================================
const onCancel = () => {
  if (isEdit.value) {
    emit('cancel', { noticeSeq: props.noticeSeq });
  } else {
    emit('cancel', null);
  }
};
</script>
