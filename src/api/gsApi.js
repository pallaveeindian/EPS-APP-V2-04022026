// src/api/gsApi.js
//  import Config from "react-native-config";
import { X_API_ID, X_API_KEY, API_ENCRYPTION_KEY as ENV_API_KEY } from '@env';
import { getUser, saveUser } from '../utils/auth';
import CryptoJS from 'crypto-js';

const BASE_URL = 'http://upsrlmtms.upsdc.gov.in';
const clientId = X_API_ID;
const clientKey = X_API_KEY;
const SECRET_KEY = ENV_API_KEY;

// http://72.61.255.170:8080
// VUN - 14 FIX
// function decryptPayload(responseData) {
//   // If it doesn't match our {iv, data} payload shape, return it as-is
//   if (
//     !responseData ||
//     typeof responseData !== 'object' ||
//     !responseData.iv ||
//     !responseData.data
//   ) {
//     return responseData;
//   }

//   try {
//     const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
//     const iv = CryptoJS.enc.Base64.parse(responseData.iv);
//     const ciphertext = CryptoJS.enc.Base64.parse(responseData.data);

//     const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });
//     const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
//       iv: iv,
//       mode: CryptoJS.mode.CBC,
//       padding: CryptoJS.pad.Pkcs7,
//     });

//     const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
//     return JSON.parse(decryptedString);
//   } catch (error) {
//     console.error('API Decryption failed:', error);
//     return responseData;
//   }
// }

export function decryptPayload(responseData) {
  if (
    !responseData ||
    typeof responseData !== 'object' ||
    !responseData.iv ||
    !responseData.data
  ) {
    return responseData;
  }
  try {
    const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
    const iv = CryptoJS.enc.Base64.parse(responseData.iv);
    const ciphertext = CryptoJS.enc.Base64.parse(responseData.data);

    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });

    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    //  If empty → decryption failed
    if (!decryptedString) {
      return null;
    }
    const parsed = JSON.parse(decryptedString);
    return parsed;
  } catch (error) {
    return responseData;
  }
}

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'X-API-ID': clientId,
  'X-API-KEY': clientKey,
  'X-App-Client': 'CRP-EP_APP',
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

// async function handleResponse(response) {
//   const text = await response.text();

//   let data;

//   try {
//     data = text ? JSON.parse(text) : null;
//     data = decryptPayload(data);
//   } catch (e) {
//     // Not JSON — wrap raw text properly
//     data = { detail: text };
//   }

//   if (!response.ok) {
//     throw {
//       status: response.status,
//       data,
//     };
//   }

//   return data;
// }

