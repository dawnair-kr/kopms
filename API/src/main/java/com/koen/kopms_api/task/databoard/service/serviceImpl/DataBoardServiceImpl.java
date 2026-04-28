package com.koen.kopms_api.task.databoard.service.serviceImpl;

import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.koen.kopms_api.common.code.dao.CodeDao;
import com.koen.kopms_api.task.databoard.dao.DataBoardDao;
import com.koen.kopms_api.task.databoard.service.DataBoardService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataBoardServiceImpl implements DataBoardService {
	
	@Autowired
	private DataBoardDao dataBoardDao;	

	@Autowired
	private CodeDao codeDao;	// MyBatis Mapper 인터페이스

	// 자료실 카테고리 : 트리 
	@Override
	public HashMap<String, Object> getDataBoardTree(HashMap<String, Object> searchMap) throws Exception {
		
		log.info("DataBoardServiceImpl - getDataBoardTree for searchMap: {}", searchMap);	
		HashMap<String, Object> resultMap = new HashMap<String, Object>();		
		
		List<HashMap<String, Object>> dataBoardTree = dataBoardDao.selectDataBoardTree(searchMap);
		resultMap.put("dataBoardTree", dataBoardTree);
		
		return resultMap;
		
	}
	
	// 자료실 페이징
	@Override
	public HashMap<String, Object> getDataBoard(HashMap<String, Object> searchMap) throws Exception {
		
		List<HashMap<String, Object>> boardList = dataBoardDao.selectDataBoard(searchMap);
		
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("boardList", boardList);
		return resultMap;
	}

//	// 권한 목록 조회 (Authority 조회 화면용)
//	@Override
//	public HashMap<String, Object> getAuthorityList(HashMap<String, Object> searchMap) throws Exception {
//		List<HashMap<String, Object>> list = deptDao.selectAuthorityList(searchMap);
//		HashMap<String, Object> resultMap = new HashMap<String, Object>();
//		resultMap.put("list", list);
//		return resultMap;
//	}
//
//	// 부서 메뉴 권한 저장
//	@Override
//	@Transactional
//	@SuppressWarnings("unchecked")
//	public void saveDeptMenus(HashMap<String, Object> searchMap) throws Exception {
//
//		log.info("DeptServiceImpl - saveDeptMenus for searchMap: {}", searchMap);
//
//		// 1단계: 해당 부서 전체 메뉴 권한 비활성화 (USE_YN = 'N')
//		//        → INWRITER_ID, REGI_DATE 등 최초 등록 정보 보존
//		deptDao.updateDeptMenusToInactive(searchMap);
//
//		// 2단계: 신규 목록 MERGE
//		//        기존 레코드 → USE_YN='Y' + 수정자/일시 갱신
//		//        신규 레코드 → INSERT
//		//        menuList가 비어있으면 전 단계에서 비활성화한 채로 종료
//		List<HashMap<String, Object>> menuList = (List<HashMap<String, Object>>) searchMap.get("menuList");
//		if (menuList != null && !menuList.isEmpty()) {
//			deptDao.mergeDeptMenus(searchMap);
//		}
//	}
//
//	// 조직정보 저장
//	@Override
//	@Transactional
//	@SuppressWarnings("unchecked")
//	public int saveDept(HashMap<String, Object> searchMap) throws Exception {
//		
////		log.info("DeptServiceImpl - saveDept for searchMap: {}", searchMap);	
//		
//		HashMap<String, Object> deptInfo = (HashMap<String, Object>) searchMap.get("selectedDept");
//		
////		log.info("DeptServiceImpl - saveDept for deptInfo: {}", deptInfo);
//		
//		int result = 0;
//		result = deptDao.upsertDept(deptInfo);
//		return result;
//		
//	}
}
