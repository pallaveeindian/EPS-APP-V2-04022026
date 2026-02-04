// src/screens/screensProductionApp/FormSections/ExistingEnterpriseBasicInfoSection.jsx
import React, { useState } from 'react';
import { useEffect } from 'react';
import { useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet,AppState,  } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import LanguageToggle from '../../../components/LanguageToggle';
import { LanguageContext } from '../../../components/LanguageContext';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import LicenseSelector from './BasicInformationSectionLicenseSelector'
// const ENTERPRISE_TYPE_TREE = [
//   {
//     parent: 'Food Processing Sector',
//     children: [
//       'Spice manufacturing',
//       'Pickles, preserves (murabba), papad',
//       'Savoury snacks, bhujiya, namkeen',
//       'Instant mixes (idli mix, gram flour mix, kheer mix)',
//       'Bakery items (cookies, cake, bread)',
//       'Millet-based products (jowar, bajra cookies, snacks)',
//       'Cold-pressed oils (mustard/sesame)',
//       'Honey processing',
//       'Jam–jelly–squash',
//       'Ready-to-eat products',
//       'Jaggery Production',
//       'Whole grain/pulses/flour sorting–grading–packaging unit​',
//       'Others',
//     ],
//   },
//   {
//     parent: 'Handicraft & Artisan Sector',
//     children: [
//       'Zari and zardozi work',
//       'Chikankari embroidery',
//       'Woodwork',
//       'Terracotta / clay products',
//       'Bamboo / cane craft',
//       'Handmade jewellery (terracotta jewellery, oxidised jewellery)',
//       'Handmade candles',
//       'Crochet / woollen products',
//       'Paper craft, greeting cards',
//       'Handbags, jute bags, embroidered bags',
//       'Ration/vegetable/shopping bags (non-woven alternatives)​',
//       'Others',
//     ],
//   },
//   {
//     parent: 'Textile & Apparel Sector',
//     children: [
//       'Boutique unit (stitching–cutting–embellishment)',
//       'School uniform stitching unit',
//       'Ladies’ garments',
//       'Bedsheet/quilt/pillow cover unit',
//       'ODOP textile-based products (Varanasi saree, Bhadohi carpet finishing etc.)',
//       'Home linen (curtains, table cloth, sofa covers)',
//       'Jute/cotton carry bags',
//       'Mask/apron/hospital gown manufacturing​',
//       'Others',
//     ],
//   },
//   {
//     parent: 'Agriculture & Allied Sector',
//     children: [
//       'Vegetable cultivation and group supply',
//       'Flower cultivation (marigold, rose)',
//       'Mushroom production',
//       'Nursery (fruit/flower/vegetable saplings)',
//       'Beekeeping (honey production)',
//       'Organic manure/vermi-compost',
//       'Animal feed unit',
//       'Mini mill (flour/pulse grinding)',
//       'Fruit–vegetable dehydration unit',
//       'Fish farming',
//       'Others',
//     ],
//   },
//   {
//     parent: 'Dairy & Animal Husbandry Sector',
//     children: [
//       'Dairy unit (2–10 cows/buffaloes)',
//       'Milk collection centre',
//       'Paneer/khoya/curd/ghee manufacturing',
//       'Goat rearing',
//       'Poultry unit (egg/broiler)',
//       'Pig rearing (in specific areas)',
//       'Fodder production',
//       'Milk packaging and branding unit​',
//       'Others',
//     ],
//   },
//   {
//     parent: 'Beauty, Wellness & Personal Services',
//     children: [
//       'Beauty parlour',
//       'Mehndi (henna) training and services',
//       'Spa / therapy unit',
//       'Home-care services (home nursing, baby care training)',
//       'Mobile salon / village-based services',
//       'Fitness group / yoga classes​',
//       'Others',
//     ],
//   },
//   {
//     parent: 'Retail & Micro Trading Sector',
//     children: [
//       'Grocery/provision store',
//       'Stationery / general store',
//       'Group sale of vegetables/fruits',
//       'Fast food cart',
//       'Mobile recharge shop / bill payment kiosk',
//       'Jan Aushadhi/Medical Store',
//       'PET shop and disposable alternatives distribution​',
//       'Others',
//     ],
//   },
//   {
//     parent: 'Cleaning & Hygiene Products Sector',
//     children: [
//       'Phenyl/detergent manufacturing',
//       'Liquid handwash',
//       'Sanitizer',
//       'Incense sticks and dhoop sticks',
//       'Napkin / sanitary pad unit',
//       'Biodegradable plate and bowl manufacturing​',
//       'Others',
//     ],
//   },

//   {
//     parent: 'FMCG',
//     children: [
//       'Handwash',
//       'Soap',
//       'Floor Cleaner',
//       'Detergents',
//       'Air fresheners',
//       'Face wash & creams',
//       'Shampoo & conditioner',
//       'Sponges',
//       'Toothpaste & toothbrushes',
//       'Broom',
//       'Others',
//     ],
//   },
//    {
//     parent: 'Transport',
//     children: [
//       'Loader',
//       'E-Rikshaw',
//       'Taxi',
//       'Auto',
//       'Others',
//     ],
//   },
//   {
//     parent: 'Packaging & Utility Products Sector',
//     children: [
//       'Paper bag unit',
//       'Jute bag unit',
//       'Box manufacturing',
//       'Recycled paper packaging unit',
//       'Food-grade packaging​',
//       'Others',
//     ],
//   },
//   {
//     parent: 'Prerna Canteen',
//     children: [
//     ],
//   },
//   {
//     parent: 'Digital & Service Sector',
//     children: [
//       'Data entry / digital services',
//       'CSC (Common Service Center) operations',
//       'Online product sales (e-commerce)',
//       'SHG product branding',
//       'Social media management for local shops​',
//       'Others',
//     ],
//   },
//   {
//     parent: 'Solid Waste & Green Sector',
//     children: [
//       'Plastic waste sorting',
//       'Fuel/briquettes from waste',
//       'Composting unit',
//       'Recycled paper products',
//       'E-waste collection micro centre​',
//       'Others',
//     ],
//   },
//   {
//     parent: 'Construction & Fabrication Micro Enterprises',
//     children: [
//       'Brick and tiles cleaning/polishing unit',
//       'Interior decoration (fabric, flowers, décor)',
//       'Painting/plumbing/carpentry group',
//       'POP artwork / wall decoration',
//       'Others',
//     ],
//   },
//   {
//   parent: 'EDP|Entrepreneurship Development Programme',
//    children: [
//    ],
//   },
//   {
//     parent: 'Other​',
//     children: ['Others'],
//   },
// ];

