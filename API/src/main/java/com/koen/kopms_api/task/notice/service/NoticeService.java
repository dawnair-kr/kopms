package com.koen.kopms_api.task.notice.service;

import java.util.HashMap;

public interface NoticeService {

    HashMap<String, Object> getNoticeList(HashMap<String, Object> searchMap) throws Exception;

    HashMap<String, Object> getNoticeDetail(HashMap<String, Object> searchMap) throws Exception;

    int saveNotice(HashMap<String, Object> searchMap) throws Exception;

    int deleteNotice(HashMap<String, Object> searchMap) throws Exception;
}
