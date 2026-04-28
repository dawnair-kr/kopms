import { onMounted, watch } from 'vue';
import { useSelectMenuStore } from '@/store/selectMenuStore.js';

/**
 * 공통 브레드크럼 세터
 *
 * @param {string} stepLabel - 브레드크럼 마지막 세그먼트 (예: '입수정보분석', '재무 정보 관리')
 * @param {object} [options]
 * @param {'portal'|'anchor'} [options.base='portal'] - base 경로 출처
 *   'portal': portalBasePath (task form 기본 — BizPortal에서 설정한 경로)
 *   'anchor': menuAnchorPath (메뉴 직접 진입 화면용)
 * @param {string}  [options.fallback]    - base가 null일 때 대체 경로
 * @param {boolean} [options.watchMenu=false] - selectMenuInfo 변경 시 재적용 여부 (메뉴 직접 진입 화면에서 true)
 */
export function useBizBreadcrumb(stepLabel, options = {}) {
  const { base = 'portal', fallback, watchMenu = false } = options;
  const selectMenuStore = useSelectMenuStore();

  const apply = () => {
    const basePath = base === 'anchor'
      ? selectMenuStore.menuAnchorPath
      : selectMenuStore.portalBasePath;
    const resolved = basePath || fallback || null;
    selectMenuStore.setMenuName(stepLabel);
    selectMenuStore.setMenuPath(resolved ? `${resolved} > ${stepLabel}` : stepLabel);
  };

  if (watchMenu) {
    watch(() => selectMenuStore.selectMenuInfo, apply, { immediate: true });
  } else {
    onMounted(apply);
  }
}
