package com.koen.kopms_api.task.biz.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface BizDao {

    // =========================================================
    // 공통 코드 조회
    // =========================================================

    /** 사업목록 공통코드 조회 */
    List<HashMap<String, Object>> selectCodeList(HashMap<String, Object> searchMap) throws Exception;


    // =========================================================
    // 사업 목록 / 마스터 조회
    // =========================================================

    /** 사업목록 조회 */
    List<HashMap<String, Object>> selectBizList(HashMap<String, Object> searchMap) throws Exception;

    /** 사업 기본정보 조회 (BIZ_MASTER) */
    HashMap<String, Object> selectBizData(HashMap<String, Object> searchMap) throws Exception;

    /** 사업별 Task 목록 조회 (BIZ_TASK) */
    List<HashMap<String, Object>> selectBizTasks(Map<String, Object> searchMap) throws Exception;


    // =========================================================
    // 단계별 상세 데이터 조회
    // =========================================================

    /** S10 - 사업정보입수: 상세정보 조회 (S1010) */
    HashMap<String, Object> selectS1010Data(HashMap<String, Object> searchMap) throws Exception;

    /** S10 - 사업정보입수: 컨소시엄 목록 조회 (S1010_CONSORTIUM) */
    List<Map<String, Object>> selectConsortiumList(HashMap<String, Object> searchMap) throws Exception;

    /** S20 - 입수정보분석: 상세정보 조회 (S2010) */
    HashMap<String, Object> selectS2010Data(HashMap<String, Object> searchMap) throws Exception;
    
    /** S30 - 사업정보검토회의: 상세정보 조회 (S3010) */
	HashMap<String, Object> selectS3010Data(HashMap<String, Object> searchMap) throws Exception;
	
	/** S40 - 사업타당성기초조사: 상세정보 조회 (S4010) */
	HashMap<String, Object> selectS4010Data(HashMap<String, Object> searchMap) throws Exception;
	
	/** S50 - 사업개발심사회의: 상세정보 조회 (S5010) */
	HashMap<String, Object> selectS5010Data(HashMap<String, Object> searchMap) throws Exception;
	
	/** D10 - 사업착수: 상세정보 조회 (D2010) */
	HashMap<String, Object> selectD1010Data(HashMap<String, Object> searchMap) throws Exception;
	
	/** D20 - 입찰서/제의서관리: 상세정보 조회 (D2010) */
	HashMap<String, Object> selectD2010Data(HashMap<String, Object> searchMap) throws Exception;
	
	/** D30 - 리스크평가: 상세정보 조회 (D3010) */
	HashMap<String, Object> selectD3010Data(HashMap<String, Object> searchMap) throws Exception;

	/** D35 - 리스크관리위원회: 상세정보 조회 (D3020) */
	HashMap<String, Object> selectD3020Data(HashMap<String, Object> searchMap) throws Exception;
	
	/** D40 - 입찰서/제의서제출: 상세정보 조회 (D4010) */
	HashMap<String, Object> selectD4010Data(HashMap<String, Object> searchMap) throws Exception;
	
	/** D50 - 낙찰및계약: 상세정보 조회 (D5010) */
	HashMap<String, Object> selectD5010Data(HashMap<String, Object> searchMap) throws Exception;
	
	/** D60 - 법인설립및재원조달: 상세정보 조회 (D6010) */
	HashMap<String, Object> selectD6010Data(HashMap<String, Object> searchMap) throws Exception;
	
	/** D70 - 계약체결: 상세정보 조회 (D7010) */
	HashMap<String, Object> selectD7010Data(HashMap<String, Object> searchMap) throws Exception;

	
    // =========================================================
    // BIZ_MASTER 저장 / 수정
    // =========================================================

    /** DOC_SEQ 채번 (seq 숫자만 반환 — 서비스에서 년도+코드값과 조합해 DOC_NO 완성) */
    String getNextDocSeqNo() throws Exception;

    /** 사업 신규 등록 (BIZ_MASTER INSERT) */
    int insertBizMaster(Map<String, Object> searchMap) throws Exception;

    /** 사업 기본정보 수정 (BIZ_MASTER UPDATE) */
    int updateBizMaster(Map<String, Object> searchMap) throws Exception;

    /** 사업단계 / 진행상태 수정 (BIZ_MASTER UPDATE) */
    int updateBizStep(HashMap<String, Object> searchMap) throws Exception;

    /** 특정 테이블의 데이터 존재 여부 확인 */
    int checkDataExists(Map<String, Object> checkMap) throws Exception;


    // =========================================================
    // S10 - 사업정보입수 저장 / 수정 (S1010)
    // =========================================================

    /** S1010 신규 등록 */
    int insertS1010(Map<String, Object> searchMap) throws Exception;

    /** S1010 수정 */
    int updateS1010(Map<String, Object> searchMap) throws Exception;


    // =========================================================
    // S10 - 컨소시엄 저장 (S1010_CONSORTIUM)
    // =========================================================

    /** 컨소시엄 단건 등록 */
    int insertConsortium(Map<String, Object> searchMap) throws Exception;


    // =========================================================
    // S10 - 버전 이력 저장 / 조회 (S1010_HISTORY, S1010_CONSORTIUM_HISTORY)
    // 버전은 bizInfo 변경 시에만 생성, 컨소시엄은 항상 동일 버전으로 동기화
    // =========================================================

    /** S1010 이력 저장 */
    int insertS1010History(Map<String, Object> searchMap) throws Exception;

    /** 컨소시엄 이력 저장 */
    int insertConsortiumHistory(Map<String, Object> searchMap) throws Exception;

    /** 다음 히스토리 버전 번호 채번 */
    int getNextHistoryVersion(String masterNo) throws Exception;

    /** 버전 드롭다운 목록 조회 */
    List<Map<String, Object>> selectHistoryVersionList(HashMap<String, Object> searchMap) throws Exception;

    /** S1010 히스토리 단건 조회 */
    HashMap<String, Object> selectS1010History(HashMap<String, Object> searchMap) throws Exception;

    /** 컨소시엄 히스토리 목록 조회 */
    List<Map<String, Object>> selectConsortiumHistoryList(HashMap<String, Object> searchMap) throws Exception;


    // =========================================================
    // S20 - 입수정보분석 저장 / 수정 (S2010)
    // =========================================================

    /** S2010 신규 등록 */
    void insertS2010(Map<String, Object> bizInfo) throws Exception;

    /** S2010 수정 */
    void updateS2010(Map<String, Object> bizInfo) throws Exception;
    
    
    // =========================================================
    // S30 - 사업정보검토회의 저장 / 수정 (S3010)
    // =========================================================

    /** S3010 신규 등록 */
    void insertS3010(HashMap<String, Object> searchMap) throws Exception;
    
    /** S3010 수정 */
    void updateS3010(HashMap<String, Object> searchMap) throws Exception;

    
    // =========================================================
    // S40 - 사업타당성기초조사 저장 / 수정 (S4010)
    // =========================================================
    
    /** S4010 신규 등록 */
    void insertS4010(Map<String, Object> bizInfo) throws Exception;
    
    /** S4010 수정 */
    void updateS4010(Map<String, Object> searchMap) throws Exception;
    
    
    // =========================================================
    // S50 - 사업개발심사회의 저장 / 수정 (S5010)
    // =========================================================

    /** S5010 신규 등록 */
    void insertS5010(HashMap<String, Object> searchMap) throws Exception;
    
    /** S5010 수정 */
    void updateS5010(HashMap<String, Object> searchMap) throws Exception;
    
    
    // =========================================================
    // D10 - 사업착수 저장 / 수정 (D1010)
    // =========================================================

    /** D1010 신규 등록 */
    void insertD1010(HashMap<String, Object> searchMap) throws Exception;
    
    /** D1010 수정 */
    void updateD1010(HashMap<String, Object> searchMap) throws Exception;
    
    
    // =========================================================
    // D20 - 입찰서/제의서관리 저장 / 수정 (D2010)
    // =========================================================

    /** D2010 신규 등록 */
    void insertD2010(Map<String, Object> bizInfo) throws Exception;
    
    /** D2010 수정 */
    void updateD2010(Map<String, Object> searchMap) throws Exception;
    
    
    // =========================================================
    // D30 - 리스크관리 저장 / 수정 (D3010)
    // =========================================================

    /** D3010 신규 등록 */
    void insertD3010(Map<String, Object> bizInfo) throws Exception;
    
    /** D3010 수정 */
    void updateD3010(Map<String, Object> searchMap) throws Exception;
    
    
    // =========================================================
    // D35 - 리스크관리위원회 저장 / 수정 (D3020)
    // =========================================================

    /** D3020 신규 등록 */
    void insertD3020(Map<String, Object> bizInfo) throws Exception;
    
    /** D3020 수정 */
    void updateD3020(Map<String, Object> searchMap) throws Exception;
    
    
    // =========================================================
    // D40 - 사업추진계획/입찰서제출 저장 / 수정 (D4010)
    // =========================================================

    /** D4010 신규 등록 */
    void insertD4010(Map<String, Object> bizInfo) throws Exception;
    
    /** D4010 수정 */
    void updateD4010(Map<String, Object> searchMap) throws Exception;
    
    
    // =========================================================
    // D50 - 낙찰및계약 저장 / 수정 (D5010)
    // =========================================================

    /** D5010 신규 등록 */
    void insertD5010(Map<String, Object> bizInfo) throws Exception;
    
    /** D5010 수정 */
    void updateD5010(Map<String, Object> searchMap) throws Exception;
    
    
    // =========================================================
    // D60 - 법인설립및재원조달 저장 / 수정 (D6010)
    // =========================================================

    /** D6010 신규 등록 */
    void insertD6010(Map<String, Object> bizInfo) throws Exception;
    
    /** D6010 수정 */
    void updateD6010(Map<String, Object> searchMap) throws Exception;
    
    
    // =========================================================
    // D70 - 계약체결 저장 / 수정 (D7010)
    // =========================================================

    /** D7010 신규 등록 */
    void insertD7010(Map<String, Object> bizInfo) throws Exception;
    
    /** D7010 수정 */
    void updateD7010(Map<String, Object> searchMap) throws Exception;
    
    
    // =========================================================
    // BIZ_PORTAL 연동
    // =========================================================

    /** 포털 사업 MERGE (BIZ_PORTAL UPSERT) */
    int mergeBizPortal(Map<String, Object> searchMap) throws Exception;

    /** 포털 사업 진행상태 수정 */
    void updateBizPortalStatus(HashMap<String, Object> searchMap) throws Exception;
    
    /** 포털 나머지 절차 일괄 종결(T) 처리 */
    void updateRemainingBizPortalStatus(HashMap<String, Object> searchMap) throws Exception;

    /** 포털 사업 Task 삭제 */
    void deleteBizPortalTasks(Map<String, Object> deleteParam) throws Exception;

    /** 자식 task 중 선택 해제된 것 TASK_STATUS → 'C' 갱신 */
    void uncheckChildTasks(Map<String, Object> param) throws Exception;


    // =========================================================
    // BIZ_MEMBER / BIZ_TASK 저장
    // =========================================================

    /** 사업 참여인원 목록 조회 (BIZ_MEMBER) */
    List<Map<String, Object>> selectBizMembers(Map<String, Object> searchMap) throws Exception;

    /** 사업 참여인원 삭제 (BIZ_MEMBER) */
    int deleteBizMembers(String masterNo) throws Exception;

    /** 사업 참여인원 등록 (BIZ_MEMBER) */
    int insertBizMember(Map<String, Object> searchMap) throws Exception;

    /** Task 목록 조회 (BIZ_TASK) */
    List<HashMap<String, Object>> selectTaskList(HashMap<String, Object> searchMap) throws Exception;

    /** Task 이력 목록 조회 (BIZ_TASK_HISTORY) */
    List<HashMap<String, Object>> selectTaskHistoryList(HashMap<String, Object> searchMap) throws Exception;

    /** Task 단건 조회 — 이력 저장 전 현재값 확인용 */
    HashMap<String, Object> selectTaskByKey(HashMap<String, Object> searchMap) throws Exception;

    /** Task 이력 저장 (BIZ_TASK_HISTORY INSERT) */
    void insertBizTaskHistory(HashMap<String, Object> searchMap) throws Exception;

    /** Task 저장 (BIZ_TASK INSERT/UPDATE) */
    int saveBizTask(Map<String, Object> searchMap) throws Exception;

    /** 차수 task 개수 조회 (MASTER_NO + TEMPLATE_CODE 기준) */
    int countChildTasks(Map<String, Object> param) throws Exception;

    /** Biz Task 공정 목록 조회 (BIZ_TASK) */
    List<HashMap<String, Object>> selectBizTaskList(HashMap<String, Object> searchMap) throws Exception;
    
    
    // =========================================================
    // TASK별 데이터 조회/저장/수정
    // =========================================================
    
    /** 용역 데이터 조회 */
    HashMap<String, Object> selectSVC(HashMap<String, Object> searchMap) throws Exception;
    
    /** 용역 - 계약체결 데이터 조회 */
    List<Map<String, Object>> selectSVCCONList(HashMap<String, Object> searchMap) throws Exception;
    
    /** 인허가 데이터 조회 */
    HashMap<String, Object> selectLIC(HashMap<String, Object> searchMap) throws Exception;
    
    /** SPC 데이터 조회 */
    HashMap<String, Object> selectSPC(HashMap<String, Object> searchMap) throws Exception;
    
    /** 주민상생 데이터 조회 */
    HashMap<String, Object> selectCSV(HashMap<String, Object> searchMap) throws Exception;
    
    /** 용역 데이터 저장/수정 */
    void mergeSVC(Map<String, Object> bizInfo) throws Exception;
    
    /** 용역 - 계약체결 목록에서 제외된 항목 삭제 */
    void deleteSVCCONExcept(HashMap<String, Object> searchMap);
    
    /** 용역 - 계약체결 데이터 저장/수정 */
    void mergeSVCCON(Map<String, Object> bizInfo) throws Exception;
    
    /** 인허가 데이터 저장/수정 */
    void mergeLIC(Map<String, Object> bizInfo) throws Exception;
    
    /** SPC 데이터 저장/수정 */
    void mergeSPC(Map<String, Object> bizInfo) throws Exception;
    
    /** 주민상생 데이터 저장/수정 */
    void mergeCSV(Map<String, Object> bizInfo) throws Exception;
    
    // =========================================================
    // BIZ_MASTER 삭제 / 관련 데이터 정리
    // =========================================================

    /** Portal 태스크 정보 삭제 (BIZ_PORTAL) */
    void deleteBizPortal(String masterNo) throws Exception;

    /** S1010 상세 정보 삭제 */
    void deleteS1010(String masterNo) throws Exception;

    /** S1010 이력 삭제 */
    void deleteS1010History(String masterNo) throws Exception;

    /** 컨소시엄 정보 삭제 */
    void deleteConsortium(String masterNo) throws Exception;

    /** 컨소시엄 이력 삭제 */
    void deleteConsortiumHistory(String masterNo) throws Exception;

    /** 사업 기본 정보 삭제 (BIZ_MASTER) */
    int deleteBizMaster(String masterNo) throws Exception;
    
    /** biz Task item 기간업데이트 (BIZ_PORTAL UPDATE) */
    int updateTaskItemPeriod(HashMap<String, Object> itemTask) throws Exception;
    /** biz Task item 기간업데이트 history 적재 (INSERT INTO BIZ_PORTAL_HISTORY) */
    int insertTaskItemPeriodHistory(HashMap<String, Object> itemTask) throws Exception;

    /** Task 사용 여부 확인 (BIZ_PORTAL에 등록된 사업이 있으면 삭제 불가) */
    int checkTaskInUse(HashMap<String, Object> searchMap) throws Exception;

    /** Task 이력 삭제 (BIZ_TASK_HISTORY DELETE) */
    int deleteTaskHistory(HashMap<String, Object> searchMap) throws Exception;

    /** Task 마스터 삭제 (BIZ_TASK DELETE) */
    int deleteTask(HashMap<String, Object> searchMap) throws Exception;

    /** 자식 task 삭제 — BIZ_PORTAL 단건 */
    void deleteBizPortalTask(HashMap<String, Object> param) throws Exception;

    /** 자식 task 삭제 — BIZ_SVC */
    void deleteSVC(HashMap<String, Object> param) throws Exception;

    /** 자식 task 삭제 — BIZ_SVC_CON */
    void deleteSVCCON(HashMap<String, Object> param) throws Exception;

    /** 자식 task 삭제 — BIZ_LIC */
    void deleteLIC(HashMap<String, Object> param) throws Exception;

    /** 자식 task 삭제 — BIZ_SPC */
    void deleteSPC(HashMap<String, Object> param) throws Exception;

    /** 자식 task 삭제 — BIZ_CSV */
    void deleteCSV(HashMap<String, Object> param) throws Exception;

    
    /** 관련자료 조회조건용 콤보 조회 (관련자료 조회용 콤보 : 1차분류(TASK_TYPE) */
    List<HashMap<String, Object>> selectBizTaskTypeList(HashMap<String, Object> searchMap) throws Exception;
    /** 관련자료 조회조건용 콤보 조회 (관련자료 조회용 콤보 : 2차분류(TASK_CODE) */
    List<HashMap<String, Object>> selectBizTaskCodeList(HashMap<String, Object> searchMap) throws Exception;

    /** 관련자료 조회 */
    List<HashMap<String, Object>> selectRelatedData(HashMap<String, Object> searchMap) throws Exception;
    
    /** BIZ_PORTAL 스케쥴 변경 HISTORY 조회 */
    List<HashMap<String, Object>> selectBizTaskPeriodHist(HashMap<String, Object> searchMap) throws Exception;


    // =========================================================
    // 사업 통계
    // =========================================================

    /** 사업 통계 조회 (년/월별 카운트, X축 선택 시 항목별 분기) */
    List<HashMap<String, Object>> selectBizStatistics(HashMap<String, Object> searchMap) throws Exception;
}
