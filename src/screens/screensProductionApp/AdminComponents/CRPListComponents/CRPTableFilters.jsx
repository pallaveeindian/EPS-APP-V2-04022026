// src/screens/admin/AdminComponents/CRPListComponents/CRPTableFilters.jsx

import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import gsApi from '../../../../api/gsApi';
import { LanguageContext } from '../../../../components/LanguageContext';

export default function CRPTableFilters({ onFiltersChange }) {
  const { language } = useContext(LanguageContext);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [panchayats, setPanchayats] = useState([]);

  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedPanchayat, setSelectedPanchayat] = useState('');

  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingPanchayats, setLoadingPanchayats] = useState(false);
  const [fetching, setFetching] = useState(false);

  const LARGE_PAGE_SIZE = 5000;

  /* ------------------ Translations ------------------ */

  const translations = {
    en: {
      district: 'District',
      selectDistrict: 'Select District',
      block: 'Block',
      selectBlock: 'Select Block',
      panchayat: 'Panchayat',
      selectPanchayat: 'Select Panchayat',
      fetch: 'Fetch',
    },
    hi: {
      district: 'जिला',
      selectDistrict: 'जिला चुनें',
      block: 'ब्लॉक',
      selectBlock: 'ब्लॉक चुनें',
      panchayat: 'पंचायत',
      selectPanchayat: 'पंचायत चुनें',
      fetch: 'प्राप्त करें',
    },
  };

  const t = translations[language] || translations.en;
  const translate = key => t[key] || translations.en[key] || key;

  /* ================= Fetch Districts ================= */

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      setLoadingDistricts(true);

      const res = await gsApi.getDistricts(1, '', LARGE_PAGE_SIZE);

      setDistricts(res?.results || res || []);
    } catch (err) {
      console.error('District fetch error', err);
    } finally {
      setLoadingDistricts(false);
    }
  };

  /* ================= Fetch Blocks ================= */

  const fetchBlocks = async districtId => {
    try {
      setLoadingBlocks(true);

      const res = await gsApi.getBlocksByDistrict(
        Number(districtId),
        1,
        '',
        LARGE_PAGE_SIZE,
      );

      setBlocks(res?.results || res || []);
    } catch (err) {
      console.error('Block fetch error', err);
    } finally {
      setLoadingBlocks(false);
    }
  };

  /* ================= Fetch Panchayats ================= */

  const fetchPanchayats = async blockId => {
    try {
      setLoadingPanchayats(true);

      const res = await gsApi.getPanchayatsByBlock(
        Number(blockId),
        1,
        '',
        LARGE_PAGE_SIZE,
      );

      setPanchayats(res?.results || res || []);
    } catch (err) {
      console.error('Panchayat fetch error', err);
    } finally {
      setLoadingPanchayats(false);
    }
  };

  /* ================= Handlers ================= */

  const handleDistrictChange = value => {
    setSelectedDistrict(value);
    setSelectedBlock('');
    setSelectedPanchayat('');
    setBlocks([]);
    setPanchayats([]);

    if (value) fetchBlocks(value);
  };

  const handleBlockChange = value => {
    setSelectedBlock(value);
    setSelectedPanchayat('');
    setPanchayats([]);

    if (value) fetchPanchayats(value);
  };

  const handlePanchayatChange = value => {
    setSelectedPanchayat(value);
  };

  /* ================= Fetch Button Handler ================= */

  const handleFetch = async () => {
    if (!onFiltersChange) return;

    setFetching(true);

    await onFiltersChange({
      district_id: selectedDistrict,
      block_id: selectedBlock,
      panchayat_id: selectedPanchayat,
    });

    setFetching(false);
  };

  /* ================= UI ================= */

  return (
    <View>
      {/* District */}
      <Text style={styles.label}>{translate('district')}</Text>
      {loadingDistricts ? (
        <ActivityIndicator />
      ) : (
        <Picker
          selectedValue={selectedDistrict}
          onValueChange={handleDistrictChange}
          style={styles.picker}
        >
          <Picker.Item label={translate('selectDistrict')} value="" />
          {districts.map(d => (
            <Picker.Item
              key={d.district_id}
              label={d.district_name_en}
              value={d.district_id}
            />
          ))}
        </Picker>
      )}

      {/* Block */}
      <Text style={styles.label}>{translate('block')}</Text>
      {loadingBlocks ? (
        <ActivityIndicator />
      ) : (
        <Picker
          selectedValue={selectedBlock}
          enabled={!!selectedDistrict}
          onValueChange={handleBlockChange}
          style={styles.picker}
        >
          <Picker.Item label={translate('selectBlock')} value="" />
          {blocks.map(b => (
            <Picker.Item
              key={b.block_id}
              label={b.block_name_en}
              value={b.block_id}
            />
          ))}
        </Picker>
      )}

      {/* Panchayat */}
      <Text style={styles.label}>{translate('panchayat')}</Text>
      {loadingPanchayats ? (
        <ActivityIndicator />
      ) : (
        <Picker
          selectedValue={selectedPanchayat}
          enabled={!!selectedBlock}
          onValueChange={handlePanchayatChange}
          style={styles.picker}
        >
          <Picker.Item label={translate('selectPanchayat')} value="" />
          {panchayats.map(p => (
            <Picker.Item
              key={p.panchayat_id}
              label={p.panchayat_name_en}
              value={p.panchayat_id}
            />
          ))}
        </Picker>
      )}

      {/* Fetch Button */}
      <TouchableOpacity
        style={[styles.fetchButton, !selectedDistrict && styles.disabledButton]}
        onPress={handleFetch}
        disabled={!selectedDistrict || fetching}
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
    marginTop: 8,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  fetchButton: {
    marginTop: 16,
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
  disabledButton: {
    backgroundColor: '#ccc',
  },
});
