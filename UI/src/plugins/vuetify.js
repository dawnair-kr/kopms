import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { ko, en } from "vuetify/locale"
// Composables
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

//import.meta.env.SSR
export default createVuetify({
  components,
  directives,
  ssr: true,
  defaults: {
    VTextField: { autocomplete: 'off', spellcheck: false, density: 'compact', variant: 'outlined' },
    VCombobox: { autocomplete: 'off' },
    VAutocomplete: { autocomplete: 'off' },
  },
  theme: {
    defaultTheme: 'light', // 기본 테마 설정
    themes: {
      light: {
        colors: {
          // Primary: 가이드의 핵심 블루 컬러들
          primary: '#004098',         // Deep Blue (메인)
          'primary-light': '#92A8F4', // Light Blue
          'primary-sky': '#54C3F1',   // Sky Blue
          'primary-cyan': '#009DDC',  // Cyan

          // Secondary & Neutral
          secondary: '#373D56',
          accent: '#5A5657',
          inactive: '#B6B6B6',
          
          // Status Color Palette (디자인 시안 기준)
          normal: '#3ab59b',    // 정상
          warning: '#f79d1d',   // 주의
          critical: '#f54c74',  // 경고
        },
      },
      dark: {
        // 다크모드 필요 시 여기에 가이드의 어두운 버전 컬러 정의
      }
    },
  },
  locale: {
    locale: 'ko',
    fallback: 'en',
    messages: { ko, en },
  },
});