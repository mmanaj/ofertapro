import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { GLASS } from '../theme/theme';

// TODO: podłącz Firebase Auth — instrukcja w README.md
export default function LoginScreen({ navigation }: any) {
  const company = useStore(s => s.company);

  const handleGoogleSignIn = async () => {
    // TODO: GoogleSignin.signIn() + Firebase
    navigation.replace(company ? 'Main' : 'Onboarding');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Hero */}
      <View style={styles.hero} accessibilityRole="none">
        <View style={styles.iconBox} accessibilityElementsHidden>
          <Ionicons name="document-text-outline" size={40} color="#FFFFFF" />
        </View>
        <Text style={styles.appTitle} allowFontScaling accessibilityRole="header">
          OfertaPro
        </Text>
        <Text style={styles.tagline} allowFontScaling>
          Profesjonalne oferty dla rzemieślników.{'\n'}Gotowe w 5 minut.
        </Text>
      </View>

      {/* Auth section */}
      <View style={styles.authSection}>
        {/* Google sign-in */}
        <Pressable
          onPress={handleGoogleSignIn}
          accessibilityRole="button"
          accessibilityLabel="Zaloguj się przez Google"
          style={({ pressed }) => [styles.googleBtn, pressed && styles.googleBtnPressed]}
        >
          <Ionicons name="logo-google" size={20} color="#EA4335" accessibilityElementsHidden />
          <Text style={styles.googleBtnLabel} allowFontScaling>
            Zaloguj się przez Google
          </Text>
        </Pressable>

        {/* Email / guest */}
        <Pressable
          onPress={() => navigation.replace(company ? 'Main' : 'Onboarding')}
          accessibilityRole="button"
          accessibilityLabel="Użyj email i hasła"
          style={({ pressed }) => [styles.emailBtn, pressed && { backgroundColor: 'rgba(0,0,0,0.04)' }]}
        >
          <Text style={styles.emailBtnLabel} allowFontScaling>Użyj email i hasła</Text>
        </Pressable>

        <Text style={styles.terms} allowFontScaling accessibilityRole="text">
          Logując się akceptujesz Regulamin i Politykę Prywatności
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 24,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBox: {
    width: 80,
    height: 80,
    backgroundColor: '#007AFF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  appTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 17,
    color: '#636366',
    textAlign: 'center',
    lineHeight: 24,
  },
  authSection: {
    paddingBottom: 16,
    gap: 12,
  },
  googleBtn: {
    backgroundColor: GLASS.card,
    borderRadius: 999,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 0.5,
    borderColor: GLASS.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
    paddingHorizontal: 20,
  },
  googleBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  googleBtnLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.3,
  },
  emailBtn: {
    borderWidth: 0.5,
    borderColor: 'rgba(60,60,67,0.22)',
    borderRadius: 999,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
  },
  emailBtnLabel: {
    fontSize: 17,
    color: '#007AFF',
    letterSpacing: -0.2,
  },
  terms: {
    textAlign: 'center',
    fontSize: 13,
    color: '#AEAEB2',
    marginTop: 4,
    lineHeight: 18,
  },
});
