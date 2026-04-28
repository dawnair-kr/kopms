package com.koen.kopms_api.task.biz.service.serviceImpl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.koen.kopms_api.model.vo.SessionContext;
import com.koen.kopms_api.task.biz.dao.BizDao;
import com.koen.kopms_api.task.biz.service.BizService;

import jakarta.inject.Provider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// =====================================================================
// [1] 클래스 선언 및 의존성 주입
// =====================================================================
// @Slf4j              : log 필드 자동 생성 (SLF4J 기반 로깅)
// @Service            : Spring 빈 등록 (서비스 레이어 컴포넌트)
// @RequiredArgsConstructor : final 필드(sessionProvider) 생성자 주입 자동 생성
// @Autowired BizDao   : MyBatis 매퍼 인터페이스이므로 필드 주입 사용
// Provider<SessionContext> : 요청 스코프 빈 지연 조회 —
//   서비스는 싱글턴, SessionContext는 요청 스코프이므로 직접 주입 불가
//   Provider.get()으로 요청 시점에 조회
// =====================================================================
@Slf4j
@Service
@RequiredArgsConstructor
public class BizServiceImpl implements BizService {

    @Autowired
    private BizDao bizDao;
    private final Provider<SessionContext> sessionProvider;

    // =====================================================================
    // [2] 상수 정의
    // =====================================================================

    // D80, D90: 포털 화면에 노출하지 않는 내부용 태스크 코드 — 조회/저장 시 항상 제외
    private static final List<String> EXCLUDED_TASK_CODES = List.of("D80", "D90");

    // =====================================================================
    // [3] 사업목록 코드 조회
    // =====================================================================
    // groupCodes 파라미터로 여러 코드 그룹을 한 번에 조회 후
    // codeGroup 기준 Map<그룹코드, 코드목록>으로 그룹핑 반환
    // =====================================================================

    @Override
    public HashMap<String, Object> getCodeList(HashMap<String, Object> searchMap) throws Exception {

        log.info("BizServiceImpl - getCodeList for searchMap: {}", searchMap);

        List<HashMap<String, Object>> codeList = bizDao.selectCodeList(searchMap);

        Map<String, List<HashMap<String, Object>>> groupCodes = codeList.stream()
            .collect(Collectors.groupingBy(code -> String.valueOf(code.get("codeGroup"))));

        HashMap<String, Object> resultMap = new HashMap<>();
        resultMap.put("groupCodes", groupCodes);
        return resultMap;
    }

    // =====================================================================
    // [4] 사업목록 조회
    // =====================================================================

    @Override
    public HashMap<String, Object> getBizList(HashMap<String, Object> searchMap) throws Exception {

        List<HashMap<String, Object>> bizList = bizDao.selectBizList(searchMap);

        HashMap<String, Object> resultMap = new HashMap<>();
        resultMap.put("bizList", bizList);
        return resultMap;
    }

    // =====================================================================
    // [5] 사업 전체 삭제
    // =====================================================================
    // @Transactional(rollbackFor = Exception.class): 모든 예외 타입에 대해 롤백
    //
    // FK 제약 순서를 고려한 삭제 순서 (자식 → 부모):
    //   1. BIZ_PORTAL              (독립 테이블)
    //   2. S1010_CONSORTIUM_HISTORY (S1010_CONSORTIUM의 FK 자식)
    //   3. S1010_CONSORTIUM         (S1010의 FK 자식)
    //   4. S1010_HISTORY            (S1010의 FK 자식)
    //   5. S1010                    (BIZ_MASTER의 FK 자식)
    //   6. BIZ_MASTER               (최종 부모 — 마지막에 삭제)
    // =====================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public HashMap<String, Object> deleteBizData(HashMap<String, Object> searchMap) throws Exception {

        String masterNo = (String) searchMap.get("masterNo");

        if (masterNo == null || masterNo.isEmpty()) {
            throw new Exception("삭제할 사업 번호(masterNo)가 존재하지 않습니다.");
        }

        Map<String, Object> checkMap = new HashMap<>();
        checkMap.put("masterNo", masterNo);

        checkMap.put("tableName", "BIZ_PORTAL");
        if (bizDao.checkDataExists(checkMap) > 0) {
            bizDao.deleteBizPortal(masterNo);
        }

        checkMap.put("tableName", "S1010_CONSORTIUM");
        if (bizDao.checkDataExists(checkMap) > 0) {
            bizDao.deleteConsortiumHistory(masterNo);
            bizDao.deleteConsortium(masterNo);
        }

        checkMap.put("tableName", "S1010");
        if (bizDao.checkDataExists(checkMap) > 0) {
            bizDao.deleteS1010History(masterNo);
            bizDao.deleteS1010(masterNo);
        }

