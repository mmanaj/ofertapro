import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useStore } from '../store/useStore';
import GlassNavBar from '../components/GlassNavBar';
import { GLASS } from '../theme/theme';
import { generateAndSharePdf, buildHtml } from '../utils/pdf';

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
        <GlassNavBar
          title="Podgląd PDF"
          onBack={() => navigation.goBack()}
          backLabel="Wróć"
        />
        <View style={styles.errorState}>
          <Text style={styles.errorText} allowFontScaling accessibilityRole="text">
            Brak danych oferty lub profilu firmy.
          </Text>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Wróć do poprzedniego ekranu"
            style={styles.errorBackBtn}
          >
            <Text style={styles.errorBackLabel} allowFontScaling>Wróć</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    setSharing(true);
    try {
      await generateAndSharePdf(offer, company);
    } catch {
      Alert.alert('Błąd', 'Nie udało się wygenerować PDF. Spróbuj ponownie.');
    } finally {
      setSharing(false);
    }
  };

  const gross = new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(offer.totalGross);

  return (
    <SafeAreaView style={styles.container}>
      <GlassNavBar
        title="Podgląd PDF"
        onBack={() => navigation.goBack()}
        backLabel="Wróć"
        rightElement={
          <Pressable
            onPress={handleShare}
            disabled={sharing}
            accessibilityRole="button"
            accessibilityLabel={sharing ? 'Generowanie PDF…' : 'Udostępnij PDF'}
            accessibilityState={{ disabled: sharing }}
            style={styles.shareBtn}
          >
            {sharing
              ? <ActivityIndicator size="small" color="#007AFF" />
              : <Ionicons name="share-outline" size={22} color="#007AFF" accessibilityElementsHidden />
            }
          </Pressable>
        }
      />

      {/* PDF preview */}
      {htmlContent ? (
        <WebView
          source={{ html: htmlContent }}
          style={styles.webview}
          originWhitelist={['*']}
          scalesPageToFit
          accessibilityLabel="Podgląd dokumentu PDF"
        />
      ) : (
        <View style={styles.loading} accessibilityRole="none">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText} allowFontScaling>Generowanie podglądu…</Text>
        </View>
      )}

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomMeta}>
          <Text style={styles.offerNumber} allowFontScaling accessibilityElementsHidden>{offer.number}</Text>
          <Text style={styles.offerGross} allowFontScaling accessibilityElementsHidden>{gross} zł</Text>
        </View>
        <Pressable
          onPress={handleShare}
          disabled={sharing}
          accessibilityRole="button"
          accessibilityLabel={sharing ? 'Generowanie PDF…' : `Pobierz lub wyślij PDF. Suma brutto: ${gross} zł`}
          accessibilityState={{ disabled: sharing }}
          style={[styles.downloadBtn, sharing && styles.downloadBtnDisabled]}
        >
          {sharing
            ? <ActivityIndicator size="small" color="#FFFFFF" accessibilityElementsHidden />
            : <Ionicons name="document-arrow-down-outline" size={20} color="#FFFFFF" accessibilityElementsHidden />
          }
          <Text style={styles.downloadBtnLabel} allowFontScaling maxFontSizeMultiplier={1.2}>
            {sharing ? 'Generowanie…' : 'Pobierz / Wyślij PDF'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },

  // Error state
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#F2F2F7' },
  errorText: { fontSize: 17, color: '#636366', textAlign: 'center', lineHeight: 24 },
  errorBackBtn: {
    marginTop: 16,
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 999,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  errorBackLabel: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },

  // Share button in nav bar
  shareBtn: { width: 44, height: 44, alignItems: 'flex-end', justifyContent: 'center', paddingRight: 4 },

  // WebView
  webview: { flex: 1 },

  // Loading state
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F2F7' },
  loadingText: { fontSize: 15, color: '#636366', marginTop: 12 },

  // Bottom bar
  bottomBar: {
    backgroundColor: GLASS.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: GLASS.separator,
    padding: 16,
    gap: 12,
  },
  bottomMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerNumber: { fontSize: 13, color: '#636366' },
  offerGross: { fontSize: 17, fontWeight: '800', color: '#007AFF' },

  // Download button
  downloadBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 999,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  downloadBtnDisabled: { backgroundColor: '#636366', shadowOpacity: 0 },
  downloadBtnLabel: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.3 },
});
