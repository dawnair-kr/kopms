package com.koen.kopms_api.task.nbm.service.serviceImpl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.koen.kopms_api.model.vo.SessionContext;
import com.koen.kopms_api.task.nbm.dao.NbmDao;
import com.koen.kopms_api.task.nbm.service.NbmService;

import jakarta.inject.Provider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class NbmServiceImpl implements NbmService {

    @Autowired
    private NbmDao nbmDao;
    private final Provider<SessionContext> sessionProvider;

    // =========================================================
    // 공통코드 조회
    // =========================================================

    @Override
    public HashMap<String, Object> getCodeList(HashMap<String, Object> searchMap) throws Exception {
        log.info("NbmServiceImpl - getCodeList : {}", searchMap);

        List<HashMap<String, Object>> codeList = nbmDao.selectCodeList(searchMap);

        Map<String, List<HashMap<String, Object>>> grouped = codeList.stream()
            .collect(Collectors.groupingBy(row -> String.valueOf(row.get("codeGroup"))));

        HashMap<String, Object> result = new HashMap<>(grouped);
        return result;
    }

    // =========================================================
    // 운영사업 목록 조회
    // =========================================================

    @Override
    public HashMap<String, Object> getNbmList(HashMap<String, Object> searchMap) throws Exception {
        log.info("NbmServiceImpl - getNbmList : {}", searchMap);

        List<HashMap<String, Object>> list = nbmDao.selectNbmList(searchMap);

        HashMap<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("totalCount", list.size());
        return result;
    }

    // =========================================================
    // 운영사업 상세 조회
    // =========================================================

    @Override
    public HashMap<String, Object> getNbmDetail(HashMap<String, Object> searchMap) throws Exception {
        log.info("NbmServiceImpl - getNbmDetail : {}", searchMap);

        HashMap<String, Object> bizMaster    = nbmDao.selectNbmMaster(searchMap);
        List<HashMap<String, Object>> members       = nbmDao.selectNbmMembers(searchMap);
        List<HashMap<String, Object>> contributions = nbmDao.selectContributions(searchMap);
        List<HashMap<String, Object>> progressList  = nbmDao.selectProgressList(searchMap);

        HashMap<String, Object> result = new HashMap<>();
        result.put("bizMaster",     bizMaster);
        result.put("members",       members);
        result.put("contributions", contributions);
        result.put("progressList",  progressList);
        return result;
    }

    // =========================================================
    // 운영사업 저장 (신규 등록 / 수정)
    // =========================================================

    @Override
    @Transactional
    @SuppressWarnings("unchecked")
    public HashMap<String, Object> saveNbm(HashMap<String, Object> saveMap) throws Exception {
        log.info("NbmServiceImpl - saveNbm : {}", saveMap);

        SessionContext session = sessionProvider.get();
        String userId = session.getEmpno();

        String masterNo = (String) saveMap.get("masterNo");
        boolean isNew   = (masterNo == null || masterNo.isBlank());

        if (isNew) {
            saveMap.put("regUserid", userId);
            nbmDao.insertNbmMaster(saveMap); // selectKey가 masterNo를 saveMap에 세팅
            masterNo = String.valueOf(saveMap.get("masterNo"));
        } else {
            saveMap.put("updateUserid", userId);
            nbmDao.updateNbmMaster(saveMap);
        }

        // 담당자: 전체 삭제 후 재등록
        nbmDao.deleteNbmMembers(masterNo);
        List<Map<String, Object>> members = (List<Map<String, Object>>) saveMap.get("members");
        if (members != null) {
            for (Map<String, Object> member : members) {
                Map<String, Object> param = new HashMap<>(member);
                param.put("masterNo",  masterNo);
                param.put("regUserid", userId);
                nbmDao.insertNbmMember(param);
            }
        }

        // 출자현황: 전체 삭제 후 재등록
        nbmDao.deleteContributions(masterNo);
		List<Map<String, Object>> contributions = (List<Map<String, Object>>) saveMap.get("contributions");
        if (contributions != null) {
            for (Map<String, Object> row : contributions) {
                Map<String, Object> param = new HashMap<>(row);
                param.put("masterNo",  masterNo);
                param.put("regUserid", userId);
                nbmDao.insertContribution(param);
            }
        }

        // 추진경과: 전체 삭제 후 재등록
        nbmDao.deleteProgressList(masterNo);
        List<Map<String, Object>> progressList = (List<Map<String, Object>>) saveMap.get("progressList");
        if (progressList != null) {
            for (Map<String, Object> row : progressList) {
                Map<String, Object> param = new HashMap<>(row);
                param.put("masterNo",  masterNo);
                param.put("regUserid", userId);
                nbmDao.insertProgress(param);
            }
        }

        HashMap<String, Object> result = new HashMap<>();
        result.put("masterNo", masterNo);
        return result;
    }

    // =========================================================
    // 운영사업 삭제
    // =========================================================

    @Override
    @Transactional
    public void deleteNbm(HashMap<String, Object> deleteMap) throws Exception {
        log.info("NbmServiceImpl - deleteNbm : {}", deleteMap);

        String masterNo = (String) deleteMap.get("masterNo");
        nbmDao.deleteNbmMaster(masterNo);
    }

    // =========================================================
    // 출자현황 목록 조회
    // =========================================================

    @Override
    public HashMap<String, Object> getInvestmentList(HashMap<String, Object> searchMap) throws Exception {
        log.info("NbmServiceImpl - getInvestmentList : {}", searchMap);

        List<HashMap<String, Object>> list = nbmDao.selectInvestmentList(searchMap);

        HashMap<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("totalCount", list.size());
        return result;
    }

    // =========================================================
    // 회사관리 (NBM_COMPANY_INFO)
    // =========================================================

    @Override
    public HashMap<String, Object> getCompanyList(HashMap<String, Object> searchMap) throws Exception {
        log.info("NbmServiceImpl - getCompanyList : {}", searchMap);

        List<HashMap<String, Object>> list = nbmDao.selectCompanyList(searchMap);

        HashMap<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("totalCount", list.size());
        return result;
    }

    @Override
    @Transactional
    public HashMap<String, Object> saveCompany(HashMap<String, Object> saveMap) throws Exception {
        log.info("NbmServiceImpl - saveCompany : {}", saveMap);

        SessionContext session = sessionProvider.get();
        String userId = session.getEmpno();

        String companyCode = (String) saveMap.get("companyCode");
        boolean isNew = (companyCode == null || companyCode.isBlank());

        HashMap<String, Object> result = new HashMap<>();
        if (isNew) {
            saveMap.put("regUserid", userId);
            nbmDao.insertCompany(saveMap);
            result.put("companyCode", saveMap.get("companyCode"));
        } else {
            nbmDao.updateCompany(saveMap);
            result.put("companyCode", companyCode);
        }
        return result;
    }

    @Override
    @Transactional
    public void deleteCompany(HashMap<String, Object> deleteMap) throws Exception {
        log.info("NbmServiceImpl - deleteCompany : {}", deleteMap);

        String companyCode = (String) deleteMap.get("companyCode");
        nbmDao.deleteCompany(companyCode);
    }

    // =========================================================
    // 조달현황
    // =========================================================

    @Override
    public HashMap<String, Object> getProcurementInvestList(HashMap<String, Object> searchMap) throws Exception {
        log.info("NbmServiceImpl - getProcurementInvestList : {}", searchMap);

        List<HashMap<String, Object>> list = nbmDao.selectProcurementInvestList(searchMap);

        HashMap<String, Object> result = new HashMap<>();
        result.put("list", list);
        return result;
    }

    @Override
    public HashMap<String, Object> getProcurementPfList(HashMap<String, Object> searchMap) throws Exception {
        log.info("NbmServiceImpl - getProcurementPfList : {}", searchMap);

        List<HashMap<String, Object>> list = nbmDao.selectProcurementPfList(searchMap);

        HashMap<String, Object> result = new HashMap<>();
        result.put("list", list);
        return result;
    }
}
