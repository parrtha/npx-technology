import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createAdminOverviewRequestKey,
  fetchAdminOverviewData,
} from './adminOverviewData.js'

function createSupabaseStub(responses) {
  const calls = []
  const responseQueues = Object.fromEntries(
    Object.entries(responses).map(([table, tableResponses]) => [table, [...tableResponses]]),
  )

  return {
    calls,
    client: {
      from(table) {
        const response = responseQueues[table]?.shift()
        const call = { table, filters: [] }
        calls.push(call)

        const builder = {
          select(columns, options) {
            call.columns = columns
            call.options = options
            return this
          },
          eq(column, value) {
            call.filters.push([column, value])
            return this
          },
          order(column, options) {
            call.order = [column, options]
            return this
          },
          limit(value) {
            call.limit = value
            return this
          },
          then(resolve, reject) {
            return Promise.resolve(response).then(resolve, reject)
          },
        }

        return builder
      },
    },
  }
}

test('queries actual counts and newest admin overview records', async () => {
  const stub = createSupabaseStub({
    enquiries: [
      { count: 8, error: null },
      { data: [{ id: 'enquiry-1' }], error: null },
    ],
    customers: [{ count: 3, error: null }],
    projects: [
      { count: 2, error: null },
      { count: 1, error: null },
    ],
    payments: [{ count: 4, error: null }],
    activity_logs: [{ data: [{ id: 'activity-1' }], error: null }],
  })

  test('keys overview requests to stable user identity, role and retry version', () => {
    const firstSession = { user: { id: 'admin-1' }, access_token: 'first-token' }
    const refreshedSession = { user: { id: 'admin-1' }, access_token: 'refreshed-token' }

    const firstKey = createAdminOverviewRequestKey(firstSession.user.id, 'admin', 0)
    const refreshedKey = createAdminOverviewRequestKey(refreshedSession.user.id, 'admin', 0)

    assert.equal(firstKey, refreshedKey)
    assert.notEqual(createAdminOverviewRequestKey('admin-2', 'admin', 0), firstKey)
    assert.notEqual(createAdminOverviewRequestKey('admin-1', 'customer', 0), firstKey)
    assert.notEqual(createAdminOverviewRequestKey('admin-1', 'admin', 1), firstKey)
    assert.equal(createAdminOverviewRequestKey(null, 'admin', 0), null)
  })

  const overview = await fetchAdminOverviewData(stub.client)

  assert.deepEqual(overview, {
    totalEnquiries: 8,
    totalCustomers: 3,
    activeProjects: 2,
    completedProjects: 1,
    pendingPayments: 4,
    recentEnquiries: [{ id: 'enquiry-1' }],
    recentActivities: [{ id: 'activity-1' }],
  })
  assert.deepEqual(
    stub.calls.filter(({ table }) => table === 'projects').map(({ filters }) => filters),
    [[['status', 'in_progress']], [['status', 'completed']]],
  )
  assert.deepEqual(
    stub.calls.filter(({ table }) => table === 'payments').map(({ filters }) => filters),
    [[['status', 'pending']]],
  )
  assert.ok(
    stub.calls
      .filter(({ options }) => options?.head)
      .every(({ options }) => options.count === 'exact'),
  )
  assert.deepEqual(
    stub.calls
      .filter(({ order }) => order)
      .map(({ order, limit }) => [order, limit]),
    [
      [['created_at', { ascending: false }], 5],
      [['created_at', { ascending: false }], 5],
    ],
  )
  assert.ok(stub.calls.every(({ limit }) => limit === undefined || limit === 5))
})

test('surfaces RLS/query failures instead of displaying fabricated totals', async () => {
  const rlsError = Object.assign(new Error('permission denied'), { code: '42501' })
  const stub = createSupabaseStub({
    enquiries: [
      { count: null, error: rlsError },
      { data: [], error: null },
    ],
    customers: [{ count: 0, error: null }],
    projects: [
      { count: 0, error: null },
      { count: 0, error: null },
    ],
    payments: [{ count: 0, error: null }],
    activity_logs: [{ data: [], error: null }],
  })

  await assert.rejects(fetchAdminOverviewData(stub.client), rlsError)
})
