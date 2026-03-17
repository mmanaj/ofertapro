import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Button, Text, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useStore } from '../store/useStore';
import { generateAndSharePdf, buildHtml } from '../utils/pdf';
import { COLORS } from '../theme/theme';

export default function PdfPreviewScreen({ navigation, route }: any) {
  const { offerId } = route.params;
  const offer = useStore(s => s.getOffer(offerId));
  const company = useStore(s => s.company);
  const [sharing, setSharing] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    if (offer && company) {
      setHtmlContent(buildHtml(offer, company));
    }
  }, [offer, company]);

  if (!offer || !company) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text variant="bodyLarge" style={{ color: COLORS.grey600 }}>
            Brak danych oferty lub profilu firmy.
          </Text>
          <Button onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
            Wróć
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    setSharing(true);
    try {
      await generateAndSharePdf(offer, company);
    } catch (e) {
      Alert.alert('Błąd', 'Nie udało się wygenerować PDF. Spróbuj ponownie.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar */}
      <View style={styles.topbar}>
        <Button
          onPress={() => navigation.goBack()}
          labelStyle={{ color: COLORS.grey600 }}
        >
          ‹ Wróć
        </Button>
        <Text variant="titleMedium" style={{ fontWeight: '700' }}>
          Podgląd PDF
        </Text>
        <Button
          mode="contained"
          icon="share"
          loading={sharing}
          disabled={sharing}
          onPress={handleShare}
          labelStyle={{ fontWeight: '700', fontSize: 12 }}
          style={{ borderRadius: 8, backgroundColor: COLORS.primary }}
        >
          Udostępnij
        </Button>
      </View>

      {/* Preview */}
      {htmlContent ? (
        <WebView
          source={{ html: htmlContent }}
          style={styles.webview}
          originWhitelist={['*']}
          scalesPageToFit={true}
        />
      ) : (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text variant="bodyMedium" style={{ color: COLORS.grey600, marginTop: 12 }}>
            Generowanie podglądu…
          </Text>
        </View>
      )}

      {/* Bottom action bar */}
      <Surface style={styles.bottomBar} elevation={4}>
        <View style={styles.offerMeta}>
          <Text variant="labelMedium" style={{ color: COLORS.grey600 }}>
            {offer.number}
          </Text>
          <Text variant="titleMedium" style={{ fontWeight: '800', color: COLORS.primary }}>
            {new Intl.NumberFormat('pl-PL', {
              minimumFractionDigits: 2, maximumFractionDigits: 2,
            }).format(offer.totalGross)} zł
          </Text>
        </View>
        <Button
          mode="contained"
          icon={sharing ? undefined : 'file-pdf-box'}
          loading={sharing}
          disabled={sharing}
          onPress={handleShare}
          style={styles.shareBtn}
          labelStyle={{ fontWeight: '700' }}
        >
          {sharing ? 'Generowanie…' : 'Pobierz / Wyślij PDF'}
        </Button>
      </Surface>
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
  webview: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bottomBar: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: COLORS.outline,
    gap: 10,
  },
  offerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shareBtn: {
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
});
