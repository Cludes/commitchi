export const THEME_KEY = 'commitchi:theme'

// Stored preference wins; otherwise follow the OS color scheme; default light.
export function getInitialTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark') return stored
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
  } catch {
    // storage / matchMedia unavailable
  }
  return 'light'
}
