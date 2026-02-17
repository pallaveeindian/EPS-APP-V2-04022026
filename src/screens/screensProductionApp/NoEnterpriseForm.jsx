// src/screens/epsakhi/NoEnterpriseForm.jsx
import React, { useEffect, useState } from 'react';
import { useContext } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  AppState, 
} from 'react-native';
import gsApi from '../../api/gsApi';
import {
  getShgListForPanchayat,
  getCrpPanchayats,
  getCrpDetail,
} from '../../utils/tempStore';
import { getUser } from '../../utils/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageContext } from '../../components/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';
import { Picker } from '@react-native-picker/picker';

// state

// ========= Helpers (copied/adapted from NewEnterpriseForm) =========

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

// ========= Training sector config =========

const TRAINING_SECTORS = [
  {
    parent: {
      en: "Food Processing Sector",
      hi: "खाद्य प्रसंस्करण क्षेत्र",
    },
    children: [
      { en: "Spice manufacturing", hi: "मसाला निर्माण" },
      { en: "Pickles, preserves (murabba), papad", hi: "अचार, मुरब्बा, पापड़ निर्माण" },
      { en: "Savoury snacks, bhujiya, namkeen", hi: "नमकीन, भुजिया एवं स्नैक्स निर्माण" },
      { en: "Instant mixes (idli mix, gram flour mix, kheer mix)", hi: "इंस्टेंट मिक्स (इडली मिक्स, बेसन मिक्स, खीर मिक्स) निर्माण" },
      { en: "Bakery items (cookies, cake, bread)", hi: "बेकरी उत्पाद (कुकीज़, केक, ब्रेड) निर्माण" },
      { en: "Millet-based products (jowar, bajra, cookies, snacks)", hi: "श्रीधान्य आधारित उत्पाद (ज्वार, बाजरा, कुकीज़, स्नैक्स) निर्माण" },
      { en: "Cold-pressed oils (mustard/sesame)", hi: "कोल्ड-प्रेस्ड तेल (सरसों/तिल) निर्माण" },
      { en: "Honey processing", hi: "शहद प्रसंस्करण" },
      { en: "Jam–jelly–squash", hi: "जैम, जेली एवं स्क्वैश निर्माण" },
      { en: "Ready-to-eat products", hi: "तत्काल उपभोग हेतु तैयार खाद्य उत्पाद" },
      { en: "Jaggery Production", hi: "गुड़ उत्पादन" },
      { en: "Whole grains/pulses/flour sorting-grading-packaging unit", hi: "अनाज/दाल/आटा छंटाई, ग्रेडिंग एवं पैकेजिंग इकाई" },
      { en: "Others", hi: "अन्य" },
    ],
  },

  {
    parent: {
      en: "Handicraft & Artisan Sector",
      hi: "हस्तशिल्प एवं कारीगर क्षेत्र",
    },
    children: [
  { en: "Zari and zardozi work", hi: "ज़री और ज़रदोज़ी कार्य" },
  { en: "Chikankari embroidery", hi: "चिकनकारी कढ़ाई" },
  { en: "Woodwork", hi: "लकड़ी का शिल्प / कार्य" },
  { en: "Terracotta / clay products", hi: "टेराकोटा / मिट्टी के उत्पाद" },
  { en: "Bamboo / cane craft", hi: "बांस / बेंत शिल्प" },
  { en: "Handmade jewellery (terracotta jewellery / oxidised jewellery)", hi: "हस्तनिर्मित आभूषण (टेराकोटा आभूषण / ऑक्सीडाइज़्ड आभूषण)" },
  { en: "Handmade candles", hi: "हस्तनिर्मित मोमबत्तियाँ" },
  { en: "Crochet / woollen products", hi: "क्रोशिया / ऊनी उत्पाद" },
  { en: "Paper craft, greeting cards", hi: "पेपर क्राफ्ट एवं ग्रीटिंग कार्ड निर्माण" },
  { en: "Handbags, jute bags, embroidered bags", hi: "हैंडबैग, जूट बैग एवं कढ़ाईदार बैग" },
  { en: "Ration/Vegetables/Shopping bags", hi: "राशन / सब्ज़ी / शॉपिंग बैग" },
  { en: "Others", hi: "अन्य" },
]
  },

  {
    parent: {
      en: "Textile & Apparel Sector",
      hi: "वस्त्र एवं परिधान क्षेत्र",
    },
   children: [
      { en: "Boutique unit (stitching–cutting–embellishment)", hi: "बुटीक यूनिट (सिलाई–कटिंग–सजावट)" },
      { en: "School uniform stitching unit", hi: "स्कूल यूनिफॉर्म सिलाई यूनिट" },
      { en: "Ladies’ garments", hi: "महिला परिधान" },
      { en: "Bedsheet/quilt/pillow cover unit", hi: "बिस्तर/रजाई/तकिया कवर यूनिट" },
      { en: "ODOP textile-based products (Varanasi saree, Bhadohi carpet finishing etc.)", hi: "ODOP टेक्सटाइल आधारित उत्पाद (वाराणसी साड़ी, भदोही कालीन फिनिशिंग आदि)" },
      { en: "Home linen (curtains, table cloth, sofa covers)", hi: "होम लिनेन (पर्दे, टेबल क्लॉथ, सोफा कवर)" },
      { en: "Jute/cotton carry bags", hi: "जूट/कॉटन कैरी बैग" },
      { en: "Mask/apron/hospital gown manufacturing​", hi: "मास्क/एप्रन/हॉस्पिटल गाउन निर्माण" },
      { en: "Others", hi: "अन्य" },
    ],
  },

  {
    parent: {
      en: "Agriculture & Allied Sector",
      hi: "कृषि एवं संबद्ध क्षेत्र",
    },
    children: [
      { en: "Vegetable cultivation and group supply", hi: "सब्ज़ी उत्पादन एवं समूह आपूर्ति" },
      { en: "Flower cultivation (marigold, rose)", hi: "फूल उत्पादन (गेंदा, गुलाब)" },
      { en: "Mushroom production", hi: "मशरूम उत्पादन" },
      { en: "Nursery (fruit/flower/vegetable saplings)", hi: "नर्सरी (फल/फूल/सब्ज़ी पौधे)" },
      { en: "Beekeeping (honey production)", hi: "मधुमक्खी पालन (शहद उत्पादन)" },
      { en: "Organic manure/vermi-compost", hi: "जैविक खाद/वर्मी कम्पोस्ट" },
      { en: "Animal feed unit", hi: "पशु आहार यूनिट" },
      { en: "Mini mill (flour/pulse grinding)", hi: "मिनी मिल (आटा/दाल पीसना)" },
      { en: "Fruit–vegetable dehydration unit", hi: "फलों व सब्ज़ियों का डिहाइड्रेशन यूनिट" },
      { en: "Fish farming", hi: "मत्स्य पालन" },
      { en: "Others", hi: "अन्य" },
    ],
  },

  {
    parent: {
      en: "Dairy & Animal Husbandry Sector",
      hi: "डेयरी एवं पशुपालन क्षेत्र",
    },
     children: [
      { en: "Dairy unit (2–10 cows/buffaloes)", hi: "डेयरी यूनिट (2–10 गाय/भैंस)" },
      { en: "Milk collection centre", hi: "दूध संग्रहण केंद्र" },
      { en: "Paneer/khoya/curd/ghee manufacturing", hi: "पनीर/खोया/दही/घी निर्माण" },
      { en: "Goat rearing", hi: "बकरी पालन" },
      { en: "Poultry unit (egg/broiler)", hi: "पोल्ट्री यूनिट (अंडा/ब्रोइलर)" },
      { en: "Pig rearing (in specific areas)", hi: "सुअर पालन (विशिष्ट क्षेत्रों में)" },
      { en: "Fodder production", hi: "चारा उत्पादन" },
      { en: "Milk packaging and branding unit​", hi: "दूध पैकेजिंग एवं ब्रांडिंग यूनिट" },
      { en: "Others", hi: "अन्य" },
    ],
  },

  {
    parent: {
      en: "Beauty, Wellness & Personal Services",
      hi: "सौंदर्य, स्वास्थ्य एवं व्यक्तिगत सेवाएँ",
    },
    children: [
      { en: "Beauty parlour", hi: "ब्यूटी पार्लर" },
      { en: "Mehndi (henna) training and services", hi: "मेहंदी प्रशिक्षण एवं सेवा" },
      { en: "Spa / therapy unit", hi: "स्पा / थेरेपी यूनिट" },
      { en: "Home-care services (home nursing, baby care training)", hi: "होम-केयर सेवाएं (नर्सिंग/बेबी केयर प्रशिक्षण)" },
      { en: "Mobile salon / village-based services", hi: "मोबाइल सैलून / गांव आधारित सेवाएं" },
      { en: "Fitness group / yoga classes​", hi: "फिटनेस ग्रुप / योग कक्षाएं" },
      { en: "Others", hi: "अन्य" },
    ],
  },

  {
    parent: {
      en: "Retail & Micro Trading Sector",
      hi: "खुदरा एवं सूक्ष्म व्यापार क्षेत्र",
    },
   children: [
      { en: "Grocery/provision store", hi: "किराना / प्रोविजन स्टोर" },
      { en: "Stationery / general store", hi: "स्टेशनरी / जनरल स्टोर" },
      { en: "Group sale of vegetables/fruits", hi: "फल/सब्ज़ी समूह बिक्री" },
      { en: "Fast food cart", hi: "फास्ट फूड ठेला" },
      { en: "Mobile recharge shop / bill payment kiosk", hi: "मोबाइल रिचार्ज / बिल भुगतान केंद्र" },
      { en: "Jan Aushadhi/Medical Store", hi: "जन औषधि / मेडिकल स्टोर" },
      { en: "PET Shop and disposable alternatives distribution​", hi: "पेट शॉप और डिस्पोज़ेबल विकल्प वितरण" },
      { en: "Others", hi: "अन्य" },
    ],
  },

  {
    parent: {
      en: "Cleaning & Hygiene Products Sector",
      hi: "स्वच्छता एवं हाइजीन उत्पाद क्षेत्र",
    },
    children: [
      { en: "Phenyl/detergent manufacturing", hi: "फिनाइल/डिटर्जेंट निर्माण" },
      { en: "Liquid handwash", hi: "लिक्विड हैंडवॉश" },
      { en: "Sanitizer", hi: "सैनिटाइज़र" },
      { en: "Incense sticks and dhoop sticks", hi: "अगरबत्ती एवं धूपबत्ती निर्माण" },
      { en: "Napkin / sanitary pad unit", hi: "सेनेटरी नैपकिन यूनिट" },
      { en: "Biodegradable plate and bowl manufacturing​", hi: "बायोडिग्रेडेबल प्लेट/बाउल निर्माण" },
      { en: "Others", hi: "अन्य" },
    ],
  },

    {
    parent: {
      en: "Packaging & Utility Products Sector",
      hi: "पैकेजिंग एवं यूटिलिटी उत्पाद क्षेत्र",
    },
    children: [
      { en: "Paper bag unit", hi: "पेपर बैग यूनिट" },
      { en: "Jute bag unit", hi: "जूट बैग यूनिट" },
      { en: "Box manufacturing", hi: "बॉक्स निर्माण" },
      { en: "Recycled paper packaging unit", hi: "रीसाइकल पेपर पैकेजिंग यूनिट" },
      { en: "Food-grade packaging​", hi: "फूड-ग्रेड पैकेजिंग" },
      // { en: "FMCG-(Handwash/Soap/Floor Cleaner, etc)", hi: "एफएमसीजी (हैंडवॉश/साबुन/फ्लोर क्लीनर आदि)" },
      { en: "Transport-(Taxi/Auto/E-Rickshaw,etc)", hi: "परिवहन (टैक्सी/ऑटो/ई-रिक्शा आदि)" },
      { en: "Machinery", hi: "मशीनरी" },
      { en: "Others", hi: "अन्य" },
    ],
  },

  {
    parent: {
      en: "FMCG",
      hi: "एफएमसीजी",
    },
    children: [
      { en: "Handwash", hi: "हैंडवॉश" },
      { en: "Soap", hi: "साबुन" },
      { en: "Floor Cleaner", hi: "फ्लोर क्लीनर" },
      { en: "Detergents", hi: "डिटर्जेंट" },
      { en: "Air fresheners", hi: "एयर फ्रेशनर" },
      { en: "Face wash & creams", hi: "फेसवॉश एवं क्रीम" },
      { en: "Shampoo & conditioner", hi: "शैम्पू एवं कंडीशनर" },
      { en: "Sponges", hi: "स्पंज" },
      { en: "Toothpaste & toothbrushes", hi: "टूथपेस्ट एवं टूथब्रश" },
      { en: "Broom", hi: "झाड़ू" },
      { en: "Others", hi: "अन्य" },
    ],
  },

  {
    parent: { en: "Transport", hi: "परिवहन" },
    children: [
      { en: "Loader", hi: "लोडर" },
      { en: "E-Rickshaw", hi: "ई-रिक्शा" },
      { en: "Taxi", hi: "टैक्सी" },
      { en: "Auto", hi: "ऑटो" },
      { en: "Others", hi: "अन्य" },
    ],
  },
  {
    parent: {
      en: "Prerna Canteen",
      hi: "प्रेरणा कैंटीन",
    },
    children: [],
  },

  {
    parent: { en: "Digital & Service Sector", hi: "डिजिटल एवं सेवा क्षेत्र" },
     children: [
      { en: "Data entry / digital services", hi: "डाटा एंट्री / डिजिटल सेवाएं" },
      { en: "CSC (Common Service Center) operations", hi: "CSC (कॉमन सर्विस सेंटर) संचालन" },
      { en: "Online product sales (e-commerce)", hi: "ऑनलाइन उत्पाद बिक्री (ई-कॉमर्स)" },
      { en: "SHG product branding", hi: "SHG उत्पाद ब्रांडिंग" },
      { en: "Social media management for local shops​", hi: "स्थानीय दुकानों के लिए सोशल मीडिया प्रबंधन" },
      { en: "Others", hi: "अन्य" },
    ],
  },

  {
    parent: { en: "Solid Waste & Green Sector", hi: "ठोस अपशिष्ट एवं हरित क्षेत्र" },
    children: [
      { en: "Plastic waste sorting", hi: "प्लास्टिक कचरा छंटाई" },
      { en: "Fuel/briquettes from waste", hi: "कचरे से ईंधन/ब्रीकेट निर्माण" },
      { en: "Composting unit", hi: "कम्पोस्टिंग यूनिट" },
      { en: "Recycled paper products", hi: "रीसाइकल पेपर उत्पाद" },
      { en: "E-waste collection micro centre​", hi: "ई-वेस्ट कलेक्शन माइक्रो सेंटर" },
      { en: "Others", hi: "अन्य" },
    ],
  },

  {
    parent: {
      en: "Construction & Fabrication Micro Enterprises",
      hi: "निर्माण एवं फेब्रिकेशन सूक्ष्म उद्यम",
    },
    children: [
      { en: "Brick and tiles cleaning/polishing unit", hi: "ईंट और टाइल सफाई/पॉलिशिंग यूनिट" },
      { en: "Interior decoration (fabric, flowers, décor)", hi: "इंटीरियर डेकोरेशन (कपड़ा, फूल, साज-सज्जा)" },
      { en: "Painting/plumbing/carpentry group", hi: "पेंटिंग/प्लंबिंग/कारपेंटरी समूह" },
      { en: "POP artwork / wall decoration", hi: "पीओपी आर्टवर्क / वॉल डेकोरेशन" },
      { en: "Others", hi: "अन्य" },
    ],
  },

  {
    parent: {
      en: "Entrepreneurship Development Programme (EDP)",
      hi: "उद्यमिता विकास कार्यक्रम (EDP)",
    },
    children: [],
  },

  {
    parent: { en: "Others", hi: "अन्य" },
    children: [{ en: "Others", hi: "अन्य" }],
  },
];