async function handleResponse(response) {
  // 1. Grab the exact raw text from the server, no matter what it is
  const text = await response.text();

  // 2. PRINT IT LOUD AND CLEAR
  console.log('====== RAW API RESPONSE ======');
  console.log('STATUS:', response.status);
  console.log('URL:', response.url);
  // Print the first 500 characters to avoid flooding the terminal if it's a massive HTML page
  console.log('BODY:', text.substring(0, 500));
  console.log('==============================');

  let data = null;

  try {
    if (text) {
      const parsed = JSON.parse(text);
      // Only decrypt if it looks like your encrypted payload
      if (parsed && typeof parsed === 'object' && parsed.iv && parsed.data) {
        data = decryptPayload(parsed);
      } else {
        data = parsed;
      }
    }
  } catch (e) {
    // If JSON.parse fails, the server sent us HTML or garbage.
    data = { detail: 'Server returned non-JSON response', rawText: text };
  }

  if (!response.ok) {
    throw {
      status: response.status,
      data: data,
    };
  }

  return data;
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
    },
    body: JSON.stringify({
      refresh: REFRESH_TOKEN,
    }),
    credentials: 'include',
  });

  try {
    const data = await handleResponse(resp);

    if (!data || !data.access) {
      throw { status: resp.status, data: data || null };
    }

    // only access token comes from backend
    AUTH_TOKEN = data.access;

    // 🔥 Persist new access token in AsyncStorage
    const saved = await getUser();
    if (saved) {
      saved.access = data.access;
      await saveUser(saved);
    }

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
    typeof err?.data?.detail === 'string' ? err.data.detail.toLowerCase() : '';

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
  } = {},
) {
  const url = buildUrl(path);

  const doFetch = async () => {
    const finalHeaders = useAuth ? authHeaders(headers) : { ...headers };

    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body != null ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });

    return handleResponse(res);
  };

  try {
    return await doFetch();
  } catch (err) {
    if (
      useAuth &&
      retryOnAuthFail &&
      isAccessTokenExpired(err) &&
      REFRESH_TOKEN
    ) {
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
  } = {},
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
      credentials: 'include',
    });

    return handleResponse(res);
  };

  try {
    return await doFetch();
  } catch (err) {
    if (
      useAuth &&
      retryOnAuthFail &&
      isAccessTokenExpired(err) &&
      REFRESH_TOKEN
    ) {
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
// ======================= 🔐 ENCRYPT PAYLOAD =======================
// ADDED: encrypt function (same config as decrypt)

function encryptPayload(payload) {
  try {
    const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);

    // random IV (16 bytes)
    const iv = CryptoJS.lib.WordArray.random(16);

    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return {
      iv: CryptoJS.enc.Base64.stringify(iv),
      data: CryptoJS.enc.Base64.stringify(encrypted.ciphertext),
    };
  } catch (e) {
    console.log('Encryption failed', e);
    return payload; // fallback (important)
  }
}

export async function login(username, password, captcha = null) {
  //  ADDED: prepare payload
  const rawPayload = {
    username,
    password,
    captcha,
  };

  // ADDED: encrypt payload
  const encryptedBody = encryptPayload(rawPayload);

  const res = await fetch(buildUrl('/api/v1/auth/login/'), {
    method: 'POST',
    headers: {
      ...DEFAULT_HEADERS,
    },
    credentials: 'include',

    // CHANGED: send encrypted instead of raw
    body: JSON.stringify(encryptedBody), //  CHANGED
  });

  return handleResponse(res);
}

// export async function login(username, password, captcha = null) {
//   const res = await fetch(buildUrl('/api/v1/auth/login/'), {
//     method: 'POST',
//     headers: {
//       ...DEFAULT_HEADERS,
//     },
//     credentials: 'include',
//     body: JSON.stringify({
//       username,
//       password,
//       captcha,
//     }),
//   });

//   return handleResponse(res);
// }
// ======================= LOOKUPS =======================

/* ================= Districts ================= */

export async function getDistricts(page = 1, search = '', pageSize = null) {
  const qs = new URLSearchParams();
  qs.append('page', String(page));

  if (search) qs.append('search', search);
  if (pageSize) qs.append('page_size', String(pageSize));

  return request(`/api/v1/lookups/districts/?${qs.toString()}`);
}

/* ================= Blocks ================= */

export async function getBlocksByDistrict(
  districtId,
  page = 1,
  search = '',
  pageSize = null,
) {
  const qs = new URLSearchParams();
  qs.append('page', String(page));

  if (search) qs.append('search', search);
  if (pageSize) qs.append('page_size', String(pageSize));

  return request(`/api/v1/lookups/blocks/${districtId}/?${qs.toString()}`);
}

/* ================= Panchayats ================= */

export async function getPanchayatsByBlock(
  blockId,
  page = 1,
  search = '',
  pageSize = null,
) {
  const qs = new URLSearchParams();
  qs.append('page', String(page));

  if (search) qs.append('search', search);
  if (pageSize) qs.append('page_size', String(pageSize));

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
  search = '',
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
    `/api/v1/lookups/villages/${panchayatId}/${query ? `?${query}` : ''}`,
  );
}

/**
 * Village detail lookup (used to get block_id for a village)
 * Endpoint: GET /api/v1/lookups/villages/detail/<village_id>/
 */
export async function getVillageDetail(villageId) {
  return request(`/api/v1/lookups/villages/detail/${villageId}/`);
}

// ======================= EP SAKHI ANALYTICS =======================
export async function getEPSakhiAnalytics() {
  return request('/api/v1/epsakhi/eps-admin-dash/');
}

export async function getAdminCrpList(params = {}) {
  const query = buildQuery({
    // page_size: 50000,
    ...params,
  });

  return request(`/api/v1/epsakhi/eps-admin-crp/${query}`);
}

// ======================= EP SAKHI HELPERS =======================

// CRP helper APIs

