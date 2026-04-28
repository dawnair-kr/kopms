import lodash from 'lodash';

export function copyText(strText ) {
	/*
        클립보드로 텍스트 복사
		# div, p, a, h, span 등의 값
		const valOfDiv = document.getElementById("div").textContent;
	*/
	if( strText == null || strText.length == 0 ) strText = "";
	if( window.navigator.clipboard ) {
    
		window.navigator.clipboard.writeText(strText).then(() => {
			// 복사가 완료되면 호출된다.
			//console.log("복사완료",strText);
      // this.$dialog.message.success(
      //   "복사되었습니다.", //this.$t('message.emailValid')
      //   {itemout:1000}
      // );
		});
	} else {
      // execCommand 사용
      const textArea = document.createElement('textarea');
      textArea.value = strText||'';
      document.body.appendChild(textArea);
      textArea.select();
      textArea.setSelectionRange(0, 99999);
      try {
        document.execCommand('copy');
      } catch (err) {
        //console.error('복사 실패', err);
        // this.$dialog.message.success(
        //   "복사에 실패하였습니다.", //this.$t('message.emailValid')
        //   {itemout:1000}
        // );
      }
      textArea.setSelectionRange(0, 0);
      document.body.removeChild(textArea);
      //console.log("복사되었습니다",strText);
      // this.$dialog.message.success(
      //   "복사되었습니다.", //this.$t('message.emailValid')
      //   {itemout:1000}
      // );
	}
}

export function makeHtmlElement(tagName, ...attr) {
  const element = document.createElement(tagName);
  for (let prop of attr) {
    const [key, value] = Object.entries(prop)[0];

    if (key == 'textContent' || key == 'innerText') {
      element.textContent = value;
    } else {
      element.setAttribute(key, value);
    }
  }
  return element;
}

export function getAuthUrl(idc_name ) {
  /*
    kg inicis 결제시 결제 domain 유효성 체크용
  */
  const _AuthUrl = import.meta.env.VITE_API_INICIS_AUTHURL;
  const _fc = import.meta.env.VITE_API_INICIS_FC_PREFIX_URL;
  const _ks = import.meta.env.VITE_API_INICIS_KS_PREFIX_URL;
  const _stg = import.meta.env.VITE_API_INICIS_STG_PREFIX_URL;
    
  let url = _AuthUrl; //"stdpay.inicis.com/api/payAuth";
  let authUrl = "";
  switch (idc_name) {
      case 'fc':
          authUrl = _fc + url; // "https://fc"+ url;
          break;
      case 'ks':
          authUrl = _ks + url; // "https://ks"+ url;
          break;
      case 'stg':
          authUrl = _stg + url; // "https://stg"+ url;
          break;
      default:
          break;
  }
  return authUrl;
}

export function getNetCancel(idc_name ) {
  /*
    kg inicis 결제시 망취소 domain 유효성 체크용
  */
  const _netCancelUrl = import.meta.env.VITE_API_INICIS_NETCANCELURL;
  const _fc = import.meta.env.VITE_API_INICIS_FC_PREFIX_URL;
  const _ks = import.meta.env.VITE_API_INICIS_KS_PREFIX_URL;
  const _stg = import.meta.env.VITE_API_INICIS_STG_PREFIX_URL;
    
  let url = _netCancelUrl; ////"stdpay.inicis.com/api/netCancel";
  let netCancel = "";
  switch (idc_name) {
      case 'fc':
          netCancel = _fc+ url;
          break;
      case 'ks':
          netCancel = _ks+ url;
          break;
      case 'stg':
          netCancel = _stg+ url;
          break;
      default:
          break;
  }			
  return netCancel;
}


export function getApiBaseUrl() {

  console.log("util >> import.meta.env.MODE ~~~~~~ ::", import.meta.env.MODE);

  if (typeof location == "object") {

    // console.log("#######################################################");
    // console.log("NODE_ENV ::: ", import.meta.env);
    // console.log("#######################################################");
    // console.log("import.meta.env.VITE_API_PROTOCOL :: ", import.meta.env.VITE_API_PROTOCOL);
    // console.log("import.meta.env.VITE_API_HOST :: ", import.meta.env.VITE_API_HOST);
    // console.log("import.meta.env.VITE_API_PORT :: ", import.meta.env.VITE_API_PORT);
    // console.log("import.meta.env.VITE_API_BASE :: ", import.meta.env.VITE_API_BASE);
    // console.log("#######################################################");
    
    const env = `${process.env.NODE_ENV}`;
    const protocol = import.meta.env.VITE_API_PROTOCOL;
    const host = import.meta.env.VITE_API_HOST;
    const port = import.meta.env.VITE_API_PORT;
    const baseUrl = import.meta.env.VITE_API_BASE;    // 26.01.16 Add

    // console.log("#######################################################");
    // console.log("env ::: ", process.env.NODE_ENV);
    // console.log("#######################################################");
    // console.log("protocol :: ", protocol);
    // console.log("host :: ", host);
    // console.log("port :: ", port);
    // console.log("baseUrl :: ", baseUrl);
    // console.log("#######################################################");

    //return `${protocol}://${host}:${port}/INVOICEAPI/`;
    return `${protocol}://${host}:${port}${baseUrl}/`;
    // if (env === "dev ") {
    // if (env === "development ") {    // .. 필요 시 사용예정...
    //   // 개발자 PC 환경일 경우
    //   const protocol = import.meta.env.VITE_API_PROTOCOL;
    //   const host = import.meta.env.VITE_API_HOST;
    //   const port = import.meta.env.VITE_API_PORT;

    //   return `${protocol}://${host}:${port}/INVOICEAPI/`;
    // }
    // else if (env === "staging") {
    //   // TEST Server 환경일 경우
    //   return "http://192.168.0.120:21001/INVOICEAPI/";
    // }
    // else {
    //   // 운영 환경일 경우
    //   const protocol = import.meta.env.VITE_API_PROTOCOL;
    //   const host = import.meta.env.VITE_API_HOST;
    //   const port = import.meta.env.VITE_API_PORT;

    //   return `${protocol}://${host}:${port}/INVOICEAPI/`;
    // }

    // if (location.protocol == "https:") {
    //   return `${location.protocol}//${location.hostname}:${location.port}/INVOICEAPI/`;
    // }
    // else {
    //   if (location.hostname == "localhost" || location.hostname == "127.0.0.1" || location.hostname == "192.168.0.23") {
    //     return `${location.protocol}//${location.hostname}:21001/INVOICEAPI/`;
    //   }
    //   return `${location.protocol}//${location.hostname}:${process.env.API_PORT}/INVOICEAPI/`;
    // }
  }
  return null;
}
