// // src/screens/screensProductionApp/FormSections/ExistingEnterpriseSupportSection.jsx
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';

// const YES_NO_OPTIONS = [
//   { label: 'Select...', value: '' },
//   { label: 'Yes', value: 'Yes' },
//   { label: 'No', value: 'No' },
// ];

// const OTHER_SUPPORT_TYPES = [
//   { label: 'Select...', value: '' },
//   { label: 'Grant and Subsidy', value: 'Grant and Subsidy' },
//   { label: 'Loan', value: 'Loan' },
//     { label: 'Interest Subvention', value: 'Interest Subvention' },
//   { label: 'Others', value: 'Others' },
// ];

// const LOAN_AMOUNT_OPTIONS = [
//    { label: 'Below to 50,000', value: 'Below to 50,000'},
//   { label: '50,000 - 1,00,000', value: '50,000 - 1,00,000' },
//   { label: '1,00,000 - 2,00,000', value: '1,00,000 - 2,00,000' },
//   { label: '2,00,000 - 5,00,000', value: '2,00,000 - 5,00,000' },
//    { label: 'Above to 5,00,000', value: 'Above to 5,00,000' },
//    { label: 'Other', value: 'Other' }, 
// ];

// const PROMO_OPTIONS = [
//   { label: 'Select...', value: '' },
//   { label: 'Physical', value: 'Physical' },
//   { label: 'Online', value: 'Online' },
//   { label: 'Others', value: 'Others' },
// ];

// const INFRA_OPTIONS = [
//   { label: 'Select...', value: '' },
//   { label: 'Factory', value: 'Factory' },
//   { label: 'Place of Business', value: 'Place of Business' },
//   { label: 'Others', value: 'Others' },
// ];

// /**
//  * Props:
//  *  - data: section slice of the master form (still used for YES/NO fields etc.)
//  *  - onChange: (partialUpdateObj) => void
//  *  - onNext?: () => void
//  *  - onBack?: () => void
//  */
// const ExistingEnterpriseSupportSection = ({
//   data = {},
//   onChange = () => {},
//   onNext,
//   onBack,
// }) => {
//   // still read other simple fields from data
//   const {
//     mentorship_support = '',
//     digital_emarket_support = '',
//   } = data;

//   // local state for Q25
//   const [otherSupportType, setOtherSupportType] = useState('');
//   const [otherSupportSpec, setOtherSupportSpec] = useState('');
//   const [otherSupportLoanRange, setOtherSupportLoanRange] = useState('');
//   const [otherSupportPreview, setOtherSupportPreview] = useState('');

//   // local state for Q27
//   const [promoType, setPromoType] = useState('');
//   const [promoSpec, setPromoSpec] = useState('');

//   // local state for Q28
//   const [infraType, setInfraType] = useState('');
//   const [infraSpec, setInfraSpec] = useState('');
//   const [machinery_equipment_support, setMes] = useState('');

//   const update = (patch) => {
//     onChange(patch);
//   };

//   // ---- Q25 helpers (local) ----
//   // const recalcOtherSupport = (type, spec, range) => {
//   //   let composed = '';
//   //   if (type === 'Loan' && range) {
//   //     composed = `{Loan: ${range}}`;
//   //   } else if (type === 'Cash' && spec) {
//   //     composed = `{Cash: ${spec}}`;
//   //   } else if (type === 'Others' && spec) {
//   //     composed = `{Others: ${spec}}`;
//   //   }
//   //   setOtherSupportPreview(composed);
//   //   // optionally send only the final string up
//   //   update({ other_support: composed });
//   // };

//   const recalcOtherSupport = (type, spec, range) => {
//   let composed = '';
//   if (type === 'Loan' && range) {
//     composed =
//       range === 'Other' && spec
//         ? `{Loan: ${spec}}`
//         : `{Loan: ${range}}`;
//   } else if (type === 'Grant and Subsidy' && spec) {
//     composed = `{Grant and Subsidy: ${spec}}`;
//   } else if (type === 'Interest Subvention' && spec) {
//     composed = `{Interest Subvention: ${spec}}`;
//   } else if (type === 'Others' && spec) {
//     composed = `{Others: ${spec}}`;
//   }
//   setOtherSupportPreview(composed);
//   update({ other_support: composed });
// };

