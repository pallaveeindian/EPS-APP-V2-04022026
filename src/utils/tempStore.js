// Simple in-memory temp store for this app session.
// This is cleared on logout (and also naturally when the app process is killed).

const _store = {
  crpDetail: null,
  crpPanchayats: null,
  crpRecordedBeneficiaries: null,
  crpShgListByBlock: {},      // blockId -> SHG list (old usage, kept for compatibility)
  crpShgListByPanchayat: {},  // NEW: panchayatId -> SHG list
};

export function setCrpDetail(detail) {
  _store.crpDetail = detail || null;
}

export function getCrpDetail() {
  return _store.crpDetail;
}

export function setCrpPanchayats(rows) {
  _store.crpPanchayats = Array.isArray(rows) ? rows : null;
}

export function getCrpPanchayats() {
  return _store.crpPanchayats || [];
}

export function setCrpRecordedBeneficiaries(rows) {
  _store.crpRecordedBeneficiaries = Array.isArray(rows) ? rows : null;
}

export function getCrpRecordedBeneficiaries() {
  return _store.crpRecordedBeneficiaries || [];
}

// OLD block-level cache (leave it as-is for any existing callers)
export function setShgListForBlock(blockId, rows) {
  if (!blockId) return;
  _store.crpShgListByBlock[String(blockId)] = Array.isArray(rows) ? rows : [];
}

export function getShgListForBlock(blockId) {
  if (!blockId) return [];
  return _store.crpShgListByBlock[String(blockId)] || [];
}

// NEW: Panchayat-level SHG list cache
export function setShgListForPanchayat(panchayatId, rows) {
  if (!panchayatId) return;
  _store.crpShgListByPanchayat[String(panchayatId)] = Array.isArray(rows) ? rows : [];
}

export function getShgListForPanchayat(panchayatId) {
  if (!panchayatId) return [];
  return _store.crpShgListByPanchayat[String(panchayatId)] || [];
}

export function clearAllTemp() {
  _store.crpDetail = null;
  _store.crpPanchayats = null;
  _store.crpRecordedBeneficiaries = null;
  _store.crpShgListByBlock = {};
  _store.crpShgListByPanchayat = {};
}
