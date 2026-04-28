package com.koen.kopms_api.task.employee.service.serviceImpl;

import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.koen.kopms_api.common.code.dao.CodeDao;
import com.koen.kopms_api.common.generator.UuidGenerator;
import com.koen.kopms_api.config.i18n.ExceptionMsg;
import com.koen.kopms_api.exception.BizException;
import com.koen.kopms_api.task.dept.dao.DeptDao;
import com.koen.kopms_api.task.employee.dao.EmployeeDao;
import com.koen.kopms_api.task.employee.service.EmployeeService;
import com.koen.kopms_api.task.mdsett1.dao.Mdsett1Dao;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {
	
	@Autowired
	private DeptDao deptDao;	

	@Autowired
	private CodeDao codeDao;
	
	@Autowired
	private EmployeeDao employeeDao;
	
	@Autowired
	private Mdsett1Dao mdsett1Dao;

	// Dept : 트리
	@Override
	public HashMap<String, Object> getDepts(HashMap<String, Object> searchMap) throws Exception {
		
//		log.info("EmployeeServiceImpl - getDepts for searchMap: {}", searchMap);	
		HashMap<String, Object> resultMap = new HashMap<String, Object>();		
		
		// 공통코드 
		List<HashMap<String, Object>> searchCodeList = (List<HashMap<String, Object>>) searchMap.get("comCodes");
		for (int i = 0; i < searchCodeList.size(); i++) {
			HashMap<String, Object> searchCode = searchCodeList.get(i);
			List<HashMap<String, Object>> codeList = codeDao.selectCodeList(searchCode);
			resultMap.put((String) searchCode.get("codeName"), codeList);
		}
		
		// 조직정보 Tree
		List<HashMap<String, Object>> depts = deptDao.selectDepts(searchMap);
		resultMap.put("depts", depts);
		
		return resultMap;
		
	}
	
	// 사원 조히 
	@Override
	public HashMap<String, Object> getEmployee(HashMap<String, Object> searchMap) throws Exception {
		
//		log.info("EmployeeServiceImpl - getEmployee for searchMap: {}", searchMap);	
		HashMap<String, Object> resultMap = new HashMap<String, Object>();		
		
		// 조직정보 Tree
		List<HashMap<String, Object>> employ = employeeDao.selectEmployee(searchMap);
		resultMap.put("employLst", employ);
		
		return resultMap;
		
	}
	
	// 사원 저장 : 평가위원
	@Override
	@Transactional
	public int saveEmploy(HashMap<String, Object> searchMap) throws Exception {
		
		log.info("EmployeeServiceImpl - saveEmploy for searchMap: {}", searchMap);	
				
		/*  
		 *  DB 프록시져 - HANDLE_INSAINFO 참조
		 *  1. EMPLOYEE_EAI -> EMPLOYEE LEFT JOIN
		 *  2. USER_GUBUN='M' 대상만 처리
		 *  3. 퇴직자(EXIST='30') 삭제
		 *  4. 부서 동일 → M : 일반사용자 만 삭제 후 재삽입 
		 *  5. 부서 변경 → A : 시스템관리자, V : 업무관리자, M 전부 삭제
		 *  6. INSERT : 사실상 DELETE 후 INSERT 재생성 구조
		 *  문제점 : EMPLOYEE 의 PK : EMPNO, DEPTNO 인데 EMPNO 만 체크하고 있음.
		 *  
		 *  외부 평가위원 EMPNO 채번 처리 방안 : DB 시퀀스 생성 X, 시퀀스 테이블 생성 X
		 *  1. UUID 사용 (숫자형 8자리 문자) >>>> 채번룰이 있으면 채번룰 적용하면됨
		 *  2. MDSETT1 Insert
		 *  2.1 WST_NUM [관리번호], WST_NUM_SEQ[일련번호] 생성규칙 ???
		 */
		
		HashMap<String, Object> employInfo = (HashMap<String, Object>) searchMap.get("selectedEmploy");
		
		log.info("EmployeeServiceImpl - saveEmploy for employInfo: {}", employInfo);
		
		int employResult = 0;
	    int mdsett1Result = 0;
		
		String empno = (String) employInfo.get("empno");
		String deptGubun = (String) employInfo.get("deptGubun");
		
		// 1. deptGubun == 20 && empno == null : 사번 채번 이후  Employ & MDSETT1 Insert
		// 2. deptGubun == 20 && empno != null : MDSETT1 Insert
		// 3. deptGubun != 20 && empno != null : MDSETT1 Insert
		
		// 1. empno == null && deptGubun = "20" : 임시조직 (남동조직 x)
		if ((empno == null || empno.isEmpty()) && "20".equals(deptGubun)) {

	        int maxRetry = 5;
	        int attempt = 0;
	        boolean inserted = false;

	        while (attempt < maxRetry && !inserted) {

	            try {
	            	// 1.1 empno 채번
	                String newEmpno = UuidGenerator.generate8Digit();
	                employInfo.put("empno", newEmpno);

	                employResult = employeeDao.insertEmploy(employInfo);

	                inserted = true;

	            } catch (DuplicateKeyException e) {
	                attempt++;
	                log.warn("사번 충돌 발생. 재시도 {}", attempt);
	            }
	        }
	        
	        if ( !inserted ) {
	        	return employResult;
	        }
		}
		
		//2. MDSETT1 Insert
		String wstSbn = (String) employInfo.get("empno");

	    int count = mdsett1Dao.countByWstSbn(wstSbn);
	    
	    log.info("EmployeeServiceImpl - count : {}", count);
	    
	    if (count > 0) {
	        throw new BizException(ExceptionMsg.DUP_EVALUATOR);	// 이미 등록된 신청정보입니다.
	    }
	    
		mdsett1Result = mdsett1Dao.insertMdsett1(employInfo);
		
		//return mdsett1Result;
	    return 0;
		
	}
	
	
	

}
