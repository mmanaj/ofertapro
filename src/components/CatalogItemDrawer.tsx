import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, SegmentedButtons, Chip, Button } from 'react-native-paper';
import { useStore } from '../store/useStore';
import { COLORS } from '../theme/theme';
import Drawer from './Drawer';
import type { CatalogItem, PositionCategory, Unit, VatRate } from '../types';

const UNITS_DEFAULT: string[] = ['m²', 'mb', 't', 'szt.', 'godz.', 'kpl.', 'm³'];
const VAT_DEFAULT = [0, 8, 23];

interface Props {
  visible: boolean;
  initial?: CatalogItem;
  defaultCategory?: PositionCategory;
  onDismiss: () => void;
  onSave: (item: Omit<CatalogItem, 'id'>) => void;
  onDelete?: () => void;
}

export default function CatalogItemDrawer({
  visible, initial, defaultCategory = 'material', onDismiss, onSave, onDelete,
}: Props) {
  const settings = useStore(s => s.settings);

  const allUnits = [...UNITS_DEFAULT, ...settings.customUnits];
  const allVatRates = [...VAT_DEFAULT, ...settings.customVatRates].sort((a, b) => a - b);

  const [category, setCategory] = useState<PositionCategory>(
    initial?.category ?? defaultCategory
  );
  const [name, setName] = useState(initial?.name ?? '');
  const [unit, setUnit] = useState<string>(initial?.defaultUnit ?? 'm²');
  const [price, setPrice] = useState(initial?.defaultUnitPriceNet ? String(initial.defaultUnitPriceNet) : '');
  const [vat, setVat] = useState<number>(initial?.defaultVatRate ?? settings.defaultVatRate);

  // Reset form when opened/closed
  useEffect(() => {
    if (visible) {
      setCategory(initial?.category ?? defaultCategory);
      setName(initial?.name ?? '');
      setUnit(initial?.defaultUnit ?? 'm²');
      setPrice(initial?.defaultUnitPriceNet ? String(initial.defaultUnitPriceNet) : '');
      setVat(initial?.defaultVatRate ?? settings.defaultVatRate);
    }
  }, [visible, initial, defaultCategory]);

  const handleSave = () => {
    if (!name.trim() || !price) {
      Alert.alert('Wypełnij nazwę i cenę');
      return;
    }
    onSave({
      category,
      name: name.trim(),
      defaultUnit: unit as Unit,
      defaultUnitPriceNet: parseFloat(price),
      defaultVatRate: vat as VatRate,
    });
  };

  const title = initial
    ? '✏️ Edytuj pozycję'
    : category === 'material' ? '🧱 Nowy materiał' : '🔧 Nowa robocizna';

  return (
    <Drawer visible={visible} onDismiss={onDismiss} title={title}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SegmentedButtons
          value={category}
          onValueChange={v => setCategory(v as PositionCategory)}
          buttons={[
            { value: 'material', label: '🧱 Materiał' },
            { value: 'labor', label: '🔧 Robocizna' },
          ]}
          style={styles.segment}
        />

        <TextInput
          label="Nazwa *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Cena netto (zł) *"
          value={price}
          onChangeText={setPrice}
          mode="outlined"
          keyboardType="numeric"
          right={<TextInput.Affix text="zł" />}
          style={styles.input}
        />

        <View style={styles.fieldGroup}>
          <Text variant="labelSmall" style={styles.fieldLabel}>Jednostka domyślna</Text>
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
          <Text variant="labelSmall" style={styles.fieldLabel}>VAT domyślny</Text>
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

        <View style={styles.actions}>
          <Button onPress={onDismiss} style={{ flex: 1 }}>Anuluj</Button>
          <Button
            mode="contained"
            onPress={handleSave}
            style={[{ flex: 1 }, styles.saveBtn]}
          >
            {initial ? 'Zapisz' : 'Dodaj'}
          </Button>
        </View>

        {initial && onDelete ? (
          <Button
            mode="text"
            onPress={onDelete}
            labelStyle={{ color: COLORS.error }}
            style={{ marginTop: 4 }}
          >
            Usuń pozycję
          </Button>
        ) : null}
      </ScrollView>
    </Drawer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 12,
    paddingBottom: 12,
  },
  segment: { marginBottom: 4 },
  input: { backgroundColor: '#fff' },
  fieldGroup: { gap: 6 },
  fieldLabel: {
    color: COLORS.grey600,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  chip: { margin: 0 },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
});
