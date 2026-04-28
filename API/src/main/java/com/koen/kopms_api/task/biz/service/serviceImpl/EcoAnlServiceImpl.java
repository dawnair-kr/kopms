package com.koen.kopms_api.task.biz.service.serviceImpl;

import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.koen.kopms_api.model.vo.SessionContext;
import com.koen.kopms_api.task.biz.dao.EcoAnlDao;
import com.koen.kopms_api.task.biz.service.EcoAnlService;

import jakarta.inject.Provider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EcoAnlServiceImpl implements EcoAnlService {

    @Autowired
    private EcoAnlDao ecoAnlDao;
    private final Provider<SessionContext> sessionProvider;

    // =========================================================
    // 경제성분석 목록 조회
    // =========================================================

    @Override
    public HashMap<String, Object> getEcoAnlList(HashMap<String, Object> searchMap) throws Exception {

        log.info("EcoAnlServiceImpl - getEcoAnlList: {}", searchMap);

        List<HashMap<String, Object>> list = ecoAnlDao.selectEcoAnlList(searchMap);

        HashMap<String, Object> result = new HashMap<>();
        result.put("list", list);
        return result;
    }

    // =========================================================
    // 경제성분석 저장 (INSERT or UPDATE) + HISTORY 이력 적재
    // =========================================================

    @Override
    @Transactional
    public HashMap<String, Object> saveEcoAnl(HashMap<String, Object> paramMap) throws Exception {

        log.info("EcoAnlServiceImpl - saveEcoAnl: {}", paramMap);

        SessionContext session = sessionProvider.get();
        String empno = session.getEmpno();

        HashMap<String, Object> result = new HashMap<>();
        Object anlSeqObj = paramMap.get("anlSeq");

        if (anlSeqObj == null || anlSeqObj.toString().isEmpty() || "0".equals(anlSeqObj.toString())) {
            // INSERT
            paramMap.put("inwriterId", empno);
            ecoAnlDao.insertEcoAnl(paramMap);
            result.put("anlSeq", paramMap.get("anlSeq"));
            result.put("mode", "insert");
        } else {
            // UPDATE
            paramMap.put("upwriterId", empno);
            ecoAnlDao.updateEcoAnl(paramMap);
            result.put("anlSeq", anlSeqObj);
            result.put("mode", "update");
        }

        result.put("success", true);
        return result;
    }

    // =========================================================
    // 경제성분석 삭제 (본 데이터 + HISTORY 함께 삭제)
    // =========================================================

    @Override
    @Transactional
    public HashMap<String, Object> deleteEcoAnl(HashMap<String, Object> paramMap) throws Exception {

        log.info("EcoAnlServiceImpl - deleteEcoAnl: {}", paramMap);

        ecoAnlDao.deleteEcoAnl(paramMap);

        HashMap<String, Object> result = new HashMap<>();
        result.put("success", true);
        return result;
    }

    // =========================================================
    // 경제성분석 HISTORY 직접 입력 저장 (경제성 분석 화면 전용)
    // =========================================================

    @Override
    @Transactional
    public HashMap<String, Object> saveEcoAnlHistory(HashMap<String, Object> paramMap) throws Exception {

        log.info("EcoAnlServiceImpl - saveEcoAnlHistory: {}", paramMap);

        SessionContext session = sessionProvider.get();
        paramMap.put("inwriterId", session.getEmpno());

        ecoAnlDao.insertEcoAnlHistory(paramMap);

        HashMap<String, Object> result = new HashMap<>();
        result.put("anlSeq", paramMap.get("anlSeq"));
        result.put("success", true);
        return result;
    }

    // =========================================================
    // 경제성분석 HISTORY 직접 입력 목록 조회 (경제성 분석 화면 조회이력용)
    // =========================================================

    @Override
    public HashMap<String, Object> getEcoAnlHistoryDirectList(HashMap<String, Object> searchMap) throws Exception {

        log.info("EcoAnlServiceImpl - getEcoAnlHistoryDirectList: {}", searchMap);

        List<HashMap<String, Object>> list = ecoAnlDao.selectEcoAnlHistoryDirectList(searchMap);

        HashMap<String, Object> result = new HashMap<>();
        result.put("list", list);
        return result;
    }

    // =========================================================
    // 경제성분석 HISTORY 버전 목록 조회
    // =========================================================

    @Override
    public HashMap<String, Object> getEcoAnlHistoryList(HashMap<String, Object> searchMap) throws Exception {

        log.info("EcoAnlServiceImpl - getEcoAnlHistoryList: {}", searchMap);

        List<HashMap<String, Object>> list = ecoAnlDao.selectEcoAnlHistoryList(searchMap);

        HashMap<String, Object> result = new HashMap<>();
        result.put("list", list);
        return result;
    }

    // =========================================================
    // 경제성분석 HISTORY 버전별 단건 조회
    // =========================================================

    @Override
    public HashMap<String, Object> getEcoAnlHistoryData(HashMap<String, Object> searchMap) throws Exception {

        log.info("EcoAnlServiceImpl - getEcoAnlHistoryData: {}", searchMap);

        HashMap<String, Object> data = ecoAnlDao.selectEcoAnlHistoryData(searchMap);

        HashMap<String, Object> result = new HashMap<>();
        result.put("data", data);
        return result;
    }

}
