package com.koen.kopms_api.task.notice.service.serviceImpl;

import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.koen.kopms_api.task.notice.dao.NoticeDao;
import com.koen.kopms_api.task.notice.service.NoticeService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class NoticeServiceImpl implements NoticeService {

    @Autowired
    private NoticeDao noticeDao;

    @Override
    public HashMap<String, Object> getNoticeList(HashMap<String, Object> searchMap) throws Exception {
        List<HashMap<String, Object>> noticeList = noticeDao.selectNoticeList(searchMap);
        HashMap<String, Object> resultMap = new HashMap<>();
        resultMap.put("noticeList", noticeList);
        return resultMap;
    }

    @Override
    @Transactional
    public HashMap<String, Object> getNoticeDetail(HashMap<String, Object> searchMap) throws Exception {
        noticeDao.updateNoticeCnt(searchMap);
        HashMap<String, Object> detail = noticeDao.selectNoticeDetail(searchMap);
        HashMap<String, Object> resultMap = new HashMap<>();
        resultMap.put("notice", detail);
        return resultMap;
    }

    @Override
    @Transactional
    public int saveNotice(HashMap<String, Object> searchMap) throws Exception {
        Object noticeSeq = searchMap.get("noticeSeq");
        if (noticeSeq != null && !noticeSeq.toString().isEmpty()) {
            return noticeDao.updateNotice(searchMap);
        } else {
            return noticeDao.insertNotice(searchMap);
        }
    }

    @Override
    @Transactional
    public int deleteNotice(HashMap<String, Object> searchMap) throws Exception {
        return noticeDao.deleteNotice(searchMap);
    }
}
