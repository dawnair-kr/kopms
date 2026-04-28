package com.koen.kopms_api.task.nbm.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface NbmDao {

    // =========================================================
    // 공통 코드 조회
    // =========================================================

    /** 공통코드 조회 */
    List<HashMap<String, Object>> selectCodeList(HashMap<String, Object> searchMap) throws Exception;

    // =========================================================
    // 운영사업 목록 조회 (NBM_BIZ_MASTER)
    // =========================================================

    /** 운영사업 목록 조회 */
    List<HashMap<String, Object>> selectNbmList(HashMap<String, Object> searchMap) throws Exception;

    // =========================================================
    // 운영사업 상세 조회
    // =========================================================

    /** 운영사업 마스터 단건 조회 */
    HashMap<String, Object> selectNbmMaster(HashMap<String, Object> searchMap) throws Exception;

    /** 담당자 목록 조회 (NBM_BIZ_MEMBER) */
    List<HashMap<String, Object>> selectNbmMembers(HashMap<String, Object> searchMap) throws Exception;

    /** 출자현황 목록 조회 (NBM_CONTRIBUTIONS) */
    List<HashMap<String, Object>> selectContributions(HashMap<String, Object> searchMap) throws Exception;

    /** 추진경과 목록 조회 (NBM_PROPULSION_PROGRESS) */
    List<HashMap<String, Object>> selectProgressList(HashMap<String, Object> searchMap) throws Exception;

    // =========================================================
    // 운영사업 등록 / 수정
    // =========================================================

    /** 운영사업 마스터 신규 등록 (NBM_BIZ_MASTER INSERT) */
    int insertNbmMaster(Map<String, Object> param) throws Exception;

    /** 운영사업 마스터 수정 (NBM_BIZ_MASTER UPDATE) */
    int updateNbmMaster(Map<String, Object> param) throws Exception;

    /** 담당자 전체 삭제 후 재등록 — DELETE */
    int deleteNbmMembers(String masterNo) throws Exception;

    /** 담당자 단건 등록 (NBM_BIZ_MEMBER INSERT) */
    int insertNbmMember(Map<String, Object> param) throws Exception;

    /** 출자현황 전체 삭제 */
    int deleteContributions(String masterNo) throws Exception;

    /** 출자현황 단건 등록 (NBM_CONTRIBUTIONS INSERT) */
    int insertContribution(Map<String, Object> param) throws Exception;

    /** 추진경과 전체 삭제 */
    int deleteProgressList(String masterNo) throws Exception;

    /** 추진경과 단건 등록 (NBM_PROPULSION_PROGRESS INSERT) */
    int insertProgress(Map<String, Object> param) throws Exception;

    // =========================================================
    // 운영사업 삭제
    // =========================================================

    /** 운영사업 삭제 (DEL_FLAG = 'Y') */
    int deleteNbmMaster(String masterNo) throws Exception;

    // =========================================================
    // 출자현황 (NBM_INVESTMENT)
    // =========================================================

    /** 출자현황 목록 조회 */
    List<HashMap<String, Object>> selectInvestmentList(HashMap<String, Object> searchMap) throws Exception;

    // =========================================================
    // 회사관리 (NBM_COMPANY_INFO)
    // =========================================================

    /** 회사관리 목록 조회 */
    List<HashMap<String, Object>> selectCompanyList(HashMap<String, Object> searchMap) throws Exception;

    /** 회사 등록 */
    int insertCompany(Map<String, Object> param) throws Exception;

    /** 회사 수정 */
    int updateCompany(Map<String, Object> param) throws Exception;

    /** 회사 삭제 */
    int deleteCompany(String companyCode) throws Exception;

    // =========================================================
    // 조달현황
    // =========================================================

    /** 조달현황 - 출자금 목록 조회 */
    List<HashMap<String, Object>> selectProcurementInvestList(HashMap<String, Object> searchMap) throws Exception;

    /** 조달현황 - PF대출상환 목록 조회 */
    List<HashMap<String, Object>> selectProcurementPfList(HashMap<String, Object> searchMap) throws Exception;
}
