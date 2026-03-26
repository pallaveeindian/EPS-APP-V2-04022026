// src/screens/epsakhi/LoginFormProduction.jsx
import React, { useState, useContext, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { LanguageContext } from '../../components/LanguageContext';
import api from '../../api/gsApi';
import { Image } from 'react-native';

function randomCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { q: `${a} + ${b}`, ans: String(a + b) };
}

const translations = {
  en: {
    loginTitle: 'Login',
    username: 'Username',
    password: 'Password',
    role: 'Role',
    captcha: 'Captcha',
    enterUsername: 'Enter Username',
    enterPassword: 'Enter Password',
    enterCaptcha: 'Enter Answer',
    logIn: 'Log In',
    refresh: '↻',
    loginSuccess: 'Login successful!',
    usernameRequired: 'Please enter username.',
    passwordRequired: 'Please enter password.',
    captchaIncorrect: 'Incorrect captcha.',
  },
  hi: {
    loginTitle: 'लॉगिन',
    username: 'उपयोगकर्ता नाम',
    password: 'पासवर्ड',
    role: 'भूमिका',
    captcha: 'कैप्चा',
    enterUsername: 'उपयोगकर्ता नाम दर्ज करें',
    enterPassword: 'पासवर्ड दर्ज करें',
    enterCaptcha: 'उत्तर दर्ज करें',
    logIn: 'लॉग इन करें',
    refresh: '↻',
    loginSuccess: 'सफलतापूर्वक लॉगिन!',
    usernameRequired: 'कृपया उपयोगकर्ता नाम दर्ज करें।',
    passwordRequired: 'कृपया पासवर्ड दर्ज करें।',
    captchaIncorrect: 'कैप्चा गलत है।',
  },
};

const ROLE_MAP = {
  CRP: 6,
  Admin: 8,
};

