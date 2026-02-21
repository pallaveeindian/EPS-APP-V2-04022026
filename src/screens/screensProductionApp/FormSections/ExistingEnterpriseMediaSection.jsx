// src/screens/screensProductionApp/FormSections/ExistingEnterpriseMediaSection.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import LanguageToggle from '../../../components/LanguageToggle';
import { LanguageContext } from '../../../components/LanguageContext';
import { useContext } from 'react';

export default function ExistingEnterpriseMediaSection({
  existingForm,
  setExistingForm,
}) {
  const { language } = useContext(LanguageContext);

  const updateMedia = (fieldName, assets) => {
    const currentMedia = existingForm.media || {};
    const existingAssets = currentMedia[fieldName] || [];

    setExistingForm({
      media: {
        ...currentMedia,
        [fieldName]: [...existingAssets, ...assets],
      },
    });
  };

  const pickFiles = async (fieldName, allowedTypes) => {
    try {
      const res = await launchImageLibrary({
        mediaType: allowedTypes,
        selectionLimit: 10,
      });
      if (res.didCancel || !res.assets) return;
      updateMedia(fieldName, res.assets);
    } catch (err) {
      console.warn('File pick failed:', err);
    }
  };

  const captureFromCamera = async (fieldName, allowedTypes) => {
    try {
      const res = await launchCamera({
        mediaType: allowedTypes,
      });
      if (res.didCancel || !res.assets) return;
      updateMedia(fieldName, res.assets);
    } catch (err) {
      console.warn('Camera capture failed:', err);
    }
  };

  const renderUploadBlock = (
    labelEn,
    labelHi,
    fieldName,
    type,
    helpEn,
    helpHi,
  ) => (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{language === 'hi' ? labelHi : labelEn}</Text>
      <Text style={styles.helpText}>{language === 'hi' ? helpHi : helpEn}</Text>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          style={styles.mediaBtn}
          onPress={() => pickFiles(fieldName, type)}
        >
          <Text style={styles.mediaBtnText}>
            {' '}
            {language === 'hi' ? 'अपलोड करें' : 'Upload'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mediaBtn}
          onPress={() => captureFromCamera(fieldName, type)}
        >
          <Text style={styles.mediaBtnText}>
            {language === 'hi' ? 'कैमरा' : 'Camera'}
          </Text>
        </TouchableOpacity>
      </View>

      {/*  Correctly check the nested media object for selection count */}
      {Array.isArray(existingForm.media?.[fieldName]) &&
        existingForm.media[fieldName].length > 0 && (
          <View style={styles.selectionRow}>
            <Text style={styles.mediaInfo}>
              {language === 'hi'
                ? `चयनित: ${existingForm.media[fieldName].length}`
                : `Selected: ${existingForm.media[fieldName].length}`}
            </Text>
            <TouchableOpacity
              onPress={() =>
                setExistingForm({
                  media: { ...existingForm.media, [fieldName]: [] },
                })
              }
            >
              <Text style={styles.clearText}>
                {language === 'hi' ? 'साफ़ करें' : 'Clear'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
    </View>
  );

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>
          {language === 'hi'
            ? '8) उद्यम मीडिया अपलोड'
            : '8) Enterprise Media Upload'}
        </Text>
        <LanguageToggle />
      </View>

      <Text style={styles.helpText}>
        {language === 'hi'
          ? 'कृपया अपने उद्यम से संबंधित फोटो और दस्तावेज अपलोड करें।'
          : 'Please upload photos and documents related to your enterprise.'}
      </Text>

      {/*  Mapped to backend: photo_enterprise */}
      {renderUploadBlock(
        'Upload Enterprise Photos',
        'उद्यम की फोटो अपलोड करें',
        'photo_enterprise',
        'photo',
        'Please upload clear photos of your workplace, machinery, products, etc.',
        'कृपया अपने उद्यम की स्पष्ट फोटो अपलोड करें जैसे: कार्यस्थल, मशीनरी, उत्पाद आदि।',
      )}

      {/*  Mapped to backend: photo_entrepreneur */}
      {renderUploadBlock(
        'Upload Entrepreneur Photo',
        'उद्यमी की फोटो अपलोड करें',
        'photo_entrepreneur',
        'photo',
        'Please upload clear photo of applicant/entrepreneur.',
        'कृपया आवेदक / उद्यमी की स्पष्ट फोटो अपलोड करें।',
      )}

      {/*  Mapped to backend: others */}
      {renderUploadBlock(
        'Upload Enterprise Documents',
        'उद्यम के दस्तावेज अपलोड करें',
        'others',
        'mixed',
        'Relevant documents (registration, bills, ID proofs, etc.)',
        'संबंधित दस्तावेज अपलोड करें (पंजीकरण प्रमाणपत्र, बिल, पहचान पत्र आदि)।',
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: { marginBottom: 26 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#222' },
  fieldBlock: { marginBottom: 20 },
  label: { fontWeight: 'bold', marginBottom: 4, color: '#333' },
  helpText: { fontSize: 12, color: '#666', marginBottom: 6 },
  mediaBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mediaBtnText: { fontSize: 14, fontWeight: '700', color: '#333' },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  mediaInfo: { fontSize: 12, color: '#2b7', fontWeight: '600' },
  clearText: { fontSize: 12, color: '#a33', textDecorationLine: 'underline' },
});
