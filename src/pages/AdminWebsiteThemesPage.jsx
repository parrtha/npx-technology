import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Archive,
  ImagePlus,
  Palette,
  Plus,
  RotateCw,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import Button from '../components/Button.jsx'
import WebsiteThemePreview from '../components/WebsiteThemePreview.jsx'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase.js'
import {
  countWebsiteThemeEnquiries,
  countWebsiteThemePreviewEnquiries,
  deleteWebsiteTheme,
  listAdminWebsiteThemes,
  removeWebsiteThemePreview,
  saveWebsiteTheme,
  updateWebsiteThemePreviewPath,
  uploadWebsiteThemePreview,
  validateThemePreviewFile,
  validateWebsiteThemeDraft,
  THEME_COLOR_KEYS,
} from '../lib/websiteThemes.js'

const defaultColors = {
  primary: '#102A56',
  secondary: '#1769C2',
  accent: '#18C7DF',
  surface: '#F5F8FC',
  text: '#17243A',
}

function createEmptyDraft() {
  return {
    name: '',
    slug: '',
    short_description: '',
    description: '',
    category: '',
    colors: { ...defaultColors },
    suitable_business_types: [],
    preview_image_path: null,
    is_published: false,
  }
}

function createDraft(theme) {
  return {
    ...theme,
    colors: { ...defaultColors, ...theme.colors },
    suitable_business_types: [...(theme.suitable_business_types ?? [])],
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function ThemeEditorDialog({
  open,
  draft,
  themeId,
  error,
  saving,
  onClose,
  onChange,
  onSave,
}) {
  const dialogRef = useRef(null)
  const [file, setFile] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(themeId))

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) {
      return
    }

    if (open && !dialog.open) {
      setFile(null)
      setRemoveImage(false)
      setValidationErrors({})
      setSlugManuallyEdited(Boolean(themeId))
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open, themeId])

  function updateField(event) {
    const { name, value, checked, type } = event.target
    const nextValue = type === 'checkbox' ? checked : value

    if (name === 'name' && !slugManuallyEdited && !themeId) {
      onChange({ ...draft, name: value, slug: slugify(value) })
      return
    }
    if (name === 'slug') {
      setSlugManuallyEdited(true)
    }
    if (name.startsWith('colors.')) {
      const colorName = name.slice('colors.'.length)
      onChange({ ...draft, colors: { ...draft.colors, [colorName]: value } })
      return
    }
    if (name === 'suitable_business_types') {
      onChange({
        ...draft,
        suitable_business_types: value.split(',').map((item) => item.trim()).filter(Boolean),
      })
      return
    }
    onChange({ ...draft, [name]: nextValue })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validation = validateWebsiteThemeDraft(draft)
    const errors = { ...validation.errors }

    if (file) {
      try {
        await validateThemePreviewFile(file)
      } catch (validationError) {
        errors.preview = validationError.message
      }
    }

    setValidationErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }
    await onSave({ draft: validation.value, file, removeImage })
  }

  return (
    <dialog
      ref={dialogRef}
      className="website-theme-editor"
      aria-labelledby="website-theme-editor-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget && !saving) {
          event.currentTarget.close()
        }
      }}
    >
      <form className="website-theme-editor__panel" onSubmit={handleSubmit}>
        <header className="website-theme-editor__header">
          <div>
            <p className="eyebrow">{themeId ? 'Edit catalog entry' : 'New catalog entry'}</p>
            <h2 id="website-theme-editor-title">{themeId ? 'Update website theme' : 'Create website theme'}</h2>
          </div>
          <button
            className="website-theme-dialog__close"
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close theme editor"
            disabled={saving}
          >
            <X size={19} aria-hidden="true" />
          </button>
        </header>

        <div className="website-theme-editor__layout">
          <div className="website-theme-editor__fields">
            <label className="form-field">
              <span>Name</span>
              <input name="name" value={draft.name} onChange={updateField} maxLength={80} required />
              {validationErrors.name && <small className="form-field__error">{validationErrors.name}</small>}
            </label>
            <label className="form-field">
              <span>URL slug</span>
              <input name="slug" value={draft.slug} onChange={updateField} maxLength={80} required />
              {validationErrors.slug && <small className="form-field__error">{validationErrors.slug}</small>}
            </label>
            <label className="form-field">
              <span>Category</span>
              <input name="category" value={draft.category} onChange={updateField} maxLength={80} required />
              {validationErrors.category && <small className="form-field__error">{validationErrors.category}</small>}
            </label>
            <label className="form-field">
              <span>Short description</span>
              <input
                name="short_description"
                value={draft.short_description}
                onChange={updateField}
                maxLength={240}
                required
              />
              {validationErrors.short_description && (
                <small className="form-field__error">{validationErrors.short_description}</small>
              )}
            </label>
            <label className="form-field website-theme-editor__wide">
              <span>Description</span>
              <textarea
                name="description"
                value={draft.description}
                onChange={updateField}
                minLength={20}
                maxLength={4000}
                rows={4}
                required
              />
              {validationErrors.description && (
                <small className="form-field__error">{validationErrors.description}</small>
              )}
            </label>
            <label className="form-field website-theme-editor__wide">
              <span>Suitable business types <span className="form-field__optional">(comma separated)</span></span>
              <input
                name="suitable_business_types"
                value={draft.suitable_business_types.join(', ')}
                onChange={updateField}
                placeholder="For example, retail, hospitality"
              />
              {validationErrors.suitable_business_types && (
                <small className="form-field__error">{validationErrors.suitable_business_types}</small>
              )}
            </label>
            <fieldset className="website-theme-editor__palette">
              <legend>Theme palette</legend>
              {THEME_COLOR_KEYS.map((key) => (
                <label className="website-theme-color-field" key={key}>
                  <span>{key}</span>
                  <input
                    aria-label={`${key} palette colour`}
                    name={`colors.${key}`}
                    type="color"
                    value={/^#[\da-f]{6}$/i.test(draft.colors?.[key] ?? '') ? draft.colors[key] : '#102A56'}
                    onChange={updateField}
                  />
                  <input
                    name={`colors.${key}`}
                    value={draft.colors?.[key] ?? ''}
                    onChange={updateField}
                    maxLength={7}
                    aria-label={`${key} hexadecimal colour`}
                  />
                  {validationErrors[`colors.${key}`] && (
                    <small className="form-field__error">{validationErrors[`colors.${key}`]}</small>
                  )}
                </label>
              ))}
            </fieldset>
            <label className="form-field website-theme-editor__wide">
              <span>Upload preview image <span className="form-field__optional">(PNG, JPEG, or WebP; up to 5 MB)</span></span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null)
                  setRemoveImage(false)
                }}
              />
              {validationErrors.preview && <small className="form-field__error">{validationErrors.preview}</small>}
              {draft.preview_image_path && !file && (
                <span className="form-field__hint">An uploaded preview is currently stored for this theme.</span>
              )}
            </label>
            {draft.preview_image_path && !file && (
              <label className="website-theme-editor__checkbox website-theme-editor__wide">
                <input
                  type="checkbox"
                  checked={removeImage}
                  onChange={(event) => setRemoveImage(event.target.checked)}
                />
                Remove the current preview image
              </label>
            )}
            <label className="website-theme-editor__checkbox website-theme-editor__wide">
              <input
                name="is_published"
                type="checkbox"
                checked={draft.is_published}
                onChange={updateField}
              />
              Publish this theme in the public collection
            </label>
          </div>
          <aside className="website-theme-editor__preview">
            <span>Preview</span>
            <WebsiteThemePreview theme={draft} />
            <p>Without an uploaded image, the public catalog uses this CSS-built concept preview.</p>
          </aside>
        </div>

        {error && <p className="form-feedback form-feedback--error" role="alert">{error}</p>}
        <footer className="website-theme-editor__footer">
          <button
            className="button button--outline"
            type="button"
            onClick={() => dialogRef.current?.close()}
            disabled={saving}
          >
            Cancel
          </button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving theme…' : themeId ? 'Save changes' : 'Create theme'}
            {!saving && <Upload size={15} aria-hidden="true" />}
          </Button>
        </footer>
      </form>
    </dialog>
  )
}

