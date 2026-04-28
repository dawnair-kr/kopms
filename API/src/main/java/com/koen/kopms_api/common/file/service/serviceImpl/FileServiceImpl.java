package com.koen.kopms_api.common.file.service.serviceImpl;

import java.io.File;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.koen.kopms_api.common.file.dao.FileDao;
import com.koen.kopms_api.common.file.service.FileService;
import com.koen.kopms_api.common.generator.UuidGenerator;
import com.koen.kopms_api.config.i18n.ExceptionMsg;
import com.koen.kopms_api.exception.BizException;
import com.koen.kopms_api.model.vo.SessionContext;

import jakarta.inject.Provider;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

	private final Provider<SessionContext> sessionProvider;
    
	private final FileDao fileDao;        
    
    @Value("${file.upload-dir}")
    private String uploadDir;
    
    @Override
    @Transactional
    public HashMap<String, Object> upload(HashMap<String, Object> searchMap, List<MultipartFile> files) throws Exception {
    	
    	//log.info("FileServiceImpl >>>> 현재 적용된 uploadDir : {}" , uploadDir);
    	log.info("FileServiceImpl - upload - searchMap: {}", searchMap);
    	
    	/**
    	 * 0. upload-dir : /tech/attach/PDMN/upload/
    	 * 1. attachFileSeq : 12 - "A" + YYYY + 0004147 [ATTACH_SEQ]	, 'A' - 첨부, 'R' -관련
    	 * 2. orderNo	: 일련번호
    	 * 3. fileSeq	: filePath + masterNo Dir + YYYYMMDDhhmmss + '.' + masterNo + '.' + t	imestamp + '.hwp'
    	 * /tech/attach/PDMN/upload/OM202602000809/20260213101955.OM202602000809.03062275.pdf
    	 */
    	    	
    	if (files == null || files.isEmpty()) {
    	    //log.info("업로드 파일 없음");
    	    throw new BizException(ExceptionMsg.ERR_FILE_NOT_FOUND);
    	}
    	
    	HashMap<String, Object> resultMap = new HashMap<String, Object>();
    	
    	SessionContext sessionContext = sessionProvider.get();
		String writerId = sessionContext.getEmpno();
		//log.info("FileServiceImpl - upload - writerId: {}", writerId);
		
    	// ----------------------------
        // 기본 데이터
        // ----------------------------		
        String attachFileSeq = (String) searchMap.get("attachFileSeq");
        //String orderNo = (String) searchMap.get("orderNo");
        String masterNo = (String) searchMap.get("masterNo");
        String taskType = (String) searchMap.get("taskType");
        String taskCode = (String) searchMap.get("taskCode");
        String fileGubun = (String) searchMap.get("fileGubun");		// A- 첨부, R - 관련파일, D: 자료실, I : image
        String title = (String) searchMap.get("title");        
        String job = (String) searchMap.get("job");		// Biz : 사업업무, Gen : 미확정 - 자료실, 게시판,.. 등등 구분 용도  
        
        String jobPath = "GEN";
        if ( !"Biz".equals(job) ) {
        	jobPath = job; 
        }
        
        if ( masterNo == null || masterNo.isEmpty() ) {
        	jobPath = jobPath + '/';
        } else {
        	jobPath = masterNo + '/';
        }		
        // 디렉토리 채크
		String uploadPath = uploadDir + jobPath;
		log.info("FileServiceImpl - upload - uploadPath: {}", uploadPath);
		Path dirPath = Paths.get(uploadPath);
		// 디렉토리 생성
		if ( !Files.exists(dirPath) ) {
		    Files.createDirectories(dirPath);
		}
        
		// attachFileSeq 채번
        if (attachFileSeq == null || attachFileSeq.isEmpty()) {
        	long attachSeq = fileDao.selectAttachSeq();
        	attachFileSeq = UuidGenerator.genAttachFileSeq(fileGubun, attachSeq);
        	log.info("FileServiceImpl - attachFileSeq 생성.... : {}", attachFileSeq);
        }
        
        // ----------------------------
        //  신규 파일 저장
        // ----------------------------        
        List<HashMap<String, Object>> uploadfiles = (List<HashMap<String, Object>>) searchMap.get("uploadfiles");
        if (uploadfiles != null) {
	        for (int i = 0; i < uploadfiles.size(); i++) {
	        	
	        	HashMap<String, Object> uploadfile = uploadfiles.get(i);
	        	String status = (String) uploadfile.get("status");	        	
	        	log.info("FileServiceImpl - uploadfile - status: {}", status );
	        	
	        	if ( "upload".equals(status) ) {
		        	MultipartFile file = files.get(i);
					String fileName = file.getOriginalFilename();
					String fileExt = fileName.substring(fileName.lastIndexOf(".") + 1);
					long fileSize = file.getSize();
					
					log.info("FileServiceImpl - file - fileName: {}", fileName );
					log.info("FileServiceImpl - file - masterNo: {}", masterNo );
					
					//String jobType = "GEN";
					String jobType = jobPath.replaceAll("/", ".");
					if ( masterNo == null || masterNo.isEmpty() ) {
			        } else {
			        	jobType = masterNo;
			        }
					
					// FileSeq
					String initFileSeq = UuidGenerator.genFileSeq(uploadPath, jobType, fileExt);
					log.info("FileServiceImpl - file - initFileSeq: {}", initFileSeq );					
					// 경로 조합 : path + file name
					Path targetPath = dirPath.resolve(initFileSeq);
					// 파일 저장
					try (InputStream inputStream = file.getInputStream()) {
		                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
		            }
					
					// DB 저장 ~~~~~
					HashMap<String, Object> insertParam = new HashMap<String, Object>();
					insertParam.put("attachFileSeq", attachFileSeq);
					insertParam.put("fileSeq", initFileSeq);
					insertParam.put("fileName", fileName);
					insertParam.put("masterNo", masterNo);
					insertParam.put("taskType", taskType);
					insertParam.put("taskCode", taskCode);
					insertParam.put("writerId", writerId);
					insertParam.put("fileSize", fileSize);
					insertParam.put("fileGubun", fileGubun);
					insertParam.put("title", uploadfile.get("title"));
			        
					//log.info("FileServiceImpl - insertParam {}", insertParam );
					
					fileDao.insertFile(insertParam);
	        	
	        	} else {	        		
	        	}	        	
	        	
	        }
        }
        
        // 결과반환
        HashMap<String, Object> fileParam = new HashMap<String, Object>();
        fileParam.put("attachFileSeq", attachFileSeq);
        
        List<HashMap<String, Object>> fileList = fileDao.selectFile(fileParam);
        
        // fileGubun == Image Url 변환
        applyImageUrl(fileList);
        
        // log.info("FileServiceImpl - fileList {}", fileList );
        
        resultMap.put("fileList", fileList);
        
        return resultMap;
        
    }
    
    // ============================
    // 파일 삭제 (물리)
    // ============================
    private void deletePhysicalFile(String fileSeq) {

        try {
            File dir = new File(uploadDir);

            File[] files = dir.listFiles((d, name) -> name.startsWith(fileSeq));

            if (files != null) {
                for (File f : files) {
                    f.delete();
                }
            }

        } catch (Exception e) {
            // 로그만 남기고 진행 (중요)
            e.printStackTrace();
        }
    }
	
    @Override
	public int deleteFile(HashMap<String, Object> searchMap) throws Exception {
    	
        // 세션에서 사번 추출 → 작성자 세팅
        String empno = sessionProvider.get().getEmpno();
        searchMap.put("writerId", empno);  	
    	
        //log.info("FileServiceImpl - deleteFile - searchMap: {}", searchMap );
        
    	int result = fileDao.deleteFile(searchMap);
    	
    	// 물리 파일 삭제
//      //deletePhysicalFile(fileSeq);
		
		return result;
	}
    
	// 파일 조회
	@Override
	public HashMap<String, Object> getFile(HashMap<String, Object> searchMap) throws Exception {
		
		//log.info("FileServiceImpl - getFile for searchMap: {}", searchMap);	

		List<HashMap<String, Object>> fileList = fileDao.selectFile(searchMap);
		
		// fileGubun == Image Url 변환
		applyImageUrl(fileList);
        
        // log.info("FileServiceImpl - fileList {}", fileList );
		
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("fileList", fileList);
		
		return resultMap;
	}
    
	// fileGubun='I' (이미지) 인 항목만 절대 경로(fileSeq)를 정적 URL(/upload/...)로 변환
    private void applyImageUrl(List<HashMap<String, Object>> fileList) {
        for (HashMap<String, Object> file : fileList) {
            String fileGubun    = (String) file.get("fileGubun");
            String fileFullPath = (String) file.get("fileSeq");
            if (fileFullPath != null && "I".equals(fileGubun)) {
                String relativePath = fileFullPath.replace(uploadDir, "").replace("\\", "/");
                file.put("fileUrl", "/upload/" + relativePath);
            }
        }
    }

	@Override
	@Transactional
	public HashMap<String, Object> linkFile(HashMap<String, Object> params) throws Exception {

		String writerId = sessionProvider.get().getEmpno();

		String attachFileSeq = (String) params.get("attachFileSeq");
		String fileGubun     = (String) params.get("fileGubun");

		if (attachFileSeq == null || attachFileSeq.isEmpty()) {
			long attachSeq = fileDao.selectAttachSeq();
			attachFileSeq  = UuidGenerator.genAttachFileSeq(fileGubun, attachSeq);
		}

		HashMap<String, Object> insertParam = new HashMap<>();
		insertParam.put("attachFileSeq", attachFileSeq);
		insertParam.put("fileSeq",       params.get("fileSeq"));
		insertParam.put("fileName",      params.get("fileName"));
		insertParam.put("fileSize",      params.get("fileSize"));
		insertParam.put("masterNo",      params.get("masterNo"));
		insertParam.put("taskType",      params.get("taskType"));
		insertParam.put("taskCode",      params.get("taskCode"));
		insertParam.put("fileGubun",     fileGubun);
		insertParam.put("title",         params.getOrDefault("title", params.get("fileName")));
		insertParam.put("writerId",      writerId);

		fileDao.insertFile(insertParam);

		HashMap<String, Object> fileParam = new HashMap<>();
		fileParam.put("attachFileSeq", attachFileSeq);
		List<HashMap<String, Object>> fileList = fileDao.selectFile(fileParam);
		applyImageUrl(fileList);

		HashMap<String, Object> resultMap = new HashMap<>();
		resultMap.put("fileList", fileList);
		return resultMap;
	}

	/**
	 * 파일 → Base64 변환
	 * @param filePath
	 * @return
	 * @throws Exception
	 */
	public String convertToBase64(String filePath) throws Exception {

	    byte[] fileBytes = Files.readAllBytes(Path.of(filePath));
	    String base64 = Base64.getEncoder().encodeToString(fileBytes);

	    return base64;
	}
	
}