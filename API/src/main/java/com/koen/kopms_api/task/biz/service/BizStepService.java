package com.koen.kopms_api.task.biz.service;

import java.util.HashMap;

public interface BizStepService {

    // 사업별 단계 데이터 조회
    public HashMap<String, Object> getBizData(HashMap<String, Object> searchMap) throws Exception;

    // 사업별 단계 데이터 저장/수정
    public HashMap<String, Object> setBizData(HashMap<String, Object> searchMap) throws Exception;
}
