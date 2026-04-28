package com.koen.kopms_api.task.biz.service;

import java.util.HashMap;

public interface BizService {
	
	// 사업목록 코드 조회
	public HashMap<String, Object> getCodeList(HashMap<String, Object> searchMap) throws Exception;
	
	// 사업목록 조회
	public HashMap<String, Object> getBizList(HashMap<String, Object> searchMap) throws Exception;

	// Task코드 조회
	public HashMap<String, Object> getTaskList(HashMap<String, Object> searchMap) throws Exception;
	
	// Biz Task 공정표 조회
	public HashMap<String, Object> getBizTaskList(HashMap<String, Object> searchMap) throws Exception;

	// Task 코드 저장/수정
	public HashMap<String, Object> setTaskCode(HashMap<String, Object> searchMap) throws Exception;
	
	// Task 코드 삭제
	public HashMap<String, Object> deleteTaskCode(HashMap<String, Object> searchMap) throws Exception;

	// 사업단계/상태 수정
	public HashMap<String, Object> setBizStep(HashMap<String, Object> searchMap) throws Exception;

	// 사업 정보 및 관련 데이터 삭제
	public HashMap<String, Object> deleteBizData(HashMap<String, Object> searchMap) throws Exception;
	
	// 공정기간 데이터 업데이트
	public HashMap<String, Object> setTaskItemPeriod(HashMap<String, Object> itemTask) throws Exception;
	
	// 관련데이타 콤보 조회
	public HashMap<String, Object> getBizTaskComboData(HashMap<String, Object> searchMap) throws Exception;
	
	// 관련데이타 조회
	public HashMap<String, Object> getRelatedData(HashMap<String, Object> searchMap) throws Exception;
	
	// BIZ_PORTAL 스케쥴 변경 HISTORY 조회
	public HashMap<String, Object> getBizTaskPeriodHist(HashMap<String, Object> searchMap) throws Exception;

	// 사업 통계 조회
	public HashMap<String, Object> getBizStatistics(HashMap<String, Object> searchMap) throws Exception;
}