// ========= Reusable UI pieces =========

const YesNoToggle = ({ value, onChange }) => (
  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
    <TouchableOpacity
      style={[styles.smallBtn, value === 'Yes' && { backgroundColor: '#EE6969' }]}
      onPress={() => onChange('Yes')}
    >
      <Text style={{ color: value === 'Yes' ? '#fff' : '#333', fontWeight: '600' }}>
        Yes
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.smallBtn, value === 'No' && { backgroundColor: '#EE6969' }]}
      onPress={() => onChange('No')}
    >
      <Text style={{ color: value === 'No' ? '#fff' : '#333', fontWeight: '600' }}>
        No
      </Text>
    </TouchableOpacity>
  </View>
);

const CheckboxRow = ({ label, checked, onPress }) => (
  <TouchableOpacity style={styles.checkboxRow} onPress={onPress}>
    <View style={[styles.checkbox, checked && styles.checkboxChecked]} />
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

// ========= Main component =========

export default function NoEnterpriseForm({ route, navigation }) {
  const { language } = useContext(LanguageContext);
  const recordedBenef = route?.params?.recordedBenef || null; // may be null
  const beneficiary = route?.params?.beneficiary || null; // UPSRLM member row
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

  const [loading, setLoading] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);

  // ---------------- NoEnterprise main form state ----------------
  const [activityOption, setActivityOption] = useState(''); // Q1 dropdown
  const [activitySpecify, setActivitySpecify] = useState('');

  const [noInterestOption, setNoInterestOption] = useState(''); // Q2 dropdown
  const [noInterestSpecify, setNoInterestSpecify] = useState('');
  const [wageInterestYesNo, setWageInterestYesNo] = useState(''); // Yes/No under "Interested in Wage Employment?"

  // Wage sub-form
  const [wageEmpTypes, setWageEmpTypes] = useState([]); // type_of_emp (multi)
  const [wagePlacementSectors, setWagePlacementSectors] = useState([]); // placement_sector (multi)
  const [wageExpSalary, setWageExpSalary] = useState(''); // exp_salary
  const [wageLocationChoice, setWageLocationChoice] = useState(''); // which button clicked
  const [wageDesiredLocationText, setWageDesiredLocationText] = useState(''); // for Desired State/District

  // Training requirement (Q3 on main)
  const [trainingRequiredYesNo, setTrainingRequiredYesNo] = useState(''); // is_training_required: "Yes"/"No"

  // Training sub-form
  const [trainingDepartmentOption, setTrainingDepartmentOption] = useState(''); // dropdown
  const [trainingDepartmentOtherText, setTrainingDepartmentOtherText] = useState('');
  const [selectedTrainingParents, setSelectedTrainingParents] = useState([]); // list of parent names
  const [trainingChildrenByParent, setTrainingChildrenByParent] = useState({}); // { parent: { child: true, otherText?: string } }
  const [trainingDuration, setTrainingDuration] = useState(''); // duration
  const [trainingLocationState, setTrainingLocationState] = useState('');
  const [trainingLocationDistrict, setTrainingLocationDistrict] = useState('');
  const [trainingLocationBlock, setTrainingLocationBlock] = useState('');
  const [trainingExpectedIncome, setTrainingExpectedIncome] = useState(''); // expected_income

  // Q4/Q5 on main form
  const [futureWillingYesNo, setFutureWillingYesNo] = useState('');
  const [hasShgCifYesNo, setHasShgCifYesNo] = useState(''); // cif fund
  const [cifAmount, setCifAmount] = useState(''); //cif fund
const [hasReceivedPartYesNo, setHasReceivedPartYesNo] = useState(''); // cif fund
  const [plannedBusiness, setPlannedBusiness] = useState('');
  // const [funds, setFunds] = useState([]);
  const [fundCards, setFundCards] = useState([]); //CIF fund card
  const [trainingLocationType, setTrainingLocationType] = useState("");
const [trainingType, setTrainingType] = useState([]);

// const FUND_TYPES = ["RF", "CIF", "CCL"];
 const labels = {
    heading: {
      en: "No Enterprise",
      hi: "कोई उद्यम नहीं",
    },
    currentActivity: {
      en: "Current Activity",
      hi: "वर्तमान गतिविधि",
    },
    question1: {
      en: "Are you involved in any activity currently?",
      hi: "क्या आप वर्तमान में किसी गतिविधि में शामिल हैं?",
    },
    helpText: {
      en: "Please select the activity type and specify details.",
      hi: "कृपया गतिविधि का प्रकार चुनें और विवरण लिखें।",
    },

    options: [
      { en: "SHG related Activity", hi: "एसएचजी से संबंधित गतिविधि" },
      { en: "Employed Full time", hi: "पूर्णकालिक रोजगार" },
      { en: "Employed Part time", hi: "अंशकालिक रोजगार" },
      { en: "Others", hi: "अन्य" },
    ],
  };

  const draftData = {
    memberName,
    activityOption,
    activitySpecify,

    noInterestOption,
    noInterestSpecify,

    wageInterestYesNo,
    wageEmpTypes,
    wagePlacementSectors,
    wageExpSalary,
    wageLocationChoice,
    wageDesiredLocationText,

    trainingRequiredYesNo,
    selectedTrainingParents,
    trainingChildrenByParent,
    trainingDuration,
    trainingDepartmentOption,
    trainingDepartmentOtherText,
    trainingLocationDistrict,
    trainingLocationBlock,
    trainingLocationState,
    trainingExpectedIncome,

    futureWillingYesNo,

    hasShgCifYesNo,
    hasReceivedPartYesNo,
    cifAmount,
  };
  

 useEffect(() => {
  const loadDraft = async () => {
    try {
      const saved = await AsyncStorage.getItem(draftKey);
      if (!saved) return;

      const d = JSON.parse(saved);

      setActivityOption(d.activityOption || '');
      setActivitySpecify(d.activitySpecify || '');

      setNoInterestOption(d.noInterestOption || '');
      setNoInterestSpecify(d.noInterestSpecify || '');

      setWageInterestYesNo(d.wageInterestYesNo || '');
      setWageEmpTypes(d.wageEmpTypes || []);
      setWagePlacementSectors(d.wagePlacementSectors || []);
      setWageExpSalary(d.wageExpSalary || '');
      setWageLocationChoice(d.wageLocationChoice || '');
      setWageDesiredLocationText(d.wageDesiredLocationText || '');

      setTrainingRequiredYesNo(d.trainingRequiredYesNo || '');
      setSelectedTrainingParents(d.selectedTrainingParents || []);
      setTrainingChildrenByParent(d.trainingChildrenByParent || {});
      setTrainingDuration(d.trainingDuration || '');
      setTrainingDepartmentOption(d.trainingDepartmentOption || '');
      setTrainingDepartmentOtherText(d.trainingDepartmentOtherText || '');
      setTrainingLocationDistrict(d.trainingLocationDistrict || '');
      setTrainingLocationBlock(d.trainingLocationBlock || '');
      setTrainingLocationState(d.trainingLocationState || '');
      setTrainingExpectedIncome(d.trainingExpectedIncome || '');

      setFutureWillingYesNo(d.futureWillingYesNo || '');

      setHasShgCifYesNo(d.hasShgCifYesNo || '');
      setHasReceivedPartYesNo(d.hasReceivedPartYesNo || '');
      setCifAmount(d.cifAmount || '');
    } catch (e) {
      console.log('Draft load failed', e);
    }
  };

  loadDraft();
}, [draftKey]);

// ===== Auto-save draft when any field changes =====
useEffect(() => {
  AsyncStorage.setItem(draftKey, JSON.stringify(draftData));
}, [draftData, draftKey]);

// ===== Save draft when app goes to background =====
useEffect(() => {
  const subscription = AppState.addEventListener('change', state => {
    if (state !== 'active') {
      AsyncStorage.setItem(draftKey, JSON.stringify(draftData));
    }
  });

  return () => subscription.remove();
}, [draftData, draftKey]);

  // ---------------- Effects: load user and auth token ----------------

  useEffect(() => {
    (async () => {
      try {
        const u = await getUser();
        if (u) {
          setLoggedUser(u);
          if (u.access) {
            gsApi.setAuthToken?.(u.access, u.refresh);
          }
        }
      } catch (e) {
        console.warn('Unable to load user in NoEnterpriseForm', e);
      }
    })();
  }, []);

  // CIF Fund Part
  const addFundCard = () => {
  setFundCards([
    ...fundCards,
    {
      loanType: '',
      receivedYesNo: '',
      amount: '',
      repaid: '',
       otherLoanTypeText: '', 
    }
  ]);
};
const deleteFundCard = (index) => {
  const copy = [...fundCards];
  copy.splice(index, 1);
  setFundCards(copy);
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
};

const getPendingColor = (pending) => {
  if (pending < 0) return 'red';
  if (pending === 0) return 'green';
  return 'red';
};
// CIF FUnd PArt


  // ---------------- SHG + recorded-benef helper logic ----------------

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
    let marital_status =
      beneficiary.marital_status ?? beneficiary.maritalStatus ?? '';
    let father_husband_name =
      beneficiary.father_husband ??
      beneficiary.father_husband_name ??
      beneficiary.relation_name ??
      '';

    let lokos_shg =
      lokosShgCode || beneficiary.shg_code || beneficiary.lokos_shg_code || null;

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

    // last resort: on-demand fetch from CRP block (if available)
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

    // created_by: prefer loggedUser numeric PK; fallback to routeCrpUserId if numeric
    let created_by_to_send = null;
    const candidate =
      loggedUser?.id ?? loggedUser?.user_id ?? loggedUser?.pk ?? routeCrpUserId;
    if (candidate !== null && candidate !== undefined) {
      if (typeof candidate === 'number') {
        created_by_to_send = candidate;
      } else if (typeof candidate === 'string' && /^\d+$/.test(candidate.trim())) {
        created_by_to_send = parseInt(candidate.trim(), 10);
      } else {
        created_by_to_send = null;
      }
    }

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
      enterprise_type: 'noep',
    };

    if (created_by_to_send !== null) {
      recordedPayload.created_by = created_by_to_send;
    }

    const recRes = await gsApi.createRecordedBeneficiary(recordedPayload);

    recordedBenefId =
      recRes?.TH_urid || recRes?.TH_URID || recRes?.id || null;

    if (!recordedBenefId) {
      throw new Error('Recorded beneficiary created but ID missing in response.');
    }

    return recordedBenefId;
  };
