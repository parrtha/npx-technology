import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createWebsiteEnquiry,
  listPublishedWebsiteThemes,
  validateThemePreviewFile,
  validateWebsiteThemeDraft,
} from './websiteThemes.js'

const validDraft = {
  name: 'Studio',
  slug: 'studio',
  short_description: 'A clear digital home for creative teams.',
  description: 'A responsive website theme designed for independent creative businesses.',
  category: 'Creative',
  colors: {
    primary: '#123456',
    secondary: '#234567',
    accent: '#345678',
    surface: '#456789',
    text: '#56789a',
  },
  suitable_business_types: ['Design studio'],
  is_published: false,
}

function createThemeQueryStub(response) {
  const calls = []
  const builder = {
    select(columns) {
      calls.push(['select', columns])
      return this
    },
    eq(column, value) {
      calls.push(['eq', column, value])
      return this
    },
    order(column, options) {
      calls.push(['order', column, options])
      return this
    },
    then(resolve, reject) {
      return Promise.resolve(response).then(resolve, reject)
    },
  }

  return {
    calls,
    client: {
      from(table) {
        calls.push(['from', table])
        return builder
      },
    },
  }
}

test('only requests published themes for the public gallery', async () => {
  const themes = [{ id: 'theme-id', name: 'Studio' }]
  const stub = createThemeQueryStub({ data: themes, error: null })

  assert.deepEqual(await listPublishedWebsiteThemes(stub.client), themes)
  assert.ok(stub.calls.some((call) => call[0] === 'eq' && call[1] === 'is_published' && call[2] === true))
  assert.ok(stub.calls.some((call) => call[0] === 'order' && call[1] === 'name'))
})

test('surfaces public theme query errors rather than treating them as an empty catalog', async () => {
  const error = Object.assign(new Error('permission denied'), { code: '42501' })
  const stub = createThemeQueryStub({ data: null, error })

  await assert.rejects(listPublishedWebsiteThemes(stub.client), /permission denied/)
})

test('validates theme fields and normalizes saved palette values', () => {
  const validation = validateWebsiteThemeDraft(validDraft)
  assert.deepEqual(validation.errors, {})
  assert.equal(validation.value.colors.text, '#56789A')
  assert.equal(validation.value.suitable_business_types[0], 'Design studio')

  const invalid = validateWebsiteThemeDraft({ ...validDraft, slug: 'Not A Slug' })
  assert.equal(invalid.value, null)
  assert.match(invalid.errors.slug, /lowercase/)
})

test('checks preview image signatures and rejects unsupported or oversized files', async () => {
  const jpeg = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0x00])], { type: 'image/jpeg' })
  assert.equal((await validateThemePreviewFile(jpeg)).extension, 'jpg')

  const spoofedPng = new Blob([new Uint8Array([0x00, 0x01, 0x02])], { type: 'image/png' })
  await assert.rejects(validateThemePreviewFile(spoofedPng), /does not match/)

  const unsupported = new Blob([new Uint8Array([0x00])], { type: 'image/svg+xml' })
  await assert.rejects(validateThemePreviewFile(unsupported), /PNG, JPEG, or WebP/)

  const oversized = new Blob([
    new Uint8Array(5 * 1024 * 1024 + 1),
  ], { type: 'image/jpeg' })
  await assert.rejects(validateThemePreviewFile(oversized), /between 1 byte and 5 MB/)
})

test('submits only allowed enquiry fields and binds signed-in submissions to their profile', async () => {
  let insertedTable
  let insertedValues
  const client = {
    from(table) {
      insertedTable = table
      return {
        insert(values) {
          insertedValues = values
          return Promise.resolve({ error: null })
        },
      }
    },
  }

  await createWebsiteEnquiry(client, {
    name: '  Alex Example ',
    email: ' alex@example.com ',
    phone: '',
    service: 'Website design',
    message: 'A project brief long enough to submit.',
    business_name: 'Example Studio',
    business_category: 'Creative',
    website_type: 'Business website',
    budget_range: '',
    selected_theme_id: null,
    status: 'closed',
    selected_theme_name: 'Spoofed value',
  }, '00000000-0000-4000-8000-000000000001')

  assert.equal(insertedTable, 'enquiries')
  assert.deepEqual(insertedValues, {
    name: 'Alex Example',
    email: 'alex@example.com',
    phone: null,
    service: 'Website design',
    message: 'A project brief long enough to submit.',
    business_name: 'Example Studio',
    business_category: 'Creative',
    website_type: 'Business website',
    budget_range: null,
    selected_theme_id: null,
    profile_id: '00000000-0000-4000-8000-000000000001',
  })
})