export default function LoginFormProduction({
  onLogin,
  onSuccess,
  roles = ['CRP', 'Admin'],
  enableCaptcha = true,
  containerStyle = {},
  buttonColor = '#EE6969',
}) {
  const { language: lang } = useContext(LanguageContext);
  const t = useMemo(() => translations[lang] || translations.en, [lang]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(roles[0] || 'CRP');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const [captchaImage, setCaptchaImage] = useState(null);
  const [captchaInput, setCaptchaInput] = useState('');

  const validate = () => {
    const e = {};
    if (!username.trim()) e.username = t.usernameRequired;
    if (!password.trim()) e.password = t.passwordRequired;
    if (enableCaptcha && !captchaInput.trim()) {
      e.captcha = t.captchaIncorrect;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const loadCaptcha = async () => {
    try {
      const res = await api.getCaptcha();
      setCaptchaImage(res.image);
      setCaptchaInput('');
    } catch (e) {
      console.log('Captcha load failed', e);
    }
  };

  const refreshCaptcha = () => {
    setCaptcha(randomCaptcha());
    setCaptchaInput('');
    setErrors(prev => ({ ...prev, captcha: undefined }));
  };

  const handleSubmit = async () => {
    setSuccess('');
    setErrors({});

    if (!validate()) return;

    setLoading(true);
    try {
      let result = null;

      if (typeof onLogin === 'function') {
        result = await onLogin(
          username.trim(),
          password,
          selectedRole,
          captchaInput,
        );
      }

      if (!result || !result.success) {
        const msg = result?.message || 'Login failed';
        setErrors({ general: msg });
        if (msg.toLowerCase().includes('captcha')) {
          loadCaptcha();
        }

        return;
      }

      // 🔒 Prevent role mismatch
      const backendRoleId = Number(result.user?.role_id);
      const selectedRoleId = ROLE_MAP[selectedRole];

      if (backendRoleId !== selectedRoleId) {
        setErrors({
          general: `Please select Correct Role, You have selected : ${selectedRole}.`,
        });
        return;
      }

      const userPayload = {
        ...(result.user || {}),
        // normalise shape
        username: result.user?.username || username.trim(),
        role: result.user?.role_id,
        access: result.access || result.token || result.user?.access,
        refresh: result.refresh || result.user?.refresh,
      };

      setSuccess(t.loginSuccess);
      if (typeof onSuccess === 'function') {
        await onSuccess(userPayload);
      }
    } catch (err) {
      const msg =
        err?.data?.detail ||
        err?.data?.non_field_errors?.[0] ||
        err?.message ||
        'Unexpected error while logging in.';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.title}>{t.loginTitle}</Text>
      <View style={styles.titleUnderline} />
      {errors.general ? (
        <Text style={[styles.error, { marginBottom: 8 }]}>
          {errors.general}
        </Text>
      ) : null}

      {/* Username */}
      <Text style={styles.label}>{t.username}</Text>
      <TextInput
        // style={styles.input}
        style={[
          styles.input,
          focusedField === 'username' && { borderColor: '#FF7E00' },
        ]}
        placeholder={t.enterUsername}
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
        onFocus={() => setFocusedField('username')}
      />
      {errors.username && <Text style={styles.error}>{errors.username}</Text>}

      {/* Password */}
      <Text style={styles.label}>{t.password}</Text>
      <TextInput
        // style={styles.input}
        style={[
          styles.input,
          focusedField === 'password' && { borderColor: '#FF7E00' },
        ]}
        placeholder={t.enterPassword}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        onFocus={() => setFocusedField('password')}
      />
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      {/* Role selector */}
      <Text style={[styles.label, { marginTop: 8 }]}>{t.role}</Text>
      <View style={styles.roleRow}>
        {roles.map(r => {
          const selected = selectedRole === r;
          return (
            <TouchableOpacity
              key={r}
              style={[styles.roleButton, selected && styles.roleButtonSelected]}
              onPress={() => setSelectedRole(r)}
            >
              <Text
                style={selected ? styles.roleTextSelected : styles.roleText}
              >
                {r}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Captcha */}
      {enableCaptcha && (
        <View style={{ marginTop: 12 }}>
          <Text style={styles.label}>{t.captcha}</Text>
          <View style={styles.captchaRow}>
            {captchaImage ? (
              <Image
                source={{ uri: captchaImage }}
                style={{ width: 150, height: 50, borderRadius: 6 }}
                resizeMode="contain"
              />
            ) : null}

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadCaptcha}
            >
              <Text style={styles.refreshText}>{t.refresh}</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            // style={[styles.input, { marginTop: 8 }]}
            style={[
              styles.input,
              { marginTop: 8 },
              focusedField === 'captcha' && { borderColor: '#FF7E00' },
            ]}
            placeholder={t.enterCaptcha}
            value={captchaInput}
            onChangeText={setCaptchaInput}
            onFocus={() => setFocusedField('captcha')}
          />
          {errors.captcha && <Text style={styles.error}>{errors.captcha}</Text>}
        </View>
      )}

      {success ? <Text style={styles.successMsg}>{success}</Text> : null}

      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: buttonColor },
          loading && { opacity: 0.7 },
        ]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>{t.logIn}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { maxWidth: 400, width: '100%', alignSelf: 'center', padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#EE6969',
  },
  label: { fontSize: 14, color: '#FF7E00', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
    color: '#000',
    backgroundColor: '#fff',
  },
  error: { color: 'red', fontSize: 12, marginBottom: 6 },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  roleButtonSelected: { backgroundColor: '#EE6969', borderColor: '#EE6969' },
  roleText: { color: '#000' },
  roleTextSelected: { color: '#fff' },
  captchaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  refreshButton: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#F9ECEC',
    borderRadius: 6,
  },
  refreshText: { fontSize: 18, color: '#EE6969' },
  successMsg: { color: 'green', marginTop: 8, textAlign: 'center' },
  submitButton: {
    marginTop: 20,
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: { color: 'white', fontWeight: '600', fontSize: 16 },
  titleUnderline: {
    width: '100%',
    height: 2,
    backgroundColor: '#FF7E00',
    marginTop: 8,
    marginBottom: 16,
  },
});
