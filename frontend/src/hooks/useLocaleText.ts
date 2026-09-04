import { useTranslation } from 'react-i18next'

export function useLocaleText() {
  const { t, i18n } = useTranslation()
  const isTamil = i18n.language?.startsWith('ta')

  return {
    t,
    i18n,
    isTamil,
    textClass: isTamil ? 'font-tamil' : 'font-sans',
    locale: isTamil ? 'ta-IN' : 'en-IN',
    brandName: isTamil ? t('brand.nameTamil') : t('brand.name'),
  }
}
