package com.koen.kopms_api.task.biz.service.serviceImpl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.koen.kopms_api.model.vo.SessionContext;
import com.koen.kopms_api.task.biz.dao.BizDao;
import com.koen.kopms_api.task.biz.service.BizTaskService;

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
public class BizTaskServiceImpl implements BizTaskService {

    @Autowired
    private BizDao bizDao;
    private final Provider<SessionContext> sessionProvider;

    // =====================================================================
    // [2] Task 코드 조회
    // =====================================================================

    @Override
    public HashMap<String, Object> getTaskData(HashMap<String, Object> searchMap) throws Exception {

        String taskType = String.valueOf(searchMap.get("taskType"));

        HashMap<String, Object> taskData = new HashMap<>();

        switch (taskType) {
            case "180":
                HashMap<String, Object> taskSVC = bizDao.selectSVC(searchMap);
                if (taskSVC != null) taskData.put("taskSVC", taskSVC);
                List<Map<String, Object>> taskSVCCON = bizDao.selectSVCCONList(searchMap);
                if (taskSVCCON != null && !taskSVCCON.isEmpty()) taskData.put("taskSVCCON", taskSVCCON);
                break;

            case "181":
                HashMap<String, Object> taskLIC = bizDao.selectLIC(searchMap);
                if (taskLIC != null) taskData.put("taskLIC", taskLIC);
                break;

            case "182":
                HashMap<String, Object> taskSPC = bizDao.selectSPC(searchMap);
                if (taskSPC != null) taskData.put("taskSPC", taskSPC);
                break;

            case "183":
                HashMap<String, Object> taskCSV = bizDao.selectCSV(searchMap);
                if (taskCSV != null) taskData.put("taskCSV", taskCSV);
                break;

            default:
                log.warn("정의되지 않은 단계 호출: {}", taskType);
                break;
        }

        return taskData;
    }

    // =====================================================================
    // [3] TASK별 데이터 저장/수정
    // =====================================================================

    @Override
    @Transactional
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> setTaskData(HashMap<String, Object> searchMap) throws Exception {

        // 세션에서 사번 추출 → 등록자/수정자 공통 세팅
        String empno = sessionProvider.get().getEmpno();
        searchMap.put("inwriterId", empno);
        searchMap.put("upwriterId", empno);

        String taskType = String.valueOf(searchMap.get("taskType"));

        switch (taskType) {
            case "180": {
                Map<String, Object> serviceInfo = (Map<String, Object>) searchMap.get("serviceInfo");
                if (serviceInfo != null) searchMap.putAll(serviceInfo);
                bizDao.mergeSVC(searchMap);

                List<Map<String, Object>> contracts = (List<Map<String, Object>>) searchMap.get("contracts");
                if (contracts != null && !contracts.isEmpty()) {
                    List<Integer> orderNos = new ArrayList<>();
                    for (int i = 0; i < contracts.size(); i++) {
                        int orderNo = i + 1;
                        orderNos.add(orderNo);
                        Map<String, Object> con = contracts.get(i);
                        con.put("masterNo", searchMap.get("masterNo"));
                        con.put("taskType", searchMap.get("taskType"));
                        con.put("taskCode", searchMap.get("taskCode"));
                        con.put("orderNo", orderNo);
                        con.put("inwriterId", empno);
                        con.put("upwriterId", empno);
                        bizDao.mergeSVCCON(con);
                    }
                    // 현재 리스트에 없는 ORDER_NO 삭제 (유저가 삭제한 계약 행)
                    searchMap.put("orderNos", orderNos);
                    bizDao.deleteSVCCONExcept(searchMap);
                }
                break;
            }
            case "181": {
                Map<String, Object> licenseInfo = (Map<String, Object>) searchMap.get("licenseInfo");
                if (licenseInfo != null) searchMap.putAll(licenseInfo);
                bizDao.mergeLIC(searchMap);
                break;
            }
            case "182": {
                Map<String, Object> spcInfo = (Map<String, Object>) searchMap.get("spcInfo");
                if (spcInfo != null) searchMap.putAll(spcInfo);
                bizDao.mergeSPC(searchMap);
                break;
            }
            case "183": {
                Map<String, Object> publicTaskInfo = (Map<String, Object>) searchMap.get("publicTaskInfo");
                if (publicTaskInfo != null) searchMap.putAll(publicTaskInfo);
                bizDao.mergeCSV(searchMap);
                break;
            }
            default:
                log.warn("정의되지 않은 단계 호출: {}", taskType);
                break;
        }

        // completeYn='Y'이면 완료(Y) 처리, 아니면 작성중(W) — 이미 완료인 경우는 유지
        String completeYn = String.valueOf(searchMap.getOrDefault("completeYn", "N"));
        if ("Y".equals(completeYn)) {
            searchMap.put("taskStatus", "Y");
            searchMap.put("skipIfDone", false);
        } else {
            searchMap.put("taskStatus", "W");
            searchMap.put("skipIfDone", true);
        }
        searchMap.put("writerId", empno);
        bizDao.updateBizPortalStatus(searchMap);

        return searchMap;
    }

