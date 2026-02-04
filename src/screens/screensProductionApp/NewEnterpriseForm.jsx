// src/screens/epsakhi/NewEnterpriseForm.jsx
import React, { useEffect, useState,useContext } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Modal,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import gsApi from '../../api/gsApi';
import {
  getShgListForPanchayat,
  getCrpPanchayats,
  getCrpDetail,
} from '../../utils/tempStore';
import { Picker } from '@react-native-picker/picker';
import { LanguageContext } from '../../components/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';
import { getUser } from '../../utils/auth';
import { X_API_ID, X_API_KEY } from '@env';
/**
 * NewEnterpriseForm.jsx
 *
 * New flow:
 *  1) Ensure / create RecordedBeneficiary from SHG member.
 *  2) Create NewEnterprise (/api/v1/new-enterprise/).
 *  3) Update recorded_beneficiaries.enterprise_id.
 *  4) Create sub-forms:
 *     - /enterprise-types/ (enterprise type + categories)
 *     - /enterprise-training-reqs/ (form_type = "rec" for received, "req" for required)
 *     - /enterprise-media/ (form_type = "newep" for certificates + applicant signature)
 *
 * All child calls include created_by where possible.
 */

// ---------- Constants & helpers ----------

// Helper to compute age from DOB string (YYYY-MM-DD)
const computeAgeFromDob = (dobStr) => {
  if (!dobStr) return null;
  const dob = new Date(dobStr);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
};

// normalize SHG location info
function extractLocationFromShg(shg) {
  if (!shg) return null;
  const district_id = shg.districtId ?? shg.district_id ?? null;
  const block_id = shg.blockId ?? shg.block_id ?? null;
  const panchayat_id = shg.panchayatId ?? shg.panchayat_id ?? null;
  const village_id = shg.villageId ?? shg.village_id ?? null;
  const lokos_shg_code = shg.code ?? shg.shg_code ?? shg.lokos_shg_code ?? null;
  return { district_id, block_id, panchayat_id, village_id, lokos_shg_code };
}

// Android camera permission helper
const requestCameraPermissionIfNeeded = async () => {
  if (Platform.OS !== 'android') return true;

  try {
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    if (hasPermission) return true;

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'We need access to your camera.',
        buttonPositive: 'OK',
        buttonNegative: 'Cancel',
        buttonNeutral: 'Ask Me Later',
      }
    );

    return status === PermissionsAndroid.RESULTS.GRANTED;
  } catch (e) {
    console.warn('Camera permission error', e);
    return false;
  }
};

// NOTE: api.
const MULTIPART_X_API_ID = X_API_ID;
const MULTIPART_X_API_KEY = X_API_KEY;
const BASE_URL = 'http://66.116.207.88:8088';

// ---------- Enterprise Category (Parent / Child) ----------

