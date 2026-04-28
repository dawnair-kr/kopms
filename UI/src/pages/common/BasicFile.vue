<template>
  <v-card variant="outlined" border rounded="md" class="sub-card select-autocomplete mx-1">
    <template v-slot:title>
      <v-row no-gutters justify="center" align="start" class="mb-2">
        <v-col align="left">
          <!-- <span class="text-subtitle-1 text-grey-darken-3 font-weight-bold ml-4">Documents</span> -->
          <span class="text-subtitle-1 text-grey-darken-3 font-weight-bold ml-4">{{ $t('common.documents') }}</span>
        </v-col>
      </v-row>
      <v-divider color="indigo" class="border-opacity-50"></v-divider>
    </template>

    <v-card-text class="px-2 pb-0">
      <v-row no-gutters align="center" justify="center" class="pageperrows file-list">
        <v-col align="left" class="mx-2" style="overflow-x: auto">
          <v-data-table v-model="selected" :headers="getFileHeaders()" :items="files" :page="currentPage" item-value="name"
            :loading="loading" color="#ff0000" :items-per-page="pagePerRow" hide-actions hover>

            <template v-slot:bottom>
              <v-divider></v-divider>
              <v-row no-gutters align="center" justify="center" class="mx-1 mt-0">
                <v-col align="left" cols="3" class="pa-2" style="display: flex">
                  <v-select v-model="pagePerRow" variant="outlined" rounded="md" hide-details hide-no-data
                    class="pageperrows" :items="pagePerRows" hover
                    style="--v-input-control-height: 30px; --v-field-padding-top: 4px; --v-input-padding-top: 2px; max-width: 100px;"
                    :menu-props="{ 'content-props': { 'class': 'pageperrows' } }">
                    <template v-slot:item="{ props, item }">
                      <v-list-item v-bind="props"></v-list-item>
                    </template>
                    <template v-slot:append>Rows</template>
                  </v-select>
                </v-col>

                <v-col align="center" class="pa-2">
                  <v-pagination v-model="currentPage" :length="getPageCount" rounded="circle" :total-visible="7"
                    show-first-last-page size="small" first-icon="mdi-page-first" prev-icon="mdi-menu-left"
                    next-icon="mdi-menu-right" last-icon="mdi-page-last">
                  </v-pagination>
                </v-col>
                <v-col align="left" cols="3" class="pa-2" style="display: flex">
                </v-col>
              </v-row>
            </template>

            <template v-slot:item.fileNm="{ item }">
              <div v-if="item.status != 'upload'" class="d-flex justify-start" style="text-align: left;">
                <!-- <a :href="`/client/${item.clientId}`" style="text-decoration: none; color: #0000ff;"> -->
                <a href="javascript:void(0);" style="text-decoration: none; color: #0000ff;"
                  @click="fileDownloadHandler(item)">
                  <span class="text-subtitle-2 font-weight-bold text-light-blue-darken-4 ">{{ item.fileNm }}</span>
                </a>
              </div>
              <div v-if="item.status == 'upload'" class="d-flex justify-start">
                <span class="text-subtitle-2 font-weight-bold text-black">
                  {{ item.fileNm }}</span>
              </div>
            </template>

            <template v-slot:item.fileNo="{ item }">
              <span v-if="item.status != 'upload'" class="text-subtitle-2 text-black ">{{ item.fileNo }}</span>
              <v-icon v-if="item.status == 'upload'" size="30" color="red">{{ 'mdi-new-box' }}</v-icon>
            </template>

            <template v-slot:item.fileSz="{ value }">
              <div class="d-flex justify-end">{{ formatBytes(value) }}</div>
            </template>

            <template v-slot:item.fileExt="{ value }">
              <v-icon>{{ icons[value] || 'mdi-file-outline' }}</v-icon>
            </template>

            <template v-slot:item.jobs="{ item }">
              <v-btn v-if="bActEnabled" class="" variant="text" color="grey-darken-2" density="comfortable" icon="mdi-delete-forever"
                size="small" @click="deleteFile(item)"></v-btn>
            </template>

            <template v-slot:loading>
              <v-skeleton-loader type="table"></v-skeleton-loader>
            </template>

            <template v-slot:no-data>
              <v-row no-gutters justify="center" align="center" class="my-2">
                <v-col align="center">
                  <!-- <span class="text-subtitle-1 text-black">등록된 파일이 없습니다</span> -->
                  <span class="text-subtitle-1 text-black">{{ $t('file.noRegistered') }}</span>
                </v-col>
              </v-row>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
      <v-divider></v-divider>
      <!-- {{  bActEnabled }} / {{ enableUpload}} -->
      <v-row v-if="enableUpload" no-gutters class="file-list" align="center" justify="center">
        <v-col align="center" class="px-2 pt-1 pb-2">
          <v-sheet border="lg dotted" class="pa-2" rounded="md" max-width="300" min-width="150" height="100"
            ref="dropzone">
            <!-- <p><span class="text-subtitle-2 text-disabled font-weight-bold">Files Upload</span></p>
            <p><span class="text-subtitle-2 text-disabled font-weight-bold">Drop files or click to upload</span></p> -->
            <p><span class="text-subtitle-2 text-disabled font-weight-bold">{{ $t('file.fileUpload') }}</span></p>
            <p><span class="text-subtitle-2 text-disabled font-weight-bold">{{ $t('file.dropFiles') }}</span></p>
            <v-btn class="pb-2" variant="text" density="comfortable" icon="mdi-plus-circle-outline" size="large"
              @click="$refs.inputUpload.click()"></v-btn>
            <input v-show="false" ref="inputUpload" type="file" multiple @change="add" />
          </v-sheet>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>

