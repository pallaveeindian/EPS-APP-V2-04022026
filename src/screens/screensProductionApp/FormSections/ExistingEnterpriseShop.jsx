// // src/screens/screensProductionApp/FormSections/ExistingEnterpriseShop.jsx
// import React, { useContext } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import { LanguageContext } from '../../../components/LanguageContext';
// import ExistingEnterpriseProductServicesSection from './ExistingEnterpriseProductServicesSection';
// import LanguageToggle from '../../../components/LanguageToggle';
// import { Image } from 'react-native';
// import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
// import { PermissionsAndroid, Platform } from 'react-native';

// export default function ShopBasedProductSection({ row, index, updateRow }) {
//   const { language } = useContext(LanguageContext);

//   const SHOP_CATEGORIES = [
//     {
//       parent: { en: 'Grocery & Daily Needs', hi: 'किराना और दैनिक आवश्यकताएँ' },
//       children: [
//         { en: 'Kirana Store (General Store)', hi: 'किराना स्टोर (जनरल स्टोर)' },
//         { en: 'Supermarket', hi: 'सुपरमार्केट' },
//         { en: 'Provision Store', hi: 'राशन स्टोर' },
//         { en: 'Organic Food Store', hi: 'ऑर्गेनिक फूड स्टोर' },
//         { en: 'Dairy Booth', hi: 'डेयरी बूथ' },
//         { en: 'Ration Shop (PDS)', hi: 'राशन दुकान (पीडीएस)' },
//         { en: 'Others', hi: 'अन्य' },
//       ],
//     },

//     {
//       parent: { en: 'Education & Stationery', hi: 'शिक्षा और स्टेशनरी' },
//       children: [
//         { en: 'Stationery Shop', hi: 'स्टेशनरी दुकान' },
//         { en: 'Book Store', hi: 'पुस्तक दुकान' },
//         { en: 'Photocopy / Xerox Shop', hi: 'फोटोकॉपी / ज़ेरॉक्स दुकान' },
//         {
//           en: 'Competitive Exam Book Store',
//           hi: 'प्रतियोगी परीक्षा पुस्तक दुकान',
//         },
//         { en: 'School Uniform Shop', hi: 'स्कूल यूनिफॉर्म दुकान' },
//         { en: 'Others', hi: 'अन्य' },
//       ],
//     },

//     {
//       parent: { en: 'Medical & Health', hi: 'चिकित्सा और स्वास्थ्य' },
//       children: [
//         { en: 'Medical Store / Pharmacy', hi: 'मेडिकल स्टोर / फार्मेसी' },
//         { en: 'Generic Medicine Store', hi: 'जेनेरिक दवा दुकान' },
//         { en: 'Ayurvedic Medicine Shop', hi: 'आयुर्वेदिक दवा दुकान' },
//         {
//           en: 'Surgical & Medical Equipment Store',
//           hi: 'सर्जिकल एवं मेडिकल उपकरण दुकान',
//         },
//         { en: 'Optical Store', hi: 'ऑप्टिकल स्टोर' },
//         { en: 'Others', hi: 'अन्य' },
//       ],
//     },

//     {
//       parent: { en: 'Clothing & Fashion', hi: 'कपड़े और फैशन' },
//       children: [
//         { en: 'Readymade Garments Shop', hi: 'रेडीमेड कपड़े दुकान' },
//         { en: 'Saree Shop', hi: 'साड़ी दुकान' },
//         { en: 'Boutique', hi: 'बुटीक' },
//         { en: 'Tailor Shop', hi: 'दर्जी की दुकान' },
//         { en: 'Footwear Shop', hi: 'जूते-चप्पल दुकान' },
//         { en: 'Cosmetic Shop', hi: 'कॉस्मेटिक दुकान' },
//         { en: 'Others', hi: 'अन्य' },
//       ],
//     },

//     {
//       parent: { en: 'Fresh & Food Markets', hi: 'ताज़ा और खाद्य बाज़ार' },
//       children: [
//         { en: 'Vegetable Shop', hi: 'सब्जी की दुकान' },
//         { en: 'Fruit Shop', hi: 'फल की दुकान' },
//         { en: 'Meat Shop', hi: 'मांस की दुकान' },
//         { en: 'Fish Shop', hi: 'मछली की दुकान' },
//         { en: 'Sweet Shop (Mithai Shop)', hi: 'मिठाई की दुकान' },
//         { en: 'Bakery', hi: 'बेकरी' },
//         { en: 'Fast Food Shop', hi: 'फास्ट फूड दुकान' },
//         { en: 'Others', hi: 'अन्य' },
//       ],
//     },

//     {
//       parent: { en: 'Household & Hardware', hi: 'घरेलू और हार्डवेयर' },
//       children: [
//         { en: 'Hardware Store', hi: 'हार्डवेयर दुकान' },
//         { en: 'Paint Shop', hi: 'पेंट की दुकान' },
//         { en: 'Electrical Shop', hi: 'इलेक्ट्रिकल दुकान' },
//         { en: 'Plumbing Shop', hi: 'प्लंबिंग दुकान' },
//         { en: 'Furniture Store', hi: 'फर्नीचर दुकान' },
//         { en: 'Utensil Shop', hi: 'बर्तन की दुकान' },
//         { en: 'Others', hi: 'अन्य' },
//       ],
//     },

//     {
//       parent: { en: 'Electronics & Mobile', hi: 'इलेक्ट्रॉनिक्स और मोबाइल' },
//       children: [
//         { en: 'Mobile Shop', hi: 'मोबाइल दुकान' },
//         { en: 'Mobile Repair Shop', hi: 'मोबाइल रिपेयर दुकान' },
//         { en: 'Electronics Store', hi: 'इलेक्ट्रॉनिक्स स्टोर' },
//         { en: 'Computer & Laptop Shop', hi: 'कंप्यूटर और लैपटॉप दुकान' },
//         { en: 'CCTV & Security Shop', hi: 'सीसीटीवी और सुरक्षा दुकान' },
//         { en: 'Others', hi: 'अन्य' },
//       ],
//     },

//     {
//       parent: { en: 'Agriculture & Rural', hi: 'कृषि और ग्रामीण' },
//       children: [
//         { en: 'Seed & Fertilizer Shop', hi: 'बीज और उर्वरक दुकान' },
//         { en: 'Pesticide Store', hi: 'कीटनाशक दुकान' },
//         { en: 'Tractor Parts Shop', hi: 'ट्रैक्टर पार्ट्स दुकान' },
//         { en: 'Animal Feed Store', hi: 'पशु चारा दुकान' },
//         { en: 'Others', hi: 'अन्य' },
//       ],
//     },

//     {
//       parent: { en: 'Automobile', hi: 'ऑटोमोबाइल' },
//       children: [
//         { en: 'Auto Parts Shop', hi: 'ऑटो पार्ट्स दुकान' },
//         { en: 'Bike Repair Shop', hi: 'बाइक रिपेयर दुकान' },
//         { en: 'Car Accessories Shop', hi: 'कार एक्सेसरीज़ दुकान' },
//         { en: 'Tyre Shop', hi: 'टायर दुकान' },
//         { en: 'Others', hi: 'अन्य' },
//       ],
//     },

//     {
//       parent: { en: 'Service-Based Shops', hi: 'सेवा आधारित दुकानें' },
//       children: [
//         { en: 'Beauty Parlour', hi: 'ब्यूटी पार्लर' },
//         { en: 'Barber Shop / Salon', hi: 'नाई की दुकान / सैलून' },
//         { en: 'Cyber Café', hi: 'साइबर कैफे' },
//         { en: 'Travel Agency', hi: 'ट्रैवल एजेंसी' },
//         { en: 'Common Service Centre (CSC)', hi: 'कॉमन सर्विस सेंटर (सीएससी)' },
//         { en: 'Printing Press', hi: 'प्रिंटिंग प्रेस' },
//         { en: 'Others', hi: 'अन्य' },
//       ],
//     },

//     {
//       parent: { en: 'Others', hi: 'अन्य' },
//     },
//   ];

//   const TARGET_CUSTOMERS_OPTIONS = [
//     { en: 'Local consumers', hi: 'स्थानीय ग्राहक' },
//     { en: 'Shopkeepers and market sellers', hi: 'दुकानदार और बाजार विक्रेता' },
//     { en: 'Urban consumers', hi: 'शहरी ग्राहक' },
//     { en: 'Online customers', hi: 'ऑनलाइन ग्राहक' },
//     { en: 'Institutional buyers', hi: 'संस्थागत खरीदार' },
//     { en: 'Others', hi: 'अन्य' },
//   ];

//   const SALES_AREA_OPTIONS = [
//     { en: 'Village', hi: 'गांव' },
//     { en: 'Block', hi: 'ब्लॉक' },
//     { en: 'District', hi: 'जिला' },
//     { en: 'State', hi: 'राज्य' },
//     { en: 'Other State', hi: 'अन्य राज्य' },
//     { en: 'Other Country', hi: 'अन्य देश' },
//   ];

//   const MARKETING_STRATEGY_OPTIONS = [
//     {
//       en: 'Word of Mouth / Door-to-Door Selling',
//       hi: 'मौखिक प्रचार / घर-घर बिक्री',
//     },
//     {
//       en: 'Selling in Local Markets (Haat/Bazaar)',
//       hi: 'स्थानीय बाजार (हाट/बाजार) में बिक्री',
//     },
//     {
//       en: 'Using SHG Networks for Promotion',
//       hi: 'एसएचजी नेटवर्क के माध्यम से प्रचार',
//     },
//     {
//       en: 'Display Boards or Posters Near Shop/Workplace',
//       hi: 'दुकान/कार्यस्थल के पास बोर्ड या पोस्टर',
//     },
//     { en: 'Others', hi: 'अन्य' },
//   ];

//   const MARKETING_CHANNEL_OPTIONS = [
//     { en: 'Retail', hi: 'खुदरा' },
//     { en: 'Online', hi: 'ऑनलाइन' },
//     { en: 'Exhibition', hi: 'प्रदर्शनी' },
//     { en: 'ESARAS', hi: 'ई-सारस' },
//     { en: 'Others', hi: 'अन्य' },
//   ];

//   const CHANNEL_SUB_OPTIONS = {
//     Retail: [
//       { en: 'Local Retail Shops', hi: 'स्थानीय खुदरा दुकानें' },
//       { en: 'Kirana Stores', hi: 'किराना स्टोर' },
//       { en: 'Others', hi: 'अन्य' },
//     ],
//     Online: [
//       { en: 'Amazon', hi: 'अमेज़न' },
//       { en: 'Flipkart', hi: 'फ्लिपकार्ट' },
//       { en: 'ONDC', hi: 'ओएनडीसी' },
//       { en: 'WhatsApp Marketing', hi: 'व्हाट्सएप मार्केटिंग' },
//       { en: 'Others', hi: 'अन्य' },
//     ],
//     Exhibition: [
//       { en: 'District SARAS', hi: 'जिला सरस' },
//       { en: 'State SARAS', hi: 'राज्य सरस' },
//       { en: 'National SARAS', hi: 'राष्ट्रीय सरस' },
//       { en: 'Existing Product Marketing', hi: 'मौजूदा उत्पाद विपणन' },
//       { en: 'Others', hi: 'अन्य' },
//     ],
//     Others: [{ en: 'Others', hi: 'अन्य' }],
//   };

//   const MARKETING_CHALLENGE_OPTIONS = [
//     {
//       en: 'Do you face difficulty finding buyers outside your village?',
//       hi: 'क्या आपको अपने गांव के बाहर खरीदार ढूंढने में कठिनाई होती है?',
//     },
//     {
//       en: 'Is limited knowledge of digital tools a barrier for marketing?',
//       hi: 'क्या डिजिटल टूल्स की सीमित जानकारी विपणन में बाधा है?',
//     },
//     { en: 'Others', hi: 'अन्य' },
//   ];

//   /* ---------------------------------- */
//   /* HELPERS */
//   /* ---------------------------------- */

//   const splitMulti = val => (val ? val.split(',') : []);
//   const selectSingle = (field, value) => {
//     updateRow(index, { [field]: value });
//   };

//   const toggleMulti = (field, value) => {
//     const arr = splitMulti(row[field]);
//     if (arr.includes(value)) {
//       updateRow(index, {
//         [field]: arr.filter(v => v !== value).join(','),
//       });
//     } else {
//       updateRow(index, {
//         [field]: [...arr, value].join(','),
//       });
//     }
//   };

//   const renderMultiCheckbox = (field, optionObj) => {
//     const value = optionObj.en; // store English
//     const label = language === 'hi' ? optionObj.hi : optionObj.en;

//     const selected = splitMulti(row[field]).includes(value);

//     return (
//       <TouchableOpacity
//         key={value}
//         style={styles.checkboxRow}
//         onPress={() => toggleMulti(field, value)}
//       >
//         <Text style={styles.checkboxIcon}>{selected ? '☑' : '☐'}</Text>

//         <Text style={[styles.checkboxLabel, selected && { fontWeight: '700' }]}>
//           {label}
//         </Text>
//       </TouchableOpacity>
//     );
//   };

//   const renderSingleCheckbox = (field, optionObj) => {
//     const value = optionObj.en;
//     const label = language === 'hi' ? optionObj.hi : optionObj.en;

//     const selected = row[field] === value;

//     return (
//       <TouchableOpacity
//         key={value}
//         style={styles.checkboxRow}
//         onPress={() => selectSingle(field, value)}
//       >
//         <Text style={styles.checkboxIcon}>{selected ? '☑' : '☐'}</Text>

//         <Text style={[styles.checkboxLabel, selected && { fontWeight: '700' }]}>
//           {label}
//         </Text>
//       </TouchableOpacity>
//     );
//   };

//   const renderYesNo = (value, setter) => (
//     <View style={styles.yesNoRow}>
//       {['Yes', 'No'].map(opt => {
//         const active = value === opt;

//         return (
//           <TouchableOpacity
//             key={opt}
//             style={[styles.yesNoBtn, active && styles.yesNoBtnActive]}
//             onPress={() => setter(opt)}
//           >
//             <Text style={[styles.yesNoText, active && styles.yesNoTextActive]}>
//               {language === 'hi' ? (opt === 'Yes' ? 'हाँ' : 'नहीं') : opt}
//             </Text>
//           </TouchableOpacity>
//         );
//       })}
//     </View>
//   );

//   /* ---------------------------------- */
//   /* MEDIA FUNCTIONS */
//   /* ---------------------------------- */

//   const requestCameraPermission = async () => {
//     if (Platform.OS === 'android') {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.CAMERA,
//       );
//       return granted === PermissionsAndroid.RESULTS.GRANTED;
//     }
//     return true;
//   };

//   const pickMediaForRow = async typeKey => {
//     const res = await launchImageLibrary({
//       mediaType: 'photo',
//       selectionLimit: 3,
//     });

//     if (!res.didCancel && res.assets?.length) {
//       const existing = row.media?.[typeKey] || [];

//       // Append but max 3
//       const combined = [...existing, ...res.assets].slice(0, 3);

//       updateRow(index, {
//         media: {
//           ...row.media,
//           [typeKey]: combined,
//         },
//       });
//     }
//   };

//   const openCameraForRow = async typeKey => {
//     const hasPermission = await requestCameraPermission();
//     if (!hasPermission) return;

//     const res = await launchCamera({ mediaType: 'photo' });

//     if (!res.didCancel && res.assets?.length) {
//       const existing = row.media?.[typeKey] || [];

//       const combined = [...existing, ...res.assets].slice(0, 3);

//       updateRow(index, {
//         media: {
//           ...row.media,
//           [typeKey]: combined,
//         },
//       });
//     }
//   };

//   const renderMarketingChannelsWithSubOptions = () => {
//     return (
//       <View>
//         {MARKETING_CHANNEL_OPTIONS.map(mainChan => {
//           const isMainSelected = splitMulti(row.marketing_channels).includes(
//             mainChan.en,
//           );
//           return (
//             <View key={mainChan.en} style={styles.nestedSection}>
//               {renderMultiCheckbox('marketing_channels', mainChan)}

//               {/* SUB OPTIONS UI */}
//               {isMainSelected && (
//                 <View style={styles.subOptionsContainer}>
//                   {CHANNEL_SUB_OPTIONS[mainChan.en]?.map(subChan =>
//                     renderMultiCheckbox('marketing_channels', subChan),
//                   )}

//                   {/* Additional text field for linkages if 'Others' or specific sub-options selected */}
//                   {splitMulti(row.marketing_channels).includes('Others') && (
//                     <TextInput
//                       style={[styles.input, { marginTop: 6 }]}
//                       placeholder={
//                         language === 'hi' ? 'विवरण दें' : 'Specify details'
//                       }
//                       value={row.market_linkage}
//                       onChangeText={v =>
//                         updateRow(index, { market_linkage: v })
//                       }
//                     />
//                   )}
//                 </View>
//               )}
//             </View>
//           );
//         })}
//       </View>
//     );
//   };
//   /* ---------------------------------- */
//   /* RENDER */
//   /* ---------------------------------- */

//   return (
//     <ScrollView style={styles.container}>
//       <View
//         style={{
//           flexDirection: 'row',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           marginBottom: 10,
//         }}
//       >
//         <Text style={styles.sectionTitle}>
//           {language === 'hi'
//             ? '3) उत्पाद और सेवाएँ'
//             : '3) Product and Services'}
//         </Text>
//         <LanguageToggle />
//       </View>
//       {/* MAIN QUESTION */}
//       <View style={styles.fieldBlock}>
//         <Text style={styles.label}>
//           {language === 'hi'
//             ? 'क्या आपके पास दुकान आधारित उत्पाद हैं?'
//             : 'Do you have shop based products?'}
//         </Text>

//         {renderYesNo(row.has_shop_product, val =>
//           updateRow(index, { has_shop_product: val }),
//         )}
//       </View>

//       {/* IF YES → SHOW SHOP FORM */}
//       {row.has_shop_product === 'Yes' && (
//         <View>
//           {/* SHOP TYPE */}
//           <View style={styles.fieldBlock}>
//             <Text style={styles.label}>
//               {language === 'hi' ? 'दुकान का प्रकार' : 'Shop Type'}
//             </Text>

//             <View style={styles.pickerWrapper}>
//               <Picker
//                 selectedValue={row.shop_type}
//                 onValueChange={v => updateRow(index, { shop_type: v })}
//               >
//                 <Picker.Item label="Select" value="" />
//                 {SHOP_CATEGORIES.map(cat => (
//                   <Picker.Item
//                     key={cat.parent.en}
//                     label={language === 'hi' ? cat.parent.hi : cat.parent.en}
//                     value={cat.parent.en}
//                   />
//                 ))}
//               </Picker>
//             </View>

//             {/* SHOP SUBTYPE */}
//             {row.shop_type && (
//               <View style={styles.fieldBlock}>
//                 <Text style={styles.label}>
//                   {language === 'hi'
//                     ? 'उत्पाद श्रेणी चुनें'
//                     : 'Select Product Category'}
//                 </Text>

//                 {SHOP_CATEGORIES.find(
//                   cat => cat.parent.en === row.shop_type,
//                 )?.children?.map(child =>
//                   renderSingleCheckbox('shop_sub_category', child),
//                 )}

//                 {row.shop_sub_category === 'Others' && (
//                   <TextInput
//                     style={styles.input}
//                     placeholder={
//                       language === 'hi'
//                         ? 'अन्य श्रेणी बताएं'
//                         : 'Specify other category'
//                     }
//                     value={row.shop_sub_category_other}
//                     onChangeText={v =>
//                       updateRow(index, { shop_sub_category_other: v })
//                     }
//                   />
//                 )}
//               </View>
//             )}
//           </View>

//           {/* SOURCE OF INVENTORY */}
//           <View style={styles.fieldBlock}>
//             <Text style={styles.label}>
//               {language === 'hi' ? 'स्टॉक का स्रोत' : 'Source of Inventory'}
//             </Text>

//             <TextInput
//               style={styles.input}
//               value={row.inventory_source}
//               onChangeText={v => updateRow(index, { inventory_source: v })}
//               placeholder={
//                 language === 'hi'
//                   ? 'उदाहरण: थोक बाजार'
//                   : 'Example: Wholesale market'
//               }
//             />
//           </View>

//           {/* TARGET CUSTOMERS */}
//           <View style={styles.fieldBlock}>
//             <Text style={styles.label}>
//               {language === 'hi' ? 'लक्षित ग्राहक' : 'Target Customers'}
//             </Text>

//             {TARGET_CUSTOMERS_OPTIONS.map(opt =>
//               renderMultiCheckbox('target_customers', opt),
//             )}

//             {splitMulti(row.target_customers).includes('Others') && (
//               <TextInput
//                 style={styles.input}
//                 placeholder={
//                   language === 'hi'
//                     ? 'अन्य ग्राहक बताएं'
//                     : 'Specify other customers'
//                 }
//                 value={row.target_customers_other}
//                 onChangeText={v =>
//                   updateRow(index, { target_customers_other: v })
//                 }
//               />
//             )}
//           </View>

//           {/* SALES AREA */}
//           <View style={styles.fieldBlock}>
//             <Text style={styles.label}>
//               {language === 'hi' ? 'बिक्री क्षेत्र' : 'Sales Area'}
//             </Text>

//             {SALES_AREA_OPTIONS.map(opt =>
//               renderMultiCheckbox('sales_area', opt),
//             )}
//           </View>

//           {/* MARKETING STRATEGY */}
//           <View style={styles.fieldBlock}>
//             <Text style={styles.label}>
//               {language === 'hi' ? 'मार्केटिंग रणनीति' : 'Marketing Strategy'}
//             </Text>

//             {MARKETING_STRATEGY_OPTIONS.map(opt =>
//               renderMultiCheckbox('marketing_strategy', opt),
//             )}

//             {splitMulti(row.marketing_strategy).includes('Others') && (
//               <TextInput
//                 style={styles.input}
//                 placeholder={
//                   language === 'hi'
//                     ? 'अन्य रणनीति बताएं'
//                     : 'Specify other strategy'
//                 }
//                 value={row.marketing_strategy_other}
//                 onChangeText={v =>
//                   updateRow(index, { marketing_strategy_other: v })
//                 }
//               />
//             )}
//           </View>

