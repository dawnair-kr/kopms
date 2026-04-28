<template>
  <v-card style="min-width: 800px">

    <!-- 제목 -->
    <v-card-item>
      <v-card-title class="font-weight-bold">
        {{ detail.title }}
      </v-card-title>
    </v-card-item>

    <v-divider />

    <!-- 메타 정보 -->
    <v-card-text class="pt-2">
      <div class="d-flex justify-end text-body-2 ga-3" style="color: #e65100">
        <span><strong>구분</strong> : <span style="color: #424242">{{ meetGubunLabel }}</span></span>
        <span><strong>등록자</strong> : <span style="color: #424242">{{ detail.inwriterName }}</span></span>
        <span><strong>사용일</strong> : <span style="color: #424242">{{ detail.rsvDate }}</span></span>
        <span><strong>시작시간</strong> : <span style="color: #424242">{{ detail.srtTime }}</span></span>
        <span><strong>종료시간</strong> : <span style="color: #424242">{{ detail.endTime }}</span></span>
      </div>
    </v-card-text>

    <!-- 내용 -->
    <v-card-text class="pt-1">
      <v-textarea
        :model-value="detail.contents"
        variant="outlined"
        hide-details
        rows="10"
        no-resize
        readonly
      />
    </v-card-text>

    <!-- 닫기 버튼 -->
    <v-card-actions class="justify-end">
      <v-btn
        variant="outlined"
        prepend-icon="mdi-format-list-bulleted"
        @click="$emit('submit')"
      >
        목록
      </v-btn>
    </v-card-actions>

  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue';

const { proxy } = getCurrentInstance();

const props = defineProps({
  rsvIdx: { type: [String, Number], required: true },
});

defineEmits(['submit']);

const detail = ref({
  title:        '',
  inwriterName: '',
  rsvDate:      '',
  srtTime:      '',
  endTime:      '',
  meetGubun:    '',
  contents:     '',
});

const meetGubunLabel = computed(() => {
  const map = { SM: '소회의실', LG: '대회의실' };
  return map[detail.value.meetGubun] ?? detail.value.meetGubun;
});

onMounted(() => {
  proxy.$br_trans([{
    url: '/kopms-api/meeting/getMeetingDetail',
    method: 'post',
    data: { rsvIdx: props.rsvIdx },
  }], (_url, code, _msg, data) => {
    if (code < 0) return;
    detail.value = data.meetingDetail ?? {};
  });
});
</script>
