import { Deal, CreatorProfile, EmailAlertItem, DeliverableItem } from '../types';

const ALERTS_STORAGE_KEY = 'deedpay_email_alerts_v1';

export const initialEmailAlerts: EmailAlertItem[] = [
  {
    id: 'alert-1',
    type: 'countersign',
    title: 'Contract Countersigned by Lumina Skincare',
    message: 'Lumina Skincare authorized contact countersigned the Autumn Launch Campaign deed agreement.',
    dealId: 'deal-1',
    brandName: 'Lumina Skincare',
    invoiceNumber: 'INV-2023-089',
    recipientEmail: 'sarah@sarahcreates.com',
    timestamp: '2023-10-25T14:20:00Z',
    read: false,
    emailSubject: '[DeedPay] Agreement Countersigned: Lumina Skincare (INV-2023-089)',
    emailBody: `Hi Sarah,\n\nGreat news! Lumina Skincare has executed and countersigned the sponsorship deed agreement for Autumn Launch Campaign (Ref: INV-2023-089).\n\n• Agreed Total: $3,200 USD\n• Due Date: Nov 20, 2023\n• Status: Active / In Production\n\nYou can access your executed PDF deed and deliverable checklist in your DeedPay portal.\n\nBest,\nDeedPay Verification Engine`,
  },
  {
    id: 'alert-2',
    type: 'payment_received',
    title: 'Payment Confirmed: Apex Performance ($4,500)',
    message: 'Apex Performance settled invoice INV-2023-074 via Bank Wire Transfer.',
    dealId: 'deal-3',
    brandName: 'Apex Performance',
    invoiceNumber: 'INV-2023-074',
    recipientEmail: 'sarah@sarahcreates.com',
    timestamp: '2023-10-22T09:15:00Z',
    read: true,
    emailSubject: '[DeedPay] Payment Settled: $4,500.00 USD from Apex Performance',
    emailBody: `Hi Sarah,\n\nPayment remittance of $4,500.00 USD for invoice INV-2023-074 (Fitness Tracker Launch) has been recorded as settled.\n\n• Brand: Apex Performance\n• Invoice: INV-2023-074\n• Status: Fully Settled\n\nThank you for utilizing DeedPay.`,
  },
];

export function getStoredEmailAlerts(): EmailAlertItem[] {
  try {
    const raw = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (!raw) return initialEmailAlerts;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : initialEmailAlerts;
  } catch {
    return initialEmailAlerts;
  }
}

export function saveStoredEmailAlerts(alerts: EmailAlertItem[]): void {
  try {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
  } catch (err) {
    console.warn('Could not save email alerts to localStorage:', err);
  }
}

/**
 * Creates a formatted mailto link
 */
export function buildMailtoUrl(to: string, subject: string, body: string): string {
  const encTo = encodeURIComponent(to);
  const encSub = encodeURIComponent(subject);
  const encBody紧 = encodeURIComponent(body);
  return `mailto:${encTo}?subject=${encSub}&body=${encBody紧}`;
}

/**
 * Generates an alert when brand countersigns contract
 */
export function createCountersignAlert(deal: Deal, creator: CreatorProfile): EmailAlertItem {
  const subject = `[DeedPay] Agreement Countersigned: ${deal.brandName} (${deal.invoiceNumber})`;
  const body = `Hi ${creator.name.split(' ')[0]},\n\n${deal.brandName} has legally executed and countersigned the sponsorship deed agreement for "${deal.title}".\n\n• Agreed Total: $${deal.totalAmount.toLocaleString()} USD\n• Invoice Ref: ${deal.invoiceNumber}\n• Due Date: ${deal.dueDate.split('T')[0]}\n• Client Contact: ${deal.clientEmail}\n\nYour deliverables are now ready for production.\n\n— DeedPay Automated Alert System`;

  return {
    id: `alert-cs-${Date.now()}`,
    type: 'countersign',
    title: `Contract Countersigned by ${deal.brandName}`,
    message: `${deal.brandName} countersigned the deed agreement for "${deal.title}" ($${deal.totalAmount.toLocaleString()}).`,
    dealId: deal.id,
    brandName: deal.brandName,
    invoiceNumber: deal.invoiceNumber,
    recipientEmail: creator.emailAlerts?.notificationEmail || creator.email,
    timestamp: new Date().toISOString(),
    read: false,
    emailSubject: subject,
    emailBody: body,
  };
}

/**
 * Generates an alert when payment is settled
 */