//           {/*  MARKETING CHANNELS & LINKAGES */}
//           <View style={styles.fieldBlock}>
//             <Text style={styles.label}>
//               {language === 'hi'
//                 ? 'मार्केटिंग चैनल और लिंकिंग'
//                 : 'Marketing Channels & Linkages'}
//             </Text>
//             {renderMarketingChannelsWithSubOptions()}
//           </View>

//           {/* MARKETING CHALLENGES */}
//           <View style={styles.fieldBlock}>
//             <Text style={styles.label}>
//               {language === 'hi'
//                 ? 'मार्केटिंग चुनौतियाँ'
//                 : 'Marketing Challenges'}
//             </Text>
//             {MARKETING_CHALLENGE_OPTIONS.map(opt =>
//               renderMultiCheckbox('marketing_challenges', opt),
//             )}

//             {splitMulti(row.marketing_challenges).includes('Others') && (
//               <TextInput
//                 style={[styles.input, { marginTop: 6 }]}
//                 placeholder={
//                   language === 'hi'
//                     ? 'अन्य चुनौतियाँ बताएं'
//                     : 'Specify other challenges'
//                 }
//                 value={row.marketing_challenges}
//                 onChangeText={v =>
//                   updateRow(index, { marketing_challenges: v })
//                 }
//               />
//             )}
//           </View>
//           {/* DIGITAL PAYMENT */}
//           <View style={styles.fieldBlock}>
//             <Text style={styles.label}>
//               {language === 'hi'
//                 ? 'डिजिटल भुगतान स्वीकार करते हैं?'
//                 : 'Accept Digital Payment'}
//             </Text>

//             {renderYesNo(row.accept_digital_payment, val =>
//               updateRow(index, {
//                 accept_digital_payment: val,
//               }),
//             )}
//           </View>

//           {/* MONTHLY SALES */}
//           <View style={styles.fieldBlock}>
//             <Text style={styles.label}>
//               {language === 'hi'
//                 ? 'औसत मासिक बिक्री (रु)'
//                 : 'Average Monthly Sales (INR)'}
//             </Text>

//             <TextInput
//               style={styles.input}
//               keyboardType="numeric"
//               value={row.avg_monthly_sales}
//               onChangeText={v => {
//                 const numericValue = v.replace(/[^0-9]/g, '');

//                 const annual = numericValue
//                   ? String(Number(numericValue) * 12)
//                   : '';

//                 updateRow(index, {
//                   avg_monthly_sales: numericValue,
//                   annual_sale: annual, // ✅ auto calculated
//                 });
//               }}
//             />
//           </View>

//           {/* ANNUAL SALE */}
//           <View style={styles.fieldBlock}>
//             <Text style={styles.label}>
//               {language === 'hi' ? 'वार्षिक बिक्री' : 'Annual Sale'}
//             </Text>

//             <Text style={styles.helpText}>
//               {language === 'hi'
//                 ? 'यह स्वचालित रूप से मासिक बिक्री × 12 के आधार पर गणना की जाती है।'
//                 : 'This is automatically calculated as Average Monthly Sales × 12.'}
//             </Text>

//             <View style={styles.estimatedContainer}>
//               <Text style={styles.estimatedLabel}>
//                 {language === 'hi'
//                   ? 'मासिक बिक्री × 12'
//                   : 'Average Monthly Sales × 12'}
//               </Text>

//               <Text style={styles.estimatedValue}>
//                 ₹{' '}
//                 {row.annual_sale
//                   ? Number(row.annual_sale).toLocaleString('en-IN')
//                   : '0'}
//               </Text>
//             </View>
//           </View>
//           {/* SHOP PHOTO UPLOAD SECTION */}
//           <View style={styles.fieldBlock}>
//             <Text style={styles.label}>
//               {language === 'hi'
//                 ? 'दुकान की फ़ोटो अपलोड करें'
//                 : 'Upload Shop Photos'}
//             </Text>

//             {['shop_front', 'shop_inside'].map(typeKey => (
//               <View key={typeKey} style={styles.mediaBlock}>
//                 <Text style={styles.mediaLabel}>
//                   {typeKey === 'shop_front'
//                     ? language === 'hi'
//                       ? 'दुकान का सामने का भाग (1-3)'
//                       : 'Shop Front (1-3)'
//                     : language === 'hi'
//                     ? 'दुकान का अंदरूनी भाग (1-3)'
//                     : 'Shop Inside (1-3)'}
//                 </Text>

//                 <View style={{ flexDirection: 'row', gap: 8 }}>
//                   <TouchableOpacity
//                     style={styles.mediaBtn}
//                     onPress={() => pickMediaForRow(typeKey)}
//                   >
//                     <Text style={styles.mediaBtnText}>
//                       {language === 'hi' ? 'अपलोड करें' : 'Upload'}
//                     </Text>
//                   </TouchableOpacity>

//                   <TouchableOpacity
//                     style={styles.mediaBtn}
//                     onPress={() => openCameraForRow(typeKey)}
//                   >
//                     <Text style={styles.mediaBtnText}>
//                       {language === 'hi' ? 'कैमरा' : 'Camera'}
//                     </Text>
//                   </TouchableOpacity>
//                 </View>

//                 {row.media?.[typeKey]?.length > 0 && (
//                   <View style={styles.previewContainer}>
//                     {row.media[typeKey].map((file, i) => (
//                       <View key={i} style={styles.imageWrapper}>
//                         <Image
//                           source={{ uri: file.uri }}
//                           style={styles.previewImage}
//                         />

//                         <TouchableOpacity
//                           style={styles.removeBtn}
//                           onPress={() => {
//                             const updated = row.media[typeKey].filter(
//                               (_, idx) => idx !== i,
//                             );

//                             updateRow(index, {
//                               media: {
//                                 ...row.media,
//                                 [typeKey]: updated,
//                               },
//                             });
//                           }}
//                         >
//                           <Text style={styles.removeText}>✕</Text>
//                         </TouchableOpacity>
//                       </View>
//                     ))}
//                   </View>
//                 )}
//               </View>
//             ))}
//           </View>
//         </View>
//       )}

//       {/* IF NO → OPEN PRODUCT SERVICES SECTION */}
//       {row.has_shop_product === 'No' && (
//         <ExistingEnterpriseProductServicesSection
//           existingForm={row}
//           setExistingForm={patch => updateRow(index, patch)}
//         />
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   sectionContainer: { marginBottom: 24 },

//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     marginBottom: 8,
//     color: '#222',
//   },

//   helpText: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 6,
//   },

//   card: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 10,
//     padding: 10,
//     marginTop: 10,
//     backgroundColor: '#fafafa',
//   },

//   fieldBlock: { marginBottom: 12 },

//   label: {
//     fontWeight: 'bold',
//     marginBottom: 4,
//     color: '#333',
//   },

//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 6,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     fontSize: 15,
//     backgroundColor: '#fff',
//   },

//   pickerWrapper: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 6,
//     overflow: 'hidden',
//     backgroundColor: '#fff',
//   },

//   /* YES NO BUTTONS */

//   yesNoRow: {
//     flexDirection: 'row',
//     marginTop: 4,
//   },

//   yesNoBtn: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     paddingVertical: 6,
//     borderRadius: 6,
//     alignItems: 'center',
//     marginRight: 6,
//   },

//   yesNoBtnActive: {
//     backgroundColor: '#EE6969',
//     borderColor: '#EE6969',
//   },

//   yesNoText: {
//     fontSize: 14,
//     color: '#333',
//   },

//   yesNoTextActive: {
//     color: '#fff',
//     fontWeight: '700',
//   },

//   /* CHECKBOX */

//   checkboxRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     marginVertical: 2,
//   },

