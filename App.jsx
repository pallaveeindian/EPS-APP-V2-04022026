// // PRODUCTION App.jsx
// import React, { useEffect, useState, useRef } from 'react';
// import { AppState, View, Alert, BackHandler } from 'react-native';
// import DeviceInfo from 'react-native-device-info';
// import 'react-native-get-random-values';
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
// // VUN-15
// //  SESSION TIMEOUT (5 min)
// const SESSION_TIMEOUT = 5 * 60 * 1000;

// export default function App() {
//   // VUN-15
//   const [isBackground, setIsBackground] = useState(false);
//   const lastBackgroundTime = useRef(null);

//   useEffect(() => {
//     console.log('APP MOUNTED');
//   }, []);

//   //  Restore session
//   useEffect(() => {
//     const restoreSession = async () => {
//       try {
//         const saved = await getUser();
//         if (saved?.access) {
//           setAuthToken(saved.access, saved.refresh);
//         }
//       } catch (e) {
//         console.log('restoreSession failed', e);
//       }
//     };

//     restoreSession();
//   }, []);

//   // VUN - 16: ROOT / EMULATOR DETECTION (AUDIT FIX)
//   useEffect(() => {
//     const checkSecurity = async () => {
//       try {
//         const isRooted = DeviceInfo.isRooted();

//         if (isRooted) {
//           Alert.alert(
//             'Security Alert',
//             'This device is not secure (rooted). App will exit.',
//             [
//               {
//                 text: 'Exit',
//                 onPress: () => BackHandler.exitApp(),
//               },
//             ],
//             { cancelable: false },
//           );
//         }
//       } catch (e) {
//         console.log('Security check failed', e);
//       }
//     };

//     checkSecurity();
//   }, []);

//   //  AppState handling with timeout (NO frequent logout)
//   useEffect(() => {
//     const handleAppState = state => {
//       console.log('AppState:', state);

//       if (state === 'background') {
//         setIsBackground(true);
//         lastBackgroundTime.current = Date.now();
//       }

//       if (state === 'active') {
//         setIsBackground(false);

//         const now = Date.now();

//         if (
//           lastBackgroundTime.current &&
//           now - lastBackgroundTime.current > SESSION_TIMEOUT
//         ) {
//           navigationRef.reset({
//             index: 0,
//             routes: [{ name: 'Login' }],
//           });
//         }
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

// DEV App.jsx
import React, { useEffect, useState, useRef } from 'react';
import { AppState, View, Alert, BackHandler } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import 'react-native-get-random-values';
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
const SESSION_TIMEOUT = 5 * 60 * 1000;

export default function App() {
  const [isBackground, setIsBackground] = useState(false);
  const lastBackgroundTime = useRef(null);

  useEffect(() => {
    console.log('APP MOUNTED');
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const saved = await getUser();
        if (saved?.access) {
          setAuthToken(saved.access, saved.refresh);
        }
      } catch (e) {
        console.log('restoreSession failed', e);
      }
    };
    restoreSession();
  }, []);

  // VUN - 16: ROOT / EMULATOR DETECTION (SURGICAL BYPASS FOR DEV)
  useEffect(() => {
    if (__DEV__) return;

    const checkSecurity = async () => {
      try {
        const isRooted = await DeviceInfo.isRooted();
        if (isRooted) {
          Alert.alert(
            'Security Alert',
            'This device is not secure (rooted). App will exit.',
            [{ text: 'Exit', onPress: () => BackHandler.exitApp() }],
            { cancelable: false },
          );
        }
      } catch (e) {
        console.log('Security check failed', e);
      }
    };
    checkSecurity();
  }, []);

  useEffect(() => {
    const handleAppState = state => {
      if (state === 'background') {
        setIsBackground(true);
        lastBackgroundTime.current = Date.now();
      }

      if (state === 'active') {
        setIsBackground(false);
        const now = Date.now();
        if (
          lastBackgroundTime.current &&
          now - lastBackgroundTime.current > SESSION_TIMEOUT
        ) {
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

      {/* 🔒 BLACK SCREEN PROTECTION (DISABLED IN DEV) */}
      {!__DEV__ && isBackground && (
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
