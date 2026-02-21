import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Video from 'react-native-video';
import { useNavigation } from '@react-navigation/native';
import { getUser } from '../../utils/auth';
import { setAuthToken } from '../../api/gsApi';
import { clearAllTemp } from '../../utils/tempStore';

export default function SplashScreenProduction() {
  const nav = useNavigation();
  const [videoFinished, setVideoFinished] = useState(false);

  useEffect(() => {
    const init = async () => {
      clearAllTemp();

      const user = await getUser();

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
    };

    if (videoFinished) {
      init();
    }
  }, [videoFinished, nav]);

  return (
    <View style={styles.container}>
      <Video
        source={require('../../../assets/splash_animation.mp4')}
        style={styles.video}
        resizeMode="cover" // 👈 THIS makes it fill entire screen
        onEnd={() => setVideoFinished(true)}
        muted={true}
        repeat={false}
        ignoreSilentSwitch="obey"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  video: {
    ...StyleSheet.absoluteFillObject, // full screen
  },
});
