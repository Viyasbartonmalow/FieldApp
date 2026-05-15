import React from 'react'
import { useLanguage, type Language } from '@/context/LanguageContext'
import './LanguageSwitcher.css'

interface LanguageSwitcherProps {
  variant?: 'header' | 'inline'
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'header' }) => {
  const { language, setLanguage } = useLanguage()

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
  }

  if (variant === 'inline') {
    return (
      <div className="language-switcher-inline">
        {(['EN', 'ES'] as const).map((lang) => (
          <button
            key={lang}
            className={`lang-btn ${language === lang ? 'lang-btn-active' : ''}`}
            onClick={() => handleLanguageChange(lang)}
            aria-pressed={language === lang}
            aria-label={`Switch to ${lang === 'EN' ? 'English' : 'Spanish'}`}
          >
            {lang}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="language-switcher" role="group" aria-label="Language selector">
      {(['EN', 'ES'] as const).map((lang) => (
        <button
          key={lang}
          className={`lang-btn ${language === lang ? 'lang-btn-active' : ''}`}
          onClick={() => handleLanguageChange(lang)}
          aria-pressed={language === lang}
          aria-label={`Switch to ${lang === 'EN' ? 'English' : 'Spanish'}`}
        >
          {lang}
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher
