// src/screens/screensProductionApp/FormSections/ExistingEnterpriseInvestmentSection.jsx
import React, { useState } from 'react'; // <-- Added useState
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect } from 'react';
import LanguageToggle from '../../../components/LanguageToggle';
import { LanguageContext } from '../../../components/LanguageContext';
import { useContext } from 'react';

const YES_NO = ['Yes', 'No'];

/**
 * Parent–child multi-select tree for "Source of Investment"
 * Values stored in existingForm.source_of_investment_tree
 */
  const INVESTMENT_SOURCE_TREE = [
    {
      parent: 'MSME / Industry Department',
      children: [
        'UP MSME Promotion Policy 2022',
        'ODOP (One District One Product)',
        'Vishwakarma Shram Samman Yojana',
        'CM Yuva Scheme',
        'Micro-food Industries Promotion',
        'Capital Subsidy Scheme',
      ],
    },
    {
      parent: 'Women Welfare / Women Empowerment Department',
      children: ['Mahila Samarthya Yojana'],
    },
    {
      parent: 'Village Industries / Khadi and Village Industries Department',
      children: [
        'Khadi & Village Industries (KVIC UP) Loan Assistance',
        'Margin Money Scheme',
      ],
    },
    {
      parent: 'Agriculture / Animal Husbandry Department',
      children: [
        'Kamdhenu Dairy Yojana',
        'UP Food Processing Industry Support',
      ],
    },
    {
      parent: 'Department of Social Welfare',
      children: ['PM AJAY'],
    },
    {
      parent: 'Department of Fisheries',
      children: ['Chief Minister Matsya Sampada Yojana'],
    },
    {
      parent: 'OBC Finance Development Corporation',
      children: ['Self-employment loans'],
    },
    {
      parent: 'NABARD Schemes for SHGs & Rural Enterprises',
      children: [
        'Micro Enterprise Development Programme (MEDP)',
        'Livelihood Enterprise Development Programme (LEDP)',
        'Grant for capability building',
        'Loan refinancing',
      ],
    },
    // {
    //   parent: 'Central Government Schemes (Also including NABARD)',
    //   children: [
    //     'Micro Enterprise Development Programme (MEDP)',
    //     'Livelihood Enterprise Development Programme (LEDP)',
    //     'Grant for capability building',
    //     'Loan refinancing',
    //   ],
    // },
    {
      parent: 'Other Schemes',
      children: [
        'Mudra Loan (for women entrepreneurs)',
        'Stand-Up India (women SC/ST entrepreneurs)',
        'ZED (Zero Defect Zero Effect) – Women MSME',
        'Women Entrepreneurship Fund / Scheme',
        'Coir Vikas Yojana',
        'Prime Minister Employment Generation Programme (PMEGP)',
        'PM SVANidhi',
        'SHG-Bank Linkage',
        // 'PM-FME (PM Formalization of Micro Food Processing Enterprises)',
        'Dairy Entrepreneur Development Scheme',
        'Prime Minister Matsya Sampada Yojana',
        // 'PMFME (Micro Food Processing)',
        'SFURTI (Scheme of Fund for Regeneration of Traditional Industries)',
        'ASPIRE (A Scheme for Promotion of Innovation, Rural Industry and Entrepreneurship)',
        'AGEY',
        'SVEP',
        'PMFME',
        'PATB',
      ],
    },
    {
      parent: 'Others (Specify)',
      children: ['Others'],
    },
  ];