export async function getCrpDetailByUserId(userId, fields = null) {
  const query = fields ? `?fields=${encodeURIComponent(fields)}` : '';
  return request(`/api/v1/epsakhi/crp-detail/id/${userId}/${query}`);
}

export async function getCrpDetailByMember(memberCode, fields = null) {
  const query = fields ? `?fields=${encodeURIComponent(fields)}` : '';
  return request(`/api/v1/epsakhi/crp-detail/${memberCode}/${query}`);
}

export async function getCrpListByClf(clfCode, params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/epsakhi/crp-list/${clfCode}/${query}`);
}

export async function getPanchayatsUnderCrpByUserId(userId, params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/epsakhi/panchayats-under-crp/id/${userId}/${query}`);
}

export async function getPanchayatsUnderCrpByMember(memberCode, params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/epsakhi/panchayats-under-crp/${memberCode}/${query}`);
}

/* ================= CRP-PANCHAYAT CRUD ================= */

export async function createCrpPanchayat(payload) {
  return request('/api/v1/epsakhi/crud-panchayats-under-crp/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateCrpPanchayat(id, payload) {
  return request(`/api/v1/epsakhi/crud-panchayats-under-crp/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteCrpPanchayat(id) {
  return request(`/api/v1/epsakhi/crud-panchayats-under-crp/${id}/`, {
    method: 'DELETE',
  });
}

// Recorded beneficiaries (main)

export async function getRecordedBeneficiaries(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/epsakhi/recorded-beneficiaries/${query}`);
}

export async function getpld(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/upsrlm-shg-members/${query}`);
}
export async function getRecordedBeneficiaryDetail(id) {
  return request(`/api/v1/epsakhi/recorded-beneficiaries/${id}/`);
}

