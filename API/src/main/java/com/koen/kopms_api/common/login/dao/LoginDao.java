package com.koen.kopms_api.common.login.dao;

import java.util.HashMap;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;

@Mapper	// MyBatis Mapper 등록[DAO]
public interface LoginDao {
	
	// 로그인 
	HashMap<String, Object> selectMember(HashMap<String, Object> searchMap) throws Exception;
		
	// 메뉴 조회
	List<HashMap<String, Object>> selectMenus(HashMap<String, Object> searchMap) throws Exception;
	
	// 메뉴 권한 조회
	List<HashMap<String, Object>> selectMenuAuth(HashMap<String, Object> searchMap) throws Exception;
	
	// 로그인 이력
	void insertUserLog(HashMap<String, Object> userLog) throws Exception;
	
	// 로그인 이력2
	void upsertLoginHistory(HashMap<String, Object> userLog) throws Exception;
	
	// 로그인 이력 조회
	List<HashMap<String, Object>> selectLoginHistory(HashMap<String, Object> searchMap) throws Exception;
	
	// 메뉴로그 
	int upsertLogMenu(HashMap<String, Object> userLog) throws Exception;	
	
	// 메뉴저장 : Test
	int insertMenu(HashMap<String, Object> userLog) throws Exception;
	int upsertMenu(HashMap<String, Object> userLog) throws Exception;
	
	// 메뉴 조회 : Excel Export
	List<HashMap<String, Object>> selectMenuList(HashMap<String, Object> searchMap) throws Exception;
		
    
}
