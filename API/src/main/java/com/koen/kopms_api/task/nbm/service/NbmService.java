package com.koen.kopms_api.task.nbm.service;

import java.util.HashMap;

public interface NbmService {

    /** 공통코드 조회 */
    HashMap<String, Object> getCodeList(HashMap<String, Object> searchMap) throws Exception;

    /** 운영사업 목록 조회 */
    HashMap<String, Object> getNbmList(HashMap<String, Object> searchMap) throws Exception;

    /** 운영사업 상세 조회 (마스터 + 담당자 + 출자현황 + 추진경과) */
    HashMap<String, Object> getNbmDetail(HashMap<String, Object> searchMap) throws Exception;

    /** 운영사업 저장 (신규 등록 / 수정) */
    HashMap<String, Object> saveNbm(HashMap<String, Object> saveMap) throws Exception;

    /** 운영사업 삭제 */
    void deleteNbm(HashMap<String, Object> deleteMap) throws Exception;

    // ── 출자현황 ──────────────────────────────────────────────────

    /** 출자현황 목록 조회 */
    HashMap<String, Object> getInvestmentList(HashMap<String, Object> searchMap) throws Exception;

    // ── 회사관리 (NBM_COMPANY_INFO) ───────────────────────────────

    /** 회사관리 목록 조회 */
    HashMap<String, Object> getCompanyList(HashMap<String, Object> searchMap) throws Exception;

    /** 회사 등록/수정 */
    HashMap<String, Object> saveCompany(HashMap<String, Object> saveMap) throws Exception;

    /** 회사 삭제 */
    void deleteCompany(HashMap<String, Object> deleteMap) throws Exception;

    // ── 조달현황 ──────────────────────────────────────────────────

    /** 조달현황 - 출자금 목록 조회 */
    HashMap<String, Object> getProcurementInvestList(HashMap<String, Object> searchMap) throws Exception;

    /** 조달현황 - PF대출상환 목록 조회 */
    HashMap<String, Object> getProcurementPfList(HashMap<String, Object> searchMap) throws Exception;
}
