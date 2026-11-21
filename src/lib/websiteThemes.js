export const WEBSITE_THEME_PREVIEW_BUCKET = 'npx-website-theme-previews'
export const MAX_THEME_PREVIEW_BYTES = 5 * 1024 * 1024

export const WEBSITE_THEME_FIELDS = [
  'id',
  'name',
  'slug',
  'short_description',
  'description',
  'category',
  'colors',
  'suitable_business_types',
  'preview_image_path',
  'is_published',
  'created_at',
  'updated_at',
].join(', ')

export const THEME_COLOR_KEYS = ['primary', 'secondary', 'accent', 'surface', 'text']

const uuidPattern = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i
const themePreviewPathPattern = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}\/[A-Za-z0-9_-]+\.(png|jpg|jpeg|webp)$/i

export function getWebsiteThemeErrorMessage(error, fallback) {
  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message
  }
  if (typeof error === 'string' && error.trim()) {
    return error
  }
  return fallback
}

const imageFormats = {
  'image/jpeg': {
    extension: 'jpg',
    matches(bytes) {
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    },
  },
  'image/png': {
    extension: 'png',
    matches(bytes) {
      return bytes[0] === 0x89
        && bytes[1] === 0x50
        && bytes[2] === 0x4e
        && bytes[3] === 0x47
        && bytes[4] === 0x0d
        && bytes[5] === 0x0a
        && bytes[6] === 0x1a
        && bytes[7] === 0x0a
    },
  },
  'image/webp': {
    extension: 'webp',
    matches(bytes) {
      return bytes[0] === 0x52
        && bytes[1] === 0x49
        && bytes[2] === 0x46
        && bytes[3] === 0x46
        && bytes[8] === 0x57
        && bytes[9] === 0x45
        && bytes[10] === 0x42
        && bytes[11] === 0x50
    },
  },
}

function assertThemeRows(result) {
  if (result.error) {
    throw new Error(
      getWebsiteThemeErrorMessage(result.error, 'Supabase could not load website themes.'),
    )
  }
  if (!Array.isArray(result.data)) {
    throw new Error('Supabase did not return a valid website theme list.')
  }
  return result.data
}

function assertThemeRecord(result) {
  if (result.error) {
    throw new Error(getWebsiteThemeErrorMessage(result.error, 'Supabase could not save the website theme.'))
  }
  if (!result.data || typeof result.data !== 'object') {
    throw new Error('Supabase did not return the saved website theme.')
  }
  return result.data
}

export async function listPublishedWebsiteThemes(client) {
  const result = await client
    .from('website_themes')
    .select(WEBSITE_THEME_FIELDS)
    .eq('is_published', true)
    .order('name', { ascending: true })

  return assertThemeRows(result)
}

export async function getPublishedWebsiteThemeBySlug(client, slug) {
  if (!slug) {
    return null
  }

  const result = await client
    .from('website_themes')
    .select(WEBSITE_THEME_FIELDS)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (result.error) {
    throw new Error(getWebsiteThemeErrorMessage(result.error, 'Supabase could not load the website theme.'))
  }
  return result.data ?? null
}

export async function listAdminWebsiteThemes(client, { status = 'all', search = '' } = {}) {
  let query = client
    .from('website_themes')
    .select(WEBSITE_THEME_FIELDS)
    .order('updated_at', { ascending: false })

  if (status === 'published') {
    query = query.eq('is_published', true)
  } else if (status === 'unpublished') {
    query = query.eq('is_published', false)
  }

  const term = search.trim()
  if (term) {
    query = query.ilike('name', `%${term}%`)
  }

  return assertThemeRows(await query)
}