//   checkboxIcon: {
//     width: 20,
//     fontSize: 16,
//   },

//   checkboxLabel: {
//     flex: 1,
//     fontSize: 13,
//     color: '#444',
//   },

//   estimatedContainer: {
//     marginTop: 12,
//     padding: 16,
//     backgroundColor: '#e8f5e8',
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#28a745',
//   },

//   estimatedLabel: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#28a745',
//     marginBottom: 4,
//   },

//   estimatedValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1e7e34',
//   },
//   mediaBlock: {
//     marginTop: 10,
//     padding: 10,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     backgroundColor: '#fafafa',
//   },

//   mediaLabel: {
//     fontSize: 14,
//     marginBottom: 6,
//     fontWeight: '500',
//   },

//   mediaBtn: {
//     backgroundColor: '#EE6969',
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//   },

//   mediaBtnText: {
//     color: '#fff',
//     fontSize: 13,
//   },

//   mediaInfo: {
//     marginTop: 6,
//     fontSize: 12,
//     color: '#555',
//   },
//   previewContainer: {
//     flexDirection: 'row',
//     marginTop: 8,
//     gap: 8,
//   },

//   imageWrapper: {
//     position: 'relative',
//   },

//   previewImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 8,
//   },

//   removeBtn: {
//     position: 'absolute',
//     top: -6,
//     right: -6,
//     backgroundColor: '#EE6969',
//     width: 22,
//     height: 22,
//     borderRadius: 11,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   removeText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
//   subOptionsContainer: {
//     marginLeft: 25,
//     marginTop: 4,
//     padding: 8,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 8,
//     borderLeftWidth: 3,
//     borderLeftColor: '#EE6969',
//   },
//   nestedSection: { marginBottom: 10 },
//   checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
//   checkboxIcon: { fontSize: 18, marginRight: 8 },
//   checkboxLabel: { fontSize: 14, color: '#444' },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 6,
//     padding: 8,
//     backgroundColor: '#fff',
//   },
// });



// src/screens/screensProductionApp/FormSections/ExistingEnterpriseShop.jsx
import React, { useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LanguageContext } from '../../../components/LanguageContext';
import ExistingEnterpriseProductServicesSection from './ExistingEnterpriseProductServicesSection';
import LanguageToggle from '../../../components/LanguageToggle';
import { Image } from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { PermissionsAndroid, Platform } from 'react-native';