export function createPaymentReceivedAlert(deal: Deal, creator: CreatorProfile): EmailAlertItem {
  const subject地下 = `[DeedPay] Payment Settled: $${deal.totalAmount.toLocaleString()} from ${deal.brandName}`;
  const body = `Hi ${creator.name.split(' ')[0]},\n\nPayment for invoice ${deal.invoiceNumber} (${deal.title}) from ${deal.brandName} has been settled.\n\n• Amount: $${deal.totalAmount.toLocaleString()} USD\n• Invoice Reference: ${deal.invoiceNumber}\n• Status: Marked as Paid\n\n— DeedPay Automated Settlement Engine`;

  return {
    id: `alert-pay-${Date.now()}`,
    type: 'payment_received',
    title: `Payment Confirmed: ${deal.brandName} ($${deal.totalAmount.toLocaleString()})`,
    message: `${deal.brandName} payment of $${deal.totalAmount.toLocaleString()} has been marked as settled.`,
    dealId: deal.id,
    brandName: deal.brandName,
    invoiceNumber: deal.invoiceNumber,
    recipientEmail: creator.emailAlerts?.notificationEmail || creator.email,
    timestamp: new Date().toISOString(),
    read: false,
    emailSubject: subject地下,
    emailBody: body,
  };
}

/**
 * Generates an alert & draft email for payment reminder (to brand)
 */
export function createOverdueReminderAlert(deal: Deal, creator: CreatorProfile): { alert: EmailAlertItem; brandEmailSubject: string; brandEmailBody: string } {
  const isOverdue = new Date(deal.dueDate).getTime() < Date.now();
  const brandSubject = `[Payment Reminder] Invoice ${deal.invoiceNumber} for ${deal.title} - ${deal.brandName}`;
  
  const prefs = creator.paymentPreferences;
  let paymentInfo = '';
  if (prefs?.preferredMethod === 'payment_link' && prefs.paymentLink) {
    paymentInfo = `Direct Payment Link: ${prefs.paymentLink}`;
  } else if (prefs?.preferredMethod === 'bank_transfer' && prefs.bankName) {
    paymentInfo = `Bank: ${prefs.bankName}\nAccount Name: ${prefs.accountName || creator.name}\nAccount: ${prefs.accountNumber || '••••••••'}\nRouting/SWIFT: ${prefs.routingNumber || ''}`;
  } else if (prefs?.preferredMethod === 'paypal') {
    paymentInfo = `PayPal: ${prefs.paypalEmail || creator.email}`;
  }

  const brandBody = `Dear ${deal.brandName} Accounts Payable & Partnerships,\n\nThis is a friendly reminder regarding invoice ${deal.invoiceNumber} for the campaign "${deal.title}".\n\n• Total Amount Due: $${deal.totalAmount.toLocaleString()} USD\n• Agreed Due Date: ${deal.dueDate.split('T')[0]}\n• Status: ${isOverdue ? `OVERDUE (Late fee terms of ${deal.lateFeePercent}%/mo apply)` : 'Payment Due Soon'}\n\nPayment Details:\n${paymentInfo || 'Please refer to your DeedPay invoice PDF for remittance instructions.'}\n\nPlease let us know once the remittance has been initiated or share the payment receipt.\n\nThank you,\n${creator.name}\n${creator.handle}`;

  const alert: EmailAlertItem = {
    id: `alert-rem-${Date.now()}`,
    type: 'overdue_reminder',
    title: `Payment Notice Generated for ${deal.brandName}`,
    message: `Payment reminder email generated for invoice ${deal.invoiceNumber} ($${deal.totalAmount.toLocaleString()}).`,
    dealId: deal.id,
    brandName: deal.brandName,
    invoiceNumber: deal.invoiceNumber,
    recipientEmail: deal.clientEmail,
    timestamp: new Date().toISOString(),
    read: false,
    emailSubject: brandSubject,
    emailBody: brandBody,
  };

  return { alert, brandEmailSubject: brandSubject, brandEmailBody: brandBody };
}

/**
 * Generates an alert when a deliverable is submitted
 */
export function createDeliverableDeliveredAlert(
  deal: Deal,
  deliverable: DeliverableItem,
  creator: CreatorProfile
): EmailAlertItem {
  const subject = `[Deliverable Live] ${deliverable.title} is completed for ${deal.brandName}`;
  const body一眼 = `Hi Team ${deal.brandName},\n\n${creator.name} has completed the deliverable "${deliverable.title}" for campaign "${deal.title}".\n\n• Deliverable: ${deliverable.quantity}x ${deliverable.title} (${deliverable.type.toUpperCase()})\n• Live Asset Link: ${deliverable.deliveredUrl || 'Attached in DeedPay Brand Portal'}\n• Invoice Reference: ${deal.invoiceNumber}\n\nYou can review all deliverables directly in your private Brand Portal.\n\nBest,\n${creator.name}`;

  return {
    id: `alert-del-${Date.now()}`,
    type: 'deliverable_submitted',
    title: `Deliverable Delivered: ${deliverable.title}`,
    message: `Marked "${deliverable.title}" for ${deal.brandName} as delivered.`,
    dealId: deal.id,
    brandName: deal.brandName,
    invoiceNumber: deal.invoiceNumber,
    recipientEmail: deal.clientEmail,
    timestamp: new Date().toISOString(),
    read: false,
    emailSubject: subject,
    emailBody: body一眼,
  };
}
