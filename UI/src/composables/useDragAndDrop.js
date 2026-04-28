import { ref } from 'vue';

/**
 * 두 그리드 간 Drag & Drop으로 행을 이동하는 composable.
 *
 * @param {Object} lists
 *   - availableMenus         {Ref<Array>}  좌측 그리드 (미등록)
 *   - registeredMenus        {Ref<Array>}  우측 그리드 (등록)
 *   - filteredAvailableMenus {Ref<Array>}  검색 필터가 적용된 좌측 목록 (ghost image용)
 *   - allMenus               {Ref<Array>}  전체 메뉴 원본 (순서 복원용)
 *
 * @param {Object} dragSelectState  - useDragSelect의 반환값 중 필요한 것
 *   - dragSelectMode    {Ref<string|null>}
 *   - dragOriginalStates {Ref<Map>}
 *   - resetDragSelect   {Function}
 *
 * @example
 * const { dragSource, onDragStart, onDragEnd, onDropToRegistered, onDropToAvailable }
 *   = useDragAndDrop(
 *       { availableMenus, registeredMenus, filteredAvailableMenus, allMenus },
 *       { dragSelectMode, dragOriginalStates, resetDragSelect },
 *     );
 */
export function useDragAndDrop(lists, dragSelectState) {
  const { availableMenus, registeredMenus, filteredAvailableMenus, allMenus } = lists;
  const { dragSelectMode, dragOriginalStates, resetDragSelect } = dragSelectState;

  const dragSource = ref(null);

  // ── 내부 헬퍼 ────────────────────────────────────────

  /**
   * D&D 중 deselect 모드로 임시 해제된 행을 드래그 전 상태로 복원.
   * drop 핸들러에서 checked 필터링 전에 반드시 호출.
   */
  const revertDragDeselect = (sourceList) => {
    if (dragSelectMode.value !== 'deselect') return;
    dragOriginalStates.value.forEach((originalChecked, menuCodeNo) => {
      const menu = sourceList.find(m => m.menuCodeNo === menuCodeNo);
      if (menu) menu.checked = originalChecked;
    });
  };

  /** ghost image DOM 생성 후 dataTransfer에 등록. requestAnimationFrame으로 즉시 제거. */
  const buildGhostImage = (event, checkedMenus) => {
    const MAX_VISIBLE = 5;
    const visible = checkedMenus.slice(0, MAX_VISIBLE);
    const overflow = checkedMenus.length - MAX_VISIBLE;

    const ghost = document.createElement('div');
    ghost.style.cssText = [
      'position:fixed', 'top:-9999px', 'left:-9999px',
      'background:white', 'border:1px solid #1867c0', 'border-radius:4px',
      'padding:4px 10px', 'font-size:13px', 'box-shadow:0 2px 8px rgba(0,0,0,0.2)',
      'white-space:nowrap', 'pointer-events:none',
    ].join(';');

    visible.forEach(m => {
      const row = document.createElement('div');
      row.style.cssText = 'padding:2px 0;display:flex;gap:6px;align-items:center;';
      row.innerHTML = `<span style="color:#1867c0;font-size:15px">☑</span>${m.menuName}`;
      ghost.appendChild(row);
    });

    if (overflow > 0) {
      const badge = document.createElement('div');
      badge.style.cssText = 'margin-top:4px;padding:1px 6px;background:#1867c0;color:white;border-radius:10px;font-size:12px;text-align:center;';
      badge.textContent = `+ ${overflow}개 더`;
      ghost.appendChild(badge);
    }

    document.body.appendChild(ghost);
    event.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, 12);
    requestAnimationFrame(() => { if (ghost.parentNode) ghost.parentNode.removeChild(ghost); });
  };

  // ── 공개 메서드 ───────────────────────────────────────

  const onDragStart = (source, event) => {
    dragSource.value = source;
    event.dataTransfer.effectAllowed = 'move';

    const list = source === 'available' ? filteredAvailableMenus.value : registeredMenus.value;
    const checkedMenus = list.filter(m => m.checked);
    if (checkedMenus.length > 0) {
      buildGhostImage(event, checkedMenus);
    }
  };

  const onDragEnd = () => {
    dragSource.value = null;
    resetDragSelect();
  };

  /** 좌측(available) → 우측(registered) drop */
  const onDropToRegistered = () => {
    if (dragSource.value !== 'available') return;
    revertDragDeselect(availableMenus.value);
    availableMenus.value
      .filter(m => m.checked)
      .forEach(m => {
        if (!registeredMenus.value.some(r => r.menuCodeNo === m.menuCodeNo)) {
          // 원래 등록 항목(isRemoved)을 다시 넣을 때 → isNew: false (기본 색상)
          // 신규 항목을 처음 넣을 때 → isNew: true (연초록)
          registeredMenus.value.unshift({ ...m, checked: true, isNew: !m.isRemoved });
        }
      });
    availableMenus.value = availableMenus.value.filter(m => !m.checked);
    dragSource.value = null;
  };

  /** 우측(registered) → 좌측(available) drop */
  const onDropToAvailable = () => {
    if (dragSource.value !== 'registered') return;
    revertDragDeselect(registeredMenus.value);
    registeredMenus.value
      .filter(m => m.checked)
      .forEach(m => {
        // DB 원본 항목 → isRemoved: true (연분홍)
        // 이번 세션에 추가한 항목(isNew) → isRemoved: false (기본 색상으로 원복)
        availableMenus.value.push({ ...m, checked: true, isNew: false, isRemoved: !m.isNew });
      });
    const orderMap = {};
    allMenus.value.forEach((menu, i) => { orderMap[menu.menuCodeNo] = i; });
    availableMenus.value.sort((a, b) => orderMap[a.menuCodeNo] - orderMap[b.menuCodeNo]);
    registeredMenus.value = registeredMenus.value.filter(m => !m.checked);
    dragSource.value = null;
  };

  return {
    dragSource,
    onDragStart,
    onDragEnd,
    onDropToRegistered,
    onDropToAvailable,
  };
}
