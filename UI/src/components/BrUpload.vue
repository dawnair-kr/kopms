<template>
    <v-card flat light class="mx-auto bg-grey-lighten-5" :loading="loading" border>
        
        <v-card-title class="py-3 text-center d-flex justify-space-between align-center">
            <div>
                <div class="mx-1 text-subtitle-2">
                    <v-icon>mdi-file-upload</v-icon>
                        {{ (curItem && curItem.name && curItem.name.length) ? curItem.name : '첨부파일 추가' }}
                </div>
                <div v-if="maxUploadFilesCount">
                    <span class="light-blue--text text--darken-2">업로드 파일 개수: {{ uploadFileCount }} / </span>
                    <span class="grey--text">업로드 최대 파일 개수: {{ maxUploadFilesCount }}</span>
                </div>
                <div v-else-if="uploadFileCount" class="text-grey-lighten-1" style="font-size: 10px; line-height: 1.5;">
                    업로드 파일 개수: {{ uploadFileCount }}
                </div>
                <div v-if="maxUploadFileSize">
                    <span class="light-blue--text text--darken-2">업로드 파일들 총 크기: {{ formatBytes(uploadFileSize) }} / </span>
                    <span class="grey--text">업로드 파일들 최대 총 크기: {{ formatBytes(maxUploadFileSize) }}</span>
                </div>
                <div v-else-if="uploadFileSize" class="text-grey-lighten-1" style="font-size: 10px; line-height: 1.5;">
                    업로드 파일들 총 크기: {{ formatBytes(uploadFileSize) }}
                </div>
            </div>
            
            <div>
                <v-btn depressed color="warning" @click="clear" class="mx-1" :disabled="!listItems.length">
                    <v-icon>mdi-close</v-icon>모두 삭제
                </v-btn>
                <v-btn
                    :disabled="maxUploadFilesCount > 0 && listItems.length >= maxUploadFilesCount"
                    depressed
                    color="info"
                    @click="$refs.inputUpload.click()"
                    class="mx-1"
                >
                    <v-icon left>mdi-plus-circle</v-icon>파일 추가
                    <input
                        v-show="false"
                        ref="inputUpload"
                        type="file"
                        multiple
                        @change="add"
                    />
                </v-btn>
                <v-btn depressed color="success" @click="upload" class="ml-1" :disabled="uploadFileCount == 0 || (maxUploadFileSize > 0 && uploadFileCount > maxUploadFileSize)">
                    업 로드
                    <v-icon right>mdi-upload-outline</v-icon>
                </v-btn>
            </div>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text v-if="listItems.length" class="pa-0 files-list-wrapper">
            <v-list two-line style="min-height: 100px; max-height: 200px; overflow-y: auto;" >
                <v-list-item v-for="(file, index) in listItems" :key="index" density="compact" variant="plain" >
                    <div class="d-flex justify-space-between">
                        <div>
                            <v-list-item-title class="d-flex align-center" style="font-size: 12px;">
                                <img style="width: 16px; height: 16px;" v-if="file.snap_image" :src="file.snap_image" />
                                <v-icon
                                    v-else
                                    class="mdi-16px"
                                    color="grey lighten-1"
                                >{{ icons[file.extension] || 'mdi-file-outline' }}</v-icon>
                                <div class="ml-2">
                                    {{file.name}}
                                </div>
                            </v-list-item-title>
                            <v-list-item-subtitle style="padding-left: 24px; font-size: 10px; line-height: 1.5;">
                                {{ formatBytes(file.size) }} - {{ file.status == 'upload' ? '업로드 준비' : '업로드된 파일' }}
                                {{ file.snap_image ?  ' - ' + file.image_width + 'X' + file.image_height : '' }}
                            </v-list-item-subtitle>
                        </div>
                        
                        <v-btn variant="plain" @click="remove(index)">
                            <v-icon color="grey lighten-1">mdi-close</v-icon>
                        </v-btn>
                    </div>
                    
                </v-list-item>
            </v-list>
        </v-card-text>
        <v-overlay v-model="uploading" color="white" opacity="0.9">
            <v-progress-linear class="progress" v-model="progress" height="25" style="max-width: 400px;" striped rounded >
                <strong>{{ progress }}%</strong>
            </v-progress-linear>
        </v-overlay>
        
    </v-card>
