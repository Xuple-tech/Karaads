import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppGradients } from '@/constants/app-theme';

type AvatarProps = {
  uri?: string | null;
  name?: string;
  size?: number;
  showRing?: boolean;
  online?: boolean;
};

export const Avatar = ({ uri, name, size = 40, showRing = false, online = false }: AvatarProps) => {
  const initials = (name ?? '?')
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const ringPad = showRing ? 3 : 0;
  const innerSize = size;
  const outerSize = size + ringPad * 2;

  const inner = uri ? (
    <Image source={{ uri }} style={{ width: innerSize, height: innerSize, borderRadius: innerSize / 2 }} />
  ) : (
    <View
      style={[
        styles.fallback,
        {
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          backgroundColor: AppColors.surfaceMuted,
        },
      ]}>
      <Text style={[styles.initials, { fontSize: Math.max(10, size * 0.3) }]}>{initials}</Text>
    </View>
  );

  return (
    <View style={{ width: outerSize, height: outerSize }}>
      {showRing ? (
        <LinearGradient
          colors={AppGradients.storyRing}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.ringGradient,
            { width: outerSize, height: outerSize, borderRadius: outerSize / 2 },
          ]}>
          <View
            style={[
              styles.ringInner,
              {
                width: outerSize - 2,
                height: outerSize - 2,
                borderRadius: (outerSize - 2) / 2,
              },
            ]}>
            {inner}
          </View>
        </LinearGradient>
      ) : (
        inner
      )}
      {online && (
        <View
          style={[
            styles.onlineDot,
            {
              width: Math.max(8, size * 0.22),
              height: Math.max(8, size * 0.22),
              borderRadius: Math.max(4, size * 0.11),
              bottom: ringPad,
              right: ringPad,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: AppColors.textPrimary,
    fontWeight: '700',
    fontFamily: undefined,
  },
  ringGradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    backgroundColor: AppColors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: AppColors.background,
  },
});