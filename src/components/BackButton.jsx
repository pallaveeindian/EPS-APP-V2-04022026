// import React from 'react';
// import { TouchableOpacity, Text } from 'react-native';
// import { useNavigation } from '@react-navigation/native';

// export default function BackButton(){
//   const nav = useNavigation();
//   return (
//     <TouchableOpacity onPress={() => nav.goBack()}  style={{
//     paddingHorizontal: 20,
//     paddingVertical: 4,
//     marginBottom: 12,
//     borderRadius: 6, 
//     borderWidth: 1,
//     borderColor: '#EE6969',
//     alignItems: 'center',
//     justifyContent: 'center',
//     alignSelf: 'flex-start',
//   }}>
//       <Text style={{ color:'#EE6969' }}>Back</Text>
//     </TouchableOpacity>
//   );
// }


import React, { useContext } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LanguageContext } from '../components/LanguageContext'; // Adjust path

const translations = {
  en: { back: 'Back' },
  hi: { back: 'पीछे' },
  // Add more languages as needed
};

export default function BackButton() {
  const nav = useNavigation();
  const { language } = useContext(LanguageContext);
  
  const t = (key) => translations[language]?.[key] || key;

  return (
    <TouchableOpacity 
      onPress={() => nav.goBack()} 
      style={{
        paddingHorizontal: 20,
        paddingVertical: 4,
        marginBottom: 12,
        borderRadius: 6, 
        borderWidth: 1,
        borderColor: '#EE6969',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ color: '#EE6969' }}>{t('back')}</Text>
    </TouchableOpacity>
  );
}
