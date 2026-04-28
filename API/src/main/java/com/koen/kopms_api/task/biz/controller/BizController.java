package com.koen.kopms_api.task.biz.controller;

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
import com.koen.kopms_api.task.biz.service.BizService;
import com.koen.kopms_api.task.biz.service.BizStepService;
import com.koen.kopms_api.task.biz.service.BizTaskService;

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
@RequestMapping("/kopms-api/biz")
public class BizController {
	
	@Autowired
	private BizService bizService;

	@Autowired
	private BizStepService bizStepService;
	
	@Autowired
	private BizTaskService bizTaskService;
	
	@Inject
	Provider <SessionContext> sessionProvider;
	
	@Autowired
	private MessageUtil messageUtil;
	
    
    /**
     * 사업목록 코드 조회
     * POST task/biz/codeList
     */
    @PostMapping("/getCodeList")
    public CommonResponse<?> getCodeList(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

    	log.info("BizController - getCodeList for searchMap : {}", searchMap);
    	
    	HashMap<String, Object> responseMap = bizService.getCodeList(searchMap);
		
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    };


    /**
     * 사업 목록 조회
     * POST task/biz/bizList
     */
    @PostMapping("/getBizList")
    public CommonResponse<?> getBizList(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

        // 2. 로그에 어떤 검색 조건이 들어오는지 확인 (나중에 디버깅에 필수!)
        log.info("BizController - getBizList for searchMap : {}", searchMap);    	
        
        // 3. BizService의 목록 조회 메서드 호출
        HashMap<String, Object> responseMap = bizService.getBizList(searchMap);
        
        // 4. 성공 메시지와 함께 데이터 반환
        return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    };
    
    /**
     * 사업별 데이터 조회
     * POST task/biz/bizData
     */
    @PostMapping("/getBizData")
    public CommonResponse<?> getBizData(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

    	log.info("BizController - getBizData for searchMap : {}", searchMap);    	
    	
    	HashMap<String, Object> responseMap = bizStepService.getBizData(searchMap);
    	
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    };
    
    /**
     * 사업별 데이터 저장
     * POST task/biz/code
     */
    @PostMapping("/setBizData")
    public CommonResponse<?> setBizData(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

    	log.info("BizController - setBizData for searchMap : {}", searchMap);    	
    	
    	HashMap<String, Object> responseMap = bizStepService.setBizData(searchMap);
    	
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    };
    
    /**
     * Task코드 조회
     * POST task/biz/taskList
     */
    @PostMapping("/taskList")
    public CommonResponse<?> getTaskList(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

    	log.info("BizController - getTask for searchMap : {}", searchMap);    	
    	
    	HashMap<String, Object> responseMap = bizService.getTaskList(searchMap);
    	
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    };
    
    /**
     * Task코드 저장/수정
     * POST task/biz/setTask
     */
    @PostMapping("/setTask")
    public CommonResponse<?> setTaskCode(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

    	log.info("BizController - setBizData for searchMap : {}", searchMap);    	
    	
    	HashMap<String, Object> responseMap = bizService.setTaskCode(searchMap);
    	
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    };
    
    /**
     * TASK별 데이터 조회
     * POST task/biz/getTaskData
     */
    @PostMapping("/getTaskData")
    public CommonResponse<?> getTaskData(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

    	log.info("BizController - getTaskData for searchMap : {}", searchMap);    	
    	
    	HashMap<String, Object> responseMap = bizTaskService.getTaskData(searchMap);
    	
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    };
    
    /**
     * TASK별 데이터 저장
     * POST task/biz/setTaskData
     */
    @PostMapping("/setTaskData")
    public CommonResponse<?> setTaskData(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

    	log.info("BizController - setTaskData for searchMap : {}", searchMap);    	
    	
    	HashMap<String, Object> responseMap = bizTaskService.setTaskData(searchMap);
    	
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    };
    
    /**
     * 사업단계/상태 수정
     * POST task/biz/setBizStep
     */
    @PostMapping("/setBizStep")
    public CommonResponse<?> setBizStep(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

    	log.info("BizController - setBizData for searchMap : {}", searchMap);    	
    	
    	HashMap<String, Object> responseMap = bizService.setBizStep(searchMap);
    	
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    };
    
