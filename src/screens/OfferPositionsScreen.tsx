import React, { useRef, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, ScrollView, TouchableOpacity, Text as RNText } from 'react-native';
import { Button, Text, FAB, Chip, Divider, TextInput, SegmentedButtons } from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';
import { COLORS } from '../theme/theme';
import Drawer from '../components/Drawer';
import type { OfferPosition, PositionCategory, Unit, VatRate } from '../types';

const UNITS_DEFAULT: string[] = ['m²', 'mb', 't', 'szt.', 'godz.', 'kpl.', 'm³'];
const VAT_DEFAULT = [0, 8, 23];

function EditPositionDrawer({
  visible, position, onDismiss, onSave, onDelete, customUnits, customVatRates,
}: {
  visible: boolean;
  position: OfferPosition;
  onDismiss: () => void;
  onSave: (data: Partial<OfferPosition>) => void;
  onDelete: () => void;
  customUnits: string[];
  customVatRates: number[];
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

  const title = position.category === 'material' ? '🧱 Edytuj materiał' : '🔧 Edytuj robociznę';

  return (
    <Drawer visible={visible} onDismiss={onDismiss} title={title}>
      <ScrollView
        contentContainerStyle={styles.drawerContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          label="Nazwa *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            label="Ilość *"
            value={quantity}
            onChangeText={setQuantity}
            mode="outlined"
            keyboardType="numeric"
            style={{ flex: 1 }}
          />
          <TextInput
            label="Cena netto *"
            value={price}
            onChangeText={setPrice}
            mode="outlined"
            keyboardType="numeric"
            right={<TextInput.Affix text="zł" />}
            style={{ flex: 1 }}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text variant="labelSmall" style={styles.fieldLabel}>Jednostka</Text>
          <View style={styles.chipRow}>
            {allUnits.map(u => (
              <Chip
                key={u}
                compact
                selected={unit === u}
                onPress={() => setUnit(u)}
                style={styles.chip}
                textStyle={{ fontSize: 11 }}
              >
                {u}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text variant="labelSmall" style={styles.fieldLabel}>VAT</Text>
          <View style={styles.chipRow}>
            {allVatRates.map(r => (
              <Chip
                key={r}
                compact
                selected={vat === r}
                onPress={() => setVat(r)}
                style={styles.chip}
                textStyle={{ fontSize: 11 }}
              >
                {r}%
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.drawerActions}>
          <Button onPress={onDismiss} style={{ flex: 1 }}>Anuluj</Button>
          <Button
            mode="contained"
            onPress={handleSave}
            style={[{ flex: 1 }, { backgroundColor: COLORS.primary, borderRadius: 10 }]}
          >
            Zapisz
          </Button>
        </View>

        <Button
          mode="text"
          onPress={handleDelete}
          labelStyle={{ color: COLORS.error }}
          style={{ marginTop: 4 }}
        >
          Usuń pozycję
        </Button>
      </ScrollView>
    </Drawer>
  );
}

function PositionRow({
  item, onEdit, onDelete, formatPLN,
}: {
  item: OfferPosition;
  onEdit: () => void;
  onDelete: () => void;
  formatPLN: (n: number) => string;
}) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => {
        Alert.alert('Usuń pozycję?', item.name, [
          { text: 'Anuluj', onPress: () => swipeableRef.current?.close() },
          { text: 'Usuń', style: 'destructive', onPress: onDelete },
        ]);
      }}
    >
      <RNText style={{ fontSize: 22 }}>🗑️</RNText>
      <RNText style={styles.deleteActionText}>Usuń</RNText>
    </TouchableOpacity>
  );

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
      <TouchableOpacity onPress={onEdit} activeOpacity={0.7} style={styles.posRow}>
        <View style={styles.posInfo}>
          <Text variant="bodyMedium" style={{ fontWeight: '700' }}>{item.name}</Text>
          <Text variant="bodySmall" style={{ color: COLORS.grey600 }}>
            {item.quantity} {item.unit} × {formatPLN(item.unitPriceNet)}
          </Text>
        </View>
        <View style={styles.posRight}>
          <Text variant="bodyMedium" style={{ fontWeight: '800' }}>{formatPLN(item.totalNet)}</Text>
          <Text variant="bodySmall" style={{ color: COLORS.grey400 }}>VAT {item.vatRate}%</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

export default function OfferPositionsScreen({ navigation, route }: any) {
  const { offerId } = route.params;
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
      <View style={styles.topbar}>
        <Button onPress={() => navigation.goBack()} labelStyle={{ color: COLORS.grey600 }}>‹ Wróć</Button>
        <Text variant="titleMedium" style={{ fontWeight: '700' }}>Pozycje oferty</Text>
        <Button onPress={() => navigation.navigate('OfferSummary', { offerId })} labelStyle={{ fontWeight: '700' }}>
          Dalej →
        </Button>
      </View>

      <SegmentedButtons
        value={activeCategory}
        onValueChange={v => setActiveCategory(v as PositionCategory)}
        buttons={[
          { value: 'material', label: `🧱 Materiały (${formatPLN(materialSum)})` },
          { value: 'labor', label: `🔧 Robocizna (${formatPLN(laborSum)})` },
        ]}
        style={styles.segment}
      />

      <FlatList
        data={positions}
        keyExtractor={p => p.id}
        ItemSeparatorComponent={() => <Divider />}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <PositionRow
            item={item}
            onEdit={() => setEditingPosition(item)}
            onDelete={() => deletePosition(offerId, item.id)}
            formatPLN={formatPLN}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>
              {activeCategory === 'material' ? '🧱' : '🔧'}
            </Text>
            <Text variant="bodyLarge" style={{ color: COLORS.grey600, marginTop: 12, textAlign: 'center' }}>
              Brak {activeCategory === 'material' ? 'materiałów' : 'pozycji robocizny'}.{'\n'}
              Kliknij + aby dodać z katalogu.
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        label="Dodaj pozycję"
        style={styles.fab}
        onPress={() => navigation.navigate('CatalogPicker', { offerId, category: activeCategory })}
      />

      {editingPosition && (
        <EditPositionDrawer
          visible
          position={editingPosition}
          customUnits={settings.customUnits}
          customVatRates={settings.customVatRates}
          onDismiss={() => setEditingPosition(null)}
          onSave={(data) => {
            updatePosition(offerId, editingPosition.id, data);
            setEditingPosition(null);
          }}
          onDelete={() => {
            deletePosition(offerId, editingPosition.id);
            setEditingPosition(null);
          }}
        />
      )}
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
  segment: { margin: 12 },
  posRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#fff',
  },
  posInfo: { flex: 1, gap: 2 },
  posRight: { alignItems: 'flex-end', marginRight: 8 },
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
  // Drawer styles
  drawerContent: {
    padding: 20,
    gap: 12,
    paddingBottom: 12,
  },
  input: { backgroundColor: '#fff' },
  fieldGroup: { gap: 6 },
  fieldLabel: {
    color: COLORS.grey600,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  chip: { margin: 0 },
  drawerActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
});
