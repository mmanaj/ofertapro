import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, TouchableOpacity,
  Image, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../store/useStore';
import { GLASS } from '../theme/theme';

function IOSField({
  label, value, onChangeText, placeholder, keyboardType, autoCapitalize, error, multiline,
}: any) {
  return (
    <View style={fieldStyles.wrapper}>
      <Text
        style={fieldStyles.label}
        allowFontScaling
        accessibilityRole="text"
      >
        {label}
      </Text>
      <View style={[fieldStyles.input, error && fieldStyles.inputError]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#AEAEB2"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'sentences'}
          style={[fieldStyles.textInput, multiline && { textAlignVertical: 'top' }]}
          clearButtonMode="whileEditing"
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          allowFontScaling
          accessibilityLabel={label}
          accessibilityHint={placeholder}
        />
      </View>
      {error ? (
        <Text
          style={fieldStyles.error}
          allowFontScaling
          accessibilityLiveRegion="polite"
          accessibilityRole="text"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrapper: { gap: 4, marginBottom: 12 },
  label: { fontSize: 12, color: '#636366', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
  input: {
    backgroundColor: GLASS.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: GLASS.border,
  },
  inputError: { borderWidth: 1, borderColor: '#FF3B30' },
  textInput: { flex: 1, fontSize: 17, color: '#000000' },
  error: { fontSize: 12, color: '#FF3B30', marginLeft: 2 },
});

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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.stepLabel} allowFontScaling accessibilityRole="text">Krok 1 z 1</Text>
          <Text style={styles.headTitle} allowFontScaling accessibilityRole="header">Dane Twojej firmy</Text>
          <Text style={styles.headSubtitle} allowFontScaling>
            Wypełnij raz — pojawią się na każdej ofercie automatycznie
          </Text>
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo picker */}
            <TouchableOpacity
              onPress={pickLogo}
              style={styles.logoPicker}
              accessibilityRole="button"
              accessibilityLabel={logoUri ? 'Zmień logo firmy' : 'Dodaj logo firmy'}
              accessibilityHint="Otwiera galerię zdjęć"
            >
              {logoUri ? (
                <Image source={{ uri: logoUri }} style={styles.logoImg} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Ionicons name="business-outline" size={28} color="#007AFF" accessibilityElementsHidden />
                  <Text style={styles.logoLabel} allowFontScaling>Logo</Text>
                  <Text style={styles.logoOptional} allowFontScaling>opcjonalne</Text>
                </View>
              )}
            </TouchableOpacity>

            <IOSField label="Nazwa firmy *" value={name} onChangeText={setName}
              placeholder="Jan Kowalski lub Firma XYZ" error={errors.name} />
            <IOSField label="Telefon *" value={phone} onChangeText={setPhone}
              placeholder="+48 000 000 000" keyboardType="phone-pad" autoCapitalize="none" error={errors.phone} />
            <IOSField label="Email *" value={email} onChangeText={setEmail}
              placeholder="firma@example.com" keyboardType="email-address" autoCapitalize="none" error={errors.email} />
            <IOSField label="NIP (opcjonalne)" value={nip} onChangeText={setNip}
              placeholder="000-000-00-00" keyboardType="numeric" autoCapitalize="none" />
            <IOSField label="Adres firmy (opcjonalne)" value={address} onChangeText={setAddress}
              placeholder="ul. Przykładowa 1, 00-000 Warszawa" multiline />
          </ScrollView>
        </TouchableWithoutFeedback>

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel="Zapisz dane i przejdź do aplikacji"
            style={({ pressed }) => [styles.saveBtn, pressed && { backgroundColor: '#0066DD' }]}
          >
            <Text style={styles.saveBtnLabel} allowFontScaling maxFontSizeMultiplier={1.2}>
              Zapisz i zacznij →
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    backgroundColor: GLASS.card,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: GLASS.separator,
  },
  stepLabel: { fontSize: 12, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  headTitle: { fontSize: 22, fontWeight: '700', color: '#000000', letterSpacing: -0.4 },
  headSubtitle: { fontSize: 15, color: '#636366', marginTop: 4 },
  scroll: { padding: 16, paddingBottom: 32 },
  logoPicker: { alignSelf: 'center', marginBottom: 24 },
  logoImg: { width: 100, height: 100, borderRadius: 18 },
  logoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: GLASS.card,
    borderWidth: 2,
    borderColor: '#C6C6C8',
    borderStyle: 'dashed',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  logoLabel: { fontSize: 12, color: '#007AFF', fontWeight: '600' },
  logoOptional: { fontSize: 10, color: '#AEAEB2' },
  footer: {
    padding: 16,
    backgroundColor: GLASS.card,
    borderTopWidth: 0.5,
    borderTopColor: GLASS.separator,
  },
  saveBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 999,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  saveBtnLabel: { fontSize: 17, fontWeight: '600', color: '#FFFFFF', letterSpacing: -0.3 },
});
