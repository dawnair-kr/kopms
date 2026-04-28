package com.koen.kopms_api.task.biz.dao;

import java.util.HashMap;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface EcoAnlDao {

    /** 경제성분석 목록 조회 (에너지원/사업명 필터) */
    List<HashMap<String, Object>> selectEcoAnlList(HashMap<String, Object> searchMap) throws Exception;

    /** 경제성분석 단건 조회 */
    HashMap<String, Object> selectEcoAnlData(HashMap<String, Object> searchMap) throws Exception;

    /** 경제성분석 등록 (ANL_SEQ MAX+1 채번) */
    int insertEcoAnl(HashMap<String, Object> paramMap) throws Exception;

    /** 경제성분석 수정 */
    int updateEcoAnl(HashMap<String, Object> paramMap) throws Exception;

    /** 경제성분석 삭제 */
    int deleteEcoAnl(HashMap<String, Object> paramMap) throws Exception;

    /** 경제성분석 HISTORY 직접 입력 적재 (경제성 분석 화면 전용) */
    int insertEcoAnlHistory(HashMap<String, Object> paramMap) throws Exception;

    /** 경제성분석 HISTORY 직접 입력 목록 조회 (경제성 분석 화면 조회이력용) */
    List<HashMap<String, Object>> selectEcoAnlHistoryDirectList(HashMap<String, Object> searchMap) throws Exception;

    /** 경제성분석 HISTORY 버전 목록 조회 */
    List<HashMap<String, Object>> selectEcoAnlHistoryList(HashMap<String, Object> searchMap) throws Exception;

    /** 경제성분석 HISTORY 버전별 단건 조회 */
    HashMap<String, Object> selectEcoAnlHistoryData(HashMap<String, Object> searchMap) throws Exception;

    /** 경제성분석 HISTORY 삭제 (본 데이터 삭제 시 함께 삭제) */
    int deleteEcoAnlHistory(HashMap<String, Object> paramMap) throws Exception;

}
