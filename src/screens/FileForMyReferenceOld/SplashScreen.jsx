import React, { useEffect } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SplashScreen(){
  const nav = useNavigation();
  useEffect(() => {
    const t = setTimeout(() => nav.replace('Login'), 5000);
    return () => clearTimeout(t);
  }, []);
  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
      <Image source={require('../../../assets/logo.png')} style={{ width:160, height:160, marginBottom:20 }} />
      <ActivityIndicator size="large" />
      <Text style={{ position:'absolute', bottom:20 }}>Powered by BDO's RN Engine</Text>
    </View>
  );
}
