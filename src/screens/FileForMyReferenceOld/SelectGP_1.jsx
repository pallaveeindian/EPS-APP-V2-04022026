// .\src\screens\screensProductionApp\SelectGP.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import gsApi from '../../api/gsApi';
import LoaderModal from '../../screens/LoaderModal';
import BackButton from '../../components/BackButton';
import SearchBar from '../../screens/SearchBar';
import BurgerMenu from '../../screens/BurgerMenu';
import LanguageToggle from '../../components/LanguageToggle';

export default function SelectGP({ navigation, route }) {
  const { adminBlockId } = route.params || {};
  const [panchayat, setPanchayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10; 

  const translations = {
    en: {
      searchPlaceholder: 'Search Gram Panchayat',
      headerTitle: 'Gram Panchayats',
      open: 'Open',
      noItems: 'No Gram Panchayats found.',
      fetching: 'Loading Gram Panchayats...',
      prev: 'Previous',
      next: 'Next',
    },
  };

  const t = translations.en;

  useEffect(() => {
    if (!adminBlockId) {
      Alert.alert('Error', 'No block selected.');
      navigation.goBack();
      return;
    }

    const fetchGPs = async () => {
      setLoading(true);
      try {
        
        const res = await gsApi.getPanchayatsByBlock(adminBlockId, page, query);
        let data = [];
        let count = 0;
        if (Array.isArray(res?.results)) {
          data = res.results;
          count = res.count ?? res.results.length;
        } else if (Array.isArray(res)) {
          data = res;
          count = res.length;
        } else if (Array.isArray(res?.data)) {
          data = res.data;
          count = res.data.length;
        }
        setPanchayat(data);
        setTotalPages(Math.max(1, Math.ceil(count / pageSize)));
      } catch (err) {
        setPanchayat([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchGPs();
  }, [adminBlockId, page, query]);

  const handleSearchChange = (text) => {
    setQuery(text);
    setPage(1); 
  };

  const menuItems = [
    {
      label: 'Logout',
      color: '#EE6969',
      onPress: () => navigation.replace('Login'),
    },
  ];

  return (
    <View style={styles.container}>
      <LoaderModal visible={loading} message={t.fetching} />

      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <LanguageToggle />
          <BackButton />
        </View>
        <Text style={styles.title}>{t.headerTitle}</Text>
        <TouchableOpacity
          onPress={() => setMenuOpen(true)}
          style={{ marginLeft: 'auto' }}
        >
          <Text style={{ fontSize: 26 }}>☰</Text>
        </TouchableOpacity>
      </View>
      <SearchBar
        placeholder={t.searchPlaceholder}
        value={query}
        onChangeText={handleSearchChange}
        style={{ marginBottom: 12 }}
      />
      <FlatList
        data={panchayat}
        keyExtractor={item => String(item.panchayat_id)}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listText}>{item.panchayat_name_en}</Text>
            <TouchableOpacity
              style={styles.openButton}
              onPress={() =>
                navigation.navigate('SelectVillages', { adminPanchayatId: item.panchayat_id })
              }
            >
              <Text style={styles.buttonText}>{t.open}</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          !loading && <Text style={styles.emptyText}>{t.noItems}</Text>
        }
      />
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            disabled={page <= 1 || loading}
            onPress={() => setPage(prev => Math.max(prev - 1, 1))}
            style={[styles.pageButton, page <= 1 && styles.disabledButton]}
          >
            <Text style={styles.buttonText}>{t.prev}</Text>
          </TouchableOpacity>

          <Text style={{ alignSelf: 'center' }}>
            {page} / {totalPages}
          </Text>

          <TouchableOpacity
            disabled={page >= totalPages || loading}
            onPress={() => setPage(prev => Math.min(prev + 1, totalPages))}
            style={[styles.pageButton, page >= totalPages && styles.disabledButton]}
          >
            <Text style={styles.buttonText}>{t.next}</Text>
          </TouchableOpacity>
        </View>
      )}

      <BurgerMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        menuItems={menuItems}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, marginTop: 50, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, position: 'relative' },
  title: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontWeight: 'bold', fontSize: 16, color: '#333' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EE6969', marginBottom: 4 },
  listText: { flex: 1, fontSize: 15, color: '#222' },
  openButton: { backgroundColor: '#EE6969', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  buttonText: { color: '#fff', fontWeight: '600' },
  emptyText: { color: '#666', marginTop: 12, textAlign: 'center' },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    alignItems: 'center',
  },
  pageButton: { padding: 8, backgroundColor: '#EE6969', borderRadius: 6 },
  disabledButton: { backgroundColor: '#ccc' },
});
