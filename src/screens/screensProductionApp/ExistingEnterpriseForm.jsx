// // src/screens/screensProductionApp/ExistingEnterpriseForm.jsx
// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
// } from 'react-native';
// import gsApi from '../../api/gsApi';
// import { getUser } from '../../utils/auth';
// import {
//   getShgListForPanchayat,
//   getCrpPanchayats,
//   getCrpDetail,
// } from '../../utils/tempStore';

// // Section components
// import ExistingEnterpriseBasicInfoSection from './FormSections/ExistingEnterpriseBasicInfoSection';
// import ExistingEnterpriseProductServicesSection from './FormSections/ExistingEnterpriseProductServicesSection';
// import ExistingEnterpriseEnterpriseDetailsSection from './FormSections/ExistingEnterpriseEnterpriseDetailsSection';
// import ExistingEnterpriseInvestmentSection from './FormSections/ExistingEnterpriseInvestmentSection';
// import ExistingEnterpriseLoanSubsidySection from './FormSections/ExistingEnterpriseLoanSubsidySection';
// import ExistingEnterpriseTrainingSkillsSection from './FormSections/ExistingEnterpriseTrainingSkillsSection';
// import ExistingEnterpriseSupportSection from './FormSections/ExistingEnterpriseSupportSection';
// import ExistingEnterpriseMediaSection from './FormSections/ExistingEnterpriseMediaSection';
// import ExistingEnterpriseDeclarationSection from './FormSections/ExistingEnterpriseDeclarationSection';

// // ---- helpers (same style as NewEnterpriseForm) ----

// const computeAgeFromDob = (dobStr) => {
//   if (!dobStr) return null;
//   const dob = new Date(dobStr);
//   if (Number.isNaN(dob.getTime())) return null;
//   const today = new Date();
//   let age = today.getFullYear() - dob.getFullYear();
//   const m = today.getMonth() - dob.getMonth();
//   if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
//     age -= 1;
//   }
//   return age;
// };

// function extractLocationFromShg(shg) {
//   if (!shg) return null;
//   const district_id = shg.districtId ?? shg.district_id ?? null;
//   const block_id = shg.blockId ?? shg.block_id ?? null;
//   const panchayat_id = shg.panchayatId ?? shg.panchayat_id ?? null;
//   const village_id = shg.villageId ?? shg.village_id ?? null;
//   const lokos_shg_code = shg.code ?? shg.shg_code ?? shg.lokos_shg_code ?? null;
//   return { district_id, block_id, panchayat_id, village_id, lokos_shg_code };
// }

// export default function ExistingEnterpriseForm({ route, navigation }) {
//   const recordedBenef = route?.params?.recordedBenef || null;
//   const existingEnterprise = route?.params?.existingEnterprise || null;

//   // extra params from CRPRecordFlowProduction (same as NewEnterpriseForm)
//   const beneficiary = route?.params?.beneficiary || null;
//   const tempShg = route?.params?.tempShg || null;
//   const routeCrpUserId =
//     route?.params?.crpUserId ||
//     route?.params?.user_id ||
//     route?.params?.username ||
//     null;

//   const lokosShgCode =
//     route?.params?.lokos_shg_code ||
//     route?.params?.lokosShgCode ||
//     tempShg?.code ||
//     tempShg?.shg_code ||
//     null;

//   // --- master form state (single source of truth) ---
//   const [existingForm, setExistingForm] = useState({
//     // BASIC
//     enterprise_name: '',
//     ownership_type: '',
//     ownership_type_other: '',
//     owner_special_category: '',
//     year_of_establishment: '',
//     uddyam_aadhar: '',
//     total_emp: '',
//     number_of_shg_emp: '',
//     // enterprise-type (collected in child table)
//     enterprise_types_tree: [], // [{ parent, children: [] }]

//     // PRODUCT + SERVICES (child table + some main fields)
//     products: [], // [{ main_product_name, activity_or_product_type, ... }]

//     // ENTERPRISE DETAILS
//     workplace_type: '',
//     workplace_type_other: '',
//     electricity_available: '',
//     electricity_detail: '',
//     electricity_other: '',
//     water_available: '',
//     water_detail: '',
//     water_other: '',
//     transportation_availability: '',
//     can_send_to_bijnor: '',
//     need_transport_help: '',

//     // INVESTMENT
//     monthly_income_estimate: '',
//     annual_turnover: '',
//     gross_profit: '',
//     working_capital_monthly: '',
//     has_shg_cif: '',
//     cif_fund_amt: '',
//     initial_investment: '',
//     source_of_investment_tree: [], // [{ parent, children: [] }]

//     // LOAN / SUBSIDY SECTION (child tables)
//     has_taken_loan: '',
//     loans: [], // [{ institution_tree, loan_amount, date_taken, repayment_status }]
//     has_receieved_subsidy: '',
//     subsidies: [], // [{ subsidy_type, subsidy_name_tree, subsidy_detail }]

//     // TRAINING RECEIVED / REQUIRED (child table)
//     is_training_received: '',
//     training_received_rows: [], // [{ department, sector_tree, duration, location, expected_income }]
//     is_training_required: '',
//     training_required_rows: [], // same structure as above
//     nearest_skill_centre: '',
//     skill_centre_loc: '',
//     nearest_industry: '',
//     industry_loc: '',

//     // SUPPORT REQUIRED
//     other_support: '',
//     other_support_specify: '',
//     other_support_loan_amount: '',
//     mentorship_support: '',
//     is_promo_ad_req: '',
//     promo_ad_specify: '',
//     infrastructure_support: '',
//     infrastructure_support_specify: '',
//     digital_emarket_support: '',
//     machinery_equipment_support: '',

//     // MEDIA (child table)
//     media: {
//       photo_entrepreneur: [],
//       photo_enterprise: [],
//       declaration_signature: [],
//       // these 3 are per-product handled via products[*].media
//     },

//     // DECLARATION
//     declaration_confirmed: '',
//     declaration_date: '',
//   });

//   const [loadingUser, setLoadingUser] = useState(true);
//   const [loggedUser, setLoggedUser] = useState(null);
//   const [submitting, setSubmitting] = useState(false);

//   const updateForm = (patch) => {
//     setExistingForm((prev) => ({ ...prev, ...patch }));
//   };

