package com.koen.kopms_api.task.meeting.controller;

import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.koen.kopms_api.common.response.CommonResponse;
import com.koen.kopms_api.common.util.MessageUtil;
import com.koen.kopms_api.config.i18n.ExceptionMsg;
import com.koen.kopms_api.task.meeting.service.MeetingService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

/**
 * 회의실 신청 컨트롤러
 * API 기본 경로: /meeting
 */
@Slf4j
@RestController
@RequestMapping("/kopms-api/meeting")
public class MeetingController {

    @Autowired
    private MeetingService meetingService;

    @Autowired
    private MessageUtil messageUtil;

    /**
     * 회의실 신청 목록 조회
     * POST /meeting/getMeetingList
     */
    @PostMapping("/getMeetingList")
    public CommonResponse<?> getMeetingList(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

        log.info("MeetingController - getMeetingList searchMap: {}", searchMap);

        HashMap<String, Object> responseMap = meetingService.getMeetingList(searchMap);

        return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    }

    /**
     * 회의실 신청 단건 조회
     * POST /meeting/getMeetingDetail
     */
    @PostMapping("/getMeetingDetail")
    public CommonResponse<?> getMeetingDetail(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

        log.info("MeetingController - getMeetingDetail searchMap: {}", searchMap);

        HashMap<String, Object> responseMap = meetingService.getMeetingDetail(searchMap);

        return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    }

    /**
     * 회의실 신청 저장 (등록/수정)
     * POST /meeting/saveMeeting
     */
    @PostMapping("/saveMeeting")
    public CommonResponse<?> saveMeeting(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

        log.info("MeetingController - saveMeeting searchMap: {}", searchMap);

        HashMap<String, Object> responseMap = meetingService.saveMeeting(searchMap);

        return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    }

    /**
     * 회의실 신청 삭제
     * POST /meeting/deleteMeeting
     */
    @PostMapping("/deleteMeeting")
    public CommonResponse<?> deleteMeeting(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

        log.info("MeetingController - deleteMeeting searchMap: {}", searchMap);

        HashMap<String, Object> responseMap = meetingService.deleteMeeting(searchMap);

        return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), responseMap);
    }
}
