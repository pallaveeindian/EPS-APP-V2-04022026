  // // src/screens/record/EnterpriseForm.jsx
  // import React, { useEffect, useState } from 'react';
  // import {
  //   ScrollView,
  //   View,
  //   Text,
  //   TextInput,
  //   Button,
  //   Alert,
  //   TouchableOpacity,
  //   ActivityIndicator,
  //   Linking,
  // } from 'react-native';
  // import gsApi from '../../api/gsApi';
  // import BackButton from '../../components/BackButton';
  // import { getUser } from '../../utils/auth';
  // import { pickImageFromLibrary, takePhoto, uploadAssetsToDrive } from '../../utils/media';

  // const Section = ({ title, children, openByDefault = false }) => {
  //   const [open, setOpen] = useState(openByDefault);
  //   return (0
  //     <View style={{ marginBottom: 12, borderWidth: 1, borderColor: '#e6e6e6', borderRadius: 6 }}>
  //       <TouchableOpacity onPress={() => setOpen((o) => !o)} style={{ padding: 10, backgroundColor: '#fafafa' }}>
  //         <Text style={{ fontWeight: 'bold' }}>{title} {open ? '▾' : '▸'}</Text>
  //       </TouchableOpacity>
  //       {open && <View style={{ padding: 10 }}>{children}</View>}
  //     </View>
  //   );
  // };

  // export default function EnterpriseForm({ navigation, route }) {
  //   const { beneficiary } = route.params || {};
  //   const [record, setRecord] = useState(null);
  //   const [user, setUser] = useState(null);
  //   const [loading, setLoading] = useState(false);

  //   const initialForm = {
  //     enterprise_name: '', enterprise_type: '', ownership_type: '', year_of_establishment: '',
  //     raw_material: '', machinery_equipment: '', workplace_type: '', electricity_available: '', water_available: '',
  //     transportation_facility: '', initial_investment: '', source_of_investment: '', working_capital_monthly: '',
  //     annual_turnover: '', profit_percentage: '', loan_details: '', main_product_service: '', product_features: '',
  //     production_capacity: '', packaging_branding_status: '', certification_registration: '', target_customers: '',
  //     marketing_channels: '', monthly_sales: '', marketing_strategy: '', marketing_challenges: '', training_received: '',
  //     skills_acquired: '', future_training_requirements: '', institutional_support: '', financial_coordination: '',
  //     market_linkage: '', mentorship_support: '', expansion_plan: '', required_support: '',
  //     photo_enterprise: '', photo_entrepreneur: '', photo_product: '', certificate_docs: ''
  //   };
  //   const [form, setForm] = useState(initialForm);

  //   useEffect(() => {
  //     (async () => {
  //       const u = await getUser();
  //       setUser(u || null);
  //       setLoading(true);
  //       try {
  //         // try server-side read using read(table, filterField, filterValue) which returns array
  //         const rows = await gsApi.read('BeneficiaryEnterprise', 'beneficiary_id', beneficiary.id);
  //         const found = Array.isArray(rows) && rows.length ? rows[0] : null;
  //         if (found) {
  //           setRecord(found);
  //           const mapped = {};
  //           Object.keys(initialForm).forEach(k => mapped[k] = found[k] !== undefined && found[k] !== null ? String(found[k]) : '');
  //           setForm(mapped);
  //         } else {
  //           setForm(initialForm);
  //         }
  //       } catch (err) {
  //         console.warn('EnterpriseForm load error', err);
  //         Alert.alert('Error', 'Failed to load existing enterprise record. ' + String(err));
  //         setForm(initialForm);
  //       } finally {
  //         setLoading(false);
  //       }
  //     })();
  //   }, []);

  //   const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  //   const validate = () => {
  //     if (!form.enterprise_name || form.enterprise_name.trim() === '') { Alert.alert('Validation', 'Enterprise name required'); return false; }
  //     return true;
  //   };

  //   const buildPayload = () => {
  //     const base = Object.assign({}, form);
  //     base.beneficiary_id = beneficiary.id;
  //     if (record && record.id) base.id = record.id;
  //     else base.id = base.id || ('be_' + Date.now());
  //     if (user && user.id) base.recorded_by_user_id = user.id;
  //     const t = new Date().toISOString();
  //     base.updated_at = t;
  //     if (!record) base.created_at = t;
  //     Object.keys(base).forEach(k => { if (base[k] === undefined || base[k] === null) base[k] = ''; });
  //     return base;
  //   };

  //   const handleSubmit = async () => {
  //     if (!validate()) return;
  //     setLoading(true);
  //     try {
  //       const payload = buildPayload();
  //       const res = await gsApi.createOrUpdateEnterprise(payload);
  //       if (res && (res.success === true || res.record || res.saved)) {
  //         Alert.alert('Success', record ? 'Updated successfully' : 'Recorded successfully!');
  //         navigation.goBack();
  //       } else {
  //         Alert.alert('Error', 'Save failed: ' + JSON.stringify(res || 'no response'));
  //       }
  //     } catch (err) {
  //       console.warn('handleSubmit error', err);
  //       Alert.alert('Error', String(err));
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   const handleDelete = async () => {
  //     if (!record || !record.id) return Alert.alert('No record to delete');
  //     Alert.alert('Confirm', 'Delete this record?', [
  //       { text: 'Cancel', style: 'cancel' },
  //       { text: 'Delete', style: 'destructive', onPress: async () => {
  //         setLoading(true);
  //         try {
  //           const res = await gsApi.delete('BeneficiaryEnterprise', record.id);
  //           if (res && res.success) {
  //             Alert.alert('Deleted');
  //             navigation.goBack();
  //           } else Alert.alert('Delete failed', JSON.stringify(res || 'delete failed'));
  //         } catch (err) { Alert.alert('Error', String(err)); } finally { setLoading(false); }
  //       }}
  //     ]);
  //   };

  //   // helper for image uploading
  //   const doUploadAsset = async (fieldKey, asset) => {
  //     try {
  //       if (!asset || !asset.uri) throw new Error('No image asset');
  //       const assets = [{ uri: asset.uri, fileName: asset.fileName || `img_${Date.now()}.jpg`, type: asset.type }];
  //       const uploadRes = await uploadAssetsToDrive(assets, undefined);
  //       if (!uploadRes || !uploadRes.results) throw new Error('Upload failed');
  //       const ok = uploadRes.results.find(r => r.success);
  //       if (!ok) throw new Error('Upload failed: ' + JSON.stringify(uploadRes.results));
  //       setField(fieldKey, ok.url);
  //       Alert.alert('Uploaded', 'File uploaded to Drive');
  //     } catch (err) {
  //       Alert.alert('Upload error', String(err));
  //     }
  //   };

  //   const handlePickAndUpload = async (fieldKey) => {
  //     try {
  //       const asset = await pickImageFromLibrary();
  //       if (!asset) return;
  //       await doUploadAsset(fieldKey, asset);
  //     } catch (err) { Alert.alert('Pick error', String(err)); }
  //   };

  //   const handleTakePhotoAndUpload = async (fieldKey) => {
  //     try {
  //       const asset = await takePhoto();
  //       if (!asset) return;
  //       await doUploadAsset(fieldKey, asset);
  //     } catch (err) { Alert.alert('Camera error', String(err)); }
  //   };

  //   const openUrl = async (url) => {
  //     if (!url) return Alert.alert('No URL');
  //     try {
  //       const supported = await Linking.canOpenURL(url);
  //       if (supported) Linking.openURL(url);
  //       else Alert.alert('Cannot open URL');
  //     } catch (err) { Alert.alert('Error', String(err)); }
  //   };

  //   return (
  //     <ScrollView contentContainerStyle={{ padding: 12 }}>
  //       <BackButton />
  //       <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>{beneficiary?.name || 'Beneficiary'}</Text>
  //       {loading && <ActivityIndicator size="large" style={{ marginBottom: 12 }} />}

  //       {/* General */}
  //       <Section title="General" openByDefault>
  //         <Text>Enterprise Name</Text>
  //         <TextInput value={form.enterprise_name} onChangeText={v => setField('enterprise_name', v)} style={{ borderWidth:1, padding:8, marginBottom:8, }} />
  //         <Text>Enterprise Type</Text>
  //         <TextInput value={form.enterprise_type} onChangeText={v => setField('enterprise_type', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
  //         <Text>Ownership Type</Text>
  //         <TextInput value={form.ownership_type} onChangeText={v => setField('ownership_type', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
  //         <Text>Year of Establishment</Text>
  //         <TextInput value={form.year_of_establishment} onChangeText={v => setField('year_of_establishment', v)} keyboardType="numeric" style={{ borderWidth:1, padding:8, marginBottom:8 }} />
  //       </Section>

  //       {/* Production & Capacity */}
  //       <Section title="Production & Capacity">
  //         <Text>Main Product / Service</Text>
  //         <TextInput value={form.main_product_service} onChangeText={v => setField('main_product_service', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
  //         <Text>Raw Material</Text>
  //         <TextInput value={form.raw_material} onChangeText={v => setField('raw_material', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
  //         <Text>Machinery / Equipment</Text>
  //         <TextInput value={form.machinery_equipment} onChangeText={v => setField('machinery_equipment', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
  //         <Text>Production Capacity</Text>
  //         <TextInput value={form.production_capacity} onChangeText={v => setField('production_capacity', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
  //         <Text>Packaging / Branding Status</Text>
  //         <TextInput value={form.packaging_branding_status} onChangeText={v => setField('packaging_branding_status', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
  //         <Text>Certification / Registration</Text>
  //         <TextInput value={form.certification_registration} onChangeText={v => setField('certification_registration', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
  //         <Text>Workplace Type</Text>
  //         <TextInput value={form.workplace_type} onChangeText={v => setField('workplace_type', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
  //         <Text>Electricity Available</Text>
  //         <TextInput value={form.electricity_available} onChangeText={v => setField('electricity_available', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
  //         <Text>Water Available</Text>
  //         <TextInput value={form.water_available} onChangeText={v => setField('water_available', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
  //         <Text>Transportation Facility</Text>
  //         <TextInput value={form.transportation_facility} onChangeText={v => setField('transportation_facility', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
  //       </Section>

  //       {/* Finance */}
  //       <Section title="Finance">
  //         <Text>Initial Investment</Text>
  //         <TextInput value={form.initial_investment} onChangeText={v => setField('initial_investment', v)} keyboardType="numeric" style={{ borderWidth:1, padding:8, marginBottom:8 }} />
  //         <Text>Source of Investment</Text>
  //         <TextInput value={form.source_of_investment} onChangeText={v => setField('source_of_investment', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
  //         <Text>Working Capital (Monthly)</Text>
  //         <TextInput value={form.working_capital_monthly} onChangeText={v => setField('working_capital_monthly', v)} keyboardType="numeric" style={{ borderWidth:1, padding:8, marginBottom:8 }} />
  //         <Text>Annual Turnover</Text>
  //         <TextInput value={form.annual_turnover} onChangeText={v => setField('annual_turnover', v)} keyboardType="numeric" style={{ borderWidth:1, padding:8, marginBottom:8 }} />
  //         <Text>Profit Percentage</Text>
  //         <TextInput value={form.profit_percentage} onChangeText={v => setField('profit_percentage', v)} keyboardType="numeric" style={{ borderWidth:1, padding:8, marginBottom:8 }} />
  //         <Text>Loan Details</Text>
  //         <TextInput value={form.loan_details} onChangeText={v => setField('loan_details', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
  //       </Section>

  //       {/* Marketing & Sales */}
  //       <Section title="Marketing & Sales">
  //         <Text>Target Customers</Text>
  //         <TextInput value={form.target_customers} onChangeText={v => setField('target_customers', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
  //         <Text>Marketing Channels</Text>
  //         <TextInput value={form.marketing_channels} onChangeText={v => setField('marketing_channels', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} />
  //         <Text>Monthly Sales</Text>
  //         <TextInput value={form.monthly_sales} onChangeText={v => setField('monthly_sales', v)} keyboardType="numeric" style={{ borderWidth:1, padding:8, marginBottom:8 }} />
  //         <Text>Marketing Strategy</Text>
  //         <TextInput value={form.marketing_strategy} onChangeText={v => setField('marketing_strategy', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
  //         <Text>Marketing Challenges</Text>
  //         <TextInput value={form.marketing_challenges} onChangeText={v => setField('marketing_challenges', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
  //       </Section>

  //       {/* Training & Support */}
  //       <Section title="Training & Support">
  //         <Text>Training Received</Text>
  //         <TextInput value={form.training_received} onChangeText={v => setField('training_received', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
  //         <Text>Skills Acquired</Text>
  //         <TextInput value={form.skills_acquired} onChangeText={v => setField('skills_acquired', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
  //         <Text>Future Training Requirements</Text>
  //         <TextInput value={form.future_training_requirements} onChangeText={v => setField('future_training_requirements', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
  //         <Text>Institutional Support</Text>
  //         <TextInput value={form.institutional_support} onChangeText={v => setField('institutional_support', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
  //         <Text>Financial Coordination</Text>
  //         <TextInput value={form.financial_coordination} onChangeText={v => setField('financial_coordination', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
  //         <Text>Market Linkage</Text>
  //         <TextInput value={form.market_linkage} onChangeText={v => setField('market_linkage', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
  //         <Text>Mentorship Support</Text>
  //         <TextInput value={form.mentorship_support} onChangeText={v => setField('mentorship_support', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
  //         <Text>Expansion Plan</Text>
  //         <TextInput value={form.expansion_plan} onChangeText={v => setField('expansion_plan', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
  //         <Text>Required Support</Text>
  //         <TextInput value={form.required_support} onChangeText={v => setField('required_support', v)} style={{ borderWidth:1, padding:8, marginBottom:8 }} multiline />
  //       </Section>

  //       {/* Docs & Photos */}
  //       <Section title="Documents & Photos">
  //         <Text>Photo - Enterprise</Text>
  //         <View style={{ flexDirection:'row', marginBottom:8 }}>
  //           <Button title="Pick Photo" onPress={() => handlePickAndUpload('photo_enterprise')} />
  //           <View style={{ width:8 }} />
  //           <Button title="Take Photo" onPress={() => handleTakePhotoAndUpload('photo_enterprise')} />
  //         </View>
  //         <TouchableOpacity onPress={() => form.photo_enterprise && openUrl(form.photo_enterprise)}>
  //           <Text numberOfLines={1} style={{ color:'#444', marginBottom:8 }}>{form.photo_enterprise || '(no file)'}</Text>
  //         </TouchableOpacity>

  //         <Text>Photo - Entrepreneur</Text>
  //         <View style={{ flexDirection:'row', marginBottom:8 }}>
  //           <Button title="Pick Photo" onPress={() => handlePickAndUpload('photo_entrepreneur')} />
  //           <View style={{ width:8 }} />
  //           <Button title="Take Photo" onPress={() => handleTakePhotoAndUpload('photo_entrepreneur')} />
  //         </View>
  //         <TouchableOpacity onPress={() => form.photo_entrepreneur && openUrl(form.photo_entrepreneur)}>
  //           <Text numberOfLines={1} style={{ color:'#444', marginBottom:8 }}>{form.photo_entrepreneur || '(no file)'}</Text>
  //         </TouchableOpacity>

  //         <Text>Photo - Product</Text>
  //         <View style={{ flexDirection:'row', marginBottom:8 }}>
  //           <Button title="Pick Photo" onPress={() => handlePickAndUpload('photo_product')} />
  //           <View style={{ width:8 }} />
  //           <Button title="Take Photo" onPress={() => handleTakePhotoAndUpload('photo_product')} />
  //         </View>
  //         <TouchableOpacity onPress={() => form.photo_product && openUrl(form.photo_product)}>
  //           <Text numberOfLines={1} style={{ color:'#444', marginBottom:8 }}>{form.photo_product || '(no file)'}</Text>
  //         </TouchableOpacity>

  //         <Text>Certificate Docs (comma-separated URLs)</Text>
  //         <TextInput value={form.certificate_docs} onChangeText={v => setField('certificate_docs', v)} style={{ borderWidth:1, padding:8, marginBottom:8, outlineColor:"#EE6969" }} multiline />
  //       </Section>

  //       <View style={{ marginBottom: 12 }}>
  //         <Button title={record ? 'Update Record' : 'Submit Record'} onPress={handleSubmit} disabled={loading}  />
  //       </View>
  //       {record && <View style={{ marginBottom: 12 }}><Button title="Delete Record" color="red" onPress={handleDelete} disabled={loading} /></View>}

  //       <View style={{ height: 24 }} />
  //     </ScrollView>
  //   );
  // }




  // import React, { useEffect, useState } from 'react';
  // import {
  //   ScrollView,
  //   View,
  //   Text,
  //   TextInput,
  //   Alert,
  //   TouchableOpacity,
  //   ActivityIndicator,
  //   Linking,
  //   StyleSheet,
  //   Image,
  // } from 'react-native';
  // import gsApi from '../../api/gsApi';
  // import BackButton from '../../components/BackButton';
  // import { getUser } from '../../utils/auth';
  // import { pickImageFromLibrary, takePhoto, uploadAssetsToDrive } from '../../utils/media';
  // import BurgerMenu from '../BurgerMenu';
  // import HamburgerIcon from '../../../assets/hamburger.png';

  // const Section = ({ title, children, openByDefault = false }) => {
  //   const [open, setOpen] = useState(openByDefault);
  //   return (
  //     <View style={styles.sectionCard}>
  //       <TouchableOpacity onPress={() => setOpen((o) => !o)} style={styles.sectionHeader}>
  //         <Text style={styles.sectionTitle}>{title} {open ? '▾' : '▸'}</Text>
  //       </TouchableOpacity>
  //       {open && <View style={{ padding: 10 }}>{children}</View>}
  //     </View>
  //   );
  // };

  // export default function EnterpriseForm({ navigation, route }) {
  //   const { beneficiary } = route.params || {};
  //   const [record, setRecord] = useState(null);
  //   const [user, setUser] = useState(null);
  //   const [loading, setLoading] = useState(false);
  //   const [menuOpen, setMenuOpen] = useState(false); // Burger menu state

  //   const initialForm = {
  //     enterprise_name: '', enterprise_type: '', ownership_type: '', year_of_establishment: '',
  //     raw_material: '', machinery_equipment: '', workplace_type: '', electricity_available: '', water_available: '',
  //     transportation_facility: '', initial_investment: '', source_of_investment: '', working_capital_monthly: '',
  //     annual_turnover: '', profit_percentage: '', loan_details: '', main_product_service: '', product_features: '',
  //     production_capacity: '', packaging_branding_status: '', certification_registration: '', target_customers: '',
  //     marketing_channels: '', monthly_sales: '', marketing_strategy: '', marketing_challenges: '', training_received: '',
  //     skills_acquired: '', future_training_requirements: '', institutional_support: '', financial_coordination: '',
  //     market_linkage: '', mentorship_support: '', expansion_plan: '', required_support: '',
  //     photo_enterprise: '', photo_entrepreneur: '', photo_product: '', certificate_docs: ''
  //   };
  //   const [form, setForm] = useState(initialForm);

  //   useEffect(() => {
  //     (async () => {
  //       const u = await getUser();
  //       setUser(u || null);
  //       setLoading(true);
  //       try {
  //         const rows = await gsApi.read('BeneficiaryEnterprise', 'beneficiary_id', beneficiary.id);
  //         const found = Array.isArray(rows) && rows.length ? rows[0] : null;
  //         if (found) {
  //           setRecord(found);
  //           const mapped = {};
  //           Object.keys(initialForm).forEach(k => mapped[k] = found[k] !== undefined && found[k] !== null ? String(found[k]) : '');
  //           setForm(mapped);
  //         } else {
  //           setForm(initialForm);
  //         }
  //       } catch (err) {
  //         console.warn('EnterpriseForm load error', err);
  //         Alert.alert('Error', 'Failed to load existing enterprise record. ' + String(err));
  //         setForm(initialForm);
  //       } finally {
  //         setLoading(false);
  //       }
  //     })();
  //   }, []);

  //   const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  //   const validate = () => {
  //     if (!form.enterprise_name || form.enterprise_name.trim() === '') { Alert.alert('Validation', 'Enterprise name required'); return false; }
  //     return true;
  //   };

  //   const buildPayload = () => {
  //     const base = Object.assign({}, form);
  //     base.beneficiary_id = beneficiary.id;
  //     if (record && record.id) base.id = record.id;
  //     else base.id = base.id || ('be_' + Date.now());
  //     if (user && user.id) base.recorded_by_user_id = user.id;
  //     const t = new Date().toISOString();
  //     base.updated_at = t;
  //     if (!record) base.created_at = t;
  //     Object.keys(base).forEach(k => { if (base[k] === undefined || base[k] === null) base[k] = ''; });
  //     return base;
  //   };

  //   const handleSubmit = async () => {
  //     if (!validate()) return;
  //     setLoading(true);
  //     try {
  //       const payload = buildPayload();
  //       const res = await gsApi.createOrUpdateEnterprise(payload);
  //       if (res && (res.success === true || res.record || res.saved)) {
  //         Alert.alert('Success', record ? 'Updated successfully' : 'Recorded successfully!');
  //         navigation.goBack();
  //       } else {
  //         Alert.alert('Error', 'Save failed: ' + JSON.stringify(res || 'no response'));
  //       }
  //     } catch (err) {
  //       console.warn('handleSubmit error', err);
  //       Alert.alert('Error', String(err));
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   const handleDelete = async () => {
  //     if (!record || !record.id) return Alert.alert('No record to delete');
  //     Alert.alert('Confirm', 'Delete this record?', [
  //       { text: 'Cancel', style: 'cancel' },
  //       { text: 'Delete', style: 'destructive', onPress: async () => {
  //         setLoading(true);
  //         try {
  //           const res = await gsApi.delete('BeneficiaryEnterprise', record.id);
  //           if (res && res.success) {
  //             Alert.alert('Deleted');
  //             navigation.goBack();
  //           } else Alert.alert('Delete failed', JSON.stringify(res || 'delete failed'));
  //         } catch (err) { Alert.alert('Error', String(err)); } finally { setLoading(false); }
  //       }}
  //     ]);
  //   };

  //   const doUploadAsset = async (fieldKey, asset) => {
  //     try {
  //       if (!asset || !asset.uri) throw new Error('No image asset');
  //       const assets = [{ uri: asset.uri, fileName: asset.fileName || `img_${Date.now()}.jpg`, type: asset.type }];
  //       const uploadRes = await uploadAssetsToDrive(assets, undefined);
  //       if (!uploadRes || !uploadRes.results) throw new Error('Upload failed');
  //       const ok = uploadRes.results.find(r => r.success);
  //       if (!ok) throw new Error('Upload failed: ' + JSON.stringify(uploadRes.results));
  //       setField(fieldKey, ok.url);
  //       Alert.alert('Uploaded', 'File uploaded to Drive');
  //     } catch (err) {
  //       Alert.alert('Upload error', String(err));
  //     }
  //   };

  //   const handlePickAndUpload = async (fieldKey) => {
  //     try {
  //       const asset = await pickImageFromLibrary();
  //       if (!asset) return;
  //       await doUploadAsset(fieldKey, asset);
  //     } catch (err) { Alert.alert('Pick error', String(err)); }
  //   };

  //   const handleTakePhotoAndUpload = async (fieldKey) => {
  //     try {
  //       const asset = await takePhoto();
  //       if (!asset) return;
  //       await doUploadAsset(fieldKey, asset);
  //     } catch (err) { Alert.alert('Camera error', String(err)); }
  //   };

  //   const openUrl = async (url) => {
  //     if (!url) return Alert.alert('No URL');
  //     try {
  //       const supported = await Linking.canOpenURL(url);
  //       if (supported) Linking.openURL(url);
  //       else Alert.alert('Cannot open URL');
  //     } catch (err) { Alert.alert('Error', String(err)); }
  //   };

  //   const inputStyle = { borderWidth:1, borderColor:'#EE6969', padding:8, marginBottom:8, borderRadius:6 };

  //   const menuItems = [
  //     { label: 'Record New Beneficiary Detail', onPress: () => navigation.popToTop() },
  //     { label: 'View Recorded Beneficiary', onPress: () => navigation.popToTop() },
  //     {
  //       label: 'Logout',
  //       color: '#EE6969',
  //       onPress: async () => {
  //         const { clearUser } = await import('../../utils/auth');
  //         await clearUser();
  //         navigation.replace('Login');
  //       },
  //     },
  //   ];

  //   return (
  //     <ScrollView contentContainerStyle={{ padding: 12 }}>
  //       {/* Header with Burger Menu */}
  //       {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 50 }}>
  //         <BackButton />
  //         <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>{beneficiary?.name || 'Beneficiary'}</Text>
  //         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            
  //           <TouchableOpacity onPress={() => setMenuOpen(true)} style={{ marginLeft: 12 }}>
  //             <Image source={HamburgerIcon} style={{ width: 28, height: 28, tintColor: '#333' }} resizeMode="contain" />
  //           </TouchableOpacity>
  //         </View>
  //       </View> */}

  //       {/* Header with Burger Menu */}
  // <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 50 }}>
  //   {/* Left: BackButton */}
  //   <View style={{ flex: 1 }}>
  //     <BackButton />
  //   </View>

  //   {/* Middle: Beneficiary Name */}
  //   <View style={{ flex: 2, alignItems: 'center' }}>
  //     <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{beneficiary?.name || 'Beneficiary'}</Text>
  //   </View>

  //   {/* Right: Burger Icon */}
  //   <View style={{ flex: 1, alignItems: 'flex-end' }}>
  //     <TouchableOpacity onPress={() => setMenuOpen(true)}>
  //       <Image
  //         source={HamburgerIcon}
  //         style={{ width: 28, height: 28, tintColor: '#333' }}
  //         resizeMode="contain"
  //       />
  //     </TouchableOpacity>
  //   </View>
  // </View>


  //       {loading && <ActivityIndicator size="large" style={{ marginBottom: 12 }} color="#EE6969" />}

  //       {/* General */}
  //       <Section title="General" openByDefault>
  //         <Text>Enterprise Name</Text>
  //         <TextInput value={form.enterprise_name} onChangeText={v => setField('enterprise_name', v)} style={inputStyle} />
  //         <Text>Enterprise Type</Text>
  //         <TextInput value={form.enterprise_type} onChangeText={v => setField('enterprise_type', v)} style={inputStyle} />
  //         <Text>Ownership Type</Text>
  //         <TextInput value={form.ownership_type} onChangeText={v => setField('ownership_type', v)} style={inputStyle} />
  //         <Text>Year of Establishment</Text>
  //         <TextInput value={form.year_of_establishment} onChangeText={v => setField('year_of_establishment', v)} keyboardType="numeric" style={inputStyle} />
  //       </Section>

  //       {/* Production & Capacity */}
  //       <Section title="Production & Capacity">
  //         {['main_product_service','raw_material','machinery_equipment','production_capacity','packaging_branding_status','certification_registration','workplace_type','electricity_available','water_available','transportation_facility'].map(key => (
  //           <View key={key}>
  //             <Text>{key.replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
  //             <TextInput value={form[key]} onChangeText={v => setField(key, v)} style={inputStyle} multiline />
  //           </View>
  //         ))}
  //       </Section>

  //       {/* Finance */}
  //       <Section title="Finance">
  //         {['initial_investment','source_of_investment','working_capital_monthly','annual_turnover','profit_percentage','loan_details'].map(key => (
  //           <View key={key}>
  //             <Text>{key.replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
  //             <TextInput
  //               value={form[key]}
  //               onChangeText={v => setField(key, v)}
  //               style={inputStyle}
  //               multiline={['loan_details'].includes(key)}
  //               keyboardType={['initial_investment','working_capital_monthly','annual_turnover','profit_percentage'].includes(key) ? 'numeric' : 'default'}
  //             />
  //           </View>
  //         ))}
  //       </Section>

  //       {/* Marketing & Sales */}
  //       <Section title="Marketing & Sales">
  //         {['target_customers','marketing_channels','monthly_sales','marketing_strategy','marketing_challenges'].map(key => (
  //           <View key={key}>
  //             <Text>{key.replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
  //             <TextInput
  //               value={form[key]}
  //               onChangeText={v => setField(key, v)}
  //               style={inputStyle}
  //               multiline={['marketing_strategy','marketing_challenges'].includes(key)}
  //               keyboardType={key==='monthly_sales'?'numeric':'default'}
  //             />
  //           </View>
  //         ))}
  //       </Section>

  //       {/* Training & Support */}
  //       <Section title="Training & Support">
  //         {['training_received','skills_acquired','future_training_requirements','institutional_support','financial_coordination','market_linkage','mentorship_support','expansion_plan','required_support'].map(key => (
  //           <View key={key}>
  //             <Text>{key.replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
  //             <TextInput value={form[key]} onChangeText={v => setField(key, v)} style={inputStyle} multiline />
  //           </View>
  //         ))}
  //       </Section>

  //       {/* Docs & Photos */}
  //       <Section title="Documents & Photos">
  //         {['photo_enterprise','photo_entrepreneur','photo_product'].map(key => (
  //           <View key={key}>
  //             <Text>Photo - {key.split('_')[1].charAt(0).toUpperCase()+key.split('_')[1].slice(1)}</Text>
  //             <View style={{ flexDirection:'row', marginBottom:8 }}>
  //               <TouchableOpacity style={styles.redButton} onPress={() => handlePickAndUpload(key)}>
  //                 <Text style={styles.redButtonText}>Pick Photo</Text>
  //               </TouchableOpacity>
  //               <View style={{ width:8 }} />
  //               <TouchableOpacity style={styles.redButton} onPress={() => handleTakePhotoAndUpload(key)}>
  //                 <Text style={styles.redButtonText}>Take Photo</Text>
  //               </TouchableOpacity>
  //             </View>
  //             <TouchableOpacity onPress={() => form[key] && openUrl(form[key])}>
  //               <Text numberOfLines={1} style={{ color:'#444', marginBottom:8 }}>{form[key] || '(no file)'}</Text>
  //             </TouchableOpacity>
  //           </View>
  //         ))}
  //         <Text>Certificate Docs (comma-separated URLs)</Text>
  //         <TextInput value={form.certificate_docs} onChangeText={v => setField('certificate_docs', v)} style={{ ...inputStyle }} multiline />
  //       </Section>

  //       <TouchableOpacity style={styles.redButton} onPress={handleSubmit} disabled={loading}>
  //         <Text style={styles.redButtonText}>{record ? 'Update Record' : 'Submit Record'}</Text>
  //       </TouchableOpacity>

  //       {record && (
  //         <TouchableOpacity style={styles.redButton} onPress={handleDelete} disabled={loading}>
  //           <Text style={styles.redButtonText}>Delete Record</Text>
  //         </TouchableOpacity>
  //       )}

  //       <View style={{ height: 24 }} />

  //       {/* Burger Menu Modal */}
  //       <BurgerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} menuItems={menuItems} />
  //     </ScrollView>
  //   );
  // }

  // const styles = StyleSheet.create({
  //   sectionCard: {
  //     marginBottom: 12,
  //     borderWidth: 1,
  //     borderColor: '#EE6969',
  //     borderRadius: 12,
  //     overflow: 'hidden',
  //   },
  //   sectionHeader: {
  //     padding: 10,
  //     backgroundColor: '#fafafa',
  //   },
  //   sectionTitle: {
  //     fontWeight: 'bold',
  //     color: '#EE6969',
  //   },
  //   redButton: {
  //     backgroundColor: '#EE6969',
  //     paddingVertical: 10,
  //     paddingHorizontal: 15,
  //     borderRadius: 8,
  //     alignItems: 'center',
  //     marginTop: 12,
  //   },
  //   redButtonText: {
  //     color: '#fff',
  //     fontWeight: 'bold',
  //   },
  // });




// import React, { useEffect, useState, useContext } from 'react';
// import {
//   ScrollView,
//   View,
//   Text,
//   TextInput,
//   Alert,
//   TouchableOpacity,
//   ActivityIndicator,
//   Linking,
//   StyleSheet,
//   Image,
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import gsApi from '../../api/gsApi';
// import BackButton from '../../components/BackButton';
// import { getUser } from '../../utils/auth';
// import { pickImageFromLibrary, takePhoto, uploadAssetsToDrive } from '../../utils/media';
// import BurgerMenu from '../BurgerMenu';
// import HamburgerIcon from '../../../assets/hamburger.png';
// import LanguageToggle from '../../components/LanguageToggle';
// import { LanguageContext } from '../../components/LanguageContext';

// // --- Inline i18n utility ---
// const translations = {
//   en: {
//     general: "General",
//     production_capacity: "Production & Capacity",
//     finance: "Finance",
//     marketing_sales: "Marketing & Sales",
//     training_support: "Training & Support",
//     docs_photos: "Documents & Photos",
//     enterprise_name: "Enterprise Name",
//     enterprise_type: "Enterprise Type",
//     ownership_type: "Ownership Type",
//     year_of_establishment: "Year of Establishment",
//     main_product_service: "Main Product/Service",
//     raw_material: "Raw Material",
//     machinery_equipment: "Machinery/Equipment",
//     production_capacity_field: "Production Capacity",
//     packaging_branding_status: "Packaging/Branding Status",
//     certification_registration: "Certification/Registration",
//     workplace_type: "Workplace Type",
//     electricity_available: "Electricity Available",
//     water_available: "Water Available",
//     transportation_facility: "Transportation Facility",
//     initial_investment: "Initial Investment",
//     source_of_investment: "Source of Investment",
//     working_capital_monthly: "Working Capital (Monthly)",
//     annual_turnover: "Annual Turnover",
//     profit_percentage: "Profit Percentage",
//     loan_details: "Loan Details",
//     target_customers: "Target Customers",
//     marketing_channels: "Marketing Channels",
//     monthly_sales: "Monthly Sales",
//     marketing_strategy: "Marketing Strategy",
//     marketing_challenges: "Marketing Challenges",
//     training_received: "Training Received",
//     skills_acquired: "Skills Acquired",
//     future_training_requirements: "Future Training Requirements",
//     institutional_support: "Institutional Support",
//     financial_coordination: "Financial Coordination",
//     market_linkage: "Market Linkage",
//     mentorship_support: "Mentorship Support",
//     expansion_plan: "Expansion Plan",
//     required_support: "Required Support",
//     photo_enterprise: "Photo - Enterprise",
//     photo_entrepreneur: "Photo - Entrepreneur",
//     photo_product: "Photo - Product",
//     pick_photo: "Pick Photo",
//     take_photo: "Take Photo",
//     update_record: "Update Record",
//     submit_record: "Submit Record",
//     delete_record: "Delete Record",
//     certificate_docs: "Certificate Docs (comma-separated URLs)",
//     no_file: "(no file)",
//     option_production: "Production",
//     option_service: "Service",
//     option_trade: "Trade",
//     option_others: "Others - Specify",
//     option_individual: "Individual",
//     option_shg: "Self-Help Group",
//     option_partnership: "Partnership",
//     option_cooperative: "Cooperative",
//     option_fpo: "FPO",
//     option_home: "Home-based",
//     option_rented: "Rented",
//     option_own: "Own",
//     option_yes: "Yes",
//     option_no: "No",
//     option_retail: "Retail",
//     option_online: "Online",
//     option_exhibition: "Exhibition",
//     option_need_help: "Need Help?",
//     option_ccl: "CCL",
//     option_cif: "CIF",
//     option_livelihood: "Livelihood Fund",
//     option_cef: "CEF",
//     option_nrlm: "NRLM",
//     option_srlm: "SRLM",
//     option_ondc: "ONDC",
//     option_ecommerce: "E-commerce",
//     option_finance: "Finance",
//     option_training: "Training",
//     option_advertisement: "Advertisement",
//     option_equipments: "Equipments",
//     option_new_product: "New Product",
//     option_ecommerce_plan: "E-Commerce",
//     option_employment: "Employment",
//     loan_institution: "Loan Institution",
//     loan_amount: "Loan Amount",
//     loan_repayment_status: "Repayment Status",
//     transport_sample_note: "(If yes, can you send a product sample to Bijnor CLF?)"
//   },
//   hi: {
//     general: "सामान्य",
//     production_capacity: "उत्पादन और क्षमता",
//     finance: "वित्त",
//     marketing_sales: "विपणन और बिक्री",
//     training_support: "प्रशिक्षण और समर्थन",
//     docs_photos: "दस्तावेज़ और फ़ोटो",
//     enterprise_name: "उद्यम का नाम",
//     enterprise_type: "उद्यम का प्रकार",
//     ownership_type: "स्वामित्व प्रकार",
//     year_of_establishment: "स्थापना वर्ष",
//     main_product_service: "मुख्य उत्पाद/सेवा",
//     raw_material: "कच्चा माल",
//     machinery_equipment: "मशीनरी/उपकरण",
//     production_capacity_field: "उत्पादन क्षमता",
//     packaging_branding_status: "पैकेजिंग/ब्रांडिंग स्थिति",
//     certification_registration: "प्रमाणन/पंजीकरण",
//     workplace_type: "कार्यस्थल प्रकार",
//     electricity_available: "बिजली उपलब्धता",
//     water_available: "पानी उपलब्धता",
//     transportation_facility: "परिवहन सुविधा",
//     initial_investment: "प्रारंभिक निवेश",
//     source_of_investment: "निवेश का स्रोत",
//     working_capital_monthly: "कार्यशील पूंजी (मासिक)",
//     annual_turnover: "वार्षिक कारोबार",
//     profit_percentage: "लाभ प्रतिशत",
//     loan_details: "ऋण विवरण",
//     target_customers: "लक्ष्य ग्राहक",
//     marketing_channels: "विपणन चैनल",
//     monthly_sales: "मासिक बिक्री",
//     marketing_strategy: "विपणन रणनीति",
//     marketing_challenges: "विपणन चुनौतियाँ",
//     training_received: "प्राप्त प्रशिक्षण",
//     skills_acquired: "अर्जित कौशल",
//     future_training_requirements: "भविष्य की प्रशिक्षण आवश्यकताएँ",
//     institutional_support: "संस्थानिक समर्थन",
//     financial_coordination: "वित्तीय समन्वय",
//     market_linkage: "बाजार संपर्क",
//     mentorship_support: "मार्गदर्शन समर्थन",
//     expansion_plan: "विस्तार योजना",
//     required_support: "आवश्यक समर्थन",
//     photo_enterprise: "फ़ोटो - उद्यम",
//     photo_entrepreneur: "फ़ोटो - उद्यमी",
//     photo_product: "फ़ोटो - उत्पाद",
//     pick_photo: "फ़ोटो चुनें",
//     take_photo: "फ़ोटो लें",
//     update_record: "रिकॉर्ड अपडेट करें",
//     submit_record: "रिकॉर्ड सबमिट करें",
//     delete_record: "रिकॉर्ड हटाएँ",
//     certificate_docs: "प्रमाणपत्र (कॉमा सेपरेटेड लिंक)",
//     no_file: "(कोई फ़ाइल नहीं)",
//     option_production: "उत्पादन",
//     option_service: "सेवा",
//     option_trade: "व्यापार",
//     option_others: "अन्य - उल्लेख करें",
//     option_individual: "व्यक्ति",
//     option_shg: "स्व-सहायता समूह",
//     option_partnership: "साझेदारी",
//     option_cooperative: "सहकारी",
//     option_fpo: "FPO",
//     option_home: "घर पर आधारित",
//     option_rented: "किराये पर",
//     option_own: "स्वयं की",
//     option_yes: "हाँ",
//     option_no: "नहीं",
//     option_retail: "खुदरा",
//     option_online: "ऑनलाइन",
//     option_exhibition: "प्रदर्शनी",
//     option_need_help: "मदद चाहिए?",
//     option_ccl: "CCL",
//     option_cif: "CIF",
//     option_livelihood: "Livelihood Fund",
//     option_cef: "CEF",
//     option_nrlm: "NRLM",
//     option_srlm: "SRLM",
//     option_ondc: "ONDC",
//     option_ecommerce: "E-commerce",
//     option_finance: "वित्त",
//     option_training: "प्रशिक्षण",
//     option_advertisement: "विज्ञापन",
//     option_equipments: "उपकरण",
//     option_new_product: "नया उत्पाद",
//     option_ecommerce_plan: "ई-कॉमर्स",
//     option_employment: "रोज़गार",
//     loan_institution: "संस्था",
//     loan_amount: "राशि",
//     loan_repayment_status: "भुगतान स्थिति",
//     transport_sample_note: "(यदि हां, क्या आप बिझनोर CLF को उत्पाद नमूना भेज सकते हैं?)"
//   }
// };
// const t = (language, key) => (translations[language] && translations[language][key]) || key;

// const Section = ({ title, children, openByDefault = false }) => {
//   const [open, setOpen] = useState(openByDefault);
//   return (
//     <View style={styles.sectionCard}>
//       <TouchableOpacity onPress={() => setOpen((o) => !o)} style={styles.sectionHeader}>
//         <Text style={styles.sectionTitle}>{title} {open ? '▾' : '▸'}</Text>
//       </TouchableOpacity>
//       {open && <View style={{ padding: 10 }}>{children}</View>}
//     </View>
//   );
// };

// export default function EnterpriseForm({ navigation, route }) {
//   const { beneficiary } = route.params || {};
//   const [record, setRecord] = useState(null);
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const { language } = useContext(LanguageContext);

//   const initialForm = {
//     enterprise_name: '', enterprise_type: '', enterprise_type_other: '',
//     ownership_type: '', ownership_type_other: '', year_of_establishment: '',
//     raw_material: '', machinery_equipment: '', workplace_type: '', workplace_type_other: '',
//     electricity_available: '', water_available: '',
//     transportation_facility: '', transportation_facility_other: '',
//     initial_investment: '', source_of_investment: '', source_of_investment_other: '',
//     working_capital_monthly: '',
//     annual_turnover: '', profit_percentage: '', loan_details: '',
//     loan_institution: '', loan_amount: '', loan_repayment_status: '',
//     main_product_service: '', product_features: '',
//     production_capacity: '', packaging_branding_status: '', certification_registration: '',
//     target_customers: '', marketing_channels: '', marketing_channels_other: '',
//     monthly_sales: '', marketing_strategy: '', marketing_challenges: '',
//     training_received: '', skills_acquired: '', future_training_requirements: '',
//     institutional_support: '', institutional_support_other: '',
//     financial_coordination: '', market_linkage: '', market_linkage_other: '',
//     mentorship_support: '', expansion_plan: '', expansion_plan_other: '',
//     required_support: '', required_support_other: '',
//     photo_enterprise: '', photo_entrepreneur: '', photo_product: '', certificate_docs: ''
//   };
//   const [form, setForm] = useState(initialForm);

//   useEffect(() => {
//     (async () => {
//       const u = await getUser();
//       setUser(u || null);
//       setLoading(true);
//       try {
//         const rows = await gsApi.read('BeneficiaryEnterprise', 'beneficiary_id', beneficiary.id);
//         const found = Array.isArray(rows) && rows.length ? rows[0] : null;
//         if (found) {
//           setRecord(found);
//           const mapped = {}; 
//           Object.keys(initialForm).forEach(k => mapped[k] = found[k] !== undefined && found[k] !== null ? String(found[k]) : '');
          
//           setForm(mapped);
//         } else {
//           setForm(initialForm);
//         }
//       } catch (err) {
//         console.warn('EnterpriseForm load error', err);
//         Alert.alert('Error', 'Failed to load existing enterprise record. ' + String(err));
//         setForm(initialForm);
//       } finally {
//         setLoading(false);
//       }
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

//   const validate = () => {
//     if (!form.enterprise_name || form.enterprise_name.trim() === '') { Alert.alert('Validation', t(language, 'enterprise_name') + ' ' + t(language, 'required')); return false; }
//     return true;
//   };

//   const buildPayload = () => {
//     const base = Object.assign({}, form);
//     base.beneficiary_id = beneficiary.id;
//     if (record && record.id) base.id = record.id;
//     else base.id = base.id || ('be_' + Date.now());
//     if (user && user.id) base.recorded_by_user_id = user.id;
//     const tNow = new Date().toISOString();
//     base.updated_at = tNow;
//     if (!record) base.created_at = tNow;

//     // enterprise_type
//     if (base.enterprise_type === 'Others') {
//       base.enterprise_type = `Others - ${base.enterprise_type_other || ''}`;
//     }
//     // ownership_type
//     if (base.ownership_type === 'Others') {
//       base.ownership_type = `Others - ${base.ownership_type_other || ''}`;
//     }
//     // workplace_type
//     if (base.workplace_type === 'Others') {
//       base.workplace_type = `Others - ${base.workplace_type_other || ''}`;
//     }

//     // transportation_facility
//     if (base.transportation_facility === 'Others') {
//       base.transportation_facility = `Others - ${base.transportation_facility_other || ''}`;
//     }
//     // source_of_investment
//     if (base.source_of_investment === 'Others') {
//       base.source_of_investment = `Others - ${base.source_of_investment_other || ''}`;
//     }
//     // marketing channels
//     if (base.marketing_channels === 'Others') {
//       base.marketing_channels = `Others - ${base.marketing_channels_other || ''}`;
//     }
//     // institutional support
//     if (base.institutional_support === 'Others') {
//       base.institutional_support = `Others - ${base.institutional_support_other || ''}`;
//     }
//     // market linkage
//     if (base.market_linkage === 'Others') {
//       base.market_linkage = `Others - ${base.market_linkage_other || ''}`;
//     }
//     // required support
//     if (base.required_support === 'Others') {
//       base.required_support = `Others - ${base.required_support_other || ''}`;
//     }
//     // expansion plan
//     if (base.expansion_plan === 'Others') {
//       base.expansion_plan = `Others - ${base.expansion_plan_other || ''}`;
//     }

//     // Composed loan_details as comma separated string (Institution,Amount,RepaymentStatus)
//     const loanParts = [
//       (base.loan_institution || '').replace(/,/g, ' '),
//       (base.loan_amount || '').replace(/,/g, ''),
//       (base.loan_repayment_status || '').replace(/,/g, ' ')
//     ];
//     base.loan_details = loanParts.join(',');

//     // Clean undefined/nulls
//     Object.keys(base).forEach(k => { if (base[k] === undefined || base[k] === null) base[k] = ''; });
//     return base;
//   };

//   const handleSubmit = async () => {
//     if (!validate()) return;
//     setLoading(true);
//     try {
//       const payload = buildPayload();
//       const res = await gsApi.createOrUpdateEnterprise(payload);
//       if (res && (res.success === true || res.record || res.saved)) {
//         Alert.alert('Success', record ? t(language, 'update_record') : t(language, 'submit_record'));
//         navigation.goBack();
//       } else {
//         Alert.alert('Error', 'Save failed: ' + JSON.stringify(res || 'no response'));
//       }
//     } catch (err) {
//       console.warn('handleSubmit error', err);
//       Alert.alert('Error', String(err));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!record || !record.id) return Alert.alert('No record to delete');
//     Alert.alert('Confirm', t(language, 'delete_record') + '?', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: t(language, 'delete_record'), style: 'destructive', onPress: async () => {
//         setLoading(true);
//         try {
//           const res = await gsApi.delete('BeneficiaryEnterprise', record.id);
//           if (res && res.success) {
//             Alert.alert('Deleted');
//             navigation.goBack();
//           } else Alert.alert('Delete failed', JSON.stringify(res || 'delete failed'));
//         } catch (err) { Alert.alert('Error', String(err)); } finally { setLoading(false); }
//       }}
//     ]);
//   };

//   const doUploadAsset = async (fieldKey, asset) => {
//     try {
//       if (!asset || !asset.uri) throw new Error('No image asset');
//       const assets = [{ uri: asset.uri, fileName: asset.fileName || `img_${Date.now()}.jpg`, type: asset.type }];
//       const uploadRes = await uploadAssetsToDrive(assets, undefined);
//       if (!uploadRes || !uploadRes.results) throw new Error('Upload failed');
//       const ok = uploadRes.results.find(r => r.success);
//       if (!ok) throw new Error('Upload failed: ' + JSON.stringify(uploadRes.results));
//       setField(fieldKey, ok.url);
//       Alert.alert('Uploaded', 'File uploaded to Drive');
//     } catch (err) {
//       Alert.alert('Upload error', String(err));
//     }
//   };

//   const handlePickAndUpload = async (fieldKey) => {
//     try {
//       const asset = await pickImageFromLibrary();
//       if (!asset) return;
//       await doUploadAsset(fieldKey, asset);
//     } catch (err) { Alert.alert('Pick error', String(err)); }
//   };

//   const handleTakePhotoAndUpload = async (fieldKey) => {
//     try {
//       const asset = await takePhoto();
//       if (!asset) return;
//       await doUploadAsset(fieldKey, asset);
//     } catch (err) { Alert.alert('Camera error', String(err)); }
//   };

//   const openUrl = async (url) => {
//     if (!url) return Alert.alert('No URL');
//     try {
//       const supported = await Linking.canOpenURL(url);
//       if (supported) Linking.openURL(url);
//       else Alert.alert('Cannot open URL');
//     } catch (err) { Alert.alert('Error', String(err)); }
//   };

//   const inputStyle = { borderWidth:1, borderColor:'#EE6969', padding:8, marginBottom:8, borderRadius:6 };

//   const menuItems = [
//     { label: 'Record New Beneficiary Detail', onPress: () => navigation.popToTop() },
//     { label: 'View Recorded Beneficiary', onPress: () => navigation.popToTop() },
//     {
//       label: 'Logout',
//       color: '#EE6969',
//       onPress: async () => {
//         const { clearUser } = await import('../../utils/auth');
//         await clearUser();
//         navigation.replace('Login');
//       },
//     },
//   ];

//   return (
//     <ScrollView contentContainerStyle={{ padding: 12 }}>
//       {/* Header with Burger Menu */}
//       <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 50 }}>
//         {/* Left: BackButton */}
//         <View style={{ flex: 1, gap: 10}}>
//           <LanguageToggle style={{ marginBottom: 10, marginLeft: 10}} />
//           <BackButton />
//         </View>
//         {/* Middle: Beneficiary Name */}
//         <View style={{ flex: 2, alignItems: 'center' }}>
//           <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{beneficiary?.name || 'Beneficiary'}</Text>
//         </View>
//         {/* Right: Burger Icon */}
//         <View style={{ flex: 1, alignItems: 'flex-end' }}>
//           <TouchableOpacity onPress={() => setMenuOpen(true)}>
//             <Image
//               source={HamburgerIcon}
//               style={{ width: 28, height: 28, tintColor: '#333' }}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {loading && <ActivityIndicator size="large" style={{ marginBottom: 12 }} color="#EE6969" />}

//       <Section title={t(language, 'general')} openByDefault>
//         <Text style={styles.inputLabel}>{t(language, 'enterprise_name')}</Text>
//         <TextInput value={form.enterprise_name} onChangeText={v => setField('enterprise_name', v)} style={inputStyle} />
        
//         <Text style={styles.inputLabel}>{t(language, 'enterprise_type')}</Text>
//         <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
//           <Picker
//             selectedValue={form.enterprise_type || ''}
//             onValueChange={(v) => setField('enterprise_type', v)}
//           >
//             <Picker.Item label={t(language, 'option_production')} value="Production" />
//             <Picker.Item label={t(language, 'option_service')} value="Service" />
//             <Picker.Item label={t(language, 'option_trade')} value="Trade" />
//             <Picker.Item label={t(language, 'option_others')} value="Others" />
//           </Picker>
//         </View>
//         {form.enterprise_type === 'Others' && (
//           <TextInput placeholder="Specify" value={form.enterprise_type_other} onChangeText={v => setField('enterprise_type_other', v)} style={inputStyle} />
//         )}

//         <Text style={styles.inputLabel}>{t(language, 'ownership_type')}</Text>
//         <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
//           <Picker
//             selectedValue={form.ownership_type || ''}
//             onValueChange={(v) => setField('ownership_type', v)}
//           >
//             <Picker.Item label={t(language, 'option_individual')} value="Individual" />
//             <Picker.Item label={t(language, 'option_shg')} value="Self-Help Group" />
//             <Picker.Item label={t(language, 'option_partnership')} value="Partnership" />
//             <Picker.Item label={t(language, 'option_cooperative')} value="Cooperative" />
//             <Picker.Item label={t(language, 'option_fpo')} value="FPO" />
//             <Picker.Item label={t(language, 'option_others')} value="Others" />
//           </Picker>
//         </View>  
//         {form.ownership_type === 'Others' && (
//           <TextInput placeholder="Specify" value={form.ownership_type_other} onChangeText={v => setField('ownership_type_other', v)} style={inputStyle} />
//         )}

//         <Text style={styles.inputLabel}>{t(language, 'year_of_establishment')}</Text>
//         <TextInput value={form.year_of_establishment} onChangeText={v => setField('year_of_establishment', v)} keyboardType="numeric" style={inputStyle} />
//       </Section>

//       <Section title={t(language, 'production_capacity')}>
//         {['main_product_service','raw_material','machinery_equipment','production_capacity','packaging_branding_status','certification_registration'].map(key => (
//           <View key={key}>
//             <Text style={styles.inputLabel}>{t(language, key === "production_capacity" ? "production_capacity_field" : key)}</Text>
//             <TextInput value={form[key]} onChangeText={v => setField(key, v)} style={inputStyle} multiline />
//           </View>
//         ))}

//         <Text style={styles.inputLabel}>{t(language, 'workplace_type')}</Text>
//         <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
//           <Picker
//             selectedValue={form.workplace_type || ''}
//             onValueChange={(v) => setField('workplace_type', v)}
//           >
//             <Picker.Item label={t(language, 'option_home')} value="Home-based" />
//             <Picker.Item label={t(language, 'option_rented')} value="Rented" />
//             <Picker.Item label={t(language, 'option_own')} value="Own" />
//             <Picker.Item label={t(language, 'option_others')} value="Others" />
//           </Picker>
//         </View>
//         {form.workplace_type === 'Others' && (
//           <TextInput placeholder="Specify" value={form.workplace_type_other} onChangeText={v => setField('workplace_type_other', v)} style={inputStyle} />
//         )}

//         <Text style={styles.inputLabel}>{t(language, 'electricity_available')}</Text>
//         <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
//           <Picker selectedValue={form.electricity_available || ''} onValueChange={(v)=>setField('electricity_available', v)}>
//             <Picker.Item label={t(language, 'option_yes')} value="Yes" />
//             <Picker.Item label={t(language, 'option_no')} value="No" />
//           </Picker>
//         </View>

//         <Text style={styles.inputLabel}>{t(language, 'water_available')}</Text>
//         <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
//           <Picker selectedValue={form.water_available || ''} onValueChange={(v)=>setField('water_available', v)}>
//             <Picker.Item label={t(language, 'option_yes')} value="Yes" />
//             <Picker.Item label={t(language, 'option_no')} value="No" />
//           </Picker>
//         </View>

//         <Text style={styles.inputLabel}>{t(language, 'transportation_facility')}</Text>
//         <Text style={{ fontSize:12, color:'#666', marginBottom:6 }}>{t(language, 'transport_sample_note')}</Text>
//         <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
//           <Picker selectedValue={form.transportation_facility || ''} onValueChange={(v)=>setField('transportation_facility', v)}>
//             <Picker.Item label={t(language, 'option_yes')} value="Yes" />
//             <Picker.Item label={t(language, 'option_no')} value="No" />
//             <Picker.Item label={t(language, 'option_need_help')} value="Others" />
//           </Picker>
//         </View>
//         {form.transportation_facility === 'Others' && (
//           <TextInput placeholder="How can we help?" value={form.transportation_facility_other} onChangeText={v => setField('transportation_facility_other', v)} style={inputStyle} />
//         )}
//       </Section>

//       <Section title={t(language, 'finance')}>
//         {['initial_investment','working_capital_monthly','annual_turnover','profit_percentage'].map(key => (
//           <View key={key}>
//             <Text style={styles.inputLabel}>{t(language, key)}</Text>
//             <TextInput
//               value={form[key]}
//               onChangeText={v => setField(key, v)}
//               style={inputStyle}
//               keyboardType={'numeric'}
//             />
//           </View>
//         ))}

//         <Text style={styles.inputLabel}>{t(language, 'source_of_investment')}</Text>
//         <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
//           <Picker selectedValue={form.source_of_investment || ''} onValueChange={(v)=>setField('source_of_investment', v)}>
//             <Picker.Item label={t(language, 'option_ccl')} value="CCL" />
//             <Picker.Item label={t(language, 'option_cif')} value="CIF" />
//             <Picker.Item label={t(language, 'option_livelihood')} value="Livelihood Fund" />
//             <Picker.Item label={t(language, 'option_cef')} value="CEF" />
//             <Picker.Item label={t(language, 'option_others')} value="Others" />
//           </Picker>
//         </View>
//         {form.source_of_investment === 'Others' && (
//           <TextInput placeholder="Specify" value={form.source_of_investment_other} onChangeText={v => setField('source_of_investment_other', v)} style={inputStyle} />
//         )}

//         <Text style={styles.inputLabel}>{t(language, 'loan_details')}</Text>
//         {/* Loan subfields */}
//         <Text style={{ fontWeight:'600' }}>{t(language, 'loan_institution')}</Text>
//         <TextInput value={form.loan_institution} onChangeText={v => setField('loan_institution', v)} style={inputStyle} />
//         <Text style={{ fontWeight:'600' }}>{t(language, 'loan_amount')}</Text>
//         <TextInput value={form.loan_amount} onChangeText={v => setField('loan_amount', v)} keyboardType="numeric" style={inputStyle} />
//         <Text style={{ fontWeight:'600' }}>{t(language, 'loan_repayment_status')}</Text>
//         <TextInput value={form.loan_repayment_status} onChangeText={v => setField('loan_repayment_status', v)} style={inputStyle} />
//         <Text style={{ fontSize:12, color:'#666' , marginTop:4}}>Note: Institution, Amount, Repayment Status will be saved in DB under single "loan_details" field as comma-separated values.</Text>

//       </Section>

//       <Section title={t(language, 'marketing_sales')}>
//         {['target_customers','monthly_sales','marketing_strategy','marketing_challenges'].map(key => (
//           <View key={key}>
//             <Text style={styles.inputLabel}>{t(language, key)}</Text>
//             <TextInput
//               value={form[key]}
//               onChangeText={v => setField(key, v)}
//               style={inputStyle}
//               multiline={['marketing_strategy','marketing_challenges'].includes(key)}
//               keyboardType={key==='monthly_sales'?'numeric':'default'}
//             />
//           </View>
//         ))}

//         <Text style={styles.inputLabel}>{t(language, 'marketing_channels')}</Text>
//         <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
//           <Picker selectedValue={form.marketing_channels || ''} onValueChange={(v)=>setField('marketing_channels', v)}>
//             <Picker.Item label={t(language, 'option_retail')} value="Retail" />
//             <Picker.Item label={t(language, 'option_online')} value="Online" />
//             <Picker.Item label={t(language, 'option_exhibition')} value="Exhibition" />
//             <Picker.Item label={t(language, 'option_others')} value="Others" />
//           </Picker>
//         </View>
//         {form.marketing_channels === 'Others' && (
//           <TextInput placeholder="Specify" value={form.marketing_channels_other} onChangeText={v => setField('marketing_channels_other', v)} style={inputStyle} />
//         )}
//       </Section>

//       <Section title={t(language, 'training_support')}>
//         {['training_received','skills_acquired','future_training_requirements','financial_coordination','mentorship_support'].map(key => (
//           <View key={key}>
//             <Text style={styles.inputLabel}>{t(language, key)}</Text>
//             <TextInput value={form[key]} onChangeText={v => setField(key, v)} style={inputStyle} multiline />
//           </View>
//         ))}

//         <Text style={styles.inputLabel}>{t(language, 'institutional_support')}</Text>
//         <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
//           <Picker selectedValue={form.institutional_support || ''} onValueChange={(v)=>setField('institutional_support', v)}>
//             <Picker.Item label={t(language, 'option_nrlm')} value="NRLM" />
//             <Picker.Item label={t(language, 'option_srlm')} value="SRLM" />
//             <Picker.Item label={t(language, 'option_others')} value="Others" />
//           </Picker>
//         </View>
//         {form.institutional_support === 'Others' && (
//           <TextInput placeholder="Specify" value={form.institutional_support_other} onChangeText={v => setField('institutional_support_other', v)} style={inputStyle} />
//         )}

//         <Text style={styles.inputLabel}>{t(language, 'market_linkage')}</Text>
//         <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
//           <Picker selectedValue={form.market_linkage || ''} onValueChange={(v)=>setField('market_linkage', v)}>
//             <Picker.Item label={t(language, 'option_ondc')} value="ONDC" />
//             <Picker.Item label={t(language, 'option_ecommerce')} value="E-commerce" />
//             <Picker.Item label={t(language, 'option_exhibition')} value="Exhibition" />
//             <Picker.Item label={t(language, 'option_others')} value="Others" />
//           </Picker>
//         </View>
//         {form.market_linkage === 'Others' && (
//           <TextInput placeholder="Specify" value={form.market_linkage_other} onChangeText={v => setField('market_linkage_other', v)} style={inputStyle} />
//         )}

//         <Text style={styles.inputLabel}>{t(language, 'expansion_plan')}</Text>
//         <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
//           <Picker selectedValue={form.expansion_plan || ''} onValueChange={(v)=>setField('expansion_plan', v)}>
//             <Picker.Item label={t(language, 'option_new_product')} value="New Product" />
//             <Picker.Item label={t(language, 'option_ecommerce_plan')} value="E-Commerce" />
//             <Picker.Item label={t(language, 'option_employment')} value="Employment" />
//             <Picker.Item label={t(language, 'option_others')} value="Others" />
//           </Picker>
//         </View>
//         {form.expansion_plan === 'Others' && (
//           <TextInput placeholder="Specify" value={form.expansion_plan_other} onChangeText={v => setField('expansion_plan_other', v)} style={inputStyle} />
//         )}

//         <Text style={styles.inputLabel}>{t(language, 'required_support')}</Text>
//         <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
//           <Picker selectedValue={form.required_support || ''} onValueChange={(v)=>setField('required_support', v)}>
//             <Picker.Item label={t(language, 'option_finance')} value="Finance" />
//             <Picker.Item label={t(language, 'option_training')} value="Training" />
//             <Picker.Item label={t(language, 'option_advertisement')} value="Advertisement" />
//             <Picker.Item label={t(language, 'option_equipments')} value="Equipments" />
//             <Picker.Item label={t(language, 'option_others')} value="Others" />
//           </Picker>
//         </View>
//         {form.required_support === 'Others' && (
//           <TextInput placeholder="Specify" value={form.required_support_other} onChangeText={v => setField('required_support_other', v)} style={inputStyle} />
//         )}

//       </Section>

//       <Section title={t(language, 'docs_photos')}>
//         {['photo_enterprise','photo_entrepreneur','photo_product'].map(key => (
//           <View key={key}>
//             <Text style={styles.inputLabel} >{t(language, key)}</Text>
//             <View style={{ flexDirection:'row', marginBottom:8 }}>
//               <TouchableOpacity style={styles.redButton} onPress={() => handlePickAndUpload(key)}>
//                 <Text style={styles.redButtonText}>{t(language, 'pick_photo')}</Text>
//               </TouchableOpacity>
//               <View style={{ width:8 }} />
//               <TouchableOpacity style={styles.redButton} onPress={() => handleTakePhotoAndUpload(key)}>
//                 <Text style={styles.redButtonText}>{t(language, 'take_photo')}</Text>
//               </TouchableOpacity>
//             </View>
//             <TouchableOpacity onPress={() => form[key] && openUrl(form[key])}>
//               <Text numberOfLines={1} style={{ color:'#444', marginBottom:8 }}>{form[key] || t(language, 'no_file')}</Text>
//             </TouchableOpacity>
//           </View>
//         ))}
//         <Text>{t(language, 'certificate_docs')}</Text>
//         <TextInput value={form.certificate_docs} onChangeText={v => setField('certificate_docs', v)} style={{ ...inputStyle }} multiline />
//       </Section>

//       <TouchableOpacity style={styles.redButton} onPress={handleSubmit} disabled={loading}>
//         <Text style={styles.redButtonText}>{record ? t(language, 'update_record') : t(language, 'submit_record')}</Text>
//       </TouchableOpacity>

//       {record && (
//         <TouchableOpacity style={styles.redButton} onPress={handleDelete} disabled={loading}>
//           <Text style={styles.redButtonText}>{t(language, 'delete_record')}</Text>
//         </TouchableOpacity>
//       )}

//       <View style={{ height: 24 }} />

//       {/* Burger Menu Modal */}
//       <BurgerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} menuItems={menuItems} />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   sectionCard: {
//     marginBottom: 16, 
//     borderWidth: 1,
//     borderColor: '#EE6969',
//     borderRadius: 12,
//     overflow: 'hidden',
//   },
//   sectionHeader: {
//     padding: 12, 
//     backgroundColor: '#fafafa',
//   },
//   sectionTitle: {
//     fontWeight: 'bold',
//     color: '#EE6969',
//   },
//   inputLabel: {      
//     fontWeight: '600',
//     marginBottom: 6,
//   },
//   redButton: {
//     backgroundColor: '#EE6969',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 16,
//   },
//   redButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   inputStyle: {      
//     borderWidth: 1,
//     borderColor: '#EE6969',
//     padding: 10,
//     marginBottom: 18,  // increased bottom margin for bigger gap after input
//     borderRadius: 6,
//   },
// });




import React, { useEffect, useState, useContext } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StyleSheet,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import gsApi from '../../api/gsApi';
import BackButton from '../../components/BackButton';
import { getUser } from '../../utils/auth';
import { pickImageFromLibrary, takePhoto, uploadAssetsToDrive } from '../../utils/media';
import BurgerMenu from '../BurgerMenu';
import HamburgerIcon from '../../../assets/hamburger.png';
import LanguageToggle from '../../components/LanguageToggle';
import { LanguageContext } from '../../components/LanguageContext';

// --- Inline i18n utility ---
const translations = {
  en: {
    general: "General",
    production_capacity: "Production & Capacity",
    finance: "Finance",
    marketing_sales: "Marketing & Sales",
    training_support: "Training & Support",
    docs_photos: "Documents & Photos",
    enterprise_name: "Enterprise Name",
    enterprise_type: "Enterprise Type",
    ownership_type: "Ownership Type",
    year_of_establishment: "Year of Establishment",
    main_product_service: "Main Product/Service",
    raw_material: "Raw Material",
    machinery_equipment: "Machinery/Equipment",
    production_capacity_field: "Production Capacity",
    packaging_branding_status: "Packaging/Branding Status",
    certification_registration: "Certification/Registration",
    workplace_type: "Workplace Type",
    electricity_available: "Electricity Available",
    water_available: "Water Available",
    transportation_facility: "Transportation Facility",
    initial_investment: "Initial Investment",
    source_of_investment: "Source of Investment",
    working_capital_monthly: "Working Capital (Monthly)",
    annual_turnover: "Annual Turnover",
    profit_percentage: "Profit Percentage",
    loan_details: "Loan Details",
    target_customers: "Target Customers",
    marketing_channels: "Marketing Channels",
    monthly_sales: "Monthly Sales",
    marketing_strategy: "Marketing Strategy",
    marketing_challenges: "Marketing Challenges",
    training_received: "Training Received",
    skills_acquired: "Skills Acquired",
    future_training_requirements: "Future Training Requirements",
    institutional_support: "Institutional Support",
    financial_coordination: "Financial Coordination",
    market_linkage: "Market Linkage",
    mentorship_support: "Mentorship Support",
    expansion_plan: "Expansion Plan",
    required_support: "Required Support",
    photo_enterprise: "Photo - Enterprise",
    photo_entrepreneur: "Photo - Entrepreneur",
    photo_product: "Photo - Product",
    pick_photo: "Pick Photo",
    take_photo: "Take Photo",
    update_record: "Update Record",
    submit_record: "Submit Record",
    delete_record: "Delete Record",
    certificate_docs: "Certificate Docs (comma-separated URLs)",
    no_file: "(no file)",
    option_production: "Production",
    option_service: "Service",
    option_trade: "Trade",
    option_others: "Others - Specify",
    option_individual: "Individual",
    option_shg: "Self-Help Group",
    option_partnership: "Partnership",
    option_cooperative: "Cooperative",
    option_fpo: "FPO",
    option_home: "Home-based",
    option_rented: "Rented",
    option_own: "Own",
    option_yes: "Yes",
    option_no: "No",
    option_retail: "Retail",
    option_online: "Online",
    option_exhibition: "Exhibition",
    option_need_help: "Need Help?",
    option_ccl: "CCL",
    option_cif: "CIF",
    option_livelihood: "Livelihood Fund",
    option_cef: "CEF",
    option_nrlm: "NRLM",
    option_srlm: "SRLM",
    option_ondc: "ONDC",
    option_ecommerce: "E-commerce",
    option_finance: "Finance",
    option_training: "Training",
    option_advertisement: "Advertisement",
    option_equipments: "Equipments",
    option_new_product: "New Product",
    option_ecommerce_plan: "E-Commerce",
    option_employment: "Employment",
    loan_institution: "Loan Institution",
    loan_amount: "Loan Amount",
    loan_repayment_status: "Repayment Status",
    transport_sample_note: "(If yes, can you send a product sample to Bijnor CLF?)"
  },
  hi: {
    general: "सामान्य",
    production_capacity: "उत्पादन और क्षमता",
    finance: "वित्त",
    marketing_sales: "विपणन और बिक्री",
    training_support: "प्रशिक्षण और समर्थन",
    docs_photos: "दस्तावेज़ और फ़ोटो",
    enterprise_name: "उद्यम का नाम",
    enterprise_type: "उद्यम का प्रकार",
    ownership_type: "स्वामित्व प्रकार",
    year_of_establishment: "स्थापना वर्ष",
    main_product_service: "मुख्य उत्पाद/सेवा",
    raw_material: "कच्चा माल",
    machinery_equipment: "मशीनरी/उपकरण",
    production_capacity_field: "उत्पादन क्षमता",
    packaging_branding_status: "पैकेजिंग/ब्रांडिंग स्थिति",
    certification_registration: "प्रमाणन/पंजीकरण",
    workplace_type: "कार्यस्थल प्रकार",
    electricity_available: "बिजली उपलब्धता",
    water_available: "पानी उपलब्धता",
    transportation_facility: "परिवहन सुविधा",
    initial_investment: "प्रारंभिक निवेश",
    source_of_investment: "निवेश का स्रोत",
    working_capital_monthly: "कार्यशील पूंजी (मासिक)",
    annual_turnover: "वार्षिक कारोबार",
    profit_percentage: "लाभ प्रतिशत",
    loan_details: "ऋण विवरण",
    target_customers: "लक्ष्य ग्राहक",
    marketing_channels: "विपणन चैनल",
    monthly_sales: "मासिक बिक्री",
    marketing_strategy: "विपणन रणनीति",
    marketing_challenges: "विपणन चुनौतियाँ",
    training_received: "प्राप्त प्रशिक्षण",
    skills_acquired: "अर्जित कौशल",
    future_training_requirements: "भविष्य की प्रशिक्षण आवश्यकताएँ",
    institutional_support: "संस्थानिक समर्थन",
    financial_coordination: "वित्तीय समन्वय",
    market_linkage: "बाजार संपर्क",
    mentorship_support: "मार्गदर्शन समर्थन",
    expansion_plan: "विस्तार योजना",
    required_support: "आवश्यक समर्थन",
    photo_enterprise: "फ़ोटो - उद्यम",
    photo_entrepreneur: "फ़ोटो - उद्यमी",
    photo_product: "फ़ोटो - उत्पाद",
    pick_photo: "फ़ोटो चुनें",
    take_photo: "फ़ोटो लें",
    update_record: "रिकॉर्ड अपडेट करें",
    submit_record: "रिकॉर्ड सबमिट करें",
    delete_record: "रिकॉर्ड हटाएँ",
    certificate_docs: "प्रमाणपत्र (कॉमा सेपरेटेड लिंक)",
    no_file: "(कोई फ़ाइल नहीं)",
    option_production: "उत्पादन",
    option_service: "सेवा",
    option_trade: "व्यापार",
    option_others: "अन्य - उल्लेख करें",
    option_individual: "व्यक्ति",
    option_shg: "स्व-सहायता समूह",
    option_partnership: "साझेदारी",
    option_cooperative: "सहकारी",
    option_fpo: "FPO",
    option_home: "घर पर आधारित",
    option_rented: "किराये पर",
    option_own: "स्वयं की",
    option_yes: "हाँ",
    option_no: "नहीं",
    option_retail: "खुदरा",
    option_online: "ऑनलाइन",
    option_exhibition: "प्रदर्शनी",
    option_need_help: "मदद चाहिए?",
    option_ccl: "CCL",
    option_cif: "CIF",
    option_livelihood: "Livelihood Fund",
    option_cef: "CEF",
    option_nrlm: "NRLM",
    option_srlm: "SRLM",
    option_ondc: "ONDC",
    option_ecommerce: "E-commerce",
    option_finance: "वित्त",
    option_training: "प्रशिक्षण",
    option_advertisement: "विज्ञापन",
    option_equipments: "उपकरण",
    option_new_product: "नया उत्पाद",
    option_ecommerce_plan: "ई-कॉमर्स",
    option_employment: "रोज़गार",
    loan_institution: "संस्था",
    loan_amount: "राशि",
    loan_repayment_status: "भुगतान स्थिति",
    transport_sample_note: "(यदि हां, क्या आप बिझनोर CLF को उत्पाद नमूना भेज सकते हैं?)"
  }
};
const t = (language, key) => (translations[language] && translations[language][key]) || key;

const Section = ({ title, children, openByDefault = false }) => {
  const [open, setOpen] = useState(openByDefault);
  return (
    <View style={styles.sectionCard}>
      <TouchableOpacity onPress={() => setOpen((o) => !o)} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title} {open ? '▾' : '▸'}</Text>
      </TouchableOpacity>
      {open && <View style={{ padding: 10 }}>{children}</View>}
    </View>
  );
};

export default function EnterpriseForm({ navigation, route }) {
  const { beneficiary } = route.params || {};
  const [record, setRecord] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { language } = useContext(LanguageContext);

  const initialForm = {
    enterprise_name: '', enterprise_type: '', enterprise_type_other: '',
    ownership_type: '', ownership_type_other: '', year_of_establishment: '',
    raw_material: '', machinery_equipment: '', workplace_type: '', workplace_type_other: '',
    electricity_available: '', water_available: '',
    transportation_facility: '', transportation_facility_other: '',
    initial_investment: '', source_of_investment: '', source_of_investment_other: '',
    working_capital_monthly: '',
    annual_turnover: '', profit_percentage: '', loan_details: '',
    loan_institution: '', loan_amount: '', loan_repayment_status: '',
    main_product_service: '', product_features: '',
    production_capacity: '', packaging_branding_status: '', certification_registration: '',
    target_customers: '', marketing_channels: '', marketing_channels_other: '',
    monthly_sales: '', marketing_strategy: '', marketing_challenges: '',
    training_received: '', skills_acquired: '', future_training_requirements: '',
    institutional_support: '', institutional_support_other: '',
    financial_coordination: '', market_linkage: '', market_linkage_other: '',
    mentorship_support: '', expansion_plan: '', expansion_plan_other: '',
    required_support: '', required_support_other: '',
    photo_enterprise: '', photo_entrepreneur: '', photo_product: '', certificate_docs: ''
  };
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      setUser(u || null);
      setLoading(true);
      try {
        const rows = await gsApi.read('BeneficiaryEnterprise', 'beneficiary_id', beneficiary.id);
        const found = Array.isArray(rows) && rows.length ? rows[0] : null;
        if (found) {
          setRecord(found);
          const mapped = {}; 
          Object.keys(initialForm).forEach(k => mapped[k] = found[k] !== undefined && found[k] !== null ? String(found[k]) : '');
          
          setForm(mapped);
        } else {
          setForm(initialForm);
        }
      } catch (err) {
        console.warn('EnterpriseForm load error', err);
        Alert.alert('Error', 'Failed to load existing enterprise record. ' + String(err));
        setForm(initialForm);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const validate = () => {
    if (!form.enterprise_name || form.enterprise_name.trim() === '') { Alert.alert('Validation', t(language, 'enterprise_name') + ' ' + t(language, 'required')); return false; }
    return true;
  };

  const buildPayload = () => {
    const base = Object.assign({}, form);
    base.beneficiary_id = beneficiary.id;
    if (record && record.id) base.id = record.id;
    else base.id = base.id || ('be_' + Date.now());
    if (user && user.id) base.recorded_by_user_id = user.id;
    const tNow = new Date().toISOString();
    base.updated_at = tNow;
    if (!record) base.created_at = tNow;

    // enterprise_type
    if (base.enterprise_type === 'Others') {
      base.enterprise_type = `Others - ${base.enterprise_type_other || ''}`;
    }
    // ownership_type
    if (base.ownership_type === 'Others') {
      base.ownership_type = `Others - ${base.ownership_type_other || ''}`;
    }
    // workplace_type
    if (base.workplace_type === 'Others') {
      base.workplace_type = `Others - ${base.workplace_type_other || ''}`;
    }

    // transportation_facility
    if (base.transportation_facility === 'Others') {
      base.transportation_facility = `Others - ${base.transportation_facility_other || ''}`;
    }
    // source_of_investment
    if (base.source_of_investment === 'Others') {
      base.source_of_investment = `Others - ${base.source_of_investment_other || ''}`;
    }
    // marketing channels
    if (base.marketing_channels === 'Others') {
      base.marketing_channels = `Others - ${base.marketing_channels_other || ''}`;
    }
    // institutional support
    if (base.institutional_support === 'Others') {
      base.institutional_support = `Others - ${base.institutional_support_other || ''}`;
    }
    // market linkage
    if (base.market_linkage === 'Others') {
      base.market_linkage = `Others - ${base.market_linkage_other || ''}`;
    }
    // required support
    if (base.required_support === 'Others') {
      base.required_support = `Others - ${base.required_support_other || ''}`;
    }
    // expansion plan
    if (base.expansion_plan === 'Others') {
      base.expansion_plan = `Others - ${base.expansion_plan_other || ''}`;
    }

    // Composed loan_details as comma separated string (Institution,Amount,RepaymentStatus)
    const loanParts = [
      (base.loan_institution || '').replace(/,/g, ' '),
      (base.loan_amount || '').replace(/,/g, ''),
      (base.loan_repayment_status || '').replace(/,/g, ' ')
    ];
    base.loan_details = loanParts.join(',');

    // Clean undefined/nulls
    Object.keys(base).forEach(k => { if (base[k] === undefined || base[k] === null) base[k] = ''; });
    return base;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = buildPayload();
      const res = await gsApi.createOrUpdateEnterprise(payload);
      if (res && (res.success === true || res.record || res.saved)) {
        Alert.alert('Success', record ? t(language, 'update_record') : t(language, 'submit_record'));
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Save failed: ' + JSON.stringify(res || 'no response'));
      }
    } catch (err) {
      console.warn('handleSubmit error', err);
      Alert.alert('Error', String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!record || !record.id) return Alert.alert('No record to delete');
    Alert.alert('Confirm', t(language, 'delete_record') + '?', [
      { text: 'Cancel', style: 'cancel' },
      { text: t(language, 'delete_record'), style: 'destructive', onPress: async () => {
        setLoading(true);
        try {
          const res = await gsApi.delete('BeneficiaryEnterprise', record.id);
          if (res && res.success) {
            Alert.alert('Deleted');
            navigation.goBack();
          } else Alert.alert('Delete failed', JSON.stringify(res || 'delete failed'));
        } catch (err) { Alert.alert('Error', String(err)); } finally { setLoading(false); }
      }}
    ]);
  };

  const doUploadAsset = async (fieldKey, asset) => {
    try {
      if (!asset || !asset.uri) throw new Error('No image asset');
      const assets = [{ uri: asset.uri, fileName: asset.fileName || `img_${Date.now()}.jpg`, type: asset.type }];
      const uploadRes = await uploadAssetsToDrive(assets, undefined);
      if (!uploadRes || !uploadRes.results) throw new Error('Upload failed');
      const ok = uploadRes.results.find(r => r.success);
      if (!ok) throw new Error('Upload failed: ' + JSON.stringify(uploadRes.results));
      setField(fieldKey, ok.url);
      Alert.alert('Uploaded', 'File uploaded to Drive');
    } catch (err) {
      Alert.alert('Upload error', String(err));
    }
  };

  const handlePickAndUpload = async (fieldKey) => {
    try {
      const asset = await pickImageFromLibrary();
      if (!asset) return;
      await doUploadAsset(fieldKey, asset);
    } catch (err) { Alert.alert('Pick error', String(err)); }
  };

  const handleTakePhotoAndUpload = async (fieldKey) => {
    try {
      const asset = await takePhoto();
      if (!asset) return;
      await doUploadAsset(fieldKey, asset);
    } catch (err) { Alert.alert('Camera error', String(err)); }
  };

  const openUrl = async (url) => {
    if (!url) return Alert.alert('No URL');
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) Linking.openURL(url);
      else Alert.alert('Cannot open URL');
    } catch (err) { Alert.alert('Error', String(err)); }
  };

  const inputStyle = { borderWidth:1, borderColor:'#EE6969', padding:8, marginBottom:8, borderRadius:6 };

  const menuItems = [
    { label: 'Record New Beneficiary Detail', onPress: () => navigation.popToTop() },
    { label: 'View Recorded Beneficiary', onPress: () => navigation.popToTop() },
    {
      label: 'Logout',
      color: '#EE6969',
      onPress: async () => {
        const { clearUser } = await import('../../utils/auth');
        await clearUser();
        navigation.replace('Login');
      },
    },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: 12 }}>
      {/* Header with Burger Menu */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 50 }}>
        {/* Left: BackButton */}
        <View style={{ flex: 1, gap: 10}}>
          <LanguageToggle style={{ marginBottom: 10, marginLeft: 10}} />
          <BackButton />
        </View>
        {/* Middle: Beneficiary Name */}
        <View style={{ flex: 2, alignItems: 'center' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{beneficiary?.name || 'Beneficiary'}</Text>
        </View>
        {/* Right: Burger Icon */}
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TouchableOpacity onPress={() => setMenuOpen(true)}>
            <Image
              source={HamburgerIcon}
              style={{ width: 28, height: 28, tintColor: '#333' }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {loading && <ActivityIndicator size="large" style={{ marginBottom: 12 }} color="#EE6969" />}

      <Section title={t(language, 'general')} openByDefault>
        <Text style={styles.inputLabel}>{t(language, 'enterprise_name')}</Text>
        <TextInput value={form.enterprise_name} onChangeText={v => setField('enterprise_name', v)} style={inputStyle} />
        
        <Text style={styles.inputLabel}>{t(language, 'enterprise_type')}</Text>
        <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
          <Picker
            selectedValue={form.enterprise_type || ''}
            onValueChange={(v) => setField('enterprise_type', v)}
          >
            <Picker.Item label={t(language, 'option_production')} value="Production" />
            <Picker.Item label={t(language, 'option_service')} value="Service" />
            <Picker.Item label={t(language, 'option_trade')} value="Trade" />
            <Picker.Item label={t(language, 'option_others')} value="Others" />
          </Picker>
        </View>
        {form.enterprise_type === 'Others' && (
          <TextInput placeholder="Specify" value={form.enterprise_type_other} onChangeText={v => setField('enterprise_type_other', v)} style={inputStyle} />
        )}

        <Text style={styles.inputLabel}>{t(language, 'ownership_type')}</Text>
        <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
          <Picker
            selectedValue={form.ownership_type || ''}
            onValueChange={(v) => setField('ownership_type', v)}
          >
            <Picker.Item label={t(language, 'option_individual')} value="Individual" />
            <Picker.Item label={t(language, 'option_shg')} value="Self-Help Group" />
            <Picker.Item label={t(language, 'option_partnership')} value="Partnership" />
            <Picker.Item label={t(language, 'option_cooperative')} value="Cooperative" />
            <Picker.Item label={t(language, 'option_fpo')} value="FPO" />
            <Picker.Item label={t(language, 'option_others')} value="Others" />
          </Picker>
        </View>  
        {form.ownership_type === 'Others' && (
          <TextInput placeholder="Specify" value={form.ownership_type_other} onChangeText={v => setField('ownership_type_other', v)} style={inputStyle} />
        )}

        <Text style={styles.inputLabel}>{t(language, 'year_of_establishment')}</Text>
        <TextInput value={form.year_of_establishment} onChangeText={v => setField('year_of_establishment', v)} keyboardType="numeric" style={inputStyle} />
      </Section>

      <Section title={t(language, 'production_capacity')}>
        {['main_product_service','raw_material','machinery_equipment','production_capacity','packaging_branding_status','certification_registration'].map(key => (
          <View key={key}>
            <Text style={styles.inputLabel}>{t(language, key === "production_capacity" ? "production_capacity_field" : key)}</Text>
            <TextInput value={form[key]} onChangeText={v => setField(key, v)} style={inputStyle} multiline />
          </View>
        ))}

        <Text style={styles.inputLabel}>{t(language, 'workplace_type')}</Text>
        <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
          <Picker
            selectedValue={form.workplace_type || ''}
            onValueChange={(v) => setField('workplace_type', v)}
          >
            <Picker.Item label={t(language, 'option_home')} value="Home-based" />
            <Picker.Item label={t(language, 'option_rented')} value="Rented" />
            <Picker.Item label={t(language, 'option_own')} value="Own" />
            <Picker.Item label={t(language, 'option_others')} value="Others" />
          </Picker>
        </View>
        {form.workplace_type === 'Others' && (
          <TextInput placeholder="Specify" value={form.workplace_type_other} onChangeText={v => setField('workplace_type_other', v)} style={inputStyle} />
        )}

        <Text style={styles.inputLabel}>{t(language, 'electricity_available')}</Text>
        <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
          <Picker selectedValue={form.electricity_available || ''} onValueChange={(v)=>setField('electricity_available', v)}>
            <Picker.Item label={t(language, 'option_yes')} value="Yes" />
            <Picker.Item label={t(language, 'option_no')} value="No" />
          </Picker>
        </View>

        <Text style={styles.inputLabel}>{t(language, 'water_available')}</Text>
        <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
          <Picker selectedValue={form.water_available || ''} onValueChange={(v)=>setField('water_available', v)}>
            <Picker.Item label={t(language, 'option_yes')} value="Yes" />
            <Picker.Item label={t(language, 'option_no')} value="No" />
          </Picker>
        </View>

        <Text style={styles.inputLabel}>{t(language, 'transportation_facility')}</Text>
        <Text style={{ fontSize:12, color:'#666', marginBottom:6 }}>{t(language, 'transport_sample_note')}</Text>
        <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
          <Picker selectedValue={form.transportation_facility || ''} onValueChange={(v)=>setField('transportation_facility', v)}>
            <Picker.Item label={t(language, 'option_yes')} value="Yes" />
            <Picker.Item label={t(language, 'option_no')} value="No" />
            <Picker.Item label={t(language, 'option_need_help')} value="Others" />
          </Picker>
        </View>
        {form.transportation_facility === 'Others' && (
          <TextInput placeholder="How can we help?" value={form.transportation_facility_other} onChangeText={v => setField('transportation_facility_other', v)} style={inputStyle} />
        )}
      </Section>

      <Section title={t(language, 'finance')}>
        {['initial_investment','working_capital_monthly','annual_turnover','profit_percentage'].map(key => (
          <View key={key}>
            <Text style={styles.inputLabel}>{t(language, key)}</Text>
            <TextInput
              value={form[key]}
              onChangeText={v => setField(key, v)}
              style={inputStyle}
              keyboardType={'numeric'}
            />
          </View>
        ))}

        <Text style={styles.inputLabel}>{t(language, 'source_of_investment')}</Text>
        <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
          <Picker selectedValue={form.source_of_investment || ''} onValueChange={(v)=>setField('source_of_investment', v)}>
            <Picker.Item label={t(language, 'option_ccl')} value="CCL" />
            <Picker.Item label={t(language, 'option_cif')} value="CIF" />
            <Picker.Item label={t(language, 'option_livelihood')} value="Livelihood Fund" />
            <Picker.Item label={t(language, 'option_cef')} value="CEF" />
            <Picker.Item label={t(language, 'option_others')} value="Others" />
          </Picker>
        </View>
        {form.source_of_investment === 'Others' && (
          <TextInput placeholder="Specify" value={form.source_of_investment_other} onChangeText={v => setField('source_of_investment_other', v)} style={inputStyle} />
        )}

        <Text style={styles.inputLabel}>{t(language, 'loan_details')}</Text>
        {/* Loan subfields */}
        <Text style={{ fontWeight:'600' }}>{t(language, 'loan_institution')}</Text>
        <TextInput value={form.loan_institution} onChangeText={v => setField('loan_institution', v)} style={inputStyle} />
        <Text style={{ fontWeight:'600' }}>{t(language, 'loan_amount')}</Text>
        <TextInput value={form.loan_amount} onChangeText={v => setField('loan_amount', v)} keyboardType="numeric" style={inputStyle} />
        <Text style={{ fontWeight:'600' }}>{t(language, 'loan_repayment_status')}</Text>
        <TextInput value={form.loan_repayment_status} onChangeText={v => setField('loan_repayment_status', v)} style={inputStyle} />
        <Text style={{ fontSize:12, color:'#666' , marginTop:4}}>Note: Institution, Amount, Repayment Status will be saved in DB under single "loan_details" field as comma-separated values.</Text>

      </Section>

      <Section title={t(language, 'marketing_sales')}>
        {['target_customers','monthly_sales','marketing_strategy','marketing_challenges'].map(key => (
          <View key={key}>
            <Text style={styles.inputLabel}>{t(language, key)}</Text>
            <TextInput
              value={form[key]}
              onChangeText={v => setField(key, v)}
              style={inputStyle}
              multiline={['marketing_strategy','marketing_challenges'].includes(key)}
              keyboardType={key==='monthly_sales'?'numeric':'default'}
            />
          </View>
        ))}

        <Text style={styles.inputLabel}>{t(language, 'marketing_channels')}</Text>
        <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
          <Picker selectedValue={form.marketing_channels || ''} onValueChange={(v)=>setField('marketing_channels', v)}>
            <Picker.Item label={t(language, 'option_retail')} value="Retail" />
            <Picker.Item label={t(language, 'option_online')} value="Online" />
            <Picker.Item label={t(language, 'option_exhibition')} value="Exhibition" />
            <Picker.Item label={t(language, 'option_others')} value="Others" />
          </Picker>
        </View>
        {form.marketing_channels === 'Others' && (
          <TextInput placeholder="Specify" value={form.marketing_channels_other} onChangeText={v => setField('marketing_channels_other', v)} style={inputStyle} />
        )}
      </Section>

      <Section title={t(language, 'training_support')}>
        {['training_received','skills_acquired','future_training_requirements','financial_coordination','mentorship_support'].map(key => (
          <View key={key}>
            <Text style={styles.inputLabel}>{t(language, key)}</Text>
            <TextInput value={form[key]} onChangeText={v => setField(key, v)} style={inputStyle} multiline />
          </View>
        ))}

        <Text style={styles.inputLabel}>{t(language, 'institutional_support')}</Text>
        <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
          <Picker selectedValue={form.institutional_support || ''} onValueChange={(v)=>setField('institutional_support', v)}>
            <Picker.Item label={t(language, 'option_nrlm')} value="NRLM" />
            <Picker.Item label={t(language, 'option_srlm')} value="SRLM" />
            <Picker.Item label={t(language, 'option_others')} value="Others" />
          </Picker>
        </View>
        {form.institutional_support === 'Others' && (
          <TextInput placeholder="Specify" value={form.institutional_support_other} onChangeText={v => setField('institutional_support_other', v)} style={inputStyle} />
        )}

        <Text style={styles.inputLabel}>{t(language, 'market_linkage')}</Text>
        <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
          <Picker selectedValue={form.market_linkage || ''} onValueChange={(v)=>setField('market_linkage', v)}>
            <Picker.Item label={t(language, 'option_ondc')} value="ONDC" />
            <Picker.Item label={t(language, 'option_ecommerce')} value="E-commerce" />
            <Picker.Item label={t(language, 'option_exhibition')} value="Exhibition" />
            <Picker.Item label={t(language, 'option_others')} value="Others" />
          </Picker>
        </View>
        {form.market_linkage === 'Others' && (
          <TextInput placeholder="Specify" value={form.market_linkage_other} onChangeText={v => setField('market_linkage_other', v)} style={inputStyle} />
        )}

        <Text style={styles.inputLabel}>{t(language, 'expansion_plan')}</Text>
        <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
          <Picker selectedValue={form.expansion_plan || ''} onValueChange={(v)=>setField('expansion_plan', v)}>
            <Picker.Item label={t(language, 'option_new_product')} value="New Product" />
            <Picker.Item label={t(language, 'option_ecommerce_plan')} value="E-Commerce" />
            <Picker.Item label={t(language, 'option_employment')} value="Employment" />
            <Picker.Item label={t(language, 'option_others')} value="Others" />
          </Picker>
        </View>
        {form.expansion_plan === 'Others' && (
          <TextInput placeholder="Specify" value={form.expansion_plan_other} onChangeText={v => setField('expansion_plan_other', v)} style={inputStyle} />
        )}

        <Text style={styles.inputLabel}>{t(language, 'required_support')}</Text>
        <View style={{ borderWidth:1, borderColor:'#EE6969', borderRadius:6, marginBottom:12 }}>
          <Picker selectedValue={form.required_support || ''} onValueChange={(v)=>setField('required_support', v)}>
            <Picker.Item label={t(language, 'option_finance')} value="Finance" />
            <Picker.Item label={t(language, 'option_training')} value="Training" />
            <Picker.Item label={t(language, 'option_advertisement')} value="Advertisement" />
            <Picker.Item label={t(language, 'option_equipments')} value="Equipments" />
            <Picker.Item label={t(language, 'option_others')} value="Others" />
          </Picker>
        </View>
        {form.required_support === 'Others' && (
          <TextInput placeholder="Specify" value={form.required_support_other} onChangeText={v => setField('required_support_other', v)} style={inputStyle} />
        )}

      </Section>

      <Section title={t(language, 'docs_photos')}>
        {['photo_enterprise','photo_entrepreneur','photo_product'].map(key => (
          <View key={key}>
            <Text style={styles.inputLabel} >{t(language, key)}</Text>
            <View style={{ flexDirection:'row', marginBottom:8 }}>
              <TouchableOpacity style={styles.redButton} onPress={() => handlePickAndUpload(key)}>
                <Text style={styles.redButtonText}>{t(language, 'pick_photo')}</Text>
              </TouchableOpacity>
              <View style={{ width:8 }} />
              <TouchableOpacity style={styles.redButton} onPress={() => handleTakePhotoAndUpload(key)}>
                <Text style={styles.redButtonText}>{t(language, 'take_photo')}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => form[key] && openUrl(form[key])}>
              <Text numberOfLines={1} style={{ color:'#444', marginBottom:8 }}>{form[key] || t(language, 'no_file')}</Text>
            </TouchableOpacity>
          </View>
        ))}
        <Text>{t(language, 'certificate_docs')}</Text>
        <TextInput value={form.certificate_docs} onChangeText={v => setField('certificate_docs', v)} style={{ ...inputStyle }} multiline />
      </Section>

      <TouchableOpacity style={styles.redButton} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.redButtonText}>{record ? t(language, 'update_record') : t(language, 'submit_record')}</Text>
      </TouchableOpacity>

      {record && (
        <TouchableOpacity style={styles.redButton} onPress={handleDelete} disabled={loading}>
          <Text style={styles.redButtonText}>{t(language, 'delete_record')}</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 24 }} />

      {/* Burger Menu Modal */}
      <BurgerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} menuItems={menuItems} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    marginBottom: 16, 
    borderWidth: 1,
    borderColor: '#EE6969',
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: 12, 
    backgroundColor: '#fafafa',
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#EE6969',
  },
  inputLabel: {      
    fontWeight: '600',
    marginBottom: 6,
  },
  redButton: {
    backgroundColor: '#EE6969',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  redButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputStyle: {      
    borderWidth: 1,
    borderColor: '#EE6969',
    padding: 10,
    marginBottom: 18,  // increased bottom margin for bigger gap after input
    borderRadius: 6,
  },
});
