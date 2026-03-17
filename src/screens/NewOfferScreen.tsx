import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useStore } from '../store/useStore';
import GlassNavBar from '../components/GlassNavBar';
import { GLASS } from '../theme/theme';

function IOSField({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize, error, multiline, right }: any) {
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label} allowFontScaling accessibilityRole="text">{label}</Text>
      <View style={[fieldStyles.input, error && fieldStyles.inputError, multiline && { paddingTop: 12, paddingBottom: 12 }]}>
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
        />
        {right ? <Text style={fieldStyles.suffix} allowFontScaling>{right}</Text> : null}
      </View>
      {error ? (
        <Text style={fieldStyles.error} allowFontScaling accessibilityLiveRegion="polite">{error}</Text>
      ) : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  label: { fontSize: 12, color: '#636366', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600', marginBottom: 4 },
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
  textInput: { flex: 1, fontSize: 17, color: '#000000', textAlignVertical: 'center' },
  suffix: { fontSize: 15, color: '#636366', marginLeft: 4 },
  error: { fontSize: 12, color: '#FF3B30', marginTop: 2, marginLeft: 2 },
});

export default function NewOfferScreen({ navigation, route }: any) {
  const { duplicateFromId, editOfferId } = route.params ?? {};
  const addOffer = useStore(s => s.addOffer);
  const updateOffer = useStore(s => s.updateOffer);
  const getOffer = useStore(s => s.getOffer);
  const duplicateOffer = useStore(s => s.duplicateOffer);
  const settings = useStore(s => s.settings);

  const source = editOfferId ? getOffer(editOfferId) : duplicateFromId ? getOffer(duplicateFromId) : null;

  const allValidDays = [...new Set([14, 30, 60, ...(settings.customValidDays ?? [])])].sort((a, b) => a - b);
  const VALID_DAYS_OPTIONS = allValidDays.map(d => ({ value: String(d), label: `${d} dni` }));

  const [clientName, setClientName] = useState(source?.clientName ?? '');
  const [clientAddress, setClientAddress] = useState(source?.clientAddress ?? '');
  const [projectName, setProjectName] = useState(source?.projectName ?? '');
  const [projectDescription, setProjectDescription] = useState(source?.projectDescription ?? '');
  const [validUntilDays, setValidUntilDays] = useState(String(source?.validUntilDays ?? settings.defaultValidDays));
  const [paymentTerms, setPaymentTerms] = useState(source?.paymentTerms ?? '');
  const [advancePercent, setAdvancePercent] = useState(source?.advancePercent ? String(source.advancePercent) : '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!clientName.trim()) e.clientName = 'Podaj nazwę klienta';
    if (!projectName.trim()) e.projectName = 'Podaj nazwę projektu';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    const data = {
      clientName: clientName.trim(),
      clientAddress: clientAddress.trim(),
      projectName: projectName.trim(),
      projectDescription: projectDescription.trim(),
      validUntilDays: parseInt(validUntilDays),
      paymentTerms: paymentTerms.trim(),
      advancePercent: advancePercent ? parseInt(advancePercent) : undefined,
    };

    if (editOfferId) {
      updateOffer(editOfferId, data);
      navigation.navigate('OfferSummary', { offerId: editOfferId });
      return;
    }

    let id: string;
    if (duplicateFromId) {
      id = duplicateOffer(duplicateFromId);
      updateOffer(id, data);
    } else {
      id = addOffer({ ...data, status: 'draft' });
    }
    navigation.navigate('OfferPositions', { offerId: id, fromCreation: true });
  };

  const selectedSegmentIndex = VALID_DAYS_OPTIONS.findIndex(o => o.value === validUntilDays);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Glass nav bar */}
        <GlassNavBar
          title={editOfferId ? 'Edytuj ofertę' : 'Nowa oferta'}
          leftElement={
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Anuluj"
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelLabel} allowFontScaling>Anuluj</Text>
            </Pressable>
          }
          rightElement={
            <Pressable
              onPress={handleNext}
              accessibilityRole="button"
              accessibilityLabel={editOfferId ? 'Zapisz zmiany' : 'Przejdź do dodawania pozycji'}
              style={styles.nextBtn}
            >
              <Text style={styles.nextLabel} allowFontScaling>Dalej →</Text>
            </Pressable>
          }
        />

        {/* Step indicator */}
        <View style={styles.stepRow} accessibilityLabel="Krok 2 z 4: Dane projektu" accessibilityRole="text">
          <View style={[styles.dot, { backgroundColor: '#34C759', width: 8 }]} />
          <View style={[styles.dot, { backgroundColor: '#007AFF', width: 20 }]} />
          <View style={[styles.dot, { backgroundColor: '#C6C6C8', width: 8 }]} />
          <View style={[styles.dot, { backgroundColor: '#C6C6C8', width: 8 }]} />
        </View>
        <Text style={styles.stepLabel} allowFontScaling accessibilityElementsHidden>
          Krok 2/4: Dane projektu
        </Text>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <IOSField label="Nazwa klienta *" value={clientName} onChangeText={setClientName}
            placeholder="Jan Kowalski lub Firma XYZ" error={errors.clientName} />
          <IOSField label="Adres realizacji" value={clientAddress} onChangeText={setClientAddress}
            placeholder="ul. Ogrodowa 5, Kraków" />
          <IOSField label="Nazwa projektu *" value={projectName} onChangeText={setProjectName}
            placeholder="np. Kostka brukowa — podjazd" error={errors.projectName} />
          <IOSField label="Opis / linki do materiałów" value={projectDescription}
            onChangeText={setProjectDescription}
            placeholder="Opcjonalnie: link do sklepu, opis materiałów, uwagi..." multiline />

          <Text style={styles.sectionLabel} allowFontScaling>Termin ważności oferty</Text>
          <SegmentedControl
            values={VALID_DAYS_OPTIONS.map(o => o.label)}
            selectedIndex={selectedSegmentIndex >= 0 ? selectedSegmentIndex : 0}
            onChange={(e) => setValidUntilDays(VALID_DAYS_OPTIONS[e.nativeEvent.selectedSegmentIndex]?.value ?? validUntilDays)}
            style={{ marginBottom: 16 }}
            accessibilityLabel="Termin ważności oferty"
          />

          <IOSField label="Zaliczka (%)" value={advancePercent} onChangeText={setAdvancePercent}
            placeholder="np. 30" keyboardType="numeric" autoCapitalize="none" right="%" />
          <IOSField label="Warunki płatności" value={paymentTerms} onChangeText={setPaymentTerms}
            placeholder="np. Przelew 14 dni od wystawienia" />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable
            onPress={handleNext}
            accessibilityRole="button"
            accessibilityLabel={editOfferId ? 'Zapisz zmiany' : 'Przejdź do dodawania pozycji'}
            style={({ pressed }) => [styles.primaryBtn, pressed && { backgroundColor: '#0066DD' }]}
          >
            <Text style={styles.primaryBtnLabel} allowFontScaling maxFontSizeMultiplier={1.2}>
              {editOfferId ? 'Zapisz' : 'Dodaj pozycje →'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  cancelBtn: { height: 44, justifyContent: 'center', paddingHorizontal: 4 },
  cancelLabel: { fontSize: 17, color: '#636366' },
  nextBtn: { height: 44, justifyContent: 'center', paddingHorizontal: 4 },
  nextLabel: { fontSize: 17, fontWeight: '600', color: '#007AFF' },
  stepRow: { flexDirection: 'row', gap: 6, justifyContent: 'center', paddingTop: 12, paddingBottom: 2 },
  dot: { height: 8, borderRadius: 4 },
  stepLabel: { textAlign: 'center', fontSize: 11, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  scroll: { padding: 16, paddingBottom: 32 },
  sectionLabel: { fontSize: 13, color: '#636366', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  footer: { padding: 16, backgroundColor: GLASS.card, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: GLASS.separator },
  primaryBtn: {
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
  primaryBtnLabel: { fontSize: 17, fontWeight: '600', color: '#FFFFFF', letterSpacing: -0.3 },
});
