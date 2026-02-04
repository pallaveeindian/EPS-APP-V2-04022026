// src/api/gsApi.js
//  import Config from "react-native-config";
import { X_API_ID, X_API_KEY } from '@env';  
const BASE_URL = 'http://66.116.207.88:8088';
const clientId = X_API_ID ;
const clientKey = X_API_KEY ;
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'X-API-ID': clientId,
  'X-API-KEY': clientKey,
};



let AUTH_TOKEN = null;
let REFRESH_TOKEN = null;

// ======================= TOKEN HELPERS =======================

export function setAuthToken(accessToken, refreshToken) {
  AUTH_TOKEN = accessToken || null;

  // keep backward compatibility (if only access is passed)
  if (typeof refreshToken !== 'undefined') {
    REFRESH_TOKEN = refreshToken || null;
  }
}

export function getAuthToken() {
  return AUTH_TOKEN;
}

export function getRefreshToken() {
  return REFRESH_TOKEN;
}

export function clearAuthTokens() {
  AUTH_TOKEN = null;
  REFRESH_TOKEN = null;
}

function buildUrl(path) {
  if (!path.startsWith('/')) path = '/' + path;
  return BASE_URL + path;
}

async function handleResponse(response) {
  const text = await response.text();

  if (!text) {
    if (!response.ok) throw { status: response.status, data: null };
    return null;
  }

  try {
    const data = JSON.parse(text);
    if (!response.ok) throw { status: response.status, data };
    return data;
  } catch (err) {
    if (response.ok) return text;
    throw err;
  }
}

function authHeaders(extra = {}) {
  const h = { ...DEFAULT_HEADERS, ...extra };
  if (AUTH_TOKEN) h['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  return h;
}

// ======================= AUTO REFRESH =======================

/**
 * DRF refresh endpoint returns ONLY:
 * { "access": "<newAccess>" }
 * Not "refresh".
 */
async function refreshAccessTokenOnce() {
  if (!REFRESH_TOKEN) {
    throw { status: 401, data: { detail: 'No refresh token available' } };
  }

  const resp = await fetch(buildUrl('/api/v1/auth/refresh/'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `ps_refresh=${REFRESH_TOKEN}`,
    },
  });

  try {
    const data = await handleResponse(resp);

    if (!data || !data.access) {
      throw { status: resp.status, data: data || null };
    }

    // only access token comes from backend
    AUTH_TOKEN = data.access;

    return AUTH_TOKEN;
  } catch (err) {
    clearAuthTokens();
    throw err;
  }
}

// Token expiry detector supports ALL possible DRF/SimpleJWT messages
function isAccessTokenExpired(err) {
  if (!err || !err.status) return false;
  if (err.status !== 401) return false;

  const detail =
    typeof err?.data?.detail === 'string'
      ? err.data.detail.toLowerCase()
      : '';

  return (
    detail.includes('token_not_valid') ||
    detail.includes('token is expired') ||
    detail.includes('not valid for any token type') ||
    detail.includes('invalid or expired') ||
    detail.includes('authentication credentials were not provided') ||
    detail.includes('signature has expired')
  );
}

// ======================= REQUEST (JSON) =======================

async function request(
  path,
  {
    method = 'GET',
    body = null,
    headers = {},
    useAuth = true,
    retryOnAuthFail = true,
  } = {}
) {
  const url = buildUrl(path);

  const doFetch = async () => {
    const finalHeaders = useAuth ? authHeaders(headers) : { ...headers };

    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body != null ? JSON.stringify(body) : undefined,
    });

    return handleResponse(res);
  };

  try {
    return await doFetch();
  } catch (err) {
    if (useAuth && retryOnAuthFail && isAccessTokenExpired(err) && REFRESH_TOKEN) {
      // refresh once
      await refreshAccessTokenOnce();
      return doFetch();
    }
    throw err;
  }
}

// ======================= REQUEST (MULTIPART) =======================

async function requestMultipart(
  path,
  {
    method = 'POST',
    body = null, // FormData
    headers = {},
    useAuth = true,
    retryOnAuthFail = true,
  } = {}
) {
  const url = buildUrl(path);

  const doFetch = async () => {
    const baseHeaders = useAuth ? authHeaders(headers) : { ...headers };

    // delete content-type so fetch sets boundary
    if (baseHeaders['Content-Type']) delete baseHeaders['Content-Type'];

    const res = await fetch(url, {
      method,
      headers: baseHeaders,
      body,
    });

    return handleResponse(res);
  };

  try {
    return await doFetch();
  } catch (err) {
    if (useAuth && retryOnAuthFail && isAccessTokenExpired(err) && REFRESH_TOKEN) {
      await refreshAccessTokenOnce();
      return doFetch();
    }
    throw err;
  }
}

