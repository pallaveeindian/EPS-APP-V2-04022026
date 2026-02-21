// src/screens/admin/AdminComponents/CRPListComponents/CRPTable.jsx

import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import gsApi from '../../../../api/gsApi';
import { useNavigation } from '@react-navigation/native';
import { LanguageContext } from '../../../../components/LanguageContext';

export default function CRPTable({ filters }) {
  const { language } = useContext(LanguageContext);
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const PAGE_SIZE = 10;

  /* ------------------ Translations ------------------ */

  const translations = {
    en: {
      selectFiltersMsg: 'Please select filters and click Fetch.',
      noRecords: 'No records found.',
      recordedBeneficiaries: 'Recorded Beneficiaries',
      district: 'District',
      block: 'Block',
      panchayat: 'Panchayat',
      view: 'View',
      prev: 'Prev',
      next: 'Next',
      page: 'Page',
      of: 'of',
    },
    hi: {
      selectFiltersMsg: 'कृपया फ़िल्टर चुनें और प्राप्त करें पर क्लिक करें।',
      noRecords: 'कोई रिकॉर्ड नहीं मिला।',
      recordedBeneficiaries: 'दर्ज लाभार्थी',
      district: 'जिला',
      block: 'ब्लॉक',
      panchayat: 'पंचायत',
      view: 'देखें',
      prev: 'पिछला',
      next: 'अगला',
      page: 'पृष्ठ',
      of: 'का',
    },
  };

  const t = translations[language] || translations.en;
  const translate = key => t[key] || translations.en[key] || key;

  /* ================= Fetch CRPs ================= */

  const fetchCRPs = async (pageNumber = 1) => {
    if (!filters?.district_id) return;

    try {
      setLoading(true);

      const res = await gsApi.getAdminCrpList({
        ...filters,
        page: pageNumber,
        page_size: PAGE_SIZE,
      });

      setData(res?.results || []);
      setCount(res?.count || 0);
      setPage(pageNumber);
    } catch (err) {
      console.error('CRP list fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!filters?.district_id) return;
    fetchCRPs(1);
  }, [filters]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  /* ================= UI ================= */

  if (!filters?.district_id) {
    return <Text style={styles.infoText}>{translate('selectFiltersMsg')}</Text>;
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#EE6969" />;
  }

  if (data.length === 0) {
    <Text style={styles.infoText}>{translate('noRecords')}</Text>;
  }

  const renderCard = ({ item, index }) => {
    const serialNumber = (page - 1) * PAGE_SIZE + index + 1;

    return (
      <View style={styles.card}>
        {/* Serial Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{serialNumber}</Text>
        </View>

        {/* Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.crpName}>{item.name}</Text>

          <TouchableOpacity
            style={styles.viewButton}
            onPress={() =>
              navigation.navigate('CRPDetail', {
                crpId: item.lokos_member_code,
              })
            }
          >
            <Text style={styles.viewText}>{translate('view')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View
          style={[
            styles.beneficiaryBox,
            item.total_beneficiaries > 0
              ? styles.beneficiaryActive
              : styles.beneficiaryInactive,
          ]}
        >
          <Text style={styles.beneficiaryLabel}>
            {translate('recordedBeneficiaries')}
          </Text>
          <Text style={styles.beneficiaryNumber}>
            {item.total_beneficiaries}
          </Text>
        </View>

        <DetailRow label={translate('district')} value={item.district_name} />
        <DetailRow label={translate('block')} value={item.block_name} />
        <DetailRow label={translate('panchayat')} value={item.panchayat_name} />
      </View>
    );
  };

  return (
    <View>
      {/* ====== Cards List ====== */}
      <FlatList
        data={data}
        keyExtractor={item => item.id.toString()}
        renderItem={renderCard}
      />

      {/* ====== Pagination ====== */}
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.pageButton, page === 1 && styles.disabledButton]}
          disabled={page === 1}
          onPress={() => fetchCRPs(page - 1)}
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
          onPress={() => fetchCRPs(page + 1)}
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
      <Text style={styles.detailValue}>{value}</Text>
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
    overflow: 'visible',
  },

  badge: {
    position: 'absolute',
    backgroundColor: '#EE6969',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },

  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  crpName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    paddingRight: 8,
  },

  viewButton: {
    backgroundColor: '#EE6969',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },

  viewText: {
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

  beneficiaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  beneficiaryActive: {
    backgroundColor: '#E6F7EC',
    borderWidth: 1,
    borderColor: '#28A745',
  },

  beneficiaryInactive: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#CCC',
  },

  beneficiaryLabel: {
    fontWeight: '600',
    fontSize: 14,
  },

  beneficiaryNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#28A745',
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
