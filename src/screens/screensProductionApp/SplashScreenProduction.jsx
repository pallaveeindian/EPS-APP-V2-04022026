// // import React, { useEffect } from 'react';
// // import { View, Text, Image, ActivityIndicator } from 'react-native';
// // import { useNavigation } from '@react-navigation/native';
// // import { getUser } from '../../utils/auth';
// // import gsApi, { setAuthToken } from '../../api/gsApi';
// // import { clearAllTemp } from '../../utils/tempStore';

// // export default function SplashScreenProduction() {
// //   const nav = useNavigation();

// //   useEffect(() => {
// //     let active = true;

// //     const init = async () => {
// //       try {
// //         // Clear any stale temp state on app start
// //         clearAllTemp();

// //         const user = await getUser();
// //         if (!active) return;

// //         if (user && user.access) {
// //           setAuthToken(user.access);
// //           const role = String(user.role || '').toLowerCase();
// //           if (role === 'crp') {
// //             nav.replace('CRPDashboard');
// //             return;
// //           }
// //           if (role === 'admin') {
// //             nav.replace('AdminDashboard');
// //             return;
// //           }
// //         }
// //         nav.replace('Login');
// //       } catch (err) {
// //         nav.replace('Login');
// //       }
// //     };

// //     init();

// //     return () => {
// //       active = false;
// //     };
// //   }, [nav]);

// //   return (
// //     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
// //       <Image
// //         source={require('../../../assets/logo.png')}
// //         style={{ width: 160, height: 160, marginBottom: 20 }}
// //       />
// //       <ActivityIndicator size="large" />
// //       <Text style={{ position: 'absolute', bottom: 20 }}>
// //         Powered by BDO&apos;s RN Engine
// //       </Text>
// //     </View>
// //   );
// // }


// import React, { useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   Animated,
//   Easing,
//   StyleSheet,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { getUser } from '../../utils/auth';
// import gsApi, { setAuthToken } from '../../api/gsApi';
// import { clearAllTemp } from '../../utils/tempStore';

// export default function SplashScreenProduction() {
//   const nav = useNavigation();

//   // Animation values
//   const lineProgress = useRef(new Animated.Value(0)).current;
//   const upTranslateY = useRef(new Animated.Value(0)).current;
//   const prernaTranslateY = useRef(new Animated.Value(0)).current;
//   const erpOpacity = useRef(new Animated.Value(0)).current;
//   const erpScale = useRef(new Animated.Value(0.8)).current;

//   useEffect(() => {
//     let active = true;
//     let timeoutId = null;

//     const runAnimation = () => {
//       Animated.sequence([
//         // 1. Line grows from center (0% -> 80%)
//         Animated.timing(lineProgress, {
//           toValue: 1,
//           duration: 700,
//           easing: Easing.out(Easing.quad),
//           useNativeDriver: false, // width cannot use native driver[web:3]
//         }),
//         // 2. Small pulse on line
//         Animated.timing(lineProgress, {
//           toValue: 0.9,
//           duration: 150,
//           useNativeDriver: false,
//         }),
//         Animated.timing(lineProgress, {
//           toValue: 1,
//           duration: 150,
//           useNativeDriver: false,
//         }),
//         // 3. UP logo moves slightly down, Prerna slightly up
//         Animated.parallel([
//           Animated.timing(upTranslateY, {
//             toValue: 25,
//             duration: 500,
//             easing: Easing.out(Easing.quad),
//             useNativeDriver: true,
//           }),
//           Animated.timing(prernaTranslateY, {
//             toValue: -25,
//             duration: 500,
//             easing: Easing.out(Easing.quad),
//             useNativeDriver: true,
//           }),
//         ]),
//         // 4. ERP Sakhi fades and scales in
//         Animated.parallel([
//           Animated.timing(erpOpacity, {
//             toValue: 1,
//             duration: 400,
//             useNativeDriver: true,
//           }),
//           Animated.spring(erpScale, {
//             toValue: 1,
//             friction: 5,
//             useNativeDriver: true,
//           }),
//         ]),
//       ]).start();
//     };

