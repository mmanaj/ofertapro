import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Text, TextInput, SegmentedButtons, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';
import { COLORS } from '../theme/theme';

export default function NewOfferScreen({ navigation, route }: any) {
  const { duplicateFromId, editOfferId } = route.params ?? {};
  const addOffer = useStore(s => s.addOffer);
  const updateOffer = useStore(s => s.updateOffer);
  const getOffer = useStore(s => s.getOffer);
  const duplicateOffer = useStore(s => s.duplicateOffer);
  const settings = useStore(s => s.settings);

  const source = editOfferId
    ? getOffer(editOfferId)
    : duplicateFromId ? getOffer(duplicateFromId) : null;

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

    if (editOfferId) {
      updateOffer(editOfferId, {
        clientName: clientName.trim(),
        clientAddress: clientAddress.trim(),
        projectName: projectName.trim(),
        projectDescription: projectDescription.trim(),
        validUntilDays: parseInt(validUntilDays),
        paymentTerms: paymentTerms.trim(),
        advancePercent: advancePercent ? parseInt(advancePercent) : undefined,
      });
      navigation.navigate('OfferSummary', { offerId: editOfferId });
      return;
    }

    let id: string;

    if (duplicateFromId) {
      // Duplikacja: kopiuje pozycje ze źródłowej oferty, potem nadpisuje dane klienta
      id = duplicateOffer(duplicateFromId);
      updateOffer(id, {
        clientName: clientName.trim(),
        clientAddress: clientAddress.trim(),
        projectName: projectName.trim(),
        projectDescription: projectDescription.trim(),
        validUntilDays: parseInt(validUntilDays),
        paymentTerms: paymentTerms.trim(),
        advancePercent: advancePercent ? parseInt(advancePercent) : undefined,
      });
    } else {
      id = addOffer({
        clientName: clientName.trim(),
        clientAddress: clientAddress.trim(),
        projectName: projectName.trim(),
        projectDescription: projectDescription.trim(),
        validUntilDays: parseInt(validUntilDays),
        paymentTerms: paymentTerms.trim(),
        advancePercent: advancePercent ? parseInt(advancePercent) : undefined,
        status: 'draft',
      });
    }

    navigation.replace('OfferPositions', { offerId: id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.topbar}>
          <Button onPress={() => navigation.goBack()} labelStyle={{ color: COLORS.grey600 }}>
            Anuluj
          </Button>
          <Text variant="titleMedium" style={styles.topbarTitle}>{editOfferId ? 'Edytuj ofertę' : 'Nowa oferta'}</Text>
          <Button onPress={handleNext} labelStyle={{ fontWeight: '700' }}>
            Dalej →
          </Button>
        </View>

        {/* Step dots */}
        <View style={styles.steps}>
          <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
          <View style={[styles.dot, { backgroundColor: COLORS.primary, width: 20, borderRadius: 4 }]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <Text variant="labelSmall" style={styles.stepLabel}>Krok 2/4: Dane projektu</Text>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <TextInput
            label="Nazwa klienta *"
            value={clientName}
            onChangeText={setClientName}
            mode="outlined"
            error={!!errors.clientName}
            placeholder="Jan Kowalski lub Firma XYZ"
            style={styles.input}
          />
          {errors.clientName && <HelperText type="error">{errors.clientName}</HelperText>}

          <TextInput
            label="Adres realizacji"
            value={clientAddress}
            onChangeText={setClientAddress}
            mode="outlined"
            placeholder="ul. Ogrodowa 5, Kraków"
            style={styles.input}
          />

          <TextInput
            label="Nazwa projektu *"
            value={projectName}
            onChangeText={setProjectName}
            mode="outlined"
            error={!!errors.projectName}
            placeholder="np. Kostka brukowa — podjazd"
            style={styles.input}
          />
          {errors.projectName && <HelperText type="error">{errors.projectName}</HelperText>}

          <TextInput
            label="Opis / linki do materiałów"
            value={projectDescription}
            onChangeText={setProjectDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            placeholder="Opcjonalnie: link do sklepu, opis materiałów, uwagi..."
            style={styles.input}
          />

          <Text variant="labelLarge" style={styles.sectionLabel}>Termin ważności oferty</Text>
          <SegmentedButtons
            value={validUntilDays}
            onValueChange={setValidUntilDays}
            buttons={VALID_DAYS_OPTIONS}
            style={styles.segment}
          />

          <TextInput
            label="Zaliczka (%)"
            value={advancePercent}
            onChangeText={setAdvancePercent}
            mode="outlined"
            keyboardType="numeric"
            placeholder="np. 30"
            right={<TextInput.Affix text="%" />}
            style={styles.input}
          />

          <TextInput
            label="Warunki płatności"
            value={paymentTerms}
            onChangeText={setPaymentTerms}
            mode="outlined"
            placeholder="np. Przelew 14 dni od wystawienia"
            style={styles.input}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleNext}
            contentStyle={styles.btnContent}
            labelStyle={{ fontSize: 15, fontWeight: '700' }}
          >
            {editOfferId ? 'Zapisz' : 'Dodaj pozycje →'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: COLORS.outline, height: 52,
  },
  topbarTitle: { fontWeight: '700' },
  steps: {
    flexDirection: 'row', gap: 6, justifyContent: 'center', paddingTop: 12, paddingBottom: 4,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.outline },
  stepLabel: {
    textAlign: 'center', color: COLORS.grey400, marginBottom: 8,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 4, paddingBottom: 32 },
  input: { backgroundColor: '#fff', marginBottom: 4 },
  sectionLabel: { marginTop: 8, marginBottom: 6, color: COLORS.grey600, fontWeight: '700' },
  segment: { marginBottom: 12 },
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.outline },
  btnContent: { height: 52 },
});