    // =====================================================================
    // [4] 차수 task 추가 (BIZ_TASK + BIZ_PORTAL INSERT)
    // =====================================================================
    // templateCode: 부모 task의 taskCode
    // 차수 번호: MASTER_NO + TEMPLATE_CODE 기준 BIZ_PORTAL 기존 개수 + 1
    // 새 taskCode: templateCode + "_" + 2자리 차수 번호 (e.g. CSV01_01)
    // 새 taskName: "제N차 " + 부모 taskName
    // BIZ_TASK  INSERT: 없을 때만 — bizType/taskCode/taskName/takeDays/templateCode
    // BIZ_PORTAL INSERT: masterNo + taskType + newTaskCode + templateCode
    // =====================================================================
    @Override
    @Transactional
    public HashMap<String, Object> addChildTask(HashMap<String, Object> param) throws Exception {

        String empno = sessionProvider.get().getEmpno();

        // 1. 부모 task 정보 조회 (taskName 가져오기)
        //    selectTaskByKey는 bizType + taskCode로 조회 → taskType을 bizType으로 사용
        HashMap<String, Object> parentParam = new HashMap<>();
        parentParam.put("bizType",  param.get("taskType"));
        parentParam.put("taskCode", param.get("templateCode"));
        HashMap<String, Object> parentTask = bizDao.selectTaskByKey(parentParam);

        // 1-1. 부모 task가 BIZ_PORTAL에 없으면 추가 (MERGE라서 중복 안전)
        HashMap<String, Object> parentPortalParam = new HashMap<>();
        parentPortalParam.put("masterNo",   param.get("masterNo"));
        parentPortalParam.put("taskType",   param.get("taskType"));
        parentPortalParam.put("taskCode",   param.get("templateCode"));
        parentPortalParam.put("taskStatus", "N");
        parentPortalParam.put("writerId",   empno);
        bizDao.mergeBizPortal(parentPortalParam);

        // 2. 현재 차수 개수 조회
        int childCount = bizDao.countChildTasks(param);
        int nextOrder  = childCount + 1;

        // 3. 새 taskCode / taskName 생성
        String newTaskCode = param.get("templateCode") + "-" + String.format("%02d", nextOrder);
        String newTaskName = "제" + nextOrder + "차 " + parentTask.get("taskName");

        // 4. BIZ_TASK INSERT (없을 때만 — 다른 프로젝트가 이미 생성한 경우 스킵)
        HashMap<String, Object> taskKeyParam = new HashMap<>();
        taskKeyParam.put("bizType",  param.get("taskType"));
        taskKeyParam.put("taskCode", newTaskCode);
        if (bizDao.selectTaskByKey(taskKeyParam) == null) {
            HashMap<String, Object> taskParam = new HashMap<>();
            taskParam.put("bizType",      param.get("taskType"));
            taskParam.put("taskCode",     newTaskCode);
            taskParam.put("taskName",     newTaskName);
            taskParam.put("takeDays",     parentTask.get("takeDays"));
            taskParam.put("templateYn",   "N");
            taskParam.put("templateCode", param.get("templateCode"));
            taskParam.put("writerId",     empno);
            bizDao.saveBizTask(taskParam);
        }

        // 5. BIZ_PORTAL INSERT
        HashMap<String, Object> portalParam = new HashMap<>();
        portalParam.put("masterNo",     param.get("masterNo"));
        portalParam.put("taskType",     param.get("taskType"));
        portalParam.put("taskCode",     newTaskCode);
        portalParam.put("taskStatus",   "N");
        portalParam.put("templateCode", param.get("templateCode"));
        portalParam.put("writerId",     empno);
        bizDao.mergeBizPortal(portalParam);

        // 6. 새로 생성된 task 정보 반환 (프론트에서 패널 자동 오픈용)
        HashMap<String, Object> result = new HashMap<>();
        result.put("newTask", Map.of(
            "taskType", param.get("taskType"),
            "taskCode", newTaskCode,
            "taskName", newTaskName
        ));
        return result;
    }

