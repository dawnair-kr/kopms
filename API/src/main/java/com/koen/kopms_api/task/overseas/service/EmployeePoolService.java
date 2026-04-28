package com.koen.kopms_api.task.overseas.service;

import java.util.HashMap;

public interface EmployeePoolService {

    /** 해외 SPC 인력 Pool 목록 조회 */
    HashMap<String, Object> getEmployeeSpcList(HashMap<String, Object> params) throws Exception;

    /** 파견인원 목록 조회 */
    HashMap<String, Object> getEmployeeSendList(HashMap<String, Object> params) throws Exception;

    /** 부서별 인원 목록 조회 */
    HashMap<String, Object> getEmployeePoolByDept(HashMap<String, Object> params) throws Exception;

    /** 부서별 전출/파견 인원 목록 조회 */
    HashMap<String, Object> getEmployeePoolSendByDept(HashMap<String, Object> params) throws Exception;

    /** 부서별 인원수 피벗 조회 */
    HashMap<String, Object> getEmployeeDeptCount(HashMap<String, Object> params) throws Exception;

    /** 부서별 파견인원수 피벗 조회 */
    HashMap<String, Object> getEmployeeSendDeptCount(HashMap<String, Object> params) throws Exception;

    /** 인원 단건 조회 */
    HashMap<String, Object> getEmployeeOne(HashMap<String, Object> params) throws Exception;

    /** 인원 등록 */
    HashMap<String, Object> saveEmployee(HashMap<String, Object> params) throws Exception;

    /** 인원 수정 */
    HashMap<String, Object> modifyEmployee(HashMap<String, Object> params) throws Exception;
}
