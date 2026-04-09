// src/screens/screensProductionApp/FormSections/BasicInformationSectionLicenseSelector
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
// import { createEnterpriseLicense } from '../../../api/yourApiFile';
import { pick } from '@react-native-documents/picker';

const licenseOptions = [
  {
    category: {
      en: 'Food, Health & Product Safety',
      hi: 'खाद्य, स्वास्थ्य और उत्पाद सुरक्षा',
    },
    options: [
      {
        label: {
          en: 'FSSAI License / Registration',
          hi: 'एफएसएसएआई लाइसेंस / पंजीकरण',
        },
        value: 'fssai',
      },
      {
        label: {
          en: 'FSSAI Basic Registration',
          hi: 'एफएसएसएआई बेसिक पंजीकरण',
        },
        value: 'fssai_basic',
      },
      {
        label: { en: 'FSSAI State License', hi: 'एफएसएसएआई राज्य लाइसेंस' },
        value: 'fssai_state',
      },
      {
        label: {
          en: 'FSSAI Central License',
          hi: 'एफएसएसएआई केंद्रीय लाइसेंस',
        },
        value: 'fssai_central',
      },
      {
        label: {
          en: 'AYUSH Manufacturing License',
          hi: 'आयुष निर्माण लाइसेंस',
        },
        value: 'ayush_manufacturing',
      },
      {
        label: { en: 'AYUSH License', hi: 'आयुष लाइसेंस' },
        value: 'ayush_license',
      },
      {
        label: { en: 'AYUSH Certificate', hi: 'आयुष प्रमाणपत्र' },
        value: 'ayush_certificate',
      },
      {
        label: {
          en: 'Other (Please specify)',
          hi: 'अन्य (कृपया निर्दिष्ट करें)',
        },
        value: 'other',
      },
    ],
  },
  {
    category: {
      en: 'Business, Trade & Tax Registrations',
      hi: 'व्यापार, व्यापार और कर पंजीकरण',
    },
    options: [
      { label: { en: 'GST Registration', hi: 'जीएसटी पंजीकरण' }, value: 'gst' },
      {
        label: {
          en: 'MSME (Udyam) Registration',
          hi: 'एमएसएमई (उद्यम) पंजीकरण',
        },
        value: 'msme',
      },
      {
        label: {
          en: 'Shop & Establishment Registration',
          hi: 'दुकान और प्रतिष्ठान पंजीकरण',
        },
        value: 'shop_establishment',
      },
      {
        label: {
          en: 'KVIC / Khadi & Village Industries Registration',
          hi: 'केवीआईसी / खादी और ग्रामीण उद्योग पंजीकरण',
        },
        value: 'kvic',
      },
      {
        label: { en: 'Handloom Registration', hi: 'हैंडलूम पंजीकरण' },
        value: 'handloom',
      },
      {
        label: {
          en: 'Cooperative Society Registration',
          hi: 'सहकारी समाज पंजीकरण',
        },
        value: 'cooperative_registration',
      },
      {
        label: {
          en: 'Other (Please specify)',
          hi: 'अन्य (कृपया निर्दिष्ट करें)',
        },
        value: 'other',
      },
    ],
  },
  {
    category: {
      en: 'Environment, Pollution & Waste Management',
      hi: 'पर्यावरण, प्रदूषण और अपशिष्ट प्रबंधन',
    },
    options: [
      {
        label: {
          en: 'Pollution Control Board Consent / Clearance',
          hi: 'प्रदूषण नियंत्रण बोर्ड सहमति / मंजूरी',
        },
        value: 'pcb_clearance',
      },
      {
        label: {
          en: 'Plastic Recycling Authorization',
          hi: 'प्लास्टिक रीसायक्लिंग प्राधिकरण',
        },
        value: 'plastic_recycling',
      },
      {
        label: {
          en: 'E-Waste Recycling Authorization',
          hi: 'ई-वेस्ट रीसायक्लिंग प्राधिकरण',
        },
        value: 'ewaste_recycling',
      },
      {
        label: { en: 'Biogas Plant Approval', hi: 'बायोगैस प्लांट अनुमोदन' },
        value: 'biogas_approval',
      },
      {
        label: {
          en: 'Other (Please specify)',
          hi: 'अन्य (कृपया निर्दिष्ट करें)',
        },
        value: 'other',
      },
    ],
  },
  {
    category: {
      en: 'Agriculture, Animal Husbandry & Fisheries',
      hi: 'कृषि, पशुपालन और मत्स्य पालन',
    },
    options: [
      {
        label: {
          en: 'Fisheries Department Registration',
          hi: 'मत्स्य विभाग पंजीकरण',
        },
        value: 'fisheries_registration',
      },
      {
        label: {
          en: 'Local Animal Husbandry License',
          hi: 'स्थानीय पशुपालन लाइसेंस',
        },
        value: 'animal_husbandry_license',
      },
      {
        label: {
          en: 'Dairy License (Local Authority)',
          hi: 'डेयरी लाइसेंस (स्थानीय प्राधिकरण)',
        },
        value: 'dairy_license',
      },
      {
        label: {
          en: 'Agriculture Produce Packaging Approval',
          hi: 'कृषि उत्पाद पैकेजिंग अनुमोदन',
        },
        value: 'agri_packaging',
      },
      {
        label: {
          en: 'Other (Please specify)',
          hi: 'अन्य (कृपया निर्दिष्ट करें)',
        },
        value: 'other',
      },
    ],
  },
  {
    category: {
      en: 'Tourism, Hospitality & Local Bodies',
      hi: 'पर्यटन, आतिथ्य और स्थानीय निकाय',
    },
    options: [
      {
        label: {
          en: 'Tourism Department Registration',
          hi: 'पर्यटन विभाग पंजीकरण',
        },
        value: 'tourism_registration',
      },
      {
        label: { en: 'Homestay Registration', hi: 'होमस्टे पंजीकरण' },
        value: 'homestay_registration',
      },
      {
        label: {
          en: 'Local Municipal / Nagar Palika License',
          hi: 'स्थानीय नगर पालिका लाइसेंस',
        },
        value: 'municipal_license',
      },
      {
        label: {
          en: 'Other (Please specify)',
          hi: 'अन्य (कृपया निर्दिष्ट करें)',
        },
        value: 'other',
      },
    ],
  },
  {
    category: { en: 'Transport & Mobility', hi: 'परिवहन और गतिशीलता' },
    options: [
      {
        label: { en: 'RTO Registration', hi: 'आरटीओ पंजीकरण' },
        value: 'rto_registration',
      },
      {
        label: { en: 'RTO Permit / Approval', hi: 'आरटीओ अनुमति / मंजूरी' },
        value: 'rto_permit',
      },
      {
        label: {
          en: 'Other (Please specify)',
          hi: 'अन्य (कृपया निर्दिष्ट करें)',
        },
        value: 'other',
      },
    ],
  },
  {
    category: {
      en: 'Energy, Power & Utilities',
      hi: 'ऊर्जा, शक्ति और उपयोगिताएँ',
    },
    options: [
      {
        label: { en: 'Electricity Board Approval', hi: 'बिजली बोर्ड अनुमोदन' },
        value: 'electricity_board_approval',
      },
      {
        label: {
          en: 'Solar Installation Authorization',
          hi: 'सौर स्थापना प्राधिकरण',
        },
        value: 'solar_authorization',
      },
      {
        label: {
          en: 'Other (Please specify)',
          hi: 'अन्य (कृपया निर्दिष्ट करें)',
        },
        value: 'other',
      },
    ],
  },
  {
    category: { en: 'IT, Media & Communication', hi: 'आईटी, मीडिया और संचार' },
    options: [
      {
        label: { en: 'Cyber Café License', hi: 'साइबर कैफे लाइसेंस' },
        value: 'cyber_cafe_license',
      },
      {
        label: {
          en: 'Other (Please specify)',
          hi: 'अन्य (कृपया निर्दिष्ट करें)',
        },
        value: 'other',
      },
    ],
  },
  {
    category: { en: 'Storage & Infrastructure', hi: 'स्टोरेज और अवसंरचना' },
    options: [
      {
        label: { en: 'Cold Storage License', hi: 'कोल्ड स्टोरेज लाइसेंस' },
        value: 'cold_storage_license',
      },
      {
        label: {
          en: 'Other (Please specify)',
          hi: 'अन्य (कृपया निर्दिष्ट करें)',
        },
        value: 'other',
      },
    ],
  },
  {
    category: {
      en: 'Local / Miscellaneous Permissions',
      hi: 'स्थानीय / विविध अनुमतियाँ',
    },
    options: [
      {
        label: {
          en: 'Local Authority Permission',
          hi: 'स्थानीय प्राधिकरण अनुमति',
        },
        value: 'local_authority_permission',
      },
      {
        label: {
          en: 'Other (Please specify)',
          hi: 'अन्य (कृपया निर्दिष्ट करें)',
        },
        value: 'other',
      },
    ],
  },
];

