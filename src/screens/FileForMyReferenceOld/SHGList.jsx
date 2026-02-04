// // src/screens/record/SelectGP.jsx
// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Alert,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
// } from 'react-native';
// import gsApi from '../../api/gsApi';
// import { getUser } from '../../utils/auth';
// import LoaderModal from '../LoaderModal';
// import SearchBar from '../SearchBar';
// import BackButton from '../../components/BackButton';
// import BurgerMenu from '../BurgerMenu';
// import LanguageToggle from '../../components/LanguageToggle';
// import HamburgerIcon from '../../../assets/hamburger.png';

// // --- Translation dictionary ---
// const translations = {
//   en: {
//     selectPanchayat: 'Select Panchayat',
//     searchPlaceholder: 'Search Panchayat',
//     recorded: 'Recorded',
//     open: 'Open',
//     noPanchayats: 'No Panchayats found.',
//     previous: 'Previous',
//     next: 'Next',
//     menuRecord: 'Record New Beneficiary Detail',
//     menuView: 'View Recorded Beneficiary',
//     menuLogout: 'Logout',
//     logoutConfirm: 'Are you sure you want to logout?',
//     loading: 'Loading Panchayats...',
//   },
//   hi: {
//     selectPanchayat: 'पंचायत चुनें',
//     searchPlaceholder: 'पंचायत खोजें',
//     recorded: 'रिकॉर्डेड',
//     open: 'खोलें',
//     noPanchayats: 'कोई पंचायत नहीं मिली।',
//     previous: 'पिछला',
//     next: 'अगला',
//     menuRecord: 'नए लाभार्थी विवरण रिकॉर्ड करें',
//     menuView: 'रिकॉर्ड किए गए लाभार्थी देखें',
//     menuLogout: 'लॉग आउट',
//     logoutConfirm: 'क्या आप वाकई लॉग आउट करना चाहते हैं?',
//     loading: 'पंचायत लोड हो रही है...',
//   },
// };

// export default function SelectGP({ navigation, route }) {
//   const [query, setQuery] = useState('');
//   const [panchayats, setPanchayats] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [lang, setLang] = useState('en'); // default English
//   const pageSize = 2;

//   const t = translations[lang];

//   // Fetch Panchayats
//   useEffect(() => {
//     const fetchPanchayats = async () => {
//       setLoading(true);
//       try {
//         const u = await getUser();
//         let data = [];

//         if (u && u.assigned_clf_id && !route.params?.adminDistrictId) {
//           const res = await gsApi.panchayatsByClf(u.assigned_clf_id);
//           data = Array.isArray(res) ? res : [];
//           // additional data enrichment logic omitted for brevity
//         } else {
//           const all = (await gsApi.list('Panchayat')) || [];
//           const filtered = route.params?.adminDistrictId
//             ? all.filter(p => String(p.district_id) === String(route.params.adminDistrictId))
//             : all;

//           const enriched = await Promise.all(filtered.map(async p => {
//             try {
//               const villages = await gsApi.villagesByPanchayat(p.id);
//               const sum = Array.isArray(villages) ? villages.reduce((acc, v) => acc + (Number(v.recorded_count || 0)), 0) : 0;
//               return { ...p, recorded_count: sum };
//             } catch {
//               return { ...p, recorded_count: 0 };
//             }
//           }));
//           data = enriched;
//         }

//         setPanchayats(data);
//       } catch (err) {
//         console.warn('SelectGP load error', err);
//         Alert.alert('Error', String(err));
//         setPanchayats([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPanchayats();
//   }, [route.params]);

//   const filtered = panchayats.filter(p => p.name?.toLowerCase().includes(query.toLowerCase()));
//   const totalPages = Math.ceil(filtered.length / pageSize);
//   const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

