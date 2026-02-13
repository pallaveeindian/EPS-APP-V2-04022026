// src/screens/screensProductionApp/FormSections/ExistingEnterpriseLoanSubsidySection.jsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import LanguageToggle from '../../../components/LanguageToggle';
import { LanguageContext } from '../../../components/LanguageContext';
import { useContext } from 'react';
// const YES_NO = ['Yes', 'No'];
const YES_NO = [
  { en: 'Yes', hi: 'हाँ' },
  { en: 'No', hi: 'नहीं' },
];

/**
 * Parent–child tree for loan/subsidy institutions and schemes
 * Reuses the same structure you specified for sources.
 */
// const INSTITUTION_SCHEME_TREE = [
//   {
//     parent: 'MSME / Industry Department',
//     children: [
//       'UP MSME Promotion Policy 2022',
//       'ODOP (One District One Product)',
//       'Vishwakarma Shram Samman Yojana',
//       'Chief Minister Youth Entrepreneur Development Campaign',
//       'Micro-food Industries Promotion',
//       'Capital Subsidy Scheme',
//     ],
//   },
//   {
//     parent: 'Women Welfare / Women Empowerment Department',
//     children: ['Mahila Samarthya Yojana'],
//   },
//   {
//     parent: 'Village Industries / Khadi and Village Industries Department',
//     children: [
//       'Khadi & Village Industries (KVIC UP) Loan Assistance',
//       'Margin Money Scheme',
//     ],
//   },
//   {
//     parent: 'Agriculture / Animal Husbandry Department',
//     children: [
//       'Kamdhenu Dairy Yojana',
//       'UP Food Processing Industry Support',
//     ],
//   },
//   {
//     parent: 'Department of Social Welfare',
//     children: ['PM AJAY'],
//   },
//   {
//     parent: 'Department of Fisheries',
//     children: ['Chief Minister Matsya Sampada Yojana'],
//   },
//   {
//     parent: 'OBC Finance Development Corporation',
//     children: ['Self-employment loans'],
//   },
//   {
//     parent: 'NABARD Schemes for SHGs & Rural Enterprises',
//     children: [
//       'Micro Enterprise Development Programme (MEDP)',
//       'Livelihood Enterprise Development Programme (LEDP)',
//       'Grant for capability building',
//       'Loan refinancing',
//     ],
//   },
//   {
//     parent: 'Central Government Schemes (Also including NABARD)',
//     children: [
//       'Micro Enterprise Development Programme (MEDP)',
//       'Livelihood Enterprise Development Programme (LEDP)',
//       'Grant for capability building',
//       'Loan refinancing',
//     ],
//   },
//   {
//     parent: 'Other Schemes',
//     children: [
//       'Mudra Loan (for women entrepreneurs)',
//       'Stand-Up India (women SC/ST entrepreneurs)',
//       'ZED (Zero Defect Zero Effect) – Women MSME',
//       'Women Entrepreneurship Fund / Scheme',
//       'Coir Vikas Yojana',
//       'Prime Minister Employment Generation Programme (PMEGP)',
//       'PM SVANidhi',
//       'SHG-Bank Linkage',
//       'PM-FME (PM Formalization of Micro Food Processing Enterprises)',
//       'Dairy Entrepreneur Development Scheme',
//       'Prime Minister Matsya Sampada Yojana',
//       'PMFME (Micro Food Processing)',
//       'SFURTI (Scheme of Fund for Regeneration of Traditional Industries)',
//       'ASPIRE (A Scheme for Promotion of Innovation, Rural Industry and Entrepreneurship)',
//       'AGEY',
//       'SVEP',
//       'PMFME',
//       'PATB',
//     ],
//   },
//   {
//     parent: 'Others (Specify)',
//     children: ['Others'],
//   },
// ];

