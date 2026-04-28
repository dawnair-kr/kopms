package com.koen.kopms_api.common.code.controller;

import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.koen.kopms_api.common.code.service.CodeService;
import com.koen.kopms_api.common.response.CommonResponse;
import com.koen.kopms_api.common.util.MessageUtil;
import com.koen.kopms_api.config.i18n.ExceptionMsg;
import com.koen.kopms_api.model.vo.CodeGroupVO;
import com.koen.kopms_api.model.vo.CodeVO;
import com.koen.kopms_api.model.vo.SessionContext;

import jakarta.inject.Inject;
import jakarta.inject.Provider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;


/**
 * 공통 코드 관리 컨트롤러
 * API 명명 규칙: /api/codes
 * "/comm/code"
 */

@Slf4j                  
@RestController
@RequestMapping("/kopms-api/code")
public class CodeController {
	
	@Autowired
	private CodeService codeService;
	
	@Inject
	Provider <SessionContext> sessionProvider;
	
	@Autowired
	private MessageUtil messageUtil;

    /**
     * 그룹 코드조회 : Test
     * GET /api/codes/group/{groupCode}
     */
    @GetMapping("/group/{groupCode}")    
    public List<CodeGroupVO> getCodeGroup(@PathVariable String groupCode) throws Exception {    	
//    	log.info("CodeController - getCodeGroup");
        return codeService.getCodeGroupV(groupCode);
    }
    
    /**
     * 코드 리스트 조회 : Test
     * GET /api/codes/group/{groupCode}
     */
    @GetMapping("/codeList/{groupCode}")    
    public List<CodeVO> getCodeList(@PathVariable String groupCode) throws Exception {    	
//    	log.info("CodeController - getCodeList");
        return codeService.getCodeListV(groupCode);
    }
        
    /**
     * 그룹 코드 조회 : 단건
     * POST comm/code/groupCode
     * @RequestBody가 JSON을 Map으로 자동 변환해줌 (VO 불필요)  ... resultType=CamelHashMap" 전환이 안되네.... resultType="Map" 으로
     * com.koen.kopms_api.common.util 사용으로 해결
     */
    @PostMapping("/groupCode")
    public CommonResponse<?> getGroupCode(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {
    
//    	log.info("CodeController - getGroupCode for searchMap : {}", searchMap);
    	
    	HashMap<String, Object> responseMap = codeService.getGroupCode(searchMap);
    	
		return new CommonResponse<HashMap<String, Object>> (0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    	
    }
    
    /**
     * 그룹 코드 조회 : 다건
     * POST comm/code/groupCodeList
     */
    @PostMapping("/groupCodeList")
    public CommonResponse<?> getGroupCodeList(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {
    
//    	log.info("CodeController - groupCodeList for searchMap : {}", searchMap);
		
    	HashMap<String, Object> responseMap = codeService.getGroupCodeList(searchMap);

		return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    	
    }
    
    /**
     * 코드 조회 : 단건
     * POST comm/code
     */
    @PostMapping("/code")
    public CommonResponse<?> getCode(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

//    	log.info("CodeController - getCode for searchMap : {}", searchMap);    	
    	
    	HashMap<String, Object> responseMap = codeService.getCode(searchMap);
    	
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    }
    
    /**
     * 코드 조회 : 다건
     * POST comm/code/codeList
     */
    @PostMapping("/codeList")
    public CommonResponse<?> getCodeList(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

//    	log.info("CodeController - getCodeList for searchMap : {}", searchMap);
    	
    	HashMap<String, Object> responseMap = codeService.getCodeList(searchMap);
		
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    }
    
    /**
     * 코드 조회 : 그룹별 코드
     * POST comm/code/codeList
     */
    @PostMapping("/groupCodes")
    public CommonResponse<?> getGroupCodes(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

//    	log.info("CodeController - getGroupCodes for searchMap : {}", searchMap);
    	
    	HashMap<String, Object> responseMap = codeService.getGroupCodes(searchMap);
		
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    }
       

    /**
    * 코드 조회 : 페이징 - 참조용
    * POST comm/code/codeList
    */
   @PostMapping("/codePage")
   public CommonResponse<?> getCodePage(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {
	   
//	   log.info("CodeController - getCodePage for searchMap : {}", searchMap);
	   
	   HashMap<String, Object> responseMap = codeService.getCodePage(searchMap);
	   
	   //log.info("CodeController - codePage for responseMap : {}", responseMap);
			
	   return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
   }
    

    

    
}
