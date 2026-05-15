import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import enTranslations from '@/locales/en.json'
import esTranslations from '@/locales/es.json'

type Language = 'EN' | 'ES'

interface Translations {
  [key: string]: any
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, defaultValue?: string) => string
  translations: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation mapping
const translationMap: Record<Language, Translations> = {
  EN: enTranslations,
  ES: esTranslations,
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Load from localStorage or default to EN
    const savedLang = localStorage.getItem('appLanguage') as Language
    return savedLang || 'EN'
  })

  const currentTranslations = translationMap[language]

  // Update localStorage whenever language changes
  useEffect(() => {
    localStorage.setItem('appLanguage', language)
  }, [language])

  // Deep get for nested translation keys (e.g., "common.appName")
  const getNestedValue = (obj: any, path: string): string => {
    const keys = path.split('.')
    let value = obj

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        return path // Return the key itself if not found
      }
    }

    return typeof value === 'string' ? value : path
  }

  // Translation function
  const t = (key: string, defaultValue?: string): string => {
    const value = getNestedValue(currentTranslations, key)
    return value === key ? defaultValue || key : value
  }

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations: currentTranslations }}>
      {children}
    </LanguageContext.Provider>
  )
}

// Custom hook to use language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export type { Language }
