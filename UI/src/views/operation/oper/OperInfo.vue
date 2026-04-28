<template no-gutters>
  <v-container class="main-page-wrapper">

    <!-- ── 좌측 사이드바 ── -->
    <v-navigation-drawer
      v-model="drawer"
      width="280"
      permanent
      class="operationinfo-left-menu-bar"
      :rail="isRail"
      :rail-width="74"
    >
      <!-- 헤더: 사업명 + 접기 버튼 -->
      <div class="sidebar-header">
        <v-btn variant="text" icon="mdi-menu" @click.stop="isRail = !isRail" />
        <div v-if="!isRail" class="title-info ml-2">
          <h2 class="text-no-wrap">{{ nbmDetail?.bizMaster?.bizTitle ?? '' }}</h2>
        </div>
      </div>

      <!-- 메뉴 목록 -->
      <v-list
        nav
        v-model:selected="menuIndex"
        open-strategy="multiple"
        mandatory
        density="compact"
      >
        <template v-for="menu in menus" :key="menu.value">

          <!-- rail 모드: 아이콘만 표시 -->
          <v-list-item
            v-if="isRail"
            :value="menu.value"
            @click="menu.children ? (isRail = false) : null"
          >
            <template #prepend>
              <v-icon :icon="menu.icon" style="padding: 2px 0 0 10px;" />
            </template>
            <v-tooltip activator="parent" location="right">{{ menu.menuName }}</v-tooltip>
          </v-list-item>

          <!-- 전체 모드 -->
          <template v-else>

            <!-- 하위 메뉴 있는 그룹 -->
            <v-list-group v-if="menu.children" :value="menu.value" class="mt-1">
              <template #activator="{ props }">
                <v-list-item v-bind="props">
                  <template #prepend>
                    <v-icon :icon="menu.icon" class="mr-1" style="padding: 2px 0 0 10px;" />
                  </template>
                  <v-list-item-title class="font-weight-bold">{{ menu.menuName }}</v-list-item-title>
                </v-list-item>
              </template>

              <v-list-item
                v-for="child in menu.children"
                :key="child.value"
                :value="child.value"
                :title="child.menuName"
                class="pl-10"
              />
            </v-list-group>

            <!-- 단일 메뉴 -->
            <v-list-item v-else :value="menu.value">
              <template #prepend>
                <v-icon :icon="menu.icon" class="mr-1" style="padding: 2px 0 0 10px;" />
              </template>
              <v-list-item-title class="font-weight-bold">{{ menu.menuName }}</v-list-item-title>
              <template #append="{ isActive }">
                <v-icon v-if="isActive" icon="mdi-chevron-right" size="small" />
              </template>
            </v-list-item>

          </template>
        </template>
      </v-list>
    </v-navigation-drawer>

    <!-- ── 메인 컨텐츠 영역 ── -->
    <v-card class="pa-2 overflow-y-auto" style="border-radius: 8px !important; height: 100%;">
      <component :is="pageComponents[currentMenu]" :nbmId="props.nbmId" :nbmDetail="nbmDetail" />
    </v-card>

  </v-container>
</template>

<script setup>
import { ref, computed, watch, defineAsyncComponent, getCurrentInstance, onMounted } from 'vue';
import { useSelectMenuStore } from '@/store/selectMenuStore.js';

// ============================================================
// [1] Props
// ============================================================
const props = defineProps({
  nbmId: { type: String, default: null },
});

// ============================================================
// [2-1] API 데이터
// ============================================================
const { proxy } = getCurrentInstance();
const nbmDetail = ref(null);

onMounted(() => {
  if (!props.nbmId) return;
  proxy.$br_trans([{
    url: '/kopms-api/nbm/getNbmDetail',
    method: 'post',
    data: { masterNo: props.nbmId },
  }], (_url, code, _msg, data) => {
    if (code < 0) return;
    if (data.bizMaster && !data.bizMaster.imageFile) {
      data.bizMaster.imageFile = '/images/koen_pic.webp';
    }
    nbmDetail.value = data;
  });
});

// ============================================================
// [3] 페이지 컴포넌트 매핑
// 새 메뉴 추가 시 여기에만 추가
// ============================================================
const pageComponents = {
  outline:      defineAsyncComponent(() => import('./sections/Outline.vue')),
  stat:         defineAsyncComponent(() => import('./sections/finance/Stat.vue')),
  pf:           defineAsyncComponent(() => import('./sections/finance/Pf.vue')),
  contribution: defineAsyncComponent(() => import('./sections/finance/Contribution.vue')),
  feasibility:  defineAsyncComponent(() => import('./sections/finance/Feasibility.vue')),
  profit:       defineAsyncComponent(() => import('./sections/finance/Profit.vue')),
  general:      defineAsyncComponent(() => import('./sections/governance/General.vue')),
  board:        defineAsyncComponent(() => import('./sections/governance/Board.vue')),
  docs:         defineAsyncComponent(() => import('./sections/Docs.vue')),
  hr:           defineAsyncComponent(() => import('./sections/Management.vue')),
};

// ============================================================
// [4] 메뉴 트리 정의
// ============================================================
const menus = [
  {
    menuName: '사업개요',
    value: 'outline',
    icon: 'mdi-information-outline',
  },
  {
    menuName: '재무관리',
    value: 'finance',
    icon: 'mdi-finance',
    children: [
      { menuName: '재무제표', value: 'stat' },
      { menuName: 'PF 상환', value: 'pf' },
      { menuName: '출자금 납입', value: 'contribution' },
      { menuName: '경제성 분석', value: 'feasibility' },
      { menuName: '수익관리', value: 'profit' },
    ],
  },
  {
    menuName: '주총/이사회',
    value: 'governance',
    icon: 'mdi-account-group-outline',
    children: [
      { menuName: '주주총회', value: 'general' },
      { menuName: '이사회',  value: 'board' },
    ],
  },
  {
    menuName: '자료관리',
    value: 'docs',
    icon: 'mdi-folder-table-outline',
  },
  {
    menuName: '인력관리',
    value: 'hr',
    icon: 'mdi-account-cog-outline',
  },
];