const ENTERPRISE_TYPE_TREE = [
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

// const OWNERSHIP_OPTIONS = [
//   { label: 'Individual', value: 'Individual' },
//   { label: 'Partnership', value: 'Partnership' },
//   { label: 'SHG-based enterprise', value: 'SHG-based enterprise' },
//   { label: 'Family-run enterprise', value: 'Family-run enterprise' },
//   { label: 'Others', value: 'Others' },
// ];

const OWNERSHIP_OPTIONS = [
  {
    label: { en: 'Individual', hi: 'व्यक्तिगत' },
    value: 'Individual',
  },
  {
    label: { en: 'Partnership', hi: 'साझेदारी' },
    value: 'Partnership',
  },
  {
    label: { en: 'SHG-based enterprise', hi: 'SHG आधारित उद्यम' },
    value: 'SHG-based enterprise',
  },
  {
    label: { en: 'Family-run enterprise', hi: 'पारिवारिक उद्यम' },
    value: 'Family-run enterprise',
  },
  {
    label: { en: 'Others', hi: 'अन्य' },
    value: 'Others',
  },
];


const EnterpriseTypeTree = ({ value, onChange, language }) => {
  const selectedTree = Array.isArray(value) ? value : [];

  const toggleParent = (parent) => {
    const exists = selectedTree.find(
      // (row) => row.parent === parent
         (row) => row.parent?.en === parent.en
    );
    let updated;
    if (exists) {
      updated = selectedTree.filter(
        // (row) => row.parent !== parent
         (row) => row.parent?.en !== parent.en
      );
    } else {
      updated = [...selectedTree, { parent, children: [], parentOtherText: '' }];
    }
    onChange(updated);
  };

  const toggleChild = (parent, child) => {
    const existing = selectedTree.find((row) => row.parent === parent);
    let updated = [...selectedTree];
    if (!existing) {
      updated.push({ parent, children: [child], childOtherText: {} });
    } else {
      const children = existing.children || [];
      const has = children.includes(child);
      const newChildren = has
        ? children.filter((c) => c !== child)
        : [...children, child];
      updated = updated.map((row) =>
        row.parent === parent ? { ...row, children: newChildren } : row
      );
    }
    onChange(updated);
  };

  const isParentSelected = (parent) =>
    !!selectedTree.find((row) => row.parent === parent);

  const isChildSelected = (parent, child) => {
    const row = selectedTree.find((r) => r.parent === parent);
    return !!row && row.children?.includes(child);
  };

  const updateParentOtherText = (parent, text) => {
    const updated = selectedTree.map((row) =>
      row.parent === parent ? { ...row, parentOtherText: text } : row
    );
    onChange(updated);
  };

  const updateChildOtherText = (parent, child, text) => {
    const updated = selectedTree.map((row) => {
      if (row.parent === parent) {
        return {
          ...row,
          childOtherText: { ...(row.childOtherText || {}), [child]: text },
        };
      }
      return row;
    });
    onChange(updated);
  };

  return (
    <View style={{ marginTop: 8 }}>
      {ENTERPRISE_TYPE_TREE.map((group) => {
        const parentSelected = isParentSelected(group.parent);
        // const rowData = selectedTree.find((r) => r.parent === group.parent) || {};
         const rowData =
        selectedTree.find((r) => r.parent?.en === group.parent.en) || {};
        return (
          <View
            key={group.parent}
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              padding: 8,
              marginBottom: 8,
            }}
          >
            <TouchableOpacity
              onPress={() => toggleParent(group.parent)}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontWeight: '600', flex: 1 }}>
                {/* {group.parent} */}
                 {language === 'hi'
                ? group.parent.hi
                : group.parent.en}
                </Text>
              <Text>{parentSelected ? '☑' : '☐'}</Text>
            </TouchableOpacity>

            {parentSelected && (
              <View style={{ marginTop: 8, paddingLeft: 8 }}>
                {group.children.map((child) => (
                  <View key={child.en}>
                    <TouchableOpacity
                      onPress={() => toggleChild(group.parent, child)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <Text style={{ marginRight: 6 }}>
                        {isChildSelected(group.parent, child) ? '☑' : '☐'}
                      </Text>
                      <Text style={{ flex: 1 }}>
                        {/* {child} */}
                         {language === 'hi'
                        ? child.hi
                        : child.en}
                        </Text>
                    </TouchableOpacity>

                    {/* Child "Others → Specify" field */}
                    {isChildSelected(group.parent, child) && child.en === 'Others' && (
                      <TextInput
                        style={[styles.input, { marginBottom: 6, marginLeft: 20 }]}
                        // placeholder="Please specify"
                         placeholder={
                          language === 'hi'
                            ? 'कृपया विवरण दें'
                            : 'Please specify'
                        }
                        value={(rowData.childOtherText && rowData.childOtherText[child.en]) || ''}
                        onChangeText={(text) => updateChildOtherText(group.parent, child, text)}
                      />
                    )}
                  </View>
                ))}

                {/* Parent "Others → Specify" field */}
                
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};
// const BASIC_INFO_DRAFT_KEY = 'EXISTING_ENTERPRISE_BASIC_INFO_DRAFT';
export default function ExistingEnterpriseBasicInfoSection({ existingForm, setExistingForm }) {
const { language } = useContext(LanguageContext);
  const [yearPickerVisible, setYearPickerVisible] = useState(false);
//  const [draftLoaded, setDraftLoaded] = useState(false); // ADDED
  const currentYear = new Date().getFullYear();
  const startYear = 1950;
  const yearOptions = [];
  for (let y = currentYear; y >= startYear; y--) yearOptions.push(y.toString());

 
  //    useEffect(() => {
  //   const loadDraft = async () => {
  //     try {
  //       const saved = await AsyncStorage.getItem(BASIC_INFO_DRAFT_KEY);
  //       if (saved) {
  //         setExistingForm(JSON.parse(saved)); //  FIXED
  //       }
  //     } catch (e) {
  //       console.log('Draft load failed', e);
  //     } finally {
  //       setDraftLoaded(true); // ADDED
  //     }
  //   };

  //   loadDraft();
  // }, []); // CHANGED (removed dependency on setExistingForm)

  /* =====================================================
     FIX 2: Auto-save ONLY AFTER draft is loaded
  ===================================================== */
  // useEffect(() => {
  //   if (!draftLoaded) return; // CRITICAL FIX

  //   AsyncStorage.setItem(
  //     BASIC_INFO_DRAFT_KEY,
  //     JSON.stringify(existingForm)
  //   );
  // }, [existingForm, draftLoaded]); // CHANGED

  /* =====================================================
     FIX 3: Save draft when app goes background
  ===================================================== */
  // useEffect(() => {
  //   const sub = AppState.addEventListener('change', state => {
  //     if (state !== 'active' && draftLoaded) {
  //       AsyncStorage.setItem(
  //         BASIC_INFO_DRAFT_KEY,
  //         JSON.stringify(existingForm)
  //       );
  //     }
  //   });

  //   return () => sub.remove();
  // }, [existingForm, draftLoaded]); //  CHANGED

  /* =====================================================
      FIX 4: PATCH update (NO functional updater)
  ===================================================== */
  const update = (patch) => setExistingForm(patch); // CORRECT
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
    {language === 'hi' ? '1) बुनियादी जानकारी' : '1) Basic Information'}
  </Text>

  <LanguageToggle />
</View>
      {/* Enterprise Name */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}> {language === 'hi'
      ? 'आपके उद्यम का नाम क्या है?'
      : 'What is the name of your Enterprise?'}</Text>
        <Text style={styles.helpText}>
          {language === 'hi'
      ? 'कृपया अपने उद्यम का पूरा नाम लिखें, जैसा आप दैनिक कार्य में उपयोग करते हैं।'
      : 'Please type the full name of your enterprise as you use it in daily work.'}
        </Text>
        <TextInput
          style={styles.input}
          value={existingForm.enterprise_name || ''}
          onChangeText={(v) => update({ enterprise_name: v })}
        />
      </View>

      {/* Enterprise Type */} 
      <View style={styles.fieldBlock}>
        <Text style={styles.label}> {language === 'hi'
      ? 'आपके उद्यम का प्रकार क्या है?'
      : 'What is the type of your Enterprise?'}</Text>
        <Text style={styles.helpText}>
          {language === 'hi'
      ? 'कृपया सभी संबंधित क्षेत्रों और उप-श्रेणियों का चयन करें। आप एक से अधिक विकल्प चुन सकते हैं।'
      : 'Please select all relevant sectors and sub-categories. You can choose more than one.'}
        </Text>
        <EnterpriseTypeTree
          value={existingForm.enterprise_types_tree || []}
          onChange={(tree) => update({ enterprise_types_tree: tree })}
          language={language}  
        />
      </View>

      {/* Ownership type */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>    {language === 'hi'
      ? 'आपके उद्यम का स्वामित्व प्रकार क्या है?'
      : 'What is your Enterprise Ownership type?'}</Text>
        <Text style={styles.helpText}>
          {/* Please select who owns this enterprise. If not sure, choose Others and specify. */}
            {language === 'hi'
      ? 'कृपया बताएं कि इस उद्यम का स्वामी कौन है। यदि निश्चित न हों, तो "अन्य" चुनें और विवरण दें।'
      : 'Please select who owns this enterprise. If not sure, choose Others and specify.'}
        </Text>
        <View style={[styles.input, { paddingHorizontal: 0, paddingVertical: 0 }]}>
          <Picker
               selectedValue={existingForm.ownership_type || ''}
            onValueChange={(v) => update({ ownership_type: v })}
          >
            <Picker.Item label={language === 'hi' ? 'चयन करें...' : 'Select...'}  value=""/>
            {OWNERSHIP_OPTIONS.map((opt) => (
              <Picker.Item key={opt.value} 
              // label={opt.label}
                 label={language === 'hi' ? opt.label.hi : opt.label.en}
               value={opt.value} />
            ))}
          </Picker>
        </View>
        {existingForm.ownership_type === 'Others' && (
          <TextInput
            style={[styles.input, { marginTop: 6 }]}
             placeholder={
        language === 'hi'
          ? 'कृपया विवरण दें'
          : 'Please specify'
      }
            value={existingForm.ownership_type_other || ''}
            onChangeText={(v) => update({ ownership_type_other: v })}
          />
        )}
      </View>

      {/* Special category */}
      {/* <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          Please specify your special category (If applicable)
        </Text>
        <Text style={styles.helpText}>
          Please mention if you belong to any special category (e.g., widow, PwD, etc.).
        </Text>
        <TextInput
          style={styles.input}
          value={existingForm.owner_special_category || ''}
          onChangeText={(v) => update({ owner_special_category: v })}
        />
      </View> */}

      {/* Year of establishment */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>{language === 'hi'
      ? 'आपका उद्यम किस वर्ष स्थापित हुआ था?'
      : 'Which year was your Enterprise established in?'}</Text>
        <Text style={styles.helpText}>
          {language === 'hi'
      ? 'कृपया वह वर्ष चुनें जब आपने यह उद्यम शुरू किया था। यदि निश्चित न हों, तो अपने अनुमान के अनुसार चुनें।'
      : 'Please select the year when you started this enterprise. If unsure, give your best estimate.'}
        </Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setYearPickerVisible(true)}
        >
          <Text>{existingForm.year_of_establishment ||  (language === 'hi' ? 'वर्ष चुनें' : 'Select Year')}</Text>
        </TouchableOpacity>

        <Modal visible={yearPickerVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 8 }}>
                {language === 'hi'
            ? 'स्थापना वर्ष चुनें'
            : 'Select Year of Establishment'}
              </Text>
              <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6 }}>
                <Picker
                  selectedValue={existingForm.year_of_establishment || ''}
                  onValueChange={(val) => {
                    update({ year_of_establishment: val });
                    setYearPickerVisible(false);
                  }}
                >
                  <Picker.Item label={language === 'hi' ? 'चयन करें...' : 'Select...'} value="" />
                  {yearOptions.map((y) => (
                    <Picker.Item key={y} label={y} value={y} />
                  ))}
                </Picker>
              </View>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setYearPickerVisible(false)}
              >
                <Text style={{ color: '#EE6969', fontWeight: '600' }}> {language === 'hi' ? 'रद्द करें' : 'Cancel'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
      <View><LicenseSelector language={language}/></View>
        
      {/* UDDYAM AADHAR */}
      {/* <View style={styles.fieldBlock}>
        <Text style={styles.label}>Please Specify the correct UDDYAM AADHAR NUMBER (If any)</Text>
        <Text style={styles.helpText}>
          Please enter the Udyam Aadhar Number carefully. This will be used for verification.
        </Text>
        <TextInput
          style={styles.input}
          value={existingForm.uddyam_aadhar || ''}
          onChangeText={(v) => update({ uddyam_aadhar: v })}
        />
      </View> */}

      {/* Total employees */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}> {language === "hi"
      ? "आपके उद्यम के तहत काम कर रहे कुल कर्मचारियों की संख्या क्या है?"
      : "What are the total number of employees working under your Enterprise?"}</Text>
        <Text style={styles.helpText}>
             {language === "hi"
      ? "कृपया अपने उद्यम में काम करने वाले लोगों की कुल संख्या दर्ज करें। यदि कोई नहीं है, तो कृपया 0 दर्ज करें।"
      : "Please enter the total number of people working in your enterprise. If none, please enter 0."}
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(existingForm.total_emp || '')}
          onChangeText={(v) => update({ total_emp: v })}
        />
      </View>

      {/* SHG employees */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>{language === "hi"
      ? "क्या आपके उद्यम के तहत कोई SHG सदस्य काम कर रहे हैं?"
      : "Are there any SHG members working under your Enterprise?"}</Text>
        <Text style={styles.helpText}>
         {language === "hi"
      ? "कृपया यहां काम कर रहे SHG सदस्यों की संख्या दर्ज करें। यदि कोई नहीं है, तो 0 दर्ज करें।"
      : "Please enter the number of SHG members working here. If none, please enter 0."}
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(existingForm.number_of_shg_emp || '')}
          onChangeText={(v) => update({ number_of_shg_emp: v })}
        />
      </View>
      {/* Special category */}
      {/* <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          Please specify your special category (If applicable)
        </Text>
        <Text style={styles.helpText}>
          Please mention if you belong to any special category (e.g., widow, PwD, etc.).
        </Text>
        <TextInput
          style={styles.input}
          value={existingForm.owner_special_category || ''}
          onChangeText={(v) => update({ owner_special_category: v })}
        />
      </View> */}


      {/* cadre selection */}
<View style={styles.fieldBlock}>
  <Text style={styles.label}>{language === "hi"
      ? "क्या आप किसी कैडर गतिविधि में शामिल हैं?"
      : "Are you involved in any cadre activity?"}</Text>
  <Text style={styles.helpText}>{language === "hi"
      ? "अपनी कैडर गतिविधि चुनें"
      : "Select your cadre activity"}
</Text>

  {[
    'Lakhpati CRP',
'Krishi Ajeevika Sakhi',
'Krishi Udyog Sakhi', 
'Mahila Kisan',
'CRP- EP',
'BC sakhi',
'Vidyut Sakhi',
'Bank Sakhi',
'Fnhw Swasth sakhi',
'THR/Dry ration worker',
'Samuh Sakhi',
'MGNREGA MATE',
    'Other',
  ].map((opt) => {
    const selected =
      Array.isArray(existingForm.owner_cadre_activity) &&
      existingForm.owner_cadre_activity.includes(opt);
      const optLabel = (() => {
      if (language === "hi") {
        switch (opt) {
          case 'Lakhpati CRP': return 'लखपति CRP';
          case 'Krishi Ajeevika Sakhi': return 'कृषि आजीविका सखी';
          case 'Krishi Udyog Sakhi': return 'कृषि उद्योग सखी';
          case 'Mahila Kisan': return 'महिला किसान';
          case 'CRP- EP': return 'CRP- EP';
          case 'BC sakhi': return 'BC सखी';
          case 'Vidyut Sakhi': return 'विद्युत सखी';
          case 'Bank Sakhi': return 'बैंक सखी';
          case 'Fnhw Swasth sakhi': return 'Fnhw स्वास्थ्य सखी';
          case 'THR/Dry ration worker': return 'THR/सूखा राशन कार्यकर्ता';
          case 'Samuh Sakhi': return 'समूह सखी';
          case 'MGNREGA MATE': return 'मनरेगा मेट';
          case 'Other': return 'अन्य';
          default: return opt;
        }
      } else {
        return opt;
      }
    })();

    return (
      <TouchableOpacity
        key={opt}
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}
        onPress={() => {
          let updated = [...(existingForm.owner_cadre_activity || [])];

          if (selected) {
            // remove
            updated = updated.filter((i) => i !== opt);
          } else {
            // add
            updated.push(opt);
          }

          update({ owner_cadre_activity: updated });
        }}
      >
        <View
          style={[
            styles.checkbox,
            selected && styles.checkboxChecked,
          ]}
        />
        <Text style={{ marginLeft: 8 }}>{optLabel}</Text>
      </TouchableOpacity>
    );
  })}

  {/* If "Other" selected → show textbox */}
  {existingForm.owner_cadre_activity?.includes('Other') && (
    <TextInput
      style={[styles.input, { marginTop: 6 }]}
         placeholder={
        language === "hi"
          ? "कृपया निर्दिष्ट करें"
          : "Please specify"
      }
      value={existingForm.owner_cadre_activity_other || ''}
      onChangeText={(v) =>
        update({ owner_cadre_activity_other: v })
      }
    />
  )}
</View>

 {/* Designation in your SHG */}
<View style={styles.fieldBlock}>
  <Text style={styles.label}> {language === "hi"
      ? "आपका SHG में पद क्या है?"
      : "What is your designation in your SHG?"}</Text>
  <Text style={styles.helpText}> {language === "hi"
      ? "अपना पद चुनें"
      : "Select your designation"}</Text>

  {[
    'President',
    'Secretary',
    'Treasurer',
    'Book-Keeper',
    'Member',
  ].map((opt) => {
    const selected =
      Array.isArray(existingForm.owner_designation) &&
      existingForm.owner_designation.includes(opt);
      const optLabel = (() => {
      if (language === "hi") {
        switch (opt) {
          case 'President': return 'अध्यक्ष';
          case 'Secretary': return 'सचिव';
          case 'Treasurer': return 'कोषाध्यक्ष';
          case 'Book-Keeper': return 'पुस्तकधारी';
          case 'Member': return 'सदस्य';
          default: return opt;
        }
      } else {
        return opt;
      }
    })();

    return (
      <TouchableOpacity
        key={opt}
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}
        onPress={() => {
          let updated = [...(existingForm.owner_designation || [])];

          if (selected) {
            // remove
            updated = updated.filter((i) => i !== opt);
          } else {
            // add
            updated.push(opt);
          }

          update({ owner_designation: updated });
        }}
      >
        <View
          style={[
            styles.checkbox,
            selected && styles.checkboxChecked,
          ]}
        />
        <Text style={{ marginLeft: 8 }}>{optLabel}</Text>
      </TouchableOpacity>
    );
  })}
</View>


      {/* Special category */}
<View style={styles.fieldBlock}>
  <Text style={styles.label}>   {language === "hi"
      ? "कृपया अपनी विशेष श्रेणी निर्दिष्ट करें (यदि लागू हो)"
      : "Please specify your special category (If applicable)"}</Text>
  <Text style={styles.helpText}>
      {language === "hi"
      ? "यदि आप किसी विशेष श्रेणी से संबंधित हैं तो चुनें। यह वैकल्पिक है।"
      : "Select if you belong to any special category. This is optional."}
  </Text>

  {['Divyang', 'Widow', 'Unmarried', 'Other'].map((opt) => (
    <TouchableOpacity
      key={opt}
      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}
      onPress={() => update({ owner_special_category: opt })}
    >
      <View
        style={[
          styles.checkbox,
          existingForm.owner_special_category === opt && styles.checkboxChecked,
        ]}
      />
      <Text style={{ marginLeft: 8 }}>{language === 'hi'
      ? opt === 'Divyang'
        ? 'दिव्यांग'
        : opt === 'Widow'
        ? 'विधवा'
        : opt === 'Unmarried'
        ? 'अविवाहित'
        : 'अन्य'
      : opt}</Text>
    </TouchableOpacity>
  ))}

  {/* if user selects Other → show textbox */}
  {existingForm.owner_special_category === 'Other' && (
    <TextInput
      style={[styles.input, { marginTop: 6 }]}
        placeholder={language === 'hi' ? 'कृपया निर्दिष्ट करें' : 'Please specify'}
      value={existingForm.owner_special_category_other || ''}
      onChangeText={(v) => update({ owner_special_category_other: v })}
    />
  )}
</View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10, color: '#222' },
  fieldBlock: { marginBottom: 12 },
  label: { fontWeight: 'bold', marginBottom: 4, color: '#333' },
  helpText: { fontSize: 12, color: '#666', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgyba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', padding: 16, borderRadius: 8, backgroundColor: '#fff' },
  cancelBtn: { marginTop: 12, alignSelf: 'flex-end' },
  checkbox: {
  width: 18,
  height: 18,
  borderWidth: 1,
  borderColor: '#444',
  borderRadius: 3,
},
checkboxChecked: {
  backgroundColor: '#EE6969',
},

});