//   const getCreatedByNumeric = () => {
//     const candidate =
//       loggedUser?.id ??
//       loggedUser?.user_id ??
//       loggedUser?.pk ??
//       routeCrpUserId;
//     if (candidate == null) return null;
//     if (typeof candidate === 'number') return candidate;
//     if (typeof candidate === 'string' && /^\d+$/.test(candidate.trim())) {
//       return parseInt(candidate.trim(), 10);
//     }
//     return null;
//   };

//   // Load logged user + set auth token
//   useEffect(() => {
//     (async () => {
//       try {
//         const u = await getUser();
//         if (u) {
//           setLoggedUser(u);
//           if (u.access) {
//             gsApi.setAuthToken?.(u.access, u.refresh);
//           }
//         }
//       } catch (e) {
//         console.warn('Unable to load user', e);
//       } finally {
//         setLoadingUser(false);
//       }
//     })();
//   }, []);

//   // If editing, prefill some fields from existingEnterprise
//   useEffect(() => {
//     if (!existingEnterprise) return;
//     setExistingForm((prev) => ({
//       ...prev,
//       enterprise_name: existingEnterprise.enterprise_name || '',
//       ownership_type: existingEnterprise.ownership_type || '',
//       year_of_establishment: existingEnterprise.year_of_establishment || '',
//       uddyam_aadhar: existingEnterprise.uddyam_aadhar || '',
//       total_emp: existingEnterprise.total_emp || '',
//       number_of_shg_emp: existingEnterprise.number_of_shg_emp || '',
//       workplace_type: existingEnterprise.workplace_type || '',
//       electricity_available: existingEnterprise.electricity_available || '',
//       water_available: existingEnterprise.water_available || '',
//       transportation_availability:
//         existingEnterprise.transportation_availability || '',
//       can_send_to_bijnor: existingEnterprise.can_send_to_bijnor || '',
//       monthly_income_estimate:
//         existingEnterprise.monthly_income_estimate || '',
//       annual_turnover: existingEnterprise.annual_turnover || '',
//       gross_profit: existingEnterprise.gross_profit || '',
//       working_capital_monthly:
//         existingEnterprise.working_capital_monthly || '',
//       initial_investment: existingEnterprise.initial_investment || '',
//       declaration_confirmed:
//         existingEnterprise.declaration_confirmed || '',
//       declaration_date: existingEnterprise.declaration_date || '',
//     }));
//   }, [existingEnterprise]);

//   // ---- Recorded beneficiary helpers (taken from NewEnterpriseForm logic) ----

//   const findShgAcrossCachedPanchayats = async (shgCode) => {
//     if (!shgCode) return null;
//     try {
//       if (tempShg && (tempShg.code === shgCode || tempShg.shg_code === shgCode)) {
//         return extractLocationFromShg(tempShg);
//       }
//       const gps = getCrpPanchayats ? getCrpPanchayats() || [] : [];
//       for (const gp of gps) {
//         const pid = gp?.panchayat_id || gp?.panchayatId;
//         if (!pid) continue;
//         const cached = getShgListForPanchayat(pid) || [];
//         const found = cached.find((s) => {
//           const code = s.code ?? s.shg_code ?? s.lokos_shg_code ?? s.code;
//           return String(code) === String(shgCode);
//         });
//         if (found) return extractLocationFromShg(found);
//       }
//       return null;
//     } catch (e) {
//       console.warn('findShgAcrossCachedPanchayats error', e);
//       return null;
//     }
//   };

//   const ensureRecordedBeneficiary = async () => {
//     // 1. already present via route / existing enterprise
//     let recordedBenefId =
//       recordedBenef?.TH_urid ||
//       recordedBenef?.TH_URID ||
//       recordedBenef?.id ||
//       existingEnterprise?.recorded_beneficiary ||
//       null;

//     if (recordedBenefId) return recordedBenefId;

//     // 2. need beneficiary info to create
//     if (!beneficiary) {
//       throw new Error(
//         'Beneficiary data is missing. Please open this form again from SHG member list.'
//       );
//     }

//     const addr =
//       Array.isArray(beneficiary.member_addresses) &&
//       beneficiary.member_addresses.length > 0
//         ? beneficiary.member_addresses[0]
//         : null;

//     const phone =
//       Array.isArray(beneficiary.member_phones) &&
//       beneficiary.member_phones.length > 0
//         ? beneficiary.member_phones[0]
//         : null;

//     const addressText =
//       (addr?.address_line1 && String(addr.address_line1).trim()) ||
//       (addr?.address_line2 && String(addr.address_line2).trim()) ||
//       '';

//     const age = computeAgeFromDob(beneficiary.dob);

//     let district_id = addr?.district_id ?? addr?.districtId ?? null;
//     let block_id = addr?.block_id ?? addr?.blockId ?? null;
//     let panchayat_id = addr?.panchayat_id ?? addr?.panchayatId ?? null;
//     let village_id = addr?.village_id ?? addr?.villageId ?? null;
//     let member_mobile = phone?.phone_no ?? phone?.mobile ?? phone?.number ?? null;
//     let marital_status = beneficiary.marital_status ?? beneficiary.maritalStatus ?? '';
//     let father_husband_name =
//       beneficiary.father_husband ??
//       beneficiary.father_husband_name ??
//       beneficiary.relation_name ??
//       '';

//     let lokos_shg =
//       lokosShgCode ||
//       beneficiary.shg_code ||
//       beneficiary.lokos_shg_code ||
//       null;

//     // fallback from tempShg
//     if ((!district_id || !block_id || !panchayat_id || !village_id || !lokos_shg) && tempShg) {
//       const loc = extractLocationFromShg(tempShg);
//       if (loc) {
//         district_id = district_id || loc.district_id;
//         block_id = block_id || loc.block_id;
//         panchayat_id = panchayat_id || loc.panchayat_id;
//         village_id = village_id || loc.village_id;
//         lokos_shg = lokos_shg || loc.lokos_shg_code;
//       }
//     }

//     // cached SHG lists fallback
//     if ((!district_id || !block_id || !panchayat_id || !village_id || !lokos_shg) && lokos_shg) {
//       const fallback = await findShgAcrossCachedPanchayats(lokos_shg);
//       if (fallback) {
//         district_id = district_id || fallback.district_id;
//         block_id = block_id || fallback.block_id;
//         panchayat_id = panchayat_id || fallback.panchayat_id;
//         village_id = village_id || fallback.village_id;
//         lokos_shg = lokos_shg || fallback.lokos_shg_code;
//       }
//     }

