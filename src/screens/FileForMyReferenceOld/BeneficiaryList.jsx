// // src/screens/record/BeneficiaryList.jsx
// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
// } from 'react-native';
// import gsApi from '../../api/gsApi';
// import BackButton from '../../components/BackButton';
// import LoaderModal from '../LoaderModal';
// import SearchBar from '../SearchBar';
// import BurgerMenu from '../BurgerMenu';
// import HamburgerIcon from '../../../assets/hamburger.png'; // adjust path
// import { useIsFocused } from '@react-navigation/native';
// import { clearUser } from '../../utils/auth';

// export default function BeneficiaryList({ navigation, route }) {
//   const { shg, viewOnly } = route.params;

//   const [query, setQuery] = useState('');
//   const [beneficiaries, setBeneficiaries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const isFocused = useIsFocused();

//   const loadBeneficiaries = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await gsApi.beneficiariesByShg(shg.id, viewOnly ? 'true' : 'false');
//       setBeneficiaries(Array.isArray(res) ? res : []);
//     } catch (err) {
//       console.warn('loadBeneficiaries', err);
//       setBeneficiaries([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [shg?.id, viewOnly]);

//   useEffect(() => { loadBeneficiaries(); }, []);
//   useEffect(() => { if (isFocused) loadBeneficiaries(); }, [isFocused]);

//   const filtered = beneficiaries.filter(b =>
//     b.name?.toLowerCase().includes(query.toLowerCase())
//   );

//   const menuItems = [
//     {
//       label: 'Record New Beneficiary',
//       onPress: () => {
//         navigation.popToTop(); // redirect to Dashboard
//         setMenuOpen(false);
//       },
//     },
//     {
//       label: 'View Recorded Beneficiary',
//       onPress: () => {
//         navigation.popToTop(); // redirect to Dashboard
//         setMenuOpen(false);
//       },
//     },
//     {
//       label: 'Logout',
//       color: '#EE6969',
//       onPress: async () => {
//         await clearUser();
//         navigation.replace('Login'); // navigate to login
//       },
//     },
//   ];

//   return (
//     <View style={{ flex: 1, padding: 12, marginTop: 50, backgroundColor: '#fff' }}>
//       <LoaderModal visible={loading} message="Fetching Beneficiaries..." />

//       {/* HEADER */}
//       <View style={styles.header}>
//         <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{shg.name}</Text>
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

//       {/* SEARCH */}
//       <SearchBar
//         placeholder="Search Beneficiary"
//         value={query}
//         onChangeText={text => setQuery(text)}
//         style={{ marginBottom: 12 }}
//       />

//       {/* LIST */}
//       <FlatList
//         data={filtered}
//         keyExtractor={item => String(item.id)}
//         renderItem={({ item }) => (
//           <View style={styles.listItem}>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.listText}>{item.name}</Text>
//               <Text style={styles.subText}>SHG: {item.shg_id} • Village: {item.village_id}</Text>
//               <Text style={styles.subText}>
//                 Enterprise Recorded: {item.enterprise_recorded ? 'Yes' : 'No'}
//               </Text>
//             </View>

//             <View style={{ flexDirection: 'column', gap: 6 }}>
//               {viewOnly ? (
//                 <TouchableOpacity
//                   style={styles.button}
//                   onPress={() => navigation.navigate('ViewBeneficiary', { beneficiary: item })}
//                 >
//                   <Text style={styles.buttonText}>View</Text>
//                 </TouchableOpacity>
//               ) : item.enterprise_recorded ? (
//                 <>
//                   <TouchableOpacity
//                     style={styles.button}
//                     onPress={() => navigation.navigate('ViewBeneficiary', { beneficiary: item })}
//                   >
//                     <Text style={styles.buttonText}>View</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={styles.button}
//                     onPress={() => navigation.navigate('EnterpriseForm', { beneficiary: item })}
//                   >
//                     <Text style={styles.buttonText}>Edit</Text>
//                   </TouchableOpacity>
//                 </>
//               ) : (
//                 <TouchableOpacity
//                   style={styles.button}
//                   onPress={() => navigation.navigate('EnterpriseForm', { beneficiary: item })}
//                 >
//                   <Text style={styles.buttonText}>Record</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
//         )}
//         ListEmptyComponent={
//           !loading && <Text style={{ color: '#666', marginTop: 12, textAlign: 'center' }}>No beneficiaries found.</Text>
//         }
//       />

//       {/* BURGER MENU */}
//       <BurgerMenu
//         visible={menuOpen}
//         onClose={() => setMenuOpen(false)}
//         menuItems={menuItems}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   listItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     paddingVertical: 8,
//     paddingHorizontal: 6,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EE6969',
//     marginBottom: 4,
//   },
//   listText: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#222',
//   },
//   subText: {
//     fontSize: 13,
//     color: '#555',
//     marginTop: 2,
//   },
//   button: {
//     backgroundColor: '#EE6969',
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//     textAlign: 'center',
//   },
// });


