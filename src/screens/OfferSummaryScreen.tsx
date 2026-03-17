import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Text, Card, Chip, Divider, Menu, Surface, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';
import { COLORS } from '../theme/theme';
import type { OfferStatus } from '../types';

const STATUS_OPTIONS: { value: OfferStatus; label: string; color: string; emoji: string }[] = [
  { value: 'draft',    label: 'Szkic',     color: COLORS.grey400,   emoji: '📝' },
  { value: 'sent',     label: 'Wysłana',   color: COLORS.warning,   emoji: '📤' },
  { value: 'accepted', label: 'Przyjęta',  color: COLORS.success,   emoji: '✅' },
  { value: 'rejected', label: 'Odrzucona', color: COLORS.error,     emoji: '❌' },
];

function SummaryRow({ label, value, bold, large }: {
  label: string; value: string; bold?: boolean; large?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text
        variant={large ? 'bodyLarge' : 'bodyMedium'}
        style={{ color: COLORS.grey600, flex: 1 }}
      >
        {label}
      </Text>
      <Text
        variant={large ? 'bodyLarge' : 'bodyMedium'}
        style={{ fontWeight: bold ? '800' : '500' }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function OfferSummaryScreen({ navigation, route }: any) {
  const { offerId } = route.params;
  const offer = useStore(s => s.getOffer(offerId));
  const updateOffer = useStore(s => s.updateOffer);
  const deleteOffer = useStore(s => s.deleteOffer);
  const [menuVisible, setMenuVisible] = useState(false);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);

  if (!offer) return null;

  const formatPLN = (n: number) =>
    new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' zł';

  const currentStatus = STATUS_OPTIONS.find(s => s.value === offer.status)!;

  const handleStatusChange = (status: OfferStatus) => {
    updateOffer(offerId, { status });
    setMenuVisible(false);
  };

  const handleGeneratePdf = () => {
    navigation.navigate('PdfPreview', { offerId });
  };

  const handleDelete = () => {
    setMoreMenuVisible(false);
    Alert.alert(
      'Usuń ofertę?',
      'Tej operacji nie można cofnąć.',
      [
        { text: 'Anuluj' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: () => {
            deleteOffer(offerId);
            navigation.navigate('Main');
          },
        },
      ]
    );
  };

  const positionCount = offer.positions.length;
  const materialCount = offer.positions.filter(p => p.category === 'material').length;
  const laborCount = offer.positions.filter(p => p.category === 'labor').length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar */}
      <View style={styles.topbar}>
        <Button
          onPress={() => navigation.goBack()}
          labelStyle={{ color: COLORS.grey600 }}
        >
          ‹ Wróć
        </Button>
        <Text variant="titleMedium" style={{ fontWeight: '700' }}>Podsumowanie</Text>
        <Menu
          visible={moreMenuVisible}
          onDismiss={() => setMoreMenuVisible(false)}
          anchor={
            <Button
              onPress={() => setMoreMenuVisible(true)}
              labelStyle={{ fontSize: 22, color: COLORS.grey600, letterSpacing: 1 }}
            >
              ⋮
            </Button>
          }
        >
          <Menu.Item
            title="🗑️ Usuń ofertę"
            titleStyle={{ color: COLORS.error }}
            onPress={handleDelete}
          />
        </Menu>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Status chip */}
        <View style={styles.statusRow}>
          <Text variant="labelMedium" style={{ color: COLORS.grey600, marginRight: 8 }}>
            Status oferty:
          </Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Chip
                mode="flat"
                onPress={() => setMenuVisible(true)}
                style={{ backgroundColor: currentStatus.color + '22' }}
                textStyle={{ color: currentStatus.color, fontWeight: '700' }}
              >
                {currentStatus.emoji} {currentStatus.label}
              </Chip>
            }
          >
            {STATUS_OPTIONS.map(s => (
              <Menu.Item
                key={s.value}
                title={`${s.emoji} ${s.label}`}
                onPress={() => handleStatusChange(s.value)}
              />
            ))}
          </Menu>
        </View>

        {/* Offer info card */}
        <Card style={styles.card}>
          <Card.Content style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text variant="labelMedium" style={{ color: COLORS.grey600 }}>DANE OFERTY</Text>
              <IconButton
                icon="pencil"
                size={16}
                iconColor={COLORS.primary}
                style={{ margin: 0 }}
                onPress={() => navigation.navigate('NewOffer', { editOfferId: offerId })}
              />
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodySmall" style={{ color: COLORS.grey600 }}>Numer</Text>
              <Text variant="bodyMedium" style={{ fontWeight: '700' }}>{offer.number}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodySmall" style={{ color: COLORS.grey600 }}>Klient</Text>
              <Text variant="bodyMedium">{offer.clientName}</Text>
            </View>
            {offer.clientAddress ? (
              <View style={styles.infoRow}>
                <Text variant="bodySmall" style={{ color: COLORS.grey600 }}>Adres</Text>
                <Text variant="bodyMedium">{offer.clientAddress}</Text>
              </View>
            ) : null}
            <View style={styles.infoRow}>
              <Text variant="bodySmall" style={{ color: COLORS.grey600 }}>Projekt</Text>
              <Text variant="bodyMedium">{offer.projectName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodySmall" style={{ color: COLORS.grey600 }}>Ważna przez</Text>
              <Text variant="bodyMedium">{offer.validUntilDays} dni</Text>
            </View>
            {offer.paymentTerms ? (
              <View style={styles.infoRow}>
                <Text variant="bodySmall" style={{ color: COLORS.grey600 }}>Płatność</Text>
                <Text variant="bodyMedium">{offer.paymentTerms}</Text>
              </View>
            ) : null}
          </Card.Content>
        </Card>

        {/* Positions summary */}
        <Card style={styles.card}>
          <Card.Content style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text variant="labelMedium" style={{ color: COLORS.grey600 }}>POZYCJE ({positionCount})</Text>
              <IconButton
                icon="pencil"
                size={16}
                iconColor={COLORS.primary}
                style={{ margin: 0 }}
                onPress={() => navigation.navigate('OfferPositions', { offerId })}
              />
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodySmall" style={{ color: COLORS.grey600 }}>🧱 Materiały</Text>
              <Text variant="bodyMedium">{materialCount} pozycji</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodySmall" style={{ color: COLORS.grey600 }}>🔧 Robocizna</Text>
              <Text variant="bodyMedium">{laborCount} pozycji</Text>
            </View>
            <Divider style={{ marginVertical: 4 }} />
            <SummaryRow label="Materiały netto" value={formatPLN(offer.totalMaterialNet)} />
            <SummaryRow label="Robocizna netto" value={formatPLN(offer.totalLaborNet)} />
          </Card.Content>
        </Card>

        {/* Financial summary */}
        <Surface style={styles.totalCard} elevation={2}>
          <Text variant="labelMedium" style={{ color: COLORS.grey600, marginBottom: 12 }}>
            KALKULACJA KOŃCOWA
          </Text>
          <SummaryRow label="Suma netto" value={formatPLN(offer.totalNet)} />
          <SummaryRow label="VAT" value={formatPLN(offer.totalVat)} />
          <Divider style={{ marginVertical: 10 }} />
          <SummaryRow label="SUMA BRUTTO" value={formatPLN(offer.totalGross)} bold large />

          {offer.advancePercent ? (
            <>
              <Divider style={{ marginVertical: 10 }} />
              <SummaryRow
                label={`Zaliczka (${offer.advancePercent}%)`}
                value={formatPLN(offer.totalGross * offer.advancePercent / 100)}
              />
              <SummaryRow
                label="Pozostało do zapłaty"
                value={formatPLN(offer.totalGross * (1 - offer.advancePercent / 100))}
                bold
              />
            </>
          ) : null}
        </Surface>

        {/* Action buttons */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            icon="file-pdf-box"
            onPress={handleGeneratePdf}
            style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
          >
            Generuj PDF
          </Button>
        </View>

        {/* Duplicate */}
        <View style={styles.dangerZone}>
          <Button
            mode="text"
            icon="content-copy"
            onPress={() => navigation.navigate('NewOffer', { duplicateFromId: offerId })}
            labelStyle={{ color: COLORS.grey600, fontSize: 13 }}
          >
            Duplikuj ofertę
          </Button>
        </View>
      </ScrollView>
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
  scroll: { padding: 16, paddingBottom: 40, gap: 12 },
  statusRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', padding: 12, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.outline,
  },
  card: { borderRadius: 12, backgroundColor: '#fff' },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: 8,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  totalCard: {
    padding: 16, borderRadius: 12, backgroundColor: '#fff',
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionBtn: { flex: 1, borderRadius: 10 },
  dangerZone: { alignItems: 'center', marginTop: 8 },
});
