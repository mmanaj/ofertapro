import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, Image, Alert,
} from 'react-native';
import {
  Text, TextInput, Button, Chip, Divider, IconButton, TouchableRipple,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../store/useStore';
import { COLORS } from '../theme/theme';
import Drawer from '../components/Drawer';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <Text variant="labelSmall" style={styles.sectionHeader}>{label}</Text>
  );
}

function SettingsRow({
  icon, title, subtitle, onPress, danger,
}: {
  icon: string; title: string; subtitle?: string; onPress?: () => void; danger?: boolean;
}) {
  return (
    <TouchableRipple onPress={onPress} style={styles.row}>
      <View style={styles.rowInner}>
        <View style={[styles.rowIcon, danger && { backgroundColor: '#fee2e2' }]}>
          <Text style={styles.rowEmoji}>{icon}</Text>
        </View>
        <View style={styles.rowContent}>
          <Text variant="bodyMedium" style={[styles.rowTitle, danger && { color: COLORS.error }]}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="bodySmall" style={styles.rowSubtitle}>{subtitle}</Text>
          ) : null}
        </View>
        {onPress && !danger ? (
          <Text style={styles.chevron}>›</Text>
        ) : null}
      </View>
    </TouchableRipple>
  );
}

// ─── Drawer: Dane firmy ───────────────────────────────────────────────────────

function CompanyDrawer({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const company = useStore(s => s.company);
  const setCompany = useStore(s => s.setCompany);

  const [name, setName] = useState(company?.name ?? '');
  const [phone, setPhone] = useState(company?.phone ?? '');
  const [email, setEmail] = useState(company?.email ?? '');
  const [nip, setNip] = useState(company?.nip ?? '');
  const [address, setAddress] = useState(company?.address ?? '');

  // Sync from store each time drawer opens
  React.useEffect(() => {
    if (visible && company) {
      setName(company.name);
      setPhone(company.phone);
      setEmail(company.email);
      setNip(company.nip ?? '');
      setAddress(company.address ?? '');
    }
  }, [visible]);

  const handleSave = () => {
    if (!name.trim() || !phone.trim() || !email.trim()) {
      Alert.alert('Wymagane pola', 'Wypełnij nazwę firmy, telefon i email.');
      return;
    }
    setCompany({
      ...(company ?? { logoUri: undefined }),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      nip: nip.trim() || undefined,
      address: address.trim() || undefined,
    });
    onDismiss();
  };

  return (
    <Drawer visible={visible} onDismiss={onDismiss} title="🏢 Dane firmy">
      <ScrollView
        contentContainerStyle={styles.drawerContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TextInput label="Nazwa firmy *" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
        <TextInput label="Telefon *" value={phone} onChangeText={setPhone} mode="outlined" keyboardType="phone-pad" style={styles.input} />
        <TextInput label="Email *" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
        <TextInput label="NIP" value={nip} onChangeText={setNip} mode="outlined" keyboardType="numeric" style={styles.input} />
        <TextInput label="Adres" value={address} onChangeText={setAddress} mode="outlined" multiline numberOfLines={2} style={styles.input} />
        <View style={styles.drawerActions}>
          <Button onPress={onDismiss} style={{ flex: 1 }}>Anuluj</Button>
          <Button mode="contained" onPress={handleSave} style={[{ flex: 1 }, styles.saveBtn]}>Zapisz</Button>
        </View>
      </ScrollView>
    </Drawer>
  );
}

// ─── Drawer: Logo firmy ───────────────────────────────────────────────────────

function LogoDrawer({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const company = useStore(s => s.company);
  const setCompany = useStore(s => s.setCompany);

  const handlePickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0] && company) {
      setCompany({ ...company, logoUri: result.assets[0].uri });
    }
  };

  const handleDeleteLogo = () => {
    if (company) setCompany({ ...company, logoUri: undefined });
  };

  return (
    <Drawer visible={visible} onDismiss={onDismiss} title="🖼 Logo firmy">
      <View style={styles.drawerContent}>
        {company?.logoUri ? (
          <View style={styles.logoPreview}>
            <Image source={{ uri: company.logoUri }} style={styles.logo} resizeMode="contain" />
          </View>
        ) : (
          <View style={styles.logoEmpty}>
            <Text style={{ fontSize: 40 }}>🖼</Text>
            <Text variant="bodySmall" style={{ color: COLORS.grey400, marginTop: 8 }}>Brak logo</Text>
          </View>
        )}

        <Button
          mode="contained-tonal"
          onPress={handlePickLogo}
          style={{ borderRadius: 10 }}
          icon="image-plus"
        >
          {company?.logoUri ? 'Zmień logo' : 'Wybierz logo'}
        </Button>

        {company?.logoUri ? (
          <Button
            mode="text"
            onPress={handleDeleteLogo}
            labelStyle={{ color: COLORS.error }}
          >
            Usuń logo
          </Button>
        ) : null}

        <Button onPress={onDismiss} style={{ marginTop: 4 }}>Zamknij</Button>
      </View>
    </Drawer>
  );
}