// helper for query params
function buildQuery(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
  });
  const str = qs.toString();
  return str ? `?${str}` : '';
}

// ======================= AUTH =======================

export async function login(username, password) {
  const res = await fetch(buildUrl('/api/v1/auth/login/'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // no X-API-ID/KEY for login
    },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
}

// ======================= LOOKUPS =======================

export async function getDistricts(page = 1, search = '') {
  const qs = new URLSearchParams();
  qs.append('page', String(page));
  if (search) qs.append('search', search);

  return request(`/api/v1/lookups/districts/?${qs.toString()}`);
}

export async function getBlocksByDistrict(districtId, page = 1, search = '') {
  const qs = new URLSearchParams();
  qs.append('page', String(page));
  if (search) qs.append('search', search);

  return request(`/api/v1/lookups/blocks/${districtId}/?${qs.toString()}`);
}

export async function getPanchayatsByBlock(blockId, page = 1, search = '') {
  const qs = new URLSearchParams();
  qs.append('page', String(page));
  if (search) qs.append('search', search);

  return request(`/api/v1/lookups/panchayats/${blockId}/?${qs.toString()}`);
}

/**
 * Backward compatible:
 *   - old: getVillagesByPanchayat(panchayatId, page = 1, search = '')
 *   - new: getVillagesByPanchayat(panchayatId, { page, page_size, search, ... })
 */
export async function getVillagesByPanchayat(
  panchayatId,
  pageOrOptions = 1,
  search = ''
) {
  const qs = new URLSearchParams();

  if (typeof pageOrOptions === 'object' && pageOrOptions !== null) {
    // new style: second arg is an options object
    const { page = 1, page_size, search: s, ...rest } = pageOrOptions;

    qs.append('page', String(page));
    if (page_size !== undefined && page_size !== null && page_size !== '') {
      qs.append('page_size', String(page_size));
    }
    if (s) {
      qs.append('search', s);
    }
    // forward any extra params
    Object.entries(rest).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        qs.append(k, String(v));
      }
    });
  } else {
    // old style: (panchayatId, page, search)
    qs.append('page', String(pageOrOptions));
    if (search) qs.append('search', search);
  }

  const query = qs.toString();
  return request(
    `/api/v1/lookups/villages/${panchayatId}/${query ? `?${query}` : ''}`
  );
}

/**
 * Village detail lookup (used to get block_id for a village)
 * Endpoint: GET /api/v1/lookups/villages/detail/<village_id>/
 */
export async function getVillageDetail(villageId) {
  return request(`/api/v1/lookups/villages/detail/${villageId}/`);
}

// ======================= EP SAKHI HELPERS =======================

// CRP helper APIs

export async function getCrpDetailByUserId(userId, fields = null) {
  const query = fields ? `?fields=${encodeURIComponent(fields)}` : '';
  return request(`/api/v1/crp-detail/id/${userId}/${query}`);
}

export async function getCrpDetailByMember(memberCode, fields = null) {
  const query = fields ? `?fields=${encodeURIComponent(fields)}` : '';
  return request(`/api/v1/crp-detail/${memberCode}/${query}`);
}

export async function getCrpListByClf(clfCode, params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/crp-list/${clfCode}/${query}`);
}

export async function getPanchayatsUnderCrpByUserId(userId, params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/panchayats-under-crp/id/${userId}/${query}`);
}

export async function getPanchayatsUnderCrpByMember(memberCode, params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/panchayats-under-crp/${memberCode}/${query}`);
}

// Recorded beneficiaries (main)

export async function getRecordedBeneficiaries(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/recorded-beneficiaries/${query}`);
}

export async function getpld(parmas={}){
  const query= buildQuery(params);
  return request (`/api/v1/upsrlm-shg-members/${query}`);
}
export async function getRecordedBeneficiaryDetail(id) {
  return request(`/api/v1/recorded-beneficiaries/${id}/`);
}

