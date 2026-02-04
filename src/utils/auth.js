// src/utils/auth.js
import AsyncStorage from '@react-native-async-storage/async-storage';
export const saveUser = async (user) => {
  await AsyncStorage.setItem('TH_USER', JSON.stringify(user));
};
export const getUser = async () => {
  const v = await AsyncStorage.getItem('TH_USER');
  return v ? JSON.parse(v) : null;
};
export const clearUser = async () => {
  await AsyncStorage.removeItem('TH_USER');
};