export async function createRecordedBeneficiary(payload) {
  return request('/api/v1/epsakhi/recorded-beneficiaries/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateRecordedBeneficiary(id, payload) {
  return request(`/api/v1/epsakhi/recorded-beneficiaries/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteRecordedBeneficiary(id) {
  return request(`/api/v1/epsakhi/recorded-beneficiaries/${id}/`, {
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
  return request(`/api/v1/epsakhi/epsakhi-list/${shgCode}/${query}`);
}

export async function getEpsakhiDetailByMember(memberCode, params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/epsakhi/epsakhi-detail/${memberCode}/${query}`);
}

// ======================= ENTERPRISE (MAIN) =======================

export async function createExistingEnterprise(payload) {
  return request('/api/v1/epsakhi/existing-enterprise/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateExistingEnterprise(id, payload) {
  return request(`/api/v1/epsakhi/existing-enterprise/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function getExistingEnterprise(id) {
  return request(`/api/v1/epsakhi/existing-enterprise/${id}/`);
}

export async function getExistingEnterprises(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/epsakhi/existing-enterprise/${query}`);
}

export async function deleteExistingEnterprise(id) {
  return request(`/api/v1/epsakhi/existing-enterprise/${id}/`, {
    method: 'DELETE',
  });
}

export async function createEnterpriseLicense(payload) {
  return requestMultipart('/api/v1/epsakhi/enterprise-licenses/', {
    // Use requestMultipart here
    method: 'POST',
    body: payload,
  });
}

export async function deleteEnterpriseLicense(id) {
  return request(`/api/v1/epsakhi/enterprise-licenses/${id}/`, {
    method: 'DELETE',
  });
}

function isFormData(obj) {
  return obj && typeof obj.append === 'function';
}

export async function createNewEnterprise(payload) {
  if (isFormData(payload)) {
    return requestMultipart('/api/v1/epsakhi/new-enterprise/', {
      method: 'POST',
      body: payload,
    });
  }
  return request('/api/v1/epsakhi/new-enterprise/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateNewEnterprise(id, payload) {
  if (isFormData(payload)) {
    return requestMultipart(`/api/v1/epsakhi/new-enterprise/${id}/`, {
      method: 'PATCH',
      body: payload,
    });
  }
  return request(`/api/v1/epsakhi/new-enterprise/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function getNewEnterprise(id) {
  return request(`/api/v1/epsakhi/new-enterprise/${id}/`);
}

export async function getNewEnterprises(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/epsakhi/new-enterprise/${query}`);
}

export async function deleteNewEnterprise(id) {
  return request(`/api/v1/epsakhi/new-enterprise/${id}/`, {
    method: 'DELETE',
  });
}

export async function createEnterpriseMandatoryFund(payload) {
  return request('/api/v1/epsakhi/mandatory-fund/', {
    method: 'POST',
    body: payload,
  });
}

export async function deleteEnterpriseMandatoryFund(id) {
  return request(`/api/v1/epsakhi/mandatory-fund/${id}/`, {
    method: 'DELETE',
  });
}

export async function createEnterpriseSupport(payload) {
  return request('/api/v1/epsakhi/enterprise-support/', {
    method: 'POST',
    body: payload,
  });
}

export async function deleteEnterpriseSupport(id) {
  return request(`/api/v1/epsakhi/enterprise-support/${id}/`, {
    method: 'DELETE',
  });
}

// ======================= ENTERPRISE CHILD MODELS =======================

// Loan details

export async function createEnterpriseLoanDetail(payload) {
  return request('/api/v1/epsakhi/enterprise-loan-details/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateEnterpriseLoanDetail(id, payload) {
  return request(`/api/v1/epsakhi/enterprise-loan-details/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteEnterpriseLoanDetail(id) {
  return request(`/api/v1/epsakhi/enterprise-loan-details/${id}/`, {
    method: 'DELETE',
  });
}

export async function getEnterpriseLoanDetails(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/epsakhi/enterprise-loan-details/${query}`);
}

// Subsidy / support details

export async function createEnterpriseSupportDetail(payload) {
  return request('/api/v1/epsakhi/enterprise-support-details/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateEnterpriseSupportDetail(id, payload) {
  return request(`/api/v1/epsakhi/enterprise-support-details/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteEnterpriseSupportDetail(id) {
  return request(`/api/v1/epsakhi/enterprise-support-details/${id}/`, {
    method: 'DELETE',
  });
}

export async function getEnterpriseSupportDetails(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/epsakhi/enterprise-support-details/${query}`);
}

// Training requirements (existing/new, form_type = rec/req)

export async function createEnterpriseTrainingReq(payload) {
  return request('/api/v1/epsakhi/enterprise-training-reqs/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateEnterpriseTrainingReq(id, payload) {
  return request(`/api/v1/epsakhi/enterprise-training-reqs/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteEnterpriseTrainingReq(id) {
  return request(`/api/v1/epsakhi/enterprise-training-reqs/${id}/`, {
    method: 'DELETE',
  });
}

export async function getEnterpriseTrainingReqs(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/epsakhi/enterprise-training-reqs/${query}`);
}

// Training Media

export async function createTrainingMedia(payload) {
  return request('/api/v1/epsakhi/training-certificates/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateTrainingMedia(id, payload) {
  return request(`/api/v1/epsakhi/training-certificates/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function uploadTrainingCertificate(formData) {
  return requestMultipart('/api/v1/epsakhi/training-certificates/', {
    method: 'POST',
    body: formData,
  });
}

export async function deleteTrainingMedia(id) {
  return request(`/api/v1/epsakhi/training-certificates/${id}/`, {
    method: 'DELETE',
  });
}

export async function createEnterpriseSubsidyDetail(payload) {
  return request('/api/v1/epsakhi/enterprise-subsidy-details/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateEnterpriseSubsidyDetail(id, payload) {
  return request(`/api/v1/epsakhi/enterprise-subsidy-details/${id}/`, {
    method: 'PATCH', // Using PATCH as per your Loan pattern
    body: payload,
  });
}

export async function deleteEnterpriseSubsidyDetail(id) {
  return request(`/api/v1/epsakhi/enterprise-subsidy-details/${id}/`, {
    method: 'DELETE',
  });
}

export async function getEnterpriseSubsidyDetails(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/epsakhi/enterprise-subsidy-details/${query}`);
}

// Media (existing/new enterprise)

export async function uploadEnterpriseMedia(formData) {
  return requestMultipart('/api/v1/epsakhi/enterprise-media/', {
    method: 'POST',
    body: formData,
  });
}

export async function updateEnterpriseMedia(id, formData) {
  return requestMultipart(`/api/v1/epsakhi/enterprise-media/${id}/`, {
    method: 'PATCH',
    body: formData,
  });
}

export async function deleteEnterpriseMedia(id) {
  return request(`/api/v1/epsakhi/enterprise-media/${id}/`, {
    method: 'DELETE',
  });
}

export async function getEnterpriseMediaList(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/epsakhi/enterprise-media/${query}`);
}

// Products

// SHOP BASED ENTERPRISE
export async function createEnterpriseShop(payload) {
  return request('/api/v1/epsakhi/enterprise-shop/', {
    method: 'POST',
    body: payload,
  });
}

export async function deleteEnterpriseShop(id) {
  return request(`/api/v1/epsakhi/enterprise-shop/${id}/`, {
    method: 'DELETE',
  });
}

export async function uploadShopMedia(formData) {
  return requestMultipart('/api/v1/epsakhi/shop-media/', {
    method: 'POST',
    body: formData,
  });
}

export async function deleteShopMedia(id) {
  return request(`/api/v1/epsakhi/shop-media/${id}/`, {
    method: 'DELETE',
  });
}

export async function createEnterpriseProduct(payload) {
  return request('/api/v1/epsakhi/enterprise-products/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateEnterpriseProduct(id, payload) {
  return request(`/api/v1/epsakhi/enterprise-products/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteEnterpriseProduct(id) {
  return request(`/api/v1/epsakhi/enterprise-products/${id}/`, {
    method: 'DELETE',
  });
}

export async function getEnterpriseProducts(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/epsakhi/enterprise-products/${query}`);
}

export async function uploadProductMedia(formData) {
  return requestMultipart('/api/v1/epsakhi/product-media/', {
    method: 'POST',
    body: formData,
  });
}

// Enterprise type/category (existing/new/no)

export async function createEnterpriseType(payload) {
  return request('/api/v1/epsakhi/enterprise-types/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateEnterpriseType(id, payload) {
  return request(`/api/v1/epsakhi/enterprise-types/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteEnterpriseType(id) {
  return request(`/api/v1/epsakhi/enterprise-types/${id}/`, {
    method: 'DELETE',
  });
}

export async function getEnterpriseTypes(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/epsakhi/enterprise-types/${query}`);
}

// ======================= NO-ENTERPRISE FLOWS =======================

// NoEnterpriseForm (for not interested)

export async function createNoEnterpriseForm(payload) {
  return request('/api/v1/epsakhi/no-enterprise-forms/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateNoEnterpriseForm(id, payload) {
  return request(`/api/v1/epsakhi/no-enterprise-forms/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteNoEnterpriseForm(id) {
  return request(`/api/v1/epsakhi/no-enterprise-forms/${id}/`, {
    method: 'DELETE',
  });
}

export async function getNoEnterpriseForms(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/epsakhi/no-enterprise-forms/${query}`);
}

// NoEnterpriseWage (wage placement preferences)

export async function createNoEnterpriseWage(payload) {
  return request('/api/v1/epsakhi/no-enterprise-wages/', {
    method: 'POST',
    body: payload,
  });
}

export async function updateNoEnterpriseWage(id, payload) {
  return request(`/api/v1/epsakhi/no-enterprise-wages/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteNoEnterpriseWage(id) {
  return request(`/api/v1/epsakhi/no-enterprise-wages/${id}/`, {
    method: 'DELETE',
  });
}

export async function getNoEnterpriseWages(params = {}) {
  const query = buildQuery(params);
  return request(`/api/v1/epsakhi/no-enterprise-wages/${query}`);
}

// NEW! Admin side APIs
export async function updateUser(userId, payload) {
  return request(`/api/v1/lookups/users/${userId}/`, {
    method: 'PATCH',
    body: payload,
    useAuth: false,
    headers: DEFAULT_HEADERS,
  });
}

export async function updateCrp(id, payload) {
  return request(`/api/v1/epsakhi/crp/${id}/`, {
    method: 'PATCH',
    body: payload,
  });
}

// export async function deleteEpsakhiCascade(memberCode, beneficiaryId, userId) {
//   try {
//     const detail = await getEpsakhiDetailByMember(memberCode);

//     /* ================= LICENSES ================= */

//     if (detail?.licenses?.length) {
//       for (const l of detail.licenses) {
//         await request(
//           `/api/v1/epsakhi/enterprise-licenses/${l.id}/?deleted_by=${userId}`,
//           { method: "DELETE" }
//         );
//       }
//     }

//     /* ================= LOAN DETAILS ================= */

//     if (detail?.loan_details?.length) {
//       for (const loan of detail.loan_details) {
//         await request(
//           `/api/v1/epsakhi/enterprise-loan-details/${loan.id}/?deleted_by=${userId}`,
//           { method: "DELETE" }
//         );
//       }
//     }

//     /* ================= SUBSIDY DETAILS ================= */

//     if (detail?.subsidy_details?.length) {
//       for (const s of detail.subsidy_details) {
//         await request(
//           `/api/v1/epsakhi/enterprise-subsidy-details/${s.id}/?deleted_by=${userId}`,
//           { method: "DELETE" }
//         );
//       }
//     }

//     /* ================= ENTERPRISE MEDIA ================= */

//     if (detail?.enterprise_media?.length) {
//       for (const m of detail.enterprise_media) {
//         await request(
//           `/api/v1/epsakhi/enterprise-media/${m.id}/?deleted_by=${userId}`,
//           { method: "DELETE" }
//         );
//       }
//     }

//     /* ================= PRODUCT MEDIA ================= */

//     if (detail?.product_media?.length) {
//       for (const m of detail.product_media) {
//         await request(
//           `/api/v1/epsakhi/product-media/${m.id}/?deleted_by=${userId}`,
//           { method: "DELETE" }
//         );
//       }
//     }

//     /* ================= PRODUCTS ================= */

//     if (detail?.products?.length) {
//       for (const p of detail.products) {
//         await request(
//           `/api/v1/epsakhi/enterprise-products/${p.id}/?deleted_by=${userId}`,
//           { method: "DELETE" }
//         );
//       }
//     }

//     /* ================= SHOP MEDIA ================= */

//     if (detail?.shop_media?.length) {
//       for (const sm of detail.shop_media) {
//         await request(
//           `/api/v1/epsakhi/shop-media/${sm.id}/?deleted_by=${userId}`,
//           { method: "DELETE" }
//         );
//       }
//     }

//     /* ================= SHOP ================= */

//     if (detail?.shop) {
//       const shops = Array.isArray(detail.shop) ? detail.shop : [detail.shop];

//       for (const shop of shops) {
//         if (shop?.id) {
//           await request(
//             `/api/v1/epsakhi/enterprise-shop/${shop.id}/?deleted_by=${userId}`,
//             { method: "DELETE" }
//           );
//         }
//       }
//     }

//     /* ================= TRAINING CERTIFICATES ================= */

//     if (detail?.training_certificates?.length) {
//       for (const t of detail.training_certificates) {
//         await request(
//           `/api/v1/epsakhi/training-certificates/${t.id}/?deleted_by=${userId}`,
//           { method: "DELETE" }
//         );
//       }
//     }

//     /* ================= TRAINING REQS ================= */

//     if (detail?.enterprise_training_reqs?.length) {
//       for (const t of detail.enterprise_training_reqs) {
//         await request(
//           `/api/v1/epsakhi/enterprise-training-reqs/${t.id}/?deleted_by=${userId}`,
//           { method: "DELETE" }
//         );
//       }
//     }

//     /* ================= MANDATORY FUND ================= */

//     if (detail?.mandatory_fund?.length) {
//       for (const f of detail.mandatory_fund) {
//         await request(
//           `/api/v1/epsakhi/mandatory-fund/${f.id}/?deleted_by=${userId}`,
//           { method: "DELETE" }
//         );
//       }
//     }

//     /* ================= ENTERPRISE SUPPORT ================= */

//     if (detail?.enterprise_support?.length) {
//       for (const s of detail.enterprise_support) {
//         await request(
//           `/api/v1/epsakhi/enterprise-support/${s.id}/?deleted_by=${userId}`,
//           { method: "DELETE" }
//         );
//       }
//     }

//     /* ================= ENTERPRISE TYPES ================= */

//     if (detail?.enterprise_types?.length) {
//       for (const t of detail.enterprise_types) {
//         await request(
//           `/api/v1/epsakhi/enterprise-types/${t.id}/?deleted_by=${userId}`,
//           { method: "DELETE" }
//         );
//       }
//     }

//     /* ================= EXISTING ENTERPRISE ================= */

//     if (detail?.existing_enterprise) {
//       const enterprises = Array.isArray(detail.existing_enterprise)
//         ? detail.existing_enterprise
//         : [detail.existing_enterprise];

//       for (const ent of enterprises) {
//         if (ent?.id) {
//           await request(
//             `/api/v1/epsakhi/existing-enterprise/${ent.id}/?deleted_by=${userId}`,
//             { method: "DELETE" }
//           );
//         }
//       }
//     }

//     /* ================= FINAL BENEFICIARY ================= */

//     await request(
//       `/api/v1/epsakhi/recorded-beneficiaries/${beneficiaryId}/?deleted_by=${userId}`,
//       { method: "DELETE" }
//     );

//     return true;
//   } catch (error) {
//     console.error("Cascade delete failed", error);
//     throw error;
//   }
// }

// ======================= EXPORT AGGREGATED API =======================

export async function deleteEpsakhiCascade(memberCode, beneficiaryId, userId) {
  try {
    const detail = await getEpsakhiDetailByMember(memberCode);

    const del = async url => {
      console.log('Deleting:', url);

      return request(url, {
        method: 'DELETE',
        body: {
          deleted_by: userId,
        },
      });
    };

    const ex = detail?.existing_enterprise || {};
    const shared = detail?.shared || {};

    /* ================= LICENSES ================= */

    for (const x of ex.licenses || []) {
      await del(`/api/v1/epsakhi/enterprise-licenses/${x.id}/`);
    }

    /* ================= LOAN DETAILS ================= */

    for (const x of ex.loan_details || []) {
      await del(`/api/v1/epsakhi/enterprise-loan-details/${x.id}/`);
    }

    /* ================= SUBSIDY ================= */

    for (const x of ex.subsidy_details || []) {
      await del(`/api/v1/epsakhi/enterprise-subsidy-details/${x.id}/`);
    }

    /* ================= ENTERPRISE MEDIA ================= */

    for (const x of ex.enterprise_media || []) {
      await del(`/api/v1/epsakhi/enterprise-media/${x.id}/`);
    }

    /* ================= PRODUCTS ================= */

    for (const x of ex.products || []) {
      await del(`/api/v1/epsakhi/enterprise-products/${x.id}/`);
    }

    /* ================= SHOP MEDIA ================= */

    for (const x of ex.shop_media || []) {
      await del(`/api/v1/epsakhi/shop-media/${x.id}/`);
    }

    /* ================= SHOP ================= */

    if (ex.shop?.id) {
      await del(`/api/v1/epsakhi/enterprise-shop/${ex.shop.id}/`);
    }

    /* ================= SHARED ================= */

    for (const x of shared.enterprise_types || []) {
      await del(`/api/v1/epsakhi/enterprise-types/${x.id}/`);
    }

    for (const x of shared.enterprise_support || []) {
      await del(`/api/v1/epsakhi/enterprise-support/${x.id}/`);
    }

    for (const x of shared.mandatory_fund || []) {
      await del(`/api/v1/epsakhi/mandatory-fund/${x.id}/`);
    }

    for (const t of shared.training || []) {
      for (const cert of t.certificates || []) {
        await del(`/api/v1/epsakhi/training-certificates/${cert.id}/`);
      }

      await del(`/api/v1/epsakhi/enterprise-training-reqs/${t.id}/`);
    }

    /* ================= ENTERPRISE ================= */

    if (detail?.enterprise?.id) {
      await del(`/api/v1/epsakhi/existing-enterprise/${detail.enterprise.id}/`);
    }

    /* ================= BENEFICIARY ================= */

    await del(`/api/v1/epsakhi/recorded-beneficiaries/${beneficiaryId}/`);

    return true;
  } catch (err) {
    console.error('Cascade delete failed', err);
    throw err;
  }
}

export async function deleteNewEnterpriseCascade(
  memberCode,
  beneficiaryId,
  userId,
) {
  try {
    const detail = await getEpsakhiDetailByMember(memberCode);

    const shared = detail?.shared || {};

    const del = async url => {
      console.log('Deleting:', url);

      return request(url, {
        method: 'DELETE',
        body: {
          deleted_by: userId,
        },
      });
    };

    /* ================= TRAINING CERTIFICATES ================= */

    for (const t of shared.training || []) {
      for (const cert of t.certificates || []) {
        await del(`/api/v1/epsakhi/training-certificates/${cert.id}/`);
      }
    }

    /* ================= TRAINING REQUEST ================= */

    for (const t of shared.training || []) {
      await del(`/api/v1/epsakhi/enterprise-training-reqs/${t.id}/`);
    }

    /* ================= MANDATORY FUND ================= */

    for (const f of shared.mandatory_fund || []) {
      await del(`/api/v1/epsakhi/mandatory-fund/${f.id}/`);
    }

    /* ================= ENTERPRISE SUPPORT ================= */

    for (const s of shared.enterprise_support || []) {
      await del(`/api/v1/epsakhi/enterprise-support/${s.id}/`);
    }

    /* ================= ENTERPRISE TYPES ================= */

    for (const t of shared.enterprise_types || []) {
      await del(`/api/v1/epsakhi/enterprise-types/${t.id}/`);
    }

    /* ================= NEW ENTERPRISE ================= */

    if (detail?.enterprise?.id) {
      await del(`/api/v1/epsakhi/new-enterprise/${detail.enterprise.id}/`);
    }

    /* ================= BENEFICIARY ================= */

    await del(`/api/v1/epsakhi/recorded-beneficiaries/${beneficiaryId}/`);

    return true;
  } catch (err) {
    console.error('New enterprise cascade delete failed', err);

    throw err;
  }
}

export async function getCaptcha() {
  const res = await fetch(buildUrl('/api/v1/auth/captcha/'), {
    method: 'GET',
    headers: {
      'X-App-Client': 'CRP-EP_APP',
    },
    credentials: 'include',
  });

  return handleResponse(res);
}

const api = {
  // auth
  login,
  setAuthToken,
  getAuthToken,
  getRefreshToken,
  clearAuthTokens,
  getCaptcha,

  // lookups
  getDistricts,
  getBlocksByDistrict,
  getPanchayatsByBlock,
  getVillagesByPanchayat,
  getVillageDetail,
  updateUser,

  // Analytics
  getEPSakhiAnalytics,
  getAdminCrpList,

  // CRP helpers
  getCrpDetailByUserId,
  getCrpDetailByMember,
  getCrpListByClf,
  getPanchayatsUnderCrpByUserId,
  getPanchayatsUnderCrpByMember,
  updateCrp,
  createCrpPanchayat,
  updateCrpPanchayat,
  deleteCrpPanchayat,

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

  // existing enterprise
  createExistingEnterprise,
  updateExistingEnterprise,
  getExistingEnterprise,
  getExistingEnterprises,

  // child models - licenses
  createEnterpriseLicense,

  // child models - shops
  createEnterpriseShop,
  uploadShopMedia,

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

  uploadProductMedia,

  // new enterprise
  createNewEnterprise,
  updateNewEnterprise,
  getNewEnterprise,
  getNewEnterprises,

  // Shared
  // child models - mandatory fund
  createEnterpriseMandatoryFund,

  // child models - support
  createEnterpriseSupport,

  // child models - training
  createEnterpriseTrainingReq,
  updateEnterpriseTrainingReq,
  deleteEnterpriseTrainingReq,
  getEnterpriseTrainingReqs,

  createTrainingMedia,
  updateTrainingMedia,
  deleteTrainingMedia,

  uploadTrainingCertificate,

  // child models - subsidy
  createEnterpriseSubsidyDetail,
  updateEnterpriseSubsidyDetail,
  deleteEnterpriseSubsidyDetail,
  getEnterpriseSubsidyDetails,

  // child models - type/category
  createEnterpriseType,
  updateEnterpriseType,
  deleteEnterpriseType,
  getEnterpriseTypes,

  // Deletion Rows
  deleteExistingEnterprise,
  deleteEnterpriseLicense,
  deleteNewEnterprise,
  deleteEnterpriseMandatoryFund,
  deleteEnterpriseSupport,
  deleteEnterpriseTrainingReq,
  deleteTrainingMedia,
  deleteEnterpriseShop,
  deleteShopMedia,

  // CANCELLED
  // no-enterprise flows
  createNoEnterpriseForm,
  updateNoEnterpriseForm,
  deleteNoEnterpriseForm,
  getNoEnterpriseForms,
  createNoEnterpriseWage,
  updateNoEnterpriseWage,
  deleteNoEnterpriseWage,
  getNoEnterpriseWages,

  deleteEpsakhiCascade,
  deleteNewEnterpriseCascade,
};

export default api;
