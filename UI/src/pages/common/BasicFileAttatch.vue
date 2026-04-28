<template>
  <v-card border rounded="md" class="basic-file-attatch px-2">
    <template v-slot:title>
      <v-row no-gutters justify="center" align="start">
        <v-col align="left">
          <span class="text-subtitle-1 text-black font-weight-bold ml-4">Documents</span>
        </v-col>
      </v-row>
      <v-spacer style="height: 5px;" />
      <v-divider class="border-opacity-50"></v-divider>
    </template>

    <template v-slot:text>
      <v-spacer style="height: 10px; background-color: #e7e7e7;" />
      <v-row no-gutters justify="center" align="center">
        <v-col style="max-height:200px; overflow-y: auto;">
          <v-row no-gutters justify="center" align="center" style="background-color: #e7e7e7;">
            <v-col cols="5" align="center">
              <span class="text-subtitle-2">문서명</span>
            </v-col>
            <v-divider class="border-opacity-50" vertical></v-divider>
            <v-col cols="3" align="center">
              <span class="text-subtitle-2">등록일자</span></v-col>
            <v-divider class="border-opacity-50" vertical></v-divider>
            <v-col cols="1" align="center">
              <span class="text-subtitle-2">종류</span></v-col>
            <v-divider class="border-opacity-50" vertical></v-divider>
            <v-col cols="3" align="center">
              <span class="text-subtitle-2">크기</span></v-col>
            <v-col cols="1" align="center"></v-col>
          </v-row>
          <v-spacer style="height: 5px; background-color: #e7e7e7;" />
          <v-divider class="border-opacity-50"></v-divider>

          <v-row v-for="(file, i) in fileList" :key="i" no-gutters variant="plain" class="my-1">
            <v-col cols="5" class="pl-1" align="left">
              <span class="text-body-2 file-list">{{ file.fileNm }}</span>
            </v-col>
            <v-divider class="border-opacity-50" vertical></v-divider>
            <v-col cols="3" align="center">
              <span class="text-body-2 file-list">{{ file.regDate }}</span>
            </v-col>
            <v-divider class="border-opacity-50" vertical></v-divider>
            <v-col cols="1" align="center">
              <!-- <v-icon :color="file.fileColor"> -->
              <v-icon>
                {{ icons[file.fileExt] || 'mdi-file-outline' }}
              </v-icon>
            </v-col>
            <v-divider class="border-opacity-50" vertical></v-divider>
            <v-col cols="2" align="center">
              <span class="text-body-2 file-list">{{ formatBytes(file.fileSize) }}</span>
            </v-col>
            <v-col cols="1" align="center">
              <v-btn class="mt-0" variant="text" color="grey-darken-2" density="compact" icon="mdi-delete-forever"
                size="small">
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-divider class="border-opacity-50"></v-divider>
      <v-spacer style="height: 5px;" />
      <v-row no-gutters justify="center" align="center" class="mx-2 my-1">
        <v-col align="center">
          <v-sheet border="lg dotted" class="pa-2" rounded="md" style="width: 300px; height: 100px">
            <p><span class="text-subtitle-2 text-disabled font-weight-bold">Files Upload</span></p>
            <p><span class="text-subtitle-2 text-disabled font-weight-bold">Drop files or click to upload</span></p>
            <v-btn class="pb-0" variant="text" density="comfortable" icon="mdi-plus-circle-outline" size="x-large"
              @click="$refs.inputUpload.click()"></v-btn>
            <input v-show="false" ref="inputUpload" type="file" multiple @change="add" />
          </v-sheet>
        </v-col>
      </v-row>
    </template>
  </v-card>
</template>

<script>
import { formatBytes } from "@/util/fmt";
const imageMimeTypes = ["image/png", "image/jpeg"];

export default {
  props: {
    files: {
      type: Object,
      default: []
    }
  },
  components: {

  },
  watch: {
  },
  computed: {
  },
  methods: {

    async add(event) {
      let addFiles = Array.from(event.target.files);
      const fileMaps = await this.filesMap(addFiles, "upload");
      // console.log(fileMaps);
      for (let i = 0; i < fileMaps.length; i++) {
        const file = {
          fileNm: fileMaps[i].fileName,
          fileType: fileMaps[i].fileType,
          fileSize: fileMaps[i].fileSize,
          fileExt: fileMaps[i].fileExt,
          // fileIcon: fileMaps.fileName,
          // fileColor: fileMaps.fileName,
          status: fileMaps[i].status,
        }
        this.fileList[this.fileList.length] = file;
      }

      // console.log(this.fileList);

      // this.listItems = this.listItems.concat(listItems);
      //this.$emit("add-files", files);
      this.$refs.inputUpload.value = "";
    },
    async filesMap(files, status) {
      let totalFileSize = 0;
      let promises = Array.from(files).map(file => {
        totalFileSize += file.size;
        let result = {
          file,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileExt: file.name.split(".").pop(),
          status,
        };
        return new Promise(resolve => {
          if (!imageMimeTypes.includes(result.type)) {
            return resolve(result);
          }
          // 이미지인 경우에.....
          var reader = new FileReader();
          reader.onload = function (e) {
            let tempImage = new Image();
            tempImage.src = e.target.result; //data-uri를 이미지 객체에 주입
            tempImage.onload = function () {
              result.image_width = tempImage.width;
              result.image_height = tempImage.height;
              let w_size = 34;
              let h_size = 34;
              if (result.image_width > 34 && result.image_height > 34) {
                w_size = result.image_width;
                h_size = result.image_height;
              }
              let canvas = document.createElement('canvas');
              let canvasContext = canvas.getContext("2d");
              //캔버스 크기 설정
              canvas.width = w_size; //가로 100px
              canvas.height = h_size; //세로 100px
              canvasContext.drawImage(this, 0, 0, w_size, h_size);
              var dataURI = canvas.toDataURL("image/png");
              result.snap_image = dataURI;
              resolve(result);
            }
            //result.preview = e.target.result;

          };
          reader.readAsDataURL(file);
        });
      });
      return await Promise.all(promises);
    },

    deleteContact(seq) {
      this.files.splice(seq, 1);
    },
    addContact() {

      this.fileList[this.fileList.length] =
      {
        fileNo: "",
        fileNm: "",
        regDate: "",
        fileType: "",
        fileSize: null,
        fileIcon: "",
        fileColor: "",
        saveFileNm: null,
        saveFileLoc: null,
        status: null,
        fileId: null,
      };
    },
  },
  data() {

    return {
      formatBytes,
      fileList: this.files,
      icons: {
        zip: "mdi-folder-zip-outline",
        rar: "mdi-folder-zip-outline",
        htm: "mdi-language-html5",
        html: "mdi-language-html5",
        js: "mdi-nodejs",
        json: "mdi-json",
        md: "mdi-markdown",
        pdf: "mdi-file-pdf-box",
        png: "mdi-file-image",
        jpg: "mdi-file-image",
        jpeg: "mdi-file-image",
        mp4: "mdi-filmstrip",
        mkv: "mdi-filmstrip",
        avi: "mdi-filmstrip",
        wmv: "mdi-filmstrip",
        mov: "mdi-filmstrip",
        txt: "mdi-file-document-outline",
        xls: "mdi-file-excel",
        xlsx: "mdi-file-excel",
        pptx: "mdi-file-powerpoint",
        ppt: "mdi-file-powerpoint",
        docx: "mdi-file-document",
        doc: "mdi-file-document",
      }
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
}
</style>