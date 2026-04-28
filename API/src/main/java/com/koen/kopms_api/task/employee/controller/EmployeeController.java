package com.koen.kopms_api.task.employee.controller;

import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.koen.kopms_api.common.response.CommonResponse;
import com.koen.kopms_api.common.util.MessageUtil;
import com.koen.kopms_api.config.i18n.ExceptionMsg;
import com.koen.kopms_api.model.vo.SessionContext;
import com.koen.kopms_api.task.employee.service.EmployeeService;

import jakarta.inject.Inject;
import jakarta.inject.Provider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;


/**
 * employee 컨트롤러
 * API 명명 규칙: /api/codes
 * "/comm/code"
 */

@Slf4j                  
@RestController
@RequestMapping("/kopms-api/employee")
public class EmployeeController {
	
	@Autowired
	private EmployeeService employeeService;
	
	@Inject
	Provider <SessionContext> sessionProvider;
	
	@Autowired
	private MessageUtil messageUtil;
    
    /**
     * 부서 조회 : tree
     * POST comm/code/codeList
     */
    @PostMapping("/getDepts")
    public CommonResponse<?> getDepts(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {
//    	log.info("EmployeeController - getDepts for searchMap : {}", searchMap);
    	
    	HashMap<String, Object> resultMap = employeeService.getDepts(searchMap);
		
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), resultMap);
    }
    
    /**
     * 사원 조회 : 
     * POST 
     */
    @PostMapping("/getEmployee")
    public CommonResponse<?> getEmployee(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {
//    	log.info("EmployeeController - getEmployee for searchMap : {}", searchMap);
    	
    	HashMap<String, Object> resultMap = employeeService.getEmployee(searchMap);
		
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), resultMap);
    }
       
    /**
     * 사원 저장 : 평가위원
     * POST 
     */
    @PostMapping("/saveEmploy")
    public CommonResponse<?> saveEmploy(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {
    	log.info("DeptController - saveEmploy for searchMap : {}", searchMap);
    	
    	int rtn = 0;
    	rtn = employeeService.saveEmploy(searchMap);
    	
    	HashMap<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("isOk", rtn);
		
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), resultMap);
    }

    
}
