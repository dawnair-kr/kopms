package com.koen.kopms_api.task.mdsett1.service.serviceImpl;

import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.koen.kopms_api.task.mdsett1.dao.Mdsett1Dao;
import com.koen.kopms_api.task.mdsett1.service.Mdsett1Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class Mdsett1ServiceImpl implements Mdsett1Service {
	
	@Autowired
	private Mdsett1Dao mdsett1Dao;

	// LoginHistory
	@Override
	public HashMap<String, Object> getMdsett1ListP(HashMap<String, Object> searchMap) throws Exception {
		
		log.info("Mdsett1ServiceImpl - getMdsett1ListP for searchMap: {}", searchMap);	

		List<HashMap<String, Object>> mdsetLisP = mdsett1Dao.selectMdsett1ListP(searchMap);
		
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("mdsetLisP", mdsetLisP);
		
		return resultMap;
	}
	
	

}
