import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUser } from '../../utils/auth';
import { setAuthToken } from '../../api/gsApi';
import { clearAllTemp } from '../../utils/tempStore';

const { width, height } = Dimensions.get('window');

/* ─── Ashoka Chakra Spinner ───────────────────────────────────── */
function ChakraLoader() {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const SIZE = 60;
  const THICKNESS = 5;

  return (
    <Animated.View
      style={{ width: SIZE, height: SIZE, transform: [{ rotate }] }}
    >
      {/* Orange arc — top-right half */}
      <View
        style={{
          position: 'absolute',
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          borderWidth: THICKNESS,
          borderColor: 'transparent',
          borderTopColor: '#FF8C00',
          borderRightColor: '#FF8C00',
        }}
      />
      {/* Green arc — bottom-left half */}
      <View
        style={{
          position: 'absolute',
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          borderWidth: THICKNESS,
          borderColor: 'transparent',
          borderBottomColor: '#138808',
          borderLeftColor: '#138808',
        }}
      />
      {/* Ashoka Chakra hub dot */}
      <View
        style={{
          position: 'absolute',
          top: SIZE / 2 - 3,
          left: SIZE / 2 - 3,
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: '#00337A',
          opacity: 0.65,
        }}
      />
    </Animated.View>
  );
}

/* ─── Main Splash ─────────────────────────────────────────────── */
export default function SplashScreen() {
  const nav = useNavigation();

  const bgOpacity = useRef(new Animated.Value(0)).current;
  const leftLogoOp = useRef(new Animated.Value(0)).current;
  const leftLogoX = useRef(new Animated.Value(-60)).current;
  const rightLogoOp = useRef(new Animated.Value(0)).current;
  const rightLogoX = useRef(new Animated.Value(60)).current;
  const line1Op = useRef(new Animated.Value(0)).current;
  const line1Y = useRef(new Animated.Value(28)).current;
  const line1Scale = useRef(new Animated.Value(0.78)).current;
  const line2Op = useRef(new Animated.Value(0)).current;
  const line2Y = useRef(new Animated.Value(28)).current;
  const line2Scale = useRef(new Animated.Value(0.78)).current;
  const loaderOp = useRef(new Animated.Value(0)).current;
  const loaderScale = useRef(new Animated.Value(0.5)).current;
  const loadTextOp = useRef(new Animated.Value(0)).current;
  const bottomOp = useRef(new Animated.Value(0)).current;
  const bottomY = useRef(new Animated.Value(120)).current;

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    const mk = (val, toValue) =>
      Animated.spring(val, {
        toValue,
        tension: 62,
        friction: 8,
        useNativeDriver: true,
      });

    Animated.sequence([
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(bottomOp, {
          toValue: 1,
          duration: 700,
          easing: ease,
          useNativeDriver: true,
        }),
        mk(bottomY, 0),
      ]),
      Animated.parallel([
        Animated.timing(leftLogoOp, {
          toValue: 1,
          duration: 500,
          easing: ease,
          useNativeDriver: true,
        }),
        mk(leftLogoX, 0),
        Animated.timing(rightLogoOp, {
          toValue: 1,
          duration: 500,
          easing: ease,
          useNativeDriver: true,
        }),
        mk(rightLogoX, 0),
      ]),
      Animated.parallel([
        Animated.timing(line1Op, {
          toValue: 1,
          duration: 460,
          easing: ease,
          useNativeDriver: true,
        }),
        mk(line1Scale, 1),
        Animated.timing(line1Y, {
          toValue: 0,
          duration: 460,
          easing: ease,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(line2Op, {
          toValue: 1,
          duration: 460,
          easing: ease,
          useNativeDriver: true,
        }),
        mk(line2Scale, 1),
        Animated.timing(line2Y, {
          toValue: 0,
          duration: 460,
          easing: ease,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(loaderOp, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
        mk(loaderScale, 1),
        Animated.timing(loadTextOp, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const t = setTimeout(async () => {
      clearAllTemp();
      const user = await getUser();
      if (user?.access) {
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
    }, 3700);

    return () => clearTimeout(t);
  }, []);

  return (
    <View style={s.root}>
      {/* Background */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOpacity }]}>
        <Image
          source={require('../../../assets/splash_bg.png')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Bottom image — full width, edge to edge */}
      <Animated.View
        style={[
          s.bottomWrap,
          { opacity: bottomOp, transform: [{ translateY: bottomY }] },
        ]}
        pointerEvents="none"
      >
        <Image
          source={require('../../../assets/bg_erased.png')}
          style={s.bottomImage}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Logos — spread to left & right corners */}
      <View style={s.logosRow}>
        <Animated.View
          style={{
            opacity: leftLogoOp,
            transform: [{ translateX: leftLogoX }],
          }}
        >
          <Image
            source={require('../../../assets/prerna_logo.png')}
            style={s.logo}
            resizeMode="contain"
          />
        </Animated.View>
        <Animated.View
          style={{
            opacity: rightLogoOp,
            transform: [{ translateX: rightLogoX }],
          }}
        >
          <Image
            source={require('../../../assets/Up_govt_logo.png')}
            style={s.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Title */}
      <View style={s.titleBlock}>
        <Animated.Text
          numberOfLines={1}
          adjustsFontSizeToFit={true}
          style={[
            s.titleLine,
            s.orange,
            {
              opacity: line1Op,
              transform: [{ scale: line1Scale }, { translateY: line1Y }],
            },
          ]}
        >
          उद्यम सखी
        </Animated.Text>
        <Animated.Text
          numberOfLines={1}
          adjustsFontSizeToFit={true}
          style={[
            s.titleLine,
            s.green,
            {
              opacity: line2Op,
              transform: [{ scale: line2Scale }, { translateY: line2Y }],
            },
          ]}
        >
          सर्वेक्षण ऐप
        </Animated.Text>
      </View>

      {/* Loader */}
      <Animated.View
        style={[
          s.loaderWrap,
          { opacity: loaderOp, transform: [{ scale: loaderScale }] },
        ]}
      >
        <ChakraLoader />
      </Animated.View>

      {/* Loading text */}
      <Animated.Text style={[s.loadText, { opacity: loadTextOp }]}>
        लोड हो रहा है…
      </Animated.Text>
    </View>
  );
}

const LOGO_SIZE = 112;
const BOTTOM_H = height * 0.4;

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  logosRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  titleBlock: {
    alignItems: 'center',
    marginTop: 40,
  },
  titleLine: {
    width: width - 40,
    fontSize: 46,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 60,
    fontFamily: 'NotoSansDevanagari-Bold',
  },
  orange: { color: '#FF8C00' },
  green: { color: '#138808' },
  loaderWrap: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadText: {
    marginTop: 14,
    fontSize: 15,
    color: '#555555',
    letterSpacing: 0.4,
    fontFamily: 'NotoSansDevanagari-Regular',
  },
  bottomWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomImage: {
    width: width,
    height: BOTTOM_H,
  },
});
