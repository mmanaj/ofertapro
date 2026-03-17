import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import CatalogItemDrawer from '../components/CatalogItemDrawer';
import GlassNavBar from '../components/GlassNavBar';
import { GLASS } from '../theme/theme';
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
    if (data.category === 'material') {
      setSelectedMaterial(prev => new Set([...prev, id]));
    } else {
      setSelectedLabor(prev => new Set([...prev, id]));
    }
    setFilterCategory(data.category);
  };

  const formatPLN = (n: number) =>
    new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2 }).format(n) + ' zł';

  const pluralForm = (n: number) => {
    if (n === 1) return 'pozycję';
    if (n >= 2 && n <= 4) return 'pozycje';
    return 'pozycji';
  };

  const filterLabels: Record<PositionCategory, string> = {
    material: 'Materiały',
    labor: 'Robocizna',
  };

  return (
    <SafeAreaView style={styles.container}>
      <GlassNavBar
        title="Wybierz z katalogu"
        leftElement={
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Anuluj i wróć"
            style={styles.cancelBtn}
          >
            <Text style={styles.cancelLabel} allowFontScaling>Anuluj</Text>
          </Pressable>
        }
        rightElement={
          <Pressable
            onPress={() => setAddCatalogVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Dodaj nową pozycję do katalogu"
            style={styles.addCatalogBtn}
          >
            <Text style={styles.addCatalogLabel} allowFontScaling>+ Katalog</Text>
          </Pressable>
        }
      />

      {/* Category filter pills */}
      <View style={styles.filterRow} accessibilityRole="radiogroup" accessibilityLabel="Kategoria pozycji">
        {(['material', 'labor'] as PositionCategory[]).map(cat => {
          const isActive = filterCategory === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => setFilterCategory(cat)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isActive }}
              accessibilityLabel={filterLabels[cat]}
              style={[styles.filterPill, isActive && styles.filterPillActive]}
            >
              <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]} allowFontScaling>
                {filterLabels[cat]}
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

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isSelected = currentSelected.has(item.id);
          return (
            <Pressable
              onPress={() => toggleItem(item.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`${item.name}, ${formatPLN(item.defaultUnitPriceNet)} za ${item.defaultUnit}, VAT ${item.defaultVatRate}%`}
              style={styles.itemRow}
            >
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" accessibilityElementsHidden />
                )}
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemName} allowFontScaling numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemSub} allowFontScaling>
                  {formatPLN(item.defaultUnitPriceNet)} / {item.defaultUnit} · VAT {item.defaultVatRate}%
                </Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState} accessibilityRole="none">
            <Ionicons name="cube-outline" size={48} color="#C6C6C8" accessibilityElementsHidden />
            <Text style={styles.emptyText} allowFontScaling>
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
          <Pressable
            onPress={handleConfirm}
            accessibilityRole="button"
            accessibilityLabel={`Dodaj ${totalSelected} ${pluralForm(totalSelected)} do oferty`}
            style={({ pressed }) => [styles.confirmBtn, pressed && { backgroundColor: '#0066DD' }]}
          >
            <Text style={styles.confirmBtnLabel} allowFontScaling maxFontSizeMultiplier={1.2}>
              Dodaj {totalSelected} {pluralForm(totalSelected)}
            </Text>
          </Pressable>
        </View>
      )}

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
  container: { flex: 1, backgroundColor: '#F2F2F7' },

  // Nav bar buttons
  cancelBtn: { height: 44, justifyContent: 'center', paddingHorizontal: 4 },
  cancelLabel: { fontSize: 17, color: '#636366' },
  addCatalogBtn: { height: 44, justifyContent: 'center', paddingHorizontal: 4 },
  addCatalogLabel: { fontSize: 17, fontWeight: '600', color: '#007AFF' },

  // Filter pills
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: GLASS.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: GLASS.separator,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    minHeight: 34,
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(60,60,67,0.12)',
  },
  filterPillActive: {
    backgroundColor: '#007AFF',
    borderColor: 'rgba(0,122,255,0.3)',
  },
  filterPillText: { fontSize: 13, fontWeight: '600', color: '#636366' },
  filterPillTextActive: { color: '#FFFFFF' },

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

  // List
  listContent: { paddingBottom: 100 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: GLASS.separator, marginLeft: 56 },

  // Item row
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: GLASS.card,
    minHeight: 44,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#C6C6C8',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
    borderWidth: 0,
  },
  itemContent: { flex: 1, gap: 2 },
  itemName: { fontSize: 17, fontWeight: '600', color: '#000000', letterSpacing: -0.3 },
  itemSub: { fontSize: 13, color: '#636366' },

  // Empty state
  emptyState: { alignItems: 'center', padding: 48 },
  emptyText: { fontSize: 17, color: '#636366', marginTop: 12, textAlign: 'center', lineHeight: 24 },

  // Confirm bar
  confirmBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: GLASS.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: GLASS.separator,
  },
  confirmBtn: {
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
  confirmBtnLabel: { fontSize: 17, fontWeight: '600', color: '#FFFFFF', letterSpacing: -0.3 },
});
