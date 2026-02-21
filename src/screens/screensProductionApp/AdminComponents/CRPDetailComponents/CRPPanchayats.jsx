// src/screens/admin/AdminComponents/CRPDetailComponents/CRPPanchayats.jsx

import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import gsApi from '../../../../api/gsApi';
import { LanguageContext } from '../../../../components/LanguageContext';

export default function CRPPanchayats({ memberCode, refreshKey }) {
  const { language } = useContext(LanguageContext);
  const LARGE_PAGE_SIZE = 5000;

  const [assigned, setAssigned] = useState([]);
  const [originalAssigned, setOriginalAssigned] = useState([]);
  const [saving, setSaving] = useState(false);

  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [panchayats, setPanchayats] = useState([]);

  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedPanchayat, setSelectedPanchayat] = useState('');
  const [crpId, setCrpId] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  /* ------------------ Translations ------------------ */

  const translations = {
    en: {
      change: 'Change',
      saveChanges: 'Save Changes',
      saving: 'Saving...',

      duplicateTitle: 'Duplicate',
      duplicateMsg: 'Already assigned.',

      successTitle: 'Success',
      successMsg: 'Changes saved successfully.',

      errorTitle: 'Error',
      saveErrorMsg: 'Failed to save changes.',

      district: 'District',
      selectDistrict: 'Select District',
      block: 'Block',
      selectBlock: 'Select Block',
      panchayat: 'Panchayat',
      selectPanchayat: 'Select Panchayat',
    },

    hi: {
      change: 'बदलें',
      saveChanges: 'परिवर्तन सहेजें',
      saving: 'सहेजा जा रहा है...',

      duplicateTitle: 'डुप्लीकेट',
      duplicateMsg: 'पहले से असाइन किया गया है।',

      successTitle: 'सफलता',
      successMsg: 'परिवर्तन सफलतापूर्वक सहेजे गए।',

      errorTitle: 'त्रुटि',
      saveErrorMsg: 'परिवर्तन सहेजने में विफल।',

      district: 'जिला',
      selectDistrict: 'जिला चुनें',
      block: 'ब्लॉक',
      selectBlock: 'ब्लॉक चुनें',
      panchayat: 'पंचायत',
      selectPanchayat: 'पंचायत चुनें',
    },
  };

  const t = translations[language] || translations.en;
  const translate = key => t[key] || translations.en[key] || key;

  /* ================= Load Existing ================= */

  useEffect(() => {
    loadExisting();
    loadDistricts();
  }, [refreshKey]);

  const loadExisting = async () => {
    const res = await gsApi.getPanchayatsUnderCrpByMember(memberCode);

    const list = res?.data || [];

    setAssigned(list);
    setOriginalAssigned(list);

    if (list.length > 0) {
      setCrpId(list[0].crp_id);
    }
  };

  /* ================= Dropdown Fetch ================= */

  const loadDistricts = async () => {
    const res = await gsApi.getDistricts(1, '', LARGE_PAGE_SIZE);
    setDistricts(res?.results || res || []);
  };

  const loadBlocks = async id => {
    const res = await gsApi.getBlocksByDistrict(
      Number(id),
      1,
      '',
      LARGE_PAGE_SIZE,
    );
    setBlocks(res?.results || res || []);
  };

  const loadPanchayats = async id => {
    const res = await gsApi.getPanchayatsByBlock(
      Number(id),
      1,
      '',
      LARGE_PAGE_SIZE,
    );
    setPanchayats(res?.results || res || []);
  };

  /* ================= Add Panchayat ================= */

  const handleAddPanchayat = value => {
    if (!value) return;

    const exists = assigned.find(p => p.panchayat_id === value);

    if (exists) {
      Alert.alert(translate('duplicateTitle'), translate('duplicateMsg'));
      return;
    }

    const selectedObj = panchayats.find(p => p.panchayat_id === value);

    if (selectedObj) {
      setAssigned(prev => [...prev, selectedObj]);
      setSelectedPanchayat('');
      setShowDropdown(false);
    }
  };

  /* ================= Remove ================= */

  const handleRemove = id => {
    setAssigned(prev => prev.filter(p => p.panchayat_id !== id));
  };

  /* ================= Save ================= */

  const handleSave = async () => {
    try {
      setSaving(true);

      /* ================= DELETE REMOVED ================= */

      for (let old of originalAssigned) {
        const stillExists = assigned.find(
          p => p.panchayat_id === old.panchayat_id,
        );

        if (!stillExists) {
          await gsApi.deleteCrpPanchayat(old.id);
        }
      }

      /* ================= CREATE NEW ================= */

      let finalCrpId = crpId;
      let admin_id = 1004;

      if (!finalCrpId) {
        const crpDetail = await gsApi.getCrpDetailByMember(memberCode);
        finalCrpId = crpDetail.master_user;
        setCrpId(finalCrpId);
      }

      for (let p of assigned) {
        const wasOriginal = originalAssigned.find(
          o => o.panchayat_id === p.panchayat_id,
        );

        if (!wasOriginal) {
          await gsApi.createCrpPanchayat({
            crp: finalCrpId,
            allocated_panchayat_id: p.panchayat_id,
            created_by: admin_id,
          });
        }
      }

      Alert.alert(translate('successTitle'), translate('successMsg'));

      await loadExisting(); // reload from view
    } catch (err) {
      console.log('SAVE ERROR:', err);
      Alert.alert(
        translate('errorTitle'),
        err?.data?.detail || translate('saveErrorMsg'),
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */

  return (
    <View>
      {/* Assigned Cards */}
      {assigned.map(p => (
        <View key={p.panchayat_id} style={styles.card}>
          <Text style={styles.cardTitle}>{p.panchayat_name_en}</Text>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.changeBtn}
              onPress={() => setShowDropdown(true)}
            >
              <Text style={styles.btnText}>{translate('change')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemove(p.panchayat_id)}
            >
              <Text style={styles.btnText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Add New Dropdown */}
      {showDropdown && (
        <>
          <Text style={styles.label}>{translate('district')}</Text>

          <Picker
            selectedValue={selectedDistrict}
            onValueChange={v => {
              setSelectedDistrict(v);
              loadBlocks(v);
            }}
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

          <Text style={styles.label}>{translate('block')}</Text>
          <Picker
            selectedValue={selectedBlock}
            onValueChange={v => {
              setSelectedBlock(v);
              loadPanchayats(v);
            }}
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

          <Text style={styles.label}>{translate('panchayat')}</Text>
          <Picker
            selectedValue={selectedPanchayat}
            onValueChange={handleAddPanchayat}
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
        </>
      )}

      {/* Save Button */}
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>{translate('saveChanges')}</Text>
        )}
      </TouchableOpacity>

      {/* Saving Modal */}
      <Modal visible={saving} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <ActivityIndicator size="large" color="#EE6969" />
            <Text style={{ marginTop: 10 }}>{translate('saving')}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ================= Styles ================= */

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 3,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  changeBtn: {
    backgroundColor: '#EE6969',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeBtn: {
    backgroundColor: '#EE6969',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveBtn: {
    marginTop: 20,
    backgroundColor: '#EE6969',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
  label: {
    marginTop: 12,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
});