// ============================================================
// [5] 사이드바 상태
// ============================================================
const drawer    = ref(true);
const isRail    = ref(false);
const menuIndex = ref(['outline']);
const currentMenu = computed(() => menuIndex.value[0]);

// ============================================================
// [6] breadcrumb 동기화
// menuIndex 변경 시 selectMenuStore 경로 갱신
// @click 대신 watch 사용 — Vuetify v-list 내부 선택 처리와 충돌 방지
// ============================================================
const selectMenuStore = useSelectMenuStore();

// menus 배열에서 value로 항목 탐색 — { item, parent } 반환
const findMenuWithParent = (list, value, parent = null) => {
  for (const menu of list) {
    if (menu.value === value) return { item: menu, parent };
    if (menu.children) {
      const found = findMenuWithParent(menu.children, value, menu);
      if (found) return found;
    }
  }
  return null;
};

// breadcrumb 경로 갱신 헬퍼
// 형식: 사업운영 > 운영현황 > {사업명} > [{부모메뉴} >] {메뉴명}
const syncBreadcrumb = (menuValue) => {
  const found = findMenuWithParent(menus, menuValue);
  if (!found) return;
  const { item, parent } = found;
  const bizTitle = nbmDetail.value?.bizMaster?.bizTitle ?? '';
  const basePath = bizTitle ? `사업운영 > 운영현황 > ${bizTitle}` : `사업운영 > 운영현황`;
  const menuSegment = item.menuName;
  const fullPath = `${basePath} > ${menuSegment}`;
  selectMenuStore.setMenuAnchorPath(fullPath);
  selectMenuStore.setMenuPath(fullPath);
  selectMenuStore.setMenuName(item.menuName);
  selectMenuStore.setMenuIcon(parent?.icon ?? item.icon ?? null);
  selectMenuStore.setHighlightSegment(bizTitle || null);
};

// 메뉴 변경 시 즉시 반영
watch(currentMenu, (value) => syncBreadcrumb(value), { immediate: true });

// 사업명 로드 완료 후 breadcrumb 재갱신 (비동기 로딩 대응)
watch(nbmDetail, () => syncBreadcrumb(currentMenu.value));
</script>

<style lang="scss">
/* KOEN 프라이머리 컬러 변수 */
.operationinfo-left-menu-bar {
  --sidebar-primary: #004098;
}

.operationinfo-left-menu-bar.v-navigation-drawer {
  border: none;
  background-color: #F6F8FB;

  /* 내부 콘텐츠 카드 */
  .v-navigation-drawer__content {
    margin: 8px 0 8px 8px;
    background: #FFFFFF;
    border-radius: 8px;
    border: 1px solid #E2E8F0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06),
                0 1px 2px rgba(0, 0, 0, 0.04);
  }

  /* 헤더 */
  .sidebar-header {
    display: flex;
    align-items: center;
    padding: 8px;
    font-weight: bold;
    text-align: center;
    background-color: #FFFFFF;
    color: var(--sidebar-primary);
    border-bottom: 1px solid #E2E8F0;
  }

  .title-info {
    min-width: 0;
    overflow: hidden;

    h2 {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .v-list {

    /* 공통 아이템 */
    .v-list-item {
      border-radius: 8px !important;
      opacity: 1 !important;
      --v-theme-overlay-multiplier: 0;

      .v-list-item-title {
        font-weight: 600 !important;
        font-size: 0.95rem !important;
        color: #64748B !important;
      }

      &:hover {
        background-color: #F0F7FF !important;

        .v-list-item-title {
          color: var(--sidebar-primary) !important;
          font-weight: 600 !important;
        }

        .v-icon {
          color: var(--sidebar-primary) !important;
        }
      }

      /* Active 상태 호버 */
      &.v-list-item--active:hover {
        background-color: #EEF4FF !important;
        --v-theme-overlay-multiplier: 0;

        .v-list-item-title {
          color: var(--sidebar-primary) !important;
        }
      }
    }

    /* 그룹 */
    .v-list-group {
      --prepend-width: 0px !important;

      .v-list-group {
        .v-list-group__items .v-list-item {
          padding-inline-start: 32px !important;
          margin: 0 16px 4px !important;
        }
      }
    }

    /* 열린 그룹 */
    .v-list-group--open {
      padding-bottom: 3px;

      .v-list-group--open {
        margin: 4px 8px !important;
        color: var(--sidebar-primary);
        padding-bottom: 3px;
      }
    }

    /* 하위 아이템 */
    .v-list-group__items {
      .v-list-item-title {
        font-weight: 500 !important;
        font-size: 0.875rem !important;
        color: #64748B !important;
      }

      .v-list-item {
        margin: 4px 8px !important;
      }
    }

    /* 아이콘 */
    .v-icon {
      --v-medium-emphasis-opacity: 1;
      color: #64748B !important;
    }

    /* Active 아이템 */
    .v-list-item--active {
      background-color: #EEF4FF !important;
      color: var(--sidebar-primary) !important;
      --v-theme-overlay-multiplier: 0 !important;

      .v-list-item-title {
        font-weight: 700 !important;
        color: var(--sidebar-primary) !important;
      }

      .v-icon {
        color: var(--sidebar-primary) !important;
      }
    }
  }
}
</style>
