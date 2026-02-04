// src/screens/screensProductionApp/FormSections/ExistingEnterpriseEnterpriseDetailsSection.jsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import LanguageToggle from '../../../components/LanguageToggle';
import { LanguageContext } from '../../../components/LanguageContext';
import { useContext } from 'react';

const WORKPLACE_TYPE_OPTIONS = [
  { en: 'Home-based workplace', hi: 'घर आधारित कार्यस्थल' },
  { en: 'Rented shop / workplace', hi: 'किराए की दुकान / कार्यस्थल' },
  { en: 'Owned shop / workplace', hi: 'स्वयं की दुकान / कार्यस्थल' },
  { en: 'Mobile / street-based unit', hi: 'मोबाइल / सड़क आधारित इकाई' },
  { en: 'Shared workplace', hi: 'साझा कार्यस्थल' },
  { en: 'Others', hi: 'अन्य' },
];

const ELECTRICITY_OPTIONS = [
 { en: 'Regular', hi: 'नियमित' },
  { en: 'Partial / Irregular', hi: 'आंशिक / अनियमित' },
  { en: 'Solarized', hi: 'सौर ऊर्जा से संचालित' },
  { en: 'No', hi: 'नहीं' },
  { en: 'Others', hi: 'अन्य' },
];

const WATER_OPTIONS = [
  { en: 'Regular', hi: 'नियमित' },
  { en: 'Limited', hi: 'सीमित' },
  { en: 'No', hi: 'नहीं' },
  { en: 'Others', hi: 'अन्य' },
];

const TRANSPORT_AVAILABILITY_OPTIONS = [
 { en: 'Regular transport available', hi: 'नियमित परिवहन उपलब्ध' },
  { en: 'Sometimes available', hi: 'कभी-कभी उपलब्ध' },
  { en: 'Very limited transport', hi: 'बहुत सीमित परिवहन' },
  { en: 'No transport', hi: 'परिवहन उपलब्ध नहीं' },
  { en: 'Need Help', hi: 'सहायता चाहिए' },
];

const BIJNOR_OPTIONS = [
    { en: 'Yes', hi: 'हाँ' },
  { en: 'No', hi: 'नहीं' },
];

