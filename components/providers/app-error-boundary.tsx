import { Component, type ErrorInfo, type PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppRadii } from '@/constants/app-theme';

type State = {
  error: Error | null;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown app error';
};

export class AppErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { error: null };

  private previousGlobalHandler: ((error: Error, isFatal?: boolean) => void) | null = null;

  componentDidMount() {
    const errorUtils = (globalThis as unknown as { ErrorUtils?: { getGlobalHandler?: () => (error: Error, isFatal?: boolean) => void; setGlobalHandler?: (handler: (error: Error, isFatal?: boolean) => void) => void } }).ErrorUtils;
    if (!errorUtils?.setGlobalHandler) return;

    this.previousGlobalHandler = errorUtils.getGlobalHandler?.() ?? null;
    errorUtils.setGlobalHandler((error, isFatal) => {
      this.setState({ error });
      if (!isFatal) {
        this.previousGlobalHandler?.(error, isFatal);
      }
    });
  }

  componentWillUnmount() {
    const errorUtils = (globalThis as unknown as { ErrorUtils?: { setGlobalHandler?: (handler: (error: Error, isFatal?: boolean) => void) => void } }).ErrorUtils;
    if (this.previousGlobalHandler && errorUtils?.setGlobalHandler) {
      errorUtils.setGlobalHandler(this.previousGlobalHandler);
    }
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    this.setState({ error });
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <View style={styles.screen}>
        <Text style={styles.title}>KaraAds stopped on an error</Text>
        <Text style={styles.body}>{getErrorMessage(this.state.error)}</Text>
        <Pressable style={styles.button} onPress={() => this.setState({ error: null })}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#07101D',
    gap: 14,
  },
  title: {
    color: AppColors.textPrimary,
    fontSize: 22,
    fontFamily: undefined, fontWeight: '800',
  },
  body: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: undefined, fontWeight: '600',
  },
  button: {
    alignSelf: 'flex-start',
    minHeight: 44,
    borderRadius: AppRadii.pill,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.accentStrong,
  },
  buttonText: {
    color: AppColors.white,
    fontSize: 14,
    fontFamily: undefined, fontWeight: '800',
  },
});