// ─── Drawer: VAT ─────────────────────────────────────────────────────────────

function VatDrawer({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const settings = useStore(s => s.settings);
  const updateSettings = useStore(s => s.updateSettings);
  const [selected, setSelected] = useState(settings.defaultVatRate);
  const [newRate, setNewRate] = useState('');

  React.useEffect(() => {
    if (visible) setSelected(settings.defaultVatRate);
  }, [visible]);

  const standardRates = [0, 8, 23];
  const allRates = [...standardRates, ...settings.customVatRates].sort((a, b) => a - b);

  const handleAdd = () => {
    const val = parseInt(newRate);
    if (isNaN(val) || val < 0 || val > 100) {
      Alert.alert('Podaj poprawną stawkę (0–100)');
      return;
    }
    if (allRates.includes(val)) {
      setNewRate('');
      return;
    }
    updateSettings({ customVatRates: [...settings.customVatRates, val] });
    setNewRate('');
  };

  const handleRemoveCustom = (rate: number) => {
    updateSettings({ customVatRates: settings.customVatRates.filter(r => r !== rate) });
    if (selected === rate) setSelected(23);
  };

  const handleSave = () => {
    updateSettings({ defaultVatRate: selected });
    onDismiss();
  };

  return (
    <Drawer visible={visible} onDismiss={onDismiss} title="🏷 Domyślna stawka VAT">
      <ScrollView contentContainerStyle={styles.drawerContent} keyboardShouldPersistTaps="handled">
        <Text variant="labelSmall" style={styles.fieldLabel}>Wybierz stawkę domyślną</Text>
        <View style={styles.chipRow}>
          {allRates.map(r => (
            <View key={r} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Chip
                compact
                selected={selected === r}
                onPress={() => setSelected(r)}
                style={styles.chip}
                textStyle={{ fontSize: 12 }}
              >
                {r}%
              </Chip>
              {settings.customVatRates.includes(r) && (
                <IconButton
                  icon="close"
                  size={14}
                  iconColor={COLORS.grey400}
                  style={{ margin: 0, marginLeft: -4 }}
                  onPress={() => handleRemoveCustom(r)}
                />
              )}
            </View>
          ))}
        </View>

        <Divider style={{ marginVertical: 8 }} />
        <Text variant="labelSmall" style={styles.fieldLabel}>Dodaj własną stawkę</Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TextInput
            label="np. 5"
            value={newRate}
            onChangeText={setNewRate}
            mode="outlined"
            keyboardType="numeric"
            right={<TextInput.Affix text="%" />}
            style={{ flex: 1 }}
          />
          <Button mode="contained-tonal" onPress={handleAdd} style={{ borderRadius: 10 }}>
            Dodaj
          </Button>
        </View>

        <View style={styles.drawerActions}>
          <Button onPress={onDismiss} style={{ flex: 1 }}>Anuluj</Button>
          <Button mode="contained" onPress={handleSave} style={[{ flex: 1 }, styles.saveBtn]}>Zapisz</Button>
        </View>
      </ScrollView>
    </Drawer>
  );
}

// ─── Drawer: Ważność oferty ───────────────────────────────────────────────────

function ValidDaysDrawer({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const settings = useStore(s => s.settings);
  const updateSettings = useStore(s => s.updateSettings);
  const [selected, setSelected] = useState(settings.defaultValidDays);
  const [newDays, setNewDays] = useState('');

  React.useEffect(() => {
    if (visible) setSelected(settings.defaultValidDays);
  }, [visible]);

  const standardOptions = [14, 30, 60];
  const allDays = [...new Set([...standardOptions, ...(settings.customValidDays ?? [])])].sort((a, b) => a - b);

  const handleAdd = () => {
    const val = parseInt(newDays);
    if (isNaN(val) || val <= 0) {
      Alert.alert('Podaj poprawną liczbę dni (większą od 0)');
      return;
    }
    if (allDays.includes(val)) {
      setNewDays('');
      return;
    }
    updateSettings({ customValidDays: [...(settings.customValidDays ?? []), val] });
    setNewDays('');
  };

  const handleRemoveCustom = (days: number) => {
    updateSettings({ customValidDays: (settings.customValidDays ?? []).filter(d => d !== days) });
    if (selected === days) setSelected(14);
  };

  return (
    <Drawer visible={visible} onDismiss={onDismiss} title="📅 Domyślna ważność oferty">
      <ScrollView contentContainerStyle={styles.drawerContent} keyboardShouldPersistTaps="handled">
        <Text variant="labelSmall" style={styles.fieldLabel}>Wybierz domyślny termin</Text>
        <View style={styles.chipRow}>
          {allDays.map(d => (
            <View key={d} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Chip
                compact
                selected={selected === d}
                onPress={() => setSelected(d)}
                style={[styles.chip, { paddingHorizontal: 6 }]}
                textStyle={{ fontSize: 13 }}
              >
                {d} dni
              </Chip>
              {(settings.customValidDays ?? []).includes(d) && (
                <IconButton
                  icon="close"
                  size={14}
                  iconColor={COLORS.grey400}
                  style={{ margin: 0, marginLeft: -4 }}
                  onPress={() => handleRemoveCustom(d)}
                />
              )}
            </View>
          ))}
        </View>

        <Divider style={{ marginVertical: 8 }} />
        <Text variant="labelSmall" style={styles.fieldLabel}>Dodaj własny termin</Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TextInput
            label="np. 7"
            value={newDays}
            onChangeText={setNewDays}
            mode="outlined"
            keyboardType="numeric"
            right={<TextInput.Affix text="dni" />}
            style={{ flex: 1 }}
          />
          <Button mode="contained-tonal" onPress={handleAdd} style={{ borderRadius: 10 }}>
            Dodaj
          </Button>
        </View>

        <View style={styles.drawerActions}>
          <Button onPress={onDismiss} style={{ flex: 1 }}>Anuluj</Button>
          <Button
            mode="contained"
            onPress={() => { updateSettings({ defaultValidDays: selected }); onDismiss(); }}
            style={[{ flex: 1 }, styles.saveBtn]}
          >
            Zapisz
          </Button>
        </View>
      </ScrollView>
    </Drawer>
  );
}

// ─── Drawer: Stopka ───────────────────────────────────────────────────────────

function FooterDrawer({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const settings = useStore(s => s.settings);
  const updateSettings = useStore(s => s.updateSettings);
  const [text, setText] = useState(settings.offerFooter);

  React.useEffect(() => {
    if (visible) setText(settings.offerFooter);
  }, [visible]);

  return (
    <Drawer visible={visible} onDismiss={onDismiss} title="📝 Stopka oferty">
      <View style={styles.drawerContent}>
        <TextInput
          label="Tekst stopki"
          value={text}
          onChangeText={setText}
          mode="outlined"
          multiline
          numberOfLines={4}
          placeholder="np. Dziękujemy za zaufanie. Oferta obowiązuje przez podany okres."
          style={styles.input}
        />
        <View style={styles.drawerActions}>
          <Button onPress={onDismiss} style={{ flex: 1 }}>Anuluj</Button>
          <Button
            mode="contained"
            onPress={() => { updateSettings({ offerFooter: text.trim() }); onDismiss(); }}
            style={[{ flex: 1 }, styles.saveBtn]}
          >
            Zapisz
          </Button>
        </View>
      </View>
    </Drawer>
  );
}

// ─── Drawer: Jednostki ────────────────────────────────────────────────────────

function UnitsDrawer({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const settings = useStore(s => s.settings);
  const updateSettings = useStore(s => s.updateSettings);
  const [newUnit, setNewUnit] = useState('');

  const standardUnits = ['m²', 'mb', 't', 'szt.', 'godz.', 'kpl.', 'm³'];

  const handleAdd = () => {
    const val = newUnit.trim();
    if (!val) return;
    if ([...standardUnits, ...settings.customUnits].includes(val)) {
      setNewUnit('');
      return;
    }
    updateSettings({ customUnits: [...settings.customUnits, val] });
    setNewUnit('');
  };

  const handleRemove = (unit: string) => {
    updateSettings({ customUnits: settings.customUnits.filter(u => u !== unit) });
  };

  return (
    <Drawer visible={visible} onDismiss={onDismiss} title="📐 Własne jednostki">
      <ScrollView contentContainerStyle={styles.drawerContent} keyboardShouldPersistTaps="handled">
        <Text variant="labelSmall" style={styles.fieldLabel}>Domyślne jednostki</Text>
        <View style={styles.chipRow}>
          {standardUnits.map(u => (
            <Chip key={u} compact style={styles.chip} textStyle={{ fontSize: 11 }}>{u}</Chip>
          ))}
        </View>

        {settings.customUnits.length > 0 && (
          <>
            <Divider style={{ marginVertical: 8 }} />
            <Text variant="labelSmall" style={styles.fieldLabel}>Własne jednostki</Text>
            <View style={styles.chipRow}>
              {settings.customUnits.map(u => (
                <View key={u} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Chip compact style={[styles.chip, { backgroundColor: COLORS.primary + '18' }]} textStyle={{ fontSize: 11 }}>{u}</Chip>
                  <IconButton
                    icon="close"
                    size={14}
                    iconColor={COLORS.grey400}
                    style={{ margin: 0, marginLeft: -4 }}
                    onPress={() => handleRemove(u)}
                  />
                </View>
              ))}
            </View>
          </>
        )}

        <Divider style={{ marginVertical: 8 }} />
        <Text variant="labelSmall" style={styles.fieldLabel}>Dodaj własną jednostkę</Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TextInput
            label="np. ha, km"
            value={newUnit}
            onChangeText={setNewUnit}
            mode="outlined"
            style={{ flex: 1 }}
          />
          <Button mode="contained-tonal" onPress={handleAdd} style={{ borderRadius: 10 }}>
            Dodaj
          </Button>
        </View>

        <Button onPress={onDismiss} style={{ marginTop: 8 }}>Zamknij</Button>
      </ScrollView>
    </Drawer>
  );
}

// ─── Main SettingsScreen ───────────────────────────────────────────────────────

type DrawerType = 'company' | 'logo' | 'vat' | 'validDays' | 'footer' | 'units' | null;

export default function SettingsScreen({ navigation }: any) {
  const company = useStore(s => s.company);
  const settings = useStore(s => s.settings);
  const [openDrawer, setOpenDrawer] = useState<DrawerType>(null);

  const handleLogout = () => {
    Alert.alert('Wyloguj się?', 'Dane firmy i oferty zostaną zachowane na urządzeniu.', [
      { text: 'Anuluj' },
      {
        text: 'Wyloguj',
        style: 'destructive',
        onPress: () => navigation?.navigate('Login'),
      },
    ]);
  };

  const companySubtitle = company
    ? `${company.email} · ${company.phone}`
    : 'Uzupełnij dane firmy';

  const logoSubtitle = company?.logoUri ? 'Logo ustawione' : 'Brak logo';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={{ fontWeight: '800' }}>Ustawienia</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* MOJA FIRMA */}
        <SectionHeader label="MOJA FIRMA" />
        <View style={styles.section}>
          <SettingsRow
            icon="🏢"
            title={company?.name ?? 'Dane firmy'}
            subtitle={companySubtitle}
            onPress={() => setOpenDrawer('company')}
          />
          <Divider />
          <SettingsRow
            icon="🖼"
            title="Logo firmy"
            subtitle={logoSubtitle}
            onPress={() => setOpenDrawer('logo')}
          />
        </View>

        {/* OFERTY */}
        <SectionHeader label="OFERTY" />
        <View style={styles.section}>
          <SettingsRow
            icon="🏷"
            title="Domyślna stawka VAT"
            subtitle={`${settings.defaultVatRate}%`}
            onPress={() => setOpenDrawer('vat')}
          />
          <Divider />
          <SettingsRow
            icon="📅"
            title="Domyślna ważność oferty"
            subtitle={`${settings.defaultValidDays} dni`}
            onPress={() => setOpenDrawer('validDays')}
          />
          <Divider />
          <SettingsRow
            icon="📝"
            title="Stopka oferty"
            subtitle={settings.offerFooter || 'Brak stopki'}
            onPress={() => setOpenDrawer('footer')}
          />
        </View>

        {/* APLIKACJA */}
        <SectionHeader label="APLIKACJA" />
        <View style={styles.section}>
          <SettingsRow
            icon="📦"
            title="Katalog usług i materiałów"
            subtitle="Zapisane pozycje do szybkiego dodania"
            onPress={() => navigation?.navigate('Main', { screen: 'Catalog' })}
          />
          <Divider />
          <SettingsRow
            icon="📐"
            title="Własne jednostki"
            subtitle={settings.customUnits.length > 0
              ? settings.customUnits.join(', ')
              : 'Brak własnych jednostek'}
            onPress={() => setOpenDrawer('units')}
          />
          <Divider />
          <SettingsRow
            icon="🚪"
            title="Wyloguj się"
            onPress={handleLogout}
            danger
          />
        </View>

        <Text variant="bodySmall" style={styles.version}>OfertaPro v1.0.0</Text>
      </ScrollView>

      {/* Drawers */}
      <CompanyDrawer visible={openDrawer === 'company'} onDismiss={() => setOpenDrawer(null)} />
      <LogoDrawer visible={openDrawer === 'logo'} onDismiss={() => setOpenDrawer(null)} />
      <VatDrawer visible={openDrawer === 'vat'} onDismiss={() => setOpenDrawer(null)} />
      <ValidDaysDrawer visible={openDrawer === 'validDays'} onDismiss={() => setOpenDrawer(null)} />
      <FooterDrawer visible={openDrawer === 'footer'} onDismiss={() => setOpenDrawer(null)} />
      <UnitsDrawer visible={openDrawer === 'units'} onDismiss={() => setOpenDrawer(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outline,
  },
  scroll: { paddingBottom: 40 },
  sectionHeader: {
    color: COLORS.grey400,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.outline,
  },
  row: { backgroundColor: '#fff' },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: COLORS.grey50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowEmoji: { fontSize: 18 },
  rowContent: { flex: 1 },
  rowTitle: { fontWeight: '600' },
  rowSubtitle: { color: COLORS.grey400, marginTop: 1 },
  chevron: {
    fontSize: 22,
    color: COLORS.grey400,
    fontWeight: '300',
    marginLeft: 8,
  },
  logoPreview: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: COLORS.grey50,
    borderRadius: 10,
    marginBottom: 4,
  },
  logoEmpty: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: COLORS.grey50,
    borderRadius: 10,
    marginBottom: 4,
  },
  logo: {
    width: 200,
    height: 66,
  },
  version: {
    textAlign: 'center',
    color: COLORS.grey400,
    marginTop: 24,
  },
  // Drawer
  drawerContent: {
    padding: 20,
    gap: 12,
    paddingBottom: 12,
  },
  input: { backgroundColor: '#fff' },
  fieldLabel: {
    color: COLORS.grey600,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { margin: 0 },
  drawerActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
});
