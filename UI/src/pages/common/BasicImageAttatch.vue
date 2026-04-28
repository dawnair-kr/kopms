<template>
  <v-card variant="outlined" border rounded="md" class="sub-card select-autocomplete mx-1">
    <template v-slot:title>
      <v-row no-gutters justify="center" align="start" class="mb-2">
        <v-col align="left">
          <!-- <span class="text-subtitle-1 text-black font-weight-bold ml-4">{{ title }}</span> -->
          <!-- <span class="text-subtitle-1 text-black font-weight-bold ml-4">{{ $t('product.productImage') }}</span>  -->
          <span class="text-subtitle-1 text-black font-weight-bold ml-4">{{ $t('common.image') }}</span>
        </v-col>
      </v-row>
      <!-- <v-spacer style="height: 5px;" /> -->
      <v-divider color="indigo" class="border-opacity-50"></v-divider>
    </template>

    <v-card-text class="bg-white pa-2">
      <v-row no-gutters justify="center" align="center">
        <v-col align="center">
          <v-sheet class="pa-2" border rounded="md"
            style="background-color: inherit; display: flex; align-items: center; max-width: 475px;">
            <v-img aspect-ratio="16/9" :src="imageSrc" style="width: 450px; height:130px;" @click="imgDownload()">
            <!-- <v-img aspect-ratio="16/9" :src="imageSrc" style="width: 450px; height:130px;" @click="clickImage()"> -->
            </v-img>
          </v-sheet>
        </v-col>
      </v-row>
      <v-spacer style="height: 10px;" />
      <v-divider class="border-opacity-50"></v-divider>
      <v-spacer style="height: 5px;" />
      <v-row v-if="enableUpload" no-gutters justify="center" align="center" class="mt-5 basic-file-attatch">
        <v-col align="center">
          <v-sheet border="lg dotted" class="pa-2" rounded="md" style="width: 300px; height: 100px" ref="dropzone">
            <!-- <p><span class="text-subtitle-2 text-disabled font-weight-bold">Image Upload</span></p>
            <p><span class="text-subtitle-2 text-disabled font-weight-bold">Drop files or click to upload</span></p> -->
            <p><span class="text-subtitle-2 text-disabled font-weight-bold">{{ $t('file.imageUpload') }}</span></p>
            <p><span class="text-subtitle-2 text-disabled font-weight-bold">{{ $t('file.dropFiles') }}</span></p>
            <v-btn class="pb-0" variant="text" density="comfortable" icon="mdi-plus-circle-outline" size="large"
              @click="$refs.inputUpload.click()">
            </v-btn>
            <input v-show="false" ref="inputUpload" type="file" accept=".gif, .jpg, .png" @change="add" />
          </v-sheet>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  emits: ["changeImage"],

  props: {
    imageSource: {
      type: String,
      default: "",
    },
    itemName: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    bActEnabled: {
      type: Boolean,
      default:true
    },
  },
  components: {
  },
  watch: {
    bActEnabled: {
      handler(curValue, oldValue) {
        if ( ! curValue) {
          this.enableUpload = false;
        } else {
          this.enableUpload = true;
        }
      },
      deep: true,
      flush: true
    }
  },
  mounted() {

    if ( !this.bActEnabled ) {
      this.enableUpload = false;
    } else {
      this.$el.addEventListener("dragenter", this.dragenter);
      this.$el.addEventListener("dragover", this.dragover);
      this.$el.addEventListener("dragleave", this.dragleave);
      this.$refs.dropzone.$el.addEventListener("drop", this.drop);
    }

  },

  beforeUnmount() {

    if (this.enableUpload == true) {
      this.$el.removeEventListener("dragenter", this.dragenter);
      this.$el.removeEventListener("dragover", this.dragover);
      this.$el.removeEventListener("dragleave", this.dragleave);
      this.$refs.dropzone.$el.removeEventListener("drop", this.drop);
    }

  },
  computed: {
    imageSrc: {
      get: function () {
        return this.imageSource;
      },
      set: function (value) {
        this.$emit('changeImage', value); // 부모에서는 @input에 쓴 메소드가 호출된다. 인수에value
      },
    },
  },
  methods: {

    clickImage () {
      // console.log(" clickImage    ::::: ");
      if ( this.imageSource == null ) { return; }
      // const imageWin = window.open();          // 새탭
      const imageWin = window.open("", "", "width=600px, height=600px");         // 새창
      imageWin.document.write("<html><head><title>미리보기</title></head><body style='margin:0'>");         
      imageWin.document.write("<img src='" + this.imageSource + "' border=0>");         
      imageWin.document.write("</body><html>");         
      imageWin.document.title = "preview";
    },

    imgDownload () {
      // console.log(" imgDownload    ::::: ");
      if ( this.imageSource == null ) { return; }
      let arrLinkSrc = this.imageSource.split(",");
      let extension = null;

      //check image's extension
      switch (arrLinkSrc[0]) {
          case "data:image/jpeg;base64":
              extension = "jpeg";
              break;
          case "data:image/png;base64":
              extension = "png";
              break;
          case "data:image/gif;base64":
              extension = "gif";
              break;
          // case "data:application/pdf;base64":
          //     extension = "pdf";
          //     break;
          // case "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64":
          //     extension = "docx";
          //     break;
          default://should write cases for more images types
              extension = "jpg";
              break;
      }
      //console.log(" extension    ::::: ", extension);
      const dateC = new Date();
      const sYear = dateC.getFullYear();
      const sMonth = (dateC.getMonth() + 1).toString().padStart(2, "0");
      const sDate = dateC.getDate();
      const sTime = dateC.getTime();      
      let fileName = sYear + sMonth + sDate + sTime ;
      
      
      if ( this.itemName != "" ) { 
        fileName = this.itemName;
      }

      const linkSource = this.imageSource;
      const downloadLink = document.createElement("a");
      downloadLink.href = linkSource;
      downloadLink.download = fileName + "." + extension;
      downloadLink.click();
      
    },

    dragover(e) {
      e.preventDefault();
      this.$refs.dropzone.$el.classList.add('drop-zone');
      let vaild = e.dataTransfer.types.indexOf('Files') >= 0;
      if (!vaild) {
      }
      else {
      }
    },
    dragenter(e) {
      this.$refs.dropzone.$el.classList.add('drop-zone');
    },
    dragleave(e) {
      this.$refs.dropzone.$el.classList.remove('drop-zone')
    },
    async drop(e) {
      
      if ( !this.bActEnabled ) { return; }      

      this.$refs.dropzone.$el.classList.remove('drop-zone')
      e.preventDefault();

      let file = e.dataTransfer.files[0];
      // console.log(file);
      var reader = new FileReader();

      reader.onload = (e) => {
        this.imageSrc = e.target.result;
      }
      reader.readAsDataURL(file);
    },

    async add(event) {
      
      let file = event.target.files[0];
      var reader = new FileReader();

      reader.onload = (e) => {
        this.imageSrc = e.target.result;
      }
      reader.readAsDataURL(file);
    }
  },
  data() {
    return {

      enableUpload: true,

    };
  },
}
</script>

<style lang="scss">
.basic-file-attatch {
  .file-list {
    font-size: 0.8rem !important;
  }

  .v-card-item {
    padding-bottom: 0px
  }

  .drop-zone {
    background-color: #f4f5a1;
  }
}
</style>