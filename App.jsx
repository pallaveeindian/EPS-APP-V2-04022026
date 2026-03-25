// // App.jsx
// import React, { useEffect } from 'react';
// import { getUser } from './src/utils/auth';
// import { setAuthToken } from './src/api/gsApi';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import SplashScreen from './src/screens/screensProductionApp/SplashScreenProduction';
// import LoginScreen from './src/screens/screensProductionApp/LoginScreenProduction';
// import AdminDashboard from './src/screens/screensProductionApp/AdminDashboardProduction';

// import CRPDashboard from './src/screens/screensProductionApp/CRPDashboardProduction';
// import CRPRecordFlow from './src/screens/screensProductionApp/CRPRecordFlowProduction';
// import CRPViewRecorded from './src/screens/screensProductionApp/CRPViewRecordedProduction';
// import ExistingEnterpriseForm from './src/screens/screensProductionApp/ExistingEnterpriseForm';
// import NewEnterpriseForm from './src/screens/screensProductionApp/NewEnterpriseForm';
// import NoEnterpriseForm from './src/screens/screensProductionApp/NoEnterpriseForm';
// import { LanguageProvider } from './src/components/LanguageContext';
// import CRPDetail from './src/screens/screensProductionApp/AdminComponents/CRPDetail';
// import EPSDetail from './src/screens/screensProductionApp/CRPViewComponents/EPSDetails';

// const Stack = createNativeStackNavigator();

// export default function App() {
//   useEffect(() => {
//     const restoreSession = async () => {
//       const saved = await getUser();

//       if (saved?.access) {
//         setAuthToken(saved.access, saved.refresh);
//       }
//     };

//     restoreSession();
//   }, []);
//   return (
//     <LanguageProvider>
//       <NavigationContainer>
//         <Stack.Navigator
//           initialRouteName="SplashScreen"
//           screenOptions={{ headerShown: false }}
//         >
//           <Stack.Screen name="SplashScreen" component={SplashScreen} />
//           <Stack.Screen name="Login" component={LoginScreen} />
//           {/* CRP flow */}
//           <Stack.Screen name="CRPDashboard" component={CRPDashboard} />
//           <Stack.Screen name="CRPRecordFlow" component={CRPRecordFlow} />
//           <Stack.Screen name="CRPViewRecorded" component={CRPViewRecorded} />
//           <Stack.Screen
//             name="EPSDetail"
//             component={EPSDetail}
//             options={{ title: 'Beneficiary Details' }}
//           />
//           <Stack.Screen
//             name="ExistingEnterpriseForm"
//             component={ExistingEnterpriseForm}
//           />
//           <Stack.Screen
//             name="NewEnterpriseForm"
//             component={NewEnterpriseForm}
//           />
//           <Stack.Screen name="NoEnterpriseForm" component={NoEnterpriseForm} />
//           {/* Admin flow (existing hierarchy reused) */}
//           <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
//           <Stack.Screen name="CRPDetail" component={CRPDetail} />
//         </Stack.Navigator>
//       </NavigationContainer>
//     </LanguageProvider>
//   );
// }

// App.jsx
// import React, { useEffect, useState } from 'react';
// import { AppState, View } from 'react-native';

// import { getUser } from './src/utils/auth';
// import { setAuthToken } from './src/api/gsApi';

// import {
//   NavigationContainer,
//   createNavigationContainerRef,
// } from '@react-navigation/native';

// import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import SplashScreen from './src/screens/screensProductionApp/SplashScreenProduction';
// import LoginScreen from './src/screens/screensProductionApp/LoginScreenProduction';
// import AdminDashboard from './src/screens/screensProductionApp/AdminDashboardProduction';

// import CRPDashboard from './src/screens/screensProductionApp/CRPDashboardProduction';
// import CRPRecordFlow from './src/screens/screensProductionApp/CRPRecordFlowProduction';
// import CRPViewRecorded from './src/screens/screensProductionApp/CRPViewRecordedProduction';
// import ExistingEnterpriseForm from './src/screens/screensProductionApp/ExistingEnterpriseForm';
// import NewEnterpriseForm from './src/screens/screensProductionApp/NewEnterpriseForm';
// import NoEnterpriseForm from './src/screens/screensProductionApp/NoEnterpriseForm';

// import { LanguageProvider } from './src/components/LanguageContext';
// import CRPDetail from './src/screens/screensProductionApp/AdminComponents/CRPDetail';
// import EPSDetail from './src/screens/screensProductionApp/CRPViewComponents/EPSDetails';

// const Stack = createNativeStackNavigator();
// const navigationRef = createNavigationContainerRef();

// export default function App() {
//   const [isBackground, setIsBackground] = useState(false);