//   const handleOtherSupportTypeChange = (val) => {
//     const nextType = val;
//     let nextRange = otherSupportLoanRange;

//     if (nextType !== 'Loan') {
//       nextRange = '';
//     }
//     setOtherSupportType(nextType);
//     setOtherSupportLoanRange(nextRange);
//     recalcOtherSupport(nextType, otherSupportSpec, nextRange);
//   };

//   const handleOtherSupportSpecChange = (text) => {
//     setOtherSupportSpec(text);
//     recalcOtherSupport(otherSupportType, text, otherSupportLoanRange);
//   };

//   const handleOtherSupportLoanRangeChange = (val) => {
//     setOtherSupportLoanRange(val);
//     recalcOtherSupport(otherSupportType, otherSupportSpec, val);
//   };

//   const renderYesNoPicker = (label, value, fieldKey, helpText) => (
//     <View style={styles.fieldBlock} key={fieldKey}>
//       <Text style={styles.label}>{label}</Text>
//       <Text style={styles.helpText}>{helpText}</Text>
//       <Picker
//         selectedValue={value}
//         style={[styles.input, styles.dropdown]}
//         onValueChange={(v) => update({ [fieldKey]: v })}
//       >
//         {YES_NO_OPTIONS.map((opt) => (
//           <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
//         ))}
//       </Picker>
//     </View>
//   );

//   return (
//     <ScrollView
//       style={styles.container}
//       keyboardShouldPersistTaps="handled"
//       contentContainerStyle={{ paddingBottom: 20 }}
//     >
//       <Text style={styles.sectionTitle}>7) Support Required</Text>

//       {/* 25) Financial support (local state) */}
//       <View style={styles.fieldBlock}>
//         <Text style={styles.label}>
//           25) Is any financial support required? (अन्य वित्तीय सहायता की आवश्यकता है?)
//         </Text>
//         <Text style={styles.helpText}>
//           Please choose the type of financial support you need. If you select Cash or
//           Others, kindly specify in detail. If you select Loan, please choose the
//           approximate amount range. Thank you.
//         </Text>

//         <Picker
//           selectedValue={otherSupportType}
//           onValueChange={handleOtherSupportTypeChange}
//           style={[styles.input, styles.dropdown]}
//         >
//           {OTHER_SUPPORT_TYPES.map((opt) => (
//             <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
//           ))}
//         </Picker>

//         {(
//   otherSupportType === 'Grant and Subsidy' ||
//   otherSupportType === 'Others' ||
//   otherSupportType === 'Interest Subvention'
// ) && (
//   <TextInput
//     style={[styles.input, { marginTop: 8 }]}
//     placeholder={
//       otherSupportType === 'Grant and Subsidy'
//         ? 'Please specify the Grant and Subsidy support required.'
//         : otherSupportType === 'Interest Subvention'
//         ? 'Please specify the Interest Subvention support required.'
//         : 'Please specify the other type of support required.'
//     }
//     value={otherSupportSpec}
//     onChangeText={handleOtherSupportSpecChange}
//     multiline
//   />
// )}

//         {otherSupportType === 'Loan' && (
//           <View style={{ marginTop: 10 }}>
//             <Text style={styles.label}>If Loan, what amount range is required?</Text>
//             <Text style={styles.helpText}>
//               Please select the loan amount range you require. This will help in planning
//               suitable financial linkages.
//             </Text>
//             <Picker
//               selectedValue={otherSupportLoanRange}
//               onValueChange={handleOtherSupportLoanRangeChange}
//               style={[styles.input, styles.dropdown]}
//             >
//               <Picker.Item label="Select amount range..." value="" />
//               {LOAN_AMOUNT_OPTIONS.map((opt) => (
//                 <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
//               ))}
//             </Picker>
//             {otherSupportType === 'Loan' && otherSupportLoanRange === 'Other' && (
//   <TextInput
//     style={[styles.input, { marginTop: 8 }]}
//     placeholder="Please specify the loan amount required."
//     value={otherSupportSpec}
//     onChangeText={handleOtherSupportSpecChange}
//     multiline
//   />
// )}
//           </View>
//         )}

        
//       </View>

