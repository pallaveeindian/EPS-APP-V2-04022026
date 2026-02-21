// src/screens/screensProductionApp/FormSections/ExistingEnterpriseSupportSection.jsx
import React, { useState, useContext, useEffect } from 'react';
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

const YES_NO_OPTIONS = [
  { value: '', en: 'Select...', hi: 'चयन करें...' },
  { value: 'Yes', en: 'Yes', hi: 'हाँ' },
  { value: 'No', en: 'No', hi: 'नहीं' },
];

const OTHER_SUPPORT_TYPES = [
  { value: '', en: 'Select...', hi: 'चयन करें...' },
  {
    value: 'Grant and Subsidy',
    en: 'Grant and Subsidy',
    hi: 'अनुदान एवं सब्सिडी',
  },
  { value: 'Loan', en: 'Loan', hi: 'ऋण' },
  {
    value: 'Interest Subvention',
    en: 'Interest Subvention',
    hi: 'ब्याज अनुदान',
  },
  { value: 'Others', en: 'Others', hi: 'अन्य' },
];

const LOAN_AMOUNT_OPTIONS = [
  { value: 'Below 50,000', en: 'Below 50,000', hi: '50,000 से कम' },
  {
    value: '50,000 - 1,00,000',
    en: '50,000 - 1,00,000',
    hi: '50,000 - 1,00,000',
  },
  {
    value: '1,00,000 - 2,00,000',
    en: '1,00,000 - 2,00,000',
    hi: '1,00,000 - 2,00,000',
  },
  {
    value: '2,00,000 - 5,00,000',
    en: '2,00,000 - 5,00,000',
    hi: '2,00,000 - 5,00,000',
  },
  { value: 'Above 5,00,000', en: 'Above 5,00,000', hi: '5,00,000 से अधिक' },
  { value: 'Other', en: 'Other', hi: 'अन्य' },
];

const INFRA_OPTIONS = [
  { value: '', en: 'Select...', hi: 'चयन करें...' },
  { value: 'Factory', en: 'Factory', hi: 'फैक्ट्री' },
  { value: 'Place of Business', en: 'Place of Business', hi: 'व्यवसाय स्थल' },
  { value: 'Others', en: 'Others', hi: 'अन्य' },
];