//     // last resort: on-demand fetch from CRP block
//     if ((!district_id || !block_id || !panchayat_id || !village_id) && lokos_shg) {
//       try {
//         const crpDetail = getCrpDetail ? getCrpDetail() : null;
//         const cbid = crpDetail?.block_id ?? crpDetail?.blockId ?? null;
//         if (cbid) {
//           const shgRes = await gsApi.getUpsrlmShgList(cbid, { page_size: 5000 });
//           const shgRows = Array.isArray(shgRes?.data)
//             ? shgRes.data
//             : Array.isArray(shgRes?.results)
//             ? shgRes.results
//             : Array.isArray(shgRes)
//             ? shgRes
//             : [];
//           const found = shgRows.find((s) => {
//             const code = s.code ?? s.shg_code ?? s.lokos_shg_code ?? s.code;
//             return String(code) === String(lokos_shg);
//           });
//           if (found) {
//             const loc = extractLocationFromShg(found);
//             district_id = district_id || loc.district_id || null;
//             block_id = block_id || loc.block_id || null;
//             panchayat_id = panchayat_id || loc.panchayat_id || null;
//             village_id = village_id || loc.village_id || null;
//             lokos_shg = lokos_shg || loc.lokos_shg_code || null;
//           }
//         }
//       } catch (e) {
//         console.warn('on-demand SHG list fallback failed', e);
//       }
//     }

//     const createdBy = getCreatedByNumeric();

//     const recordedPayload = {
//       lokos_member_code:
//         beneficiary.member_code || beneficiary.nic_member_code || null,
//       applicant_name: beneficiary.member_name || '',
//       age,
//       gender: beneficiary.gender || '',
//       marital_status,
//       father_husband_name,
//       category: beneficiary.social_category || beneficiary.socialCategory || '',
//       education: beneficiary.education || '',
//       address: addressText,
//       district_id: district_id || null,
//       block_id: block_id || null,
//       panchayat_id: panchayat_id || null,
//       village_id: village_id || null,
//       mobile: member_mobile || null,
//       email: beneficiary.email || null,
//       lokos_shg_code: lokos_shg || null,
//     };

//     if (createdBy !== null) {
//       recordedPayload.created_by = createdBy;
//     }

//     const recRes = await gsApi.createRecordedBeneficiary(recordedPayload);
//     recordedBenefId =
//       recRes?.TH_urid || recRes?.TH_URID || recRes?.id || null;

//     if (!recordedBenefId) {
//       throw new Error('Recorded beneficiary created but ID missing in response.');
//     }

//     return recordedBenefId;
//   };

//   // Helpers to strip out child tables from main payload.
//   // Helpers to strip out child tables from main payload.
//   const buildMainPayload = (recordedBenefId) => {
//     const {
//       enterprise_types_tree,
//       products,
//       source_of_investment_tree,
//       loans,
//       subsidies,
//       training_received_rows,
//       training_required_rows,
//       media,
//       ...rest
//     } = existingForm;

//     const payload = {
//       ...rest,
//       recorded_benef_id: recordedBenefId || null,
//     };

//     return {
//       payload,
//       enterpriseTypesTree: Array.isArray(enterprise_types_tree)
//         ? enterprise_types_tree
//         : [],
//       products: Array.isArray(products) ? products : [],
//       sourceOfInvestmentTree: Array.isArray(source_of_investment_tree)
//         ? source_of_investment_tree
//         : [],
//       loans: Array.isArray(loans) ? loans : [],
//       subsidies: Array.isArray(subsidies) ? subsidies : [],
//       trainingReceivedRows: Array.isArray(training_received_rows)
//         ? training_received_rows
//         : [],
//       trainingRequiredRows: Array.isArray(training_required_rows)
//         ? training_required_rows
//         : [],
//       media: media || {},
//     };
//   };

//   // ============ CHILD TABLE SAVERS (ALL USING TH_urid IN enterprise_id) ============

//   // 1) Enterprise type sub-table
//   const saveEnterpriseTypes = async (enterpriseId, tree) => {
//     if (!enterpriseId || !Array.isArray(tree)) return;

//     for (const row of tree) {
//       if (!row.parent || !Array.isArray(row.children) || row.children.length === 0)
//         continue;

//       const mapped = `[${row.parent}: ${(row.children || []).join(', ')}]`;

//       await gsApi.createEnterpriseType({
//         // IMPORTANT: enterprise_id uses TH_urid of ExistingEnterpriseForm
//         enterprise_id: enterpriseId,
//         form_type: 'exep',
//         parent_category: row.parent,
//         sub_category: mapped,
//       });
//     }
//   };

//   // 2) Products + product-level media
//   const saveProductsAndMedia = async (enterpriseId, products) => {
//     if (!enterpriseId || !Array.isArray(products)) return;

//     for (const product of products) {
//       const {
//         media,
//         main_product_name,
//         activity_or_product_type,
//         product_features,
//         production_capacity,
//         raw_material,
//         machinery_equipment,
//         target_customers,
//         sales_area,
//         packaging_branding_status,
//         marketing_strategy,
//         marketing_channels,
//         marketing_challenges,
//         market_linkage,
//         accept_digital_payment,
//         avg_monthly_sales,
//       } = product;

//       // Product rows are created with TH_urid of ExistingEnterpriseForm in enterprise_id
//       const prodRes = await gsApi.createEnterpriseProduct({
//         enterprise_id: enterpriseId,
//         form_type: 'exep',
//         main_product_name,
//         activity_or_product_type,
//         product_features,
//         production_capacity,
//         raw_material,
//         machinery_equipment,
//         target_customers,
//         sales_area,
//         packaging_branding_status,
//         marketing_strategy,
//         marketing_channels: Array.isArray(marketing_channels)
//           ? marketing_channels.join(', ')
//           : marketing_channels || '',
//         marketing_challenges: Array.isArray(marketing_challenges)
//           ? marketing_challenges.join(', ')
//           : marketing_challenges || '',
//         market_linkage: Array.isArray(market_linkage)
//           ? market_linkage.join(', ')
//           : market_linkage || '',
//         accept_digital_payment,
//         avg_monthly_sales,
//       });

