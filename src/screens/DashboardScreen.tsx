import React, { useCallback, useRef } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert, Text as RNText } from 'react-native';
import { FAB, Text, Searchbar, Surface, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import { useStore } from '../store/useStore';
import { COLORS } from '../theme/theme';
import type { Offer, OfferStatus } from '../types';

const STATUS_CONFIG: Record<OfferStatus, { label: string; color: string; bg: string }> = {
  draft:    { label: 'Szkic',    color: COLORS.grey600,   bg: COLORS.grey100 },
  sent:     { label: 'Wysłana',  color: COLORS.primary,   bg: COLORS.primaryContainer },
  accepted: { label: 'Przyjęta', color: COLORS.success,   bg: COLORS.successContainer },
  rejected: { label: 'Odrzucona',color: COLORS.error,     bg: COLORS.errorContainer },
};

const EMOJIS = ['🏠', '🌿', '🪟', '🏗️', '🔧', '🧱', '🪣', '🏡'];

function OfferRow({ offer, onPress, onDelete }: { offer: Offer; onPress: () => void; onDelete: () => void }) {
  const cfg = STATUS_CONFIG[offer.status];
  const emoji = EMOJIS[offer.clientName.charCodeAt(0) % EMOJIS.length];
  const gross = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(offer.totalGross);
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => {
        Alert.alert(
          'Usuń ofertę?',
          `${offer.clientName || offer.projectName} — tej operacji nie można cofnąć.`,
          [
            { text: 'Anuluj', onPress: () => swipeableRef.current?.close() },
            { text: 'Usuń', style: 'destructive', onPress: onDelete },
          ]
        );
      }}
    >
      <RNText style={{ fontSize: 22 }}>🗑️</RNText>
      <RNText style={styles.deleteActionText}>Usuń</RNText>
    </TouchableOpacity>
  );

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.row}>
        <View style={[styles.rowIcon, { backgroundColor: cfg.bg }]}>
          <Text style={{ fontSize: 20 }}>{emoji}</Text>
        </View>
        <View style={styles.rowBody}>
          <Text variant="titleSmall" style={{ fontWeight: '700' }}>{offer.clientName || '(brak klienta)'}</Text>
          <Text variant="bodySmall" style={{ color: COLORS.grey600 }} numberOfLines={1}>
            {offer.projectName} · {offer.number}
          </Text>
        </View>
        <View style={styles.rowRight}>
          <Text variant="titleSmall" style={{ fontWeight: '800' }}>{gross} zł</Text>
          <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
            <Text style={{ fontSize: 10, color: cfg.color, fontWeight: '700' }}>{cfg.label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

export default function DashboardScreen({ navigation }: any) {
  const offers = useStore(s => s.offers);
  const deleteOffer = useStore(s => s.deleteOffer);
  const [search, setSearch] = React.useState('');

  const filtered = offers.filter(o =>
    o.clientName.toLowerCase().includes(search.toLowerCase()) ||
    o.projectName.toLowerCase().includes(search.toLowerCase()) ||
    o.number.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    sent: offers.filter(o => o.status === 'sent').length,
    accepted: offers.filter(o => o.status === 'accepted').length,
    draft: offers.filter(o => o.status === 'draft').length,
  };

  if (offers.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.topbar}>
          <Text variant="headlineSmall" style={styles.title}>Moje oferty</Text>
        </View>
        <View style={styles.empty}>
          <Text style={{ fontSize: 64 }}>📄</Text>
          <Text variant="titleLarge" style={styles.emptyTitle}>Brak ofert</Text>
          <Text variant="bodyMedium" style={styles.emptyBody}>
            Stwórz pierwszą ofertę{'\n'}dla swojego klienta.
          </Text>
          <FAB
            icon="plus"
            label="Nowa oferta"
            style={[styles.emptyFab]}
            onPress={() => navigation.navigate('NewOffer', {})}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topbar}>
        <Text variant="headlineSmall" style={styles.title}>Moje oferty</Text>
      </View>

      {/* Stats strip */}
      <View style={styles.statsRow}>
        {[
          { label: 'Wysłane', value: stats.sent, color: COLORS.primary },
          { label: 'Przyjęte', value: stats.accepted, color: COLORS.success },
          { label: 'Szkice', value: stats.draft, color: COLORS.grey600 },
        ].map(s => (
          <View key={s.label} style={styles.statBox}>
            <Text variant="headlineSmall" style={{ fontWeight: '800', color: s.color }}>{s.value}</Text>
            <Text variant="bodySmall" style={{ color: COLORS.grey600 }}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Searchbar
        placeholder="Szukaj klienta, projektu..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
        inputStyle={{ fontSize: 14 }}
      />

      <FlatList
        data={filtered}
        keyExtractor={o => o.id}
        renderItem={({ item }) => (
          <OfferRow
            offer={item}
            onPress={() => navigation.navigate('OfferSummary', { offerId: item.id })}
            onDelete={() => deleteOffer(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <Divider />}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyLarge" style={{ color: COLORS.grey600 }}>
              Brak wyników dla „{search}"
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('NewOffer', {})}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topbar: {
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: COLORS.outline,
  },
  title: { fontWeight: '900' },
  statsRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: COLORS.outline,
    paddingVertical: 8,
  },
  statBox: {
    flex: 1, alignItems: 'center', paddingVertical: 6,
    backgroundColor: COLORS.grey50, marginHorizontal: 6, borderRadius: 10,
  },
  search: {
    margin: 12, borderRadius: 12, elevation: 1,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  rowIcon: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  rowBody: { flex: 1, gap: 2 },
  rowRight: { alignItems: 'flex-end', gap: 4 },
  deleteAction: {
    backgroundColor: COLORS.error,
    justifyContent: 'center', alignItems: 'center',
    width: 72, paddingHorizontal: 8,
  },
  deleteActionText: {
    color: '#fff', fontSize: 11, fontWeight: '700', marginTop: 2,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48 },
  emptyTitle: { fontWeight: '700', marginTop: 16 },
  emptyBody: { color: COLORS.grey600, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  emptyFab: { marginTop: 24, backgroundColor: COLORS.primary },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    backgroundColor: COLORS.primary,
  },
});
