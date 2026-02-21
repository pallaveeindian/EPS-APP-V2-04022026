import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import gsApi from '../../../../api/gsApi';
import { LanguageContext } from '../../../../components/LanguageContext';

export default function CRPInfo({ memberCode, refreshKey }) {
  const { language } = useContext(LanguageContext);
  const [loading, setLoading] = useState(true);
  const [crp, setCrp] = useState(null);
  const [updating, setUpdating] = useState(false);

  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
  });

  const [crpForm, setCrpForm] = useState({
    name: '',
    mobile_number: '',
    category: '',
    subcategory: '',
    lokos_shg_code: '',
    nodal_clf: '',
  });

  /* ------------------ Translations ------------------ */

  const translations = {
    en: {
      accountDetails: 'Account Details',
      username: 'Username',
      password: 'Password',
      enterNewPassword: 'Enter new password',
      updateAccount: 'Update Account',

      crpDetails: 'CRP Details',
      name: 'Name',
      mobile: 'Mobile',
      category: 'Category',
      subcategory: 'Subcategory',
      shgCode: 'SHG Code',
      nodalClf: 'Nodal CLF',
      updateCrp: 'Update CRP',

      validationError: 'Validation Error',
      successTitle: 'Success',
      successMsg: 'Account updated successfully.',
      crpSuccessMsg: 'CRP updated successfully.',
      errorTitle: 'Error',
      saveErrorMsg: 'Failed to save changes.',
      crpErrorMsg: 'Failed to update CRP',
      updatingPleaseWait: 'Updating, please wait...',

      usernameValidation:
        'Username must be 10–20 characters. Allowed: a-z A-Z 0-9 _@#$%!^&* (No spaces)',
      passwordValidation:
        'Password must be 8–12 chars, include uppercase, lowercase, number & special character. No spaces allowed.',
      nameValidation: 'Name must contain only letters and single spaces',
      mobileValidation: 'Mobile number must be exactly 10 digits',
      categoryValidation: 'Category must contain only letters and spaces',
      subcategoryValidation: 'Subcategory must contain only letters and spaces',
      shgValidation: 'SHG Code must contain digits only',
      nodalValidation: 'Nodal CLF must contain digits only',
    },

    hi: {
      accountDetails: 'खाता विवरण',
      username: 'उपयोगकर्ता नाम',
      password: 'पासवर्ड',
      enterNewPassword: 'नया पासवर्ड दर्ज करें',
      updateAccount: 'खाता अपडेट करें',

      crpDetails: 'सीआरपी विवरण',
      name: 'नाम',
      mobile: 'मोबाइल',
      category: 'श्रेणी',
      subcategory: 'उपश्रेणी',
      shgCode: 'एसएचजी कोड',
      nodalClf: 'नोडल सीएलएफ',
      updateCrp: 'सीआरपी अपडेट करें',

      validationError: 'मान्यता त्रुटि',
      successTitle: 'सफलता',
      successMsg: 'खाता सफलतापूर्वक अपडेट किया गया।',
      crpSuccessMsg: 'सीआरपी सफलतापूर्वक अपडेट किया गया।',
      errorTitle: 'त्रुटि',
      saveErrorMsg: 'परिवर्तन सहेजने में विफल।',
      crpErrorMsg: 'सीआरपी अपडेट करने में विफल',
      updatingPleaseWait: 'अपडेट किया जा रहा है, कृपया प्रतीक्षा करें...',

      usernameValidation:
        'उपयोगकर्ता नाम 10–20 अक्षरों का होना चाहिए। केवल a-z A-Z 0-9 _@#$%!^&* (कोई स्पेस नहीं)',
      passwordValidation:
        'पासवर्ड 8–12 अक्षरों का हो, जिसमें बड़े अक्षर, छोटे अक्षर, अंक और विशेष चिन्ह शामिल हों।',
      nameValidation: 'नाम में केवल अक्षर और एकल स्पेस होना चाहिए',
      mobileValidation: 'मोबाइल नंबर ठीक 10 अंकों का होना चाहिए',
      categoryValidation: 'श्रेणी में केवल अक्षर और स्पेस होना चाहिए',
      subcategoryValidation: 'उपश्रेणी में केवल अक्षर और स्पेस होना चाहिए',
      shgValidation: 'एसएचजी कोड में केवल अंक होने चाहिए',
      nodalValidation: 'नोडल सीएलएफ में केवल अंक होने चाहिए',
    },
  };

  const t = translations[language] || translations.en;
  const translate = key => t[key] || translations.en[key] || key;

  const usernameRegex = /^[A-Za-z0-9_@#$%!^&*]{10,20}$/;
  const lettersWithSpaceRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
  const mobileRegex = /^\d{10}$/;
  const digitsOnlyRegex = /^\d+$/;

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,12}$/;

  function validateUserForm({ username, password }) {
    const errors = {};

    if (!usernameRegex.test(username)) {
      errors.username = translate('usernameValidation');
    }

    if (password && !passwordRegex.test(password)) {
      errors.password = translate('passwordValidation');
    }

    return errors;
  }

  function validateCrpForm(form) {
    const errors = {};

    if (!lettersWithSpaceRegex.test(form.name.trim())) {
      errors.name = translate('nameValidation');
    }

    if (!mobileRegex.test(form.mobile_number)) {
      errors.mobile_number = translate('mobileValidation');
    }

    if (!lettersWithSpaceRegex.test(form.category.trim())) {
      errors.category = translate('categoryValidation');
    }

    if (!lettersWithSpaceRegex.test(form.subcategory.trim())) {
      errors.subcategory = translate('subcategoryValidation');
    }

    if (!digitsOnlyRegex.test(form.lokos_shg_code)) {
      errors.lokos_shg_code = translate('shgValidation');
    }

    if (!digitsOnlyRegex.test(form.nodal_clf)) {
      errors.nodal_clf = translate('nodalValidation');
    }

    return errors;
  }

  /* ================= Fetch Detail ================= */

  const fetchDetail = async () => {
    try {
      setLoading(true);

      const res = await gsApi.getCrpDetailByMember(memberCode);
      setCrp(res);

      // Prefill account
      if (res.master_user) {
        setUserForm({
          username: res.master_user.username || '',
          password: '',
        });
      }

      // Prefill CRP
      setCrpForm({
        name: res.name || '',
        mobile_number: res.mobile_number || '',
        category: res.category || '',
        subcategory: res.subcategory || '',
        lokos_shg_code: res.lokos_shg_code || '',
        nodal_clf: String(res.nodal_clf || ''),
      });
    } catch (err) {
      console.error('CRP fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [refreshKey]);

  /* ================= Update Account ================= */

  const handleUpdateAccount = async () => {
    const errors = validateUserForm(userForm);

    if (Object.keys(errors).length > 0) {
      Alert.alert(translate('validationError'), Object.values(errors)[0]);
      return;
    }

    try {
      setUpdating(true);

      const payload = { username: userForm.username };

      if (userForm.password) {
        payload.password = userForm.password;
      }

      payload.updated_by = 1004;

      await gsApi.updateUser(crp.master_user.id, payload);

      Alert.alert(translate('successTitle'), translate('successMsg'));
    } catch (err) {
      Alert.alert(
        translate('errorTitle'),
        err?.data?.detail || translate('saveErrorMsg'),
      );
    } finally {
      setUpdating(false);
    }
  };

  /* ================= Update CRP ================= */

  const handleUpdateCRP = async () => {
    const errors = validateCrpForm(crpForm);

    if (Object.keys(errors).length > 0) {
      Alert.alert('Validation Error', Object.values(errors)[0]);
      return;
    }

    try {
      setUpdating(true);

      const payload = {
        ...crpForm,
        updated_by: 1004,
      };

      await gsApi.updateCrp(crp.id, payload);

      Alert.alert(translate('successTitle'), translate('crpSuccessMsg'));
    } catch (err) {
      Alert.alert(translate('errorTitle'), translate('crpErrorMsg'));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#EE6969" />;
  }

  return (
    <View>
      {/* -------- ACCOUNT SECTION -------- */}
      <Text style={styles.subHeading}>{translate('accountDetails')}</Text>

      <Label>{translate('username')}</Label>
      <Input
        value={userForm.username}
        onChangeText={t => setUserForm(p => ({ ...p, username: t }))}
      />

      <Label>{translate('password')}</Label>
      <Input
        secureTextEntry
        placeholder={translate('enterNewPassword')}
        value={userForm.password}
        onChangeText={t => setUserForm(p => ({ ...p, password: t }))}
      />

      <TouchableOpacity
        style={[styles.button, updating && { opacity: 0.6 }]}
        onPress={handleUpdateAccount}
        disabled={updating}
      >
        <Text style={styles.buttonText}>{translate('updateAccount')}</Text>
      </TouchableOpacity>

      {/* -------- CRP DETAILS SECTION -------- */}
      <Text style={[styles.subHeading, { marginTop: 24 }]}>
        {translate('crpDetails')}
      </Text>

      <Label>{translate('name')}</Label>
      <Input
        value={crpForm.name}
        onChangeText={t => setCrpForm(p => ({ ...p, name: t }))}
      />

      <Label>{translate('mobile')}</Label>
      <Input
        value={crpForm.mobile_number}
        onChangeText={t => setCrpForm(p => ({ ...p, mobile_number: t }))}
      />

      <Label>{translate('category')}</Label>
      <Input
        value={crpForm.category}
        onChangeText={t => setCrpForm(p => ({ ...p, category: t }))}
      />

      <Label>{translate('subcategory')}</Label>
      <Input
        value={crpForm.subcategory}
        onChangeText={t => setCrpForm(p => ({ ...p, subcategory: t }))}
      />

      <Label>{translate('shgCode')}</Label>
      <Input
        value={crpForm.lokos_shg_code}
        onChangeText={t => setCrpForm(p => ({ ...p, lokos_shg_code: t }))}
      />

      <Label>{translate('nodalClf')}</Label>
      <Input
        value={crpForm.nodal_clf}
        onChangeText={t => setCrpForm(p => ({ ...p, nodal_clf: t }))}
      />

      <TouchableOpacity
        style={[styles.button, updating && { opacity: 0.6 }]}
        onPress={handleUpdateCRP}
        disabled={updating}
      >
        <Text style={styles.buttonText}>{translate('updateCrp')}</Text>
      </TouchableOpacity>

      <Modal transparent visible={updating} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ActivityIndicator size="large" color="#EE6969" />
            <Text style={{ marginTop: 12, fontWeight: '600' }}>
              {translate('updatingPleaseWait')}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ================= Helpers ================= */

function Label({ children }) {
  return <Text style={styles.label}>{children}</Text>;
}

function Input(props) {
  return <TextInput style={styles.input} {...props} />;
}

/* ================= Styles ================= */

const styles = StyleSheet.create({
  subHeading: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  label: {
    fontWeight: '600',
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#EE6969',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
  },
});