//       // TH_urid of the *product* row – this is what media should point to
//       const productUrid =
//         prodRes?.TH_urid || prodRes?.TH_URID || prodRes?.id || null;

//       // Media per product: media.enterprise_id = TH_urid of the product row
//       if (productUrid && media) {
//         const uploadGroup = async (fieldName, assets) => {
//           if (!Array.isArray(assets) || assets.length === 0) return;
//           for (const asset of assets) {
//             if (!asset?.uri) continue;

//             const formData = new FormData();
//             formData.append('enterprise_id', String(productUrid));
//             formData.append('form_type', 'exep');
//             formData.append(fieldName, {
//               uri: asset.uri,
//               name: asset.fileName || 'photo.jpg',
//               type: asset.type || 'image/jpeg',
//             });
//             await gsApi.uploadEnterpriseMedia(formData);
//           }
//         };

//         await uploadGroup('open_box_photo', media.open_box || []);
//         await uploadGroup('close_box_photo', media.close_box || []);
//         await uploadGroup('others', media.others || []);
//       }
//     }
//   };

//   // 3) Investment sources (SupportDetail with subsidy_type="Investment Source")
//   const saveInvestmentSources = async (enterpriseId, tree) => {
//     if (!enterpriseId || !Array.isArray(tree)) return;

//     for (const row of tree) {
//       if (!row.parent || !row.children || row.children.length === 0) continue;

//       const mapped = `[${row.parent}: ${(row.children || []).join(', ')}]`;

//       await gsApi.createEnterpriseSupportDetail({
//         // TH_urid of ExistingEnterpriseForm
//         enterprise_id: enterpriseId,
//         form_type: 'exep',
//         subsidy_type: 'Investment Source',
//         subsidy_name: mapped,
//         subsidy_detail: '',
//       });
//     }
//   };

//   // 4) Loan details sub-table
//   const saveLoans = async (enterpriseId, loans) => {
//     if (!enterpriseId || !Array.isArray(loans)) return;

//     for (const loan of loans) {
//       const { institution_tree, loan_amount, date_taken, repayment_status } = loan;

//       let institutionText = '';
//       if (Array.isArray(institution_tree) && institution_tree.length > 0) {
//         institutionText = institution_tree
//           .map(
//             (row) =>
//               `[${row.parent}: ${(row.children || []).join(', ')}]`
//           )
//           .join(', ');
//       }

//       await gsApi.createEnterpriseLoanDetail({
//         // TH_urid of ExistingEnterpriseForm
//         enterprise_id: enterpriseId,
//         form_type: 'exep',
//         institution_name: institutionText,
//         loan_amount,
//         date_taken,
//         repayment_status,
//       });
//     }
//   };

//   // 5) Subsidy / support details sub-table
//   const saveSubsidies = async (enterpriseId, subsidies) => {
//     if (!enterpriseId || !Array.isArray(subsidies)) return;

//     for (const sub of subsidies) {
//       const { subsidy_type, subsidy_name_tree, subsidy_detail } = sub;

//       let subsidyName = '';
//       if (Array.isArray(subsidy_name_tree) && subsidy_name_tree.length > 0) {
//         subsidyName = subsidy_name_tree
//           .map(
//             (row) =>
//               `[${row.parent}: ${(row.children || []).join(', ')}]`
//           )
//           .join(', ');
//       }

//       await gsApi.createEnterpriseSupportDetail({
//         // TH_urid of ExistingEnterpriseForm
//         enterprise_id: enterpriseId,
//         form_type: 'exep',
//         subsidy_type,
//         subsidy_name: subsidyName,
//         subsidy_detail,
//       });
//     }
//   };

//   // 6) Training received / required + training-level media
//   const saveTrainingReqs = async (enterpriseId, rows, formType) => {
//     if (!enterpriseId || !Array.isArray(rows)) return;

//     for (const r of rows) {
//       const {
//         department,
//         sector_tree,
//         duration,
//         location,
//         expected_income,
//         // only present for "training received" rows
//         certificates_files,
//       } = r;

//       let trainingModuleText = '';
//       if (Array.isArray(sector_tree) && sector_tree.length > 0) {
//         trainingModuleText = sector_tree
//           .map(
//             (row) =>
//               `[${row.parent}: ${(row.children || []).join(', ')}]`
//           )
//           .join(', ');
//       }

//       // Training row with enterprise_id = TH_urid of ExistingEnterpriseForm
//       const trRes = await gsApi.createEnterpriseTrainingReq({
//         enterprise_id: enterpriseId,
//         form_type: formType, // 'rec' or 'req'
//         department,
//         sector: (sector_tree || []).map((row) => row.parent).join(', '),
//         training_module_name: trainingModuleText,
//         duration: duration || '',
//         location: location || '',
//         expected_income: expected_income || '',
//       });

//       const trainingUrid =
//         trRes?.TH_urid || trRes?.TH_URID || trRes?.id || null;

//       // For Training/Skills: media.enterprise_id = TH_urid of *training* row
//       // Each training row can have its own certificates (comma-separated URLs in DB)
//       if (
//         formType === 'rec' &&
//         trainingUrid &&
//         Array.isArray(certificates_files) &&
//         certificates_files.length > 0
//       ) {
//         for (const asset of certificates_files) {
//           if (!asset?.uri) continue;

//           const fd = new FormData();
//           fd.append('enterprise_id', String(trainingUrid));
//           fd.append('form_type', 'exep'); // still tagged as existing-enterprise flow
//           // store certificates in "others" field
//           fd.append('others', {
//             uri: asset.uri,
//             name: asset.fileName || 'certificate.jpg',
//             type: asset.type || 'image/jpeg',
//           });

//           await gsApi.uploadEnterpriseMedia(fd);
//         }
//       }
//     }
//   };

//   // 7) Standalone enterprise media + declaration signature
//   const saveStandaloneMedia = async (enterpriseId, media) => {
//     if (!enterpriseId || !media) return;

//     const upload = async (fieldName, assets) => {
//       if (!Array.isArray(assets) || assets.length === 0) return;

//       for (const asset of assets) {
//         if (!asset?.uri) continue;

//         const formData = new FormData();
//         // TH_urid of ExistingEnterpriseForm
//         formData.append('enterprise_id', String(enterpriseId));
//         formData.append('form_type', 'exep');
//         formData.append(fieldName, {
//           uri: asset.uri,
//           name: asset.fileName || 'file.jpg',
//           type: asset.type || 'image/jpeg',
//         });
//         await gsApi.uploadEnterpriseMedia(formData);
//       }
//     };

