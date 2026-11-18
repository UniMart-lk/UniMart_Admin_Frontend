import api from './api';

/**
 * Fetch paginated users with filtering, sorting, and category counts.
 */
export async function fetchAdminUsers({
  page = 1,
  limit = 6,
  search = '',
  userType = '',
  status = '',
  sort = 'recent',
} = {}) {
  const params = {
    page,
    limit,
    sort,
    excludeRole: 'ADMIN',
  };

  if (search.trim()) params.search = search.trim();
  if (userType) params.userType = userType;
  if (status) params.status = status;

  const response = await api.get('/admin/users', { params });
  return response.data;
}

/**
 * Fetch detailed user profile and activity counts by ID.
 */
export async function fetchAdminUserById(userId) {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data?.data?.user;
}

/**
 * Update a single user's account status (ACTIVE | SUSPENDED | DEACTIVATED).
 */
export async function updateAdminUserStatus(userId, status) {
  const response = await api.patch(`/admin/users/${userId}/status`, { status });
  return response.data?.data?.user;
}

/**
 * Bulk update status for selected users.
 */
export async function bulkUpdateAdminUserStatus(ids, status) {
  const response = await api.patch('/admin/users/bulk-status', { ids, status });
  return response.data;
}

/**
 * Bulk delete selected non-admin users.
 */
export async function bulkDeleteAdminUsers(ids) {
  const response = await api.post('/admin/users/bulk-delete', { ids });
  return response.data;
}