const INSTITUTION_SCHEME_TREE = [
  {
    parent: { en: 'MSME / Industry Department', hi: 'एमएसएमई / उद्योग विभाग' },
    children: [
      { en: 'UP MSME Promotion Policy 2022', hi: 'यूपी एमएसएमई प्रोत्साहन नीति 2022' },
      { en: 'ODOP (One District One Product)', hi: 'ओडीओपी (एक जिला एक उत्पाद)' },
      { en: 'Vishwakarma Shram Samman Yojana', hi: 'विश्वकर्मा श्रम सम्मान योजना' },
      { en: 'Chief Minister Youth Entrepreneur Development Campaign', hi: 'मुख्यमंत्री युवा उद्यमी विकास अभियान' },
      { en: 'Micro-food Industries Promotion', hi: 'सूक्ष्म खाद्य उद्योग प्रोत्साहन' },
      { en: 'Capital Subsidy Scheme', hi: 'पूंजी सब्सिडी योजना' },
    ],
  },
  {
    parent: { en: 'Women Welfare / Women Empowerment Department', hi: 'महिला कल्याण / महिला सशक्तिकरण विभाग' },
    children: [
      { en: 'Mahila Samarthya Yojana', hi: 'महिला सामर्थ्य योजना' },
    ],
  },
  {
    parent: { en: 'Village Industries / Khadi and Village Industries Department', hi: 'ग्रामोद्योग / खादी एवं ग्रामोद्योग विभाग' },
    children: [
      { en: 'Khadi & Village Industries (KVIC UP) Loan Assistance', hi: 'खादी एवं ग्रामोद्योग (केवीआईसी यूपी) ऋण सहायता' },
      { en: 'Margin Money Scheme', hi: 'मार्जिन मनी योजना' },
    ],
  },
  {
    parent: { en: 'Agriculture / Animal Husbandry Department', hi: 'कृषि / पशुपालन विभाग' },
    children: [
      { en: 'Kamdhenu Dairy Yojana', hi: 'कामधेनु डेयरी योजना' },
      { en: 'UP Food Processing Industry Support', hi: 'यूपी खाद्य प्रसंस्करण उद्योग सहायता' },
    ],
  },
  {
    parent: { en: 'Department of Social Welfare', hi: 'समाज कल्याण विभाग' },
    children: [
      { en: 'PM AJAY', hi: 'पीएम अजय' },
    ],
  },
  {
    parent: { en: 'Department of Fisheries', hi: 'मत्स्य विभाग' },
    children: [
      { en: 'Chief Minister Matsya Sampada Yojana', hi: 'मुख्यमंत्री मत्स्य संपदा योजना' },
    ],
  },
  {
    parent: { en: 'OBC Finance Development Corporation', hi: 'ओबीसी वित्त विकास निगम' },
    children: [
      { en: 'Self-employment loans', hi: 'स्वरोजगार ऋण' },
    ],
  },
  {
    parent: { en: 'NABARD Schemes for SHGs & Rural Enterprises', hi: 'नाबार्ड योजनाएँ (एसएचजी एवं ग्रामीण उद्यम)' },
    children: [
      { en: 'Micro Enterprise Development Programme (MEDP)', hi: 'सूक्ष्म उद्यम विकास कार्यक्रम (MEDP)' },
      { en: 'Livelihood Enterprise Development Programme (LEDP)', hi: 'आजीविका उद्यम विकास कार्यक्रम (LEDP)' },
      { en: 'Grant for capability building', hi: 'क्षमता निर्माण हेतु अनुदान' },
      { en: 'Loan refinancing', hi: 'ऋण पुनर्वित्त' },
    ],
  },
  {
    parent: { en: 'Central Government Schemes (Also including NABARD)', hi: 'केंद्रीय सरकार की योजनाएँ (नाबार्ड सहित)' },
    children: [
      { en: 'Micro Enterprise Development Programme (MEDP)', hi: 'सूक्ष्म उद्यम विकास कार्यक्रम (MEDP)' },
      { en: 'Livelihood Enterprise Development Programme (LEDP)', hi: 'आजीविका उद्यम विकास कार्यक्रम (LEDP)' },
      { en: 'Grant for capability building', hi: 'क्षमता निर्माण हेतु अनुदान' },
      { en: 'Loan refinancing', hi: 'ऋण पुनर्वित्त' },
    ],
  },
  {
    parent: { en: 'Other Schemes', hi: 'अन्य योजनाएँ' },
    children: [
      { en: 'Mudra Loan (for women entrepreneurs)', hi: 'मुद्रा ऋण (महिला उद्यमियों के लिए)' },
      { en: 'Stand-Up India (women SC/ST entrepreneurs)', hi: 'स्टैंड-अप इंडिया (महिला एससी/एसटी उद्यमी)' },
      { en: 'ZED (Zero Defect Zero Effect) – Women MSME', hi: 'जेडईडी (जीरो डिफेक्ट जीरो इफेक्ट) – महिला एमएसएमई' },
      { en: 'Women Entrepreneurship Fund / Scheme', hi: 'महिला उद्यमिता निधि / योजना' },
      { en: 'Coir Vikas Yojana', hi: 'कोयर विकास योजना' },
      { en: 'Prime Minister Employment Generation Programme (PMEGP)', hi: 'प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP)' },
      { en: 'PM SVANidhi', hi: 'पीएम स्वनिधि' },
      { en: 'SHG-Bank Linkage', hi: 'एसएचजी-बैंक लिंकेज' },
      { en: 'PM-FME (PM Formalization of Micro Food Processing Enterprises)', hi: 'पीएम-एफएमई (सूक्ष्म खाद्य प्रसंस्करण उद्यम औपचारिककरण)' },
      { en: 'Dairy Entrepreneur Development Scheme', hi: 'डेयरी उद्यमी विकास योजना' },
      { en: 'Prime Minister Matsya Sampada Yojana', hi: 'प्रधानमंत्री मत्स्य संपदा योजना' },
      { en: 'PMFME (Micro Food Processing)', hi: 'पीएमएफएमई (सूक्ष्म खाद्य प्रसंस्करण)' },
      { en: 'SFURTI (Scheme of Fund for Regeneration of Traditional Industries)', hi: 'स्फूर्ति (परंपरागत उद्योग पुनर्जीवन निधि योजना)' },
      { en: 'ASPIRE', hi: 'एएसपीआईआरई' },
      { en: 'AGEY', hi: 'एजीईवाई' },
      { en: 'SVEP', hi: 'एसवीईपी' },
      { en: 'PMFME', hi: 'पीएमएफएमई' },
      { en: 'PATB', hi: 'पीएटीबी' },
    ],
  },
  {
    parent: { en: 'Others (Specify)', hi: 'अन्य (विवरण दें)' },
    children: [
      { en: 'Others', hi: 'अन्य' },
    ],
  },
];

const SUBSIDY_TYPE_OPTIONS = [
  'Direct',
  'Indirect',
  'Cross',
  'Targeted',
  'Others',
];