</script>

<script>
import { formatBytes } from "@/util/fmt";
const imageMimeTypes = ["image/png", "image/jpeg"];

export default {

  props: {
    files: {
      type: Object,
      default: [],
    },
    pagePerCount: {
      type: Number,
      default: 10,
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

    if ("Clients" == this.$route.name || !this.bActEnabled ) {
      this.enableUpload = false;
    }
    else {
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
    getPageCount() {

      return Math.ceil(this.files.length / this.pagePerCount);
    }
  },
  methods: {
    fileDownloadHandler(item) {

      let fileData = {
        saveFileLoc: item.saveFileLoc,
        fileNm: item.fileNm,
        saveFileNm: item.saveFileNm
      };


      this.$br_trans([{
        url: "/download/file",
        method: "post",
        data: fileData,
        options: {
          responseType: 'blob'
        }
        //isWait: false,
      }], (url, code, msg, data, fileNm) => {

        if (code == 0) {

          if (typeof window.navigator.msSaveBlob !== 'undefined') {
            window.navigator.msSaveBlob(data, fileNm);
          } else {
            let URL = window.URL || window.webkitURL;
            var fileURL = URL.createObjectURL(data);
            var fileLink = document.querySelector("a.wg-download");

            if (!fileLink) {
              fileLink = document.createElement('a');
              fileLink.className = "wg-download";
              document.body.appendChild(fileLink);
            }

            fileLink.href = fileURL;
            // Http Header에 파일명을 가져오려면 CORS를 적용하고, HTTPS로 통신해야한다.
            // 운영서버로 넘기는 경우에는 ENV를 확인해서 적용해야 한다.
            // console.log("process.env.NODE_ENV ::: ", process.env.NODE_ENV);
            // if (process.env.NODE_ENV === 'development') {
            if (import.meta.env.MODE === 'development') {
              fileLink.setAttribute('download', item.fileNm);
            }
            else {
              fileLink.setAttribute('download', item.fileNm);
            }

            fileLink.click();
          }
        }
        else if (code == -902) {

          this.$dialog.error({
            title: "Server Error",
            text: msg,
            persistent: true
          }).then(res => {
          });
        }
      });
    },
    deleteFile(item) {

      const index = this.files.findIndex((element, index, array) => {
        return element.fileNm == item.fileNm && element.fileSz == item.fileSz
      });

      // console.log(index, item);
      if (index < 0) return;
      // 파일이 업로드 대상이면 서버는 호출하지 않음.
      if (item.status == "upload") {
        let file = this.files.splice(index, 1);
        return;
      }

      let fileData = {
        fileKn: item.fileKn,
        refId: item.refId,
        fileId: item.fileId
      };

      this.$br_trans([{
        url: "/deleteFile",
        method: "post",
        data: fileData,
        //isWait: false,
      }], (url, code, msg, data) => {

        if (code == 0) {
          //this.$dialog.message.success("파일이 삭제되었습니다.");
          this.$dialog.message.success(this.$t('message.beenDeleted'));  
          let file = this.files.splice(index, 1);
        }
      });
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

      let files = e.dataTransfer.files;

      const fileMaps = await this.filesMap(files, "upload");
      for (let i = 0; i < fileMaps.length; i++) {
        const file = {
          file: fileMaps[i].file,
          fileNm: fileMaps[i].fileName,
          fileType: fileMaps[i].fileType,
          fileSz: fileMaps[i].fileSize,
          fileExt: fileMaps[i].fileExt,
          status: fileMaps[i].status,
        }
        this.files[this.files.length] = file;
      }
    },
    async add(event) {
      let addFiles = Array.from(event.target.files);
      const fileMaps = await this.filesMap(addFiles, "upload");

      for (let i = 0; i < fileMaps.length; i++) {
        const file = {
          file: fileMaps[i].file,
          fileNm: fileMaps[i].fileName,
          fileType: fileMaps[i].fileType,
          fileSz: fileMaps[i].fileSize,
          fileExt: fileMaps[i].fileExt,
          status: fileMaps[i].status,
        }
        this.files[this.files.length] = file;
      }
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
    getFileHeaders() {

      const headers = [
        { title: this.$t('file.no'), key: 'fileNo', width: '60', align: 'center', sortable: false },  // No
        { title: this.$t('file.name'), key: 'fileNm', align: 'center' },              // Name
        { title: this.$t('file.createdDate'), key: 'regDt', width: '100', align: 'center' }, // Created Date
        { title: this.$t('file.size'), key: 'fileSz', width: '100', align: 'center', sortable: false },  // Size
        { title: this.$t('file.type'), key: 'fileExt', width: '60', align: 'center', sortable: false },  // Type
        { title: '', key: 'jobs', width: '40', },
      ];

      return headers;
    }

  },
  data() {

    return {

      enableUpload: true,
      formatBytes,
      // files: this.files,
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
      },

      filters: [],
      filterStep: [],
      selected: [],
      currentPage: 1,
      options: {},
      pagePerRows: [5, 10, 15, 20, 30],
      pagePerRow: this.pagePerCount,
      loading: false,
    }
  },
}
</script>

<style lang="scss">
.file-list {
  .v-data-table .v-table__wrapper .v-data-table__th.v-data-table__td {
    background-color: #efefef !important;

    .v-data-table-header__content {
      color: #000000;
      font-size: 0.9rem;
      font-weight: bold;
    }
  }

  .v-data-table .v-select.v-input--density-default .v-field--variant-outlined {
    --v-field-padding-bottom: 0px;
  }

  .v-table .v-table__wrapper>table>thead>tr>th:not(:last-child) {
    border-right: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  .v-table .v-table__wrapper>table>tbody>tr>td:not(:last-child),
  .v-table .v-table__wrapper>table>tbody>tr>th:not(:last-child) {
    border-right: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  .drop-zone {
    background-color: #f4f5a1;
  }
}
</style>