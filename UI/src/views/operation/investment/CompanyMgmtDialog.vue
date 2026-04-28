<template>
  <v-dialog v-model="dialog" width="860" persistent>
    <v-card>
      <v-card-title class="dialog-title">회사관리</v-card-title>

      <!-- 검색 영역 -->
      <v-card-text class="pb-0">
        <v-row no-gutters class="ga-1 align-center mb-2">
          <v-text-field
            v-model="searchKeyword"
            variant="outlined"
            density="compact"
            hide-details
            placeholder="회사명"
            style="max-width: 240px"
            @keyup.enter="fetchList"
          />
          <v-btn variant="flat" size="small" prepend-icon="mdi-magnify" text="조회" @click="fetchList" />
        </v-row>

        <!-- 목록 테이블 -->
        <v-data-table
          :headers="headers"
          :items="tableItems"
          class="company-table"
          fixed-header
          height="360px"
          item-value="companyCode"
          v-model:selected="selectedCodes"
          show-select
          select-strategy="single"
          return-object
        >
          <template #item="{ item, isSelected, toggleSelect }">
            <tr
              :class="{ 'selected-row': isSelected(item) }"
              class="clickable-row"
              @click="toggleSelect(item)"
            >
              <td>
                <v-checkbox-btn
                  :model-value="isSelected(item)"
                  @click.stop="toggleSelect(item)"
                  density="compact"
                  hide-details
                />
              </td>
              <td class="text-center">{{ item.companyCode }}</td>
              <td class="text-center">{{ item.typeName }}</td>
              <td class="text-center">{{ item.gubunName || item.gubun }}</td>
              <td>{{ item.companyName }}</td>
              <td class="text-center">{{ item.regDate }}</td>
              <td class="text-center">
                <v-chip
                  :color="item.used === 'Y' ? 'blue' : 'grey'"
                  size="x-small"
                  variant="flat"
                >{{ item.used === 'Y' ? '사용' : '미사용' }}</v-chip>
              </td>
            </tr>
          </template>
          <template #no-data>
            <v-row justify="center" class="my-2">
              <span class="text-subtitle-2 text-grey">등록된 데이터가 없습니다</span>
            </v-row>
          </template>
          <template #bottom />
        </v-data-table>
      </v-card-text>

      <!-- 액션 버튼 -->
      <v-card-actions class="px-4 pb-3 pt-2 d-flex ga-1 justify-end">
        <v-btn variant="flat" color="primary"     size="small" prepend-icon="mdi-plus"        text="등록" @click="openForm(null)" />
        <v-btn variant="flat" color="warning"     size="small" prepend-icon="mdi-pencil"      text="수정" :disabled="!selectedItem" @click="openForm(selectedItem)" />
        <v-btn variant="flat" color="error"       size="small" prepend-icon="mdi-delete"      text="삭제" :disabled="!selectedItem" @click="onDelete" />
        <v-spacer />
        <v-btn variant="outlined"                 size="small" prepend-icon="mdi-close"       text="닫기" @click="close" />
      </v-card-actions>
    </v-card>

    <!-- 등록/수정 폼 다이얼로그 -->
    <CompanyFormDialog
      v-model="formOpen"
      :company="editTarget"
      :gubun-items="gubunItems"
      @saved="onFormSaved"
    />
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, getCurrentInstance } from 'vue';
import CompanyFormDialog from './CompanyFormDialog.vue';

const props  = defineProps({ modelValue: Boolean });
const emit   = defineEmits(['update:modelValue', 'saved']);
const { proxy } = getCurrentInstance();

const dialog = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

// ── 테이블 ────────────────────────────────────────────────────
const headers = [
  { title: '회사코드',   key: 'companyCode',  align: 'center', width: '90px'  },
  { title: '종류',       key: 'typeName',     align: 'center', width: '100px' },
  { title: '구분',       key: 'gubunName',    align: 'center', width: '140px' },
  { title: '회사명',     key: 'companyName',  align: 'start'                  },
  { title: '등록/수정일', key: 'regDate',     align: 'center', width: '110px' },
  { title: '사용여부',   key: 'used',         align: 'center', width: '80px'  },
];

const tableItems    = ref([]);
const selectedCodes = ref([]);
const selectedItem  = computed(() => selectedCodes.value[0] ?? null);

// ── 공통코드 (구분) ─────────────────────────────────────────────
const gubunItems = ref([]);

const fetchCodes = () => {
  proxy.$br_trans([{
    url: '/kopms-api/nbm/getCodeList',
    method: 'post',
    data: { groupCodes: ['160'] },
  }], (_url, code, _msg, data) => {
    if (code < 0) return;
    gubunItems.value = (data['160'] || []).map(c => ({
      title: c.codeName,
      value: c.codeValue,
    }));
  });
};

// ── 목록 조회 ──────────────────────────────────────────────────
const searchKeyword = ref('');

const fetchList = () => {
  proxy.$br_trans([{
    url: '/kopms-api/nbm/getCompanyList',
    method: 'post',
    data: { companyName: searchKeyword.value },
  }], (_url, code, _msg, data) => {
    if (code < 0) return;
    tableItems.value = (data.list || []).map(item => ({
      ...item,
      typeName: item.type === 'EIS' ? 'EIS회사정보' : '자체생성회사정보',
    }));
    selectedCodes.value = [];
  });
};

// ── 등록/수정 폼 ───────────────────────────────────────────────
const formOpen   = ref(false);
const editTarget = ref(null);

const openForm = (item) => {
  editTarget.value = item ? { ...item } : null;
  formOpen.value = true;
};

const onFormSaved = () => {
  fetchList();
  emit('saved');
};

// ── 삭제 ──────────────────────────────────────────────────────
const onDelete = () => {
  if (!selectedItem.value) return;
  if (!confirm(`'${selectedItem.value.companyName}' 회사를 삭제하시겠습니까?`)) return;
  proxy.$br_trans([{
    url: '/kopms-api/nbm/deleteCompany',
    method: 'post',
    data: { companyCode: selectedItem.value.companyCode },
    isWait: true,
  }], (_url, code) => {
    if (code < 0) return;
    fetchList();
    emit('saved');
  });
};

// ── 닫기 ──────────────────────────────────────────────────────
const close = () => {
  dialog.value = false;
};

// ── 다이얼로그 열릴 때 초기 조회 ──────────────────────────────
watch(dialog, (v) => {
  if (v) {
    fetchCodes();
    fetchList();
  }
});
</script>

<style scoped lang="scss">
.dialog-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1a237e;
  border-bottom: 1px solid #e0e0e0;
  padding: 14px 20px;
}

.company-table :deep(thead th) {
  background-color: #e3f2fd !important;
  color: #1565c0 !important;
  font-weight: 700 !important;
  border: 1px solid #dee2e6 !important;
}

.company-table :deep(tbody td) {
  border: 1px solid #dee2e6 !important;
  font-size: 13px;
}

.clickable-row {
  cursor: pointer;
  &:hover { background-color: #f5f5f5 !important; }
}

.selected-row {
  background-color: #e3f2fd !important;
}
</style>
