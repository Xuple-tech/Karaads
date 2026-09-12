import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppGradients, AppRadii } from '@/constants/app-theme';
import { useOnboardingStore } from '@/lib/navigation/onboarding-store';
import { useResponsiveMetrics } from '@/lib/ui/responsive';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function OnboardingScreen() {
  const { byWidth, isSmallScreen } = useResponsiveMetrics();
  const [isNavigating, setIsNavigating] = useState(false);
  const canUseNativeDriver = Platform.OS !== 'web';
  const logoPulse = useRef(new Animated.Value(0)).current;
  const buttonPulse = useRef(new Animated.Value(0)).current;
  const blobOne = useRef(new Animated.Value(0)).current;
  const blobTwo = useRef(new Animated.Value(0)).current;
  const blobThree = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (
      value: Animated.Value,
      duration: number,
      delay = 0,
    ): Animated.CompositeAnimation =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: canUseNativeDriver,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration,
            useNativeDriver: canUseNativeDriver,
          }),
        ]),
      );

    const logoAnimation = loop(logoPulse, 1500);
    const buttonAnimation = loop(buttonPulse, 1300, 180);
    const blobOneAnimation = loop(blobOne, 3500);
    const blobTwoAnimation = loop(blobTwo, 4300, 280);
    const blobThreeAnimation = loop(blobThree, 3900, 150);

    logoAnimation.start();
    buttonAnimation.start();
    blobOneAnimation.start();
    blobTwoAnimation.start();
    blobThreeAnimation.start();

    return () => {
      logoAnimation.stop();
      buttonAnimation.stop();
      blobOneAnimation.stop();
      blobTwoAnimation.stop();
      blobThreeAnimation.stop();
    };
  }, [blobOne, blobThree, blobTwo, buttonPulse, canUseNativeDriver, logoPulse]);

  const logoScale = logoPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });
  const logoOpacity = logoPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });
  const buttonScale = buttonPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03],
  });

  const next = async () => {
    if (isNavigating) {
      return;
    }

    setIsNavigating(true);
    // Marking onboarding as seen flips the root navigator from Onboarding to the auth flow.
    await useOnboardingStore.getState().markSeen();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={AppGradients.heroBg} style={StyleSheet.absoluteFillObject} />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.blobTop,
          {
            transform: [
              {
                translateX: blobOne.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                }),
              },
              {
                translateY: blobOne.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 20],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.blobBottom,
          {
            transform: [
              {
                translateX: blobTwo.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 14],
                }),
              },
              {
                translateY: blobTwo.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -14],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.blobCenter,
          {
            opacity: blobThree.interpolate({
              inputRange: [0, 1],
              outputRange: [0.15, 0.3],
            }),
            transform: [
              {
                scale: blobThree.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1.05],
                }),
              },
            ],
          },
        ]}
      />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoShell,
            {
              width: byWidth(148, 0.84, 1.04),
              height: byWidth(148, 0.84, 1.04),
              borderRadius: byWidth(74, 0.84, 1.04),
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}>
          <LinearGradient
            colors={AppGradients.storyRing}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.logoGradientBorder, { borderRadius: byWidth(74, 0.84, 1.04) }]}>
            <View style={[styles.logoInner, { borderRadius: byWidth(72, 0.84, 1.04) }]}>
              <Image
                style={[styles.logo, { width: byWidth(98, 0.84, 1.04), height: byWidth(98, 0.84, 1.04) }]}
                source={require('@/assets/images/favicon.png')}
                contentFit="contain"
              />
            </View>
          </LinearGradient>
        </Animated.View>

        <Text style={[styles.brandText, { fontSize: byWidth(15, 0.84, 1) }]}>KARAADS</Text>
        <Text style={[styles.title, { fontSize: byWidth(34, 0.84, 1), lineHeight: byWidth(40, 0.84, 1) }]}>Chat, Watch &amp; Earn</Text>
        <Text style={[styles.subtitle, { fontSize: byWidth(16, 0.84, 1), lineHeight: byWidth(24, 0.84, 1) }]}>
          Discover moments, watch videos, share posts, and earn by watching ads.
        </Text>
      </View>

      <AnimatedPressable
        onPress={next}
        disabled={isNavigating}
        style={[
          isNavigating ? styles.nextButtonDisabled : null,
          {
            height: byWidth(isSmallScreen ? 58 : 62, 0.84, 1),
            borderRadius: AppRadii.pill,
            transform: [{ scale: buttonScale }],
            overflow: 'hidden',
          },
        ]}>
        <LinearGradient
          colors={AppGradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.nextButtonGradient, { height: byWidth(isSmallScreen ? 58 : 62, 0.84, 1) }]}>
          <Text style={[styles.nextButtonLabel, { fontSize: byWidth(20, 0.84, 1) }]}>Get Started</Text>
        </LinearGradient>
      </AnimatedPressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: '#060912',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 34,
    overflow: 'hidden',
  },
  content: {
    marginTop: 84,
    alignItems: 'center',
    gap: 14,
  },
  logoShell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGradientBorder: {
    width: '100%',
    height: '100%',
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(9,11,18,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 98,
    height: 98,
  },
  brandText: {
    color: AppColors.accent,
    fontSize: 14,
    fontWeight: '800',
    fontFamily: undefined,
    letterSpacing: 5,
    marginTop: 4,
  },
  title: {
    color: AppColors.textPrimary,
    fontSize: 34,
    lineHeight: 40,
    textAlign: 'center',
    fontWeight: '800',
    fontFamily: undefined,
  },
  subtitle: {
    color: '#A8C4E8',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 340,
    fontFamily: undefined, fontWeight: '400',
  },
  nextButtonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    shadowColor: '#3B92FF',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  nextButtonDisabled: {
    opacity: 0.75,
  },
  nextButtonLabel: {
    color: AppColors.white,
    fontSize: 20,
    fontWeight: '800',
    fontFamily: undefined,
    letterSpacing: 0.3,
  },
  blobTop: {
    position: 'absolute',
    top: -180,
    right: -110,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: 'rgba(37,99,235,0.28)',
  },
  blobBottom: {
    position: 'absolute',
    bottom: -200,
    left: -140,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(124,58,237,0.18)',
  },
  blobCenter: {
    position: 'absolute',
    top: 300,
    left: -90,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(6,182,212,0.2)',
  },
});
