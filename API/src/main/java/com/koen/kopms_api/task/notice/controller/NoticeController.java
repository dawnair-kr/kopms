package com.koen.kopms_api.task.notice.controller;

import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.koen.kopms_api.common.response.CommonResponse;
import com.koen.kopms_api.common.util.MessageUtil;
import com.koen.kopms_api.config.i18n.ExceptionMsg;
import com.koen.kopms_api.model.vo.SessionContext;
import com.koen.kopms_api.task.notice.service.NoticeService;

import jakarta.inject.Inject;
import jakarta.inject.Provider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/kopms-api/notice")
public class NoticeController {

    @Autowired
    private NoticeService noticeService;

    @Inject
    Provider<SessionContext> sessionProvider;

    @Autowired
    private MessageUtil messageUtil;

    @PostMapping("/getNoticeList")
    public CommonResponse<?> getNoticeList(HttpServletRequest request,
            @RequestBody HashMap<String, Object> searchMap) throws Exception {
        log.info("NoticeController - getNoticeList : {}", searchMap);
        HashMap<String, Object> resultMap = noticeService.getNoticeList(searchMap);
        return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), resultMap);
    }

    @PostMapping("/getNoticeDetail")
    public CommonResponse<?> getNoticeDetail(HttpServletRequest request,
            @RequestBody HashMap<String, Object> searchMap) throws Exception {
        log.info("NoticeController - getNoticeDetail : {}", searchMap);
        HashMap<String, Object> resultMap = noticeService.getNoticeDetail(searchMap);
        return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), resultMap);
    }

    @PostMapping("/saveNotice")
    public CommonResponse<?> saveNotice(HttpServletRequest request,
            @RequestBody HashMap<String, Object> searchMap) throws Exception {
        log.info("NoticeController - saveNotice : {}", searchMap);
        SessionContext sessionContext = sessionProvider.get();
        searchMap.put("empId", sessionContext.getEmpno());
        searchMap.put("empName", sessionContext.getName());

        int rtn = noticeService.saveNotice(searchMap);
        HashMap<String, Object> resultMap = new HashMap<>();
        resultMap.put("isOk", rtn);
        return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), resultMap);
    }

    @PostMapping("/deleteNotice")
    public CommonResponse<?> deleteNotice(HttpServletRequest request,
            @RequestBody HashMap<String, Object> searchMap) throws Exception {
        log.info("NoticeController - deleteNotice : {}", searchMap);
        int rtn = noticeService.deleteNotice(searchMap);
        HashMap<String, Object> resultMap = new HashMap<>();
        resultMap.put("isOk", rtn);
        return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), resultMap);
    }
}
