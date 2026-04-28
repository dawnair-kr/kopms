package com.koen.kopms_api.task.dept.dao;

import java.util.HashMap;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;

@Mapper	
public interface DeptDao {
	
	// 부서조회 : 트리
	List<HashMap<String, Object>> selectDepts(HashMap<String, Object> searchMap) throws Exception;
    
	// 조직정보 : 부서 선택용
	List<HashMap<String, Object>> selectDeptCodes(HashMap<String, Object> searchMap) throws Exception;
	
	// 조직정보 저장
	int upsertDept(HashMap<String, Object> userLog) throws Exception;

	// 부서 메뉴 권한 조회 (AuthorityEdit 셔틀용)
	List<HashMap<String, Object>> selectDeptMenus(HashMap<String, Object> params) throws Exception;

	// 권한 목록 조회 (Authority 조회 화면용)
	List<HashMap<String, Object>> selectAuthorityList(HashMap<String, Object> params) throws Exception;

	// 부서 메뉴 권한 비활성화 (전체 USE_YN = 'N')
	int updateDeptMenusToInactive(HashMap<String, Object> params) throws Exception;

	// 부서 메뉴 권한 MERGE (USE_YN='Y' 복원 or 신규 INSERT)
	int mergeDeptMenus(HashMap<String, Object> params) throws Exception;
}