export async function createRecordedBeneficiary(payload) {
  return request('/api/v1/recorded-beneficiaries/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateRecordedBeneficiary(id, payload) {
  return request(`/api/v1/recorded-beneficiaries/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteRecordedBeneficiary(id) {
  return request(`/api/v1/recorded-beneficiaries/${id}/`, {
    method: 'DELETE',
  });
}

// UPSRLM proxy APIs

export async function getUpsrlmShgList(blockId, params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/upsrlm-shg-list/${blockId}/${query}`);
}

export async function getUpsrlmShgMembers(shgCode, params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/upsrlm-shg-members/${shgCode}/${query}`);
}

// epSakhi helper APIs (beneficiary/enterprise combined detail)

export async function getEpsakhiListByShg(shgCode, params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/epsakhi-list/${shgCode}/${query}`);
}

export async function getEpsakhiDetailByMember(memberCode, params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/epsakhi-detail/${memberCode}/${query}`);
}

// ======================= ENTERPRISE (MAIN) =======================

export async function createExistingEnterprise(payload) {
  return request('/api/v1/existing-enterprise/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateExistingEnterprise(id, payload) {
  return request(`/api/v1/existing-enterprise/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function getExistingEnterprise(id) {
  return request(`/api/v1/existing-enterprise/${id}/`);
}

export async function getExistingEnterprises(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/existing-enterprise/${query}`);
}

function isFormData(obj) {
  return obj && typeof obj.append === 'function';
}

export async function createNewEnterprise(payload) {
  if (isFormData(payload)) {
    return requestMultipart('/api/v1/new-enterprise/', {
      method: 'POST',
      body: payload,
    });
  }
  return request('/api/v1/new-enterprise/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateNewEnterprise(id, payload) {
  if (isFormData(payload)) {
    return requestMultipart(`/api/v1/new-enterprise/${id}/`, {
      method: 'PATCH',
      body: payload,
    });
  }
  return request(`/api/v1/new-enterprise/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function getNewEnterprise(id) {
  return request(`/api/v1/new-enterprise/${id}/`);
}

export async function getNewEnterprises(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/new-enterprise/${query}`);
}

// ======================= ENTERPRISE CHILD MODELS =======================

// Loan details

export async function createEnterpriseLoanDetail(payload) {
  return request('/api/v1/enterprise-loan-details/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateEnterpriseLoanDetail(id, payload) {
  return request(`/api/v1/enterprise-loan-details/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteEnterpriseLoanDetail(id) {
  return request(`/api/v1/enterprise-loan-details/${id}/`, {
    method: 'DELETE',
  });
}

export async function getEnterpriseLoanDetails(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/enterprise-loan-details/${query}`);
}

// Subsidy / support details

export async function createEnterpriseSupportDetail(payload) {
  return request('/api/v1/enterprise-support-details/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateEnterpriseSupportDetail(id, payload) {
  return request(`/api/v1/enterprise-support-details/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteEnterpriseSupportDetail(id) {
  return request(`/api/v1/enterprise-support-details/${id}/`, {
    method: 'DELETE',
  });
}

export async function getEnterpriseSupportDetails(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/enterprise-support-details/${query}`);
}

// Training requirements (existing/new/no-enterprise, form_type = rec/req)

export async function createEnterpriseTrainingReq(payload) {
  return request('/api/v1/enterprise-training-reqs/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateEnterpriseTrainingReq(id, payload) {
  return request(`/api/v1/enterprise-training-reqs/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteEnterpriseTrainingReq(id) {
  return request(`/api/v1/enterprise-training-reqs/${id}/`, {
    method: 'DELETE',
  });
}

export async function getEnterpriseTrainingReqs(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/enterprise-training-reqs/${query}`);
}

// Media (existing/new enterprise)

export async function uploadEnterpriseMedia(formData) {
  return requestMultipart('/api/v1/enterprise-media/', {
    method: 'POST',
    body: formData,
  });
}

export async function updateEnterpriseMedia(id, formData) {
  return requestMultipart(`/api/v1/enterprise-media/${id}/`, {
    method: 'PATCH',
    body: formData,
  });
}

export async function deleteEnterpriseMedia(id) {
  return request(`/api/v1/enterprise-media/${id}/`, {
    method: 'DELETE',
  });
}

export async function getEnterpriseMediaList(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/enterprise-media/${query}`);
}

// Products

export async function createEnterpriseProduct(payload) {
  return request('/api/v1/enterprise-products/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateEnterpriseProduct(id, payload) {
  return request(`/api/v1/enterprise-products/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteEnterpriseProduct(id) {
  return request(`/api/v1/enterprise-products/${id}/`, {
    method: 'DELETE',
  });
}

export async function getEnterpriseProducts(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/enterprise-products/${query}`);
}

// Enterprise type/category (existing/new/no)

export async function createEnterpriseType(payload) {
  return request('/api/v1/enterprise-types/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateEnterpriseType(id, payload) {
  return request(`/api/v1/enterprise-types/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteEnterpriseType(id) {
  return request(`/api/v1/enterprise-types/${id}/`, {
    method: 'DELETE',
  });
}

export async function getEnterpriseTypes(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/enterprise-types/${query}`);
}

// ======================= NO-ENTERPRISE FLOWS =======================

// NoEnterpriseForm (for not interested)

export async function createNoEnterpriseForm(payload) {
  return request('/api/v1/no-enterprise-forms/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateNoEnterpriseForm(id, payload) {
  return request(`/api/v1/no-enterprise-forms/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteNoEnterpriseForm(id) {
  return request(`/api/v1/no-enterprise-forms/${id}/`, {
    method: 'DELETE',
  });
}

export async function getNoEnterpriseForms(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/no-enterprise-forms/${query}`);
}

// NoEnterpriseWage (wage placement preferences)

export async function createNoEnterpriseWage(payload) {
  return request('/api/v1/no-enterprise-wages/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateNoEnterpriseWage(id, payload) {
  return request(`/api/v1/no-enterprise-wages/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteNoEnterpriseWage(id) {
  return request(`/api/v1/no-enterprise-wages/${id}/`, {
    method: 'DELETE',
  });
}

export async function getNoEnterpriseWages(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/no-enterprise-wages/${query}`);
}

// ======================= EXPORT AGGREGATED API =======================

const api = {
  // auth
  login,
  setAuthToken,
  getAuthToken,
  getRefreshToken,
  clearAuthTokens,

  // lookups
  getDistricts,
  getBlocksByDistrict,
  getPanchayatsByBlock,
  getVillagesByPanchayat,
  getVillageDetail,

  // CRP helpers
  getCrpDetailByUserId,
  getCrpDetailByMember,
  getCrpListByClf,
  getPanchayatsUnderCrpByUserId,
  getPanchayatsUnderCrpByMember,

  // UPSRLM + epSakhi helper
  getUpsrlmShgList,
  getUpsrlmShgMembers,
  getEpsakhiListByShg,
  getEpsakhiDetailByMember,

  // recorded beneficiaries
  getRecordedBeneficiaries,
  getRecordedBeneficiaryDetail,
  createRecordedBeneficiary,
  updateRecordedBeneficiary,
  deleteRecordedBeneficiary,

  // enterprise main (existing / new)
  createExistingEnterprise,
  updateExistingEnterprise,
  getExistingEnterprise,
  getExistingEnterprises,
  createNewEnterprise,
  updateNewEnterprise,
  getNewEnterprise,
  getNewEnterprises,

  // child models - loan
  createEnterpriseLoanDetail,
  updateEnterpriseLoanDetail,
  deleteEnterpriseLoanDetail,
  getEnterpriseLoanDetails,

  // child models - subsidy/support
  createEnterpriseSupportDetail,
  updateEnterpriseSupportDetail,
  deleteEnterpriseSupportDetail,
  getEnterpriseSupportDetails,

  // child models - training
  createEnterpriseTrainingReq,
  updateEnterpriseTrainingReq,
  deleteEnterpriseTrainingReq,
  getEnterpriseTrainingReqs,

  // child models - media
  uploadEnterpriseMedia,
  updateEnterpriseMedia,
  deleteEnterpriseMedia,
  getEnterpriseMediaList,

  // child models - products
  createEnterpriseProduct,
  updateEnterpriseProduct,
  deleteEnterpriseProduct,
  getEnterpriseProducts,

  // child models - type/category
  createEnterpriseType,
  updateEnterpriseType,
  deleteEnterpriseType,
  getEnterpriseTypes,

  // no-enterprise flows
  createNoEnterpriseForm,
  updateNoEnterpriseForm,
  deleteNoEnterpriseForm,
  getNoEnterpriseForms,
  createNoEnterpriseWage,
  updateNoEnterpriseWage,
  deleteNoEnterpriseWage,
  getNoEnterpriseWages,
};

export default api;
