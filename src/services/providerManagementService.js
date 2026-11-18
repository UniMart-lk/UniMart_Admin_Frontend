import api from './api';

/**
 * Fetch paginated providers with filtering, sorting, and tab counts.
 */
export async function fetchAdminProviders({
  page = 1,
  limit = 6,
  search = '',
  providerType = '',
  verificationStatus = '',
  accountStatus = '',
  sort = 'recent',
} = {}) {
  const params = { page, limit, sort };

  if (search.trim()) params.search = search.trim();
  if (providerType) params.providerType = providerType;
  if (verificationStatus) params.verificationStatus = verificationStatus;
  if (accountStatus) params.accountStatus = accountStatus;

  const response = await api.get('/admin/providers', { params });
  return response.data;
}

/**
 * Fetch detailed single provider profile and listing counts by provider ID.
 */
export async function fetchAdminProviderById(providerId) {
  const response = await api.get(`/admin/providers/${providerId}`);
  return response.data?.data?.provider;
}

/**
 * Approve or reject a provider's verification status.
 */
export async function verifyAdminProvider(providerId, { status, rejectionReason }) {
  const response = await api.patch(`/admin/providers/${providerId}/verify`, {
    status,
    rejectionReason,
  });
  return response.data?.data?.provider;
}
