import { getCurrentInstance } from 'vue'

/**
 * 공통코드 조회 컴포저블
 *
 * 사용 예)
 *   const { loadCodes } = useCommonCode()
 *   const codesMap = await loadCodes([105, 106])
 *   energySrcCodes.value = codesMap['105'] || []
 */
export function useCommonCode() {
  const { proxy } = getCurrentInstance()

  /**
   * @param {number|string|(number|string)[]} groupCodes - 조회할 코드그룹 번호 (단일 또는 배열)
   * @param {Object} excludeMap - 그룹별 제외할 codeValue 목록 예: { '109': ['D80', 'D90'] }
   * @returns {Promise<Object>} 코드그룹 맵 { '105': [...], '106': [...] }
   */
  const loadCodes = (groupCodes, excludeMap = {}) => {
    const codes = Array.isArray(groupCodes) ? groupCodes : [groupCodes]

    return new Promise((resolve) => {
      proxy.$br_trans([{
        url: '/kopms-api/biz/getCodeList',
        method: 'post',
        data: {
          groupCodes: codes.map(String),
          useYn: 'Y',
        },
      }], (_url, code, _msg, data) => {
        if (code < 0) { resolve({}); return }
        const result = data.groupCodes || {}
        Object.entries(excludeMap).forEach(([group, values]) => {
          if (result[group]) {
            result[group] = result[group].filter(c => !values.includes(c.codeValue))
          }
        })
        resolve(result)
      })
    })
  }

  return { loadCodes }
}
