import { en } from './en'
import { fr } from './fr'

const languages = {
  en,
  fr,
}

const currentLanguage = 'en'

export const t = languages[currentLanguage] || en
