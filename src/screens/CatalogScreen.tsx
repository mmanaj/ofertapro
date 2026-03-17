import React, { useRef, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, TouchableOpacity, Text as RNText } from 'react-native';
import {
  Text, FAB, Chip, Divider, Searchbar,
} from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';
import { COLORS } from '../theme/theme';
import CatalogItemDrawer from '../components/CatalogItemDrawer';
import type { CatalogItem, PositionCategory } from '../types';

// ─── CatalogRow ───────────────────────────────────────────────────────────────

function CatalogRow({
  item, onEdit, onDelete, formatPLN,
}: {
  item: CatalogItem;
  onEdit: () => void;
  onDelete: () => void;
  formatPLN: (n: number) => string;
}) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => {
        Alert.alert(
          'Usuń z katalogu?',
          item.name,
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
      <TouchableOpacity onPress={onEdit} activeOpacity={0.7} style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <Text variant="bodyMedium" style={{ fontWeight: '700' }}>{item.name}</Text>
          <Text variant="bodySmall" style={{ color: COLORS.grey600 }}>
            {item.category === 'material' ? '🧱' : '🔧'} {formatPLN(item.defaultUnitPriceNet)} / {item.defaultUnit} · VAT {item.defaultVatRate}%
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

// ─── CatalogScreen ────────────────────────────────────────────────────────────

export default function CatalogScreen() {
  const catalog = useStore(s => s.catalog);
  const addCatalogItem = useStore(s => s.addCatalogItem);
  const updateCatalogItem = useStore(s => s.updateCatalogItem);
  const deleteCatalogItem = useStore(s => s.deleteCatalogItem);

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | PositionCategory>('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | undefined>();

  const formatPLN = (n: number) =>
    new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2 }).format(n) + ' zł';

  const filtered = catalog.filter(item => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setDrawerVisible(true);
  };

  const handleDelete = (item: CatalogItem) => {
    deleteCatalogItem(item.id);
  };

  const handleSave = (data: Omit<CatalogItem, 'id'>) => {
    if (editingItem) {
      updateCatalogItem(editingItem.id, data);
    } else {
      addCatalogItem(data);
    }
    setDrawerVisible(false);
    setEditingItem(undefined);
  };

  const handleDismiss = () => {
    setDrawerVisible(false);
    setEditingItem(undefined);
  };

  const defaultCategory: PositionCategory =
    filterCategory === 'labor' ? 'labor' : 'material';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={{ fontWeight: '800' }}>
          📦 Katalog
        </Text>
        <Text variant="bodySmall" style={{ color: COLORS.grey600 }}>
          {catalog.length} pozycji
        </Text>
      </View>

      <Searchbar
        placeholder="Szukaj w katalogu…"
        value={search}
        onChangeText={setSearch}
        style={styles.searchbar}
        inputStyle={{ fontSize: 14 }}
      />

      <View style={styles.filterRow}>
        {(['all', 'material', 'labor'] as const).map(cat => (
          <Chip
            key={cat}
            selected={filterCategory === cat}
            onPress={() => setFilterCategory(cat)}
            style={{ marginRight: 6 }}
            compact
          >
            {cat === 'all' ? 'Wszystkie' : cat === 'material' ? '🧱 Materiały' : '🔧 Robocizna'}
          </Chip>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <Divider />}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <CatalogRow
            item={item}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item)}
            formatPLN={formatPLN}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 44 }}>📦</Text>
            <Text variant="bodyLarge" style={{ color: COLORS.grey600, marginTop: 12, textAlign: 'center' }}>
              {search
                ? `Brak wyników dla "${search}"`
                : 'Katalog jest pusty.\nDodaj często używane pozycje,\naby przyspieszyć tworzenie ofert.'}
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        label="Dodaj pozycję"
        style={styles.fab}
        onPress={() => {
          setEditingItem(undefined);
          setDrawerVisible(true);
        }}
      />

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
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: COLORS.outline,
  },
  searchbar: {
    margin: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 0,
    borderWidth: 1,
    borderColor: COLORS.outline,
  },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 8,
  },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  itemInfo: { flex: 1, gap: 2 },
  empty: { alignItems: 'center', padding: 48 },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    backgroundColor: COLORS.primary,
  },
  deleteAction: {
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
    paddingHorizontal: 8,
  },
  deleteActionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
});
