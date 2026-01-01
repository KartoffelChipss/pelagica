import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import deCommon from './locales/de/common.json';
import enSidebar from './locales/en/sidebar.json';
import deSidebar from './locales/de/sidebar.json';
import enLogin from './locales/en/login.json';
import deLogin from './locales/de/login.json';
import enHome from './locales/en/home.json';
import deHome from './locales/de/home.json';

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { common: enCommon, sidebar: enSidebar, login: enLogin, home: enHome },
            de: { common: deCommon, sidebar: deSidebar, login: deLogin, home: deHome },
        },
        fallbackLng: 'en',
        ns: ['common', 'sidebar', 'login', 'home'],
        defaultNS: 'common',
        interpolation: { escapeValue: false, formatSeparator: ',' },
        react: {
            useSuspense: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;
