<template no-gutters>
  <v-main class="main-viewport">
    
    <!-- 메뉴명, 네비게이션 Path -->
    <v-row no-gutters class="page-header-bar" v-show="selectMenuStore.getSelectMenuInfo">
      <v-col>
        <h3 class="d-flex">
          <v-icon
            v-if="selectMenuStore.getSelectMenuInfo?.menuImage"
            :icon="selectMenuStore.getSelectMenuInfo.menuImage"
            class="mr-2"
          />
          <div>{{ selectMenuStore.getSelectMenuInfo?.menuName }}</div>
        </h3>
      </v-col>
      <v-col class="d-flex justify-end align-center">
        <div class="breadcrumb-pill">
          <v-icon icon="mdi-home-outline" size="x-small" class="breadcrumb-home" />
          <template v-for="(segment, index) in breadcrumbSegments" :key="index">
            <v-icon icon="mdi-chevron-right" size="x-small" class="breadcrumb-sep" />
            <span :class="getBreadcrumbClass(segment, index)">
              {{ segment }}
            </span>
          </template>
        </div>
      </v-col>
    </v-row>
    <!-- 메뉴명, 네비게이션 Path -->

    <router-view />

  </v-main>

</template>

<script setup>
import { ref } from 'vue'
import { useSelectMenuStore } from '@/store/selectMenuStore.js';

</script>
  
<script>
export default {
  components: {

  },
  data() {
    return {
      // 1. 선택메뉴 정보 : 초기값 - null로 설정
      selectMenuStore: null,
    }
  },
  created() {
    this.$log.debug("View.vue ::"," created~~~~~");
    // 2. 컴포넌트 생성 시점에 Store 연결
    this.selectMenuStore = useSelectMenuStore();
  },
  computed: {
    breadcrumbSegments() {
      const path = this.selectMenuStore?.getSelectMenuInfo?.menuPath;
      if (!path) return [];
      return path.split(' > ');
    },
  },
  methods: {
    getBreadcrumbClass(segment, index) {
      if (index === this.breadcrumbSegments.length - 1) return 'breadcrumb-current';
      if (segment === this.selectMenuStore?.highlightSegment) return 'breadcrumb-highlight';
      return 'breadcrumb-inactive';
    },
  },

  mounted() {
    
    if (this.selectMenuStore && typeof this.selectMenuStore.setSelectMenuInfo === 'function') {
      this.$log.debug("View.vue :: mounted - setSelectMenuInfo 확인되었어요.");
      this.$log.debug("mounted :: selectedMenu - ", this.selectMenuStore.getSelectMenuInfo ); 
      // this.$log.debug("mounted :: selectedMenu - ", this.selectMenuStore.getSelectMenuInfo.menuPath ); 
    } else {
      this.$log.debug("View.vue :: mounted - setSelectMenuInfo 함수를 찾을 수 없습니다. Store 설정을 확인하세요.");
    }

  }
}
</script>

<style scoped lang="scss">
.main-viewport {
  height: 100vh;
  overflow-y: auto;
}

.page-header-bar {
  margin: 8px;
  padding: 8px;
  border-radius: 8px;
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06),
              0 1px 2px rgba(0, 0, 0, 0.04);
}

.breadcrumb-pill {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(248, 250, 255, 0.85);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.breadcrumb-home {
  color: #94A3B8 !important;
}

.breadcrumb-sep {
  color: #CBD5E1 !important;
}

.breadcrumb-inactive {
  font-size: 13px;
  color: #94A3B8;
}

.breadcrumb-current {
  font-size: 13px;
  font-weight: 700;
  color: #004098;
}

.breadcrumb-highlight {
  font-size: 13px;
  font-weight: 600;
  color: #1E293B;
}

</style>