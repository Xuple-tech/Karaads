import NetInfo from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


/**
 * Global banner shown when the device has no network connectivity.
 * Slides down from the top and auto-hides once connectivity is restored.
 */
export const OfflineBanner = () => {
  const insets = useSafeAreaInsets();
  const [isOffline, setIsOffline] = useState(false);
  const slideAnim = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsOffline(offline);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOffline ? 0 : -80,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOffline, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.banner,
        { paddingTop: insets.top + 8, transform: [{ translateY: slideAnim }] },
      ]}
      pointerEvents={isOffline ? 'auto' : 'none'}>
      <View style={styles.pill}>
        <WifiOff size={14} stroke="#FFFFFF" strokeWidth={2.2} />
        <Text style={styles.text}>No internet connection</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(9,11,18,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(244,63,94,0.35)',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(244,63,94,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.45)',
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  text: {
    color: '#F87171',
    fontSize: 13,
    fontFamily: undefined, fontWeight: '600',
    letterSpacing: 0.2,
  },
});
