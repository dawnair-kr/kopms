<template>
	<v-progress-circular
      :width="width"
	    :size="size"
      :color="color"
      indeterminate
    ></v-progress-circular>
</template>
  
  <script>
  //import { VCard, VCardText, VProgressLinear } from 'vuetify/lib'
  
  export default {
    layout: ['loading'],
    components: {
      //VCard,
      //VCardText,
      //VProgressLinear
    },
    props: {
      width: Number,
      size: Number,
      color: String
    }
  }
  </script>