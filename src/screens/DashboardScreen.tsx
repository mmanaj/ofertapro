import React, { useRef } from 'react';
import { View, Text, TextInput, SectionList, TouchableOpacity, Pressable, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';
import { GLASS } from '../theme/theme';
import { FLOATING_TAB_BAR_HEIGHT, FLOATING_TAB_BAR_BOTTOM_GAP } from '../navigation/AppNavigator';
import type { Offer, OfferStatus } from '../types';

const STATUS_CONFIG: Record<OfferStatus, { label: string; color: string; bg: string }> = {
  draft:    { label: 'Szkic',     color: '#636366', bg: 'rgba(99,99,102,0.08)' },
  sent:     { label: 'Wysłana',   color: '#007AFF', bg: 'rgba(0,122,255,0.10)' },
  accepted: { label: 'Przyjęta',  color: '#34C759', bg: 'rgba(52,199,89,0.10)'  },
  rejected: { label: 'Odrzucona', color: '#FF3B30', bg: 'rgba(255,59,48,0.10)'  },
};

// ─── Date grouping helpers ────────────────────────────────────────────────────
function getDateGroup(createdAt: string): string {
  const date = new Date(createdAt);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  // Start of the current week (Monday)
  const startOfWeek = new Date(todayStart);
  const dayOfWeek = startOfWeek.getDay(); // 0=Sun
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);

  const offerDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (offerDay >= todayStart) return 'Dziś';
  if (offerDay >= yesterdayStart) return 'Wczoraj';
  if (offerDay >= startOfWeek) return 'W tym tygodniu';

  return date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
}

function buildSections(offers: Offer[]): { title: string; data: Offer[] }[] {
  const groups = new Map<string, Offer[]>();
  const groupOrder: string[] = [];

  for (const offer of offers) {
    const group = getDateGroup(offer.createdAt);
    if (!groups.has(group)) {
      groups.set(group, []);
      groupOrder.push(group);
    }
    groups.get(group)!.push(offer);
  }

  return groupOrder.map(title => ({ title, data: groups.get(title)! }));
}