    // =====================================================================
    // [5] 자식 task 삭제 (미작성/작성중만 허용)
    // =====================================================================
    // 삭제 순서:
    //   1. taskType별 데이터 테이블 삭제 (BIZ_SVC+CON / BIZ_LIC / BIZ_SPC / BIZ_CSV)
    //   2. BIZ_PORTAL 단건 삭제
    //   3. 다른 프로젝트 참조 없으면 BIZ_TASK_HISTORY + BIZ_TASK 삭제 (정의 풀 정리)
    // =====================================================================
    @Override
    @Transactional
    public HashMap<String, Object> deleteChildTask(HashMap<String, Object> param) throws Exception {

        String taskStatus = String.valueOf(param.get("taskStatus"));
        if ("Y".equals(taskStatus)) {
            throw new IllegalStateException("완료된 태스크는 삭제할 수 없습니다.");
        }

        String taskType = String.valueOf(param.get("taskType"));

        // 1. taskType별 데이터 삭제
        switch (taskType) {
            case "180":
                bizDao.deleteSVCCON(param);
                bizDao.deleteSVC(param);
                break;
            case "181":
                bizDao.deleteLIC(param);
                break;
            case "182":
                bizDao.deleteSPC(param);
                break;
            case "183":
                bizDao.deleteCSV(param);
                break;
            default:
                log.warn("deleteChildTask - 정의되지 않은 taskType: {}", taskType);
                break;
        }

        // 2. BIZ_PORTAL 단건 삭제
        bizDao.deleteBizPortalTask(param);

        // 3. 다른 프로젝트 참조 여부 확인 → 없으면 BIZ_TASK 정리
        HashMap<String, Object> taskKeyParam = new HashMap<>();
        taskKeyParam.put("bizType",  param.get("taskType"));
        taskKeyParam.put("taskCode", param.get("taskCode"));
        if (bizDao.checkTaskInUse(taskKeyParam) == 0) {
            bizDao.deleteTaskHistory(taskKeyParam);
            bizDao.deleteTask(taskKeyParam);
        }

        return param;
    }

    // =====================================================================
    // [6] BIZ_PORTAL 단건 추가 (일반 task → 포털에 등록)
    // =====================================================================
    // setS1010Data()의 mergeBizPortal 호출 로직을 단건 처리용으로 재사용
    // =====================================================================
    @Override
    @Transactional
    public HashMap<String, Object> addPortalTask(HashMap<String, Object> param) throws Exception {

        String empno = sessionProvider.get().getEmpno();
        param.put("taskStatus", "N");
        param.put("writerId",   empno);
        bizDao.mergeBizPortal(param);

        return param;
    }

}
