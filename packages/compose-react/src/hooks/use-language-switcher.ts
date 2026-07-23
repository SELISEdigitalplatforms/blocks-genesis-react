import { useAppSettingsStore } from "@/store";

export function useLanguageSwitcher() {
  const {
    settings: { language },
    setSettings,
  } = useAppSettingsStore();

  const changeLanguage = (newLanguage: string) => {
    setSettings({ language: newLanguage });
  };
  return { language, changeLanguage };
}
