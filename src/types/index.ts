// ─── Dane firmy (jednorazowa konfiguracja) ───────────────────────────────────
export interface CompanyProfile {
  name: string;
  phone: string;
  email: string;
  nip?: string;
  address?: string;
  logoUri?: string; // lokalne URI zdjęcia
}

// ─── Pozycja oferty ───────────────────────────────────────────────────────────
export type PositionCategory = 'material' | 'labor';
export type VatRate = 0 | 5 | 8 | 23;
export type Unit = 'm²' | 'mb' | 't' | 'szt.' | 'godz.' | 'kpl.' | 'm³';

export interface OfferPosition {
  id: string;
  category: PositionCategory;
  name: string;
  quantity: number;
  unit: Unit;
  unitPriceNet: number; // cena netto za jednostkę
  vatRate: VatRate;
  totalNet: number;     // auto: quantity * unitPriceNet
  totalGross: number;   // auto: totalNet * (1 + vatRate/100)
}

// ─── Oferta ───────────────────────────────────────────────────────────────────
export type OfferStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

export interface Offer {
  id: string;
  number: string;          // np. "OF/001/2026"
  createdAt: string;       // ISO date string
  validUntilDays: number;  // 14 | 30 | 60
  status: OfferStatus;

  // Dane klienta / projektu
  clientName: string;
  clientAddress?: string;
  projectName: string;
  projectDescription?: string;

  // Warunki
  paymentTerms?: string;
  advancePercent?: number;

  // Pozycje
  positions: OfferPosition[];

  // Sumy (auto-kalkulowane)
  totalMaterialNet: number;
  totalLaborNet: number;
  totalNet: number;
  totalVat: number;
  totalGross: number;
}

// ─── Pozycja z katalogu ───────────────────────────────────────────────────────
export interface CatalogItem {
  id: string;
  category: PositionCategory;
  name: string;
  defaultUnit: Unit;
  defaultUnitPriceNet: number;
  defaultVatRate: VatRate;
}

// ─── Ustawienia aplikacji ────────────────────────────────────────────────────
export interface AppSettings {
  defaultVatRate: number;
  defaultValidDays: number;
  offerFooter: string;
  customVatRates: number[];
  customUnits: string[];
  customValidDays: number[];
}

// ─── Nawigacja ────────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  Main: undefined;
  NewOffer: { duplicateFromId?: string };
  OfferPositions: { offerId: string };
  CatalogPicker: { offerId: string; category: PositionCategory };
  OfferSummary: { offerId: string };
  PdfPreview: { offerId: string };
};