</template>

<script>
import lodash from 'lodash';
import { formatBytes } from "../util/fmt";
const imageMimeTypes = ["image/png", "image/jpeg"];
export default {
    props: {
        curItem: { type: Object, default: () => {}},
        files: { type: Array, default: () => [] },
        maxUploadFilesCount: { type: Number, default: 0 },
        maxUploadFileSize: { type: Number, default: 0 },
        endpoint: String,
    },
    data() {
        return {
            loading: false,
            uploading: false,
            progress: 0,
            listItems: this.files,
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
    computed: {
        uploadFileCount() {
            let cnt = 0;

            lodash.forEach(this.listItems, o => {
                if ( o.status == "upload" ) {
                    cnt++;
                }
            });
            return cnt;
        },
        uploadFileSize() {
            let size = 0;
            lodash.forEach(this.listItems, o => {
                if ( o.status == "upload" ) {
                    size += o.size;
                }
            });
            return size;
        }
        
    },
    mounted() {
        this.$el.addEventListener("dragenter", this.dragenter);
        this.$el.addEventListener("dragover", this.dragover);
        this.$el.addEventListener("dragleave", this.dragleave);
        this.$el.addEventListener("drop", this.drop);
    },
    beforeUnmount() {
        this.$el.removeEventListener("dragenter", this.dragenter);
        this.$el.removeEventListener("dragover", this.dragover);
        this.$el.removeEventListener("dragleave", this.dragleave);
        this.$el.removeEventListener("drop", this.drop);
    },
    methods: {
        formatBytes,
        async filesMap(files, status) {
            let totalFileSize = 0;
            let promises = Array.from(files).map(file => {
                totalFileSize += file.size;
                let result = {
                    file,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    extension: file.name.split(".").pop(),
                    status,
                };
                return new Promise(resolve => {
                    if (!imageMimeTypes.includes(result.type)) {
                        return resolve(result);
                    }
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        let tempImage = new Image();
                        tempImage.src = e.target.result; //data-uri를 이미지 객체에 주입
                        tempImage.onload = function() {
                            result.image_width = tempImage.width;
                            result.image_height = tempImage.height;
                            let w_size = 34;
                            let h_size = 34;
                            if ( result.image_width > 34 && result.image_height > 34 ) {
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
        dragover(e) {
            e.preventDefault();

            let vaild = e.dataTransfer.types.indexOf('Files') >= 0;

            if(!vaild){
                //this.$el.style.backgroundColor = 'red';
            }
            else{
                //this.$el.style.backgroundColor = 'green';
            }
        },
        dragenter(e) {
            //console.log('dragenter');
        },
        dragleave(e) {
            //console.log('dragleave');

            //this.$el.style.backgroundColor = 'white';
        },
        async drop(e) {
            e.preventDefault();

            //console.log('drop');
            //this.$el.style.backgroundColor = 'white';
            //console.dir(e.dataTransfer);

            let files = e.dataTransfer.files;
            //console.dir(files);
            const listItems = await this.filesMap(files, "upload");
            this.listItems = this.listItems.concat(listItems);
                
            //console.log("====", this.listItems)

        },
        async add(event) {
            let files = Array.from(event.target.files);
            const listItems = await this.filesMap(files, "upload");
            this.listItems = this.listItems.concat(listItems);
            //this.$emit("add-files", files);
            this.$refs.inputUpload.value = "";
        },
        remove(index) {
            //this.$emit("remove-file", index);
            if ( this.listItems[index] ) {
                if ( this.listItems[index].status == "upload" ) {
                    this.listItems.splice(index, 1);
                } else if ( this.listItems[index].status == "uploaded" ) {
                    // 서버 제거처리
                    this.listItems.splice(index, 1);
                }
            }
        },
        clear() {
            //this.$emit("clear-files");
            let removeItems = [];
            lodash.forEach(this.listItems, o => {
                if ( o.status == "uploaded" ) {
                    removeItems.push(o);
                }
            });
            if ( removeItems.length ) {
                // 서버 호출 
            }
            
            this.listItems = [];
        },
        cancel() {
            //this.$emit("cancel");
        },
        async upload() {
            let formData = new FormData();
            // files
            //console.log(this.curPathItem.file_name, this.files, this.listItems);
            /*
            formData.append("p_file_key", 'root');
            formData.append("master_user_id", this.master_user_id);
            formData.append("company_id", this.company_id);
            if ( this.isInput ) {
                formData.append("theme_code", this.curItem.theme_code);
                formData.append("issue_type", this.curItem.issue_type);
                formData.append("issue_code", this.curItem.issue_code);
                formData.append("input_code", this.curItem.input_code);
                formData.append("row_code", this.curItem.row_code);
                formData.append("input_rec", JSON.stringify(this.curInputData));
            } else {
                formData.append("submit_doc_code", this.curItem.code);
            }
            
            if ( this.eval_year != null ) {
                formData.append("eval_year", this.eval_year + "");
            }
            formData.append("req_dt", this.req_dt);
            */

            let list_items = this.listItems;
            const files = [];
            const infos = [];
            lodash.forEach(this.listItems, o => {
                if ( o.status == "upload" ) {
                    files.push(o.file);
                    infos.push({
                        ...o,
                        file: null
                    });
                }
            });
            for (let file of files) {
                formData.append("files[]", file);
            }
            formData.append("infos", JSON.stringify(infos));

            /*
            for (var pair of formData.entries()) {
                //console.log(pair[0]+ ', ' + pair[1]);
            }
            */

            // console.dir(formData);
            //console.log(formData.values());
            this.uploading = true;
            //this.uploading = false;
            //this.$emit("uploaded");
            let url = this.endpoint;
            // UPLOAD 완료 후에 처리
            
            let loaded = 0;
            const testUploadAction = () => {
                loaded += 20;

                this.progress = Math.ceil((loaded / 100) * 100);
                //console.log("ppp", this.progress)
                if ( this.progress >= 100 ) {
                    lodash.forEach(this.listItems, o => {
                        if ( o.status == "upload" ) {
                            o.status = "uploaded";
                        }
                    });
                    this.uploading = false;
                } else {
                    setTimeout(testUploadAction, 500);
                }
            };

            setTimeout(testUploadAction, 500);
            /*
            this.$wg_trans([
                {
                    url: url,
                    method: "post",
                    data: formData,
                    isWait: false,
                    options: {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                        onUploadProgress: progressEvent => {
                            //console.log(progressEvent);
                            this.progress =
                                Math.ceil((progressEvent.loaded / progressEvent.total) * 100);
                        }
                    }
                },]
                ,(url, code, msg, data) => {
                    if ( code == 0 ) {
                        this.uploading = false;
                        this.$emit("uploaded", data.submit_files, data.req_dt);
                    }
                }
            );
            */
        }
    },
    /*
    watch: {
        files: {
            deep: true,
            immediate: true,
            async handler() {
                this.loading = true;
                this.listItems = await this.filesMap(this.files);
                this.loading = false;
            }
        }
    }
    */
};
</script>

<style lang="scss" scoped>
:deep(.v-overlay__content) {
    width: 100%;
    height: 100%;
    .progress {
        top: 50% !important;
        left: 50%;
        transform: translate(-50%, -50%) !important;
    }
    .files-list-wrapper {
        max-height: 250px;
        overflow-y: auto;
    }
}
</style>