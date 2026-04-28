<!-- @update:opened="$emit('update:opened', $event)" : 자식 -> 부모 opened 값 변경 알림" -->
<!-- @update:activated="$emit('update:activated', $event)" : 자식 -> 부모 활성(선택) 노드 변경 이벤트" -->
<template no-gutters>
  <v-card class="overflow-y-auto" style="max-height: 600px;">
    <!-- return-object -->
    <v-treeview
      ref="treeRef"
      :items="treeItems"
      item-title="typeName"
      item-value="typeCode"
      v-model:opened="internalOpen"
      v-model:activated="internalActive"
      @update:opened="$emit('update:opened', $event)"
      @update:activated="$emit('update:activated', $event)"
      density="compact"
      activatable
      open-on-click      
      expand-icon="mdi-chevron-right"
      collapse-icon="mdi-chevron-down"
      return-object
      >
      <template #prepend="{ item, isOpen }">
        <v-icon size="18">
          {{
            item.isLeaf == 1
              ? 'mdi-file-document-outline'
              : (isOpen ? 'mdi-folder-open' : 'mdi-folder')
          }}
        </v-icon>
      </template>
    </v-treeview>

  </v-card>
</template>

<script setup>
</script>

<script>


export default {
  name: 'codeTree',
  // 부모로부터 받을 데이터 선언
  props: {
    treeItems: {
      type: Array,
      required: true,
      default: () => []
    },
    openNodes: {
      type: Array,
      required: true,
      default: () => []
    },
    activeNodes: {
      type: Array,
      required: true,
      default: () => []
    }
  },

  computed: {
    // 부모와 양방향 바인딩을 위한 Computed 처리
    internalOpen: {
      get() { return this.openNodes; },
      set(val) { this.$emit('update:opened', val); }
    },
    internalActive: {
      get() { return this.activeNodes; },
      set(val) { 
        this.$emit('update:activated', val);
        if (val.length > 0) this.$emit('select', val[0]); // 선택 시 상세조회 트리거
      }
    }
  },

  data() {
    return {
      //activeNodes: [],
    };
  },

  mounted() {
    
  },

  methods: {    
    handleSelection(selection) {
      this.$log.debug("handleSelection---------------------------- : ", selection);          
      // 아무것도 선택되지 않았을 때
      if (!selection || selection.length === 0) {
        this.$emit('select', null);
        return;
      }
      
      // 부모에게 이벤트와 함께 데이터 전송
      this.$emit('select', selection);
      
    }
  },
    
  

};
</script>

<style scoped>

</style>

