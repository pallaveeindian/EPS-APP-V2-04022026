// .\src\screens\CRPDashboard.jsx
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';

import { getUser, clearUser } from './utils/auth';
import gsApi from './api/gsApi.js';
import LoaderModal from './LoaderModal';
import BurgerMenu from './BurgerMenu';
import LanguageToggle from './components/LanguageToggle';
import { LanguageContext } from './components/LanguageContext';
import { setTemp, getTemp, clearTempCache } from './utils/tempCache';

import HamburgerIcon from '././assets/hamburger.png';

export default function CRPDashboard({ navigation }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState([]); // per GP

  const { language } = useContext(LanguageContext);

  const translations = {
    en: {
      title: 'CRP Dashboard',
      recordBeneficiaries: 'Record New Beneficiaries Detail',
      viewBeneficiaries: 'View Recorded Beneficiaries',
      logout: 'Logout',
      openingBeneficiaries: 'Opening recorded beneficiaries...',
      userPlaceholder: 'User',
      analyticsHeader: 'Beneficiary Enterprises by Gram Panchayat',
      noAnalytics: 'No recorded beneficiaries found under your panchayats.',
      loadingAnalytics: 'Loading CRP analytics...',
    },
    hi: {
      title: 'सीआरपी डैशबोर्ड',
      recordBeneficiaries: 'नए लाभार्थियों का विवरण रिकॉर्ड करें',
      viewBeneficiaries: 'रिकॉर्ड किए गए लाभार्थियों देखें',
      logout: 'लॉग आउट',
      openingBeneficiaries: 'रिकॉर्ड किए गए लाभार्थियों को खोल रहे हैं...',
      userPlaceholder: 'उपयोगकर्ता',
      analyticsHeader: 'ग्राम पंचायत अनुसार उद्यम लाभार्थी',
      noAnalytics: 'आपकी ग्राम पंचायतों में कोई रिकॉर्डेड लाभार्थी नहीं मिला।',
      loadingAnalytics: 'सीआरपी विश्लेषण लोड हो रहा है...',
    },
  };

  const t = translations[language] || translations.en;

  // Bootstrap CRP session: CRP detail, panchayats under CRP, SHG list, analytics
  const bootstrapCrpData = async (u) => {
    try {
      setLoading(true);

      const backendUser = u.backendUser || {};
      const userId = backendUser.id;

      // 1) CRP detail by master_user id (get CRPEP row + block_id)
      const crpDetail = await gsApi.getCrpDetailByUserId(userId);
      // Expecting one CRP; if array, take first
      const crp = Array.isArray(crpDetail) ? crpDetail[0] : crpDetail;
      if (!crp) {
        Alert.alert('Error', 'No CRP detail found for this user.');
        return;
      }
      const crpId = crp.id;
      const blockId = crp.block_id;

      setTemp('crpDetail', crp);

      // 2) Panchayats allocated to this CRP
      const panchayatMapping = await gsApi.getPanchayatsUnderCrp(crpId);
      // This view returns objects with allocated_panchayat_id by design
      const panchayatIds = (panchayatMapping || []).map(
        (row) => row.allocated_panchayat_id
      );
      setTemp('crpPanchayatIds', panchayatIds);

      // 3) Panchayat master list for that block (to get names)
      const panchayatRes = await gsApi.getPanchayatsByBlock(blockId, 1, '');
      let allPanchayats = [];
      if (Array.isArray(panchayatRes?.results)) allPanchayats = panchayatRes.results;
      else if (Array.isArray(panchayatRes)) allPanchayats = panchayatRes;
      else if (Array.isArray(panchayatRes?.data)) allPanchayats = panchayatRes.data;
      setTemp('crpPanchayatMasterList', allPanchayats);

      // 4) UPSRLM SHG list for this block (cache once for later SHG screens)
      const shgList = await gsApi.getUpsrlmShgList({ block_id: blockId, page_size: 500 });
      setTemp('crpShgList', shgList);

      // 5) Recorded beneficiaries analytics grouped by panchayat
      //    GET /recorded-beneficiaries/?block_id=&group_by=panchayat_id
      const grouped = await gsApi.getRecordedBeneficiariesGrouped({
        block_id: blockId,
        group_by: 'panchayat_id',
      });
      // grouped is like [{ panchayat_id: 123, count: 10 }, ...]

      // keep in cache for "view recorded beneficiaries" flow
      setTemp('crpAnalyticsByPanchayatRaw', grouped);

      // 6) Map panchayat names + restrict to CRP-allocated panchayats
      const gpById = {};
      allPanchayats.forEach((p) => {
        gpById[p.panchayat_id] = p;
      });

      const analyticsList = (grouped || [])
        .filter((row) => panchayatIds.includes(row.panchayat_id))
        .map((row) => {
          const gp = gpById[row.panchayat_id] || {};
          return {
            panchayat_id: row.panchayat_id,
            count: row.count,
            name_en: gp.panchayat_name_en || `Panchayat ${row.panchayat_id}`,
          };
        });

      setAnalytics(analyticsList);
    } catch (err) {
      console.log('CRP bootstrap error', err);
      Alert.alert(
        'Error',
        'Unable to load CRP analytics. Please try again after some time.'
      );
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

      // restore auth state into gsApi for this session
      if (u.tokens?.access || u.tokens?.refresh || u.backendUser) {
        gsApi.setAuthState({
          access: u.tokens?.access,
          refresh: u.tokens?.refresh,
          user: u.backendUser,
        });
      }

      const role = String(u.role || '').toLowerCase();
      if (role !== 'crp') {
        // Safety: if somehow Admin landed here, send back to appropriate dashboard
        if (role === 'admin') navigation.replace('AdminDashboard');
        else navigation.replace('Login');
        return;
      }

      // Try to use cached analytics if already computed in this session
      const cached = getTemp('crpAnalyticsByPanchayatRaw', null);
      if (cached) {
        // Rebuild pretty analytics list from cache + cached panchayat master list
        const panchayatIds = getTemp('crpPanchayatIds', []);
        const allPanchayats = getTemp('crpPanchayatMasterList', []);
        const gpById = {};
        allPanchayats.forEach((p) => {
          gpById[p.panchayat_id] = p;
        });
        const analyticsList = (cached || [])
          .filter((row) => panchayatIds.includes(row.panchayat_id))
          .map((row) => {
            const gp = gpById[row.panchayat_id] || {};
            return {
              panchayat_id: row.panchayat_id,
              count: row.count,
              name_en: gp.panchayat_name_en || `Panchayat ${row.panchayat_id}`,
            };
          });
        setAnalytics(analyticsList);
      } else {
        await bootstrapCrpData(u);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await clearUser();
    clearTempCache();
    gsApi.clearAuthState();
    navigation.replace('Login');
  };

  const menuItems = [
    {
      label: t.logout,
      onPress: handleLogout,
    },
  ];

  const handleRecordNew = () => {
    // Here you will navigate into your future CRP Record flow:
    // Panchayat -> Village -> SHG -> Beneficiary -> Form
    // For now, just navigate to SelectGP and later adjust that screen
    // to use crpPanchayatIds from temp cache instead of adminBlockId.
    navigation.navigate('SelectGP', { fromCrp: true });
  };

  const handleViewBeneficiaries = () => {
    // Similarly, for "View Recorded Beneficiaries" flow, you can reuse the
    // same screens but in view-only mode, using cached analytics.
    navigation.navigate('SelectGP', { fromCrpViewOnly: true, viewOnly: true });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userText}>
          {user ? user.username : t.userPlaceholder}
        </Text>

        <View style={styles.headerRight}>
          <LanguageToggle />

          <TouchableOpacity
            onPress={() => setMenuOpen(true)}
            style={{ marginLeft: 12 }}
          >
            <Image source={HamburgerIcon} style={styles.hamburgerIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.title}>{t.title}</Text>

      <TouchableOpacity style={styles.primaryButton} onPress={handleRecordNew}>
        <Text style={styles.primaryButtonText}>{t.recordBeneficiaries}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleViewBeneficiaries}
      >
        <Text style={styles.secondaryButtonText}>{t.viewBeneficiaries}</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 24 }}>
        <Text style={styles.analyticsTitle}>{t.analyticsHeader}</Text>
        {loading && (
          <LoaderModal visible={true} message={t.loadingAnalytics} />
        )}
        {!loading && analytics.length === 0 && (
          <Text style={styles.emptyText}>{t.noAnalytics}</Text>
        )}
        {!loading &&
          analytics.map((row) => (
            <View key={row.panchayat_id} style={styles.analyticsCard}>
              <Text style={styles.analyticsName}>{row.name_en}</Text>
              <Text style={styles.analyticsCount}>
                {row.count} recorded beneficiaries
              </Text>
            </View>
          ))}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userText: {
    fontSize: 16,
    fontWeight: '600',
  },
  hamburgerIcon: {
    width: 28,
    height: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#EE6969',
  },
  primaryButton: {
    backgroundColor: '#EE6969',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    borderColor: '#EE6969',
    borderWidth: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 24,
  },
  secondaryButtonText: {
    color: '#EE6969',
    fontWeight: '500',
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  analyticsCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EE6969',
    marginBottom: 8,
  },
  analyticsName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  analyticsCount: {
    fontSize: 14,
    color: '#555',
  },
  emptyText: {
    marginTop: 8,
    color: '#666',
  },
});
