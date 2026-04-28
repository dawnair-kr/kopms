<template>
  <v-row no-gutters align="center" justify="center" class="invoice-breadcrumb">
    <v-col align="left">
      <v-banner class="ma-0 pa-0" lines="one" :stacked="false" mobile-breakpoint="580">
        <template v-slot:text>
          <!-- <v-breadcrumbs class="mx-5" :items="breadcrumbItems">
            <template v-slot:title="{ item }">
              <v-icon class="text-black" size="20" :icon="item.locationIcons"></v-icon>
              <span v-if="item.locationText.length != 0" class="ml-2 text-black text-subtitle-1 font-weight-bold">{{ item.locationText }}</span>
            </template>

            <template v-slot:divider>
              <v-icon size="25" icon="mdi-chevron-right"></v-icon>
            </template>
          </v-breadcrumbs> -->
        </template>
      </v-banner>
    </v-col>
    <v-col cols="3" class="mr-1" align="right">
      <!-- <v-btn v-if="option1.series[0].data.length == 0 && option2.series[0].data.length == 0 && option3.series.length == 0 && option4.series.length == 0" variant="flat" base-color="red-darken-4"
        class="mt-4 mr-2">
        <span class="text-subtitle-1 font-weight-bold">{{ $t('common.noInvoice') }}</span>
      </v-btn>
      <v-btn v-if="option1.series[0].data.length > 0 || option2.series[0].data.length > 0 || option3.series.length > 0 || option4.series.length > 0" class="mt-4 mr-2 text-caption font-weight-bold"
        flat rounded="lg" border color="blue-lighten-5" size="small" append-icon="mdi-chevron-right" @click="viewChart = !viewChart">
        <span v-if="viewChart" class="text-black text-subtitle-2">{{ $t('common.invoiceEventList') }}</span>
        <span v-else class="text-black text-subtitle-2">{{ $t('common.salesSummary') }}</span>
      </v-btn> -->
    </v-col>
    <v-col cols="6" align="left"></v-col>
  </v-row>

  <!-- 헤더 끝 -->
  <v-row no-gutters class="mx-auto">
    <v-col v-if="viewChart">
      <v-row no-gutters>
        <v-col class="mx-1">
          <!-- <basicChart :option="option1" :titleText="$t('common.top5SalesByCustomer')" minHeight="420" /> -->
        </v-col>
        <v-col class="mx-1">
          <!-- <basicChart :option="option3" :titleText="$t('common.top5MonthlySalesByCustomer')" minHeight="420" /> -->
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col class="mx-1">
          <!-- <basicChart :option="option2" :titleText="$t('common.top5SalesByProduct')" minHeight="420" /> -->
        </v-col>
        <v-col class="mx-1">
          <!-- <basicChart :option="option4" :titleText="$t('common.top5MonthlySalesByProduct')" minHeight="420" /> -->
        </v-col>
      </v-row>
    </v-col>
    <v-col v-else>
      <v-row no-gutters>
        <v-col class="mx-1">
          <!-- <clients :recentClients="recentClients" :titleText="$t('common.recentClients')" :loading="loading" minHeight="515" /> -->
        </v-col>
        <v-col class="mx-1">
          <!-- <projects :recentProject="recentProject" :titleText="$t('common.recentProformaInvoices')" :loading="loading" minHeight="515" /> -->
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col class="mx-1">
          <!-- <invoices :recentInvoice="recentInvoice" :titleText="$t('common.recentInvoices')" :loading="loading" minHeight="515" /> -->
        </v-col>
        <v-col class="mx-1">
          <!-- <packings :recentPackings="recentPackings" :titleText="$t('common.recentPackings')" :loading="loading" minHeight="515" /> -->
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="6" class="pr-1">
      <!-- <basicCalendar :toDate="toDate" :invoiceEvents="invoiceEvents" :filterValue="filterValue" @setDate="setDate" @filterHandler="filterHandler" /> -->
    </v-col>
  </v-row>
