<template>
  <v-card border rounded="md" class="basic-calendar my-1 px-2 py-2">
    <template v-slot:title>
      <v-row no-gutters justify="center" align="start">
        <v-col align="left">
          <span class="text-subtitle-1 text-black font-weight-bold ml-4">{{ $t('common.invoiceCalendar') }}</span>
        </v-col>
        <v-col align="right" class="mr-2">
          <v-chip value rounded="0" variant="outlined" class="pt-1 pb-1" color="indigo" size="small" @click="filterHandler('PROFORMA')">
            <v-icon class="mr-1" icon="mdi-account-network-outline"></v-icon>
            {{ $t('invoice.proforma') }}
          </v-chip>
          <v-chip rounded="lg" variant="outlined" class="mx-2 pt-1 pb-1" color="purple" size="small" @click="filterHandler('INVOICE')">
            <v-icon class="mr-1" icon="mdi-invoice-import-outline"></v-icon>
            {{ $t('menus.invoice') }}
          </v-chip>
          <v-chip rounded="xl" variant="outlined" class="mr-2 pt-1 pb-1" color="green-darken-4" size="small" @click="filterHandler('PACKING')">
            <v-icon class="mr-1" icon="mdi-archive-plus-outline"></v-icon>
            {{ $t('common.packing') }}
          </v-chip>
          <v-chip variant="outlined" class="rounded-shaped mr-2 pt-1 pb-1" color="red-accent-4" size="small" @click="filterHandler('DELIVERY')">
            <v-icon class="mr-1" icon="mdi-ferry"></v-icon>
            {{ $t('invoice.deliveryDueDate') }}
          </v-chip>
          <v-btn v-if="filterValue" variant="text" color="grey-dark-2" density="comfortable" icon="mdi-close-circle-outline" size="small" @click="filterHandler()">
          </v-btn>
        </v-col>
      </v-row>
      <v-spacer style="height: 5px;" />
      <v-divider class="border-opacity-50"></v-divider>
    </template>
    <template v-slot:text>
      <v-calendar ref="calendar" v-model="value" :events="invoiceEvents" :view-mode="type" :weekdays="weekday" hide-week-number @next="nextMonth" @prev="prevMonth" @update:modelValue="changeDate">
        <template v-slot:event="{ event }">
          <v-menu :persistent="false" :close-on-content-click="true" open-on-hover>
            <template v-slot:activator="{ props }">
              <v-chip v-if="event.kind == 'INVOICE'" v-bind="props" rounded="lg" variant="outlined" class="mx-0" color="purple" size="small" style="cursor: pointer">
                <v-icon class="mr-1" icon="mdi-invoice-import-outline"></v-icon>
                {{ event.clientNm }} {{ event.invoiceNo }}
              </v-chip>
              <v-chip v-else-if="event.kind == 'PROFORMA'" v-bind="props" rounded="0" variant="outlined" class="mx-0" color="indigo" size="small" style="cursor: pointer">
                <v-icon class="mr-1" icon="mdi-account-network-outline"></v-icon>
                {{ event.clientNm }} {{ event.invoiceNo }}
              </v-chip>
              <v-chip v-else-if="event.kind == 'DELIVERY'" v-bind="props" variant="outlined" class="rounded-shaped mx-0" color="red-accent-4" size="small" style="cursor: pointer">
                <v-icon class="mr-1" icon="mdi-ferry"></v-icon>
                {{ event.clientNm }} {{ event.invoiceNo }}
              </v-chip>
              <v-chip v-else v-bind="props" rounded="xl" variant="outlined" class="mx-0" color="green-darken-4" size="small" style="cursor: pointer">
                <v-icon class="mr-1" icon="mdi-archive-plus-outline"></v-icon>
                {{ event.clientNm }} {{ event.invoiceNo }}
              </v-chip>
            </template>
            <v-card rounded="md" minWidth="300px" border="10" class="border-0 elevation-15">
              <v-card-title class="mx-0">
                <v-row no-gutters justify="center" class="mt-1">
                  <v-col align="left">
                    <v-icon v-if="event.kind == 'INVOICE'" class="mr-1" :color="event.color" icon="mdi-invoice-import-outline"></v-icon>
                    <v-icon v-else-if="event.kind == 'PROFORMA'" class="mr-1" :color="event.color" icon="mdi-account-network-outline"></v-icon>
                    <v-icon v-else-if="event.kind == 'DELIVERY'" class="mr-1" color="red-accent-4" icon="mdi-ferry"></v-icon>
                    <v-icon v-else class="mr-1" :color="event.color" icon="mdi-archive-plus-outline"></v-icon>
                    <span class="text-subtitle-1 font-weight-bold" :class="`text-${event.color}`" :color="event.color">{{ event.kind }}</span>
                  </v-col>
                  <!-- <v-col align="center">
                    <span class="text-subtitle-1 font-weight-bold" :class="`text-${event.color}`" :color="event.color">{{ event.kind }}</span>
                  </v-col> -->
                  <v-col cols="4" align="right">
                    <v-chip v-if="event.kind != 'DELIVERY'" variant="outlined" class="mx-1" :color="event.statusColor" size="x-small">
                      {{ event.statusKonm }}
                    </v-chip>
                  </v-col>
                </v-row>
              </v-card-title>
              <v-spacer style="height: 5px;" />
              <v-divider class="border-opacity-50"></v-divider>
              <v-card-text class="pa-2" :class="`bg-${event.color}`">
                <v-row no-gutters justify="center" class="pt-1">
                  <v-col align="right" class="mr-5"><span class="text-subtitle-2 font-weight-bold">{{ $t('common.client') }}</span></v-col>
                  <v-col align="left"><span class="text-subtitle-2 font-weight-bold" :color="event.color">{{ event.clientNm }}</span></v-col>
                </v-row>
                <v-row no-gutters justify="center" class="pt-1">
                  <v-col v-if="event.kind == 'PACKING'" align="right" class="mr-5"><span class="text-subtitle-2 font-weight-bold">{{ $t('common.packingNo') }}</span></v-col>
                  <v-col v-else align="right" class="mr-5"><span class="text-subtitle-2 font-weight-bold">{{ $t('invoice.invoiceNo') }}</span></v-col>
                  <v-col align="left"><span class="text-subtitle-2 font-weight-bold" :color="event.color">{{ event.invoiceNo }}</span></v-col>
                </v-row>
                <v-row no-gutters justify="center" class="pt-1">
                  <v-col v-if="event.kind == 'INVOICE'" align="right" class="mr-5"><span class="text-subtitle-2 font-weight-bold">{{ $t('invoice.invoiceDate') }}</span></v-col>
                  <v-col v-else-if="event.kind == 'PROFORMA'" align="right" class="mr-5"><span class="text-subtitle-2 font-weight-bold">{{ $t('invoice.issueDate') }}</span></v-col>
                  <v-col v-else-if="event.kind == 'DELIVERY'" align="right" class="mr-5"><span class="text-subtitle-2 font-weight-bold">{{ $t('invoice.issueDate') }}</span></v-col>
                  <v-col v-else align="right" class="mr-5"><span class="text-subtitle-2 font-weight-bold">{{ $t('common.departureDate') }}</span></v-col>
                  <v-col align="left"><span class="text-subtitle-2 font-weight-bold">{{ event.invoiceDt }}</span></v-col>
                </v-row>
                <v-row no-gutters justify="center" class="py-1">
                  <v-col v-if="event.kind == 'INVOICE'" align="right" class="mr-5"><span class="text-subtitle-2 font-weight-bold">{{ $t('invoice.invoiceDueDate') }}</span></v-col>
                  <v-col v-else-if="event.kind == 'PROFORMA'" align="right" class="mr-5"><span class="text-subtitle-2 font-weight-bold">{{ $t('invoice.validity') }}</span></v-col>
                  <v-col v-else-if="event.kind == 'DELIVERY'" align="right" class="mr-5"><span class="text-subtitle-2 font-weight-bold">{{ $t('invoice.deliveryDueDate') }}</span></v-col>
                  <v-col v-else align="right" class="mr-5"><span class="text-subtitle-2 font-weight-bold">{{ $t('common.arrivalDueDate') }}</span></v-col>
                  <v-col align="left"><span class="text-subtitle-2 font-weight-bold">{{ event.closeDueDt }}</span></v-col>
                </v-row>
              </v-card-text>
              <v-divider class="border-opacity-50"></v-divider>
              <v-card-actions>
                <v-row no-gutters justify="center" class="my-1">
                  <v-col align="center">
                    <!-- @click="moveDetail(event)" -->
                    <v-btn block variant="outlined" flat class="rounded text-caption" :color="event.color" @click="moveDetail(event)">
                      <span class="text-caption font-weight-bold" :color="event.color">View Detail</span>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-actions>
            </v-card>
          </v-menu>
        </template>
      </v-calendar>
    </template>
  </v-card>
