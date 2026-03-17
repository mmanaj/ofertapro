import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet } from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useStore } from '../store/useStore';
import Drawer from './Drawer';
import { GLASS } from '../theme/theme';
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

  const [category, setCategory] = useState<PositionCategory>(initial?.category ?? defaultCategory);
  const [name, setName] = useState(initial?.name ?? '');
  const [unit, setUnit] = useState<string>(initial?.defaultUnit ?? 'm²');
  const [price, setPrice] = useState(initial?.defaultUnitPriceNet ? String(initial.defaultUnitPriceNet) : '');
  const [vat, setVat] = useState<number>(initial?.defaultVatRate ?? settings.defaultVatRate);

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
    ? 'Edytuj pozycję'
    : category === 'material' ? 'Nowy materiał' : 'Nowa robocizna';

  return (
    <Drawer visible={visible} onDismiss={onDismiss} title={title}>
      <View style={styles.content}>
        {/* Category toggle */}
        <SegmentedControl
          values={['Materiał', 'Robocizna']}
          selectedIndex={category === 'material' ? 0 : 1}
          onChange={(e) =>
            setCategory(e.nativeEvent.selectedSegmentIndex === 0 ? 'material' : 'labor')
          }
          accessibilityLabel="Typ pozycji katalogu"
        />

        {/* Name field */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel} allowFontScaling accessibilityRole="text">Nazwa *</Text>
          <View style={styles.fieldInput}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="np. Cegła pełna"
              placeholderTextColor="#AEAEB2"
              style={styles.fieldTextInput}
              clearButtonMode="whileEditing"
              allowFontScaling
              accessibilityLabel="Nazwa pozycji katalogu"
            />
          </View>
        </View>

        {/* Price field */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel} allowFontScaling accessibilityRole="text">Cena netto *</Text>
          <View style={styles.fieldInput}>
            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              placeholderTextColor="#AEAEB2"
              keyboardType="numeric"
              style={styles.fieldTextInput}
              clearButtonMode="whileEditing"
              allowFontScaling
              accessibilityLabel="Cena netto"
            />
            <Text style={styles.fieldSuffix} allowFontScaling>zł</Text>
          </View>
        </View>

        {/* Unit chips */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel} allowFontScaling accessibilityRole="text">Jednostka domyślna</Text>
          <View style={styles.chipsRow} accessibilityRole="radiogroup" accessibilityLabel="Jednostka miary">
            {allUnits.map(u => {
              const isSelected = unit === u;
              return (
                <Pressable
                  key={u}
                  onPress={() => setUnit(u)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={u}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]} allowFontScaling>
                    {u}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* VAT chips */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel} allowFontScaling accessibilityRole="text">VAT domyślny</Text>
          <View style={styles.chipsRow} accessibilityRole="radiogroup" accessibilityLabel="Stawka VAT">
            {allVatRates.map(r => {
              const isSelected = vat === r;
              return (
                <Pressable
                  key={r}
                  onPress={() => setVat(r)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={`${r}%`}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]} allowFontScaling>
                    {r}%
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <Pressable
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Anuluj"
            style={styles.btnSecondary}
          >
            <Text style={styles.btnSecondaryLabel} allowFontScaling>Anuluj</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel={initial ? 'Zapisz zmiany' : 'Dodaj pozycję do katalogu'}
            style={styles.btnPrimary}
          >
            <Text style={styles.btnPrimaryLabel} allowFontScaling>
              {initial ? 'Zapisz' : 'Dodaj'}
            </Text>
          </Pressable>
        </View>

        {initial && onDelete ? (
          <Pressable
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel={`Usuń pozycję ${initial.name} z katalogu`}
            style={styles.deleteBtn}
          >
            <Text style={styles.deleteLabel} allowFontScaling>Usuń pozycję</Text>
          </Pressable>
        ) : null}
      </View>
    </Drawer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16 },

  fieldWrapper: { gap: 4 },
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

  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btnSecondary: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    borderWidth: 0.5,
    borderColor: 'rgba(60,60,67,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryLabel: { fontSize: 17, color: '#007AFF' },
  btnPrimary: {
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
  btnPrimaryLabel: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },

  deleteBtn: { height: 44, alignItems: 'center', justifyContent: 'center' },
  deleteLabel: { fontSize: 17, color: '#FF3B30' },
});
