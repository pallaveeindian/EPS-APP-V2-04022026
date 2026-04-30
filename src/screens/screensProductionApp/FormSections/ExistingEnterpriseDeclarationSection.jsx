// src/screens/screensProductionApp/FormSections/ExistingEnterpriseDeclarationSection.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import LanguageToggle from '../../../components/LanguageToggle';
import { LanguageContext } from '../../../components/LanguageContext';
import { useContext } from 'react';
const YesNoToggle = ({ value, onChange, language }) => {
  const current = value === 'Yes' ? 'Yes' : value === 'No' ? 'No' : '';

  const handlePress = opt => {
    onChange(opt);
  };

  return (
    <View style={styles.yesNoRow}>
      {['Yes', 'No'].map(opt => (
        <TouchableOpacity
          key={opt}
          style={[styles.yesNoBtn, current === opt && styles.yesNoBtnActive]}
          onPress={() => handlePress(opt)}
        >
          <Text
            style={[
              styles.yesNoText,
              current === opt && styles.yesNoTextActive,
            ]}
          >
            {/* {opt} */}
            {language === 'hi' ? (opt === 'Yes' ? 'हाँ' : 'नहीं') : opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function ExistingEnterpriseDeclarationSection({
  existingForm,
  setExistingForm,
  onSubmit,
  submitting = false,
}) {
  const update = patch => setExistingForm(patch);
  const { language } = useContext(LanguageContext);
  const [declDay, setDeclDay] = useState('');
  const [declMonth, setDeclMonth] = useState('');
  const [declYear, setDeclYear] = useState('');
  const [dateModalVisible, setDateModalVisible] = useState(false);
  useEffect(() => {
    const d = existingForm.declaration_date;
    if (!d) {
      setDeclDay('');
      setDeclMonth('');
      setDeclYear('');
      return;
    }
    try {
      const raw = typeof d === 'string' ? d.split('T')[0] : '';
      const parts = raw.split('-');
      if (parts.length === 3) {
        setDeclYear(parts[0]);
        setDeclMonth(String(parseInt(parts[1], 10) || ''));
        setDeclDay(String(parseInt(parts[2], 10) || ''));
      }
    } catch (e) {
      // ignore parse errors
    }
  }, [existingForm.declaration_date]);

  const applyDate = () => {
    if (!declDay || !declMonth || !declYear) {
      setDateModalVisible(false);
      return;
    }
    const day = String(declDay).padStart(2, '0');
    const month = String(declMonth).padStart(2, '0');
    const iso = `${declYear}-${month}-${day}`;
    update({ declaration_date: iso });
    setDateModalVisible(false);
  };

  // const pickSignature = async () => {
  //   try {
  //     const res = await launchImageLibrary({
  //       mediaType: 'photo',
  //       selectionLimit: 1,
  //     });

  //     if (res.didCancel || !res.assets) return;
  //     const assets = res.assets || [];

  //     const currentMedia = existingForm.media || {};
  //     update({
  //       media: {
  //         ...currentMedia,
  //         declaration_signature: assets,
  //       },
  //     });
  //   } catch (e) {
  //     console.warn('Signature pick failed', e);
  //   }
  // };

  const pickSignature = async () => {
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });

      if (res.didCancel || !res.assets) return;

      const assets = res.assets || [];

      update({
        declaration_signature_files: assets,
        declaration_signature: assets, //  validation
        media: {
          ...(existingForm.media || {}),
          declaration_signature: assets, //  backend
        },
      });
    } catch (e) {
      console.warn('Signature pick failed', e);
    }
  };

  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= 1950; y--) yearOptions.push(String(y));

  const dayOptions = [];
  for (let d = 1; d <= 31; d++) dayOptions.push(String(d));

  const monthOptions = [
    { label: 'Jan', value: '1' },
    { label: 'Feb', value: '2' },
    { label: 'Mar', value: '3' },
    { label: 'Apr', value: '4' },
    { label: 'May', value: '5' },
    { label: 'Jun', value: '6' },
    { label: 'Jul', value: '7' },
    { label: 'Aug', value: '8' },
    { label: 'Sep', value: '9' },
    { label: 'Oct', value: '10' },
    { label: 'Nov', value: '11' },
    { label: 'Dec', value: '12' },
  ];

  const signatureCount = Array.isArray(existingForm.declaration_signature_files)
    ? existingForm.declaration_signature_files.length
    : 0;

  return (
    <View style={styles.sectionContainer}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <Text style={styles.sectionTitle}>
          {' '}
          {language === 'hi'
            ? '9) घोषणा एवं जमा करें'
            : '9) Declaration & Submit'}
        </Text>
        <LanguageToggle />
      </View>
      {/* 1) Declaration confirmed */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          {language === 'hi' ? 'घोषणा' : 'Declaration'}
        </Text>
        <Text style={styles.helpText}>
          {language === 'hi'
            ? 'मैं यह घोषणा करता/करती हूँ कि ऊपर दी गई सभी जानकारी मेरे द्वारा जाँची गई है और सही है।'
            : 'I hereby declare that all information provided above is correct and checked by me.'}
        </Text>

        <YesNoToggle
          value={existingForm.declaration_confirmed || ''}
          onChange={val => update({ declaration_confirmed: val })}
        />
      </View>

      {/* 2) Declaration Date */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          {' '}
          {language === 'hi' ? 'घोषणा तिथि' : 'Declaration Date'}
        </Text>
        <Text style={styles.helpText}>
          {language === 'hi'
            ? 'कृपया वह तिथि चुनें जिस दिन यह फॉर्म भरा जा रहा है। चयनित तिथि YYYY-MM-DD प्रारूप में सुरक्षित की जाएगी।'
            : 'Please select the date on which this form is being completed. The selected date will be clearly stored as YYYY-MM-DD.'}
        </Text>

        <TouchableOpacity
          style={styles.dateDisplay}
          onPress={() => setDateModalVisible(true)}
        >
          <Text style={styles.dateDisplayText}>
            {existingForm.declaration_date ||
              (language === 'hi'
                ? 'घोषणा तिथि चुनें'
                : 'Select Declaration Date')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date picker modal */}
      <Modal
        visible={dateModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDateModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {' '}
              {language === 'hi'
                ? 'घोषणा तिथि चुनें'
                : 'Select Declaration Date'}
            </Text>
            <View style={styles.modalPickerRow}>
              {/* Day */}
              <View style={styles.modalPickerCol}>
                <Text style={styles.modalLabel}>
                  {language === 'hi' ? 'दिन' : 'Day'}
                </Text>
                <View style={styles.modalPickerBox}>
                  <Picker
                    selectedValue={declDay || ''}
                    onValueChange={v => setDeclDay(v)}
                  >
                    <Picker.Item
                      label={language === 'hi' ? 'दिन' : 'Day'}
                      value=""
                    />
                    {dayOptions.map(d => (
                      <Picker.Item key={d} label={d} value={d} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Month */}
              <View style={styles.modalPickerCol}>
                <Text style={styles.modalLabel}>
                  {language === 'hi' ? 'माह' : 'Month'}
                </Text>
                <View style={styles.modalPickerBox}>
                  <Picker
                    selectedValue={declMonth || ''}
                    onValueChange={v => setDeclMonth(v)}
                  >
                    <Picker.Item
                      label={language === 'hi' ? 'माह' : 'MM'}
                      value=""
                    />
                    {monthOptions.map(m => (
                      <Picker.Item
                        key={m.value}
                        label={m.label}
                        value={m.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Year */}
              <View style={styles.modalPickerCol}>
                <Text style={styles.modalLabel}>
                  {language === 'hi' ? 'वर्ष' : 'Year'}
                </Text>
                <View style={styles.modalPickerBox}>
                  <Picker
                    selectedValue={declYear || ''}
                    onValueChange={v => setDeclYear(v)}
                  >
                    <Picker.Item
                      label={language === 'hi' ? 'वर्ष' : 'YYYY'}
                      value=""
                    />
                    {yearOptions.map(y => (
                      <Picker.Item key={y} label={y} value={y} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                onPress={() => setDateModalVisible(false)}
              >
                <Text style={styles.modalBtnSecondaryText}>
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={applyDate}
              >
                <Text style={styles.modalBtnPrimaryText}>
                  {' '}
                  {language === 'hi' ? 'पुष्टि करें' : 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3) Applicant Signature upload */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          {' '}
          {language === 'hi' ? 'आवेदक के हस्ताक्षर' : 'Applicant Signature'}
        </Text>
        <Text style={styles.helpText}>
          {language === 'hi'
            ? 'कृपया अपने हस्ताक्षर की स्पष्ट फोटो या स्कैन कॉपी अपलोड करें। यह आपकी आवेदन के साथ सुरक्षित रखा जाएगा।'
            : 'Please upload a clear photo or scanned copy of your signature. This will be stored securely with your application.'}
        </Text>

        <TouchableOpacity style={styles.mediaBtn} onPress={pickSignature}>
          <Text style={styles.mediaBtnText}>
            {language === 'hi' ? 'हस्ताक्षर अपलोड करें' : 'Upload Signature'}
          </Text>
        </TouchableOpacity>

        {/* {signatureCount > 0 && (
          <Text style={styles.mediaInfo}>
            {language === 'hi'
              ? `चयनित हस्ताक्षर फ़ाइल: ${signatureCount}`
              : `Selected Signature File(s): ${signatureCount}`}
          </Text>
        )} */}
        {signatureCount > 0 ? (
          <View>
            <Text
              style={[styles.mediaInfo, { color: 'green', fontWeight: '600' }]}
            >
              {/* PC-0426-2-A: Label for Applicant signature */}
              {language === 'hi'
                ? 'आवेदक की सेल्फी'
                : 'Applicant Selfie'}
            </Text>

            <TouchableOpacity onPress={pickSignature}>
              <Text style={{ color: '#EE6969', marginTop: 4 }}>
                {language === 'hi' ? 'हस्ताक्षर बदलें' : 'Change Signature'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* Optional verifier name */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          {' '}
          {language === 'hi'
            ? 'सत्यापनकर्ता का नाम (वैकल्पिक)'
            : 'Verifier Name (optional)'}
        </Text>
        <Text style={styles.helpText}>
          {language === 'hi'
            ? 'यदि कोई CRP या अधिकारी यह फॉर्म भरने में आपकी सहायता कर रहा है, तो कृपया उनका नाम यहाँ लिखें (वैकल्पिक)।'
            : 'If a CRP or official is helping you fill this form, please mention their name here (optional).'}
        </Text>
        <TextInput
          style={styles.input}
          value={existingForm.verifier_name || ''}
          onChangeText={v => update({ verifier_name: v })}
          placeholder={
            language === 'hi'
              ? 'सत्यापनकर्ता का नाम दर्ज करें (यदि कोई हो)'
              : 'Enter verifier name (if any)'
          }
        />
      </View>

      {onSubmit && (
        <View style={styles.submitRow}>
          <TouchableOpacity
            style={[
              styles.submitBtn,
              (!existingForm.declaration_confirmed || submitting) &&
              styles.submitBtnDisabled,
            ]}
            disabled={!existingForm.declaration_confirmed || submitting}
            onPress={onSubmit}
          >
            <Text style={styles.submitBtnText}>
              {submitting
                ? language === 'hi'
                  ? 'जमा किया जा रहा है...'
                  : 'Submitting...'
                : language === 'hi'
                  ? 'मौजूदा उद्यम फॉर्म जमा करें'
                  : 'Submit Existing Enterprise Form'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingVertical: 10,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
  },
  fieldBlock: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  yesNoRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  yesNoBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f7f7f7',
  },
  yesNoBtnActive: {
    backgroundColor: '#EE6969',
    borderColor: '#EE6969',
  },
  yesNoText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  yesNoTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  dateDisplay: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    marginTop: 4,
  },
  dateDisplayText: {
    fontSize: 14,
    color: '#333',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#0009',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  modalPickerCol: {
    flex: 1,
    marginHorizontal: 4,
  },
  modalLabel: {
    fontSize: 12,
    marginBottom: 4,
    color: '#555',
  },
  modalPickerBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  modalBtnPrimary: {
    backgroundColor: '#EE6969',
  },
  modalBtnPrimaryText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalBtnSecondary: {
    backgroundColor: '#eee',
  },
  modalBtnSecondaryText: {
    color: '#333',
    fontWeight: '500',
  },
  mediaBtn: {
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#eee',
    alignSelf: 'flex-start',
  },
  mediaBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  mediaInfo: {
    marginTop: 4,
    fontSize: 12,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  submitRow: {
    marginTop: 16,
  },
  submitBtn: {
    backgroundColor: '#EE6969',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#ccc',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
