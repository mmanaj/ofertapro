import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Button, Text, TextInput, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../store/useStore';
import { COLORS } from '../theme/theme';

export default function OnboardingScreen({ navigation }: any) {
  const setCompany = useStore(s => s.setCompany);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nip, setNip] = useState('');
  const [address, setAddress] = useState('');
  const [logoUri, setLogoUri] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pickLogo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Brak uprawnień', 'Potrzebujemy dostępu do zdjęć, aby dodać logo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setLogoUri(result.assets[0].uri);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Podaj nazwę firmy';
    if (!phone.trim()) e.phone = 'Podaj numer telefonu';
    if (!email.trim()) e.email = 'Podaj adres email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setCompany({ name: name.trim(), phone: phone.trim(), email: email.trim(), nip: nip.trim(), address: address.trim(), logoUri });
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
      <View style={styles.header}>
        <Text variant="labelSmall" style={styles.stepLabel}>Krok 1 z 1</Text>
        <Text variant="titleLarge" style={styles.title}>Dane Twojej firmy</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Wypełnij raz — pojawią się na każdej ofercie automatycznie
        </Text>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <TouchableOpacity onPress={pickLogo} style={styles.logoBox}>
          {logoUri ? (
            <Image source={{ uri: logoUri }} style={styles.logoImage} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={{ fontSize: 32 }}>🏢</Text>
              <Text variant="labelMedium" style={{ color: COLORS.primary, marginTop: 6, fontWeight: '700' }}>
                Dodaj logo
              </Text>
              <Text variant="labelSmall" style={{ color: COLORS.grey400 }}>opcjonalne · JPG, PNG</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
          <TextInput
            label="Nazwa firmy *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            error={!!errors.name}
            style={styles.input}
          />
          {errors.name && <HelperText type="error">{errors.name}</HelperText>}

          <TextInput
            label="Telefon *"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            error={!!errors.phone}
            style={styles.input}
          />
          {errors.phone && <HelperText type="error">{errors.phone}</HelperText>}

          <TextInput
            label="Email *"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!errors.email}
            style={styles.input}
          />
          {errors.email && <HelperText type="error">{errors.email}</HelperText>}

          <TextInput
            label="NIP (opcjonalne)"
            value={nip}
            onChangeText={setNip}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Adres firmy (opcjonalne)"
            value={address}
            onChangeText={setAddress}
            mode="outlined"
            style={styles.input}
          />
        </View>
      </ScrollView>
      </TouchableWithoutFeedback>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleSave}
          contentStyle={styles.btnContent}
          labelStyle={styles.btnLabel}
        >
          Zapisz i zacznij →
        </Button>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outline,
  },
  stepLabel: { color: COLORS.grey400, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontWeight: '800', color: COLORS.grey900 },
  subtitle: { color: COLORS.grey600, marginTop: 4, lineHeight: 20 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  logoBox: {
    alignSelf: 'center', marginBottom: 20,
    borderRadius: 16, overflow: 'hidden',
  },
  logoPlaceholder: {
    width: 120, height: 120,
    backgroundColor: '#fff',
    borderWidth: 2, borderColor: COLORS.outline,
    borderStyle: 'dashed', borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  logoImage: { width: 120, height: 120, borderRadius: 16 },
  form: { gap: 4 },
  input: { backgroundColor: '#fff', marginBottom: 4 },
  footer: {
    padding: 16, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: COLORS.outline,
  },
  btnContent: { height: 52 },
  btnLabel: { fontSize: 16, fontWeight: '700' },
});
