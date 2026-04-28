import lodash from 'lodash';

export default {
    name: 'Returnable',
  
    props: {
      returnValue: null,
      seed: Number,
      closeBtnTop: null,
    },
    emits: ["submit", "close", "shown", "loading", "layout:close", "keydown", 'update:closeBtnTop'],
    data () {
      return {
        originalValue: this.returnValue,
        returnResovers: []
      }
    },
    mounted() {
      //console.log("Returnable mounted", this.$el);
      this.$emit("shown", { seed: this.seed, height: this.$el.offsetHeight } );
      //
      //[wait=0], [options={leading: false, maxWait: null, trailing: true}]
      const checkFunc = lodash.throttle(() => {
          const titleDom = this.$el.querySelector(".v-card-item, .v-card-title, .v-toolbar");
          if ( titleDom && titleDom.offsetHeight > 0 ) {
            // this.$emit('update:closeBtnTop', titleDom.offsetHeight/2 - 10/2);
            this.$emit('update:closeBtnTop', 20);
            checkFunc.cancel();
            //console.log("debounce", checkFunc.cancel, titleDom, titleDom ? titleDom.offsetHeight : null);
          }
          //console.log("debounce", checkFunc.cancel, titleDom, titleDom ? titleDom.offsetHeight : null);
          //console.log(titleDom, (titleDom.offsetHeight/2 - 20/2));
      }, 10, { leading: false });

      //this.$el.addEventListener("load", checkFunc);
      //console.log("checkFunc", checkFunc);
      checkFunc();
    },
    methods: {
      return (value) {
        this.originalValue = value;
        this.$emit('submit',this.originalValue);
      },
      close() {
        this.$emit('close');
      }
    }
  }