//   // Burger menu items
//   const menuItems = [
//     {
//       label: t.menuRecord,
//       onPress: () => navigation.popToTop(),
//     },
//     {
//       label: t.menuView,
//       onPress: () => navigation.popToTop(),
//     },
//     {
//       label: t.menuLogout,
//       color: '#EE6969',
//       onPress: async () => {
//         const { clearUser } = await import('../../utils/auth');
//         await clearUser();
//         navigation.replace('Login');
//       },
//     },
//   ];

//   return (
//     <View style={{ flex: 1, padding: 12 }}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>{t.selectPanchayat}</Text>
//         <View style={styles.headerRight}>
//           <BackButton />
//           <TouchableOpacity onPress={() => setMenuOpen(true)} style={{ marginLeft: 12 }}>
//             <Image
//               source={HamburgerIcon}
//               style={{ width: 28, height: 28, tintColor: '#333' }}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* LANGUAGE TOGGLE */}
//       <LanguageToggle language={lang} setLanguage={setLang} style={styles.languageToggle} />

//       {/* SEARCH */}
//       <SearchBar
//         placeholder={t.searchPlaceholder}
//         value={query}
//         onChangeText={text => { setQuery(text); setPage(1); }}
//         style={{ marginBottom: 12 }}
//       />

//       <LoaderModal visible={loading} message={t.loading} />

//       {!loading && (
//         <>
//           <FlatList
//             data={paginated}
//             keyExtractor={item => String(item.id)}
//             renderItem={({ item }) => (
//               <View style={styles.listItem}>
//                 <Text style={styles.listText}>
//                   {item.name} — {t.recorded}: {item.recorded_count ?? 0}
//                 </Text>

//                 <TouchableOpacity
//                   style={styles.openButton}
//                   onPress={() => navigation.navigate('VillageList', { panchayat: item, viewOnly: route.params?.viewOnly })}
//                 >
//                   <Text style={styles.buttonText}>{t.open}</Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//             ListEmptyComponent={<Text style={{ color: '#666', marginTop: 12 }}>{t.noPanchayats}</Text>}
//           />

//           {totalPages > 1 && (
//             <View style={styles.pagination}>
//               <TouchableOpacity
//                 disabled={page <= 1}
//                 onPress={() => setPage(prev => Math.max(prev - 1, 1))}
//                 style={[styles.pageButton, page <= 1 && styles.disabledButton]}
//               >
//                 <Text style={styles.buttonText}>{t.previous}</Text>
//               </TouchableOpacity>

//               <Text style={{ alignSelf: 'center' }}>{page} / {totalPages}</Text>

//               <TouchableOpacity
//                 disabled={page >= totalPages}
//                 onPress={() => setPage(prev => Math.min(prev + 1, totalPages))}
//                 style={[styles.pageButton, page >= totalPages && styles.disabledButton]}
//               >
//                 <Text style={styles.buttonText}>{t.next}</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </>
//       )}

//       {menuOpen && <BurgerMenu items={menuItems} onClose={() => setMenuOpen(false)} />}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//     marginTop: 50,
//   },
//   headerTitle: {
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   headerRight: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
  
//   listItem: {
//     padding: 12,
//     marginVertical: 6,
//     borderWidth: 1,
//     borderRadius: 8,
//     borderColor: '#ccc',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   listText: {
//     fontSize: 14,
//     flexShrink: 1,
//   },
//   openButton: {
//     backgroundColor: '#007AFF',
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 4,
//   },
//   buttonText: {
//     color: '#fff',
//   },
//   pagination: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 12,
//     alignItems: 'center',
//   },
//   pageButton: {
//     backgroundColor: '#007AFF',
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 4,
//   },
//   disabledButton: {
//     backgroundColor: '#ccc',
//   },
// });


// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
// import gsApi from '../../api/gsApi';
// import BackButton from '../../components/BackButton';
// import LoaderModal from '../LoaderModal';
// import SearchBar from '../SearchBar';
// import BurgerMenu from '../BurgerMenu';
// import HamburgerIcon from '../../../assets/hamburger.png'; // adjust path

