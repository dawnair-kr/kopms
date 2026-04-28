<template no-gutters>
  
  <v-row no-gutters class="mb-2 pa-2">
    <v-item-group v-model="selectedMenu" mandatory>
      <v-container class="pa-0">
        <v-row>
          <v-col v-for="(item, index) in getMenu()" :key="index" style="padding: 2px;">
            <v-item v-slot="{ isSelected, selectedClass, toggle }">
              <v-card 
                :class="['d-flex align-center', selectedClass]" height="30" @click="toggle" flat
                :color="isSelected ? 'primary font-weight-bold' : 'inactive'" style="font-size: 13px;">
                <div class="mx-2 text-center text-no-wrap">{{ item.text }}</div>
              </v-card>
            </v-item>
          </v-col>
        </v-row>
      </v-container>
    </v-item-group>
  </v-row>

  <v-container class="d-flex flex-column">

    <composition v-if="selectedMenu == 0"/>
    <agenda v-if="selectedMenu == 1"/>

  </v-container>
</template>

<script setup>
import composition from './board/Composition.vue';
import agenda from './board/Agenda.vue';
</script>

<script>
export default {
  data() {
    return {
      selectedMenu: 0,
      itemList: [
        {text: 'Version 1'},
        {text: 'Version 2'},
      ],
    }
  },
  methods: {
    getMenu() {
      let menuItems = [
        {
          text: "이사회 구성",
          disabled: false,
        },
        {
          text: "안건 내역",
          disabled: false,
        },
      ];
    return menuItems;
    },
  },
}
</script>

<style scoped lang="scss">

</style>