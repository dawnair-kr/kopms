package com.koen.kopms_api.task.mdsett1.controller;

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
import com.koen.kopms_api.task.mdsett1.service.Mdsett1Service;

import jakarta.inject.Inject;
import jakarta.inject.Provider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;


/**
 * mdsett1 컨트롤러
 * API 명명 규칙: /api/codes
 * "/comm/code"
 */

@Slf4j                  
@RestController
@RequestMapping("/kopms-api/mdsett1")
public class Mdsett1Controller {
	
	@Autowired
	private Mdsett1Service mdsett1Service;
	
	@Inject
	Provider <SessionContext> sessionProvider;
	
	@Autowired
	private MessageUtil messageUtil;
    
	/**
    * 권한 신청 리스트 페이징 
    */
    @PostMapping("/getMdsett1ListP")
    public CommonResponse<?> getMdsett1ListP(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

    	log.info("Mdsett1Controller - getMdsett1ListP for searchMap : {}", searchMap);
    	
    	HashMap<String, Object> resultMap = mdsett1Service.getMdsett1ListP(searchMap);
    	
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), resultMap);
    }

    
}