</template>

<script>
import { useDate } from 'vuetify'
import { VCalendar } from 'vuetify/labs/VCalendar'
export default {
  props: {
    invoiceEvents: {
      type: Object,
      default: []
    },
    filterValue: {
      type: String,
      default: "",
    },
    toDate: {
      type: Array,
      default: [new Date()],
    }
  },
  components: {
    VCalendar
  },
  watch: {
  },
  computed: {
    value: {
      get: function () {
        return this.toDate;
      },
      set: function (value) {
        this.$emit('setDate', value); // 부모에서는 @input에 쓴 메소드가 호출된다. 인수에value
      },
    },
  },
  mounted() {
  },
  methods: {
    filterHandler(filterValue) {
      this.$emit('filterHandler', filterValue);
    },
    nextMonth() {
      // console.log("nextMonth ::: " + this.value);
    },
    prevMonth() {
      // console.log("prevMonth ::: " + this.value);
    },
    changeDate() {
      // console.log("changeDate ::: " + this.value);
    },
    moveDetail(event) {
      let url = "";
      if (event.kind == "INVOICE") {
        url = "/invoice/" + event.invoiceId + "/edit";
      }      
      else if (event.kind == "PROFORMA" || event.kind == "DELIVERY") {
        url = "/project/" + event.invoiceId + "/edit";
      }
      else {
        url = "/packing/" + event.invoiceId + "/edit";
      }

      window.open(url, "_blank");
    }
  },
  data() {

    return {
      type: 'month',
      // value: [new Date()],
      types: ['month', 'week', 'day'],
      weekday: [0, 1, 2, 3, 4, 5, 6],
    };
  },
}
</script>

<style lang="scss">
.basic-calendar {
  .v-calendar {
    .v-calendar-month__day {
      .v-chip {
        margin-top: 1px;
        margin-bottom: 1px;
      }
    }
  }
}
</style>