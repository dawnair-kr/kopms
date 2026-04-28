<template no-gutters>

<v-row no-gutters align="start" justify="start" class="mx-10 mt-2 mb-0">
    <v-tabs v-model="tab" align-tabs="center" color="grey-darken-4" mobile-breakpoint="xs">
      <v-tab :value="1" class="text-subtitle-1">{{ $t('setting.accountManage') }}</v-tab>
      <v-tab :value="2" class="text-subtitle-1">{{ $t('setting.memberPay.upgradePro') }}</v-tab>
      <v-tab :value="3" class="text-subtitle-1">{{ $t('setting.manageModule') }}</v-tab>
      <v-tab :value="4" class="text-subtitle-1">{{ $t('setting.paylist') }}</v-tab>
    </v-tabs>

    <v-spacer style="height: 10px;" />
    <v-divider class="border-opacity-70"></v-divider>
  </v-row>
  <v-row no-gutters align="start" justify="start" class="mx-10 mt-2">
    <v-col>
      <account v-if="tab == 1" />
      <paywall v-if="tab == 2" />
      <module v-if="tab == 3" />
      <paylist v-if="tab == 4" />
    </v-col>
  </v-row>
</template>

<script setup>
import account from '@/pages/settings/account/Account.vue';
import module from '@/pages/settings/account/Module.vue';
import paywall from '@/pages/settings/account/Paywall.vue';
import paylist from '@/pages/settings/account/Paylist.vue';
</script>

<script>
export default {
  props: {
    baseExpenseCategory: {
      type: Object,
      default: []
    },
  },
  components: {

  },
  watch: {
  },
  computed: {
  },

  mounted() {
  },
  methods: {
  },
  data() {

    return {
      tab: 1,
    }
  },
}
</script>

<style lang="scss"></style>