const memberCode = beneficiary.member_code || beneficiary.nic_member_code || 'TEMP';
const memberName = beneficiary.member_name || 'TEMP_NAME';
draftData.memberName = memberName;
const draftKey = `NO_ENTERPRISE_FORM_DRAFT_${memberCode}`;
  // ---------------- Wage helpers ----------------

  const toggleMultiSelect = (value, listSetter, currentList) => {
    if (currentList.includes(value)) {
      listSetter(currentList.filter((x) => x !== value));
    } else {
      listSetter([...currentList, value]);
    }
  };

  const wageLocationToFields = () => {
    // Returns { location_scope, location } based on wageLocationChoice and wageDesiredLocationText
    if (!wageLocationChoice) return { location_scope: null, location: null };

    if (wageLocationChoice === 'District') {
      return { location_scope: 'National', location: 'District' };
    }

    if (wageLocationChoice === 'Other District') {
      return { location_scope: 'National', location: 'Other District' };
    }

    if (wageLocationChoice === 'Other State') {
      return { location_scope: 'National', location: 'Other State' };
    }

    if (wageLocationChoice === 'Other Countries') {
      return { location_scope: 'National', location: 'Other Countries' };
    }
    return { location_scope: null, location: null };
  };

  // ---------------- Training selection helpers ----------------

  const toggleTrainingParent = (parent) => {
    setSelectedTrainingParents((prev) => {
      if (prev.includes(parent)) {
        // remove parent & its children
        const next = prev.filter((p) => p !== parent);
        setTrainingChildrenByParent((old) => {
          const copy = { ...old };
          delete copy[parent];
          return copy;
        });
        return next;
      }
      return [...prev, parent];
    });
  };

  const toggleTrainingChild = (parent, child) => {
    setTrainingChildrenByParent((prev) => {
      const forParent = prev[parent] || {};
      const newForParent = { ...forParent };
      if (newForParent[child]) {
        delete newForParent[child];
      } else {
        newForParent[child] = true;
      }
      return { ...prev, [parent]: newForParent };
    });
  };

  const setTrainingOtherChildText = (parent, text) => {
    setTrainingChildrenByParent((prev) => {
      const forParent = prev[parent] || {};
      return { ...prev, [parent]: { ...forParent, __otherText: text } };
    });
  };

  const buildTrainingSectorFields = () => {
    // sector: comma-separated selected parent sectors
    // training_module_name: "[Parent: child1, child2], [Parent2: childA, childB]" text
    const chosenParents = selectedTrainingParents;
    if (!chosenParents.length) return { sector: null, training_module_name: null };

    const sector = chosenParents.join(', ');

    const chunks = [];
    for (const parent of chosenParents) {
      // const conf = TRAINING_SECTORS.find((s) => s.parent.en === parent);
      const conf = TRAINING_SECTORS.find(
  (s) => s.parent.en === parent
);
      const kidsState = trainingChildrenByParent[parent] || {};
      const childNames = [];

      (conf?.children || []).forEach((child) => {

  const childKey = typeof child === "string" ? child : child.en;

  if (childKey === "Others") {

    if (kidsState["Others"]) {
      const txt = (kidsState.__otherText || "").trim();
      childNames.push(txt || "Others");
    }

  } else if (kidsState[childKey]) {
    childNames.push(childKey);
  }
});


      if (parent === 'Others') {
        // special final parent; allow just __otherText
        const otherText = (kidsState.__otherText || '').trim();
        if (otherText) {
          childNames.push(otherText);
        }
      }

      if (childNames.length) {
        chunks.push(`[${parent}: ${childNames.join(', ')}]`);
      }
    }

    const training_module_name = chunks.length ? chunks.join(', ') : null;
    
    return { sector, training_module_name };
  };
 
  // ---------------- Submit handler ----------------
  const handleSubmit = async () => {
  // ===== Enhanced Validations =====
  const t = (en, hi) => (language === "hi" ? hi : en);
  // Current Activity
  if (!activityOption) {
    Alert.alert(
       t("Validation","सत्यापन"),
          t(
            'Please answer "Are you involved in any activity currently?"',
            'कृपया बताएं — क्या आप वर्तमान में किसी गतिविधि में शामिल हैं?'
          )
    );
    return;
  }
  if (activityOption && (!activitySpecify || activitySpecify.trim() === '')) {
    Alert.alert(
      t("Validation", "सत्यापन"),
      t(
        "Please specify the details of your current activity.",
        "कृपया अपनी वर्तमान गतिविधि का विवरण दर्ज करें।"
      )
    );
    return;
  }

  // Reason for Not Opening Enterprise
  if (!noInterestOption) {
    Alert.alert(
      t("Validation", "सत्यापन"),
      t(
        'Please answer "Why are you not interested in opening an enterprise?"',
        'कृपया बताएं — आप उद्यम शुरू करने में रुचि क्यों नहीं रखते?'
      )
    );
    return;
  }
  if (noInterestOption === 'Others' && (!noInterestSpecify || noInterestSpecify.trim() === '')) {
    Alert.alert(
        t("Validation", "सत्यापन"),
      t(
        "Please specify your reason for not opening an enterprise.",
        "कृपया उद्यम शुरू न करने का कारण दर्ज करें।"
      )
    );
    return;
  }

  // Wage sub-form
  const wantsWageForm =
    noInterestOption === 'Interested in Wage Employment?' &&
    wageInterestYesNo === 'Yes';

  if (wantsWageForm) {
    if (!wageEmpTypes.length) {
      Alert.alert(
        t("Validation", "सत्यापन"),
        t(
          "Please select at least one Wage Employment type.",
          "कृपया कम से कम एक वेतन रोजगार विकल्प चुनें।"
        )
      );
      return;
    }
    if (!wagePlacementSectors.length) {
      Alert.alert(
        t("Validation", "सत्यापन"),
        t(
          "Please select at least one Placement Sector.",
          "कृपया कम से कम एक प्लेसमेंट सेक्टर चुनें।"
        )
      );
      return;
    }
    if (!wageExpSalary) {
      Alert.alert(
         t("Validation", "सत्यापन"),
        t(
          "Please select your expected Salary.",
          "कृपया अपनी अपेक्षित वेतन चुनें।"
        )
      );
      return;
    }
    const { location_scope, location } = wageLocationToFields();
    if (!location_scope || !location) {
      Alert.alert(
        t("Validation", "सत्यापन"),
        t(
          "Please select preferred work location.",
          "कृपया अपना पसंदीदा कार्य स्थान चुनें।"
        )
      );
      return;
    }
    // Desired State / District text
    if (
      (wageLocationChoice === 'Desired State' || wageLocationChoice === 'Desired District') &&
      (!wageDesiredLocationText || wageDesiredLocationText.trim() === '')
    ) {
      Alert.alert(
        t("Validation", "सत्यापन"),
        t(
          "Please specify preferred work location.",
          "कृपया अपना पसंदीदा कार्य स्थान दर्ज करें।"
        )
      );
      return;
    }
  }

  // Training sub-form
  const wantsTrainingForm = trainingRequiredYesNo === 'Yes';

  if (!trainingRequiredYesNo) {
    Alert.alert(
       t("Validation", "सत्यापन"),
      t(
        "Please answer whether you require training.",
        "कृपया बताएं — क्या आपको प्रशिक्षण चाहिए?"
      )
    );
    return;
  }

  if (wantsTrainingForm) {
    if (!trainingDepartmentOption) {
      Alert.alert(
          t("Validation", "सत्यापन"),
        t(
          "Please select preferred training department.",
          "कृपया अपना पसंदीदा प्रशिक्षण विभाग चुनें।"
        )
      );
      return;
    }
    if (trainingDepartmentOption === 'Others' && (!trainingDepartmentOtherText || trainingDepartmentOtherText.trim() === '')) {
      Alert.alert(
         t("Validation", "सत्यापन"),
        t(
          "Please specify preferred department.",
          "कृपया प्रशिक्षण विभाग दर्ज करें।"
        )
      );
      return;
    }
    const { sector, training_module_name } = buildTrainingSectorFields();
    if (!sector || !training_module_name) {
      Alert.alert(
         t("Validation", "सत्यापन"),
        t(
          "Please select at least one training sector and module.",
          "कृपया कम से कम एक प्रशिक्षण सेक्टर और मॉड्यूल चुनें।"
        )
      );
      return;
    }
    // Children "Others" text validation
    for (const parent of selectedTrainingParents) {
      const kidsState = trainingChildrenByParent[parent] || {};
      if (kidsState['Others'] && (!kidsState.__otherText || kidsState.__otherText.trim() === '')) {
        Alert.alert(
          t("Validation", "सत्यापन"),
      t(
        `Please specify the "Others" text for ${parentLabel} sector.`,
        `${parentLabel} सेक्टर के लिए "अन्य" का विवरण लिखें।`
      )
        );
        return;
      }
    }
    if (!trainingDuration) {
      Alert.alert(
        t("Validation", "सत्यापन"),
        t(
          "Please select preferred training duration.",
          "कृपया प्रशिक्षण अवधि चुनें।"
        )
      );
      return;
    }
    if (!trainingExpectedIncome) {
      Alert.alert(
       t("Validation", "सत्यापन"),
        t(
          "Please select expected salary after training.",
          "कृपया प्रशिक्षण के बाद अपेक्षित वेतन चुनें।"
        )
      );
      return;
    }
  }

  // Future Plans
  if (!futureWillingYesNo) {
    Alert.alert(
       t("Validation", "सत्यापन"),
      t(
        "Please answer whether you want to start a business.",
        "कृपया बताएं — क्या आप भविष्य में व्यवसाय शुरू करना चाहते हैं?"
      )
    );
    return;
  }
  if (futureWillingYesNo === 'Yes' && (!plannedBusiness || plannedBusiness.trim() === '')) {
    Alert.alert(
       t("Validation", "सत्यापन"),
      t(
        "Please describe your planned business.",
        "कृपया अपने प्रस्तावित व्यवसाय का विवरण दर्ज करें।"
      )
    );
    return;
  }
  // ===== Proceed to submit =====
  try {
    setLoading(true);

    // STEP 1: ensure recorded beneficiary exists
    const recordedBenefId = await ensureRecordedBeneficiary();

    // STEP 2: build NoEnterpriseForm payload
    const activityFullValue = activityOption
      ? `${activityOption}${activitySpecify ? `, ${activitySpecify}` : ''}`
      : '';

    let noIntReasonValue = '';
    if (noInterestOption === 'Personal Reasons') {
      noIntReasonValue = 'Personal Reasons';
    } else if (noInterestOption === 'Family Business') {
      noIntReasonValue = 'Family Business';
    } else if (noInterestOption === 'Others') {
      noIntReasonValue = noInterestSpecify || '';
    } else if (noInterestOption === 'Interested in Wage Employment?') {
      if (wageInterestYesNo === 'Yes') {
        noIntReasonValue = 'Interested in Wage Employment';
      } else if (wageInterestYesNo === 'No') {
        noIntReasonValue = 'Not interested in Wage Employment';
      }
    }

    const isTrainingRequiredField = trainingRequiredYesNo;

    // created_by logic
    let created_by_to_send = null;
    const candidate =
      loggedUser?.id ?? loggedUser?.user_id ?? loggedUser?.pk ?? routeCrpUserId;
    if (candidate !== null && candidate !== undefined) {
      if (typeof candidate === 'number') {
        created_by_to_send = candidate;
      } else if (typeof candidate === 'string' && /^\d+$/.test(candidate.trim())) {
        created_by_to_send = parseInt(candidate.trim(), 10);
      } else {
        created_by_to_send = null;
      }
    }

    const payloadNoEnterprise = {
      recorded_benef_id: recordedBenefId,
      if_shg_member_inv: activityFullValue || null,
      no_int_reason: noIntReasonValue || null,
      is_training_required: isTrainingRequiredField || null,
      future_willing: futureWillingYesNo === 'Yes',
      has_shg_cif: hasShgCifYesNo === 'Yes',
      cif_fund_amt: cifAmount || null,
      planned_business: plannedBusiness || null,
    };

    if (created_by_to_send !== null) {
      payloadNoEnterprise.created_by = created_by_to_send;
    }

    // STEP 3: create NoEnterpriseForm
    const noEpRes = await gsApi.createNoEnterpriseForm(payloadNoEnterprise);

    const noEpId =
      noEpRes?.TH_urid || noEpRes?.TH_URID || noEpRes?.id || null;

    if (!noEpId) {
      throw new Error(
        'No Enterprise form saved but ID missing in response.'
      );
    }

    // STEP 4: link recorded-beneficiaries.enterprise_id
    try {
      await gsApi.updateRecordedBeneficiary(recordedBenefId, {
        enterprise_id: noEpId,
      });
    } catch (e) {
      console.warn(
        'Failed to update recorded beneficiary enterprise_id for NoEnterpriseForm',
        e
      );
    }

    // STEP 5: create sub-forms (wage / training) if required
    if (wantsWageForm) {
      const { location_scope, location } = wageLocationToFields();

      let created_by_to_send = null;
      const candidate =
        loggedUser?.id ?? loggedUser?.user_id ?? loggedUser?.pk ?? routeCrpUserId;
      if (candidate !== null && candidate !== undefined) {
        if (typeof candidate === 'number') {
          created_by_to_send = candidate;
        } else if (typeof candidate === 'string' && /^\d+$/.test(candidate.trim())) {
          created_by_to_send = parseInt(candidate.trim(), 10);
        } else {
          created_by_to_send = null;
        }
      }

      const payloadWage = {
        enterprise_id: noEpId,
        type_of_emp: wageEmpTypes.join(', '),
        placement_sector: wagePlacementSectors.join(', '),
        exp_salary: wageExpSalary,
        location_scope,
        location,
      };

      if (created_by_to_send !== null) {
        payloadWage.created_by = created_by_to_send;
      }

      try {
        await gsApi.createNoEnterpriseWage(payloadWage);
      } catch (e) {
        console.warn('Failed to create NoEnterpriseWage', e);
      }
    }

    if (wantsTrainingForm) {
      const actualDepartment =
        trainingDepartmentOption === 'Others'
          ? trainingDepartmentOtherText || 'Others'
          : trainingDepartmentOption;

      const { sector, training_module_name } = buildTrainingSectorFields();
      const trainingLocation = buildTrainingLocation();

      const payloadTraining = {
        enterprise_id: noEpId,
        form_type: 'req',
        department: actualDepartment || null,
        sector: sector || null,
        training_module_name: training_module_name || null,
        duration: trainingDuration || null,
        location: trainingLocation || null,
        expected_income: trainingExpectedIncome || null,
      };

      let created_by_to_send = null;
      const candidate =
        loggedUser?.id ?? loggedUser?.user_id ?? loggedUser?.pk ?? routeCrpUserId;
      if (candidate !== null && candidate !== undefined) {
        if (typeof candidate === 'number') {
          created_by_to_send = candidate;
        } else if (typeof candidate === 'string' && /^\d+$/.test(candidate.trim())) {
          created_by_to_send = parseInt(candidate.trim(), 10);
        } else {
          created_by_to_send = null;
        }
      }

      if (created_by_to_send !== null) {
        payloadTraining.created_by = created_by_to_send;
      }

      try {
        await gsApi.createEnterpriseTrainingReq(payloadTraining);
      } catch (e) {
        console.warn('Failed to create EnterpriseTrainingReq for NoEnterpriseForm', e);
      }
    }
     await AsyncStorage.removeItem(draftKey);

    Alert.alert('Success', 'Details saved successfully.', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  } catch (err) {
    console.error('NoEnterpriseForm submit error', err);
    const serverMsg =
      err?.data?.detail ||
      (err?.data && typeof err.data === 'object'
        ? JSON.stringify(err.data)
        : null) ||
      err?.message ||
      'Failed to save details. Please try again.';
    Alert.alert('Error', serverMsg);
  } finally {
    setLoading(false);
  }
};
  const benefName =
    beneficiary?.member_name ||
    beneficiary?.name ||
    recordedBenef?.applicant_name ||
    '';
const reasonOptions = [
  { id: "personal", en: "Personal Reasons", hi: "व्यक्तिगत कारण" },
  { id: "family", en: "Family Business", hi: "पारिवारिक व्यवसाय" },
  { id: "wage", en: "Interested in Wage Employment?", hi: "वेतन रोजगार में रुचि है?" },
  { id: "other", en: "Others", hi: "अन्य" },
];
const toggleTrainingType = (val) => {
  setTrainingType((prev) =>
    prev.includes(val)
      ? prev.filter((v) => v !== val)
      : [...prev, val]
  );
};


  // ========= Render =========

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={{ marginTop: 20 }}>

  <LanguageToggle />
</View>
      <Text style={styles.heading}>{labels.heading[language]} — {benefName}</Text>

      {/* Q1: Are you involved in any activity currently? */}
      <Text style={styles.sectionHeading}>{labels.currentActivity[language]}</Text>
      <Text style={styles.label}>
          {labels.question1[language]}
      </Text>
      <Text style={styles.helpText}>
       {labels.helpText[language]}
      </Text>

      {[
         { en: 'SHG related Activity', hi: 'एसएचजी से संबंधित गतिविधि' },
         { en: 'Employed Full time', hi: 'पूर्णकालिक रोजगार' },
       { en: 'Employed Part time', hi:  'अंशकालिक रोजगार' },
  { en:  'Others', hi:  'अन्य' }
      ].map((opt) => (
        <CheckboxRow
        required
          key={opt.en}
          label={opt[language]}
          checked={activityOption === opt.en}
          onPress={() => setActivityOption(opt.en)}
        />
      ))}

      {activityOption ? (
        <TextInput
        required
          style={[styles.input, { minHeight: 60, marginTop: 6 }]}
           placeholder={
            language === "en"
              ? "Please specify details"
              : "कृपया विवरण लिखें"
          }
          multiline
          value={activitySpecify}
          onChangeText={setActivitySpecify}
        />
      ) : null}
   

      {/* Q2: Why are you not interested in opening an enterprise? */}
      <Text style={styles.sectionHeading}> {language === "hi"
    ? "उद्यम शुरू न करने का कारण"
    : "Reason for Not Opening Enterprise"}</Text>
      <Text style={styles.label}>
         {language === "hi"
    ? "आप उद्यम शुरू करने में रुचि क्यों नहीं रखते?"
    : "Why are you not interested in opening an enterprise?"}
      </Text>

      {
      reasonOptions.map((opt) => (
        <CheckboxRow
        required
           key={opt.id}
    label={language === "hi" ? opt.hi : opt.en}
    checked={noInterestOption === opt.id}
    onPress={() => {
      setNoInterestOption(opt.id);
      if (opt.id !== "wage") setWageInterestYesNo("");
    }}
        />
      ))}

      {noInterestOption === 'Others' && (
        <TextInput
          required
          style={[styles.input, { minHeight: 60, marginTop: 6 }]}
          placeholder={
      language === "hi"
        ? "कृपया कारण लिखें"
        : "Please specify your reason"
    }
          multiline
          value={noInterestSpecify}
          onChangeText={setNoInterestSpecify}
        />
      )}

      {noInterestOption === "wage" && (
        <>
            <>
              {/* Wage sub-form */}
              <Text style={styles.sectionHeading}>
                 {language === "hi"
        ? "वेतन रोजगार वरीयता"
        : "Wage Employment Preference"}
              </Text>

              {/* 1) type_of_emp */}
              <Text style={styles.label}>
                {language === "hi"
        ? "आप किस प्रकार के वेतन रोजगार में रुचि रखते हैं?"
        : "What type of Wage Employment are you interested in?"}
              </Text>
              <Text style={styles.helpText}>
                 {language === "hi"
        ? "आप एक या अधिक विकल्प चुन सकते हैं।"
        : "You can select one or more options."}
              </Text>
              {[
      { en: "Full Time", hi: "पूर्णकालिक" },
      { en: "Part Time", hi: "अंशकालिक" }
    ].map((opt) => (
                <CheckboxRow
                required
                  key={opt.en}
        label={language === "hi" ? opt.hi : opt.en}
        checked={wageEmpTypes.includes(opt.en)}
        onPress={() =>
          toggleMultiSelect(opt.en, setWageEmpTypes, wageEmpTypes)
        }
                />
              ))}

              {/* 2) placement_sector */}
              <Text style={[styles.label, { marginTop: 10 }]}>
                 {language === "hi"
        ? "आप किस प्रकार के प्लेसमेंट सेक्टर के बारे में सोच रहे हैं?"
        : "What type of Placement Sector have you thought of?"}
              </Text>
              <Text style={styles.helpText}>
               {language === "hi"
        ? "आप एक या अधिक विकल्प चुन सकते हैं।"
        : "You can select one or more options."}
              </Text>
              {[
                 { en: "Manufacturing Based Jobs", hi: "उत्पादन आधारित नौकरियां" },
      { en: "Service Based Jobs", hi: "सेवा आधारित नौकरियां" },
      { en: "Agriculture Based Jobs", hi: "कृषि आधारित नौकरियां" }
              ].map((opt) => (
                <CheckboxRow
                required
                  key={opt.en}
        label={language === "hi" ? opt.hi : opt.en}
        checked={wagePlacementSectors.includes(opt.en)}
        onPress={() =>
          toggleMultiSelect(opt.en, setWagePlacementSectors, wagePlacementSectors)
        }
                />
              ))}

              {/* 3) exp_salary */}
              <Text style={[styles.label, { marginTop: 10 }]}>
               {language === "hi"
        ? "आपकी अपेक्षित वेतन क्या है?"
        : "What is your expected Salary?"}
              </Text>
              <Text style={styles.helpText}>
                {language === "hi"
        ? "कृपया अपना मासिक वेतन चुनें।"
        : "Please select your expected monthly salary range."}
              </Text>
              {[
                'Under 10,000',
                '10,000 - 20,000',
                '20,000 - 30,000',
                'Above 30,000',
              ].map((opt) => (
                <CheckboxRow
                required
                  key={opt}
                  label={opt}
                  checked={wageExpSalary === opt}
                  onPress={() => setWageExpSalary(opt)}
                />
              ))}

              {/* 4) location_scope & location */}
              <Text style={[styles.label, { marginTop: 10 }]}>
                 {language === "hi"
        ? "आप कहां काम करना पसंद करेंगे?"
        : "What location are you comfortable with?"}
              </Text>
              <Text style={styles.helpText}>
                {language === "hi"
        ? "कृपया स्थान चुनें"
        : "Please select where you would be comfortable working."}
              </Text>

              {[
                ' District',
                'Other District',
                'Other State',
                'Other Countries',
              ].map((opt) => (
                <CheckboxRow
                required
                  key={opt}
                  label={opt}
                  checked={wageLocationChoice === opt}
                  onPress={() => {
                    setWageLocationChoice(opt);
                    if (
                      opt !== 'Desired State' &&
                      opt !== 'Desired District'
                    ) {
                      setWageDesiredLocationText('');
                    }
                  }}
                />
              ))}

              {(wageLocationChoice === 'Desired State' ||
                wageLocationChoice === 'Desired District') && (
                <TextInput
                required
                  style={[styles.input, { marginTop: 6 }]}
                  placeholder={
                    wageLocationChoice === 'Desired State'
                      ? 'Please specify desired State'
                      : 'Please specify desired District'
                  }
                  value={wageDesiredLocationText}
                  onChangeText={setWageDesiredLocationText}
                />
              )}
            </>
          {/* )} */}
        </>
      )}

      {/* Q3: Training requirement */}
      <Text style={styles.sectionHeading}>{language === "hi"
    ? "प्रशिक्षण की आवश्यकता"
    : "Training Requirement"}</Text>
      <Text style={styles.label}> {language === "hi"
    ? "क्या आपको कौशल प्रशिक्षण की आवश्यकता है?"
    : "Do you require skill training?"}</Text>
      <YesNoToggle
      required
        value={trainingRequiredYesNo}
        onChange={setTrainingRequiredYesNo}
      />

      {trainingRequiredYesNo === 'Yes' && (
        <>
         {/* Sectors / modules */}
          <Text style={styles.sectionHeading}>
            {language === "hi"
        ? "प्रशिक्षण के लिए पसंदीदा क्षेत्र"
        : "Preferred Sector for Training"}
          </Text>
          <Text style={styles.helpText}>
             {language === "hi"
        ? "पहले मुख्य सेक्टर चुनें। मुख्य सेक्टर चुनने के बाद, उससे संबंधित व्यवसाय / गतिविधि चुनें।"
        : "First select parent sectors. After selecting a parent sector, choose the related business / activity under it."}
          </Text>

          {TRAINING_SECTORS.map(({ parent, children }) => {
              const parentLabel =
    language === "hi" ? parent.hi : parent.en;

  const parentKey = parent.en; // use English key internally
            const parentSelected = selectedTrainingParents.includes(parentKey);
            const kidsState = trainingChildrenByParent[parentKey] || {};
            const hasOthersChild = children.includes('Others');
            return (
              <View key={parent} style={{ marginTop: 10 }}>
                <CheckboxRow
                required
                  label={parentLabel}
        checked={parentSelected}
        onPress={() => toggleTrainingParent(parentKey)}
                />
                {parentSelected && (
                  <View style={{ marginLeft: 16, marginTop: 4 }}>
                    {children.map((child) => {
                      const childLabel =
              language === "hi" ? child.hi : child.en;

            const childKey = child.en;
                      if (childKey === 'Others') {
                        return (
                          <View key={`${parentKey}-${childKey}`} style={{ marginTop: 6 }}>
                            <CheckboxRow
                            required
                              label={
                      language === "hi"
                        ? "अन्य (कृपया विवरण लिखें)"
                        : "Others (Please specify)"
                    }
                    checked={!!kidsState["Others"]}
                    onPress={() =>
                      toggleTrainingChild(parentKey, "Others")
                    }
                            />
                            {kidsState['Others'] && (
                              <TextInput
                              required
                                style={[styles.input, { marginTop: 4 }]}
                                placeholder={
                        language === "hi"
                          ? "कृपया विवरण लिखें"
                          : "Please specify"
                      }
                      value={kidsState.__otherText || ""}
                      onChangeText={txt =>
                        setTrainingOtherChildText(parentKey, txt)
                      }
                              />
                            )}
                          </View>
                        );
                      }
                      return (
                        <CheckboxRow
                        required
                     key={`${parentKey}-${childKey}`}
                label={childLabel}
                checked={!!kidsState[childKey]}
                onPress={() =>
                  toggleTrainingChild(parentKey, childKey)
                }
                        />
                      );
                    })}
                    {parent.en === 'Others' && (
                      <TextInput
                      required
                        style={[styles.input, { marginTop: 4 }]}
                       placeholder={
                language === "hi"
                  ? "कृपया उप-क्षेत्र लिखें"
                  : "Please specify sub-sector"
              }
              value={kidsState.__otherText || ""}
              onChangeText={txt =>
                setTrainingOtherChildText(parentKey, txt)
              }
                      />
                    )}
                  </View>
                )}
              </View>
            );
          })}

<Text style={[styles.label, { marginTop: 12 }]}>
  {language === "hi"
    ? "आप किस प्रकार का प्रशिक्षण पसंद करते हैं?"
    : "What is your preferred training type?"}
</Text>

{[
  { en: "Residential", hi: "आवासीय" },
  { en: "Non-Residential", hi: "गैर-आवासीय" },
].map((opt) => (
  <CheckboxRow
    key={opt.en}
    label={language === "hi" ? opt.hi : opt.en}
    checked={trainingType.includes(opt.en)}
    onPress={() => toggleTrainingType(opt.en)}
  />
))}



          {/* Duration */}
          <Text style={[styles.label, { marginTop: 12 }]}>
              {language === "hi"
    ? "एक स्लॉट में आप कितने दिनों का प्रशिक्षण लेने में सहज हैं?"
    : "How many days of training are you comfortable in one slot?"}
          </Text>
          {[
            { en: "Under 7 days", hi: "7 दिनों से कम" },
  { en: "7 days", hi: "7 दिन" },
  { en: "15 days", hi: "15 दिन" },
  { en: "30 days", hi: "30 दिन" },
  { en: "Over 30 days", hi: "30 दिनों से अधिक" },
          ].map((opt) => (
            <CheckboxRow
            required
                 key={opt.en}
    label={language === "hi" ? opt.hi : opt.en}
    checked={trainingDuration === opt.en}
    onPress={() => setTrainingDuration(opt.en)}
  />
          ))}
          {/* Department */}
          <Text style={[styles.label, { marginTop: 10 }]}>
            {language === "hi"
    ? "प्रशिक्षण के लिए आपका पसंदीदा विभाग कौन-सा है?"
    : "Which is your preferred department for training?"}
          </Text>
          {[ { en: "NRLM", hi: "एनआरएलएम" },
  { en: "RSETI", hi: "आरसेटीआई" },
  { en: "NABARD", hi: "नाबार्ड" },
  { en: "UPSDM", hi: "यूपीएसडीएम" },
  { en: "Others", hi: "अन्य" },].map((opt) => (
            <CheckboxRow
            required
               key={opt.en}
    label={language === "hi" ? opt.hi : opt.en}
    checked={trainingDepartmentOption === opt.en}
    onPress={() => setTrainingDepartmentOption(opt.en)}
  />
          ))}
          {trainingDepartmentOption === 'Others' && (
            <TextInput
            required
              style={[styles.input, { marginTop: 6 }]}
              pplaceholder={
      language === "hi"
        ? "कृपया विभाग का विवरण लिखें"
        : "Please specify the department"
    }
              value={trainingDepartmentOtherText}
              onChangeText={setTrainingDepartmentOtherText}
            />
          )}
          <Text style={[styles.label, { marginTop: 12 }]}>
  {language === "hi"
    ? "आपका पसंदीदा प्रशिक्षण स्थान क्या है?"
    : "What is your preferred training location?"}
</Text>

<Text style={styles.helpText}>
  {language === "hi"
    ? "कृपया अपना पसंदीदा राज्य, जिला और ब्लॉक भरें।"
    : "Please fill your preferred State, District and Block."}
</Text>

<Text style={[styles.smallLabel, { marginTop: 8 }]}>
  {language === "hi" ? "स्थान प्रकार चुनें" : "Select Location Type"}
</Text>

<View style={styles.input}>
  <Picker
    selectedValue={trainingLocationType}
    onValueChange={(value) => setTrainingLocationType(value)}
  >
    <Picker.Item
      label={language === "hi" ? "स्थान चुनें" : "Select Location"}
      value=""
    />
    <Picker.Item
      label={language === "hi" ? "राज्य" : "State"}
      value="state"
    />
    <Picker.Item
      label={language === "hi" ? "जिला" : "District"}
      value="district"
    />
    <Picker.Item
      label={language === "hi" ? "ब्लॉक" : "Block"}
      value="block"
    />
    <Picker.Item
      label={language === "hi" ? "गाँव" : "Village"}
      value="village"
    />
  </Picker>
</View>


          {/* Expected income after training */}
          <Text style={[styles.label, { marginTop: 12 }]}>
            {language === "hi"
    ? "प्रशिक्षण के बाद आपकी अपेक्षित आय (वेतन) क्या है?"
    : "What is your expected Salary after training?"}
          </Text>
          {[
             { en: "Under 10,000", hi: "10,000 से कम" },
  { en: "10,000 - 20,000", hi: "10,000 - 20,000" },
  { en: "20,000 - 30,000", hi: "20,000 - 30,000" },
  { en: "Above 30,000", hi: "30,000 से अधिक" },
          ].map((opt) => (
            <CheckboxRow
            required
              key={opt.en}
    label={language === "hi" ? opt.hi : opt.en}
    checked={trainingExpectedIncome === opt.en}
    onPress={() => setTrainingExpectedIncome(opt.en)}
            />
          ))}
        </>
      )}

      {/* Q4: future_willing */}
      <Text style={styles.sectionHeading}>{language === "hi" ? "भविष्य की योजना" : "Future Plans"}</Text>
      <Text style={styles.label}>
        {language === "hi"
    ? "क्या आप भविष्य में व्यवसाय शुरू करना चाहते हैं?"
    : "Are you willing to start a business in future?"}
      </Text>
      <YesNoToggle
      required
        value={futureWillingYesNo}
        onChange={setFutureWillingYesNo}
      />
      <Text style={styles.sectionHeading}>{language === "hi" ? "अनिवार्य स्वयं सहायता समूह (SHG) निधि अनुभाग" : "Mandatory SHG Fund Section"}</Text>

<Text style={styles.label}>{language === "hi"
    ? "क्या आपके SHG को अनिवार्य फंड प्राप्त हुआ है?"
    : "Have your SHG received mandatory Fund?"}</Text>
<YesNoToggle
required
  value={hasShgCifYesNo}
  onChange={setHasShgCifYesNo}
   labels={{
    yes: language === "hi" ? "हाँ" : "Yes",
    no: language === "hi" ? "नहीं" : "No",
  }}
/>

{hasShgCifYesNo === "Yes" && (
  <>
    {/* ADD BUTTON */}
    <TouchableOpacity
      style={styles.addBtn}
      onPress={addFundCard}
    >
      <Text style={{ fontWeight: "600" }}>+ Add Fund</Text>
    </TouchableOpacity>

    {/* FUND CARDS */}
    {fundCards.map((fund, index) => (
      <View key={index} style={styles.card}>
 <TouchableOpacity
      onPress={() => deleteFundCard(index)}
      style={styles.deleteBtn}
    >
      <Text style={{ color: "white", fontWeight: "600" }}>Delete</Text>
    </TouchableOpacity>
        {/* LOAN TYPE DROPDOWN */}
        <Text style={styles.label}>Please specify if  your SHG has recieved these mandatory funds</Text>

        {["RF", "CIF", "CCL","Other"].map(type => (
          <TouchableOpacity
            key={type}
            style={styles.radioRow}
            onPress={() => {
              const copy = [...fundCards];
              copy[index].loanType = type;
              setFundCards(copy);
            }}
          >
            <View style={[
              styles.radio,
              fund.loanType === type && styles.radioSelected
            ]} />

            <Text>{type}</Text>
          </TouchableOpacity>
        ))}
        {fund.loanType === "Other" && (
  <>
    <Text style={styles.label}>
      {language === "hi" ? "कृपया बताएं" : "Please specify"}
    </Text>

    <TextInput
      style={styles.input}
      value={fund.otherLoanTypeText}
      onChangeText={(v) => {
        const copy = [...fundCards];
        copy[index].otherLoanTypeText = v;
        setFundCards(copy);
      }}
      placeholder={language === "hi" ? "प्रकार दर्ज करें" : "Enter type"}
    />
  </>
)}

        {/* RECEIVED? */}
        <Text style={styles.label}>
          {language === "hi"
            ? "क्या आपको इस फंड का कुछ हिस्सा मिला?"
            : "Have you received part of this fund?"}
        </Text>

        <YesNoToggle
          value={fund.receivedYesNo}
          onChange={(v) => {
            const copy = [...fundCards];
            copy[index].receivedYesNo = v;
            setFundCards(copy);
          }}
          labels={{
            yes: language === "hi" ? "हाँ" : "Yes",
            no: language === "hi" ? "नहीं" : "No",
          }}
        />

        {/* AMOUNT FIELDS */}
        {fund.receivedYesNo === "Yes" && (
          <>
            <Text style={styles.label}>Amount Received</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={fund.amount}
              onChangeText={(v) => {
                const copy = [...fundCards];
                copy[index].amount = v;
                setFundCards(copy);
                 setCifAmount(v);
              }}
            />

            <Text style={styles.label}>Amount Repaid</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={fund.repaid}
              onChangeText={(v) => {
                const copy = [...fundCards];
                copy[index].repaid = v;
                setFundCards(copy);
              }}
            />

            {/* STATUS IN GREEN */}
            <View style={{ marginTop: 8 }}>
  {fund.amount ? (
    <>
      <Text
        style={{
          color: getStatusColor(fund.amount, fund.repaid),
          fontWeight: '600',
          marginBottom: 4,
        }}
      >
        Status: {getStatus(fund.amount, fund.repaid)}
      </Text>

      <Text
        style={{
          color: getPendingColor(
            getPending(fund.amount, fund.repaid)
          ),
          fontWeight: '600',
        }}
      >
        Pending Amount: {getPending(fund.amount, fund.repaid)}
      </Text>
    </>
  ) : null}
</View>

          </>
        )}

      </View>
    ))}
  </>
)}

      {/* Submit button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.submitButtonText}>{language === "hi" ? "जमा करें" : "Submit"}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

// ========= Styles =========

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
    marginTop: 6,
    marginBottom: 4,
  },
  smallLabel: {
    fontSize: 13,
    color: '#555555',
  },
  helpText: {
    fontSize: 12,
    color: '#777',
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
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#EE6969',
    borderRadius: 4,
    marginRight: 8,
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
  smallBtn: {
    backgroundColor: '#EEE',
    padding: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
    borderColor: '#EE6969',
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
   addBtn:{
    padding:10,
    backgroundColor:"#e3e3e3",
    borderRadius:8,
    marginTop:10,
    alignSelf:"flex-start"
  },
  card:{
    backgroundColor:"#fff",
    padding:12,
    borderRadius:10,
    marginTop:10,
    borderWidth:1,
    borderColor:"#ccc"
  },
  radio:{
    width:18,
    height:18,
    borderWidth:2,
    borderRadius:20,
    marginRight:8
  },
  radioSelected:{
    backgroundColor:"#007b55"
  },
  radioRow:{
    flexDirection:"row",
    alignItems:"center",
    marginVertical:4
  },
  deleteBtn:{
  backgroundColor:"#d9534f",
  paddingVertical:6,
  paddingHorizontal:12,
  borderRadius:16,
  alignSelf:"flex-end",
  marginBottom:8
},
 status: {
    marginTop: 5,
    fontWeight: '600',
  },
  pending: {
    fontWeight: '600',
  },
});
