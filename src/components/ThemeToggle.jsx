import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme.js'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const nextTheme = theme === 'light' ? 'dark' : 'light'
  const Icon = theme === 'light' ? Moon : Sun

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
    >
      <Icon size={18} aria-hidden="true" />
      <span className="sr-only">Switch to {nextTheme} theme</span>
    </button>
  )
}

export default ThemeToggle
