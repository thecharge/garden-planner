const useTranslation = () => ({
  t: (key: string, opts?: Record<string, unknown>) => {
    if (!opts) {
      return key;
    }
    return Object.entries(opts).reduce((acc, [k, v]) => acc.replace(`{{${k}}}`, String(v)), key);
  },
  i18n: { language: "en", changeLanguage: () => Promise.resolve() }
});

const Trans = ({ children }: { children: React.ReactNode }) => children;

module.exports = { useTranslation, Trans };
