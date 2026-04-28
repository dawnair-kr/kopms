package com.koen.kopms_api.task.nbm.controller;

import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.koen.kopms_api.common.response.CommonResponse;
import com.koen.kopms_api.common.util.MessageUtil;
import com.koen.kopms_api.config.i18n.ExceptionMsg;
import com.koen.kopms_api.task.nbm.service.NbmService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

/**
 * 사업운영(NBM) 컨트롤러
 * API prefix: /nbm
 */
@Slf4j
@RestController
@RequestMapping("/kopms-api/nbm")
public class NbmController {

    @Autowired
    private NbmService nbmService;

    @Autowired
    private MessageUtil messageUtil;

    /**
     * 공통코드 조회
     * POST /nbm/getCodeList
     */
    @PostMapping("/getCodeList")
    public CommonResponse<?> getCodeList(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {
        log.info("NbmController - getCodeList : {}", searchMap);
        HashMap<String, Object> responseMap = nbmService.getCodeList(searchMap);
        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    }

    /**
     * 운영사업 목록 조회
     * POST /nbm/getNbmList
     */
    @PostMapping("/getNbmList")
    public CommonResponse<?> getNbmList(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {
        log.info("NbmController - getNbmList : {}", searchMap);
        HashMap<String, Object> responseMap = nbmService.getNbmList(searchMap);
        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    }

    /**
     * 운영사업 상세 조회
     * POST /nbm/getNbmDetail
     */
    @PostMapping("/getNbmDetail")
    public CommonResponse<?> getNbmDetail(HttpServletRequest request,
                                           @RequestBody HashMap<String, Object> searchMap) throws Exception {
        log.info("NbmController - getNbmDetail : {}", searchMap);
        HashMap<String, Object> responseMap = nbmService.getNbmDetail(searchMap);
        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    }

    /**
     * 운영사업 저장 (등록 / 수정)
     * POST /nbm/saveNbm
     */
    @PostMapping("/saveNbm")
    public CommonResponse<?> saveNbm(HttpServletRequest request, @RequestBody HashMap<String, Object> saveMap) throws Exception {
        log.info("NbmController - saveNbm : masterNo={}", saveMap.get("masterNo"));
        HashMap<String, Object> responseMap = nbmService.saveNbm(saveMap);
        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    }

    /**
     * 운영사업 삭제
     * POST /nbm/deleteNbm
     */
    @PostMapping("/deleteNbm")
    public CommonResponse<?> deleteNbm(HttpServletRequest request, @RequestBody HashMap<String, Object> deleteMap) throws Exception {
        log.info("NbmController - deleteNbm : masterNo={}", deleteMap.get("masterNo"));
        nbmService.deleteNbm(deleteMap);
        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), null);
    }

    /**
     * 출자현황 목록 조회
     * POST /nbm/getInvestmentList
     */
    @PostMapping("/getInvestmentList")
    public CommonResponse<?> getInvestmentList(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {
        log.info("NbmController - getInvestmentList : {}", searchMap);
        HashMap<String, Object> responseMap = nbmService.getInvestmentList(searchMap);
        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    }

    /**
     * 회사관리 목록 조회
     * POST /nbm/getCompanyList
     */
    @PostMapping("/getCompanyList")
    public CommonResponse<?> getCompanyList(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {
        log.info("NbmController - getCompanyList : {}", searchMap);
        HashMap<String, Object> responseMap = nbmService.getCompanyList(searchMap);
        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    }

    /**
     * 회사 등록/수정
     * POST /nbm/saveCompany
     */
    @PostMapping("/saveCompany")
    public CommonResponse<?> saveCompany(HttpServletRequest request, @RequestBody HashMap<String, Object> saveMap) throws Exception {
        log.info("NbmController - saveCompany : companyCode={}", saveMap.get("companyCode"));
        HashMap<String, Object> responseMap = nbmService.saveCompany(saveMap);
        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    }

    /**
     * 회사 삭제
     * POST /nbm/deleteCompany
     */
    @PostMapping("/deleteCompany")
    public CommonResponse<?> deleteCompany(HttpServletRequest request, @RequestBody HashMap<String, Object> deleteMap) throws Exception {
        log.info("NbmController - deleteCompany : companyCode={}", deleteMap.get("companyCode"));
        nbmService.deleteCompany(deleteMap);
        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), null);
    }

    /**
     * 조달현황 - 출자금 목록 조회
     * POST /nbm/getProcurementInvestList
     */
    @PostMapping("/getProcurementInvestList")
    public CommonResponse<?> getProcurementInvestList(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {
        log.info("NbmController - getProcurementInvestList : {}", searchMap);
        HashMap<String, Object> responseMap = nbmService.getProcurementInvestList(searchMap);
        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    }

    /**
     * 조달현황 - PF대출상환 목록 조회
     * POST /nbm/getProcurementPfList
     */
    @PostMapping("/getProcurementPfList")
    public CommonResponse<?> getProcurementPfList(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {
        log.info("NbmController - getProcurementPfList : {}", searchMap);
        HashMap<String, Object> responseMap = nbmService.getProcurementPfList(searchMap);
        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    }
}