//       {/* 26) Mentorship support (still controlled) */}
//       {/* {renderYesNoPicker(
//         '26) Do you require Mentorship support? (क्या आपको मार्गदर्शन/मेंटर्शिप सहायता की आवश्यकता है?)',
//         mentorship_support,
//         'mentorship_support',
//         'Please select Yes if you would like regular guidance or mentorship for running or expanding your enterprise.'
//       )} */}

//       {/* 27) Branding / promotion support (local state for picker + specify) */}
//       <View style={styles.fieldBlock}>
//         <Text style={styles.label}>
//           27) What type of Branding Promotion Assistance do you require?
//           (आपको किस प्रकार की ब्रांडिंग/प्रमोशन सहायता चाहिए?)
//         </Text>
//         <Text style={styles.helpText}>
//           Please select how you would like support for promoting your enterprise. If you
//           select any option, you may also briefly specify your exact requirement.
//         </Text>

//         <Picker
//           selectedValue={promoType}
//           onValueChange={(v) => {
//             setPromoType(v);
//             if (v === '') {
//               setPromoSpec('');
//             }
//           }}
//           style={[styles.input, styles.dropdown]}
//         >
//           {PROMO_OPTIONS.map((opt) => (
//             <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
//           ))}
//         </Picker>

//         {promoType === 'Others' && (
//           <TextInput
//             style={[styles.input, { marginTop: 8 }]}
//             placeholder="Please specify the type of branding/promotion assistance you require."
//             value={promoSpec}
//             onChangeText={setPromoSpec}
//             multiline
//           />
//         )}
//       </View>

//       {/* 28) Infrastructure support (local state for picker + specify) */}
//       <View style={styles.fieldBlock}>
//         <Text style={styles.label}>
//           28) What type of Infrastructure support do you require?
//           (आपको किस प्रकार का आधारभूत संरचना सहयोग चाहिए?)
//         </Text>
//         <Text style={styles.helpText}>
//           Please select the main type of infrastructure support you need. You may further
//           describe your requirement in the text box.
//         </Text>

//         <Picker
//           selectedValue={infraType}
//           onValueChange={(v) => {
//             setInfraType(v);
//             if (v === '') {
//               setInfraSpec('');
//             }
//           }}
//           style={[styles.input, styles.dropdown]}
//         >
//           {INFRA_OPTIONS.map((opt) => (
//             <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
//           ))}
//         </Picker>

//         {infraType === 'Others' && (
//           <TextInput
//             style={[styles.input, { marginTop: 8 }]}
//             placeholder="Please specify the exact infrastructure support you require."
//             value={infraSpec}
//             onChangeText={setInfraSpec}
//             multiline
//           />
//         )}
//       </View>

//       {/* 29) Digital e-market support (still controlled) */}
//       {/* {renderYesNoPicker(
//         '29) Do you require Digital E-Market support? (क्या आपको डिजिटल ई-मार्केट सहायता चाहिए?)',
//         digital_emarket_support,
//         'digital_emarket_support',
//         'Please select Yes if you want support in selling your products through digital / online platforms.'
//       )} */}

//       {/* 30) Machinery / equipment support (still controlled) */}
//       {/* {renderYesNoPicker(
//         '30) Do you require Machinery / Equipment support? (क्या आपको मशीनरी/उपकरण सहायता चाहिए?)',
//         machinery_equipment_support,
//         'machinery_equipment_support',
//         'Please select Yes if you need help in getting machinery or equipment for your enterprise.'
//       )} */}