// src/screens/record/BeneficiaryList.jsx
import React, { useEffect, useState, useCallback, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import gsApi from '../../api/gsApi';
import BackButton from '../../components/BackButton';
import LoaderModal from '../LoaderModal';
import SearchBar from '../SearchBar';
import BurgerMenu from '../BurgerMenu';
import HamburgerIcon from '../../../assets/hamburger.png';
import { useIsFocused } from '@react-navigation/native';
import { clearUser } from '../../utils/auth';
import { LanguageContext } from '../../components/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';

export default function BeneficiaryList({ navigation, route }) {
  const { shg, viewOnly } = route.params;
  const { language } = useContext(LanguageContext);
  const isFocused = useIsFocused();

  const [query, setQuery] = useState('');
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // Translations including header title
  const translations = {
    en: {
      searchPlaceholder: 'Search Beneficiary',
      noBeneficiary: 'No beneficiaries found.',
      fetching: 'Fetching Beneficiaries...',
      view: 'View',
      edit: 'Edit',
      record: 'Record',
      headerTitle: 'Beneficiary List', // Header in English
    },
    hi: {
      searchPlaceholder: 'लाभार्थी खोजें',
      noBeneficiary: 'कोई लाभार्थी नहीं मिला।',
      fetching: 'लाभार्थी लोड हो रहे हैं...',
      view: 'देखें',
      edit: 'संपादित करें',
      record: 'रिकॉर्ड करें',
      headerTitle: 'लाभार्थी सूची', // Header in Hindi
    },
  };

  const t = translations[language] || translations.en;

  const loadBeneficiaries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await gsApi.beneficiariesByShg(shg.id, viewOnly ? 'true' : 'false');
      setBeneficiaries(Array.isArray(res) ? res : []);
    } catch (err) {
      console.warn('loadBeneficiaries', err);
      setBeneficiaries([]);
    } finally {
      setLoading(false);
    }
  }, [shg?.id, viewOnly]);

  useEffect(() => { loadBeneficiaries(); }, []);
  useEffect(() => { if (isFocused) loadBeneficiaries(); }, [isFocused]);

  const filtered = beneficiaries.filter(b =>
    b.name?.toLowerCase().includes(query.toLowerCase())
  );

  const menuItems = [
    { label: 'Record New Beneficiary', onPress: () => { navigation.popToTop(); setMenuOpen(false); } },
    { label: 'View Recorded Beneficiary', onPress: () => { navigation.popToTop(); setMenuOpen(false); } },
    { label: 'Logout', color: '#EE6969', onPress: async () => { await clearUser(); navigation.replace('Login'); } },
  ];

  return (
    <View style={{ flex: 1, padding: 12, marginTop: 50, backgroundColor: '#fff' }}>
      <LoaderModal visible={loading} message={t.fetching} />

      {/* HEADER */}
      <View style={styles.header}>
         <View style={{gap: 4
                          }}><LanguageToggle style={{ marginRight: 10 }} /><BackButton /></View>
        {/* Centered header title that switches with language */}
        {/* <BackButton /> */}
        <Text style={styles.headerTitle}>{t.headerTitle}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* <LanguageToggle style={{ marginRight: 10 }} /> */}
          <TouchableOpacity onPress={() => setMenuOpen(true)} style={{ marginLeft: 12 }}>
            <Image source={HamburgerIcon} style={{ width: 28, height: 28, tintColor: '#333' }} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </View>

      {/* SEARCH */}
      <SearchBar
        placeholder={t.searchPlaceholder}
        value={query}
        onChangeText={setQuery}
        style={{ marginBottom: 12 }}
      />

      {/* LIST */}
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.listText}>{item.name}</Text>
              <Text style={styles.subText}>SHG: {item.shg_id} • Village: {item.village_id}</Text>
              <Text style={styles.subText}>
                Enterprise Recorded: {item.enterprise_recorded ? 'Yes' : 'No'}
              </Text>
            </View>

            <View style={{ flexDirection: 'column', gap: 6 }}>
              {viewOnly ? (
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ViewBeneficiary', { beneficiary: item })}>
                  <Text style={styles.buttonText}>{t.view}</Text>
                </TouchableOpacity>
              ) : item.enterprise_recorded ? (
                <>
                  <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ViewBeneficiary', { beneficiary: item })}>
                    <Text style={styles.buttonText}>{t.view}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EnterpriseForm', { beneficiary: item })}>
                    <Text style={styles.buttonText}>{t.edit}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EnterpriseFormNew', { beneficiary: item })}>
                  <Text style={styles.buttonText}>{t.record}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading && <Text style={{ color: '#666', marginTop: 12, textAlign: 'center' }}>{t.noBeneficiary}</Text>
        }
      />

      {/* BURGER MENU */}
      <BurgerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} menuItems={menuItems} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, position: 'relative' },
  headerTitle: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontWeight: 'bold', fontSize: 16, color: '#333' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 8, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: '#EE6969', marginBottom: 4 },
  listText: { fontSize: 15, fontWeight: '600', color: '#222' },
  subText: { fontSize: 13, color: '#555', marginTop: 2 },
  button: { backgroundColor: '#EE6969', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  buttonText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
});