const REPAYMENT_STATUS_OPTIONS = [
  'Regular / On time',
  'Partially paid',
  'Not yet started',
  'Fully repaid',
  'Default / Irregular',
  'Others',
];

// const YesNoToggle = ({ value, onChange }) => (
//   <View style={styles.yesNoRow}>
//     {YES_NO.map((opt) => (
//       <TouchableOpacity
//         key={opt}
//         style={[
//           styles.yesNoBtn,
//           value === opt && styles.yesNoBtnActive,
//         ]}
//         onPress={() => onChange(opt)}
//       >
//         <Text
//           style={[
//             styles.yesNoText,
//             value === opt && styles.yesNoTextActive,
//           ]}
//         >
//           {opt}
//         </Text>
//       </TouchableOpacity>
//     ))}
//   </View>
// );

const YesNoToggle = ({ value, onChange, language }) => (
  <View style={styles.yesNoRow}>
    {YES_NO.map((opt) => {
      const label = language === 'hi' ? opt.hi : opt.en;

      return (
        <TouchableOpacity
          key={opt.en}
          style={[
            styles.yesNoBtn,
            value === opt.en && styles.yesNoBtnActive,
          ]}
          onPress={() => onChange(opt.en)} // Always store English
        >
          <Text
            style={[
              styles.yesNoText,
              value === opt.en && styles.yesNoTextActive,
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);


// const InstitutionTree = ({ value, onChange }) => {
//   const selectedTree = Array.isArray(value) ? value : [];

//   const isParentSelected = (parent) =>
//     !!selectedTree.find((row) => row.parent === parent);

//   const isChildSelected = (parent, child) => {
//     const row = selectedTree.find((r) => r.parent === parent);
//     return !!row && row.children?.includes(child);
//   };

//   const toggleParent = (parent) => {
//     const exists = selectedTree.find((row) => row.parent === parent);
//     let updated;
//     if (exists) {
//       updated = selectedTree.filter((row) => row.parent !== parent);
//     } else {
//       updated = [...selectedTree, { parent, children: [] }];
//     }
//     onChange(updated);
//   };

//   const toggleChild = (parent, child) => {
//     const existing = selectedTree.find((row) => row.parent === parent);
//     let updated = [...selectedTree];
//     if (!existing) {
//       updated.push({ parent, children: [child] });
//     } else {
//       const children = existing.children || [];
//       const has = children.includes(child);
//       const newChildren = has
//         ? children.filter((c) => c !== child)
//         : [...children, child];
//       updated = updated.map((row) =>
//         row.parent === parent ? { ...row, children: newChildren } : row
//       );
//     }
//     onChange(updated);
//   };

//   return (
//     <View style={{ marginTop: 8 }}>
//       {INSTITUTION_SCHEME_TREE.map((group) => {
//         const parentSelected = isParentSelected(group.parent);
//         return (
//           <View key={group.parent} style={styles.treeGroup}>
//             <TouchableOpacity
//               onPress={() => toggleParent(group.parent)}
//               style={styles.treeParentRow}
//             >
//               <Text style={styles.treeParentText}>{group.parent}</Text>
//               <Text>{parentSelected ? '☑' : '☐'}</Text>
//             </TouchableOpacity>

//             {parentSelected && (
//               <View style={styles.treeChildrenBlock}>
//                 {group.children.map((child) => (
//                   <TouchableOpacity
//                     key={child}
//                     style={styles.treeChildRow}
//                     onPress={() => toggleChild(group.parent, child)}
//                   >
//                     <Text style={styles.treeChildCheckbox}>
//                       {isChildSelected(group.parent, child) ? '☑' : '☐'}
//                     </Text>
//                     <Text style={styles.treeChildLabel}>{child}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             )}
//           </View>
//         );
//       })}
//     </View>
//   );
// };

const InstitutionTree = ({ value, onChange, language }) => {
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
      {INSTITUTION_SCHEME_TREE.map((group) => {
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
              <Text style={styles.treeParentText}>
                {parentLabel}
              </Text>
              <Text>{parentSelected ? '☑' : '☐'}</Text>
            </TouchableOpacity>

            {/* {parentSelected && (
              <View style={styles.treeChildrenBlock}>
                {group.children.map((child) => {
                  const childEn = child.en;
                  const childLabel =
                    language === 'hi' ? child.hi : child.en;

                  return (
                    <TouchableOpacity
                      key={childEn}
                      style={styles.treeChildRow}
                      onPress={() => toggleChild(parentEn, childEn)}
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
            )} */}
            {parentSelected && (
  <View style={styles.treeChildrenBlock}>
    {group.children.map((child) => {
      const childEn = child.en;
      const childLabel =
        language === 'hi' ? child.hi : child.en;

      const isSelected = isChildSelected(parentEn, childEn);

      return (
        <View key={childEn}>
          <TouchableOpacity
            style={styles.treeChildRow}
            onPress={() => toggleChild(parentEn, childEn)}
          >
            <Text style={styles.treeChildCheckbox}>
              {isSelected ? '☑' : '☐'}
            </Text>
            <Text style={styles.treeChildLabel}>
              {childLabel}
            </Text>
          </TouchableOpacity>

          {/* ✅ If Others child selected, show text input */}
          {childEn === 'Others' && isSelected && (
            <TextInput
              style={[styles.input, { marginTop: 6 }]}
              placeholder={
                language === 'hi'
                  ? 'कृपया विवरण दें'
                  : 'Please specify'
              }
              value={
                selectedTree.find(r => r.parent === parentEn)
                  ?.others_specify || ''
              }
              onChangeText={(txt) => {
                const updated = selectedTree.map((row) =>
                  row.parent === parentEn
                    ? { ...row, others_specify: txt }
                    : row
                );
                onChange(updated);
              }}
            />
          )}
        </View>
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


const computeTreeTitle = (tree, fallback) => {
  if (!Array.isArray(tree) || tree.length === 0) return fallback;
  const firstParent = tree[0]?.parent;
  if (!firstParent) return fallback;
  return firstParent;
};

const bankOptions = [
  { label: { en: "State Bank of India (SBI)", hi: "भारतीय स्टेट बैंक (SBI)" }, value: "SBI" },
  { label: { en: "Punjab National Bank (PNB)", hi: "पंजाब नेशनल बैंक (PNB)" }, value: "PNB" },
  { label: { en: "Bank of Baroda (BoB)", hi: "बैंक ऑफ बड़ौदा (BoB)" }, value: "BOB" },
  { label: { en: "Canara Bank", hi: "केनरा बैंक" }, value: "CANARA" },
  { label: { en: "Central Bank of India", hi: "सेंट्रल बैंक ऑफ इंडिया" }, value: "CBI" },
  { label: { en: "Indian Bank", hi: "इंडियन बैंक" }, value: "INDIAN_BANK" },
  { label: { en: "Indian Overseas Bank", hi: "इंडियन ओवरसीज़ बैंक" }, value: "IOB" },
  { label: { en: "UCO Bank", hi: "यूको बैंक" }, value: "UCO" },
  { label: { en: "Union Bank of India", hi: "यूनियन बैंक ऑफ इंडिया" }, value: "UNION" },

  { label: { en: "HDFC Bank", hi: "एचडीएफसी बैंक" }, value: "HDFC" },
  { label: { en: "ICICI Bank", hi: "आईसीआईसीआई बैंक" }, value: "ICICI" },
  { label: { en: "Axis Bank", hi: "एक्सिस बैंक" }, value: "AXIS" },
  { label: { en: "Kotak Mahindra Bank", hi: "कोटक महिंद्रा बैंक" }, value: "KOTAK" },
  { label: { en: "IndusInd Bank", hi: "इंडसइंड बैंक" }, value: "INDUSIND" },
  { label: { en: "YES Bank", hi: "यस बैंक" }, value: "YES" },

  { label: { en: "Prathama Bank", hi: "प्रथमा बैंक" }, value: "PRATHAMA" },
  { label: { en: "Allahabad UP Gramin Bank", hi: "इलाहाबाद यूपी ग्रामीण बैंक" }, value: "AUPGB" },

  { label: { en: "District Central Cooperative Bank", hi: "जिला केंद्रीय सहकारी बैंक" }, value: "DCCB" },
  { label: { en: "Urban Cooperative Bank", hi: "शहरी सहकारी बैंक" }, value: "UCB" },
  { label: { en: "Rajdhani Nagar Sahkari Bank", hi: "राजधानी नगर सहकारी बैंक" }, value: "RNSB" },

  { label: { en: "Other (Specify)", hi: "अन्य (विवरण दें)" }, value: "OTHER" },
];

export default function ExistingEnterpriseLoanSubsidySection({
  existingForm,
  setExistingForm,
}) {
  const update = (patch) => setExistingForm(patch);
 const { language } = useContext(LanguageContext);
  const loans = Array.isArray(existingForm.loans) ? existingForm.loans : [];
  const subsidies = Array.isArray(existingForm.subsidies)
    ? existingForm.subsidies
    : [];

  const hasLoanYes = existingForm.has_taken_loan === 'Yes';
  const hasSubsidyYes = existingForm.has_receieved_subsidy === 'Yes';

  const updateLoans = (next) => update({ loans: next });
  const updateSubsidies = (next) => update({ subsidies: next });

  const addLoanRow = () => {
    const newRow = {
      id: Date.now().toString(),
      title: 'New Loan',
      expanded: true,
      institution_tree: [],
      loan_amount: '',
      date_taken: '',
      repayment_status: '',
      repayment_status_other: '',
    };
    updateLoans([...loans, newRow]);
  };

  const removeLoanRow = (index) => {
    const next = loans.filter((_, i) => i !== index);
    updateLoans(next);
  };

  const updateLoanRow = (index, patch) => {
    const next = loans.map((row, i) =>
      i === index ? { ...row, ...patch } : row
    );
    updateLoans(next);
  };

  const toggleLoanExpand = (index) => {
    const row = loans[index];
    updateLoanRow(index, { expanded: !row.expanded });
  };

  const addSubsidyRow = () => {
    const newRow = {
      id: Date.now().toString(),
      title: 'New Subsidy',
      expanded: true,
      subsidy_type: '',
      subsidy_type_other: '',
      subsidy_name_tree: [],
      subsidy_detail: '',
    };
    updateSubsidies([...subsidies, newRow]);
  };

  const removeSubsidyRow = (index) => {
    const next = subsidies.filter((_, i) => i !== index);
    updateSubsidies(next);
  };

  const updateSubsidyRow = (index, patch) => {
    const next = subsidies.map((row, i) =>
      i === index ? { ...row, ...patch } : row
    );
    updateSubsidies(next);
  };

  const toggleSubsidyExpand = (index) => {
    const row = subsidies[index];
    updateSubsidyRow(index, { expanded: !row.expanded });
  };

//   const bankOptions = [
//   { label: "State Bank of India (SBI)", value: "SBI" },
//   { label: "Punjab National Bank (PNB)", value: "PNB" },
//   { label: "Bank of Baroda (BoB)", value: "BOB" },
//   { label: "Canara Bank", value: "CANARA" },
//   { label: "Central Bank of India", value: "CBI" },
//   { label: "Indian Bank", value: "INDIAN_BANK" },
//   { label: "Indian Overseas Bank", value: "IOB" },
//   { label: "UCO Bank", value: "UCO" },
//   { label: "Union Bank of India", value: "UNION" },

//   { label: "HDFC Bank", value: "HDFC" },
//   { label: "ICICI Bank", value: "ICICI" },
//   { label: "Axis Bank", value: "AXIS" },
//   { label: "Kotak Mahindra Bank", value: "KOTAK" },
//   { label: "IndusInd Bank", value: "INDUSIND" },
//   { label: "YES Bank", value: "YES" },

//   { label: "Prathama Bank", value: "PRATHAMA" },
//   { label: "Allahabad UP Gramin Bank", value: "AUPGB" },

//   { label: "District Central Cooperative Bank", value: "DCCB" },
//   { label: "Urban Cooperative Bank", value: "UCB" },
//   { label: "Rajdhani Nagar Sahkari Bank", value: "RNSB" },

//   { label: "Other (Specify)", value: "OTHER" },
// ];





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
    ? '5) ऋण और सब्सिडी विवरण'
    : '5) Loan and Subsidy Details'}</Text>
<LanguageToggle/></View>
      {/* 19) Has taken loan? */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
           {language === 'hi'
    ? 'क्या आपने अपने प्रारंभिक निवेश के बाद कोई ऋण लिया है?'
    : 'Have you taken any Loans after your Initial Investment?'}
        </Text>
        <Text style={styles.helpText}>
        {language === 'hi'
    ? 'यदि आपने अपने प्रारंभिक निवेश के बाद इस उद्यम के लिए किसी बैंक, सरकारी योजना, संस्था आदि से कोई ऋण लिया है, तो कृपया "हाँ" चुनें।'
    : 'Please select Yes if you have taken any loan (from bank, government scheme, institution, etc.) for this enterprise after your first investment.'}
        </Text>
        <YesNoToggle
         language={language}
          value={existingForm.has_taken_loan || ''}
          onChange={(val) => update({ has_taken_loan: val })}
        />
      </View>

      {/* Loan rows */}
      {hasLoanYes && (
        <View style={{ marginTop: 8 }}>
          <Text style={[styles.helpText, { marginBottom: 8 }]}>
             {language === 'hi'
    ? 'आप प्रत्येक ऋण का विवरण अलग-अलग जोड़ सकते हैं। किसी अन्य ऋण को दर्ज करने के लिए "+ ऋण जोड़ें" पर क्लिक करें।'
    : 'You can add details of each loan separately. Please click "+ Add Loan" to record another loan.'}
          </Text>

          {loans.map((row, index) => (
            <View key={row.id || index} style={styles.card}>
              {/* Header */}
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => toggleLoanExpand(index)}
              >
                <Text style={styles.cardTitle}> {row.title? row.title: language === 'hi' ? 'नया ऋण' : 'New Loan'}</Text>
                <Text style={styles.cardToggle}>{row.expanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              <View style={styles.cardHeaderBottom}>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeLoanRow(index)}
                >
                  <Text style={styles.removeBtnText}>{language === 'hi' ? 'हटाएँ' : 'Delete'}</Text>
                </TouchableOpacity>
              </View>

              {row.expanded && (
                <View style={styles.cardBody}>
                  {/* 1) Institution tree */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                       {language === 'hi'
        ? 'उस संस्था को निर्दिष्ट करें जहाँ से आपने ऋण लिया'
        : 'Specify the Institution from where you took the Loan'}
                    </Text>
                    <Text style={styles.helpText}>
                      {language === 'hi'
        ? 'कृपया उन सभी संबंधित विभागों और योजनाओं का चयन करें जहाँ से आपने यह ऋण प्राप्त किया। पहले विभाग चुनें, फिर उसके अंतर्गत संबंधित योजनाएँ चुनें।'
        : 'Please select all relevant departments and schemes from where you received this loan. First tick the department, then choose the specific schemes under it.'}
                    </Text>

                    {/* <InstitutionTree
                    language={language}
                      value={row.institution_tree}
                      onChange={(tree) =>
                        updateLoanRow(index, {
                          institution_tree: tree,
                          title: computeTreeTitle(tree, language === 'hi' ? 'नया ऋण' : 'New Loan'),
                        })
                      }
                    /> */}

                    <InstitutionTree
  language={language}
  value={row.institution_tree}
  onChange={(tree) =>
    updateLoanRow(index, {
      institution_tree: tree,
      title: computeTreeTitle(
        tree,
        language === 'hi' ? 'नया ऋण' : 'New Loan'
      ),
    })
  }
/>

{/* 
                    <Text style={[styles.helpText, { marginTop: 4 }]}>
                      Your selections will be saved like
                      &nbsp;&quot;[Department: Scheme1, Scheme2]&quot; for the server.
                    </Text> */}
                  </View>
                   
                   {/* 4) Bank Details */}
<View style={styles.fieldBlock}>
  <Text style={styles.label}>
    {language === 'hi'
      ? 'आपने किस बैंक से ऋण लिया है?'
      : 'From which bank have you taken the loan?'}
  </Text>

  {bankOptions.map(bank => {
    const label =
      language === 'hi' ? bank.label.hi : bank.label.en;

    const isSelected = row.bank_name === bank.value;

    return (
      <TouchableOpacity
        key={bank.value}
        style={styles.checkboxRow}
        onPress={() =>
          updateLoanRow(index, {
            bank_name: bank.value,
            ...(bank.value !== 'OTHER' && {
              other_bank_name: '',
            }),
          })
        }
      >
        <View style={styles.checkbox}>
          {isSelected && <View style={styles.checkboxFill} />}
        </View>

        <Text>{label}</Text>
      </TouchableOpacity>
    );
  })}

  {/* ✅ OTHER FIELD */}
  {row.bank_name === 'OTHER' && (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.helpText}>
        {language === 'hi'
          ? 'कृपया बैंक का नाम लिखें'
          : 'Please specify the bank name'}
      </Text>
      <TextInput
        style={styles.input}
        value={row.other_bank_name || ''}
        onChangeText={(v) =>
          updateLoanRow(index, { other_bank_name: v })
        }
      />
    </View>
  )}

  {/* ✅ BRANCH FIELD */}
  {!!row.bank_name && (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.helpText}>
        {language === 'hi'
          ? 'शाखा का नाम दर्ज करें'
          : 'Enter Branch Name'}
      </Text>
      <TextInput
        style={styles.input}
        value={row.branch_name || ''}
        onChangeText={(v) =>
          updateLoanRow(index, { branch_name: v })
        }
      />
    </View>
  )}
</View>

                  
                  {/*  Loan amount */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                       {language === 'hi'
      ? 'ऋण की राशि बताएं'
      : 'Specify the Amount of Loan'}
                    </Text>
                    <Text style={styles.helpText}>
                       {language === 'hi'
      ? 'कृपया इस ऋण के लिए स्वीकृत राशि (रुपयों में) दर्ज करें।'
      : 'Please enter the loan amount sanctioned for this particular loan (in rupees).'}
                    </Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={row.loan_amount || ''}
                        placeholder={language === 'hi' ? 'राशि दर्ज करें' : 'Enter amount'}
                      // onChangeText={(v) => updateLoanRow(index, { loan_amount: v })}
                      onChangeText={(v) => {
      // Allow only numbers
      const cleaned = v.replace(/[^0-9]/g, '');
      updateLoanRow(index, { loan_amount: cleaned });
    }}
                    />
                  </View>

                  {/*  Repayment Details */}
{/* <View style={styles.fieldBlock}>
  <Text style={styles.label}>
    How much have you repaid?
  </Text>

  <TextInput
    style={styles.input}
    keyboardType="numeric"
    value={row.repaid_amount || ''}
    onChangeText={(v) => updateLoanRow(index, { repaid_amount: v })}
  />

  {(() => {
    const loan = Number(row.loan_amount) || 0;
    const repaid = Number(row.repaid_amount) || 0;
    const pending = loan - repaid;

    return (
      <View style={{ marginTop: 8 }}>
        <Text style={styles.helpText}>Pending Amount: {pending}</Text>

        {(() => {
          let status = '';
          let color = 'black';

          if (repaid === 0) {
            status = 'Fully Pending';
            color = 'red';
          } else if (pending === 0) {
            status = 'Fully Paid';
            color = 'green';
          } else if (pending > 0) {
            status = 'Partially Paid';
            color = 'gold';
          } else if (pending < 0) {
            status = `Overpaid by ${Math.abs(pending)}`;
            color = 'red';
          }

          const showError = repaid > loan;

          return (
            <>
              <Text style={{ color, fontWeight: 'bold', marginTop: 6 }}>
                Repayment Status: {status}
              </Text>

              {showError && (
                <Text style={{ color: 'red' }}>
                  Error: Repayment cannot exceed loan amount
                </Text>
              )}
            </>
          );
        })()}
      </View>
    );
  })()}
</View> */}


<View style={styles.fieldBlock}>
  <Text style={styles.label}>
    {language === 'hi'
      ? 'आपने अब तक कितनी राशि चुकाई है?'
      : 'How much have you repaid?'}
  </Text>

  <TextInput
    style={styles.input}
    keyboardType="numeric"
    maxLength={10}
    placeholder={language === 'hi' ? 'राशि दर्ज करें' : 'Enter amount'}
    value={row.repaid_amount || ''}
    onChangeText={(v) => {
      const cleaned = v.replace(/[^0-9]/g, '');
      updateLoanRow(index, { repaid_amount: cleaned });
    }}
  />

  {/* Pending + Status Section */}
  {(() => {
    const loan = Number(row.loan_amount) || 0;
    const repaid = Number(row.repaid_amount) || 0;
    const pending = loan - repaid;

    let status = '';
    let color = '#000';

    if (!loan) {
      return null;
    }

    if (repaid === 0) {
      status =
        language === 'hi' ? 'पूरा बकाया' : 'Fully Pending';
      color = 'red';
    } else if (pending === 0) {
      status =
        language === 'hi' ? 'पूरी तरह चुकाया गया' : 'Fully Paid';
      color = 'green';
    } else if (pending > 0) {
      status =
        language === 'hi' ? 'आंशिक भुगतान' : 'Partially Paid';
      color = '#d4a017';
    } else if (pending < 0) {
      status =
        language === 'hi'
          ? `अधिक भुगतान: ₹${Math.abs(pending)}`
          : `Overpaid by ₹${Math.abs(pending)}`;
      color = 'red';
    }

    const showError = repaid > loan;

    return (
      <View style={{ marginTop: 10 }}>
        <Text style={styles.helpText}>
          {language === 'hi'
            ? `शेष राशि: ₹${pending > 0 ? pending : 0}`
            : `Pending Amount: ₹${pending > 0 ? pending : 0}`}
        </Text>

        <Text
          style={{
            color,
            fontWeight: 'bold',
            marginTop: 6,
          }}
        >
          {language === 'hi'
            ? `भुगतान स्थिति: ${status}`
            : `Repayment Status: ${status}`}
        </Text>

        {showError && (
          <Text style={{ color: 'red', marginTop: 4 }}>
            {language === 'hi'
              ? 'चुकाई गई राशि ऋण राशि से अधिक नहीं हो सकती'
              : 'Repayment cannot exceed loan amount'}
          </Text>
        )}
      </View>
    );
  })()}
</View>

                  {/*  Date taken */}
                  {/* <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      Specify the Date on which you took the Loan
                    </Text>
                    <Text style={styles.helpText}>
                      Please enter the date when the loan was sanctioned or first disbursed.
                      You may use the format YYYY-MM-DD (for example, 2024-01-15).
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY-MM-DD"
                      value={row.date_taken || ''}
                      onChangeText={(v) => updateLoanRow(index, { date_taken: v })}
                    />
                  </View> */}
<View style={styles.fieldBlock}>
  <Text style={styles.label}>
    {language === 'hi'
      ? 'जिस तिथि को आपने ऋण लिया था, वह बताएं'
      : 'Specify the Date on which you took the Loan'}
  </Text>

  <Text style={styles.helpText}>
    {language === 'hi'
      ? 'कृपया वह तिथि दर्ज करें जब ऋण स्वीकृत या पहली बार वितरित हुआ था। प्रारूप YYYY-MM-DD रखें।'
      : 'Please enter the date when the loan was sanctioned or first disbursed. Use format YYYY-MM-DD.'}
  </Text>

  <TextInput
    style={styles.input}
    placeholder="YYYY-MM-DD"
    maxLength={10}
    keyboardType="numeric"
    value={row.date_taken || ''}
    onChangeText={(v) => {
      // remove non-digits
      let cleaned = v.replace(/\D/g, '');

      // auto format YYYY-MM-DD
      if (cleaned.length >= 5) {
        cleaned =
          cleaned.slice(0, 4) +
          '-' +
          cleaned.slice(4, 6) +
          (cleaned.length > 6
            ? '-' + cleaned.slice(6, 8)
            : '');
      } else if (cleaned.length >= 4) {
        cleaned =
          cleaned.slice(0, 4) +
          '-' +
          cleaned.slice(4);
      }

      updateLoanRow(index, { date_taken: cleaned });
    }}
  />

  {/* Future date validation */}
  {row.date_taken &&
    new Date(row.date_taken) > new Date() && (
      <Text style={{ color: 'red', marginTop: 4 }}>
        {language === 'hi'
          ? 'भविष्य की तिथि मान्य नहीं है'
          : 'Future date is not allowed'}
      </Text>
  )}
</View>

                  {/* 4) Repayment status */}
                  {/* <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      4) Repayment Status
                    </Text>
                    <Text style={styles.helpText}>
                      Please select the option that best describes your present repayment status for this loan.
                    </Text>
                    <View style={styles.chipRow}>
                      {REPAYMENT_STATUS_OPTIONS.map((opt) => {
                        const active = row.repayment_status === opt;
                        return (
                          <TouchableOpacity
                            key={opt}
                            style={[
                              styles.chip,
                              active && styles.chipActive,
                            ]}
                            onPress={() =>
                              updateLoanRow(index, { repayment_status: opt })
                            }
                          >
                            <Text
                              style={[
                                styles.chipText,
                                active && styles.chipTextActive,
                              ]}
                            >
                              {opt}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {row.repayment_status === 'Others' && (
                      <TextInput
                        style={[styles.input, { marginTop: 6 }]}
                        placeholder="Please specify other repayment status"
                        value={row.repayment_status_other || ''}
                        onChangeText={(v) =>
                          updateLoanRow(index, { repayment_status_other: v })
                        }
                      />
                    )}
                  </View> */}
                </View>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.addBtn} onPress={addLoanRow}>
            <Text style={styles.addBtnText}>  {language === 'hi' ? '+ ऋण जोड़ें' : '+ Add Loan'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 20) Has received subsidy? */}
      <View style={[styles.fieldBlock, { marginTop: 18 }]}>
        <Text style={styles.label}>
          {language === 'hi'
      ? 'क्या आपने किसी सरकारी सब्सिडी का लाभ लिया है?'
      : 'Have you received any Government Subsidies?'}
        </Text>
        <Text style={styles.helpText}>
          {language === 'hi'
      ? 'यदि आपने इस उद्यम के लिए किसी विभाग या योजना से सब्सिडी प्राप्त की है तो "हाँ" चुनें।'
      : 'Please select Yes if you have received any subsidy support for this enterprise from any department or scheme.'}
        </Text>
        <YesNoToggle
        language={language}
          value={existingForm.has_receieved_subsidy || ''}
          onChange={(val) => update({ has_receieved_subsidy: val })}
        />
      </View>

      {/* Subsidy rows */}
      {hasSubsidyYes && (
        <View style={{ marginTop: 8 }}>
          {/* <Text style={[styles.helpText, { marginBottom: 8 }]}>
            You can record each subsidy separately. Please click &quot;+ Add Subsidy&quot; to add another subsidy detail.
          </Text> */}

          {subsidies.map((row, index) => (
            <View key={row.id || index} style={styles.card}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => toggleSubsidyExpand(index)}
              >
                <Text style={styles.cardTitle}>
                  {/* {row.title || 'New Subsidy'} */}
                  {row.title
          ? row.title
          : language === 'hi'
            ? `नई सब्सिडी ${index + 1}`
            : `New Subsidy ${index + 1}`}
                </Text>
                <Text style={styles.cardToggle}>
                  {row.expanded ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              <View style={styles.cardHeaderBottom}>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeSubsidyRow(index)}
                >
                  <Text style={styles.removeBtnText}>{language === 'hi' ? 'हटाएं' : 'Delete'}</Text>
                </TouchableOpacity>
              </View>

              {row.expanded && (
                <View style={styles.cardBody}>
                  {/* 1) Subsidy type */}
                  {/* <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      1) What is the type of Subsidy you took?
                    </Text>
                    <Text style={styles.helpText}>
                      Please select the nature of subsidy (for example, if it is directly
                      given to you, or indirectly through another support).
                    </Text>
                    <View style={styles.chipRow}>
                      {SUBSIDY_TYPE_OPTIONS.map((opt) => {
                        const active = row.subsidy_type === opt;
                        return (
                          <TouchableOpacity
                            key={opt}
                            style={[
                              styles.chip,
                              active && styles.chipActive,
                            ]}
                            onPress={() =>
                              updateSubsidyRow(index, { subsidy_type: opt })
                            }
                          >
                            <Text
                              style={[
                                styles.chipText,
                                active && styles.chipTextActive,
                              ]}
                            >
                              {opt}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {row.subsidy_type === 'Others' && (
                      <TextInput
                        style={[styles.input, { marginTop: 6 }]}
                        placeholder="Please specify subsidy type"
                        value={row.subsidy_type_other || ''}
                        onChangeText={(v) =>
                          updateSubsidyRow(index, { subsidy_type_other: v })
                        }
                      />
                    )}
                  </View> */}

                  {/* 2) Institution / scheme tree */}
                  <View className={styles.fieldBlock}>
                    <Text style={styles.label}>
                      {language === 'hi'
    ? 'जिस संस्था/विभाग से आपने सब्सिडी प्राप्त की, उसे चुनें'
    : 'Specify the Institution from where you received the Subsidy'}
                    </Text>
                    <Text style={styles.helpText}>
                      {language === 'hi'
    ? 'कृपया उन सभी संबंधित विभागों या योजनाओं का चयन करें जिनसे यह सब्सिडी प्राप्त हुई है।'
    : 'Please select all relevant departments and schemes that provided this subsidy.'}
                    </Text>

                    <InstitutionTree
                    language={language}
                      value={row.subsidy_name_tree}
                      onChange={(tree) =>
                        updateSubsidyRow(index, {
                          subsidy_name_tree: tree,
                          title: computeTreeTitle(tree, language === 'hi' ? 'नई सब्सिडी' : 'New Subsidy'),
                        })
                      }
                    />

                    {/* <Text style={[styles.helpText, { marginTop: 4 }]}>
                      Your selections will be saved as &quot;[Department: Scheme1, Scheme2]&quot;
                      format for sending to the server.
                    </Text> */}
                  </View>

                  {/* 3) Subsidy amount / detail */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                     {language === 'hi'
      ? 'आपको प्राप्त सब्सिडी की राशि या विवरण क्या था?'
      : 'What was the amount or detail of the subsidy you received?'}
                    </Text>
                    <Text style={styles.helpText}>
                       {language === 'hi'
      ? 'कृपया राशि (यदि ज्ञात हो) रुपये में लिखें तथा अन्य महत्वपूर्ण विवरण (जैसे वर्ष, सहायता का प्रकार आदि) भी उल्लेख करें।'
      : 'Please mention the amount in rupees (if known) and any important details (like year, nature of support, etc.).'}.
                    </Text>
                    <TextInput
                      style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                      multiline
                      value={row.subsidy_detail || ''}
                      onChangeText={(v) =>
                        updateSubsidyRow(index, { subsidy_detail: v })
                      }
                    />
                  </View>
                </View>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.addBtn} onPress={addSubsidyRow}>
            <Text style={styles.addBtnText}>  {language === 'hi' ? '+ सब्सिडी जोड़ें' : '+ Add Subsidy'}</Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingVertical: 8,
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
    input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
  },
  helpText: {
    color: '#666',
  },
  checkboxRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 6,
},
checkbox: {
  width: 20,
  height: 20,
  borderRadius: 4,
  borderWidth: 1,
  borderColor: '#666',
  marginRight: 10,
  justifyContent: 'center',
  alignItems: 'center',
},
checkboxFill: {
  width: 12,
  height: 12,
  backgroundColor: '#d9534f',
  borderRadius: 2,
},
});
