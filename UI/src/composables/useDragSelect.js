import { ref } from 'vue';

/**
 * 그리드 내 마우스 드래그로 행 선택을 처리하는 composable.
 *
 * - 미체크 row 드래그: mousemove 기반 범위 선택 (select 모드)
 * - 체크된 row 드래그: HTML5 D&D 전용 (deselect 모드 표시만, 범위 해제는 하지 않음)
 * - 선택 해제는 개별 row 클릭 또는 헤더 체크박스로 처리
 *
 * @param {Object} listMap   - { available: import('vue').Ref<Array>, registered: import('vue').Ref<Array> }
 * @param {Array} allListRefs - [availableMenus, registeredMenus]
 */
export function useDragSelect(listMap, allListRefs) {
  // ── 상태 ─────────────────────────────────────────────
  const isDragSelecting = ref(false);
  const dragSelectStarted = ref(false);
  const dragSelectMode = ref(null);         // 'select' | 'deselect'
  const dragStartIdx = ref(-1);
  const dragSourceList = ref(null);         // 'available' | 'registered'
  const dragOriginalStates = ref(new Map()); // menuCodeNo → 드래그 전 checked 상태
  const dragHasMoved = ref(false);
  const dragJustEnded = ref(false);

  // ── 내부 헬퍼 ────────────────────────────────────────
  const getDragList = () => listMap[dragSourceList.value]?.value ?? [];

  const applyDragRange = (currentIdx) => {
    const list = getDragList();
    const minIdx = Math.min(dragStartIdx.value, currentIdx);
    const maxIdx = Math.max(dragStartIdx.value, currentIdx);

    list.forEach((menu, i) => {
      if (i >= minIdx && i <= maxIdx) {
        if (!dragOriginalStates.value.has(menu.menuCodeNo)) {
          dragOriginalStates.value.set(menu.menuCodeNo, menu.checked);
        }
        menu.checked = dragSelectMode.value === 'select';
      } else {
        if (dragOriginalStates.value.has(menu.menuCodeNo)) {
          menu.checked = dragOriginalStates.value.get(menu.menuCodeNo);
        }
      }
    });
  };

  // ── 공개 메서드 ───────────────────────────────────────

  /**
   * 드래그/D&D 관련 상태를 초기화하고, 실제 드래그가 발생한 경우
   * dragJustEnded 플래그를 1 frame 동안 true로 유지해 click 이벤트를 무시.
   */
  const resetDragSelect = () => {
    const wasDragging = isDragSelecting.value || dragHasMoved.value;
    isDragSelecting.value = false;
    dragSelectMode.value = null;
    dragStartIdx.value = -1;
    dragSourceList.value = null;
    dragOriginalStates.value = new Map();
    dragHasMoved.value = false;
    if (wasDragging) {
      dragJustEnded.value = true;
      requestAnimationFrame(() => { dragJustEnded.value = false; });
    }
  };

  /** mousedown: 드래그 선택/해제 시작 */
  const onDragSelectStart = (menu, event, listType, idx) => {
    if (event.target.closest('.v-checkbox')) return;
    dragSelectStarted.value = true;
    dragStartIdx.value = idx;
    dragSourceList.value = listType;
    dragOriginalStates.value = new Map();

    if (menu.checked) {
      // 체크된 row: HTML5 drag 허용 (cross-list D&D 전용)
      dragSelectMode.value = 'deselect';
    } else {
      // 미체크 row: 텍스트 선택 방지 후 select 모드
      event.preventDefault();
      dragSelectMode.value = 'select';
      isDragSelecting.value = true;
      dragOriginalStates.value.set(menu.menuCodeNo, false);
      menu.checked = true;
    }
  };

  /**
   * mouseenter (tr): 미체크 row에서의 select 드래그 범위 갱신.
   * (미체크 row는 draggable=false이므로 HTML5 drag 없이 mousemove 기반으로 동작)
   */
  const onDragSelectEnter = (_menu, idx, listType) => {
    if (!isDragSelecting.value || listType !== dragSourceList.value) return;
    applyDragRange(idx);
  };

  /** tr 클릭: checked 토글. 드래그 직후엔 토글 억제. */
  const onMenuRowClick = (menu, event) => {
    if (event.target.closest('.v-checkbox')) return;
    if (dragSelectStarted.value) {
      dragSelectStarted.value = false;
      return;
    }
    menu.checked = !menu.checked;
  };

  /** 컨테이너(그리드 외부) 클릭: 전체 행 선택 해제 */
  const onContainerClick = (event) => {
    if (dragJustEnded.value) return;
    if (event.target.closest('tr')) return;
    if (event.target.closest('button') || event.target.closest('.v-btn')) return;
    allListRefs.forEach(listRef => {
      listRef.value.forEach(m => { m.checked = false; });
    });
  };

  /**
   * document mouseup 리스너 등록.
   * onMounted에서 한 번만 호출하세요.
   */
  const setupMouseupListener = () => {
    document.addEventListener('mouseup', () => {
      // 실제 드래그 이동이 없었던 경우 → 단순 클릭이므로 toggle 허용
      if (!dragHasMoved.value && !isDragSelecting.value) {
        dragSelectStarted.value = false;
      }
      resetDragSelect();
    });
  };

  return {
    // D&D composable에서 참조하는 상태
    dragSelectMode,
    dragOriginalStates,
    dragHasMoved,
    dragSelectStarted,
    dragJustEnded,
    isDragSelecting,
    // 이벤트 핸들러
    onDragSelectStart,
    onDragSelectEnter,
    onMenuRowClick,
    onContainerClick,
    resetDragSelect,
    setupMouseupListener,
  };
}
