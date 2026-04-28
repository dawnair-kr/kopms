<template>
  <div>
    <v-row no-gutters justify="center" align="center" class="basic-file-attatch">
      <v-col align="center" style="display:contents;">
        <v-sheet class="mx-1 pa-2" border rounded="md" style="align-items: center; max-width: 475px;">
          <v-img :src="imageSrc" style="width: 450px; height:130px;"></v-img>
        </v-sheet>
        <v-sheet v-if="type == 'logo'" class="mx-1 pa-2" border rounded="md" style="align-items: center;">
          <v-img :src="avatarSrc" :width="52" :height="52"></v-img>
        </v-sheet>
      </v-col>
    </v-row>
    <v-spacer style="height: 10px;" />
    <v-divider class="border-opacity-50"></v-divider>
    <v-spacer style="height: 5px;" />
    <v-row no-gutters justify="center" align="center" class="mt-5 basic-file-attatch">
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
  </div>
</template>

<script>
export default {
  emits: ["changeImage", "changeAvatar"],

  props: {
    imageSource: {
      type: String,
      default: "",
    },
    imageAvatar: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "logo",
    }
  },
  components: {
  },
  watch: {
    
  },
  mounted() {
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
  computed: {
    imageSrc: {
      get: function () {
        return this.imageSource;
      },
      set: function (value) {
        this.$emit('changeImage', value); // 부모에서는 @input에 쓴 메소드가 호출된다. 인수에value
      },
    },
    avatarSrc: {
      get: function () {
        return this.imageAvatar;
      },
      set: function (value) {
        this.$emit('changeAvatar', value); // 부모에서는 @input에 쓴 메소드가 호출된다. 인수에value
      },
    },
  },
  methods: {

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

      let file = e.dataTransfer.files[0];
      var reader = new FileReader();

      reader.onload = (e) => {
        this.imageSrc = e.target.result;
        this.makeAvatar(e.target.result);
      }
      reader.readAsDataURL(file);
    },
    async add(event) {
      let file = event.target.files[0];
      var reader = new FileReader();

      reader.onload = (e) => {
        this.imageSrc = e.target.result;
        this.makeAvatar(e.target.result);
      }
      reader.readAsDataURL(file);
    },
    makeAvatar(imageSource) {
      const img = new Image();
      img.src = imageSource;
      const vm = this;
      img.onload = function () {
        // 이미지 사이즈 줄이기
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 48;
        canvas.height = 48;

        // canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const resizedDataURL = canvas.toDataURL("image/jpeg");
        // this.avatarSrc = resizedDataURL;
        vm.avatarSrc = resizedDataURL;
      };

    }
  },
  data() {
    return {
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