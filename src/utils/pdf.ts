import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import type { Offer, CompanyProfile } from '../types';

const formatPLN = (amount: number) =>
  new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) + ' zł';

const CATEGORY_LABEL = { material: '🧱 Materiały', labor: '🔧 Robocizna' };

export async function generateAndSharePdf(offer: Offer, company: CompanyProfile): Promise<void> {
  const html = buildHtml(offer, company);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: `Oferta ${offer.number} — ${offer.clientName}`,
    UTI: 'com.adobe.pdf',
  });
}

export function buildHtml(offer: Offer, company: CompanyProfile): string {
  const validUntil = new Date(offer.createdAt);
  validUntil.setDate(validUntil.getDate() + offer.validUntilDays);

  const materials = offer.positions.filter(p => p.category === 'material');
  const labor = offer.positions.filter(p => p.category === 'labor');

  const posRows = (positions: typeof offer.positions) =>
    positions.map(p => `
      <tr>
        <td>${p.name}</td>
        <td class="center">${p.quantity}</td>
        <td class="center">${p.unit}</td>
        <td class="right">${formatPLN(p.unitPriceNet)}</td>
        <td class="center">${p.vatRate}%</td>
        <td class="right bold">${formatPLN(p.totalNet)}</td>
      </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111827; padding: 32px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start;
            border-bottom: 3px solid #2563EB; padding-bottom: 16px; margin-bottom: 20px; }
  .company-name { font-size: 18px; font-weight: 800; color: #2563EB; margin-bottom: 4px; }
  .company-detail { font-size: 10px; color: #6B7280; line-height: 1.6; }
  .offer-title { font-size: 22px; font-weight: 900; color: #111827; text-align: right; }
  .offer-meta { font-size: 10px; color: #6B7280; text-align: right; line-height: 1.8; }
  .client-box { background: #F9FAFB; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; }
  .client-box .label { font-size: 9px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .client-name { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
  .section-title { font-size: 11px; font-weight: 800; color: #6B7280; text-transform: uppercase;
                   letter-spacing: 1px; margin: 16px 0 6px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1E3A5F; color: #fff; font-size: 9px; font-weight: 700; text-transform: uppercase;
       padding: 6px 8px; letter-spacing: .5px; }
  td { padding: 5px 8px; border-bottom: 1px solid #F3F4F6; font-size: 10px; }
  tr:nth-child(even) td { background: #FAFAFA; }
  .center { text-align: center; }
  .right { text-align: right; }
  .bold { font-weight: 700; }
  .totals { margin-top: 16px; }
  .totals-row { display: flex; justify-content: space-between; padding: 4px 0;
                border-bottom: 1px solid #F3F4F6; }
  .totals-grand { background: #2563EB; color: #fff; padding: 10px 16px; border-radius: 8px;
                  display: flex; justify-content: space-between; margin-top: 8px; }
  .totals-grand .label { font-size: 13px; font-weight: 700; }
  .totals-grand .amount { font-size: 18px; font-weight: 900; }
  .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #E5E7EB;
            font-size: 9px; color: #9CA3AF; display: flex; justify-content: space-between; }
  .signature { display: flex; justify-content: space-between; margin-top: 32px; }
  .sig-box { width: 45%; border-top: 1px solid #9CA3AF; padding-top: 6px; font-size: 9px; color: #9CA3AF; }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="company-name">${company.name}</div>
    <div class="company-detail">
      ${company.phone ? `Tel: ${company.phone}<br>` : ''}
      ${company.email ? `Email: ${company.email}<br>` : ''}
      ${company.nip ? `NIP: ${company.nip}<br>` : ''}
      ${company.address ? company.address : ''}
    </div>
  </div>
  <div>
    <div class="offer-title">OFERTA</div>
    <div class="offer-meta">
      Nr: <strong>${offer.number}</strong><br>
      Data: ${format(new Date(offer.createdAt), 'dd.MM.yyyy', { locale: pl })}<br>
      Ważna do: ${format(validUntil, 'dd.MM.yyyy', { locale: pl })}
    </div>
  </div>
</div>

<div class="client-box">
  <div class="label">Oferta dla:</div>
  <div class="client-name">${offer.clientName}</div>
  ${offer.clientAddress ? `<div style="font-size:10px;color:#6B7280;">${offer.clientAddress}</div>` : ''}
  <div style="font-size:11px;font-weight:600;margin-top:4px;">Projekt: ${offer.projectName}</div>
  ${offer.projectDescription ? `<div style="font-size:10px;color:#6B7280;margin-top:2px;">${offer.projectDescription}</div>` : ''}
</div>

${materials.length > 0 ? `
<div class="section-title">🧱 Materiały</div>
<table>
  <thead><tr>
    <th>Nazwa</th><th>Ilość</th><th>Jed.</th><th class="right">Cena netto</th><th>VAT</th><th class="right">Suma netto</th>
  </tr></thead>
  <tbody>${posRows(materials)}</tbody>
</table>` : ''}

${labor.length > 0 ? `
<div class="section-title">🔧 Robocizna</div>
<table>
  <thead><tr>
    <th>Nazwa</th><th>Ilość</th><th>Jed.</th><th class="right">Cena netto</th><th>VAT</th><th class="right">Suma netto</th>
  </tr></thead>
  <tbody>${posRows(labor)}</tbody>
</table>` : ''}

<div class="totals" style="max-width:300px;margin-left:auto;margin-top:20px;">
  <div class="totals-row"><span>Materiały netto</span><span class="bold">${formatPLN(offer.totalMaterialNet)}</span></div>
  <div class="totals-row"><span>Robocizna netto</span><span class="bold">${formatPLN(offer.totalLaborNet)}</span></div>
  <div class="totals-row"><span>Razem netto</span><span class="bold">${formatPLN(offer.totalNet)}</span></div>
  <div class="totals-row"><span>VAT</span><span class="bold">${formatPLN(offer.totalVat)}</span></div>
  <div class="totals-grand">
    <span class="label">RAZEM BRUTTO</span>
    <span class="amount">${formatPLN(offer.totalGross)}</span>
  </div>
</div>

${offer.paymentTerms || offer.advancePercent ? `
<div style="margin-top:20px;font-size:10px;color:#374151;background:#F9FAFB;padding:10px 14px;border-radius:6px;">
  ${offer.advancePercent ? `<strong>Zaliczka:</strong> ${offer.advancePercent}% — ${formatPLN(offer.totalGross * offer.advancePercent / 100)}<br>` : ''}
  ${offer.paymentTerms ? `<strong>Warunki płatności:</strong> ${offer.paymentTerms}` : ''}
</div>` : ''}

<div class="signature">
  <div class="sig-box">Wystawił / pieczęć firmy</div>
  <div class="sig-box">Zaakceptował / data</div>
</div>

<div class="footer">
  <span>Oferta ważna ${offer.validUntilDays} dni od daty wystawienia</span>
  <span>Oferta wygenerowana przez OfertaPro</span>
</div>

</body>
</html>`;
}
