// src/screens/screensProductionApp/ExistingEnterpriseForm.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
} from 'react-native';
import gsApi, { decryptPayload } from '../../api/gsApi';
import { getUser } from '../../utils/auth';
import {
  getShgListForPanchayat,
  getCrpPanchayats,
  getCrpDetail,
} from '../../utils/tempStore';
import { useContext } from 'react';
import { LanguageContext } from '../../components/LanguageContext';

// Section components
import ExistingEnterpriseBasicInfoSection from './FormSections/ExistingEnterpriseBasicInfoSection';
import ExistingEnterpriseProductServicesSection from './FormSections/ExistingEnterpriseProductServicesSection';
import ShopBasedProductSection from './FormSections/ExistingEnterpriseShop';
import ExistingEnterpriseEnterpriseDetailsSection from './FormSections/ExistingEnterpriseEnterpriseDetailsSection';
import ExistingEnterpriseInvestmentSection from './FormSections/ExistingEnterpriseInvestmentSection';
import ExistingEnterpriseLoanSubsidySection from './FormSections/ExistingEnterpriseLoanSubsidySection';
import ExistingEnterpriseTrainingSkillsSection from './FormSections/ExistingEnterpriseTrainingSkillsSection';
import ExistingEnterpriseSupportSection from './FormSections/ExistingEnterpriseSupportSection';
import ExistingEnterpriseMediaSection from './FormSections/ExistingEnterpriseMediaSection';
import ExistingEnterpriseDeclarationSection from './FormSections/ExistingEnterpriseDeclarationSection';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---- helpers ----

const computeAgeFromDob = dobStr => {
  if (!dobStr) return null;
  const dob = new Date(dobStr);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
};

function extractLocationFromShg(shg) {
  if (!shg) return null;
  const district_id = shg.districtId ?? shg.district_id ?? null;
  const block_id = shg.blockId ?? shg.block_id ?? null;
  const panchayat_id = shg.panchayatId ?? shg.panchayat_id ?? null;
  const village_id = shg.villageId ?? shg.village_id ?? null;
  const lokos_shg_code = shg.code || null;
  return { district_id, block_id, panchayat_id, village_id, lokos_shg_code };
}

const normalizeBoolean = val => {
  if (val === 'Yes' || val === true || val === 'true' || val === 1) return true;
  if (val === 'No' || val === false || val === 'false' || val === 0)
    return false;
  return false;
};

// Helper to clean up internal UI flags (like 'Retail_Others') from marketing_channels
// const generateCleanMarketingChannels = row => {
//   if (!row) return '';
//   const channelsStr = Array.isArray(row.marketing_channels)
//     ? row.marketing_channels.join(', ')
//     : row.marketing_channels || '';

//   return channelsStr
//     .split(',')
//     .map(s => s.trim())
//     .filter(ch => ch && !ch.includes('_Others')) // Filters out 'Retail_Others', 'Online_Others', etc.
//     .join(', ');
// };

// const generateCleanMarketingChannels = form => {
//   const channels = Array.isArray(form.marketing_channels)
//     ? form.marketing_channels
//     : (form.marketing_channels || '')
//       .split(',')
//       .map(x => x.trim())
//       .filter(Boolean);

//   return channels
//     .map(channel => {
//       if (
//         channel === 'Others' &&
//         form.marketing_channels_other
//       ) {
//         return `Others - ${form.marketing_channels_other}`;
//       }

//       return channel;
//     })
//     .join(', ');
// };

const generateCleanMarketingChannels = form => {
  try {
    let channels = [];

    if (Array.isArray(form?.marketing_channels)) {
      channels = form.marketing_channels;
    } else if (typeof form?.marketing_channels === 'string') {
      channels = form.marketing_channels
        .split(',')
        .map(v => String(v).trim())
        .filter(Boolean);
    }

    return channels
      .map(channel => {
        const value =
          typeof channel === 'object'
            ? channel?.en || channel?.value || ''
            : String(channel);

        if (
          value === 'Others' &&
          form?.marketing_channels_other
        ) {
          return `Others - ${form.marketing_channels_other}`;
        }

        return value;
      })
      .filter(Boolean)
      .join(', ');
  } catch (e) {
    console.log('marketing_channels error', e);
    return '';
  }
};


// Helper to bundle channels and details in a dictionary-style string format
const generateMarketLinkageString = row => {
  if (!row) return '';

  const channelsStr = Array.isArray(row.marketing_channels)
    ? row.marketing_channels.join(', ')
    : row.marketing_channels || '';

  const selectedChannels = channelsStr
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const mainChannels = ['Retail', 'Online', 'Exhibition', 'ESARAS', 'Others'];
  const pairs = [];

  mainChannels.forEach(chan => {
    if (selectedChannels.includes(chan)) {
      const detail = row[`market_linkage_${chan}`];
      if (detail && detail.trim() !== '') {
        pairs.push(`${chan}:${detail.trim()}`); // Combines into "Category:Value"
      } else {
        pairs.push(chan); // Falls back to just "Category" if no custom input exists
      }
    }
  });

  return pairs.join(', ');
};