export default function ExistingEnterpriseEnterpriseDetailsSection({
  existingForm,
  setExistingForm,
}) {
  const update = (patch) => setExistingForm(patch);

  const showNeedTransportHelp =
    existingForm.transportation_availability === 'Need Help';
    const { language } = useContext(LanguageContext);

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
      <Text style={styles.sectionTitle}> {language === 'hi'
    ? '2) उद्यम विवरण अनुभाग'
    : '2) Enterprise Details Section'}</Text>
 <LanguageToggle />
 </View>
      {/* 9) Workplace Type */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>{language === 'hi'
    ? 'आपका कार्यस्थल किस प्रकार का है?'
    : 'What is your Workplace Type?'}</Text>
        <Text style={styles.helpText}>
          {language === 'hi'
    ? 'कृपया वह विकल्प चुनें जो सबसे अच्छे तरीके से बताता है कि आप अपना उद्यम कहाँ से संचालित करते हैं। यदि कोई विकल्प मेल नहीं खाता है, तो अन्य चुनें और विवरण दें।'
    : 'Please select the option that best describes where you run your enterprise from. If it does not match, please choose Others and specify.'}
        </Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={existingForm.workplace_type || ''}
            onValueChange={(v) => update({ workplace_type: v })}
          >
            <Picker.Item  label={language === 'hi' ? 'चुनें...' : 'Select...'} value="" />
            {WORKPLACE_TYPE_OPTIONS.map((opt) => (
              <Picker.Item key={opt.en}    label={language === 'hi' ? opt.hi : opt.en} value={opt.en} />
            ))}
          </Picker>
        </View>
        {existingForm.workplace_type === 'Others' && (
          <TextInput
            style={[styles.input, { marginTop: 6 }]}
               placeholder={
      language === 'hi'
        ? 'कृपया अपने कार्यस्थल का प्रकार बताएं'
        : 'Please specify your workplace type'
    }
            value={existingForm.workplace_type_other || ''}
            onChangeText={(v) => update({ workplace_type_other: v })}
          />
        )}
      </View>

      {/* 10) Electricity Availability */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>    {language === 'hi' ? 'बिजली की उपलब्धता' : 'Electricity Availability'}</Text>
        <Text style={styles.helpText}>
           {language === 'hi'
      ? 'कृपया वह विकल्प चुनें जो आपके कार्यस्थल पर बिजली की स्थिति को सबसे अच्छे तरीके से दर्शाता है। यदि आपकी स्थिति अलग है, तो अन्य चुनें और विवरण दें।'
      : 'Please select the option that best describes the electricity situation at your workplace. If your case is different, kindly choose Others and describe it.'}
        </Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={existingForm.electricity_available || ''}
            onValueChange={(v) => update({ electricity_available: v })}
          >
            <Picker.Item   label={language === 'hi' ? 'चुनें...' : 'Select...'} value="" />
            {ELECTRICITY_OPTIONS.map((opt) => (
              <Picker.Item key={opt.en}  label={language === 'hi' ? opt.hi : opt.en} value={opt.en} />
            ))}
          </Picker>
        </View>
        {existingForm.electricity_available === 'Others' && (
          <TextInput
            style={[styles.input, { marginTop: 6 }]}
            placeholder={
        language === 'hi'
          ? 'कृपया अपनी बिजली की स्थिति बताएं'
          : 'Please specify your electricity situation'
      }
            value={existingForm.electricity_other || ''}
            onChangeText={(v) => update({ electricity_other: v })}
          />
        )}

        <TextInput
          style={[styles.input, { marginTop: 6 }]}
           placeholder={
      language === 'hi'
        ? 'आप यहाँ अतिरिक्त विवरण जोड़ सकते हैं (वैकल्पिक)'
        : 'You may add more details here (optional)'
    }
          value={existingForm.electricity_detail || ''}
          onChangeText={(v) => update({ electricity_detail: v })}
        />
      </View>

      {/* 11) Water Availability */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}> {language === 'hi' ? 'पानी की उपलब्धता' : 'Water Availability'}</Text>
        <Text style={styles.helpText}>
        {language === 'hi'
      ? 'कृपया बताएं कि आपके उद्यम की गतिविधियों के लिए पानी कितनी आसानी से उपलब्ध है। यदि स्थिति अलग है, तो अन्य चुनें और विवरण दें।'
      : 'Please select how easily water is available for your enterprise activities. If the situation is different, please select Others and give details.'}
        </Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={existingForm.water_available || ''}
            onValueChange={(v) => update({ water_available: v })}
          >
            <Picker.Item    label={language === 'hi' ? 'चुनें...' : 'Select...'} value="" />
            {WATER_OPTIONS.map((opt) => (
              <Picker.Item key={opt.en}  label={language === 'hi' ? opt.hi : opt.en} value={opt.en} />
            ))}
          </Picker>
        </View>
        {existingForm.water_available === 'Others' && (
          <TextInput
            style={[styles.input, { marginTop: 6 }]}
            placeholder={
        language === 'hi'
          ? 'कृपया पानी की उपलब्धता बताएं'
          : 'Please specify your water availability'
      }
            value={existingForm.water_other || ''}
            onChangeText={(v) => update({ water_other: v })}
          />
        )}

        <TextInput
          style={[styles.input, { marginTop: 6 }]}
          placeholder={
      language === 'hi'
        ? 'आप यहाँ अतिरिक्त विवरण जोड़ सकते हैं (वैकल्पिक)'
        : 'You may add more details here (optional)'
    }
          value={existingForm.water_detail || ''}
          onChangeText={(v) => update({ water_detail: v })}
        />
      </View>

      {/* Transport Availability */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
             {language === 'hi'
      ? 'आपके उद्यम के लिए परिवहन की उपलब्धता क्या है?'
      : 'What is the Transport Availability for your Enterprise?'}
        </Text>
        <Text style={styles.helpText}>
           {language === 'hi'
      ? 'कृपया बताएं कि कच्चा माल लाने और उत्पाद भेजने के लिए (जैसे टेम्पो, बस, पिकअप आदि) परिवहन कितनी आसानी से मिलता है। यदि गंभीर समस्या है, तो "सहायता चाहिए" चुनें।'
      : 'Please select how easily you get transport (like tempo, bus, pickup, etc.) to bring raw material and send products. If you face serious difficulty, kindly choose Need Help.'}
        </Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={existingForm.transportation_availability || ''}
            onValueChange={(v) => update({ transportation_availability: v })}
          >
            <Picker.Item    label={language === 'hi' ? 'चुनें...' : 'Select...'} value="" />
            {TRANSPORT_AVAILABILITY_OPTIONS.map((opt) => (
              <Picker.Item key={opt.en}  label={language === 'hi' ? opt.hi : opt.en} value={opt.en} />
            ))}
          </Picker>
        </View>

        {showNeedTransportHelp && (
          <View style={{ marginTop: 6 }}>
            <Text style={styles.helpText}>
               {language === 'hi'
          ? 'कृपया बताएं कि आपको किस प्रकार की परिवहन सहायता चाहिए (जैसे वाहन सहायता, बेहतर सड़क, नियमित पिकअप आदि)।'
          : 'Please describe what kind of transport support you need (for example, vehicle support, better road, regular pickup, etc.).'}
            </Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={existingForm.need_transport_help || ''}
              onChangeText={(v) => update({ need_transport_help: v })}
            />
          </View>
        )}
      </View>

      {/* Can send products to Bijnor */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          {language === 'hi'
      ? 'क्या आप अपने उत्पाद बिजनौर भेज सकते हैं?'
      : 'Can you send your products to Bijnor?'}
        </Text>
        <Text style={styles.helpText}>
           {language === 'hi'
      ? 'कृपया बताएं कि क्या आप अपने उत्पाद बिजनौर या इसी तरह के बड़े बाजारों में भेज सकते हैं। इससे हमें आपकी बाजार पहुंच समझने में मदद मिलेगी।'
      : 'Please select if you are able to send your products to Bijnor or similar bigger markets. This helps us understand your market reach.'}
        </Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={existingForm.can_send_to_bijnor || ''}
            onValueChange={(v) => update({ can_send_to_bijnor: v })}
          >
            <Picker.Item label={language === 'hi' ? 'चुनें...' : 'Select...'} value="" />
            {BIJNOR_OPTIONS.map((opt) => (
              <Picker.Item key={opt.en} label={language === 'hi' ? opt.hi : opt.en} value={opt.en} />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#222',
  },
  fieldBlock: {
    marginBottom: 14,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    overflow: 'hidden',
  },
});
