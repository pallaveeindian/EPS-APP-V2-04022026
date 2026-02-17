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
