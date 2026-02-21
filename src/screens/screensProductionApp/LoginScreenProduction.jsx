// src/screens/epsakhi/LoginScreenProduction.jsx
import React, { useContext, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import LoginForm from './LoginFormProduction';
import { saveUser } from '../../utils/auth';
import LanguageToggle from '../../components/LanguageToggle';
import { LanguageContext } from '../../components/LanguageContext';
import gsApi, { setAuthToken } from '../../api/gsApi';

export default function LoginScreenProduction({ navigation }) {
  const { language } = useContext(LanguageContext);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (username, password, role) => {
    setLoading(true);
    try {
      const res = await gsApi.login(username, password);
      if (!res || !res.access || !res.user) {
        return {
          success: false,
          message: 'Invalid response from server. Please try again.',
        };
      }
      return {
        success: true,
        message: 'Login successful',
        access: res.access,
        refresh: res.refresh,
        user: res.user,
      };
    } catch (err) {
      const msg =
        err?.data?.detail ||
        err?.data?.non_field_errors?.[0] ||
        err?.message ||
        'Login failed. Please check your credentials.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = async userPayload => {
    // Persist + prime auth header (access + refresh)
    if (userPayload.access) {
      setAuthToken(userPayload.access, userPayload.refresh);
    }
    await saveUser(userPayload);

    const roleId = Number(userPayload.user?.role);

    if (roleId === 6) {
      navigation.replace('CRPDashboard');
    } else if (roleId === 8) {
      navigation.replace('AdminDashboard');
    } else {
      Alert.alert('Error', 'Unknown role. Please contact admin.');
    }
  };

  return (
    <View style={styles.container}>
      <LanguageToggle style={{ marginBottom: 20 }} />
      <LoginForm
        enableCaptcha={true}
        roles={['CRP', 'Admin']}
        onLogin={handleLogin}
        onSuccess={handleSuccess}
        language={language}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    paddingHorizontal: 16,
    flex: 1,
    backgroundColor: '#fff',
  },
});
