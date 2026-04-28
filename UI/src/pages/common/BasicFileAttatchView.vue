<template>
  <v-card variant="outlined" rounded="md" class="basic-file-attatch mx-auto mt-1 pa-2" width="300" 
    style="border-color: #bdbdbd; background-color: #ffffff; max-height: 265px;">
    <template v-slot:title>
      <v-row no-gutters justify="center" align="start">
        <v-col align="left">
          <span class="text-h6">Documents</span>
        </v-col>
      </v-row>
      <v-spacer style="height: 10px;" />
      <v-divider class="border-opacity-50"></v-divider>
    </template>

    <template v-slot:text>
      <v-spacer style="height: 10px; background-color: #e7e7e7;" />
      <v-row no-gutters justify="center" align="center" class="my-0" style="background-color: #e7e7e7;">
        <v-col cols="6" align="center">문서명</v-col>
        <v-divider class="border-opacity-50" vertical></v-divider>
        <v-col cols="2" align="center">등록일자</v-col>
        <v-divider class="border-opacity-50" vertical></v-divider>
        <v-col cols="1" align="center">종류</v-col>
        <v-divider class="border-opacity-50" vertical></v-divider>
        <v-col cols="2" align="center">크기</v-col>
        <v-col cols="1" align="center"></v-col>
      </v-row>
      <v-spacer style="height: 10px; background-color: #e7e7e7;" />
      <v-divider class="border-opacity-50"></v-divider>
      <v-row no-gutters justify="center" align="center">
        <v-col style="height: 162px; overflow-y: auto;">

          <v-row v-for="(file, i) in files" :key="i" no-gutters density="compact" variant="plain" class="my-1">
            <v-col cols="6" class="pl-1" align="left"><span class="text-body-2 file-list">{{ file.fileName
                }}</span></v-col>
            <v-divider class="border-opacity-50" vertical></v-divider>
            <v-col cols="2" align="center"><span class="text-body-2 file-list">{{ file.regDate }}</span></v-col>
            <v-divider class="border-opacity-50" vertical></v-divider>
            <v-col cols="1" align="center"><v-icon :icon="file.fileIcon" :color="file.fileColor"
                size="small"></v-icon></v-col>
            <v-divider class="border-opacity-50" vertical></v-divider>
            <v-col cols="2" align="center"><span class="text-body-2 file-list">{{ file.fileSize }}</span></v-col>
            <v-col cols="1" align="center">
              <v-btn class="ml-0" variant="text" color="grey-darken-2" density="comfortable" icon="mdi-delete-forever"
                size="small"></v-btn>
            </v-col>
          </v-row>
          <v-divider class="border-opacity-50"></v-divider>
          <v-spacer style="height: 5px;" />
        </v-col>
      </v-row>

    </template>
  </v-card>
</template>

<script>
export default {
  components: {

  },
  watch: {
  },
  computed: {
  },
  methods: {
    deleteContact(seq) {


      this.contacts.splice(seq, 1);

    },
    addContact() {

      this.contacts[this.contacts.length] =
      {
        firstName: "",
        lastName: "",
        eMail: "",
        officePhoneNo: "",
        faxNo: "",
        cellphoneNo: "",
      };
    },
  },
  data() {

    return {
      files: [
        {
          fileNo: "00001",
          fileName: "(주)브렌 회사소개서",
          regDate: "2024-03-01",
          fileType: "ppt",
          fileSize: 123456,
          fileIcon: "mdi-file-powerpoint-outline",
          fileColor: "red",
        },
        {
          fileNo: "00002",
          fileName: "(주)브렌 회사소개서",
          regDate: "2024-03-02",
          fileType: "xlsx",
          fileSize: 123456,
          fileIcon: "mdi-file-excel-outline",
          fileColor: "green",
        },
        {
          fileNo: "00003",
          fileName: "(주)브렌 회사소개서",
          regDate: "2024-03-02",
          fileType: "xlsx",
          fileSize: 123456,
          fileIcon: "mdi-file-word-outline",
          fileColor: "blue",
        },
        {
          fileNo: "00004",
          fileName: "(주)브렌 회사소개서",
          regDate: "2024-03-02",
          fileType: "xlsx",
          fileSize: 123456,
          fileIcon: "mdi-file-document-outline",
          fileColor: "black",
        },
        {
          fileNo: "00005",
          fileName: "(주)브렌 회사소개서",
          regDate: "2024-03-02",
          fileType: "xlsx",
          fileSize: 123456,
          fileIcon: "mdi-file-jpg-box",
          fileColor: "black",
        },
        {
          fileNo: "00006",
          fileName: "(주)브렌 회사소개서",
          regDate: "2024-03-02",
          fileType: "xlsx",
          fileSize: 123456,
          fileIcon: "mdi-file-png-box",
          fileColor: "black",
        },
        {
          fileNo: "00007",
          fileName: "(주)브렌 회사소개서",
          regDate: "2024-03-02",
          fileType: "xlsx",
          fileSize: 123456,
          fileIcon: "mdi-file-gif-box",
          fileColor: "black",
        },
        {
          fileNo: "00007",
          fileName: "(주)브렌 회사소개서",
          regDate: "2024-03-02",
          fileType: "pdf",
          fileSize: 123456,
          fileIcon: "mdi-file-pdf-box",
          fileColor: "blue",
        },
      ],
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