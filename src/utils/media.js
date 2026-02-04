// src/utils/media.js
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import gsApi from '../api/gsApi';

export async function requestCameraPermission() {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    { title: 'Camera permission', message: 'App needs access to camera to take photos' }
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export async function pickImageFromLibrary() {
  return new Promise((resolve, reject) => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: false }, (response) => {
      if (response.didCancel) return resolve(null);
      if (response.errorCode) return reject(response.errorMessage || response.errorCode);
      const asset = response.assets && response.assets[0];
      resolve(asset || null);
    });
  });
}

export async function takePhoto() {
  const ok = await requestCameraPermission();
  if (!ok) { Alert.alert('Permission required', 'Camera permission denied'); return null; }
  return new Promise((resolve, reject) => {
    launchCamera({ mediaType: 'photo', includeBase64: false }, (response) => {
      if (response.didCancel) return resolve(null);
      if (response.errorCode) return reject(response.errorMessage || response.errorCode);
      const asset = response.assets && response.assets[0];
      resolve(asset || null);
    });
  });
}

export async function uriToBase64(uri) {
  if (!uri) return null;
  let path = uri;
  try {
    if (path.startsWith('file://')) path = path.replace('file://', '');
    const b64 = await RNFS.readFile(path, 'base64');
    return b64;
  } catch (err) {
    console.warn('uriToBase64 error', err);
    throw err;
  }
}

export async function uploadAssetsToDrive(assets, folderId) {
  const filesPayload = [];
  for (const a of assets) {
    const base64 = await uriToBase64(a.uri);
    filesPayload.push({
      filename: a.fileName || `img_${Date.now()}.jpg`,
      mimeType: a.type || 'image/jpeg',
      dataBase64: base64
    });
  }
  const res = await gsApi.uploadMedia(filesPayload, folderId);
  return res;
}
