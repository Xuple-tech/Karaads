import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppColors } from '@/constants/app-theme';

export function MigrationPlaceholderScreen({ title }: { title: string }) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>This screen is being migrated to the new app navigation.</Text>
      {navigation.canGoBack() ? (
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go back</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: AppColors.background,
  },
  title: { color: AppColors.textPrimary, fontSize: 24, fontWeight: '700' },
  message: { color: AppColors.textSecondary, fontSize: 15, textAlign: 'center' },
  button: { marginTop: 8, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: AppColors.accent },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