function AdminWebsiteThemesPage() {
  const [themes, setThemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [retryVersion, setRetryVersion] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingTheme, setEditingTheme] = useState(null)
  const [draft, setDraft] = useState(createEmptyDraft())
  const [saving, setSaving] = useState(false)
  const [editorError, setEditorError] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    let active = true

    async function loadThemes() {
      setLoading(true)
      setLoadError('')
      try {
        if (!isSupabaseConfigured) {
          throw new Error('Supabase is not configured.')
        }
        const client = await getSupabaseClient()
        if (!client) {
          throw new Error('Supabase is not configured.')
        }
        const records = await listAdminWebsiteThemes(client)
        if (active) {
          setThemes(records)
        }
      } catch (error) {
        if (active) {
          setLoadError(error instanceof Error ? error.message : 'Website themes could not be loaded.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadThemes()
    return () => {
      active = false
    }
  }, [retryVersion])

  const visibleThemes = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    return themes.filter((theme) => {
      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'published' && theme.is_published)
        || (statusFilter === 'unpublished' && !theme.is_published)
      const matchesSearch = !term
        || `${theme.name} ${theme.category} ${theme.slug}`.toLocaleLowerCase().includes(term)
      return matchesStatus && matchesSearch
    })
  }, [search, statusFilter, themes])

  function openCreateEditor() {
    setEditingTheme(null)
    setDraft(createEmptyDraft())
    setEditorError('')
    setEditorOpen(true)
  }

  function openEditEditor(theme) {
    setEditingTheme(theme)
    setDraft(createDraft(theme))
    setEditorError('')
    setEditorOpen(true)
  }

  async function removePreviewIfUnused(client, path) {
    if (!path) {
      return false
    }
    const snapshotCount = await countWebsiteThemePreviewEnquiries(client, path)
    if (snapshotCount > 0) {
      return true
    }
    await removeWebsiteThemePreview(client, path)
    return false
  }

  async function handleSaveTheme({ draft: validatedDraft, file, removeImage }) {
    setSaving(true)
    setEditorError('')
    setFeedback(null)
    let savedTheme = null

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured.')
      }
      const client = await getSupabaseClient()
      if (!client) {
        throw new Error('Supabase is not configured.')
      }

      savedTheme = await saveWebsiteTheme(client, validatedDraft, editingTheme?.id ?? null)
      const oldPreviewPath = editingTheme?.preview_image_path ?? null
      let cleanupNotice = ''

      if (file) {
        const newPreviewPath = await uploadWebsiteThemePreview(client, savedTheme.id, file)
        try {
          savedTheme = await updateWebsiteThemePreviewPath(client, savedTheme.id, newPreviewPath)
        } catch (updateError) {
          let cleanupError = ''
          try {
            await removeWebsiteThemePreview(client, newPreviewPath)
          } catch (removeError) {
            cleanupError = ` The newly uploaded file could not be cleaned up: ${removeError.message}`
          }
          throw new Error(`Theme details were saved, but the preview path could not be updated: ${updateError.message}.${cleanupError}`)
        }

        if (oldPreviewPath && oldPreviewPath !== newPreviewPath) {
          const retained = await removePreviewIfUnused(client, oldPreviewPath)
          if (retained) {
            cleanupNotice = ' The previous preview remains available for existing enquiry history.'
          }
        }
      } else if (removeImage && oldPreviewPath) {
        savedTheme = await updateWebsiteThemePreviewPath(client, savedTheme.id, null)
        const retained = await removePreviewIfUnused(client, oldPreviewPath)
        if (retained) {
          cleanupNotice = ' The previous preview remains available for existing enquiry history.'
        }
      }

      setThemes((previous) => {
        const withoutSaved = previous.filter((theme) => theme.id !== savedTheme.id)
        return [savedTheme, ...withoutSaved]
      })
      setFeedback({
        type: 'success',
        message: `${savedTheme.name} was saved.${cleanupNotice}`,
      })
      setEditorOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The website theme could not be saved.'
      setEditorError(
        savedTheme
          ? `Theme details were saved, but a follow-up preview operation failed: ${message}`
          : message,
      )
      setRetryVersion((version) => version + 1)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteTheme(theme) {
    if (!window.confirm(`Delete "${theme.name}" from the catalog?`)) {
      return
    }

    setDeletingId(theme.id)
    setFeedback(null)
    try {
      const client = await getSupabaseClient()
      if (!client) {
        throw new Error('Supabase is not configured.')
      }
      const enquiryCount = await countWebsiteThemeEnquiries(client, theme.id)
      if (enquiryCount > 0) {
        await saveWebsiteTheme(client, { ...createDraft(theme), is_published: false }, theme.id)
        setThemes((previous) => previous.map((entry) => (
          entry.id === theme.id ? { ...entry, is_published: false } : entry
        )))
        setFeedback({
          type: 'notice',
          message: `"${theme.name}" is referenced by ${enquiryCount} enquiry record(s), so it was unpublished instead of deleted.`,
        })
        return
      }

      await deleteWebsiteTheme(client, theme.id)
      setThemes((previous) => previous.filter((entry) => entry.id !== theme.id))
      let storageNotice = ''
      if (theme.preview_image_path) {
        const retained = await removePreviewIfUnused(client, theme.preview_image_path)
        if (retained) {
          storageNotice = ' Its preview file was kept for existing enquiry history.'
        }
      }
      setFeedback({
        type: 'success',
        message: `"${theme.name}" was deleted.${storageNotice}`,
      })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'The website theme could not be deleted.',
      })
    } finally {
      setDeletingId(null)
    }
  }

  const unpublishedCount = themes.filter((theme) => !theme.is_published).length
  const publishedCount = themes.length - unpublishedCount

  return (
    <div className="admin-website-themes">
      <header className="admin-page-heading admin-website-themes__heading">
        <div>
          <p className="eyebrow"><span className="eyebrow__dot" /> Catalog management</p>
          <h1>Website themes</h1>
          <p>Manage the public theme collection and its CSS previews or uploaded artwork.</p>
        </div>
        <Button type="button" onClick={openCreateEditor}>
          <Plus size={16} aria-hidden="true" /> Create theme
        </Button>
      </header>

      <div className="admin-website-themes__summary" aria-label="Theme catalog counts">
        <div><strong>{loading ? '…' : themes.length}</strong><span>Catalog entries</span></div>
        <div><strong>{loading ? '…' : publishedCount}</strong><span>Published</span></div>
        <div><strong>{loading ? '…' : unpublishedCount}</strong><span>Unpublished</span></div>
      </div>

      {feedback && (
        <div className={`admin-theme-feedback admin-theme-feedback--${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>
          {feedback.message}
        </div>
      )}

      <div className="admin-website-themes__toolbar">
        <label className="website-themes-search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search admin themes</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search themes"
          />
        </label>
        <label className="website-themes-category">
          <span className="sr-only">Filter themes by publication status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </label>
        <button
          className="button button--outline"
          type="button"
          onClick={() => setRetryVersion((version) => version + 1)}
          disabled={loading}
        >
          <RotateCw size={15} aria-hidden="true" /> Refresh
        </button>
      </div>

      {loading && (
        <div className="admin-theme-state" role="status">
          <span className="admin-theme-state__pulse" />
          <strong>Loading theme catalog</strong>
          <p>Reading theme records using your administrator session.</p>
        </div>
      )}
      {!loading && loadError && (
        <div className="admin-theme-state admin-theme-state--error" role="alert">
          <Palette size={22} aria-hidden="true" />
          <strong>The theme catalog could not be loaded.</strong>
          <p>{loadError} Confirm the website themes migration is applied and your database role is admin.</p>
          <button className="button button--outline" type="button" onClick={() => setRetryVersion((version) => version + 1)}>
            <RotateCw size={15} aria-hidden="true" /> Try again
          </button>
        </div>
      )}
      {!loading && !loadError && themes.length === 0 && (
        <div className="admin-theme-state">
          <ImagePlus size={22} aria-hidden="true" />
          <strong>No themes in the catalog</strong>
          <p>Create a theme to add an original CSS preview to the public collection.</p>
        </div>
      )}
      {!loading && !loadError && themes.length > 0 && visibleThemes.length === 0 && (
        <div className="admin-theme-state">
          <Search size={22} aria-hidden="true" />
          <strong>No themes match the current filters</strong>
          <p>Change the search or publication filter to see other themes.</p>
        </div>
      )}
      {!loading && !loadError && visibleThemes.length > 0 && (
        <div className="admin-website-themes__grid">
          {visibleThemes.map((theme) => (
            <article className="admin-theme-card" key={theme.id}>
              <WebsiteThemePreview theme={theme} />
              <div className="admin-theme-card__body">
                <div className="admin-theme-card__topline">
                  <span className={`admin-theme-status ${theme.is_published ? 'is-published' : 'is-unpublished'}`}>
                    {theme.is_published ? 'Published' : 'Unpublished'}
                  </span>
                  <span>{theme.category}</span>
                </div>
                <h2>{theme.name}</h2>
                <p>{theme.short_description}</p>
                <div className="admin-theme-card__actions">
                  <button className="button button--outline button--small" type="button" onClick={() => openEditEditor(theme)}>
                    <Palette size={14} aria-hidden="true" /> Edit
                  </button>
                  {theme.is_published
                    ? (
                      <button
                        className="button button--text button--small"
                        type="button"
                        disabled={deletingId === theme.id}
                        onClick={() => handleDeleteTheme(theme)}
                      >
                        <Archive size={14} aria-hidden="true" /> Unpublish / delete
                      </button>
                    )
                    : (
                      <button
                        className="button button--text button--small admin-theme-card__delete"
                        type="button"
                        disabled={deletingId === theme.id}
                        onClick={() => handleDeleteTheme(theme)}
                      >
                        <Trash2 size={14} aria-hidden="true" /> Delete
                      </button>
                    )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <ThemeEditorDialog
        open={editorOpen}
        draft={draft}
        themeId={editingTheme?.id ?? null}
        error={editorError}
        saving={saving}
        onChange={setDraft}
        onSave={handleSaveTheme}
        onClose={() => {
          if (!saving) {
            setEditorOpen(false)
            setEditorError('')
          }
        }}
      />
    </div>
  )
}

export default AdminWebsiteThemesPage
