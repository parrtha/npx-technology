import { ArrowUpRight, Eye } from 'lucide-react'
import WebsiteThemePreview from './WebsiteThemePreview.jsx'

function WebsiteThemeCard({ theme, onPreview }) {
  function getSwatch(key) {
    const color = theme.colors?.[key]
    return typeof color === 'string' && /^#[\da-f]{6}$/i.test(color) ? color : 'transparent'
  }

  return (
    <article className="website-theme-card">
      <button
        className="website-theme-card__preview-button"
        type="button"
        onClick={() => onPreview(theme)}
        aria-label={`Preview ${theme.name} theme`}
      >
        <WebsiteThemePreview theme={theme} />
        <span className="website-theme-card__preview-label">
          <Eye size={14} aria-hidden="true" /> View preview
        </span>
      </button>
      <div className="website-theme-card__body">
        <div className="website-theme-card__meta">
          <span>{theme.category}</span>
          <span className="website-theme-card__swatches" aria-label="Theme colour palette">
            {['primary', 'secondary', 'accent'].map((key) => (
              <i
                key={key}
                style={{ '--swatch-color': getSwatch(key) }}
                aria-hidden="true"
              />
            ))}
          </span>
        </div>
        <h2>{theme.name}</h2>
        <p>{theme.short_description}</p>
        <div className="website-theme-card__footer">
          <button type="button" className="website-theme-card__link" onClick={() => onPreview(theme)}>
            Explore theme <ArrowUpRight size={15} aria-hidden="true" />
          </button>
          <span>{theme.suitable_business_types?.length ?? 0} business fit(s)</span>
        </div>
      </div>
    </article>
  )
}

export default WebsiteThemeCard
