// src/screens/screensProductionApp/CRPViewComponents/EPSTableFilters.jsx

import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import gsApi from '../../../api/gsApi';
import { getCrpPanchayats } from '../../../utils/tempStore';
import { LanguageContext } from '../../../components/LanguageContext';

export default function EPSTableFilters({ onFiltersChange }) {
  const { language } = useContext(LanguageContext);

  const [panchayats, setPanchayats] = useState([]);
  const [villages, setVillages] = useState([]);

  const [selectedPanchayat, setSelectedPanchayat] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [enterpriseType, setEnterpriseType] = useState('');
  const [pldStatus, setPldStatus] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  const [loadingVillages, setLoadingVillages] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fetching, setFetching] = useState(false);

  const LARGE_PAGE_SIZE = 5000;

  /* ------------------ Translations ------------------ */

  const translations = {
    en: {
      panchayat: 'Panchayat',
      selectPanchayat: 'Select Panchayat',
      village: 'Village',
      selectVillage: 'Select Village',
      enterpriseType: 'Enterprise Type',
      selectEnterpriseType: 'Select Enterprise Type',
      existing: 'Existing',
      new: 'New',
      pldStatus: 'PLD Status',
      selectPldStatus: 'Select PLD Status',
      yes: 'Yes',
      no: 'No',
      formFilledOn: 'Form Filled On',
      search: 'Search (Name / SHG / Member Code)',
      fetch: 'Apply Filters',
    },
    hi: {
      panchayat: 'पंचायत',
      selectPanchayat: 'पंचायत चुनें',
      village: 'गांव',
      selectVillage: 'गांव चुनें',
      enterpriseType: 'उद्यम प्रकार',
      selectEnterpriseType: 'उद्यम प्रकार चुनें',
      existing: 'मौजूदा',
      new: 'नया',
      pldStatus: 'पीएलडी स्थिति',
      selectPldStatus: 'स्थिति चुनें',
      yes: 'हाँ',
      no: 'नहीं',
      formFilledOn: 'फॉर्म भरने की तारीख',
      search: 'खोजें (नाम / SHG / सदस्य कोड)',
      fetch: 'फ़िल्टर लागू करें',
    },
  };

  const t = translations[language] || translations.en;
  const translate = key => t[key] || translations.en[key] || key;

  /* ================= Load Assigned Panchayats ================= */

  useEffect(() => {
    const assigned = getCrpPanchayats() || [];
    setPanchayats(assigned);
  }, []);

  /* ================= Fetch Villages ================= */

  const fetchVillages = async panchayatId => {
    try {
      setLoadingVillages(true);

      const res = await gsApi.getVillagesByPanchayat(
        Number(panchayatId),
        1,
        '',
        LARGE_PAGE_SIZE,
      );

      setVillages(res?.results || res || []);
    } catch (err) {
      console.error('Village fetch error', err);
      setVillages([]);
    } finally {
      setLoadingVillages(false);
    }
  };

  const handlePanchayatChange = value => {
    setSelectedPanchayat(value);
    setSelectedVillage('');
    setVillages([]);

    if (value) fetchVillages(value);
  };

  /* ================= Date Handler ================= */

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  /* ================= Apply Filters ================= */

  const handleApply = async () => {
    if (!onFiltersChange) return;

    setFetching(true);

    const filters = {
      panchayat_id: selectedPanchayat,
      village_id: selectedVillage,
      enterprise_type: enterpriseType, // exep / newep
      pld_status: pldStatus === '' ? '' : pldStatus === 'true' ? true : false,
      created_at: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      search: searchText,
    };

    await onFiltersChange(filters);

    setFetching(false);
  };

  /* ================= UI ================= */

  return (
    <View>
      {/* Panchayat */}
      <Text style={styles.label}>{translate('panchayat')}</Text>
      <Picker
        selectedValue={selectedPanchayat}
        onValueChange={handlePanchayatChange}
        style={styles.picker}
      >
        <Picker.Item label={translate('selectPanchayat')} value="" />
        {panchayats.map(p => (
          <Picker.Item
            key={p.panchayat_id}
            label={p.panchayat_name_en || p.name}
            value={p.panchayat_id}
          />
        ))}
      </Picker>

      {/* Village */}
      <Text style={styles.label}>{translate('village')}</Text>
      {loadingVillages ? (
        <ActivityIndicator />
      ) : (
        <Picker
          selectedValue={selectedVillage}
          enabled={!!selectedPanchayat}
          onValueChange={setSelectedVillage}
          style={styles.picker}
        >
          <Picker.Item label={translate('selectVillage')} value="" />
          {villages.map(v => (
            <Picker.Item
              key={v.village_id}
              label={v.village_name_english}
              value={v.village_id}
            />
          ))}
        </Picker>
      )}

      {/* Enterprise Type */}
      <Text style={styles.label}>{translate('enterpriseType')}</Text>
      <Picker
        selectedValue={enterpriseType}
        onValueChange={setEnterpriseType}
        style={styles.picker}
      >
        <Picker.Item label={translate('selectEnterpriseType')} value="" />
        <Picker.Item label={translate('existing')} value="exep" />
        <Picker.Item label={translate('new')} value="newep" />
      </Picker>

      {/* PLD Status */}
      <Text style={styles.label}>{translate('pldStatus')}</Text>
      <Picker
        selectedValue={pldStatus}
        onValueChange={setPldStatus}
        style={styles.picker}
      >
        <Picker.Item label={translate('selectPldStatus')} value="" />
        <Picker.Item label={translate('yes')} value="true" />
        <Picker.Item label={translate('no')} value="false" />
      </Picker>

      {/* Date Picker */}
      <Text style={styles.label}>{translate('formFilledOn')}</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>
          {selectedDate
            ? selectedDate.toISOString().split('T')[0]
            : 'Select Date'}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Search */}
      <Text style={styles.label}>{translate('search')}</Text>
      <TextInput
        value={searchText}
        onChangeText={setSearchText}
        placeholder={translate('search')}
        style={styles.input}
      />

      {/* Apply Button */}
      <TouchableOpacity
        style={styles.fetchButton}
        onPress={handleApply}
        disabled={fetching}
      >
        {fetching ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.fetchButtonText}>{translate('fetch')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

/* ================= Styles ================= */

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 6,
  },
  dateButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  fetchButton: {
    marginTop: 18,
    backgroundColor: '#EE6969',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  fetchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