//     // Enterprise-level photos
//     await upload('photo_entrepreneur', media.photo_entrepreneur || []);
//     await upload('photo_enterprise', media.photo_enterprise || []);

//     // Declaration: signature media rows will have enterprise_id = TH_urid of the
//     // existing-enterprise "declaration" row (here, the main ExistingEnterpriseForm row)
//     await upload('others', media.declaration_signature || []);
//   };


//   const handleSubmit = async () => {
//     try {
//       // 1) ensure recorded beneficiary exists (inspired by NewEnterpriseForm)
//       let recordedBenefId =
//         recordedBenef?.TH_urid ||
//         recordedBenef?.TH_URID ||
//         recordedBenef?.id ||
//         existingEnterprise?.recorded_beneficiary ||
//         null;

//       if (!recordedBenefId) {
//         try {
//           recordedBenefId = await ensureRecordedBeneficiary();
//         } catch (e) {
//           Alert.alert('Missing Beneficiary', e.message || String(e));
//           return;
//         }
//       }

//       // 2) Build main payload with recorded_beneficiary injected
//       const {
//         payload,
//         enterpriseTypesTree,
//         products,
//         sourceOfInvestmentTree,
//         loans,
//         subsidies,
//         trainingReceivedRows,
//         trainingRequiredRows,
//         media,
//       } = buildMainPayload(recordedBenefId);

//       // basic validation
//       if (!payload.enterprise_name) {
//         Alert.alert('Missing information', 'Please fill the Enterprise Name.');
//         return;
//       }

//       if (!payload.declaration_confirmed || payload.declaration_confirmed !== 'Yes') {
//         Alert.alert(
//           'Declaration required',
//           'Please confirm the declaration before submitting.'
//         );
//         return;
//       }

//       setSubmitting(true);

//       // 3) create / update existing enterprise
//       let enterpriseRes;
//       if (existingEnterprise?.id) {
//         enterpriseRes = await gsApi.updateExistingEnterprise(
//           existingEnterprise.id,
//           payload
//         );
//       } else {
//         enterpriseRes = await gsApi.createExistingEnterprise(payload);
//       }
//       const enterpriseId = enterpriseRes.TH_urid || existingEnterprise?.TH_urid;
//       if (!enterpriseId) {
//         throw new Error('Enterprise ID not returned from API');
//       }

//       // 4) link recorded beneficiary with this enterprise + enterprise_type='exep'
//       try {
//         await gsApi.updateRecordedBeneficiary(recordedBenefId, {
//           enterprise_id: enterpriseId,
//           enterprise_type: 'exep',
//         });
//       } catch (e) {
//         console.warn('Failed to link recorded beneficiary with enterprise', e);
//       }

//       // 5) child tables (best-effort, do not hard-fail)
//       try {
//         await saveEnterpriseTypes(enterpriseId, enterpriseTypesTree);
//       } catch (e) {
//         console.warn('Failed to save enterprise types', e);
//       }
//       try {
//         await saveProductsAndMedia(enterpriseId, products);
//       } catch (e) {
//         console.warn('Failed to save products/media', e);
//       }
//       try {
//         await saveInvestmentSources(enterpriseId, sourceOfInvestmentTree);
//       } catch (e) {
//         console.warn('Failed to save investment sources', e);
//       }
//       try {
//         await saveLoans(enterpriseId, loans);
//       } catch (e) {
//         console.warn('Failed to save loans', e);
//       }
//       try {
//         await saveSubsidies(enterpriseId, subsidies);
//       } catch (e) {
//         console.warn('Failed to save subsidies', e);
//       }
//       try {
//         await saveTrainingReqs(enterpriseId, trainingReceivedRows, 'rec');
//         await saveTrainingReqs(enterpriseId, trainingRequiredRows, 'req');
//       } catch (e) {
//         console.warn('Failed to save training reqs', e);
//       }
//       try {
//         await saveStandaloneMedia(enterpriseId, media);
//       } catch (e) {
//         console.warn('Failed to upload standalone media', e);
//       }

//       Alert.alert(
//         'Saved',
//         'Existing Enterprise form submitted successfully.',
//         [
//           {
//             text: 'OK',
//             onPress: () => {
//               navigation?.goBack?.();
//             },
//           },
//         ]
//       );
//     } catch (err) {
//       console.error('ExistingEnterprise submit error', err);
//       Alert.alert('Error', 'Unable to submit the form. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loadingUser) {
//     return (
//       <View
//         style={[
//           styles.container,
//           { justifyContent: 'center', alignItems: 'center' },
//         ]}
//       >
//         <ActivityIndicator size="large" />
//         <Text style={{ marginTop: 8 }}>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
//       <ExistingEnterpriseBasicInfoSection
//         existingForm={existingForm}
//         setExistingForm={updateForm}
//       />
//       <ExistingEnterpriseProductServicesSection
//         existingForm={existingForm}
//         setExistingForm={updateForm}
//       />
//       <ExistingEnterpriseEnterpriseDetailsSection
//         existingForm={existingForm}
//         setExistingForm={updateForm}
//       />
//       <ExistingEnterpriseInvestmentSection
//         existingForm={existingForm}
//         setExistingForm={updateForm}
//       />
//       <ExistingEnterpriseLoanSubsidySection
//         existingForm={existingForm}
//         setExistingForm={updateForm}
//       />
//       <ExistingEnterpriseTrainingSkillsSection
//         existingForm={existingForm}
//         setExistingForm={updateForm}
//       />
//       <ExistingEnterpriseSupportSection
//         existingForm={existingForm}
//         setExistingForm={updateForm}
//       />
//       <ExistingEnterpriseMediaSection
//         existingForm={existingForm}
//         setExistingForm={updateForm}
//       />
//       <ExistingEnterpriseDeclarationSection
//         existingForm={existingForm}
//         setExistingForm={updateForm}
//       />

//       {/* SINGLE submit button for the entire flow */}
//       <TouchableOpacity
//         style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
//         disabled={submitting}
//         onPress={handleSubmit}
//       >
//         {submitting ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.submitBtnText}>Submit Form</Text>
//         )}
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 14, backgroundColor: '#fff' },
//   submitBtn: {
//     marginTop: 24,
//     marginBottom: 40,
//     backgroundColor: '#EE6969',
//     paddingVertical: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   submitBtnText: {
//     color: '#fff',
//     fontWeight: '700',
//     fontSize: 16,
//   },
// });



