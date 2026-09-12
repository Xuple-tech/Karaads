import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { House, MessageCircle, Search, User } from 'lucide-react-native';
import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Directions, Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BrowseScreen from '@/app/(main)/(tabs)/browse';
import EarnTabScreen from '@/app/(main)/(tabs)/earn';
import HomeScreen from '@/app/(main)/(tabs)/home';
import MessagesListScreen from '@/app/(main)/(tabs)/messages/index';
import ProfileScreen from '@/app/(main)/(tabs)/profile/index';
import { AppGradients, type AppPalette } from '@/constants/app-theme';
import { useConversations } from '@/features/messages/hooks';
import { useColors } from '@/hooks/use-colors';
import { clamp } from '@/lib/ui/responsive';

import { router } from './router';
import type { MainTabsParamList } from './types';

const Tab = createBottomTabNavigator<MainTabsParamList>();

const TAB_ROUTE_SEQUENCE = ['Home', 'Browse', 'Earn', 'Messages', 'Profile'] as const;

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = clamp(width / 390, 0.88, 1.1);
  const iconSize = Math.round(22 * scale);
  const bottomInset = Math.max(insets.bottom, 4);
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const visibleRoutes = TAB_ROUTE_SEQUENCE
    .map((name) => state.routes.find((route) => route.name === name))
    .filter((route): route is (typeof state.routes)[number] => Boolean(route));
  return (
    <View style={[styles.tabDockWrap, { paddingBottom: bottomInset }]}>
      <View style={styles.bar}>
        {visibleRoutes.map((route) => {
          const index = state.routes.findIndex((item) => item.key === route.key);
          const descriptor = descriptors[route.key];
          const focused = state.index === index;
          const color = focused ? colors.accent : colors.textMuted;
          const icon = descriptor.options.tabBarIcon?.({
            focused,
            color,
            size: iconSize,
          });
          const badge = descriptor.options.tabBarBadge;
          const isCenter = route.name === 'Earn';
          const label = descriptor.options.title ?? '';
          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={[styles.tabItem, isCenter ? styles.centerTabItem : null]}>
              {icon}
              {!isCenter ? (
                <>
                  {focused ? (
                    <LinearGradient
                      colors={AppGradients.primary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.activeDot}
                    />
                  ) : null}
                  <Text style={[styles.tabLabel, focused ? styles.tabLabelActive : null]} numberOfLines={1}>
                    {label}
                  </Text>
                </>
              ) : null}
              {badge && !focused ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{String(badge)}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const SwipeableTabBar = (props: BottomTabBarProps) => {
  const currentRouteName = props.state.routes[props.state.index]?.name;
  const currentIndex = TAB_ROUTE_SEQUENCE.indexOf(currentRouteName as (typeof TAB_ROUTE_SEQUENCE)[number]);
  const gesture = useMemo(() => {
    const move = (delta: -1 | 1) => {
      if (currentIndex < 0) return;
      const nextIndex = currentIndex + delta;
      if (nextIndex < 0 || nextIndex >= TAB_ROUTE_SEQUENCE.length) return;
      router.navigate('MainTabs', { screen: TAB_ROUTE_SEQUENCE[nextIndex] });
    };
    return Gesture.Exclusive(
      Gesture.Fling()
        .runOnJS(true)
        .direction(Directions.LEFT)
        .onEnd(() => {
          move(1);
        }),
      Gesture.Fling()
        .runOnJS(true)
        .direction(Directions.RIGHT)
        .onEnd(() => {
          move(-1);
        }),
    );
  }, [currentIndex]);

  if (Platform.OS === 'web') {
    return <CustomTabBar {...props} />;
  }

  return (
    <GestureDetector gesture={gesture}>
      <View collapsable={false}>
        <CustomTabBar {...props} />
      </View>
    </GestureDetector>
  );
};

export function MainTabsNavigator() {
  const conversations = useConversations();
  const unread = (conversations.data ?? []).reduce((count, item) => count + Number(item.unread_count ?? 0), 0);
  const { width } = useWindowDimensions();
  const scale = clamp(width / 390, 0.88, 1.1);
  const tabIconSize = Math.round(22 * scale);
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <SwipeableTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <House size={tabIconSize} stroke={color} strokeWidth={focused ? 2.4 : 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Browse"
        component={BrowseScreen}
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <Search size={tabIconSize} stroke={color} strokeWidth={focused ? 2.4 : 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Earn"
        component={EarnTabScreen}
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                {
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#FFFFFF',
                },
                focused
                  ? {
                      shadowColor: color,
                      shadowOpacity: 0.35,
                      shadowRadius: 10,
                      shadowOffset: { width: 0, height: 0 },
                      elevation: 4,
                    }
                  : null,
              ]}>
              <ExpoImage source={require('@/assets/images/favicon.png')} style={{ width: 24, height: 24 }} contentFit="contain" />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesListScreen}
        options={{
          title: 'Messages',
          tabBarBadge: unread > 0 ? (unread > 99 ? '99+' : unread) : undefined,
          tabBarIcon: ({ color, focused }) => (
            <MessageCircle size={tabIconSize} stroke={color} strokeWidth={focused ? 2.4 : 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <User size={tabIconSize} stroke={color} strokeWidth={focused ? 2.4 : 2} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const createStyles = (c: AppPalette) =>
  StyleSheet.create({
    tabDockWrap: {
      backgroundColor: '#09111E',
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.08)',
    },
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      minHeight: 60,
      paddingHorizontal: 8,
      paddingTop: 8,
      paddingBottom: 4,
    },
    tabItem: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      gap: 3,
      paddingVertical: 4,
    },
    centerTabItem: {
      flex: 0.9,
    },
    activeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    tabLabel: {
      color: c.textMuted,
      fontSize: 10,
      fontFamily: undefined,
      fontWeight: '600',
    },
    tabLabelActive: {
      color: c.accent,
    },
    badge: {
      position: 'absolute',
      top: 0,
      right: '20%',
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: '#F43F5E',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    badgeText: {
      color: c.white,
      fontSize: 9,
      fontWeight: '800',
    },
  });
