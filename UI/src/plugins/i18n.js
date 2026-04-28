import { createI18n } from 'vue-i18n';
import messages from '@/locales/index';

export default createI18n({
// export const i18n = createI18n({
    legacy: false,        // Composition API를 쓰기 위한 필수 설정
    locale: 'ko',
    warnHtmlInMessage: false,
    fallbackLocale: 'en', // 기본 언어 표시에 문제가 있을 경우 대체할 언어
    legacy: false, // script에서 사용하려면 해당 옵션값 false
    messages: messages,
});
