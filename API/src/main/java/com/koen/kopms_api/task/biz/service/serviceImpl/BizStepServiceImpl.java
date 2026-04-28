package com.koen.kopms_api.task.biz.service.serviceImpl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.koen.kopms_api.exception.ResourceNotFoundException;
import com.koen.kopms_api.model.vo.SessionContext;
import com.koen.kopms_api.task.biz.dao.BizDao;
import com.koen.kopms_api.task.biz.service.BizStepService;

import jakarta.inject.Provider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// =====================================================================
// 사업 단계별 데이터 조회/저장 서비스 (S10~D70)
// BizServiceImpl에서 분리 — 단계별 로직이 핵심이며 가장 무거운 영역
// =====================================================================
@Slf4j
@Service
@RequiredArgsConstructor
public class BizStepServiceImpl implements BizStepService {

    @Autowired
    private BizDao bizDao;
    private final Provider<SessionContext> sessionProvider;

    // =====================================================================
    // [1] 상수 정의
    // =====================================================================

    // D80, D90: 포털 화면에 노출하지 않는 내부용 태스크 코드
    private static final List<String> EXCLUDED_TASK_CODES = List.of("D80", "D90");

    // S1010.informants(공고 정보) 다중행 데이터를 DB 단일 컬럼에 콤마 구분자로 저장할 때 사용할 필드 순서
    private static final String[] INFORMANT_FIELDS = {
        "gonggoNum", "gonggoName", "gonggoOrg",
        "infoName", "infoPos", "infoTel", "infoFax"
    };

    // S1010.order(발주처 정보) 다중행 데이터 필드 순서
    private static final String[] ORDER_FIELDS = {
        "orderCompany", "orderOwner", "orderAddr", "orderHompage",
        "orderDept", "orderPos", "orderName", "orderTel", "orderHp", "orderFax"
    };

    // =====================================================================
    // [2] 유틸 메서드
    // =====================================================================

    /**
     * null 또는 문자열 "null" 방어 처리
     */
    private String getSafeString(Object obj) {
        if (obj == null) return "";
        String s = String.valueOf(obj).trim();
        return "null".equalsIgnoreCase(s) ? "" : s;
    }

    /**
     * 배열 범위 초과 방지 유틸 — CSV 복원 시 컬럼 수 불일치 케이스 방어
     */
    private String getValueByIndex(String[] arr, int i) {
        return (arr != null && arr.length > i) ? arr[i] : "";
    }

    /**
     * DB 콤마 구분자 문자열 → 객체 리스트 복원 (informants, order 공용)
     */
    private List<Map<String, Object>> restoreListFromCsv(Map<String, Object> source, String[] fields) {
        String[][] splitArrays = new String[fields.length][];
        for (int i = 0; i < fields.length; i++) {
            splitArrays[i] = getSafeString(source.get(fields[i])).split(",", -1);
        }

        int len = splitArrays[0].length;
        if (len == 1 && splitArrays[0][0].isEmpty()) return new ArrayList<>();

        List<Map<String, Object>> list = new ArrayList<>();
        for (int i = 0; i < len; i++) {
            Map<String, Object> row = new HashMap<>();
            for (int j = 0; j < fields.length; j++) {
                row.put(fields[j], getValueByIndex(splitArrays[j], i));
            }
            list.add(row);
        }
        return list;
    }

    /**
     * 저장 전 객체 리스트 → 콤마 구분자 문자열 변환 (informants, order 공용)
     */
    private void prepareListToCsv(Map<String, Object> bizInfo, String listKey, String[] fields) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> list = (List<Map<String, Object>>) bizInfo.get(listKey);
        if (list == null || list.isEmpty()) return;