export function validateWebsiteThemeDraft(draft) {
  const errors = {}
  const name = draft.name.trim()
  const slug = draft.slug.trim()
  const shortDescription = draft.short_description.trim()
  const description = draft.description.trim()
  const category = draft.category.trim()
  const businessTypes = Array.isArray(draft.suitable_business_types)
    ? draft.suitable_business_types.map((value) => value.trim()).filter(Boolean)
    : []

  if (name.length < 2 || name.length > 80) {
    errors.name = 'Enter a theme name between 2 and 80 characters.'
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.slug = 'Use lowercase letters, numbers, and single hyphens for the slug.'
  }
  if (shortDescription.length < 8 || shortDescription.length > 240) {
    errors.short_description = 'Enter a short description between 8 and 240 characters.'
  }
  if (description.length < 20 || description.length > 4000) {
    errors.description = 'Enter a description between 20 and 4000 characters.'
  }
  if (category.length < 2 || category.length > 80) {
    errors.category = 'Enter a category between 2 and 80 characters.'
  }
  if (businessTypes.length > 20) {
    errors.suitable_business_types = 'Enter no more than 20 suitable business types.'
  }

  const colors = {}
  for (const key of THEME_COLOR_KEYS) {
    const color = draft.colors?.[key]
    if (typeof color !== 'string' || !/^#[\da-f]{6}$/i.test(color.trim())) {
      errors[`colors.${key}`] = 'Use a six-digit hexadecimal colour.'
    } else {
      colors[key] = color.trim().toUpperCase()
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors, value: null }
  }

  return {
    errors,
    value: {
      name,
      slug,
      short_description: shortDescription,
      description,
      category,
      colors,
      suitable_business_types: businessTypes,
      is_published: Boolean(draft.is_published),
    },
  }
}

export async function createWebsiteEnquiry(client, values, profileId = null) {
  const requiredFields = ['name', 'email', 'service', 'message']
  for (const field of requiredFields) {
    if (typeof values[field] !== 'string' || !values[field].trim()) {
      throw new Error(`Please provide a valid ${field.replace('_', ' ')}.`)
    }
  }
  const fieldLimits = {
    name: 100,
    email: 254,
    phone: 40,
    service: 120,
    message: 3000,
    business_name: 160,
    business_category: 100,
    website_type: 120,
    budget_range: 80,
  }
  for (const [field, limit] of Object.entries(fieldLimits)) {
    const value = values[field]
    if (typeof value === 'string' && value.trim().length > limit) {
      throw new Error(`${field.replace('_', ' ')} must be no more than ${limit} characters.`)
    }
  }
  if (values.message.trim().length < 20) {
    throw new Error('Please describe your project in at least 20 characters.')
  }
  if (profileId && !uuidPattern.test(profileId)) {
    throw new Error('The signed-in profile could not be verified.')
  }

  const optionalValue = (value) => (
    typeof value === 'string' && value.trim() ? value.trim() : null
  )
  const themeId = optionalValue(values.selected_theme_id)
  if (themeId && !uuidPattern.test(themeId)) {
    throw new Error('The selected website theme is invalid.')
  }

  const enquiry = {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: optionalValue(values.phone),
    service: values.service.trim(),
    message: values.message.trim(),
    business_name: optionalValue(values.business_name),
    business_category: optionalValue(values.business_category),
    website_type: optionalValue(values.website_type),
    budget_range: optionalValue(values.budget_range),
    selected_theme_id: themeId,
    ...(profileId ? { profile_id: profileId } : {}),
  }

  const result = await client.from('enquiries').insert(enquiry)
  if (result.error) {
    if (['42501', '42P01', '42703', 'PGRST204', 'PGRST205'].includes(result.error.code)) {
      throw new Error(
        'The enquiry could not be stored. Confirm the website themes migration and its RLS policies are applied.',
      )
    }
    throw new Error(getWebsiteThemeErrorMessage(result.error, 'Supabase could not store the enquiry.'))
  }
}

export async function saveWebsiteTheme(client, draft, themeId = null) {
  const validation = validateWebsiteThemeDraft(draft)
  if (!validation.value) {
    throw new Error('Review the theme fields and correct the validation errors.')
  }

  const result = themeId
    ? await client
      .from('website_themes')
      .update(validation.value)
      .eq('id', themeId)
      .select(WEBSITE_THEME_FIELDS)
      .single()
    : await client
      .from('website_themes')
      .insert(validation.value)
      .select(WEBSITE_THEME_FIELDS)
      .single()

  return assertThemeRecord(result)
}

