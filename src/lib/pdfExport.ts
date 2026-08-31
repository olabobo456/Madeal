import jsPDF from 'jspdf';
import { Deal, CreatorProfile } from '../types';
import { formatMoney, getCurrencySymbol } from '../utils/currency';

/**
 * Generates and downloads a clean, professional, print-ready PDF invoice
 */
export function exportInvoicePDF(deal: Deal, creator: CreatorProfile) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const currency = deal.currency || creator.defaultCurrency || 'USD';
  const sym = getCurrencySymbol(currency);
  const taxRate = deal.taxRate ?? creator.defaultTaxRate ?? 0;
  const subtotal = deal.subtotal ?? (deal.totalAmount / (1 + taxRate / 100));
  const taxAmount = deal.taxAmount ?? (deal.totalAmount - subtotal);

  // --- HEADER SECTION ---
  doc.setFillColor(89, 23, 27); // #59171B
  doc.roundedRect(14, 12, 182, 28, 4, 4, 'F');

  doc.setTextColor(254, 215, 184); // #FED7B8
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Madeal', 22, 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('OFFICIAL SPONSORSHIP INVOICE', 22, 33);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`INVOICE: ${deal.invoiceNumber}`, 186, 25, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Issued: ${deal.createdAt.split('T')[0]}  |  Due: ${deal.dueDate.split('T')[0]}`, 186, 33, { align: 'right' });

  // --- PARTIES METADATA (2 COLUMNS) ---
  let y = 48;

  // Left Column: Creator / Issuer
  doc.setTextColor(89, 23, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('FROM (CREATOR / ISSUER)', 14, y);

  doc.setTextColor(35, 11, 13);
  doc.setFontSize(11);
  doc.text(creator.name, 14, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(126, 99, 95);
  doc.text(creator.handle, 14, y + 11);
  doc.text(creator.email, 14, y + 16);
  if (creator.taxId) {
    doc.text(`Tax / VAT ID: ${creator.taxId}`, 14, y + 21);
  }

  // Right Column: Brand / Client
  doc.setTextColor(89, 23, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('BILLED TO (BRAND / SPONSOR)', 110, y);

  doc.setTextColor(35, 11, 13);
  doc.setFontSize(11);
  doc.text(deal.brandName, 110, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(126, 99, 95);
  doc.text(`Contact: ${deal.clientEmail}`, 110, y + 11);
  doc.text(`Campaign: ${deal.title}`, 110, y + 16);

  // Status Badge
  const isPaid = deal.status === 'paid';
  doc.setFillColor(isPaid ? 234 : 254, isPaid ? 246 : 243, isPaid ? 238 : 236);
  doc.roundedRect(145, y + 20, 51, 8, 2, 2, 'F');
  doc.setTextColor(isPaid ? 45 : 89, isPaid ? 138 : 23, isPaid ? 104 : 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`STATUS: ${deal.status.toUpperCase()}`, 170.5, y + 25.5, { align: 'center' });

  // --- DELIVERABLES LINE ITEMS TABLE ---
  y = 80;

  // Table Header
  doc.setFillColor(250, 243, 236);
  doc.rect(14, y, 182, 8, 'F');
  doc.setTextColor(89, 23, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('ITEM / DELIVERABLE SPECIFICATION', 18, y + 5.5);
  doc.text('QTY', 125, y + 5.5, { align: 'center' });
  doc.text(`RATE (${currency})`, 150, y + 5.5, { align: 'right' });
  doc.text('SUBTOTAL', 190, y + 5.5, { align: 'right' });

  y += 9;

  deal.deliverables.forEach((item, index) => {
    const itemTotal = item.baseRate * item.quantity;

    doc.setTextColor(35, 11, 13);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`${index + 1}. ${item.title}`, 18, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(126, 99, 95);
    const desc = item.description || `Platform deliverable: ${item.type.toUpperCase()}`;
    doc.text(desc.substring(0, 75), 18, y + 9);

    doc.setTextColor(35, 11, 13);
    doc.setFontSize(9);
    doc.text(String(item.quantity), 125, y + 5.5, { align: 'center' });
    doc.text(`${sym}${item.baseRate.toLocaleString()}`, 150, y + 5.5, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(`${sym}${itemTotal.toLocaleString()}`, 190, y + 5.5, { align: 'right' });

    // Subtle line divider
    doc.setDrawColor(236, 217, 203);
    doc.line(14, y + 12, 196, y + 12);

    y += 14;
  });

  // --- TOTAL SUMMARY BOX ---
  y += 4;
  doc.setFillColor(250, 243, 236);
  doc.roundedRect(120, y, 76, 28, 3, 3, 'F');

  doc.setTextColor(126, 99, 95);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Subtotal:', 125, y + 7);
  doc.text(`${sym}${subtotal.toLocaleString()}`, 190, y + 7, { align: 'right' });

  doc.text(`Tax / VAT (${taxRate}%):`, 125, y + 13);
  doc.text(`${sym}${taxAmount.toLocaleString()}`, 190, y + 13, { align: 'right' });

  doc.setDrawColor(236, 217, 203);
  doc.line(125, y + 16, 191, y + 16);

  doc.setTextColor(89, 23, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL DUE:', 125, y + 23);
  doc.text(`${sym}${deal.totalAmount.toLocaleString()} ${currency}`, 190, y + 23, { align: 'right' });

  // --- PAYMENT REMITTANCE INSTRUCTIONS ---
  y += 34;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(236, 217, 203);
  doc.roundedRect(14, y, 182, 38, 3, 3, 'FD');

  doc.setTextColor(89, 23, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('REMITTANCE & SETTLEMENT INSTRUCTIONS', 20, y + 7);

  const prefs = creator.paymentPreferences;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(35, 11, 13);

  if (prefs?.preferredMethod === 'bank_transfer') {
    doc.text(`Bank Name: ${prefs.bankName || 'Global Bank'}`, 20, y + 13);
    doc.text(`Account Name: ${prefs.accountName || creator.name}`, 20, y + 18);
    doc.text(`Account / IBAN: ${prefs.accountNumber || '••••••••4892'}   |   Routing / SWIFT: ${prefs.routingNumber || '121000358'}`, 20, y + 23);
  } else if (prefs?.preferredMethod === 'payment_link') {
    doc.text(`Direct Payment Link: ${prefs.paymentLink || 'https://buy.stripe.com/creator'}`, 20, y + 15);
  } else if (prefs?.preferredMethod === 'paypal') {
    doc.text(`PayPal Account: ${prefs.paypalEmail || creator.email}`, 20, y + 15);
  } else {
    doc.text(`Payment Method: Direct Settlement as per Deed Agreement`, 20, y + 15);
  }

  doc.setTextColor(126, 99, 95);
  doc.setFontSize(7.5);
  const note = prefs?.customInstructions || `Please quote invoice reference ${deal.invoiceNumber} in transfer notes. Late fee of ${deal.lateFeePercent}% per month applies after ${deal.dueDate.split('T')[0]}.`;
  doc.text(note, 20, y + 30, { maxWidth: 170 });

  // --- FOOTER / LEGAL ATTESTATION ---
  doc.setFontSize(7.5);
  doc.setTextColor(140, 114, 109);
  doc.text(
    `Madeal Generated Document • Nonce: ${deal.id} • Binding sponsorship agreement reference: ${deal.invoiceNumber}`,
    105,
    286,
    { align: 'center' }
  );

  doc.save(`Invoice_${deal.invoiceNumber}_${deal.brandName.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Generates and downloads a legally binding PDF Deed Agreement
 */
export function exportContractPDF(deal: Deal, creator: CreatorProfile) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const currency = deal.currency || creator.defaultCurrency || 'USD';
  const sym = getCurrencySymbol(currency);
  const taxRate = deal.taxRate ?? creator.defaultTaxRate ?? 0;

  // Header Box
  doc.setFillColor(89, 23, 27);
  doc.roundedRect(14, 12, 182, 26, 4, 4, 'F');

  doc.setTextColor(254, 215, 184);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('BINDING SPONSORSHIP DEED & AGREEMENT', 105, 23, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Contract Reference: ${deal.invoiceNumber}  •  Execution Date: ${deal.createdAt.split('T')[0]}`, 105, 31, { align: 'center' });

  let y = 46;

  // Parties
  doc.setTextColor(89, 23, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('1. PARTIES TO THE AGREEMENT', 14, y);

  doc.setTextColor(35, 11, 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  y += 5;
  doc.text(`CREATOR: ${creator.name} (${creator.handle})  |  Email: ${creator.email}`, 14, y);
  y += 5;
  doc.text(`BRAND / SPONSOR: ${deal.brandName}  |  Authorized Contact: ${deal.clientEmail}`, 14, y);

  y += 8;
  doc.setTextColor(89, 23, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('2. DELIVERABLES & PRODUCTION SCOPE', 14, y);

  y += 5;
  doc.setTextColor(35, 11, 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  deal.deliverables.forEach((item, idx) => {
    doc.text(`• Deliverable #${idx + 1}: ${item.quantity}x ${item.title} (${item.type.toUpperCase()}) — ${sym}${(item.baseRate * item.quantity).toLocaleString()} ${currency}`, 18, y);
    y += 4.5;
  });

  y += 4;
  doc.setTextColor(89, 23, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('3. USAGE RIGHTS, EXCLUSIVITY & REMUNERATION', 14, y);

  doc.setTextColor(35, 11, 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  y += 5;
  doc.text(`• Total Consideration: ${sym}${deal.totalAmount.toLocaleString()} ${currency} (Includes ${taxRate}% Tax/VAT)`, 18, y);
  y += 4.5;
  doc.text(`• Paid Ad Usage Term: ${deal.usageTerm}`, 18, y);
  y += 4.5;
  doc.text(`• Competitive Exclusivity: ${deal.exclusivity}`, 18, y);
  y += 4.5;
  doc.text(`• Included Revisions: ${deal.revisions} rounds`, 18, y);
  y += 4.5;
  doc.text(`• Payment Due Date: ${deal.dueDate.split('T')[0]} (Late fee: ${deal.lateFeePercent}% / month)`, 18, y);

  y += 8;
  doc.setTextColor(89, 23, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('4. SIGNATURES & EXECUTION ATTESTATION', 14, y);

  y += 6;
  // Two boxes for signatures
  doc.setFillColor(250, 243, 236);
  doc.roundedRect(14, y, 86, 32, 2, 2, 'F');
  doc.roundedRect(110, y, 86, 32, 2, 2, 'F');

  doc.setTextColor(89, 23, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('CREATOR SIGNATURE', 18, y + 6);
  doc.text('BRAND / SPONSOR SIGNATURE', 114, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(35, 11, 13);
  doc.setFontSize(8);
  doc.text(`Signed by: ${creator.name}`, 18, y + 14);
  doc.text(`Status: Digitally Executed`, 18, y + 20);

  if (deal.clientSigned) {
    doc.text(`Signed by: ${deal.brandName} Authorized Officer`, 114, y + 14);
    doc.text(`Timestamp: ${deal.signedAt || 'Verified via Portal'}`, 114, y + 20);
    doc.setTextColor(45, 138, 104);
    doc.setFont('helvetica', 'bold');
    doc.text('STATUS: COUNTERSIGNED & ACTIVE', 114, y + 26);
  } else {
    doc.setTextColor(166, 58, 36);
    doc.text('Status: Awaiting Brand Countersignature', 114, y + 14);
  }

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(140, 114, 109);
  doc.text(
    `Madeal Verification Protocol • Contract ID: ${deal.id} • Legally binding deed agreement under applicable commercial law`,
    105,
    286,
    { align: 'center' }
  );

  doc.save(`Contract_Deed_${deal.invoiceNumber}_${deal.brandName.replace(/\s+/g, '_')}.pdf`);
}