const ENTERPRISE_TYPE_CATEGORIES = [
  {
    parent: { en: "Food Processing Sector", hi: "खाद्य प्रसंस्करण क्षेत्र" },
    children: [
      { en: "Spice manufacturing", hi: "मसाला निर्माण" },
      { en: "Pickles, preserves (murabba), papad", hi: "अचार, मुरब्बा, पापड़ निर्माण" },
      { en: "Savoury snacks, bhujiya, namkeen", hi: "नमकीन, भुजिया एवं स्नैक्स निर्माण" },
      { en: "Instant mixes (idli mix, gram flour mix, kheer mix)", hi: "इंस्टेंट मिक्स (इडली मिक्स, बेसन मिक्स, खीर मिक्स)" },
      { en: "Bakery items (cookies, cake, bread)", hi: "बेकरी उत्पाद (कुकीज़, केक, ब्रेड)" },
      { en: "Millet-based products (jowar, bajra, cookies, snacks)", hi: "श्रीधान्य आधारित उत्पाद (ज्वार, बाजरा, कुकीज़, स्नैक्स)" },
      { en: "Cold-pressed oils (mustard/sesame)", hi: "कोल्ड-प्रेस्ड तेल (सरसों/तिल)" },
      { en: "Honey processing", hi: "शहद प्रसंस्करण" },
      { en: "Jam–jelly–squash", hi: "जैम, जेली एवं स्क्वैश निर्माण" },
      { en: "Ready-to-eat products", hi: "तत्काल उपभोग हेतु तैयार खाद्य उत्पाद" },
      { en: "Jaggery Production", hi: "गुड़ उत्पादन" },
      { en: "Whole grain/pulses/flour sorting–grading–packaging unit", hi: "अनाज/दाल/आटा छंटाई, ग्रेडिंग एवं पैकेजिंग इकाई" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Handicraft & Artisan Sector", hi: "हस्तशिल्प एवं कारीगर क्षेत्र" },
    children: [
      { en: "Zari and zardozi work", hi: "जरी एवं जरदोज़ी कार्य" },
      { en: "Chikankari embroidery", hi: "चिकनकारी कढ़ाई" },
      { en: "Woodwork", hi: "लकड़ी का काम" },
      { en: "Terracotta / clay products", hi: "टेराकोटा / मिट्टी के उत्पाद" },
      { en: "Bamboo / cane craft", hi: "बांस / केन शिल्प" },
      { en: "Handmade jewellery", hi: "हस्तनिर्मित आभूषण" },
      { en: "Handmade candles", hi: "हस्तनिर्मित मोमबत्ती" },
      { en: "Crochet / woollen products", hi: "क्रोशिया / ऊनी उत्पाद" },
      { en: "Paper craft, greeting cards", hi: "पेपर क्राफ्ट, ग्रीटिंग कार्ड" },
      { en: "Handbags, jute bags, embroidered bags", hi: "हैंडबैग, जूट बैग, कढ़ाई वाले बैग" },
      { en: "Ration/vegetable/shopping bags (non-woven alternatives)", hi: "राशन/सब्ज़ी/शॉपिंग बैग (नॉन-वूवन विकल्प)" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Textile & Apparel Sector", hi: "वस्त्र एवं परिधान क्षेत्र" },
    children: [
      { en: "Boutique unit (stitching–cutting–embellishment)", hi: "बुटीक इकाई (सिलाई–काटाई–सजावट)" },
      { en: "School uniform stitching unit", hi: "स्कूल यूनिफॉर्म सिलाई इकाई" },
      { en: "Ladies’ garments", hi: "महिला परिधान" },
      { en: "Bedsheet/quilt/pillow cover unit", hi: "बेडशीट/रजाई/तकिया कवर इकाई" },
      { en: "ODOP textile-based products", hi: "ओडीओपी वस्त्र आधारित उत्पाद" },
      { en: "Home linen (curtains, table cloth, sofa covers)", hi: "होम लिनन (परदे, टेबल क्लॉथ, सोफ़ा कवर)" },
      { en: "Jute/cotton carry bags", hi: "जूट/कॉटन कैरी बैग" },
      { en: "Mask/apron/hospital gown manufacturing", hi: "मास्क/एप्रन/हॉस्पिटल गाउन निर्माण" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Agriculture & Allied Sector", hi: "कृषि एवं संबद्ध क्षेत्र" },
    children: [
      { en: "Vegetable cultivation and group supply", hi: "सब्ज़ी उत्पादन एवं समूह आपूर्ति" },
      { en: "Flower cultivation (marigold, rose)", hi: "फूलों की खेती (गेंदा, गुलाब)" },
      { en: "Mushroom production", hi: "मशरूम उत्पादन" },
      { en: "Nursery (fruit/flower/vegetable saplings)", hi: "नर्सरी (फल/फूल/सब्ज़ी के पौधे)" },
      { en: "Beekeeping (honey production)", hi: "मधुमक्खी पालन (शहद उत्पादन)" },
      { en: "Organic manure/vermi-compost", hi: "जैविक खाद / वर्मी कम्पोस्ट" },
      { en: "Animal feed unit", hi: "पशु आहार इकाई" },
      { en: "Mini mill (flour/pulse grinding)", hi: "मिनी मिल (आटा/दाल पीसने की इकाई)" },
      { en: "Fruit–vegetable dehydration unit", hi: "फल–सब्ज़ी निर्जलीकरण इकाई" },
      { en: "Fish farming", hi: "मछली पालन" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Dairy & Animal Husbandry Sector", hi: "डेयरी एवं पशुपालन क्षेत्र" },
    children: [
      { en: "Dairy unit (2–10 cows/buffaloes)", hi: "डेयरी इकाई (2–10 गाय/भैंस)" },
      { en: "Milk collection centre", hi: "दूध संग्रह केंद्र" },
      { en: "Paneer/khoya/curd/ghee manufacturing", hi: "पनीर/खोया/दही/घी निर्माण" },
      { en: "Goat rearing", hi: "बकरी पालन" },
      { en: "Poultry unit (egg/broiler)", hi: "पोल्ट्री इकाई (अंडा/ब्रॉइलर)" },
      { en: "Pig rearing (in specific areas)", hi: "सुअर पालन (विशेष क्षेत्रों में)" },
      { en: "Fodder production", hi: "चारा उत्पादन" },
      { en: "Milk packaging and branding unit", hi: "दूध पैकेजिंग और ब्रांडिंग इकाई" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Beauty, Wellness & Personal Services", hi: "सौंदर्य, स्वास्थ्य एवं व्यक्तिगत सेवाएँ" },
    children: [
      { en: "Beauty parlour", hi: "ब्यूटी पार्लर" },
      { en: "Mehndi (henna) training and services", hi: "मेहंदी (हिना) प्रशिक्षण और सेवाएँ" },
      { en: "Spa / therapy unit", hi: "स्पा / थेरेपी इकाई" },
      { en: "Home-care services (home nursing, baby care training)", hi: "होम-केयर सेवाएँ (नर्सिंग, शिशु देखभाल प्रशिक्षण)" },
      { en: "Mobile salon / village-based services", hi: "मोबाइल सैलून / ग्राम आधारित सेवाएँ" },
      { en: "Fitness group / yoga classes", hi: "फिटनेस समूह / योग कक्षाएँ" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Retail & Micro Trading Sector", hi: "खुदरा एवं सूक्ष्म व्यापार क्षेत्र" },
    children: [
      { en: "Grocery/provision store", hi: "किराना / जनरल स्टोर" },
      { en: "Stationery / general store", hi: "स्टेशनरी / जनरल स्टोर" },
      { en: "Group sale of vegetables/fruits", hi: "फल-सब्ज़ी समूह बिक्री" },
      { en: "Fast food cart", hi: "फास्ट फूड ठेला" },
      { en: "Mobile recharge shop / bill payment kiosk", hi: "मोबाइल रिचार्ज / बिल भुगतान केंद्र" },
      { en: "Jan Aushadhi/Medical Store", hi: "जन औषधि / मेडिकल स्टोर" },
      { en: "PET Shop and disposable alternatives distribution", hi: "पीईटी शॉप और डिस्पोज़ेबल विकल्प वितरण" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Cleaning & Hygiene Products Sector", hi: "सफाई और स्वच्छता उत्पाद क्षेत्र" },
    children: [
      { en: "Phenyl/detergent manufacturing", hi: "फेनॉल/डिटर्जेंट निर्माण" },
      { en: "Liquid handwash", hi: "लिक्विड हैंडवॉश" },
      { en: "Sanitizer", hi: "सैनिटाइज़र" },
      { en: "Incense sticks and dhoop sticks", hi: "अगरबत्ती और धूप स्टिक" },
      { en: "Napkin / sanitary pad unit", hi: "नैपकिन / सैनिटरी पैड इकाई" },
      { en: "Biodegradable plate and bowl manufacturing", hi: "बायोडिग्रेडेबल प्लेट और कटोरा निर्माण" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Packaging & Utility Products Sector", hi: "पैकेजिंग और उपयोगिता उत्पाद क्षेत्र" },
    children: [
      { en: "Paper bag unit", hi: "पेपर बैग इकाई" },
      { en: "Jute bag unit", hi: "जूट बैग इकाई" },
      { en: "Box manufacturing", hi: "बॉक्स निर्माण" },
      { en: "Recycled paper packaging unit", hi: "रीसाइकल पेपर पैकेजिंग इकाई" },
      { en: "Food-grade packaging", hi: "फूड-ग्रेड पैकेजिंग" },
      { en: "FMCG-(Handwash/Soap/Floor Cleaner, etc)", hi: "एफएमसीजी-(हैंडवॉश/साबुन/फ्लोर क्लीनर आदि)" },
      { en: "Transport-(Taxi/Auto/E-Rikshaw,etc)", hi: "परिवहन-(टैक्सी/ऑटो/ई-रिक्शा आदि)" },
      { en: "Machinery", hi: "मशीनरी" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "FMCG", hi: "एफएमसीजी" },
    children: [
      { en: "Handwash", hi: "हैंडवॉश" },
      { en: "Soap", hi: "साबुन" },
      { en: "Floor Cleaner", hi: "फ्लोर क्लीनर" },
      { en: "Detergents", hi: "डिटर्जेंट" },
      { en: "Air fresheners", hi: "एयर फ्रेशनर" },
      { en: "Face wash & creams", hi: "फेस वॉश और क्रीम" },
      { en: "Shampoo & conditioner", hi: "शैम्पू और कंडीशनर" },
      { en: "Sponges", hi: "स्पॉन्ज़" },
      { en: "Toothpaste & toothbrushes", hi: "टूथपेस्ट और टूथब्रश" },
      { en: "Broom", hi: "झाड़ू" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Transport", hi: "परिवहन" },
    children: [
      { en: "Loader", hi: "लोडर" },
      { en: "E-Rikshaw", hi: "ई-रिक्शा" },
      { en: "Taxi", hi: "टैक्सी" },
      { en: "Auto", hi: "ऑटो" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Prerna Canteen", hi: "प्रेरणा कैंटीन" },
    children: [],
  },
  {
    parent: { en: "Digital & Service Sector", hi: "डिजिटल एवं सेवा क्षेत्र" },
    children: [
      { en: "Data entry / digital services", hi: "डेटा एंट्री / डिजिटल सेवाएँ" },
      { en: "CSC (Common Service Center) operations", hi: "सीएससी संचालन" },
      { en: "Online product sales (e-commerce)", hi: "ऑनलाइन उत्पाद बिक्री (ई-कॉमर्स)" },
      { en: "SHG product branding", hi: "श्रमिक समूह उत्पाद ब्रांडिंग" },
      { en: "Social media management for local shops", hi: "स्थानीय दुकानों के लिए सोशल मीडिया प्रबंधन" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Solid Waste & Green Sector", hi: "ठोस अपशिष्ट एवं हरित क्षेत्र" },
    children: [
      { en: "Plastic waste sorting", hi: "प्लास्टिक अपशिष्ट छंटाई" },
      { en: "Fuel/briquettes from waste", hi: "कचरे से ईंधन / ब्रिकट्स" },
      { en: "Composting unit", hi: "कम्पोस्टिंग इकाई" },
      { en: "Recycled paper products", hi: "रीसाइकल पेपर उत्पाद" },
      { en: "E-waste collection micro centre", hi: "ई-वेस्ट संग्रह सूक्ष्म केंद्र" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Construction & Fabrication Micro Enterprises", hi: "निर्माण एवं निर्माण सूक्ष्म उद्यम" },
    children: [
      { en: "Brick and tiles cleaning/polishing unit", hi: "ईंट और टाइल्स सफाई/पॉलिशिंग इकाई" },
      { en: "Interior decoration (fabric, flowers, décor)", hi: "अंतरिक सजावट (कपड़ा, फूल, सजावट)" },
      { en: "Painting/plumbing/carpentry group", hi: "पेंटिंग/प्लंबिंग/कारपेंट्री समूह" },
      { en: "POP artwork / wall decoration", hi: "पीओपी कला / दीवार सजावट" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "EDP | Entrepreneurship Development Programme", hi: "ईडीपी | उद्यमिता विकास कार्यक्रम" },
    children: [],
  },
];


const ENTERPRISE_TYPE_OTHER_PARENT_KEY = {
  en: 'Other',
  hi: 'अन्य',
};
// ---------- Training Sectors (Parent / Child) ----------

const TRAINING_SECTORS = [
  // {
  //   parent: 'Agriculture and Allied Activities',
  //   children: [
  //     'Organic Farming',
  //     'Dairy Farming',
  //     'Poultry Farming',
  //     'Mushroom Cultivation',
  //     'Beekeeping and Honey Production',
  //     'Goat Rearing',
  //     'Vermicomposting',
  //     'Fish Farming',
  //     'Floriculture (Flower Cultivation)',
  //     'Medicinal Plant Cultivation',
  //     'Organic Fertilizer Production',
  //     'Ayurvedic Medicine Manufacturing',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Food Processing and Snacks Business',
  //   children: [
  //     'Pickle and Papad Making',
  //     'Bakery and Cake Production',
  //     'Spice Powder Making',
  //     'Flour Mill',
  //     'Dairy Product Manufacturing (Paneer, Ghee)',
  //     'Ready-to-Eat Food Preparation',
  //     'Herbal Tea Manufacturing',
  //     'Jam and Jelly Production',
  //     'Frozen Food Business',
  //     'Edible Oil Extraction',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Handicrafts and Traditional Skills',
  //   children: [
  //     'Banarasi Saree Weaving',
  //     'Chikankari Embroidery',
  //     'Wooden Handicrafts',
  //     'Terracotta Pottery',
  //     'Jute Bag Manufacturing',
  //     'Handmade Jewelry',
  //     'Toy Manufacturing',
  //     'Paper Mache Art',
  //     'Bamboo Craft',
  //     'Leather Product Manufacturing',
  //     'Handloom Weaving Cooperative Society',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Service-Based Businesses',
  //   children: [
  //     'Catering Service',
  //     'Tailoring and Garment Making',
  //     'Event Decoration',
  //     'Beautician and Salon',
  //     'Coaching Classes',
  //     'Mobile Repairing',
  //     'Home Cleaning Services',
  //     'Photography Studio',
  //     'Cyber Café',
  //     'Wedding Planning',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Waste Management and Eco-Friendly Ventures',
  //   children: [
  //     'Paper Bag Manufacturing',
  //     'Cloth Bag Manufacturing',
  //     'Plastic Recycling',
  //     'E-waste Recycling',
  //     'Compost Manufacturing',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'FMCG',
  //   children: [
  //     'Handwash',
  //     'Soap',
  //     'Floor Cleaner',
  //     'Detergents',
  //     'Air fresheners',
  //     'Face wash & creams',
  //     'Shampoo & conditioner',
  //     'Sponges',
  //     'Toothpaste & toothbrushes',
  //     'Others',
  //   ],
  // },
  //  {
  //   parent: 'Transport',
  //   children: [
  //     'Loader',
  //     'E-Rikshaw',
  //     'Taxi',
  //     'Auto',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Prerna Canteen',
  //   children: [
  //   ],
  // },
  // {
  //   parent: 'Government Assisted Enterprises',
  //   children: [
  //     'Solar Lamp Assembly',
  //     'Rural Tourism and Homestay',
  //     'Organic Fertilizer Production',
  //     'Ayurvedic Medicine Manufacturing',
  //     'Handloom Weaving Cooperative Society',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Home and Personal Care Products',
  //   children: [
  //     'Candle Manufacturing',
  //     'Incense Stick Making',
  //     'Soap and Detergent Manufacturing',
  //     'Bindi and Nail Polish Manufacturing',
  //     'Herbal Shampoo and Cosmetic Products',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Low-Scale Production',
  //   children: [
  //     'Paper Plate and Cup Manufacturing',
  //     'LED Bulb Assembly',
  //     'Stationery Production',
  //     'Environment-Friendly Disposable Cutlery',
  //     'Chalk and Whiteboard Marker Manufacturing',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Textile and Apparel Business',
  //   children: [
  //     'Wool Weaving and Sweater Production',
  //     'Bedsheet and Curtain Stitching',
  //     'T-shirt Printing',
  //     'School Uniform Manufacturing',
  //     'Handloom Carpet Weaving',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Animal Husbandry and Agri-Based Enterprises',
  //   children: [
  //     'Pig Rearing',
  //     'Emu Farming',
  //     'Duck Rearing',
  //     'Organic Fruit and Vegetable Farming',
  //     'Poultry Egg Incubation',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'E-commerce and Online Business',
  //   children: [
  //     'Online Handicraft Selling',
  //     'Home-Based Bakery on Food Delivery Platforms',
  //     'Dropshipping Business',
  //     'Print-on-Demand T-shirts',
  //     'YouTube Channel (DIY or Tutorials)',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Renewable Energy and Environment-Friendly Enterprises',
  //   children: [
  //     'Solar Panel Installation Services',
  //     'Bio-Gas Plant Setup',
  //     'Electric Vehicle Charging Station',
  //     'Waste Paper Recycling',
  //     'Bamboo Toothbrush and Cutlery Manufacturing',
  //     'Solar Lamp Assembly',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Tourism and Local Experience Businesses',
  //   children: [
  //     'Homestays for Tourists',
  //     'Heritage Walk Guide Services',
  //     'Rural Adventure Camps',
  //     'Boat Tours on Ganges',
  //     'Organic Farm Tour Business',
  //     'Rural Tourism and Homestay',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'EDP|Entrepreneurship Development Programme',
  //   children: [
  //   ],
  // },
  // {
  //   parent: 'Transport and Logistics Business',
  //   children: [
  //     'E-rickshaw Rental Service',
  //     'Pack and Move Services',
  //     'Small Courier Delivery Service',
  //     'Bike Rental Business',
  //     'Agricultural Equipment Rental Service',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Miscellaneous and Innovative Businesses',
  //   children: [
  //     'Toy Library for Children',
  //     'DIY Craft Kit Shop and Classes',
  //     'Community Kitchen',
  //     'Custom Gift Box Manufacturing',
  //     'Pet Grooming Services',
  //     'Digital Marketing for Local Businesses',
  //     'Document and Resume Writing Services',
  //     'Resale of Used Goods',
  //     'Organic Soap Manufacturing Kit Shop',
  //     'Wedding Invitation Card Designing',
  //     'Others',
  //   ],
  // },

   {
    parent: { en: "Food Processing Sector", hi: "खाद्य प्रसंस्करण क्षेत्र" },
    children: [
      { en: "Spice manufacturing", hi: "मसाला निर्माण" },
      { en: "Pickles, preserves (murabba), papad", hi: "अचार, मुरब्बा, पापड़ निर्माण" },
      { en: "Savoury snacks, bhujiya, namkeen", hi: "नमकीन, भुजिया एवं स्नैक्स निर्माण" },
      { en: "Instant mixes (idli mix, gram flour mix, kheer mix)", hi: "इंस्टेंट मिक्स (इडली मिक्स, बेसन मिक्स, खीर मिक्स)" },
      { en: "Bakery items (cookies, cake, bread)", hi: "बेकरी उत्पाद (कुकीज़, केक, ब्रेड)" },
      { en: "Millet-based products (jowar, bajra, cookies, snacks)", hi: "श्रीधान्य आधारित उत्पाद (ज्वार, बाजरा, कुकीज़, स्नैक्स)" },
      { en: "Cold-pressed oils (mustard/sesame)", hi: "कोल्ड-प्रेस्ड तेल (सरसों/तिल)" },
      { en: "Honey processing", hi: "शहद प्रसंस्करण" },
      { en: "Jam–jelly–squash", hi: "जैम, जेली एवं स्क्वैश निर्माण" },
      { en: "Ready-to-eat products", hi: "तत्काल उपभोग हेतु तैयार खाद्य उत्पाद" },
      { en: "Jaggery Production", hi: "गुड़ उत्पादन" },
      { en: "Whole grain/pulses/flour sorting–grading–packaging unit", hi: "अनाज/दाल/आटा छंटाई, ग्रेडिंग एवं पैकेजिंग इकाई" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Handicraft & Artisan Sector", hi: "हस्तशिल्प एवं कारीगर क्षेत्र" },
    children: [
      { en: "Zari and zardozi work", hi: "जरी एवं जरदोज़ी कार्य" },
      { en: "Chikankari embroidery", hi: "चिकनकारी कढ़ाई" },
      { en: "Woodwork", hi: "लकड़ी का काम" },
      { en: "Terracotta / clay products", hi: "टेराकोटा / मिट्टी के उत्पाद" },
      { en: "Bamboo / cane craft", hi: "बांस / केन शिल्प" },
      { en: "Handmade jewellery", hi: "हस्तनिर्मित आभूषण" },
      { en: "Handmade candles", hi: "हस्तनिर्मित मोमबत्ती" },
      { en: "Crochet / woollen products", hi: "क्रोशिया / ऊनी उत्पाद" },
      { en: "Paper craft, greeting cards", hi: "पेपर क्राफ्ट, ग्रीटिंग कार्ड" },
      { en: "Handbags, jute bags, embroidered bags", hi: "हैंडबैग, जूट बैग, कढ़ाई वाले बैग" },
      { en: "Ration/vegetable/shopping bags (non-woven alternatives)", hi: "राशन/सब्ज़ी/शॉपिंग बैग (नॉन-वूवन विकल्प)" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Textile & Apparel Sector", hi: "वस्त्र एवं परिधान क्षेत्र" },
    children: [
      { en: "Boutique unit (stitching–cutting–embellishment)", hi: "बुटीक इकाई (सिलाई–काटाई–सजावट)" },
      { en: "School uniform stitching unit", hi: "स्कूल यूनिफॉर्म सिलाई इकाई" },
      { en: "Ladies’ garments", hi: "महिला परिधान" },
      { en: "Bedsheet/quilt/pillow cover unit", hi: "बेडशीट/रजाई/तकिया कवर इकाई" },
      { en: "ODOP textile-based products", hi: "ओडीओपी वस्त्र आधारित उत्पाद" },
      { en: "Home linen (curtains, table cloth, sofa covers)", hi: "होम लिनन (परदे, टेबल क्लॉथ, सोफ़ा कवर)" },
      { en: "Jute/cotton carry bags", hi: "जूट/कॉटन कैरी बैग" },
      { en: "Mask/apron/hospital gown manufacturing", hi: "मास्क/एप्रन/हॉस्पिटल गाउन निर्माण" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Agriculture & Allied Sector", hi: "कृषि एवं संबद्ध क्षेत्र" },
    children: [
      { en: "Vegetable cultivation and group supply", hi: "सब्ज़ी उत्पादन एवं समूह आपूर्ति" },
      { en: "Flower cultivation (marigold, rose)", hi: "फूलों की खेती (गेंदा, गुलाब)" },
      { en: "Mushroom production", hi: "मशरूम उत्पादन" },
      { en: "Nursery (fruit/flower/vegetable saplings)", hi: "नर्सरी (फल/फूल/सब्ज़ी के पौधे)" },
      { en: "Beekeeping (honey production)", hi: "मधुमक्खी पालन (शहद उत्पादन)" },
      { en: "Organic manure/vermi-compost", hi: "जैविक खाद / वर्मी कम्पोस्ट" },
      { en: "Animal feed unit", hi: "पशु आहार इकाई" },
      { en: "Mini mill (flour/pulse grinding)", hi: "मिनी मिल (आटा/दाल पीसने की इकाई)" },
      { en: "Fruit–vegetable dehydration unit", hi: "फल–सब्ज़ी निर्जलीकरण इकाई" },
      { en: "Fish farming", hi: "मछली पालन" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Dairy & Animal Husbandry Sector", hi: "डेयरी एवं पशुपालन क्षेत्र" },
    children: [
      { en: "Dairy unit (2–10 cows/buffaloes)", hi: "डेयरी इकाई (2–10 गाय/भैंस)" },
      { en: "Milk collection centre", hi: "दूध संग्रह केंद्र" },
      { en: "Paneer/khoya/curd/ghee manufacturing", hi: "पनीर/खोया/दही/घी निर्माण" },
      { en: "Goat rearing", hi: "बकरी पालन" },
      { en: "Poultry unit (egg/broiler)", hi: "पोल्ट्री इकाई (अंडा/ब्रॉइलर)" },
      { en: "Pig rearing (in specific areas)", hi: "सुअर पालन (विशेष क्षेत्रों में)" },
      { en: "Fodder production", hi: "चारा उत्पादन" },
      { en: "Milk packaging and branding unit", hi: "दूध पैकेजिंग और ब्रांडिंग इकाई" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Beauty, Wellness & Personal Services", hi: "सौंदर्य, स्वास्थ्य एवं व्यक्तिगत सेवाएँ" },
    children: [
      { en: "Beauty parlour", hi: "ब्यूटी पार्लर" },
      { en: "Mehndi (henna) training and services", hi: "मेहंदी (हिना) प्रशिक्षण और सेवाएँ" },
      { en: "Spa / therapy unit", hi: "स्पा / थेरेपी इकाई" },
      { en: "Home-care services (home nursing, baby care training)", hi: "होम-केयर सेवाएँ (नर्सिंग, शिशु देखभाल प्रशिक्षण)" },
      { en: "Mobile salon / village-based services", hi: "मोबाइल सैलून / ग्राम आधारित सेवाएँ" },
      { en: "Fitness group / yoga classes", hi: "फिटनेस समूह / योग कक्षाएँ" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Retail & Micro Trading Sector", hi: "खुदरा एवं सूक्ष्म व्यापार क्षेत्र" },
    children: [
      { en: "Grocery/provision store", hi: "किराना / जनरल स्टोर" },
      { en: "Stationery / general store", hi: "स्टेशनरी / जनरल स्टोर" },
      { en: "Group sale of vegetables/fruits", hi: "फल-सब्ज़ी समूह बिक्री" },
      { en: "Fast food cart", hi: "फास्ट फूड ठेला" },
      { en: "Mobile recharge shop / bill payment kiosk", hi: "मोबाइल रिचार्ज / बिल भुगतान केंद्र" },
      { en: "Jan Aushadhi/Medical Store", hi: "जन औषधि / मेडिकल स्टोर" },
      { en: "PET Shop and disposable alternatives distribution", hi: "पीईटी शॉप और डिस्पोज़ेबल विकल्प वितरण" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Cleaning & Hygiene Products Sector", hi: "सफाई और स्वच्छता उत्पाद क्षेत्र" },
    children: [
      { en: "Phenyl/detergent manufacturing", hi: "फेनॉल/डिटर्जेंट निर्माण" },
      { en: "Liquid handwash", hi: "लिक्विड हैंडवॉश" },
      { en: "Sanitizer", hi: "सैनिटाइज़र" },
      { en: "Incense sticks and dhoop sticks", hi: "अगरबत्ती और धूप स्टिक" },
      { en: "Napkin / sanitary pad unit", hi: "नैपकिन / सैनिटरी पैड इकाई" },
      { en: "Biodegradable plate and bowl manufacturing", hi: "बायोडिग्रेडेबल प्लेट और कटोरा निर्माण" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Packaging & Utility Products Sector", hi: "पैकेजिंग और उपयोगिता उत्पाद क्षेत्र" },
    children: [
      { en: "Paper bag unit", hi: "पेपर बैग इकाई" },
      { en: "Jute bag unit", hi: "जूट बैग इकाई" },
      { en: "Box manufacturing", hi: "बॉक्स निर्माण" },
      { en: "Recycled paper packaging unit", hi: "रीसाइकल पेपर पैकेजिंग इकाई" },
      { en: "Food-grade packaging", hi: "फूड-ग्रेड पैकेजिंग" },
      { en: "FMCG-(Handwash/Soap/Floor Cleaner, etc)", hi: "एफएमसीजी-(हैंडवॉश/साबुन/फ्लोर क्लीनर आदि)" },
      { en: "Transport-(Taxi/Auto/E-Rikshaw,etc)", hi: "परिवहन-(टैक्सी/ऑटो/ई-रिक्शा आदि)" },
      { en: "Machinery", hi: "मशीनरी" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "FMCG", hi: "एफएमसीजी" },
    children: [
      { en: "Handwash", hi: "हैंडवॉश" },
      { en: "Soap", hi: "साबुन" },
      { en: "Floor Cleaner", hi: "फ्लोर क्लीनर" },
      { en: "Detergents", hi: "डिटर्जेंट" },
      { en: "Air fresheners", hi: "एयर फ्रेशनर" },
      { en: "Face wash & creams", hi: "फेस वॉश और क्रीम" },
      { en: "Shampoo & conditioner", hi: "शैम्पू और कंडीशनर" },
      { en: "Sponges", hi: "स्पॉन्ज़" },
      { en: "Toothpaste & toothbrushes", hi: "टूथपेस्ट और टूथब्रश" },
      { en: "Broom", hi: "झाड़ू" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Transport", hi: "परिवहन" },
    children: [
      { en: "Loader", hi: "लोडर" },
      { en: "E-Rikshaw", hi: "ई-रिक्शा" },
      { en: "Taxi", hi: "टैक्सी" },
      { en: "Auto", hi: "ऑटो" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Prerna Canteen", hi: "प्रेरणा कैंटीन" },
    children: [],
  },
  {
    parent: { en: "Digital & Service Sector", hi: "डिजिटल एवं सेवा क्षेत्र" },
    children: [
      { en: "Data entry / digital services", hi: "डेटा एंट्री / डिजिटल सेवाएँ" },
      { en: "CSC (Common Service Center) operations", hi: "सीएससी संचालन" },
      { en: "Online product sales (e-commerce)", hi: "ऑनलाइन उत्पाद बिक्री (ई-कॉमर्स)" },
      { en: "SHG product branding", hi: "श्रमिक समूह उत्पाद ब्रांडिंग" },
      { en: "Social media management for local shops", hi: "स्थानीय दुकानों के लिए सोशल मीडिया प्रबंधन" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Solid Waste & Green Sector", hi: "ठोस अपशिष्ट एवं हरित क्षेत्र" },
    children: [
      { en: "Plastic waste sorting", hi: "प्लास्टिक अपशिष्ट छंटाई" },
      { en: "Fuel/briquettes from waste", hi: "कचरे से ईंधन / ब्रिकट्स" },
      { en: "Composting unit", hi: "कम्पोस्टिंग इकाई" },
      { en: "Recycled paper products", hi: "रीसाइकल पेपर उत्पाद" },
      { en: "E-waste collection micro centre", hi: "ई-वेस्ट संग्रह सूक्ष्म केंद्र" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "Construction & Fabrication Micro Enterprises", hi: "निर्माण एवं निर्माण सूक्ष्म उद्यम" },
    children: [
      { en: "Brick and tiles cleaning/polishing unit", hi: "ईंट और टाइल्स सफाई/पॉलिशिंग इकाई" },
      { en: "Interior decoration (fabric, flowers, décor)", hi: "अंतरिक सजावट (कपड़ा, फूल, सजावट)" },
      { en: "Painting/plumbing/carpentry group", hi: "पेंटिंग/प्लंबिंग/कारपेंट्री समूह" },
      { en: "POP artwork / wall decoration", hi: "पीओपी कला / दीवार सजावट" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: { en: "EDP | Entrepreneurship Development Programme", hi: "ईडीपी | उद्यमिता विकास कार्यक्रम" },
    children: [],
  },
];
const TRAINING_OTHER_PARENT_KEY = {
  en: 'Other',
  hi: 'अन्य',
};

// representation of multi-select value:
// {
//   [parentName]: {
//      selected: boolean,
//      children: { [childName]: boolean },
//      otherText?: string
//   },
//   [SPECIAL_OTHER_PARENT_KEY]: { selected, otherText }
// }

// encode to requested text: parentCSV, dictString "[Parent: child1, child2], [Parent2: childX]"
const encodeParentChildSelection = (selection) => {
  const parentNames = [];
  const dictParts = [];

  Object.entries(selection || {}).forEach(([parent, obj]) => {
    if (!obj || !obj.selected) return;

    parentNames.push(parent);

    const childNames = [];
    Object.entries(obj.children || {}).forEach(([child, checked]) => {
      if (!checked) return;
      if (child === 'Others') {
        if (obj.otherText && obj.otherText.trim()) {
          childNames.push(obj.otherText.trim());
        }
      } else {
        childNames.push(child);
      }
    });

    if (parent === ENTERPRISE_TYPE_OTHER_PARENT_KEY || parent === TRAINING_OTHER_PARENT_KEY) {
      if (obj.otherText && obj.otherText.trim()) {
        childNames.push(obj.otherText.trim());
      }
    }

    const inner = childNames.length ? childNames.join(', ') : '';
    dictParts.push(`[${parent}: ${inner}]`);
  });

  const parentCSV = parentNames.join(', ');
  const dictString = dictParts.join(', ');
  return { parentCSV, dictString };
};

// small Yes/No control
const YesNoToggle = ({ value, onChange,language }) => (
  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
    <TouchableOpacity
      style={[styles.smallBtn, value === 'Yes' && { backgroundColor: '#EE6969' }]}
      onPress={() => onChange('Yes')}
    >
      <Text style={{ color: value === 'Yes' ? '#fff' : '#333', fontWeight: '600' }}> {language === 'hi' ? 'हाँ' : 'Yes'}</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.smallBtn, value === 'No' && { backgroundColor: '#EE6969' }]}
      onPress={() => onChange('No')}
    >
      <Text style={{ color: value === 'No' ? '#fff' : '#333', fontWeight: '600' }}>    {language === 'hi' ? 'नहीं' : 'No'}</Text>
    </TouchableOpacity>
  </View>
);

// Generic Parent / Child multi-select block
const ParentChildMultiSelect = ({
  title,
  description,
  items,
  value,
  onChange,
  otherParentKey,
}) => {
  // ensure structure is safe
  const ensureParentObj = (parent) => {
    return value && value[parent]
      ? value[parent]
      : { selected: false, children: {}, otherText: '' };
  };

  const toggleParent = (parent) => {
    const current = ensureParentObj(parent);
    const updated = {
      ...current,
      selected: !current.selected,
    };
    onChange({
      ...(value || {}),
      [parent]: updated,
    });
  };

  const toggleChild = (parent, child) => {
    const current = ensureParentObj(parent);
    const children = { ...(current.children || {}) };
    children[child] = !children[child];
    const updated = { ...current, children };
    onChange({
      ...(value || {}),
      [parent]: updated,
    });
  };

  const setOtherText = (parent, text) => {
    const current = ensureParentObj(parent);
    const updated = { ...current, otherText: text };
    onChange({
      ...(value || {}),
      [parent]: updated,
    });
  };

  const list = [...items];
  if (otherParentKey) {
    list.push({ parent: otherParentKey, children: ['Others'] });
  }

  return (
    <View style={{ marginTop: 10 }}>
      {title ? <Text style={styles.label}>{title}</Text> : null}
      {description ? (
        <Text style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
          {description}
        </Text>
      ) : null}

      {list.map(({ parent, children }) => {
        const po = ensureParentObj(parent);
        const showChildren = po.selected;

        return (
          <View key={parent} style={{ marginBottom: 8 }}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => toggleParent(parent)}
            >
              <View
                style={[
                  styles.checkbox,
                  po.selected && styles.checkboxChecked,
                ]}
              />
              <Text style={styles.checkboxLabel}>{parent}</Text>
            </TouchableOpacity>

            {showChildren && Array.isArray(children) && (
              <View style={{ paddingLeft: 26 }}>
                {children.map((child) => (
                  <View key={child} style={{ marginBottom: 4 }}>
                    {child === 'Others' ? (
                      <>
                        <TextInput
                          style={[styles.input, { marginTop: 4 }]}
                          placeholder="Others (please specify)"
                          value={po.otherText}
                          onChangeText={(t) => setOtherText(parent, t)}
                        />
                      </>
                    ) : (
                      <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => toggleChild(parent, child)}
                      >
                        <View
                          style={[
                            styles.checkboxSmall,
                            po.children && po.children[child] && styles.checkboxChecked,
                          ]}
                        />
                        <Text style={styles.checkboxLabel}>{child}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

// ---------- Main component ----------

export default function NewEnterpriseForm({ route, navigation }) {
  const { language } = useContext(LanguageContext);
  const recordedBenef = route?.params?.recordedBenef || null;
  const beneficiary = route?.params?.beneficiary || null;
  const tempShg = route?.params?.tempShg || null;
  const routeCrpUserId =
    route?.params?.crpUserId ||
    route?.params?.user_id ||
    route?.params?.username ||
    null;

  const lokosShgCode =
    route?.params?.lokos_shg_code ||
    route?.params?.lokosShgCode ||
    tempShg?.code ||
    tempShg?.shg_code ||
    null;

    const [trainingReqType, setTrainingReqType] = useState([]);

  // ----------------- Form State -----------------

  const [form, setForm] = useState({
    // 1) Special category
    applicant_special_category: '',

  applicant_cadre_activity: [],   
  applicant_cadre_activity_other: '',

  applicant_cadre_designation:[],
    // 3) Preferred location (UI-level pieces)
    prefered_location_choice: '',
    prefered_location_extra: '',

    // 4) CIF
    has_shg_cif: '',
    fund_cards: [],
    cif_fund_amt: '',
    has_received_part_cif: '',

    // 5) Training received?
    is_training_received: '',

    // 6) Training required?
    is_training_required: '',

    // When training required = "No"
    nearest_skill_centre_known: '',
    nearest_skill_centre_name: '',
    skill_centre_loc: '',
    nearest_industry_known: '',
    nearest_industry_name: '',
    industry_loc: '',

    // Support Required
    mentorship_support: '',
    financial_support_type: '',
    financial_support_other_text: '',
    loan_amount_range: '',
    market_linkage_type: '',
    market_linkage_detail: '',
    is_promo_ad_req_type: '',
    is_promo_ad_req_detail: '',
    is_promo_ad_req_subtype: '',  
    infrastructure_support_type: '',
    infrastructure_support_detail: '',
    digital_emarket_support: '',
    other_support: '',

    // Declarations
    declaration_confirmed: false,
    declaration_date: '',
  });

  const [trainingReqLocationType, setTrainingReqLocationType] = useState("");

  // Enterprise type (parent/child)
  const [enterpriseTypeSelection, setEnterpriseTypeSelection] = useState({});

  // Training received rows (form_type = "rec")
  const [trainingReceivedRows, setTrainingReceivedRows] = useState([]);

  // Training required (single set, form_type = "req")
  const [trainingReqDept, setTrainingReqDept] = useState('');
  const [trainingReqSectors, setTrainingReqSectors] = useState({});
  const [trainingReqDuration, setTrainingReqDuration] = useState('');
  const [trainingReqLocationState, setTrainingReqLocationState] = useState('');
  const [trainingReqLocationDistrict, setTrainingReqLocationDistrict] = useState('');
  const [trainingReqLocationBlock, setTrainingReqLocationBlock] = useState('');
  const [trainingReqExpectedIncome, setTrainingReqExpectedIncome] = useState('');
  const [trainingReqLocationVillage, setTrainingReqLocationVillage] = useState('');

  // Files
  const [signatureAsset, setSignatureAsset] = useState(null); // applicant signature
  const [trainingCertificateAssets, setTrainingCertificateAssets] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);

  // Declaration date modal
  const [declarationDateModalVisible, setDeclarationDateModalVisible] = useState(false);
  const [declDay, setDeclDay] = useState(null);
  const [declMonth, setDeclMonth] = useState(null);
  const [declYear, setDeclYear] = useState(null);
  const currentYear = new Date().getFullYear();
  const startYear = 1950;
  const yearOptions = [];
  for (let y = currentYear; y >= startYear; y--) yearOptions.push(String(y));

  // load logged user, sync token to gsApi
  useEffect(() => {
    (async () => {
      try {
        const u = await getUser();
        if (u) {
          setLoggedUser(u);
          if (u.access) gsApi.setAuthToken?.(u.access, u.refresh);
        }
      } catch (e) {
        console.warn('Unable to load user', e);
      }
    })();
  }, []);

  // sync declaration_date into pickers if prefilled
  useEffect(() => {
    const d = form.declaration_date;
    if (!d) {
      setDeclDay(null);
      setDeclMonth(null);
      setDeclYear(null);
      return;
    }
    try {
      const isoPart = typeof d === 'string' ? d.split('T')[0] : '';
      const parts = isoPart.split('-');
      if (parts.length === 3) {
        setDeclYear(parts[0]);
        setDeclMonth(String(parseInt(parts[1], 10)));
        setDeclDay(String(parseInt(parts[2], 10)));
        return;
      }
      const dt = new Date(d);
      if (!Number.isNaN(dt.getTime())) {
        setDeclYear(String(dt.getFullYear()));
        setDeclMonth(String(dt.getMonth() + 1));
        setDeclDay(String(dt.getDate()));
      }
    } catch (e) {
      console.warn('Failed to parse declaration_date', e);
    }
  }, [form.declaration_date]);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

const addFundCard = () => {
  setForm(prev => ({
    ...prev,
    fund_cards: [
      ...prev.fund_cards,
      {
        loanType: '',
        has_received: '',
        amount: ''
      }
    ]
  }));
};
 
const getStatus = (amount, repaid) => {
  const loan = parseFloat(amount) || 0;
  const paid = parseFloat(repaid) || 0;

  // If nothing is entered and nothing paid
  if (loan === 0 && paid === 0) return 'Not Paid';

  if (paid < 0) return 'Invalid repayment';

  if (paid > loan) return 'Repayment exceeds loan amount';

  if (loan === 0 && paid > 0) return 'Invalid repayment';

  if (paid === 0) return 'Not Paid';

  if (paid === loan) return 'Fully Paid';

  return 'Partially Paid';
};

const getPending = (amount, repaid) => {
  const loan = parseFloat(amount) || 0;
  const paid = parseFloat(repaid) || 0;

  return loan - paid;
};

const getStatusColor = (amount, repaid) => {
  const loan = parseFloat(amount) || 0;
  const paid = parseFloat(repaid) || 0;

  if (paid < 0 || paid > loan) return 'red';

  if (paid === 0) return 'red';

  if (loan > 0 && paid === loan) return 'green';

  return 'orange';
};;

const getPendingColor = (pending) => {
  if (pending < 0) return 'red';
  if (pending === 0) return 'green';
  return 'red';
};

const toggleTrainingReqType = (val) => {
  setTrainingReqType((prev) =>
    prev.includes(val)
      ? prev.filter((v) => v !== val)
      : [...prev, val]
  );
};

  const getCreatedByNumeric = () => {
    const candidate =
      loggedUser?.id ??
      loggedUser?.user_id ??
      loggedUser?.pk ??
      routeCrpUserId;
    if (candidate == null) return null;
    if (typeof candidate === 'number') return candidate;
    if (typeof candidate === 'string' && /^\d+$/.test(candidate.trim())) {
      return parseInt(candidate.trim(), 10);
    }
    return null;
  };

  // ---------- Signature & certificates pickers ----------

  const pickSignatureFromGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });
      if (result.didCancel) return;
      if (result.errorCode) {
        console.warn('launchImageLibrary error', result.errorMessage || result.errorCode);
        Alert.alert('Error', 'Failed to pick image.');
        return;
      }
      const asset = result.assets && result.assets[0];
      if (asset) {
        setSignatureAsset(asset);
      }
    } catch (e) {
      console.error('pickSignatureFromGallery', e);
      Alert.alert('Error', 'Unable to pick signature.');
    }
  };

  const takeSignaturePhoto = async () => {
    try {
      const ok = await requestCameraPermissionIfNeeded();
      if (!ok) {
        Alert.alert('Permission required', 'Camera permission is required to capture signature.');
        return;
      }
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
      });
      if (result.didCancel) return;
      if (result.errorCode) {
        console.warn('launchCamera error', result.errorMessage || result.errorCode);
        Alert.alert('Error', 'Failed to capture image.');
        return;
      }
      const asset = result.assets && result.assets[0];
      if (asset) {
        setSignatureAsset(asset);
      }
    } catch (e) {
      console.error('takeSignaturePhoto', e);
      Alert.alert('Error', 'Unable to capture signature.');
    }
  };

  const pickTrainingCertificates = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'mixed',
        quality: 0.8,
        selectionLimit: 0, // multi
      });
      if (result.didCancel) return;
      if (result.errorCode) {
        console.warn('launchImageLibrary cert error', result.errorMessage || result.errorCode);
        Alert.alert('Error', 'Failed to pick files.');
        return;
      }
      const assets = result.assets || [];
      if (assets.length) {
        setTrainingCertificateAssets((prev) => [...prev, ...assets]);
      }
    } catch (e) {
      console.error('pickTrainingCertificates', e);
      Alert.alert('Error', 'Unable to pick certificates.');
    }
  };

  // ---------- SHG helper for recorded beneficiary ----------

  const findShgAcrossCachedPanchayats = async (shgCode) => {
    if (!shgCode) return null;
    try {
      if (tempShg && (tempShg.code === shgCode || tempShg.shg_code === shgCode)) {
        return extractLocationFromShg(tempShg);
      }
      const gps = getCrpPanchayats ? getCrpPanchayats() || [] : [];
      for (const gp of gps) {
        const pid = gp?.panchayat_id || gp?.panchayatId;
        if (!pid) continue;
        const cached = getShgListForPanchayat(pid) || [];
        const found = cached.find((s) => {
          const code = s.code ?? s.shg_code ?? s.lokos_shg_code ?? s.code;
          return String(code) === String(shgCode);
        });
        if (found) return extractLocationFromShg(found);
      }
      return null;
    } catch (e) {
      console.warn('findShgAcrossCachedPanchayats error', e);
      return null;
    }
  };

  // Ensure Recorded Beneficiary exists (same core logic as older file, adapted to new models)
  const ensureRecordedBeneficiary = async () => {
    let recordedBenefId =
      recordedBenef?.TH_urid ||
      recordedBenef?.TH_URID ||
      recordedBenef?.id ||
      null;

    if (recordedBenefId) return recordedBenefId;

    if (!beneficiary) {
      throw new Error(
        'Beneficiary data missing. Cannot create recorded beneficiary.'
      );
    }

    const addr =
      Array.isArray(beneficiary.member_addresses) &&
      beneficiary.member_addresses.length > 0
        ? beneficiary.member_addresses[0]
        : null;

    const phone =
      Array.isArray(beneficiary.member_phones) &&
      beneficiary.member_phones.length > 0
        ? beneficiary.member_phones[0]
        : null;

    const addressText =
      (addr?.address_line1 && String(addr.address_line1).trim()) ||
      (addr?.address_line2 && String(addr.address_line2).trim()) ||
      '';

    const age = computeAgeFromDob(beneficiary.dob);

    let district_id = addr?.district_id ?? addr?.districtId ?? null;
    let block_id = addr?.block_id ?? addr?.blockId ?? null;
    let panchayat_id = addr?.panchayat_id ?? addr?.panchayatId ?? null;
    let village_id = addr?.village_id ?? addr?.villageId ?? null;
    let member_mobile = phone?.phone_no ?? phone?.mobile ?? phone?.number ?? null;
    let marital_status = beneficiary.marital_status ?? beneficiary.maritalStatus ?? '';
    let father_husband_name =
      beneficiary.father_husband ??
      beneficiary.father_husband_name ??
      beneficiary.relation_name ??
      '';

    let lokos_shg = lokosShgCode || beneficiary.shg_code || beneficiary.lokos_shg_code || null;

    // tempShg fallback
    if ((!district_id || !block_id || !panchayat_id || !village_id || !lokos_shg) && tempShg) {
      const loc = extractLocationFromShg(tempShg);
      if (loc) {
        district_id = district_id || loc.district_id;
        block_id = block_id || loc.block_id;
        panchayat_id = panchayat_id || loc.panchayat_id;
        village_id = village_id || loc.village_id;
        lokos_shg = lokos_shg || loc.lokos_shg_code;
      }
    }

    // cached SHG lists fallback
    if ((!district_id || !block_id || !panchayat_id || !village_id || !lokos_shg) && lokos_shg) {
      const fallback = await findShgAcrossCachedPanchayats(lokos_shg);
      if (fallback) {
        district_id = district_id || fallback.district_id;
        block_id = block_id || fallback.block_id;
        panchayat_id = panchayat_id || fallback.panchayat_id;
        village_id = village_id || fallback.village_id;
        lokos_shg = lokos_shg || fallback.lokos_shg_code;
      }
    }

    // last resort: on-demand fetch from CRP block
    if ((!district_id || !block_id || !panchayat_id || !village_id) && lokos_shg) {
      try {
        const crpDetail = getCrpDetail ? getCrpDetail() : null;
        const cbid = crpDetail?.block_id ?? crpDetail?.blockId ?? null;
        if (cbid) {
          const shgRes = await gsApi.getUpsrlmShgList(cbid, { page_size: 5000 });
          const shgRows = Array.isArray(shgRes?.data)
            ? shgRes.data
            : Array.isArray(shgRes?.results)
            ? shgRes.results
            : Array.isArray(shgRes)
            ? shgRes
            : [];
          const found = shgRows.find((s) => {
            const code = s.code ?? s.shg_code ?? s.lokos_shg_code ?? s.code;
            return String(code) === String(lokos_shg);
          });
          if (found) {
            const loc = extractLocationFromShg(found);
            district_id = district_id || loc.district_id || null;
            block_id = block_id || loc.block_id || null;
            panchayat_id = panchayat_id || loc.panchayat_id || null;
            village_id = village_id || loc.village_id || null;
            lokos_shg = lokos_shg || loc.lokos_shg_code || null;
          }
        }
      } catch (e) {
        console.warn('on-demand SHG list fallback failed', e);
      }
    }

    const createdBy = getCreatedByNumeric();

    const recordedPayload = {
      lokos_member_code: beneficiary.member_code || beneficiary.nic_member_code || null,
      applicant_name: beneficiary.member_name || '',
      age,
      gender: beneficiary.gender || '',
      marital_status,
      father_husband_name,
      category: beneficiary.social_category || beneficiary.socialCategory || '',
      education: beneficiary.education || '',
      address: addressText,
      district_id: district_id || null,
      block_id: block_id || null,
      panchayat_id: panchayat_id || null,
      village_id: village_id || null,
      mobile: member_mobile || null,
      email: beneficiary.email || null,
      lokos_shg_code: lokos_shg || null,
    };

    if (createdBy !== null) {
      recordedPayload.created_by = createdBy;
    }

    const recRes = await gsApi.createRecordedBeneficiary(recordedPayload);
    recordedBenefId =
      recRes?.TH_urid || recRes?.TH_URID || recRes?.id || null;

    if (!recordedBenefId) {
      throw new Error('Recorded beneficiary created but ID missing in response.');
    }

    return recordedBenefId;
  };

  // ---------- NewEnterprise creation (multipart for signature) ----------

  const performMultipartCreateNewEnterprise = async (payloadObj, signature) => {
    const token = gsApi.getAuthToken ? gsApi.getAuthToken() : null;
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    headers['X-API-ID'] = MULTIPART_X_API_ID;
    headers['X-API-KEY'] = MULTIPART_X_API_KEY;

    const url = `${BASE_URL}/api/v1/new-enterprise/`;
    const formData = new FormData();

    Object.keys(payloadObj).forEach((k) => {
      const v = payloadObj[k];
      formData.append(k, v === null || v === undefined ? '' : String(v));
    });

    if (signature && signature.uri) {
      formData.append('applicant_signature', {
        uri: signature.uri,
        name: signature.fileName || `signature_${Date.now()}.jpg`,
        type: signature.type || 'image/jpeg',
      });
    }

    const res = await fetch(url, { method: 'POST', headers, body: formData });
    const text = await res.text();
    try {
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) throw { status: res.status, data };
      return data;
    } catch (e) {
      if (!res.ok) throw { status: res.status, data: text || null };
      return text;
    }
  };

  // ---------- Sub-form API helpers (direct fetch) ----------

  const authHeadersJson = () => {
    const token = gsApi.getAuthToken ? gsApi.getAuthToken() : null;
    const h = {
      'Content-Type': 'application/json',
      'X-API-ID': MULTIPART_X_API_ID,
      'X-API-KEY': MULTIPART_X_API_KEY,
    };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  };

  const createEnterpriseTypeRecord = async (enterpriseId) => {
    const { parentCSV, dictString } = encodeParentChildSelection(
      enterpriseTypeSelection
    );
    if (!enterpriseId || !parentCSV) return;

    const payload = {
      enterprise_id: enterpriseId,
      form_type: 'new',
      parent_category: parentCSV,
      sub_category: dictString,
    };

    const createdBy = getCreatedByNumeric();
    if (createdBy !== null) payload.created_by = createdBy;

    const res = await fetch(`${BASE_URL}/api/v1/enterprise-types/`, {
      method: 'POST',
      headers: authHeadersJson(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn('enterprise-types create failed', res.status, text);
    }
  };

  const createTrainingReceivedRows = async (enterpriseId) => {
    if (!enterpriseId) return;
    const createdBy = getCreatedByNumeric();

    for (const row of trainingReceivedRows) {
      if (!row.department) continue;

      const { parentCSV, dictString } = encodeParentChildSelection(row.sectors);
      const payload = {
        enterprise_id: enterpriseId,
        form_type: 'rec',
        department: row.department,
        sector: parentCSV || null,
        training_module_name: dictString || null,
        duration: null,
        location: null,
        expected_income: null,
      };
      if (createdBy !== null) payload.created_by = createdBy;

      const res = await fetch(`${BASE_URL}/api/v1/enterprise-training-reqs/`, {
        method: 'POST',
        headers: authHeadersJson(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        console.warn('training-rec create failed', res.status, text);
      }
    }
  };

  const createTrainingRequired = async (enterpriseId) => {
    if (!enterpriseId) return;
    if (form.is_training_required !== 'Yes') return;

    if (!trainingReqDept && !Object.keys(trainingReqSectors || {}).length) {
      // nothing meaningful
      return;
    }

    const { parentCSV, dictString } = encodeParentChildSelection(
      trainingReqSectors
    );

    const location = [
      trainingReqLocationState || '',
      trainingReqLocationDistrict || '',
      trainingReqLocationBlock || '',
    ]
      .filter(Boolean)
      .join(', ');

    const payload = {
      enterprise_id: enterpriseId,
      form_type: 'req',
      department: trainingReqDept || null,
      sector: parentCSV || null,
      training_module_name: dictString || null,
      duration: trainingReqDuration || null,
      location: location || null,
      expected_income: trainingReqExpectedIncome || null,
    };

    const createdBy = getCreatedByNumeric();
    if (createdBy !== null) payload.created_by = createdBy;

    const res = await fetch(`${BASE_URL}/api/v1/enterprise-training-reqs/`, {
      method: 'POST',
      headers: authHeadersJson(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn('training-req create failed', res.status, text);
    }
  };

  const uploadMediaFile = async (enterpriseId, fileAsset, fieldName, formType = 'newep') => {
    if (!enterpriseId || !fileAsset || !fileAsset.uri) return;

    const token = gsApi.getAuthToken ? gsApi.getAuthToken() : null;
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    headers['X-API-ID'] = MULTIPART_X_API_ID;
    headers['X-API-KEY'] = MULTIPART_X_API_KEY;

    const formData = new FormData();
    formData.append('enterprise_id', enterpriseId);
    formData.append('form_type', formType);

    const createdBy = getCreatedByNumeric();
    if (createdBy !== null) formData.append('created_by', String(createdBy));

    formData.append(fieldName, {
      uri: fileAsset.uri,
      name: fileAsset.fileName || `${fieldName}_${Date.now()}`,
      type: fileAsset.type || 'application/octet-stream',
    });

    const res = await fetch(`${BASE_URL}/api/v1/enterprise-media/`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn('enterprise-media upload failed', res.status, text);
    }
  };

  const uploadTrainingCertificatesMedia = async (enterpriseId) => {
    for (const asset of trainingCertificateAssets) {
      await uploadMediaFile(enterpriseId, asset, 'certificates', 'newep');
    }
  };

  const uploadSignatureMedia = async (enterpriseId) => {
    if (!signatureAsset || !signatureAsset.uri) return;
    // store signature also in enterprise-media. Field "others" as per spec.
    await uploadMediaFile(enterpriseId, signatureAsset, 'others', 'newep');
  };

  // ---------- UI helpers ----------

  const openDeclarationModal = () => {
    const existing = form.declaration_date;
    let initYear = null;
    let initMonth = null;
    let initDay = null;

    if (existing && typeof existing === 'string') {
      try {
        const isoPart = existing.split('T')[0];
        const parts = isoPart.split('-');
        if (parts.length === 3) {
          initYear = parts[0];
          initMonth = String(parseInt(parts[1], 10));
          initDay = String(parseInt(parts[2], 10));
        }
      } catch (e) {}
    }

    if (!initYear) {
      const dt = new Date();
      initYear = String(dt.getFullYear());
      initMonth = String(dt.getMonth() + 1);
      initDay = String(dt.getDate());
    }

    setDeclYear(initYear);
    setDeclMonth(initMonth);
    setDeclDay(initDay);
    setDeclarationDateModalVisible(true);
  };

  const buildPreferedLocationValue = () => {
    const choice = form.prefered_location_choice;
    const extra = (form.prefered_location_extra || '').trim();
    if (!choice) return '';
    if (
      choice.startsWith('Desired') &&
      extra
    ) {
      return `${choice}, ${extra}`;
    }
    return choice;
  };

  const formatFinancialSupport = () => {
    const t = form.financial_support_type;
    const extra = (form.financial_support_other_text || '').trim();

    if (!t) return '';
    if (t === 'Cash') {
      return extra ? `Cash (${extra})` : 'Cash';
    }
    if (t === 'Loan') {
      if (form.loan_amount_range) {
        return `Loan (${form.loan_amount_range})`;
      }
      return 'Loan';
    }
    if (t === 'Others') {
      return extra ? `Others (${extra})` : 'Others';
    }
    return t;
  };

  // Training received rows controls
  const addTrainingReceivedRow = () => {
    setTrainingReceivedRows((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        open: true,
        department: '',
        sectors: {},
      },
    ]);
  };

  const removeTrainingReceivedRow = (id) => {
    setTrainingReceivedRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateTrainingRow = (id, patch) => {
    setTrainingReceivedRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  };

  const benefName =
    beneficiary?.member_name ||
    beneficiary?.name ||
    recordedBenef?.applicant_name ||
    '';

  // ---------- Submit ----------

  const handleSubmit = async () => {
    if (!beneficiary && !recordedBenef) {
      Alert.alert(
        'Error',
        'Beneficiary data missing. Please go back and start recording again.'
      );
      return;
    }

    if (!form.is_training_received) {
      Alert.alert('Validation', 'Please answer "Have you received any training?"');
      return;
    }
    if (!form.is_training_required) {
      Alert.alert('Validation', 'Please answer "Do you require any training?"');
      return;
    }

    try {
      setLoading(true);

      // Step 1: ensure Recorded Beneficiary
      const recordedBenefId = await ensureRecordedBeneficiary();
  const createdBy = getCreatedByNumeric(); 
      // Step 2: build NewEnterprise payload
      const prefered_location = buildPreferedLocationValue();
      const has_shg_cif = form.has_shg_cif === 'Yes';
      const is_training_received = form.is_training_received === 'Yes';
      const is_training_required = form.is_training_required === 'Yes';
      const mentorship_support =
        form.mentorship_support === 'Yes' ? 'Yes' : (form.mentorship_support || '');
      const financial_support = formatFinancialSupport();
      const digital_emarket_support = form.digital_emarket_support === 'Yes';

      let nearest_skill_centre = null;
      let skill_centre_loc = null;
      let nearest_industry = null;
      let industry_loc = null;

      if (form.is_training_required === 'No') {
        if (form.nearest_skill_centre_known === 'Yes') {
          nearest_skill_centre = form.nearest_skill_centre_name || 'Yes';
          skill_centre_loc = form.skill_centre_loc || null;
        } else if (form.nearest_skill_centre_known === 'No') {
          nearest_skill_centre = 'No';
        }

        if (form.nearest_industry_known === 'Yes') {
          nearest_industry = form.nearest_industry_name || 'Yes';
          industry_loc = form.industry_loc || null;
        } else if (form.nearest_industry_known === 'No') {
          nearest_industry = 'No';
        }
      }

      const payloadObj = {
        recorded_benef_id: recordedBenefId,
          created_by: createdBy,  //created_by record
        applicant_special_category: form.applicant_special_category || null,
        prefered_location: prefered_location || null,
        has_shg_cif,
        cif_fund_amt: form.cif_fund_amt || null,
        is_training_received,
        is_training_required,
        nearest_skill_centre,
        skill_centre_loc,
        nearest_industry,
        industry_loc,
        mentorship_support: mentorship_support || null,
        financial_support: financial_support || null,
        loan_amount: form.loan_amount_range || null,
        market_linkage_type: form.market_linkage_type || null,
        market_linkage_detail: form.market_linkage_detail || null,
        is_promo_ad_req_type: form.is_promo_ad_req_type || null,
        is_promo_ad_req_detail: form.is_promo_ad_req_detail || null,
        infrastructure_support_type: form.infrastructure_support_type || null,
        infrastructure_support_detail: form.infrastructure_support_detail || null,
        digital_emarket_support,
        enterprise_type: 'newep',
        other_support: form.other_support || null,
        declaration_confirmed: !!form.declaration_confirmed,
        declaration_date: form.declaration_date || null,
      };

      // Step 3: create NewEnterprise
      let enterpriseRes;
      try {
        enterpriseRes = await performMultipartCreateNewEnterprise(
          payloadObj,
          signatureAsset
        );
      } catch (e) {
        console.warn('Multipart new-enterprise failed, trying JSON create', e);
        enterpriseRes = await gsApi.createNewEnterprise(payloadObj);
      }

      const enterpriseId =
        enterpriseRes?.TH_urid || enterpriseRes?.TH_URID || enterpriseRes?.id || null;

      if (!enterpriseId) {
        throw new Error('New enterprise saved but ID missing in response.');
      }

      // Step 4: link recorded_beneficiaries.enterprise_id
      try {
        await gsApi.updateRecordedBeneficiary(recordedBenefId, {
          enterprise_id: enterpriseId,
        });
      } catch (e) {
        console.error('Failed to update recorded beneficiary enterprise_id', e);
      }

      // Step 5: sub-forms
      // 5a) Enterprise type
      await createEnterpriseTypeRecord(enterpriseId);

      // 5b) Training received (rows)
      if (form.is_training_received === 'Yes') {
        await createTrainingReceivedRows(enterpriseId);
      }

      // 5c) Training required
      await createTrainingRequired(enterpriseId);

      // 5d) Training certificates
      await uploadTrainingCertificatesMedia(enterpriseId);

      // 5e) Applicant signature into enterprise-media (others)
      await uploadSignatureMedia(enterpriseId);

      Alert.alert('Success', 'New enterprise saved successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      console.error('NewEnterprise submit error', err);
      const serverMsg =
        err?.data?.detail ||
        (err?.data && typeof err.data === 'object' ? JSON.stringify(err.data) : null) ||
        err?.message ||
        'Failed to save new enterprise. Please try again.';
      Alert.alert('Error', serverMsg);
    } finally {
      setLoading(false);
    }
  };

  
  // ---------- Render ----------

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.heading}>New Enterprise — {benefName}</Text>

      {/* ========= SECTION: Basic Information ========= */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 }}>
      <Text style={styles.sectionHeading}> {language === 'hi' ? 'बुनियादी जानकारी' : 'Basic Information'}</Text>
<LanguageToggle />
</View>
      {/* 1) Special category */}
      {/* <Text style={styles.label}>Please specify your special category (If applicable)</Text> */}
      {/* <TextInput
        style={styles.input}
        value={form.applicant_special_category}
        onChangeText={(v) => setField('applicant_special_category', v)}
        placeholder="e.g. Divyang, Widow, Single Woman, etc."
      /> */}
         {/* {[
        'Divyang',
        'Widow',
        'Single Woman',
      ].map((opt) => (
        <TouchableOpacity
          key={opt}
          style={styles.checkboxRow}
          onPress={() => setField('prefered_location_choice', opt)}
        >
          <View
            style={[
              styles.checkbox,
              form.prefered_location_choice === opt && styles.checkboxChecked,
            ]}
          />
          <Text style={styles.checkboxLabel}>{opt}</Text>
        </TouchableOpacity>
      ))} */}

      {/* 2) Enterprise Type (subform /enterprise-types/) */}
      <ParentChildMultiSelect
  title={
    language === 'hi'
      ? 'आप किस प्रकार का उद्यम खोलने में रुचि रखते हैं?'
      : 'What kind of Enterprise are you interested in opening?'
  }
  description={
    language === 'hi'
      ? 'कृपया एक या अधिक श्रेणियां और उप-श्रेणियां चुनें।'
      : 'Please select one or more categories and sub-categories.'
  }
  items={ENTERPRISE_TYPE_CATEGORIES.map((cat) => ({
    parent: language === 'hi' ? cat.parent.hi : cat.parent.en,
    children: cat.children.map((child) =>
      typeof child === 'string' ? child : language === 'hi' ? child.hi : child.en
    ),
  }))}
  value={enterpriseTypeSelection}
  onChange={setEnterpriseTypeSelection}
  otherParentKey={
    typeof ENTERPRISE_TYPE_OTHER_PARENT_KEY === 'string'
      ? ENTERPRISE_TYPE_OTHER_PARENT_KEY
      : language === 'hi'
      ? ENTERPRISE_TYPE_OTHER_PARENT_KEY.hi
      : ENTERPRISE_TYPE_OTHER_PARENT_KEY.en
  }
/>


      {/* 3) Preferred location */}
      <Text style={[styles.label, { marginTop: 16 }]}>
        {/* What location are you comfortable with for starting your enterprise? */}

        {language === 'hi'
    ? 'आप अपना उद्यम शुरू करने के लिए किस स्थान पर सहज हैं?'
    : 'What location are you comfortable with for starting your enterprise?'}
      </Text>
      {[
        { key: 'District', en: 'District', hi: 'जिला' },
  { key: 'Block', en: 'Block', hi: 'ब्लॉक' },
  { key: 'Panchayat', en: 'Panchayat', hi: 'पंचायत' },
  { key: 'Village', en: 'Village', hi: 'गाँव' },
      ].map((opt) => (
        <TouchableOpacity
          key={opt}
          style={styles.checkboxRow}
          onPress={() => setField('prefered_location_choice', opt.key)}
        >
          <View
            style={[
              styles.checkbox,
              form.prefered_location_choice === opt.key && styles.checkboxChecked,
            ]}
          />
          <Text style={styles.checkboxLabel}>
            {/* {opt} */}
             {language === 'hi' ? opt.hi : opt.en}
            </Text>
        </TouchableOpacity>
      ))}

      {form.prefered_location_choice.startsWith('Desired') && (
        <TextInput
          style={[styles.input, { marginTop: 8 }]}
          placeholder="Please specify the desired location"
          value={form.prefered_location_extra}
          onChangeText={(v) => setField('prefered_location_extra', v)}
        />
      )}

      {/* 4) CIF Funds */}
      <Text style={[styles.sectionHeading, { marginTop: 20 }]}>{language === 'hi' ? 'अनिवार्य SHG फंड अनुभाग' : 'Mandatory SHG Fund Section'}</Text>
      {/* <Text style={styles.label}>Have you received any portion of CIF Fund? If Yes, specify amount</Text> */}
      {/* <Text style={styles.label}>Have your SHG Recieved CIF Fund</Text>
      <YesNoToggle
        value={form.has_shg_cif}
        onChange={(v) => setField('has_shg_cif', v)}
      />
      {form.has_shg_cif === 'Yes' && (
        <>
          <Text style={styles.label}>
            Please specify the amount of financial assistance your SHG received
          </Text>
          <TextInput
            style={styles.input}
            value={form.cif_fund_amt}
            onChangeText={(v) => setField('cif_fund_amt', v)}
            keyboardType="numeric"
            placeholder="Enter amount"
          />
        </>
      )} */}
      
      <Text style={styles.label}> {language === 'hi'
    ? 'क्या आपकी स्वयं सहायता समूह को अनिवार्य फंड प्राप्त हुआ है?'
    : 'Have your SHG received mandatory Fund?'}</Text>
<YesNoToggle
  value={form.has_shg_cif}
  onChange={(v) => setField('has_shg_cif', v)}
  language={language}
/>

{form.has_shg_cif === 'Yes' && (
  <>
   

    {/* ADD FUND BUTTON */}
   <TouchableOpacity onPress={addFundCard}   style={styles.addBtn}>
  <Text  style={{ fontWeight: "600" }}> {language === 'hi' ? 'फंड जोड़ें' : 'Add Fund'}</Text>
</TouchableOpacity>

    {/* FUND CARDS */}
    {form.fund_cards.map((fund, index) => (
      <View
        key={index}
        style={{
          backgroundColor: '#FFF',
          borderRadius: 10,
          padding: 12,
          marginTop: 10,
          borderWidth: 1,
          borderColor: '#EE6969'
        }}
      >

        {/* DELETE BUTTON */}
        <TouchableOpacity
          onPress={() => {
            const copy = [...form.fund_cards];
            copy.splice(index, 1);
            setField('fund_cards', copy);
          }}
          style={{
            backgroundColor:"#d9534f",
            paddingVertical:6,
            paddingHorizontal:12,
            borderRadius:16,
            alignSelf:"flex-end",
            marginBottom:8
          }}
        >
          <Text style={{ color:"white", fontWeight:"600" }}>   {language === 'hi' ? 'हटाएँ' : 'Delete'}</Text>
        </TouchableOpacity>

        {/* LOAN TYPE */}
        <Text style={styles.label}> 
      {/* Please specify if your SHG has received these mandatory funds */}
      {language === 'hi' 
          ? 'कृपया बताएं कि आपकी SHG ने ये अनिवार्य फंड प्राप्त किए हैं या नहीं' 
          : 'Please specify if your SHG has received these mandatory funds'}
    </Text>

        {["CIF","RF","CCL", "Other"].map(t => (
          <TouchableOpacity
            key={t}
            style={styles.checkboxRow}
            onPress={() => {
              const copy = [...form.fund_cards];
              copy[index].loanType = t;
              setField('fund_cards', copy);
            }}
          >
            <View style={[
              styles.checkbox,
              fund.loanType === t && styles.checkboxChecked
            ]}/>
            <Text style={styles.checkboxLabel}>
              {/* {t} */}
               {language === 'hi'
                  ? t === 'Other'
                    ? 'अन्य'
                    : t
                  : t}
              </Text>
          </TouchableOpacity>
        ))}
        {fund.loanType === "Other" && (
          <>
            <TextInput
              style={styles.input}
              value={fund.otherLoanTypeText}
              onChangeText={(v) => {
                const copy = [...fundCards];
                copy[index].otherLoanTypeText = v;
                setFundCards(copy);
              }}
              placeholder={language === 'hi' ? 'कृपया विवरण दें' : 'Please Specify'}
            />
          </>
        )}

        {/* RECEIVED */}
        <Text style={styles.label}> {language === 'hi' 
      ? 'क्या आपने इस फंड का हिस्सा प्राप्त किया है?' 
      : 'Have you received part of this fund?'}</Text>

        <YesNoToggle
          value={fund.receivedYesNo}
          onChange={(v) => {
            const copy = [...form.fund_cards];
            copy[index].receivedYesNo = v;
            setField('fund_cards', copy);
          }}
          language={language}
        />

        {fund.receivedYesNo === 'Yes' && (
          <>
            {/* AMOUNT RECEIVED */}
            <Text style={styles.label}>{language === 'hi' ? 'प्राप्त राशि निर्दिष्ट करें' : 'Specify received amount'}</Text>

            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={fund.amount}
              onChangeText={(v) => {
                const copy = [...form.fund_cards];
                copy[index].amount = v;
                setField('fund_cards', copy);
              }}
             placeholder= {language === 'hi' ? 'राशि दर्ज करें' : 'Enter amount'}
            />

            {/* REPAID */}
            <Text style={styles.label}>{language === 'hi' ? 'अदा की गई राशि' : 'Amount Repaid'}</Text>

            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={fund.repaid}
              onChangeText={(v) => {
                const copy = [...form.fund_cards];
                copy[index].repaid = v;
                setField('fund_cards', copy);
              }}
               placeholder={language === 'hi' ? 'राशि दर्ज करें' : 'Enter amount'}
            />

            {/* STATUS */}
         <Text
  style={{
    fontSize: 13,
    fontWeight: 'bold',
    color: getStatusColor(fund.amount, fund.repaid),
  }}
  
>
  {language === 'hi' ? 'स्थिति: ' : 'Status: '}: {getStatus(fund.amount, fund.repaid)}
</Text>


{/* PENDING */}
<Text
  style={{
    fontSize: 13,
    fontWeight: 'bold',
    color: getPendingColor(getPending(fund.amount, fund.repaid)),
  }}
>
     {language === 'hi' ? 'बकाया राशि: ' : 'Pending Amount: '}: {getPending(fund.amount, fund.repaid)}
</Text>
          </>
        )}
      </View>
    ))}
  </>
)}

      {/* ========= SECTION: Trainings Received ========= */}
      <Text style={styles.sectionHeading}> {language === 'hi' ? 'प्रशिक्षण प्राप्त किए' : 'Trainings Received'}</Text>

      <Text style={styles.label}>  {language === 'hi'
    ? 'क्या आपने कोई कौशल प्रशिक्षण प्राप्त किया है?'
    : 'Have you received any skill training?'}</Text>
      <YesNoToggle
        value={form.is_training_received}
        onChange={(v) => setField('is_training_received', v)}
          language={language}
      />

      {form.is_training_received === 'Yes' && (
        <>
          <Text style={[styles.label, { marginTop: 6 }]}>
           {language === 'hi'
        ? 'कृपया प्राप्त किए गए प्रत्येक प्रशिक्षण का विवरण जोड़ें'
        : 'Please add details of each training received'}
          </Text>
          <TouchableOpacity style={styles.smallBtn} onPress={addTrainingReceivedRow}>
            <Text style={{ fontWeight: '600' }}> {language === 'hi' ? '+ प्रशिक्षण विवरण जोड़ें' : '+ Add Training Detail'}</Text>
          </TouchableOpacity>

          {trainingReceivedRows.map((row) => (
            <View
              key={row.id}
              style={{
                marginTop: 10,
                borderWidth: 1,
                borderColor: '#DDD',
                borderRadius: 8,
                backgroundColor: '#FAFAFA',
              }}
            >
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: 8,
                  alignItems: 'center',
                }}
                onPress={() => updateTrainingRow(row.id, { open: !row.open })}
              >
                <Text style={{ fontWeight: '600', color: '#333' }}>
                  {row.department || (language === 'hi' ? 'नया प्रशिक्षण विवरण' : 'New Training Detail')}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Text>{row.open ? '-' : '+'}</Text>
                  <TouchableOpacity onPress={() => removeTrainingReceivedRow(row.id)}>
                    <Text style={{ color: '#EE6969' }}>x</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>

              {row.open && (
                // <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
                //    <ParentChildMultiSelect
                //     title="Please select all sectors in which you have received trainings"
                //     items={TRAINING_SECTORS}
                //     value={row.sectors}
                //     onChange={(sel) => updateTrainingRow(row.id, { sectors: sel })}
                //     otherParentKey={TRAINING_OTHER_PARENT_KEY}
                //   />

 <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
    <ParentChildMultiSelect
      title={
        language === 'hi'
          ? 'आपने किन क्षेत्रों में प्रशिक्षण प्राप्त किया है?'
          : 'Please select all sectors in which you have received trainings'
      }
      items={TRAINING_SECTORS.map((cat) => ({
        parent: language === 'hi' ? cat.parent.hi : cat.parent.en,
        children: cat.children.map((child) =>
          language === 'hi' ? child.hi : child.en
        ),
      }))}
      value={row.sectors}
      onChange={(sel) => updateTrainingRow(row.id, { sectors: sel })}
      otherParentKey={
        language === 'hi'
          ? TRAINING_OTHER_PARENT_KEY.hi
          : TRAINING_OTHER_PARENT_KEY.en
      }
    />



                  <Text style={styles.label}>  {language === 'hi'
    ? 'आपने प्रशिक्षण किस विभाग से प्राप्त किया?'
    : 'Which department did you receive the training from?'}</Text>
                  {['NRLM', 'RSETI', 'NABARD', 'UPSDM', 'Others'].map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={styles.checkboxRow}
                      onPress={() => updateTrainingRow(row.id, { department: opt })}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          row.department === opt && styles.checkboxChecked,
                        ]}
                      />
                      <Text style={styles.checkboxLabel}>
                        {/* {opt} */}
                          {language === 'hi'
        ? opt === 'Others'
          ? 'अन्य'
          : opt
        : opt}
                        </Text>
                    </TouchableOpacity>
                  ))}
                  {row.department === 'Others' && (
                    <TextInput
                      style={styles.input}
                       placeholder={
      language === 'hi'
        ? 'कृपया विभाग का नाम दर्ज करें'
        : 'Please specify department'
    }
                      value={row.department_other || ''}
                      onChangeText={(t) =>
                        updateTrainingRow(row.id, { department: t })
                      }
                    />
                  )}

                  {/* <ParentChildMultiSelect
                    title="Please select all sectors in which you have received trainings"
                    items={TRAINING_SECTORS}
                    value={row.sectors}
                    onChange={(sel) => updateTrainingRow(row.id, { sectors: sel })}
                    otherParentKey={TRAINING_OTHER_PARENT_KEY}
                  /> */}
                </View>
              )}
            </View>
          ))}

          {/* Certificates upload */}
          <Text style={[styles.label, { marginTop: 12 }]}>
            {/* Please upload if you have any certificates for your trainings (If Have any) */}
             {language === 'hi'
    ? 'यदि आपके पास प्रशिक्षण के प्रमाणपत्र हैं तो कृपया अपलोड करें (यदि कोई हो)'
    : 'Please upload if you have any certificates for your trainings (If Have any)'}
          </Text>
          <TouchableOpacity style={styles.smallBtn} onPress={pickTrainingCertificates}>
            <Text style={{ fontWeight: '600' }}>{language === 'hi' ? 'प्रमाणपत्र अपलोड करें' : 'Upload Certificates'}</Text>
          </TouchableOpacity>
          {trainingCertificateAssets.length > 0 && (
            <Text style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
              {/* {trainingCertificateAssets.length} file(s) selected */}
               {language === 'hi'
      ? `${trainingCertificateAssets.length} फ़ाइल(ओं) चयनित`
      : `${trainingCertificateAssets.length} file(s) selected`}
            </Text>
          )}
        </>
      )}

      {/* ========= SECTION: Trainings Required ========= */}
      <Text style={styles.sectionHeading}>  {language === 'hi' ? 'प्रशिक्षण की आवश्यकता' : 'Training Requirement'}</Text>

      <Text style={styles.label}> {language === 'hi' ? 'क्या आपको कौशल प्रशिक्षण की आवश्यकता है?' : 'Do you require skill training?'}</Text>
      <YesNoToggle
        value={form.is_training_required}
        onChange={(v) => setField('is_training_required', v)}
          language={language}
      />

      {form.is_training_required === 'Yes' && (
        <>
        {/* <ParentChildMultiSelect
            title="Which is your preferred sector for training?"
            description="Select sector(s) and sub sectors for which you want training."
            items={TRAINING_SECTORS}
            value={trainingReqSectors}
            onChange={setTrainingReqSectors}
            otherParentKey={TRAINING_OTHER_PARENT_KEY}
          /> */}

          <ParentChildMultiSelect
    title={
      language === 'hi'
        ? 'आप किस क्षेत्र में प्रशिक्षण लेना चाहते हैं?'
        : 'Which is your preferred sector for training?'
    }
    description={
      language === 'hi'
        ? 'प्रशिक्षण हेतु क्षेत्र और उप-क्षेत्र चुनें।'
        : 'Select sector(s) and sub sectors for which you want training.'
    }
    items={TRAINING_SECTORS.map((cat) => ({
      parent: language === 'hi' ? cat.parent.hi : cat.parent.en,
      children: cat.children.map((child) =>
        language === 'hi' ? child.hi : child.en
      ),
    }))}
    value={trainingReqSectors}
    onChange={setTrainingReqSectors}
    otherParentKey={
      language === 'hi'
        ? TRAINING_OTHER_PARENT_KEY.hi
        : TRAINING_OTHER_PARENT_KEY.en
    }
  />
          {/* <Text style={styles.label}>Which is your preferred department for training?</Text>
          {['NRLM', 'RCT', 'NABARD', 'UPSDM', 'Others'].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.checkboxRow}
              onPress={() => setTrainingReqDept(opt)}
            >
              <View
                style={[
                  styles.checkbox,
                  trainingReqDept === opt && styles.checkboxChecked,
                ]}
              />
              <Text style={styles.checkboxLabel}>{opt}</Text>
            </TouchableOpacity>
          ))}
          {trainingReqDept === 'Others' && (
            <TextInput
              style={styles.input}
              placeholder="Please specify department"
              value={trainingReqDept === 'Others' ? '' : trainingReqDept}
              onChangeText={(t) => setTrainingReqDept(t)}
            />
          )} */}

<Text style={styles.label}> {language === 'hi' ? 'आपका पसंदीदा प्रशिक्षण प्रकार क्या है?' : 'What is your preferred training type?'}</Text>

{['Residential', 'Non-Residential'].map((opt) => (
  <TouchableOpacity
    key={opt}
    style={styles.checkboxRow}
    onPress={() => toggleTrainingReqType(opt)}
  >
    <View
      style={[
        styles.checkbox,
        trainingReqType.includes(opt) && styles.checkboxChecked,
      ]}
    />
    <Text style={styles.checkboxLabel}>
      {/* {opt} */}
       {language === 'hi'
        ? opt === 'Residential'
          ? 'रेजिडेंशियल'
          : 'नॉन-रेजिडेंशियल'
        : opt}
      </Text>
  </TouchableOpacity>
))}


          {/* <Text style={styles.label}>How many days of training are you comfortable with?</Text> */}
          <Text style={styles.label}>  {language === 'hi'
    ? 'आप एक स्लॉट में कितने दिनों का प्रशिक्षण लेने के लिए तैयार हैं?'
    : 'How many days of training are you comfortable in one slot'}</Text>
          {['Under 7 days', '7 days', '15 days', '30 days', 'Over 30 days'].map(
            (opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.checkboxRow}
                onPress={() => setTrainingReqDuration(opt)}
              >
                <View
                  style={[
                    styles.checkbox,
                    trainingReqDuration === opt && styles.checkboxChecked,
                  ]}
                />
                <Text style={styles.checkboxLabel}>
                  {/* {opt} */}
                     {language === 'hi'
        ? opt === 'Under 7 days'
          ? '7 दिन से कम'
          : opt === '7 days'
          ? '7 दिन'
          : opt === '15 days'
          ? '15 दिन'
          : opt === '30 days'
          ? '30 दिन'
          : '30 दिन से अधिक'
        : opt}
                  </Text>
              </TouchableOpacity>
            )
          )}
          
            <Text style={styles.label}>  {language === 'hi'
    ? 'प्रशिक्षण के लिए आपका पसंदीदा विभाग कौन सा है?'
    : 'Which is your preferred department for training?'}</Text>
          {['NRLM', 'RSETI', 'NABARD', 'UPSDM', 'Others'].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.checkboxRow}
              onPress={() => setTrainingReqDept(opt)}
            >
              <View
                style={[
                  styles.checkbox,
                  trainingReqDept === opt && styles.checkboxChecked,
                ]}
              />
              <Text style={styles.checkboxLabel}>
                {/* {opt} */}
                 {language === 'hi'
        ? opt === 'Others'
          ? 'अन्य'
          : opt
        : opt}
                </Text>
            </TouchableOpacity>
          ))}
          {trainingReqDept === 'Others' && (
            <TextInput
              style={styles.input}
              placeholder={language === 'hi' ? 'कृपया विभाग का नाम दर्ज करें' : 'Please specify department'}
              value={trainingReqDept === 'Others' ? '' : trainingReqDept}
              onChangeText={(t) => setTrainingReqDept(t)}
            />
          )}

          {/* <ParentChildMultiSelect
            title="Which is your preferred sector for training?"
            description="Select sector(s) and sub sectors for which you want training."
            items={TRAINING_SECTORS}
            value={trainingReqSectors}
            onChange={setTrainingReqSectors}
            otherParentKey={TRAINING_OTHER_PARENT_KEY}
          /> */}
{/* 
          <Text style={styles.label}>How many days of training are you comfortable with?</Text>
          {['Under 7 days', '7 days', '15 days', '30 days', 'Over 30 days'].map(
            (opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.checkboxRow}
                onPress={() => setTrainingReqDuration(opt)}
              >
                <View
                  style={[
                    styles.checkbox,
                    trainingReqDuration === opt && styles.checkboxChecked,
                  ]}
                />
                <Text style={styles.checkboxLabel}>{opt}</Text>
              </TouchableOpacity>
            )
          )} */}

          {/* <Text style={styles.label}>What is your preferred training location?</Text>          
          <Text style={styles.label}>Desired District</Text>          
          <TextInput
            style={[styles.input, { marginTop: 6 }]}
            placeholder="District"
            value={trainingReqLocationDistrict}
            onChangeText={setTrainingReqLocationDistrict}
          />
          <Text style={styles.label}>Desired Block</Text>          
          <TextInput
            style={[styles.input, { marginTop: 6 }]}
            placeholder="Block"
            value={trainingReqLocationBlock}
            onChangeText={setTrainingReqLocationBlock}
          />
             <Text style={styles.label}>Desired Village</Text>   
          <TextInput
            style={styles.input}
            placeholder="Village"
            value={trainingReqLocationVillage}
            onChangeText={setTrainingReqLocationVillage}
          /> */}
          <Text style={styles.label}>{language === 'hi'
    ? 'आपका पसंदीदा प्रशिक्षण स्थान क्या है?'
    : 'What is your preferred training location?'}</Text>          

<Text style={styles.label}>{language === 'hi' ? 'स्थान का प्रकार चुनें' : 'Select Location Type'}</Text>

<View style={[styles.input, { marginTop: 6 }]}>
  <Picker
    selectedValue={trainingReqLocationType}
    onValueChange={(value) => setTrainingReqLocationType(value)}
  >
    <Picker.Item label={language === 'hi' ? 'स्थान चुनें' : 'Select Location'} value="" />
    <Picker.Item label={language === 'hi' ? 'राज्य' : 'State'} value="state" />
    <Picker.Item  label={language === 'hi' ? 'जिला' : 'District'} value="district" />
    <Picker.Item label={language === 'hi' ? 'ब्लॉक' : 'Block'} value="block" />
    <Picker.Item label={language === 'hi' ? 'गाँव' : 'Village'} value="village" />
  </Picker>
</View>


          {/* <Text style={styles.label}>What is your expected Salary after training?</Text>
          {[
            'Under 10,000',
            '10,000 - 20,000',
            '20,000 - 30,000',
            'Above 30,000',
          ].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.checkboxRow}
              onPress={() => setTrainingReqExpectedIncome(opt)}
            >
              <View
                style={[
                  styles.checkbox,
                  trainingReqExpectedIncome === opt && styles.checkboxChecked,
                ]}
              />
              <Text style={styles.checkboxLabel}>{opt}</Text>
            </TouchableOpacity>
          ))} */}
        </>
      )}

      {form.is_training_required === 'No' && (
        <>
          {/* When training not required → ask about known centres / industries */}
          <Text style={styles.sectionHeading}> {language === 'hi'
        ? 'केंद्रों / उद्योगों के साथ मौजूदा अनुभव'
        : 'Existing Exposure to Centres / Industries'}</Text>

          <Text style={styles.label}>   {language === 'hi'
        ? 'क्या आप अपने उद्यम से संबंधित किसी कौशल केंद्र के बारे में जानते हैं?'
        : 'Do you know of any Skill Centres related to your enterprise?'}</Text>
          <YesNoToggle
            value={form.nearest_skill_centre_known}
            onChange={(v) => setField('nearest_skill_centre_known', v)}
              language={language} 
          />
          {form.nearest_skill_centre_known === 'Yes' && (
            <>
              <Text style={styles.label}>{language === 'hi' ? 'कृपया इसका नाम बताएं' : 'Please tell its name'}</Text>
              <TextInput
                style={styles.input}
                value={form.nearest_skill_centre_name}
                onChangeText={(v) => setField('nearest_skill_centre_name', v)}
                 placeholder={language === 'hi' ? 'कौशल केंद्र का नाम' : 'Skill centre name'}
              />
              <Text style={styles.label}>{language === 'hi' ? 'कृपया इसका स्थान बताएं' : 'Please tell its location'}</Text>
              <TextInput
                style={styles.input}
                value={form.skill_centre_loc}
                onChangeText={(v) => setField('skill_centre_loc', v)}
                placeholder={language === 'hi' ? 'स्थान' : 'Location'}
              />
            </>
          )}

          <Text style={[styles.label, { marginTop: 10 }]}>
             {language === 'hi'
    ? 'क्या आप अपने उद्यम से संबंधित किसी उद्योग / औद्योगिक क्षेत्र के बारे में जानते हैं?'
    : 'Do you know of any Industries / Industrial Sectors related to your enterprise?'}
          </Text>
          <YesNoToggle
            value={form.nearest_industry_known}
            onChange={(v) => setField('nearest_industry_known', v)}
            language={language} 
          />
          {form.nearest_industry_known === 'Yes' && (
            <>
              <Text style={styles.label}> {language === 'hi' ? 'कृपया इसका नाम बताएं' : 'Please tell its name'}</Text>
              <TextInput
                style={styles.input}
                value={form.nearest_industry_name}
                onChangeText={(v) => setField('nearest_industry_name', v)}
                 placeholder={
        language === 'hi'
          ? 'उद्योग / औद्योगिक क्षेत्र का नाम'
          : 'Industry / Industrial sector name'
      }
              />
              <Text style={styles.label}>  {language === 'hi' ? 'कृपया इसका स्थान बताएं' : 'Please tell its location'}</Text>
              <TextInput
                style={styles.input}
                value={form.industry_loc}
                onChangeText={(v) => setField('industry_loc', v)}
                placeholder={language === 'hi' ? 'स्थान' : 'Location'}
              />
            </>
          )}
        </>
      )}

      {/* ========= SECTION: Support Required ========= */}
      {/* <Text style={styles.sectionHeading}>Support Required</Text> */}

      {/* <Text style={styles.label}>Do you require Mentorship support?</Text>
      <YesNoToggle
        value={form.mentorship_support}
        onChange={(v) => setField('mentorship_support', v)}
      /> */}

      {/* <Text style={styles.label}>Do you require Financial Assistance?</Text>
      {['Grant and Subsidy', 'Loan', 'Interest Subvention','Others'].map((opt) => (
        <TouchableOpacity
          key={opt}
          style={styles.checkboxRow}
          onPress={() => setField('financial_support_type', opt)}
        >
          <View
            style={[
              styles.checkbox,
              form.financial_support_type === opt && styles.checkboxChecked,
            ]}
          />
          <Text style={styles.checkboxLabel}>{opt}</Text>
        </TouchableOpacity>
      ))} */}

      {/* {(form.financial_support_type === 'Grant and Subsidy' ||
        form.financial_support_type === 'Others') && (
        <TextInput
          style={styles.input}
          placeholder="Please specify details"
          value={form.financial_support_other_text}
          onChangeText={(v) => setField('financial_support_other_text', v)}
        />
      )} */}
      {/* {['Grant and Subsidy', 'Interest Subvention', 'Others'].includes(form.financial_support_type) && (
  <TextInput
    style={styles.input}
    placeholder="Please specify"
    value={form.financial_support_other_text}
    onChangeText={(v) => setField('financial_support_other_text', v)}
  />
)}


      {form.financial_support_type === 'Loan' && (
        <>
          <Text style={styles.label}>What loan amount range do you require?</Text>
          {[
            'Below to 50,000',
            '50,000 - 1,00,000',
            '1,00,000 - 2,00,000',
            '2,00,000 - 5,00,000',
            'Above to 5,00,000',
          ].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.checkboxRow}
              onPress={() => setField('loan_amount_range', opt)}
            >
              <View
                style={[
                  styles.checkbox,
                  form.loan_amount_range === opt && styles.checkboxChecked,
                ]}
              />
              <Text style={styles.checkboxLabel}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      <Text style={styles.label}>
        What type of Market Linkage Assistance you require?
      </Text>
      {['Retail', 'Business', 'Government', 'Others'].map((opt) => (
        <TouchableOpacity
          key={opt}
          style={styles.checkboxRow}
          onPress={() => setField('market_linkage_type', opt)}
        >
          <View
            style={[
              styles.checkbox,
              form.market_linkage_type === opt && styles.checkboxChecked,
            ]}
          />
          <Text style={styles.checkboxLabel}>{opt}</Text>
        </TouchableOpacity>
      ))}
      {form.market_linkage_type && (
        <TextInput
          style={styles.input}
          placeholder="Please specify details"
          value={form.market_linkage_detail}
          onChangeText={(v) => setField('market_linkage_detail', v)}
        />
      )} */}

      {/* <Text style={styles.label}>
        What type of Branding Promotion Assistance you require?
      </Text>
      {['Physical', 'Online', 'Others'].map((opt) => (
        <TouchableOpacity
          key={opt}
          style={styles.checkboxRow}
          onPress={() => setField('is_promo_ad_req_type', opt)}
        >
          <View
            style={[
              styles.checkbox,
              form.is_promo_ad_req_type === opt && styles.checkboxChecked,
            ]}
          />
          <Text style={styles.checkboxLabel}>{opt}</Text>
        </TouchableOpacity>
      ))}
      {form.is_promo_ad_req_type && (
        <TextInput
          style={styles.input}
          placeholder="Please specify details"
          value={form.is_promo_ad_req_detail}
          onChangeText={(v) => setField('is_promo_ad_req_detail', v)}
        />
      )} */}
{/* 
      <Text style={styles.label}>
  What type of Branding Promotion Assistance you require?
</Text>

{['Physical', 'Online', 'Others'].map((opt) => (
  <TouchableOpacity
    key={opt}
    style={styles.checkboxRow}
    onPress={() => {
      setField('is_promo_ad_req_type', opt);
      setField('is_promo_ad_req_subtype', '');
      setField('is_promo_ad_req_detail', '');
    }}
  >
    <View
      style={[
        styles.checkbox,
        form.is_promo_ad_req_type === opt && styles.checkboxChecked,
      ]}
    />
    <Text style={styles.checkboxLabel}>{opt}</Text>
  </TouchableOpacity>
))} */}

{/* When ONLINE is selected → SUB OPTIONS */}
{/* {form.is_promo_ad_req_type === 'Online' && (
  <>
    <Text style={[styles.label, { marginTop: 8 }]}>
      Select preferred online platform
    </Text>

    {['Flipkart', 'Amazon', 'Meesho', 'ONDC', 'Others'].map((sub) => (
      <TouchableOpacity
        key={sub}
        style={styles.checkboxRow}
        onPress={() => setField('is_promo_ad_req_subtype', sub)}
      >
        <View
          style={[
            styles.checkbox,
            form.is_promo_ad_req_subtype === sub && styles.checkboxChecked,
          ]}
        />
        <Text style={styles.checkboxLabel}>{sub}</Text>
      </TouchableOpacity>
    ))} */}

    {/* If ONLINE → OTHERS selected → specify input */}
    {/* {form.is_promo_ad_req_subtype === 'Others' && (
      <TextInput
        style={styles.input}
        placeholder="Please specify platform"
        value={form.is_promo_ad_req_detail}
        onChangeText={(v) => setField('is_promo_ad_req_detail', v)}
      />
    )}
  </>
)} */}

{/* When PHYSICAL or main OTHERS selected → direct specify field */}
{/* {form.is_promo_ad_req_type !== '' &&
  form.is_promo_ad_req_type !== 'Online' && (
    <TextInput
      style={styles.input}
      placeholder="Please specify details"
      value={form.is_promo_ad_req_detail}
      onChangeText={(v) => setField('is_promo_ad_req_detail', v)}
    />
  )}



      <Text style={styles.label}>
        What type of Infrastructure support you require?
      </Text>
      {['Equipments', 'Machinery', 'Place of Business', 'Others'].map((opt) => (
        <TouchableOpacity
          key={opt}
          style={styles.checkboxRow}
          onPress={() => setField('infrastructure_support_type', opt)}
        >
          <View
            style={[
              styles.checkbox,
              form.infrastructure_support_type === opt && styles.checkboxChecked,
            ]}
          />
          <Text style={styles.checkboxLabel}>{opt}</Text>
        </TouchableOpacity>
      ))}
      {form.infrastructure_support_type && (
        <TextInput
          style={styles.input}
          placeholder="Please specify details"
          value={form.infrastructure_support_detail}
          onChangeText={(v) => setField('infrastructure_support_detail', v)}
        />
      )} */}

      {/* <Text style={styles.label}>Do you require Digital E-Market support?</Text>
      <YesNoToggle
        value={form.digital_emarket_support}
        onChange={(v) => setField('digital_emarket_support', v)}
      /> */}

      {/* <Text style={styles.label}>Do you require any other support?</Text>
      <TextInput
        style={[styles.input, { minHeight: 60 }]}
        multiline
        value={form.other_support}
        onChangeText={(v) => setField('other_support', v)}
        placeholder="Please describe any other support required"
      /> */}


<Text style={styles.sectionHeading}> {language === 'hi' ? 'आवश्यक सहायता' : 'Support Required'}</Text>

{/* ===== YES / NO ===== */}
<Text style={styles.label}>  {language === 'hi'
    ? 'क्या आपको किसी प्रकार की सहायता की आवश्यकता है?'
    : 'Do you require any support?'}</Text>

{['Yes', 'No'].map((opt) => (
  <TouchableOpacity
    key={opt}
    style={styles.checkboxRow}
    onPress={() => {
      setField('need_support', opt);

      if (opt === 'No') {
        setField('support_types', {});
        setField('financial_support_type', '');
        setField('financial_support_other_text', '');
        setField('loan_amount_range', '');
        setField('infrastructure_support_type', '');
        setField('infrastructure_support_detail', '');
        setField('branding_type', '');
        setField('branding_subtype', '');
        setField('branding_detail', '');
        setField('machinery_detail', '');
        setField('other_support', '');
      }
    }}
  >
    <View
      style={[
        styles.checkbox,
        form.need_support === opt && styles.checkboxChecked,
      ]}
    />
    <Text style={styles.checkboxLabel}>
      {/* {opt} */}
        {language === 'hi'
        ? opt === 'Yes'
          ? 'हाँ'
          : 'नहीं'
        : opt}
      </Text>
  </TouchableOpacity>
))}

{/* ===== MAIN OPTIONS ===== */}
{form.need_support === 'Yes' && (
  <>
    {/* ---------- MACHINERY ---------- */}
    <TouchableOpacity
      style={styles.checkboxRow}
      onPress={() =>
        setField('support_types', {
          ...form.support_types,
          machinery: !form.support_types?.machinery,
        })
      }
    >
      <View
        style={[
          styles.checkbox,
          form.support_types?.machinery && styles.checkboxChecked,
        ]}
      />
      <Text style={styles.checkboxLabel}> {language === 'hi' ? 'मशीनरी' : 'Machinery'}</Text>
    </TouchableOpacity>

    {form.support_types?.machinery && (
      <TextInput
        style={styles.input}
         placeholder={
          language === 'hi'
            ? 'आवश्यक मशीनरी / उपकरण का विवरण दें'
            : 'Specify machinery / equipment required'
        }
        value={form.machinery_detail}
        onChangeText={(v) => setField('machinery_detail', v)}
      />
    )}

    {/* ---------- INFRASTRUCTURE ---------- */}
    <TouchableOpacity
      style={styles.checkboxRow}
      onPress={() =>
        setField('support_types', {
          ...form.support_types,
          infrastructure: !form.support_types?.infrastructure,
        })
      }
    >
      <View
        style={[
          styles.checkbox,
          form.support_types?.infrastructure && styles.checkboxChecked,
        ]}
      />
      <Text style={styles.checkboxLabel}>{language === 'hi' ? 'इन्फ्रास्ट्रक्चर' : 'Infrastructure'}</Text>
    </TouchableOpacity>

    {form.support_types?.infrastructure && (
      <>
        {['Equipments', 'Machinery', 'Place of Business', 'Others'].map(
          (opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.checkboxRow,, styles.subOption]}
              onPress={() =>
                setField('infrastructure_support_type', opt)
              }
            >
              <View
                style={[
                  styles.checkbox,
                  form.infrastructure_support_type === opt &&
                    styles.checkboxChecked,
                ]}
              />
              <Text style={styles.checkboxLabel}>
                {/* {opt} */}
                 {language === 'hi'
                  ? opt === 'Equipments'
                    ? 'उपकरण'
                    : opt === 'Machinery'
                    ? 'मशीनरी'
                    : opt === 'Place of Business'
                    ? 'व्यवसाय स्थल'
                    : 'अन्य'
                  : opt}
                </Text>
            </TouchableOpacity>
          )
        )}

        {form.infrastructure_support_type && (
          <TextInput
            style={styles.input}
            placeholder={language === 'hi' ? 'कृपया विवरण दें' : 'Please specify'}
            value={form.infrastructure_support_detail}
            onChangeText={(v) =>
              setField('infrastructure_support_detail', v)
            }
          />
        )}
      </>
    )}

    {/* ---------- BRANDING & PROMOTION ---------- */}
    <TouchableOpacity
      style={styles.checkboxRow}
      onPress={() =>
        setField('support_types', {
          ...form.support_types,
          branding: !form.support_types?.branding,
        })
      }
    >
      <View
        style={[
          styles.checkbox,
          form.support_types?.branding && styles.checkboxChecked,
        ]}
      />
      <Text style={styles.checkboxLabel}> {language === 'hi'
          ? 'ब्रांडिंग और प्रचार'
          : 'Branding & Promotion'}</Text>
    </TouchableOpacity>

    {form.support_types?.branding && (
      <>
        {['Physical', 'Online', 'Others'].map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.checkboxRow,, styles.subOption]}
            onPress={() => {
              setField('branding_type', opt);
              setField('branding_subtype', '');
              setField('branding_detail', '');
            }}
          >
            <View
              style={[
                styles.checkbox,
                form.branding_type === opt && styles.checkboxChecked,
              ]}
            />
            <Text style={styles.checkboxLabel}>
              {/* {opt} */}
                  {language === 'hi'
                ? opt === 'Physical'
                  ? 'भौतिक'
                  : opt === 'Online'
                  ? 'ऑनलाइन'
                  : 'अन्य'
                : opt}
              </Text>
          </TouchableOpacity>
        ))}

        {form.branding_type === 'Online' && (
          <>
            {['Flipkart', 'Amazon', 'Meesho', 'ONDC', 'Others'].map(
              (sub) => (
                <TouchableOpacity
                  key={sub}
                  style={[styles.checkboxRow, styles.subOption]}
                  onPress={() =>
                    setField('branding_subtype', sub)
                  }
                >
                  <View
                    style={[
                      styles.checkbox,
                      form.branding_subtype === sub &&
                        styles.checkboxChecked,
                    ]}
                  />
                  <Text style={styles.checkboxLabel}>
                    {/* {sub} */}
                     {language === 'hi'
          ? sub === 'Flipkart'
            ? 'फ्लिपकार्ट'
            : sub === 'Amazon'
            ? 'अमेज़न'
            : sub === 'Meesho'
            ? 'मीशो'
            : sub === 'ONDC'
            ? 'ओएनडीसी'
            : sub === 'Others'
            ? 'अन्य'
            : sub
          : sub}
                    </Text>
                </TouchableOpacity>
              )
            )}

            {form.branding_subtype === 'Others' && (
              <TextInput
                style={styles.input}
                placeholder={
  language === 'hi'
    ? 'कृपया प्लेटफ़ॉर्म का नाम बताएं'
    : 'Please specify platform'
}
                value={form.branding_detail}
                onChangeText={(v) =>
                  setField('branding_detail', v)
                }
              />
            )}
          </>
        )}

        {form.branding_type &&
          form.branding_type !== 'Online' && (
            <TextInput
              style={styles.input}
              placeholder={
                language === 'hi'
                  ? 'कृपया विवरण दें'
                  : 'Please specify details'
              }
              value={form.branding_detail}
              onChangeText={(v) =>
                setField('branding_detail', v)
              }
            />
          )}
      </>
    )}

    {/* ---------- FINANCIAL ---------- */}
   {/* ---------- FINANCIAL ---------- */}
<TouchableOpacity
  style={styles.checkboxRow}
  onPress={() =>
    setField('support_types', {
      ...form.support_types,
      financial: !form.support_types?.financial,
    })
  }
>
  <View
    style={[
      styles.checkbox,
      form.support_types?.financial && styles.checkboxChecked,
    ]}
  />
  <Text style={styles.checkboxLabel}>{language === 'hi' ? 'वित्तीय सहायता' : 'Financial'}</Text>
</TouchableOpacity>

{form.support_types?.financial && (
  <>
    {['Grant and Subsidy', 'Loan', 'Interest Subvention', 'Others'].map(
      (opt) => (
        <TouchableOpacity
          key={opt}
          style={[styles.checkboxRow,, styles.subOption]}
          onPress={() => {
            setField('financial_support_type', opt);
            if (opt !== 'Loan') {
              setField('loan_amount_range', '');
            }
          }}
        >
          <View
            style={[
              styles.checkbox,
              form.financial_support_type === opt &&
                styles.checkboxChecked,
            ]}
          />
          <Text style={styles.checkboxLabel}>
            {/* {opt} */}
                    {language === 'hi'
          ? opt === 'Grant and Subsidy'
            ? 'अनुदान एवं सब्सिडी'
            : opt === 'Loan'
            ? 'ऋण'
            : opt === 'Interest Subvention'
            ? 'ब्याज अनुदान'
            : 'अन्य'
          : opt}
            </Text>
        </TouchableOpacity>
      )
    )}

    {/* 🔽 LOAN AMOUNT RANGE OPENS ONLY IF LOAN SELECTED */}
    {form.financial_support_type === 'Loan' && (
      <>
        <Text style={styles.label}>
          What loan amount range do you require?
        </Text>

        {[
          'Below to 50,000',
          '50,000 - 1,00,000',
          '1,00,000 - 2,00,000',
          '2,00,000 - 5,00,000',
          'Above to 5,00,000',
        ].map((range) => (
          <TouchableOpacity
            key={range}
            style={[styles.checkboxRow,styles.subOption]}
            onPress={() =>
              setField('loan_amount_range', range)
            }
          >
            <View
              style={[
                styles.checkbox,
                form.loan_amount_range === range &&
                  styles.checkboxChecked,
              ]}
            />
            <Text style={styles.checkboxLabel}>
              {/* {range} */}
              {language === 'hi'
            ? range === 'Below to 50,000'
              ? '₹50,000 तक'
              : range === '50,000 - 1,00,000'
              ? '₹50,000 – ₹1,00,000'
              : range === '1,00,000 - 2,00,000'
              ? '₹1,00,000 – ₹2,00,000'
              : range === '2,00,000 - 5,00,000'
              ? '₹2,00,000 – ₹5,00,000'
              : '₹5,00,000 से अधिक'
            : range}
              </Text>
          </TouchableOpacity>
        ))}
      </>
    )}

    {/*  NON-LOAN TEXTBOX */}
    {['Grant and Subsidy', 'Interest Subvention', 'Others'].includes(
      form.financial_support_type
    ) && (
      <TextInput
        style={styles.input}
         placeholder={
      language === 'hi'
        ? 'कृपया विवरण लिखें'
        : 'Please specify'
    }
        value={form.financial_support_other_text}
        onChangeText={(v) =>
          setField('financial_support_other_text', v)
        }
      />
    )}
  </>
)}


    {/* ---------- OTHERS ---------- */}
    <TouchableOpacity
      style={styles.checkboxRow}
      onPress={() =>
        setField('support_types', {
          ...form.support_types,
          others: !form.support_types?.others,
        })
      }
    >
      <View
        style={[
          styles.checkbox,
          form.support_types?.others && styles.checkboxChecked,
        ]}
      />
      <Text style={styles.checkboxLabel}> {language === 'hi'
      ? 'क्या आपको किसी अन्य सहायता की आवश्यकता है?'
      : 'Do you require any other support?'}</Text>
    </TouchableOpacity>

    {form.support_types?.others && (
      <TextInput
        style={[styles.input, { minHeight: 60 }]}
        multiline
        placeholder={
      language === 'hi'
        ? 'कृपया अन्य सहायता का विवरण लिखें'
        : 'Please specify other support'
    }
        value={form.other_support}
        onChangeText={(v) => setField('other_support', v)}
      />
    )}
  </>
)}
<Text style={styles.label}> {language === 'hi'
    ? 'क्या आप किसी कैडर गतिविधि में शामिल हैं?'
    : 'Are you involved in any cadre activity?'}</Text>
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
  const selected = form.applicant_cadre_activity?.includes(opt);

  return (
    <View key={opt} style={{ marginBottom: 6 }}>
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => {
          let updated = [...(form.applicant_cadre_activity || [])];

          if (selected) {
            // remove if already selected
            updated = updated.filter((i) => i !== opt);
          } else {
            // add
            updated.push(opt);
          }

          setField('applicant_cadre_activity', updated);
        }}
      >
        <View
          style={[
            styles.checkbox,
            selected && styles.checkboxChecked,
          ]}
        />
        <Text style={styles.checkboxLabel}>
          {/* {opt} */}
            {language === 'hi'
  ? opt === 'Lakhpati CRP'
    ? 'लखपति सीआरपी'
    : opt === 'Krishi Ajeevika Sakhi'
    ? 'कृषि आजीविका सखी'
    : opt === 'Krishi Udyog Sakhi'
    ? 'कृषि उद्योग सखी'
    : opt === 'Mahila Kisan'
    ? 'महिला किसान'
    : opt === 'CRP- EP'
    ? 'सीआरपी-ईपी'
    : opt === 'BC sakhi'
    ? 'बीसी सखी'
    : opt === 'Vidyut Sakhi'
    ? 'विद्युत सखी'
    : opt === 'Bank Sakhi'
    ? 'बैंक सखी'
    : opt === 'Fnhw Swasth sakhi'
    ? 'एफएनएचडब्ल्यू स्वास्थ्य सखी'
    : opt === 'THR/Dry ration worker'
    ? 'टीएचआर / सूखा राशन कार्यकर्ता'
    : opt === 'Samuh Sakhi'
    ? 'समूह सखी'
    : opt === 'MGNREGA MATE'
    ? 'मनरेगा मेट'
    : 'अन्य'
  : opt}
          </Text>
      </TouchableOpacity>

      {/* Show input ONLY if "Other" is selected */}
      {opt === 'Other' && selected && (
        <TextInput
          style={styles.input}
            placeholder={language === 'hi' ? 'कृपया बताएं' : 'Please specify'}
          value={form.applicant_cadre_activity_other || ''}
          onChangeText={(t) =>
            setField('applicant_cadre_activity_other', t)
          }
        />
      )}
    </View>
  );
})}

<Text style={styles.label}> {language === 'hi'
    ? 'आपका SHG में पद क्या है?'
    : 'What is your designation in your SHG?'}</Text>

{[
    'President',
    'Secretary',
    'Treasurer',
    'Book-Keeper',
    'Member',
].map((opt) => {
  const selected = form.applicant_cadre_designation?.includes(opt);

  return (
    <View key={opt} style={{ marginBottom: 6 }}>
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => {
          let updated = [...(form.applicant_cadre_designation || [])];

          if (selected) {
            // remove if already selected
            updated = updated.filter((i) => i !== opt);
          } else {
            // add
            updated.push(opt);
          }

          setField('applicant_cadre_designation', updated);
        }}
      >
        <View
          style={[
            styles.checkbox,
            selected && styles.checkboxChecked,
          ]}
        />
        <Text style={styles.checkboxLabel}>
          {/* {opt} */}
           {language === 'hi'
            ? opt === 'President'
              ? 'अध्यक्ष'
              : opt === 'Secretary'
              ? 'सचिव'
              : opt === 'Treasurer'
              ? 'कोषाध्यक्ष'
              : opt === 'Book-Keeper'
              ? 'बुक कीपर'
              : 'सदस्य'
            : opt}
          </Text>
      </TouchableOpacity>

      {/* Show input ONLY if "Other" is selected */}
      {/* {opt === 'Other' && selected && (
        <TextInput
          style={styles.input}
          placeholder="Please specify"
          value={form.applicant_cadre_activity_other || ''}
          onChangeText={(t) =>
            setField('applicant_cadre_activity_other', t)
          }
        />
      )} */}
    </View>
  );
})}


<Text style={styles.label}> {language === 'hi'
    ? 'कृपया अपनी विशेष श्रेणी निर्दिष्ट करें (यदि लागू हो)'
    : 'Please specify your special category (If applicable)'}</Text>

{['Divyang', 'Widow', 'Unmarried', 'Other'].map((opt) => (
  <View key={opt} style={styles.checkboxRow}>
    <TouchableOpacity
      style={styles.checkboxRow}
      onPress={() => setField('applicant_special_category', opt)}
    >
      <View
        style={[
          styles.checkbox,
          form.applicant_special_category === opt && styles.checkboxChecked,
        ]}
      />
      <Text style={styles.checkboxLabel}>
        {/* {opt} */}
        {language === 'hi'
          ? opt === 'Divyang'
            ? 'दिव्यांग'
            : opt === 'Widow'
            ? 'विधवा'
            : opt === 'Unmarried'
            ? 'अविवाहित'
            : 'अन्य'
          : opt}
        </Text>
    </TouchableOpacity>

    {/* Show text input if "Other" is selected */}
    {opt === 'Other' && form.applicant_special_category === 'Other' && (
      <TextInput
        style={styles.input}
        placeholder={
          language === 'hi' ? 'कृपया निर्दिष्ट करें' : 'Please specify'
        }
        value={form.applicant_special_category_other || ''}
        onChangeText={(t) =>
          setField('applicant_special_category_other', t)
        }
      />
    )}
  </View>
))}



      {/* ========= SECTION: Declarations ========= */}
      <Text style={styles.sectionHeading}>  {language === 'hi' ? 'घोषणाएँ' : 'Declarations'}</Text>

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() =>
          setField('declaration_confirmed', !form.declaration_confirmed)
        }
      >
        <View
          style={[
            styles.checkbox,
            form.declaration_confirmed && styles.checkboxChecked,
          ]}
        />
        <Text style={styles.checkboxLabel}>
          {language === 'hi'
      ? 'मैं घोषणा करता/करती हूँ कि ऊपर दी गई सभी जानकारी सही है और मैंने स्वयं जांच ली है।'
      : 'I hereby declare that all information provided above is correct and checked by me.'}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.label, { marginTop: 10 }]}> {language === 'hi' ? 'घोषणा की तिथि' : 'Declaration Date'}</Text>
      <TouchableOpacity
        style={[styles.input, { justifyContent: 'center', height: 44 }]}
        onPress={openDeclarationModal}
      >
        <Text>{form.declaration_date || (language === 'hi' ? 'तिथि चुनें' : 'Select date')}</Text>
      </TouchableOpacity>

      <Modal
        visible={declarationDateModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDeclarationDateModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { padding: 12 }]}>
            <Text style={[styles.label, { textAlign: 'center' }]}>
               {language === 'hi' ? 'घोषणा तिथि चुनें' : 'Select Declaration Date'}
            </Text>

            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
              {/* Day */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, marginBottom: 4 }}> {language === 'hi' ? 'दिन' : 'Day'}</Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 6,
                    backgroundColor: '#fff',
                  }}
                >
                  <ScrollView style={{ maxHeight: 120 }}>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <TouchableOpacity
                        key={d}
                        onPress={() => setDeclDay(String(d))}
                        style={{ padding: 8 }}
                      >
                        <Text
                          style={{
                            color:
                              declDay === String(d) ? '#EE6969' : '#333',
                          }}
                        >
                          {String(d)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Month */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, marginBottom: 4 }}> {language === 'hi' ? 'महीना' : 'Month'}</Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 6,
                    backgroundColor: '#fff',
                  }}
                >
                  <ScrollView style={{ maxHeight: 120 }}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <TouchableOpacity
                        key={m}
                        onPress={() => setDeclMonth(String(m))}
                        style={{ padding: 8 }}
                      >
                        <Text
                          style={{
                            color:
                              declMonth === String(m) ? '#EE6969' : '#333',
                          }}
                        >
                          {String(m)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Year */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, marginBottom: 4 }}>{language === 'hi' ? 'साल' : 'Year'}</Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 6,
                    backgroundColor: '#fff',
                  }}
                >
                  <ScrollView style={{ maxHeight: 120 }}>
                    {yearOptions.map((y) => (
                      <TouchableOpacity
                        key={y}
                        onPress={() => setDeclYear(y)}
                        style={{ padding: 8 }}
                      >
                        <Text
                          style={{
                            color: declYear === y ? '#EE6969' : '#333',
                          }}
                        >
                          {y}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 12,
              }}
            >
              <TouchableOpacity
                style={[styles.cancelBtn, { paddingHorizontal: 16 }]}
                onPress={() => setDeclarationDateModalVisible(false)}
              >
                <Text style={{ color: '#EE6969', fontWeight: '600' }}>
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.smallBtn, { paddingHorizontal: 16 }]}
                onPress={() => {
                  const dd = String(declDay ?? '1').padStart(2, '0');
                  const mm = String(declMonth ?? '1').padStart(2, '0');
                  const yyyy = String(declYear ?? currentYear);
                  const iso = `${yyyy}-${mm}-${dd}`;
                  setField('declaration_date', iso);
                  setDeclarationDateModalVisible(false);
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>{language === 'hi' ? 'सेट करें' : 'Set'}
</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Text style={[styles.label, { marginTop: 12 }]}>{language === 'hi' ? 'आवेदक का हस्ताक्षर' : 'Applicant Signature'}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TouchableOpacity style={styles.smallBtn} onPress={pickSignatureFromGallery}>
          <Text style={{ fontWeight: '600' }}>{language === 'hi' ? 'अपलोड करें' : 'Upload'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallBtn} onPress={takeSignaturePhoto}>
          <Text style={{ fontWeight: '600' }}>{language === 'hi' ? 'कैमरा' : 'Camera'}</Text>
        </TouchableOpacity>
        {signatureAsset?.uri && (
          <Text style={{ marginLeft: 8, flex: 1 }} numberOfLines={1}>
            {signatureAsset.fileName || signatureAsset.uri}
          </Text>
        )}
      </View>
      

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.submitButtonText}>{language === 'hi' ? 'जमा करें' : 'Submit'}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

// ---------- Styles ----------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F7F7F7',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#555555',
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EE6969',
    borderRadius: 8,
    // padding: 10,
    fontSize: 14,
    color: '#000000',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#EE6969',
    borderRadius: 4,
    marginRight: 8,
  },
  checkboxSmall: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#EE6969',
    borderRadius: 3,
    marginRight: 6,
  },
  checkboxChecked: {
    backgroundColor: '#EE6969',
    borderColor: '#EE6969',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#EE6969',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  smallBtn: {
    backgroundColor: '#EEE',
    padding: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  cancelBtn: {
    padding: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 300,
    paddingBottom: 15,
    paddingTop: 10,
  },
  addBtn:{
    padding:10,
    backgroundColor:"#e3e3e3",
    borderRadius:8,
    marginTop:10,
    alignSelf:"flex-start"
  },
  subOption: {
  marginLeft: 24,   
},

});
