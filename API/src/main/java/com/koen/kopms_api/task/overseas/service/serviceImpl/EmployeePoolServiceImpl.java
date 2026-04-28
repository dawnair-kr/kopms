package com.koen.kopms_api.task.overseas.service.serviceImpl;

import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.koen.kopms_api.task.overseas.dao.EmployeePoolDao;
import com.koen.kopms_api.task.overseas.service.EmployeePoolService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EmployeePoolServiceImpl implements EmployeePoolService {

    @Autowired
    private EmployeePoolDao employeePoolDao;

    // =====================================================================
    // [1] 해외 SPC 인력 Pool 목록
    // =====================================================================

    @Override
    public HashMap<String, Object> getEmployeeSpcList(HashMap<String, Object> params) throws Exception {
        log.info("EmployeeServiceImpl - getEmployeeSpcList: {}", params);
        List<HashMap<String, Object>> list = employeePoolDao.selectEmployeeSpcList(params);
        HashMap<String, Object> result = new HashMap<>();
        result.put("employeeList", list);
        return result;
    }

    // =====================================================================
    // [2] 파견인원 목록
    // =====================================================================

    @Override
    public HashMap<String, Object> getEmployeeSendList(HashMap<String, Object> params) throws Exception {
        log.info("EmployeeServiceImpl - getEmployeeSendList: {}", params);
        List<HashMap<String, Object>> list = employeePoolDao.selectEmployeeSendList(params);
        HashMap<String, Object> result = new HashMap<>();
        result.put("employeeList", list);
        return result;
    }

    // =====================================================================
    // [3] 부서별 인원 목록
    // =====================================================================

    @Override
    public HashMap<String, Object> getEmployeePoolByDept(HashMap<String, Object> params) throws Exception {
        log.info("EmployeeServiceImpl - getEmployeePoolByDept: {}", params);
        List<HashMap<String, Object>> list = employeePoolDao.selectEmployeePoolByDept(params);
        HashMap<String, Object> result = new HashMap<>();
        result.put("employeeList", list);
        return result;
    }

    // =====================================================================
    // [4] 부서별 전출/파견 인원 목록
    // =====================================================================

    @Override
    public HashMap<String, Object> getEmployeePoolSendByDept(HashMap<String, Object> params) throws Exception {
        log.info("EmployeeServiceImpl - getEmployeePoolSendByDept: {}", params);
        List<HashMap<String, Object>> list = employeePoolDao.selectEmployeePoolSendByDept(params);
        HashMap<String, Object> result = new HashMap<>();
        result.put("employeeList", list);
        return result;
    }

    // =====================================================================
    // [5] 부서별 인원수 피벗
    // =====================================================================

    @Override
    public HashMap<String, Object> getEmployeeDeptCount(HashMap<String, Object> params) throws Exception {
        log.info("EmployeeServiceImpl - getEmployeeDeptCount: {}", params);
        HashMap<String, Object> countData = employeePoolDao.selectEmployeeDeptCount(params);
        HashMap<String, Object> result = new HashMap<>();
        result.put("deptCount", countData);
        return result;
    }

    // =====================================================================
    // [6] 부서별 파견인원수 피벗
    // =====================================================================

    @Override
    public HashMap<String, Object> getEmployeeSendDeptCount(HashMap<String, Object> params) throws Exception {
        log.info("EmployeeServiceImpl - getEmployeeSendDeptCount: {}", params);
        HashMap<String, Object> countData = employeePoolDao.selectEmployeeSendDeptCount(params);
        HashMap<String, Object> result = new HashMap<>();
        result.put("deptCount", countData);
        return result;
    }

    // =====================================================================
    // [7] 인원 단건 조회
    // =====================================================================

    @Override
    public HashMap<String, Object> getEmployeeOne(HashMap<String, Object> params) throws Exception {
        log.info("EmployeeServiceImpl - getEmployeeOne: {}", params);
        HashMap<String, Object> employee = employeePoolDao.selectEmployeeOne(params);
        HashMap<String, Object> result = new HashMap<>();
        result.put("employee", employee);
        return result;
    }

    // =====================================================================
    // [8] 인원 등록
    // =====================================================================

    @Override
    public HashMap<String, Object> saveEmployee(HashMap<String, Object> params) throws Exception {
        log.info("EmployeeServiceImpl - saveEmployee: {}", params);

        if (employeePoolDao.checkEmployeeExists(params) > 0) {
            HashMap<String, Object> result = new HashMap<>();
            result.put("status", "duplicate");
            result.put("message", "이미 등록된 인원입니다.");
            return result;
        }

        int affected = employeePoolDao.insertEmployee(params);
        HashMap<String, Object> result = new HashMap<>();
        result.put("status", affected > 0 ? "success" : "fail");
        return result;
    }

    // =====================================================================
    // [9] 인원 수정
    // =====================================================================

    @Override
    public HashMap<String, Object> modifyEmployee(HashMap<String, Object> params) throws Exception {
        log.info("EmployeeServiceImpl - modifyEmployee: {}", params);
        int affected = employeePoolDao.updateEmployee(params);
        HashMap<String, Object> result = new HashMap<>();
        result.put("status", affected > 0 ? "success" : "fail");
        return result;
    }
}
