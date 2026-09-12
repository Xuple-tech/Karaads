import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SwipeStackView } from '@/components/navigation/swipe-stack-view';
import { AppColors, AppGradients, AppRadii } from '@/constants/app-theme';
import { router } from '@/lib/navigation/router';

export default function SecuritySettingsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SwipeStackView>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color={AppColors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Security</Text>
          <View style={styles.spacer} />
        </View>

        <LinearGradient colors={AppGradients.cardSurface} style={styles.card}>
          <LinearGradient colors={AppGradients.accentGreen} style={styles.iconWrap}>
            <ShieldCheck size={22} color={AppColors.white} />
          </LinearGradient>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Account protection</Text>
            <Text style={styles.cardText}>
              Keep your password strong and avoid sharing login codes. Security events and login alerts will appear in your
              notifications inbox.
            </Text>
          </View>
        </LinearGradient>
      </View>
    </SwipeStackView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  title: {
    color: AppColors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  spacer: {
    width: 42,
    height: 42,
  },
  card: {
    borderRadius: AppRadii.lg,
    borderWidth: 1,
    borderColor: 'rgba(5,150,105,0.3)',
    padding: 18,
    flexDirection: 'row',
    gap: 16,
    shadowColor: '#059669',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: AppRadii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    color: AppColors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  cardText: {
    color: AppColors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
});
