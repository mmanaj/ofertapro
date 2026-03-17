import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';
import type { Offer, OfferPosition, CompanyProfile, CatalogItem, PositionCategory, AppSettings } from '../types';

// ─── Pomocnicze ───────────────────────────────────────────────────────────────
function calcPosition(pos: Omit<OfferPosition, 'totalNet' | 'totalGross'>): OfferPosition {
  const totalNet = pos.quantity * pos.unitPriceNet;
  const totalGross = totalNet * (1 + pos.vatRate / 100);
  return { ...pos, totalNet, totalGross };
}

function calcOfferTotals(positions: OfferPosition[]) {
  const materials = positions.filter(p => p.category === 'material');
  const labor = positions.filter(p => p.category === 'labor');
  const totalMaterialNet = materials.reduce((s, p) => s + p.totalNet, 0);
  const totalLaborNet = labor.reduce((s, p) => s + p.totalNet, 0);
  const totalNet = totalMaterialNet + totalLaborNet;
  const totalVat = positions.reduce((s, p) => s + (p.totalGross - p.totalNet), 0);
  const totalGross = totalNet + totalVat;
  return { totalMaterialNet, totalLaborNet, totalNet, totalVat, totalGross };
}

function generateOfferNumber(existingOffers: Offer[]): string {
  const year = new Date().getFullYear();
  const count = existingOffers.filter(o =>
    o.number.includes(`/${year}`)
  ).length + 1;
  return `OF/${String(count).padStart(3, '0')}/${year}`;
}

// ─── Store ────────────────────────────────────────────────────────────────────
interface AppState {
  // Profil firmy
  company: CompanyProfile | null;
  setCompany: (c: CompanyProfile) => void;

  // Oferty
  offers: Offer[];
  addOffer: (data: Omit<Offer, 'id' | 'number' | 'createdAt' | 'positions' | 'totalMaterialNet' | 'totalLaborNet' | 'totalNet' | 'totalVat' | 'totalGross'>) => string;
  updateOffer: (id: string, data: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
  duplicateOffer: (id: string) => string;
  getOffer: (id: string) => Offer | undefined;

  // Pozycje w ofercie
  addPosition: (offerId: string, pos: Omit<OfferPosition, 'id' | 'totalNet' | 'totalGross'>) => void;
  updatePosition: (offerId: string, posId: string, data: Partial<OfferPosition>) => void;
  deletePosition: (offerId: string, posId: string) => void;

  // Katalog
  catalog: CatalogItem[];
  addCatalogItem: (item: Omit<CatalogItem, 'id'>) => string;
  updateCatalogItem: (id: string, data: Partial<CatalogItem>) => void;
  deleteCatalogItem: (id: string) => void;

  // Ustawienia
  settings: AppSettings;
  updateSettings: (data: Partial<AppSettings>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Firma ──────────────────────────────────────────────────────────────
      company: null,
      setCompany: (c) => set({ company: c }),

      // ── Oferty ─────────────────────────────────────────────────────────────
      offers: [],

      addOffer: (data) => {
        const id = uuid();
        const number = generateOfferNumber(get().offers);
        const offer: Offer = {
          ...data,
          id,
          number,
          createdAt: new Date().toISOString(),
          positions: [],
          totalMaterialNet: 0,
          totalLaborNet: 0,
          totalNet: 0,
          totalVat: 0,
          totalGross: 0,
        };
        set(s => ({ offers: [offer, ...s.offers] }));
        return id;
      },

      updateOffer: (id, data) =>
        set(s => ({
          offers: s.offers.map(o => o.id === id ? { ...o, ...data } : o),
        })),

      deleteOffer: (id) =>
        set(s => ({ offers: s.offers.filter(o => o.id !== id) })),

      duplicateOffer: (id) => {
        const original = get().offers.find(o => o.id === id);
        if (!original) return '';
        const newId = uuid();
        const number = generateOfferNumber(get().offers);
        const duplicate: Offer = {
          ...original,
          id: newId,
          number,
          status: 'draft',
          createdAt: new Date().toISOString(),
          clientName: '',
          clientAddress: '',
          positions: original.positions.map(p => ({ ...p, id: uuid() })),
        };
        set(s => ({ offers: [duplicate, ...s.offers] }));
        return newId;
      },

      getOffer: (id) => get().offers.find(o => o.id === id),

      // ── Pozycje ────────────────────────────────────────────────────────────
      addPosition: (offerId, posData) => {
        const pos = calcPosition({ ...posData, id: uuid() });
        set(s => ({
          offers: s.offers.map(o => {
            if (o.id !== offerId) return o;
            const positions = [...o.positions, pos];
            return { ...o, positions, ...calcOfferTotals(positions) };
          }),
        }));
      },

      updatePosition: (offerId, posId, data) => {
        set(s => ({
          offers: s.offers.map(o => {
            if (o.id !== offerId) return o;
            const positions = o.positions.map(p => {
              if (p.id !== posId) return p;
              return calcPosition({ ...p, ...data });
            });
            return { ...o, positions, ...calcOfferTotals(positions) };
          }),
        }));
      },

      deletePosition: (offerId, posId) => {
        set(s => ({
          offers: s.offers.map(o => {
            if (o.id !== offerId) return o;
            const positions = o.positions.filter(p => p.id !== posId);
            return { ...o, positions, ...calcOfferTotals(positions) };
          }),
        }));
      },

      // ── Katalog ────────────────────────────────────────────────────────────
      catalog: [],
      addCatalogItem: (item) => {
        const id = uuid();
        set(s => ({ catalog: [...s.catalog, { ...item, id }] }));
        return id;
      },
      updateCatalogItem: (id, data) =>
        set(s => ({ catalog: s.catalog.map(c => c.id === id ? { ...c, ...data } : c) })),
      deleteCatalogItem: (id) =>
        set(s => ({ catalog: s.catalog.filter(c => c.id !== id) })),

      // ── Ustawienia ─────────────────────────────────────────────────────────
      settings: {
        defaultVatRate: 23,
        defaultValidDays: 14,
        offerFooter: '',
        customVatRates: [],
        customUnits: [],
        customValidDays: [],
      },
      updateSettings: (data) =>
        set(s => ({ settings: { ...s.settings, ...data } })),
    }),
    {
      name: 'ofertapro-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
