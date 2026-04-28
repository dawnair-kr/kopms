<template>
  <div>
    <!-- 미리보기 -->
    <v-row no-gutters justify="center" align="center">
      <v-col align="center">
        <v-sheet class="pa-2" border rounded="md" style="max-width: 475px;">
          <v-img :src="image" style="width: 450px; height:130px;" />
        </v-sheet>
      </v-col>
    </v-row>

    <v-divider class="my-3" />

    <!-- 업로드 영역 -->
    <v-row no-gutters align="center" justify="center">
      <v-col align="center">
        <!-- style="width: 200px; height: 100px" -->
        <v-sheet
          border="lg dotted"
          class="pa-2"
          rounded="md"
          max-width="200" min-width="200" height="100"
          @drop.prevent="onDrop"
          @dragover.prevent="onDragOver"
          @dragleave="onDragLeave"
        >
          <p class="text-subtitle-2 text-disabled font-weight-bold">
            이미지 업로드
          </p>
          <p class="text-subtitle-2 text-disabled font-weight-bold">
            파일을 드래그 하거나 선택하세요
          </p>
          <v-btn class="pb-2" variant="text" density="comfortable" icon="mdi-plus-circle-outline" size="large" @click="$refs.input.click()" />          
          <input
            ref="input"
            type="file"
            hidden
            accept="image/*"
            @change="onChange"
          />
        </v-sheet>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  props: {
    image: String
  },

  emits: [
    "update:image",
    "addImageFile"
  ],

  data() {
    return {
      objectUrl: null
    };
  },

  methods: {
    processFile(file) {
      if (!file) return;

      // 이미지 검증
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 가능합니다.");
        return;
      }

      // fileKey 생성 (중요)
      const fileKey = `${file.name}_${file.size}_${file.lastModified}`;

      // 메타데이터
      const fileItem = {
        fileKey,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileExt: file.name.split(".").pop(),
        status: "upload",
        fileGubun: "I",
        attachFileSeq: null,
        orderNo: null
      };

      // 부모로 전달
      this.$emit("addImageFile", fileItem, file);

      // 미리보기 (메모리 관리)
      if (this.objectUrl) {
        URL.revokeObjectURL(this.objectUrl);
      }

      this.objectUrl = URL.createObjectURL(file);
      this.$emit("update:image", this.objectUrl);
    },

    onChange(e) {
      const file = e.target.files[0];
      this.processFile(file);
      e.target.value = null;
    },

    onDrop(e) {
      e.currentTarget.classList.remove("drop-zone");
      const file = e.dataTransfer.files[0];
      this.processFile(file);
    },

    onDragOver(e) {
      e.currentTarget.classList.add("drop-zone");
    },

    onDragLeave(e) {
      e.currentTarget.classList.remove("drop-zone");
    }
  },

  beforeUnmount() {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
  }
};
</script>

<style scoped>
.drop-zone {
  background-color: #f4f5a1;
}
</style>