package com.koen.kopms_api.task.employee.dao;

import java.util.HashMap;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;



@Mapper	
public interface EmployeeDao {
	
	// 사원 조회
	List<HashMap<String, Object>> selectEmployee(HashMap<String, Object> searchMap) throws Exception;
	
	// 사원 저장 : 평가위원
	int insertEmploy(HashMap<String, Object> employInfo) throws Exception;
    
	// 조직정보 : 부서 선택용
	//List<HashMap<String, Object>> selectDeptCodes(HashMap<String, Object> searchMap) throws Exception;
	
	// 조직정보 저장
	//int upsertDept(HashMap<String, Object> userLog) throws Exception;
}
