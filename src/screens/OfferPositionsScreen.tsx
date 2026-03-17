import React, { useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useStore } from '../store/useStore';
import Drawer from '../components/Drawer';
import GlassNavBar from '../components/GlassNavBar';
import { GLASS } from '../theme/theme';
import type { OfferPosition, PositionCategory, Unit, VatRate } from '../types';

const UNITS_DEFAULT: string[] = ['m²', 'mb', 't', 'szt.', 'godz.', 'kpl.', 'm³'];
const VAT_DEFAULT = [0, 8, 23];

function ToggleChips({ items, selected, onSelect, formatter, accessibilityGroupLabel }: {
  items: any[]; selected: any; onSelect: (v: any) => void;
  formatter?: (v: any) => string; accessibilityGroupLabel?: string;
}) {
  return (
    <View
      style={styles.chipsRow}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityGroupLabel}
    >
      {items.map(item => {
        const label = formatter ? formatter(item) : String(item);
        const isSelected = selected === item;
        return (
          <Pressable
            key={String(item)}
            onPress={() => onSelect(item)}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={label}
            style={[styles.chip, isSelected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]} allowFontScaling>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function IOSField({ label, value, onChangeText, placeholder, keyboardType, right }: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; keyboardType?: any; right?: string;
}) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel} allowFontScaling accessibilityRole="text">{label}</Text>
      <View style={styles.fieldInput}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#AEAEB2"
          keyboardType={keyboardType}
          style={styles.fieldTextInput}
          clearButtonMode="whileEditing"
          allowFontScaling
          accessibilityLabel={label}
        />
        {right ? <Text style={styles.fieldSuffix} allowFontScaling>{right}</Text> : null}
      </View>
    </View>
  );
}

function EditPositionDrawer({ visible, position, onDismiss, onSave, onDelete, customUnits, customVatRates }: {
  visible: boolean; position: OfferPosition; onDismiss: () => void;
  onSave: (data: Partial<OfferPosition>) => void; onDelete: () => void;
  customUnits: string[]; customVatRates: number[];
}) {
  const [name, setName] = useState(position.name);
  const [quantity, setQuantity] = useState(String(position.quantity));
  const [unit, setUnit] = useState<string>(position.unit);
  const [price, setPrice] = useState(String(position.unitPriceNet));
  const [vat, setVat] = useState<number>(position.vatRate);

  const allUnits = [...UNITS_DEFAULT, ...customUnits];
  const allVatRates = [...VAT_DEFAULT, ...customVatRates].sort((a, b) => a - b);

  const handleSave = () => {
    if (!name || !quantity || !price) {
      Alert.alert('Wypełnij wszystkie pola');
      return;
    }
    onSave({
      name,
      quantity: parseFloat(quantity),
      unit: unit as Unit,
      unitPriceNet: parseFloat(price),
      vatRate: vat as VatRate,
    });
  };

  const handleDelete = () => {
    Alert.alert('Usuń pozycję?', position.name, [
      { text: 'Anuluj' },
      { text: 'Usuń', style: 'destructive', onPress: onDelete },
    ]);
  };

  const title = position.category === 'material' ? 'Edytuj materiał' : 'Edytuj robociznę';

  return (
    <Drawer visible={visible} onDismiss={onDismiss} title={title}>
      <View style={styles.drawerContent}>
        <IOSField label="Nazwa *" value={name} onChangeText={setName} placeholder="np. Cegła pełna" />

        <View style={styles.drawerRow}>
          <View style={{ flex: 1 }}>
            <IOSField label="Ilość *" value={quantity} onChangeText={setQuantity}
              placeholder="0" keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <IOSField label="Cena netto *" value={price} onChangeText={setPrice}
              placeholder="0.00" keyboardType="numeric" right="zł" />
          </View>
        </View>

        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel} allowFontScaling accessibilityRole="text">Jednostka</Text>
          <ToggleChips
            items={allUnits}
            selected={unit}
            onSelect={setUnit}
            accessibilityGroupLabel="Jednostka miary"
          />
        </View>

        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel} allowFontScaling accessibilityRole="text">VAT</Text>
          <ToggleChips
            items={allVatRates}
            selected={vat}
            onSelect={setVat}
            formatter={(r) => `${r}%`}
            accessibilityGroupLabel="Stawka VAT"
          />
        </View>

        <View style={styles.drawerActions}>
          <Pressable
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Anuluj edycję"
            style={styles.drawerBtnSecondary}
          >
            <Text style={styles.drawerBtnSecondaryLabel} allowFontScaling>Anuluj</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel="Zapisz zmiany"
            style={styles.drawerBtnPrimary}
          >
            <Text style={styles.drawerBtnPrimaryLabel} allowFontScaling>Zapisz</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={handleDelete}
          accessibilityRole="button"
          accessibilityLabel={`Usuń pozycję ${position.name}`}
          style={styles.drawerDeleteBtn}
        >
          <Text style={styles.drawerDeleteLabel} allowFontScaling>Usuń pozycję</Text>
        </Pressable>
      </View>
    </Drawer>
  );
}

