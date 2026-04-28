import dayjs from 'dayjs';

export function isValidEmail(email) {

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  return emailRegex.test(email)
}

// 8자리 이상 문자, 숫자, 특수문자를 포함하여 입력해 주세요.";
// 값이 유효하지 않습니다";
export function isValidPassword(password) {

  if (!password || !password.length) {
    return true;
  }
  if (!/^(?=\S*$)(?=.*\d{1,50})(?=.*[~`!@#$%\^&*()-+=]{1,50})(?=.*[a-zA-Z]{1,50}).{8,50}$/.test(password)) {
    return false;
  }
  return true;
}

export function generatedNumber(rule) {

  // 0010	YYYY
  // 0020	YYYY-MM
  // 0030	YYYY-MM-DD
  // 9999	사용안함

  const clientInitial = (rule.useClientInitial) ? "CLIENT" : "";
  const prefix = rule.prefix || "";
  const postfix = rule.postfix || "";
  const dash = rule.dash || "";
  const dateDash = (rule.useDateDash) ? dash : "";
  const padCnt = rule.padCnt;
  const padChar = rule.padChar || "";

  let yyyy = dayjs().format("YYYY");
  let mm = dayjs().format("MM");
  let dd = dayjs().format("DD");
  let generateNumber = "";
  let number = String(1).padStart(padCnt, padChar);

  // Prefix가 있으면
  if (!prefix || prefix == "") {
    generateNumber = "";
  }
  else if (prefix && prefix != "") {
    generateNumber = prefix;
  }

  // 클라이언트 이니셜이 있으면 
  if (!clientInitial || clientInitial == "") {
    if (generateNumber == "") {
      generateNumber = "";
    }
    else {
      generateNumber = generateNumber;
    }
  }
  else if (clientInitial && clientInitial != "") {
    if (generateNumber == "") {
      generateNumber = "CLIENT";
    }
    else {
      generateNumber = generateNumber + dash + "CLIENT";
    }
  }

  if (rule.type == "0010") {
    // Type이 '0010'(yyyy) 이면
    if (generateNumber == "") {
      generateNumber = yyyy;
    }
    else {
      generateNumber = generateNumber + dash + yyyy;
    }
  }
  else if (rule.type == "0020") {
    // Type이 '0020'(yyyy-mm) 이면
    if (generateNumber == "") {
      generateNumber = yyyy + dateDash + mm;
    }
    else {
      generateNumber = generateNumber + dash + yyyy + dateDash + mm;
    }
  }
  else if (rule.type == "0030") {
    // Type이 '0020'(yyyy-mm-dd) 이면
    if (generateNumber == "") {
      generateNumber = yyyy + dateDash + mm + dateDash + dd;
    }
    else {
      generateNumber = generateNumber + dash + yyyy + dateDash + mm + dateDash + dd;
    }
  }
  else {
    // Type이 '9999'(Un Use) 이면
    generateNumber = generateNumber;
  }
  // padCnt
  // 순번
  if (generateNumber == "") {
    generateNumber = number;
  }
  else {
    generateNumber = generateNumber + dash + number;
  }

  // Prefix가 있으면
  if (!postfix || postfix == "") {
    generateNumber = generateNumber;
  }
  else if (postfix && postfix != "") {
    generateNumber = generateNumber + dash + postfix;
  }

  return generateNumber;
}