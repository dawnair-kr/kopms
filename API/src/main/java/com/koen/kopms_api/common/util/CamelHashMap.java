package com.koen.kopms_api.common.util;

import java.util.HashMap;

//import com.google.common.base.CaseFormat;

//@SuppressWarnings("rawtypes")
//public class CamelHashMap extends HashMap {
//    private static final long serialVersionUID = 1l;
//
//    @SuppressWarnings("unchecked")
//	public Object put(Object key, Object value) {
//        return super.put(CaseFormat.UPPER_UNDERSCORE.to(CaseFormat.LOWER_CAMEL, (String) key), value);
//    }
//}

public class CamelHashMap extends HashMap<String, Object> {
	
	@Override
    public Object put(String key, Object value) {
        return super.put(toCamelCase(key), value);
    }
	
	private String toCamelCase(String target) {
		// 이미 카멜케이스거나 변환할 필요가 없는 경우 처리
		if (target.indexOf('_') < 0 && Character.isLowerCase(target.charAt(0))) {
			return target;
		}
	
		StringBuilder result = new StringBuilder();
		boolean nextUpper = false;
		int len = target.length();
	
		for (int i = 0; i < len; i++) {
			char currentChar = target.charAt(i);
			if (currentChar == '_') {
				nextUpper = true;
			} else {
				if (nextUpper) {
					result.append(Character.toUpperCase(currentChar));
					nextUpper = false;
				} else {
					result.append(Character.toLowerCase(currentChar));
				}
			}
		}
		return result.toString();
	}    
	
}