//     const init = async () => {
//       try {
//         clearAllTemp();
//         runAnimation();

//         const user = await getUser();
//         if (!active) return;

//         // Force 4s visible splash before navigation
//         timeoutId = setTimeout(() => {
//           if (!active) return;

//           if (user && user.access) {
//             setAuthToken(user.access);
//             const role = String(user.role || '').toLowerCase();
//             if (role === 'crp') {
//               nav.replace('CRPDashboard');
//               return;
//             }
//             if (role === 'admin') {
//               nav.replace('AdminDashboard');
//               return;
//             }
//           }

//           nav.replace('Login');
//         }, 4000);
//       } catch (err) {
//         timeoutId = setTimeout(() => {
//           if (!active) return;
//           nav.replace('Login');
//         }, 4000);
//       }
//     };

//     init();

//     return () => {
//       active = false;
//       if (timeoutId) {
//         clearTimeout(timeoutId); // clear timeout on unmount[web:76]
//       }
//     };
//   }, [nav, lineProgress, upTranslateY, prernaTranslateY, erpOpacity, erpScale]);

//   // Interpolate line width from 0% to 80%
//   const lineStyle = {
//     width: lineProgress.interpolate({
//       inputRange: [0, 1],
//       outputRange: ['0%', '80%'],
//     }),
//     height: 2,
//     backgroundColor: 'black',
//     marginVertical: 12,
//   };

//   return (
//     <View style={styles.container}>
//       {/* UP Govt logo (top) and Prerna (bottom) with animated line */}
//       <Animated.View style={styles.centerBlock}>
//         <Animated.Image
//           source={require('../../../assets/Up_govt_logo.jpg')}
//           style={[
//             styles.smallLogo,
//             { transform: [{ translateY: upTranslateY }] },
//           ]}
//           resizeMode="contain"
//         />

//         <Animated.View style={lineStyle} />

//         <Animated.Image
//           source={require('../../../assets/prerna_logo.jpg')}
//           style={[
//             styles.smallLogo,
//             { transform: [{ translateY: prernaTranslateY }] },
//           ]}
//           resizeMode="contain"
//         />
//       </Animated.View>

//       {/* ERP Sakhi logo shown after line + movement */}
//       <Animated.Image
//         source={require('../../../assets/logo.png')}
//         style={[
//           styles.erpLogo,
//           {
//             opacity: erpOpacity,
//             transform: [{ scale: erpScale }],
//           },
//         ]}
//         resizeMode="contain"
//       />

//       <ActivityIndicator size="large" style={{ marginTop: 30 }} />
//       <Text style={styles.footerText}>Powered by BDO&apos;s RN Engine</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   centerBlock: {
//     alignItems: 'center',
//   },
//   smallLogo: {
//     width: 90,
//     height: 90,
//   },
//   erpLogo: {
//     width: 130,
//     height: 130,
//     marginTop: 40,
//   },
//   footerText: {
//     position: 'absolute',
//     bottom: 20,
//   },
// });



// import React, { useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   Animated,
//   Easing,
//   StyleSheet,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { getUser } from '../../utils/auth';
// import gsApi, { setAuthToken } from '../../api/gsApi';
// import { clearAllTemp } from '../../utils/tempStore';

// export default function SplashScreenProduction() {
//   const nav = useNavigation();

//   // Animation values
//   const lineProgress = useRef(new Animated.Value(0)).current;
//   const upTranslateY = useRef(new Animated.Value(0)).current;
//   const prernaTranslateY = useRef(new Animated.Value(0)).current;
//   const erpOpacity = useRef(new Animated.Value(0)).current;
//   const erpScale = useRef(new Animated.Value(0.8)).current;

//   useEffect(() => {
//     let active = true;
//     let timeoutId = null;