export default function ExistingEnterpriseForm({ route, navigation }) {
  const recordedBenef = route?.params?.recordedBenef || null;
  const existingEnterprise = route?.params?.existing;
  const { language } = useContext(LanguageContext);

  // extra params
  const beneficiary = route?.params?.beneficiary || null;
  const memberCode = beneficiary?.member_code || beneficiary?.nic_member_code;
  const beneficiaryName = beneficiary?.member_name || 'Unknown Beneficiary';
  const tempShg = route?.params?.tempShg || null;
  const routeCrpUserId =
    route?.params?.crpUserId ||
    route?.params?.user_id ||
    route?.params?.username ||
    null;

  const lokosShgCode = tempShg?.code || route?.params?.lokos_shg_code || null;

  // --- master form state ---
  const [existingForm, setExistingForm] = useState({
    enterprise_name: '',
    ownership_type: '',
    ownership_type_other: '',
    owner_special_category: '',
    year_of_establishment: '',
    uddyam_aadhar: '',
    total_emp: '',
    number_of_shg_emp: '',
    licenses: [],
    fund_cards: [],
    enterprise_types_tree: [],

    products: [],

    workplace_type: '',
    workplace_type_other: '',
    electricity_available: '',
    electricity_detail: '',
    electricity_other: '',
    water_available: '',
    water_detail: '',
    water_other: '',
    transportation_availability: '',
    can_send_to_bijnor: '',
    need_transport_help: '',

    monthly_income_estimate: '',
    annual_turnover: '',
    gross_profit: '',
    working_capital_monthly: '',
    has_shg_cif: '',
    cif_fund_amt: '',
    initial_investment: '',
    source_of_investment_tree: [],

    has_taken_loan: '',
    loans: [],
    has_receieved_subsidy: '',
    subsidies: [],

    is_training_received: '',
    training_received_rows: [],
    is_training_required: '',
    training_required_rows: [],
    nearest_skill_centre: '',
    skill_centre_loc: '',
    nearest_industry: '',
    industry_loc: '',

    has_shop_product: '',
    shop_type: '',
    shop_type_other: '',
    inventory_source: '',
    target_customers: '',
    target_customers_other: '',
    sales_area: '',
    marketing_strategy: '',
    marketing_strategy_other: '',
    market_linkage: '',
    market_linkage_Retail: '',
    market_linkage_Online: '',
    market_linkage_Exhibition: '',
    market_linkage_ESARAS: '',
    market_linkage_Others: '',
    accept_digital_payment: '',
    avg_monthly_sales: '',
    annual_sale: '',

    media: {
      photo_entrepreneur: [],
      photo_enterprise: [],
      declaration_signature: [],
    },

    declaration_confirmed: '',
    declaration_date: '',
  });

  const [loadingUser, setLoadingUser] = useState(true);
  const [loggedUser, setLoggedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const TOTAL_SECTIONS = 9;

  const updateForm = patch => {
    setExistingForm(prev => ({ ...prev, ...patch }));
  };

  const clearDraft = async () => {
    if (memberCode) {
      await AsyncStorage.removeItem(`DRAFT_EXEP_${memberCode}`);
    }
  };

  const getCreatedByNumeric = () => {
    const candidate =
      loggedUser?.id ?? loggedUser?.user_id ?? loggedUser?.pk ?? routeCrpUserId;
    if (candidate == null) return null;
    if (typeof candidate === 'number') return candidate;
    if (typeof candidate === 'string' && /^\d+$/.test(candidate.trim())) {
      return parseInt(candidate.trim(), 10);
    }
    return null;
  };

  const saveProgress = async (state, index) => {
    if (!memberCode) return;
    try {
      const draftBlob = JSON.stringify({
        formData: state,
        sectionIndex: index,
        beneficiary: beneficiary,
        lastSaved: new Date().toISOString(),
      });
      await AsyncStorage.setItem(`DRAFT_EXEP_${memberCode}`, draftBlob);
    } catch (e) {
      console.warn('Failed to save draft', e);
    }
  };

  const checkAndLoadDraft = async () => {
    if (!memberCode) return;
    try {
      const savedDraft = await AsyncStorage.getItem(`DRAFT_EXEP_${memberCode}`);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        Alert.alert(
          'Resume Draft?',
          `We found a saved form for ${beneficiaryName}. Would you like to continue where you left off?`,
          [
            {
              text: 'Start New',
              onPress: async () => {
                await AsyncStorage.removeItem(`DRAFT_EXEP_${memberCode}`);
                setIsDraftLoaded(true);
              },
            },
            {
              text: 'Resume',
              onPress: () => {
                setExistingForm(parsed.formData);
                setCurrentSectionIndex(parsed.sectionIndex);
                setIsDraftLoaded(true);
              },
            },
          ],
        );
      } else {
        setIsDraftLoaded(true);
      }
    } catch (e) {
      console.warn('Error loading draft', e);
      setIsDraftLoaded(true);
    }
  };

  useEffect(() => {
    checkAndLoadDraft();
  }, [memberCode]);

  useEffect(() => {
    if (isDraftLoaded) {
      saveProgress(existingForm, currentSectionIndex);
    }
  }, [existingForm, currentSectionIndex]);

  useEffect(() => {
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
        console.warn('Unable to load user', e);
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!existingEnterprise) return;
    setExistingForm(prev => ({
      ...prev,
      enterprise_name: existingEnterprise.enterprise_name || '',
      ownership_type: existingEnterprise.ownership_type || '',
      year_of_establishment: existingEnterprise.year_of_establishment || '',
      uddyam_aadhar: existingEnterprise.uddyam_aadhar || '',
      total_emp: existingEnterprise.total_emp || '',
      number_of_shg_emp: existingEnterprise.number_of_shg_emp || '',
      workplace_type: existingEnterprise.workplace_type || '',
      electricity_available: existingEnterprise.electricity_available || '',
      water_available: existingEnterprise.water_available || '',
      licenses: existingEnterprise.licenses || [],
      transportation_availability:
        existingEnterprise.transportation_availability || '',
      can_send_to_bijnor: existingEnterprise.can_send_to_bijnor || '',
      monthly_income_estimate: existingEnterprise.monthly_income_estimate || '',
      annual_turnover: existingEnterprise.annual_turnover || '',
      gross_profit: existingEnterprise.gross_profit || '',
      working_capital_monthly: existingEnterprise.working_capital_monthly || '',
      initial_investment: existingEnterprise.initial_investment || '',
      is_support_required: existingEnterprise.is_support_required || '',
      declaration_confirmed: existingEnterprise.declaration_confirmed || '',
      declaration_date: existingEnterprise.declaration_date || '',
    }));
  }, [existingEnterprise]);

  const findShgAcrossCachedPanchayats = async shgCode => {
    if (!shgCode) return null;
    try {
      if (
        tempShg &&
        (tempShg.code === shgCode || tempShg.shg_code === shgCode)
      ) {
        return extractLocationFromShg(tempShg);
      }
      const gps = getCrpPanchayats ? getCrpPanchayats() || [] : [];
      for (const gp of gps) {
        const pid = gp?.panchayat_id || gp?.panchayatId;
        if (!pid) continue;
        const cached = getShgListForPanchayat(pid) || [];
        const found = cached.find(s => String(s.code) === String(shgCode));
        if (found) return extractLocationFromShg(found);
      }
      return null;
    } catch (e) {
      console.warn('findShgAcrossCachedPanchayats error', e);
      return null;
    }
  };

  const ensureRecordedBeneficiary = async () => {
    let recordedBenefId =
      recordedBenef?.id || existingEnterprise?.recorded_beneficiary || null;

    if (recordedBenefId) return recordedBenefId;

    if (!beneficiary) {
      throw new Error(
        'Beneficiary data is missing. Please open this form again from SHG member list.',
      );
    }

    const beneficiaryAddr =
      Array.isArray(beneficiary.member_addresses) &&
        beneficiary.member_addresses.length > 0
        ? beneficiary.member_addresses[0]
        : null;

    const phone =
      Array.isArray(beneficiary.member_phones) &&
        beneficiary.member_phones.length > 0
        ? beneficiary.member_phones[0]
        : null;

    const addressText =
      (beneficiaryAddr?.address_line1 &&
        String(beneficiaryAddr.address_line1).trim()) ||
      (beneficiaryAddr?.address_line2 &&
        String(beneficiaryAddr.address_line2).trim()) ||
      '';

    const age = computeAgeFromDob(beneficiary.dob);

    let district_id =
      beneficiaryAddr?.district_id ?? beneficiaryAddr?.districtId ?? null;
    let block_id =
      beneficiaryAddr?.block_id ?? beneficiaryAddr?.blockId ?? null;
    let panchayat_id =
      beneficiaryAddr?.panchayat_id ?? beneficiaryAddr?.panchayatId ?? null;
    let village_id =
      beneficiaryAddr?.village_id ?? beneficiaryAddr?.villageId ?? null;

    let member_mobile =
      phone?.phone_no ?? phone?.mobile ?? phone?.number ?? null;
    let marital_status =
      beneficiary.marital_status ?? beneficiary.maritalStatus ?? '';
    let father_husband_name =
      beneficiary.father_husband ??
      beneficiary.father_husband_name ??
      beneficiary.relation_name ??
      '';

    let lokos_shg = lokosShgCode || tempShg?.code || null;

    if (
      (!district_id ||
        !block_id ||
        !panchayat_id ||
        !village_id ||
        !lokos_shg) &&
      tempShg
    ) {
      const loc = extractLocationFromShg(tempShg);
      if (loc) {
        district_id = district_id || loc.district_id;
        block_id = block_id || loc.block_id;
        panchayat_id = panchayat_id || loc.panchayat_id;
        village_id = village_id || loc.village_id;
        lokos_shg = lokos_shg || loc.lokos_shg_code;
      }
    }

    if (
      (!district_id ||
        !block_id ||
        !panchayat_id ||
        !village_id ||
        !lokos_shg) &&
      lokos_shg
    ) {
      const fallback = await findShgAcrossCachedPanchayats(lokos_shg);
      if (fallback) {
        district_id = district_id || fallback.district_id;
        block_id = block_id || fallback.block_id;
        panchayat_id = panchayat_id || fallback.panchayat_id;
        village_id = village_id || fallback.village_id;
        lokos_shg = lokos_shg || fallback.lokos_shg_code;
      }
    }

    const createdBy = getCreatedByNumeric();

    const recordedPayload = {
      lokos_member_code:
        beneficiary.member_code || beneficiary.nic_member_code || null,
      applicant_name: beneficiary.member_name || '',
      age,
      gender: beneficiary.gender || '',
      marital_status,
      father_husband_name,
      category: beneficiary.social_category || beneficiary.socialCategory || '',
      education: beneficiary.education || '',
      address: addressText,
      district_id: district_id || null,
      block_id: block_id || null,
      panchayat_id: panchayat_id || null,
      village_id: village_id || null,
      mobile: member_mobile || null,
      email: beneficiary.email || null,
      lokos_shg_code: lokos_shg || null,
      created_by: createdBy,
      pld_status:
        beneficiary.pld_status === true
          ? 'Yes'
          : beneficiary.pld_status === false
            ? 'No'
            : beneficiary.pld_status || null,
      enterprise_type: 'exep',
    };

    const recRes = await gsApi.createRecordedBeneficiary(recordedPayload);
    recordedBenefId = recRes?.id || null;

    if (!recordedBenefId) {
      throw new Error(
        'Recorded beneficiary created but ID missing in response.',
      );
    }

    return recordedBenefId;
  };

  const sanitizeNumberField = value => {
    if (value === null || value === undefined || value === '') return null;
    const num = parseInt(value, 10);
    return isNaN(num) ? null : num;
  };

  const sanitizeDecimalField = value => {
    if (value === null || value === undefined || value === '') return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : parseFloat(num.toFixed(2));
  };

  const safeArray = arr => (Array.isArray(arr) ? arr : []);



  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // --- EXACT SAME EXTRACTIONS FROM ensureRecordedBeneficiary ---
      const beneficiaryAddr =
        Array.isArray(beneficiary?.member_addresses) &&
          beneficiary.member_addresses.length > 0
          ? beneficiary.member_addresses[0]
          : null;

      const phone =
        Array.isArray(beneficiary?.member_phones) &&
          beneficiary.member_phones.length > 0
          ? beneficiary.member_phones[0]
          : null;

      const addressText =
        (beneficiaryAddr?.address_line1 &&
          String(beneficiaryAddr.address_line1).trim()) ||
        (beneficiaryAddr?.address_line2 &&
          String(beneficiaryAddr.address_line2).trim()) ||
        '';

      const age = computeAgeFromDob(beneficiary?.dob);

      let district_id =
        beneficiaryAddr?.district_id ?? beneficiaryAddr?.districtId ?? null;
      let block_id =
        beneficiaryAddr?.block_id ?? beneficiaryAddr?.blockId ?? null;
      let panchayat_id =
        beneficiaryAddr?.panchayat_id ?? beneficiaryAddr?.panchayatId ?? null;
      let village_id =
        beneficiaryAddr?.village_id ?? beneficiaryAddr?.villageId ?? null;

      let member_mobile =
        phone?.phone_no ?? phone?.mobile ?? phone?.number ?? null;
      let marital_status =
        beneficiary?.marital_status ?? beneficiary?.maritalStatus ?? '';
      let father_husband_name =
        beneficiary?.father_husband ??
        beneficiary?.father_husband_name ??
        beneficiary?.relation_name ??
        '';

      let lokos_shg = lokosShgCode || tempShg?.code || null;

      // --- FALLBACK LOGIC 1: FROM TEMP SHG ---
      if (
        (!district_id ||
          !block_id ||
          !panchayat_id ||
          !village_id ||
          !lokos_shg) &&
        tempShg
      ) {
        const loc = extractLocationFromShg(tempShg);
        if (loc) {
          district_id = district_id || loc.district_id;
          block_id = block_id || loc.block_id;
          panchayat_id = panchayat_id || loc.panchayat_id;
          village_id = village_id || loc.village_id;
          lokos_shg = lokos_shg || loc.lokos_shg_code;
        }
      }

      // --- FALLBACK LOGIC 2: ACROSS CACHED PANCHAYATS ---
      if (
        (!district_id ||
          !block_id ||
          !panchayat_id ||
          !village_id ||
          !lokos_shg) &&
        lokos_shg
      ) {
        const fallback = await findShgAcrossCachedPanchayats(lokos_shg);
        if (fallback) {
          district_id = district_id || fallback.district_id;
          block_id = block_id || fallback.block_id;
          panchayat_id = panchayat_id || fallback.panchayat_id;
          village_id = village_id || fallback.village_id;
          lokos_shg = lokos_shg || fallback.lokos_shg_code;
        }
      }
      // ------------------------------------------------------------

      const sanitizedProducts = safeArray(existingForm?.products).map(prod => {
        const monthly = parseFloat(prod.avg_monthly_sales || 0);
        return {
          ...prod,
          avg_monthly_sales: monthly ? monthly.toFixed(2) : '0.00',
          avg_annual_sales: monthly ? (monthly * 12).toFixed(2) : '0.00',
        };
      });

      const createdBy = getCreatedByNumeric();

      const sourceOfInvestmentString = safeArray(
        existingForm.source_of_investment_tree,
      )
        .filter(
          row =>
            row.parent &&
            Array.isArray(row.children) &&
            row.children.length > 0,
        )
        .map(row => `${row.parent}: ${row.children.join(', ')}`)
        .join(' | ');

      const activeLicenses =
        existingForm.licenses?.length > 0
          ? existingForm.licenses
          : existingEnterprise?.licenses || [];

      const finalPayload = {
        beneficiary: {
          lokos_member_code:
            beneficiary?.member_code || beneficiary?.nic_member_code || null,
          applicant_name: beneficiary?.member_name || '',
          age,
          gender: beneficiary?.gender || '',
          marital_status,
          father_husband_name,
          category:
            beneficiary?.social_category || beneficiary?.socialCategory || '',
          education: beneficiary?.education || '',
          address: addressText,
          district_id: district_id || null,
          block_id: block_id || null,
          panchayat_id: panchayat_id || null,
          village_id: village_id || null,
          mobile: member_mobile || null,
          email: beneficiary?.email || null,
          lokos_shg_code: lokos_shg || null,
          created_by: createdBy,
          pld_status:
            beneficiary?.pld_status === true
              ? 'Yes'
              : beneficiary?.pld_status === false
                ? 'No'
                : beneficiary?.pld_status || null,
          enterprise_type: 'exep',
          special_category: beneficiary?.special_category || '',
        },

        enterprise: {
          enterprise_name: existingForm.enterprise_name || '',
          ownership_type: existingForm.ownership_type || '',
          owner_cadre: Array.isArray(existingForm.owner_cadre)
            ? existingForm.owner_cadre.join(', ')
            : existingForm.owner_cadre || '',
          owner_designation: Array.isArray(existingForm.owner_designation)
            ? existingForm.owner_designation.join(', ')
            : existingForm.owner_designation || '',
          owner_special_category: existingForm.owner_special_category || '',

          year_of_establishment: sanitizeNumberField(
            existingForm.year_of_establishment,
          ),
          total_emp: sanitizeNumberField(existingForm.total_emp),
          number_of_shg_emp: sanitizeNumberField(
            existingForm.number_of_shg_emp,
          ),

          workplace_type: existingForm.workplace_type || '',

          // 🛠️ FIX: Completely removed normalizeBoolean to allow original Strings (e.g., 'Yes', 'No', 'Others')
          // because these are defined as CharFields / TextFields in Django.
          electricity_available: existingForm.electricity_available || '',
          water_available: existingForm.water_available || '',
          transportation_availability:
            existingForm.transportation_availability || '',
          need_transport_help: existingForm.need_transport_help || '',

          // 🛠️ Note: This is an actual DB BooleanField, keeping normalizeBoolean.
          can_send_to_bijnor: normalizeBoolean(existingForm.can_send_to_bijnor),
          have_shop_based_prod: normalizeBoolean(existingForm.has_shop_product),

          monthly_income_estimate: sanitizeDecimalField(
            existingForm.monthly_income_estimate,
          ),
          annual_turnover: sanitizeDecimalField(existingForm.annual_turnover),
          gross_profit: sanitizeDecimalField(existingForm.gross_profit),
          working_capital_monthly: sanitizeDecimalField(
            existingForm.working_capital_monthly,
          ),
          initial_investment: sanitizeDecimalField(
            existingForm.initial_investment,
          ),
          source_of_investment:
            sourceOfInvestmentString || existingForm.source_of_investment || '',

          has_taken_loan: normalizeBoolean(existingForm.has_taken_loan),
          has_received_subsidy: normalizeBoolean(
            existingForm.has_receieved_subsidy ||
            existingForm.has_receieved_subsidy,
          ),
          has_shg_received_man_fund: normalizeBoolean(existingForm.has_shg_cif),

          is_training_received: normalizeBoolean(
            existingForm.is_training_received,
          ),
          is_training_required: normalizeBoolean(
            existingForm.is_training_required,
          ),

          // 🛠️ FIX: Removed normalizeBoolean from TextFields
          expansion_plan: existingForm.expansion_plan || '',
          info_abt_gov_scheme: existingForm.info_abt_gov_scheme || '',
          is_support_required: existingForm.is_support_required || '',

          nearest_skill_centre: existingForm.nearest_skill_centre || '',
          skill_centre_loc: existingForm.skill_centre_loc || '',
          nearest_industry: existingForm.nearest_industry || '',
          industry_loc: existingForm.industry_loc || '',

          declaration_confirmed: true,
          declaration_date: existingForm.declaration_date || '',
          verifier_name: existingForm.verifier_name || '',
          created_by: createdBy,
        },

        // 🛠️ FIX: Using activeLicenses (merged fallback) to stop empty array wipeouts
        licenses: safeArray(activeLicenses).map((lic, i) => ({
          license_category: lic.license_category || lic.category || '',
          license_name: lic.license_name || lic.name || '',
          license_no: lic.license_no || lic.number || '',
          file_key: `license_${i}`,
          created_by: createdBy,
        })),

        loans: safeArray(existingForm.loans).map(loan => ({
          form_type: 'exep',
          department: loan.department || '',
          institution_name: loan.institution_name || '',
          bank_name:
            loan.bank_name === 'OTHER'
              ? loan.other_bank_name
              : loan.bank_name || '',
          bank_branch: loan.branch_name || loan.bank_branch || '',
          loan_amount: String(loan.loan_amount || '0'),
          repaid_amount: String(loan.repaid_amount || '0'),
          date_taken: loan.date_taken || '',
          repayment_status:
            parseFloat(loan.repaid_amount || 0) >=
              parseFloat(loan.loan_amount || 1)
              ? 'PAID'
              : 'PARTIALLY PAID',
          created_by: createdBy,
        })),

        // subsidies: safeArray(existingForm.subsidies).map(sub => {
        //   let subsidyTypeText = '';
        //   let subsidyNameText = '';
        //   if (
        //     Array.isArray(sub.subsidy_name_tree) &&
        //     sub.subsidy_name_tree.length > 0
        //   ) {
        //     subsidyTypeText = sub.subsidy_name_tree
        //       .map(item => item.parent)
        //       .join(', ');
        //     subsidyNameText = sub.subsidy_name_tree
        //       .map(item => {
        //         let childList =
        //           item.children && item.children.length > 0
        //             ? item.children.join(', ')
        //             : 'General Support';
        //         if (item.others_specify)
        //           childList = `${childList} (${item.others_specify})`;
        //         return childList;
        //       })
        //       .join(' | ');
        //   }
        //   return {
        //     subsidy_type: subsidyTypeText || sub.subsidy_type || '',
        //     subsidy_name: subsidyNameText || sub.subsidy_name || '',
        //     subsidy_detail: sub.subsidy_detail || '',
        //     created_by: createdBy,
        //   };
        // }),

        subsidies: safeArray(existingForm.subsidies).map(sub => {
          let subsidyTypeText = '';
          let subsidyNameText = '';

          if (
            Array.isArray(sub.subsidy_name_tree) &&
            sub.subsidy_name_tree.length > 0
          ) {
            subsidyTypeText = sub.subsidy_name_tree
              .map(item => {
                const parent = item.parent || '';

                if (
                  parent.includes('Others') &&
                  item.others_specify
                ) {
                  return `Others (Specify) - ${item.others_specify}`;
                }

                return parent;
              })
              .join(', ');

            subsidyNameText = sub.subsidy_name_tree
              .map(item => {
                const children =
                  Array.isArray(item.children) && item.children.length
                    ? item.children
                    : ['General Support'];

                return children
                  .map(child => {
                    if (
                      child === 'Others' &&
                      item.others_specify
                    ) {
                      return `Others - ${item.others_specify}`;
                    }

                    return child;
                  })
                  .join(', ');
              })
              .join(' | ');
          }

          return {
            subsidy_type: subsidyTypeText || sub.subsidy_type || '',
            subsidy_name: subsidyNameText || sub.subsidy_name || '',
            subsidy_detail: sub.subsidy_detail || '',
            created_by: createdBy,
          };
        }),

        shops:
          existingForm.has_shop_product === 'Yes'
            ? [
              {
                // 1. Format Shop Category Others
                shop_category: (() => {
                  const val = existingForm.shop_sub_category || '';
                  if (val === 'Others') {
                    const otherText =
                      existingForm.shop_sub_category_other ||
                      existingForm.shop_type_other ||
                      '';
                    return otherText ? `Others - ${otherText}` : 'Others';
                  }
                  return val;
                })(),

                shop_type: (() => {
                  if (
                    existingForm.shop_type === 'Others' &&
                    existingForm.shop_type_other
                  ) {
                    return `Others - ${existingForm.shop_type_other}`;
                  }
                  return existingForm.shop_type || '';
                })(),
                source_of_inventory: existingForm.inventory_source || '',

                // 2. Format Target Customers Others (Handles both single string or multi-select array)
                target_customers: (() => {
                  const customers = Array.isArray(
                    existingForm.target_customers,
                  )
                    ? existingForm.target_customers
                    : (existingForm.target_customers || '')
                      .split(',')
                      .map(s => s.trim())
                      .filter(Boolean);

                  return customers
                    .map(c =>
                      c === 'Others' && existingForm.target_customers_other
                        ? `Others - ${existingForm.target_customers_other}`
                        : c,
                    )
                    .join(', ');
                })(),

                sales_area: Array.isArray(existingForm.sales_area)
                  ? existingForm.sales_area.join(', ')
                  : existingForm.sales_area || '',

                // 3. Format Marketing Strategy Others (Handles both single string or multi-select array)
                marketing_strategy: (() => {
                  const strategies = Array.isArray(
                    existingForm.marketing_strategy,
                  )
                    ? existingForm.marketing_strategy
                    : (existingForm.marketing_strategy || '')
                      .split(',')
                      .map(s => s.trim())
                      .filter(Boolean);

                  return strategies
                    .map(s =>
                      s === 'Others' && existingForm.marketing_strategy_other
                        ? `Others - ${existingForm.marketing_strategy_other}`
                        : s,
                    )
                    .join(', ');
                })(),

                marketing_channels:
                  generateCleanMarketingChannels(existingForm),
                market_linkage: generateMarketLinkageString(existingForm),

                marketing_challenges: (() => {
                  const challenges = Array.isArray(
                    existingForm.marketing_challenges,
                  )
                    ? existingForm.marketing_challenges
                    : (existingForm.marketing_challenges || '')
                      .split(',')
                      .map(s => s.trim())
                      .filter(Boolean);

                  if (
                    challenges.includes('Others') &&
                    existingForm.marketing_challenges_other
                  ) {
                    return challenges
                      .map(c =>
                        c === 'Others'
                          ? `Others (${existingForm.marketing_challenges_other})`
                          : c,
                      )
                      .join(', ');
                  }
                  return challenges.join(', ');
                })(),

                accept_digital_payment: normalizeBoolean(
                  existingForm.accept_digital_payment,
                ),
                avg_monthly_sales: existingForm.avg_monthly_sales || '0.00',
                avg_annual_sales: existingForm.annual_sale || '0.00',
                media: {
                  front_key: safeArray(existingForm.media?.shop_front)
                    .map((_, idx) => `shop_front_0_${idx}`)
                    .join(','),
                  inside_key: safeArray(existingForm.media?.shop_inside)
                    .map((_, idx) => `shop_inside_0_${idx}`)
                    .join(','),
                  others_key: safeArray(existingForm.media?.shop_others)
                    .map((_, idx) => `shop_others_0_${idx}`)
                    .join(','),
                },
                created_by: createdBy,
              },
            ]
            : [],

        products: sanitizedProducts.map((prod, i) => ({
          main_product_name: prod.main_product_name || '',
          activity_or_product_type: prod.activity_or_product_type || '',
          product_features: prod.product_features || '',
          production_capacity: String(prod.production_capacity || ''),
          raw_material: Array.isArray(prod.raw_material)
            ? prod.raw_material.join(', ')
            : prod.raw_material || '',
          raw_material_source:
            prod.material_source || prod.raw_material_source || '',
          machinery_equipment: Array.isArray(prod.machinery_equipment)
            ? prod.machinery_equipment.join(', ')
            : prod.machinery_equipment || '',
          source_machinery:
            prod.machinery_source || prod.source_machinery || '',
          product_mrp: String(prod.product_price || prod.product_mrp || ''),
          sales_area: Array.isArray(prod.sales_area)
            ? prod.sales_area.join(', ')
            : prod.sales_area || '',
          target_customers: Array.isArray(prod.target_customers)
            ? prod.target_customers.join(', ')
            : prod.target_customers || '',

          // 🛠️ FIX: Removed normalizeBoolean to preserve original strings from TextFields
          packaging_branding_status: prod.packaging_branding_status || '',
          market_linkage: prod.market_linkage || '',

          marketing_strategy: Array.isArray(prod.marketing_strategy)
            ? prod.marketing_strategy.join(', ')
            : prod.marketing_strategy || '',
          marketing_channels: Array.isArray(prod.marketing_channels)
            ? prod.marketing_channels.join(', ')
            : prod.marketing_channels || '',
          marketing_challenges: Array.isArray(prod.marketing_challenges)
            ? prod.marketing_challenges.join(', ')
            : prod.marketing_challenges || '',
          accept_digital_payment: normalizeBoolean(prod.accept_digital_payment),
          avg_monthly_sales: prod.avg_monthly_sales || '0.00',
          avg_annual_sales: prod.avg_annual_sales || '0.00',
          media: {
            open_box_key: safeArray(prod.media?.open_box)
              .map((_, idx) => `prod_${i}_open_${idx}`)
              .join(','),
            close_box_key: safeArray(prod.media?.close_box)
              .map((_, idx) => `prod_${i}_close_${idx}`)
              .join(','),
            others_key: safeArray(prod.media?.others)
              .map((_, idx) => `prod_${i}_others_${idx}`)
              .join(','),
          },
          created_by: createdBy,
        })),

        enterprise_media: {
          entrepreneur_key: safeArray(existingForm.media?.photo_entrepreneur)
            .map((_, idx) => `photo_entrepreneur_${idx}`)
            .join(','),
          enterprise_key: safeArray(existingForm.media?.photo_enterprise)
            .map((_, idx) => `photo_enterprise_${idx}`)
            .join(','),
          others_key: safeArray(existingForm.media?.others)
            .map((_, idx) => `media_others_${idx}`)
            .join(','),
          created_by: createdBy,
        },

        // categories: existingForm.enterprise_types_tree
        //   ? existingForm.enterprise_types_tree.map(cat => ({
        //     parent_category: cat.parent?.en || cat.parent || '',
        //     sub_category: cat.children
        //       ? cat.children.map(c => c.en || c).join(', ')
        //       : '',
        //     created_by: createdBy,
        //   }))
        //   : [],
        categories: existingForm.enterprise_types_tree
          ? existingForm.enterprise_types_tree.map(cat => ({
            parent_category: cat.parent?.en || cat.parent || '',

            sub_category: Array.isArray(cat.children)
              ? cat.children
                .map(c => {
                  const value = c?.en || c || '';

                  // Preserve Others input
                  if (
                    value === 'Others' &&
                    cat.childOtherText?.Others
                  ) {
                    return `Others - ${cat.childOtherText.Others}`;
                  }

                  return value;
                })
                .join(', ')
              : '',

            created_by: createdBy,
          }))
          : [],

        supports: (() => {
          const sData = existingForm.support_required || {};
          const mapped = [];
          if (sData.financial)
            mapped.push({
              category: 'Financial',
              sub_category: sData.financial.type,
              description:
                sData.financial.type === 'Loan'
                  ? sData.financial.amount
                  : sData.financial.spec,
            });
          if (sData.infrastructure)
            mapped.push({
              category: 'Infrastructure',
              sub_category: sData.infrastructure.type,
              description: sData.infrastructure.spec,
            });
          if (sData.machinery)
            mapped.push({
              category: 'Machinery',
              sub_category: 'Direct Entry',
              description: sData.machinery,
            });
          if (sData.other)
            mapped.push({
              category: 'Other',
              sub_category: 'Direct Entry',
              description: sData.other,
              other_support: sData.other,
            });
          return mapped.map(obj => ({ ...obj, created_by: createdBy }));
        })(),

        mandatory_funds: safeArray(existingForm.fund_cards).map(fund => {
          const received = parseFloat(fund.amount_received || 0);
          const repaid = parseFloat(fund.amount_repaid || 0);
          let status = 'NOT PAID';
          if (repaid > 0)
            status = repaid >= received ? 'PAID' : 'PARTIALLY PAID';
          return {
            fund_type:
              fund.loanType === 'Other'
                ? fund.otherLoanTypeText
                : fund.loanType,
            have_received_part: fund.has_received === 'Yes',
            amount_received: String(fund.amount_received || '0'),
            amount_repaid: String(fund.amount_repaid || '0'),
            repayment_status: status,
            created_by: createdBy,
          };
        }),

        training_requests: [
          ...safeArray(existingForm.training_received_rows).map((row, i) => ({
            form_type: 'rec',
            sector_type: row.sector_tree?.[0]?.parent || '',
            sector: row.sector_tree?.[0]?.children?.join(', ') || '',
            department: row.department || '',
            training_type: row.training_type || '',
            duration: row.duration || '',
            location: row.location || '',
            expected_income: String(row.expected_income || '0'),
            certificate_file_keys: (
              row.files ||
              row.certificates_files ||
              []
            ).map((_, idx) => `cert_${i}_${idx}`),
            created_by: createdBy,
          })),
          ...safeArray(existingForm.training_required_rows).map(row => ({
            form_type: 'req',
            sector_type: row.sector_tree?.[0]?.parent || '',
            sector: row.sector_tree?.[0]?.children?.join(', ') || '',
            department: row.department || '',
            training_type: row.training_type || '',
            duration: row.duration || '',
            location: row.location || '',
            expected_income: String(row.expected_income || '0'),
            created_by: createdBy,
          })),
        ],
      };

      console.log('=== PAYLOAD JSON STRING (for backend) ===');
      console.log(JSON.stringify(finalPayload, null, 2));

      const formData = new FormData();
      formData.append('data_payload', JSON.stringify(finalPayload));

      // 🛠️ FIX: Using activeLicenses to map over existing/preserved data and only append files safely
      safeArray(activeLicenses).forEach((lic, i) => {
        if (lic.file && lic.file.uri) {
          formData.append(`license_${i}`, {
            uri: lic.file.uri,
            type: lic.file.type || 'image/jpeg',
            name: lic.file.fileName || lic.file.name || `license_${i}.jpg`,
          });
        }
      });

      // Shop Media
      if (existingForm.has_shop_product === 'Yes' && existingForm.media) {
        safeArray(existingForm.media.shop_front).forEach((file, idx) => {
          formData.append(`shop_front_0_${idx}`, {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: `shop_front_${idx}.jpg`,
          });
        });
        safeArray(existingForm.media.shop_inside).forEach((file, idx) => {
          formData.append(`shop_inside_0_${idx}`, {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: `shop_inside_${idx}.jpg`,
          });
        });
        safeArray(existingForm.media.shop_others).forEach((file, idx) => {
          formData.append(`shop_others_0_${idx}`, {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: `shop_others_${idx}.jpg`,
          });
        });
      }

      // Product Media
      sanitizedProducts.forEach((prod, i) => {
        const media = prod.media || {};
        safeArray(media.open_box).forEach((file, idx) => {
          formData.append(`prod_${i}_open_${idx}`, {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: `prod_${i}_open_${idx}.jpg`,
          });
        });
        safeArray(media.close_box).forEach((file, idx) => {
          formData.append(`prod_${i}_close_${idx}`, {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: `prod_${i}_close_${idx}.jpg`,
          });
        });
        safeArray(media.others).forEach((file, idx) => {
          formData.append(`prod_${i}_others_${idx}`, {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: `prod_${i}_others_${idx}.jpg`,
          });
        });
      });

      // Enterprise Media
      const epMedia = existingForm.media || {};
      safeArray(epMedia.photo_entrepreneur).forEach((file, idx) => {
        formData.append(`photo_entrepreneur_${idx}`, {
          uri: file.uri,
          type: file.type || 'image/jpeg',
          name: `entrepreneur_${idx}.jpg`,
        });
      });
      safeArray(epMedia.photo_enterprise).forEach((file, idx) => {
        formData.append(`photo_enterprise_${idx}`, {
          uri: file.uri,
          type: file.type || 'image/jpeg',
          name: `enterprise_${idx}.jpg`,
        });
      });
      safeArray(epMedia.others).forEach((file, idx) => {
        formData.append(`media_others_${idx}`, {
          uri: file.uri,
          type: file.type || 'image/jpeg',
          name: `others_${idx}.jpg`,
        });
      });

      // Training certs
      safeArray(existingForm.training_received_rows).forEach((tr, i) => {
        const files = tr.files || tr.certificates_files || [];
        files.forEach((file, idx) => {
          formData.append(`cert_${i}_${idx}`, {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: file.fileName || file.name || `cert_${i}_${idx}.jpg`,
          });
        });
      });

      const signature = existingForm?.media?.declaration_signature || [];
      if (signature?.[0]) {
        formData.append('signature', {
          uri: signature[0].uri,
          type: signature[0].type || 'image/jpeg',
          name: 'signature.jpg',
        });
      }

      // API Call
      const enterpriseRes = await gsApi.createExepForm(formData);

      if (!enterpriseRes?.enterprise_id && !enterpriseRes?.TH_urid) {
        throw new Error('Enterprise ID not returned from API');
      }

      // Success
      Alert.alert('Saved', 'Existing Enterprise submitted successfully!', [
        {
          text: 'OK',
          onPress: async () => {
            if (memberCode)
              await AsyncStorage.removeItem(`DRAFT_EXEP_${memberCode}`);
            navigation?.goBack?.();
          },
        },
      ]);
    } catch (err) {
      console.error('Submit error:', err);
      if (err.status === 400 && err.data?.details) {
        Alert.alert('Validation Error', err.data.details);
      } else {
        Alert.alert('Error', err.message || 'Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading...</Text>
      </View>
    );
  }

  const PaginationButtons = ({
    currentSectionIndex,
    TOTAL_SECTIONS,
    submitting,
    setCurrentSectionIndex,
    handleSubmit,
  }) => {
    const { language } = useContext(LanguageContext);

    const validateEnterpriseDetails = () => {
      if (!existingForm.workplace_type) {
        Alert.alert(
          language === 'hi' ? 'सत्यापन' : 'Validation',
          language === 'hi'
            ? 'कृपया कार्यस्थल का प्रकार चुनें'
            : 'Please select workplace type',
        );
        return false;
      }

      if (
        existingForm.workplace_type === 'Others' &&
        !existingForm.workplace_type_other?.trim()
      ) {
        Alert.alert(
          language === 'hi' ? 'सत्यापन' : 'Validation',
          language === 'hi'
            ? 'कृपया कार्यस्थल का विवरण दें'
            : 'Please specify workplace type',
        );
        return false;
      }

      if (!existingForm.electricity_available) {
        Alert.alert(
          language === 'hi' ? 'सत्यापन' : 'Validation',
          language === 'hi'
            ? 'कृपया बिजली की स्थिति चुनें'
            : 'Please select electricity availability',
        );
        return false;
      }

      if (
        existingForm.electricity_available === 'Others' &&
        !existingForm.electricity_other?.trim()
      ) {
        Alert.alert(
          language === 'hi' ? 'सत्यापन' : 'Validation',
          language === 'hi'
            ? 'कृपया बिजली का विवरण दें'
            : 'Please specify electricity details',
        );
        return false;
      }

      if (!existingForm.water_available) {
        Alert.alert(
          language === 'hi' ? 'सत्यापन' : 'Validation',
          language === 'hi'
            ? 'कृपया पानी की उपलब्धता चुनें'
            : 'Please select water availability',
        );
        return false;
      }

      if (
        existingForm.water_available === 'Others' &&
        !existingForm.water_other?.trim()
      ) {
        Alert.alert(
          language === 'hi' ? 'सत्यापन' : 'Validation',
          language === 'hi'
            ? 'कृपया पानी का विवरण दें'
            : 'Please specify water availability',
        );
        return false;
      }

      if (!existingForm.transportation_availability) {
        Alert.alert(
          language === 'hi' ? 'सत्यापन' : 'Validation',
          language === 'hi'
            ? 'कृपया परिवहन उपलब्धता चुनें'
            : 'Please select transport availability',
        );
        return false;
      }

      if (
        existingForm.transportation_availability === 'Need Help' &&
        !existingForm.need_transport_help?.trim()
      ) {
        Alert.alert(
          language === 'hi' ? 'सत्यापन' : 'Validation',
          language === 'hi'
            ? 'कृपया परिवहन सहायता का विवरण दें'
            : 'Please describe transport help required',
        );
        return false;
      }

      if (!existingForm.can_send_to_bijnor) {
        Alert.alert(
          language === 'hi' ? 'सत्यापन' : 'Validation',
          language === 'hi'
            ? 'कृपया चयन करें कि आप बिजनौर भेज सकते हैं या नहीं'
            : 'Please select if you can send to Bijnor',
        );
        return false;
      }

      return true;
    };

    const isEmpty = v => {
      return !v || v.toString().trim() === '';
    };

    const splitMulti = v => {
      if (!v) return [];
      if (Array.isArray(v)) return v;
      return v
        .split(',')
        .map(i => i.trim())
        .filter(Boolean);
    };

    const isMultiEmpty = v => {
      return splitMulti(v).length === 0;
    };

    const validateShopSection = form => {
      if (!form.has_shop_product) {
        return 'Please select shop product option';
      }

      if (form.has_shop_product === 'Yes') {
        if (isEmpty(form.shop_type)) return 'Select shop type';

        // 🌟 FIX: Handle "Others" separately to prevent validation blocking
        if (form.shop_type === 'Others') {
          if (isEmpty(form.shop_type_other)) return 'Specify other shop type';
        } else {
          // Normal validation for standard categories
          if (isEmpty(form.shop_sub_category)) return 'Select Shop category';

          if (
            form.shop_sub_category === 'Others' &&
            isEmpty(form.shop_sub_category_other)
          )
            return 'Specify other shop category';
        }

        if (isEmpty(form.inventory_source)) return 'Enter inventory source';

        if (isMultiEmpty(form.target_customers))
          return 'Select target customers';

        if (
          splitMulti(form.target_customers).includes('Others') &&
          isEmpty(form.target_customers_other)
        )
          return 'Specify other target customers';

        if (isMultiEmpty(form.sales_area)) return 'Select sales area';

        if (isMultiEmpty(form.marketing_strategy))
          return 'Select marketing strategy';

        if (
          splitMulti(form.marketing_strategy).includes('Others') &&
          isEmpty(form.marketing_strategy_other)
        )
          return 'Specify other marketing strategy';

        if (isMultiEmpty(form.marketing_channels))
          return 'Select marketing channels';

        const selectedChannels = splitMulti(form.marketing_channels);

        for (const chan of selectedChannels) {
          // Check if any selected channel is an "Others" variant (e.g. Retail_Others)
          if (chan.includes('_Others')) {
            const channelName = chan.split('_')[0]; // e.g. "Retail"
            const linkageKey = `market_linkage_${channelName}`; // e.g. "market_linkage_Retail"

            if (isEmpty(form[linkageKey])) {
              return `Specify marketing linkage details for ${channelName}`;
            }
          }
        }

        if (isMultiEmpty(form.marketing_challenges))
          return 'Select marketing challenges';

        if (
          splitMulti(form.marketing_challenges).includes('Others') &&
          isEmpty(form.marketing_challenges_other)
        )
          return 'Specify marketing challenges';

        if (!form.accept_digital_payment)
          return 'Select digital payment option';

        if (isEmpty(form.avg_monthly_sales)) return 'Enter monthly sales';

        if (isEmpty(form.annual_sale)) return 'Enter annual sale';

        if (!form.media?.shop_front?.length)
          return 'Upload at least 1 shop front image';

        if (!form.media?.shop_inside?.length)
          return 'Upload at least 1 shop inside image';
      }

      return null;
    };

    const validateProducts = products => {
      if (!products.length) return 'Add at least one product';

      for (let i = 0; i < products.length; i++) {
        const p = products[i];

        if (isEmpty(p.main_product_name))
          return `Product ${i + 1}: Enter product name`;

        if (isEmpty(p.activity_or_product_type))
          return `Product ${i + 1}: Select product type`;

        if (
          p.activity_or_product_type === 'Others' &&
          isEmpty(p.product_type_other)
        )
          return `Product ${i + 1}: Specify product type`;

        if (isEmpty(p.production_capacity))
          return `Product ${i + 1}: Enter production capacity`;

        if (isMultiEmpty(p.raw_material))
          return `Product ${i + 1}: Select raw material`;

        if (
          splitMulti(p.raw_material).includes('Others') &&
          isEmpty(p.raw_material_other)
        )
          return `Product ${i + 1}: Specify raw material`;

        if (isEmpty(p.machinery_source))
          return `Product ${i + 1}: Enter machinery source`;

        if (isMultiEmpty(p.machinery_equipment))
          return `Product ${i + 1}: Select machinery`;

        if (
          splitMulti(p.machinery_equipment).includes('Others') &&
          isEmpty(p.machinery_equipment_other)
        )
          return `Product ${i + 1}: Specify machinery`;

        if (isMultiEmpty(p.target_customers))
          return `Product ${i + 1}: Select target customers`;

        if (
          splitMulti(p.target_customers).includes('Others') &&
          isEmpty(p.target_customers_other)
        )
          return `Product ${i + 1}: Specify customers`;

        if (isMultiEmpty(p.sales_area))
          return `Product ${i + 1}: Select sales area`;

        if (!p.packaging_branding_status)
          return `Product ${i + 1}: Select packaging status`;

        if (isMultiEmpty(p.marketing_strategy))
          return `Product ${i + 1}: Select marketing strategy`;

        if (
          splitMulti(p.marketing_strategy).includes('Others') &&
          isEmpty(p.marketing_strategy_other)
        )
          return `Product ${i + 1}: Specify strategy`;

        if (isMultiEmpty(p.marketing_channels))
          return `Product ${i + 1}: Select marketing channels`;

        // 1. Get the list of selected main channels
        const channels = splitMulti(p.marketing_channels);

        // 2. Check if the Main "Others" checkbox is selected
        if (channels.includes('Others')) {
          // Validate the text input specific to the Main "Others" field
          // We use the same key as the TextInput in the component: marketing_channels_Others_input
          if (isEmpty(p.marketing_channels_Others_input)) {
            return `Product ${i + 1}: Specify channel details for Others`;
          }
        }

        if (isMultiEmpty(p.marketing_challenges))
          return `Product ${i + 1}: Select challenges`;

        if (
          splitMulti(p.marketing_challenges).includes('Others') &&
          isEmpty(p.marketing_challenges_other)
        )
          return `Product ${i + 1}: Specify challenges`;

        if (!p.accept_digital_payment)
          return `Product ${i + 1}: Select digital payment`;

        if (isEmpty(p.product_price))
          return `Product ${i + 1}: Enter product price`;

        if (isEmpty(p.avg_monthly_sales))
          return `Product ${i + 1}: Enter monthly sales`;

        if (!p.media?.open_box?.length)
          return `Product ${i + 1}: Upload open box image`;

        if (!p.media?.close_box?.length)
          return `Product ${i + 1}: Upload closed box image`;
      }

      return null;
    };

    const handleNext = () => {
      console.log('==================================================');
      console.log(
        `%c NAVIGATING FROM SECTION: ${currentSectionIndex} `,
        'background: #EE6969; color: #fff; font-weight: bold;',
      );

      let canProceed = true;

      if (currentSectionIndex === 0) {
        if (!existingForm.enterprise_name?.trim()) {
          Alert.alert('Validation', 'Please enter the enterprise name.');
          canProceed = false;
        } else if (!existingForm.enterprise_types_tree?.length) {
          Alert.alert('Validation', 'Please select enterprise type.');
          canProceed = false;
        } else if (!existingForm.ownership_type) {
          Alert.alert('Validation', 'Please select ownership type.');
          canProceed = false;
        } else if (
          existingForm.ownership_type === 'Others' &&
          !existingForm.ownership_type_other?.trim()
        ) {
          Alert.alert('Validation', 'Please specify ownership type.');
          canProceed = false;
        } else if (!existingForm.year_of_establishment) {
          Alert.alert('Validation', 'Please select year of establishment.');
          canProceed = false;
        } else if (
          existingForm.total_emp === '' ||
          existingForm.total_emp === undefined
        ) {
          Alert.alert('Validation', 'Please enter total employees.');
          canProceed = false;
        } else if (
          existingForm.number_of_shg_emp === '' ||
          existingForm.number_of_shg_emp === undefined
        ) {
          Alert.alert('Validation', 'Please enter SHG employees count.');
          canProceed = false;
        } else if (!existingForm.owner_cadre?.length) {
          Alert.alert(
            'Validation',
            'Please select at least one cadre activity.',
          );
          canProceed = false;
        } else if (
          existingForm.owner_cadre.includes('Other') &&
          !existingForm.owner_cadre_other?.trim()
        ) {
          Alert.alert('Validation', 'Please specify other cadre activity.');
          canProceed = false;
        } else if (!existingForm.owner_designation?.length) {
          Alert.alert('Validation', 'Please select your designation.');
          canProceed = false;
        }
      }

      if (currentSectionIndex === 1 && canProceed) {
        if (!validateEnterpriseDetails()) {
          canProceed = false;
        }
      }

      if (currentSectionIndex === 2 && canProceed) {
        let error = null;

        if (existingForm.has_shop_product === 'Yes') {
          error = validateShopSection(existingForm);
        } else if (existingForm.has_shop_product === 'No') {
          error = validateProducts(existingForm.products);
        } else {
          error = 'Please select Yes or No';
        }

        if (error) {
          Alert.alert('Validation Error', error);
          canProceed = false;
        }
      }

      if (currentSectionIndex === 3 && canProceed) {
        const initial = existingForm.initial_investment;
        const monthlyIncome = existingForm.monthly_income_estimate;
        const workingCapital = existingForm.working_capital_monthly;
        const hasShg = existingForm.has_shg_cif;
        const fundCards = existingForm.fund_cards || [];
        const sourceTree = existingForm.source_of_investment_tree;

        const isInvalid = val => {
          return (
            val === null ||
            val === undefined ||
            String(val).trim() === '' ||
            isNaN(Number(val)) ||
            Number(val) <= 0
          );
        };

        if (isInvalid(initial)) {
          Alert.alert(
            'Validation',
            'Please enter valid Initial Investment (> 0)',
          );
          canProceed = false;
        }

        if (canProceed && isInvalid(monthlyIncome)) {
          Alert.alert('Validation', 'Please enter valid Monthly Income (> 0)');
          canProceed = false;
        }

        if (canProceed && isInvalid(workingCapital)) {
          Alert.alert(
            'Validation',
            'Please enter valid Monthly Working Capital (> 0)',
          );
          canProceed = false;
        }

        if (canProceed && !hasShg) {
          Alert.alert('Validation', 'Please select SHG fund option');
          canProceed = false;
        }

        if (canProceed && hasShg === 'Yes') {
          if (fundCards.length === 0) {
            Alert.alert('Validation', 'Please add at least one fund');
            canProceed = false;
          } else {
            for (let i = 0; i < fundCards.length; i++) {
              const card = fundCards[i];

              if (!card.loanType) {
                Alert.alert('Validation', `Select fund type in card ${i + 1}`);
                canProceed = false;
                break;
              }

              if (
                card.loanType === 'Other' &&
                !card.otherLoanTypeText?.trim()
              ) {
                Alert.alert(
                  'Validation',
                  `Specify other fund type in card ${i + 1}`,
                );
                canProceed = false;
                break;
              }

              if (!card.has_received) {
                Alert.alert(
                  'Validation',
                  `Select received option in card ${i + 1}`,
                );
                canProceed = false;
                break;
              }

              if (card.has_received === 'Yes') {
                if (isInvalid(card.amount_received)) {
                  Alert.alert(
                    'Validation',
                    `Enter valid received amount in card ${i + 1}`,
                  );
                  canProceed = false;
                  break;
                }

                if (isInvalid(card.amount_repaid)) {
                  Alert.alert(
                    'Validation',
                    `Enter valid repaid amount in card ${i + 1}`,
                  );
                  canProceed = false;
                  break;
                }

                if (Number(card.amount_repaid) > Number(card.amount_received)) {
                  Alert.alert(
                    'Validation',
                    `Repaid cannot exceed received (card ${i + 1})`,
                  );
                  canProceed = false;
                  break;
                }
              }
            }
          }
        }

        if (canProceed && (!sourceTree || sourceTree.length === 0)) {
          Alert.alert('Validation', 'Please select source of investment');
          canProceed = false;
        }
      }

      if (currentSectionIndex === 4 && canProceed) {
        const isInvalidNumber = val => {
          return (
            val === null ||
            val === undefined ||
            String(val).trim() === '' ||
            isNaN(Number(val))
          );
        };

        if (!existingForm.has_taken_loan) {
          Alert.alert('Validation', 'Please select if you have taken a loan');
          canProceed = false;
          return;
        }

        if (existingForm.has_taken_loan === 'Yes') {
          if (!existingForm.loans || existingForm.loans.length === 0) {
            Alert.alert('Validation', 'Please add at least one loan');
            canProceed = false;
            return;
          }

          for (let i = 0; i < existingForm.loans.length; i++) {
            const loan = existingForm.loans[i];

            if (!loan.institution_tree || loan.institution_tree.length === 0) {
              Alert.alert(
                'Validation',
                `Loan ${i + 1}: Please select institution`,
              );
              canProceed = false;
              return;
            }

            if (!loan.bank_name) {
              Alert.alert('Validation', `Loan ${i + 1}: Please select bank`);
              canProceed = false;
              return;
            }

            if (
              loan.bank_name === 'OTHER' &&
              (!loan.other_bank_name || loan.other_bank_name.trim() === '')
            ) {
              Alert.alert(
                'Validation',
                `Loan ${i + 1}: Please enter bank name`,
              );
              canProceed = false;
              return;
            }

            if (!loan.branch_name || loan.branch_name.trim() === '') {
              Alert.alert(
                'Validation',
                `Loan ${i + 1}: Please enter branch name`,
              );
              canProceed = false;
              return;
            }

            if (
              isInvalidNumber(loan.loan_amount) ||
              Number(loan.loan_amount) <= 0
            ) {
              Alert.alert(
                'Validation',
                `Loan ${i + 1}: Enter valid loan amount (> 0)`,
              );
              canProceed = false;
              return;
            }

            const loanAmount = Number(loan.loan_amount);

            if (isInvalidNumber(loan.repaid_amount)) {
              Alert.alert('Validation', `Loan ${i + 1}: Enter repaid amount`);
              canProceed = false;
              return;
            }

            const repaidAmount = Number(loan.repaid_amount);

            if (repaidAmount < 0) {
              Alert.alert(
                'Validation',
                `Loan ${i + 1}: Repaid amount cannot be negative`,
              );
              canProceed = false;
              return;
            }

            if (repaidAmount > loanAmount) {
              Alert.alert(
                'Validation',
                `Loan ${i + 1}: Repaid amount cannot exceed loan amount`,
              );
              canProceed = false;
              return;
            }

            if (!loan.date_taken) {
              Alert.alert(
                'Validation',
                `Loan ${i + 1}: Please select loan date`,
              );
              canProceed = false;
              return;
            }

            const date = new Date(loan.date_taken);
            const today = new Date();

            if (isNaN(date.getTime())) {
              Alert.alert('Validation', `Loan ${i + 1}: Invalid date format`);
              canProceed = false;
              return;
            }

            if (date > today) {
              Alert.alert(
                'Validation',
                `Loan ${i + 1}: Future date not allowed`,
              );
              canProceed = false;
              return;
            }
          }
        }

        if (!existingForm.has_receieved_subsidy) {
          Alert.alert('Validation', 'Please select if you received subsidy');
          canProceed = false;
          return;
        }

        if (existingForm.has_receieved_subsidy === 'Yes') {
          if (!existingForm.subsidies || existingForm.subsidies.length === 0) {
            Alert.alert('Validation', 'Please add at least one subsidy');
            canProceed = false;
            return;
          }

          for (let i = 0; i < existingForm.subsidies.length; i++) {
            const sub = existingForm.subsidies[i];

            if (!sub.subsidy_name_tree || sub.subsidy_name_tree.length === 0) {
              Alert.alert(
                'Validation',
                `Subsidy ${i + 1}: Please select department/scheme`,
              );
              canProceed = false;
              return;
            }

            if (!sub.subsidy_detail || sub.subsidy_detail.trim() === '') {
              Alert.alert(
                'Validation',
                `Subsidy ${i + 1}: Please enter subsidy details`,
              );
              canProceed = false;
              return;
            }

            if (sub.subsidy_detail.trim().length < 3) {
              Alert.alert(
                'Validation',
                `Subsidy ${i + 1}: Please enter meaningful details`,
              );
              canProceed = false;
              return;
            }
          }
        }
      }

      if (currentSectionIndex === 5 && canProceed) {
        const isEmpty = val =>
          val === null ||
          val === undefined ||
          (typeof val === 'string' && val.trim() === '') ||
          (Array.isArray(val) && val.length === 0);

        if (!existingForm.is_training_received) {
          Alert.alert('Validation', 'Please select if training is received.');
          canProceed = false;
        }

        if (canProceed && existingForm.is_training_received === 'Yes') {
          const rows = existingForm.training_received_rows || [];

          if (rows.length === 0) {
            Alert.alert(
              'Validation',
              'Please add at least one training received.',
            );
            canProceed = false;
          } else {
            for (let i = 0; i < rows.length; i++) {
              const row = rows[i];

              if (isEmpty(row.department)) {
                Alert.alert(
                  'Validation',
                  `Training ${i + 1}: Please select department`,
                );
                canProceed = false;
                break;
              }

              if (
                row.department === 'Others' &&
                isEmpty(row.department_other)
              ) {
                Alert.alert(
                  'Validation',
                  `Training ${i + 1}: Please specify department`,
                );
                canProceed = false;
                break;
              }

              if (isEmpty(row.sector_tree)) {
                Alert.alert(
                  'Validation',
                  `Training ${i + 1}: Please select sector`,
                );
                canProceed = false;
                break;
              }

              if (
                row.sector_tree.includes('Others') &&
                isEmpty(row.other_sector_detail)
              ) {
                Alert.alert(
                  'Validation',
                  `Training ${i + 1}: Please specify other sector`,
                );
                canProceed = false;
                break;
              }
            }
          }
        }

        if (canProceed && !existingForm.is_training_required) {
          Alert.alert('Validation', 'Please select if training is required.');
          canProceed = false;
        }

        if (canProceed && existingForm.is_training_required === 'Yes') {
          const rows = existingForm.training_required_rows || [];

          if (rows.length === 0) {
            Alert.alert(
              'Validation',
              'Please add at least one training requirement.',
            );
            canProceed = false;
          } else {
            for (let i = 0; i < rows.length; i++) {
              const row = rows[i];

              if (isEmpty(row.sector_tree)) {
                Alert.alert(
                  'Validation',
                  `Requirement ${i + 1}: Please select sector`,
                );
                canProceed = false;
                break;
              }

              if (
                row.sector_tree.includes('Others') &&
                isEmpty(row.other_sector_detail)
              ) {
                Alert.alert(
                  'Validation',
                  `Requirement ${i + 1}: Please specify other sector`,
                );
                canProceed = false;
                break;
              }

              if (isEmpty(row.training_type)) {
                Alert.alert(
                  'Validation',
                  `Requirement ${i + 1}: Please select training type`,
                );
                canProceed = false;
                break;
              }

              if (isEmpty(row.duration)) {
                Alert.alert(
                  'Validation',
                  `Requirement ${i + 1}: Please select duration`,
                );
                canProceed = false;
                break;
              }

              if (isEmpty(row.department)) {
                Alert.alert(
                  'Validation',
                  `Requirement ${i + 1}: Please select department`,
                );
                canProceed = false;
                break;
              }

              if (
                row.department === 'Others' &&
                isEmpty(row.department_other)
              ) {
                Alert.alert(
                  'Validation',
                  `Requirement ${i + 1}: Please specify department`,
                );
                canProceed = false;
                break;
              }

              if (isEmpty(row.location)) {
                Alert.alert(
                  'Validation',
                  `Requirement ${i + 1}: Please select location type`,
                );
                canProceed = false;
                break;
              }

              if (isEmpty(row.expected_income)) {
                Alert.alert(
                  'Validation',
                  `Requirement ${i + 1}: Please select expected income`,
                );
                canProceed = false;
                break;
              }
            }
          }
        }

        if (canProceed && existingForm.is_training_required === 'No') {
          if (!existingForm.nearest_skill_centre) {
            Alert.alert(
              'Validation',
              'Please select knowledge about skill centre.',
            );
            canProceed = false;
          }

          if (
            canProceed &&
            existingForm.nearest_skill_centre === 'Yes' &&
            isEmpty(existingForm.skill_centre_loc)
          ) {
            Alert.alert('Validation', 'Please enter skill centre location.');
            canProceed = false;
          }

          if (canProceed && !existingForm.nearest_industry) {
            Alert.alert(
              'Validation',
              'Please select knowledge about industry.',
            );
            canProceed = false;
          }

          if (
            canProceed &&
            existingForm.nearest_industry === 'Yes' &&
            isEmpty(existingForm.industry_loc)
          ) {
            Alert.alert('Validation', 'Please enter industry location.');
            canProceed = false;
          }
        }

        if (canProceed && isEmpty(existingForm.expansion_plan)) {
          Alert.alert('Validation', 'Please enter future expansion plan.');
          canProceed = false;
        }

        if (canProceed && !existingForm.info_abt_gov_scheme) {
          Alert.alert(
            'Validation',
            'Please select info about government schemes.',
          );
          canProceed = false;
        }
      }

      if (currentSectionIndex === 6 && canProceed) {
        const isEmpty = val =>
          val === null ||
          val === undefined ||
          (typeof val === 'string' && val.trim() === '') ||
          (Array.isArray(val) && val.length === 0);

        if (!existingForm.is_support_required) {
          Alert.alert('Validation', 'Please select if support is required.');
          canProceed = false;
        }

        if (canProceed && existingForm.is_support_required === 'Yes') {
          const support = existingForm.support_required || {};

          if (Object.keys(support).length === 0) {
            Alert.alert(
              'Validation',
              'Please select at least one support type.',
            );
            canProceed = false;
          } else {
            if (support.financial) {
              const f = support.financial;

              if (isEmpty(f.type)) {
                Alert.alert(
                  'Validation',
                  'Financial: Please select support type.',
                );
                canProceed = false;
              }

              if (canProceed && f.type === 'Loan' && isEmpty(f.amount)) {
                Alert.alert(
                  'Validation',
                  'Financial: Please select loan amount.',
                );
                canProceed = false;
              }

              if (
                canProceed &&
                ['Others', 'Grant and Subsidy', 'Interest Subvention'].includes(
                  f.type,
                ) &&
                isEmpty(f.spec)
              ) {
                Alert.alert('Validation', 'Financial: Please specify details.');
                canProceed = false;
              }
            }

            if (canProceed && support.infrastructure) {
              const infra = support.infrastructure;

              if (isEmpty(infra.type)) {
                Alert.alert(
                  'Validation',
                  'Infrastructure: Please select type.',
                );
                canProceed = false;
              }

              if (
                canProceed &&
                infra.type === 'Others' &&
                isEmpty(infra.spec)
              ) {
                Alert.alert(
                  'Validation',
                  'Infrastructure: Please specify details.',
                );
                canProceed = false;
              }
            }

            if (canProceed && support.machinery !== undefined) {
              if (isEmpty(support.machinery)) {
                Alert.alert(
                  'Validation',
                  'Machinery: Please specify required machinery.',
                );
                canProceed = false;
              }
            }

            if (canProceed && support.other !== undefined) {
              if (isEmpty(support.other)) {
                Alert.alert(
                  'Validation',
                  'Other: Please specify support details.',
                );
                canProceed = false;
              }
            }
          }
        }
      }

      if (currentSectionIndex === 7 && canProceed) {
        const isEmptyArray = arr => !Array.isArray(arr) || arr.length === 0;

        const media = existingForm.media || {};

        if (!existingForm.media) {
          Alert.alert('Validation', 'Please upload required media files.');
          canProceed = false;
        }

        if (canProceed && isEmptyArray(media.photo_entrepreneur)) {
          Alert.alert('Validation', 'Please upload entrepreneur photo.');
          canProceed = false;
        }

        if (canProceed && isEmptyArray(media.photo_enterprise)) {
          Alert.alert('Validation', 'Please upload enterprise photo.');
          canProceed = false;
        }

        if (canProceed && isEmptyArray(media.others)) {
          Alert.alert('Validation', 'Please upload at least one document.');
          canProceed = false;
        }

        const MAX_FILES = 10;

        if (canProceed && media.photo_entrepreneur?.length > MAX_FILES) {
          Alert.alert('Validation', 'Too many entrepreneur photos uploaded.');
          canProceed = false;
        }

        if (canProceed && media.photo_enterprise?.length > MAX_FILES) {
          Alert.alert('Validation', 'Too many enterprise photos uploaded.');
          canProceed = false;
        }
      }

      if (currentSectionIndex === 8 && canProceed) {
        const isEmpty = val =>
          val === null ||
          val === undefined ||
          (typeof val === 'string' && val.trim() === '');

        const media = existingForm.media || {};

        if (!existingForm.declaration_confirmed) {
          Alert.alert('Validation', 'Please confirm declaration.');
          canProceed = false;
        }

        if (canProceed && existingForm.declaration_confirmed !== 'Yes') {
          Alert.alert('Validation', 'Please accept declaration to proceed.');
          canProceed = false;
        }

        if (canProceed && isEmpty(existingForm.declaration_date)) {
          Alert.alert('Validation', 'Please select declaration date.');
          canProceed = false;
        }

        if (canProceed && existingForm.declaration_date) {
          const date = new Date(existingForm.declaration_date);
          const today = new Date();

          if (isNaN(date.getTime())) {
            Alert.alert('Validation', 'Invalid declaration date.');
            canProceed = false;
          }

          if (canProceed && date > today) {
            Alert.alert('Validation', 'Future date is not allowed.');
            canProceed = false;
          }

          if (canProceed && date.getFullYear() < 1950) {
            Alert.alert('Validation', 'Please select a valid date.');
            canProceed = false;
          }
        }

        const signatureFiles =
          media.declaration_signature ||
          existingForm.declaration_signature_files ||
          [];

        if (
          canProceed &&
          (!Array.isArray(signatureFiles) || signatureFiles.length === 0)
        ) {
          Alert.alert('Validation', 'Please upload signature.');
          canProceed = false;
        }

        if (canProceed) {
          const valid = signatureFiles.every(file =>
            (file.type || '').includes('image'),
          );
          if (!valid) {
            Alert.alert('Validation', 'Only image signatures allowed.');
            canProceed = false;
          }
        }

        if (
          canProceed &&
          existingForm.verifier_name &&
          existingForm.verifier_name.trim().length < 3
        ) {
          Alert.alert(
            'Validation',
            'Verifier name must be at least 3 characters.',
          );
          canProceed = false;
        }
      }

      if (!canProceed) {
        console.log('⛔ BLOCKED - validation failed');
        return;
      }

      console.log('✅ PASSED - moving next');

      setCurrentSectionIndex(prev =>
        prev < TOTAL_SECTIONS - 1 ? prev + 1 : prev,
      );
    };

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[
            styles.navBtn,
            (currentSectionIndex === 0 || submitting) && styles.navBtnDisabled,
          ]}
          disabled={currentSectionIndex === 0 || submitting}
          onPress={() =>
            setCurrentSectionIndex(prev => (prev > 0 ? prev - 1 : prev))
          }
        >
          <Text style={styles.navBtnText}>
            {language === 'hi' ? 'पिछला' : 'Previous'}
          </Text>
        </TouchableOpacity>

        {currentSectionIndex < TOTAL_SECTIONS - 1 && (
          <TouchableOpacity
            style={[
              styles.navBtn,
              styles.navBtnPrimary,
              submitting && { opacity: 0.7 },
            ]}
            disabled={submitting}
            onPress={handleNext}
          >
            <Text style={[styles.navBtnText, styles.navBtnPrimaryText]}>
              {language === 'hi' ? 'आगे' : 'Next'}
            </Text>
          </TouchableOpacity>
        )}

        {currentSectionIndex === TOTAL_SECTIONS - 1 && (
          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
            disabled={submitting}
            onPress={handleSubmit}
          >
            {submitting ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator color="#fff" />
                <Text style={[styles.submitBtnText, { marginLeft: 8 }]}>
                  {language === 'hi' ? 'जमा हो रहा है...' : 'Submitting...'}
                </Text>
              </View>
            ) : (
              <Text style={styles.submitBtnText}>
                {language === 'hi' ? 'फॉर्म जमा करें' : 'Submit Form'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.sectionWrapper}>
        <View
          style={
            currentSectionIndex === 0
              ? styles.sectionVisible
              : styles.sectionHidden
          }
        >
          <ExistingEnterpriseBasicInfoSection
            existingForm={existingForm}
            setExistingForm={updateForm}
          />
        </View>

        <View
          style={
            currentSectionIndex === 1
              ? styles.sectionVisible
              : styles.sectionHidden
          }
        >
          <ExistingEnterpriseEnterpriseDetailsSection
            existingForm={existingForm}
            setExistingForm={updateForm}
          />
        </View>
        <View
          style={
            currentSectionIndex === 2
              ? styles.sectionVisible
              : styles.sectionHidden
          }
        >
          <ShopBasedProductSection
            row={existingForm}
            index={0}
            updateRow={(i, patch) => updateForm(patch)}
            language={language}
            addProductRow={() => { }}
            ProductAndServicesComponent={
              ExistingEnterpriseProductServicesSection
            }
          />
        </View>
        <View
          style={
            currentSectionIndex === 3
              ? styles.sectionVisible
              : styles.sectionHidden
          }
        >
          <ExistingEnterpriseInvestmentSection
            existingForm={existingForm}
            setExistingForm={updateForm}
          />
        </View>

        <View
          style={
            currentSectionIndex === 4
              ? styles.sectionVisible
              : styles.sectionHidden
          }
        >
          <ExistingEnterpriseLoanSubsidySection
            existingForm={existingForm}
            setExistingForm={updateForm}
          />
        </View>

        <View
          style={
            currentSectionIndex === 5
              ? styles.sectionVisible
              : styles.sectionHidden
          }
        >
          <ExistingEnterpriseTrainingSkillsSection
            existingForm={existingForm}
            setExistingForm={updateForm}
          />
        </View>

        <View
          style={
            currentSectionIndex === 6
              ? styles.sectionVisible
              : styles.sectionHidden
          }
        >
          <ExistingEnterpriseSupportSection
            existingForm={existingForm}
            setExistingForm={updateForm}
          />
        </View>

        <View
          style={
            currentSectionIndex === 7
              ? styles.sectionVisible
              : styles.sectionHidden
          }
        >
          <ExistingEnterpriseMediaSection
            existingForm={existingForm}
            setExistingForm={updateForm}
          />
        </View>

        <View
          style={
            currentSectionIndex === 8
              ? styles.sectionVisible
              : styles.sectionHidden
          }
        >
          <ExistingEnterpriseDeclarationSection
            existingForm={existingForm}
            setExistingForm={updateForm}
          />
        </View>
      </View>
      <PaginationButtons
        currentSectionIndex={currentSectionIndex}
        TOTAL_SECTIONS={TOTAL_SECTIONS}
        submitting={submitting}
        setCurrentSectionIndex={setCurrentSectionIndex}
        handleSubmit={handleSubmit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    backgroundColor: '#fff',
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 16,
  },
  sectionWrapper: {
    flex: 1,
  },
  sectionVisible: {},
  sectionHidden: {
    display: 'none',
  },
  paginationContainer: {
    marginTop: 24,
    marginBottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    alignItems: 'center',
  },
  navBtnDisabled: {
    opacity: 0.5,
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  navBtnPrimary: {
    backgroundColor: '#EE6969',
    borderColor: '#EE6969',
    marginRight: 0,
    marginLeft: 8,
  },
  navBtnPrimaryText: {
    color: '#fff',
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#EE6969',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
