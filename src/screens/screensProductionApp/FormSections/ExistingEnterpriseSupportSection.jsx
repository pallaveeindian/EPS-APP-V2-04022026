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
