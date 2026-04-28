package com.koen.kopms_api.task.biz.service;

import java.util.HashMap;

public interface BizTaskService {
	
	// TASK별 단계 데이터 조회
    public HashMap<String, Object> getTaskData(HashMap<String, Object> searchMap) throws Exception;

    // TASK별 데이터 저장/수정
    public HashMap<String, Object> setTaskData(HashMap<String, Object> searchMap) throws Exception;

    // 차수 task 추가 (BIZ_TASK + BIZ_PORTAL INSERT)
    public HashMap<String, Object> addChildTask(HashMap<String, Object> searchMap) throws Exception;

    // BIZ_PORTAL 단건 추가 (일반 task → 포털에 등록)
    public HashMap<String, Object> addPortalTask(HashMap<String, Object> searchMap) throws Exception;

    // 자식 task 삭제 (미작성/작성중만 허용)
    public HashMap<String, Object> deleteChildTask(HashMap<String, Object> param) throws Exception;
}
