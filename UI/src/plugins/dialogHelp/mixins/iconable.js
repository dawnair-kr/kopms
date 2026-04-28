export default {
    props: {
      icon: {
        type: [String, Boolean],
        default: undefined
      },
      type: String
    },
    computed: {
      getIcon () {
        if (this.icon === false) {
          return
        }

        //console.log("iconable", this.$vuetify);
        return this.icon || (this.$vuetify && this.$vuetify.icons && this.$vuetify.icons.aliases[this.type]) || this.type;
      }
    }
  }