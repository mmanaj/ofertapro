import React from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActionSheetIOS, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import GlassNavBar from '../components/GlassNavBar';
import { GLASS } from '../theme/theme';
import type { OfferStatus } from '../types';

const STATUS_CONFIG: Record<OfferStatus, { label: string; color: string; bg: string }> = {
  draft:    { label: 'Szkic',     color: '#636366', bg: 'rgba(99,99,102,0.08)' },
  sent:     { label: 'Wysłana',   color: '#007AFF', bg: 'rgba(0,122,255,0.10)' },
  accepted: { label: 'Przyjęta',  color: '#34C759', bg: 'rgba(52,199,89,0.10)'  },
  rejected: { label: 'Odrzucona', color: '#FF3B30', bg: 'rgba(255,59,48,0.10)'  },
};

function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      style={styles.sectionHeader}
      allowFontScaling
      accessibilityRole="header"
    >
      {title}
    </Text>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={styles.infoRow}
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text style={styles.infoLabel} allowFontScaling>{label}</Text>
      <Text style={styles.infoValue} allowFontScaling>{value}</Text>
    </View>
  );
}

function RowDivider({ indent = 16 }: { indent?: number }) {
  return <View style={[styles.rowDivider, { marginLeft: indent }]} />;
}

function SummaryRow({ label, value, bold, large }: {
  label: string; value: string; bold?: boolean; large?: boolean;
}) {
  return (
    <View
      style={styles.summaryRow}
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text style={[styles.summaryLabel, large && styles.summaryLabelLarge, bold && styles.summaryLabelBold]} allowFontScaling>
        {label}
      </Text>
      <Text style={[styles.summaryValue, large && styles.summaryValueLarge, bold && styles.summaryValueBold]} allowFontScaling>
        {value}
      </Text>
    </View>
  );
}

