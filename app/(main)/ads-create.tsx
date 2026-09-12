import { ArrowLeft, BadgeDollarSign, Megaphone, MousePointerClick, PenSquare, Users } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SwipeTabsView } from '@/components/navigation/swipe-tabs-view';
import { AppColors, AppRadii } from '@/constants/app-theme';
import { router } from '@/lib/navigation/router';

const goals = [
  { value: 'views', title: 'More views', subtitle: 'Get your post seen by more people.', Icon: Megaphone },
  { value: 'clicks', title: 'More clicks', subtitle: 'Send people to your offer or page.', Icon: MousePointerClick },
  { value: 'followers', title: 'More followers', subtitle: 'Grow your audience on KaraAds.', Icon: Users },
];

const budgets = [
  { label: '₦1,000', value: 1000 },
  { label: '₦5,000', value: 5000 },
  { label: '₦10,000', value: 10000 },
];

export default function CreateAdsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedGoal, setSelectedGoal] = useState(goals[0].value);
  const [selectedBudget, setSelectedBudget] = useState(5000);
  const openPostComposer = () => {
    router.push('PostsCreate', {
      mode: 'post',
      adMode: '1',
      adGoal: selectedGoal,
      adBudget: String(selectedBudget),
    });
  };

  return (
    <SwipeTabsView>
      <View style={styles.container}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={18} stroke={AppColors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Create Ads</Text>
          <View style={styles.spacer} />
        </View>

        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}>
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <BadgeDollarSign size={24} color="#06101E" />
            </View>
            <Text style={styles.heroTitle}>Set up your ad post</Text>
            <Text style={styles.heroText}>Choose what you want the ad to do, pick a starting budget, then create the post users will see.</Text>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Ad goal</Text>
            {goals.map(({ value, title, subtitle, Icon }) => {
              const active = selectedGoal === value;
              return (
              <Pressable key={title} style={[styles.optionRow, active && styles.optionRowActive]} onPress={() => setSelectedGoal(value)}>
                <View style={[styles.optionIcon, active && styles.optionIconActive]}>
                  <Icon size={18} color={active ? '#06101E' : AppColors.white} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{title}</Text>
                  <Text style={styles.optionSubtitle}>{subtitle}</Text>
                </View>
              </Pressable>
            );
            })}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Starting budget</Text>
            <View style={styles.budgetRow}>
              {budgets.map((budget) => {
                const active = selectedBudget === budget.value;
                return (
                  <Pressable key={budget.value} style={[styles.budgetPill, active && styles.budgetPillActive]} onPress={() => setSelectedBudget(budget.value)}>
                    <Text style={[styles.budgetText, active && styles.budgetTextActive]}>{budget.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable style={styles.createBtn} onPress={openPostComposer}>
            <PenSquare size={18} color="#07111F" />
            <Text style={styles.createBtnText}>Continue to create ad post</Text>
          </Pressable>
        </ScrollView>
      </View>
    </SwipeTabsView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    paddingHorizontal: 14,
  },
  topBar: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46,144,255,0.1)',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.22)',
    backgroundColor: 'rgba(14,20,34,0.85)',
  },
  title: { color: AppColors.textPrimary, fontSize: 20, fontFamily: undefined, fontWeight: '800' },
  spacer: { width: 44 },
  content: {
    paddingTop: 14,
    gap: 12,
  },
  heroCard: {
    borderRadius: AppRadii.lg,
    borderWidth: 1,
    borderColor: 'rgba(23,217,255,0.22)',
    backgroundColor: 'rgba(10,18,32,0.88)',
    padding: 16,
    gap: 10,
  },
  heroIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: AppColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: AppColors.textPrimary,
    fontSize: 21,
    lineHeight: 26,
    fontFamily: undefined, fontWeight: '800',
  },
  heroText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: undefined, fontWeight: '400',
  },
  sectionCard: {
    borderRadius: AppRadii.lg,
    backgroundColor: 'rgba(8,15,28,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(54,84,128,0.46)',
    padding: 14,
    gap: 10,
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontFamily: undefined, fontWeight: '800',
  },
  optionRow: {
    minHeight: 72,
    borderRadius: AppRadii.md,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionRowActive: {
    borderColor: 'rgba(23,217,255,0.35)',
    backgroundColor: 'rgba(23,217,255,0.10)',
  },
  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.11)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconActive: {
    backgroundColor: AppColors.accent,
  },
  optionText: { flex: 1, gap: 3 },
  optionTitle: {
    color: AppColors.textPrimary,
    fontSize: 14,
    fontFamily: undefined, fontWeight: '800',
  },
  optionSubtitle: {
    color: AppColors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: undefined, fontWeight: '400',
  },
  budgetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  budgetPill: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.11)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetPillActive: {
    backgroundColor: AppColors.white,
  },
  budgetText: {
    color: AppColors.textPrimary,
    fontSize: 13,
    fontFamily: undefined, fontWeight: '800',
  },
  budgetTextActive: {
    color: '#07111F',
  },
  createBtn: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: AppColors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createBtnText: {
    color: '#07111F',
    fontSize: 14,
    fontFamily: undefined, fontWeight: '800',
  },
});