export async function updateWebsiteThemePreviewPath(client, themeId, previewImagePath) {
  const result = await client
    .from('website_themes')
    .update({ preview_image_path: previewImagePath })
    .eq('id', themeId)
    .select(WEBSITE_THEME_FIELDS)
    .single()

  return assertThemeRecord(result)
}

export async function countWebsiteThemeEnquiries(client, themeId) {
  const result = await client
    .from('enquiries')
    .select('id', { count: 'exact', head: true })
    .eq('selected_theme_id', themeId)

  if (result.error) {
    throw new Error(getWebsiteThemeErrorMessage(result.error, 'Supabase could not count enquiry references.'))
  }
  if (!Number.isSafeInteger(result.count) || result.count < 0) {
    throw new Error('Supabase did not return a valid enquiry reference count.')
  }
  return result.count
}

export async function countWebsiteThemePreviewEnquiries(client, previewPath) {
  const result = await client
    .from('enquiries')
    .select('id', { count: 'exact', head: true })
    .eq('selected_theme_preview_path', previewPath)

  if (result.error) {
    throw new Error(getWebsiteThemeErrorMessage(result.error, 'Supabase could not count saved preview references.'))
  }
  if (!Number.isSafeInteger(result.count) || result.count < 0) {
    throw new Error('Supabase did not return a valid historical preview count.')
  }
  return result.count
}

export async function uploadWebsiteThemePreview(client, themeId, file) {
  const format = await validateThemePreviewFile(file)
  if (!uuidPattern.test(themeId)) {
    throw new Error('A valid theme ID is required before uploading a preview.')
  }
  if (!globalThis.crypto?.randomUUID) {
    throw new Error('Secure unique filenames are unavailable in this browser.')
  }

  const path = `${themeId}/${globalThis.crypto.randomUUID()}.${format.extension}`
  const result = await client
    .storage
    .from(WEBSITE_THEME_PREVIEW_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    })

  if (result.error) {
    throw new Error(getWebsiteThemeErrorMessage(result.error, 'Supabase could not upload the theme preview.'))
  }
  if (!result.data?.path) {
    throw new Error('Supabase did not return the uploaded preview path.')
  }
  return result.data.path
}

export async function validateThemePreviewFile(file) {
  if (!file || typeof file.slice !== 'function' || !Number.isFinite(file.size)) {
    throw new Error('Choose a valid PNG, JPEG, or WebP image file.')
  }
  if (file.size < 1 || file.size > MAX_THEME_PREVIEW_BYTES) {
    throw new Error('Theme preview images must be between 1 byte and 5 MB.')
  }

  const format = imageFormats[file.type]
  if (!format) {
    throw new Error('Theme previews must use PNG, JPEG, or WebP format.')
  }

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  if (!format.matches(bytes)) {
    throw new Error('The selected file content does not match its image format.')
  }
  return format
}

export async function removeWebsiteThemePreview(client, path) {
  if (!path) {
    return
  }
  if (!themePreviewPathPattern.test(path)) {
    throw new Error('The stored theme preview path is invalid.')
  }

  const result = await client
    .storage
    .from(WEBSITE_THEME_PREVIEW_BUCKET)
    .remove([path])

  if (result.error) {
    throw new Error(getWebsiteThemeErrorMessage(result.error, 'Supabase could not remove the theme preview.'))
  }
}

export async function downloadWebsiteThemePreview(client, path) {
  if (!themePreviewPathPattern.test(path)) {
    throw new Error('The stored theme preview path is invalid.')
  }

  const result = await client
    .storage
    .from(WEBSITE_THEME_PREVIEW_BUCKET)
    .download(path)

  if (result.error) {
    throw new Error(getWebsiteThemeErrorMessage(result.error, 'Supabase could not load the theme preview.'))
  }
  if (!(result.data instanceof Blob) || result.data.size < 1) {
    throw new Error('Supabase did not return a valid theme preview image.')
  }
  return result.data
}

export async function deleteWebsiteTheme(client, themeId) {
  const result = await client
    .from('website_themes')
    .delete()
    .eq('id', themeId)

  if (result.error) {
    throw new Error(getWebsiteThemeErrorMessage(result.error, 'Supabase could not delete the website theme.'))
  }
}