    /**
     * 사업 정보 및 관련 데이터 완전 삭제
     * POST task/biz/deleteBizData
     */
    @PostMapping("/deleteBizData")
    public CommonResponse<?> deleteBizData(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

        // 1. 요청 로그 기록 (삭제는 민감한 작업이므로 상세히 남깁니다)
        log.info("BizController - deleteBizData for searchMap : {}", searchMap);    	
        
        // 2. 서비스 호출 (삭제 로직 수행)
        // searchMap에는 삭제할 대상의 masterNo가 반드시 포함되어야 합니다.
        HashMap<String, Object> responseMap = bizService.deleteBizData(searchMap);
        
        // 3. 성공 응답 반환
        return new CommonResponse<HashMap<String, Object>>(
            0, 
            messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), 
            responseMap
        );
    }
    
    /**
     * Biz-Task 조회
     * POST task/biz/bizTaskList
     */
    @PostMapping("/bizTaskList")
    public CommonResponse<?> getBizTaskList(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

    	log.info("BizController - getBizTaskList for searchMap : {}", searchMap);    	
    	
    	HashMap<String, Object> responseMap = bizService.getBizTaskList(searchMap);
    	
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    };
    
    /**
     * Task코드 삭제
     * POST task/biz/deleteTask
     */
    @PostMapping("/deleteTask")
    public CommonResponse<?> deleteTaskCode(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

        log.info("BizController - deleteTaskData for searchMap : {}", searchMap);

        HashMap<String, Object> responseMap = bizService.deleteTaskCode(searchMap);

        return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    };

    /**
     * 사업단계/상태 수정
     * POST task/biz/setTaskItemPeriod
     */
    @PostMapping("/setTaskItemPeriod")
    public CommonResponse<?> setTaskItemPeriod(HttpServletRequest request, @RequestBody HashMap<String, Object> itemTask) throws Exception {

    	log.info("BizController - setTaskItemPeriod for itemTask : {}", itemTask);    	
    
    	HashMap<String, Object> responseMap = bizService.setTaskItemPeriod(itemTask);
    	
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    };
    
    /**
     * 관련데이타 콤보 조회
     * POST task/biz/getBizTaskComboData
     */
    @PostMapping("/getBizTaskComboData")
    public CommonResponse<?> getBizTaskComboData(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

    	log.info("BizController - getBizTaskList for searchMap : {}", searchMap);    	
    	
    	HashMap<String, Object> responseMap = bizService.getBizTaskComboData(searchMap);
    	
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    };
    
    /**
     * 관련데이타 콤보 조회
     * POST task/biz/getRelatedData
     */
    @PostMapping("/getRelatedData")
    public CommonResponse<?> getRelatedData(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

    	log.info("BizController - getBizTaskList for searchMap : {}", searchMap);

    	HashMap<String, Object> responseMap = bizService.getRelatedData(searchMap);

    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    };

    /**
     * 차수 task 추가 (템플릿 task 기준으로 BIZ_TASK + BIZ_PORTAL INSERT)
     * POST task/biz/addChildTask
     */
    @PostMapping("/addChildTask")
    public CommonResponse<?> addChildTask(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

        log.info("BizController - addChildTask for searchMap : {}", searchMap);

        HashMap<String, Object> responseMap = bizTaskService.addChildTask(searchMap);

        return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    };

    /**
     * 자식 task 삭제 (미작성/작성중만 허용)
     * POST task/biz/deleteChildTask
     */
    @PostMapping("/deleteChildTask")
    public CommonResponse<?> deleteChildTask(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

        log.info("BizController - deleteChildTask for searchMap : {}", searchMap);

        HashMap<String, Object> responseMap = bizTaskService.deleteChildTask(searchMap);

        return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    };

    /**
     * BIZ_PORTAL 단건 추가 (일반 task → 포털에 등록)
     * POST task/biz/addPortalTask
     */
    @PostMapping("/addPortalTask")
    public CommonResponse<?> addPortalTask(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

        log.info("BizController - addPortalTask for searchMap : {}", searchMap);

        HashMap<String, Object> responseMap = bizTaskService.addPortalTask(searchMap);

        return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    };
    
    /**
     * BIZ_PORTAL 스케쥴 변경 HISTORY 조회
     * POST task/biz/addPortalTask
     */
    @PostMapping("/getBizTaskPeriodHist")
    public CommonResponse<?> getBizTaskPeriodHist(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

        log.info("BizController - addPortalTask for searchMap : {}", searchMap);

        HashMap<String, Object> responseMap = bizService.getBizTaskPeriodHist(searchMap);

        return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    };

    /**
     * 사업 통계 조회
     * POST /kopms-api/biz/getBizStatistics
     */
    @PostMapping("/getBizStatistics")
    public CommonResponse<?> getBizStatistics(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

        log.info("BizController - getBizStatistics for searchMap : {}", searchMap);

        HashMap<String, Object> responseMap = bizService.getBizStatistics(searchMap);

        return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    };
}