// ─── Offer row ────────────────────────────────────────────────────────────────
function OfferRow({ offer, onPress, onDelete }: { offer: Offer; onPress: () => void; onDelete: () => void }) {
  const cfg = STATUS_CONFIG[offer.status];
  const gross = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(offer.totalGross);
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => Alert.alert(
        'Usuń ofertę?',
        `${offer.clientName || offer.projectName} — tej operacji nie można cofnąć.`,
        [
          { text: 'Anuluj', onPress: () => swipeableRef.current?.close() },
          { text: 'Usuń', style: 'destructive', onPress: onDelete },
        ]
      )}
      accessibilityRole="button"
      accessibilityLabel={`Usuń ofertę ${offer.clientName || offer.projectName}`}
    >
      <Ionicons name="trash-outline" size={22} color="#FFFFFF" accessibilityElementsHidden />
      <Text style={styles.deleteLabel} allowFontScaling>Usuń</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.row}
        accessibilityRole="button"
        accessibilityLabel={`${offer.clientName || 'brak klienta'}, ${offer.projectName}, ${gross} zł, status: ${cfg.label}`}
        accessibilityHint="Kliknij, aby zobaczyć szczegóły oferty"
      >
        <View style={[styles.rowIcon, { backgroundColor: cfg.bg }]}>
          <Ionicons name="document-text-outline" size={22} color={cfg.color} accessibilityElementsHidden />
        </View>
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle} allowFontScaling numberOfLines={1}>
            {offer.clientName || '(brak klienta)'}
          </Text>
          <Text style={styles.rowSub} allowFontScaling numberOfLines={1}>
            {offer.projectName} · {offer.number}
          </Text>
        </View>
        <View style={styles.rowMeta}>
          <Text style={styles.rowAmount} allowFontScaling>{gross} zł</Text>
          <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.color }]} allowFontScaling>{cfg.label}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color="rgba(60,60,67,0.3)" accessibilityElementsHidden />
      </TouchableOpacity>
    </Swipeable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function DashboardScreen({ navigation }: any) {
  const offers = useStore(s => s.offers);
  const deleteOffer = useStore(s => s.deleteOffer);
  const [search, setSearch] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'sent' | 'accepted' | 'draft'>('all');
  const insets = useSafeAreaInsets();
  const fabBottom = Math.max(insets.bottom + FLOATING_TAB_BAR_BOTTOM_GAP, 20) + FLOATING_TAB_BAR_HEIGHT + 16;

  const stats = {
    sent: offers.filter(o => o.status === 'sent').length,
    accepted: offers.filter(o => o.status === 'accepted').length,
    draft: offers.filter(o => o.status === 'draft').length,
  };

  const filtered = offers.filter(o => {
    const matchesSearch =
      o.clientName.toLowerCase().includes(search.toLowerCase()) ||
      o.projectName.toLowerCase().includes(search.toLowerCase()) ||
      o.number.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'all' || o.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const sections = buildSections(filtered);

  const STAT_TILES: { label: string; value: number; color: string; key: 'all' | 'sent' | 'accepted' | 'draft' }[] = [
    { label: 'Wszystkie', value: offers.length,  color: '#007AFF', key: 'all'      },
    { label: 'Wysłane',   value: stats.sent,     color: '#007AFF', key: 'sent'     },
    { label: 'Przyjęte',  value: stats.accepted, color: '#34C759', key: 'accepted' },
    { label: 'Szkice',    value: stats.draft,    color: '#636366', key: 'draft'    },
  ];

  if (offers.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <BlurView intensity={65} tint="systemMaterial" style={styles.headerBlur}>
          <View style={styles.headerInner}>
            <Text style={styles.largeTitle} allowFontScaling accessibilityRole="header">Moje oferty</Text>
          </View>
        </BlurView>
        <View style={styles.empty} accessibilityRole="none">
          <Ionicons name="document-text-outline" size={64} color="#C6C6C8" accessibilityElementsHidden />
          <Text style={styles.emptyTitle} allowFontScaling accessibilityRole="header">Brak ofert</Text>
          <Text style={styles.emptyBody} allowFontScaling>
            Stwórz pierwszą ofertę{'\n'}dla swojego klienta.
          </Text>
          <Pressable
            onPress={() => navigation.navigate('NewOffer', {})}
            accessibilityRole="button"
            accessibilityLabel="Utwórz nową ofertę"
            style={styles.emptyBtn}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" accessibilityElementsHidden />
            <Text style={styles.emptyBtnLabel} allowFontScaling>Nowa oferta</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Glass header */}
      <BlurView intensity={65} tint="systemMaterial" style={styles.headerBlur}>
        <View style={styles.headerInner}>
          <Text style={styles.largeTitle} allowFontScaling accessibilityRole="header">Moje oferty</Text>
        </View>
      </BlurView>

      {/* Stats strip — tappable to filter */}
      <View style={styles.statsRow} accessibilityRole="none">
        {STAT_TILES.map(s => {
          const isActive = activeFilter === s.key;
          return (
            <Pressable
              key={s.key}
              onPress={() => setActiveFilter(s.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${s.label}: ${s.value}${isActive ? ', aktywny filtr' : ', kliknij, aby filtrować'}`}
              style={[
                styles.statCard,
                isActive
                  ? { backgroundColor: s.color, borderColor: s.color, borderWidth: 1.5 }
                  : undefined,
              ]}
            >
              <Text style={[styles.statValue, { color: isActive ? '#FFFFFF' : s.color }]} allowFontScaling>
                {s.value}
              </Text>
              <Text style={[styles.statLabel, { color: isActive ? 'rgba(255,255,255,0.85)' : '#636366' }]} allowFontScaling>
                {s.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="#8E8E93" accessibilityElementsHidden />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Szukaj klienta, projektu..."
            placeholderTextColor="#8E8E93"
            style={styles.searchInput}
            allowFontScaling
            accessibilityLabel="Szukaj ofert"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch('')}
              accessibilityRole="button"
              accessibilityLabel="Wyczyść wyszukiwanie"
              hitSlop={8}
            >
              <Ionicons name="close-circle" size={16} color="#8E8E93" />
            </Pressable>
          )}
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={o => o.id}
        renderItem={({ item }) => (
          <OfferRow
            offer={item}
            onPress={() => navigation.navigate('OfferSummary', { offerId: item.id })}
            onDelete={() => deleteOffer(item.id)}
          />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText} allowFontScaling accessibilityRole="header">
              {section.title}
            </Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: fabBottom + 20 }}
        ListHeaderComponent={() => <View style={{ height: 4 }} />}
        ListEmptyComponent={
          <View style={styles.noResults}>
            <Text style={styles.noResultsText} allowFontScaling>
              {activeFilter !== 'all' && !search
                ? 'Brak ofert z wybranym statusem'
                : `Brak wyników dla „${search}"`}
            </Text>
          </View>
        }
        stickySectionHeadersEnabled={false}
      />

      {/* Glass FAB */}
      <Pressable
        onPress={() => navigation.navigate('NewOffer', {})}
        accessibilityRole="button"
        accessibilityLabel="Utwórz nową ofertę"
        style={[styles.fab, { bottom: fabBottom }]}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" accessibilityElementsHidden />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  headerBlur: { overflow: 'hidden', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: GLASS.separator },
  headerInner: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: GLASS.navBar },
  largeTitle: { fontSize: 28, fontWeight: '700', color: '#000000', letterSpacing: -0.5 },

  // Stats strip
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: GLASS.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: GLASS.separator,
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(242,242,247,0.8)',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: GLASS.border,
  },
  statValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 12, color: '#636366' },

  // Search
  searchRow: { paddingHorizontal: 16, paddingVertical: 8 },
  searchBar: {
    backgroundColor: 'rgba(229,229,234,0.9)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 36,
    gap: 6,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#000000' },

  // Section header
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    backgroundColor: '#F2F2F7',
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636366',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // Offer row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: GLASS.card,
    minHeight: 44,
  },
  rowIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rowContent: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 17, fontWeight: '600', color: '#000000', letterSpacing: -0.3 },
  rowSub: { fontSize: 13, color: '#636366' },
  rowMeta: { alignItems: 'flex-end', gap: 4, marginRight: 6 },
  rowAmount: { fontSize: 15, fontWeight: '700', color: '#000000' },
  statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: GLASS.separator, marginLeft: 72 },

  // Empty / no results
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#000000', marginTop: 16, letterSpacing: -0.4 },
  emptyBody: { fontSize: 17, color: '#636366', textAlign: 'center', marginTop: 8, lineHeight: 24 },
  emptyBtn: {
    marginTop: 24,
    backgroundColor: '#007AFF',
    borderRadius: 999,
    paddingHorizontal: 24,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  emptyBtnLabel: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
  noResults: { padding: 32, alignItems: 'center' },
  noResultsText: { fontSize: 17, color: '#636366' },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },

  // Delete swipe
  deleteAction: {
    backgroundColor: '#FF3B30',
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteLabel: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', marginTop: 2 },
});
