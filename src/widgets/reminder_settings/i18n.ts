import i18next, { ResourceLanguage } from "i18next";
import { initReactI18next } from "react-i18next";
import English from "../../locales/en.json";
import {host} from "../../lib/youTrackApp.ts";

let translations: ResourceLanguage | undefined;
if (YTApp.locale !== "en") {
    const response = await host
        .fetchApp<{ translation: ResourceLanguage }>(`backend/translate?lang=${YTApp.locale}`, {})
        .catch(() => undefined);

    translations = response?.translation;
}

await i18next
    .use(initReactI18next)
    .init({
        lng: YTApp.locale,
        fallbackLng: "en",
        resources: {
            en: {
                translation: English
            },
            ...(translations && {
                [YTApp.locale]: {
                    translation: translations
                }
            })
        },
        // debug: true,
        supportedLngs: ["en"].concat(translations ? [YTApp.locale] : []),
        nonExplicitSupportedLngs: true,
        interpolation: {
            escapeValue: false,
        }
    });

export default i18next;
