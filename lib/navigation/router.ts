import { CommonActions, createNavigationContainerRef, useRoute } from '@react-navigation/native';

import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

type RouteName = keyof RootStackParamList;
type ParamsOf<Name extends RouteName> = RootStackParamList[Name];

const navigate = <Name extends RouteName>(name: Name, params?: ParamsOf<Name>) => {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(CommonActions.navigate({ name, params }));
};

const push = navigate;

const replace = <Name extends RouteName>(name: Name, params?: ParamsOf<Name>) => {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(CommonActions.reset({
    index: 0,
    routes: [{ name, params }],
  }));
};

const back = () => {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
};

const canGoBack = () => navigationRef.isReady() && navigationRef.canGoBack();

const setParams = (params: Record<string, unknown>) => {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(CommonActions.setParams(params));
};

/** Reads the currently focused route without a hook — for use outside the screen tree (e.g. app-root managers). */
const getCurrentRoute = () => (navigationRef.isReady() ? navigationRef.getCurrentRoute() : undefined);

export const router = { navigate, push, replace, back, canGoBack, setParams, getCurrentRoute };

/** Drop-in replacement for expo-router's useLocalSearchParams/useGlobalSearchParams within a screen. */
export function useLocalSearchParams<T extends Record<string, unknown> = Record<string, unknown>>(): T {
  const route = useRoute();
  return (route.params ?? {}) as T;
}

export const useGlobalSearchParams = useLocalSearchParams;

/** Drop-in replacement for expo-router's usePathname(), returning the focused screen's route name. */
export function usePathname(): string {
  const route = useRoute();
  return route.name;
}
