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
import com.koen.kopms_api.task.biz.service.EcoAnlService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

/**
 * 경제성분석 컨트롤러
 * API base: /ecoAnl
 */
@Slf4j
@RestController
@RequestMapping("/kopms-api/ecoAnl")
public class EcoAnlController {

    @Autowired
    private EcoAnlService ecoAnlService;

    @Autowired
    private MessageUtil messageUtil;

    /**
     * 경제성분석 목록 조회
     * POST /ecoAnl/list
     * param: energySrc (에너지원), bizTitle (사업명, 선택)
     */
    @PostMapping("/list")
    public CommonResponse<?> getEcoAnlList(HttpServletRequest request,
                                           @RequestBody HashMap<String, Object> searchMap) throws Exception {

        log.info("EcoAnlController - getEcoAnlList: {}", searchMap);
        HashMap<String, Object> result = ecoAnlService.getEcoAnlList(searchMap);
        return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), result);
    }

    /**
     * 경제성분석 저장 (신규/수정)
     * POST /ecoAnl/save
     * param: anlSeq (수정 시), bizTitle, energySrc, standDate, 각종 수치값, attachFileSeq
     */
    @PostMapping("/save")
    public CommonResponse<?> saveEcoAnl(HttpServletRequest request,
                                        @RequestBody HashMap<String, Object> paramMap) throws Exception {
        log.info("EcoAnlController - saveEcoAnl: {}", paramMap);
        HashMap<String, Object> result = ecoAnlService.saveEcoAnl(paramMap);
        return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), result);
    }

    /**
     * 경제성분석 삭제
     * POST /ecoAnl/delete
     * param: anlSeq
     */
    @PostMapping("/delete")
    public CommonResponse<?> deleteEcoAnl(HttpServletRequest request,
                                          @RequestBody HashMap<String, Object> paramMap) throws Exception {
        log.info("EcoAnlController - deleteEcoAnl: {}", paramMap);
        HashMap<String, Object> result = ecoAnlService.deleteEcoAnl(paramMap);
        return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), result);
    }

    /**
     * 경제성분석 HISTORY 직접 입력 저장 (경제성 분석 화면 전용)
     * POST /ecoAnl/saveHistory
     * param: bizTitle, energySrc, standDate, 각종 수치값
     */
    @PostMapping("/saveHistory")
    public CommonResponse<?> saveEcoAnlHistory(HttpServletRequest request,
                                               @RequestBody HashMap<String, Object> paramMap) throws Exception {
        log.info("EcoAnlController - saveEcoAnlHistory: {}", paramMap);
        HashMap<String, Object> result = ecoAnlService.saveEcoAnlHistory(paramMap);
        return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), result);
    }

    /**
     * 경제성분석 HISTORY 직접 입력 목록 조회 (경제성 분석 화면 조회이력용)
     * POST /ecoAnl/historyDirectList
     * param: energySrc
     */
    @PostMapping("/historyDirectList")
    public CommonResponse<?> getEcoAnlHistoryDirectList(HttpServletRequest request,
                                                        @RequestBody HashMap<String, Object> searchMap) throws Exception {
        log.info("EcoAnlController - getEcoAnlHistoryDirectList: {}", searchMap);
        HashMap<String, Object> result = ecoAnlService.getEcoAnlHistoryDirectList(searchMap);
        return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), result);
    }

    /**
     * 경제성분석 HISTORY 버전 목록 조회
     * POST /ecoAnl/historyList
     * param: anlSeq
     */
    @PostMapping("/historyList")
    public CommonResponse<?> getEcoAnlHistoryList(HttpServletRequest request,
                                                   @RequestBody HashMap<String, Object> searchMap) throws Exception {
        log.info("EcoAnlController - getEcoAnlHistoryList: {}", searchMap);
        HashMap<String, Object> result = ecoAnlService.getEcoAnlHistoryList(searchMap);
        return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), result);
    }

    /**
     * 경제성분석 HISTORY 버전별 단건 조회
     * POST /ecoAnl/historyData
     * param: anlSeq, version
     */
    @PostMapping("/historyData")
    public CommonResponse<?> getEcoAnlHistoryData(HttpServletRequest request,
                                                   @RequestBody HashMap<String, Object> searchMap) throws Exception {
        log.info("EcoAnlController - getEcoAnlHistoryData: {}", searchMap);
        HashMap<String, Object> result = ecoAnlService.getEcoAnlHistoryData(searchMap);
        return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), result);
    }

}
