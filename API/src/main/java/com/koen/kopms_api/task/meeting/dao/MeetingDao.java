package com.koen.kopms_api.task.meeting.dao;

import java.util.HashMap;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MeetingDao {

    /** 회의실 신청 목록 조회 */
    List<HashMap<String, Object>> selectMeetingList(HashMap<String, Object> searchMap) throws Exception;

    /** 회의실 신청 단건 조회 */
    HashMap<String, Object> selectMeetingDetail(HashMap<String, Object> searchMap) throws Exception;

    /** 회의실 신청 등록 */
    int insertMeeting(HashMap<String, Object> searchMap) throws Exception;

    /** 회의실 신청 수정 */
    int updateMeeting(HashMap<String, Object> searchMap) throws Exception;

    /** 회의실 신청 삭제 */
    int deleteMeeting(HashMap<String, Object> searchMap) throws Exception;
}
