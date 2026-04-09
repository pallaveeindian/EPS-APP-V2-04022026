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
// ---- helpers (same style as NewEnterpriseForm) ----

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
  const lokos_shg_code = shg.code ?? shg.shg_code ?? shg.lokos_shg_code ?? null;
  return { district_id, block_id, panchayat_id, village_id, lokos_shg_code };
}

export default function ExistingEnterpriseForm({ route, navigation }) {
  const recordedBenef = route?.params?.recordedBenef || null;
  const existingEnterprise = route?.params?.existing;
  const { language } = useContext(LanguageContext);

  // extra params from CRPRecordFlowProduction (same as NewEnterpriseForm)
  const beneficiary = route?.params?.beneficiary || null;
  const memberCode = beneficiary?.member_code || beneficiary?.nic_member_code;
  const beneficiaryName = beneficiary?.member_name || 'Unknown Beneficiary';
  const tempShg = route?.params?.tempShg || null;
  const routeCrpUserId =
    route?.params?.crpUserId ||
    route?.params?.user_id ||
    route?.params?.username ||
    null;

  const lokosShgCode =
    route?.params?.lokos_shg_code ||
    route?.params?.lokosShgCode ||
    tempShg?.code ||
    tempShg?.shg_code ||
    null;

  // --- master form state (single source of truth) ---
  const [existingForm, setExistingForm] = useState({
    // BASIC
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
    // enterprise-type (collected in child table)
    enterprise_types_tree: [], // [{ parent, children: [] }]

    // PRODUCT + SERVICES (child table + some main fields)
    products: [], // [{ main_product_name, activity_or_product_type, ... }]

    // ENTERPRISE DETAILS
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

    // INVESTMENT
    monthly_income_estimate: '',
    annual_turnover: '',
    gross_profit: '',
    working_capital_monthly: '',
    has_shg_cif: '',
    cif_fund_amt: '',
    initial_investment: '',
    source_of_investment_tree: [], // [{ parent, children: [] }]

    // LOAN / SUBSIDY SECTION (child tables)
    has_taken_loan: '',
    loans: [], // [{ institution_tree, loan_amount, date_taken, repayment_status }]
    has_receieved_subsidy: '',
    subsidies: [], // [{ subsidy_type, subsidy_name_tree, subsidy_detail }]

    // TRAINING RECEIVED / REQUIRED (child table)
    is_training_received: '',
    training_received_rows: [], // [{ department, sector_tree, duration, location, expected_income }]
    is_training_required: '',
    training_required_rows: [], // same structure as above
    nearest_skill_centre: '',
    skill_centre_loc: '',
    nearest_industry: '',
    industry_loc: '',

    // SUPPORT REQUIRED
    // SHOP BASED PRODUCTS
    has_shop_product: '',
    shop_type: '',
    shop_type_other: '',
    inventory_source: '',
    target_customers: '',
    target_customers_other: '',
    sales_area: '',
    marketing_strategy: '',
    marketing_strategy_other: '',
    accept_digital_payment: '',
    avg_monthly_sales: '',
    annual_sale: '',

    // other_support: '',
    // other_support_specify: '',
    // other_support_loan_amount: '',
    // mentorship_support: '',
    // is_promo_ad_req: '',
    // promo_ad_specify: '',
    // infrastructure_support: '',
    // infrastructure_support_specify: '',
    // digital_emarket_support: '',
    // machinery_equipment_support: '',

    // MEDIA (child table)
    media: {
      photo_entrepreneur: [],
      photo_enterprise: [],
      declaration_signature: [],
      // these 3 are per-product handled via products[*].media
    },

    // DECLARATION
    declaration_confirmed: '',
    declaration_date: '',
  });

  const [loadingUser, setLoadingUser] = useState(true);
  const [loggedUser, setLoggedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // NEW: pagination state (one section per "page")
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const TOTAL_SECTIONS = 9; // total number of sections in this form

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
        formData: state, // This is 'state' (existingForm)
        sectionIndex: index,
        beneficiary: beneficiary, // Store this to help the dashboard identify the name
        lastSaved: new Date().toISOString(),
      });

      // !!! MUST MATCH Dashboard Prefix !!!
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

  // 1. Load Draft on Mount
  useEffect(() => {
    checkAndLoadDraft();
  }, [memberCode]);

  // 2. Auto-save whenever form or section changes
  useEffect(() => {
    if (isDraftLoaded) {
      saveProgress(existingForm, currentSectionIndex);
    }
  }, [existingForm, currentSectionIndex]);

  // Load logged user + set auth token
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

  // If editing, prefill some fields from existingEnterprise
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

  // ---- Recorded beneficiary helpers (taken from NewEnterpriseForm logic) ----

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
        const found = cached.find(s => {
          const code = s.code ?? s.shg_code ?? s.lokos_shg_code ?? s.code;
          return String(code) === String(shgCode);
        });
        if (found) return extractLocationFromShg(found);
      }
      return null;
    } catch (e) {
      console.warn('findShgAcrossCachedPanchayats error', e);
      return null;
    }
  };

  const ensureRecordedBeneficiary = async () => {
    // 1. already present via route / existing enterprise
    let recordedBenefId =
      recordedBenef?.id || existingEnterprise?.recorded_beneficiary || null;

    if (recordedBenefId) return recordedBenefId;

    // 2. need beneficiary info to create
    if (!beneficiary) {
      throw new Error(
        'Beneficiary data is missing. Please open this form again from SHG member list.',
      );
    }

    const addr =
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
      (addr?.address_line1 && String(addr.address_line1).trim()) ||
      (addr?.address_line2 && String(addr.address_line2).trim()) ||
      '';

    const age = computeAgeFromDob(beneficiary.dob);

    let district_id = addr?.district_id ?? addr?.districtId ?? null;
    let block_id = addr?.block_id ?? addr?.blockId ?? null;
    let panchayat_id = addr?.panchayat_id ?? addr?.panchayatId ?? null;
    let village_id = addr?.village_id ?? addr?.villageId ?? null;
    let member_mobile =
      phone?.phone_no ?? phone?.mobile ?? phone?.number ?? null;
    let marital_status =
      beneficiary.marital_status ?? beneficiary.maritalStatus ?? '';
    let father_husband_name =
      beneficiary.father_husband ??
      beneficiary.father_husband_name ??
      beneficiary.relation_name ??
      '';

    let lokos_shg =
      lokosShgCode ||
      beneficiary.shg_code ||
      beneficiary.lokos_shg_code ||
      null;

    // fallback from tempShg
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

    // cached SHG lists fallback
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

    // last resort: on-demand fetch from CRP block
    if (
      (!district_id || !block_id || !panchayat_id || !village_id) &&
      lokos_shg
    ) {
      try {
        const crpDetail = getCrpDetail ? getCrpDetail() : null;
        const cbid = crpDetail?.block_id ?? crpDetail?.blockId ?? null;
        if (cbid) {
          const shgRes = await gsApi.getUpsrlmShgList(cbid, {
            page_size: 5000,
          });
          const shgRows = Array.isArray(shgRes?.data)
            ? shgRes.data
            : Array.isArray(shgRes?.results)
            ? shgRes.results
            : Array.isArray(shgRes)
            ? shgRes
            : [];
          const found = shgRows.find(s => {
            const code = s.code ?? s.shg_code ?? s.lokos_shg_code ?? s.code;
            return String(code) === String(lokos_shg);
          });
          if (found) {
            const loc = extractLocationFromShg(found);
            district_id = district_id || loc.district_id || null;
            block_id = block_id || loc.block_id || null;
            panchayat_id = panchayat_id || loc.panchayat_id || null;
            village_id = village_id || loc.village_id || null;
            lokos_shg = lokos_shg || loc.lokos_shg_code || null;
          }
        }
      } catch (e) {
        console.warn('on-demand SHG list fallback failed', e);
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

    if (createdBy !== null) {
      recordedPayload.created_by = createdBy;
    }

    const recRes = await gsApi.createRecordedBeneficiary(recordedPayload);
    recordedBenefId = recRes?.id || null;

    if (!recordedBenefId) {
      throw new Error(
        'Recorded beneficiary created but ID missing in response.',
      );
    }

    return recordedBenefId;
  };

  // Helpers to strip out child tables from main payload.
  const buildMainPayload = recordedBenefId => {
    const {
      enterprise_types_tree,
      products,
      source_of_investment_tree,
      loans,
      subsidies,
      training_received_rows,
      training_required_rows,
      media,
      licenses,
      owner_designation,
      owner_cadre,
      ...rest
    } = existingForm;

    const createdBy = getCreatedByNumeric();

    const sourceOfInvestmentString = (source_of_investment_tree || [])
      .filter(
        row =>
          row.parent && Array.isArray(row.children) && row.children.length > 0,
      )
      .map(row => `${row.parent}: ${row.children.join(', ')}`)
      .join(' | ');

    const payload = {
      ...rest,
      source_of_investment: sourceOfInvestmentString,

      recorded_benef_id:
        recordedBenefId && !isNaN(recordedBenefId)
          ? parseInt(recordedBenefId, 10)
          : null,

      owner_designation: Array.isArray(owner_designation)
        ? owner_designation.join(', ')
        : owner_designation || '',

      owner_cadre: Array.isArray(owner_cadre)
        ? owner_cadre.join(', ')
        : owner_cadre || '',

      created_by: createdBy,
    };

    return {
      payload,
      enterpriseTypesTree: Array.isArray(enterprise_types_tree)
        ? enterprise_types_tree
        : [],
      products: Array.isArray(products) ? products : [],
      sourceOfInvestmentTree: Array.isArray(source_of_investment_tree)
        ? source_of_investment_tree
        : [],
      loans: Array.isArray(loans) ? loans : [],
      subsidies: Array.isArray(subsidies) ? subsidies : [],
      trainingReceivedRows: Array.isArray(training_received_rows)
        ? training_received_rows
        : [],
      trainingRequiredRows: Array.isArray(training_required_rows)
        ? training_required_rows
        : [],
      media: media || {},
    };
  };
  // ============ CHILD TABLE SAVERS (ALL USING TH_urid IN enterprise_id) ============

  // 1) Enterprise type sub-table
  const saveEnterpriseTypes = async (enterpriseId, tree) => {
    if (!enterpriseId || !Array.isArray(tree)) return;
    const createdBy = getCreatedByNumeric();
    for (const row of tree) {
      if (
        !row.parent ||
        !Array.isArray(row.children) ||
        row.children.length === 0
      )
        continue;

      const parentName = row.parent?.en || '';

      const childNames = (row.children || [])
        .map(child => {
          // If "Others" selected and user typed custom text
          if (
            child.en === 'Others' &&
            row.childOtherText &&
            row.childOtherText[child.en]
          ) {
            return `${child.en} (${row.childOtherText[child.en]})`;
          }
          return child.en;
        })
        .join(', ');

      const mapped = `[${parentName}: ${childNames}]`;

      await gsApi.createEnterpriseType({
        //  enterprise_id uses TH_urid of ExistingEnterpriseForm
        enterprise_id: enterpriseId,
        form_type: 'exep',
        // parent_category: row.parent,
        parent_category: String(row.parent.en),
        // parent_category: String(parentName),
        sub_category: mapped,
        created_by: createdBy,
      });
    }
  };

  const saveLicenses = async (enterpriseId, licenses) => {
    if (!enterpriseId || !Array.isArray(licenses) || licenses.length === 0) {
      console.log('Skipping Licenses: No enterpriseId or licenses provided.');
      return;
    }

    //  FormData requires strings for text fields
    const strEnterpriseId = String(enterpriseId);

    console.log(
      '>>> STARTING LICENSE UPLOAD FOR ENTERPRISE ID:',
      strEnterpriseId,
    );

    for (const lic of licenses) {
      const formData = new FormData();
      const EcreatedBy = getCreatedByNumeric();
      // append as strings
      formData.append('enterprise_id', strEnterpriseId);
      formData.append('form_type', 'exep');
      formData.append('license_category', String(lic.license_category || ''));
      formData.append('license_name', String(lic.license_name || ''));
      formData.append('license_no', String(lic.license_no || ''));
      formData.append('is_active', 'true');
      if (EcreatedBy) {
        formData.append('created_by', String(EcreatedBy));
      }

      if (lic.file && lic.file.uri) {
        formData.append('license_file', {
          uri: lic.file.uri,
          name: lic.file.name || 'license.pdf',
          type: lic.file.type || 'application/pdf',
        });
        console.log(`- Attaching File: ${lic.file.name}`);
      }

      console.log(`- Submitting License: ${lic.license_name}`);

      try {
        // The gsApi.createEnterpriseLicense  uses requestMultipart
        const res = await gsApi.createEnterpriseLicense(formData);

        console.log('✅ SUCCESS RESPONSE FROM SERVER:', res);

        if (res.enterprise_id === null) {
          console.warn(
            '⚠️ Warning: Server created the row but enterprise_id is still null. Check backend field names.',
          );
        }
      } catch (e) {
        console.error('❌ License Saved Error:', e);
      }
    }
    console.log('>>> LICENSE UPLOAD PROCESS COMPLETE');
  };

  // 1) Shop Based Enterprise Saver
  const saveEnterpriseShop = async (enterpriseId, form) => {
    if (!enterpriseId || form.has_shop_product !== 'Yes') return;

    const EcreatedBy = getCreatedByNumeric();
    console.log('>>> SAVING SHOP DATA FOR ENTERPRISE:', enterpriseId);

    // 1️ Map Frontend State to Backend DB Keys
    const shopPayload = {
      enterprise_id: enterpriseId,
      shop_type: form.shop_type || '',
      shop_category: form.shop_sub_category || '',
      shop_sub_category_other: form.shop_sub_category_other || '',
      source_of_inventory: form.inventory_source || '',
      target_customers: form.target_customers || '',
      sales_area: form.sales_area || '',
      marketing_strategy: form.marketing_strategy || '',

      // These 3 were null in your logs, mapping them now:
      marketing_channels: form.marketing_channels || '',
      marketing_challenges: form.marketing_challenges || '',

      // market_linkage: form.market_linkage || '',

      accept_digital_payment: form.accept_digital_payment === 'Yes',
      avg_monthly_sales: form.avg_monthly_sales || '0.00',
      avg_annual_sales: form.annual_sale || '0.00',

      is_active: true,
      created_by: EcreatedBy,
    };

    const shopRes = await gsApi.createEnterpriseShop(shopPayload);
    const shopRowId = shopRes?.id;

    if (!shopRowId) {
      console.error(' Shop Row failed to create.');
      return;
    }

    console.log(' Shop Row Saved. ID:', shopRowId);

    // 2️ Upload Shop Media (Mapping photos to backend keys)
    const uploadShopMedia = async (backendKey, assets) => {
      if (!Array.isArray(assets) || assets.length === 0) return;

      for (const asset of assets) {
        const fd = new FormData();
        // Link to the Shop ID (product_id in your media table)
        fd.append('product_id', String(shopRowId));
        fd.append('is_active', '1');
        if (EcreatedBy) fd.append('created_by', String(EcreatedBy));

        // Use the backend keys: 'front_photo' and 'inside_photo'
        fd.append(backendKey, {
          uri: asset.uri,
          name: asset.fileName || 'shop_img.jpg',
          type: asset.type || 'image/jpeg',
        });

        try {
          await gsApi.uploadShopMedia(fd);
          console.log(`   - Success: ${backendKey} uploaded`);
        } catch (e) {
          console.error(`   - Error uploading ${backendKey}:`, e);
        }
      }
    };

    // Mapping: Frontend 'shop_front' -> Backend 'front_photo'
    if (form.media?.shop_front) {
      await uploadShopMedia('front_photo', form.media.shop_front);
    }
    // Mapping: Frontend 'shop_inside' -> Backend 'inside_photo'
    if (form.media?.shop_inside) {
      await uploadShopMedia('inside_photo', form.media.shop_inside);
    }
  };

  const saveProductsAndMedia = async (enterpriseId, products) => {
    if (!enterpriseId || !Array.isArray(products) || products.length === 0)
      return;

    const ProdcreatedBy = getCreatedByNumeric();
    const updatedProductsList = [...products];

    for (let i = 0; i < updatedProductsList.length; i++) {
      const product = updatedProductsList[i];

      // 1. Prepare Payload
      const payload = {
        enterprise_id: enterpriseId,
        main_product_name: product.main_product_name || '',
        activity_or_product_type: product.activity_or_product_type || '',
        product_features: product.product_features || '',
        production_capacity: product.production_capacity || '',
        raw_material: product.raw_material || '',
        raw_material_source: product.material_source || '',
        machinery_equipment: product.machinery_equipment || '',
        source_machinery: product.machinery_source || '',
        product_mrp: product.product_price || '',
        sales_area: product.sales_area || '',
        target_customers: product.target_customers || '',
        packaging_branding_status: product.packaging_branding_status || '',
        marketing_strategy: product.marketing_strategy || '',
        marketing_channels: product.marketing_channels || '',
        marketing_challenges: product.marketing_challenges || '',
        accept_digital_payment: product.accept_digital_payment === 'Yes',
        avg_monthly_sales: product.avg_monthly_sales || '0.00',
        avg_annual_sales: product.avg_annual_sales || '0.00',
        is_active: true,
        created_by: ProdcreatedBy,
      };

      let productPkId = null;

      // 2. CREATE PRODUCT TEXT RECORD (This was missing!)
      try {
        const res = await gsApi.createEnterpriseProduct(payload);
        if (res && res.id) {
          productPkId = res.id;
          console.log(
            ` Product Created: ${product.main_product_name} (ID: ${productPkId})`,
          );
        } else {
          console.warn(
            'Server returned success but no ID for product:',
            product.main_product_name,
          );
        }
      } catch (e) {
        console.error(
          'Failed to create product record:',
          e.response?.data || e.message,
        );
        continue;
      }

      // 3. Upload Media linked to the Product ID
      try {
        if (productPkId && product?.media) {
          const createMediaRows = async (mediaKey, mediaArray = []) => {
            if (!Array.isArray(mediaArray) || mediaArray.length === 0) return;

            for (const asset of mediaArray) {
              if (!asset?.uri) continue;
              if (asset.uri.startsWith('http')) continue;

              const formData = new FormData();
              formData.append('product_id', String(productPkId));
              formData.append('is_active', 'true');
              if (ProdcreatedBy) {
                formData.append('created_by', String(ProdcreatedBy));
              }

              formData.append(mediaKey, {
                uri: asset.uri,
                name: asset.fileName || `product_${Date.now()}.jpg`,
                type: asset.type || 'image/jpeg',
              });

              try {
                const response = await gsApi.uploadProductMedia(formData);
                console.log(`   - Uploaded ${mediaKey}`);
              } catch (uploadErr) {
                console.error(
                  `   - Upload failed for ${mediaKey}:`,
                  uploadErr?.message,
                );
              }
            }
          };

          await createMediaRows('open_box_photo', product.media?.open_box);
          await createMediaRows('close_box_photo', product.media?.close_box);
          await createMediaRows('others', product.media?.others);
        }
      } catch (e) {
        console.error('Product Media Error:', e?.message);
      }
    }

    updateForm({ products: updatedProductsList });
  };

  // 11) Loan Details Saver (Links to Numeric Enterprise ID)
  const saveLoans = async (enterpriseId, loans) => {
    if (!enterpriseId || !Array.isArray(loans) || loans.length === 0) return;

    const LoanscreatedBy = getCreatedByNumeric();

    for (const loan of loans) {
      // Construct Payload using keys already set in the state
      const payload = {
        enterprise_id: enterpriseId,
        form_type: 'existing',
        department: loan.department || '',
        institution_name: loan.institution_name || '',
        bank_name:
          loan.bank_name === 'OTHER' ? loan.other_bank_name : loan.bank_name,
        bank_branch: loan.branch_name || '',
        loan_amount: String(loan.loan_amount || '0'),
        repaid_amount: String(loan.repaid_amount || '0'),
        date_taken: loan.date_taken || null,
        repayment_status:
          parseFloat(loan.repaid_amount) >= parseFloat(loan.loan_amount)
            ? 'PAID'
            : 'PARTIALLY PAID',
        is_active: true,
        created_by: LoanscreatedBy,
      };

      await gsApi.createEnterpriseLoanDetail(payload);
    }
  };
  // 5) Subsidy / support details sub-table
  const saveSubsidies = async (enterpriseId, subsidies) => {
    if (!enterpriseId || !Array.isArray(subsidies) || subsidies.length === 0)
      return;

    const SubsidycreatedBy = getCreatedByNumeric();
    const updatedSubsidies = [...subsidies];

    for (let i = 0; i < updatedSubsidies.length; i++) {
      const sub = updatedSubsidies[i];

      // 2. Transform the UI Tree into strings for the Database
      let subsidyTypeText = ''; // Will store Parents (Departments)
      let subsidyNameText = ''; // Will store Children (Schemes)

      if (
        Array.isArray(sub.subsidy_name_tree) &&
        sub.subsidy_name_tree.length > 0
      ) {
        // Map Parents -> "MSME Department, Agriculture Department"
        subsidyTypeText = sub.subsidy_name_tree
          .map(item => item.parent)
          .join(', ');

        // Map Children -> "ODOP, CM Yuva Scheme | Kamdhenu Dairy"
        subsidyNameText = sub.subsidy_name_tree
          .map(item => {
            let childList =
              item.children && item.children.length > 0
                ? item.children.join(', ')
                : 'General Support';

            // If 'Others' was selected and a custom value typed
            if (item.others_specify) {
              childList = `${childList} (${item.others_specify})`;
            }
            return childList;
          })
          .join(' | ');
      }

      // 3. Prepare Payload matching your Django Model
      const payload = {
        enterprise_id: enterpriseId,
        subsidy_type: subsidyTypeText || 'Other',
        subsidy_name: subsidyNameText || 'N/A',
        subsidy_detail: sub.subsidy_detail || '',
        created_by: SubsidycreatedBy,
      };

      try {
        if (sub.id && typeof sub.id === 'number') {
          // UPDATE existing record
          await gsApi.updateEnterpriseSubsidyDetail(sub.id, payload);
          console.log(`Updated Subsidy: ${sub.id}`);
        } else {
          // CREATE new record
          const res = await gsApi.createEnterpriseSubsidyDetail(payload);
          // Store the new ID back into state to avoid duplicates on next click
          updatedSubsidies[i].id = res.id;
          console.log(`Created Subsidy: ${res.id}`);
        }
      } catch (e) {
        console.error('Subsidy Save Error:', e.response?.data || e.message);
      }
    }

    // Sync state so the 'id' fields are preserved
    updateForm({ subsidies: updatedSubsidies });
  };

  // 7) Standalone enterprise media + declaration signature
  const saveStandaloneMedia = async (enterpriseId, media) => {
    if (!enterpriseId || !media) return;

    const EcreatedBy = getCreatedByNumeric();

    /**
     * Helper to perform the actual upload
     * @param {string} backendFieldName - Matches Django model field
     * @param {Array} assets - Array of image assets from picker
     */
    const upload = async (backendFieldName, assets) => {
      if (!Array.isArray(assets) || assets.length === 0) return;

      for (const asset of assets) {
        // Avoid re-uploading if it's already a URL (editing mode)
        if (!asset?.uri || asset.uri.startsWith('http')) continue;

        const formData = new FormData();

        // 1. Link to the Numeric Enterprise ID
        formData.append('enterprise_id', String(enterpriseId));

        // 2. Set the correct field name based on your Django model
        formData.append(backendFieldName, {
          uri: asset.uri,
          name: asset.fileName || `${backendFieldName}.jpg`,
          type: asset.type || 'image/jpeg',
        });

        // 3. Optional metadata
        formData.append('is_active', 'true');
        if (EcreatedBy) {
          formData.append('created_by', String(EcreatedBy));
        }

        try {
          await gsApi.uploadEnterpriseMedia(formData);
          console.log(`✅ Uploaded to field: ${backendFieldName}`);
        } catch (e) {
          console.error(
            `❌ Media Upload Error (${backendFieldName}):`,
            e.response?.data || e.message,
          );
        }
      }
    };

    // --- MAPPING UI STATE TO BACKEND FIELDS ---

    // 1. Entrepreneur Photos
    await upload('photo_entrepreneur', media.photo_entrepreneur || []);

    // 2. Enterprise Shop/Workplace Photos
    await upload('photo_enterprise', media.photo_enterprise || []);
    await upload('others', media.others || []);
    // 3. Declaration Signature (Mapped to 'others' field in your model)
    await upload('others', media.declaration_signature || []);
  };

  const saveMandatoryFunds = async (enterpriseTHurid, fundCards) => {
    const ShgcreatedBy = getCreatedByNumeric();
    if (
      !enterpriseTHurid ||
      !Array.isArray(fundCards) ||
      fundCards.length === 0
    )
      return;

    for (const card of fundCards) {
      const received = parseFloat(card.amount_received || 0);
      const repaid = parseFloat(card.amount_repaid || 0);
      let status = 'NOT PAID';
      if (repaid > 0) status = repaid >= received ? 'PAID' : 'PARTIALLY PAID';

      const payload = {
        enterprise_id: enterpriseTHurid, // FK to TH_urid
        form_type: 'exep',
        fund_type:
          card.loanType === 'Other' ? card.otherLoanTypeText : card.loanType,
        have_received_part: card.has_received === 'Yes', // Maps to Boolean
        amount_received: String(card.amount_received || '0'),
        amount_repaid: String(card.amount_repaid || '0'),
        repayment_status: status,
        created_by: ShgcreatedBy,
      };

      try {
        await gsApi.createEnterpriseMandatoryFund(payload);
        console.log(` Fund saved: ${payload.fund_type}`);
      } catch (e) {
        console.error(' Fund Save Error:', e);
      }
    }
  };
  // 10) Enterprise Support Saver (Shared Table: epSakhi_epSupport)
  const saveEnterpriseSupport = async (enterpriseTHurid, supportData) => {
    // If user said 'No' to support or didn't check boxes, skip
    if (
      !enterpriseTHurid ||
      !supportData ||
      Object.keys(supportData).length === 0
    ) {
      console.log('No support categories selected to save.');
      return;
    }

    const InvestcreatedBy = getCreatedByNumeric();
    const mainStatus = existingForm.is_support_required || 'Yes';

    // We loop through the keys: 'financial', 'infrastructure', 'machinery', 'other'
    for (const cat of Object.keys(supportData)) {
      const item = supportData[cat];

      let payload = {
        enterprise_id: enterpriseTHurid, // Links via TH_urid string
        form_type: 'exep',
        is_active: true,
        created_by: InvestcreatedBy ? parseInt(InvestcreatedBy, 10) : null,
      };

      // --- MAPPING LOGIC (Matching your console structure) ---

      if (cat === 'financial') {
        payload.support_category = 'Financial';
        payload.support_sub_category = item.type; // e.g., 'Loan'
        payload.support_description =
          item.type === 'Loan' ? item.amount : item.spec;
      } else if (cat === 'infrastructure') {
        payload.support_category = 'Infrastructure';
        payload.support_sub_category = item.type;
        payload.support_description = item.spec;
      } else if (cat === 'machinery') {
        // Match the console "Direct Entry" logic
        payload.support_category = 'Machinery';
        payload.support_sub_category = 'Direct Entry';
        payload.support_description = item;
      } else if (cat === 'other') {
        // Match the console "Direct Entry" logic
        payload.support_category = 'Other';
        payload.support_sub_category = 'Direct Entry';
        payload.support_description = item;
        payload.other_support = item;
      }

      try {
        // Call API for each category selected
        const res = await gsApi.createEnterpriseSupport(payload);
        console.log(
          ` Stored Support Row: ${payload.support_category} (Status: ${mainStatus})`,
        );
      } catch (e) {
        console.error(` Support Save Error for ${cat}:`, e);
      }
    }
  };

  const saveTrainingReqs = async (enterpriseTHurid, rows, formType) => {
    if (!enterpriseTHurid || !Array.isArray(rows) || rows.length === 0) return;
    const EcreatedBy = getCreatedByNumeric();
    console.log(
      `>>> SAVING TRAINING ${formType.toUpperCase()} FOR:`,
      enterpriseTHurid,
    );

    for (const r of rows) {
      // 1. Prepare Main Training Data
      // Map the tree structure to simple strings for the database
      const sectorType = r.sector_tree?.[0]?.parent || '';
      const sectorNames = r.sector_tree?.[0]?.children?.join(', ') || '';

      const trainingPayload = {
        enterprise_id: enterpriseTHurid, // TH_urid string
        form_type: formType, // 'rec' or 'req'
        sector_type: sectorType,
        sector: sectorNames,
        department: r.department || '',
        training_type: r.training_type || '',
        duration: r.duration || '',
        location: r.location || '',
        expected_income: String(r.expected_income || '0'),
        created_by: EcreatedBy,
      };

      try {
        // Step A: Create the Training Entry
        const trRes = await gsApi.createEnterpriseTrainingReq(trainingPayload);

        // Step B: Get the PK (ID) of the newly created training row
        const trainingId = trRes?.id;

        if (
          trainingId &&
          formType === 'rec' &&
          Array.isArray(r.certificates_files)
        ) {
          console.log(
            `   - Training saved (ID: ${trainingId}). Uploading ${r.certificates_files.length} certificates...`,
          );

          // Step C: Upload each certificate to the certificates table
          for (const asset of r.certificates_files) {
            if (!asset?.uri) continue;

            const fd = new FormData();
            fd.append('enterprise_id', enterpriseTHurid); // TH_urid
            fd.append('training_id', String(trainingId)); // FK to training row PK
            fd.append('is_active', 'true');
            fd.append('certificates', {
              uri: asset.uri,
              name: asset.fileName || 'certificate.jpg',
              type: asset.type || 'image/jpeg',
            });
            if (EcreatedBy) {
              fd.append('created_by', String(EcreatedBy));
            }

            await gsApi.uploadTrainingCertificate(fd);
          }
          console.log(
            `    Certificates uploaded for Training ID: ${trainingId}`,
          );
        } else {
          console.log(`    Training ${formType} saved (ID: ${trainingId})`);
        }
      } catch (e) {
        console.error(` Training Save Error:`, e.response?.data || e.message);
      }
    }
  };
  const originalHandleSubmit = handleSubmit;
  const wrappedHandleSubmit = async () => {
    await handleSubmit(); // Call your existing logic
    // Inside your existing handleSubmit logic, if (success) { await clearDraft(); }
  };
  const handleSubmit = async () => {
    if (submitting) return; // 🔒 double click prevent

    setSubmitting(true); // 🔥 ye add karo
    try {
      // 1) ensure recorded beneficiary exists (inspired by NewEnterpriseForm)
      let recordedBenefId =
        recordedBenef?.id || existingEnterprise?.recorded_beneficiary || null;

      if (!recordedBenefId) {
        try {
          recordedBenefId = await ensureRecordedBeneficiary();
        } catch (e) {
          Alert.alert('Missing Beneficiary', e.message || String(e));
          return;
        }
      }

      // 2) Build main payload with recorded_beneficiary injected
      const {
        payload,
        enterpriseTypesTree,
        products,
        sourceOfInvestmentTree,
        loans,
        subsidies,
        trainingReceivedRows,
        trainingRequiredRows,
        media,
      } = buildMainPayload(recordedBenefId);

      // 🔁 Ensure avg_annual_sales is always correct before saving
      const sanitizedProducts = (products || []).map(prod => {
        const monthly = parseFloat(prod.avg_monthly_sales || 0);

        return {
          ...prod,
          avg_monthly_sales: monthly ? monthly.toFixed(2) : '0.00',
          avg_annual_sales: monthly ? (monthly * 12).toFixed(2) : '0.00',
        };
      });

      // basic validation

      // 1️⃣ Declaration confirm
      if (
        !payload.declaration_confirmed ||
        payload.declaration_confirmed !== 'Yes'
      ) {
        Alert.alert(
          'Declaration required',
          'Please confirm the declaration before submitting.',
        );
        return;
      }

      // 2️⃣ Declaration date
      if (!payload.declaration_date) {
        Alert.alert('Validation', 'Please select declaration date.');
        return;
      }

      const declDate = new Date(payload.declaration_date);
      const today = new Date();

      if (isNaN(declDate.getTime())) {
        Alert.alert('Validation', 'Invalid declaration date.');
        return;
      }

      if (declDate > today) {
        Alert.alert('Validation', 'Future date not allowed.');
        return;
      }

      // 3️⃣ Signature validation (IMPORTANT FIX)
      const signature = existingForm?.media?.declaration_signature || [];

      if (!Array.isArray(signature) || signature.length === 0) {
        Alert.alert('Validation', 'Please upload applicant signature.');
        return;
      }

      // 4️⃣ Optional verifier validation
      if (
        payload.verifier_name &&
        payload.verifier_name.trim().length > 0 &&
        payload.verifier_name.trim().length < 3
      ) {
        Alert.alert(
          'Validation',
          'Verifier name must be at least 3 characters.',
        );
        return;
      }

      // 3) create / update existing enterprise
      let enterpriseRes;
      if (existingEnterprise?.id) {
        enterpriseRes = await gsApi.updateExistingEnterprise(
          existingEnterprise.id,
          payload,
        );
      } else {
        enterpriseRes = await gsApi.createExistingEnterprise(payload);
      }
      const enterpriseTHurId =
        enterpriseRes.TH_urid || existingEnterprise?.TH_urid;
      const enterpriseId = enterpriseRes?.id || existingEnterprise?.id;
      if (!enterpriseId && !enterpriseTHurId) {
        throw new Error('Enterprise ID not returned from API');
      }
      try {
        await gsApi.updateRecordedBeneficiary(recordedBenefId, {
          enterprise_id: enterpriseTHurId,
        });
      } catch (e) {
        console.warn('Failed to link recorded beneficiary with enterprise', e);
      }

      // 5) child tables (best-effort, do not hard-fail)
      try {
        await saveEnterpriseTypes(enterpriseTHurId, enterpriseTypesTree);
      } catch (e) {
        console.warn('Failed to save enterprise types', e);
      }
      try {
        await saveProductsAndMedia(enterpriseId, sanitizedProducts);
      } catch (e) {
        console.warn('Failed to save products/media', e);
      }
      try {
        // Pass the Numeric ID (e.g., 9)
        await saveLoans(enterpriseId, existingForm.loans);
      } catch (e) {
        console.warn('Failed to save loan details', e);
      }
      try {
        // Pass the Numeric Enterprise ID (e.g., 9) and the array from state
        await saveSubsidies(enterpriseId, existingForm.subsidies);
      } catch (e) {
        console.warn('Failed to save subsidies', e);
      }
      try {
        await saveStandaloneMedia(enterpriseId, existingForm.media);
      } catch (e) {
        console.warn('Failed to upload standalone media', e);
      }
      try {
        await saveLicenses(enterpriseId, existingForm.licenses);
      } catch (e) {
        console.warn('Failed to save licenses', e);
      }
      try {
        await saveMandatoryFunds(enterpriseTHurId, existingForm.fund_cards);
      } catch (e) {
        console.warn('Failed to save mandatory funds', e);
      }
      try {
        // Pass the TH_urid and the nested support object
        await saveEnterpriseSupport(
          enterpriseTHurId,
          existingForm.support_required,
        );
      } catch (e) {
        console.warn('Failed to save support requirements', e);
      }
      try {
        // Pass the string TH_urid
        await saveTrainingReqs(
          enterpriseTHurId,
          existingForm.training_received_rows,
          'rec',
        );
        await saveTrainingReqs(
          enterpriseTHurId,
          existingForm.training_required_rows,
          'req',
        );
      } catch (e) {
        console.warn('Failed to save training records', e);
      }
      try {
        await saveEnterpriseShop(enterpriseId, existingForm);
      } catch (e) {
        console.warn('Failed to save shop enterprise', e);
      }
      Alert.alert('Saved', 'Existing Enterprise form submitted successfully.', [
        // {
        //   text: 'OK',
        //   onPress: () => {
        //     navigation?.goBack?.();
        //   },
        // },
        {
          text: 'OK',
          onPress: async () => {
            // 1. DELETE THE DRAFT BLOB
            if (memberCode) {
              await AsyncStorage.removeItem(`DRAFT_EXEP_${memberCode}`);
            }
            // 2. GO BACK
            navigation?.goBack?.();
          },
        },
      ]);
    } catch (err) {
      console.error('ExistingEnterprise submit error', err);
      Alert.alert('Error', 'Unable to submit the form. Please try again.');
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

  // Inside ExistingEnterpriseForm component...

  const PaginationButtons = ({
    currentSectionIndex,
    TOTAL_SECTIONS,
    submitting,
    setCurrentSectionIndex,
    handleSubmit,
  }) => {
    const { language } = useContext(LanguageContext);
    const validateLicenses = () => {
      const licenses = existingForm.licenses || [];

      if (licenses.length === 0) {
        Alert.alert(
          language === 'hi' ? 'सत्यापन' : 'Validation',
          language === 'hi'
            ? 'कृपया कम से कम एक लाइसेंस जोड़ें'
            : 'Please add at least one license',
        );
        return false;
      }

      for (let i = 0; i < licenses.length; i++) {
        const lic = licenses[i];

        // ✅ License name
        if (!lic.license_name || !lic.license_name.trim()) {
          Alert.alert(
            language === 'hi' ? 'सत्यापन' : 'Validation',
            language === 'hi'
              ? 'कृपया लाइसेंस नाम दर्ज करें'
              : 'Please enter license name',
          );
          return false;
        }

        // ✅ Registration number
        if (!lic.license_no || !lic.license_no.trim()) {
          Alert.alert(
            language === 'hi' ? 'सत्यापन' : 'Validation',
            language === 'hi'
              ? 'कृपया पंजीकरण संख्या दर्ज करें'
              : 'Please enter registration number',
          );
          return false;
        }

        // ✅ File
        if (!lic.file) {
          Alert.alert(
            language === 'hi' ? 'सत्यापन' : 'Validation',
            language === 'hi'
              ? 'कृपया लाइसेंस दस्तावेज़ अपलोड करें'
              : 'Please upload license document',
          );
          return false;
        }
      }

      return true;
    };
    const validateEnterpriseDetails = () => {
      // 1. Workplace Type
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

      // 2. Electricity
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

      // 3. Water
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

      // 4. Transport
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

      // 5. Bijnor
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

        if (isEmpty(form.shop_sub_category)) return 'Select product category';

        if (
          form.shop_sub_category === 'Others' &&
          isEmpty(form.shop_sub_category_other)
        )
          return 'Specify other shop category';

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

        if (
          splitMulti(form.marketing_channels).includes('Others') &&
          isEmpty(form.market_linkage)
        )
          return 'Specify marketing linkage';

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

        // MEDIA VALIDATION
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

        if (
          splitMulti(p.marketing_channels_other).length &&
          isEmpty(p.marketing_channels_other_input)
        )
          return `Product ${i + 1}: Specify channel details`;

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

        // MEDIA VALIDATION
        if (!p.media?.open_box?.length)
          return `Product ${i + 1}: Upload open box image`;

        if (!p.media?.close_box?.length)
          return `Product ${i + 1}: Upload closed box image`;
      }

      return null;
    };
    // const handleNext = () => {
    //   console.log('==================================================');
    //   console.log(
    //     `%c NAVIGATING FROM SECTION: ${currentSectionIndex} `,
    //     'background: #EE6969; color: #fff; font-weight: bold;',
    //   );

    //   // SECTION 0: BASIC INFO & LICENSES
    //   if (currentSectionIndex === 0) {

    //     if (!existingForm.enterprise_name?.trim()) {
    //       Alert.alert(
    //         language === 'hi' ? 'सत्यापन' : 'Validation',
    //         language === 'hi'
    //           ? 'कृपया उद्यम का नाम दर्ज करें।'
    //           : 'Please enter the enterprise name.'
    //       );
    //       return;
    //     }
    //     if (!validateLicenses()) return;
    //     if (!existingForm.enterprise_types_tree || existingForm.enterprise_types_tree.length === 0) {
    //       Alert.alert(
    //         language === 'hi' ? 'सत्यापन' : 'Validation',
    //         language === 'hi'
    //           ? 'कृपया उद्यम का प्रकार चुनें।'
    //           : 'Please select enterprise type.'
    //       );
    //       return;
    //     }

    //     if (!existingForm.ownership_type) {
    //       Alert.alert(
    //         language === 'hi' ? 'सत्यापन' : 'Validation',
    //         language === 'hi'
    //           ? 'कृपया स्वामित्व प्रकार चुनें।'
    //           : 'Please select ownership type.'
    //       );
    //       return;
    //     }

    //     if (
    //       existingForm.ownership_type === 'Others' &&
    //       !existingForm.ownership_type_other?.trim()
    //     ) {
    //       Alert.alert(
    //         language === 'hi' ? 'सत्यापन' : 'Validation',
    //         language === 'hi'
    //           ? 'कृपया स्वामित्व का विवरण दें।'
    //           : 'Please specify ownership type.'
    //       );
    //       return;
    //     }

    //     if (!existingForm.year_of_establishment) {
    //       Alert.alert(
    //         language === 'hi' ? 'सत्यापन' : 'Validation',
    //         language === 'hi'
    //           ? 'कृपया स्थापना वर्ष चुनें।'
    //           : 'Please select year of establishment.'
    //       );
    //       return;
    //     }

    //     if (existingForm.total_emp === '' || existingForm.total_emp === undefined) {
    //       Alert.alert(
    //         language === 'hi' ? 'सत्यापन' : 'Validation',
    //         language === 'hi'
    //           ? 'कृपया कुल कर्मचारियों की संख्या दर्ज करें।'
    //           : 'Please enter total employees.'
    //       );
    //       return;
    //     }

    //     if (
    //       existingForm.number_of_shg_emp === '' ||
    //       existingForm.number_of_shg_emp === undefined
    //     ) {
    //       Alert.alert(
    //         language === 'hi' ? 'सत्यापन' : 'Validation',
    //         language === 'hi'
    //           ? 'कृपया SHG कर्मचारियों की संख्या दर्ज करें।'
    //           : 'Please enter SHG employees count.'
    //       );
    //       return;
    //     }

    //     if (!existingForm.owner_cadre || existingForm.owner_cadre.length === 0) {
    //       Alert.alert(
    //         language === 'hi' ? 'सत्यापन' : 'Validation',
    //         language === 'hi'
    //           ? 'कृपया कम से कम एक कैडर गतिविधि चुनें।'
    //           : 'Please select at least one cadre activity.'
    //       );
    //       return;
    //     }

    //     if (
    //       existingForm.owner_cadre?.includes('Other') &&
    //       !existingForm.owner_cadre_other?.trim()
    //     ) {
    //       Alert.alert(
    //         language === 'hi' ? 'सत्यापन' : 'Validation',
    //         language === 'hi'
    //           ? 'कृपया अन्य कैडर गतिविधि दर्ज करें।'
    //           : 'Please specify other cadre activity.'
    //       );
    //       return;
    //     }
    //     if (!existingForm.owner_designation || existingForm.owner_designation.length === 0) {
    //       Alert.alert(
    //         language === 'hi' ? 'सत्यापन' : 'Validation',
    //         language === 'hi'
    //           ? 'कृपया SHG में अपना पद चुनें।'
    //           : 'Please select your SHG designation.'
    //       );
    //       return;
    //     }

    //     // LICENSE VALIDATION

    //     console.log('--- SECTION 0 (BASIC INFO) ---');
    //     console.log('Enterprise Name:', existingForm.enterprise_name);
    //     console.log('Enterprise Type:', existingForm.enterprise_types_tree);
    //     console.log('Owner Cadre:', existingForm.owner_cadre);
    //     console.log('Owner Designation:', existingForm.owner_designation);
    //     console.log(
    //       'Selected Licenses:',
    //       JSON.stringify(existingForm.licenses, null, 2),
    //     );
    //   }

    //   // SECTION 1: ENTERPRISE DETAILS (INFRA)
    //   if (currentSectionIndex === 1) {
    //     if (!validateEnterpriseDetails()) return;

    //     console.log('--- SECTION 1 (INFRASTRUCTURE) ---', {
    //       workplace: existingForm.workplace_type,
    //       electricity: existingForm.electricity_available,
    //       water: existingForm.water_available,
    //       transportation: existingForm.transportation_availability,
    //     });
    //   }
    //   // SECTION 2: SHOP BASED OR PRODUCT BASED
    //   // if (currentSectionIndex === 2) {
    //   //   console.log('--- SECTION 2 (SHOP & PRODUCT DETAIL) ---');
    //   //   console.log('Has Shop Product:', existingForm.has_shop_product);

    //   //   if (existingForm.has_shop_product === 'Yes') {
    //   //     console.log(
    //   //       '%c [SHOP DATA SET]',
    //   //       'color: orange; font-weight: bold;',
    //   //     );
    //   //     console.table({
    //   //       shop_type: existingForm.shop_type,
    //   //       sub_category: existingForm.shop_sub_category,
    //   //       inventory_source: existingForm.inventory_source,
    //   //       target_customers: existingForm.target_customers,
    //   //       marketing_channels: existingForm.marketing_channels,
    //   //       marketing_challenges: existingForm.marketing_challenges,
    //   //       avg_monthly_sales: existingForm.avg_monthly_sales,
    //   //       annual_sale: existingForm.annual_sale,
    //   //     });

    //   //     // NEW: Preview of Mapped Backend Keys (to check for NULLs)
    //   //     console.log('%c [BACKEND KEY MAPPING PREVIEW]', 'color: #2b7;');
    //   //     console.log({
    //   //       enterprise_id: 'Will be Linked on Submit',
    //   //       source_of_inventory: existingForm.inventory_source,
    //   //       shop_category: existingForm.shop_sub_category,
    //   //       avg_annual_sales: existingForm.annual_sale,
    //   //     });
    //   //   } else {
    //   //     // Create a clean preview table for all products
    //   //     const productPreview = existingForm.products.map((p, i) => {
    //   //       return {
    //   //         'Prod #': i + 1,
    //   //         Name: p.main_product_name || 'N/A',
    //   //         MRP: p.product_mrp || '0',
    //   //         Capacity: p.production_capacity,
    //   //         'Raw Material': p.raw_material
    //   //           ? p.raw_material.substring(0, 15) + '...'
    //   //           : 'N/A',
    //   //         'Monthly Sales': p.avg_monthly_sales,
    //   //         'Annual Sales': p.avg_annual_sales,
    //   //         'Digital Pay': p.accept_digital_payment,
    //   //         'Media (O / C / Other)': `${p.media?.open_box?.length || 0} / ${p.media?.close_box?.length || 0
    //   //           } / ${p.media?.others?.length || 0}`,
    //   //       };
    //   //     });
    //   //     console.table(productPreview);

    //   //     // Detailed log for the first product to verify raw fields
    //   //     console.log(
    //   //       'Full Object Preview (Product 1):',
    //   //       existingForm.products[0],
    //   //     );
    //   //   }
    //   // }
    //   if (currentSectionIndex === 2) {
    //     let error = null;

    //     if (existingForm.has_shop_product === 'Yes') {
    //       error = validateShopSection(existingForm);
    //     } else if (existingForm.has_shop_product === 'No') {
    //       error = validateProducts(existingForm.products);
    //     } else {
    //       error = 'Please select Yes or No';
    //     }

    //     if (error) {
    //       Alert.alert('Validation Error', error);
    //       return;
    //     }
    //   }

    //   // SECTION 3: INVESTMENT & MANDATORY FUNDS
    //   if (currentSectionIndex === 3) {
    //     console.log('==================================================');
    //     console.log(
    //       '%c SECTION 3: INVESTMENT & SHG FUNDS ',
    //       'background: #2b7; color: #fff; font-weight: bold;',
    //     );

    //     const investmentData = {
    //       'Initial Investment': existingForm.initial_investment || '0',
    //       'Monthly Income Estimate':
    //         existingForm.monthly_income_estimate || '0',
    //       'Monthly Working Capital':
    //         existingForm.working_capital_monthly || '0',
    //       'Annual Turnover (Calc)': existingForm.annual_turnover || 0,
    //       'Gross Profit (Calc)': existingForm.gross_profit || 0,
    //       'Has SHG Mandatory Fund': existingForm.has_shg_cif || 'No',
    //     };

    //     console.log('A) Investment Summary:');
    //     console.table(investmentData);

    //     // 2. Log SHG Fund Cards specifically
    //     if (existingForm.fund_cards && existingForm.fund_cards.length > 0) {
    //       const shgFundsTable = existingForm.fund_cards.map((card, i) => {
    //         const received = parseFloat(card.amount_received || 0);
    //         const repaid = parseFloat(card.amount_repaid || 0);

    //         // Calculate Status based on your Backend choices
    //         let statusForDB = 'NOT PAID';
    //         if (repaid > 0) {
    //           statusForDB = repaid >= received ? 'PAID' : 'PARTIALLY PAID';
    //         }

    //         return {
    //           'Fund Type':
    //             card.loanType === 'Other'
    //               ? card.otherLoanTypeText
    //               : card.loanType,
    //           'Amt Received': card.amount_received,
    //           'Amt Repaid': card.amount_repaid,
    //           Pending: (received - repaid).toFixed(2),
    //           'Status (Final)': statusForDB,
    //         };
    //       });

    //       console.log('B) SHG Mandatory Funds Detail:');
    //       console.table(shgFundsTable);
    //     } else {
    //       console.log('B) SHG Mandatory Funds: No cards added.');
    //     }

    //     console.log('==================================================');
    //   }
    //   // SECTION 4: LOANS & SUBSIDIES
    //   if (currentSectionIndex === 4) {
    //     console.log('==================================================');
    //     console.log(
    //       '%c SECTION 4: LOAN & SUBSIDY DATA LOG ',
    //       'background: #222; color: #fff; font-weight: bold;',
    //     );

    //     if (existingForm.loans && existingForm.loans.length > 0) {
    //       const loanPreview = existingForm.loans.map((l, i) => {
    //         const total = parseFloat(l.loan_amount || 0);
    //         const repaid = parseFloat(l.repaid_amount || 0);
    //         const allDepts = Array.isArray(l.institution_tree)
    //           ? l.institution_tree.map(item => item.parent).join(', ')
    //           : 'None';

    //         return {
    //           'Loan #': i + 1,
    //           Dept: allDepts,
    //           Bank: l.bank_name,
    //           Branch: l.branch_name,
    //           Amt: l.loan_amount,
    //           Repaid: l.repaid_amount,
    //           Status: repaid >= total ? 'PAID' : 'PARTIALLY',
    //           date: l.date_taken,
    //           institution: l.institution_name,
    //         };
    //       });
    //       console.table(loanPreview);
    //     } else {
    //       console.log('Loans: No records added.');
    //     }
    //     //  SUBSIDY LOG
    //     if (existingForm.subsidies && existingForm.subsidies.length > 0) {
    //       console.log('%c [SUBSIDIES]', 'color: #2b7; font-weight: bold;');
    //       const subsidyPreview = existingForm.subsidies.map((s, i) => {
    //         // Get Departments (Parents)
    //         const depts = Array.isArray(s.subsidy_name_tree)
    //           ? s.subsidy_name_tree.map(item => item.parent).join(', ')
    //           : 'None';

    //         // Get Schemes (Children) + Others specify
    //         const schemes = Array.isArray(s.subsidy_name_tree)
    //           ? s.subsidy_name_tree
    //             .map(item => {
    //               let childStr = (item.children || []).join(', ');
    //               if (item.others_specify)
    //                 childStr += ` (${item.others_specify})`;
    //               return childStr;
    //             })
    //             .join(' | ')
    //           : 'None';

    //         return {
    //           'Subsidy #': i + 1,
    //           'Type (Dept)': depts,
    //           'Name (Schemes)': schemes,
    //           Detail: s.subsidy_detail,
    //           DB_ID: s.id || 'New',
    //         };
    //       });
    //       console.table(subsidyPreview);
    //     } else {
    //       console.log('Subsidies: No records added.');
    //     }
    //     console.log('==================================================');
    //   }

    //   // SECTION 5: TRAINING & SKILLS
    //   if (currentSectionIndex === 5) {
    //     console.log('==================================================');
    //     console.log(
    //       '%c SECTION 5: TRAINING DATA LOG ',
    //       'background: #000; color: #fff; font-weight: bold;',
    //     );

    //     const logRows = (label, rows) => {
    //       if (!rows || rows.length === 0) {
    //         console.log(`${label}: No data.`);
    //         return;
    //       }
    //       const tableData = rows.map((r, i) => ({
    //         Type: label,
    //         Sector_Type: r.sector_tree?.[0]?.parent || 'N/A',
    //         Sector: r.sector_tree?.[0]?.children?.join(', ') || 'N/A',
    //         Dept: r.department,
    //         Tr_Type: r.training_type,
    //         Files: r.certificates_files?.length || 0,
    //         duration: r.duration,
    //         location: r.location,
    //       }));
    //       console.table(tableData);
    //     };

    //     logRows('Received (rec)', existingForm.training_received_rows);
    //     logRows('Required (req)', existingForm.training_required_rows);
    //     console.log('==================================================');
    //   }

    //   // SECTION 6: SUPPORT REQUIRED
    //   if (currentSectionIndex === 6) {
    //     console.log('==================================================');
    //     console.log(
    //       '%c SECTION 6: SUPPORT REQUIRED SUMMARY ',
    //       'background: #2b7; color: #fff; font-weight: bold;',
    //     );

    //     const supportObj = existingForm.support_required;
    //     const mainStatus = existingForm.is_support_required || 'Not Selected';

    //     if (supportObj && Object.keys(supportObj).length > 0) {
    //       const flattenedTable = Object.keys(supportObj).map(key => {
    //         const data = supportObj[key];

    //         if (key === 'financial') {
    //           return {
    //             suport_category: 'Financial',
    //             support_sub_category: data.type,
    //             support_description:
    //               data.type === 'Loan' ? data.amount : data.spec,
    //             Status: mainStatus,
    //           };
    //         }
    //         if (key === 'infrastructure') {
    //           return {
    //             suport_category: 'Infrastructure',
    //             support_sub_category: data.type,
    //             support_description: data.spec,
    //             Status: mainStatus,
    //           };
    //         }

    //         return {
    //           suport_category: key.charAt(0).toUpperCase() + key.slice(1),
    //           support_sub_category: 'Direct Entry',
    //           support_description: data,
    //           Status: mainStatus,
    //         };
    //       });

    //       console.table(flattenedTable);
    //     } else {
    //       console.log(
    //         `Support Status: ${mainStatus}. User selected no checked.`,
    //       );
    //     }
    //     console.log('==================================================');
    //   }

    //   // SECTION 7: GENERAL MEDIA (Entrepreneur/Enterprise)
    //   if (currentSectionIndex === 7) {
    //     console.log('==================================================');
    //     console.log(
    //       '%c SECTION 7: GENERAL MEDIA UPLOAD SUMMARY ',
    //       'background: #7b1fa2; color: #fff; font-weight: bold;',
    //     );

    //     const mediaSummary = {
    //       'Entrepreneur Photos': {
    //         count: existingForm.media?.photo_entrepreneur?.length || 0,
    //         status:
    //           existingForm.media?.photo_entrepreneur?.length > 0
    //             ? '✅ ATTACHED'
    //             : '❌ MISSING',
    //       },
    //       'Enterprise Photos': {
    //         count: existingForm.media?.photo_enterprise?.length || 0,
    //         status:
    //           existingForm.media?.photo_enterprise?.length > 0
    //             ? '✅ ATTACHED'
    //             : '❌ MISSING',
    //       },
    //       'Declaration Signature': {
    //         count: existingForm.media?.declaration_signature?.length || 0,
    //         status:
    //           existingForm.media?.declaration_signature?.length > 0
    //             ? '✅ ATTACHED'
    //             : '❌ MISSING',
    //       },
    //     };

    //     console.table(mediaSummary);

    //     // Log a quick URI check for the first file to ensure they aren't empty objects
    //     if (existingForm.media?.photo_entrepreneur?.[0]) {
    //       console.log(
    //         'Sample Asset URI:',
    //         existingForm.media.photo_entrepreneur[0].uri,
    //       );
    //     }
    //     console.log('==================================================');
    //   }

    //   // SECTION 8: DECLARATION STATUS
    //   if (currentSectionIndex === 8) {
    //     console.log('==================================================');
    //     console.log(
    //       '%c SECTION 8: FINAL DECLARATION STATUS ',
    //       'background: #EE6969; color: #fff; font-weight: bold;',
    //     );

    //     const declarationStatus = {
    //       'Confirmed By User': existingForm.declaration_confirmed || 'No',
    //       'Submission Date': existingForm.declaration_date || 'Not Provided',
    //       'Validation Passed':
    //         existingForm.declaration_confirmed === 'Yes'
    //           ? '✅ READY'
    //           : '❌ ACTION REQUIRED',
    //     };

    //     console.table(declarationStatus);

    //     // Final payload check before the user hits the actual Submit button
    //     console.log(
    //       '%c [FINAL FORM PREVIEW]',
    //       'color: #2b7; font-weight: bold;',
    //     );
    //     console.log('Enterprise Name:', existingForm.enterprise_name);
    //     console.log('Total Products:', existingForm.products?.length || 0);
    //     console.log('Total Loans:', existingForm.loans?.length || 0);

    //     console.log('==================================================');
    //   }
    //   setCurrentSectionIndex(prev =>
    //     prev < TOTAL_SECTIONS - 1 ? prev + 1 : prev,
    //   );
    // };

    const handleNext = () => {
      console.log('==================================================');
      console.log(
        `%c NAVIGATING FROM SECTION: ${currentSectionIndex} `,
        'background: #EE6969; color: #fff; font-weight: bold;',
      );

      let canProceed = true;

      // ================= SECTION 0 =================
      if (currentSectionIndex === 0) {
        if (!existingForm.enterprise_name?.trim()) {
          Alert.alert('Validation', 'Please enter the enterprise name.');
          canProceed = false;
        } else if (!validateLicenses()) {
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

      // ================= SECTION 1 =================
      if (currentSectionIndex === 1 && canProceed) {
        if (!validateEnterpriseDetails()) {
          canProceed = false;
        }
      }

      // ================= SECTION 2 =================
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

      // ================= SECTION 3 =================
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

        //  BASIC VALIDATIONS
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

        //  SHG VALIDATION
        if (canProceed && !hasShg) {
          Alert.alert('Validation', 'Please select SHG fund option');
          canProceed = false;
        }

        //  FUND CARDS VALIDATION
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

        //  SOURCE OF INVESTMENT (NOW ALWAYS RUNS)
        if (canProceed && (!sourceTree || sourceTree.length === 0)) {
          Alert.alert('Validation', 'Please select source of investment');
          canProceed = false;
        }
      }
      // ================= SECTION 4 =================
      // ================= SECTION 4 =================
      if (currentSectionIndex === 4 && canProceed) {
        const isInvalidNumber = val => {
          return (
            val === null ||
            val === undefined ||
            String(val).trim() === '' ||
            isNaN(Number(val))
          );
        };

        /* ================= LOAN VALIDATION ================= */
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

            /* ===== Institution ===== */
            if (!loan.institution_tree || loan.institution_tree.length === 0) {
              Alert.alert(
                'Validation',
                `Loan ${i + 1}: Please select institution`,
              );
              canProceed = false;
              return;
            }

            /* ===== Bank ===== */
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

            /* ===== Branch ===== */
            if (!loan.branch_name || loan.branch_name.trim() === '') {
              Alert.alert(
                'Validation',
                `Loan ${i + 1}: Please enter branch name`,
              );
              canProceed = false;
              return;
            }

            /* ===== Loan Amount ===== */
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

            /* ===== Repaid Amount (FIXED PROPERLY) ===== */
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

            /* ===== Date Validation (STRICT) ===== */
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

        /* ================= SUBSIDY VALIDATION ================= */
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

            /* ===== Scheme Selection ===== */
            if (!sub.subsidy_name_tree || sub.subsidy_name_tree.length === 0) {
              Alert.alert(
                'Validation',
                `Subsidy ${i + 1}: Please select department/scheme`,
              );
              canProceed = false;
              return;
            }

            /* ===== Detail ===== */
            if (!sub.subsidy_detail || sub.subsidy_detail.trim() === '') {
              Alert.alert(
                'Validation',
                `Subsidy ${i + 1}: Please enter subsidy details`,
              );
              canProceed = false;
              return;
            }

            /* ===== OPTIONAL: Prevent useless input ===== */
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

        console.log(' SECTION 4 VALIDATED SUCCESSFULLY');
      }

      // ================= SECTION 5 =================
      // ================= SECTION 5 =================
      if (currentSectionIndex === 5 && canProceed) {
        const isEmpty = val =>
          val === null ||
          val === undefined ||
          (typeof val === 'string' && val.trim() === '') ||
          (Array.isArray(val) && val.length === 0);

        /* ===== TRAINING RECEIVED ===== */
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

              // OPTIONAL: certificates check (only if you want strict)
              // if (!row.certificates_files?.length) {
              //   Alert.alert(
              //     'Validation',
              //     `Training ${i + 1}: Please upload at least one certificate`,
              //   );
              //   canProceed = false;
              //   break;
              // }
            }
          }
        }

        /* ===== TRAINING REQUIRED ===== */
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

        /* ===== TRAINING REQUIRED = NO ===== */
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

        /* ===== COMMON FIELDS ===== */
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

      // ================= SECTION 6 =================
      // ================= SECTION 6 =================
      if (currentSectionIndex === 6 && canProceed) {
        const isEmpty = val =>
          val === null ||
          val === undefined ||
          (typeof val === 'string' && val.trim() === '') ||
          (Array.isArray(val) && val.length === 0);

        /* ===== MAIN YES/NO ===== */
        if (!existingForm.is_support_required) {
          Alert.alert('Validation', 'Please select if support is required.');
          canProceed = false;
        }

        /* ===== IF YES ===== */
        if (canProceed && existingForm.is_support_required === 'Yes') {
          const support = existingForm.support_required || {};

          if (Object.keys(support).length === 0) {
            Alert.alert(
              'Validation',
              'Please select at least one support type.',
            );
            canProceed = false;
          } else {
            /* ===== FINANCIAL ===== */
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

            /* ===== INFRASTRUCTURE ===== */
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

            /* ===== MACHINERY ===== */
            if (canProceed && support.machinery !== undefined) {
              if (isEmpty(support.machinery)) {
                Alert.alert(
                  'Validation',
                  'Machinery: Please specify required machinery.',
                );
                canProceed = false;
              }
            }

            /* ===== OTHER ===== */
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

        /* ===== IF NO ===== */
        if (canProceed && existingForm.is_support_required === 'No') {
          // nothing required — valid state
        }
      }

      // ================= SECTION 7 =================
      // ================= SECTION 7 =================
      if (currentSectionIndex === 7 && canProceed) {
        const isEmptyArray = arr => !Array.isArray(arr) || arr.length === 0;

        const media = existingForm.media || {};

        /* ===== MEDIA OBJECT EXIST ===== */
        if (!existingForm.media) {
          Alert.alert('Validation', 'Please upload required media files.');
          canProceed = false;
        }

        /* ===== ENTREPRENEUR PHOTO ===== */
        if (canProceed && isEmptyArray(media.photo_entrepreneur)) {
          Alert.alert('Validation', 'Please upload entrepreneur photo.');
          canProceed = false;
        }

        /* ===== ENTERPRISE PHOTO ===== */
        if (canProceed && isEmptyArray(media.photo_enterprise)) {
          Alert.alert('Validation', 'Please upload enterprise photo.');
          canProceed = false;
        }

        /* ===== OPTIONAL: DOCUMENT VALIDATION (UNCOMMENT IF NEEDED) ===== */

        if (canProceed && isEmptyArray(media.others)) {
          Alert.alert('Validation', 'Please upload at least one document.');
          canProceed = false;
        }

        /* ===== EXTRA STRICT (OPTIONAL) ===== */
        // Prevent too many uploads (safety)

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

      // ================= SECTION 8 =================
      if (currentSectionIndex === 8 && canProceed) {
        const isEmpty = val =>
          val === null ||
          val === undefined ||
          (typeof val === 'string' && val.trim() === '');

        const media = existingForm.media || {};

        /* ===== DECLARATION CONFIRM ===== */
        if (!existingForm.declaration_confirmed) {
          Alert.alert('Validation', 'Please confirm declaration.');
          canProceed = false;
        }

        if (canProceed && existingForm.declaration_confirmed !== 'Yes') {
          Alert.alert('Validation', 'Please accept declaration to proceed.');
          canProceed = false;
        }

        /* ===== DATE VALIDATION ===== */
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

          // Optional: very old date check
          if (canProceed && date.getFullYear() < 1950) {
            Alert.alert('Validation', 'Please select a valid date.');
            canProceed = false;
          }
        }

        /* ===== SIGNATURE VALIDATION ===== */
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

        /* ===== OPTIONAL: FILE TYPE SAFETY ===== */

        if (canProceed) {
          const valid = signatureFiles.every(file =>
            (file.type || '').includes('image'),
          );
          if (!valid) {
            Alert.alert('Validation', 'Only image signatures allowed.');
            canProceed = false;
          }
        }

        /* ===== VERIFIER NAME (OPTIONAL BUT CLEAN) ===== */
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
      // ================= FINAL CONTROL =================
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
        {/* Previous Button */}
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

        {/* Next Button (UPDATED to use handleNext) */}
        {currentSectionIndex < TOTAL_SECTIONS - 1 && (
          <TouchableOpacity
            style={[
              styles.navBtn,
              styles.navBtnPrimary,
              submitting && { opacity: 0.7 },
            ]}
            disabled={submitting}
            onPress={handleNext} // Calls  logging function
          >
            <Text style={[styles.navBtnText, styles.navBtnPrimaryText]}>
              {language === 'hi' ? 'आगे' : 'Next'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Submit Button (Only on last page) */}
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
            addProductRow={() => {}}
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

  // NEW: section visibility helpers
  sectionWrapper: {
    flex: 1,
  },
  sectionVisible: {
    // default visible; can add spacing if needed
  },
  sectionHidden: {
    display: 'none',
  },

  // NEW: pagination controls
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
