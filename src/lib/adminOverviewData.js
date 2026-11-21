export function createAdminOverviewRequestKey(userId, role, retryVersion) {
  if (!userId || role !== 'admin') {
    return null
  }
  return `${userId}:${role}:${retryVersion}`
}

function countQuery(client, table, status) {
  let query = client.from(table).select('id', { count: 'exact', head: true })
  if (status) {
    query = query.eq('status', status)
  }
  return query
}

function assertCount(result, label) {
  if (!Number.isSafeInteger(result.count) || result.count < 0) {
    throw new Error(`Supabase did not return a valid count for ${label}.`)
  }
  return result.count
}

function assertRows(result, label) {
  if (!Array.isArray(result.data)) {
    throw new Error(`Supabase did not return a valid ${label} list.`)
  }
  return result.data
}

export async function fetchAdminOverviewData(client) {
  const results = await Promise.all([
    countQuery(client, 'enquiries'),
    countQuery(client, 'customers'),
    countQuery(client, 'projects', 'in_progress'),
    countQuery(client, 'projects', 'completed'),
    countQuery(client, 'payments', 'pending'),
    client
      .from('enquiries')
      .select('id, name, email, service, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    client
      .from('activity_logs')
      .select('id, action, entity_type, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const failedResult = results.find((result) => result.error)
  if (failedResult) {
    throw failedResult.error
  }

  return {
    totalEnquiries: assertCount(results[0], 'enquiries'),
    totalCustomers: assertCount(results[1], 'customers'),
    activeProjects: assertCount(results[2], 'active projects'),
    completedProjects: assertCount(results[3], 'completed projects'),
    pendingPayments: assertCount(results[4], 'pending payments'),
    recentEnquiries: assertRows(results[5], 'recent enquiries'),
    recentActivities: assertRows(results[6], 'recent activity'),
  }
}