//       {/* <View style={styles.fieldBlock}>
//   <Text style={styles.label}>
//     30) Do you require Machinery / Equipment support? (क्या आपको मशीनरी/उपकरण सहायता चाहिए?)
//   </Text>
//   <Text style={styles.helpText}>
//     Please select Yes if you need help in getting machinery or equipment for your enterprise.
//   </Text>

//   <Picker
//     selectedValue={machinery_equipment_support }
//     style={[styles.input, styles.dropdown]}
//     onValueChange={(val) => update({ machinery_equipment_support: val })}
//   >
//     {YES_NO_OPTIONS.map((opt) => (
//       <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
//     ))}
//   </Picker>

//   {machinery_equipment_support === 'Yes' && (
//     <TextInput
//       style={[styles.input, { marginTop: 8 }]}
//       placeholder="Please specify the machinery / equipment required."
//       value={machinery_equipment_support || ''}
//       onChangeText={(v) => update({ machinery_equipment_support: v })}
//       multiline
//     />
//   )}
// </View> */}

// {/* 30) Machinery / equipment support */}
// {/* 30) Machinery / Equipment support */}
// <View style={styles.fieldBlock}>
//   <Text style={styles.label}>
//     30) Do you require Machinery / Equipment support? (क्या आपको मशीनरी/उपकरण सहायता चाहिए?)
//   </Text>
//   <Text style={styles.helpText}>
//     Please select Yes if you need help in getting machinery or equipment for your enterprise.
//   </Text>

//   {/* Yes/No Picker */}
//   <Picker
//     selectedValue={machinery_equipment_support?.startsWith('Yes') ? 'Yes' : 'No'}
//     style={[styles.input, styles.dropdown]}
//     onValueChange={(val) => {setMes(val);
//     }}
//   >
//     {YES_NO_OPTIONS.map((opt) => (
//       <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
//     ))}
//   </Picker>

//   {/* TextInput only if Yes */}
//   {machinery_equipment_support?.startsWith('Yes') && (
//     <TextInput
//       style={[styles.input, { marginTop: 8 }]}
//       placeholder="Please specify the machinery / equipment required."
//       value={machinery_equipment_support.includes(',') 
//               ? machinery_equipment_support.split(',')[1].trim() 
//               : ''}
//       onChangeText={(v) => setMes(`Yes, ${v}`) }
//       multiline
//     />
//   )}
// </View>




//       <View style={styles.navRow}>
//         {onBack && (
//           <TouchableOpacity style={[styles.navBtn, styles.navBtnSecondary]} onPress={onBack}>
//             <Text style={styles.navBtnSecondaryText}>Back</Text>
//           </TouchableOpacity>
//         )}
//         {onNext && (
//           <TouchableOpacity style={[styles.navBtn, styles.navBtnPrimary]} onPress={onNext}>
//             <Text style={styles.navBtnPrimaryText}>Next</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff', padding: 14 },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     marginBottom: 12,
//     color: '#222',
//   },
//   fieldBlock: {
//     marginBottom: 16,
//   },
//   label: {
//     fontWeight: 'bold',
//     marginBottom: 4,
//     color: '#333',
//   },
//   helpText: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 6,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#bbb',
//     borderRadius: 6,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     fontSize: 15,
//     backgroundColor: '#fff',
//   },
//   dropdown: {
//     height: 52,
//     justifyContent: 'center',
//   },
//   previewText: {
//     marginTop: 6,
//     fontSize: 11,
//     color: '#999',
//   },
//   navRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 12,
//   },
//   navBtn: {
//     paddingVertical: 10,
//     paddingHorizontal: 18,
//     borderRadius: 6,
//   },
//   navBtnPrimary: {
//     backgroundColor: '#EE6969',
//   },
//   navBtnPrimaryText: {
//     color: '#fff',
//     fontWeight: '700',
//   },
//   navBtnSecondary: {
//     backgroundColor: '#eee',
//   },
//   navBtnSecondaryText: {
//     color: '#333',
//     fontWeight: '600',
//   },
// });