</template>

<script setup>
// import basicChart from '@/pages/common/BasicChart.vue';
// import basicCalendar from '@/pages/common/BasicCalendar.vue';
// import invoices from '@/pages/home/Invoices.vue';
// import projects from '@/pages/home/Projects.vue';
// import clients from '@/pages/home/Clients.vue';
// import packings from '@/pages/home/Packings.vue';
</script>

<script>
import { useUserStore } from '@/store/user.js';
// import Stomp from 'webstomp-client'      // 23.01.22 
// import { Stomp } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';      // 23.01.22 

// import BrNumberField from "@/components/BrNumberField.jsx"; // 23.01.22 vuetify 인보이스와의 버전 차이로 인해 오류가 나......

export default {
  components: {
    // BrNumberField,
  },

  beforeMount() {
    // console.log("Home beforeMount");
    this.$log.debug("Home.vue :: ", "beforeMount ~~~~~");
  },
  mounted() {
    // console.log("Home mounted");
    this.$log.debug("Home.vue ::"," mounted ~~~~~");
    // this.$log.fatal("FATAL : Test Log Message");
    // this.$log.error("ERROR : Test Log Message");
    // this.$log.warn("WARN : Test Log Message");
    // this.$log.debug("DEBUG : Test Log Message");
    // this.$log.info("INFO : Test Log Message");    

    const toDate = this.$dayjs();
    const today = this.$dayjs().format('YYYYMM');
    this.toDate.push(new Date(toDate));
    
    // this.getTotalAmt(today);   // 26.01.22 
  },
  computed: {
  },
  methods: {
    filterHandler(filterValue) {
      this.filterValue = filterValue;
      if (!filterValue || filterValue == "") {
        this.invoiceEvents = this.invoiceEventsSource;
      }
      else {
        this.invoiceEvents = this.invoiceEventsSource.filter((event) => event.kind == filterValue);
      }
    },
    setDate(value) {

      this.toDate = [];
      this.toDate.push(value[0]);
      const today = this.$dayjs(value[0]).format('YYYYMM');
      this.getInvoiceEvents(today);
    },
    getClientMonthlySales(value) {
      const compSales = {};
      value.forEach(monthlySales => {
        const { clientId, baseDate, itemAmt, name } = monthlySales;
        if (!compSales[clientId]) {
          compSales[clientId] = {
            clientId,
            type: 'line',
            name,
            data: []
          };
        }
        // if (clientId == 'totalAmount') {
        //   compSales[clientId].yAxisIndex = 1;
        // }
        compSales[clientId].data.push(itemAmt);
      });

      const setName = new Set();
      value.forEach(monthlySales => {
        setName.add(monthlySales.name);
      });

      const setDate = new Set();
      value.forEach(monthlySales => {
        setDate.add(monthlySales.baseDate);
      });

      const compSalesObj = Object.values(compSales);
      const setArrayName = [...setName];
      const setArrayDate = [...setDate];

      this.option3.series = compSalesObj;
      this.option3.legend.data = setArrayName;
      this.option3.xAxis.data = setArrayDate;
    },
    getProductMonthlySales(value) {
      const compSales = {};
      value.forEach(monthlySales => {
        const { itemId, baseDate, itemAmt, name } = monthlySales;
        if (!compSales[itemId]) {
          compSales[itemId] = {
            itemId,
            name,
            type: 'line',
            data: []
          };
        }
        // if (itemId == 'totalAmount') {
        //   compSales[itemId].yAxisIndex = 1;
        // }
        compSales[itemId].data.push(itemAmt);
      });

      const setName = new Set();
      value.forEach(monthlySales => {
        setName.add(monthlySales.name);
      });

      const setDate = new Set();
      value.forEach(monthlySales => {
        setDate.add(monthlySales.baseDate);
      });

      const compSalesObj = Object.values(compSales);
      const setArrayName = [...setName];
      const setArrayDate = [...setDate];

      this.option4.series = compSalesObj;
      this.option4.legend.data = setArrayName;
      this.option4.xAxis.data = setArrayDate;
    },
    
    getTotalAmt(searchDate) {
      //console.log("getTotalAmt ...........");
      this.$log.info("getTotalAmt.........");

      this.loading = true;
      this.$br_trans([
        {
          url: "/home/getTotalSales",
          method: "post",
          data: { searchDate: searchDate },
        }
      ], (url, code, msg, data) => {
        if (code == 0) {

          this.$log.info(data);

          this.invoiceEventsSource = data.invoiceEvents;
          this.recentInvoice = data.recentInvoice;
          this.recentProject = data.recentProject;
          this.recentClients = data.recentClients;
          this.recentPackings = data.recentPackings;
          // 날짜타입 보정
          for (const invoiceEvent of this.invoiceEventsSource) {
            const invoiceDt = invoiceEvent.invoiceDt;
            const closeDueDt = invoiceEvent.closeDueDt;
            invoiceEvent.start = new Date(invoiceDt);
            invoiceEvent.end = new Date(closeDueDt);
          }
          this.filterHandler(this.filterValue);

          if (data.clientSales.length == 0 && data.productSales.length == 0 && data.clientMonthlySales.length == 0 && data.productMonthlySales.length == 0) {
            // 업체 등록하고 인보이스의 확정 건수/금액이 없으면 챠트는 안 보여 준다
            this.viewChart = false;
          }
          else {
            this.viewChart = true;
          }

          this.option1.series[0].data = data.clientSales;
          this.option2.series[0].data = data.productSales;
          this.getClientMonthlySales(data.clientMonthlySales);
          this.getProductMonthlySales(data.productMonthlySales);
        }
        this.loading = false;
      });
    },
    getInvoiceEvents(searchDate) {
      this.loading = true;
      this.$br_trans([
        {
          url: "/home/getInvoiceEvents",
          method: "post",
          data: { searchDate: searchDate },
        }
      ], (url, code, msg, data) => {
        if (code == 0) {
          this.$log.info(data);
          this.invoiceEventsSource = data.invoiceEvents;
          // 날짜타입 보정
          for (const invoiceEvent of this.invoiceEventsSource) {
            const invoiceDt = invoiceEvent.invoiceDt;
            const closeDueDt = invoiceEvent.closeDueDt;
            invoiceEvent.start = new Date(invoiceDt);
            invoiceEvent.end = new Date(closeDueDt);
          }
        }
        this.filterHandler(this.filterValue);
        this.loading = false;
      });
    },
    
    
  },
  data() {

    let deptName = "";
    const userStore = useUserStore();
    if (userStore.getUserInfo()) {
      deptName = userStore.getUserInfo().deptName;
    }

    return {
      events: [
        {
          name: "Event name",
          moreInformation: "Event more information"
        }
      ],
      // breadcrumbItems: [
      //   {
      //     locationText: compNm || "",
      //     locationIcons: "mdi-home-analytics",
      //     disabled: false,
      //   },
      // ],
      viewChart: false,
      loading: false,
      toDate: [],
      data: null,
      msg: [],
      content: "",
      stompClient: null,
      isConnected: false,
      isLogin: false,
      message: "",
      messageId: "incoming",
      filterValue: null,
      invoiceEvents: null,
      invoiceEventsSource: null,
      recentInvoice: [],
      recentProject: [],
      recentClients: [],
      recentPackings: [],
      // PIE Chart
      option1: {
        title: {
          text: this.$t('common.top5SalesByCustomer'),
          left: 'center',
          show: false
        },
        tooltip: {
          trigger: 'item'
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        legend: {
          top: 'bottom',
        },
        series: [
          {
            type: 'pie',
            radius: ['10%', '65%'],
            itemStyle: {
              borderRadius: 5,
              borderColor: '#fff',
              borderWidth: 2
            },
            data: [
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              show: true,
            },
            labelLine: {
              show: true
            },
          }
        ]
      },
      // PIE Chart
      option2: {
        title: {
          text: this.$t('common.top5SalesByProduct'),
          left: 'center',
          show: false
        },
        tooltip: {
          trigger: 'item',
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        legend: {
          top: 'bottom',
        },
        series: [
          {
            type: 'pie',
            radius: ['10%', '65%'],
            itemStyle: {
              borderRadius: 5,
              borderColor: '#fff',
              borderWidth: 2
            },
            data: [
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              show: true,
            },
            labelLine: {
              show: true
            },
          }
        ],
      },
      option3: {
        title: {
          text: this.$t('common.top5MonthlySalesByCustomer'),
          left: 'center',
          show: false
        },
        tooltip: {
          trigger: 'axis',
        },
        toolbox: {
          feature: {
            magicType: {
              type: ['line', 'bar']
            },
            saveAsImage: {},
          }
        },
        legend: {
          top: 'bottom',
          data: {
          },
        },
        textStyle: {
          fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
          fontWeight: 300
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
        },
        yAxis: [
          {
            type: 'value',
            position: 'left',
            splitLine: {
              show: true
            },
            axisLabel: {
              formatter: function (value) {
                if (value >= 1e9) {
                  return (value / 1e9).toFixed(1) + 'B';
                } else if (value >= 1e6) {
                  return (value / 1e6).toFixed(1) + 'M';
                } else if (value >= 1e3) {
                  return (value / 1e3).toFixed(1) + 'K';
                } else {
                  return value;
                }
              },
              //fontSize: 10
            }
          },
          {
            type: 'value',
            position: 'right',
            // splitLine: {
            //   show: false
            // },
            axisLabel: {
              formatter: function (value) {
                if (value >= 1e9) {
                  return (value / 1e9).toFixed(1) + 'B';
                } else if (value >= 1e6) {
                  return (value / 1e6).toFixed(1) + 'M';
                } else if (value >= 1e3) {
                  return (value / 1e3).toFixed(1) + 'K';
                } else {
                  return value;
                }
              },
              //fontSize: 10
            },
            offset: 0,
          }
        ],
        series: [
        ],
      },
      option4: {
        title: {
          text: this.$t('common.top5MonthlySalesByProduct'),
          left: 'center',
          show: false
        },
        tooltip: {
          trigger: 'axis'
        },
        toolbox: {
          feature: {
            magicType: {
              type: ['line', 'bar']
            },
            saveAsImage: {},
          }
        },
        legend: {
          top: 'bottom',
          data: {
          },
        },
        // 좌우 남는공간 조정
        // grid: {
        //  left: '15%',
        //  right: '15%'
        // },
        textStyle: {
          fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
          fontWeight: 300
        },
        xAxis: {
          type: 'category',
          boundaryGap: true,
        },
        yAxis: [
          {
            type: 'value',
            position: 'left',
            axisLabel: {
              formatter: function (value) {
                if (value >= 1e9) {
                  return (value / 1e9).toFixed(1) + 'B';
                } else if (value >= 1e6) {
                  return (value / 1e6).toFixed(1) + 'M';
                } else if (value >= 1e3) {
                  return (value / 1e3).toFixed(1) + 'K';
                } else {
                  return value;
                }
              },
              //fontSize: 10
            }
          },
          {
            type: 'value',
            splitLine: {
              show: false
            },
            position: 'right',
            axisLabel: {
              formatter: function (value) {
                if (value >= 1e9) {
                  return (value / 1e9).toFixed(1) + 'B';
                } else if (value >= 1e6) {
                  return (value / 1e6).toFixed(1) + 'M';
                } else if (value >= 1e3) {
                  return (value / 1e3).toFixed(1) + 'K';
                } else {
                  return value;
                }
              },
              //fontSize: 10
            },
            offset: 0,
          }
        ],
        series: [
        ],
      },
    }
  },
}

</script>


<style scoped>
.chart {
  height: 100vh;
}
</style>
