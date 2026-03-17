import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Image, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../store/useStore';
import Drawer from '../components/Drawer';
import { GLASS } from '../theme/theme';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <Text style={styles.sectionLabel} allowFontScaling accessibilityRole="header">
      {label}
    </Text>
  );
}

function SettingsRow({ iconName, iconBg, iconColor, title, subtitle, onPress, danger }: {
  iconName: string; iconBg: string; iconColor?: string; title: string;
  subtitle?: string; onPress?: () => void; danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}: ${subtitle}` : title}
      accessibilityHint={onPress && !danger ? 'Kliknij, aby edytować' : undefined}
      style={({ pressed }) => [styles.settingsRow, pressed && styles.settingsRowPressed]}
    >
      <View style={[styles.settingsIcon, { backgroundColor: iconBg }]}>
        <Ionicons
          name={iconName as any}
          size={18}
          color={iconColor ?? (danger ? '#FF3B30' : '#FFFFFF')}
          accessibilityElementsHidden
        />
      </View>
      <View style={styles.settingsRowContent}>
        <Text
          style={[styles.settingsRowTitle, danger && styles.settingsRowTitleDanger]}
          allowFontScaling
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.settingsRowSub} allowFontScaling numberOfLines={1}>{subtitle}</Text>
        ) : null}
      </View>
      {onPress && !danger ? (
        <Ionicons name="chevron-forward" size={16} color="rgba(60,60,67,0.3)" accessibilityElementsHidden />
      ) : null}
    </Pressable>
  );
}

function RowDivider() {
  return <View style={styles.rowDivider} />;
}

function IOSField({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize, multiline }: any) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel} allowFontScaling accessibilityRole="text">{label}</Text>
      <View style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#AEAEB2"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'sentences'}
          style={[styles.fieldTextInput, multiline && styles.fieldTextInputMultiline]}
          clearButtonMode="whileEditing"
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          allowFontScaling
          accessibilityLabel={label}
        />
      </View>
    </View>
  );
}

function TogglePill({ label, selected, onPress, onRemove }: {
  label: string; selected: boolean; onPress: () => void; onRemove?: () => void;
}) {
  return (
    <View style={styles.pillWrapper}>
      <Pressable
        onPress={onPress}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={label}
        style={[styles.pill, selected && styles.pillSelected]}
      >
        <Text style={[styles.pillText, selected && styles.pillTextSelected]} allowFontScaling>
          {label}
        </Text>
      </Pressable>
      {onRemove ? (
        <Pressable
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={`Usuń ${label}`}
          style={styles.pillRemoveBtn}
        >
          <Ionicons name="close" size={12} color="#FFFFFF" accessibilityElementsHidden />
        </Pressable>
      ) : null}
    </View>
  );
}

function DrawerActions({ onDismiss, onSave, saveLabel = 'Zapisz' }: {
  onDismiss: () => void; onSave: () => void; saveLabel?: string;
}) {
  return (
    <View style={styles.drawerActions}>
      <Pressable
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Anuluj"
        style={styles.drawerBtnSecondary}
      >
        <Text style={styles.drawerBtnSecondaryLabel} allowFontScaling>Anuluj</Text>
      </Pressable>
      <Pressable
        onPress={onSave}
        accessibilityRole="button"
        accessibilityLabel={saveLabel}
        style={styles.drawerBtnPrimary}
      >
        <Text style={styles.drawerBtnPrimaryLabel} allowFontScaling>{saveLabel}</Text>
      </Pressable>
    </View>
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

  React.useEffect(() => {
    if (visible && company) {
      setName(company.name); setPhone(company.phone); setEmail(company.email);
      setNip(company.nip ?? ''); setAddress(company.address ?? '');
    }
  }, [visible]);

  const handleSave = () => {
    if (!name.trim() || !phone.trim() || !email.trim()) {
      Alert.alert('Wymagane pola', 'Wypełnij nazwę firmy, telefon i email.');
      return;
    }
    setCompany({
      ...(company ?? { logoUri: undefined }),
      name: name.trim(), phone: phone.trim(), email: email.trim(),
      nip: nip.trim() || undefined, address: address.trim() || undefined,
    });
    onDismiss();
  };

  return (
    <Drawer visible={visible} onDismiss={onDismiss} title="Dane firmy">
      <View style={styles.drawerContent}>
        <IOSField label="Nazwa firmy *" value={name} onChangeText={setName} placeholder="Jan Kowalski lub Firma XYZ" />
        <IOSField label="Telefon *" value={phone} onChangeText={setPhone} placeholder="+48 000 000 000" keyboardType="phone-pad" autoCapitalize="none" />
        <IOSField label="Email *" value={email} onChangeText={setEmail} placeholder="firma@example.com" keyboardType="email-address" autoCapitalize="none" />
        <IOSField label="NIP (opcjonalne)" value={nip} onChangeText={setNip} placeholder="000-000-00-00" keyboardType="numeric" autoCapitalize="none" />
        <IOSField label="Adres firmy (opcjonalne)" value={address} onChangeText={setAddress} placeholder="ul. Przykładowa 1, 00-000 Warszawa" multiline />
        <DrawerActions onDismiss={onDismiss} onSave={handleSave} />
      </View>
    </Drawer>
  );
}

// ─── Drawer: Logo firmy ───────────────────────────────────────────────────────

function LogoDrawer({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const company = useStore(s => s.company);
  const setCompany = useStore(s => s.setCompany);

  const handlePickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [3, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets[0] && company) {
      setCompany({ ...company, logoUri: result.assets[0].uri });
    }
  };

  const handleDeleteLogo = () => {
    if (company) setCompany({ ...company, logoUri: undefined });
  };

  return (
    <Drawer visible={visible} onDismiss={onDismiss} title="Logo firmy">
      <View style={[styles.drawerContent, { alignItems: 'center' }]}>
        {company?.logoUri ? (
          <View style={styles.logoPreviewBox}>
            <Image
              source={{ uri: company.logoUri }}
              style={styles.logoPreviewImg}
              resizeMode="contain"
              accessibilityLabel="Logo firmy"
            />
          </View>
        ) : (
          <View style={styles.logoPlaceholder} accessibilityLabel="Brak logo firmy" accessibilityRole="none">
            <Ionicons name="image-outline" size={40} color="#C6C6C8" accessibilityElementsHidden />
            <Text style={styles.logoPlaceholderText} allowFontScaling>Brak logo</Text>
          </View>
        )}
        <Pressable
          onPress={handlePickLogo}
          accessibilityRole="button"
          accessibilityLabel={company?.logoUri ? 'Zmień logo firmy' : 'Wybierz logo firmy'}
          accessibilityHint="Otwiera galerię zdjęć"
          style={styles.logoPickBtn}
        >
          <Text style={styles.logoPickBtnLabel} allowFontScaling>
            {company?.logoUri ? 'Zmień logo' : 'Wybierz logo'}
          </Text>
        </Pressable>
        {company?.logoUri ? (
          <Pressable
            onPress={handleDeleteLogo}
            accessibilityRole="button"
            accessibilityLabel="Usuń logo firmy"
            style={styles.drawerTextBtn}
          >
            <Text style={styles.drawerTextBtnDanger} allowFontScaling>Usuń logo</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Zamknij"
          style={styles.drawerTextBtn}
        >
          <Text style={styles.drawerTextBtnNeutral} allowFontScaling>Zamknij</Text>
        </Pressable>
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

  React.useEffect(() => { if (visible) setSelected(settings.defaultVatRate); }, [visible]);

  const standardRates = [0, 8, 23];
  const allRates = [...standardRates, ...settings.customVatRates].sort((a, b) => a - b);

  const handleAdd = () => {
    const val = parseInt(newRate);
    if (isNaN(val) || val < 0 || val > 100) { Alert.alert('Podaj poprawną stawkę (0–100)'); return; }
    if (!allRates.includes(val)) updateSettings({ customVatRates: [...settings.customVatRates, val] });
    setNewRate('');
  };

  const handleRemoveCustom = (rate: number) => {
    updateSettings({ customVatRates: settings.customVatRates.filter(r => r !== rate) });
    if (selected === rate) setSelected(23);
  };

  return (
    <Drawer visible={visible} onDismiss={onDismiss} title="Domyślna stawka VAT">
      <View style={styles.drawerContent}>
        <Text style={styles.fieldLabel} allowFontScaling>Wybierz stawkę domyślną</Text>
        <View style={styles.pillsRow} accessibilityRole="radiogroup" accessibilityLabel="Stawka VAT">
          {allRates.map(r => (
            <TogglePill
              key={r}
              label={`${r}%`}
              selected={selected === r}
              onPress={() => setSelected(r)}
              onRemove={settings.customVatRates.includes(r) ? () => handleRemoveCustom(r) : undefined}
            />
          ))}
        </View>
        <View style={styles.miniDivider} />
        <Text style={styles.fieldLabel} allowFontScaling>Dodaj własną stawkę</Text>
        <View style={styles.addRow}>
          <View style={styles.addInput}>
            <TextInput
              value={newRate}
              onChangeText={setNewRate}
              keyboardType="numeric"
              placeholder="np. 5"
              placeholderTextColor="#AEAEB2"
              style={styles.addTextInput}
              clearButtonMode="whileEditing"
              allowFontScaling
              accessibilityLabel="Nowa stawka VAT"
            />
            <Text style={styles.addSuffix} allowFontScaling>%</Text>
          </View>
          <Pressable
            onPress={handleAdd}
            accessibilityRole="button"
            accessibilityLabel="Dodaj stawkę VAT"
            style={styles.addBtn}
          >
            <Text style={styles.addBtnLabel} allowFontScaling>Dodaj</Text>
          </Pressable>
        </View>
        <DrawerActions
          onDismiss={onDismiss}
          onSave={() => { updateSettings({ defaultVatRate: selected }); onDismiss(); }}
        />
      </View>
    </Drawer>
  );
}

// ─── Drawer: Ważność oferty ───────────────────────────────────────────────────

function ValidDaysDrawer({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const settings = useStore(s => s.settings);
  const updateSettings = useStore(s => s.updateSettings);
  const [selected, setSelected] = useState(settings.defaultValidDays);
  const [newDays, setNewDays] = useState('');

  React.useEffect(() => { if (visible) setSelected(settings.defaultValidDays); }, [visible]);

  const standardOptions = [14, 30, 60];
  const allDays = [...new Set([...standardOptions, ...(settings.customValidDays ?? [])])].sort((a, b) => a - b);

  const handleAdd = () => {
    const val = parseInt(newDays);
    if (isNaN(val) || val <= 0) { Alert.alert('Podaj poprawną liczbę dni (większą od 0)'); return; }
    if (!allDays.includes(val)) updateSettings({ customValidDays: [...(settings.customValidDays ?? []), val] });
    setNewDays('');
  };

  const handleRemoveCustom = (days: number) => {
    updateSettings({ customValidDays: (settings.customValidDays ?? []).filter(d => d !== days) });
    if (selected === days) setSelected(14);
  };

  return (
    <Drawer visible={visible} onDismiss={onDismiss} title="Domyślna ważność oferty">
      <View style={styles.drawerContent}>
        <Text style={styles.fieldLabel} allowFontScaling>Wybierz domyślny termin</Text>
        <View style={styles.pillsRow} accessibilityRole="radiogroup" accessibilityLabel="Liczba dni ważności">
          {allDays.map(d => (
            <TogglePill
              key={d}
              label={`${d} dni`}
              selected={selected === d}
              onPress={() => setSelected(d)}
              onRemove={(settings.customValidDays ?? []).includes(d) ? () => handleRemoveCustom(d) : undefined}
            />
          ))}
        </View>
        <View style={styles.miniDivider} />
        <Text style={styles.fieldLabel} allowFontScaling>Dodaj własny termin</Text>
        <View style={styles.addRow}>
          <View style={styles.addInput}>
            <TextInput
              value={newDays}
              onChangeText={setNewDays}
              keyboardType="numeric"
              placeholder="np. 7"
              placeholderTextColor="#AEAEB2"
              style={styles.addTextInput}
              clearButtonMode="whileEditing"
              allowFontScaling
              accessibilityLabel="Liczba dni ważności"
            />
            <Text style={styles.addSuffix} allowFontScaling>dni</Text>
          </View>
          <Pressable
            onPress={handleAdd}
            accessibilityRole="button"
            accessibilityLabel="Dodaj termin ważności"
            style={styles.addBtn}
          >
            <Text style={styles.addBtnLabel} allowFontScaling>Dodaj</Text>
          </Pressable>
        </View>
        <DrawerActions
          onDismiss={onDismiss}
          onSave={() => { updateSettings({ defaultValidDays: selected }); onDismiss(); }}
        />
      </View>
    </Drawer>
  );
}

// ─── Drawer: Stopka ───────────────────────────────────────────────────────────

function FooterDrawer({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const settings = useStore(s => s.settings);
  const updateSettings = useStore(s => s.updateSettings);
  const [text, setText] = useState(settings.offerFooter);

  React.useEffect(() => { if (visible) setText(settings.offerFooter); }, [visible]);

  return (
    <Drawer visible={visible} onDismiss={onDismiss} title="Stopka oferty">
      <View style={styles.drawerContent}>
        <IOSField
          label="Tekst stopki"
          value={text}
          onChangeText={setText}
          placeholder="np. Dziękujemy za zaufanie. Oferta obowiązuje przez podany okres."
          multiline
        />
        <DrawerActions
          onDismiss={onDismiss}
          onSave={() => { updateSettings({ offerFooter: text.trim() }); onDismiss(); }}
        />
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
    if (![...standardUnits, ...settings.customUnits].includes(val)) {
      updateSettings({ customUnits: [...settings.customUnits, val] });
    }
    setNewUnit('');
  };

  const handleRemove = (unit: string) => {
    updateSettings({ customUnits: settings.customUnits.filter(u => u !== unit) });
  };

  return (
    <Drawer visible={visible} onDismiss={onDismiss} title="Własne jednostki">
      <View style={styles.drawerContent}>
        <Text style={styles.fieldLabel} allowFontScaling>Domyślne jednostki</Text>
        <View style={styles.pillsRow} accessibilityRole="none">
          {standardUnits.map(u => (
            <View
              key={u}
              style={styles.pillReadOnly}
              accessibilityLabel={u}
            >
              <Text style={styles.pillReadOnlyText} allowFontScaling>{u}</Text>
            </View>
          ))}
        </View>

        {settings.customUnits.length > 0 && (
          <>
            <View style={styles.miniDivider} />
            <Text style={styles.fieldLabel} allowFontScaling>Własne jednostki</Text>
            <View style={styles.pillsRow} accessibilityRole="none">
              {settings.customUnits.map(u => (
                <TogglePill
                  key={u}
                  label={u}
                  selected={false}
                  onPress={() => {}}
                  onRemove={() => handleRemove(u)}
                />
              ))}
            </View>
          </>
        )}

        <View style={styles.miniDivider} />
        <Text style={styles.fieldLabel} allowFontScaling>Dodaj własną jednostkę</Text>
        <View style={styles.addRow}>
          <View style={styles.addInput}>
            <TextInput
              value={newUnit}
              onChangeText={setNewUnit}
              placeholder="np. ha, km"
              placeholderTextColor="#AEAEB2"
              style={styles.addTextInput}
              clearButtonMode="whileEditing"
              allowFontScaling
              accessibilityLabel="Nowa jednostka miary"
            />
          </View>
          <Pressable
            onPress={handleAdd}
            accessibilityRole="button"
            accessibilityLabel="Dodaj jednostkę"
            style={styles.addBtn}
          >
            <Text style={styles.addBtnLabel} allowFontScaling>Dodaj</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Zamknij"
          style={styles.drawerTextBtn}
        >
          <Text style={styles.drawerTextBtnNeutral} allowFontScaling>Zamknij</Text>
        </Pressable>
      </View>
    </Drawer>
  );
}

// ─── Main SettingsScreen ──────────────────────────────────────────────────────

type DrawerType = 'company' | 'logo' | 'vat' | 'validDays' | 'footer' | 'units' | null;

export default function SettingsScreen({ navigation }: any) {
  const company = useStore(s => s.company);
  const settings = useStore(s => s.settings);
  const [openDrawer, setOpenDrawer] = useState<DrawerType>(null);

  const handleLogout = () => {
    Alert.alert('Wyloguj się?', 'Dane firmy i oferty zostaną zachowane na urządzeniu.', [
      { text: 'Anuluj' },
      { text: 'Wyloguj', style: 'destructive', onPress: () => navigation?.navigate('Login') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with blur */}
      <BlurView intensity={65} tint="systemMaterial" style={styles.headerBlur}>
        <View style={styles.headerInner}>
          <Text style={styles.largeTitle} allowFontScaling accessibilityRole="header">Ustawienia</Text>
        </View>
      </BlurView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* MOJA FIRMA */}
        <SectionLabel label="Moja firma" />
        <View style={styles.card}>
          <SettingsRow
            iconName="business-outline"
            iconBg="#007AFF"
            title={company?.name ?? 'Dane firmy'}
            subtitle={company ? `${company.email} · ${company.phone}` : 'Uzupełnij dane firmy'}
            onPress={() => setOpenDrawer('company')}
          />
          <RowDivider />
          <SettingsRow
            iconName="image-outline"
            iconBg="#AF52DE"
            title="Logo firmy"
            subtitle={company?.logoUri ? 'Logo ustawione' : 'Brak logo'}
            onPress={() => setOpenDrawer('logo')}
          />
        </View>

        {/* OFERTY */}
        <SectionLabel label="Oferty" />
        <View style={styles.card}>
          <SettingsRow
            iconName="pricetag-outline"
            iconBg="#FF9500"
            title="Domyślna stawka VAT"
            subtitle={`${settings.defaultVatRate}%`}
            onPress={() => setOpenDrawer('vat')}
          />
          <RowDivider />
          <SettingsRow
            iconName="calendar-outline"
            iconBg="#34C759"
            title="Domyślna ważność oferty"
            subtitle={`${settings.defaultValidDays} dni`}
            onPress={() => setOpenDrawer('validDays')}
          />
          <RowDivider />
          <SettingsRow
            iconName="document-text-outline"
            iconBg="#007AFF"
            title="Stopka oferty"
            subtitle={settings.offerFooter || 'Brak stopki'}
            onPress={() => setOpenDrawer('footer')}
          />
        </View>

        {/* APLIKACJA */}
        <SectionLabel label="Aplikacja" />
        <View style={styles.card}>
          <SettingsRow
            iconName="cube-outline"
            iconBg="#FF9500"
            title="Katalog usług i materiałów"
            subtitle="Zapisane pozycje do szybkiego dodania"
            onPress={() => navigation?.navigate('Main', { screen: 'Catalog' })}
          />
          <RowDivider />
          <SettingsRow
            iconName="resize-outline"
            iconBg="#AF52DE"
            title="Własne jednostki"
            subtitle={settings.customUnits.length > 0 ? settings.customUnits.join(', ') : 'Brak własnych jednostek'}
            onPress={() => setOpenDrawer('units')}
          />
          <RowDivider />
          <SettingsRow
            iconName="log-out-outline"
            iconBg="rgba(255,59,48,0.10)"
            iconColor="#FF3B30"
            title="Wyloguj się"
            onPress={handleLogout}
            danger
          />
        </View>

        <Text style={styles.versionText} allowFontScaling accessibilityElementsHidden>
          OfertaPro v1.0.0
        </Text>
      </ScrollView>

      {/* Drawers */}
      <CompanyDrawer   visible={openDrawer === 'company'}   onDismiss={() => setOpenDrawer(null)} />
      <LogoDrawer      visible={openDrawer === 'logo'}      onDismiss={() => setOpenDrawer(null)} />
      <VatDrawer       visible={openDrawer === 'vat'}       onDismiss={() => setOpenDrawer(null)} />
      <ValidDaysDrawer visible={openDrawer === 'validDays'} onDismiss={() => setOpenDrawer(null)} />
      <FooterDrawer    visible={openDrawer === 'footer'}    onDismiss={() => setOpenDrawer(null)} />
      <UnitsDrawer     visible={openDrawer === 'units'}     onDismiss={() => setOpenDrawer(null)} />
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
    paddingVertical: 12,
    backgroundColor: GLASS.navBar,
  },
  largeTitle: { fontSize: 28, fontWeight: '700', color: '#000000', letterSpacing: -0.5 },

  scrollContent: { paddingBottom: 48 },

  // Section label
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636366',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 6,
  },

  // Card
  card: {
    marginHorizontal: 16,
    backgroundColor: GLASS.card,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: GLASS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: GLASS.separator, marginLeft: 60 },

  // Settings row
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  settingsRowPressed: { backgroundColor: 'rgba(60,60,67,0.04)' },
  settingsIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingsRowContent: { flex: 1 },
  settingsRowTitle: { fontSize: 17, fontWeight: '500', color: '#000000' },
  settingsRowTitleDanger: { color: '#FF3B30' },
  settingsRowSub: { fontSize: 13, color: '#AEAEB2', marginTop: 1 },

  // Version
  versionText: { textAlign: 'center', fontSize: 13, color: '#AEAEB2', marginTop: 24 },

  // Drawer content
  drawerContent: { padding: 20, gap: 16 },

  // IOSField
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
  fieldInputMultiline: { alignItems: 'flex-start', paddingTop: 12, paddingBottom: 12 },
  fieldTextInput: { flex: 1, fontSize: 17, color: '#000000' },
  fieldTextInputMultiline: { textAlignVertical: 'top' },

  // Toggle pill
  pillWrapper: { flexDirection: 'row', alignItems: 'center' },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    minHeight: 32,
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(60,60,67,0.12)',
  },
  pillSelected: {
    backgroundColor: '#007AFF',
    borderColor: 'rgba(0,122,255,0.3)',
  },
  pillText: { fontSize: 13, fontWeight: '600', color: '#636366' },
  pillTextSelected: { color: '#FFFFFF' },
  pillRemoveBtn: {
    marginLeft: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#C6C6C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillReadOnly: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(242,242,247,0.8)',
    minHeight: 32,
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(60,60,67,0.08)',
  },
  pillReadOnlyText: { fontSize: 13, fontWeight: '600', color: '#AEAEB2' },

  // Divider inside drawer
  miniDivider: { height: StyleSheet.hairlineWidth, backgroundColor: GLASS.separator },

  // Add row (input + button)
  addRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  addInput: {
    flex: 1,
    backgroundColor: GLASS.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: GLASS.border,
  },
  addTextInput: { flex: 1, fontSize: 17, color: '#000000' },
  addSuffix: { fontSize: 15, color: '#636366', marginLeft: 4 },
  addBtn: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(0,122,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(0,122,255,0.2)',
  },
  addBtnLabel: { fontSize: 17, color: '#007AFF', fontWeight: '600' },

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

  // Logo drawer
  logoPreviewBox: {
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: GLASS.border,
  },
  logoPreviewImg: { width: 200, height: 66 },
  logoPlaceholder: {
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    gap: 4,
    borderWidth: 0.5,
    borderColor: GLASS.border,
  },
  logoPlaceholderText: { fontSize: 13, color: '#AEAEB2' },
  logoPickBtn: {
    width: '100%',
    height: 48,
    borderRadius: 999,
    backgroundColor: 'rgba(0,122,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(0,122,255,0.2)',
  },
  logoPickBtnLabel: { fontSize: 17, color: '#007AFF', fontWeight: '600' },

  // Text-only drawer buttons
  drawerTextBtn: { height: 44, alignItems: 'center', justifyContent: 'center' },
  drawerTextBtnDanger: { fontSize: 17, color: '#FF3B30' },
  drawerTextBtnNeutral: { fontSize: 17, color: '#636366' },
});
