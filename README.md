# OfertaPro 📋

Aplikacja mobilna do tworzenia profesjonalnych ofert dla rzemieślników (brukarze, malarze, kamieniarze, firmy okienne/drzwiowe/ogrodzeniowe).

**React Native 0.76 + Expo 52 + React Native Paper (MD3)**

---

## Pierwsze uruchomienie

### 1. Wymagania wstępne

- Node.js 20+ — https://nodejs.org
- Git — https://git-scm.com
- Expo CLI: `npm install -g expo-cli`
- Aplikacja **Expo Go** na telefonie (iOS lub Android) — do testowania

### 2. Instalacja zależności

```bash
cd ofertapro
npm install
```

### 3. Konfiguracja Firebase (opcjonalna na start)

Aplikacja działa bez Firebase — dane są zapisywane lokalnie na urządzeniu (AsyncStorage).

Żeby włączyć logowanie przez Google:

1. Wejdź na https://console.firebase.google.com
2. Utwórz nowy projekt
3. Project Settings → General → Dodaj aplikację Web
4. Skopiuj `firebaseConfig`
5. Skopiuj `.env.example` → `.env` i wklej swoje wartości

```bash
cp .env.example .env
# edytuj .env swoim edytorem
```

### 4. Uruchomienie

```bash
npx expo start
```

Zeskanuj kod QR aplikacją **Expo Go** — aplikacja załaduje się na telefonie.

Albo uruchom na symulatorze:
```bash
npx expo start --ios      # wymaga macOS + Xcode
npx expo start --android  # wymaga Android Studio
```

---

## Struktura projektu

```
ofertapro/
├── app/                    # Expo Router entry point
│   ├── _layout.tsx         # PaperProvider + GestureHandler
│   └── index.tsx           # → AppNavigator
├── src/
│   ├── firebase/
│   │   └── config.ts       # Firebase init (opcjonalne)
│   ├── navigation/
│   │   └── AppNavigator.tsx  # React Navigation (NativeStack + BottomTabs)
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── NewOfferScreen.tsx
│   │   ├── OfferPositionsScreen.tsx
│   │   ├── OfferSummaryScreen.tsx
│   │   ├── PdfPreviewScreen.tsx
│   │   ├── CatalogScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── store/
│   │   └── useStore.ts     # Zustand + AsyncStorage persist
│   ├── theme/
│   │   └── theme.ts        # MD3 + kolory marki (#2563EB)
│   ├── types/
│   │   └── index.ts        # TypeScript interfaces
│   └── utils/
│       └── pdf.ts          # HTML → PDF (expo-print + expo-sharing)
├── .env.example
├── app.json
├── babel.config.js
├── package.json
└── tsconfig.json
```

---

## Główne funkcje MVP

| Funkcja | Status |
|---------|--------|
| Logowanie (Google + email) | ✅ UI gotowy, wymaga Firebase config |
| Onboarding — dane firmy + logo | ✅ |
| Dashboard — lista ofert + filtry | ✅ |
| Tworzenie oferty (dane klienta) | ✅ |
| Pozycje — materiały + robocizna | ✅ |
| Auto-kalkulacja netto/VAT/brutto | ✅ |
| Podsumowanie oferty | ✅ |
| Generowanie PDF on-device | ✅ |
| Udostępnianie PDF (Share Sheet) | ✅ |
| Katalog pozycji (CRUD) | ✅ |
| Ustawienia firmy | ✅ |
| Persystencja danych (AsyncStorage) | ✅ |
| Firestore (chmura) | 📋 v1.1 |

---

## Znane ograniczenia v1.0

- **Logowanie** — UI jest gotowy, ale Google Sign-In wymaga konfiguracji Firebase i natywnego builda (nie działa w Expo Go bez `expo-dev-client`)
- **react-native-webview** — wymagany do podglądu PDF; dodaj do `package.json` jeśli brakuje: `npx expo install react-native-webview`
- **Dane lokalne** — odinstalowanie aplikacji usuwa wszystkie oferty. Firestore w v1.1

---

## Następne kroki (v1.1)

1. Migracja danych do Firestore
2. Synchronizacja między urządzeniami
3. Szablony ofert
4. Historia zmian statusu
5. Powiadomienia (oferta wygasa za X dni)

---

## Publikacja

### Google Play (Internal Track)
```bash
npx eas build --platform android --profile preview
npx eas submit --platform android
```

### App Store (TestFlight)
```bash
npx eas build --platform ios --profile preview
npx eas submit --platform ios
```

Wymagane: konto EAS (`npx eas login`), konto dewelopera Apple ($99/rok) lub Google ($25 jednorazowo).

---

Zbudowano z ❤️ używając Claude + Expo + React Native Paper