// export default ExistingEnterpriseSupportSection;




// src/screens/screensProductionApp/FormSections/ExistingEnterpriseSupportSection.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import LanguageToggle from '../../../components/LanguageToggle';
import { LanguageContext } from '../../../components/LanguageContext';
import { useContext } from 'react';
/* ---------------- OPTIONS ---------------- */

// const YES_NO_OPTIONS = [
//   { label: 'Select...', value: '' },
//   { label: 'Yes', value: 'Yes' },
//   { label: 'No', value: 'No' },
// ];

// const OTHER_SUPPORT_TYPES = [
//   { label: 'Select...', value: '' },
//   { label: 'Grant and Subsidy', value: 'Grant and Subsidy' },
//   { label: 'Loan', value: 'Loan' },
//   { label: 'Interest Subvention', value: 'Interest Subvention' },
//   { label: 'Others', value: 'Others' },
// ];

// const LOAN_AMOUNT_OPTIONS = [
//   { label: 'Below to 50,000', value: 'Below to 50,000' },
//   { label: '50,000 - 1,00,000', value: '50,000 - 1,00,000' },
//   { label: '1,00,000 - 2,00,000', value: '1,00,000 - 2,00,000' },
//   { label: '2,00,000 - 5,00,000', value: '2,00,000 - 5,00,000' },
//   { label: 'Above to 5,00,000', value: 'Above to 5,00,000' },
//   { label: 'Other', value: 'Other' },
// ];

// const INFRA_OPTIONS = [
//   { label: 'Select...', value: '' },
//   { label: 'Factory', value: 'Factory' },
//   { label: 'Place of Business', value: 'Place of Business' },
//   { label: 'Others', value: 'Others' },
// ];

// ✅ BILINGUAL
const YES_NO_OPTIONS = [
  { value: '', en: 'Select...', hi: 'चयन करें...' },
  { value: 'Yes', en: 'Yes', hi: 'हाँ' },
  { value: 'No', en: 'No', hi: 'नहीं' },
];

// ✅ BILINGUAL
const OTHER_SUPPORT_TYPES = [
  { value: '', en: 'Select...', hi: 'चयन करें...' },
  { value: 'Grant and Subsidy', en: 'Grant and Subsidy', hi: 'अनुदान एवं सब्सिडी' },
  { value: 'Loan', en: 'Loan', hi: 'ऋण' },
  { value: 'Interest Subvention', en: 'Interest Subvention', hi: 'ब्याज अनुदान' },
  { value: 'Others', en: 'Others', hi: 'अन्य' },
];

// ✅ BILINGUAL
const LOAN_AMOUNT_OPTIONS = [
  { value: 'Below to 50,000', en: 'Below 50,000', hi: '50,000 से कम' },
  { value: '50,000 - 1,00,000', en: '50,000 - 1,00,000', hi: '50,000 - 1,00,000' },
  { value: '1,00,000 - 2,00,000', en: '1,00,000 - 2,00,000', hi: '1,00,000 - 2,00,000' },
  { value: '2,00,000 - 5,00,000', en: '2,00,000 - 5,00,000', hi: '2,00,000 - 5,00,000' },
  { value: 'Above to 5,00,000', en: 'Above 5,00,000', hi: '5,00,000 से अधिक' },
  { value: 'Other', en: 'Other', hi: 'अन्य' },
];

// ✅ BILINGUAL
const INFRA_OPTIONS = [
  { value: '', en: 'Select...', hi: 'चयन करें...' },
  { value: 'Factory', en: 'Factory', hi: 'फैक्ट्री' },
  { value: 'Place of Business', en: 'Place of Business', hi: 'व्यवसाय स्थल' },
  { value: 'Others', en: 'Others', hi: 'अन्य' },
];

/* ---------------- COMPONENT ---------------- */

