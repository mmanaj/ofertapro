import React, { useRef, useState } from 'react';
import { View, Text, TextInput, FlatList, Alert, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';
import CatalogItemDrawer from '../components/CatalogItemDrawer';
import { GLASS } from '../theme/theme';
import { FLOATING_TAB_BAR_HEIGHT, FLOATING_TAB_BAR_BOTTOM_GAP } from '../navigation/AppNavigator';
import type { CatalogItem, PositionCategory } from '../types';

function CatalogRow({ item, onEdit, onDelete, formatPLN }: {
  item: CatalogItem; onEdit: () => void; onDelete: () => void; formatPLN: (n: number) => string;
}) {
  const swipeableRef = useRef<Swipeable>(null);

  const isMaterial = item.category === 'material';
  const iconName = isMaterial ? 'layers-outline' : 'hammer-outline';
  const iconColor = isMaterial ? '#FF9500' : '#34C759';
  const iconBg = isMaterial ? 'rgba(255,149,0,0.10)' : 'rgba(52,199,89,0.10)';

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => Alert.alert('Usuń z katalogu?', item.name, [
        { text: 'Anuluj', onPress: () => swipeableRef.current?.close() },
        { text: 'Usuń', style: 'destructive', onPress: onDelete },
      ])}
      accessibilityRole="button"
      accessibilityLabel={`Usuń ${item.name} z katalogu`}
    >
      <Ionicons name="trash-outline" size={22} color="#FFFFFF" accessibilityElementsHidden />
      <Text style={styles.deleteLabel} allowFontScaling>Usuń</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
      <TouchableOpacity
        onPress={onEdit}
        activeOpacity={0.7}
        style={styles.itemRow}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${formatPLN(item.defaultUnitPriceNet)} za ${item.defaultUnit}, VAT ${item.defaultVatRate}%`}
        accessibilityHint="Kliknij, aby edytować pozycję katalogu"
      >
        <View style={[styles.itemIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={iconName} size={18} color={iconColor} accessibilityElementsHidden />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemName} allowFontScaling numberOfLines={1}>{item.name}</Text>
          <Text style={styles.itemSub} allowFontScaling>
            {formatPLN(item.defaultUnitPriceNet)} / {item.defaultUnit} · VAT {item.defaultVatRate}%
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="rgba(60,60,67,0.3)" accessibilityElementsHidden />
      </TouchableOpacity>
    </Swipeable>
  );
}

export default function CatalogScreen() {
  const catalog = useStore(s => s.catalog);
  const addCatalogItem = useStore(s => s.addCatalogItem);
  const updateCatalogItem = useStore(s => s.updateCatalogItem);
  const deleteCatalogItem = useStore(s => s.deleteCatalogItem);

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | PositionCategory>('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | undefined>();
  const insets = useSafeAreaInsets();
  const fabBottom = Math.max(insets.bottom + FLOATING_TAB_BAR_BOTTOM_GAP, 20) + FLOATING_TAB_BAR_HEIGHT + 16;

  const formatPLN = (n: number) =>
    new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2 }).format(n) + ' zł';

  const filtered = catalog.filter(item => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleEdit = (item: CatalogItem) => { setEditingItem(item); setDrawerVisible(true); };
  const handleDelete = (item: CatalogItem) => { deleteCatalogItem(item.id); };

  const handleSave = (data: Omit<CatalogItem, 'id'>) => {
    if (editingItem) {
      updateCatalogItem(editingItem.id, data);
    } else {
      addCatalogItem(data);
    }
    setDrawerVisible(false);
    setEditingItem(undefined);
  };

  const handleDismiss = () => { setDrawerVisible(false); setEditingItem(undefined); };

  const defaultCategory: PositionCategory = filterCategory === 'labor' ? 'labor' : 'material';

  const filterOptions = [
    { key: 'all' as const, label: 'Wszystkie' },
    { key: 'material' as const, label: 'Materiały' },
    { key: 'labor' as const, label: 'Robocizna' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Large title header with blur */}
      <BlurView intensity={65} tint="systemMaterial" style={styles.headerBlur}>
        <View style={styles.headerInner}>
          <Text style={styles.largeTitle} allowFontScaling accessibilityRole="header">Katalog</Text>
          <Text style={styles.headerCount} allowFontScaling accessibilityElementsHidden>
            {catalog.length} pozycji
          </Text>
        </View>
      </BlurView>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="#8E8E93" accessibilityElementsHidden />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Szukaj w katalogu…"
            placeholderTextColor="#8E8E93"
            style={styles.searchInput}
            allowFontScaling
            accessibilityLabel="Szukaj pozycji w katalogu"
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

      {/* Filter pills */}
      <View style={styles.filterRow} accessibilityRole="radiogroup" accessibilityLabel="Filtruj kategorie">
        {filterOptions.map(opt => {
          const isActive = filterCategory === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => setFilterCategory(opt.key)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isActive }}
              accessibilityLabel={opt.label}
              style={[styles.filterPill, isActive && styles.filterPillActive]}
            >
              <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]} allowFontScaling>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        extraData={filterCategory}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: fabBottom + 20 }}
        renderItem={({ item }) => (
          <CatalogRow
            item={item}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item)}
            formatPLN={formatPLN}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState} accessibilityRole="none">
            <Ionicons name="cube-outline" size={48} color="#C6C6C8" accessibilityElementsHidden />
            <Text style={styles.emptyText} allowFontScaling>
              {search
                ? `Brak wyników dla „${search}"`
                : 'Katalog jest pusty.\nDodaj często używane pozycje,\naby przyspieszyć tworzenie ofert.'}
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <Pressable
        onPress={() => { setEditingItem(undefined); setDrawerVisible(true); }}
        accessibilityRole="button"
        accessibilityLabel="Dodaj nową pozycję do katalogu"
        style={[styles.fab, { bottom: fabBottom }]}
      >
        <Ionicons name="add" size={22} color="#FFFFFF" accessibilityElementsHidden />
        <Text style={styles.fabLabel} allowFontScaling maxFontSizeMultiplier={1.2}>Dodaj pozycję</Text>
      </Pressable>

      <CatalogItemDrawer
        visible={drawerVisible}
        initial={editingItem}
        defaultCategory={defaultCategory}
        onDismiss={handleDismiss}
        onSave={handleSave}
        onDelete={editingItem ? () => { handleDelete(editingItem); handleDismiss(); } : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },

  // Header
  headerBlur: {
    overflow: 'hidden',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: GLASS.separator,
  },
  headerInner: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: GLASS.navBar,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  largeTitle: { fontSize: 34, fontWeight: '700', color: '#000000', letterSpacing: -0.5 },
  headerCount: { fontSize: 13, color: '#636366' },

  // Search
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: GLASS.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: GLASS.separator,
  },
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

  // Filter pills
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: GLASS.card,
    minHeight: 34,
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: GLASS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  filterPillActive: {
    backgroundColor: '#007AFF',
    borderColor: 'rgba(0,122,255,0.3)',
  },
  filterPillText: { fontSize: 13, fontWeight: '600', color: '#636366' },
  filterPillTextActive: { color: '#FFFFFF' },

  // List
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: GLASS.separator, marginLeft: 64 },

  // Item row
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: GLASS.card,
    minHeight: 44,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: { flex: 1, gap: 2 },
  itemName: { fontSize: 17, fontWeight: '600', color: '#000000', letterSpacing: -0.3 },
  itemSub: { fontSize: 13, color: '#636366' },

  // Delete swipe
  deleteAction: {
    backgroundColor: '#FF3B30',
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteLabel: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', marginTop: 2 },

  // Empty state
  emptyState: { alignItems: 'center', padding: 48 },
  emptyText: { fontSize: 17, color: '#636366', marginTop: 12, textAlign: 'center', lineHeight: 24 },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    paddingHorizontal: 20,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabLabel: { fontSize: 17, fontWeight: '600', color: '#FFFFFF', letterSpacing: -0.3 },
});
