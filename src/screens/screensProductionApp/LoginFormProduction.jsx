// src/screens/epsakhi/LoginFormProduction.jsx
import React, { useState, useContext, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  // /PC-0426-2-A
  // imported dependencies  
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LanguageContext } from '../../components/LanguageContext';
import api from '../../api/gsApi';
import { Image } from 'react-native';

// PC-0426-2-A: Added AsyncStorage for "Remember Me" functionality
import AsyncStorage from '@react-native-async-storage/async-storage';

// PC-0426-2-B: Added SVG icons for password visibility toggle
import Svg, { Path } from 'react-native-svg';

// PC-0426-2-A: Storage key for login credentials
const STORAGE_KEY = 'LOGIN_CREDENTIALS';

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

// PC-0426-2-B: Eye icons for password visibility toggle
const EyeIcon = ({ size = 22, color = "#555" }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <Path
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
    />
    <Path
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </Svg>
);
// PC-0426-2-B: EyeSlashIcon for password visibility toggle
const EyeSlashIcon = ({ size = 22, color = "#555" }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <Path
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243"
    />
  </Svg>
);
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
  // PC-0426-2-B: State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  // PC-0426-2-A: State for "Remember Me" checkbox
  const [rememberMe, setRememberMe] = useState(false);


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

  // PC-0426-2-A: Load saved credentials from AsyncStorage on mount
  useEffect(() => {
    const loadSaved = async () => {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setUsername(parsed.username);
        setPassword(parsed.password);
        setRememberMe(true);
      }
    };
    loadSaved();
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
      // PC-0426-2-A: Save or remove credentials based on "Remember Me" state
      if (rememberMe) {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ username, password }),
        );
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }

      //  Prevent role mismatch
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
    // PC-0426-2-A: Wrapped in KeyboardAvoidingView and ScrollView for better keyboard handling on mobile
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* PC-0426-2-A: ScrollView for better keyboard handling on mobile */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
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
          <View style={{ position: 'relative' }}>
            <TextInput
              style={[
                styles.input,
                // Add padding to the right to prevent text overlap with the eye icon`
                { paddingRight: 40 },
                focusedField === 'password' && { borderColor: '#FF7E00' },
              ]}
              placeholder={t.enterPassword}
              secureTextEntry={!showPassword} // PC-0426-2-B: Toggle secure text entry based on showPassword state
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField('password')}
            />
            {/* PC-0426-2-B: Eye icons for password visibility toggle */}
            {/*  EYE ICON */}
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRememberMe(prev => !prev)}
          >
            <Text style={{ fontSize: 18 }}>
              {rememberMe ? '☑️' : '⬜'}
            </Text>
            <Text style={{ marginLeft: 8 }}>Remember Me</Text>
          </TouchableOpacity>
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
                {captchaImage && (
                  <Image
                    source={{ uri: captchaImage }}
                    style={{ width: 150, height: 50, borderRadius: 6 }}
                  />
                )}

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
      </ScrollView>
      {/* PC-0426-2-A: KeyboardAvoidingView for better keyboard handling on mobile */}
    </KeyboardAvoidingView>
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
  // PC-0426-2-B: Styles for eye icon
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },

  // PC-0426-2-A: Styles for "Remember Me" row
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
});