export default function ShopBasedProductSection({ row, index, updateRow }) {
  const { language } = useContext(LanguageContext);

  const SHOP_CATEGORIES = [
    {
      parent: { en: 'Grocery & Daily Needs', hi: 'किराना और दैनिक आवश्यकताएँ' },
      children: [
        { en: 'Kirana Store (General Store)', hi: 'किराना स्टोर (जनरल स्टोर)' },
        { en: 'Supermarket', hi: 'सुपरमार्केट' },
        { en: 'Provision Store', hi: 'राशन स्टोर' },
        { en: 'Organic Food Store', hi: 'ऑर्गेनिक फूड स्टोर' },
        { en: 'Dairy Booth', hi: 'डेयरी बूथ' },
        { en: 'Ration Shop (PDS)', hi: 'राशन दुकान (पीडीएस)' },
        { en: 'Others', hi: 'अन्य' },
      ],
    },

    {
      parent: { en: 'Education & Stationery', hi: 'शिक्षा और स्टेशनरी' },
      children: [
        { en: 'Stationery Shop', hi: 'स्टेशनरी दुकान' },
        { en: 'Book Store', hi: 'पुस्तक दुकान' },
        { en: 'Photocopy / Xerox Shop', hi: 'फोटोकॉपी / ज़ेरॉक्स दुकान' },
        {
          en: 'Competitive Exam Book Store',
          hi: 'प्रतियोगी परीक्षा पुस्तक दुकान',
        },
        { en: 'School Uniform Shop', hi: 'स्कूल यूनिफॉर्म दुकान' },
        { en: 'Others', hi: 'अन्य' },
      ],
    },

    {
      parent: { en: 'Medical & Health', hi: 'चिकित्सा और स्वास्थ्य' },
      children: [
        { en: 'Medical Store / Pharmacy', hi: 'मेडिकल स्टोर / फार्मेसी' },
        { en: 'Generic Medicine Store', hi: 'जेनेरिक दवा दुकान' },
        { en: 'Ayurvedic Medicine Shop', hi: 'आयुर्वेदिक दवा दुकान' },
        {
          en: 'Surgical & Medical Equipment Store',
          hi: 'सर्जिकल एवं मेडिकल उपकरण दुकान',
        },
        { en: 'Optical Store', hi: 'ऑप्टिकल स्टोर' },
        { en: 'Others', hi: 'अन्य' },
      ],
    },

    {
      parent: { en: 'Clothing & Fashion', hi: 'कपड़े और फैशन' },
      children: [
        { en: 'Readymade Garments Shop', hi: 'रेडीमेड कपड़े दुकान' },
        { en: 'Saree Shop', hi: 'साड़ी दुकान' },
        { en: 'Boutique', hi: 'बुटीक' },
        { en: 'Tailor Shop', hi: 'दर्जी की दुकान' },
        { en: 'Footwear Shop', hi: 'जूते-चप्पल दुकान' },
        { en: 'Cosmetic Shop', hi: 'कॉस्मेटिक दुकान' },
        { en: 'Others', hi: 'अन्य' },
      ],
    },

    {
      parent: { en: 'Fresh & Food Markets', hi: 'ताज़ा और खाद्य बाज़ार' },
      children: [
        { en: 'Vegetable Shop', hi: 'सब्जी की दुकान' },
        { en: 'Fruit Shop', hi: 'फल की दुकान' },
        { en: 'Meat Shop', hi: 'मांस की दुकान' },
        { en: 'Fish Shop', hi: 'मछली की दुकान' },
        { en: 'Sweet Shop (Mithai Shop)', hi: 'मिठाई की दुकान' },
        { en: 'Bakery', hi: 'बेकरी' },
        { en: 'Fast Food Shop', hi: 'फास्ट फूड दुकान' },
        { en: 'Others', hi: 'अन्य' },
      ],
    },

    {
      parent: { en: 'Household & Hardware', hi: 'घरेलू और हार्डवेयर' },
      children: [
        { en: 'Hardware Store', hi: 'हार्डवेयर दुकान' },
        { en: 'Paint Shop', hi: 'पेंट की दुकान' },
        { en: 'Electrical Shop', hi: 'इलेक्ट्रिकल दुकान' },
        { en: 'Plumbing Shop', hi: 'प्लंबिंग दुकान' },
        { en: 'Furniture Store', hi: 'फर्नीचर दुकान' },
        { en: 'Utensil Shop', hi: 'बर्तन की दुकान' },
        { en: 'Others', hi: 'अन्य' },
      ],
    },

    {
      parent: { en: 'Electronics & Mobile', hi: 'इलेक्ट्रॉनिक्स और मोबाइल' },
      children: [
        { en: 'Mobile Shop', hi: 'मोबाइल दुकान' },
        { en: 'Mobile Repair Shop', hi: 'मोबाइल रिपेयर दुकान' },
        { en: 'Electronics Store', hi: 'इलेक्ट्रॉनिक्स स्टोर' },
        { en: 'Computer & Laptop Shop', hi: 'कंप्यूटर और लैपटॉप दुकान' },
        { en: 'CCTV & Security Shop', hi: 'सीसीटीवी और सुरक्षा दुकान' },
        { en: 'Others', hi: 'अन्य' },
      ],
    },

    {
      parent: { en: 'Agriculture & Rural', hi: 'कृषि और ग्रामीण' },
      children: [
        { en: 'Seed & Fertilizer Shop', hi: 'बीज और उर्वरक दुकान' },
        { en: 'Pesticide Store', hi: 'कीटनाशक दुकान' },
        { en: 'Tractor Parts Shop', hi: 'ट्रैक्टर पार्ट्स दुकान' },
        { en: 'Animal Feed Store', hi: 'पशु चारा दुकान' },
        { en: 'Others', hi: 'अन्य' },
      ],
    },

    {
      parent: { en: 'Automobile', hi: 'ऑटोमोबाइल' },
      children: [
        { en: 'Auto Parts Shop', hi: 'ऑटो पार्ट्स दुकान' },
        { en: 'Bike Repair Shop', hi: 'बाइक रिपेयर दुकान' },
        { en: 'Car Accessories Shop', hi: 'कार एक्सेसरीज़ दुकान' },
        { en: 'Tyre Shop', hi: 'टायर दुकान' },
        { en: 'Others', hi: 'अन्य' },
      ],
    },

    {
      parent: { en: 'Service-Based Shops', hi: 'सेवा आधारित दुकानें' },
      children: [
        { en: 'Beauty Parlour', hi: 'ब्यूटी पार्लर' },
        { en: 'Barber Shop / Salon', hi: 'नाई की दुकान / सैलून' },
        { en: 'Cyber Café', hi: 'साइबर कैफे' },
        { en: 'Travel Agency', hi: 'ट्रैवल एजेंसी' },
        { en: 'Common Service Centre (CSC)', hi: 'कॉमन सर्विस सेंटर (सीएससी)' },
        { en: 'Printing Press', hi: 'प्रिंटिंग प्रेस' },
        { en: 'Others', hi: 'अन्य' },
      ],
    },

    {
      parent: { en: 'Others', hi: 'अन्य' },
    },
  ];

  const TARGET_CUSTOMERS_OPTIONS = [
    { en: 'Local consumers', hi: 'स्थानीय ग्राहक' },
    { en: 'Shopkeepers and market sellers', hi: 'दुकानदार और बाजार विक्रेता' },
    { en: 'Urban consumers', hi: 'शहरी ग्राहक' },
    { en: 'Online customers', hi: 'ऑनलाइन ग्राहक' },
    { en: 'Institutional buyers', hi: 'संस्थागत खरीदार' },
    { en: 'Others', hi: 'अन्य' },
  ];

  const SALES_AREA_OPTIONS = [
    { en: 'Village', hi: 'गांव' },
    { en: 'Block', hi: 'ब्लॉक' },
    { en: 'District', hi: 'जिला' },
    { en: 'State', hi: 'राज्य' },
    { en: 'Other State', hi: 'अन्य राज्य' },
    { en: 'Other Country', hi: 'अन्य देश' },
  ];

  const MARKETING_STRATEGY_OPTIONS = [
    {
      en: 'Word of Mouth / Door-to-Door Selling',
      hi: 'मौखिक प्रचार / घर-घर बिक्री',
    },
    {
      en: 'Selling in Local Markets (Haat/Bazaar)',
      hi: 'स्थानीय बाजार (हाट/बाजार) में बिक्री',
    },
    {
      en: 'Using SHG Networks for Promotion',
      hi: 'एसएचजी नेटवर्क के माध्यम से प्रचार',
    },
    {
      en: 'Display Boards or Posters Near Shop/Workplace',
      hi: 'दुकान/कार्यस्थल के पास बोर्ड या पोस्टर',
    },
    { en: 'Others', hi: 'अन्य' },
  ];

  const MARKETING_CHANNEL_OPTIONS = [
    { en: 'Retail', hi: 'खुदरा' },
    { en: 'Online', hi: 'ऑनलाइन' },
    { en: 'Exhibition', hi: 'प्रदर्शनी' },
    { en: 'ESARAS', hi: 'ई-सारस' },
    { en: 'Others', hi: 'अन्य' },
  ];

  const CHANNEL_SUB_OPTIONS = {
    Retail: [
      { en: 'Local Retail Shops', hi: 'स्थानीय खुदरा दुकानें' },
      { en: 'Kirana Stores', hi: 'किराना स्टोर' },
      // { en: 'Others', hi: 'अन्य' },
      { en: 'Retail_Others', hi: 'अन्य' },
    ],
    Online: [
      { en: 'Amazon', hi: 'अमेज़न' },
      { en: 'Flipkart', hi: 'फ्लिपकार्ट' },
      { en: 'ONDC', hi: 'ओएनडीसी' },
      { en: 'WhatsApp Marketing', hi: 'व्हाट्सएप मार्केटिंग' },
      // { en: 'Others', hi: 'अन्य' },
      { en: 'Online_Others', hi: 'अन्य' },
    ],
    Exhibition: [
      { en: 'District SARAS', hi: 'जिला सरस' },
      { en: 'State SARAS', hi: 'राज्य सरस' },
      { en: 'National SARAS', hi: 'राष्ट्रीय सरस' },
      { en: 'Existing Product Marketing', hi: 'मौजूदा उत्पाद विपणन' },
      // { en: 'Others', hi: 'अन्य' },
      { en: 'Exhibition_Others', hi: 'अन्य' },
    ],
    Others: [{ en: 'Others', hi: 'अन्य' }],
  };

  const MARKETING_CHALLENGE_OPTIONS = [
    {
      en: 'Do you face difficulty finding buyers outside your village?',
      hi: 'क्या आपको अपने गांव के बाहर खरीदार ढूंढने में कठिनाई होती है?',
    },
    {
      en: 'Is limited knowledge of digital tools a barrier for marketing?',
      hi: 'क्या डिजिटल टूल्स की सीमित जानकारी विपणन में बाधा है?',
    },
    { en: 'Others', hi: 'अन्य' },
  ];

  /* ---------------------------------- */
  /* HELPERS */
  /* ---------------------------------- */

  const splitMulti = val => (val ? val.split(',') : []);
  const selectSingle = (field, value) => {
    updateRow(index, { [field]: value });
  };

  const toggleMulti = (field, value) => {
    const arr = splitMulti(row[field]);
    if (arr.includes(value)) {
      updateRow(index, {
        [field]: arr.filter(v => v !== value).join(','),
      });
    } else {
      updateRow(index, {
        [field]: [...arr, value].join(','),
      });
    }
  };

  const renderMultiCheckbox = (field, optionObj) => {
    const value = optionObj.en; // store English
    // const label = language === 'hi' ? optionObj.hi : optionObj.en;
    const label =
      optionObj.en.includes('Others')
        ? (language === 'hi' ? 'अन्य' : 'Others')
        : (language === 'hi' ? optionObj.hi : optionObj.en);
    const selected = splitMulti(row[field]).includes(value);

    return (
      <TouchableOpacity
        key={value}
        style={styles.checkboxRow}
        onPress={() => toggleMulti(field, value)}
      >
        <Text style={styles.checkboxIcon}>{selected ? '☑' : '☐'}</Text>

        <Text style={[styles.checkboxLabel, selected && { fontWeight: '700' }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSingleCheckbox = (field, optionObj) => {
    const value = optionObj.en;
    const label = language === 'hi' ? optionObj.hi : optionObj.en;

    const selected = row[field] === value;

    return (
      <TouchableOpacity
        key={value}
        style={styles.checkboxRow}
        onPress={() => selectSingle(field, value)}
      >
        <Text style={styles.checkboxIcon}>{selected ? '☑' : '☐'}</Text>

        <Text style={[styles.checkboxLabel, selected && { fontWeight: '700' }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderYesNo = (value, setter) => (
    <View style={styles.yesNoRow}>
      {['Yes', 'No'].map(opt => {
        const active = value === opt;

        return (
          <TouchableOpacity
            key={opt}
            style={[styles.yesNoBtn, active && styles.yesNoBtnActive]}
            onPress={() => setter(opt)}
          >
            <Text style={[styles.yesNoText, active && styles.yesNoTextActive]}>
              {language === 'hi' ? (opt === 'Yes' ? 'हाँ' : 'नहीं') : opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  /* ---------------------------------- */
  /* MEDIA FUNCTIONS */
  /* ---------------------------------- */

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const pickMediaForRow = async typeKey => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 3,
    });

    if (!res.didCancel && res.assets?.length) {
      const existing = row.media?.[typeKey] || [];

      // Append but max 3
      const combined = [...existing, ...res.assets].slice(0, 3);

      updateRow(index, {
        media: {
          ...row.media,
          [typeKey]: combined,
        },
      });
    }
  };

  const openCameraForRow = async typeKey => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const res = await launchCamera({ mediaType: 'photo' });

    if (!res.didCancel && res.assets?.length) {
      const existing = row.media?.[typeKey] || [];

      const combined = [...existing, ...res.assets].slice(0, 3);

      updateRow(index, {
        media: {
          ...row.media,
          [typeKey]: combined,
        },
      });
    }
  };

  const renderMarketingChannelsWithSubOptions = () => {
    return (
      <View>
        {MARKETING_CHANNEL_OPTIONS.map(mainChan => {
          const isMainSelected = splitMulti(row.marketing_channels).includes(
            mainChan.en,
          );
          const subOptions = CHANNEL_SUB_OPTIONS[mainChan.en] || [];
          return (
            <View key={mainChan.en} style={styles.nestedSection}>
              {renderMultiCheckbox('marketing_channels', mainChan)}

              {/* SUB OPTIONS UI */}
              {isMainSelected && subOptions.length > 0 && (
                <View style={styles.subOptionsContainer}>
                  {/* {CHANNEL_SUB_OPTIONS[mainChan.en]?.map(subChan =>
                    renderMultiCheckbox('marketing_channels', subChan),
                  )} */}

                  {CHANNEL_SUB_OPTIONS[mainChan.en]?.map(subChan => {
                    const isSubSelected = splitMulti(row.marketing_channels).includes(subChan.en);

                    return (
                      <View key={subChan.en}>
                        {renderMultiCheckbox('marketing_channels', subChan)}

                        {/* ONLY show input for THIS specific Others */}
                        {subChan.en.includes('Others') && isSubSelected && (
                          <TextInput
                            style={[styles.input, { marginTop: 6 }]}
                            value={row[`market_linkage_${mainChan.en}`] || ''}
                            onChangeText={v =>
                              updateRow(index, {
                                [`market_linkage_${mainChan.en}`]: v,
                              })
                            }
                          />
                        )}
                        {/* {subChan.en === 'Others' && isSubSelected && (
                          <TextInput
                            style={[styles.input, { marginTop: 6 }]}
                            placeholder={language === 'hi' ? 'विवरण दें' : 'Specify details'}
                            value={row[`market_linkage_${mainChan.en}`] || ''}
                            onChangeText={v =>
                              updateRow(index, {
                                [`market_linkage_${mainChan.en}`]: v,
                              })
                            }
                          />
                        )} */}
                      </View>
                    );
                  })}
                  {/* Additional text field for linkages if 'Others' or specific sub-options selected */}
                  {/* {splitMulti(row.marketing_channels).includes('Others') && (
                    <TextInput
                      style={[styles.input, { marginTop: 6 }]}
                      placeholder={
                        language === 'hi' ? 'विवरण दें' : 'Specify details'
                      }
                      value={row.market_linkage}
                      onChangeText={v =>
                        updateRow(index, { market_linkage: v })
                      }
                    />
                  )} */}

                  {/* {splitMulti(row.marketing_channels).includes(subChan.en) &&
                    subChan.en === 'Others' && (
                      <TextInput
                        style={[styles.input, { marginTop: 6 }]}
                        placeholder={language === 'hi' ? 'विवरण दें' : 'Specify details'}
                        value={row[`market_linkage_${mainChan.en}`] || ''}
                        onChangeText={v =>
                          updateRow(index, {
                            [`market_linkage_${mainChan.en}`]: v,
                          })
                        }
                      />
                    )} */}
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };
  /* ---------------------------------- */
  /* RENDER */
  /* ---------------------------------- */

  return (
    <ScrollView style={styles.container}>
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
            ? '3) उत्पाद और सेवाएँ'
            : '3) Product and Services'}
        </Text>
        <LanguageToggle />
      </View>
      {/* MAIN QUESTION */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          {language === 'hi'
            ? 'क्या आपके पास दुकान आधारित उत्पाद हैं?'
            : 'Do you have shop based products?'}
        </Text>

        {renderYesNo(row.has_shop_product, val =>
          updateRow(index, { has_shop_product: val }),
        )}
      </View>

      {/* IF YES → SHOW SHOP FORM */}
      {row.has_shop_product === 'Yes' && (
        <View>
          {/* SHOP TYPE */}
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>
              {language === 'hi' ? 'दुकान का प्रकार' : 'Shop Type'}
            </Text>

            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={row.shop_type}
                onValueChange={v => updateRow(index, { shop_type: v })}
                style={{
                  width: '100%',
                  height: 50,            //  IMPORTANT (Android fix)
                  color: '#000',         //  ensure text visible
                }}
                dropdownIconColor="#000" //  icon visible
              >
                <Picker.Item label="Select" value="" />
                {SHOP_CATEGORIES.map(cat => (
                  <Picker.Item
                    key={cat.parent.en}
                    label={language === 'hi' ? cat.parent.hi : cat.parent.en}
                    value={cat.parent.en}
                  />
                ))}
              </Picker>
            </View>

            {/* SHOP SUBTYPE */}
            {row.shop_type && (
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>
                  {language === 'hi'
                    ? 'उत्पाद श्रेणी चुनें'
                    : 'Select Product Category'}
                </Text>

                {SHOP_CATEGORIES.find(
                  cat => cat.parent.en === row.shop_type,
                )?.children?.map(child =>
                  renderSingleCheckbox('shop_sub_category', child),
                )}

                {row.shop_sub_category === 'Others' && (
                  <TextInput
                    style={styles.input}
                    placeholder={
                      language === 'hi'
                        ? 'अन्य श्रेणी बताएं'
                        : 'Specify other category'
                    }
                    value={row.shop_sub_category_other}
                    onChangeText={v =>
                      updateRow(index, { shop_sub_category_other: v })
                    }
                  />
                )}
              </View>
            )}
          </View>

          {/* SOURCE OF INVENTORY */}
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>
              {language === 'hi' ? 'स्टॉक का स्रोत' : 'Source of Inventory'}
            </Text>

            <TextInput
              style={styles.input}
              value={row.inventory_source}
              onChangeText={v => updateRow(index, { inventory_source: v })}
              placeholder={
                language === 'hi'
                  ? 'उदाहरण: थोक बाजार'
                  : 'Example: Wholesale market'
              }
            />
          </View>

          {/* TARGET CUSTOMERS */}
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>
              {language === 'hi' ? 'लक्षित ग्राहक' : 'Target Customers'}
            </Text>

            {TARGET_CUSTOMERS_OPTIONS.map(opt =>
              renderMultiCheckbox('target_customers', opt),
            )}

            {splitMulti(row.target_customers).includes('Others') && (
              <TextInput
                style={styles.input}
                placeholder={
                  language === 'hi'
                    ? 'अन्य ग्राहक बताएं'
                    : 'Specify other customers'
                }
                value={row.target_customers_other}
                onChangeText={v =>
                  updateRow(index, { target_customers_other: v })
                }
              />
            )}
          </View>

          {/* SALES AREA */}
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>
              {language === 'hi' ? 'बिक्री क्षेत्र' : 'Sales Area'}
            </Text>

            {SALES_AREA_OPTIONS.map(opt =>
              renderMultiCheckbox('sales_area', opt),
            )}
          </View>

          {/* MARKETING STRATEGY */}
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>
              {language === 'hi' ? 'मार्केटिंग रणनीति' : 'Marketing Strategy'}
            </Text>

            {MARKETING_STRATEGY_OPTIONS.map(opt =>
              renderMultiCheckbox('marketing_strategy', opt),
            )}

            {splitMulti(row.marketing_strategy).includes('Others') && (
              <TextInput
                style={styles.input}
                placeholder={
                  language === 'hi'
                    ? 'अन्य रणनीति बताएं'
                    : 'Specify other strategy'
                }
                value={row.marketing_strategy_other}
                onChangeText={v =>
                  updateRow(index, { marketing_strategy_other: v })
                }
              />
            )}
          </View>

          {/*  MARKETING CHANNELS & LINKAGES */}
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>
              {language === 'hi'
                ? 'मार्केटिंग चैनल और लिंकिंग'
                : 'Marketing Channels & Linkages'}
            </Text>
            {renderMarketingChannelsWithSubOptions()}
          </View>

          {/* MARKETING CHALLENGES */}
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>
              {language === 'hi'
                ? 'मार्केटिंग चुनौतियाँ'
                : 'Marketing Challenges'}
            </Text>
            {MARKETING_CHALLENGE_OPTIONS.map(opt =>
              renderMultiCheckbox('marketing_challenges', opt),
            )}

            {splitMulti(row.marketing_challenges).includes('Others') && (
              <TextInput
                style={[styles.input, { marginTop: 6 }]}
                placeholder={
                  language === 'hi'
                    ? 'अन्य चुनौतियाँ बताएं'
                    : 'Specify other challenges'
                }
                value={row.marketing_challenges}
                onChangeText={v =>
                  updateRow(index, { marketing_challenges: v })
                }
              />
            )}
          </View>
          {/* DIGITAL PAYMENT */}
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>
              {language === 'hi'
                ? 'डिजिटल भुगतान स्वीकार करते हैं?'
                : 'Accept Digital Payment'}
            </Text>

            {renderYesNo(row.accept_digital_payment, val =>
              updateRow(index, {
                accept_digital_payment: val,
              }),
            )}
          </View>

          {/* MONTHLY SALES */}
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>
              {language === 'hi'
                ? 'औसत मासिक बिक्री (रु)'
                : 'Average Monthly Sales (INR)'}
            </Text>

            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={row.avg_monthly_sales}
              onChangeText={v => {
                const numericValue = v.replace(/[^0-9]/g, '');

                const annual = numericValue
                  ? String(Number(numericValue) * 12)
                  : '';

                updateRow(index, {
                  avg_monthly_sales: numericValue,
                  annual_sale: annual, // ✅ auto calculated
                });
              }}
            />
          </View>

          {/* ANNUAL SALE */}
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>
              {language === 'hi' ? 'वार्षिक बिक्री' : 'Annual Sale'}
            </Text>

            <Text style={styles.helpText}>
              {language === 'hi'
                ? 'यह स्वचालित रूप से मासिक बिक्री × 12 के आधार पर गणना की जाती है।'
                : 'This is automatically calculated as Average Monthly Sales × 12.'}
            </Text>

            <View style={styles.estimatedContainer}>
              <Text style={styles.estimatedLabel}>
                {language === 'hi'
                  ? 'मासिक बिक्री × 12'
                  : 'Average Monthly Sales × 12'}
              </Text>

              <Text style={styles.estimatedValue}>
                ₹{' '}
                {row.annual_sale
                  ? Number(row.annual_sale).toLocaleString('en-IN')
                  : '0'}
              </Text>
            </View>
          </View>
          {/* SHOP PHOTO UPLOAD SECTION */}
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>
              {language === 'hi'
                ? 'दुकान की फ़ोटो अपलोड करें'
                : 'Upload Shop Photos'}
            </Text>

            {['shop_front', 'shop_inside'].map(typeKey => (
              <View key={typeKey} style={styles.mediaBlock}>
                <Text style={styles.mediaLabel}>
                  {typeKey === 'shop_front'
                    ? language === 'hi'
                      ? 'दुकान का सामने का भाग (1-3)'
                      : 'Shop Front (1-3)'
                    : language === 'hi'
                      ? 'दुकान का अंदरूनी भाग (1-3)'
                      : 'Shop Inside (1-3)'}
                </Text>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={styles.mediaBtn}
                    onPress={() => pickMediaForRow(typeKey)}
                  >
                    <Text style={styles.mediaBtnText}>
                      {language === 'hi' ? 'अपलोड करें' : 'Upload'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.mediaBtn}
                    onPress={() => openCameraForRow(typeKey)}
                  >
                    <Text style={styles.mediaBtnText}>
                      {language === 'hi' ? 'कैमरा' : 'Camera'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {row.media?.[typeKey]?.length > 0 && (
                  <View style={styles.previewContainer}>
                    {row.media[typeKey].map((file, i) => (
                      <View key={i} style={styles.imageWrapper}>
                        <Image
                          source={{ uri: file.uri }}
                          style={styles.previewImage}
                        />

                        <TouchableOpacity
                          style={styles.removeBtn}
                          onPress={() => {
                            const updated = row.media[typeKey].filter(
                              (_, idx) => idx !== i,
                            );

                            updateRow(index, {
                              media: {
                                ...row.media,
                                [typeKey]: updated,
                              },
                            });
                          }}
                        >
                          <Text style={styles.removeText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* IF NO → OPEN PRODUCT SERVICES SECTION */}
      {row.has_shop_product === 'No' && (
        <ExistingEnterpriseProductServicesSection
          existingForm={row}
          setExistingForm={patch => updateRow(index, patch)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: { marginBottom: 24 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#222',
  },

  helpText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },

  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    backgroundColor: '#fafafa',
  },

  fieldBlock: { marginBottom: 12 },

  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
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

  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },

  /* YES NO BUTTONS */

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

  /* CHECKBOX */

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
  },

  checkboxIcon: {
    width: 20,
    fontSize: 16,
  },

  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: '#444',
  },

  estimatedContainer: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },

  estimatedLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#28a745',
    marginBottom: 4,
  },

  estimatedValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e7e34',
  },
  mediaBlock: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },

  mediaLabel: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },

  mediaBtn: {
    backgroundColor: '#EE6969',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  mediaBtnText: {
    color: '#fff',
    fontSize: 13,
  },

  mediaInfo: {
    marginTop: 6,
    fontSize: 12,
    color: '#555',
  },
  previewContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },

  imageWrapper: {
    position: 'relative',
  },

  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },

  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EE6969',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },

  removeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  subOptionsContainer: {
    marginLeft: 25,
    marginTop: 4,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#EE6969',
  },
  nestedSection: { marginBottom: 10 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkboxIcon: { fontSize: 18, marginRight: 8 },
  checkboxLabel: { fontSize: 14, color: '#444' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#fff',
  },
});