//     // Run full animation, return a Promise that resolves when finished
//     const runAnimation = () =>
//       new Promise(resolve => {
//         Animated.sequence([
//           // 1. Thick black line grows from center (0% -> 80%)
//           Animated.timing(lineProgress, {
//             toValue: 1,
//             duration: 800,
//             easing: Easing.out(Easing.quad),
//             useNativeDriver: false, // width cannot use native driver[web:4]
//           }),

//           // 2. Logos move AWAY from each other in parallel
//           Animated.parallel([
//             Animated.timing(upTranslateY, {
//               toValue: -30, // UP govt logo goes UP
//               duration: 500,
//               easing: Easing.out(Easing.quad),
//               useNativeDriver: true,
//             }),
//             Animated.timing(prernaTranslateY, {
//               toValue: 30, // Prerna logo goes DOWN
//               duration: 500,
//               easing: Easing.out(Easing.quad),
//               useNativeDriver: true,
//             }),
//           ]),

//           // 3. ERP Sakhi fades and scales in
//           Animated.parallel([
//             Animated.timing(erpOpacity, {
//               toValue: 1,
//               duration: 400,
//               useNativeDriver: true,
//             }),
//             Animated.spring(erpScale, {
//               toValue: 1,
//               friction: 5,
//               useNativeDriver: true,
//             }),
//           ]),
//         ]).start(() => {
//           resolve();
//         });
//       });

//     const init = async () => {
//       try {
//         clearAllTemp();

//         const user = await getUser();
//         if (!active) return;

//         // 1) Play full animation first (two logos + line, then logo.png)
//         await runAnimation();
//         if (!active) return;

//         // 2) Keep final state visible for 4 seconds
//         timeoutId = setTimeout(() => {
//           if (!active) return;

//           if (user && user.access) {
//             setAuthToken(user.access);
//             const role = String(user.role || '').toLowerCase();
//             if (role === 'crp') {
//               nav.replace('CRPDashboard');
//               return;
//             }
//             if (role === 'admin') {
//               nav.replace('AdminDashboard');
//               return;
//             }
//           }

//           nav.replace('Login');
//         }, 4000);
//       } catch (err) {
//         // On error, still run animation then wait 4s before going to Login
//         await runAnimation();
//         if (!active) return;
//         timeoutId = setTimeout(() => {
//           if (!active) return;
//           nav.replace('Login');
//         }, 4000);
//       }
//     };

//     init();

//     return () => {
//       active = false;
//       if (timeoutId) {
//         clearTimeout(timeoutId); // cleanup timeout when unmounting[web:76]
//       }
//     };
//   }, [nav, lineProgress, upTranslateY, prernaTranslateY, erpOpacity, erpScale]);

//   // Thick black line between logos
//   const lineStyle = {
//     width: lineProgress.interpolate({
//       inputRange: [0, 1],
//       outputRange: ['0%', '80%'],
//     }),
//     height: 4, // thicker line
//     backgroundColor: 'black',
//     marginVertical: 12,
//   };

//   return (
//     <View style={styles.container}>
//       {/* UP Govt logo and Prerna logo with animated line */}
//       <Animated.View style={styles.centerBlock}>
//         <Animated.Image
//           source={require('../../../assets/Up_govt_logo.png')}
//           style={[
//             styles.logo, // same size as logo.png
//             { transform: [{ translateY: upTranslateY }] },
//           ]}
//           resizeMode="contain"
//         />

//         <Animated.View style={lineStyle} />

//         <Animated.Image
//           source={require('../../../assets/prerna_logo.png')}
//           style={[
//             styles.logo, // same size as logo.png
//             { transform: [{ translateY: prernaTranslateY }] },
//           ]}
//           resizeMode="contain"
//         />
//       </Animated.View>

//       {/* ERP Sakhi logo shown after line + movement */}
//       <Animated.Image
//         source={require('../../../assets/logo.png')}
//         style={[
//           styles.logo, // same size as the two logos above
//           {
//             opacity: erpOpacity,
//             transform: [{ scale: erpScale }],
//             marginTop: 40,
//           },
//         ]}
//         resizeMode="contain"
//       />

