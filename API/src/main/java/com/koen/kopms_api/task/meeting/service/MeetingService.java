package com.koen.kopms_api.task.meeting.service;

import java.util.HashMap;

public interface MeetingService {

    /** 회의실 신청 목록 조회 */
    HashMap<String, Object> getMeetingList(HashMap<String, Object> searchMap) throws Exception;

    /** 회의실 신청 단건 조회 */
    HashMap<String, Object> getMeetingDetail(HashMap<String, Object> searchMap) throws Exception;

    /** 회의실 신청 저장 (등록/수정) */
    HashMap<String, Object> saveMeeting(HashMap<String, Object> searchMap) throws Exception;

    /** 회의실 신청 삭제 */
    HashMap<String, Object> deleteMeeting(HashMap<String, Object> searchMap) throws Exception;
}
