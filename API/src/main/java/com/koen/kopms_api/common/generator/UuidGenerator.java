package com.koen.kopms_api.common.generator;

import java.math.BigInteger;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public class UuidGenerator {
	
	/*
	 * UUID 채번 : 외부 평가위원용
	 * 숫치형 문자데이터 8자리
	 */
	public static String generate8Digit() {

        UUID uuid = UUID.randomUUID();
        BigInteger bigInt = new BigInteger(uuid.toString().replace("-", ""), 16);
        String numeric = bigInt.toString();

        return numeric.substring(0, 8);
    }	
	
	/*
	 * attachFileSeq 
	 */
	public static String genAttachFileSeq(String type, long seq) {
		
		return type 
			        + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy"))
			        + String.format("%07d", seq);
    }
	
	/*
	 * fileSeq 
	 */
	public static String genFileSeq(String uploadPath, String masterNo, String fileExt) {
		
		// UUID → 숫자 변환 (16진수)
		UUID uuid = UUID.randomUUID();
        BigInteger bigInt = new BigInteger(uuid.toString().replace("-", ""), 16);
        String numeric = bigInt.toString().substring(0, 8);
        
        // 확장자 정리
        String ext = fileExt.startsWith(".") ? fileExt.substring(1) : fileExt;
        
        // 시간 생성
        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS"));
        
        String masterNoCvt = masterNo.replace("/", "");
        
        // 최종 생성
        // C:/tech/attach/PDMN/upload/GEN/20260327110530987.A20260001.83927465.txt
        return uploadPath  
                + timestamp + "." 
               // + masterNo + "."
                + masterNoCvt + "."
                + numeric + "." 
                + ext;
    }
}
