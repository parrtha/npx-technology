import { useEffect, useRef } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import WebsiteThemePreview from './WebsiteThemePreview.jsx'

function WebsiteThemeDialog({ theme, open, onClose, showContactAction = false }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) {
      return
    }

    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  if (!theme) {
    return null
  }

  return (
    <dialog
      ref={dialogRef}
      className="website-theme-dialog"
      aria-labelledby="website-theme-dialog-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          event.currentTarget.close()
        }
      }}
    >
      <div className="website-theme-dialog__panel">
        <button
          className="website-theme-dialog__close"
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Close theme details"
        >
          <X size={19} aria-hidden="true" />
        </button>
        <WebsiteThemePreview theme={theme} className="website-theme-preview--dialog" />
        <div className="website-theme-dialog__details">
          <p className="eyebrow">{theme.category || 'Website theme'}</p>
          <h2 id="website-theme-dialog-title">{theme.name}</h2>
          <p>{theme.description || theme.short_description}</p>
          {theme.suitable_business_types?.length > 0 && (
            <div className="website-theme-dialog__types">
              <strong>Designed for</strong>
              <ul>
                {theme.suitable_business_types.map((type) => <li key={type}>{type}</li>)}
              </ul>
            </div>
          )}
          {showContactAction && (
            <Link
              className="button button--primary"
              to={`/contact?theme=${encodeURIComponent(theme.slug)}`}
              onClick={() => dialogRef.current?.close()}
            >
              Ask about this theme <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </dialog>
  )
}

export default WebsiteThemeDialog
