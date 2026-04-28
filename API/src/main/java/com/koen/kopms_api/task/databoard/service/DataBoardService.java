package com.koen.kopms_api.task.databoard.service;

import java.util.HashMap;
import java.util.List;

public interface DataBoardService {	
	
	// 조직 조회 
	public HashMap<String, Object> getDataBoardTree(HashMap<String, Object> params) throws Exception;
	
	// 자료실 페이징
	HashMap<String, Object> getDataBoard(HashMap<String, Object> params) throws Exception;

//	// 권한 목록 조회 (Authority 조회 화면용)
//	HashMap<String, Object> getAuthorityList(HashMap<String, Object> params) throws Exception;
//
//	// 조직 저장
//	int saveDept(HashMap<String, Object> params) throws Exception;
//
//	// 부서 메뉴 권한 저장
//	void saveDeptMenus(HashMap<String, Object> params) throws Exception;

}
