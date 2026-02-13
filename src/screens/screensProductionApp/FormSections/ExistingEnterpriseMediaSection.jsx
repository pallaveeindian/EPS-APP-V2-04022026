// src/screens/screensProductionApp/FormSections/ExistingEnterpriseMediaSection.jsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import LanguageToggle from '../../../components/LanguageToggle';
import { LanguageContext } from '../../../components/LanguageContext';
import { useContext } from 'react';
export default function ExistingEnterpriseMediaSection({
  existingForm,
  setExistingForm,
}) {
  const update = (patch) => setExistingForm(patch);
  const { language } = useContext(LanguageContext);

  const pickFiles = async (fieldName, allowedTypes) => {
    try {
      const res = await launchImageLibrary({
        mediaType: allowedTypes,
        selectionLimit: 20,
      });

      if (res.didCancel) return;

      const assets = res.assets || [];
      const existing = existingForm[fieldName] || [];
      update({ [fieldName]: [...existing, ...assets] });
    } catch (err) {
      console.warn('File pick failed:', err);
    }
  };

  const captureFromCamera = async (fieldName, allowedTypes) => {
    try {
      const res = await launchCamera({
        mediaType: allowedTypes,
      });

      if (res.didCancel) return;

      const assets = res.assets || [];
      const existing = existingForm[fieldName] || [];
      update({ [fieldName]: [...existing, ...assets] });
    } catch (err) {
      console.warn('Camera capture failed:', err);
    }
  };

  const renderUploadBlock = (labelEn, labelHi, fieldName, type, helpEn, helpHi) => (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{language === 'hi' ? labelHi : labelEn}
</Text>
      <Text style={styles.helpText}>{language === 'hi' ? helpHi : helpEn}</Text>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          style={styles.mediaBtn}
          onPress={() => pickFiles(fieldName, type)}
        >
          <Text style={styles.mediaBtnText}> {language === 'hi' ? 'अपलोड करें' : 'Upload'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mediaBtn}
          onPress={() => captureFromCamera(fieldName, type)}
        >
          <Text style={styles.mediaBtnText}>{language === 'hi' ? 'कैमरा' : 'Camera'}</Text>
        </TouchableOpacity>
      </View>

      {Array.isArray(existingForm[fieldName]) &&
        existingForm[fieldName].length > 0 && (
          <Text style={styles.mediaInfo}>
            {/* Selected: {existingForm[fieldName].length} */}
            {language === 'hi'
            ? `चयनित: ${existingForm[fieldName].length}`
            : `Selected: ${existingForm[fieldName].length}`}
          </Text>
        )}
    </View>
  );

  return (
    <View style={styles.sectionContainer}>
       <View
                                    style={{
                                      flexDirection: 'row',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      marginBottom: 10,
                                    }}
                                  >
      <Text style={styles.sectionTitle}> {language === 'hi'
    ? '8) उद्यम मीडिया अपलोड'
    : '8) Enterprise Media Upload'}</Text>
    <LanguageToggle/>
    </View>
      <Text style={styles.helpText}>
         {language === 'hi'
    ? 'कृपया अपने उद्यम से संबंधित फोटो, वीडियो और दस्तावेज अपलोड करें। इससे सत्यापन और सहयोग में सुविधा होगी।'
    : 'Please upload photos, videos and documents related to your enterprise. This helps in better verification and support.'}
      </Text>

      {renderUploadBlock(
        'Upload Enterprise Photos',
  'उद्यम की फोटो अपलोड करें',
  'enterprise_photos_files',
  'photo',
  'Please upload clear photos of your enterprise such as: workplace, machinery, products, workers, raw materials etc.',
  'कृपया अपने उद्यम की स्पष्ट फोटो अपलोड करें जैसे: कार्यस्थल, मशीनरी, उत्पाद, कर्मचारी, कच्चा माल आदि।'
      )}

      {renderUploadBlock(
        'Upload Entrepreneur Photo',
  'उद्यमी की फोटो अपलोड करें',
  'photo_entreprenuer_files',
  'photo',
  'Please upload clear photo of applicant/entrepreneur.',
  'कृपया आवेदक / उद्यमी की स्पष्ट फोटो अपलोड करें।'
      )}

      {renderUploadBlock(
        'Upload Enterprise Documents',
  'उद्यम के दस्तावेज अपलोड करें',
  'enterprise_documents_files',
  'mixed',
  'You may upload any relevant documents (registration certificate, invoices, bills, ID proofs, training certificates etc.)',
  'आप संबंधित दस्तावेज अपलोड कर सकते हैं (पंजीकरण प्रमाणपत्र, बिल, चालान, पहचान पत्र, प्रशिक्षण प्रमाणपत्र आदि)।'
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#222',
  },
  fieldBlock: {
    marginBottom: 14,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  mediaBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  mediaBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  mediaInfo: {
    marginTop: 4,
    fontSize: 12,
    color: '#555',
  },
});



// // src/screens/screensProductionApp/FormSections/ExistingEnterpriseMediaSection.jsx
// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
// } from 'react-native';
// import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

// export default function ExistingEnterpriseMediaSection({
//   existingForm,
//   setExistingForm,
// }) {
  
//   // Helper to update the nested media object correctly
//   const updateMediaField = (fieldName, newAssets) => {
//     const currentMedia = existingForm.media || {};
//     const existingAssets = currentMedia[fieldName] || [];
    
//     setExistingForm({
//       media: {
//         ...currentMedia,
//         [fieldName]: [...existingAssets, ...newAssets],
//       },
//     });
//   };

//   const pickFiles = async (fieldName, allowedTypes) => {
//     try {
//       const res = await launchImageLibrary({
//         mediaType: allowedTypes,
//         selectionLimit: 10,
//       });

//       if (res.didCancel || !res.assets) return;
//       updateMediaField(fieldName, res.assets);
//     } catch (err) {
//       console.warn('File pick failed:', err);
//     }
//   };

//   const captureFromCamera = async (fieldName, allowedTypes) => {
//     try {
//       const res = await launchCamera({
//         mediaType: allowedTypes,
//       });

//       if (res.didCancel || !res.assets) return;
//       updateMediaField(fieldName, res.assets);
//     } catch (err) {
//       console.warn('Camera capture failed:', err);
//     }
//   };

//   const renderUploadBlock = (label, fieldName, type, helpText) => {
//     // Look for data inside existingForm.media[fieldName]
//     const selectedCount = existingForm.media?.[fieldName]?.length || 0;

//     return (
//       <View style={styles.fieldBlock}>
//         <Text style={styles.label}>{label}</Text>
//         <Text style={styles.helpText}>{helpText}</Text>

//         <View style={{ flexDirection: 'row', gap: 10 }}>
//           <TouchableOpacity
//             style={styles.mediaBtn}
//             onPress={() => pickFiles(fieldName, type)}
//           >
//             <Text style={styles.mediaBtnText}>Upload</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.mediaBtn}
//             onPress={() => captureFromCamera(fieldName, type)}
//           >
//             <Text style={styles.mediaBtnText}>Camera</Text>
//           </TouchableOpacity>
//         </View>

//         {selectedCount > 0 && (
//           <Text style={styles.mediaInfo}>
//             Selected: {selectedCount} file(s)
//           </Text>
//         )}
//       </View>
//     );
//   };

//   return (
//     <View style={styles.sectionContainer}>
//       <Text style={styles.sectionTitle}>8) Enterprise Media Upload</Text>
//       <Text style={styles.helpText}>
//         Please upload photos and documents. This helps in verification.
//       </Text>

//       {/* Field names now match exactly what saveStandaloneMedia expects */}
      
//       {renderUploadBlock(
//         '1) Upload Enterprise Photos',
//         'photo_enterprise', // Matches main form logic
//         'photo',
//         'Upload clear photos of workplace, machinery, products, etc.'
//       )}

//       {renderUploadBlock(
//         '2) Upload Entrepreneur Photo',
//         'photo_entrepreneur', // Corrected spelling to match main form
//         'photo',
//         'Upload clear photo of the applicant/entrepreneur.'
//       )}

//       {renderUploadBlock(
//         '3) Upload Enterprise Documents',
//         'others', // 'others' is the standard field for misc docs in your API
//         'mixed',
//         'Upload registration certificates, invoices, bills, or ID proofs.'
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   sectionContainer: { marginBottom: 26 },
//   sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10, color: '#222' },
//   fieldBlock: { marginBottom: 14 },
//   label: { fontWeight: 'bold', marginBottom: 4, color: '#333' },
//   helpText: { fontSize: 12, color: '#666', marginBottom: 6 },
//   mediaBtn: {
//     marginTop: 8,
//     borderWidth: 1,
//     borderColor: '#666',
//     borderRadius: 6,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     alignSelf: 'flex-start',
//   },
//   mediaBtnText: { fontSize: 14, fontWeight: '700', color: '#333' },
//   mediaInfo: { marginTop: 4, fontSize: 12, color: '#EE6969', fontWeight: '600' },
// });