//   // ✅ Restore session
//   useEffect(() => {
//     const restoreSession = async () => {
//       const saved = await getUser();
//       if (saved?.access) {
//         setAuthToken(saved.access, saved.refresh);
//       }
//     };
//     restoreSession();
//   }, []);

//   // 🔥 CLEAN & CORRECT AppState handling
//   useEffect(() => {
//     const handleAppState = state => {
//       if (state === 'background' || state === 'inactive') {
//         console.log('🔒 App in background');

//         // ✅ ONLY show black overlay (no logout)
//         setIsBackground(true);
//       }

//       if (state === 'active') {
//         setIsBackground(false);
//       }
//     };

//     const sub = AppState.addEventListener('change', handleAppState);
//     return () => sub.remove();
//   }, []);

//   return (
//     <View style={{ flex: 1 }}>
//       <LanguageProvider>
//         <NavigationContainer ref={navigationRef}>
//           <Stack.Navigator
//             initialRouteName="SplashScreen"
//             screenOptions={{ headerShown: false }}
//           >
//             <Stack.Screen name="SplashScreen" component={SplashScreen} />
//             <Stack.Screen name="Login" component={LoginScreen} />

//             <Stack.Screen name="CRPDashboard" component={CRPDashboard} />
//             <Stack.Screen name="CRPRecordFlow" component={CRPRecordFlow} />
//             <Stack.Screen name="CRPViewRecorded" component={CRPViewRecorded} />
//             <Stack.Screen name="EPSDetail" component={EPSDetail} />
//             <Stack.Screen
//               name="ExistingEnterpriseForm"
//               component={ExistingEnterpriseForm}
//             />
//             <Stack.Screen
//               name="NewEnterpriseForm"
//               component={NewEnterpriseForm}
//             />
//             <Stack.Screen
//               name="NoEnterpriseForm"
//               component={NoEnterpriseForm}
//             />

//             <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
//             <Stack.Screen name="CRPDetail" component={CRPDetail} />
//           </Stack.Navigator>
//         </NavigationContainer>
//       </LanguageProvider>

//       {/* 🔒 BLACK SCREEN PROTECTION */}
//       {isBackground && (
//         <View
//           style={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             backgroundColor: 'black',
//             zIndex: 9999,
//             elevation: 9999,
//           }}
//         />
//       )}
//     </View>
//   );
// }

// App.jsx
import React, { useEffect, useState, useRef } from 'react';
import { AppState, View } from 'react-native';

import { getUser } from './src/utils/auth';
import { setAuthToken } from './src/api/gsApi';

import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';

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
const navigationRef = createNavigationContainerRef();
// VUN-15
//  SESSION TIMEOUT (5 min)
const SESSION_TIMEOUT = 5 * 60 * 1000;

export default function App() {
  // VUN-15
  const [isBackground, setIsBackground] = useState(false);
  const lastBackgroundTime = useRef(null);

  //  Restore session
  useEffect(() => {
    const restoreSession = async () => {
      const saved = await getUser();
      if (saved?.access) {
        setAuthToken(saved.access, saved.refresh);
      }
    };
    restoreSession();
  }, []);

  //  AppState handling with timeout (NO frequent logout)
  useEffect(() => {
    const handleAppState = state => {
      if (state === 'background' || state === 'inactive') {
        console.log(' App in background');

        setIsBackground(true);

        // store time
        lastBackgroundTime.current = Date.now();
      }

      if (state === 'active') {
        setIsBackground(false);

        const now = Date.now();

        //  logout ONLY if timeout exceeded
        if (
          lastBackgroundTime.current &&
          now - lastBackgroundTime.current > SESSION_TIMEOUT
        ) {
          console.log(' Session expired → redirect to login');

          navigationRef.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <LanguageProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator
            initialRouteName="SplashScreen"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="SplashScreen" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />

            <Stack.Screen name="CRPDashboard" component={CRPDashboard} />
            <Stack.Screen name="CRPRecordFlow" component={CRPRecordFlow} />
            <Stack.Screen name="CRPViewRecorded" component={CRPViewRecorded} />
            <Stack.Screen name="EPSDetail" component={EPSDetail} />

            <Stack.Screen
              name="ExistingEnterpriseForm"
              component={ExistingEnterpriseForm}
            />
            <Stack.Screen
              name="NewEnterpriseForm"
              component={NewEnterpriseForm}
            />
            <Stack.Screen
              name="NoEnterpriseForm"
              component={NoEnterpriseForm}
            />

            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen name="CRPDetail" component={CRPDetail} />
          </Stack.Navigator>
        </NavigationContainer>
      </LanguageProvider>

      {/* 🔒 BLACK SCREEN PROTECTION */}
      {isBackground && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'black',
            zIndex: 9999,
            elevation: 9999,
          }}
        />
      )}
    </View>
  );
}