// const INVESTMENT_SOURCE_TREE = [
//   {
//     parent: { en: 'MSME / Industry Department', hi: 'एमएसएमई / उद्योग विभाग' },
//     children: [
//       { en: 'UP MSME Promotion Policy 2022', hi: 'यूपी एमएसएमई प्रमोशन पॉलिसी 2022' },
//       { en: 'ODOP (One District One Product)', hi: 'ओडीओपी (एक जिला एक उत्पाद)' },
//       { en: 'Vishwakarma Shram Samman Yojana', hi: 'विश्वरकर्मा श्रम सम्मान योजना' },
//       { en: 'CM Yuva Scheme', hi: 'मुख्यमंत्री युवा योजना' },
//       { en: 'Micro-food Industries Promotion', hi: 'सूक्ष्म खाद्य उद्योग संवर्द्धन' },
//       { en: 'Capital Subsidy Scheme', hi: 'पूंजी सहायता योजना' },
//     ],
//   },
//   {
//     parent: { en: 'Women Welfare / Women Empowerment Department', hi: 'महिला कल्याण / सशक्तिकरण विभाग' },
//     children: [
//       { en: 'Mahila Samarthya Yojana', hi: 'महिला समर्थ्य योजना' },
//     ],
//   },
//   {
//     parent: { en: 'Village Industries / Khadi and Village Industries Department', hi: 'ग्राम उद्योग / खादी और ग्राम उद्योग विभाग' },
//     children: [
//       { en: 'Khadi & Village Industries (KVIC UP) Loan Assistance', hi: 'खादी एवं ग्राम उद्योग (KVIC UP) ऋण सहायता' },
//       { en: 'Margin Money Scheme', hi: 'मार्जिन मनी योजना' },
//     ],
//   },
//   {
//     parent: { en: 'Agriculture / Animal Husbandry Department', hi: 'कृषि / पशुपालन विभाग' },
//     children: [
//       { en: 'Kamdhenu Dairy Yojana', hi: 'कमधेनु डेयरी योजना' },
//       { en: 'UP Food Processing Industry Support', hi: 'यूपी फूड प्रोसेसिंग उद्योग समर्थन' },
//     ],
//   },
//   {
//     parent: { en: 'Department of Social Welfare', hi: 'सामाजिक कल्याण विभाग' },
//     children: [
//       { en: 'PM AJAY', hi: 'पीएम अजय' },
//     ],
//   },
//   {
//     parent: { en: 'Department of Fisheries', hi: 'मत्स्य पालन विभाग' },
//     children: [
//       { en: 'Chief Minister Matsya Sampada Yojana', hi: 'मुख्यमंत्री मत्स्य संपदा योजना' },
//     ],
//   },
//   {
//     parent: { en: 'OBC Finance Development Corporation', hi: 'ओबीसी वित्त विकास निगम' },
//     children: [
//       { en: 'Self-employment loans', hi: 'स्व-रोज़गार ऋण' },
//     ],
//   },
//   {
//     parent: { en: 'NABARD Schemes for SHGs & Rural Enterprises', hi: 'एनएबीएआरडी योजनाएँ - स्वयं सहायता समूह और ग्रामीण उद्यम' },
//     children: [
//       { en: 'Micro Enterprise Development Programme (MEDP)', hi: 'सूक्ष्म उद्यम विकास कार्यक्रम (MEDP)' },
//       { en: 'Livelihood Enterprise Development Programme (LEDP)', hi: 'रोज़गार उद्यम विकास कार्यक्रम (LEDP)' },
//       { en: 'Grant for capability building', hi: 'क्षमता निर्माण हेतु अनुदान' },
//       { en: 'Loan refinancing', hi: 'ऋण पुनर्वित्त' },
//     ],
//   },
//   {
//     parent: { en: 'Other Schemes', hi: 'अन्य योजनाएँ' },
//     children: [
//       { en: 'Mudra Loan (for women entrepreneurs)', hi: 'मुद्रा ऋण (महिला उद्यमियों के लिए)' },
//       { en: 'Stand-Up India (women SC/ST entrepreneurs)', hi: 'स्टैंड-अप इंडिया (महिला SC/ST उद्यमी)' },
//       { en: 'ZED (Zero Defect Zero Effect) – Women MSME', hi: 'ZED (शून्य दोष शून्य प्रभाव) – महिला MSME' },
//       { en: 'Women Entrepreneurship Fund / Scheme', hi: 'महिला उद्यमिता निधि / योजना' },
//       { en: 'Coir Vikas Yojana', hi: 'कोयर विकास योजना' },
//       { en: 'Prime Minister Employment Generation Programme (PMEGP)', hi: 'प्रधान मंत्री रोजगार सृजन कार्यक्रम (PMEGP)' },
//       { en: 'PM SVANidhi', hi: 'पीएम स्वनिधि' },
//       { en: 'SHG-Bank Linkage', hi: 'SHG-बैंक लिंकिंग' },
//       { en: 'Dairy Entrepreneur Development Scheme', hi: 'डेयरी उद्यमी विकास योजना' },
//       { en: 'Prime Minister Matsya Sampada Yojana', hi: 'प्रधान मंत्री मत्स्य संपदा योजना' },
//       { en: 'SFURTI (Scheme of Fund for Regeneration of Traditional Industries)', hi: 'SFURTI (परंपरागत उद्योग पुनर्जनन योजना)' },
//       { en: 'ASPIRE (A Scheme for Promotion of Innovation, Rural Industry and Entrepreneurship)', hi: 'ASPIRE (नवाचार, ग्रामीण उद्योग और उद्यमिता संवर्द्धन योजना)' },
//       { en: 'AGEY', hi: 'AGEY' },
//       { en: 'SVEP', hi: 'SVEP' },
//       { en: 'PMFME', hi: 'PMFME' },
//       { en: 'PATB', hi: 'PATB' },
//     ],
//   },
//   {
//     parent: { en: 'Others (Specify)', hi: 'अन्य (स्पेसिफाई करें)' },
//     children: [
//       { en: 'Others', hi: 'अन्य' },
//     ],
//   },
// ];


