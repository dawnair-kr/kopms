package com.koen.kopms_api.task.biz.service;

import java.util.HashMap;

public interface EcoAnlService {

    /** 경제성분석 목록 조회 */
    HashMap<String, Object> getEcoAnlList(HashMap<String, Object> searchMap) throws Exception;

    /** 경제성분석 저장 (INSERT or UPDATE) */
    HashMap<String, Object> saveEcoAnl(HashMap<String, Object> paramMap) throws Exception;

    /** 경제성분석 HISTORY 직접 입력 저장 (경제성 분석 화면 전용) */
    HashMap<String, Object> saveEcoAnlHistory(HashMap<String, Object> paramMap) throws Exception;

    /** 경제성분석 HISTORY 직접 입력 목록 조회 (경제성 분석 화면 조회이력용) */
    HashMap<String, Object> getEcoAnlHistoryDirectList(HashMap<String, Object> searchMap) throws Exception;

    /** 경제성분석 삭제 (본 데이터 + HISTORY 함께 삭제) */
    HashMap<String, Object> deleteEcoAnl(HashMap<String, Object> paramMap) throws Exception;

    /** 경제성분석 HISTORY 버전 목록 조회 */
    HashMap<String, Object> getEcoAnlHistoryList(HashMap<String, Object> searchMap) throws Exception;

    /** 경제성분석 HISTORY 버전별 단건 조회 */
    HashMap<String, Object> getEcoAnlHistoryData(HashMap<String, Object> searchMap) throws Exception;

}