export default function OfferSummaryScreen({ navigation, route }: any) {
  const { offerId, fromCreation } = route.params;
  const offer = useStore(s => s.getOffer(offerId));
  const updateOffer = useStore(s => s.updateOffer);
  const deleteOffer = useStore(s => s.deleteOffer);

  if (!offer) return null;

  const formatPLN = (n: number) =>
    new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' zł';

  const currentStatus = STATUS_CONFIG[offer.status];

  const handleStatusPress = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Anuluj', 'Szkic', 'Wysłana', 'Przyjęta', 'Odrzucona'],
        cancelButtonIndex: 0,
        title: 'Zmień status oferty',
      },
      (index) => {
        const statusMap: OfferStatus[] = ['draft', 'sent', 'accepted', 'rejected'];
        if (index > 0) updateOffer(offerId, { status: statusMap[index - 1] });
      }
    );
  };

  const handleMorePress = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Anuluj', 'Duplikuj ofertę', 'Usuń ofertę'],
        cancelButtonIndex: 0,
        destructiveButtonIndex: 2,
      },
      (index) => {
        if (index === 1) {
          navigation.navigate('NewOffer', { duplicateFromId: offerId });
        } else if (index === 2) {
          Alert.alert('Usuń ofertę?', 'Tej operacji nie można cofnąć.', [
            { text: 'Anuluj' },
            {
              text: 'Usuń',
              style: 'destructive',
              onPress: () => { deleteOffer(offerId); navigation.navigate('Main'); },
            },
          ]);
        }
      }
    );
  };

  const positionCount = offer.positions.length;
  const materialCount = offer.positions.filter(p => p.category === 'material').length;
  const laborCount = offer.positions.filter(p => p.category === 'labor').length;

  return (
    <SafeAreaView style={styles.container}>
      <GlassNavBar
        title="Podsumowanie"
        onBack={() => navigation.goBack()}
        backLabel="Wróć"
        rightElement={
          <Pressable
            onPress={handleMorePress}
            accessibilityRole="button"
            accessibilityLabel="Więcej opcji: duplikuj lub usuń ofertę"
            style={styles.moreBtn}
          >
            <Ionicons name="ellipsis-horizontal" size={22} color="#007AFF" accessibilityElementsHidden />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Status */}
        <View style={styles.statusCard}>
          <Pressable
            onPress={handleStatusPress}
            accessibilityRole="button"
            accessibilityLabel={`Status oferty: ${currentStatus.label}. Kliknij, aby zmienić`}
            style={styles.statusRow}
          >
            <Text style={styles.statusLabel} allowFontScaling>Status oferty</Text>
            <View style={styles.statusRight}>
              <View style={[styles.statusPill, { backgroundColor: currentStatus.bg }]}>
                <Text style={[styles.statusPillText, { color: currentStatus.color }]} allowFontScaling>
                  {currentStatus.label}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color="rgba(60,60,67,0.3)" accessibilityElementsHidden />
            </View>
          </Pressable>
        </View>

        {/* Offer info card */}
        <SectionHeader title="Dane oferty" />
        <View style={styles.card}>
          <InfoRow label="Numer" value={offer.number} />
          <RowDivider />
          <InfoRow label="Klient" value={offer.clientName} />
          {offer.clientAddress ? (
            <>
              <RowDivider />
              <InfoRow label="Adres" value={offer.clientAddress} />
            </>
          ) : null}
          <RowDivider />
          <InfoRow label="Projekt" value={offer.projectName} />
          <RowDivider />
          <InfoRow label="Ważna przez" value={`${offer.validUntilDays} dni`} />
          {offer.paymentTerms ? (
            <>
              <RowDivider />
              <InfoRow label="Płatność" value={offer.paymentTerms} />
            </>
          ) : null}
          <RowDivider indent={0} />
          <Pressable
            onPress={() => navigation.navigate('NewOffer', { editOfferId: offerId })}
            accessibilityRole="button"
            accessibilityLabel="Edytuj dane oferty"
            style={styles.cardAction}
          >
            <Ionicons name="pencil-outline" size={16} color="#007AFF" accessibilityElementsHidden />
            <Text style={styles.cardActionLabel} allowFontScaling>Edytuj dane oferty</Text>
          </Pressable>
        </View>

        {/* Positions */}
        <SectionHeader title={`Pozycje (${positionCount})`} />
        <View style={styles.card}>
          <InfoRow label="Materiały" value={`${materialCount} pozycji`} />
          <RowDivider />
          <InfoRow label="Robocizna" value={`${laborCount} pozycji`} />
          <RowDivider />
          <SummaryRow label="Materiały netto" value={formatPLN(offer.totalMaterialNet)} />
          <RowDivider />
          <SummaryRow label="Robocizna netto" value={formatPLN(offer.totalLaborNet)} />
          <RowDivider indent={0} />
          <Pressable
            onPress={() => navigation.navigate('OfferPositions', { offerId })}
            accessibilityRole="button"
            accessibilityLabel="Edytuj pozycje oferty"
            style={styles.cardAction}
          >
            <Ionicons name="list-outline" size={16} color="#007AFF" accessibilityElementsHidden />
            <Text style={styles.cardActionLabel} allowFontScaling>Edytuj pozycje</Text>
          </Pressable>
        </View>

        {/* Financial summary */}
        <SectionHeader title="Kalkulacja końcowa" />
        <View style={styles.card}>
          <SummaryRow label="Suma netto" value={formatPLN(offer.totalNet)} />
          <RowDivider />
          <SummaryRow label="VAT" value={formatPLN(offer.totalVat)} />
          <RowDivider indent={0} />
          <SummaryRow label="Suma brutto" value={formatPLN(offer.totalGross)} bold large />
          {offer.advancePercent ? (
            <>
              <RowDivider />
              <SummaryRow
                label={`Zaliczka (${offer.advancePercent}%)`}
                value={formatPLN(offer.totalGross * offer.advancePercent / 100)}
              />
              <RowDivider />
              <SummaryRow
                label="Pozostało do zapłaty"
                value={formatPLN(offer.totalGross * (1 - offer.advancePercent / 100))}
                bold
              />
            </>
          ) : null}
        </View>

        {/* Action buttons */}
        <View style={styles.actionsWrapper}>
          <Pressable
            onPress={() => navigation.navigate('PdfPreview', { offerId })}
            accessibilityRole="button"
            accessibilityLabel="Generuj i udostępnij PDF oferty"
            style={({ pressed }) => [styles.pdfBtn, pressed && { backgroundColor: '#0066DD' }]}
          >
            <Ionicons name="document-text-outline" size={20} color="#FFFFFF" accessibilityElementsHidden />
            <Text style={styles.pdfBtnLabel} allowFontScaling maxFontSizeMultiplier={1.2}>Generuj PDF</Text>
          </Pressable>
          {fromCreation && (
            <Pressable
              onPress={() => navigation.navigate('Main')}
              accessibilityRole="button"
              accessibilityLabel="Zapisz ofertę i przejdź do listy ofert"
              style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#007AFF" accessibilityElementsHidden />
              <Text style={styles.saveBtnLabel} allowFontScaling maxFontSizeMultiplier={1.2}>Zapisz ofertę</Text>
            </Pressable>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  moreBtn: { width: 44, height: 44, alignItems: 'flex-end', justifyContent: 'center', paddingRight: 4 },
  scrollContent: { paddingBottom: 48 },

  // Status card
  statusCard: { marginHorizontal: 16, marginTop: 16 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GLASS.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    borderWidth: 0.5,
    borderColor: GLASS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  statusLabel: { fontSize: 15, color: '#636366' },
  statusRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusPillText: { fontSize: 13, fontWeight: '700' },

  // Section header
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636366',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 6,
    marginHorizontal: 16,
  },

  // Card
  card: {
    marginHorizontal: 16,
    backgroundColor: GLASS.card,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: GLASS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: GLASS.separator },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  infoLabel: { fontSize: 15, color: '#636366', flexShrink: 0 },
  infoValue: { fontSize: 15, color: '#000000', fontWeight: '500', textAlign: 'right', flex: 1 },

  // Summary rows
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  summaryLabel: { fontSize: 15, color: '#636366', fontWeight: '400' },
  summaryLabelLarge: { fontSize: 17, color: '#000000' },
  summaryLabelBold: { fontWeight: '700' },
  summaryValue: { fontSize: 15, color: '#000000', fontWeight: '500' },
  summaryValueLarge: { fontSize: 17 },
  summaryValueBold: { fontWeight: '800' },

  // Card action
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    minHeight: 44,
  },
  cardActionLabel: { fontSize: 15, color: '#007AFF' },

  // Action buttons
  actionsWrapper: { paddingHorizontal: 16, marginTop: 24, gap: 10 },
  pdfBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 999,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  pdfBtnLabel: { fontSize: 17, fontWeight: '600', color: '#FFFFFF', letterSpacing: -0.3 },
  saveBtn: {
    height: 52,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0,122,255,0.06)',
  },
  saveBtnLabel: { fontSize: 17, fontWeight: '600', color: '#007AFF', letterSpacing: -0.3 },
});
