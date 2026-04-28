<template>
  <v-autocomplete
    v-model="selected"
    v-model:search="searchText"
    :items="empList"
    :loading="loading"
    item-value="empno"
    item-title="name"
    no-filter
    hide-details
    return-object
    v-bind="$attrs"
    @update:search="onSearch"
    @update:model-value="onSelect"
  >
    <template v-if="$slots['prepend-inner']" #prepend-inner>
      <slot name="prepend-inner" />
    </template>
    <template #no-data>
      <v-list-item v-if="!loading">
        <span class="text-body-2 text-grey">
          {{ searchText && searchText.length >= 1 ? '검색 결과가 없습니다' : '이름을 입력하여 검색하세요' }}
        </span>
      </v-list-item>
    </template>
    <template #item="{ item, props: itemProps }">
      <v-list-item v-bind="itemProps" :title="undefined">
        <div class="emp-item d-flex align-center ga-2">
          <span class="emp-dept">{{ item.raw.deptName }}</span>
          <span class="emp-name">{{ item.raw.name }}</span>
        </div>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup>
// ============================================================
// [1] Vue / 플러그인 임포트
// ============================================================
import { ref, watch, getCurrentInstance } from 'vue';

// ============================================================
// [2] Props / Emits
// ============================================================
const props = defineProps({
  modelValue:  { type: String, default: '' }, // v-model — 선택된 사원 empno
  displayName: { type: String, default: '' }, // 초기 표시 이름 (수정 모드)
});

// update:modelValue : v-model 바인딩용 empno 값 emit
// select            : 부모에서 empno 외 추가 정보(empName, deptName)가 필요할 때 사용
const emit = defineEmits(['update:modelValue', 'select']);

const { proxy } = getCurrentInstance(); // $br_trans 접근용

// ============================================================
// [3] 상태 데이터
// ============================================================
const selected   = ref(null);  // v-autocomplete 선택 객체 (return-object)
const searchText = ref('');    // 검색 입력 텍스트 (v-model:search)
const empList    = ref([]);    // API 응답 사원 목록
const loading    = ref(false); // 로딩 인디케이터

let debounceTimer = null; // 연속 입력 방지 타이머

watch(() => [props.modelValue, props.displayName], ([empno, name]) => {
  if (empno && name && (!selected.value || selected.value.empno !== empno)) {
    empList.value = [{ empno, name }];
    selected.value = { empno, name };
  }
}, { immediate: true });

// ============================================================
// [4] 검색 핸들러
// ============================================================
// no-filter: 서버사이드 검색이므로 클라이언트 필터 비활성화
// 1글자 이상 입력 시 300ms 디바운스 후 API 호출
const onSearch = (val) => {
  clearTimeout(debounceTimer);
  if (!val || val.length < 1) {
    empList.value = [];
    return;
  }
  debounceTimer = setTimeout(() => fetchEmp(val), 300);
};

// POST /kopms-api/employee/getEmployee — name 검색, deptno는 전체 대상('')
// 응답: data.employLst[] — { empno, name, deptName }
const fetchEmp = (name) => {
  loading.value = true;
  proxy.$br_trans([{
    url: '/kopms-api/employee/getEmployee',
    method: 'post',
    data: { name, deptno: '' },
  }], (_url, code, _msg, data) => {
    loading.value = false;
    if (code < 0) return;
    empList.value = data.employLst || [];
  });
};

// ============================================================
// [5] 선택 핸들러
// ============================================================
// return-object이므로 item이 전체 사원 객체로 전달됨
const onSelect = (item) => {
  if (!item) return;
  emit('update:modelValue', item.empno);
  emit('select', { empno: item.empno, empName: item.name, deptName: item.deptName });
};
</script>

<style scoped lang="scss">
.emp-dept {
  font-size: 0.75rem;
  color: #9e9e9e;
  background: #f1f5f9;
  border-radius: 4px;
  padding: 1px 6px;
  flex-shrink: 0;
}

.emp-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}
</style>
