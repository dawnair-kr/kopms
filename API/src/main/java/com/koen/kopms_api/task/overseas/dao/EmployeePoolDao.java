package com.koen.kopms_api.task.overseas.dao;

import org.apache.ibatis.annotations.Mapper;
import java.util.HashMap;
import java.util.List;

@Mapper
public interface EmployeePoolDao {

    // =========================================================
    // 해외 SPC 인력 Pool / 파견인원 목록
    // =========================================================

    /** 해외 SPC 인력 Pool 목록 (EMPLOYEE_SPC, 파견기간 포맷 포함) */
    List<HashMap<String, Object>> selectEmployeeSpcList(HashMap<String, Object> params) throws Exception;

    /** 파견인원 목록 (EMPLOYEE_SEND + DEPT_BM, GUBUN 20/30) */
    List<HashMap<String, Object>> selectEmployeeSendList(HashMap<String, Object> params) throws Exception;


    // =========================================================
    // 부서별 인원 조회
    // =========================================================

    /** 부서별 전체 인원 목록 (EMPLOYEE_POOL) */
    List<HashMap<String, Object>> selectEmployeePoolByDept(HashMap<String, Object> params) throws Exception;

    /** 부서별 전출/파견 인원 목록 (EMPLOYEE_POOL, GUBUN 20/30) */
    List<HashMap<String, Object>> selectEmployeePoolSendByDept(HashMap<String, Object> params) throws Exception;


    // =========================================================
    // 부서별 인원수 피벗
    // =========================================================

    /** 부서별 전체 인원수 피벗 */
    HashMap<String, Object> selectEmployeeDeptCount(HashMap<String, Object> params) throws Exception;

    /** 부서별 파견인원수 피벗 (GUBUN 20/30) */
    HashMap<String, Object> selectEmployeeSendDeptCount(HashMap<String, Object> params) throws Exception;


    // =========================================================
    // 단건 조회 / 등록 / 수정 / 검증
    // =========================================================

    /** 인원 단건 조회 */
    HashMap<String, Object> selectEmployeeOne(HashMap<String, Object> params) throws Exception;

    /** 인원 등록 (INSA_EMP_TBL@WEBADM 에서 사번 기반 자동 조회 후 INSERT) */
    int insertEmployee(HashMap<String, Object> params) throws Exception;

    /** 외부/파견 인원 수정 */
    int updateEmployee(HashMap<String, Object> params) throws Exception;

    /** 인원 중복 확인 */
    int checkEmployeeExists(HashMap<String, Object> params) throws Exception;
}
