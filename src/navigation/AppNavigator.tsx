import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native-paper';
import { COLORS } from '../theme/theme';

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

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.grey600,
        tabBarStyle: {
          borderTopColor: COLORS.outline,
          paddingBottom: 8,
          height: 72,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Oferty',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="Catalog"
        component={CatalogScreen}
        options={{
          tabBarLabel: 'Katalog',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📦</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Ustawienia',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="NewOffer"
        component={NewOfferScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="OfferPositions" component={OfferPositionsScreen} />
      <Stack.Screen name="CatalogPicker" component={CatalogPickerScreen} />
      <Stack.Screen name="OfferSummary" component={OfferSummaryScreen} />
      <Stack.Screen
        name="PdfPreview"
        component={PdfPreviewScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
