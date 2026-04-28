<template>
  <v-card flat border rounded="md" class="select-autocomplete my-1 px-2 py-2 pb-0 basic-file-attatch" min-width="300"
    min-height="350">
    <template v-slot:title>
      <v-row no-gutters justify="center" align="start">
        <v-col align="left">
          <span class="text-subtitle-1 text-black font-weight-bold ml-4">{{ title }}</span>
        </v-col>
      </v-row>
      <v-spacer style="height: 5px;" />
      <v-divider class="border-opacity-50"></v-divider>
    </template>

    <template v-slot:text>
      <v-spacer style="height: 10px;" />
      <v-row no-gutters justify="center" align="center">
        <v-col align="center" style="display:contents;">
          <v-sheet class="mx-1 pa-2" border rounded="md"
            style="background-color: inherit; align-items: center; max-width: 475px;">
            <br-signature height="100px" width="460px" ref="signaturePad" :options="SigOptions" />
          </v-sheet>
          <v-sheet class="mx-1 pa-2" border rounded="md"
            style="background-color: inherit; align-items: center; max-width: 116px;">
            <br-signature height="100px" width="100px" ref="sealPad" :options="SigOptions" />
          </v-sheet>
        </v-col>
      </v-row>
      <v-row no-gutters justify="center" align="center">
        <v-col align="center">
          <v-btn class="ma-2 text-none" flat rounded="md" border variant="outlined" append-icon="mdi-draw" size="small"
          :text=" $t('common.apply') " @click="apply"></v-btn>
          <v-btn class="ma-2 text-none" flat rounded="md" border variant="outlined" append-icon="mdi-eraser"
            size="small" :text=" $t('common.clear') " @click="clear"></v-btn>
        </v-col>
      </v-row>
      <v-row no-gutters justify="center" align="center" class="my-1">
        <v-col align="center" style="display: contents;">
          <div>
            <!-- <span class="text-caption pr-1">수정된 서명을 사용하시려면 </span> -->
            <span class="text-caption pr-1">{{ $t('setting.useModifiedSignature') }}</span>            
          </div>
          <div style="margin-top: 4px;">
            <img src="/images/help/apply_sign.png" style="width: 65px; height: 20px;"></img>
          </div>
          <div>
            <!-- <span class="text-caption pl-1">버튼을 클릭하시고 저장하십시요.</span> -->
            <span class="text-caption pl-1">{{ $t('setting.clickTheButtonAndSave') }}</span>
          </div>
        </v-col>
      </v-row>
      <v-divider class="border-opacity-50"></v-divider>
      <v-row no-gutters justify="center" align="center" class="my-5">
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
    </template>
  </v-card>
</template>

<script setup>
</script>

<script>
import BrSignature from '@/components/BrSignature/BrSignature.vue';

export default {
  emits: ["changeImageSign", "changeImageSeal"],

  props: {
    user: {
      type: Object,
      default: {},
    },
    imageSign: {
      type: String,
      default: "",
    },
    imageSeal: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    }
  },
  components: {
    BrSignature
  },
  watch: {

    imageSign: {
      handler(newValue, oldValue) {
        if (newValue) {
          this.interval = window.setInterval(() => {
            this.loadSignImg();
          }, 200);
        }
      },

      deep: true,
      immediate: true
    },
    imageSeal: {
      handler(newValue, oldValue) {
        if (newValue) {
          this.interval2 = window.setInterval(() => {
            this.loadSealImg();
          }, 200);
        }
      },

      deep: true,
      immediate: true
    }
  },
  computed: {
    imageSignSrc: {
      get: function () {
        return this.imageSign;
      },
      set: function (value) {
        this.$emit('changeImageSign', value); // 부모에서는 @input에 쓴 메소드가 호출된다. 인수에value
      },
    },
    imageSealSrc: {
      get: function () {
        return this.imageSeal;
      },
      set: function (value) {
        this.$emit('changeImageSeal', value); // 부모에서는 @input에 쓴 메소드가 호출된다. 인수에value
      },
    },
  },
  mounted() {

    this.$refs.sealPad.disableCanvas();

    this.SigOptions = {
      onBegin: this.onSignBegin,
      onEnd: this.onSignEnd
    };

    this.$el.addEventListener("dragenter", this.dragenter);
    this.$el.addEventListener("dragover", this.dragover);
    this.$el.addEventListener("dragleave", this.dragleave);
    this.$refs.dropzone.$el.addEventListener("drop", this.drop);
  },
  beforeUnmount() {
    this.$el.removeEventListener("dragenter", this.dragenter);
    this.$el.removeEventListener("dragover", this.dragover);
    this.$el.removeEventListener("dragleave", this.dragleave);
    this.$refs.dropzone.$el.removeEventListener("drop", this.drop);
  },
  methods: {
    loadSignImg() {
      if (!this.$refs.signaturePad) {
        return;
      }
      window.clearInterval(this.interval);

      if (this.imageSignSrc && this.imageSignSrc.length) {
        this.$refs.signaturePad.fromDataURL(this.imageSignSrc);
      }
    },
    loadSealImg() {
      if (!this.$refs.sealPad) {
        return;
      }
      
      window.clearInterval(this.interval2);

      if (this.imageSealSrc && this.imageSealSrc.length) {
        this.$refs.sealPad.fromDataURL(this.imageSealSrc);
      }
    },
    onSignEnd(e) {
      // console.log("onSignEnd", e);
      // this.isDirty = true;
    },
    onSignBegin(e) {
      // console.log("onSignBegin", e);
      const { isEmpty, data } = this.$refs.signaturePad.saveSignature();
      if (isEmpty) {
        this.imageSignSrc = null;
      }
      else {
        this.imageSignSrc = data;
      }
    },
    undo() {
      this.$refs.signaturePad.undoSignature();
    },
    clear() {
      // this.$refs.signaturePad.undoSignature();
      this.$refs.signaturePad.clearSignature();
      this.imageSignSrc = null;
      // this.$refs.signaturePad.resizeCanvas();
      this.isDirty = true;
    },
    apply() {
      // this.$refs.signaturePad.undoSignature();

      const { isEmpty, data } = this.$refs.signaturePad.saveSignature();
      if (isEmpty) {
        this.imageSignSrc = null;
      }
      else {
        this.imageSignSrc = data;
        this.$refs.sealPad.clearSignature();
        this.$refs.sealPad.saveSignature();
        this.imageSealSrc = null;
      }
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

      this.$refs.dropzone.$el.classList.remove('drop-zone')
      e.preventDefault();

      this.imageSignSrc = null;
      this.$refs.signaturePad.clearSignature();
      this.$refs.sealPad.clearSignature();
      this.imageSealSrc = null;
      let file = e.dataTransfer.files[0];
      var reader = new FileReader();

      reader.onload = (e) => {
        this.imageSealSrc = e.target.result;
        this.imageSignSrc = null;
        this.$refs.signaturePad.clearSignature();
        this.$refs.sealPad.clearSignature();
        this.$refs.inputUpload.value = "";
        // this.loadSealImg();
      }
      reader.readAsDataURL(file);
    },
    async add(event) {

      this.imageSignSrc = null;
      this.$refs.signaturePad.clearSignature();

      let file = event.target.files[0];
      var reader = new FileReader();

      reader.onload = (e) => {
        this.imageSealSrc = e.target.result;
        this.$refs.sealPad.clearSignature();
        this.$refs.inputUpload.value = "";
        // this.loadSealImg();
      }
      reader.readAsDataURL(file);
    }
  },
  data() {
    return {
      SigOptions: {},
      isDirty: false,
      interval: null,
      interval2: null,
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