// src/screens/screensProductionApp/ExistingEnterpriseForm.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import gsApi from '../../api/gsApi';
import { getUser } from '../../utils/auth';
import {
  getShgListForPanchayat,
  getCrpPanchayats,
  getCrpDetail,
} from '../../utils/tempStore';


// Section components
import ExistingEnterpriseBasicInfoSection from './FormSections/ExistingEnterpriseBasicInfoSection';
import ExistingEnterpriseProductServicesSection from './FormSections/ExistingEnterpriseProductServicesSection';
import ExistingEnterpriseEnterpriseDetailsSection from './FormSections/ExistingEnterpriseEnterpriseDetailsSection';
import ExistingEnterpriseInvestmentSection from './FormSections/ExistingEnterpriseInvestmentSection';
import ExistingEnterpriseLoanSubsidySection from './FormSections/ExistingEnterpriseLoanSubsidySection';
import ExistingEnterpriseTrainingSkillsSection from './FormSections/ExistingEnterpriseTrainingSkillsSection';
import ExistingEnterpriseSupportSection from './FormSections/ExistingEnterpriseSupportSection';
import ExistingEnterpriseMediaSection from './FormSections/ExistingEnterpriseMediaSection';
import ExistingEnterpriseDeclarationSection from './FormSections/ExistingEnterpriseDeclarationSection';

// ---- helpers (same style as NewEnterpriseForm) ----

