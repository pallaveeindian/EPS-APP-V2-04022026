// src/utils/auth.js
import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'CRP#EP!@#260326@#11452';

export const saveUser = async user => {
  const json = JSON.stringify(user);

  const encrypted = CryptoJS.AES.encrypt(json, SECRET_KEY).toString();

  await AsyncStorage.setItem('TH_USER', encrypted);
};

export const getUser = async () => {
  try {
    const stored = await AsyncStorage.getItem('TH_USER');

    if (!stored || typeof stored !== 'string') return null;

    try {
      const bytes = CryptoJS.AES.decrypt(stored, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (decrypted && decrypted.length > 0) {
        return JSON.parse(decrypted);
      }
    } catch (e) {
      console.log('Decrypt failed', e);
    }

    // fallback
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.log('Fallback parse failed', e);
      return null;
    }
  } catch (e) {
    console.log('getUser crashed', e);
    return null;
  }
};

export const clearUser = async () => {
  await AsyncStorage.removeItem('TH_USER');
};
