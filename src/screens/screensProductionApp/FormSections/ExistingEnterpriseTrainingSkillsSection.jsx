// src/screens/screensProductionApp/FormSections/ExistingEnterpriseTrainingSkillsSection.jsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { launchCamera } from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import LanguageToggle from '../../../components/LanguageToggle';
import { LanguageContext } from '../../../components/LanguageContext';
import { useContext } from 'react';



const YES_NO = [
  { en: 'Yes', hi: 'हाँ' },
  { en: 'No', hi: 'नहीं' },
];

const TRAINING_DEPT_OPTIONS = ['NRLM', 'RSETI', 'NABARD', 'UPSDM', 'Others'];

// const TRAINING_TYPE_OPTIONS = [
//   'Residential',
//   'Non-Residential',
// ];

const TRAINING_TYPE_OPTIONS = [
  { en: 'Residential', hi: 'आवासीय' },
  { en: 'Non-Residential', hi: 'गैर-आवासीय' },
];

// const TRAINING_DURATION_OPTIONS = [
//   'Under 7 days',
//   '7 days',
//   '15 days',
//   '30 days',
//   'Over 30 days',
// ];

const TRAINING_DURATION_OPTIONS = [
  { value: 'Under 7 days', en: 'Under 7 days', hi: '7 दिनों से कम' },
  { value: '7 days', en: '7 days', hi: '7 दिन' },
  { value: '15 days', en: '15 days', hi: '15 दिन' },
  { value: '30 days', en: '30 days', hi: '30 दिन' },
  { value: 'Over 30 days', en: 'Over 30 days', hi: '30 दिनों से अधिक' },
];

const EXPECTED_INCOME_OPTIONS = [
  { value: 'Under 10,000', en: 'Under 10,000', hi: '10,000 से कम' },
  { value: '10,000 - 20,000', en: '10,000 - 20,000', hi: '10,000 - 20,000' },
  { value: '20,000 - 30,000', en: '20,000 - 30,000', hi: '20,000 - 30,000' },
  { value: 'Above 30,000', en: 'Above 30,000', hi: '30,000 से अधिक' },
];


/**
 * Sector tree for both training received and training required
 * Parent -> list of child modules
 */
const TRAINING_SECTOR_TREE = [
{
    parent: { en: 'Food Processing Sector', hi: 'खाद्य प्रसंस्करण क्षेत्र' },
    children: [
      { en: 'Spice manufacturing', hi: 'मसाला निर्माण' },
      { en: 'Pickles, preserves (murabba), papad', hi: 'अचार, मुरब्बा, पापड़' },
      { en: 'Savoury snacks, bhujiya, namkeen', hi: 'नमकीन, भुजिया' },
      { en: 'Instant mixes (idli mix, gram flour mix, kheer mix)', hi: 'इंस्टेंट मिश्रण (इडली, बेसन, खीर)' },
      { en: 'Bakery items (cookies, cake, bread)', hi: 'बेकरी उत्पाद (कुकी, केक, ब्रेड)' },
      { en: 'Millet-based products (jowar, bajra cookies, snacks)', hi: 'मिलेट आधारित उत्पाद (ज्वार, बाजरा)' },
      { en: 'Cold-pressed oils (mustard/sesame)', hi: 'कोल्ड-प्रेस्ड तेल (सरसों/तिल)' },
      { en: 'Honey processing', hi: 'शहद प्रसंस्करण' },
      { en: 'Jam–jelly–squash', hi: 'जैम–जेली–स्क्वैश' },
      { en: 'Ready-to-eat products', hi: 'तैयार खाने योग्य उत्पाद' },
      { en: 'Jaggery Production', hi: 'गुड़ उत्पादन' },
      {
        en: 'Whole grain/pulses/flour sorting–grading–packaging unit',
        hi: 'साबुत अनाज/दाल/आटा छँटाई–ग्रेडिंग–पैकेजिंग इकाई',
      },
      { en: 'Others', hi: 'अन्य' },
    ],
  },

  {
    parent: { en: 'Handicraft & Artisan Sector', hi: 'हस्तशिल्प एवं कारीगर क्षेत्र' },
    children: [
      { en: 'Zari and zardozi work', hi: 'जरी एवं ज़रदोज़ी कार्य' },
      { en: 'Chikankari embroidery', hi: 'चिकनकारी कढ़ाई' },
      { en: 'Woodwork', hi: 'लकड़ी का काम' },
      { en: 'Terracotta / clay products', hi: 'टेरेकोटा / मिट्टी के उत्पाद' },
      { en: 'Bamboo / cane craft', hi: 'बांस / बेंत शिल्प' },
      {
        en: 'Handmade jewellery (terracotta jewellery, oxidised jewellery)',
        hi: 'हस्तनिर्मित आभूषण (टेरेकोटा, ऑक्सीडाइज़्ड)',
      },
      { en: 'Handmade candles', hi: 'हस्तनिर्मित मोमबत्तियाँ' },
      { en: 'Crochet / woollen products', hi: 'क्रोशिया / ऊनी उत्पाद' },
      { en: 'Paper craft, greeting cards', hi: 'पेपर क्राफ्ट, ग्रीटिंग कार्ड' },
      { en: 'Handbags, jute bags, embroidered bags', hi: 'हैंडबैग, जूट बैग, कढ़ाई वाले बैग' },
      {
        en: 'Ration/vegetable/shopping bags (non-woven alternatives)',
        hi: 'राशन/सब्ज़ी/शॉपिंग बैग (नॉन-वोवन विकल्प)',
      },
      { en: 'Others', hi: 'अन्य' },
    ],
  },

  {
    parent: { en: 'Textile & Apparel Sector', hi: 'वस्त्र एवं परिधान क्षेत्र' },
    children: [
      {
        en: 'Boutique unit (stitching–cutting–embellishment)',
        hi: 'बुटीक इकाई (सिलाई–कटिंग–सजावट)',
      },
      { en: 'School uniform stitching unit', hi: 'स्कूल यूनिफॉर्म सिलाई इकाई' },
      { en: 'Ladies’ garments', hi: 'महिला परिधान' },
      { en: 'Bedsheet/quilt/pillow cover unit', hi: 'बेडशीट/रजाई/तकिया कवर इकाई' },
      {
        en: 'ODOP textile-based products (Varanasi saree, Bhadohi carpet finishing etc.)',
        hi: 'ODOP वस्त्र उत्पाद (वाराणसी साड़ी, भदोही कालीन आदि)',
      },
      {
        en: 'Home linen (curtains, table cloth, sofa covers)',
        hi: 'होम लिनन (पर्दे, मेज़पोश, सोफ़ा कवर)',
      },
      { en: 'Jute/cotton carry bags', hi: 'जूट/कॉटन कैरी बैग' },
      {
        en: 'Mask/apron/hospital gown manufacturing',
        hi: 'मास्क/एप्रन/हॉस्पिटल गाउन निर्माण',
      },
      { en: 'Others', hi: 'अन्य' },
    ],
  },

  {
    parent: { en: 'Agriculture & Allied Sector', hi: 'कृषि एवं संबद्ध क्षेत्र' },
    children: [
      { en: 'Vegetable cultivation and group supply', hi: 'सब्ज़ी उत्पादन एवं समूह आपूर्ति' },
      { en: 'Flower cultivation (marigold, rose)', hi: 'फूलों की खेती (गेंदा, गुलाब)' },
      { en: 'Mushroom production', hi: 'मशरूम उत्पादन' },
      {
        en: 'Nursery (fruit/flower/vegetable saplings)',
        hi: 'नर्सरी (फल/फूल/सब्ज़ी के पौधे)',
      },
      { en: 'Beekeeping (honey production)', hi: 'मधुमक्खी पालन (शहद उत्पादन)' },
      { en: 'Organic manure/vermi-compost', hi: 'जैविक खाद / वर्मी कम्पोस्ट' },
      { en: 'Animal feed unit', hi: 'पशु आहार इकाई' },
      { en: 'Mini mill (flour/pulse grinding)', hi: 'मिनी मिल (आटा/दाल पिसाई)' },
      {
        en: 'Fruit–vegetable dehydration unit',
        hi: 'फल–सब्ज़ी निर्जलीकरण इकाई',
      },
      { en: 'Fish farming', hi: 'मछली पालन' },
      { en: 'Others', hi: 'अन्य' },
    ],
  },

  {
    parent: { en: 'Dairy & Animal Husbandry Sector', hi: 'डेयरी एवं पशुपालन क्षेत्र' },
    children: [
      { en: 'Dairy unit (2–10 cows/buffaloes)', hi: 'डेयरी इकाई (2–10 गाय/भैंस)' },
      { en: 'Milk collection centre', hi: 'दूध संग्रह केंद्र' },
      {
        en: 'Paneer/khoya/curd/ghee manufacturing',
        hi: 'पनीर/खोया/दही/घी निर्माण',
      },
      { en: 'Goat rearing', hi: 'बकरी पालन' },
      { en: 'Poultry unit (egg/broiler)', hi: 'मुर्गी पालन (अंडा/ब्रॉयलर)' },
      { en: 'Pig rearing (in specific areas)', hi: 'सूअर पालन (विशिष्ट क्षेत्रों में)' },
      { en: 'Fodder production', hi: 'चारा उत्पादन' },
      {
        en: 'Milk packaging and branding unit',
        hi: 'दूध पैकेजिंग एवं ब्रांडिंग इकाई',
      },
      { en: 'Others', hi: 'अन्य' },
    ],
  },

  {
    parent: { en: 'Beauty, Wellness & Personal Services', hi: 'सौंदर्य, वेलनेस एवं व्यक्तिगत सेवाएँ' },
    children: [
      { en: 'Beauty parlour', hi: 'ब्यूटी पार्लर' },
      {
        en: 'Mehndi (henna) training and services',
        hi: 'मेहंदी प्रशिक्षण एवं सेवाएँ',
      },
      { en: 'Spa / therapy unit', hi: 'स्पा / थेरेपी इकाई' },
      {
        en: 'Home-care services (home nursing, baby care training)',
        hi: 'होम-केयर सेवाएँ (होम नर्सिंग, बेबी केयर)',
      },
      {
        en: 'Mobile salon / village-based services',
        hi: 'मोबाइल सैलून / ग्राम स्तरीय सेवाएँ',
      },
      { en: 'Fitness group / yoga classes', hi: 'फिटनेस समूह / योग कक्षाएँ' },
      { en: 'Others', hi: 'अन्य' },
    ],
  },

  {
    parent: { en: 'Retail & Micro Trading Sector', hi: 'खुदरा एवं सूक्ष्म व्यापार क्षेत्र' },
    children: [
      { en: 'Grocery/provision store', hi: 'किराना / परचून दुकान' },
      { en: 'Stationery / general store', hi: 'स्टेशनरी / जनरल स्टोर' },
      { en: 'Group sale of vegetables/fruits', hi: 'फल–सब्ज़ी समूह बिक्री' },
      { en: 'Fast food cart', hi: 'फास्ट फूड ठेला' },
      {
        en: 'Mobile recharge shop / bill payment kiosk',
        hi: 'मोबाइल रिचार्ज / बिल भुगतान केंद्र',
      },
      { en: 'Jan Aushadhi/Medical Store', hi: 'जन औषधि / मेडिकल स्टोर' },
      {
        en: 'PET shop and disposable alternatives distribution',
        hi: 'PET एवं डिस्पोज़ेबल विकल्पों का वितरण',
      },
      { en: 'Others', hi: 'अन्य' },
    ],
  },

  {
    parent: { en: 'Cleaning & Hygiene Products Sector', hi: 'सफाई एवं स्वच्छता उत्पाद क्षेत्र' },
    children: [
      { en: 'Phenyl/detergent manufacturing', hi: 'फिनाइल / डिटर्जेंट निर्माण' },
      { en: 'Liquid handwash', hi: 'लिक्विड हैंडवॉश' },
      { en: 'Sanitizer', hi: 'सैनिटाइज़र' },
      { en: 'Incense sticks and dhoop sticks', hi: 'अगरबत्ती एवं धूपबत्ती' },
      { en: 'Napkin / sanitary pad unit', hi: 'नैपकिन / सेनेटरी पैड इकाई' },
      {
        en: 'Biodegradable plate and bowl manufacturing',
        hi: 'बायोडिग्रेडेबल प्लेट एवं कटोरा निर्माण',
      },
      { en: 'Others', hi: 'अन्य' },
    ],
  },

  {
    parent: { en: 'FMCG', hi: 'तेज़ी से बिकने वाले उपभोक्ता उत्पाद (FMCG)' },
    children: [
      { en: 'Handwash', hi: 'हैंडवॉश' },
      { en: 'Soap', hi: 'साबुन' },
      { en: 'Floor Cleaner', hi: 'फ़्लोर क्लीनर' },
      { en: 'Detergents', hi: 'डिटर्जेंट' },
      { en: 'Air fresheners', hi: 'एयर फ्रेशनर' },
      { en: 'Face wash & creams', hi: 'फेस वॉश एवं क्रीम' },
      { en: 'Shampoo & conditioner', hi: 'शैम्पू एवं कंडीशनर' },
      { en: 'Sponges', hi: 'स्पंज' },
      { en: 'Toothpaste & toothbrushes', hi: 'टूथपेस्ट एवं टूथब्रश' },
      { en: 'Broom', hi: 'झाड़ू' },
      { en: 'Others', hi: 'अन्य' },
    ],
  },

  {
    parent: { en: 'Transport', hi: 'परिवहन' },
    children: [
      { en: 'Loader', hi: 'लोडर' },
      { en: 'E-Rikshaw', hi: 'ई-रिक्शा' },
      { en: 'Taxi', hi: 'टैक्सी' },
      { en: 'Auto', hi: 'ऑटो' },
      { en: 'Others', hi: 'अन्य' },
    ],
  },

  {
    parent: { en: 'Packaging & Utility Products Sector', hi: 'पैकेजिंग एवं उपयोगिता उत्पाद क्षेत्र' },
    children: [
      { en: 'Paper bag unit', hi: 'पेपर बैग इकाई' },
      { en: 'Jute bag unit', hi: 'जूट बैग इकाई' },
      { en: 'Box manufacturing', hi: 'डिब्बा निर्माण' },
      { en: 'Recycled paper packaging unit', hi: 'रीसायकल पेपर पैकेजिंग इकाई' },
      { en: 'Food-grade packaging', hi: 'फूड-ग्रेड पैकेजिंग' },
      { en: 'Others', hi: 'अन्य' },
    ],
  },

  {
    parent: { en: 'Prerna Canteen', hi: 'प्रेरणा कैंटीन' },
    children: [],
  },

  {
    parent: { en: 'Digital & Service Sector', hi: 'डिजिटल एवं सेवा क्षेत्र' },
    children: [
      { en: 'Data entry / digital services', hi: 'डेटा एंट्री / डिजिटल सेवाएँ' },
      { en: 'CSC (Common Service Center) operations', hi: 'CSC (कॉमन सर्विस सेंटर) संचालन' },
      { en: 'Online product sales (e-commerce)', hi: 'ऑनलाइन उत्पाद बिक्री (ई-कॉमर्स)' },
      { en: 'SHG product branding', hi: 'SHG उत्पाद ब्रांडिंग' },
      {
        en: 'Social media management for local shops',
        hi: 'स्थानीय दुकानों हेतु सोशल मीडिया प्रबंधन',
      },
      { en: 'Others', hi: 'अन्य' },
    ],
  },

  {
    parent: { en: 'Solid Waste & Green Sector', hi: 'ठोस अपशिष्ट एवं हरित क्षेत्र' },
    children: [
      { en: 'Plastic waste sorting', hi: 'प्लास्टिक कचरा छँटाई' },
      { en: 'Fuel/briquettes from waste', hi: 'कचरे से ईंधन / ब्रिकेट' },
      { en: 'Composting unit', hi: 'कम्पोस्टिंग इकाई' },
      { en: 'Recycled paper products', hi: 'रीसायकल पेपर उत्पाद' },
      { en: 'E-waste collection micro centre', hi: 'ई-कचरा संग्रह माइक्रो केंद्र' },
      { en: 'Others', hi: 'अन्य' },
    ],
  },

  {
    parent: {
      en: 'Construction & Fabrication Micro Enterprises',
      hi: 'निर्माण एवं फैब्रिकेशन सूक्ष्म उद्यम',
    },
    children: [
      {
        en: 'Brick and tiles cleaning/polishing unit',
        hi: 'ईंट एवं टाइल सफाई / पॉलिशिंग इकाई',
      },
      {
        en: 'Interior decoration (fabric, flowers, décor)',
        hi: 'इंटीरियर सजावट (कपड़ा, फूल, डेकोर)',
      },
      {
        en: 'Painting/plumbing/carpentry group',
        hi: 'पेंटिंग / प्लंबिंग / बढ़ईगीरी समूह',
      },
      { en: 'POP artwork / wall decoration', hi: 'POP आर्टवर्क / दीवार सजावट' },
      { en: 'Others', hi: 'अन्य' },
    ],
  },

  {
    parent: {
      en: 'EDP | Entrepreneurship Development Programme',
      hi: 'EDP | उद्यमिता विकास कार्यक्रम',
    },
    children: [],
  },

  {
    parent: { en: 'Other', hi: 'अन्य' },
    children: [{ en: 'Others', hi: 'अन्य' }],
  },
];

