import ko from '@/locales/ko.json'
import en from '@/locales/en.json'
import { ko as vuetifyKo, en as vuetifyEn } from "vuetify/locale"
export default {
	// 'ko' : ko,
	// 'en': en,
	ko: {
		$vuetify: vuetifyKo,
		...ko,
	},
	en: {
		$vuetify: vuetifyEn,
		...en,
	},
}