        for (String field : fields) {
            String joined = list.stream()
                .map(m -> {
                    Object val = m.get(field);
                    if (val == null || "null".equalsIgnoreCase(String.valueOf(val))) return "";
                    return String.valueOf(val).replace(",", " ");
                })
                .collect(Collectors.joining(","));
            bizInfo.put(field, joined);
        }
    }

    // =====================================================================
    // [3] 사업별 데이터 조회
    // =====================================================================
    // 1) BIZ_MASTER 공통 정보 조회
    // 2) DOC_NO에서 docSeqNo 역추출
    // 3) currentStep 기준으로 해당 단계 테이블(S1010~D7010) 상세 조회
    //    - S10 한정: version 파라미터 있으면 이력 버전 조회
    //                version 파라미터 없으면 현재 데이터 + 버전 드롭다운 목록 조회
    // 4) processBizTasks() 호출 → BIZ_PORTAL 태스크 분류하여 응답에 합산
    // =====================================================================

    @Override
    public HashMap<String, Object> getBizData(HashMap<String, Object> searchMap) throws Exception {

        HashMap<String, Object> bizData = bizDao.selectBizData(searchMap);
        if (bizData == null) throw new ResourceNotFoundException("정보가 존재하지 않습니다.");

        // docSeqNo 추출: DOC_NO 구조 = 년도(4자리) + 사업구분 + 사업유형 + 투자유형 + seq
        String docNo      = getSafeString(bizData.get("docNo"));
        String bizSection = getSafeString(bizData.get("bizSection"));
        String bizType    = getSafeString(bizData.get("bizType"));
        String investType = getSafeString(bizData.get("investType"));
        int prefixLen = 4 + bizSection.length() + bizType.length() + investType.length();
        bizData.put("docSeqNo", docNo.length() > prefixLen ? docNo.substring(prefixLen) : "");

        String currentStep = String.valueOf(searchMap.get("currentStep"));
        Object versionObj  = searchMap.get("version");

        switch (currentStep) {
        case "S10":
            if (versionObj != null) {
                searchMap.put("version", Integer.parseInt(String.valueOf(versionObj)));
                HashMap<String, Object> bizInfoHist = bizDao.selectS1010History(searchMap);
                if (bizInfoHist != null) {
                    bizInfoHist.put("informants", restoreListFromCsv(bizInfoHist, INFORMANT_FIELDS));
                    bizInfoHist.put("order",      restoreListFromCsv(bizInfoHist, ORDER_FIELDS));
                    bizData.put("bizInfo", bizInfoHist);
                }
                List<Map<String, Object>> consortiumHistList = bizDao.selectConsortiumHistoryList(searchMap);
                if (consortiumHistList != null && !consortiumHistList.isEmpty()) {
                    bizData.put("consortium", consortiumHistList);
                }
            } else {
                HashMap<String, Object> bizInfoS10 = bizDao.selectS1010Data(searchMap);
                if (bizInfoS10 != null) {
                    bizInfoS10.put("informants", restoreListFromCsv(bizInfoS10, INFORMANT_FIELDS));
                    bizInfoS10.put("order",      restoreListFromCsv(bizInfoS10, ORDER_FIELDS));
                    bizData.put("bizInfo", bizInfoS10);
                }
                List<Map<String, Object>> consortiumList = bizDao.selectConsortiumList(searchMap);
                if (consortiumList != null && !consortiumList.isEmpty()) {
                    bizData.put("consortium", consortiumList);
                }
                List<Map<String, Object>> versionList = bizDao.selectHistoryVersionList(searchMap);
                bizData.put("versionList", versionList != null ? versionList : Collections.emptyList());

                // 담당자/열람자 조회 (BNO=1: PM, BNO=2: 파트너)
                List<Map<String, Object>> members = bizDao.selectBizMembers(searchMap);
                if (members != null) {
                    for (Map<String, Object> m : members) {
                        int bno = ((Number) m.get("bno")).intValue();
                        if (bno == 1) {
                            bizData.put("pmUser",     m.get("empno"));
                            bizData.put("pmUserName", m.get("empName"));
                        } else if (bno == 2) {
                            bizData.put("partnerUser",     m.get("empno"));
                            bizData.put("partnerUserName", m.get("empName"));
                        }
                    }
                }
            }
            break;

            case "S20":
                HashMap<String, Object> bizInfoS20 = bizDao.selectS2010Data(searchMap);
                if (bizInfoS20 != null) bizData.put("bizInfo", bizInfoS20);
                break;

            case "S30":
                HashMap<String, Object> bizInfoS30 = bizDao.selectS3010Data(searchMap);
                if (bizInfoS30 != null) bizData.put("bizInfo", bizInfoS30);
                break;

            case "S40":
                HashMap<String, Object> bizInfoS40 = bizDao.selectS4010Data(searchMap);
                if (bizInfoS40 != null) bizData.put("bizInfo", bizInfoS40);
                break;

            case "S50":
                HashMap<String, Object> bizInfoS50 = bizDao.selectS5010Data(searchMap);
                if (bizInfoS50 != null) bizData.put("bizInfo", bizInfoS50);
                break;

            case "D10":
                HashMap<String, Object> bizInfoD10 = bizDao.selectD1010Data(searchMap);
                if (bizInfoD10 != null) bizData.put("bizInfo", bizInfoD10);
                break;

            case "D20":
                HashMap<String, Object> bizInfoD20 = bizDao.selectD2010Data(searchMap);
                if (bizInfoD20 != null) bizData.put("bizInfo", bizInfoD20);
                break;

            case "D30":
                HashMap<String, Object> bizInfoD30 = bizDao.selectD3010Data(searchMap);
                if (bizInfoD30 != null) bizData.put("bizInfo", bizInfoD30);
                break;

            case "D35":
                HashMap<String, Object> bizInfoD35 = bizDao.selectD3020Data(searchMap);
                if (bizInfoD35 != null) bizData.put("bizInfo", bizInfoD35);
                break;

            case "D40":
                HashMap<String, Object> bizInfoD40 = bizDao.selectD4010Data(searchMap);
                if (bizInfoD40 != null) bizData.put("bizInfo", bizInfoD40);
                break;

            case "D50":
                HashMap<String, Object> bizInfoD50 = bizDao.selectD5010Data(searchMap);
                if (bizInfoD50 != null) bizData.put("bizInfo", bizInfoD50);
                break;

            case "D60":
                HashMap<String, Object> bizInfoD60 = bizDao.selectD6010Data(searchMap);
                if (bizInfoD60 != null) bizData.put("bizInfo", bizInfoD60);
                break;

            case "D70":
                HashMap<String, Object> bizInfoD70 = bizDao.selectD7010Data(searchMap);
                if (bizInfoD70 != null) bizData.put("bizInfo", bizInfoD70);
                break;

            default:
                log.warn("정의되지 않은 단계 호출: {}", currentStep);
                break;
        }

        processBizTasks(bizData, searchMap);
        return bizData;
    }

    // =====================================================================
    // [4] 공통 태스크 데이터 처리
    // =====================================================================
    private void processBizTasks(Map<String, Object> bizData, Map<String, Object> searchMap) throws Exception {

        searchMap.put("excludeCodes", EXCLUDED_TASK_CODES);

        List<HashMap<String, Object>> tasks = bizDao.selectBizTasks(searchMap);
        if (tasks == null) return;

        List<Map<String, Object>> proSteps        = new ArrayList<>();
        List<Map<String, Object>> service         = new ArrayList<>();
        List<Map<String, Object>> license         = new ArrayList<>();
        List<Map<String, Object>> publicTask      = new ArrayList<>();
        List<Map<String, Object>> spc             = new ArrayList<>();
        // allPortalChildren: C 포함 전체 자식 task — TaskInfo.vue portalChildren 목록 구성용
        List<Map<String, Object>> allPortalChildren = new ArrayList<>();

        for (HashMap<String, Object> task : tasks) {
            String type       = String.valueOf(task.get("taskType"));
            String taskStatus = String.valueOf(task.get("taskStatus"));
            boolean isChild   = task.get("templateCode") != null;

            // 자식 task는 C 포함 전체를 별도 목록에 추가
            if (isChild) allPortalChildren.add(task);

            // 미선택(C) 자식은 선택 배열에서 제외
            if (isChild && "C".equals(taskStatus)) continue;

            if      ("109".equals(type)) proSteps.add(task);
            else if ("180".equals(type)) service.add(task);
            else if ("181".equals(type)) license.add(task);
            else if ("182".equals(type)) spc.add(task);
            else if ("183".equals(type)) publicTask.add(task);
        }

        bizData.put("proSteps",          proSteps);
        bizData.put("service",           service);
        bizData.put("license",           license);
        bizData.put("spc",               spc);
        bizData.put("publicTask",        publicTask);
        bizData.put("allPortalChildren", allPortalChildren);
    }

    // =====================================================================
    // [5] 사업별 데이터 저장/수정
    // =====================================================================
    // DOC_NO 채번 규칙:
    //   년도(YYYY) + 사업구분코드 + 사업유형코드 + 투자유형코드 + SEQ
    //
    // 신규 등록: getNextDocSeqNo()로 seq 채번 후 조합, proStep 초기값 "S10"
    // 수정 시:   기존 docNo 앞 4자리(년도) 추출 + 프론트에서 넘어온 docSeqNo 재사용
    // =====================================================================

    @Override
    @Transactional
    public HashMap<String, Object> setBizData(HashMap<String, Object> searchMap) throws Exception {

        // 세션에서 사용자 정보 추출 → 공통 세팅
        SessionContext session = sessionProvider.get();
        String empno = session.getEmpno();
        searchMap.put("writerId",   empno);
        searchMap.put("deptNo",     session.getDeptno());
        searchMap.put("deptName",   session.getDeptName());
        searchMap.put("writerName", session.getName());
        searchMap.put("posName",    session.getJikgubName());

        // bizInfo에도 inwriterId/upwriterId 세팅 (패턴 A: bizInfo를 DAO에 직접 넘기는 단계 커버)
        @SuppressWarnings("unchecked")
        Map<String, Object> bizInfoForWriter = (Map<String, Object>) searchMap.get("bizInfo");
        if (bizInfoForWriter != null) {
            bizInfoForWriter.put("inwriterId", empno);
            bizInfoForWriter.put("upwriterId", empno);
        }

        // 1. [공통] 마스터 정보 저장/수정
        String masterNo = getSafeString(searchMap.get("masterNo"));
        boolean isMasterNew = masterNo.isEmpty();

        if (isMasterNew) {
            String seqNo      = bizDao.getNextDocSeqNo();
            String bizSection = getSafeString(searchMap.get("bizSection"));
            String bizType    = getSafeString(searchMap.get("bizType"));
            String investType = getSafeString(searchMap.get("investType"));
            searchMap.put("docNo", LocalDate.now().getYear() + bizSection + bizType + investType + seqNo);
            searchMap.put("proStep", "S10");
            bizDao.insertBizMaster(searchMap);
            masterNo = String.valueOf(searchMap.get("masterNo"));
        } else {
            String existingDocNo = getSafeString(searchMap.get("docNo"));
            String year       = existingDocNo.length() >= 4 ? existingDocNo.substring(0, 4) : String.valueOf(LocalDate.now().getYear());
            String seqNo      = getSafeString(searchMap.get("docSeqNo"));
            String bizSection = getSafeString(searchMap.get("bizSection"));
            String bizType    = getSafeString(searchMap.get("bizType"));
            String investType = getSafeString(searchMap.get("investType"));
            searchMap.put("docNo", year + bizSection + bizType + investType + seqNo);
            bizDao.updateBizMaster(searchMap);
        }

        // 2. [분기] 단계별 전용 저장 로직 호출
        String currentStep = String.valueOf(searchMap.get("currentStep"));

        switch (currentStep) {
            case "S10":  setS1010Data(masterNo, searchMap); break;
            case "S20":  setS2010Data(masterNo, searchMap); break;
            case "S30":  setS3010Data(masterNo, searchMap); break;
            case "S40":  setS4010Data(masterNo, searchMap); break;
            case "S50":  setS5010Data(masterNo, searchMap); break;
            case "D10":  setD1010Data(masterNo, searchMap); break;
            case "D20":  setD2010Data(masterNo, searchMap); break;
            case "D30":  setD3010Data(masterNo, searchMap); break;
            case "D35":  setD3020Data(masterNo, searchMap); break;
            case "D40":  setD4010Data(masterNo, searchMap); break;
            case "D50":  setD5010Data(masterNo, searchMap); break;
            case "D60":  setD6010Data(masterNo, searchMap); break;
            case "D70":  setD7010Data(masterNo, searchMap); break;
            default:
                log.warn("정의되지 않은 단계 저장 요청: {}", currentStep);
                break;
        }

        // 3. 현재 단계 N→W 전환 (최초 저장 시 작성중 상태로 변경)
        HashMap<String, Object> wStatusParam = new HashMap<>();
        wStatusParam.put("masterNo",   masterNo);
        wStatusParam.put("taskType",   "109");
        wStatusParam.put("taskCode",   currentStep);
        wStatusParam.put("taskStatus", "W");
        wStatusParam.put("writerId",   empno);
        wStatusParam.put("onlyIfNew",  true);
        bizDao.updateBizPortalStatus(wStatusParam);

        HashMap<String, Object> result = new HashMap<>();
        result.put("status", "success");
        result.put("masterNo", masterNo);
        return result;
    }

    // =====================================================================
    // [6] 단계별 전용 저장 로직
    // =====================================================================

    /**
     * S10 단계 전용 저장 로직 (Task, S1010 상세, 컨소시엄, 히스토리)
     */
    @SuppressWarnings("unchecked")
    private void setS1010Data(String masterNo, Map<String, Object> searchMap) throws Exception {

        // A. Task (진행단계, 용역, 인허가, 주민상생, SPC) 처리
        Map<String, String> taskTypeMap = Map.of(
            "proSteps",   "109",
            "service",    "180",
            "license",    "181",
            "spc",        "182",
            "publicTask", "183"
        );

        // templateCodeMap: taskCode → templateCode 역조회용
        // BIZ_TASK(전역 부모) + BIZ_PORTAL(사업별 자식) 둘 다 포함해야
        // 자식 task(addChildTask로 생성)는 BIZ_TASK에 없고 BIZ_PORTAL에만 존재하기 때문
        List<HashMap<String, Object>> allTasks = bizDao.selectTaskList(new HashMap<>());
        Map<String, String> templateCodeMap = new HashMap<>(allTasks.stream()
            .filter(t -> t.get("templateCode") != null)
            .collect(Collectors.toMap(
                t -> String.valueOf(t.get("taskCode")),
                t -> String.valueOf(t.get("templateCode")),
                (a, b) -> a
            )));

        // BIZ_PORTAL 자식 task(TEMPLATE_CODE IS NOT NULL)도 추가
        Map<String, Object> portalParam = new HashMap<>();
        portalParam.put("masterNo", masterNo);
        List<HashMap<String, Object>> portalTasks = bizDao.selectBizTasks(portalParam);
        if (portalTasks != null) {
            portalTasks.stream()
                .filter(t -> t.get("templateCode") != null)
                .forEach(t -> templateCodeMap.putIfAbsent(
                    String.valueOf(t.get("taskCode")),
                    String.valueOf(t.get("templateCode"))
                ));
        }

        for (Map.Entry<String, String> entry : taskTypeMap.entrySet()) {
            String fieldName = entry.getKey();
            String taskType  = entry.getValue();
            List<String> codes = (List<String>) searchMap.get(fieldName);

            // 부모 task (TEMPLATE_CODE IS NULL): 선택 안 된 것 삭제
            Map<String, Object> deleteParam = new HashMap<>();
            deleteParam.put("masterNo", masterNo);
            deleteParam.put("taskType", taskType);
            deleteParam.put("codes", codes != null ? codes : new ArrayList<>());
            bizDao.deleteBizPortalTasks(deleteParam);

            if (codes != null && !codes.isEmpty()) {
                for (String codeValue : codes) {
                    String parentCode = templateCodeMap.get(codeValue);
                    Map<String, Object> param = new HashMap<>();
                    param.put("masterNo",     masterNo);
                    param.put("taskType",     taskType);
                    param.put("taskCode",     codeValue);
                    param.put("taskStatus",   "N");
                    param.put("writerId",     searchMap.get("writerId"));
                    param.put("templateCode", parentCode);
                    bizDao.mergeBizPortal(param);

                    // 자식 task(templateCode 있음): TASK_STATUS를 'N'(선택됨)으로 갱신
                    // mergeBizPortal은 MATCHED 시 TASK_STATUS를 유지하므로 별도 갱신 필요
                    if (parentCode != null) {
                        HashMap<String, Object> childStatusParam = new HashMap<>();
                        childStatusParam.put("masterNo",   masterNo);
                        childStatusParam.put("taskType",   taskType);
                        childStatusParam.put("taskCode",   codeValue);
                        childStatusParam.put("taskStatus", "N");
                        childStatusParam.put("writerId",   searchMap.get("writerId"));
                        childStatusParam.put("skipIfDone", true);
                        bizDao.updateBizPortalStatus(childStatusParam);
                    }
                }
            }

            // 자식 task 중 선택 해제된 것: TASK_STATUS를 'C'(미선택)로 갱신
            Map<String, Object> uncheckParam = new HashMap<>();
            uncheckParam.put("masterNo",   masterNo);
            uncheckParam.put("taskType",   taskType);
            uncheckParam.put("codes",      codes != null ? codes : new ArrayList<>());
            bizDao.uncheckChildTasks(uncheckParam);
        }

        // B. S1010 상세 테이블 처리
        Map<String, Object> bizInfo = (Map<String, Object>) searchMap.get("bizInfo");

        Map<String, Object> checkMap = new HashMap<>();
        checkMap.put("tableName", "S1010");
        checkMap.put("masterNo",  masterNo);
        int s1010Exists = bizDao.checkDataExists(checkMap);

        if (bizInfo != null) {
            bizInfo.put("masterNo", masterNo);
            prepareListToCsv(bizInfo, "informants", INFORMANT_FIELDS);
            prepareListToCsv(bizInfo, "order",      ORDER_FIELDS);

            if (s1010Exists == 0) bizDao.insertS1010(bizInfo);
            else                  bizDao.updateS1010(bizInfo);
        }

        // C. 컨소시엄 처리: 매 저장 시 전체 교체
        List<Map<String, Object>> consortiumList = (List<Map<String, Object>>) searchMap.get("consortium");
        bizDao.deleteConsortium(masterNo);
        if (consortiumList != null && !consortiumList.isEmpty()) {
            for (Map<String, Object> con : consortiumList) {
                con.put("masterNo", masterNo);
                bizDao.insertConsortium(con);
            }
        }

        // D. 담당자/열람자 처리: 매 저장 시 전체 교체
        bizDao.deleteBizMembers(masterNo);
        String pmUser     = getSafeString(searchMap.get("pmUser"));
        String pmUserName = getSafeString(searchMap.get("pmUserName"));
        String partnerUser     = getSafeString(searchMap.get("partnerUser"));
        String partnerUserName = getSafeString(searchMap.get("partnerUserName"));
        if (!pmUser.isEmpty()) {
            Map<String, Object> pmParam = new HashMap<>();
            pmParam.put("masterNo", masterNo);
            pmParam.put("empno",    pmUser);
            pmParam.put("proStep",  "S10");
            pmParam.put("bno",      1);
            pmParam.put("empName",  pmUserName);
            bizDao.insertBizMember(pmParam);
        }
        if (!partnerUser.isEmpty()) {
            Map<String, Object> partnerParam = new HashMap<>();
            partnerParam.put("masterNo", masterNo);
            partnerParam.put("empno",    partnerUser);
            partnerParam.put("proStep",  "S10");
            partnerParam.put("bno",      2);
            partnerParam.put("empName",  partnerUserName);
            bizDao.insertBizMember(partnerParam);
        }

        // E. 히스토리 처리 (UPDATE인 경우, bizInfo 변경 시에만 버전 생성)
        if (s1010Exists > 0 && "Y".equals(searchMap.get("bizHistoryFlag"))) {
            int nextVersion = bizDao.getNextHistoryVersion(masterNo);

            Map<String, Object> oldBizInfo = (Map<String, Object>) searchMap.get("oldBizInfo");
            if (oldBizInfo != null) {
                prepareListToCsv(oldBizInfo, "informants", INFORMANT_FIELDS);
                prepareListToCsv(oldBizInfo, "order",      ORDER_FIELDS);
                oldBizInfo.put("masterNo", masterNo);
                oldBizInfo.put("writerId", searchMap.get("writerId"));
                oldBizInfo.put("version",  nextVersion);
                bizDao.insertS1010History(oldBizInfo);
            }

            List<Map<String, Object>> oldConsortium = (List<Map<String, Object>>) searchMap.get("oldConsortium");
            if (oldConsortium != null && !oldConsortium.isEmpty()) {
                for (Map<String, Object> con : oldConsortium) {
                    con.put("masterNo", masterNo);
                    con.put("writerId", searchMap.get("writerId"));
                    con.put("version",  nextVersion);
                    bizDao.insertConsortiumHistory(con);
                }
            }
        }
    }

    /** S20 단계 전용 저장 로직 [패턴 A] */
    @SuppressWarnings("unchecked")
    private void setS2010Data(String masterNo, Map<String, Object> searchMap) throws Exception {
        Map<String, Object> bizInfo = (Map<String, Object>) searchMap.get("bizInfo");
        if (bizInfo != null) {
            bizInfo.put("masterNo", masterNo);
            Map<String, Object> checkMap = new HashMap<>();
            checkMap.put("tableName", "S2010");
            checkMap.put("masterNo", masterNo);
            int exists = bizDao.checkDataExists(checkMap);
            if (exists == 0) bizDao.insertS2010(bizInfo);
            else             bizDao.updateS2010(bizInfo);
        }
    }

    /** S30 단계 전용 저장 로직 [패턴 B] */
    @SuppressWarnings("unchecked")
    private void setS3010Data(String masterNo, HashMap<String, Object> searchMap) throws Exception {
        Map<String, Object> bizInfo = (Map<String, Object>) searchMap.get("bizInfo");
        if (bizInfo != null) {
            searchMap.put("masterNo", masterNo);
            Map<String, Object> checkParam = new HashMap<>();
            checkParam.put("tableName", "S3010");
            checkParam.put("masterNo", masterNo);
            int count = bizDao.checkDataExists(checkParam);
            if (count == 0) bizDao.insertS3010(searchMap);
            else            bizDao.updateS3010(searchMap);
        } else {
            log.error("S3010 저장 실패: bizInfo 데이터가 없습니다.");
        }
    }

    /** S40 단계 전용 저장 로직 [패턴 A] */
    @SuppressWarnings("unchecked")
    private void setS4010Data(String masterNo, Map<String, Object> searchMap) throws Exception {
        Map<String, Object> bizInfo = (Map<String, Object>) searchMap.get("bizInfo");
        if (bizInfo != null) {
            bizInfo.put("masterNo", masterNo);
            Map<String, Object> checkMap = new HashMap<>();
            checkMap.put("tableName", "S4010");
            checkMap.put("masterNo", masterNo);
            int exists = bizDao.checkDataExists(checkMap);
            if (exists == 0) bizDao.insertS4010(bizInfo);
            else             bizDao.updateS4010(bizInfo);
        }
    }

    /** S50 단계 전용 저장 로직 [패턴 B] */
    @SuppressWarnings("unchecked")
    private void setS5010Data(String masterNo, HashMap<String, Object> searchMap) throws Exception {
        Map<String, Object> bizInfo = (Map<String, Object>) searchMap.get("bizInfo");
        if (bizInfo != null) {
            searchMap.put("masterNo", masterNo);
            Map<String, Object> checkParam = new HashMap<>();
            checkParam.put("tableName", "S5010");
            checkParam.put("masterNo", masterNo);
            int count = bizDao.checkDataExists(checkParam);
            if (count == 0) bizDao.insertS5010(searchMap);
            else            bizDao.updateS5010(searchMap);
        } else {
            log.error("S5010 저장 실패: bizInfo 데이터가 없습니다.");
        }
    }

    /** D10 단계 전용 저장 로직 [패턴 B] */
    @SuppressWarnings("unchecked")
    private void setD1010Data(String masterNo, HashMap<String, Object> searchMap) throws Exception {
        Map<String, Object> bizInfo = (Map<String, Object>) searchMap.get("bizInfo");
        if (bizInfo != null) {
            searchMap.put("masterNo", masterNo);
            Map<String, Object> checkParam = new HashMap<>();
            checkParam.put("tableName", "D1010");
            checkParam.put("masterNo", masterNo);
            int count = bizDao.checkDataExists(checkParam);
            if (count == 0) bizDao.insertD1010(searchMap);
            else            bizDao.updateD1010(searchMap);
        } else {
            log.error("D1010 저장 실패: bizInfo 데이터가 없습니다.");
        }
    }

    /** D20 단계 전용 저장 로직 [패턴 A] */
    @SuppressWarnings("unchecked")
    private void setD2010Data(String masterNo, Map<String, Object> searchMap) throws Exception {
        Map<String, Object> bizInfo = (Map<String, Object>) searchMap.get("bizInfo");
        if (bizInfo != null) {
            bizInfo.put("masterNo", masterNo);
            Map<String, Object> checkMap = new HashMap<>();
            checkMap.put("tableName", "D2010");
            checkMap.put("masterNo", masterNo);
            int exists = bizDao.checkDataExists(checkMap);
            if (exists == 0) bizDao.insertD2010(bizInfo);
            else             bizDao.updateD2010(bizInfo);
        }
    }

    /** D30 단계 전용 저장 로직 [패턴 B] */
    @SuppressWarnings("unchecked")
    private void setD3010Data(String masterNo, HashMap<String, Object> searchMap) throws Exception {
        Map<String, Object> bizInfo = (Map<String, Object>) searchMap.get("bizInfo");
        if (bizInfo != null) {
            searchMap.put("masterNo", masterNo);
            Map<String, Object> checkParam = new HashMap<>();
            checkParam.put("tableName", "D3010");
            checkParam.put("masterNo", masterNo);
            int count = bizDao.checkDataExists(checkParam);
            if (count == 0) bizDao.insertD3010(searchMap);
            else            bizDao.updateD3010(searchMap);
        } else {
            log.error("D3010 저장 실패: bizInfo 데이터가 없습니다.");
        }
    }

    /** D35 단계 전용 저장 로직 [패턴 B] */
    @SuppressWarnings("unchecked")
    private void setD3020Data(String masterNo, HashMap<String, Object> searchMap) throws Exception {
        Map<String, Object> bizInfo = (Map<String, Object>) searchMap.get("bizInfo");
        if (bizInfo != null) {
            searchMap.put("masterNo", masterNo);
            Map<String, Object> checkParam = new HashMap<>();
            checkParam.put("tableName", "D3020");
            checkParam.put("masterNo", masterNo);
            int count = bizDao.checkDataExists(checkParam);
            if (count == 0) bizDao.insertD3020(searchMap);
            else            bizDao.updateD3020(searchMap);
        } else {
            log.error("D3020 저장 실패: bizInfo 데이터가 없습니다.");
        }
    }

    /** D40 단계 전용 저장 로직 [패턴 B] */
    @SuppressWarnings("unchecked")
    private void setD4010Data(String masterNo, HashMap<String, Object> searchMap) throws Exception {
        Map<String, Object> bizInfo = (Map<String, Object>) searchMap.get("bizInfo");
        if (bizInfo != null) {
            searchMap.put("masterNo", masterNo);
            Map<String, Object> checkParam = new HashMap<>();
            checkParam.put("tableName", "D4010");
            checkParam.put("masterNo", masterNo);
            int count = bizDao.checkDataExists(checkParam);
            if (count == 0) bizDao.insertD4010(searchMap);
            else            bizDao.updateD4010(searchMap);
        } else {
            log.error("D4010 저장 실패: bizInfo 데이터가 없습니다.");
        }
    }

    /** D50 단계 전용 저장 로직 [패턴 B] */
    @SuppressWarnings("unchecked")
    private void setD5010Data(String masterNo, HashMap<String, Object> searchMap) throws Exception {
        Map<String, Object> bizInfo = (Map<String, Object>) searchMap.get("bizInfo");
        if (bizInfo != null) {
            searchMap.put("masterNo", masterNo);
            Map<String, Object> checkParam = new HashMap<>();
            checkParam.put("tableName", "D5010");
            checkParam.put("masterNo", masterNo);
            int count = bizDao.checkDataExists(checkParam);
            if (count == 0) bizDao.insertD5010(searchMap);
            else            bizDao.updateD5010(searchMap);
        } else {
            log.error("D5010 저장 실패: bizInfo 데이터가 없습니다.");
        }
    }

    /** D60 단계 전용 저장 로직 [패턴 B] */
    @SuppressWarnings("unchecked")
    private void setD6010Data(String masterNo, HashMap<String, Object> searchMap) throws Exception {
        Map<String, Object> bizInfo = (Map<String, Object>) searchMap.get("bizInfo");
        if (bizInfo != null) {
            searchMap.put("masterNo", masterNo);
            Map<String, Object> checkParam = new HashMap<>();
            checkParam.put("tableName", "D6010");
            checkParam.put("masterNo", masterNo);
            int count = bizDao.checkDataExists(checkParam);
            if (count == 0) bizDao.insertD6010(searchMap);
            else            bizDao.updateD6010(searchMap);
        } else {
            log.error("D6010 저장 실패: bizInfo 데이터가 없습니다.");
        }
    }

    /** D70 단계 전용 저장 로직 [패턴 A] */
    @SuppressWarnings("unchecked")
    private void setD7010Data(String masterNo, Map<String, Object> searchMap) throws Exception {
        Map<String, Object> bizInfo = (Map<String, Object>) searchMap.get("bizInfo");
        if (bizInfo != null) {
            bizInfo.put("masterNo", masterNo);
            Map<String, Object> checkMap = new HashMap<>();
            checkMap.put("tableName", "D7010");
            checkMap.put("masterNo", masterNo);
            int exists = bizDao.checkDataExists(checkMap);
            if (exists == 0) bizDao.insertD7010(bizInfo);
            else             bizDao.updateD7010(bizInfo);
        }
    }
}
