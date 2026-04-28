<template>
  <div class="progress-panel d-flex flex-column overflow-hidden">
    <div class="view-section-header d-flex align-center mb-3">추진경과</div>
    <div v-if="progressList.length === 0" class="view-empty">등록된 추진경과가 없습니다</div>
    <div v-else class="progress-list overflow-y-auto">
      <div v-for="row in progressList" :key="row.progressSeq" class="progress-item d-flex align-baseline">
        <span class="progress-date flex-shrink-0">{{ row.progressDate }}</span>
        <span class="progress-desc">{{ row.description }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  progressList: { type: Array, required: true },
});
</script>

<style scoped lang="scss">
.view-section-header {
  gap: 8px;
  font-size: 1rem;
  font-weight: 700;
  color: #1a237e;
  border-left: 4px solid #1565c0;
  padding-left: 10px;
}

.view-empty {
  padding: 20px;
  text-align: center;
  color: #bdbdbd;
  font-size: 0.875rem;
  border-radius: 8px;
  background: #fafafa;
}

.progress-panel {
  flex: 1;
  border: 1px solid #e8eaf0;
  border-radius: 10px;
  padding: 16px 8px 8px 20px;
  background: #ffffff;
}

.progress-list {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr;
  align-content: start;
  gap: 2px;
}

.progress-item {
  gap: 12px;
  padding: 7px 8px;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: background 0.12s;

  &:hover { background: #f5f7ff; }
}

.progress-date {
  min-width: 76px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #9e9e9e;
}

.progress-desc {
  color: #37474f;
  font-weight: 400;
  line-height: 1.4;
}
</style>
