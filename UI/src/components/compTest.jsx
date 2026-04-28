import { genericComponent, useRender } from 'vuetify/lib/util/index.mjs';

export const CompTest = genericComponent()({
    name: 'comp-test',
  
    props: {},
  
    emits: {},
  
    setup () {
      useRender(() => (
        <div class="NAME"></div>
      ))
    },
  });