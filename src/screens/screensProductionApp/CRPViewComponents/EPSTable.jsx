// src/screens/screensProductionApp/CRPViewComponents/EPSTable.jsx

import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LanguageContext } from '../../../components/LanguageContext';
import gsApi from '../../../api/gsApi';
import { getUser } from '../../../utils/auth';

export default function EPSTable({ filters }) {
  const { language } = useContext(LanguageContext);
  const navigation = useNavigation();

  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const PAGE_SIZE = 10;

  /* ================= Translations ================= */

  const translations = {
    en: {
      noRecords: 'No records found.',
      selectFiltersMsg: 'Apply filters to view beneficiaries.',
      view: 'View',
      delete: 'Delete',
      confirmDelete: 'Are you sure you want to delete this record?',
      cancel: 'Cancel',
      prev: 'Prev',
      next: 'Next',
      page: 'Page',
      of: 'of',
      panchayat: 'Panchayat',
      village: 'Village',
      enterpriseType: 'Enterprise Type',
      createdOn: 'Created On',
      pldStatus: 'PLD',
    },
    hi: {
      noRecords: 'कोई रिकॉर्ड नहीं मिला।',
      selectFiltersMsg: 'लाभार्थी देखने के लिए फ़िल्टर लागू करें।',
      view: 'देखें',
      delete: 'हटाएं',
      confirmDelete: 'क्या आप इस रिकॉर्ड को हटाना चाहते हैं?',
      cancel: 'रद्द करें',
      prev: 'पिछला',
      next: 'अगला',
      page: 'पृष्ठ',
      of: 'का',
      panchayat: 'पंचायत',
      village: 'गांव',
      enterpriseType: 'उद्यम प्रकार',
      createdOn: 'तारीख',
      pldStatus: 'पीएलडी',
    },
  };

  const t = translations[language] || translations.en;
  const translate = key => t[key] || translations.en[key] || key;

  /* ================= Extract User ID Safely ================= */

  const getUserIdFromAuth = u => {
    if (!u) return null;

    if (u.user && u.user.id) return u.user.id;
    if (u.id) return u.id;
    if (u.user_id) return u.user_id;
    if (u.master_user_id) return u.master_user_id;

    return null;
  };

  /* ================= Load User ================= */

  useEffect(() => {
    (async () => {
      const u = await getUser();

      if (!u) return;

      if (u.access) {
        gsApi.setAuthToken?.(u.access, u.refresh);
      }

      const extractedId = getUserIdFromAuth(u);

      if (!extractedId) {
        console.error('Unable to extract user ID');
        return;
      }

      setUserId(extractedId);
    })();
  }, []);

  /* ================= Fetch Data ================= */

  const fetchData = async (pageNumber = 1) => {
    if (!userId) return;

    try {
      setLoading(true);

      const res = await gsApi.getRecordedBeneficiaries({
        created_by: userId, // BASE FILTER
        ...filters,
        page: pageNumber,
        page_size: PAGE_SIZE,
        search: filters?.search || '',
      });

      setData(res?.results || []);
      setCount(res?.count || 0);
      setPage(pageNumber);
    } catch (err) {
      console.error('EPS fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchData(1);
  }, [filters, userId]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  /* ================= Delete ================= */

  const handleDelete = id => {
    Alert.alert(
      translate('delete'),
      translate('confirmDelete'),
      [
        { text: translate('cancel'), style: 'cancel' },
        {
          text: translate('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await gsApi.deleteRecordedBeneficiary(id);
              fetchData(page);
            } catch (err) {
              console.error('Delete error', err);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  /* ================= Empty States ================= */

  if (!filters) {
    return <Text style={styles.infoText}>{translate('selectFiltersMsg')}</Text>;
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#EE6969" />;
  }

  if (data.length === 0) {
    return <Text style={styles.infoText}>{translate('noRecords')}</Text>;
  }

  /* ================= Render Card ================= */

  const renderCard = ({ item, index }) => {
    const serialNumber = (page - 1) * PAGE_SIZE + index + 1;

    return (
      <View style={styles.card}>
        {/* Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{serialNumber}</Text>
        </View>

        {/* Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.applicant_name}</Text>

          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() =>
                navigation.navigate('EPSDetail', {
                  epsId: item.id,
                })
              }
            >
              <Text style={styles.buttonText}>{translate('view')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.buttonText}>{translate('delete')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <DetailRow
          label={translate('panchayat')}
          value={item.panchayat_name_en}
        />
        <DetailRow
          label={translate('village')}
          value={item.village_name_english}
        />
        <DetailRow
          label={translate('enterpriseType')}
          value={item.enterprise_type}
        />
        <DetailRow
          label={translate('pldStatus')}
          value={item.pld_status ? 'Yes' : 'No'}
        />
        <DetailRow
          label={translate('createdOn')}
          value={item.created_at?.split('T')[0]}
        />
      </View>
    );
  };

  /* ================= UI ================= */

  return (
    <View>
      <FlatList
        data={data}
        keyExtractor={item => item.id.toString()}
        renderItem={renderCard}
      />

      {/* Pagination */}
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.pageButton, page === 1 && styles.disabledButton]}
          disabled={page === 1}
          onPress={() => fetchData(page - 1)}
        >
          <Text style={styles.pageButtonText}>{translate('prev')}</Text>
        </TouchableOpacity>

        <Text style={styles.pageInfo}>
          {translate('page')} {page} {translate('of')} {totalPages || 1}
        </Text>

        <TouchableOpacity
          style={[
            styles.pageButton,
            page === totalPages && styles.disabledButton,
          ]}
          disabled={page === totalPages}
          onPress={() => fetchData(page + 1)}
        >
          <Text style={styles.pageButtonText}>{translate('next')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ================= Detail Row ================= */

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value || '-'}</Text>
    </View>
  );
}

/* ================= Styles ================= */

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    paddingTop: 24,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#FF7E00',
    shadowColor: '#FF7E00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },

  badge: {
    position: 'absolute',
    backgroundColor: '#EE6969',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badgeText: {
    color: '#fff',
    fontWeight: '700',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },

  viewButton: {
    backgroundColor: '#EE6969',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 6,
  },

  deleteButton: {
    backgroundColor: '#444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  detailLabel: {
    fontWeight: '600',
    color: '#555',
  },

  detailValue: {
    color: '#333',
  },

  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },

  pageButton: {
    backgroundColor: '#EE6969',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginHorizontal: 10,
  },

  pageButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  disabledButton: {
    backgroundColor: '#ccc',
  },

  pageInfo: {
    fontWeight: '600',
  },

  infoText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#555',
  },
});
