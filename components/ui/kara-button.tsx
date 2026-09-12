import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text } from 'react-native';

import { AppColors, AppGradients, AppRadii } from '@/constants/app-theme';

type KaraButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
};

export const KaraButton = ({
  label,
  onPress,
  loading = false,
  variant = 'primary',
  disabled = false,
}: KaraButtonProps) => {
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [{ opacity: isDisabled ? 0.55 : pressed ? 0.88 : 1 }]}>
        <LinearGradient
          colors={AppGradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, styles.primaryGlow]}>
          {loading ? (
            <ActivityIndicator color={AppColors.white} />
          ) : (
            <Text style={[styles.label, styles.primaryLabel]}>{label}</Text>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === 'secondary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          styles.secondary,
          { opacity: isDisabled ? 0.55 : pressed ? 0.82 : 1 },
        ]}>
        {loading ? (
          <ActivityIndicator color={AppColors.accent} />
        ) : (
          <Text style={[styles.label, styles.secondaryLabel]}>{label}</Text>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles.ghost,
        { opacity: isDisabled ? 0.55 : pressed ? 0.7 : 1 },
      ]}>
      {loading ? (
        <ActivityIndicator color={AppColors.accent} />
      ) : (
        <Text style={[styles.label, styles.ghostLabel]}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  primaryGlow: {
    ...Platform.select({
      ios: {
        shadowColor: '#3B92FF',
        shadowOpacity: 0.45,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 8 },
    }),
  },
  secondary: {
    backgroundColor: 'rgba(30,40,70,0.7)',
    borderWidth: 1.5,
    borderColor: AppColors.accent,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: undefined,
    letterSpacing: 0.2,
  },
  primaryLabel: {
    color: AppColors.white,
  },
  secondaryLabel: {
    color: AppColors.accent,
  },
  ghostLabel: {
    color: AppColors.accent,
  },
});