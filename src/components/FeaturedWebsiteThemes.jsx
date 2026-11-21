import { useState } from 'react'
import { ArrowUpRight, RotateCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import SectionHeading from './SectionHeading.jsx'
import WebsiteThemeCard from './WebsiteThemeCard.jsx'
import WebsiteThemeDialog from './WebsiteThemeDialog.jsx'
import usePublishedWebsiteThemes from '../hooks/usePublishedWebsiteThemes.js'

function FeaturedWebsiteThemes() {
  const { status, themes, error, retry } = usePublishedWebsiteThemes()
  const [activeTheme, setActiveTheme] = useState(null)

  return (
    <section className="section featured-themes-section">
      <div className="container">
        <div className="featured-themes-heading">
          <SectionHeading
            eyebrow="Website themes"
            title="Explore a starting point."
            description="Published design directions from the NPX theme collection."
          />
          <Link className="button button--outline button--small" to="/themes">
            Browse all themes <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>

        {status === 'loading' && (
          <div className="featured-themes-state" role="status">Loading published website themes…</div>
        )}
        {status === 'error' && (
          <div className="featured-themes-state featured-themes-state--error" role="alert">
            <span>The theme collection could not be loaded: {error}</span>
            <button type="button" className="button button--text" onClick={retry}>
              <RotateCw size={15} aria-hidden="true" /> Retry
            </button>
          </div>
        )}
        {status === 'success' && themes.length === 0 && (
          <div className="featured-themes-state">
            No website themes are published yet. Visit the collection later for available directions.
          </div>
        )}
        {status === 'success' && themes.length > 0 && (
          <div className="featured-themes-grid">
            {themes.slice(0, 3).map((theme) => (
              <WebsiteThemeCard key={theme.id} theme={theme} onPreview={setActiveTheme} />
            ))}
          </div>
        )}
      </div>
      <WebsiteThemeDialog
        theme={activeTheme}
        open={Boolean(activeTheme)}
        onClose={() => setActiveTheme(null)}
        showContactAction
      />
    </section>
  )
}

export default FeaturedWebsiteThemes
