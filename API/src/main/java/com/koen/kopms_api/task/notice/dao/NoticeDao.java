package com.koen.kopms_api.task.notice.dao;

import java.util.HashMap;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface NoticeDao {

    List<HashMap<String, Object>> selectNoticeList(HashMap<String, Object> searchMap) throws Exception;

    HashMap<String, Object> selectNoticeDetail(HashMap<String, Object> searchMap) throws Exception;

    int updateNoticeCnt(HashMap<String, Object> searchMap) throws Exception;

    int insertNotice(HashMap<String, Object> searchMap) throws Exception;

    int updateNotice(HashMap<String, Object> searchMap) throws Exception;

    int deleteNotice(HashMap<String, Object> searchMap) throws Exception;
}
