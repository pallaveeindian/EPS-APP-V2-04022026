// App.jsx
import React, { useEffect } from 'react';
import { getUser } from './src/utils/auth';
import { setAuthToken } from './src/api/gsApi';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './src/screens/screensProductionApp/SplashScreenProduction';
import LoginScreen from './src/screens/screensProductionApp/LoginScreenProduction';
import AdminDashboard from './src/screens/screensProductionApp/AdminDashboardProduction';

import CRPDashboard from './src/screens/screensProductionApp/CRPDashboardProduction';
import CRPRecordFlow from './src/screens/screensProductionApp/CRPRecordFlowProduction';
import CRPViewRecorded from './src/screens/screensProductionApp/CRPViewRecordedProduction';
import ExistingEnterpriseForm from './src/screens/screensProductionApp/ExistingEnterpriseForm';
import NewEnterpriseForm from './src/screens/screensProductionApp/NewEnterpriseForm';
import NoEnterpriseForm from './src/screens/screensProductionApp/NoEnterpriseForm';
import { LanguageProvider } from './src/components/LanguageContext';
import CRPDetail from './src/screens/screensProductionApp/AdminComponents/CRPDetail';
import EPSDetail from './src/screens/screensProductionApp/CRPViewComponents/EPSDetails';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    const restoreSession = async () => {
      const saved = await getUser();

      if (saved?.access) {
        setAuthToken(saved.access, saved.refresh);
      }
    };

    restoreSession();
  }, []);
  return (
    <LanguageProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="SplashScreen"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          {/* CRP flow */}
          <Stack.Screen name="CRPDashboard" component={CRPDashboard} />
          <Stack.Screen name="CRPRecordFlow" component={CRPRecordFlow} />
          <Stack.Screen name="CRPViewRecorded" component={CRPViewRecorded} />
          <Stack.Screen
            name="EPSDetail"
            component={EPSDetail}
            options={{ title: 'Beneficiary Details' }}
          />
          <Stack.Screen
            name="ExistingEnterpriseForm"
            component={ExistingEnterpriseForm}
          />
          <Stack.Screen
            name="NewEnterpriseForm"
            component={NewEnterpriseForm}
          />
          <Stack.Screen name="NoEnterpriseForm" component={NoEnterpriseForm} />
          {/* Admin flow (existing hierarchy reused) */}
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          <Stack.Screen name="CRPDetail" component={CRPDetail} />
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageProvider>
  );
}
