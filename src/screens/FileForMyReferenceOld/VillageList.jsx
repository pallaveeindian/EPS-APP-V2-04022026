// // src/screens/VillageList.jsx
// import React, { useEffect, useState } from 'react';
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

// export default function VillageList({ navigation, route }) {
//   const { panchayat, viewOnly } = route.params;

//   const [query, setQuery] = useState('');
//   const [villages, setVillages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [menuOpen, setMenuOpen] = useState(false);

//   // Fetch villages
//   useEffect(() => {
//     (async () => {
//       try {
//         setLoading(true);
//         const res = await gsApi.villagesByPanchayat(panchayat.id);
//         setVillages(res || []);
//       } catch (err) {
//         console.warn('Error fetching villages', err);
//         setVillages([]);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [panchayat.id]);

//   // Filtered villages
//   const filtered = villages.filter(v =>
//     v.name?.toLowerCase().includes(query.toLowerCase())
//   );

//   // Burger menu items
//   const menuItems = [
//     {
//       label: 'Record New Beneficiary Detail',
//       onPress: () => {
//         navigation.popToTop(); // redirect to Dashboard
//       },
//     },
//     {
//       label: 'View Recorded Beneficiary',
//       onPress: () => {
//         navigation.popToTop(); // redirect to Dashboard
//       },
//     },
//     {
//       label: 'Logout',
//       color: '#EE6969',
//       onPress: async () => {
//         const { clearUser } = await import('../../utils/auth');
//         await clearUser();
//         navigation.replace('Login'); // navigate to login
//       },
//     },
//   ];

//   return (
//     <View style={{ flex: 1, padding: 12, marginTop: 50 }}>
//       <LoaderModal visible={loading} message="Loading villages..." />

//       {/* HEADER */}
//       <View style={styles.header}>
//         <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{panchayat.name}</Text>
//         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//           <BackButton />
//           <TouchableOpacity
//             onPress={() => setMenuOpen(true)}
//             style={{ marginLeft: 12 }}
//           >
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
//         placeholder="Search Village"
//         value={query}
//         onChangeText={text => setQuery(text)}
//         style={{ marginBottom: 12 }}
//       />

//       {/* VILLAGE LIST */}
//       <FlatList
//         data={filtered}
//         keyExtractor={i => String(i.id)}
//         renderItem={({ item }) => (
//           <View style={styles.listItem}>
//             <Text style={styles.listText}>
//               {item.name} — Recorded: {item.recorded_count ?? 0}
//             </Text>

//             <TouchableOpacity
//               style={styles.openButton}
//               onPress={() =>
//                 navigation.navigate('SHGList', { village: item, viewOnly })
//               }
//             >
//               <Text style={styles.buttonText}>SHGs</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//         ListEmptyComponent={
//           <Text style={{ color: '#666', marginTop: 12 }}>No villages found.</Text>
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
// });


// src/screens/VillageList.jsx
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import gsApi from '../../api/gsApi';
import BackButton from '../../components/BackButton';
import LoaderModal from '../LoaderModal';
import SearchBar from '../SearchBar';
import BurgerMenu from '../BurgerMenu';
import HamburgerIcon from '../../../assets/hamburger.png';
import { LanguageContext } from '../../components/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';

export default function VillageList({ navigation, route }) {
  const { panchayat, viewOnly } = route.params;

  const { language } = useContext(LanguageContext);

  const [query, setQuery] = useState('');
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // 🔤 Translations
  const translations = {
    en: {
      loading: 'Loading villages...',
      searchPlaceholder: 'Search Village',
      noVillages: 'No villages found.',
      recorded: 'Recorded',
      shgs: 'SHGs',
      headerTitle: 'Village List', // header text in English
    },
    hi: {
      loading: 'गाँव लोड हो रहे हैं...',
      searchPlaceholder: 'गाँव खोजें',
      noVillages: 'कोई गाँव नहीं मिला।',
      recorded: 'रिकॉर्डेड',
      shgs: 'एसएचजी',
      headerTitle: 'गाँव सूची', // header text in Hindi
    },
  };

  const t = translations[language] || translations.en;

  // Fetch villages
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await gsApi.villagesByPanchayat(panchayat.id);
        setVillages(res || []);
      } catch (err) {
        console.warn('Error fetching villages', err);
        setVillages([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [panchayat.id]);

  // Filtered villages
  const filtered = villages.filter(v =>
    v.name?.toLowerCase().includes(query.toLowerCase())
  );

  // Burger menu items
  const menuItems = [
    {
      label: 'Record New Beneficiary Detail',
      onPress: () => navigation.popToTop(),
    },
    {
      label: 'View Recorded Beneficiary',
      onPress: () => navigation.popToTop(),
    },
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
    <View style={{ flex: 1, padding: 12, marginTop: 50 }}>
      <LoaderModal visible={loading} message={t.loading} />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={{gap: 4
                  }}><LanguageToggle style={{ marginRight: 10 }} /><BackButton /></View>
        {/* <BackButton /> */}
        {/* Centered header text that switches with language */}
        <Text style={styles.headerTitle}>{t.headerTitle}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' }}>
          
          {/* <LanguageToggle style={{ marginRight: 10 }} /> */}
          <TouchableOpacity onPress={() => setMenuOpen(true)} style={{ marginLeft: 12 }}>
            <Image
              source={HamburgerIcon}
              style={{ width: 28, height: 28, tintColor: '#333' }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* SEARCH */}
      <SearchBar
        placeholder={t.searchPlaceholder}
        value={query}
        onChangeText={text => setQuery(text)}
        style={{ marginBottom: 12 }}
      />

      {/* VILLAGE LIST */}
      <FlatList
        data={filtered}
        keyExtractor={i => String(i.id)}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listText}>
              {item.name} — {t.recorded}: {item.recorded_count ?? 0}
            </Text>

            <TouchableOpacity
              style={styles.openButton}
              onPress={() =>
                navigation.navigate('SHGList', { village: item, viewOnly })
              }
            >
              <Text style={styles.buttonText}>{t.shgs}</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: '#666', marginTop: 12 }}>{t.noVillages}</Text>
        }
      />

      {/* BURGER MENU */}
      <BurgerMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        menuItems={menuItems}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative', // for absolute centered title
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
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
  listText: {
    flex: 1,
    fontSize: 15,
  },
  openButton: {
    backgroundColor: '#EE6969',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
