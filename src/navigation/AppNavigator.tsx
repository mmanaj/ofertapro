import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screens
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import DashboardScreen from '../screens/DashboardScreen';
import NewOfferScreen from '../screens/NewOfferScreen';
import OfferPositionsScreen from '../screens/OfferPositionsScreen';
import OfferSummaryScreen from '../screens/OfferSummaryScreen';
import PdfPreviewScreen from '../screens/PdfPreviewScreen';
import CatalogPickerScreen from '../screens/CatalogPickerScreen';
import CatalogScreen from '../screens/CatalogScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Export so tab screens can position FABs above the bar
export const FLOATING_TAB_BAR_HEIGHT = 62; // content height
export const FLOATING_TAB_BAR_BOTTOM_GAP = 8; // gap above safe area

const TAB_CONFIG = [
  { name: 'Dashboard',  label: 'Oferty',      icon: 'document-text-outline' as const, iconActive: 'document-text'   as const },
  { name: 'Catalog',    label: 'Katalog',     icon: 'cube-outline'          as const, iconActive: 'cube'            as const },
  { name: 'Settings',   label: 'Ustawienia',  icon: 'settings-outline'      as const, iconActive: 'settings'        as const },
] as const;

function GlassTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom + FLOATING_TAB_BAR_BOTTOM_GAP, 20);

  return (
    <View
      style={[styles.tabBarOuter, { bottom }]}
      pointerEvents="box-none"
      accessibilityRole="tablist"
    >
      {/* Shadow ring — sits outside BlurView so blur doesn't clip it */}
      <View style={styles.tabBarShadow}>
        <BlurView intensity={75} tint="systemMaterial" style={styles.tabBarBlur}>
          <View style={styles.tabBarInner}>
            {state.routes.map((route, index) => {
              const isActive = state.index === index;
              const tab = TAB_CONFIG[index];
              if (!tab) return null;

              return (
                <Pressable
                  key={route.key}
                  onPress={() => navigation.navigate(route.name)}
                  accessibilityRole="tab"
                  accessibilityLabel={tab.label}
                  accessibilityState={{ selected: isActive }}
                  style={[styles.tabItem, isActive && styles.tabItemActive]}
                >
                  <Ionicons
                    name={isActive ? tab.iconActive : tab.icon}
                    size={22}
                    color={isActive ? '#007AFF' : '#8E8E93'}
                  />
                  <Text
                    style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                    allowFontScaling
                    maxFontSizeMultiplier={1.1}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </BlurView>
      </View>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Catalog"   component={CatalogScreen} />
      <Tab.Screen name="Settings"  component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login"          component={LoginScreen} />
      <Stack.Screen name="Onboarding"     component={OnboardingScreen} />
      <Stack.Screen name="Main"           component={MainTabs} />
      <Stack.Screen name="NewOffer"       component={NewOfferScreen} />
      <Stack.Screen name="OfferPositions" component={OfferPositionsScreen} />
      <Stack.Screen name="CatalogPicker"  component={CatalogPickerScreen} />
      <Stack.Screen name="OfferSummary"   component={OfferSummaryScreen} />
      <Stack.Screen name="PdfPreview"     component={PdfPreviewScreen}     options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarOuter: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabBarShadow: {
    borderRadius: 30,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 16,
  },
  tabBarBlur: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  tabBarInner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderRadius: 30,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.9)',
    gap: 2,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 7,
    borderRadius: 22,
    minWidth: 72,
    minHeight: 44,
    gap: 3,
  },
  tabItemActive: {
    backgroundColor: 'rgba(0,122,255,0.10)',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: '#8E8E93',
    letterSpacing: -0.1,
  },
  tabLabelActive: {
    fontWeight: '600',
    color: '#007AFF',
  },
});
