package com.koen.kopms_api.task.employee.service;

import java.util.HashMap;

public interface EmployeeService {	
	
	// 조직 조회 : tree
	public HashMap<String, Object> getDepts(HashMap<String, Object> params) throws Exception;
	
	// 사원 조회
	public HashMap<String, Object> getEmployee(HashMap<String, Object> params) throws Exception;
	
	// 사원 저장 : 평가위원
	int saveEmploy(HashMap<String, Object> params) throws Exception;

}
