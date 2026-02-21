// src/screens/admin/AdminComponents/CRPDetail.jsx

import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Platform,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { getUser, clearUser } from '../../../utils/auth';
import gsApi from '../../../api/gsApi';
import LoaderModal from '../../LoaderModal';
import BurgerMenu from '../../BurgerMenu';
import LanguageToggle from '../../../components/LanguageToggle';
import { LanguageContext } from '../../../components/LanguageContext';
import { clearAllTemp } from '../../../utils/tempStore';

import CRPInfo from './CRPDetailComponents/CRPInfo';
import CRPPanchayats from './CRPDetailComponents/CRPPanchayats';

export default function CRPDetail({ route }) {
  const navigation = useNavigation();
  const { language } = useContext(LanguageContext);

  const { crpId } = route.params;
  const memberCode = crpId;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  /* ------------------ Translations ------------------ */

  const translations = {
    en: {
      headerTitle: 'CRP Details',
      logout: 'Logout',
      dashboard: 'Dashboard',
      loading: 'Loading CRP details...',
      sessionExpiredTitle: 'Session expired',
      sessionExpiredMsg: 'Your session has expired. Please log in again.',
    },
    hi: {
      headerTitle: 'सीआरपी विवरण',
      logout: 'लॉग आउट',
      dashboard: 'डैशबोर्ड',
      loading: 'सीआरपी विवरण लोड हो रहा है...',
      sessionExpiredTitle: 'सत्र समाप्त',
      sessionExpiredMsg: 'आपका सत्र समाप्त हो गया है। कृपया फिर से लॉगिन करें।',
    },
  };

  const t = translations[language] || translations.en;

  const translate = key => t[key] || translations.en[key] || key;

  /* ------------------ Auth Handling ------------------ */

  const isAuthExpiredError = err => {
    const status = err?.status || err?.response?.status;
    return status === 401;
  };

  const handleLogout = async () => {
    clearAllTemp();
    await clearUser();
    gsApi.setAuthToken?.(null);
    navigation.replace('Login');
  };

  const handleSessionExpired = () => {
    Alert.alert(
      translate('sessionExpiredTitle'),
      translate('sessionExpiredMsg'),
      [{ text: 'OK', onPress: handleLogout }],
    );
  };

  /* ------------------ Bootstrap ------------------ */

  const bootstrap = async u => {
    try {
      setLoading(true);

      if (u?.access) {
        gsApi.setAuthToken?.(u.access, u.refresh);
      }
    } catch (err) {
      if (isAuthExpiredError(err)) {
        handleSessionExpired();
        return;
      }

      Alert.alert('Error', 'Failed to load CRP details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const u = await getUser();

      if (!u) {
        navigation.replace('Login');
        return;
      }

      setUser(u);
      await bootstrap(u);
    })();
  }, []);

  const onRefresh = async () => {
    if (!user) return;

    setRefreshing(true);

    await bootstrap(user);

    setRefreshKey(prev => prev + 1);

    setRefreshing(false);
  };

  /* ------------------ Menu ------------------ */

  const menuItems = [
    {
      label: t.dashboard,
      color: '#EE6969',
      onPress: () => {
        navigation.navigate('AdminDashboard');
      },
    },
    {
      label: t.logout,
      color: '#EE6969',
      onPress: handleLogout,
    },
  ];

  const headerUsername = user?.user?.username || user?.username || 'Admin';

  /* ------------------ UI ------------------ */

  return (
    <SafeAreaView style={styles.container}>
      <LoaderModal visible={loading} message={t.loading} />

      {/* -------- FIXED HEADER -------- */}
      <View style={styles.fixedHeader}>
        <View style={styles.header}>
          <LanguageToggle />

          <View style={styles.headerRight}>
            <Text style={styles.userText}>{headerUsername}</Text>
            <TouchableOpacity
              style={{ marginLeft: 12 }}
              onPress={() => setMenuOpen(true)}
            >
              <Text style={{ fontSize: 26, color: '#FF7E00' }}>☰</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* -------- SCROLLABLE CONTENT -------- */}
      <ScrollView
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 50 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>
          {t.headerTitle} - {memberCode}
        </Text>

        {/* SECTION 1 */}
        <View style={styles.section}>
          <CRPInfo memberCode={memberCode} refreshKey={refreshKey} />
        </View>

        {/* SECTION 2 */}
        <View style={styles.section}>
          <CRPPanchayats memberCode={memberCode} refreshKey={refreshKey} />
        </View>
      </ScrollView>

      <BurgerMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        menuItems={menuItems}
      />
    </SafeAreaView>
  );
}

/* ------------------ Styles ------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 16,
  },
  fixedHeader: {
    backgroundColor: '#fff',
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF7E00',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 12,
    color: '#EE6969',
    textAlign: 'center',
  },
  section: {
    borderWidth: 1.5,
    borderColor: '#FF7E00',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#FFF7F0',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
});
