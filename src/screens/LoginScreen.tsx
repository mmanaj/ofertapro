import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme/theme';
import { useStore } from '../store/useStore';

// TODO: podłącz Firebase Auth — instrukcja w README.md
export default function LoginScreen({ navigation }: any) {
  const company = useStore(s => s.company);

  const handleGoogleSignIn = async () => {
    // TODO: GoogleSignin.signIn() + Firebase
    navigation.replace(company ? 'Main' : 'Onboarding');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoSection}>
        <View style={styles.iconBox}>
          <Text style={styles.iconEmoji}>📋</Text>
        </View>
        <Text variant="displaySmall" style={styles.appName}>OfertaPro</Text>
        <Text variant="bodyMedium" style={styles.tagline}>
          Profesjonalne oferty dla rzemieślników.{'\n'}Gotowe w 5 minut.
        </Text>
      </View>

      <View style={styles.authSection}>
        <Button
          mode="elevated"
          onPress={handleGoogleSignIn}
          style={styles.googleBtn}
          contentStyle={styles.googleBtnContent}
          icon={() => <Text style={{ fontSize: 18 }}>🅶</Text>}
          labelStyle={styles.googleLabel}
        >
          Zaloguj się przez Google
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.replace(company ? 'Main' : 'Onboarding')}
          style={styles.emailBtn}
          contentStyle={styles.btnContent}
          labelStyle={{ color: COLORS.grey600 }}
        >
          Użyj email i hasła
        </Button>

        <Text variant="bodySmall" style={styles.terms}>
          Logując się akceptujesz Regulamin i Politykę Prywatności
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 24,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBox: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  iconEmoji: { fontSize: 40 },
  appName: {
    fontWeight: '900',
    color: COLORS.grey900,
    marginBottom: 8,
  },
  tagline: {
    textAlign: 'center',
    color: COLORS.grey600,
    lineHeight: 22,
  },
  authSection: {
    paddingBottom: 16,
    gap: 12,
  },
  googleBtn: {
    borderRadius: 14,
    backgroundColor: '#fff',
    elevation: 2,
  },
  googleBtnContent: { height: 52 },
  googleLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.grey900,
  },
  emailBtn: {
    borderRadius: 14,
    borderColor: COLORS.grey200,
  },
  btnContent: { height: 52 },
  terms: {
    textAlign: 'center',
    color: COLORS.grey400,
    marginTop: 4,
  },
});