const ExistingEnterpriseSupportSection = ({
  data = {},
  onChange = () => {},
  onNext,
  onBack,
}) => {
   // ✅ ALL HOOKS FIRST — NO EXCEPTIONS
   const { language } = useContext(LanguageContext);
  const [needSupport, setNeedSupport] = useState('');
  const [selected, setSelected] = useState({
    financial: false,
    infrastructure: false,
    machinery: false,
    other: false,
  });

  const [supportData, setSupportData] = useState({
    financial: { type: '', amount: '', spec: '' },
    infrastructure: { type: '', spec: '' },
    machinery: '',
    other: '',
  });

  // ✅ THEN destructure props
  const {
    mentorship_support = '',
    digital_emarket_support = '',
  } = data;

  const updateDB = (updated) => {
    const payload = {};
    Object.keys(selected).forEach((k) => {
      if (selected[k]) payload[k] = updated[k];
    });
    onChange({ support_required: payload });
  };

  const toggle = (key) => {
    const next = { ...selected, [key]: !selected[key] };
    setSelected(next);
    updateDB(supportData);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 10,
                              }}
                            >
      <Text style={styles.sectionTitle}> {language === 'hi' ? '7) आवश्यक सहयोग' : '7) Support Required'}</Text>
<LanguageToggle/></View>
      {/* MAIN QUESTION */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
           {language === 'hi'
    ? 'क्या आपको किसी प्रकार के सहयोग की आवश्यकता है?'
    : 'Do you require any support?'}
        </Text>
<View style={styles.pickerWrapper}>
        <Picker
          selectedValue={needSupport}
          style={[styles.input, styles.dropdown]}
          onValueChange={(v) => {
            setNeedSupport(v);
            if (v === 'No') {
              setSelected({ financial: false, infrastructure: false, machinery: false, other: false });
              onChange({ support_required: {} });
            }
          }}
        >
          {YES_NO_OPTIONS.map((o) => (
            <Picker.Item key={o.value} label={language === 'hi' ? o.hi : o.en} value={o.value} />
          ))}
        </Picker>
        </View>
      </View>

      {/* CHECKBOX OPTIONS */}
      {needSupport === 'Yes' && (
        <>
          {['financial', 'infrastructure', 'machinery', 'other'].map((k) => (
            <TouchableOpacity
              key={k}
              style={styles.checkboxRow}
              onPress={() => toggle(k)}
            >
              <Text style={styles.checkbox}>
                {selected[k] ? '☑' : '☐'}
              </Text>
              <Text style={styles.checkboxLabel}>
                {/* {k.charAt(0).toUpperCase() + k.slice(1)} Support */}
                 {language === 'hi'
    ? k === 'financial'
      ? 'वित्तीय सहयोग'
      : k === 'infrastructure'
      ? 'इन्फ्रास्ट्रक्चर सहयोग'
      : k === 'machinery'
      ? 'मशीनरी सहयोग'
      : 'अन्य सहयोग'
    : `${k.charAt(0).toUpperCase() + k.slice(1)} Support`}
              </Text>
            </TouchableOpacity>
          ))}

          {/* FINANCIAL */}
          {selected.financial && (
            <View style={styles.subBlock}>
              <Text style={styles.label}>{language === 'hi'
    ? 'वित्तीय सहयोग का प्रकार'
    : 'Financial Support Type'}</Text>
              <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={supportData.financial.type}
               style={[styles.input, styles.dropdown]}
                onValueChange={(v) => {
                  const d = { ...supportData, financial: { ...supportData.financial, type: v } };
                  setSupportData(d);
                  updateDB(d);
                }}
              >
                {OTHER_SUPPORT_TYPES.map((o) => (
                  <Picker.Item key={o.value} label={language === 'hi' ? o.hi : o.en} value={o.value} />
                ))}
              </Picker>
              </View>

              {supportData.financial.type === 'Loan' && (
                <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={supportData.financial.amount}
                  style={[styles.input, styles.dropdown, { marginTop: 8 }]}
                  onValueChange={(v) => {
                    const d = { ...supportData, financial: { ...supportData.financial, amount: v } };
                    setSupportData(d);
                    updateDB(d);
                  }}
                >
                  {LOAN_AMOUNT_OPTIONS.map((o) => (
                    <Picker.Item key={o.value} label={o.label} value={o.value} />
                  ))}
                </Picker>
                 </View>
              )}

              {(supportData.financial.type === 'Others' ||
                supportData.financial.type === 'Grant and Subsidy' ||
                supportData.financial.type === 'Interest Subvention') && (
                <TextInput
                  style={[styles.input, { marginTop: 8 }]}
                  placeholder={language === 'hi' ? 'कृपया विवरण लिखें' : 'Please specify'}
                  onChangeText={(v) => {
                    const d = { ...supportData, financial: { ...supportData.financial, spec: v } };
                    setSupportData(d);
                    updateDB(d);
                  }}
                />
              )}
            </View>
          )}

          {/* INFRA */}
          {selected.infrastructure && (
            <View style={styles.subBlock}>
              <Text style={styles.label}>  {language === 'hi'
    ? 'इन्फ्रास्ट्रक्चर सहयोग'
    : 'Infrastructure Support'}</Text>
              <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={supportData.infrastructure.type}
                style={[styles.input, styles.dropdown]}
                onValueChange={(v) => {
                  const d = { ...supportData, infrastructure: { type: v, spec: '' } };
                  setSupportData(d);
                  updateDB(d);
                }}
              >
                {INFRA_OPTIONS.map((o) => (
                  <Picker.Item key={o.value} label={language === 'hi' ? o.hi : o.en} value={o.value} />
                ))}
              </Picker>
              </View>

              {supportData.infrastructure.type === 'Others' && (
                <TextInput
                  style={[styles.input, { marginTop: 8 }]}
                  placeholder={language === 'hi' ? 'कृपया विवरण लिखें' : 'Please specify'}
                  onChangeText={(v) => {
                    const d = { ...supportData, infrastructure: { ...supportData.infrastructure, spec: v } };
                    setSupportData(d);
                    updateDB(d);
                  }}
                />
              )}
            </View>
          )}

          {/* MACHINERY */}
          {selected.machinery && (
            <TextInput
              style={[styles.input, styles.subBlock]}
              placeholder={
  language === 'hi'
    ? 'आवश्यक मशीनरी / उपकरण का विवरण दें'
    : 'Specify machinery / equipment required'
}
              onChangeText={(v) => {
                const d = { ...supportData, machinery: v };
                setSupportData(d);
                updateDB(d);
              }}
            />
          )}

          {/* OTHER */}
          {selected.other && (
            <TextInput
              style={[styles.input, styles.subBlock]}
              placeholder={
  language === 'hi'
    ? 'अन्य आवश्यक सहयोग का विवरण दें'
    : 'Specify other support required'
}
              onChangeText={(v) => {
                const d = { ...supportData, other: v };
                setSupportData(d);
                updateDB(d);
              }}
            />
          )}
        </>
      )}

      {/* NAV */}
      <View style={styles.navRow}>
        {onBack && (
          <TouchableOpacity style={styles.navBtnSecondary} onPress={onBack}>
            <Text> {language === 'hi' ? 'वापस' : 'Back'}</Text>
          </TouchableOpacity>
        )}
        {onNext && (
          <TouchableOpacity style={styles.navBtnPrimary} onPress={onNext}>
            <Text style={{ color: '#fff' }}>{language === 'hi' ? 'आगे बढ़ें' : 'Next'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  fieldBlock: { marginBottom: 14 },
  subBlock: { marginTop: 12 },
  label: { fontWeight: '700', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#EE6969', borderRadius: 6, padding: 10 },
  dropdown: { height: 52 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  checkbox: { fontSize: 20, marginRight: 10 },
  checkboxLabel: { fontSize: 15 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  navBtnPrimary: { backgroundColor: '#EE6969', padding: 12, borderRadius: 6 },
  navBtnSecondary: { backgroundColor: '#eee', padding: 12, borderRadius: 6 },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    overflow: 'hidden',
  },
});

export default ExistingEnterpriseSupportSection;
