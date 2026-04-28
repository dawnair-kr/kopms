import CryptoJS from 'crypto-js';

// var secretKey = 'abcdefghijklmnopqrstuvwxyzabcdef';
// var iv = '1234567890123456';

const key = "QlJFTi1JTlZPSUNFMjAyNA==";
const iv = "MjAyNEJSRU4tSU5WT0lDRQ==";

const key256 = "QlJFTi1JTlZPSUNFMjAyNDIwMjRCUkVOLUlOVk9JQ0U=";

export const encryptAES128 = (encriptSource) => {

  const encodeKey = atob(key);
  const encodeIv = atob(iv);

  const cipher = CryptoJS.AES.encrypt(encriptSource, CryptoJS.enc.Utf8.parse(encodeKey), {
    iv: CryptoJS.enc.Utf8.parse(encodeIv),
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });

  return cipher.toString();
};

export const decryptAES128 = (decriptSource) => {

  const encodeKey = atob(key);
  const encodeIv = atob(iv);

  const cipher = CryptoJS.AES.decrypt(decriptSource, CryptoJS.enc.Utf8.parse(encodeKey), {
    iv: CryptoJS.enc.Utf8.parse(encodeIv),
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });

  var encText = cipher.toString(CryptoJS.enc.Utf8);
  return encText;
};

export const encryptAES256 = (encriptSource) => {

  const encodeKey = atob(key256);
  const encodeIv = atob(iv);

  const cipher = CryptoJS.AES.encrypt(encriptSource, CryptoJS.enc.Utf8.parse(encodeKey), {
    iv: CryptoJS.enc.Utf8.parse(encodeIv),
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });

  return cipher.toString();
};

export const decryptAES256 = (decriptSource) => {

  const encodeKey = atob(key256);
  const encodeIv = atob(iv);

  const cipher = CryptoJS.AES.decrypt(decriptSource, CryptoJS.enc.Utf8.parse(encodeKey), {
    iv: CryptoJS.enc.Utf8.parse(encodeIv),
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });

  var encText = cipher.toString(CryptoJS.enc.Utf8);
  return encText;
};

export const encrypt = (decodeKey, decodeIv, encriptSource) => {

  const encodeKey = atob(decodeKey);
  const encodeIv = atob(decodeIv);

  const cipher = CryptoJS.AES.encrypt(encriptSource, CryptoJS.enc.Utf8.parse(encodeKey), {
    iv: CryptoJS.enc.Utf8.parse(encodeIv),
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });

  return cipher.toString();
};

export const decrypt = (decodeKey, decodeIv, decriptSource) => {

  const encodeKey = atob(decodeKey);
  const encodeIv = atob(decodeIv);

  const cipher = CryptoJS.AES.decrypt(decriptSource, CryptoJS.enc.Utf8.parse(encodeKey), {
    iv: CryptoJS.enc.Utf8.parse(encodeIv),
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });

  var encText = cipher.toString(CryptoJS.enc.Utf8);
  return encText;
};

export default {
  encryptAES128,
  decryptAES128,
  encryptAES256,
  decryptAES256,
  encrypt,
  decrypt
};