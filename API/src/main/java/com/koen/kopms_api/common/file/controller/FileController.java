package com.koen.kopms_api.common.file.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.koen.kopms_api.common.file.service.FileService;
import com.koen.kopms_api.common.response.CommonResponse;
import com.koen.kopms_api.common.util.MessageUtil;
import com.koen.kopms_api.config.i18n.ExceptionMsg;
import com.koen.kopms_api.exception.BizException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

// [리팩토링] 제거된 import
//   - org.apache.commons.io.FileUtils      : download() 스트리밍 전환으로 불필요
//   - org.springframework.beans.annotation.Value : uploadDir 필드 제거로 불필요
//   - com.koen.kopms_api.model.vo.SessionContext : sessionProvider 필드 제거로 불필요
//   - jakarta.inject.Inject / Provider     : sessionProvider 필드 제거로 불필요

@Slf4j
@RestController
@RequestMapping("/kopms-api/file")
public class FileController {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private FileService fileService;

    @Autowired
    private MessageUtil messageUtil;

    // [리팩토링] 제거된 필드
    //
    // @Inject Provider<SessionContext> sessionProvider
    //   - 컨트롤러의 어느 메서드에서도 사용되지 않는 미사용 필드
    //   - 세션 처리는 FileServiceImpl에서 담당하므로 컨트롤러 레벨에서 불필요
    //
    // @Value("${file.upload-dir}") private String uploadDir
    //   - 파일 경로 조합은 FileServiceImpl에서만 처리하므로 컨트롤러에서 불필요