//       <ActivityIndicator size="large" style={{ marginTop: 30 }} />
//       <Text style={styles.footerText}>Powered by BDO&apos;s RN Engine</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   centerBlock: {
//     alignItems: 'center',
//   },
//   // Single size used by all three logos
//   logo: {
//     width: 130,
//     height: 130,
//   },
//   footerText: {
//     position: 'absolute',
//     bottom: 20,
//   },
// });


import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUser } from '../../utils/auth';
import gsApi, { setAuthToken } from '../../api/gsApi';
import { clearAllTemp } from '../../utils/tempStore';

export default function SplashScreenProduction() {
  const nav = useNavigation();

  // Animation values
  const lineProgress = useRef(new Animated.Value(0)).current;
  const upTranslateY = useRef(new Animated.Value(0)).current;
  const prernaTranslateY = useRef(new Animated.Value(0)).current;
  const erpOpacity = useRef(new Animated.Value(0)).current;
  const erpScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    let active = true;
    let timeoutId = null;

    const runAnimation = () =>
      new Promise(resolve => {
        Animated.sequence([
          // 1. Line grows
          Animated.timing(lineProgress, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
          // 2. UP and Prerna move apart
          Animated.parallel([
            Animated.timing(upTranslateY, {
              toValue: -30,
              duration: 500,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(prernaTranslateY, {
              toValue: 30,
              duration: 500,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          // 3. ERP fades/scales in
          Animated.parallel([
            Animated.timing(erpOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(erpScale, {
              toValue: 1,
              friction: 5,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => resolve());
      });

    const init = async () => {
      try {
        clearAllTemp();

        const user = await getUser();
        if (!active) return;

        await runAnimation();
        if (!active) return;

        // 4s wait after full animation
        timeoutId = setTimeout(() => {
          if (!active) return;

          if (user && user.access) {
            setAuthToken(user.access);
            const role = String(user.role || '').toLowerCase();
            if (role === 'crp') {
              nav.replace('CRPDashboard');
              return;
            }
            if (role === 'admin') {
              nav.replace('AdminDashboard');
              return;
            }
          }

          nav.replace('Login');
        }, 4000);
      } catch (err) {
        await runAnimation();
        if (!active) return;
        timeoutId = setTimeout(() => {
          if (!active) return;
          nav.replace('Login');
        }, 4000);
      }
    };

    init();

    return () => {
      active = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [nav, lineProgress, upTranslateY, prernaTranslateY, erpOpacity, erpScale]);

  const lineStyle = {
    width: lineProgress.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '80%'],
    }),
    height: 4,
    backgroundColor: 'black',
  };

  return (
    <View style={styles.container}>
      {/* All three logos share one evenly spaced column */}
      <View style={styles.logoColumn}>
        {/* UP Govt logo */}
        <Animated.Image
          source={require('../../../assets/Up_govt_logo.png')}
          style={[
            styles.logo,
            { transform: [{ translateY: upTranslateY }] },
          ]}
          resizeMode="contain"
        />

        {/* Line between them */}
        <Animated.View style={styles.centerBlock}>
          <Animated.View style={lineStyle} />
        </Animated.View>

        {/* Prerna logo */}
        <Animated.Image
          source={require('../../../assets/prerna_logo.png')}
          style={[
            styles.logo,
            { transform: [{ translateY: prernaTranslateY }] },
          ]}
          resizeMode="contain"
        />

        {/* ERP Sakhi logo */}
        {/* <Animated.Image
          source={require('../../../assets/logo.png')}
          style={[
            styles.logo,
            {
              opacity: erpOpacity,
              transform: [{ scale: erpScale }],
            },
          ]}
          resizeMode="contain"
        /> */}
      </View>

      <ActivityIndicator size="large" />
      <Text style={styles.footerText}>Powered by BDO&apos;s RN Engine</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  // Equal vertical spacing between all children & edges[web:133][web:155]
  logoColumn: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  centerBlock: {
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: 130,
    height: 130,
  },
  footerText: {
    marginTop: 8,
    textAlign: 'center',
  },
});