const computeAgeFromDob = (dobStr) => {
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
  const existingEnterprise = route?.params?.existingEnterprise || null;

  // extra params from CRPRecordFlowProduction (same as NewEnterpriseForm)
  const beneficiary = route?.params?.beneficiary || null;
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
    other_support: '',
    other_support_specify: '',
    other_support_loan_amount: '',
    mentorship_support: '',
    is_promo_ad_req: '',
    promo_ad_specify: '',
    infrastructure_support: '',
    infrastructure_support_specify: '',
    digital_emarket_support: '',
    machinery_equipment_support: '',

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
  const TOTAL_SECTIONS = 9; // total number of sections in this form

  const updateForm = (patch) => {
    setExistingForm((prev) => ({ ...prev, ...patch }));
  };

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
    setExistingForm((prev) => ({
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
      transportation_availability:
        existingEnterprise.transportation_availability || '',
      can_send_to_bijnor: existingEnterprise.can_send_to_bijnor || '',
      monthly_income_estimate:
        existingEnterprise.monthly_income_estimate || '',
      annual_turnover: existingEnterprise.annual_turnover || '',
      gross_profit: existingEnterprise.gross_profit || '',
      working_capital_monthly:
        existingEnterprise.working_capital_monthly || '',
      initial_investment: existingEnterprise.initial_investment || '',
      declaration_confirmed:
        existingEnterprise.declaration_confirmed || '',
      declaration_date: existingEnterprise.declaration_date || '',
    }));
  }, [existingEnterprise]);

  // ---- Recorded beneficiary helpers (taken from NewEnterpriseForm logic) ----

  const findShgAcrossCachedPanchayats = async (shgCode) => {
    if (!shgCode) return null;
    try {
      if (tempShg && (tempShg.code === shgCode || tempShg.shg_code === shgCode)) {
        return extractLocationFromShg(tempShg);
      }
      const gps = getCrpPanchayats ? getCrpPanchayats() || [] : [];
      for (const gp of gps) {
        const pid = gp?.panchayat_id || gp?.panchayatId;
        if (!pid) continue;
        const cached = getShgListForPanchayat(pid) || [];
        const found = cached.find((s) => {
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
      recordedBenef?.TH_urid ||
      recordedBenef?.TH_URID ||
      recordedBenef?.id ||
      existingEnterprise?.recorded_beneficiary ||
      null;

    if (recordedBenefId) return recordedBenefId;

    // 2. need beneficiary info to create
    if (!beneficiary) {
      throw new Error(
        'Beneficiary data is missing. Please open this form again from SHG member list.'
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
    let member_mobile = phone?.phone_no ?? phone?.mobile ?? phone?.number ?? null;
    let marital_status = beneficiary.marital_status ?? beneficiary.maritalStatus ?? '';
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
    if ((!district_id || !block_id || !panchayat_id || !village_id || !lokos_shg) && tempShg) {
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
    if ((!district_id || !block_id || !panchayat_id || !village_id || !lokos_shg) && lokos_shg) {
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
    if ((!district_id || !block_id || !panchayat_id || !village_id) && lokos_shg) {
      try {
        const crpDetail = getCrpDetail ? getCrpDetail() : null;
        const cbid = crpDetail?.block_id ?? crpDetail?.blockId ?? null;
        if (cbid) {
          const shgRes = await gsApi.getUpsrlmShgList(cbid, { page_size: 5000 });
          const shgRows = Array.isArray(shgRes?.data)
            ? shgRes.data
            : Array.isArray(shgRes?.results)
            ? shgRes.results
            : Array.isArray(shgRes)
            ? shgRes
            : [];
          const found = shgRows.find((s) => {
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
    };

    if (createdBy !== null) {
      recordedPayload.created_by = createdBy;
    }

    const recRes = await gsApi.createRecordedBeneficiary(recordedPayload);
    recordedBenefId =
      recRes?.TH_urid || recRes?.TH_URID || recRes?.id || null;

    if (!recordedBenefId) {
      throw new Error('Recorded beneficiary created but ID missing in response.');
    }

    return recordedBenefId;
  };

  // Helpers to strip out child tables from main payload.
  // Helpers to strip out child tables from main payload.
  const buildMainPayload = (recordedBenefId) => {
    const {
      enterprise_types_tree,
      products,
      source_of_investment_tree,
      loans,
      subsidies,
      training_received_rows,
      training_required_rows,
      media,
      ...rest
    } = existingForm;
    const createdBy = getCreatedByNumeric(); // Calculate user ID
    const payload = {
      ...rest,
      recorded_benef_id: recordedBenefId || null,
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

    for (const row of tree) {
      if (!row.parent || !Array.isArray(row.children) || row.children.length === 0)
        continue;

      const mapped = `[${row.parent}: ${(row.children || []).join(', ')}]`;

      await gsApi.createEnterpriseType({
        // IMPORTANT: enterprise_id uses TH_urid of ExistingEnterpriseForm
        enterprise_id: enterpriseId,
        form_type: 'exep',
        parent_category: row.parent,
        sub_category: mapped,
      });
    }
  };

  // 2) Products + product-level media
  const saveProductsAndMedia = async (enterpriseId, products) => {
    if (!enterpriseId || !Array.isArray(products)) return;

    for (const product of products) {
      const {
        media,
        main_product_name,
        activity_or_product_type,
        product_features,
        production_capacity,
        raw_material,
        machinery_equipment,
        target_customers,
        sales_area,
        packaging_branding_status,
        marketing_strategy,
        marketing_channels,
        marketing_challenges,
        market_linkage,
        accept_digital_payment,
        avg_monthly_sales,
      } = product;

      // Product rows are created with TH_urid of ExistingEnterpriseForm in enterprise_id
      const prodRes = await gsApi.createEnterpriseProduct({
        enterprise_id: enterpriseId,
        form_type: 'exep',
        main_product_name,
        activity_or_product_type,
        product_features,
        production_capacity,
        raw_material,
        machinery_equipment,
        target_customers,
        sales_area,
        packaging_branding_status,
        marketing_strategy,
        marketing_channels: Array.isArray(marketing_channels)
          ? marketing_channels.join(', ')
          : marketing_channels || '',
        marketing_challenges: Array.isArray(marketing_challenges)
          ? marketing_challenges.join(', ')
          : marketing_challenges || '',
        market_linkage: Array.isArray(market_linkage)
          ? market_linkage.join(', ')
          : market_linkage || '',
        accept_digital_payment,
        avg_monthly_sales,
      });

      // TH_urid of the *product* row – this is what media should point to
      const productUrid =
        prodRes?.TH_urid || prodRes?.TH_URID || prodRes?.id || null;

      // Media per product: media.enterprise_id = TH_urid of the product row
      if (productUrid && media) {
        const uploadGroup = async (fieldName, assets) => {
          if (!Array.isArray(assets) || assets.length === 0) return;
          for (const asset of assets) {
            if (!asset?.uri) continue;

            const formData = new FormData();
            formData.append('enterprise_id', String(productUrid));
            formData.append('form_type', 'exep');
            formData.append(fieldName, {
              uri: asset.uri,
              name: asset.fileName || 'photo.jpg',
              type: asset.type || 'image/jpeg',
            });
            await gsApi.uploadEnterpriseMedia(formData);
          }
        };

        await uploadGroup('open_box_photo', media.open_box || []);
        await uploadGroup('close_box_photo', media.close_box || []);
        await uploadGroup('others', media.others || []);
      }
    }
  };

  // 3) Investment sources (SupportDetail with subsidy_type="Investment Source")
  const saveInvestmentSources = async (enterpriseId, tree) => {
    if (!enterpriseId || !Array.isArray(tree)) return;

    for (const row of tree) {
      if (!row.parent || !row.children || row.children.length === 0) continue;

      const mapped = `[${row.parent}: ${(row.children || []).join(', ')}]`;

      await gsApi.createEnterpriseSupportDetail({
        // TH_urid of ExistingEnterpriseForm
        enterprise_id: enterpriseId,
        form_type: 'exep',
        subsidy_type: 'Investment Source',
        subsidy_name: mapped,
        subsidy_detail: '',
      });
    }
  };

  // 4) Loan details sub-table
  const saveLoans = async (enterpriseId, loans) => {
    if (!enterpriseId || !Array.isArray(loans)) return;

    for (const loan of loans) {
      const { institution_tree, loan_amount, date_taken, repayment_status } = loan;

      let institutionText = '';
      if (Array.isArray(institution_tree) && institution_tree.length > 0) {
        institutionText = institution_tree
          .map(
            (row) =>
              `[${row.parent}: ${(row.children || []).join(', ')}]`
          )
          .join(', ');
      }

      await gsApi.createEnterpriseLoanDetail({
        // TH_urid of ExistingEnterpriseForm
        enterprise_id: enterpriseId,
        form_type: 'exep',
        institution_name: institutionText,
        loan_amount,
        date_taken,
        repayment_status,
      });
    }
  };

  // 5) Subsidy / support details sub-table
  const saveSubsidies = async (enterpriseId, subsidies) => {
    if (!enterpriseId || !Array.isArray(subsidies)) return;

    for (const sub of subsidies) {
      const { subsidy_type, subsidy_name_tree, subsidy_detail } = sub;

      let subsidyName = '';
      if (Array.isArray(subsidy_name_tree) && subsidy_name_tree.length > 0) {
        subsidyName = subsidy_name_tree
          .map(
            (row) =>
              `[${row.parent}: ${(row.children || []).join(', ')}]`
          )
          .join(', ');
      }

      await gsApi.createEnterpriseSupportDetail({
        // TH_urid of ExistingEnterpriseForm
        enterprise_id: enterpriseId,
        form_type: 'exep',
        subsidy_type,
        subsidy_name: subsidyName,
        subsidy_detail,
      });
    }
  };

  // 6) Training received / required + training-level media
  const saveTrainingReqs = async (enterpriseId, rows, formType) => {
    if (!enterpriseId || !Array.isArray(rows)) return;

    for (const r of rows) {
      const {
        department,
        sector_tree,
        duration,
        location,
        expected_income,
        // only present for "training received" rows
        certificates_files,
      } = r;

      let trainingModuleText = '';
      if (Array.isArray(sector_tree) && sector_tree.length > 0) {
        trainingModuleText = sector_tree
          .map(
            (row) =>
              `[${row.parent}: ${(row.children || []).join(', ')}]`
          )
          .join(', ');
      }

      // Training row with enterprise_id = TH_urid of ExistingEnterpriseForm
      const trRes = await gsApi.createEnterpriseTrainingReq({
        enterprise_id: enterpriseId,
        form_type: formType, // 'rec' or 'req'
        department,
        sector: (sector_tree || []).map((row) => row.parent).join(', '),
        training_module_name: trainingModuleText,
        duration: duration || '',
        location: location || '',
        expected_income: expected_income || '',
      });

      const trainingUrid =
        trRes?.TH_urid || trRes?.TH_URID || trRes?.id || null;

      // For Training/Skills: media.enterprise_id = TH_urid of *training* row
      // Each training row can have its own certificates (comma-separated URLs in DB)
      if (
        formType === 'rec' &&
        trainingUrid &&
        Array.isArray(certificates_files) &&
        certificates_files.length > 0
      ) {
        for (const asset of certificates_files) {
          if (!asset?.uri) continue;

          const fd = new FormData();
          fd.append('enterprise_id', String(trainingUrid));
          fd.append('form_type', 'exep'); // still tagged as existing-enterprise flow
          // store certificates in "others" field
          fd.append('others', {
            uri: asset.uri,
            name: asset.fileName || 'certificate.jpg',
            type: asset.type || 'image/jpeg',
          });

          await gsApi.uploadEnterpriseMedia(fd);
        }
      }
    }
  };

  // 7) Standalone enterprise media + declaration signature
  const saveStandaloneMedia = async (enterpriseId, media) => {
    if (!enterpriseId || !media) return;

    const upload = async (fieldName, assets) => {
      if (!Array.isArray(assets) || assets.length === 0) return;

      for (const asset of assets) {
        if (!asset?.uri) continue;

        const formData = new FormData();
        // TH_urid of ExistingEnterpriseForm
        formData.append('enterprise_id', String(enterpriseId));
        formData.append('form_type', 'exep');
        formData.append(fieldName, {
          uri: asset.uri,
          name: asset.fileName || 'file.jpg',
          type: asset.type || 'image/jpeg',
        });
        await gsApi.uploadEnterpriseMedia(formData);
      }
    };

    // Enterprise-level photos
    await upload('photo_entrepreneur', media.photo_entrepreneur || []);
    await upload('photo_enterprise', media.photo_enterprise || []);

    // Declaration: signature media rows will have enterprise_id = TH_urid of the
    // existing-enterprise "declaration" row (here, the main ExistingEnterpriseForm row)
    await upload('others', media.declaration_signature || []);
  };


  const handleSubmit = async () => {
    try {
      // 1) ensure recorded beneficiary exists (inspired by NewEnterpriseForm)
      let recordedBenefId =
        recordedBenef?.TH_urid ||
        recordedBenef?.TH_URID ||
        recordedBenef?.id ||
        existingEnterprise?.recorded_beneficiary ||
        null;

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

      // basic validation
      if (!payload.enterprise_name) {
        Alert.alert('Missing information', 'Please fill the Enterprise Name.');
        return;
      }

      if (!payload.declaration_confirmed || payload.declaration_confirmed !== 'Yes') {
        Alert.alert(
          'Declaration required',
          'Please confirm the declaration before submitting.'
        );
        return;
      }

      setSubmitting(true);

      // 3) create / update existing enterprise
      let enterpriseRes;
      if (existingEnterprise?.id) {
        enterpriseRes = await gsApi.updateExistingEnterprise(
          existingEnterprise.id,
          payload
        );
      } else {
        enterpriseRes = await gsApi.createExistingEnterprise(payload);
      }
      const enterpriseId = enterpriseRes.TH_urid || existingEnterprise?.TH_urid;
      if (!enterpriseId) {
        throw new Error('Enterprise ID not returned from API');
      }

      // 4) link recorded beneficiary with this enterprise + enterprise_type='exep'
      try {
        await gsApi.updateRecordedBeneficiary(recordedBenefId, {
          enterprise_id: enterpriseId,
          enterprise_type: 'exep',
        });
      } catch (e) {
        console.warn('Failed to link recorded beneficiary with enterprise', e);
      }

      // 5) child tables (best-effort, do not hard-fail)
      try {
        await saveEnterpriseTypes(enterpriseId, enterpriseTypesTree);
      } catch (e) {
        console.warn('Failed to save enterprise types', e);
      }
      try {
        await saveProductsAndMedia(enterpriseId, products);
      } catch (e) {
        console.warn('Failed to save products/media', e);
      }
      try {
        await saveInvestmentSources(enterpriseId, sourceOfInvestmentTree);
      } catch (e) {
        console.warn('Failed to save investment sources', e);
      }
      try {
        await saveLoans(enterpriseId, loans);
      } catch (e) {
        console.warn('Failed to save loans', e);
      }
      try {
        await saveSubsidies(enterpriseId, subsidies);
      } catch (e) {
        console.warn('Failed to save subsidies', e);
      }
      try {
        await saveTrainingReqs(enterpriseId, trainingReceivedRows, 'rec');
        await saveTrainingReqs(enterpriseId, trainingRequiredRows, 'req');
      } catch (e) {
        console.warn('Failed to save training reqs', e);
      }
      try {
        await saveStandaloneMedia(enterpriseId, media);
      } catch (e) {
        console.warn('Failed to upload standalone media', e);
      }

      Alert.alert(
        'Saved',
        'Existing Enterprise form submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation?.goBack?.();
            },
          },
        ]
      );
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

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
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
          <ExistingEnterpriseProductServicesSection
            existingForm={existingForm}
            setExistingForm={updateForm}
          />
        </View>

        {/* <View
          style={
            currentSectionIndex === 2
              ? styles.sectionVisible
              : styles.sectionHidden
          }
        >
          <ExistingEnterpriseEnterpriseDetailsSection
            existingForm={existingForm}
            setExistingForm={updateForm}
          />
        </View> */}

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

      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[
            styles.navBtn,
            (currentSectionIndex === 0 || submitting) && styles.navBtnDisabled,
          ]}
          disabled={currentSectionIndex === 0 || submitting}
          onPress={() =>
            setCurrentSectionIndex((prev) => (prev > 0 ? prev - 1 : prev))
          }
        >
          <Text style={styles.navBtnText}>Previous</Text>
        </TouchableOpacity>

        {currentSectionIndex < TOTAL_SECTIONS - 1 && (
          <TouchableOpacity
            style={[
              styles.navBtn,
              styles.navBtnPrimary,
              submitting && { opacity: 0.7 },
            ]}
            disabled={submitting}
            onPress={() =>
              setCurrentSectionIndex((prev) =>
                prev < TOTAL_SECTIONS - 1 ? prev + 1 : prev
              )
            }
          >
            <Text style={[styles.navBtnText, styles.navBtnPrimaryText]}>
              Next
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
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Form</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: '#fff' },

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