        checkMap.put("tableName", "BIZ_MEMBER");
        if (bizDao.checkDataExists(checkMap) > 0) {
            bizDao.deleteBizMembers(masterNo);
        }

        int affectedRows = bizDao.deleteBizMaster(masterNo);

        HashMap<String, Object> result = new HashMap<>();
        if (affectedRows > 0) {
            result.put("status", "success");
            result.put("message", "해당 사업의 모든 데이터가 정상적으로 삭제되었습니다.");
        } else {
            result.put("status", "fail");
            result.put("message", "삭제할 기본 사업 정보가 존재하지 않습니다.");
        }
        return result;
    }

    // =====================================================================
    // [6] Task 코드 조회
    // =====================================================================
    // BIZ_TASK 마스터 코드 목록 + 변경 이력 목록을 함께 반환
    // EXCLUDED_TASK_CODES (D80, D90) 제외
    // =====================================================================

    @Override
    public HashMap<String, Object> getTaskList(HashMap<String, Object> searchMap) throws Exception {

        log.info("BizServiceImpl - getTaskList for searchMap: {}", searchMap);

        searchMap.put("excludeCodes", EXCLUDED_TASK_CODES);

        List<HashMap<String, Object>> taskList        = bizDao.selectTaskList(searchMap);
        List<HashMap<String, Object>> taskHistoryList = bizDao.selectTaskHistoryList(searchMap);

        HashMap<String, Object> resultMap = new HashMap<>();
        resultMap.put("taskList",        taskList);
        resultMap.put("taskHistoryList", taskHistoryList);
        return resultMap;
    }

    // =====================================================================
    // [7] Biz Task 공정표 목록 조회
    // =====================================================================

    @Override
    public HashMap<String, Object> getBizTaskList(HashMap<String, Object> searchMap) throws Exception {

        log.info("BizServiceImpl - getBizTaskList for searchMap: {}", searchMap);

        List<HashMap<String, Object>> bizTaskList = bizDao.selectBizTaskList(searchMap);
        HashMap<String, Object> resultMap = new HashMap<>();
        resultMap.put("bizTaskList", bizTaskList);
        return resultMap;
    }

    // =====================================================================
    // [8] Task 코드 저장/수정
    // =====================================================================
    // 중복 코드 체크 → 이력 저장 → MERGE(저장/수정) → 신규 등록 후 초기 이력 저장
    // =====================================================================

    @Override
    @Transactional
    public HashMap<String, Object> setTaskCode(HashMap<String, Object> searchMap) throws Exception {

        HashMap<String, Object> existingTask = bizDao.selectTaskByKey(searchMap);

        boolean isNew = "true".equals(String.valueOf(searchMap.get("isNew")));
        if (isNew && existingTask != null) {
            HashMap<String, Object> result = new HashMap<>();
            result.put("status",  "duplicate");
            result.put("message", "이미 존재하는 코드입니다. [" + searchMap.get("taskCode") + "]");
            return result;
        }

        if (existingTask != null) {
            bizDao.insertBizTaskHistory(searchMap);
        }

        int affectedRows = bizDao.saveBizTask(searchMap);

        if (affectedRows > 0 && isNew) {
            bizDao.insertBizTaskHistory(searchMap);
        }

        HashMap<String, Object> result = new HashMap<>();
        result.put("status",  affectedRows > 0 ? "success" : "fail");
        result.put("message", affectedRows > 0 ? "정상적으로 처리되었습니다." : "저장에 실패하였습니다.");
        return result;
    }

    // =====================================================================
    // [9] Task 코드 삭제
    // =====================================================================
    // 사용 중인 Task(BIZ_PORTAL에 등록된 사업 존재)는 삭제 불가
    // =====================================================================

    @Override
    @Transactional
    public HashMap<String, Object> deleteTaskCode(HashMap<String, Object> searchMap) throws Exception {

        int inUseCount = bizDao.checkTaskInUse(searchMap);
        if (inUseCount > 0) {
            HashMap<String, Object> result = new HashMap<>();
            result.put("status",  "fail");
            result.put("message", "사업에서 사용 중인 Task는 삭제할 수 없습니다. [" + searchMap.get("taskCode") + "]");
            return result;
        }

        bizDao.deleteTaskHistory(searchMap);
        int affectedRows = bizDao.deleteTask(searchMap);

        HashMap<String, Object> result = new HashMap<>();
        result.put("status",  affectedRows > 0 ? "success" : "fail");
        result.put("message", affectedRows > 0 ? "삭제되었습니다." : "삭제에 실패하였습니다.");
        return result;
    }

    // =====================================================================
    // [10] 진행단계 저장
    // =====================================================================
    // 단계 진행 시 BIZ_MASTER.PRO_STEP + BIZ_PORTAL.TASK_STATUS 동시 갱신
    //
    // taskStatus='T'(종결) 특수 처리:
    //   현재 태스크뿐 아니라 remainingSteps(미완료 후속 단계)도 함께 'T'로 일괄 종결
    // =====================================================================

    @Override
    @Transactional
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> setBizStep(HashMap<String, Object> searchMap) throws Exception {

        // 세션에서 사번 추출 → 작성자 세팅
        String empno = sessionProvider.get().getEmpno();
        searchMap.put("writerId", empno);

        int updatedCount = bizDao.updateBizStep(searchMap);

        if ("T".equals(searchMap.get("taskStatus"))) {
            List<String> remainingSteps = (List<String>) searchMap.get("remainingSteps");
            if (remainingSteps != null && !remainingSteps.isEmpty()) {
                bizDao.updateRemainingBizPortalStatus(searchMap);
            }
        }

        bizDao.updateBizPortalStatus(searchMap);

        HashMap<String, Object> result = new HashMap<>();
        result.put("updatedCount", updatedCount);
        result.put("status", updatedCount > 0 ? "SUCCESS" : "FAIL");
        return result;
    }

    // =====================================================================
    // [11] 공정표 기간 저장
    // =====================================================================
    // SessionContext에서 현재 로그인 사용자 ID를 가져와 UPWRITER_ID 기록
    // =====================================================================

    @Override
    @Transactional
    public HashMap<String, Object> setTaskItemPeriod(HashMap<String, Object> itemTask) throws Exception {

        itemTask.put("writerId", sessionProvider.get().getEmpno());

        int updatedCount = bizDao.updateTaskItemPeriod(itemTask);
        if( updatedCount > 0 ) {
        	int insCount = bizDao.insertTaskItemPeriodHistory(itemTask);
        }

        HashMap<String, Object> result = new HashMap<>();
        result.put("updatedCount", updatedCount);
        result.put("status", updatedCount > 0 ? "SUCCESS" : "FAIL");
        return result;
    }
    
    // =====================================================================
    // [12] 관련데이타 콤보 조회
    // =====================================================================

    @Override
    public HashMap<String, Object> getBizTaskComboData(HashMap<String, Object> searchMap) throws Exception {

        log.info("BizServiceImpl - getBizTaskComboData for searchMap: {}", searchMap);

        List<HashMap<String, Object>> bizTaskTypeList = bizDao.selectBizTaskTypeList(searchMap);
        List<HashMap<String, Object>> bizTaskCodeList = bizDao.selectBizTaskCodeList(searchMap);
        HashMap<String, Object> resultMap = new HashMap<>();
        resultMap.put("bizTaskTypeList", bizTaskTypeList);
        resultMap.put("bizTaskCodeList", bizTaskCodeList);
        return resultMap;
    }

    // =====================================================================
    // [13] 관련데이타 조회
    // =====================================================================

    @Override
    public HashMap<String, Object> getRelatedData(HashMap<String, Object> searchMap) throws Exception {

        log.info("BizServiceImpl - getRelatedData for searchMap: {}", searchMap);

        List<HashMap<String, Object>> relatedData = bizDao.selectRelatedData(searchMap);
        HashMap<String, Object> resultMap = new HashMap<>();
        resultMap.put("relatedData", relatedData);
        return resultMap;
    }

    // =====================================================================
    // [14] BIZ_PORTAL 스케쥴 변경 HISTORY 조회
    // =====================================================================

    @Override
    public HashMap<String, Object> getBizTaskPeriodHist(HashMap<String, Object> searchMap) throws Exception {

        log.info("BizServiceImpl - getBizTaskPeriodHist for searchMap: {}", searchMap);

        List<HashMap<String, Object>> bizTaskHistory = bizDao.selectBizTaskPeriodHist(searchMap);
        HashMap<String, Object> resultMap = new HashMap<>();
        resultMap.put("bizTaskHistory", bizTaskHistory);
        return resultMap;
    }

    // =====================================================================
    // [15] 사업 통계 조회
    // =====================================================================

    @Override
    public HashMap<String, Object> getBizStatistics(HashMap<String, Object> searchMap) throws Exception {

        log.info("BizServiceImpl - getBizStatistics for searchMap: {}", searchMap);

        List<HashMap<String, Object>> statisticsList = bizDao.selectBizStatistics(searchMap);
        HashMap<String, Object> resultMap = new HashMap<>();
        resultMap.put("statisticsList", statisticsList);
        return resultMap;
    }
}
