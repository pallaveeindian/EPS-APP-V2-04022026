// .\src\screens\screensProductionApp\BlockList.jsx
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import gsApi from '../../api/gsApi';
import LoaderModal from '../../screens/LoaderModal';
import BackButton from '../../components/BackButton';
import SearchBar from '../../screens/SearchBar';
import BurgerMenu from '../../screens/BurgerMenu';
import { LanguageContext } from '../../components/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';

export default function BlockList({ navigation, route }) {
  const { adminDistrictId } = route.params || {};
  const { language } = useContext(LanguageContext);

  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10; 

  const translations = {
    en: {
      searchPlaceholder: 'Search Block',
      headerTitle: 'Blocks',
      open: 'Open',
      noItems: 'No blocks found.',
      fetching: 'Fetching blocks...',
      prev: 'Previous',
      next: 'Next',
    },
    hi: {
      searchPlaceholder: 'ब्लॉक खोजें',
      headerTitle: 'ब्लॉक्स',
      open: 'खोलें',
      noItems: 'कोई ब्लॉक नहीं मिला।',
      fetching: 'ब्लॉक्स लोड हो रहे हैं...',
      prev: 'पिछला',
      next: 'अगला',
    },
  };

  const t = translations[language] || translations.en;

  // Fetch blocks on district, page, or search
  useEffect(() => {
    if (!adminDistrictId) return;
    setLoading(true);

    const fetchBlocks = async () => {
      try {
        // Backend should support pagination + search in a single call!
        const res = await gsApi.getBlocksByDistrict(adminDistrictId, page, query);

        // For API format consistency
        const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        const count = res?.count ?? results.length;
        setBlocks(results);
        setTotalPages(Math.max(1, Math.ceil(count / pageSize)));
      } catch (err) {
        setBlocks([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchBlocks();
  }, [adminDistrictId, page, query]);

  const handleSearchChange = (text) => {
    setQuery(text);
    setPage(1); 
  };

  const menuItems = [
    {
      label: 'Logout',
      color: '#EE6969',
      onPress: async () => {
        const { clearUser } = await import('../../utils/auth');
        await clearUser();
        navigation.replace('Login');
      },
    },
  ];

  return (
    <View style={styles.container}>
      <LoaderModal visible={loading} message={t.fetching} />

      
      <View style={styles.headerRow}>
        <View style={{ gap: 4, flexDirection: 'row' }}>
          <LanguageToggle />
          <BackButton />
        </View>
        <Text style={styles.title}>{t.headerTitle}</Text>
        <View style={styles.rightHeader}>
          <TouchableOpacity
            onPress={() => setMenuOpen(true)}
            style={{ marginRight: 8 }}
          >
            <Text style={{ fontSize: 28 }}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      
      <SearchBar
        placeholder={t.searchPlaceholder}
        value={query}
        onChangeText={handleSearchChange}
        style={{ marginBottom: 12 }}
      />

      <FlatList
        data={blocks} 
        keyExtractor={item => String(item.block_id)}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listText}>{item.block_name_en}</Text>
            <TouchableOpacity
              style={styles.openButton}
              onPress={() =>
                navigation.navigate('SelectGP', { adminBlockId: item.block_id })
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

      {/* PAGINATION */}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  rightHeader: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EE6969',
    marginBottom: 4,
  },
  listText: { flex: 1, fontSize: 15, color: '#222' },
  openButton: {
    backgroundColor: '#EE6969',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
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
