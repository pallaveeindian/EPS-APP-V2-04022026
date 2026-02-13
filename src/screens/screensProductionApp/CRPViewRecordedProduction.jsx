// src/screens/epsakhi/CRPViewRecordedProduction.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  getCrpPanchayats,
  getCrpRecordedBeneficiaries,
} from '../../utils/tempStore';
import gsApi from '../../api/gsApi';
import LoaderModal from '../LoaderModal';
import BackButton from '../../components/BackButton';
import { getUser, clearUser } from '../../utils/auth';
import SearchBar from '../SearchBar';
import { X_API_ID, X_API_KEY } from '@env';  
// --- API base + headers (same as gsApi constants) ---
const API_BASE_URL = 'http://66.116.207.88:8088';
const clientId = X_API_ID ;
const clientKey = X_API_KEY ;
const BASE_HEADERS = {
  'Content-Type': 'application/json',
  'X-API-ID': clientId,
  'X-API-KEY': clientKey,
};
import LanguageToggle from '../../components/LanguageToggle';
import { LanguageContext } from '../../components/LanguageContext';
import { useContext } from 'react';
function buildAuthHeaders() {
  const headers = { ...BASE_HEADERS };
  try {
    if (typeof gsApi.getAuthToken === 'function') {
      const token = gsApi.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (e) {
    console.warn('Failed to get auth token from gsApi', e);
  }
  return headers;
}

// Helper: key generation for FlatList items
function getRowKey(row, fallbackIndex, prefix = '') {
  const core =
    row.lokos_member_code
      ? String(row.lokos_member_code)
      : row.member_code
      ? String(row.member_code)
      : String(fallbackIndex);
  return prefix ? `${prefix}-${core}` : core;
}

// Meta keys we usually don't want to display
const META_KEYS = new Set([
  'TH_urid',
  'TH_URID',
  'created_at',
  'updated_at',
  'deleted_at',
  'is_active',
  'created_by',
  'updated_by',
  'deleted_by',
]);

// Convert enterprise_type code to label for list separation
function labelFromEnterpriseTypeCode(code) {
  const c = (code || '').toLowerCase();
  if (c === 'exep') return 'Existing Enterprise';
  if (c === 'newep') return 'Interested in opening New Enterprise';
  if (c === 'noep') return 'Not Interested';
  return 'No Enterprise';
}

// Convert top-level epsakhi-detail enterprise_type to human label
function labelFromDetailEnterpriseType(detailType) {
  const t = (detailType || '').toLowerCase();
  if (t === 'existing' || t === 'exep') return 'Existing Enterprise';
  if (t === 'new' || t === 'newep') return 'Interested in opening New Enterprise';
  if (t === 'noep' || t === 'none' || t === 'Not Interested') {
    return 'No Enterprise';
  }
  return 'Not Specified';
}
// const getLoggedInCrpId = () => {
//   const loginData = gsApi.getLoginData?.();

//   return (
//     loginData?.id ??
//     loginData?.user_id ??
//     null
//   );
// };



export default function CRPViewRecordedProduction({ route,navigation }) {
  const { language } = useContext(LanguageContext);
  const [loading, setLoading] = useState(false);

  const [panchayats, setPanchayats] = useState([]);
  const [villagesByPanchayat, setVillagesByPanchayat] = useState({}); // { [panchayat_id]: [villages] }
  const [recordedList, setRecordedList] = useState([]);

  const [selectedPanchayatId, setSelectedPanchayatId] = useState('');
  const [selectedVillageId, setSelectedVillageId] = useState('');
  const [searchText, setSearchText] = useState('');

  // "Page" mode: false => list page, true => epsakhi-detail page
  const [detailMode, setDetailMode] = useState(false);
  const [detailMemberCode, setDetailMemberCode] = useState(null);
  const [epsakhiDetail, setEpsakhiDetail] = useState(null);
  const [userId, setUserId] = useState(null);
const [loggedUser, setLoggedUser] = useState(null);
const [PLDrecList, setPLDrecList] = useState([]);

  const routeCrpUserId =
    route?.params?.crpUserId ||
    route?.params?.user_id ||
    route?.params?.username ||
    null;

  // Initial data load
  // useEffect(() => {
  //   const gps = getCrpPanchayats() || [];
  //   setPanchayats(gps);

  //   const recorded = getCrpRecordedBeneficiaries() || [];
  //   setRecordedList(recorded);
  // }, []);
  
// useEffect(() => {
//   const gps = getCrpPanchayats() || [];
//   setPanchayats(gps);

//   const allRecorded = getCrpRecordedBeneficiaries() || [];
//   const loggedInCrpId = getLoggedInCrpId();

//   if (!loggedInCrpId) {
//     console.warn('CRP ID not found in login data');
//     setRecordedList([]);
//     return;
//   }

//   const filteredRecorded = allRecorded.filter(
//     row => String(row.created_by) === String(loggedInCrpId)
//   );

//   setRecordedList(filteredRecorded);
// }, []);
// useEffect(() => {
//   const loginData = gsApi.getLoginData?.() || null;
//   setLoggedUser(loginData);
//   console.log('🔍 Logged user data:', loginData);
// }, []);

//   const getCreatedByNumeric = () => {
//   const candidate =
//     loggedUser?.id ??
//     loggedUser?.user_id ??
//     loggedUser?.pk  ??
//     routeCrpUserId;
//   if (candidate == null) return null;

//   if (typeof candidate === 'number') return candidate;

//   if (typeof candidate === 'string' && /^\d+$/.test(candidate.trim())) {
//     return parseInt(candidate.trim(), 10);
//   }

//   return null;
// };
  useEffect(() => {
    (async () => {
      const u = await getUser(); // your method to get stored user info
      if (!u) {
        navigation.replace('Login');
        return;
      }
      setLoggedUser(u);
    })();
  }, []);
  const getCreatedByNumeric = () => {
    const candidate =
      loggedUser?.id ??
      loggedUser?.user_id ??
      loggedUser?.pk ??
      routeCrpUserId;

    if (candidate == null) return null;
    if (typeof candidate === 'number') return candidate;
    if (typeof candidate === 'string' && /^\d+$/.test(candidate.trim())) {
      return parseInt(candidate.trim(), 10);
    }
    return null;
  };

  useEffect(() => {
    setUserId(getCreatedByNumeric());
  }, [loggedUser, routeCrpUserId]);


// useEffect(() => {
//   const gps = getCrpPanchayats() || [];
//   setPanchayats(gps);

//   const allRecorded = getCrpRecordedBeneficiaries() || [];
//   const loggedInCrpNumeric = getCreatedByNumeric();

//   console.log('🧾 Logged-in CRP numeric ID:', loggedInCrpNumeric);

//   if (loggedInCrpNumeric == null) {
//     console.warn('CRP ID not found. No records will be shown.');
//     setRecordedList([]);
//     return;
//   }

//   const filteredRecorded = allRecorded.filter((row) => {
//     const createdByNumeric =
//       typeof row.created_by === 'number'
//         ? row.created_by
//         : typeof row.created_by === 'string' && /^\d+$/.test(row.created_by)
//         ? parseInt(row.created_by, 10)
//         : null;

//     return createdByNumeric === loggedInCrpNumeric;
//   });

//   console.log('📊 Total records created by this CRP:', filteredRecorded.length);
//   setRecordedList(filteredRecorded);
// }, [loggedUser]); // add loggedUser as dependency
// useEffect(() => {
//   if (userId == null) {
//     setRecordedList([]);
//     return;
//   }

//   const gps = getCrpPanchayats() || [];
//   setPanchayats(gps);

//   const allRecorded = getCrpRecordedBeneficiaries() || [];

//   const filteredRecorded = allRecorded.filter((row) => {
//     const createdByNumeric =
//       typeof row.created_by === 'number'
//         ? row.created_by
//         : typeof row.created_by === 'string' && /^\d+$/.test(row.created_by)
//         ? parseInt(row.created_by, 10)
//         : null;

//     return createdByNumeric === userId;
//   });

//   setRecordedList(filteredRecorded);
// }, [userId]);
  

useEffect(() => {
  if (userId == null) {
    setRecordedList([]);
    setPLDrecList([]);
    return;
  }

  const gps = getCrpPanchayats() || [];
  setPanchayats(gps);

  const allRecorded = getCrpRecordedBeneficiaries() || [];

  // ✅ Filter by logged-in user
  const recList = allRecorded.filter((row) => {
    const createdByNumeric =
      typeof row.created_by === 'number'
        ? row.created_by
        : typeof row.created_by === 'string' && /^\d+$/.test(row.created_by)
        ? parseInt(row.created_by, 10)
        : null;

    return createdByNumeric === userId;
  });

  // ✅ ALL rows (no PLD filter)
  setRecordedList(recList);

  // ✅ PLD-only rows
  const PLDrecList = recList.filter(
    (row) => row?.pld_status === true
  );
  setPLDrecList(PLDrecList);

}, [userId]);




  // Load villages for a selected Panchayat
  const loadVillagesForPanchayat = async (panchayatId) => {
    if (!panchayatId) return;
    if (villagesByPanchayat[panchayatId]) return; // already loaded

    try {
      setLoading(true);
      const res = await gsApi.getVillagesByPanchayat(panchayatId, 1, '');
      const rows = Array.isArray(res?.results)
        ? res.results
        : Array.isArray(res)
        ? res
        : [];
      setVillagesByPanchayat((prev) => ({
        ...prev,
        [panchayatId]: rows,
      }));
    } catch (err) {
      console.error('Failed to fetch villages for filter', err);
      Alert.alert('Error', 'Failed to fetch villages for this Panchayat.');
    } finally {
      setLoading(false);
    }
  };

  const handlePanchayatChange = async (value) => {
    setSelectedPanchayatId(value);
    setSelectedVillageId('');
    if (value) {
      await loadVillagesForPanchayat(value);
    }
  };

  const villagesForSelectedPanchayat =
    selectedPanchayatId && villagesByPanchayat[selectedPanchayatId]
      ? villagesByPanchayat[selectedPanchayatId]
      : [];

  // --- Filtering logic ---
  const filteredBeneficiaries = useMemo(
    () =>
      recordedList.filter((row) => {
        // Filter by Panchayat
        if (
          selectedPanchayatId &&
          String(row.panchayat_id) !== String(selectedPanchayatId)
        ) {
          return false;
        }

        // Filter by Village
        if (
          selectedVillageId &&
          String(row.village_id) !== String(selectedVillageId)
        ) {
          return false;
        }

        // Text search filter (name, member code, phone)
        const q = searchText.trim().toLowerCase();
        if (!q) return true;

        const fieldsToSearch = [
          row.applicant_name,
          row.member_name,
          row.lokos_member_name,
          row.lokos_member_code,
          row.member_code,
          row.mobile,
          row.phone,
  
        ]
          .filter((v) => v !== undefined && v !== null)
          .map((v) => String(v).toLowerCase());

        return fieldsToSearch.some((f) => f.includes(q));
      }),
    [recordedList, selectedPanchayatId, selectedVillageId, searchText]
  );

  // --- Build sectioned data for FlatList with headers based ONLY on enterprise_type ---
  const sectionedData = useMemo(() => {
    const existingItems = [];
    const newItems = [];
    const noneItems = [];

    filteredBeneficiaries.forEach((row, idx) => {
      const t = (row.enterprise_type || '').toLowerCase();
      if (t === 'exep') {
        existingItems.push({ row, idx });
      } else if (t === 'newep') {
        newItems.push({ row, idx });
      } else {
        // noep / null / anything else
        noneItems.push({ row, idx });
      }
    });

    const data = [];

    if (existingItems.length) {
      data.push({
        type: 'header',
        key: 'header-existing',
        title: 'Existing Enterprise',
      });
      existingItems.forEach(({ row, idx }) =>
        data.push({
          type: 'item',
          key: getRowKey(row, idx, 'existing'),
          row,
        })
      );
    }

    if (newItems.length) {
      data.push({
        type: 'header',
        key: 'header-new',
        title: 'Interested in opening New Enterprise',
      });
      newItems.forEach(({ row, idx }) =>
        data.push({
          type: 'item',
          key: getRowKey(row, idx, 'new'),
          row,
        })
      );
    }

    if (noneItems.length) {
      data.push({
        type: 'header',
        key: 'header-none',
        title: 'Not Interested',
      });
      noneItems.forEach(({ row, idx }) =>
        data.push({
          type: 'item',
          key: getRowKey(row, idx, 'none'),
          row,
        })
      );
    }

    return data;
  }, [filteredBeneficiaries]);

  // --- Detail: epsakhi-detail/<member_code> ---

  const openDetailPage = async (row) => {
    const memberCode = row.lokos_member_code || row.member_code;
    if (!memberCode) {
      Alert.alert(
        'Error',
        'Member code is missing for this record. Cannot open detail.'
      );
      return;
    }

    try {
      setDetailMode(true);
      setDetailMemberCode(memberCode);
      setEpsakhiDetail(null);
      setLoading(true);

      const headers = buildAuthHeaders();
      const enc = encodeURIComponent(memberCode);
      const url = `${API_BASE_URL}/api/v1/epsakhi-detail/${enc}/`;

      const res = await fetch(url, { headers });
      if (!res.ok) {
        const text = await res.text();
        console.error('epsakhi-detail error', res.status, text);
        Alert.alert(
           language === 'hi' ? 'त्रुटि' : 'Error',
    language === 'hi'
      ? 'सर्वर से लाभार्थी का विवरण लोड करने में असमर्थ।'
      : 'Unable to load beneficiary detail from server.'
        );
        setDetailMode(false);
        return;
      }

      const data = await res.json();
      setEpsakhiDetail(data);
    } catch (err) {
      console.error('Failed to fetch epsakhi-detail', err);
      Alert.alert( language === 'hi' ? 'त्रुटि' : 'Error',
    language === 'hi'
      ? 'लाभार्थी विवरण लोड करने में असमर्थ।'
      : 'Unable to load beneficiary detail.');
      setDetailMode(false);
    } finally {
      setLoading(false);
    }
  };

  const goBackFromDetail = () => {
    setDetailMode(false);
    setDetailMemberCode(null);
    setEpsakhiDetail(null);
  };

  // Generic key/value section renderer
  const renderKeyValueSection = (title, obj) => {
    if (!obj) return null;

    const entries = Object.entries(obj).filter(([key, value]) => {
      if (value === null || value === undefined || value === '') return false;
      if (META_KEYS.has(key)) return false;
      if (key === 'password') return false;
      return true;
    });

    if (!entries.length) return null;

    return (
      <View style={styles.detailSection}>
        <Text style={styles.detailSectionTitle}>{title}</Text>
        {entries.map(([key, value]) => (
          <View key={key} style={styles.detailRow}>
            <Text style={styles.detailKey}>
              {key.replace(/_/g, ' ')}
            </Text>
            <Text style={styles.detailValue}>{String(value)}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Render simple list of objects as multiple small sections
  const renderArrayOfObjectsSection = (title, arr) => {
    if (!arr || !arr.length) return null;

    return (
      <View style={styles.detailSection}>
        <Text style={styles.detailSectionTitle}>{title}</Text>
        {arr.map((item, index) => {
          const filtered = Object.entries(item).filter(([key, value]) => {
            if (value === null || value === undefined || value === '') return false;
            if (META_KEYS.has(key)) return false;
            return true;
          });

          if (!filtered.length) return null;

          return (
            <View key={index} style={styles.card}>
              {filtered.map(([key, value]) => (
                <View key={key} style={styles.detailRow}>
                  <Text style={styles.detailKey}>
                    {key.replace(/_/g, ' ')}
                  </Text>
                  <Text style={styles.detailValue}>{String(value)}</Text>
                </View>
              ))}
            </View>
          );
        })}
      </View>
    );
  };

  // const renderBeneficiaryItem = ({ item }) => {
  //   const name =
  //     item.applicant_name ||
  //     item.member_name ||
  //     item.lokos_member_name ||
  //     'Unnamed';
  //   const memberCode = item.lokos_member_code || item.member_code || 'NA';
  //   const mobile = item.mobile || item.phone || 'NA';
  //   const typeLabel = labelFromEnterpriseTypeCode(item.enterprise_type);

  //   return (
  //     <View style={styles.listItem}>
  //       <View style={{ flex: 1 }}>
  //         <Text style={styles.listText}>{name}</Text>
  //         <Text style={styles.metaText}>Member code: {memberCode}</Text>
  //         <Text style={styles.metaText}>Mobile: {mobile}</Text>
  //         <Text style={styles.typeText}>Enterprise: {typeLabel}</Text>
  //       </View>
  //       <TouchableOpacity
  //         style={styles.viewBtn}
  //         onPress={() => openDetailPage(item)}
  //       >
  //         <Text style={styles.viewBtnText}>View</Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // };


  const renderBeneficiaryItem = ({ item }) => {
  const name =
    item.applicant_name ||
    item.member_name ||
    item.lokos_member_name ||
    'Unnamed';

  const memberCode = item.lokos_member_code || item.member_code || 'NA';
  const mobile = item.mobile || item.phone || 'NA';
  const typeLabel = labelFromEnterpriseTypeCode(item.enterprise_type);

  const isPLD =
    item?.pld_status === true ||
    item?.pld_status === 1 ||
    item?.pld_status === '1' ||
    item?.pld_status === 'true';

  return (
    <View style={[styles.listItem, isPLD && styles.pldItem]}>
      
      {isPLD && (
        <View style={styles.pldBadge}>
          <Text style={styles.pldBadgeText}>   {language === 'hi' ? 'पीएलडी' : 'PLD'}</Text>
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text style={styles.listText}>{name}</Text>
        <Text style={styles.metaText}>{language === 'hi' ? 'सदस्य कोड' : 'Member code'}: {memberCode}</Text>
        <Text style={styles.metaText}>{language === 'hi' ? 'मोबाइल' : 'Mobile'}: {mobile}</Text>
        <Text style={styles.typeText}>{language === 'hi' ? 'उद्यम' : 'Enterprise'}: {typeLabel}</Text>
      </View>

      <TouchableOpacity
        style={styles.viewBtn}
        onPress={() => openDetailPage(item)}
      >
        <Text style={styles.viewBtnText}> {language === 'hi' ? 'देखें' : 'View'}</Text>
      </TouchableOpacity>
    </View>
  );
};


  // ============ RENDER DETAIL PAGE ============

  if (detailMode) {
    const detail = epsakhiDetail || {};
    const beneficiary = detail.beneficiary || null;
    const enterpriseTypeLabel = labelFromDetailEnterpriseType(
      detail.enterprise_type
    );
    const enterprise = detail.enterprise || null;

      // applicant_signature: add base URL if path exists
  let applicantSignature = null;

  if (enterprise?.applicant_signature) {
    const sig = enterprise.applicant_signature;

    // Add prefix only if path starts with /media
    applicantSignature = sig.startsWith("/media")
      ? `${API_BASE_URL}${sig}`
      : sig;
  }

    // if applicant_signature exist  then extract string and prefix with https://66.116.207.88:8088
    const enterpriseLoanDetails = detail.enterprise_loan_details || [];
    const enterpriseSupportDetails = detail.enterprise_support_details || [];
    const enterpriseTrainingReqs = detail.enterprise_training_reqs || [];
    const enterpriseMedia = detail.enterprise_media || [];
    const enterpriseProducts = detail.enterprise_products || [];
    const enterpriseTypeCategories = detail.enterprise_type_categories || [];
    const noEnterpriseForm = detail.no_enterprise_form || null;
    const noEnterpriseTrainingReqs = detail.no_enterprise_training_reqs || [];
    const noEnterpriseWageDetails = detail.no_enterprise_wage_details || [];

    const trainingReceived = enterpriseTrainingReqs.filter(
      (t) => (t.form_type || '').toLowerCase() === 'rec'
    );
    const trainingRequired = enterpriseTrainingReqs.filter(
      (t) => (t.form_type || '').toLowerCase() === 'req'
    );

    return (
      <View style={styles.container}>
        <LoaderModal visible={loading} message={language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'} />

        {/* Header for detail page */}
        <View style={styles.headerRow}>
          <BackButton onPress={goBackFromDetail} />
          <Text style={styles.headerTitle}>{language === 'hi' ? 'लाभार्थी विवरण' : 'Beneficiary Detail'}</Text>
        </View>

        <ScrollView style={{ flex: 1 }}>
          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>
               {language === 'hi' ? 'सदस्य कोड:' : 'Member Code:'}{' '}
              {beneficiary?.lokos_member_code || detailMemberCode || 'NA'}
            </Text>
            <Text style={styles.summaryText}>
               {language === 'hi' ? 'नाम:' : 'Name:'}  {beneficiary?.applicant_name || 'NA'}
            </Text>
            <Text style={styles.summaryText}>
              {language === 'hi' ? 'उद्यम प्रकार:' : 'Enterprise Type:'} {enterpriseTypeLabel}
            </Text>
          </View>

          {/* Beneficiary section */}
          {renderKeyValueSection('Beneficiary (Recorded Beneficiary)', beneficiary)}
          {/* Enterprise section */}
          {enterprise ? (
            renderKeyValueSection('Enterprise Details', enterprise)
          ) : (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>  {language === 'hi' ? 'उद्यम विवरण' : 'Enterprise Details'}</Text>
              <Text style={{ fontSize: 12, color: '#666' }}>
                {language === 'hi'
    ? 'इस लाभार्थी के लिए कोई उद्यम फॉर्म डेटा नहीं पाया गया है, या यह अभी तक जमा नहीं किया गया है।'
    : 'No enterprise form data found for this beneficiary, or it has not been submitted yet.'}
              </Text>
            </View>
          )}
{applicantSignature && (
  <View style={{ padding: 10, alignItems: 'center' }}>
    <Text style={{ fontWeight: '700', fontSize: 14, marginBottom: 6 }}>
      {language === 'hi' ? 'आवेदक के हस्ताक्षर' : 'Applicant Signature'}
    </Text>
    <Image
      source={{ uri: applicantSignature }}
      style={{
        width: 200,
        height: 200,
        resizeMode: 'contain',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
      }}
    />
  </View>
)}
          {/* Enterprise Type Categories */}
          {renderArrayOfObjectsSection(
            'Enterprise Type Categories',
            enterpriseTypeCategories
          )}

          {/* Trainings received / required */}
          {renderArrayOfObjectsSection(
            'Trainings Received (Enterprise)',
            trainingReceived
          )}
          {renderArrayOfObjectsSection(
            'Trainings Required (Enterprise)',
            trainingRequired
          )}

          {/* Loan & Support Details */}
          {renderArrayOfObjectsSection(
            'Enterprise Loan Details',
            enterpriseLoanDetails
          )}
          {renderArrayOfObjectsSection(
            'Enterprise Support Details',
            enterpriseSupportDetails
          )}

          {/* Enterprise Products */}
          {renderArrayOfObjectsSection(
            'Enterprise Products',
            enterpriseProducts
          )}

          {/* Enterprise Media (meta only – no actual images shown here) */}
          {renderArrayOfObjectsSection(
            'Enterprise Media (Meta Information)',
            enterpriseMedia
          )}

          {/* No Enterprise related blocks */}
          {noEnterpriseForm &&
            renderKeyValueSection('No Enterprise Form', noEnterpriseForm)}
          {renderArrayOfObjectsSection(
            'No Enterprise Trainings',
            noEnterpriseTrainingReqs
          )}
          {renderArrayOfObjectsSection(
            'No Enterprise Wage Details',
            noEnterpriseWageDetails
          )}

          {!epsakhiDetail && !loading && (
            <Text style={styles.emptyText}>
              {language === 'hi'
    ? 'इस लाभार्थी के लिए कोई विवरण उपलब्ध नहीं है।'
    : 'No detail data available for this beneficiary.'}
            </Text>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    );
  }

  // ============ RENDER LIST PAGE ============

  return (
    <View style={styles.container}>
      <LoaderModal visible={loading} message="Loading..." />

      {/* Header */}
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>{language === 'hi' ? 'रिकॉर्ड किए गए लाभार्थी' : 'Recorded Beneficiaries'}</Text>
      </View>
<LanguageToggle/>
      {/* Filters */}
      <View style={{ marginBottom: 10 }}>
        <SearchBar
          placeholder={
      language === 'hi'
        ? 'नाम / फ़ोन / सदस्य कोड से खोजें'
        : 'Search by name / phone / member code'
    }
          value={searchText}
          onChangeText={setSearchText}
          style={{ marginBottom: 8 }}
        />

        <View style={styles.filterRow}>
          <View style={styles.filterCol}>
            <Text style={styles.filterLabel}>{language === 'hi' ? 'पंचायत' : 'Panchayat'}</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedPanchayatId}
                onValueChange={handlePanchayatChange}
                style={styles.picker}
              >
                <Picker.Item label={language === 'hi' ? 'सभी पंचायतें' : 'All Panchayats'}value="" />
                {panchayats.map((p) => (
                  <Picker.Item
                    key={p.panchayat_id}
                    label={
                      p.panchayat_name_en ||
                      p.name ||
                      `Panchayat ${p.panchayat_id}`
                    }
                    value={String(p.panchayat_id)}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.filterCol}>
            <Text style={styles.filterLabel}> {language === 'hi' ? 'गाँव' : 'Village'}</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedVillageId}
                onValueChange={(v) => setSelectedVillageId(v)}
                style={styles.picker}
                enabled={!!selectedPanchayatId}
              >
                <Picker.Item
                  label={
                    selectedPanchayatId
                       ? language === 'hi'
        ? 'सभी गाँव'
        : 'All Villages'
      : language === 'hi'
        ? 'पहले पंचायत चुनें'
        : 'Select Panchayat first'
                  }
                  value=""
                />
                {villagesForSelectedPanchayat.map((v) => (
                  <Picker.Item
                    key={v.village_id}
                    label={
                      v.village_name_english ||
                      v.village_name_en ||
                      v.village_name ||
                      `Village ${v.village_id}`
                    }
                    value={String(v.village_id)}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      </View>

      {/* List with headers for 3 categories by enterprise_type */}
      <FlatList
        data={sectionedData}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) =>
          item.type === 'header' ? (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>
                {item.title}
              </Text>
            </View>
          ) : (
            renderBeneficiaryItem({ item: item.row })
          )
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
             {language === 'hi'
    ? 'चयनित फ़िल्टर के लिए कोई रिकॉर्डेड लाभार्थी नहीं मिला।'
    : 'No recorded beneficiaries found for the selected filters.'}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, marginTop: 40, backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterCol: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#EE6969',
    borderRadius: 6,
    overflow: 'hidden',
    minHeight: 48,
    justifyContent: 'center',
  },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginTop: 10,
  },
  sectionHeaderText: {
    fontWeight: '700',
    fontSize: 13,
    color: '#444',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    position: 'relative', //  REQUIRED for sticky badge
  },
  listText: { flex: 1, fontSize: 14, color: '#222' },
  metaText: { fontSize: 12, color: '#777' },
  typeText: { fontSize: 12, color: '#444', marginTop: 2 },
  emptyText: { marginTop: 12, textAlign: 'center', color: '#777' },
  viewBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#EE6969',
  },
  viewBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Detail page styles
  summaryCard: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FFF4E5',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#AA6B00',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
    color: '#444',
  },
  detailSection: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  detailSectionTitle: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailKey: {
    flex: 0.9,
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    paddingRight: 4,
  },
  detailValue: {
    flex: 1.1,
    fontSize: 12,
    color: '#222',
  },
  card: {
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
pldItem: {
  backgroundColor: '#E8F5E9', // light green
},
pldBadge: {
  position: 'absolute',
  top: 6,
  right: 6,
  backgroundColor: '#2E7D32',
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 12,
  zIndex: 10,
},
pldBadgeText: {
  color: '#FFFFFF',
  fontSize: 10,
  fontWeight: '700',
},
});