    @PostMapping("/upload")
    public CommonResponse<?> upload(
            @RequestPart(name = "upLoadDataInfo") String input,
            @RequestPart(name = "files", required = false) List<MultipartFile> files) throws Exception {

        HashMap<String, Object> searchMap = objectMapper.readValue(input, new TypeReference<HashMap<String, Object>>() {});
        log.info("FileController - upload - searchMap: {}", searchMap);

        // [리팩토링] 불필요한 빈 HashMap 초기화 제거
        //   기존: HashMap<String, Object> upLoadInfo = new HashMap<>(); upLoadInfo = fileService.upload(...)
        //   변경: 서비스 반환값을 바로 변수에 할당
        HashMap<String, Object> upLoadInfo = fileService.upload(searchMap, files);

        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), upLoadInfo);
    }

    @PostMapping("/deleteFile")
    public CommonResponse<?> deleteFile(HttpServletRequest request,
            @RequestBody HashMap<String, Object> searchMap) throws Exception {

        int rtn = fileService.deleteFile(searchMap);

        HashMap<String, Object> resultMap = new HashMap<>();
        resultMap.put("isOk", rtn);

        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), resultMap);
    }

    @PostMapping("/getFile")
    public CommonResponse<?> getFile(HttpServletRequest request,
            @RequestBody HashMap<String, Object> searchMap) throws Exception {

        HashMap<String, Object> files = fileService.getFile(searchMap);

        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), files);
    }

    @PostMapping("/linkFile")
    public CommonResponse<?> linkFile(HttpServletRequest request,
            @RequestBody HashMap<String, Object> searchMap) throws Exception {

        HashMap<String, Object> result = fileService.linkFile(searchMap);

        return new CommonResponse<>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), result);
    }

    @PostMapping("/download")
    public void download(HttpServletRequest request, HttpServletResponse httpServletResponse,
            @RequestBody HashMap<String, Object> searchMap) throws Exception {

        String fileSeq  = (String) searchMap.get("fileSeq");
        String fileName = (String) searchMap.get("fileName");

        File downloadFile = new File(fileSeq);

        if (!downloadFile.exists() || !downloadFile.isFile()) {
            log.error("파일이 존재하지 않습니다: {}", fileSeq);
            throw new BizException(ExceptionMsg.ERR_FILE_NOT_FOUND);
        }

        // [리팩토링] FileUtils.readFileToByteArray() → 8KB 버퍼 스트리밍으로 전환
        //   기존: FileUtils.readFileToByteArray()로 파일 전체를 JVM 힙에 적재
        //         → 대용량 파일(수백 MB)이 업로드되면 OutOfMemoryError 위험
        //   변경: FileInputStream + 8KB 버퍼로 청크 단위 스트리밍
        //         → 파일 크기와 무관하게 메모리 사용량 일정 유지
        //   참고: downloadZip()은 이미 스트리밍 방식으로 구현되어 있었음
        httpServletResponse.setContentType("application/octet-stream");
        httpServletResponse.setContentLengthLong(downloadFile.length());

        fileName = URLEncoder.encode(fileName, "UTF-8").replaceAll("\\+", "%20");
        httpServletResponse.setHeader("Content-Disposition",
                "attachment; filename=\"" + fileName + "\"; filename*=UTF-8''" + fileName);
        httpServletResponse.setHeader("Content-Transfer-Encoding", "binary");

        try (FileInputStream fis = new FileInputStream(downloadFile);
             OutputStream os = httpServletResponse.getOutputStream()) {
            byte[] buffer = new byte[8192];
            int len;
            while ((len = fis.read(buffer)) != -1) {
                os.write(buffer, 0, len);
            }
            os.flush();
        }
    }

    @PostMapping("/downloadZip")
    public void downloadZip(HttpServletResponse httpServletResponse,
            @RequestBody List<HashMap<String, Object>> fileSeqList) throws Exception {

        if (fileSeqList == null || fileSeqList.isEmpty()) {
            throw new BizException(ExceptionMsg.ERR_FILE_NOT_FOUND);
        }

        httpServletResponse.setHeader("Access-Control-Expose-Headers", "X-Fail-Files, Content-Disposition");

        // 실패 파일 수집 및 유효 파일 필터링
        List<String> failList = new ArrayList<>();
        List<HashMap<String, Object>> validFiles = new ArrayList<>();

        for (HashMap<String, Object> fileInfo : fileSeqList) {

            String filePath = (String) fileInfo.get("fileSeq");
            String fileName = (String) fileInfo.get("fileName");

            if (filePath == null || fileName == null) {
                failList.add(fileName);
                continue;
            }

            File file = new File(filePath);

            if (!file.exists() || !file.isFile()) {
                log.warn("파일 없음: {}", filePath);
                failList.add(fileName);
                continue;
            }

            validFiles.add(fileInfo);
        }

        if (validFiles.isEmpty()) {
            throw new BizException(ExceptionMsg.ERR_FILE_NOT_FOUND);
        }

        // [리팩토링] X-Fail-Files 헤더 중복 세팅 제거
        //   기존: validFiles.size()==1 블록과 ZIP 블록 각각에서 동일한 헤더를 중복 세팅
        //   변경: 분기 이전에 한 번만 세팅 — 단일 다운로드/ZIP 공통 적용
        if (!failList.isEmpty()) {
            String failJson = URLEncoder.encode(
                    new ObjectMapper().writeValueAsString(failList), "UTF-8");
            httpServletResponse.setHeader("X-Fail-Files", failJson);
        }

        // 파일 1개 → 단일 다운로드
        if (validFiles.size() == 1) {

            HashMap<String, Object> fileInfo = validFiles.get(0);
            String filePath = (String) fileInfo.get("fileSeq");
            String fileName = (String) fileInfo.get("fileName");

            File file = new File(filePath);

            httpServletResponse.setContentType("application/octet-stream");

            fileName = URLEncoder.encode(fileName, "UTF-8").replaceAll("\\+", "%20");
            log.info("FileController - downloadZip(단건) - fileName: {}", fileName);
            httpServletResponse.setHeader("Content-Disposition",
                    "attachment; filename=\"" + fileName + "\"; filename*=UTF-8''" + fileName);

            try (FileInputStream fis = new FileInputStream(file);
                 OutputStream os = httpServletResponse.getOutputStream()) {
                byte[] buffer = new byte[8192];
                int len;
                while ((len = fis.read(buffer)) != -1) {
                    os.write(buffer, 0, len);
                }
                os.flush();
            }

            return;
        }

        // 파일 복수 → ZIP 다운로드
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS"));
        String zipName = URLEncoder.encode("files_" + timestamp + ".zip", "UTF-8").replaceAll("\\+", "%20");

        httpServletResponse.setContentType("application/zip");
        httpServletResponse.setHeader("Content-Disposition",
                "attachment; filename=\"" + zipName + "\"; filename*=UTF-8''" + zipName);

        Set<String> nameSet = new HashSet<>();

        try (ZipOutputStream zos = new ZipOutputStream(httpServletResponse.getOutputStream())) {

            for (HashMap<String, Object> fileInfo : validFiles) {

                String filePath = (String) fileInfo.get("fileSeq");
                String fileName = (String) fileInfo.get("fileName");

                File file = new File(filePath);

                // 중복 파일명 처리
                String entryName = fileName;
                int count = 1;
                while (nameSet.contains(entryName)) {
                    entryName = "(" + count++ + ")" + fileName;
                }
                nameSet.add(entryName);

                zos.putNextEntry(new ZipEntry(entryName));

                try (FileInputStream fis = new FileInputStream(file)) {
                    byte[] buffer = new byte[8192];
                    int len;
                    while ((len = fis.read(buffer)) != -1) {
                        zos.write(buffer, 0, len);
                    }
                }

                zos.closeEntry();
            }

            zos.finish();
        }
    }
}
