// src/screens/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import gsApi from '../api/gsApi';
import { clearUser } from '../../utils/auth';

export default function AdminDashboard({ navigation }) {
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await gsApi.analyticsByDistrict();
      if (Array.isArray(res)) setDistricts(res);
      else setDistricts([]);
    })();
  }, []);

  const logout = async () => { await clearUser(); navigation.replace('Login'); };

  return (
    <ScrollView style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:20 }}>Admin Dashboard</Text>

      <Text style={{ marginTop:12, fontWeight:'bold' }}>Districts</Text>
      {districts.map(d => (
        <View key={d.id} style={{ padding:8, borderBottomWidth:1, borderColor:'#eee' }}>
          <Text>{d.name} — Recorded: {d.recorded_count}</Text>
          <Button title="View" onPress={() => navigation.navigate('SelectGP', { adminDistrictId: d.id })} />
        </View>
      ))}

      <View style={{ marginTop: 12 }}>
        <Button title="Logout" onPress={logout} color='red' />
      </View>
    </ScrollView>
  );
}
