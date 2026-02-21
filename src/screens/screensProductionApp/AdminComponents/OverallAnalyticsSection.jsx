// src/screens/admin/AdminComponents/OverallAnalyticsSection.jsx

import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import gsApi from '../../../api/gsApi';
import { LanguageContext } from '../../../components/LanguageContext';

const screenWidth = Dimensions.get('window').width;

export default function OverallAnalyticsSection() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const { language } = useContext(LanguageContext);

  /* ------------------ Translations ------------------ */

  const translations = {
    en: {
      total: 'Total',
      existing: 'Existing',
      new: 'New',
      notInterested: 'Not Interested',
      enterpriseDistribution: 'Enterprise Distribution',
      analyticsErrorTitle: 'Error',
      analyticsErrorMsg: 'Failed to load analytics.',
    },
    hi: {
      total: 'कुल',
      existing: 'मौजूदा',
      new: 'नया',
      notInterested: 'रुचि नहीं',
      enterpriseDistribution: 'एंटरप्राइज वितरण',
      analyticsErrorTitle: 'त्रुटि',
      analyticsErrorMsg: 'एनालिटिक्स लोड करने में विफल।',
    },
  };

  const t = translations[language] || translations.en;
  const translate = key => t[key] || translations.en[key] || key;

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await gsApi.getEPSakhiAnalytics();
      setAnalytics(res);
    } catch (err) {
      console.error('Analytics error', err);
      Alert.alert(
        translate('analyticsErrorTitle'),
        translate('analyticsErrorMsg'),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#EE6969" />
      </View>
    );
  }

  if (!analytics) return null;

  const {
    total_beneficiaries = 0,
    existing_enterprise = 0,
    new_enterprise = 0,
    not_interested = 0,
  } = analytics;

  const chartData = {
    labels: [
      translate('existing'),
      translate('new'),
      translate('notInterested'),
    ],
    datasets: [
      {
        data: [existing_enterprise, new_enterprise, not_interested],
      },
    ],
  };

  return (
    <View style={styles.container}>
      {/* ---- 4 Rounded Cards ---- */}
      <View style={styles.cardsRow}>
        <StatCard title={translate('total')} value={total_beneficiaries} />
        <StatCard title={translate('existing')} value={existing_enterprise} />
      </View>

      <View style={styles.cardsRow}>
        <StatCard title={translate('new')} value={new_enterprise} />
        <StatCard title={translate('notInterested')} value={not_interested} />
      </View>

      {/* ---- Bar Chart ---- */}
      <Text style={styles.chartTitle}>
        {translate('enterpriseDistribution')}
      </Text>

      <BarChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        fromZero
        yAxisLabel=""
        chartConfig={{
          backgroundGradientFrom: '#FFF7F0',
          backgroundGradientTo: '#FFF7F0',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(238, 105, 105, ${opacity})`,
          labelColor: () => '#333',
          style: { borderRadius: 12 },
        }}
        style={{ marginTop: 8, borderRadius: 12 }}
      />
    </View>
  );
}

/* ------------------ Stat Card ------------------ */

function StatCard({ title, value }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  );
}

/* ------------------ Styles ------------------ */

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderColor: '#FF7E00',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFF7F0',
    overflow: 'hidden',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',

    // shadow
    shadowColor: '#FF7E00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#EE6969',
  },
  cardTitle: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },
  chartTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  loaderContainer: {
    padding: 20,
    alignItems: 'center',
  },
});
