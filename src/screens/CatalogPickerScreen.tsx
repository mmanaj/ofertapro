import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Button, Text, Chip, Divider, Searchbar, Checkbox } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';
import { COLORS } from '../theme/theme';
import CatalogItemDrawer from '../components/CatalogItemDrawer';
import type { CatalogItem, PositionCategory } from '../types';

export default function CatalogPickerScreen({ navigation, route }: any) {
  const { offerId, category: initialCategory } = route.params as {
    offerId: string;
    category: PositionCategory;
  };

  const catalog = useStore(s => s.catalog);
  const addPosition = useStore(s => s.addPosition);
  const addCatalogItem = useStore(s => s.addCatalogItem);

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<PositionCategory>(initialCategory);
  const [selectedMaterial, setSelectedMaterial] = useState<Set<string>>(new Set());
  const [selectedLabor, setSelectedLabor] = useState<Set<string>>(new Set());
  const [addCatalogVisible, setAddCatalogVisible] = useState(false);

  const currentSelected = filterCategory === 'material' ? selectedMaterial : selectedLabor;
  const setCurrentSelected = filterCategory === 'material' ? setSelectedMaterial : setSelectedLabor;

  const filtered = catalog.filter(item => {
    const matchesCategory = item.category === filterCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (id: string) => {
    setCurrentSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalSelected = selectedMaterial.size + selectedLabor.size;

  const handleConfirm = () => {
    catalog
      .filter(item => selectedMaterial.has(item.id) || selectedLabor.has(item.id))
      .forEach(item => {
        addPosition(offerId, {
          category: item.category,
          name: item.name,
          quantity: 1,
          unit: item.defaultUnit,
          unitPriceNet: item.defaultUnitPriceNet,
          vatRate: item.defaultVatRate,
        });
      });
    navigation.goBack();
  };

  const handleAddCatalogSave = (data: Omit<CatalogItem, 'id'>) => {
    const id = addCatalogItem(data);
    setAddCatalogVisible(false);
    // Auto-select the newly added item
    if (data.category === 'material') {
      setSelectedMaterial(prev => new Set([...prev, id]));
    } else {
      setSelectedLabor(prev => new Set([...prev, id]));
    }
    // Switch filter to the category of the new item so user sees it
    setFilterCategory(data.category);
  };

  const formatPLN = (n: number) =>
    new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2 }).format(n) + ' zł';

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar */}
      <View style={styles.topbar}>
        <Button onPress={() => navigation.goBack()} labelStyle={{ color: COLORS.grey600 }}>
          ‹ Anuluj
        </Button>
        <Text variant="titleMedium" style={{ fontWeight: '700' }}>
          Wybierz z katalogu
        </Text>
        <Button
          mode="contained-tonal"
          onPress={() => setAddCatalogVisible(true)}
          compact
          style={{ borderRadius: 8 }}
          labelStyle={{ fontSize: 13 }}
        >
          + Katalog
        </Button>
      </View>

      {/* Category filter */}
      <View style={styles.filterRow}>
        {(['material', 'labor'] as PositionCategory[]).map(cat => (
          <Chip
            key={cat}
            selected={filterCategory === cat}
            onPress={() => setFilterCategory(cat)}
            style={{ marginRight: 8 }}
            compact
          >
            {cat === 'material' ? '🧱 Materiały' : '🔧 Robocizna'}
          </Chip>
        ))}
      </View>

      {/* Search */}
      <Searchbar
        placeholder="Szukaj w katalogu…"
        value={search}
        onChangeText={setSearch}
        style={styles.searchbar}
        inputStyle={{ fontSize: 14 }}
      />

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <Divider />}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          const isSelected = currentSelected.has(item.id);
          return (
            <View style={[styles.itemRow, isSelected && styles.itemRowSelected]}>
              <Checkbox
                status={isSelected ? 'checked' : 'unchecked'}
                onPress={() => toggleItem(item.id)}
                color={COLORS.primary}
              />
              <View style={styles.itemInfo} >
                <Text
                  variant="bodyMedium"
                  style={{ fontWeight: '700' }}
                  onPress={() => toggleItem(item.id)}
                >
                  {item.name}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: COLORS.grey600 }}
                  onPress={() => toggleItem(item.id)}
                >
                  {formatPLN(item.defaultUnitPriceNet)} / {item.defaultUnit} · VAT {item.defaultVatRate}%
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 44 }}>📦</Text>
            <Text variant="bodyLarge" style={{ color: COLORS.grey600, marginTop: 12, textAlign: 'center' }}>
              {search
                ? `Brak wyników dla „${search}"`
                : `Brak pozycji w katalogu.\nDodaj je przyciskiem "+ Katalog" powyżej.`}
            </Text>
          </View>
        }
      />

      {/* Confirm bar */}
      {totalSelected > 0 && (
        <View style={styles.confirmBar}>
          <Button
            mode="contained"
            onPress={handleConfirm}
            style={styles.confirmButton}
            contentStyle={{ paddingVertical: 6 }}
          >
            Dodaj {totalSelected} {totalSelected === 1 ? 'pozycję' : totalSelected < 5 ? 'pozycje' : 'pozycji'}
          </Button>
        </View>
      )}

      {/* Inline catalog item drawer */}
      <CatalogItemDrawer
        visible={addCatalogVisible}
        defaultCategory={filterCategory}
        onDismiss={() => setAddCatalogVisible(false)}
        onSave={handleAddCatalogSave}
      />
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
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.outline,
  },
  searchbar: {
    margin: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 0,
    borderWidth: 1,
    borderColor: COLORS.outline,
  },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  itemRowSelected: {
    backgroundColor: '#f0f4ff',
  },
  itemInfo: { flex: 1, gap: 2, marginLeft: 8 },
  empty: { alignItems: 'center', padding: 48 },
  confirmBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: COLORS.outline,
  },
  confirmButton: {
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
});
