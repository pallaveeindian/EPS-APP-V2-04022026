// src/screens/epsakhi/CRPRecordFlowProduction.jsx
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import gsApi from '../../api/gsApi';
import {
  getCrpDetail,
  getCrpPanchayats,
  getCrpRecordedBeneficiaries,
  setCrpRecordedBeneficiaries,
  getShgListForPanchayat,
  setShgListForPanchayat,
} from '../../utils/tempStore';
import { getUser } from '../../utils/auth';
import LoaderModal from '../LoaderModal';
import BackButton from '../../components/BackButton';
import SearchBar from '../SearchBar';
import { LanguageContext } from '../../components/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';

const UI_PAGE_SIZE = 10;

export default function CRPRecordFlowProduction({ navigation }) {
  //  LanguageContext hook at TOP level (following CRPDashboard pattern)
  const { language } = useContext(LanguageContext);

  const translations = {
    en: {
      selectGramPanchayat: 'Select Gram Panchayat',
      selectVillage: 'Select Village',
      selectShg: 'Select SHG',
      selectBeneficiary: 'Select Beneficiary',
      search: 'Search...',
      searchBeneficiary: 'Search Beneficiary',
      recorded: 'Recorded:',
      page: 'Page',
      error: 'Error',
      crpNotMapped: 'CRP not mapped to block. Please reopen the app.',
      failedVillages: 'Failed to fetch villages for this Panchayat.',
      failedShgs: 'Failed to fetch SHGs for this village.',
      failedMembers: 'Failed to fetch SHG members.',
      alreadyRecorded: 'Already Recorded',
      alreadyRecordedMessage:
        'This beneficiary enterprise has already been recorded.',
      hasExistingEnterprise: 'Does ',
      haveExistingEnterprise: ' have an existing Enterprise?',
      interestedNewEnterprise: 'Is ',
      interestedOpeningNewEnterprise:
        ' interested in opening a new Enterprise?',
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel',
      memberCode: 'Member Code: ',
      recordedStatus: 'Recorded',
      notRecordedStatus: 'Not Recorded',
      loading: 'Loading...',
    },
    hi: {
      selectGramPanchayat: 'ग्राम पंचायत चुनें',
      selectVillage: 'गांव चुनें',
      selectShg: 'SHG चुनें',
      selectBeneficiary: 'लाभार्थी चुनें',
      search: 'खोजें...',
      searchBeneficiary: 'लाभार्थी खोजें',
      recorded: 'रिकॉर्ड किया गया:',
      page: 'पृष्ठ',
      error: 'त्रुटि',
      crpNotMapped: 'CRP को ब्लॉक से मैप नहीं किया गया। कृपया ऐप दोबारा खोलें।',
      failedVillages: 'इस पंचायत के लिए गांव लाने में विफल।',
      failedShgs: 'इस गांव के लिए SHG लाने में विफल।',
      failedMembers: 'SHG सदस्य लाने में विफल।',
      alreadyRecorded: 'पहले से रिकॉर्ड',
      alreadyRecordedMessage: 'यह लाभार्थी उद्यम पहले से रिकॉर्ड हो चुका है।',
      hasExistingEnterprise: 'क्या ',
      haveExistingEnterprise: ' के पास पहले से उद्यम है?',
      interestedNewEnterprise: 'क्या ',
      interestedOpeningNewEnterprise: ' नया उद्यम खोलने में रुचि रखता है?',
      yes: 'हाँ',
      no: 'नहीं',
      cancel: 'रद्द करें',
      memberCode: 'सदस्य कोड: ',
      recordedStatus: 'रिकॉर्ड',
      notRecordedStatus: 'रिकॉर्ड नहीं',
      loading: 'लोड हो रहा है...',
    },
  };

  const t = translations[language] || translations.en;

  const [step, setStep] = useState('gp');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [panchayats, setPanchayats] = useState([]);
  const [villages, setVillages] = useState([]);
  const [shgs, setShgs] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);

  const [selectedPanchayat, setSelectedPanchayat] = useState(null);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [selectedShg, setSelectedShg] = useState(null);

  const [blockId, setBlockId] = useState(null);
  const [crpUserId, setCrpUserId] = useState(null); // for created_by fallback

  const [query, setQuery] = useState('');
  const [benefQuery, setBenefQuery] = useState('');

  // UI pagination state (client-side)
  const [pageGp, setPageGp] = useState(1);
  const [pageVillage, setPageVillage] = useState(1);
  const [pageShg, setPageShg] = useState(1);
  const [pageBenef, setPageBenef] = useState(1);

  // Keep logged user (so we can derive numeric id for created_by fallback)
  const [loggedUser, setLoggedUser] = useState(null);

  // RECORDED BENEFICIARIES STATE (kept in sync with server)
  const [recorded, setRecorded] = useState(getCrpRecordedBeneficiaries() || []);
  // const [PLDrecList, setPLDrecList] = useState([]);
  // ---------- Helpers ----------

  const paginate = (items, page) => {
    const start = (page - 1) * UI_PAGE_SIZE;
    return items.slice(start, start + UI_PAGE_SIZE);
  };

  const getPagingForStep = (
    filteredPanchayats,
    filteredVillages,
    filteredShgs,
    filteredBeneficiaries,
  ) => {
    if (step === 'gp') {
      const total = Math.max(
        1,
        Math.ceil(filteredPanchayats.length / UI_PAGE_SIZE),
      );
      const current = Math.min(pageGp, total);
      return { currentPage: current, totalPages: total };
    }
    if (step === 'village') {
      const total = Math.max(
        1,
        Math.ceil(filteredVillages.length / UI_PAGE_SIZE),
      );
      const current = Math.min(pageVillage, total);
      return { currentPage: current, totalPages: total };
    }
    if (step === 'shg') {
      const total = Math.max(1, Math.ceil(filteredShgs.length / UI_PAGE_SIZE));
      const current = Math.min(pageShg, total);
      return { currentPage: current, totalPages: total };
    }
    const total = Math.max(
      1,
      Math.ceil(filteredBeneficiaries.length / UI_PAGE_SIZE),
    );
    const current = Math.min(pageBenef, total);
    return { currentPage: current, totalPages: total };
  };

  const makeVillageCacheKey = (panchayatId, villageId) =>
    `${String(panchayatId || '')}::${String(villageId || '')}`;

  // Calculate age helper
  const calculateAge = dobStr => {
    if (!dobStr) return null;
    try {
      const dob = new Date(dobStr);
      if (Number.isNaN(dob.getTime())) return null;
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age;
    } catch (e) {
      return null;
    }
  };

  const filterRecordedCountForVillage = villageId =>
    recorded.filter(r => String(r.village_id) === String(villageId)).length;

  const filterRecordedCountForShg = shgCode =>
    recorded.filter(r => String(r.lokos_shg_code) === String(shgCode)).length;

  const buildRecordedPayloadFromMember = (member, shg) => {
    const addresses = Array.isArray(member?.member_addresses)
      ? member.member_addresses
      : [];
    const phones = Array.isArray(member?.member_phones)
      ? member.member_phones
      : [];

    const primaryAddress = addresses[0] || {};
    const primaryPhone = phones[0] || {};

    let created_by_to_send = null;
    const candidate =
      loggedUser?.id ?? loggedUser?.user_id ?? loggedUser?.pk ?? crpUserId;
    if (candidate !== null && candidate !== undefined) {
      if (typeof candidate === 'number') {
        created_by_to_send = candidate;
      } else if (
        typeof candidate === 'string' &&
        /^\d+$/.test(candidate.trim())
      ) {
        created_by_to_send = parseInt(candidate.trim(), 10);
      }
    }

    const payload = {
      enterprise_id: null, // explicitly null for NOT INTERESTED case, if/when used

      lokos_member_code: member?.member_code ?? null,
      applicant_name: member?.member_name ?? null,
      age: calculateAge(member?.dob),
      gender: member?.gender ?? null,
      marital_status: member?.marital_status ?? null,
      father_husband_name: member?.father_husband ?? null,
      category: member?.social_category ?? null,
      education: member?.education ?? null,

      address: primaryAddress?.address_line1 ?? null,
      district_id: primaryAddress?.district_id ?? null,
      block_id: primaryAddress?.block_id ?? blockId ?? null,
      panchayat_id:
        primaryAddress?.panchayat_id ?? selectedPanchayat?.panchayat_id ?? null,
      village_id:
        primaryAddress?.village_id ?? selectedVillage?.village_id ?? null,

      mobile: primaryPhone?.phone_no ?? null,

      lokos_shg_code: shg?.code ?? selectedShg?.code ?? null,
    };

    if (created_by_to_send !== null) {
      payload.created_by = created_by_to_send;
    }

    return payload;
  };

  // Keep this helper for future use (e.g., in NoEnterpriseForm)
  const findCreateApi = () =>
    gsApi.createRecordedBeneficiary ||
    gsApi.createRecordedBenef ||
    gsApi.postRecordedBeneficiary ||
    gsApi.createRecorded ||
    gsApi.createRecordedBeneficiaries ||
    (() => {
      throw new Error('No createRecorded API found on gsApi');
    });

  // ---------- Initial load ----------

  useEffect(() => {
    const gps = getCrpPanchayats() || [];
    setPanchayats(gps);

    const detail = getCrpDetail();
    setBlockId(detail?.block_id || detail?.blockId || null);

    const derivedUserId =
      detail?.master_user_id ||
      detail?.masterUserId ||
      detail?.user_id ||
      detail?.userId ||
      detail?.username ||
      detail?.login_id ||
      null;
    setCrpUserId(derivedUserId);

    (async () => {
      try {
        const u = await getUser();
        if (u) {
          setLoggedUser(u);
          if (u.access) {
            gsApi.setAuthToken?.(u.access, u.refresh);
          }
        }
      } catch (e) {
        console.warn('Unable to load user in CRPRecordFlowProduction', e);
      }
    })();

    const panchayatIds = gps.map(p => p.panchayat_id).filter(Boolean);
    if (panchayatIds.length) {
      (async () => {
        try {
          const res = await gsApi.getRecordedBeneficiaries({
            created_by: userId,
            limit: 5000,
            offset: 0,
          });
          const recList = Array.isArray(res?.results)
            ? res.results
            : Array.isArray(res)
              ? res
              : [];
          setRecorded(recList);
          try {
            setCrpRecordedBeneficiaries?.(recList);
          } catch (e) {
            // ignore
          }
        } catch (err) {
          console.log('Error refreshing recorded beneficiaries', err);
        }
      })();
    }
  }, []);

  // ---------- Fetch helpers (API) ----------

  // Fetch all villages for a panchayat – SINGLE backend call, large page_size
  const fetchVillagesForPanchayat = async panchayatId => {
    try {
      const res = await gsApi.getVillagesByPanchayat(panchayatId, {
        page: 1,
        page_size: 5000,
      });
      const rows = Array.isArray(res?.results)
        ? res.results
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
      return rows;
    } catch (err) {
      if (err?.status === 404) {
        return [];
      }
      throw err;
    }
  };

  // Fetch SHGs for a village: resolve block_id (from village or detail), then one UPSRLM call
  const fetchShgsForVillage = async (p, v) => {
    let vBlockId = v.block_id || v.blockId || null;

    try {
      if (!vBlockId) {
        const detail = await gsApi.getVillageDetail(v.village_id);
        vBlockId =
          detail?.block_id ||
          detail?.blockId ||
          detail?.block?.block_id ||
          detail?.block?.id ||
          null;
      }
    } catch (err) {
      console.log('Error fetching village detail for block_id', err);
    }

    if (!vBlockId) {
      throw new Error('Unable to resolve block_id for selected village');
    }

    const cacheKey = makeVillageCacheKey(p?.panchayat_id, v.village_id);
    let cached = getShgListForPanchayat(cacheKey) || [];
    if (cached.length) {
      return cached;
    }

    try {
      const res = await gsApi.getUpsrlmShgList(vBlockId, {
        village_id: v.village_id,
        // only needed fields to speed up
        fields: 'name,code,villageId,village_id,shg_code',
        page_size: 5000,
      });

      const rows = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.results)
          ? res.results
          : Array.isArray(res)
            ? res
            : [];

      try {
        setShgListForPanchayat(cacheKey, rows);
      } catch (e) {
        // ignore storage failure
      }
      return rows;
    } catch (err) {
      // if backend ever returns 404, just treat as empty list
      if (err?.status === 404) {
        return [];
      }
      throw err;
    }
  };

  // Fetch SHG members for a SHG (keep paging loop; members count is manageable)
  const fetchMembersForShg = async shgCode => {
    const all = [];
    let page = 1;
    const MAX_PAGES = 50; // hard safety cap

    while (page <= MAX_PAGES) {
      try {
        const res = await gsApi.getUpsrlmShgMembers(shgCode, {
          page,
          page_size: 10,
        });
        const rows = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.results)
            ? res.results
            : Array.isArray(res)
              ? res
              : [];
        if (!rows.length) break;
        all.push(...rows);
        page += 1;
      } catch (err) {
        if (err?.status === 404) break;
        throw err;
      }
    }
    return all;
  };

  // ---------- Handlers for steps ----------

  const handleSelectPanchayat = async p => {
    if (!blockId) {
      Alert.alert(t.error, t.crpNotMapped);
      return;
    }

    setSelectedPanchayat(p);
    setSelectedVillage(null);
    setSelectedShg(null);
    setVillages([]);
    setShgs([]);
    setBeneficiaries([]);
    setStep('village');
    setPageVillage(1);

    try {
      setLoading(true);
      const villagesRows = await fetchVillagesForPanchayat(p.panchayat_id);
      setVillages(villagesRows);
    } catch (err) {
      console.log('Error in handleSelectPanchayat', err);
      Alert.alert(t.error, t.failedVillages);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVillage = async v => {
    setSelectedVillage(v);
    setSelectedShg(null);
    setBeneficiaries([]);
    setStep('shg');
    setPageShg(1);

    try {
      setLoading(true);
      const cacheKey = makeVillageCacheKey(
        selectedPanchayat?.panchayat_id,
        v.village_id,
      );
      let shgRows = getShgListForPanchayat(cacheKey) || [];

      if (!shgRows.length) {
        shgRows = await fetchShgsForVillage(selectedPanchayat, v);
      }

      // safety: keep only SHGs belonging to this village
      const shgsInVillage = shgRows.filter(s => {
        const shgVillage =
          s.villageId !== undefined && s.villageId !== null
            ? s.villageId
            : s.village_id;
        return String(shgVillage) === String(v.village_id);
      });

      setShgs(shgsInVillage);
    } catch (err) {
      console.log('Error in handleSelectVillage', err);
      Alert.alert(t.error, t.failedShgs);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectShg = async s => {
    setSelectedShg(s);
    setStep('beneficiaries');
    setPageBenef(1);

    try {
      setLoading(true);
      const rows = await fetchMembersForShg(s.code);

      const enriched = rows.map(m => {
        const rec = recorded.find(
          r =>
            String(r.lokos_member_code) === String(m.member_code) &&
            String(r.lokos_shg_code) === String(s.code),
        );

        // Recorded only if enterprise_id is present
        const isRecorded = !!(rec && rec.enterprise_id);
        const isPLD = m?.pld_status === true; //  SAFE ADDITION

        return {
          ...m,
          _isRecorded: isRecorded,
          _recordRow: rec || null,
          _isPLD: isPLD,
        };
      });
      setBeneficiaries(enriched);
    } catch (err) {
      console.log('Error in handleSelectShg', err);
      Alert.alert(t.error, t.failedMembers);
    } finally {
      setLoading(false);
    }
  };

  const handleBeneficiaryPress = async row => {
    const hasExisting = row._isRecorded;

    if (hasExisting) {
      Alert.alert(t.alreadyRecorded, t.alreadyRecordedMessage);
      return;
    }

    const name = row.member_name || 'the beneficiary';

    Alert.alert(
      `${t.hasExistingEnterprise}${name}${t.haveExistingEnterprise}`,
      '',
      [
        {
          text: t.yes,
          onPress: () =>
            navigation.navigate('ExistingEnterpriseForm', {
              beneficiary: row,
              recordedBenef: row._recordRow,
              tempShg: selectedShg,
              crpUserId,
            }),
        },
        {
          text: t.no,
          onPress: () => {
            Alert.alert(
              `${t.interestedNewEnterprise}${name}${t.interestedOpeningNewEnterprise}`,
              '',
              [
                {
                  text: t.yes,
                  onPress: () =>
                    navigation.navigate('NewEnterpriseForm', {
                      beneficiary: row,
                      recordedBenef: row._recordRow,
                      tempShg: selectedShg,
                      crpUserId,
                    }),
                },
                {
                  text: t.no,
                  onPress: async () => {
                    try {
                      setLoading(true);

                      const payload = buildRecordedPayloadFromMember(
                        row,
                        selectedShg,
                      );

                      //  IMPORTANT CHANGE
                      payload.enterprise_id = 'NO';
                      payload.enterprise_type = 'noep';

                      const createApi = findCreateApi();
                      await createApi(payload);

                      //  refresh recorded list locally
                      const updated = [...recorded, payload];
                      setRecorded(updated);
                      setCrpRecordedBeneficiaries?.(updated);

                      Alert.alert(
                        'Success',
                        'Your data has been recorded successfully',
                        [{ text: 'OK', style: 'default' }],
                        { cancelable: true },
                      );

                      //  refresh UI
                      handleSelectShg(selectedShg);
                    } catch (err) {
                      console.log('Error saving NO enterprise:', err);
                      Alert.alert('Error', 'Failed to save data');
                    } finally {
                      setLoading(false);
                    }
                  },
                  style: 'default',
                },
              ],
              { cancelable: true },
            );
          },
          style: 'default',
        },
        {
          text: t.cancel,
          onPress: () => { },
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  // ---------- Pull-to-refresh ----------

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      if (step === 'gp') {
        const gps = getCrpPanchayats() || [];
        setPanchayats(gps);

        const panchayatIds = gps.map(p => p.panchayat_id).filter(Boolean);

        if (panchayatIds.length) {
          try {
            const res = await gsApi.getRecordedBeneficiaries({
              created_by: crpUserId,
              limit: 5000,
              offset: 0,
            });

            const recList = Array.isArray(res?.results)
              ? res.results
              : Array.isArray(res)
                ? res
                : [];

            setRecorded(recList);
            setCrpRecordedBeneficiaries?.(recList);
          } catch (e) {
            console.log('Error refreshing recorded beneficiaries', e);
          }
        }

        setPageGp(1);
      } else if (step === 'village' && selectedPanchayat) {
        await handleSelectPanchayat(selectedPanchayat);
      } else if (step === 'shg' && selectedVillage) {
        await handleSelectVillage(selectedVillage);
      } else if (step === 'beneficiaries' && selectedShg) {
        // Refresh recorded list for current panchayat
        const panchayatId = selectedPanchayat?.panchayat_id;

        if (panchayatId) {
          try {
            const res = await gsApi.getRecordedBeneficiaries({
              created_by: crpUserId,
              limit: 5000,
              offset: 0,
            });

            const recList = Array.isArray(res?.results)
              ? res.results
              : Array.isArray(res)
                ? res
                : [];

            setRecorded(recList);
            setCrpRecordedBeneficiaries?.(recList);
          } catch (e) {
            console.log('Error refreshing recorded list for beneficiaries', e);
          }
        }

        //  Re-fetch members and re-evaluate _isRecorded
        await handleSelectShg(selectedShg);
      }
    } catch (e) {
      console.log('Error in handleRefresh', e);
    } finally {
      setRefreshing(false);
    }
  };

  // ---------- Filters + paging ----------

  const filteredPanchayats = panchayats.filter(p =>
    (p.panchayat_name_en || '').toLowerCase().includes(query.toLowerCase()),
  );

  const filteredVillages = villages.filter(v =>
    (v.village_name_english || v.village_name || '')
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const filteredShgs = shgs.filter(s =>
    (s.name || s.name_en || '').toLowerCase().includes(query.toLowerCase()),
  );

  const filteredBeneficiaries = beneficiaries.filter(b =>
    (b.member_name || '').toLowerCase().includes(benefQuery.toLowerCase()),
  );

  const paging = getPagingForStep(
    filteredPanchayats,
    filteredVillages,
    filteredShgs,
    filteredBeneficiaries,
  );

  const handlePrevPage = () => {
    if (paging.currentPage <= 1) return;
    if (step === 'gp') setPageGp(p => Math.max(1, p - 1));
    else if (step === 'village') setPageVillage(p => Math.max(1, p - 1));
    else if (step === 'shg') setPageShg(p => Math.max(1, p - 1));
    else setPageBenef(p => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    if (paging.currentPage >= paging.totalPages) return;
    if (step === 'gp') setPageGp(p => Math.min(paging.totalPages, p + 1));
    else if (step === 'village')
      setPageVillage(p => Math.min(paging.totalPages, p + 1));
    else if (step === 'shg')
      setPageShg(p => Math.min(paging.totalPages, p + 1));
    else setPageBenef(p => Math.min(paging.totalPages, p + 1));
  };

  // ---------- UI helpers ----------

  const getTitle = () =>
    step === 'gp'
      ? t.selectGramPanchayat
      : step === 'village'
        ? t.selectVillage
        : step === 'shg'
          ? t.selectShg
          : t.selectBeneficiary;

  const handleStepBack = () => {
    if (step === 'gp') {
      navigation.goBack();
    } else if (step === 'village') {
      setStep('gp');
      setSelectedPanchayat(null);
      setSelectedVillage(null);
      setSelectedShg(null);
      setVillages([]);
      setShgs([]);
      setBeneficiaries([]);
      setPageVillage(1);
      setPageGp(1);
    } else if (step === 'shg') {
      setStep('village');
      setSelectedShg(null);
      setBeneficiaries([]);
      setPageShg(1);
    } else if (step === 'beneficiaries') {
      setStep('shg');
      setBeneficiaries([]);
      setPageBenef(1);
    }
  };

  const renderList = () => {
    const { currentPage } = paging;

    if (step === 'gp') {
      const data = paginate(filteredPanchayats, currentPage);
      return (
        <FlatList
          data={data}
          keyExtractor={item => String(item.panchayat_id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => handleSelectPanchayat(item)}
            >
              <Text style={styles.listText}>
                {item.panchayat_name_en || `Panchayat ${item.panchayat_id}`}
              </Text>
              <Text style={styles.metaText}>
                {t.recorded}{' '}
                {
                  recorded.filter(
                    r => String(r.panchayat_id) === String(item.panchayat_id),
                  ).length
                }
              </Text>
            </TouchableOpacity>
          )}
        />
      );
    }

    if (step === 'village') {
      const data = paginate(filteredVillages, currentPage);
      return (
        <FlatList
          data={data}
          keyExtractor={item => String(item.village_id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => handleSelectVillage(item)}
            >
              <Text style={styles.listText}>
                {item.village_name_english ||
                  item.village_name ||
                  `Village ${item.village_id}`}
              </Text>
              <Text style={styles.metaText}>
                {t.recorded} {filterRecordedCountForVillage(item.village_id)}
              </Text>
            </TouchableOpacity>
          )}
        />
      );
    }

    if (step === 'shg') {
      const data = paginate(filteredShgs, currentPage);
      return (
        <FlatList
          data={data}
          keyExtractor={(item, idx) => item.code ?? String(idx)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => handleSelectShg(item)}
            >
              <Text style={styles.listText}>
                {item.name || item.name_en || item.code}
              </Text>
              <Text style={styles.metaText}>
                {t.recorded} {filterRecordedCountForShg(item.code)}
              </Text>
            </TouchableOpacity>
          )}
        />
      );
    }

    const data = paginate(filteredBeneficiaries, currentPage);
    return (
      <FlatList
        data={data}
        keyExtractor={(item, idx) => item.member_code ?? String(idx)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item }) => {
          const isPLD = item._isPLD === true;

          return (
            <TouchableOpacity
              style={[styles.listItem, isPLD && styles.pldListItem]}
              onPress={() => handleBeneficiaryPress(item)}
            >
              {isPLD && (
                <View style={styles.pldBadge}>
                  <Text style={styles.pldBadgeText}>PLD</Text>
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={styles.listText}>
                  {item.member_name}
                  {item._isRecorded ? ' (Recorded)' : ''}
                </Text>
                <Text style={styles.metaText}>
                  {t.memberCode}
                  {item.member_code}
                </Text>
              </View>

              <Text
                style={[
                  styles.statusBadge,
                  item._isRecorded
                    ? { backgroundColor: '#D4EDDA', color: '#155724' }
                    : { backgroundColor: '#F8D7DA', color: '#721C24' },
                ]}
              >
                {item._isRecorded ? t.recordedStatus : t.notRecordedStatus}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    );
  };

  const { currentPage, totalPages } = paging;

  return (
    <View style={styles.container}>
      <LoaderModal visible={loading} message={t.loading} />
      <View style={styles.headerRow}>
        <BackButton onPress={handleStepBack} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{getTitle()}</Text>
        </View>
        <LanguageToggle />
      </View>

      <SearchBar
        placeholder={step === 'beneficiaries' ? t.searchBeneficiary : t.search}
        value={step === 'beneficiaries' ? benefQuery : query}
        onChangeText={step === 'beneficiaries' ? setBenefQuery : setQuery}
      />

      {renderList()}

      {/* bottom pagination controls */}
      <View style={styles.paginationRow}>
        <TouchableOpacity
          style={[
            styles.pageButton,
            currentPage <= 1 && styles.pageButtonDisabled,
          ]}
          onPress={handlePrevPage}
          disabled={currentPage <= 1}
        >
          <Text style={styles.pageButtonText}>{'<'}</Text>
        </TouchableOpacity>

        <Text style={styles.pageInfo}>
          {t.page} {currentPage} / {totalPages}
        </Text>

        <TouchableOpacity
          style={[
            styles.pageButton,
            currentPage >= totalPages && styles.pageButtonDisabled,
          ]}
          onPress={handleNextPage}
          disabled={currentPage >= totalPages}
        >
          <Text style={styles.pageButtonText}>{'>'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, marginTop: 40, backgroundColor: '#fff' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    position: 'relative',
  },
  listText: { fontSize: 14, flex: 1, color: '#222' },
  metaText: { fontSize: 12, color: '#666' },
  statusBadge: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  pageButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 16,
    borderColor: '#ccc',
    marginHorizontal: 8,
  },
  pageButtonDisabled: {
    opacity: 0.4,
  },
  pageButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pageInfo: {
    fontSize: 14,
    fontWeight: '500',
  },

  pldListItem: {
    backgroundColor: '#E8F5E9',
  },

  pldBadge: {
    position: 'absolute',
    top: 1,
    right: 6,
    backgroundColor: '#2E7D32',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 10,
  },

  pldBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
