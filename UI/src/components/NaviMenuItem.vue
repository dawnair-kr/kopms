<template>
  <v-list-group v-if="menu.children && menu.children.length > 0" :value="menu.menuNo">
    <template v-slot:activator="{ props }">
      <v-list-item v-bind="props">
        <template v-slot:prepend>
          <v-icon 
            v-if="menu.menuImage != null"
            :icon="menu.menuImage"
            class="mr-1"
            style="padding: 2px 0 0 10px;"
          />
        </template>
        <v-list-item-title class="text-subtitle-2">
          {{ menu.menuName }}
        </v-list-item-title>
      </v-list-item>
    </template>

    <NaviMenuItem
      v-for="child in menu.children"
      :key="child.menuNo" 
      :menu="child" 
      @click-item="$emit('click-item', $event)"
    />
  </v-list-group>

    <v-list-item
      v-else
      :value="menu.menuNo"
      :prepend-icon="menu.menuImage"
      @click="$emit('click-item', menu)"
    >
    <v-list-item-title class="text-subtitle-2">{{ menu.menuName }}</v-list-item-title>
  </v-list-item>
</template>

<script>
export default {
  name: 'NaviMenuItem', // 재귀 호출을 위해 필수
  props: {
    menu: {
      type: Object,
      required: true
    },
  },
}
</script>