import { useEffect, useState } from 'react'
import { downloadWebsiteThemePreview } from '../lib/websiteThemes.js'
import { getSupabaseClient } from '../lib/supabase.js'

const fallbackPalette = {
  primary: '#102A56',
  secondary: '#1769C2',
  accent: '#18C7DF',
  surface: '#FFFFFF',
  text: '#17243A',
}

function getPalette(colors) {
  return Object.fromEntries(
    Object.entries(fallbackPalette).map(([key, fallback]) => [
      key,
      /^#[\da-f]{6}$/i.test(colors?.[key] ?? '') ? colors[key] : fallback,
    ]),
  )
}

function WebsiteThemeComposition({ theme, isHidden = false }) {
  const palette = getPalette(theme.colors)
  const style = {
    '--website-theme-primary': palette.primary,
    '--website-theme-secondary': palette.secondary,
    '--website-theme-accent': palette.accent,
    '--website-theme-surface': palette.surface,
    '--website-theme-text': palette.text,
  }

  return (
    <div
      className="website-theme-composition"
      style={style}
      role={isHidden ? undefined : 'img'}
      aria-label={isHidden ? undefined : `CSS website mockup preview for ${theme.name}`}
      aria-hidden={isHidden || undefined}
    >
      <div className="website-theme-composition__toolbar">
        <span>WEBSITE CONCEPT</span>
        <span>RESPONSIVE / 01</span>
      </div>
      <div className="website-theme-composition__page">
        <div className="website-theme-composition__nav">
          <strong>{theme.name || 'Studio'}</strong>
          <span>ABOUT&nbsp;&nbsp;&nbsp; WORK&nbsp;&nbsp;&nbsp; CONTACT</span>
        </div>
        <div className="website-theme-composition__hero">
          <span className="website-theme-composition__eyebrow">
            {theme.category || 'Digital experience'}
          </span>
          <strong>Good ideas,<br />made clear.</strong>
          <span className="website-theme-composition__button">Explore the studio</span>
        </div>
        <div className="website-theme-composition__content">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}

function WebsiteThemePreview({ theme, className = '' }) {
  const [imageResult, setImageResult] = useState({ path: null, url: '', error: '' })

  useEffect(() => {
    if (!theme.preview_image_path) {
      return undefined
    }

    let active = true
    let objectUrl = ''

    async function loadImage() {
      try {
        const client = await getSupabaseClient()
        if (!client) {
          throw new Error('Supabase is not configured.')
        }
        const image = await downloadWebsiteThemePreview(client, theme.preview_image_path)
        if (active) {
          objectUrl = URL.createObjectURL(image)
          setImageResult({ path: theme.preview_image_path, url: objectUrl, error: '' })
        }
      } catch {
        if (active) {
          setImageResult({
            path: theme.preview_image_path,
            url: '',
            error: 'Uploaded preview is unavailable. Showing the CSS concept preview.',
          })
        }
      }
    }

    void loadImage()

    return () => {
      active = false
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [theme.preview_image_path])

  const imageUrl = imageResult.path === theme.preview_image_path ? imageResult.url : ''
  const imageError = imageResult.path === theme.preview_image_path ? imageResult.error : ''

  return (
    <div className={`website-theme-preview ${className}`.trim()}>
      <WebsiteThemeComposition theme={theme} isHidden={Boolean(imageUrl)} />
      {imageUrl && (
        <img
          className="website-theme-preview__image"
          src={imageUrl}
          alt={`Uploaded website preview for ${theme.name}`}
          onError={() => {
            URL.revokeObjectURL(imageUrl)
            setImageResult({
              path: theme.preview_image_path,
              url: '',
              error: 'Uploaded preview is unavailable. Showing the CSS concept preview.',
            })
          }}
        />
      )}
      {imageError && <span className="website-theme-preview__fallback" role="status">{imageError}</span>}
    </div>
  )
}

export default WebsiteThemePreview
