<template>
  <v-card variant="outlined" border rounded="md" class="sub-card select-autocomplete mx-1">
    <template v-slot:title>
      <v-row no-gutters justify="center" align="start" class="mb-2">
        <v-col align="left">
          <!-- <span class="text-subtitle-1 text-grey-darken-3 font-weight-bold ml-4">Note</span> -->
          <span class="text-subtitle-1 text-grey-darken-3 font-weight-bold ml-4">{{ $t('common.note') }}</span>
        </v-col>
      </v-row>
      <!-- <v-spacer style="height: 5px;" /> -->
      <v-divider color="indigo" class="border-opacity-50"></v-divider>
    </template>
    <v-card-text class="px-2 pb-0">
      <v-row no-gutters justify="center" align="center" class="mt-0">
        <v-col align="right" class="px-2">          
          <v-textarea :readonly="!bActEnabled" v-model="note.remark" variant="outlined" hide-details row-height="20" :rows="rows" auto-grow
            no-resize></v-textarea>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    note: {
      type: Object,
      default: {}
    },
    rows: {
      type: Number,
      default: 12
    },
    bActEnabled: {
      type: Boolean,
      default: true
    },
  },
  components: {

  },
  watch: {
  },
  computed: {
  },
  methods: {
  },
  data() {

    return {

    };
  },
}
</script>

<style lang="scss"></style>