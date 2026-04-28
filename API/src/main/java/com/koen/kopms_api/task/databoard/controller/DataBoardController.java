package com.koen.kopms_api.task.databoard.controller;

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
import com.koen.kopms_api.task.databoard.service.DataBoardService;

import jakarta.inject.Inject;
import jakarta.inject.Provider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;


/**
 * databoard
 * API 명명 규칙: /api/codes
 * "/comm/code"
 */

@Slf4j                  
@RestController
@RequestMapping("/kopms-api/databoard")
public class DataBoardController {
	
	@Autowired
	private DataBoardService databoardService;
	
	@Inject
	Provider <SessionContext> sessionProvider;
	
	@Autowired
	private MessageUtil messageUtil;
    
    /**
     * 부서 조회 : 다건
     * POST comm/code/codeList
     */
    @PostMapping("/getDataBoardTree")
    public CommonResponse<?> getDataBoardTree(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {
    	log.info("DataBoardController - getDataBoardTree for searchMap : {}", searchMap);
    	
    	HashMap<String, Object> resultMap = databoardService.getDataBoardTree(searchMap);
		
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), resultMap);
    }
       
    /**
     * 자료실 페이징
     * POST /getDataBoard
     */
    @PostMapping("/getDataBoard")
    public CommonResponse<?> getDeptMenus(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {
    	
    	HashMap<String, Object> resultMap = databoardService.getDataBoard(searchMap);
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), resultMap);
    }

//    /**
//     * 권한 목록 조회 (Authority 조회 화면)
//     * POST /dept/getAuthorityList
//     */
//    @PostMapping("/getAuthorityList")
//    public CommonResponse<?> getAuthorityList(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {
//    	HashMap<String, Object> resultMap = deptService.getAuthorityList(searchMap);
//    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), resultMap);
//    }
//
//    /**
//     * 부서 저장
//     * POST
//     */
//    @PostMapping("/saveDept")
//    public CommonResponse<?> saveDept(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {
////    	log.info("DeptController - saveDept for searchMap : {}", searchMap);
//
//    	int rtn = 0;
//    	rtn = deptService.saveDept(searchMap);
//
//    	HashMap<String, Object> resultMap = new HashMap<String, Object>();
//		resultMap.put("isOk", rtn);
//
//    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), resultMap);
//    }
//
//    /**
//     * 부서 메뉴 권한 저장
//     * POST /dept/saveDeptMenus
//     */
//    @PostMapping("/saveDeptMenus")
//    public CommonResponse<?> saveDeptMenus(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {
//    	log.info("DeptController - saveDeptMenus for searchMap : {}", searchMap);
//
//    	// 세션에서 로그인 사용자 사번을 꺼내 searchMap에 추가 → Mapper의 upwriterId로 사용
//    	SessionContext sessionContext = sessionProvider.get();
//    	searchMap.put("upwriterId", sessionContext.getEmpno());
//
//    	deptService.saveDeptMenus(searchMap);
//
//    	HashMap<String, Object> resultMap = new HashMap<String, Object>();
//    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), resultMap);
//    }

}
