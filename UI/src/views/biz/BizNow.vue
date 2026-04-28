<template no-gutters>
  <v-container class="main-page-wrapper">
    <v-btn  v-if="isButtonTest" variant="flat" text="화면링크" @click="goLink"></v-btn>
    <iframe
      v-if="currentUrl"
      :key="selectMenuStore.selectMenuInfo?.menuNo"
      :src="currentUrl"
      class="biz-frame"
    />
  </v-container>
</template>

<script setup>
import { watch, onMounted, onUnmounted, computed, ref, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { useSelectMenuStore } from '@/store/selectMenuStore.js';
import ganttChart from "@/popups/biz/GanttChart.vue";
const { proxy } = getCurrentInstance();
const router = useRouter();
const selectMenuStore = useSelectMenuStore();

const wembToken = ref('');
const nodeEnv = ref('');
const isButtonTest = ref(false);

const AREA_CODE_MAP = {
  '2100': 'RE',  // 재생에너지 사업현황
  '2402': 'RE2', // 재생에너지 사업분석>데이타분석
  '3100': 'NE',  // 신에너지
  '4100': 'OB',  // 해외사업
};

const URL_MAP_TOKEN = {
  'RE':  `${import.meta.env.VITE_BOARD_URL}renobit/ssoCheck.jsp?token={}&pname=main_standard`, // 재생에너지사업 > 사업현황
  'RE2': `${import.meta.env.VITE_BOARD_URL}renobit/ssoCheck.jsp?token={}&pname=measurement_standard`, // 재생에너지사업 > 사업분석 > 데이터분석
  'NE': `${import.meta.env.VITE_BOARD_URL}renobit/ssoCheck.jsp?token={}&pname=renewableEnergy_standard`, // 신에너지사업 > 사업현황
  'OB': `${import.meta.env.VITE_BOARD_URL}renobit/ssoCheck.jsp?token={}&pname=main_world`, // 해외사업 > 사업현황
};

// 이기능은 renobit에서 오는 파라미터 테스트를 위한 renobit 보내기 샘플 구현입니다.
const goLink = () => {
    //router.push({ name: 'RE2200', query: { id: 123 } }); // url에 보이고
    //router.push({ name: 'DT9901', state: { id: 123 } }); // url에 안보임
    //router.push({ name: 'RE2200', state: { id: 123 } }); // url에 안보임 RE2200 DT9901

    // renobit에서 오는 메시지(파라미터)
    const sendParam = {
        "action": "open_popup",
        "data": {
            "masterNo": "886" //사업명코드
        }
    }

    // postMessage 보내기..  
    window.postMessage(sendParam , import.meta.env.VITE_VUE_URL);
};
const receiveMessage = (event) => {
    if (event.origin !== import.meta.env.VITE_VUE_URL) return;
    const msg = event.data;
    if (!msg || !msg.action) return;
    switch (msg.action) {
        case "open_popup":
            openSchedule(msg.data.masterNo);
            break;
        case "open_page":
            break;
        default:
            console.log("Unknown action:", msg.action);
    }
};

onMounted(() => {
    nodeEnv.value = import.meta.env.MODE;
    if( nodeEnv.value == "production" )
        isButtonTest.value = false;
    else
        isButtonTest.value = true;
    window.addEventListener("message", receiveMessage, false);
});

onUnmounted(() => {
    window.removeEventListener("message", receiveMessage, false);
});
const openSchedule = async (masterNo) => {
  await proxy.$dialog.showAndWait(
    { ganttChart },
    {
      masterNo,
      width: 1600,
    },
  );
};
watch(() => selectMenuStore.selectMenuInfo?.menuNo, (menuNo) => {
  if (!menuNo) return;
  proxy.$br_trans([{
    url: '/kopms-api/getWemb',
    method: 'post',
    data: {},
  }], (_url, code, _msg, data) => {
    console.log("data ::::: ", data);
    if (code < 0) return;
    wembToken.value = data.wembToken ?? '';
  });
}, { immediate: true });

const currentUrl = computed(() => {
  console.log("menuNo" ,selectMenuStore.selectMenuInfo?.menuNo);
  const areaCode = AREA_CODE_MAP[selectMenuStore.selectMenuInfo?.menuNo] ?? '';
  if (!areaCode) return '';
  console.log("areaCode----"+areaCode);
  if (wembToken.value) {
    return (URL_MAP_TOKEN[areaCode] ?? '').replace('token={}', `token=${wembToken.value}`);
  }
  return ""; //URL_MAP[areaCode] ?? '';
});
</script>

<style scoped lang="scss">
.biz-frame {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
}
</style>
