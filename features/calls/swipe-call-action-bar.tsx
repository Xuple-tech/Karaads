import { LinearGradient } from 'expo-linear-gradient';
import { Phone, PhoneOff } from 'lucide-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppGradients, AppRadii } from '@/constants/app-theme';

type SwipeCallActionBarProps = {
  onAccept: () => void | Promise<void>;
  onDecline: () => void | Promise<void>;
};

const KNOB_SIZE = 86;

export const SwipeCallActionBar = ({ onAccept, onDecline }: SwipeCallActionBarProps) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  const swipeLimit = useMemo(() => {
    const available = Math.max(trackWidth - KNOB_SIZE - 24, 0);
    return available / 2;
  }, [trackWidth]);

  const resetPosition = useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 8,
      speed: 18,
    }).start();
  }, [translateX]);

  const completeSwipe = useCallback((direction: 'accept' | 'decline') => {
    const destination = direction === 'accept' ? swipeLimit : -swipeLimit;
    Animated.timing(translateX, {
      toValue: destination,
      duration: 140,
      useNativeDriver: true,
    }).start(() => {
      if (direction === 'accept') {
        void onAccept();
      } else {
        void onDecline();
      }
      translateX.setValue(0);
    });
  }, [onAccept, onDecline, swipeLimit, translateX]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_evt, gesture) => Math.abs(gesture.dx) > 4,
        onPanResponderMove: (_evt, gesture) => {
          const next = Math.max(-swipeLimit, Math.min(swipeLimit, gesture.dx));
          translateX.setValue(next);
        },
        onPanResponderRelease: (_evt, gesture) => {
          const triggerDistance = Math.max(swipeLimit * 0.68, 44);
          if (gesture.dx >= triggerDistance) {
            completeSwipe('accept');
            return;
          }
          if (gesture.dx <= -triggerDistance) {
            completeSwipe('decline');
            return;
          }
          resetPosition();
        },
        onPanResponderTerminate: resetPosition,
      }),
    [completeSwipe, resetPosition, swipeLimit, translateX],
  );

  return (
    <View style={styles.track} onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}>
      <View style={styles.sideDeclineLabel}>
        <PhoneOff size={16} color="#EF4444" />
        <Text style={styles.declineText}>Decline</Text>
      </View>
      <View style={styles.sideAnswerLabel}>
        <Text style={styles.answerText}>Answer</Text>
        <Phone size={16} color="#22C55E" />
      </View>
      <Animated.View
        style={[styles.knob, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}>
        <LinearGradient colors={AppGradients.accentBlue} style={styles.knobGradient}>
          <Phone size={26} color={AppColors.white} />
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    minHeight: 94,
    borderRadius: AppRadii.pill,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: 'rgba(91,178,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  sideDeclineLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sideAnswerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  declineText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
  answerText: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: '700',
  },
  knob: {
    position: 'absolute',
    left: '50%',
    marginLeft: -(KNOB_SIZE / 2),
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    overflow: 'hidden',
    shadowColor: '#2E90FF',
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  knobGradient: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
