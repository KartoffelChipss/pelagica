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
import enLibrary from './locales/en/library.json';
import deLibrary from './locales/de/library.json';
import enSearch from './locales/en/search.json';
import deSearch from './locales/de/search.json';
import enItem from './locales/en/item.json';
import deItem from './locales/de/item.json';

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                common: enCommon,
                sidebar: enSidebar,
                login: enLogin,
                home: enHome,
                library: enLibrary,
                search: enSearch,
                item: enItem,
            },
            de: {
                common: deCommon,
                sidebar: deSidebar,
                login: deLogin,
                home: deHome,
                library: deLibrary,
                search: deSearch,
                item: deItem,
            },
        },
        fallbackLng: 'en',
        ns: ['common', 'sidebar', 'login', 'home', 'library', 'item'],
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
