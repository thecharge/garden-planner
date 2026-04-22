import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import { en } from "./locales/en";
import { bg } from "./locales/bg";

export const SupportedLocale = {
  English: "en",
  Bulgarian: "bg"
} as const;
export type SupportedLocale = (typeof SupportedLocale)[keyof typeof SupportedLocale];

const detectLocale = (): SupportedLocale => {
  const tag = Localization.getLocales()[0]?.languageCode ?? SupportedLocale.English;
  if (tag === SupportedLocale.Bulgarian) {
    return SupportedLocale.Bulgarian;
  }
  return SupportedLocale.English;
};

void i18n.use(initReactI18next).init({
  resources: {
    [SupportedLocale.English]: { translation: en },
    [SupportedLocale.Bulgarian]: { translation: bg }
  },
  lng: detectLocale(),
  fallbackLng: SupportedLocale.English,
  interpolation: { escapeValue: false },
  returnNull: false,
  compatibilityJSON: "v4"
});

export { i18n };
export type { TranslationKeys } from "./locales/en";