const SourceOfInvestmentTree = ({ value, onChange }) => {
  const selectedTree = Array.isArray(value) ? value : [];
  const [othersText, setOthersText] = useState(''); // <-- Added state for "Others"

  const isParentSelected = (parent) =>
    !!selectedTree.find((row) => row.parent === parent);

  const isChildSelected = (parent, child) => {
    const row = selectedTree.find((r) => r.parent === parent);
    return !!row && row.children?.includes(child);
  };

  const toggleParent = (parent) => {
    const exists = selectedTree.find((row) => row.parent === parent);
    let updated;
    if (exists) {
      updated = selectedTree.filter((row) => row.parent !== parent);
    } else {
      updated = [...selectedTree, { parent, children: [] }];
    }
    onChange(updated);
  };

  const toggleChild = (parent, child) => {
    const existing = selectedTree.find((row) => row.parent === parent);
    let updated = [...selectedTree];
    if (!existing) {
      updated.push({ parent, children: [child] });
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

  return (
    <View style={{ marginTop: 8 }}>
      {INVESTMENT_SOURCE_TREE.map((group) => {
        const parentSelected = isParentSelected(group.parent);
        const isOthersGroup = group.parent === 'Others (Specify)';
        const isOthersSelected =
          isOthersGroup &&
          parentSelected &&
          isChildSelected(group.parent, 'Others'); // <-- check if Others is selected

        return (
          <View key={group.parent} style={styles.treeGroup}>
            <TouchableOpacity
              onPress={() => toggleParent(group.parent)}
              style={styles.treeParentRow}
            >
              <Text style={styles.treeParentText}>{group.parent}</Text>
              <Text>{parentSelected ? '☑' : '☐'}</Text>
            </TouchableOpacity>

            {parentSelected && (
              <View style={styles.treeChildrenBlock}>
                {group.children.map((child) => (
                  <TouchableOpacity
                    key={child}
                    style={styles.treeChildRow}
                    onPress={() => toggleChild(group.parent, child)}
                  >
                    <Text style={styles.treeChildCheckbox}>
                      {isChildSelected(group.parent, child) ? '☑' : '☐'}
                    </Text>
                    <Text style={styles.treeChildLabel}>{child}</Text>
                  </TouchableOpacity>
                ))}

                {/* <-- TextInput only visible when Others is selected */}
                {isOthersSelected && (
                  <TextInput
                    style={[styles.input, { marginTop: 6 }]}
                    placeholder="Specify"
                    value={othersText}
                    onChangeText={(txt) => {
                      setOthersText(txt);
                      onChange(
                        selectedTree.map((row) =>
                          row.parent === group.parent
                            ? { ...row, others_specify: txt }
                            : row
                        )
                      );
                    }}
                  />
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const YesNoToggle = ({ value, onChange,language }) => (
  <View style={styles.yesNoRow}>
    {YES_NO.map((opt) => (
      <TouchableOpacity
        key={opt}
        style={[styles.yesNoBtn, value === opt && styles.yesNoBtnActive]}
        onPress={() => onChange(opt)}
      >
        <Text
          style={[styles.yesNoText, value === opt && styles.yesNoTextActive]}
        >
          {/* {opt} */}
           {language === 'hi'
      ? opt === 'Yes' ? 'हाँ' : 'नहीं'
      : opt}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);
// const calculateAndStoreGP = (incomeValue, workingCapitalValue) => {
//   const monthlyIncome = parseFloat(incomeValue) || 0;
//   const workingCapital = parseFloat(workingCapitalValue) || 0;

//   const monthlyGP = monthlyIncome - workingCapital;
//   const yearlyIncome = monthlyIncome * 12;
//   const yearlyWorkingCapital = workingCapital * 12;
//   const yearlyGP = yearlyIncome - yearlyWorkingCapital;

//   return {
//     monthlyIncome,
//     workingCapital,
//     monthlyGP,
//     yearlyGP,
//   };
// };

export default function ExistingEnterpriseInvestmentSection({
  existingForm,
  setExistingForm,
}) {
  const update = (patch) => setExistingForm(patch); 
  const hasShgCifYes = existingForm.has_shg_cif === 'Yes';
    // const fund_cards = existingForm?.fund_cards || [];
const fund_cards = existingForm.fund_cards || [];
 const { language } = useContext(LanguageContext);
// useEffect(() => {
//   const monthlyIncome = parseFloat(existingForm.monthly_income_estimate) || 0;
//   const workingCapital = parseFloat(existingForm.working_capital_monthly) || 0;

//   const monthlyGP = monthlyIncome - workingCapital;
//   const yearlyIncome = monthlyIncome * 12;
//   const yearlyWorkingCapital = workingCapital * 12;
  // const yearlyGP = yearlyIncome - yearlyWorkingCapital;

  // Store as numbers rounded to 2 decimals
//   setExistingForm(prev => ({
//     ...prev,
//     monthly_gp: Math.round(monthlyGP * 100) / 100,
//     monthly_income_numeric: Math.round(monthlyIncome * 100) / 100,
//     working_capital_numeric: Math.round(workingCapital * 100) / 100,
//   }));
// }, [existingForm.monthly_income_estimate, existingForm.working_capital_monthly]);

  // useEffect(() => {
  //   const monthlyIncome = parseFloat(existingForm.monthly_income_estimate) || 0;
  //   const workingCapital = parseFloat(existingForm.working_capital_monthly) || 0;

  //   const monthlyGP = monthlyIncome - workingCapital;
  //   const yearlyIncome = monthlyIncome * 12;
  //   const yearlyWorkingCapital = workingCapital * 12;
  //   const yearlyGP = yearlyIncome - yearlyWorkingCapital;

  //   const monthlyGPPercent = monthlyIncome > 0 ? ((monthlyGP / monthlyIncome) * 100).toFixed(2) : '0';
  //   const yearlyGPPercent = yearlyIncome > 0 ? ((yearlyGP / yearlyIncome) * 100).toFixed(2) : '0';

  //   // Store numeric values and percentages in existingForm
  //   update({
  //     monthly_gp: monthlyGP,
  //     monthly_gp_percent: monthlyGPPercent,
  //     yearly_gp: yearlyGP,
  //     yearly_gp_percent: yearlyGPPercent,
  //   });
  // }, [existingForm.monthly_income_estimate, existingForm.working_capital_monthly]);


  useEffect(() => {
    const monthlyIncome = parseFloat(existingForm.monthly_income_estimate) || 0;
    const workingCapital = parseFloat(existingForm.working_capital_monthly) || 0;

    const grossProfit = monthlyIncome - workingCapital;
    const annualTurnover = monthlyIncome * 12;

    // Update form values
    update({
      gross_profit: grossProfit,
      annual_turnover: annualTurnover,
    });
  }, [existingForm.monthly_income_estimate, existingForm.working_capital_monthly]);

  const setCard = (index, patch) =>
  update({
    ...existingForm,
    fund_cards: fund_cards.map((c,i)=>
      i===index ? { ...c, ...patch } : c
    )
  });

const addFundCard = () =>
  update({
    ...existingForm,
    fund_cards: [
      ...fund_cards,
      {
        loanType:'',
        has_received:'',
        amount_received:'',
        amount_repaid:''
      }
    ]
  });

const deleteFundCard = (index) =>
  update({
    ...existingForm,
    fund_cards: fund_cards.filter((_,i)=>i!==index)
  });
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{language === 'hi'
    ? '4) निवेश विवरण अनुभाग'
    : '4) Investment Details Section'}</Text>
<LanguageToggle/>
{/* 17) Initial investment */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          {language === 'hi'
      ? 'इस उद्यम के लिए आपकी प्रारंभिक निवेश राशि क्या थी?'
      : 'What was your Initial Investment for this Enterprise?'}
        </Text>
        <Text style={styles.helpText}>
          {language === 'hi'
      ? 'कृपया वह अनुमानित कुल राशि दर्ज करें जो आपने अपना उद्यम शुरू करते समय उपयोग की थी।'
      : 'Please enter the approximate total amount of money you used when you first started your enterprise.'}
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={existingForm.initial_investment || ''}
          onChangeText={(v) => update({ initial_investment: v })}
        />
      </View>
      {/* 12) Monthly income estimate */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
           {language === 'hi'
      ? 'आपकी कुल अनुमानित मासिक आय कितनी है?'
      : 'What is your total Estimated Monthly Income?'}
        </Text>
        <Text style={styles.helpText}>
        {language === 'hi'
      ? 'कृपया एक महीने में आपके उद्यम द्वारा सभी स्रोतों से अर्जित की गई अनुमानित कुल आय दर्ज करें। आप राशि रुपये में लिख सकते हैं (जैसे 15000)।'
      : 'Please enter the combined approximate income your enterprise earns in one month from all sources. You may mention the amount in rupees (e.g. 15000).'}
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={existingForm.monthly_income_estimate || ''}
          onChangeText={(v) => update({ monthly_income_estimate: v })}
        />
      </View>

      {/* 13) Annual turnover */}
      {/* <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          13) What is your Approximate Annual Turnover?
        </Text>
        <Text style={styles.helpText}>
          Please enter the approximate total amount of sales your enterprise makes in one year.
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={existingForm.annual_turnover || ''}
          onChangeText={(v) => update({ annual_turnover: v })}
        />
      </View> */}

      {/* 14) Gross profit */}
      {/* <View style={styles.fieldBlock}>
        <Text style={styles.label}>14) What is your Gross Profit?</Text>
        <Text style={styles.helpText}>
          Please enter your gross profit (income minus direct expenses) as you understand it.
          You may put an approximate value.
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={existingForm.gross_profit || ''}
          onChangeText={(v) => update({ gross_profit: v })}
        />
      </View> */}

      {/* 15) Working capital */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}> {language === 'hi'
      ? 'आपकी मासिक कार्यशील पूंजी कितनी है?'
      : 'What is your Monthly Working Capital?'}</Text>
        <Text style={styles.helpText}>
          {language === 'hi'
      ? 'कृपया वह राशि दर्ज करें जो आपको सामान्यतः हर महीने अपने व्यवसाय को चलाने के लिए चाहिए (जैसे कच्चा माल, मजदूरी, परिवहन आदि)।'
      : 'Please enter how much money you normally need every month to run your business (for raw material, wages, transport, etc.).'}
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={existingForm.working_capital_monthly || ''}
          onChangeText={(v) => update({ working_capital_monthly: v })}
        />
      </View>


      {/* AUTO CALCULATED */}
 {existingForm.monthly_income_estimate && existingForm.working_capital_monthly && (
        <><View style={styles.gpBlock}>
        </View><View style={{ marginTop: 12 }}>
            <Text style={styles.label}> {language === 'hi'
          ? 'औसत वार्षिक आय अनुमान:'
          : 'Average Yearly Income Estimate:'}</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
              ₹ {(parseFloat(existingForm.monthly_income_estimate || 0) * 12).toLocaleString('en-IN')}
            </Text>
             <Text style={[styles.label, { marginTop: 8 }]}> {language === 'hi'
          ? 'वार्षिक टर्नओवर:'
          : 'Annual Turnover:'}</Text>
            <Text style={styles.value}>
              ₹ {(existingForm.annual_turnover ?? 0).toLocaleString('en-IN')}
            </Text>
            <Text style={[styles.label, { marginTop: 6 }]}>  {language === 'hi'
          ? 'औसत वार्षिक कार्यशील पूंजी:'
          : 'Average Yearly Working Capital:'}</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
              ₹ {(parseFloat(existingForm.working_capital_monthly || 0) * 12).toLocaleString('en-IN')}
            </Text>
           <Text style={styles.label}>{language === 'hi'
          ? 'सकल लाभ:'
          : 'Gross Profit:'}</Text>
          <Text style={styles.value}>
            ₹ {(existingForm.gross_profit ?? 0).toLocaleString('en-IN')}
          </Text>
          </View></>
      )}
       {/* {existingForm.monthly_income_estimate && existingForm.working_capital_monthly && (
        <><View style={styles.gpBlock}>
          <Text style={styles.label}>Monthly Gross Profit:</Text>
          <Text style={styles.gpValue}>
            ₹ {(existingForm.monthly_gp ?? 0).toLocaleString('en-IN')} ({existingForm.monthly_gp_percent ?? '0'}%)
          </Text>

          <Text style={[styles.label, { marginTop: 8 }]}>Yearly Gross Profit:</Text>
          <Text style={styles.gpValue}>
            ₹ {(existingForm.yearly_gp ?? 0).toLocaleString('en-IN')} ({existingForm.yearly_gp_percent ?? '0'}%)
          </Text>
        </View><View style={{ marginTop: 12 }}>
            <Text style={styles.label}>Average Yearly Income Estimate:</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
              ₹ {(parseFloat(existingForm.monthly_income_estimate || 0) * 12).toLocaleString('en-IN')}
            </Text>

            <Text style={[styles.label, { marginTop: 6 }]}>Average Yearly Working Capital:</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
              ₹ {(parseFloat(existingForm.working_capital_monthly || 0) * 12).toLocaleString('en-IN')}
            </Text>
          </View></>
      )} */}

      
      {/* <TextInput
  style={styles.input}
  keyboardType="numeric"
  value={existingForm.monthly_income_estimate || ''}
  onChangeText={(v) => setExistingForm({ ...existingForm, monthly_income_estimate: v })}
  onEndEditing={() => {
    const { monthlyIncome, workingCapital, monthlyGP, yearlyGP } =
      calculateAndStoreGP(existingForm.monthly_income_estimate, existingForm.working_capital_monthly);

    setExistingForm({
      ...existingForm,
      monthly_income_estimate: String(monthlyIncome),
      working_capital_monthly: String(workingCapital),
      monthly_gp: String(monthlyGP),
      yearly_gp: String(yearlyGP),
    });
  }}
/>

<TextInput
  style={styles.input}
  keyboardType="numeric"
  value={existingForm.working_capital_monthly || ''}
  onChangeText={(v) => setExistingForm({ ...existingForm, working_capital_monthly: v })}
  onEndEditing={() => {
    const { monthlyIncome, workingCapital, monthlyGP, yearlyGP } =
      calculateAndStoreGP(existingForm.monthly_income_estimate, existingForm.working_capital_monthly);

    setExistingForm({
      ...existingForm,
      monthly_income_estimate: String(monthlyIncome),
      working_capital_monthly: String(workingCapital),
      monthly_gp: String(monthlyGP),
      yearly_gp: String(yearlyGP),
    });
  }}
/>
{existingForm.monthly_income_estimate && existingForm.working_capital_monthly && (() => {
  const monthlyIncome = parseFloat(existingForm.monthly_income_estimate) || 0;
  const workingCapital = parseFloat(existingForm.working_capital_monthly) || 0;
  const monthlyGP = monthlyIncome - workingCapital;
  const monthlyGPPercent = monthlyIncome > 0 ? ((monthlyGP / monthlyIncome) * 100).toFixed(2) : 0;

  const yearlyIncome = monthlyIncome * 12;
  const yearlyWorkingCapital = workingCapital * 12;
  const yearlyGP = yearlyIncome - yearlyWorkingCapital;
  const yearlyGPPercent = yearlyIncome > 0 ? ((yearlyGP / yearlyIncome) * 100).toFixed(2) : 0;

  const formatNumber = (value) =>
    value ? Number(String(value).replace(/,/g, '')).toLocaleString('en-IN') : '';

  return (
    <View style={{ marginTop: 10, padding: 12, backgroundColor: '#f2f9f2', borderRadius: 8 }}>
      <Text style={styles.label}>Monthly Gross Profit:</Text>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'green' }}>
        ₹ {formatNumber(monthlyGP)} ({monthlyGPPercent}%)
      </Text>

      <View style={{ marginTop: 12 }}>
        <Text style={styles.label}>Yearly Income Estimate:</Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>₹ {formatNumber(yearlyIncome)}</Text>

        <Text style={[styles.label, { marginTop: 6 }]}>Yearly Working Capital:</Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>₹ {formatNumber(yearlyWorkingCapital)}</Text>

        <Text style={[styles.label, { marginTop: 6 }]}>Yearly Gross Profit:</Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'green' }}>
          ₹ {formatNumber(yearlyGP)} ({yearlyGPPercent}%)
        </Text>
      </View>
    </View>
  );
})()} */}




      {/* 16) SHG CIF funds */}
      {/* <View style={styles.fieldBlock}>
        <Text style={styles.label}>15) Have your SHG received CIF Funds?</Text>
        <Text style={styles.helpText}>
          Please select Yes if your Self Help Group (SHG) has received Community Investment Fund (CIF) support.
        </Text>
        <YesNoToggle
          value={existingForm.has_shg_cif || ''}
          onChange={(val) => update({ has_shg_cif: val })}
        />

        {hasShgCifYes && (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.helpText}>
              Please enter the CIF amount in rupees as given to your SHG.
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={existingForm.cif_fund_amt || ''}
              onChangeText={(v) => update({ cif_fund_amt: v })}
            />
          </View>
        )}
      </View> */}


    <View style={styles.fieldBlock}>
  <Text style={styles.label}>  {language === 'hi'
      ? 'क्या आपके स्वयं सहायता समूह (SHG) को अनिवार्य निधि प्राप्त हुई है?'
      : 'Have your SHG received mandatory Funds?'}</Text>
  <Text style={styles.helpText}>
     {language === 'hi'
      ? 'यदि आपके स्वयं सहायता समूह (SHG) को अनिवार्य सहायता/निधि प्राप्त हुई है तो कृपया हाँ चुनें।'
      : 'Please select Yes if your Self Help Group (SHG) has received mandatory support.'}
  </Text>

  <YesNoToggle
    value={existingForm.has_shg_cif || ''}
      language={language}
      onChange={(val) => update({ has_shg_cif: val, has_part_cif: '', part_cif_amt: '', fund_cards: val === 'Yes',
           fund_cards: val==='Yes' ? (existingForm.fund_cards || []) : []})}
  />

  {/* ADD BUTTON */}
      {hasShgCifYes && (
        <TouchableOpacity style={styles.addBtn} onPress={addFundCard}>
          <Text style={styles.addText}>{language === 'hi' ? '+ निधि जोड़ें' : '+ Add Fund'}</Text>
        </TouchableOpacity>
      )}



      {/* FUND CARDS */}
      {hasShgCifYes && fund_cards.map((card,index)=>{

       const received = Number(card.amount_received || 0);
const repaid = card.amount_repaid === '' || card.amount_repaid == null
  ? null
  : Number(card.amount_repaid);

let pending = null;
if (repaid !== null) pending = received - repaid;

let status = '';
let color = '#333';

// EMPTY REPAYMENT FIELD
if (repaid === null) {
  status = language === 'hi' ? 'भुगतान नहीं किया गया' : 'Not Paid';
  color = 'red';
}

// NO LOAN RECEIVED
else if (received === 0 && repaid === 0) {
  status = language === 'hi' ? 'भुगतान नहीं किया गया' : 'Not Paid';
  color = 'red';
}

// INVALID NEGATIVE
else if (repaid < 0) {
  status = language === 'hi'
      ? 'अमान्य भुगतान राशि'
      : 'Invalid repayment';
  color = 'red';
}

// MORE THAN LOAN
else if (repaid > received) {
  status = language === 'hi'
      ? 'भुगतान राशि ऋण राशि से अधिक नहीं हो सकती'
      : 'Repaid amount cannot exceed loan amount';
  color = 'red';
}

// FULLY PAID
else if (pending === 0) {
  status = language === 'hi' ? 'पूर्ण भुगतान' : 'Fully Paid';
  color = 'green';
}

// PARTIALLY PAID
else if (pending > 0) {
  status = language === 'hi' ? 'आंशिक भुगतान' : 'Partially Paid';
  color = 'orange';
}

// SAFETY FALLBACK
else {
  status = anguage === 'hi' ? 'भुगतान नहीं किया गया' : 'Not Paid';
  color = 'red';
}

        return (
          <View key={index} style={styles.card}>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={()=>deleteFundCard(index)}
            >
              <Text style={styles.deleteTxt}>{language === 'hi' ? 'हटाएँ' : 'Delete'}</Text>
            </TouchableOpacity>


            <Text style={styles.cardTitle}> {language === 'hi'
          ? 'कृपया बताएं कि आपके SHG को ये अनिवार्य निधियाँ प्राप्त हुई हैं या नहीं'
          : 'Please specify if your SHG has received these mandatory funds'}</Text>

            {['RF','CIF','CCL', 'Other'].map(type=>(
              <TouchableOpacity
                key={type}
                style={styles.radioRow}
                onPress={()=>
                  update({
                    ...existingForm,
                    fund_cards: fund_cards.map((c,i)=>
                      i===index ? {...c, loanType:type} : c
                    )
                  })
                }
              >
                <View style={[
                  styles.radioCircle,
                  card.loanType===type && styles.radioSelected
                ]} />
                <Text>
                  {/* {type} */}
                   {language === 'hi' && type === 'Other'
              ? 'अन्य'
              : type}
                  </Text>
              </TouchableOpacity>
            ))}
             {card.loanType === 'Other' && (
  <TextInput
    style={styles.input}
    value={card.otherLoanTypeText || ''}
     placeholder={
            language === 'hi' ? 'कृपया विवरण दें' : 'Please Specify'
          }
    onChangeText={(v) =>
      update({
        ...existingForm,
        fund_cards: existingForm.fund_cards.map((c,i) =>
          i === index
            ? { ...c, otherLoanTypeText: v }
            : c
        )
      })
    }
  />
)}
             

            {/* PART RECEIVED */}
            <Text style={styles.cardTitle}>   {language === 'hi'
          ? 'क्या आपको इस निधि का कुछ हिस्सा प्राप्त हुआ है?'
          : 'Have you received part of this fund?'}</Text>

            <View style={styles.row}>
              {['Yes','No'].map(v=>(
                <TouchableOpacity
                  key={v}
                  style={[
                    styles.toggle,
                    card.has_received===v && styles.toggleActive
                  ]}
                  onPress={()=>
                    update({
                      ...existingForm,
                      fund_cards: fund_cards.map((c,i)=>
                        i===index ? {...c, has_received:v} : c
                      )
                    })
                  }
                >
                  <Text style={[
                    styles.toggleText,
                    card.has_received===v && styles.toggleTextActive
                  ]}>
                    {/* {v} */}
                    {language === 'hi'
                ? v === 'Yes'
                  ? 'हाँ'
                  : 'नहीं'
                : v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>



            {/* AMOUNT FIELDS — only when YES */}
            {card.has_received==='Yes' && (
              <>
              <Text style={styles.inputLabel}>  {language === 'hi' ? 'प्राप्त राशि' : 'Amount Received'}</Text>
                <TextInput
                  placeholder={language === 'hi' ? 'प्राप्त राशि' : 'Amount Received'}
                  keyboardType="numeric"
                  style={styles.input}
                  value={card.amount_received}
                  onChangeText={(text)=>
                    update({
                      ...existingForm,
                      fund_cards: fund_cards.map((c,i)=>
                        i===index ? {...c, amount_received:text} : c
                      )
                    })
                  }
                />
                <Text style={styles.inputLabel}> {language === 'hi' ? 'चुकाई गई राशि' : 'Amount Repaid'}</Text>
                <TextInput
                  placeholder={language === 'hi' ? 'चुकाई गई राशि' : 'Amount Repaid'}
                  keyboardType="numeric"
                  style={styles.input}
                  value={card.amount_repaid}
                  onChangeText={(text)=>
                    update({
                      ...existingForm,
                      fund_cards: fund_cards.map((c,i)=>
                        i===index ? {...c, amount_repaid:text} : c
                      )
                    })
                  }
                />

                <Text style={[styles.status,{color}]}>
                  {status}{'\n'}
                  {/* Pending Amount: {pending} */}
                    {language === 'hi'
        ? `शेष राशि: ${pending}`
        : `Pending Amount: ${pending}`}
                </Text>
              </>
            )}

          </View>
        );
      })}

    </View>



      {/* 17) Initial investment */}
      {/* <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          17) What was your Initial Investment for this Enterprise?
        </Text>
        <Text style={styles.helpText}>
          Please enter the approximate total amount of money you used when you first started your enterprise.
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={existingForm.initial_investment || ''}
          onChangeText={(v) => update({ initial_investment: v })}
        />
      </View> */}

      {/* 18) Source of investment – parent/child tree */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          Select all sources of your Investment that apply
        </Text>
        <Text style={styles.helpText}>
          Please select all departments and schemes from where you received support or funds
          for your initial investment. You may choose multiple parents and multiple schemes under them.
        </Text>

        <SourceOfInvestmentTree
          value={existingForm.source_of_investment_tree}
          onChange={(tree) => update({ source_of_investment_tree: tree })}
        />

        <Text style={[styles.helpText, { marginTop: 4 }]}>
          Note: Your selections will be saved as &quot;[Parent: Scheme1, Scheme2]&quot; format
          for sending to the server.
        </Text>
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
  labelSub: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#444',
    fontSize: 13,
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
  card: {
  backgroundColor: '#FFF',
  borderWidth: 1,
  borderColor: '#EE6969',
  borderRadius: 10,
  padding: 12,
  marginTop: 10,
},

cardTitle: {
  fontWeight: 'bold',
  fontSize: 15,
  color: '#333',
},

checkbox: {
  width: 18,
  height: 18,
  borderWidth: 1,
  borderRadius: 4,
  borderColor: '#EE6969',
  marginRight: 8,
},

checkboxChecked: {
  backgroundColor: '#EE6969',
  borderColor: '#EE6969',
},

  fieldBlock:{ marginBottom:14 },

  label:{
    fontWeight:'bold',
    marginBottom:4,
    color:'#333'
  },

  helpText:{
    fontSize:12,
    color:'#666'
  },

  row:{
    flexDirection:'row',
    marginTop:6
  },

  toggle:{
    flex:1,
    borderWidth:1,
    borderColor:'#ccc',
    borderRadius:8,
    paddingVertical:8,
    alignItems:'center',
    marginRight:6
  },

  toggleActive:{
    backgroundColor:'#EE6969',
    borderColor:'#EE6969'
  },

  toggleText:{ color:'#333' },

  toggleTextActive:{
    color:'#fff',
    fontWeight:'700'
  },

  addBtn:{
    marginTop:10,
    borderWidth:1,
    borderColor:'#EE6969',
    borderRadius:8,
    paddingVertical:10,
    alignItems:'center'
  },

  addText:{
    color:'#EE6969',
    fontWeight:'700'
  },

  card:{
    backgroundColor:'#FFF',
    borderWidth:1,
    borderColor:'#EE6969',
    borderRadius:10,
    padding:12,
    marginTop:10
  },

  deleteBtn:{ alignSelf:'flex-end' },

  deleteTxt:{
    color:'#EE6969',
    fontWeight:'600'
  },

  cardTitle:{
    fontWeight:'bold',
    marginTop:6,
    marginBottom:4
  },

  radioRow:{
    flexDirection:'row',
    alignItems:'center',
    marginVertical:4
  },

  radioCircle:{
    width:18,
    height:18,
    borderRadius:10,
    borderWidth:2,
    borderColor:'#EE6969',
    marginRight:8
  },

  radioSelected:{ backgroundColor:'#EE6969' },

  input:{
    borderWidth:1,
    borderColor:'#ccc',
    borderRadius:6,
    padding:8,
    marginTop:8
  },

  status:{
    fontWeight:'700',
    marginTop:10
  },
    inputLabel: {
    fontSize: 14,
    color: '#555555',
    marginTop: 6,
    marginBottom: 4,
  },
});
