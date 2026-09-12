import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppColors, AppRadii } from '@/constants/app-theme';

type KaraInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
  error?: string;
};

export const KaraInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize,
  keyboardType = 'default',
  error,
}: KaraInputProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        {(focused || !!error) && (
          <LinearGradient
            colors={error ? ['#F43F5E', '#F43F5E'] : ['#1A65E0', '#3B92FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBorder}
            pointerEvents="none"
          />
        )}
        <TextInput
          style={[
            styles.input,
            focused && styles.inputFocused,
            error && styles.errorInput,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={AppColors.textMuted}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    color: AppColors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: undefined,
    marginBottom: 2,
  },
  inputWrapper: {
    borderRadius: AppRadii.md,
    padding: 1.5,
    backgroundColor: AppColors.border,
    overflow: 'hidden',
  },
  gradientBorder: {
    position: 'absolute',
    inset: 0,
    borderRadius: AppRadii.md,
  },
  input: {
    position: 'relative',
    zIndex: 1,
    height: 52,
    borderRadius: AppRadii.md - 1,
    paddingHorizontal: 16,
    color: AppColors.textPrimary,
    backgroundColor: '#0E1422',
    fontSize: 15,
    fontFamily: undefined, fontWeight: '400',
  },
  inputFocused: {
    backgroundColor: '#111928',
  },
  errorInput: {
    backgroundColor: '#1A0A10',
  },
  errorText: {
    color: AppColors.danger,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '600',
  },
});
