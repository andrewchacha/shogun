//use iso code standard + label
export type SupportedLanguage = 'en' | 'ko' | 'sw';

const SupportedLanguages: {[key in SupportedLanguage]: string} = {
    sw: 'Kiswahili',
    en: 'English',
    ko: '한국어',
} as const;

export default SupportedLanguages;