const YesNoToggle = ({ value, onChange, language = 'en' }) => (
  <View style={styles.yesNoRow}>
    {YES_NO.map((opt) => {
      const displayText = language === 'hi' ? opt.hi : opt.en;

      return (
        <TouchableOpacity
          key={opt.en}
          style={[
            styles.yesNoBtn,
            value === opt.en && styles.yesNoBtnActive,
          ]}
          onPress={() => onChange(opt.en)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.yesNoText,
              value === opt.en && styles.yesNoTextActive,
            ]}
          >
            {displayText}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);


const ChipRow = ({ value, options, onChange }) => (
  <View style={styles.chipRow}>
    {options.map((opt) => {
      const optionValue =
        typeof opt === 'string' ? opt : opt.value;

      const optionLabel =
        typeof opt === 'string' ? opt : opt.label || opt.en;

      const active = value === optionValue;

      return (
        <TouchableOpacity
          key={optionValue}
          style={[styles.chip, active && styles.chipActive]}
          onPress={() => onChange(optionValue)}
        >
          <Text
            style={[
              styles.chipText,
              active && styles.chipTextActive,
            ]}
          >
            {optionLabel}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const TrainingSectorTree = ({ value, onChange, language }) => {
  const selectedTree = Array.isArray(value) ? value : [];

  const isParentSelected = (parentEn) =>
    !!selectedTree.find((row) => row.parent === parentEn);

  const isChildSelected = (parentEn, childEn) => {
    const row = selectedTree.find((r) => r.parent === parentEn);
    return !!row && row.children?.includes(childEn);
  };

  const toggleParent = (parentEn) => {
    const exists = selectedTree.find((row) => row.parent === parentEn);
    let updated;

    if (exists) {
      updated = selectedTree.filter((row) => row.parent !== parentEn);
    } else {
      updated = [...selectedTree, { parent: parentEn, children: [] }];
    }

    onChange(updated);
  };

  const toggleChild = (parentEn, childEn) => {
    const existing = selectedTree.find((row) => row.parent === parentEn);
    let updated = [...selectedTree];

    if (!existing) {
      updated.push({ parent: parentEn, children: [childEn] });
    } else {
      const children = existing.children || [];
      const has = children.includes(childEn);

      const newChildren = has
        ? children.filter((c) => c !== childEn)
        : [...children, childEn];

      updated = updated.map((row) =>
        row.parent === parentEn
          ? { ...row, children: newChildren }
          : row
      );
    }

    onChange(updated);
  };

  return (
    <View style={{ marginTop: 8 }}>
      {TRAINING_SECTOR_TREE.map((group) => {
        const parentEn = group.parent.en;
        const parentLabel =
          language === 'hi' ? group.parent.hi : group.parent.en;

        const parentSelected = isParentSelected(parentEn);

        return (
          <View key={parentEn} style={styles.treeGroup}>
            <TouchableOpacity
              onPress={() => toggleParent(parentEn)}
              style={styles.treeParentRow}
            >
              <Text style={styles.treeParentText}>{parentLabel}</Text>
              <Text>{parentSelected ? '☑' : '☐'}</Text>
            </TouchableOpacity>

            {parentSelected && (
              <View style={styles.treeChildrenBlock}>
                {group.children.map((child) => {
                  const childEn = child.en;
                  const childLabel =
                    language === 'hi' ? child.hi : child.en;

                  return (
                    <TouchableOpacity
                      key={childEn}
                      style={styles.treeChildRow}
                      onPress={() =>
                        toggleChild(parentEn, childEn)
                      }
                    >
                      <Text style={styles.treeChildCheckbox}>
                        {isChildSelected(parentEn, childEn)
                          ? '☑'
                          : '☐'}
                      </Text>
                      <Text style={styles.treeChildLabel}>
                        {childLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};
const computeTitleFromTree = (tree, fallback, language) => {
  if (!Array.isArray(tree) || tree.length === 0) return fallback;

  const parentEn = tree[0]?.parent;

  const matched = TRAINING_SECTOR_TREE.find(
    (g) => g.parent.en === parentEn
  );

  if (!matched) return fallback;

  return language === 'hi'
    ? matched.parent.hi
    : matched.parent.en;
};


export default function ExistingEnterpriseTrainingSkillsSection({
  existingForm,
  setExistingForm,
}) {
  const update = (patch) => setExistingForm(patch);
  const { language } = useContext(LanguageContext);
// const [trainingLocationType, setTrainingLocationType] = useState("");
  const trainingReceived = Array.isArray(existingForm.training_received_rows)
    ? existingForm.training_received_rows
    : [];
  const trainingRequired = Array.isArray(existingForm.training_required_rows)
    ? existingForm.training_required_rows
    : [];
const [trainingType, setTrainingType] = useState([]);

  const isTrainingReceivedYes = existingForm.is_training_received === 'Yes';
  const isTrainingRequiredYes = existingForm.is_training_required === 'Yes';
  const isTrainingRequiredNo = existingForm.is_training_required === 'No';

  const updateTrainingReceived = (next) =>
    update({ training_received_rows: next });
  const updateTrainingRequired = (next) =>
    update({ training_required_rows: next });

  const toggleTrainingType = (val) => {
  setTrainingType((prev) =>
    prev.includes(val)
      ? prev.filter((v) => v !== val)
      : [...prev, val]
  );
};
  const addTrainingReceivedRow = () => {
    const row = {
      id: Date.now().toString(),
      title: 'New Training Detail',
      expanded: true,
      department: '',
      department_other: '',
      sector_tree: [],
      other_sector_detail: '',
      certificates_files: [],
    };
    updateTrainingReceived([...trainingReceived, row]);
  };

  const removeTrainingReceivedRow = (index) => {
    const next = trainingReceived.filter((_, i) => i !== index);
    updateTrainingReceived(next);
  };

  const updateTrainingReceivedRow = (index, patch) => {
    const next = trainingReceived.map((row, i) =>
      i === index ? { ...row, ...patch } : row
    );
    updateTrainingReceived(next);
  };

  const toggleTrainingReceivedExpand = (index) => {
    const row = trainingReceived[index];
    updateTrainingReceivedRow(index, { expanded: !row.expanded });
  };

  const addTrainingRequiredRow = () => {
    const row = {
      id: Date.now().toString(),
      title: 'New Training Requirement',
      expanded: true,
      department: '',
      department_other: '',
      sector_tree: [],
      other_sector_detail: '',
      duration: '',
      location_state: '',
      location_district: '',
      location_block: '',
      location: '',
      expected_income: '',
    };
    updateTrainingRequired([...trainingRequired, row]);
  };

  const removeTrainingRequiredRow = (index) => {
    const next = trainingRequired.filter((_, i) => i !== index);
    updateTrainingRequired(next);
  };

  const updateTrainingRequiredRow = (index, patch) => {
    const row = trainingRequired[index];
    const merged = { ...row, ...patch };

    // re-compute combined location (State, District, Block)
    const location = [
      merged.location_state || '',
      merged.location_district || '',
      merged.location_block || '',
    ]
      .map((p) => p.trim())
      .filter(Boolean)
      .join(', ');

    merged.location = location;

    const next = trainingRequired.map((r, i) =>
      i === index ? merged : r
    );
    updateTrainingRequired(next);
  };

  const toggleTrainingRequiredExpand = (index) => {
    const row = trainingRequired[index];
    updateTrainingRequiredRow(index, { expanded: !row.expanded });
  };

  const pickCertificates = async (rowIndex) => {
    try {
      const res = await launchImageLibrary({
        mediaType: 'mixed',
        selectionLimit: 5,
      });
      if (res.didCancel) return;
      const assets = res.assets || [];
      const row = trainingReceived[rowIndex];
      const current = Array.isArray(row.certificates_files)
        ? row.certificates_files
        : [];
      const combined = [...current, ...assets];
      updateTrainingReceivedRow(rowIndex, {
        certificates_files: combined,
      });
    } catch (err) {
      console.warn('Certificate pick failed', err);
    }
  };

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
      <Text style={styles.sectionTitle}>
        {language === 'hi'
    ? '6) प्रशिक्षण / कौशल संबंधी अनुभाग'
    : '6) Training / Skills Related Section'}
      </Text>
<LanguageToggle/>
</View>
      {/* TRAINING RECEIVED */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
           {language === 'hi'
    ? 'क्या आपने किसी प्रकार का कौशल प्रशिक्षण प्राप्त किया है?'
    : 'Have you received any skill training?'}
        </Text>
        <Text style={styles.helpText}>
          {language === 'hi'
    ? 'यदि आपने व्यवसाय, कौशल या आजीविका से संबंधित कोई प्रशिक्षण प्राप्त किया है तो "हाँ" चुनें। आप नीचे दिए गए अनुभाग में प्रत्येक प्रशिक्षण का विवरण जोड़ सकते हैं।'
    : 'Please select Yes if you have already attended any training related to business, skills or livelihood. You can add details of each training in the section below.'}
        </Text>
        <YesNoToggle
        language={language}
          value={existingForm.is_training_received || ''}
          onChange={(val) => update({ is_training_received: val })}
        />
      </View>

      {isTrainingReceivedYes && (
        <View style={{ marginTop: 8 }}>
          <Text style={[styles.helpText, { marginBottom: 8 }]}>
            {language === 'hi'
    ? 'कृपया प्रत्येक प्रशिक्षण को अलग-अलग दर्ज करें। नया प्रशिक्षण जोड़ने के लिए "+ प्रशिक्षण विवरण जोड़ें" पर क्लिक करें।'
    : 'Please record each training separately. Click "+ Add Training Detail" to add another training.'}
          </Text>

          {trainingReceived.map((row, index) => (
            <View key={row.id || index} style={styles.card}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => toggleTrainingReceivedExpand(index)}
              >
                <Text style={styles.cardTitle}>
                  {/* {row.title || 'New Training Detail'} */}
                   {row.title
    ? row.title
    : language === 'hi'
      ? `नया प्रशिक्षण विवरण ${index + 1}`
      : `New Training Detail ${index + 1}`}
                </Text>
                <Text style={styles.cardToggle}>
                  {row.expanded ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              <View style={styles.cardHeaderBottom}>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeTrainingReceivedRow(index)}
                >
                  <Text style={styles.removeBtnText}>{language === 'hi' ? 'हटाएँ' : 'Delete'}</Text>
                </TouchableOpacity>
              </View>

              {row.expanded && (
                <View style={styles.cardBody}>
                  {/* 1) Department */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      {language === 'hi'
    ? 'आपने प्रशिक्षण किस विभाग/संस्था से प्राप्त किया?'
    : 'Which department did you receive the training from?'}
                    </Text>
                    <Text style={styles.helpText}>
                       {language === 'hi'
    ? 'आपने प्रशिक्षण किस विभाग/संस्था से प्राप्त किया?'
    : 'Which department did you receive the training from?'}
                    </Text>
                    <ChipRow
                      value={row.department || ''}
                      options={TRAINING_DEPT_OPTIONS}
                      onChange={(val) =>
                        updateTrainingReceivedRow(index, { department: val })
                      }
                    />
                    {row.department === 'Others' && (
                      <TextInput
                        style={[styles.input, { marginTop: 6 }]}
                        placeholder="Please specify the department"
                        value={row.department_other || ''}
                        onChangeText={(v) =>
                          updateTrainingReceivedRow(index, {
                            department_other: v,
                          })
                        }
                      />
                    )}
                  </View>

                  {/* 2) Sectors and modules (tree) */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      {language === 'hi'
    ? 'कृपया उन सभी क्षेत्रों का चयन करें जिनमें आपने प्रशिक्षण प्राप्त किया है'
    : 'Please select all sectors in which you have received trainings'}
                    </Text>
                    <Text style={styles.helpText}>
                     {language === 'hi'
    ? 'पहले मुख्य व्यवसाय क्षेत्र चुनें, फिर उस क्षेत्र के अंतर्गत आपने जिन- जिन प्रशिक्षणों में भाग लिया है उन्हें चुनें। आप एक से अधिक क्षेत्र चुन सकते हैं।'
    : 'First tick the main business sector, then choose all specific trainings you have attended under that sector. You can select more than one sector.'}
                    </Text>
<TrainingSectorTree
  value={row.sector_tree}
  language={language}   // ✅ pass language
  onChange={(tree) =>
    updateTrainingReceivedRow(index, {
      sector_tree: tree,
      title: computeTitleFromTree(
        tree,
        language === 'hi'
          ? 'नया प्रशिक्षण विवरण'
          : 'New Training Detail',
        language   // ✅ pass language here also
      ),
    })
  }
/>

                    <TextInput
                      style={[styles.input, { marginTop: 6 }]}
                      placeholder={
    language === 'hi'
      ? 'यदि अन्य, तो कृपया यहाँ क्षेत्र / उप-क्षेत्र का विवरण लिखें'
      : 'If Others, please specify sector / sub-sector details here'
  }

                      value={row.other_sector_detail || ''}
                      onChangeText={(v) =>
                        updateTrainingReceivedRow(index, {
                          other_sector_detail: v,
                        })
                      }
                    />

                    <Text style={[styles.helpText, { marginTop: 4 }]}>
                        {language === 'hi'
    ? 'आपके चयन को सर्वर पर भेजने के लिए "[क्षेत्र: मॉड्यूल1, मॉड्यूल2]" प्रारूप में सहेजा जाएगा।'
    : 'Your selections will be saved as "[Sector: Module1, Module2]" format for sending to the server.'}
                    </Text>
                  </View>

                  {/* 3) Certificates upload */}
<View style={styles.fieldBlock}>
  <Text style={styles.label}>
      {language === 'hi'
    ? 'यदि आपके पास प्रशिक्षण के प्रमाणपत्र हैं तो कृपया अपलोड करें'
    : 'Please upload if you have any certificates for your trainings (If Have)'}
  </Text>
  <Text style={styles.helpText}>
     {language === 'hi'
    ? 'आप अपने प्रशिक्षण प्रमाणपत्रों की फोटो या पीडीएफ कॉपी अपलोड कर सकते हैं। प्रत्येक फ़ाइल अलग-अलग सहेजी जाएगी।'
    : 'You can upload photos or PDF copies of your training certificates. Each file will be stored separately.'}
  </Text>
  <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
    {/* Upload button */}
    <TouchableOpacity
      style={styles.mediaBtn}
      onPress={() => pickCertificates(index)}
    >
      <Text style={styles.mediaBtnText}>{language === 'hi' ? 'प्रमाणपत्र अपलोड करें' : 'Upload Certificates'}</Text>
    </TouchableOpacity>

    {/* Camera button */}
    <TouchableOpacity
      style={styles.mediaBtn}
      onPress={async () => {
        try {
          const res = await launchCamera({
            mediaType: 'photo',
          });
          if (res.didCancel) return;
          const assets = res.assets || [];
          const row = trainingReceived[index];
          const current = Array.isArray(row.certificates_files) ? row.certificates_files : [];
          const combined = [...current, ...assets];
          updateTrainingReceivedRow(index, { certificates_files: combined });
        } catch (err) {
          console.warn('Camera capture failed', err);
        }
      }}
    >
      <Text style={styles.mediaBtnText}>{language === 'hi' ? 'कैमरा' : 'Camera'}</Text>
    </TouchableOpacity>
  </View>

  {Array.isArray(row.certificates_files) && row.certificates_files.length > 0 && (
    <Text style={styles.mediaInfo}>
      {/* Selected: {row.certificates_files.length} file(s) */}
      {language === 'hi'
    ? `चयनित: ${row.certificates_files.length} फ़ाइल`
    : `Selected: ${row.certificates_files.length} file(s)`}
    </Text>
  )}
</View>

                </View>
              )}
            </View>
          ))}

          <TouchableOpacity
            style={styles.addBtn}
            onPress={addTrainingReceivedRow}
          >
            <Text style={styles.addBtnText}> {language === 'hi' ? '+ प्रशिक्षण विवरण जोड़ें' : '+ Add Training Detail'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* TRAINING REQUIRED */}
      <View style={[styles.fieldBlock, { marginTop: 18 }]}>
        <Text style={styles.label}>
          {language === 'hi'
      ? 'क्या आपको भविष्य में कौशल प्रशिक्षण की आवश्यकता है?'
      : 'Do you require skill training in future?'}
        </Text>
        <Text style={styles.helpText}>
           {language === 'hi'
      ? 'यदि आप अपने उद्यम को बढ़ाने या सुधारने के लिए नया प्रशिक्षण लेना चाहते हैं, तो कृपया "हाँ" चुनें।'
      : 'Please select Yes if you are interested in taking new training to grow or improve your enterprise.'}
        </Text>
        <YesNoToggle
        language={language}
          value={existingForm.is_training_required || ''}
          onChange={(val) => update({ is_training_required: val })}
        />
      </View>

      {/* Training required = YES */}
      {isTrainingRequiredYes && (
        <View style={{ marginTop: 8 }}>
          <Text style={[styles.helpText, { marginBottom: 8 }]}>
            {language === 'hi'
    ? 'कृपया प्रत्येक प्रशिक्षण आवश्यकता को अलग-अलग जोड़ें। इससे आपके लिए उपयुक्त प्रशिक्षण की योजना बनाने में सहायता मिलेगी।'
    : 'Please add each training requirement separately. This will help us plan suitable training for you.'}
          </Text>

          {trainingRequired.map((row, index) => (
            <View key={row.id || index} style={styles.card}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => toggleTrainingRequiredExpand(index)}
              >
                <Text style={styles.cardTitle}>
                  {/* {row.title || 'New Training Requirement'} */}
                   {row.title ||
          (language === 'hi'
            ? 'नया प्रशिक्षण आवश्यकता विवरण'
            : 'New Training Requirement')}
                </Text>
                <Text style={styles.cardToggle}>
                  {row.expanded ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              <View style={styles.cardHeaderBottom}>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeTrainingRequiredRow(index)}
                >
                  <Text style={styles.removeBtnText}>{language === 'hi' ? 'हटाएँ' : 'Delete'}</Text>
                </TouchableOpacity>
              </View>

              {row.expanded && (
                <View style={styles.cardBody}>
                   <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                     {language === 'hi'
    ? 'प्रशिक्षण के लिए आपका पसंदीदा क्षेत्र कौन सा है?'
    : 'Which is your preferred sector for training?'}
                    </Text>
                    <Text style={styles.helpText}>
                        {language === 'hi'
    ? 'कृपया उन सभी व्यवसाय क्षेत्रों और कौशल क्षेत्रों का चयन करें जिनमें आप भविष्य में प्रशिक्षण लेना चाहते हैं।'
    : 'Please select all business sectors and skill areas where you want training in future.'}
                    </Text>

                    <TrainingSectorTree
                      language={language}  
                      value={row.sector_tree}
                      onChange={(tree) =>
                        updateTrainingRequiredRow(index, {
                          sector_tree: tree,
                          title: computeTitleFromTree(
                            tree,
                             language === 'hi'
          ? 'नया प्रशिक्षण आवश्यकता विवरण'
          : 'New Training Requirement',
        language
                          ),
                        })
                      }
                    />

                    <TextInput
                      style={[styles.input, { marginTop: 6 }]}
                       placeholder={
    language === 'hi'
      ? 'यदि अन्य, तो कृपया यहाँ क्षेत्र / उप-क्षेत्र का विवरण लिखें'
      : 'If Others, please specify sector / sub-sector details here'
  }
                      value={row.other_sector_detail || ''}
                      onChangeText={(v) =>
                        updateTrainingRequiredRow(index, {
                          other_sector_detail: v,
                        })
                      }
                    />
                  </View>
      <View style={styles.fieldBlock}>
  <Text style={styles.label}>
    {language === 'hi'
    ? 'आप किस प्रकार का प्रशिक्षण पसंद करते हैं?'
    : 'What is your preferred training type?'}
  </Text>

  <Text style={styles.helpText}>
     {language === 'hi'
    ? 'आप एक या दोनों विकल्प चुन सकते हैं।'
    : 'You may select one or both options.'}
  </Text>

  {TRAINING_TYPE_OPTIONS.map((opt) => {
  const value = opt.en; // ✅ store English in state
  const label = language === 'hi' ? opt.hi : opt.en;

  return (
    <TouchableOpacity
      key={value}
      style={styles.checkboxRow}
      onPress={() => toggleTrainingType(value)}
    >
      <View
        style={[
          styles.checkbox,
          trainingType.includes(value) && styles.checkboxChecked,
        ]}
      />
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );
})}
</View>


                  <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      {language === 'hi'
      ? 'आप एक सत्र में कितने दिनों के प्रशिक्षण के लिए सहज हैं?'
      : 'How many days of training are you comfortable in one slot?'}
                    </Text>
                    <Text style={styles.helpText}>
                         {language === 'hi'
      ? 'कृपया वह प्रशिक्षण अवधि चुनें जो आपको सबसे उपयुक्त लगे।'
      : 'Please select the training duration that suits you best.'}
                    </Text>
                    <ChipRow
  value={row.duration || ''}
  options={TRAINING_DURATION_OPTIONS.map((opt) => ({
    value: opt.value,
    label: language === 'hi' ? opt.hi : opt.en,
  }))}
  onChange={(val) =>
    updateTrainingRequiredRow(index, { duration: val })
  }
/>

                  </View>

                  {/* 1) Preferred department */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                    {language === 'hi'
    ? 'प्रशिक्षण के लिए आपका पसंदीदा विभाग/संस्था कौन सा है?'
    : 'Which is your preferred department for training?'}
                    </Text>
                    <Text style={styles.helpText}>
                       {language === 'hi'
    ? 'कृपया उस विभाग या संस्था का चयन करें जिससे आप प्रशिक्षण प्राप्त करना चाहते हैं।'
    : 'Please select the department or organisation from which you would like to receive training.'}
                    </Text>
                    
                    <ChipRow
                      value={row.department || ''}
                      options={TRAINING_DEPT_OPTIONS}
                      onChange={(val) =>
                        updateTrainingRequiredRow(index, { department: val })
                      }
                    />
                    {row.department === 'Others' && (
                      <TextInput
                        style={[styles.input, { marginTop: 6 }]}
                        placeholder={
    language === 'hi'
      ? 'कृपया विभाग/संस्था का नाम लिखें'
      : 'Please specify the department'
  }
                        value={row.department_other || ''}
                        onChangeText={(v) =>
                          updateTrainingRequiredRow(index, {
                            department_other: v,
                          })
                        }
                      />
                    )}
                  </View>
                    <View style={styles.fieldBlock}>
  <Text style={styles.label}>
     {language === 'hi'
    ? 'प्रशिक्षण के लिए आपका पसंदीदा स्थान क्या है?'
    : 'What is your preferred training location?'}
  </Text>

  <Text style={styles.helpText}>
    {language === 'hi'
    ? 'कृपया वह राज्य, जिला और ब्लॉक भरें जहाँ आप प्रशिक्षण लेना चाहते हैं। इन्हें आपके पसंदीदा स्थान के रूप में एक साथ सहेजा जाएगा।'
    : 'Please fill the State, District and Block where you would like to attend the training. These will be saved together as your preferred location.'}
  </Text>

  <Text style={styles.smallLabel}> {language === 'hi' ? 'स्थान प्रकार चुनें' : 'Select Location Type'}</Text>

  <View style={styles.input}>
    <Picker
      selectedValue={row.location_type || ""}
      onValueChange={(v) =>
        updateTrainingRequiredRow(index, {
          location_type: v,
        })
      }
    >
      <Picker.Item  label={language === 'hi' ? 'स्थान चुनें' : 'Select Location'} value="" />
      <Picker.Item       label={language === 'hi' ? 'राज्य' : 'State'}
 value="state" />
      <Picker.Item       label={language === 'hi' ? 'जिला' : 'District'}
 value="district" />
      <Picker.Item  label={language === 'hi' ? 'ब्लॉक' : 'Block'} value="block" />
      <Picker.Item  label={language === 'hi' ? 'ब्लॉक' : 'Block'} value="village" />
    </Picker>
  </View>
</View>

                  {/* </View> */}

                  {/* 5) Expected income */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      {language === 'hi'
    ? 'प्रशिक्षण के बाद आपकी अपेक्षित आय क्या है?'
    : 'What is your expected income after training?'}
                    </Text>
                    <Text style={styles.helpText}>
                      {language === 'hi'
    ? 'कृपया प्रशिक्षण सफलतापूर्वक पूरा करने के बाद आप जिस मासिक आय की अपेक्षा करते हैं, उसका चयन करें।'
    : 'Please select the monthly income range you are expecting after successfully completing the training.'}
                    </Text>
                    <ChipRow
  value={row.expected_income || ''}
  options={EXPECTED_INCOME_OPTIONS.map((opt) => ({
    value: opt.value, // stored in backend
    label: language === 'hi' ? opt.hi : opt.en, // shown in UI
  }))}
  onChange={(val) =>
    updateTrainingRequiredRow(index, { expected_income: val })
  }
/>
                  </View>
                </View>
              )}
            </View>
          ))}

          <TouchableOpacity
            style={styles.addBtn}
            onPress={addTrainingRequiredRow}
          >
            <Text style={styles.addBtnText}>  {language === 'hi'
    ? '+ प्रशिक्षण आवश्यकता जोड़ें'
    : '+ Add Training Requirement'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Training required = NO – ask about centres & industries nearby */}
      {isTrainingRequiredNo && (
        <View style={{ marginTop: 10 }}>
          {/* 1) Nearest skill centre */}
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>
              {language === 'hi'
          ? 'क्या आप अपने उद्यम से संबंधित किसी कौशल केंद्र के बारे में जानते हैं?'
          : 'Do you know of any Skill Centres related to your enterprise?'}
            </Text>
            <Text style={styles.helpText}>
             {language === 'hi'
          ? 'यदि आप किसी नजदीकी कौशल या प्रशिक्षण केंद्र के बारे में जानते हैं तो कृपया "हाँ" चुनें।'
          : 'Please select Yes if you are aware of any nearby skill or training centre.'}
            </Text>
            <YesNoToggle
             language={language}
              value={existingForm.nearest_skill_centre || ''}
              onChange={(val) => update({ nearest_skill_centre: val })}
            />
            {existingForm.nearest_skill_centre === 'Yes' && (
              <View style={{ marginTop: 6 }}>
                <Text style={styles.helpText}>
                   {language === 'hi'
              ? 'कृपया उसका स्थान (ग्राम/नगर, ब्लॉक, जिला) लिखें।'
              : 'Please mention its location (village/town, block, district).'}
                </Text>
                <TextInput
                  style={styles.input}
                   placeholder={
              language === 'hi'
                ? 'स्थान दर्ज करें'
                : 'Enter location'
            }
                  value={existingForm.skill_centre_loc || ''}
                  onChangeText={(v) => update({ skill_centre_loc: v })}
                />
              </View>
            )}
          </View>

          {/* 2) Nearest industry */}
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>
               {language === 'hi'
      ? 'क्या आप अपने उद्यम से संबंधित किसी उद्योग / औद्योगिक क्षेत्र के बारे में जानते हैं?'
      : 'Do you know of any Industries / Industrial Sectors related to your enterprise?'}
            </Text>
            <Text style={styles.helpText}>
               {language === 'hi'
      ? 'यदि आप किसी नजदीकी औद्योगिक क्षेत्र, फैक्ट्री या क्लस्टर के बारे में जानते हैं तो कृपया "हाँ" चुनें।'
      : 'Please select Yes if you know any nearby industrial areas, factories or clusters.'}
            </Text>
            <YesNoToggle
             language={language}
              value={existingForm.nearest_industry || ''}
              onChange={(val) => update({ nearest_industry: val })}
            />
            {existingForm.nearest_industry === 'Yes' && (
              <View style={{ marginTop: 6 }}>
                <Text style={styles.helpText}>
                  {language === 'hi'
          ? 'कृपया उसका स्थान (औद्योगिक क्षेत्र का नाम, नगर आदि) लिखें।'
          : 'Please mention its location (name of industrial area, town, etc.).'}
                </Text>
                <TextInput
                  style={styles.input}
                   placeholder={
          language === 'hi'
            ? 'स्थान दर्ज करें'
            : 'Enter location'
        }
                  value={existingForm.industry_loc || ''}
                  onChangeText={(v) => update({ industry_loc: v })}
                />
              </View>
            )}
          </View>
        </View>
      )}

      {/* 22) Future expansion plan */}
      <View style={[styles.fieldBlock, { marginTop: 18 }]}>
        <Text style={styles.label}>
           {language === 'hi'
      ? 'आपकी भविष्य की विस्तार योजना क्या है? (यदि कोई हो)'
      : 'What is your Future Expansion Plan (If any)?'}
        </Text>
        <Text style={styles.helpText}>
          {language === 'hi'
      ? 'कृपया संक्षेप में बताएं कि आप भविष्य में अपने उद्यम को कैसे बढ़ाना चाहते हैं (जैसे नए उत्पाद, अधिक कर्मचारी, नए बाजार आदि)।'
      : 'Please briefly describe how you would like to grow your enterprise in the future (for example, new products, more workers, new markets, etc.).'}
        </Text>
        <TextInput
          style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
          multiline
          placeholder={
      language === 'hi'
        ? 'अपनी योजना यहाँ लिखें'
        : 'Write your plan here'
    }
          value={existingForm.expansion_plan || ''}
          onChangeText={(v) => update({ expansion_plan: v })}
        />
      </View>

      {/* 23) Information about government schemes */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
           {language === 'hi'
      ? 'क्या आप अपने व्यवसाय से संबंधित सरकारी योजनाओं के बारे में जानते हैं?'
      : 'Do you know about Govt Schemes relevant to your business?'}
        </Text>
        <Text style={styles.helpText}>
           {language === 'hi'
      ? 'यदि आप अपने व्यवसाय या आजीविका से संबंधित विभिन्न सरकारी योजनाओं के बारे में जानकारी प्राप्त करने में रुचि रखते हैं, तो कृपया "हाँ" चुनें।'
      : 'Please select Yes if you are interested in learning about different government schemes related to your business or livelihood.'}
        </Text>
        <YesNoToggle
         language={language}
          value={existingForm.info_abt_gov_scheme || ''}
          onChange={(val) => update({ info_abt_gov_scheme: val })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 24,
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
  smallLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 2,
    color: '#444',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    // paddingVertical: 8,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  yesNoRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  yesNoBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 6,
  },
  yesNoBtnActive: {
    backgroundColor: '#EE6969',
    borderColor: '#EE6969',
  },
  yesNoText: {
    fontSize: 14,
    color: '#333',
  },
  yesNoTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  chipActive: {
    backgroundColor: '#EE6969',
    borderColor: '#EE6969',
  },
  chipText: {
    fontSize: 12,
    color: '#333',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    backgroundColor: '#fafafa',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderBottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 15,
    flex: 1,
  },
  cardToggle: {
    fontSize: 16,
    marginLeft: 8,
  },
  cardBody: {
    marginTop: 8,
  },
  removeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#f3d0d0',
    borderRadius: 6,
  },
  removeBtnText: {
    fontSize: 12,
    color: '#a03333',
    fontWeight: '600',
  },
  treeGroup: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  treeParentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  treeParentText: {
    fontWeight: '600',
    flex: 1,
  },
  treeChildrenBlock: {
    marginTop: 8,
    paddingLeft: 8,
  },
  treeChildRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
  },
  treeChildCheckbox: {
    width: 20,
    fontSize: 16,
  },
  treeChildLabel: {
    flex: 1,
    fontSize: 13,
    color: '#444',
  },
  mediaBtn: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#777',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  mediaBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  mediaInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  addBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#2b7',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#2b7',
    fontWeight: '700',
    fontSize: 14,
  },
  checkboxRow: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 8,
},

checkbox: {
  width: 20,
  height: 20,
  borderWidth: 1.5,
  borderColor: '#666',
  borderRadius: 4,
  marginRight: 10,
  backgroundColor: '#fff',
},

checkboxChecked: {
  backgroundColor: '#d9534f', // green fill
  borderColor: '#d9534f',
},

checkboxLabel: {
  fontSize: 14,
  color: '#333',
},

});
