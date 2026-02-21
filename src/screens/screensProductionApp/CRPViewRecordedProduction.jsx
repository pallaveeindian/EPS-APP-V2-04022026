// src/screens/epsakhi/CRPViewRecordedProduction.jsx
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { clearUser } from '../../utils/auth';
import { LanguageContext } from '../../components/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';
import BurgerMenu from '../BurgerMenu';
import gsApi from '../../api/gsApi';
import { clearAllTemp } from '../../utils/tempStore';
import EPSTableFilters from './CRPViewComponents/EPSTableFilters';
import EPSTable from './CRPViewComponents/EPSTable';

export default function CRPViewRecordedProduction({ navigation }) {
  const [filters, setFilters] = useState({});
  const { language } = useContext(LanguageContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const translations = {
    en: {
      headerTitle: 'Recorded Beneficiaries',
      enterpriseHeading: 'Enterprise Sakhis recorded by CRPs',
      logout: 'Logout',
      backtodb: 'Back to Dashboard',
    },
    hi: {
      headerTitle: 'रिकॉर्ड किए गए लाभार्थी देखें',
      enterpriseHeading: 'सीआरपी द्वारा दर्ज एंटरप्राइज सखियाँ',
      logout: 'लॉग आउट',
      backtodb: 'डैशबोर्ड पर वापस जाएं',
    },
  };

  const t = translations[language] || translations.en;
  const translate = key => t[key] || translations.en[key] || key;

  const handleLogout = async () => {
    clearAllTemp();
    await clearUser();
    gsApi.setAuthToken?.(null);
    navigation.replace('Login');
  };

  const menuItems = [
    {
      label: t.backtodb,
      color: '#EE6969',
      onPress: () => navigation.goBack(),
    },
    {
      label: t.logout,
      color: '#EE6969',
      onPress: handleLogout,
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <LanguageToggle />
        <TouchableOpacity onPress={() => setMenuOpen(true)}>
          <Text style={{ fontSize: 26, color: '#FF7E00' }}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* TITLE */}
      <Text style={styles.title}>{translate('headerTitle')}</Text>

      {/* SECTION 1 */}
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Filters</Text>
        <EPSTableFilters onFiltersChange={setFilters} />
      </View>

      {/* SECTION 2 - Table */}
      <View style={styles.section}>
        <EPSTable filters={filters} />
      </View>

      <BurgerMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        menuItems={menuItems}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 16,
    color: '#EE6969',
    textAlign: 'center',
  },
  section: {
    borderWidth: 1.5,
    borderColor: '#FF7E00',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#FFF7F0',

    shadowColor: '#FF7E00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
});