// export default function SHGList({ navigation, route }) {
//   const { village, viewOnly } = route.params;
//   const [query, setQuery] = useState('');
//   const [shgs, setShgs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [menuOpen, setMenuOpen] = useState(false);

//   useEffect(() => {
//     const fetchSHGs = async () => {
//       try {
//         setLoading(true);
//         const res = await gsApi.shgsByVillage(village.id);
//         setShgs(res || []);
//       } catch (err) {
//         console.warn('Error fetching SHGs', err);
//         setShgs([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchSHGs();
//   }, [village.id]);

//   const filtered = shgs.filter(s =>
//     s.name?.toLowerCase().includes(query.toLowerCase())
//   );

//   // Burger menu items
//   const menuItems = [
//     {
//       label: 'Record New Beneficiary Detail',
//       onPress: () => navigation.popToTop(),
//     },
//     {
//       label: 'View Recorded Beneficiary',
//       onPress: () => navigation.popToTop(),
//     },
//     {
//       label: 'Logout',
//       color: '#EE6969',
//       onPress: async () => {
//         const { clearUser } = await import('../../utils/auth');
//         await clearUser();
//         navigation.replace('Login');
//       },
//     },
//   ];

//   return (
//     <View style={styles.container}>
//       {/* Loader */}
//       <LoaderModal visible={loading} message="Fetching SHGs..." />

//       {/* Header row: Title + Back + Menu */}
//       <View style={styles.headerRow}>
//         <Text style={styles.title}>{village.name}</Text>
//         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//           <BackButton />
//           <TouchableOpacity onPress={() => setMenuOpen(true)} style={{ marginLeft: 12 }}>
//             <Image
//               source={HamburgerIcon}
//               style={{ width: 28, height: 28, tintColor: '#333' }}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Search Bar */}
//       <SearchBar
//         placeholder="Search SHG"
//         value={query}
//         onChangeText={setQuery}
//         style={{ marginBottom: 12 }}
//       />

//       {/* SHG List */}
//       <FlatList
//         data={filtered}
//         keyExtractor={item => String(item.id)}
//         renderItem={({ item }) => (
//           <View style={styles.listItem}>
//             <Text style={styles.listText}>
//               {item.name} — Recorded: {item.recorded_count ?? 0}
//             </Text>
//             <TouchableOpacity
//               style={styles.openButton}
//               onPress={() =>
//                 navigation.navigate('BeneficiaryList', { shg: item, viewOnly })
//               }
//             >
//               <Text style={styles.buttonText}>Beneficiaries</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//         ListEmptyComponent={
//           !loading && <Text style={styles.emptyText}>No SHGs found.</Text>
//         }
//       />

