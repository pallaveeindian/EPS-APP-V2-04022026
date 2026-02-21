// src/screens/admin/AdminComponents/CRPList.jsx

import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CRPTableFilters from './CRPListComponents/CRPTableFilters';
import CRPTable from './CRPListComponents/CRPTable';
import { LanguageContext } from '../../../components/LanguageContext';

export default function CRPList() {
  const [filters, setFilters] = useState({});
  const { language } = useContext(LanguageContext);

  /* ------------------ Translations ------------------ */

  const translations = {
    en: {
      enterpriseHeading: 'Enterprise Sakhis recorded by CRPs',
    },
    hi: {
      enterpriseHeading: 'सीआरपी द्वारा दर्ज एंटरप्राइज सखियाँ',
    },
  };

  const t = translations[language] || translations.en;
  const translate = key => t[key] || translations.en[key] || key;

  return (
    <View style={styles.container}>
      {/* SECTION 1 - Filters */}
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>
          {translate('enterpriseHeading')}
        </Text>

        <CRPTableFilters onFiltersChange={setFilters} />
      </View>

      {/* SECTION 2 - Table */}
      <View style={styles.section}>
        <CRPTable filters={filters} />
      </View>
    </View>
  );
}

/* ================= Styles ================= */

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  section: {
    borderWidth: 1.5,
    borderColor: '#FF7E00',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    minHeight: 120,
    backgroundColor: '#FFF7F0',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
});