function PositionRow({ item, onEdit, onDelete, formatPLN }: {
  item: OfferPosition; onEdit: () => void; onDelete: () => void; formatPLN: (n: number) => string;
}) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => Alert.alert('Usuń pozycję?', item.name, [
        { text: 'Anuluj', onPress: () => swipeableRef.current?.close() },
        { text: 'Usuń', style: 'destructive', onPress: onDelete },
      ])}
      accessibilityRole="button"
      accessibilityLabel={`Usuń pozycję ${item.name}`}
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
        style={styles.positionRow}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${item.quantity} ${item.unit}, ${formatPLN(item.totalNet)}, VAT ${item.vatRate}%`}
        accessibilityHint="Kliknij, aby edytować pozycję"
      >
        <View style={styles.positionContent}>
          <Text style={styles.positionName} allowFontScaling numberOfLines={1}>{item.name}</Text>
          <Text style={styles.positionSub} allowFontScaling>
            {item.quantity} {item.unit} × {formatPLN(item.unitPriceNet)}
          </Text>
        </View>
        <View style={styles.positionMeta}>
          <Text style={styles.positionTotal} allowFontScaling>{formatPLN(item.totalNet)}</Text>
          <Text style={styles.positionVat} allowFontScaling>VAT {item.vatRate}%</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="rgba(60,60,67,0.3)" accessibilityElementsHidden />
      </TouchableOpacity>
    </Swipeable>
  );
}

export default function OfferPositionsScreen({ navigation, route }: any) {
  const { offerId, fromCreation } = route.params;
  const offer = useStore(s => s.getOffer(offerId));
  const updatePosition = useStore(s => s.updatePosition);
  const deletePosition = useStore(s => s.deletePosition);
  const settings = useStore(s => s.settings);
  const [activeCategory, setActiveCategory] = useState<PositionCategory>('material');
  const [editingPosition, setEditingPosition] = useState<OfferPosition | null>(null);

  if (!offer) return null;

  const positions = offer.positions.filter(p => p.category === activeCategory);
  const materialSum = offer.positions.filter(p => p.category === 'material').reduce((s, p) => s + p.totalNet, 0);
  const laborSum = offer.positions.filter(p => p.category === 'labor').reduce((s, p) => s + p.totalNet, 0);

  const formatPLN = (n: number) =>
    new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2 }).format(n) + ' zł';

  return (
    <SafeAreaView style={styles.container}>
      <GlassNavBar
        title="Pozycje oferty"
        onBack={() => navigation.goBack()}
        backLabel="Wróć"
        rightElement={
          <Pressable
            onPress={() => navigation.navigate('OfferSummary', { offerId, fromCreation })}
            accessibilityRole="button"
            accessibilityLabel="Przejdź do podsumowania oferty"
            style={styles.nextBtn}
          >
            <Text style={styles.nextLabel} allowFontScaling maxFontSizeMultiplier={1.2}>Dalej →</Text>
          </Pressable>
        }
      />

      {/* Category toggle */}
      <View style={styles.segmentRow}>
        <SegmentedControl
          values={[`Materiały (${formatPLN(materialSum)})`, `Robocizna (${formatPLN(laborSum)})`]}
          selectedIndex={activeCategory === 'material' ? 0 : 1}
          onChange={(e) => setActiveCategory(e.nativeEvent.selectedSegmentIndex === 0 ? 'material' : 'labor')}
          accessibilityLabel="Kategoria pozycji"
        />
      </View>

      <FlatList
        data={positions}
        keyExtractor={p => p.id}
        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <PositionRow
            item={item}
            onEdit={() => setEditingPosition(item)}
            onDelete={() => deletePosition(offerId, item.id)}
            formatPLN={formatPLN}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState} accessibilityRole="none">
            <Ionicons
              name={activeCategory === 'material' ? 'layers-outline' : 'hammer-outline'}
              size={48}
              color="#C6C6C8"
              accessibilityElementsHidden
            />
            <Text style={styles.emptyText} allowFontScaling>
              Brak {activeCategory === 'material' ? 'materiałów' : 'pozycji robocizny'}.{'\n'}Kliknij + aby dodać z katalogu.
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <Pressable
        onPress={() => navigation.navigate('CatalogPicker', { offerId, category: activeCategory })}
        accessibilityRole="button"
        accessibilityLabel={`Dodaj ${activeCategory === 'material' ? 'materiał' : 'pozycję robocizny'} z katalogu`}
        style={styles.fab}
      >
        <Ionicons name="add" size={22} color="#FFFFFF" accessibilityElementsHidden />
        <Text style={styles.fabLabel} allowFontScaling maxFontSizeMultiplier={1.2}>Dodaj pozycję</Text>
      </Pressable>

      {editingPosition && (
        <EditPositionDrawer
          visible
          position={editingPosition}
          customUnits={settings.customUnits}
          customVatRates={settings.customVatRates}
          onDismiss={() => setEditingPosition(null)}
          onSave={(data) => { updatePosition(offerId, editingPosition.id, data); setEditingPosition(null); }}
          onDelete={() => { deletePosition(offerId, editingPosition.id); setEditingPosition(null); }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  nextBtn: { height: 44, justifyContent: 'center', paddingHorizontal: 4 },
  nextLabel: { fontSize: 17, fontWeight: '600', color: '#007AFF' },

  segmentRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: GLASS.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: GLASS.separator,
  },

  listContent: { paddingBottom: 120 },

  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: GLASS.separator,
    marginLeft: 16,
  },

  // Position row
  positionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: GLASS.card,
    minHeight: 44,
  },
  positionContent: { flex: 1, gap: 2 },
  positionName: { fontSize: 17, fontWeight: '600', color: '#000000', letterSpacing: -0.3 },
  positionSub: { fontSize: 13, color: '#636366' },
  positionMeta: { alignItems: 'flex-end', marginRight: 8 },
  positionTotal: { fontSize: 15, fontWeight: '700', color: '#000000' },
  positionVat: { fontSize: 12, color: '#AEAEB2' },

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
    bottom: 24,
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

  // Toggle chips
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    minHeight: 32,
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(60,60,67,0.12)',
  },
  chipSelected: {
    backgroundColor: '#007AFF',
    borderColor: 'rgba(0,122,255,0.3)',
  },
  chipText: { fontSize: 13, fontWeight: '600', color: '#636366' },
  chipTextSelected: { color: '#FFFFFF' },

  // Drawer input field
  fieldWrapper: { gap: 4, marginBottom: 4 },
  fieldLabel: {
    fontSize: 12,
    color: '#636366',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  fieldInput: {
    backgroundColor: GLASS.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: GLASS.border,
  },
  fieldTextInput: { flex: 1, fontSize: 17, color: '#000000' },
  fieldSuffix: { fontSize: 15, color: '#636366', marginLeft: 4 },

  // Drawer layout
  drawerContent: { padding: 20, gap: 16 },
  drawerRow: { flexDirection: 'row', gap: 10 },

  // Drawer action buttons
  drawerActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  drawerBtnSecondary: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    borderWidth: 0.5,
    borderColor: 'rgba(60,60,67,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerBtnSecondaryLabel: { fontSize: 17, color: '#007AFF' },
  drawerBtnPrimary: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  drawerBtnPrimaryLabel: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
  drawerDeleteBtn: { height: 44, alignItems: 'center', justifyContent: 'center' },
  drawerDeleteLabel: { fontSize: 17, color: '#FF3B30' },
});
