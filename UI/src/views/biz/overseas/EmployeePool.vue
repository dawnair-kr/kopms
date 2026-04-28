<template>
  <!-- 해외 SPC 인력 Pool -->
  <v-container class="main-page-wrapper">
    <v-sheet rounded="lg" class="pa-4 ma-2 form-card d-flex flex-column flex-grow-1" style="min-height: 0;">

      <!-- 헤더 -->
      <div class="form-section-header mb-4 d-flex align-center justify-space-between flex-shrink-0">
        <div class="d-flex align-center" style="gap: 8px;">
          <div class="section-bar" />
          <span>해외 SPC 인력 Pool</span>
        </div>
      </div>

      <!-- 테이블 -->
      <div class="br-table-wrap emp-table-wrap">
        <table class="emp-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>성명</th>
              <th>전공</th>
              <th>직급</th>
              <th>파견일</th>
              <th>귀국일</th>
              <th>사업 수행기간</th>
              <th>프로젝트명</th>
              <th>현소속부서</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="row in tableRows" :key="`${row.empno}-${row.moveBgnYmd}`">
              <tr>
                <td v-if="row.rowspan > 0" :rowspan="row.rowspan" class="text-center">{{ row.seq }}</td>
                <td v-if="row.rowspan > 0" :rowspan="row.rowspan" class="text-center">{{ row.name }}</td>
                <td v-if="row.rowspan > 0" :rowspan="row.rowspan" class="text-center">{{ row.jikgunNm }}</td>
                <td v-if="row.rowspan > 0" :rowspan="row.rowspan" class="text-center">{{ row.grade }}</td>
                <td class="text-center">{{ row.moveBgnYmd || '-' }}</td>
                <td class="text-center">{{ row.moveEndYmd || '-' }}</td>
                <td class="text-center">{{ row.period || '-' }}</td>
                <td>{{ row.orgNm }}</td>
                <td class="text-center" :class="{ 'retired': row.deptName === '퇴직' }">
                  {{ row.deptName }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

    </v-sheet>
  </v-container>
</template>

<script setup>
// ============================================================
// [1] Vue / 플러그인 임포트
// ============================================================
import { ref, computed, getCurrentInstance, onMounted } from 'vue';

// ============================================================
// [2] 글로벌 도구
// ============================================================
const { proxy } = getCurrentInstance();

// ============================================================
// [3] 데이터
// ============================================================
const employeeList = ref([]);

// ============================================================
// [4] 조회
// ============================================================
const fetchList = () => {
  proxy.$br_trans([{
    url: '/kopms-api/overseas/getEmployeeSpcList',
    method: 'post',
    data: {},
  }], (_url, code, _msg, data) => {
    if (code < 0) return;
    employeeList.value = data.employeeList || [];
  });
};

// ============================================================
// [5] 테이블 데이터 가공 (rowspan 계산)
// ============================================================
const tableRows = computed(() => {
  // EMPNO 기준으로 그룹핑하되 순서 유지
  const seenKeys = [];
  const groups = {};

  employeeList.value.forEach(row => {
    const key = row.empno;
    if (!groups[key]) {
      seenKeys.push(key);
      groups[key] = [];
    }
    groups[key].push(row);
  });

  const result = [];
  let seq = 1;

  seenKeys.forEach(key => {
    const group = groups[key];
    group.forEach((row, idx) => {
      result.push({
        ...row,
        seq:     idx === 0 ? seq : null,
        rowspan: idx === 0 ? group.length : 0,
      });
    });
    seq++;
  });

  return result;
});

const uniqueCount = computed(() => new Set(employeeList.value.map(r => r.empno)).size);

// ============================================================
// [9] 생명주기
// ============================================================
onMounted(() => {
  fetchList();
});
</script>

<style scoped lang="scss">
.emp-table-wrap {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.emp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;

  thead tr {
    background-color: #e8edf5;
  }

  th {
    padding: 10px 12px;
    font-weight: 600;
    font-size: 0.85rem;
    color: #1a237e;
    text-align: center;
    border-bottom: 1px solid #cfd8dc;
    border-right: 1px solid #e8edf5;
    white-space: nowrap;

    &:last-child { border-right: none; }
  }

  td {
    padding: 8px 12px;
    border-bottom: 1px solid #f0f4f8;
    border-right: 1px solid #f0f4f8;
    vertical-align: middle;
    color: #334155;

    &:last-child { border-right: none; }
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover td {
    background-color: #f5f8ff;
    font-weight: 600;
  }

  .retired {
    color: #c62828;
    font-weight: 700;
  }
}
</style>
