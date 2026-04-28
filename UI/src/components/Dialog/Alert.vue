<template>
    <v-alert
      :closable="closable"
      @click:close="close"
      :text="text"
      :title="title"
      :type="type"
      @click="clickBox"
    >
    </v-alert>
  </template>
  <script>
  
  export default {
    layout: ['snackbar'],
    //layout: ['notification', { showClose: false }],
    props: {
      text: String,
      closable: Boolean,
      alertType: String,
      title: String,
      seed: Number,
    },
    data() {
      return {
        type: this.alertType,
      }
    },
    emits: ["shown", "loading"],
    mounted() {
      //console.log("Alert mounted", this.seed, this.$el.offsetHeight);
      this.$emit("shown", { seed: this.seed, height: this.$el.offsetHeight, width: this.$el.offsetWidth } );
      
      /*
      this.$nextTick(() => {
        setTimeout(() => {
          console.log("Alert mounted", this.$el.offsetHeight, this.$el);
          this.$emit("shown", { seed: this.seed, height: this.$el.offsetHeight } );
        }, 100);
      });
      */
      
    },
    updated() {
      
    },
    methods: {
      startTimeout() {
        if ( this.timeout > 0 ) {
          const seed = this.seed;
          this.activeTimeout = window.setTimeout(() => {
            // console.log(seed, "rrrr")
            this.$root.removeSnackBarDialogChild(seed);
          }, this.timeout);
        }
      },
      clearTimeout() {
        window.clearTimeout(this.activeTimeout);
      },
      close() {
        //console.log("alert close click")
        this.$root.$emit("layout:close", { seed: this.seed, type: "snackbar" });
      },
      clickBox() {
        if ( this.closable ) return;
        //console.log("box click", this);
        this.$root.$emit("layout:close", { seed: this.seed, type: "snackbar" });
      }
    }
  }
  </script>
  
  <style lang="scss">
  
    .br-alert-title {
      font-size: 16px;
      font-weight: bold;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.5;
      letter-spacing: -0.5px;
      color: #222222;
    }
  
    .br-alert-msg {
      font-size: 14px;
      font-weight: normal;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.43;
      letter-spacing: -0.5px;
      color: #3f3f3f;
    }
  </style>