package com.koen.kopms_api.task.overseas.controller;

import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.koen.kopms_api.common.response.CommonResponse;
import com.koen.kopms_api.common.util.MessageUtil;
import com.koen.kopms_api.config.i18n.ExceptionMsg;
import com.koen.kopms_api.task.overseas.service.EmployeePoolService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/kopms-api/overseas")
public class EmployeePoolController {

    @Autowired
    private EmployeePoolService employeeService;

    @Autowired
    private MessageUtil messageUtil;

    /** 해외 SPC 인력 Pool 목록 조회 */
    @PostMapping("/getEmployeeSpcList")
    public CommonResponse<?> getEmployeeSpcList(HttpServletRequest request,
            @RequestBody HashMap<String, Object> params) throws Exception {
        log.info("EmployeeController - getEmployeeSpcList: {}", params);
        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY),
                employeeService.getEmployeeSpcList(params));
    }

    /** 파견인원 목록 조회 */
    @PostMapping("/getEmployeeSendList")
    public CommonResponse<?> getEmployeeSendList(HttpServletRequest request,
            @RequestBody HashMap<String, Object> params) throws Exception {
        log.info("EmployeeController - getEmployeeSendList: {}", params);
        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY),
                employeeService.getEmployeeSendList(params));
    }

    /** 부서별 인원 목록 조회 */
    @PostMapping("/getEmployeePoolByDept")
    public CommonResponse<?> getEmployeePoolByDept(HttpServletRequest request,
            @RequestBody HashMap<String, Object> params) throws Exception {
        log.info("EmployeeController - getEmployeePoolByDept: {}", params);
        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY),
                employeeService.getEmployeePoolByDept(params));
    }

    /** 부서별 전출/파견 인원 목록 조회 */
    @PostMapping("/getEmployeePoolSendByDept")
    public CommonResponse<?> getEmployeePoolSendByDept(HttpServletRequest request,
            @RequestBody HashMap<String, Object> params) throws Exception {
        log.info("EmployeeController - getEmployeePoolSendByDept: {}", params);
        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY),
                employeeService.getEmployeePoolSendByDept(params));
    }

    /** 부서별 인원수 피벗 조회 */
    @PostMapping("/getEmployeeDeptCount")
    public CommonResponse<?> getEmployeeDeptCount(HttpServletRequest request,
            @RequestBody HashMap<String, Object> params) throws Exception {
        log.info("EmployeeController - getEmployeeDeptCount: {}", params);
        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY),
                employeeService.getEmployeeDeptCount(params));
    }

    /** 부서별 파견인원수 피벗 조회 */
    @PostMapping("/getEmployeeSendDeptCount")
    public CommonResponse<?> getEmployeeSendDeptCount(HttpServletRequest request,
            @RequestBody HashMap<String, Object> params) throws Exception {
        log.info("EmployeeController - getEmployeeSendDeptCount: {}", params);
        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY),
                employeeService.getEmployeeSendDeptCount(params));
    }

    /** 인원 단건 조회 */
    @PostMapping("/getEmployeeOne")
    public CommonResponse<?> getEmployeeOne(HttpServletRequest request,
            @RequestBody HashMap<String, Object> params) throws Exception {
        log.info("EmployeeController - getEmployeeOne: {}", params);
        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY),
                employeeService.getEmployeeOne(params));
    }

    /** 인원 등록 */
    @PostMapping("/saveEmployee")
    public CommonResponse<?> saveEmployee(HttpServletRequest request,
            @RequestBody HashMap<String, Object> params) throws Exception {
        log.info("EmployeeController - saveEmployee: {}", params);
        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY),
                employeeService.saveEmployee(params));
    }

    /** 인원 수정 */
    @PostMapping("/modifyEmployee")
    public CommonResponse<?> modifyEmployee(HttpServletRequest request,
            @RequestBody HashMap<String, Object> params) throws Exception {
        log.info("EmployeeController - modifyEmployee: {}", params);
        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY),
                employeeService.modifyEmployee(params));
    }
}