//       {/* Burger Menu */}
//       <BurgerMenu
//         visible={menuOpen}
//         onClose={() => setMenuOpen(false)}
//         menuItems={menuItems}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 12,
//     marginTop: 50,
//     backgroundColor: '#fff',
//   },
//   headerRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   title: {
//     fontWeight: 'bold',
//     fontSize: 16,
//     color: '#333',
//   },
//   listItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 6,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EE6969',
//     marginBottom: 4,
//   },
//   listText: {
//     flex: 1,
//     fontSize: 15,
//     color: '#222',
//   },
//   openButton: {
//     backgroundColor: '#EE6969',
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   emptyText: {
//     color: '#666',
//     marginTop: 12,
//     textAlign: 'center',
//   },
// });



// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
// import gsApi from '../../api/gsApi';
// import BackButton from '../../components/BackButton';
// import LoaderModal from '../LoaderModal';
// import SearchBar from '../SearchBar';
// import BurgerMenu from '../BurgerMenu';
// import HamburgerIcon from '../../../assets/hamburger.png'; // adjust path

// export default function SHGList({ navigation, route }) {
//   const { village, viewOnly } = route.params;
//   const [query, setQuery] = useState('');
//   const [shgs, setShgs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [language, setLanguage] = useState('en'); // 'en' or 'hi'

//   // Translation dictionary
//   const t = {
//     en: {
//       searchPlaceholder: 'Search SHG',
//       beneficiaries: 'Beneficiaries',
//       noSHG: 'No SHGs found.',
//       fetching: 'Fetching SHGs...',
//       toggleLang: 'HI',
//     },
//     hi: {
//       searchPlaceholder: 'एसएचजी खोजें',
//       beneficiaries: 'लाभार्थी',
//       noSHG: 'कोई SHG नहीं मिला।',
//       fetching: 'SHG लोड हो रहा है...',
//       toggleLang: 'EN',
//     },
//   };

//   useEffect(() => {
//     const fetchSHGs = async () => {
//       try {
//         setLoading(true);
//         const res = await gsApi.shgsByVillage(village.id);
//         setShgs(res || []);
//       } catch (err) {
//         console.warn('Error fetching SHGs', err);
//         setShgs([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchSHGs();
//   }, [village.id]);

//   const filtered = shgs.filter(s =>
//     s.name?.toLowerCase().includes(query.toLowerCase())
//   );

//   const menuItems = [
//     {
//       label: 'Record New Beneficiary Detail',
//       onPress: () => navigation.popToTop(),
//     },
//     {
//       label: 'View Recorded Beneficiary',
//       onPress: () => navigation.popToTop(),
//     },
//     {
//       label: 'Logout',
//       color: '#EE6969',
//       onPress: async () => {
//         const { clearUser } = await import('../../utils/auth');
//         await clearUser();
//         navigation.replace('Login');
//       },
//     },
//   ];

//   return (
//     <View style={styles.container}>
//       {/* Loader */}
//       <LoaderModal visible={loading} message={t[language].fetching} />

//       {/* Header row */}
//       <View style={styles.headerRow}>
//         <BackButton />
//         <Text style={styles.title}>{village.name}</Text>
//         <View style={styles.rightHeader}>
//           {/* Hamburger */}
//           <TouchableOpacity onPress={() => setMenuOpen(true)} style={{ marginRight: 8 }}>
//             <Image
//               source={HamburgerIcon}
//               style={{ width: 28, height: 28, tintColor: '#333' }}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>

//           {/* Language toggle */}
//           <TouchableOpacity
//             onPress={() => setLanguage(language === 'en' ? 'hi' : 'en')}
//             style={styles.langButton}
//           >
//             <Text style={styles.langText}>{t[language].toggleLang}</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Search Bar */}
//       <SearchBar
//         placeholder={t[language].searchPlaceholder}
//         value={query}
//         onChangeText={setQuery}
//         style={{ marginBottom: 12 }}
//       />

//       {/* SHG List */}
//       <FlatList
//         data={filtered}
//         keyExtractor={item => String(item.id)}
//         renderItem={({ item }) => (
//           <View style={styles.listItem}>
//             <Text style={styles.listText}>
//               {item.name} — Recorded: {item.recorded_count ?? 0}
//             </Text>
//             <TouchableOpacity
//               style={styles.openButton}
//               onPress={() =>
//                 navigation.navigate('BeneficiaryList', { shg: item, viewOnly })
//               }
//             >
//               <Text style={styles.buttonText}>{t[language].beneficiaries}</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//         ListEmptyComponent={
//           !loading && <Text style={styles.emptyText}>{t[language].noSHG}</Text>
//         }
//       />

//       {/* Burger Menu */}
//       <BurgerMenu
//         visible={menuOpen}
//         onClose={() => setMenuOpen(false)}
//         menuItems={menuItems}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 12,
//     marginTop: 50,
//     backgroundColor: '#fff',
//   },
//   headerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   title: {
//     fontWeight: 'bold',
//     fontSize: 16,
//     color: '#333',
//     textAlign: 'center',
//     flex: 1,
//   },
//   rightHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   langButton: {
//     paddingVertical: 4,
//     paddingHorizontal: 8,
//     borderWidth: 1,
//     borderColor: '#333',
//     borderRadius: 6,
//     backgroundColor: '#f0f0f0',
//   },
//   langText: {
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
//   listItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 6,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EE6969',
//     marginBottom: 4,
//   },
//   listText: {
//     flex: 1,
//     fontSize: 15,
//     color: '#222',
//   },
//   openButton: {
//     backgroundColor: '#EE6969',
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   emptyText: {
//     color: '#666',
//     marginTop: 12,
//     textAlign: 'center',
//   },
// });


// src/screens/SHGList.jsx
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import gsApi from '../../api/gsApi';
import BackButton from '../../components/BackButton';
import LoaderModal from '../LoaderModal';
import SearchBar from '../SearchBar';
import BurgerMenu from '../BurgerMenu';
import HamburgerIcon from '../../../assets/hamburger.png';
import { LanguageContext } from '../../components/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';

export default function SHGList({ navigation, route }) {
  const { village, viewOnly } = route.params;
  const { language } = useContext(LanguageContext);

  const [query, setQuery] = useState('');
  const [shgs, setShgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // Translations
  const translations = {
    en: {
      searchPlaceholder: 'Search SHG',
      beneficiaries: 'Beneficiaries',
      noSHG: 'No SHGs found.',
      fetching: 'Fetching SHGs...',
      headerTitle: 'SHG List', // header title in English
    },
    hi: {
      searchPlaceholder: 'एसएचजी खोजें',
      beneficiaries: 'लाभार्थी',
      noSHG: 'कोई SHG नहीं मिला।',
      fetching: 'SHG लोड हो रहा है...',
      headerTitle: 'एसएचजी सूची', // header title in Hindi
    },
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    const fetchSHGs = async () => {
      try {
        setLoading(true);
        const res = await gsApi.shgsByVillage(village.id);
        setShgs(res || []);
      } catch (err) {
        console.warn('Error fetching SHGs', err);
        setShgs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSHGs();
  }, [village.id]);

  const filtered = shgs.filter(s =>
    s.name?.toLowerCase().includes(query.toLowerCase())
  );

  const menuItems = [
    { label: 'Record New Beneficiary Detail', onPress: () => navigation.popToTop() },
    { label: 'View Recorded Beneficiary', onPress: () => navigation.popToTop() },
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
      {/* Loader */}
      <LoaderModal visible={loading} message={t.fetching} />

      {/* Header */}
      <View style={styles.headerRow}>
         <View style={{gap: 4
                          }}><LanguageToggle style={{ marginRight: 10 }} /><BackButton /></View>
        {/* <BackButton /> */}
        {/* Centered header title that switches with language */}
        <Text style={styles.title}>{t.headerTitle}</Text>
        <View style={styles.rightHeader}>
          {/* <LanguageToggle style={{ marginRight: 10 }} /> */}
          <TouchableOpacity onPress={() => setMenuOpen(true)} style={{ marginRight: 8 }}>
            <Image
              source={HamburgerIcon}
              style={{ width: 28, height: 28, tintColor: '#333' }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <SearchBar
        placeholder={t.searchPlaceholder}
        value={query}
        onChangeText={setQuery}
        style={{ marginBottom: 12 }}
      />

      {/* SHG List */}
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listText}>
              {item.name} — {t.beneficiaries}: {item.recorded_count ?? 0}
            </Text>
            <TouchableOpacity
              style={styles.openButton}
              onPress={() => navigation.navigate('BeneficiaryList', { shg: item, viewOnly })}
            >
              <Text style={styles.buttonText}>{t.beneficiaries}</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={!loading && (
          <Text style={styles.emptyText}>{t.noSHG}</Text>
        )}
      />

      {/* Burger Menu */}
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
  title: { 
    position: 'absolute', 
    left: 0, 
    right: 0, 
    textAlign: 'center', 
    fontWeight: 'bold', 
    fontSize: 16, 
    color: '#333' 
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
  openButton: { backgroundColor: '#EE6969', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  buttonText: { color: '#fff', fontWeight: '600' },
  emptyText: { color: '#666', marginTop: 12, textAlign: 'center' },
});
