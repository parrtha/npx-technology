import { useMemo, useState } from 'react'
import { ArrowUpRight, RotateCw, Search, Sparkles } from 'lucide-react'
import Button from '../components/Button.jsx'
import Reveal from '../components/Reveal.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import WebsiteThemeCard from '../components/WebsiteThemeCard.jsx'
import WebsiteThemeDialog from '../components/WebsiteThemeDialog.jsx'
import usePublishedWebsiteThemes from '../hooks/usePublishedWebsiteThemes.js'

function WebsiteThemesPage() {
  const { status, themes, error, retry } = usePublishedWebsiteThemes()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [activeTheme, setActiveTheme] = useState(null)

  const categories = useMemo(
    () => [...new Set(themes.map((theme) => theme.category).filter(Boolean))].sort(),
    [themes],
  )

  const visibleThemes = useMemo(() => {
    const searchTerm = query.trim().toLocaleLowerCase()
    return themes.filter((theme) => {
      const matchesCategory = category === 'all' || theme.category === category
      const matchesSearch = !searchTerm
        || `${theme.name} ${theme.short_description} ${theme.category}`.toLocaleLowerCase().includes(searchTerm)
      return matchesCategory && matchesSearch
    })
  }, [category, query, themes])

  return (
    <>
      <Reveal as="section" className="website-themes-hero">
        <div className="container website-themes-hero__inner">
          <div className="website-themes-hero__copy">
            <p className="eyebrow"><span className="eyebrow__dot" /> Website theme collection</p>
            <h1>A considered starting point for your <span>next website.</span></h1>
            <p>
              Explore adaptable visual directions. Every published theme can be
              tailored to your business, content, and goals.
            </p>
            <Button to="/contact" size="large">
              Discuss your website <ArrowUpRight size={17} aria-hidden="true" />
            </Button>
          </div>
          <div className="website-themes-hero__aside" aria-hidden="true">
            <Sparkles size={20} />
            <strong>Design direction,<br />made tangible.</strong>
            <span>Explore layouts, palettes, and content structure before deciding what fits.</span>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section website-themes-section">
        <div className="container">
          <SectionHeading
            eyebrow="Browse the collection"
            title="Find a direction worth building on."
            description="These are starting points, not fixed templates. We adapt the right direction to your needs."
          />

          <div className="website-themes-toolbar">
            <label className="website-themes-search">
              <Search size={17} aria-hidden="true" />
              <span className="sr-only">Search website themes</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search themes"
              />
            </label>
            <label className="website-themes-category">
              <span className="sr-only">Filter themes by category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="all">All categories</option>
                {categories.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            {status === 'success' && (
              <span className="website-themes-count" aria-live="polite">
                {visibleThemes.length} {visibleThemes.length === 1 ? 'theme' : 'themes'}
              </span>
            )}
          </div>

          {status === 'loading' && (
            <div className="website-themes-state" role="status" aria-live="polite">
              <span className="website-themes-state__line" />
              <strong>Loading published themes</strong>
              <p>Retrieving the current collection from Supabase.</p>
            </div>
          )}

          {status === 'error' && (
            <div className="website-themes-state website-themes-state--error" role="alert">
              <strong>The theme collection could not be loaded.</strong>
              <p>{error} Confirm the website themes migration is applied and published themes are available.</p>
              <button className="button button--outline" type="button" onClick={retry}>
                <RotateCw size={15} aria-hidden="true" /> Try again
              </button>
            </div>
          )}

          {status === 'success' && themes.length === 0 && (
            <div className="website-themes-state">
              <strong>No themes are published yet.</strong>
              <p>Published website themes will appear here when the collection is ready.</p>
            </div>
          )}

          {status === 'success' && themes.length > 0 && visibleThemes.length === 0 && (
            <div className="website-themes-state">
              <strong>No themes match those filters.</strong>
              <p>Try a different search or select another category.</p>
            </div>
          )}

          {status === 'success' && visibleThemes.length > 0 && (
            <div className="website-themes-grid">
              {visibleThemes.map((theme) => (
                <WebsiteThemeCard key={theme.id} theme={theme} onPreview={setActiveTheme} />
              ))}
            </div>
          )}
        </div>
      </Reveal>

      <Reveal as="section" className="section website-themes-cta">
        <div className="container website-themes-cta__inner">
          <div>
            <p className="eyebrow">A useful first step</p>
            <h2>Need a direction that feels more like you?</h2>
            <p>Tell us what you are building, and we can shape the right foundation together.</p>
          </div>
          <Button to="/contact" variant="outline">
            Talk to NPX <ArrowUpRight size={16} aria-hidden="true" />
          </Button>
        </div>
      </Reveal>

      <WebsiteThemeDialog
        theme={activeTheme}
        open={Boolean(activeTheme)}
        onClose={() => setActiveTheme(null)}
        showContactAction
      />
    </>
  )
}

export default WebsiteThemesPage