const ExistingEnterpriseSupportSection = ({
  existingForm = {},
  setExistingForm = () => {},
  onNext,
  onBack,
}) => {
  const { language } = useContext(LanguageContext);

  const [needSupport, setNeedSupport] = useState(
    existingForm.support_required ? 'Yes' : '',
  );

  const [selected, setSelected] = useState({
    financial: !!existingForm.support_required?.financial,
    infrastructure: !!existingForm.support_required?.infrastructure,
    machinery: !!existingForm.support_required?.machinery,
    other: !!existingForm.support_required?.other,
  });

  const [supportData, setSupportData] = useState({
    financial: existingForm.support_required?.financial || {
      type: '',
      amount: '',
      spec: '',
    },
    infrastructure: existingForm.support_required?.infrastructure || {
      type: '',
      spec: '',
    },
    machinery: existingForm.support_required?.machinery || '',
    other: existingForm.support_required?.other || '',
  });

  const syncWithParent = (currSelected, currData) => {
    const payload = {};
    if (currSelected.financial) payload.financial = currData.financial;
    if (currSelected.infrastructure)
      payload.infrastructure = currData.infrastructure;
    if (currSelected.machinery) payload.machinery = currData.machinery;
    if (currSelected.other) payload.other = currData.other;

    setExistingForm({ support_required: payload });
  };

  const toggleCategory = key => {
    const nextSelected = { ...selected, [key]: !selected[key] };
    setSelected(nextSelected);
    syncWithParent(nextSelected, supportData);
  };

  const handleValueChange = (category, patch) => {
    const nextData = {
      ...supportData,
      [category]:
        typeof patch === 'object'
          ? { ...supportData[category], ...patch }
          : patch,
    };
    setSupportData(nextData);
    syncWithParent(selected, nextData);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>
          {' '}
          {language === 'hi' ? '7) आवश्यक सहयोग' : '7) Support Required'}
        </Text>
        <LanguageToggle />
      </View>

      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          {language === 'hi'
            ? 'क्या आपको किसी प्रकार के सहयोग की आवश्यकता है?'
            : 'Do you require any support?'}
        </Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={needSupport}
            onValueChange={v => {
              setNeedSupport(v);
              if (v === 'No') {
                setSelected({
                  financial: false,
                  infrastructure: false,
                  machinery: false,
                  other: false,
                });
                setExistingForm({
                  is_support_required: 'No',
                  support_required: {},
                });
              } else {
                setExistingForm({ is_support_required: 'Yes' });
              }
            }}
          >
            {YES_NO_OPTIONS.map(o => (
              <Picker.Item
                key={o.value}
                label={language === 'hi' ? o.hi : o.en}
                value={o.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      {needSupport === 'Yes' && (
        <>
          {['financial', 'infrastructure', 'machinery', 'other'].map(k => (
            <TouchableOpacity
              key={k}
              style={styles.checkboxRow}
              onPress={() => toggleCategory(k)}
            >
              <Text style={styles.checkbox}>{selected[k] ? '☑' : '☐'}</Text>
              <Text style={styles.checkboxLabel}>
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

          {selected.financial && (
            <View style={styles.subBlock}>
              <Text style={styles.label}>
                {language === 'hi'
                  ? 'वित्तीय सहयोग का प्रकार'
                  : 'Financial Support Type'}
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={supportData.financial.type}
                  onValueChange={v =>
                    handleValueChange('financial', { type: v })
                  }
                >
                  {OTHER_SUPPORT_TYPES.map(o => (
                    <Picker.Item
                      key={o.value}
                      label={language === 'hi' ? o.hi : o.en}
                      value={o.value}
                    />
                  ))}
                </Picker>
              </View>

              {supportData.financial.type === 'Loan' && (
                <View style={[styles.pickerWrapper, { marginTop: 8 }]}>
                  <Picker
                    selectedValue={supportData.financial.amount}
                    onValueChange={v =>
                      handleValueChange('financial', { amount: v })
                    }
                  >
                    <Picker.Item
                      label={
                        language === 'hi' ? 'राशि चुनें...' : 'Select Amount...'
                      }
                      value=""
                    />
                    {LOAN_AMOUNT_OPTIONS.map(o => (
                      <Picker.Item
                        key={o.value}
                        label={language === 'hi' ? o.hi : o.en}
                        value={o.value}
                      />
                    ))}
                  </Picker>
                </View>
              )}

              {['Others', 'Grant and Subsidy', 'Interest Subvention'].includes(
                supportData.financial.type,
              ) && (
                <TextInput
                  style={[styles.input, { marginTop: 8 }]}
                  placeholder={
                    language === 'hi' ? 'कृपया विवरण लिखें' : 'Please specify'
                  }
                  value={supportData.financial.spec}
                  onChangeText={v =>
                    handleValueChange('financial', { spec: v })
                  }
                />
              )}
            </View>
          )}

          {selected.infrastructure && (
            <View style={styles.subBlock}>
              <Text style={styles.label}>
                {language === 'hi'
                  ? 'इन्फ्रास्ट्रक्चर सहयोग'
                  : 'Infrastructure Support'}
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={supportData.infrastructure.type}
                  onValueChange={v =>
                    handleValueChange('infrastructure', { type: v })
                  }
                >
                  {INFRA_OPTIONS.map(o => (
                    <Picker.Item
                      key={o.value}
                      label={language === 'hi' ? o.hi : o.en}
                      value={o.value}
                    />
                  ))}
                </Picker>
              </View>
              {supportData.infrastructure.type === 'Others' && (
                <TextInput
                  style={[styles.input, { marginTop: 8 }]}
                  placeholder={
                    language === 'hi' ? 'कृपया विवरण लिखें' : 'Please specify'
                  }
                  value={supportData.infrastructure.spec}
                  onChangeText={v =>
                    handleValueChange('infrastructure', { spec: v })
                  }
                />
              )}
            </View>
          )}

          {selected.machinery && (
            <TextInput
              style={[styles.input, styles.subBlock]}
              placeholder={
                language === 'hi'
                  ? 'आवश्यक मशीनरी / उपकरण का विवरण दें'
                  : 'Specify machinery required'
              }
              value={supportData.machinery}
              onChangeText={v => handleValueChange('machinery', v)}
            />
          )}

          {selected.other && (
            <TextInput
              style={[styles.input, styles.subBlock]}
              placeholder={
                language === 'hi'
                  ? 'अन्य आवश्यक सहयोग का विवरण दें'
                  : 'Specify other support required'
              }
              value={supportData.other}
              onChangeText={v => handleValueChange('other', v)}
            />
          )}
        </>
      )}

      {/* NAV BUTTONS */}
      <View style={styles.navRow}>
        {onBack && (
          <TouchableOpacity style={styles.navBtnSecondary} onPress={onBack}>
            <Text>{language === 'hi' ? 'वापस' : 'Back'}</Text>
          </TouchableOpacity>
        )}
        {onNext && (
          <TouchableOpacity style={styles.navBtnPrimary} onPress={onNext}>
            <Text style={{ color: '#fff' }}>
              {language === 'hi' ? 'आगे बढ़ें' : 'Next'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 14 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  fieldBlock: { marginBottom: 14 },
  subBlock: { marginTop: 12 },
  label: { fontWeight: '700', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fff',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  checkbox: { fontSize: 20, marginRight: 10, color: '#EE6969' },
  checkboxLabel: { fontSize: 15 },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navBtnPrimary: {
    backgroundColor: '#EE6969',
    padding: 12,
    borderRadius: 6,
    width: 100,
    alignItems: 'center',
  },
  navBtnSecondary: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 6,
    width: 100,
    alignItems: 'center',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
});

export default ExistingEnterpriseSupportSection;
