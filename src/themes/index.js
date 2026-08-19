import { empathy } from './empathy'
import { winter } from './winter'

export const themes = { empathy, winter }

export const applyTheme = (templateName) => {
  const theme = themes[templateName] ?? themes.empathy
  const root = document.documentElement
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}
