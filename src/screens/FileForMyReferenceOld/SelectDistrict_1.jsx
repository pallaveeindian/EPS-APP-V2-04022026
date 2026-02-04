// .\src\screens\screensProductionApp\SelectDistrict.jsx
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import LoaderModal from '../LoaderModal';
import SearchBar from '../SearchBar';
import BackButton from '../../components/BackButton';
import { LanguageContext } from '../../components/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';
import BurgerMenu from '../BurgerMenu';
import gsApi from '../../api/gsApi'; 

export default function SelectDistrict({ navigation, route }) {
  const [query, setQuery] = useState('');
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const pageSize = 10; 

  const { language } = useContext(LanguageContext);

  const translations = {
    en: {
      title: 'Select District',
      searchPlaceholder: 'Search District',
      loading: 'Loading Districts...',
      noItems: 'No Districts found.',
      recorded: 'Recorded',
      open: 'Open',
      prev: 'Previous',
      next: 'Next',
    },
    hi: {
      title: 'जिला चुनें',
      searchPlaceholder: 'जिला खोजें',
      loading: 'जिलों को लोड किया जा रहा है...',
      noItems: 'कोई जिला नहीं मिला।',
      recorded: 'रिकॉर्डेड',
      open: 'खोलें',
      prev: 'पिछला',
      next: 'अगला',
    },
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    const fetchDistricts = async () => {
      setLoading(true);
      try {
       
        const data = await gsApi.getDistricts(page, query);
        setDistricts(data.results); 
        const total = data.count || 0; 
        setTotalPages(Math.ceil(total / pageSize)); 
      } catch (error) {
        console.error('Error fetching districts:', error);
        Alert.alert('Error', 'Failed to load districts.');
      } finally {
        setLoading(false);
      }
    };
    fetchDistricts();
  }, [page, query]);

  const handleSearchChange = (text) => {
    setQuery(text);
    setPage(1); 
  };

  
  const menuItems = [
    { label: 'Logout', color: '#EE6969', onPress: () => navigation.replace('Login') },
  ];

  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: 'white' }}>
    
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 50 }}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <LanguageToggle />
          <BackButton />
        </View>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{t.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setMenuOpen(true)} style={{ marginLeft: 12 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

     
      <SearchBar
        placeholder={t.searchPlaceholder}
        value={query}
        onChangeText={handleSearchChange}
        style={{ marginBottom: 12 }}
      />

    
      <LoaderModal visible={loading} message={t.loading} />

      {!loading && (
        <>
          <FlatList
            data={districts} 
            keyExtractor={(item) => String(item.district_id)}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.listText}>
                  {item.district_name_en} ({item.district_short_name_en})
                </Text>
                <TouchableOpacity
                  style={styles.openButton}
                  onPress={() => navigation.navigate('BlockList', { adminDistrictId: item.district_id })}
                >
                  <Text style={styles.buttonText}>{t.open}</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={{ color: '#666', marginTop: 12 }}>{t.noItems}</Text>}
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
        </>
      )}

      <BurgerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} menuItems={menuItems} />
    </View>
  );
}

const styles = StyleSheet.create({
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
  listText: { flex: 1, fontSize: 15 },
  openButton: { backgroundColor: '#EE6969', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  pageButton: { padding: 8, backgroundColor: '#EE6969', borderRadius: 6 },
  disabledButton: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: '600' },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
});