const LicenseSelector = ({ language = 'en', licenses = [], setLicenses }) => {
  const translations = {
    en: {
      question: 'What licenses do you have?',
      upload: 'Upload PDF',
      changeUpload: 'Change PDF',
      enterOther: 'Enter other license',
      addLicense: '+ Add Another License',
      delete: 'Delete',
      regPlaceholder: 'Enter Registration Number',
    },
    hi: {
      question: 'आपके पास कौन से लाइसेंस हैं?',
      upload: 'पीडीएफ अपलोड करें',
      changeUpload: 'पीडीएफ बदलें',
      enterOther: 'अन्य लाइसेंस दर्ज करें',
      addLicense: '+ एक और लाइसेंस जोड़ें',
      delete: 'हटाएँ',
      regPlaceholder: 'पंजीकरण संख्या दर्ज करें',
    },
  };

  const [cards, setCards] = useState([
    {
      id: 'initial-card',
      selected: {},
      files: {},
      openSections: {},
      otherText: {},
      registrationNumbers: {},
    },
  ]);
  // SYNC LOGIC + CONSOLE LOGGING OF FINAL PAYLOAD
  useEffect(() => {
    const flattenedLicenses = [];

    cards.forEach(card => {
      Object.keys(card.selected).forEach(categoryEn => {
        const selectedValues = card.selected[categoryEn] || [];

        selectedValues.forEach(val => {
          const categoryObj = licenseOptions.find(
            l => l.category.en === categoryEn,
          );
          const optionObj = categoryObj?.options.find(o => o.value === val);

          let licenseName = optionObj?.label.en || val;
          if (val === 'other') {
            licenseName = card.otherText[categoryEn] || 'Other';
          }

          flattenedLicenses.push({
            license_category: categoryEn,
            license_name: licenseName,
            license_no: card.registrationNumbers[val] || '',
            file: card.files[val] || null,
          });
        });
      });
    });

    // --- CONSOLE LOG TO SEE DATA PREPARED FOR BACKEND ---
    if (flattenedLicenses.length > 0) {
      console.log('-----------------------------------------');
      console.log('LICENSE PAYLOAD SYNCED TO PARENT FORM:');
      console.table(flattenedLicenses);
      console.log('-----------------------------------------');
    }

    setLicenses(flattenedLicenses);
  }, [cards]);
  const updateRegistrationNumber = (cardId, licenseValue, text) => {
    setCards(prev =>
      prev.map(c =>
        c.id === cardId
          ? {
              ...c,
              registrationNumbers: {
                ...c.registrationNumbers,
                [licenseValue]: text,
              },
            }
          : c,
      ),
    );
  };

  const toggleSection = (cardId, category) => {
    setCards(prev =>
      prev.map(c =>
        c.id === cardId
          ? {
              ...c,
              openSections: {
                ...c.openSections,
                [category]: !c.openSections[category],
              },
            }
          : c,
      ),
    );
  };

  const toggleOption = (cardId, category, value) => {
    setCards(prev =>
      prev.map(c => {
        if (c.id !== cardId) return c;
        const current = c.selected[category] || [];
        const updated = current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value];

        return {
          ...c,
          selected: { ...c.selected, [category]: updated },
        };
      }),
    );
  };

  // const pickPDF = async (cardId, licenseValue) => {
  //   try {
  //     const res = await pick({ type: 'application/pdf', allowMultiple: false });
  //     if (!res?.length) return;

  //     setCards(prev =>
  //       prev.map(c =>
  //         c.id === cardId
  //           ? { ...c, files: { ...c.files, [licenseValue]: res[0] } }
  //           : c,
  //       ),
  //     );
  //   } catch (e) {
  //     console.log('Picker Error: ', e);
  //   }
  // };

  const pickPDF = async (cardId, licenseValue) => {
    try {
      const res = await pick({ type: 'application/pdf', allowMultiple: false });
      if (!res?.length) return;

      let file = res[0];

      // 🔥 FIX: sanitize filename
      let cleanName = file.name || 'document.pdf';

      // remove multiple extensions
      cleanName = cleanName.replace(/(\.pdf)+$/i, '.pdf');

      const cleanedFile = {
        uri: file.uri,
        type: 'application/pdf',
        name: cleanName,
      };

      setCards(prev =>
        prev.map(c =>
          c.id === cardId
            ? {
                ...c,
                files: {
                  ...c.files,
                  [licenseValue]: cleanedFile,
                },
              }
            : c,
        ),
      );
    } catch (e) {
      console.log('Picker Error: ', e);
    }
  };

  const updateOtherText = (cardId, category, text) => {
    setCards(prev =>
      prev.map(c =>
        c.id === cardId
          ? {
              ...c,
              otherText: { ...c.otherText, [category]: text },
            }
          : c,
      ),
    );
  };

  const renderOption = (card, category, option) => {
    const isSelected = card.selected[category]?.includes(option.value);

    return (
      <View key={option.value} style={styles.optionRow}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => toggleOption(card.id, category, option.value)}
        >
          <View style={[styles.checkbox, isSelected && styles.checked]} />
          <Text>
            {/* {option.label} */}
            {option.label[language]}
          </Text>
        </TouchableOpacity>

        {isSelected && option.value === 'other' && (
          <TextInput
            // placeholder="Enter other license"
            placeholder={translations[language].enterOther}
            value={card.otherText[category] || ''}
            onChangeText={t => updateOtherText(card.id, category, t)}
            style={styles.otherInput}
          />
        )}

        {isSelected && (
          <>
            {/* Registration Number Field */}
            <TextInput
              placeholder={
                language === 'hi'
                  ? 'पंजीकरण संख्या दर्ज करें'
                  : 'Enter Registration Number'
              }
              value={card.registrationNumbers[option.value] || ''}
              onChangeText={t =>
                updateRegistrationNumber(card.id, option.value, t)
              }
              style={styles.otherInput}
            />

            {/* Upload Button */}
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={() => pickPDF(card.id, option.value)}
            >
              <Text style={styles.uploadText}>
                {card.files[option.value]
                  ? translations[language].changeUpload
                  : translations[language].upload}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.question}>{translations[language].question}</Text>

      <FlatList
        data={cards}
        keyExtractor={i => i.id.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              {/* <Text style={styles.title}>License {index + 1}</Text> */}
              {cards.length > 1 && (
                <TouchableOpacity onPress={() => deleteCard(item.id)}>
                  <Text style={styles.delete}>
                    {translations[language].delete}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {licenseOptions.map(s => (
              <View key={s.category.en}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => toggleSection(item.id, s.category.en)}
                >
                  <Text style={styles.sectionTitle}>
                    {s.category[language]}
                  </Text>
                  <Text>{item.openSections[s.category.en] ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {item.openSections[s.category.en] &&
                  s.options.map(o => renderOption(item, s.category.en, o))}
              </View>
            ))}
          </View>
        )}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

export default LicenseSelector;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { paddingBottom: 16 },
  question: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontWeight: '600' },
  delete: { color: '#D32F2F' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  // sectionTitle: {},
  optionRow: { marginLeft: 8, marginBottom: 6 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    marginRight: 8,
  },
  checked: { backgroundColor: '#EE6969' },
  uploadBtn: { marginLeft: 26, marginTop: 4 },
  uploadText: { color: '#EE6969' },
  otherInput: {
    marginLeft: 26,
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
  },
});
