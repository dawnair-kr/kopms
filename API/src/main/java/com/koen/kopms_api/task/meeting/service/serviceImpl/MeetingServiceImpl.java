package com.koen.kopms_api.task.meeting.service.serviceImpl;

import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.koen.kopms_api.model.vo.SessionContext;
import com.koen.kopms_api.task.meeting.dao.MeetingDao;
import com.koen.kopms_api.task.meeting.service.MeetingService;

import jakarta.inject.Provider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MeetingServiceImpl implements MeetingService {

    @Autowired
    private MeetingDao meetingDao;
    private final Provider<SessionContext> sessionProvider;

    // =====================================================================
    // [1] 회의실 신청 목록 조회
    // =====================================================================

    @Override
    public HashMap<String, Object> getMeetingList(HashMap<String, Object> searchMap) throws Exception {

        log.info("MeetingServiceImpl - getMeetingList searchMap: {}", searchMap);

        List<HashMap<String, Object>> meetingList = meetingDao.selectMeetingList(searchMap);

        HashMap<String, Object> resultMap = new HashMap<>();
        resultMap.put("meetingList", meetingList);
        return resultMap;
    }

    // =====================================================================
    // [2] 회의실 신청 단건 조회
    // =====================================================================

    @Override
    public HashMap<String, Object> getMeetingDetail(HashMap<String, Object> searchMap) throws Exception {

        log.info("MeetingServiceImpl - getMeetingDetail searchMap: {}", searchMap);

        HashMap<String, Object> meetingDetail = meetingDao.selectMeetingDetail(searchMap);

        HashMap<String, Object> resultMap = new HashMap<>();
        resultMap.put("meetingDetail", meetingDetail);
        return resultMap;
    }

    // =====================================================================
    // [3] 회의실 신청 저장 (등록/수정)
    // =====================================================================
    // rsvIdx 존재 여부로 등록/수정 분기
    // 세션에서 empno 추출하여 등록자/수정자 세팅
    // =====================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public HashMap<String, Object> saveMeeting(HashMap<String, Object> searchMap) throws Exception {

        log.info("MeetingServiceImpl - saveMeeting searchMap: {}", searchMap);

        String empno = sessionProvider.get().getEmpno();
        searchMap.put("empno", empno);

        String rsvIdx = (String) searchMap.get("rsvIdx");
        int affectedRows;

        if (rsvIdx == null || rsvIdx.isBlank()) {
            affectedRows = meetingDao.insertMeeting(searchMap);
        } else {
            affectedRows = meetingDao.updateMeeting(searchMap);
        }

        HashMap<String, Object> resultMap = new HashMap<>();
        resultMap.put("status",  affectedRows > 0 ? "success" : "fail");
        resultMap.put("message", affectedRows > 0 ? "저장되었습니다." : "저장에 실패하였습니다.");
        return resultMap;
    }

    // =====================================================================
    // [4] 회의실 신청 삭제
    // =====================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public HashMap<String, Object> deleteMeeting(HashMap<String, Object> searchMap) throws Exception {

        log.info("MeetingServiceImpl - deleteMeeting searchMap: {}", searchMap);

        int affectedRows = meetingDao.deleteMeeting(searchMap);

        HashMap<String, Object> resultMap = new HashMap<>();
        resultMap.put("status",  affectedRows > 0 ? "success" : "fail");
        resultMap.put("message", affectedRows > 0 ? "삭제되었습니다." : "삭제에 실패하였습니다.");
        return resultMap;
    }
}
