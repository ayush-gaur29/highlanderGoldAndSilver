import { supabase } from './supabase';
import { BUSINESS_INFO } from '../data/businessInfo';

export interface CustomerInquiryPayload {
  fullName: string;
  email: string;
  phone?: string;
  inquiryType: string;
  productRef?: string;
  message: string;
}

export interface InquiryRecord extends CustomerInquiryPayload {
  id: string;
  referenceId: string;
  createdAt: string;
  status: string;
  lotNumber?: string;
  lotTitle?: string;
}

/**
 * Generates an 8-character hex reference identifier matching Supabase's default UUID slice formula:
 * e.g., 'inq-a1b2c3d4'
 */
export function generateInquiryId(): string {
  const randomBytes = new Uint8Array(4);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 4; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }
  const hex = Array.from(randomBytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `inq-${hex}`;
}

/**
 * Maps form category options to valid Supabase database check constraint values:
 * CHECK (inquiry_type IN ('Lot Acquisition', 'Condition / Provenance', 'Sell / Appraisal', 'General', 'Product Inquiry', 'Authentication', 'Order / Payment', 'Shipping'))
 */
export function mapToDbInquiryType(type: string): string {
  const normalized = (type || '').trim();
  switch (normalized) {
    case 'Product Inquiry':
    case 'Lot Acquisition':
      return 'Product Inquiry';
    case 'Coin Authentication or Grading Question':
    case 'Authentication & Grading':
    case 'Authentication':
    case 'Condition / Provenance':
      return 'Authentication';
    case 'Order or Payment Question':
    case 'Order & Settlement':
    case 'Order / Payment':
      return 'Order / Payment';
    case 'Shipping Question':
    case 'Insured Shipping':
    case 'Shipping':
      return 'Shipping';
    case 'Sell / Appraisal':
      return 'Sell / Appraisal';
    case 'General Inquiry':
    case 'General':
    default:
      return 'General';
  }
}

export class InquiryService {
  /**
   * Submits a customer inquiry directly to the Supabase `inquiries` table.
   * All submissions are saved as real records in the database.
   */
  static async submitInquiry(
    payload: CustomerInquiryPayload
  ): Promise<{ success: boolean; record: InquiryRecord; mailtoUrl: string }> {
    // 1. Validate required fields
    const fullName = (payload.fullName || '').trim();
    const email = (payload.email || '').trim();
    const message = (payload.message || '').trim();
    const inquiryType = (payload.inquiryType || 'General Inquiry').trim();
    const phone = payload.phone?.trim() || undefined;
    const productRef = payload.productRef?.trim() || undefined;

    if (!fullName) {
      throw new Error('Full Name is required.');
    }
    if (fullName.length < 2) {
      throw new Error('Full Name must be at least 2 characters.');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('A valid email address is required.');
    }
    if (!message) {
      throw new Error('Inquiry message is required.');
    }
    if (message.length < 10) {
      throw new Error('Message must be at least 10 characters.');
    }

    // 2. Parse product reference (extract lot number and title if provided)
    let lotNumber: string | null = null;
    let lotTitle: string | null = null;
    let inventoryId: string | null = null;

    if (productRef) {
      lotTitle = productRef;
      const lotMatch =
        productRef.match(/(?:lot\s*#?|item\s*#?|#)\s*(\d+[a-z]?)/i) ||
        productRef.match(/^(\d+[a-z]?)$/i);

      if (lotMatch) {
        lotNumber = lotMatch[1];
        // Attempt to find matching inventory item in Supabase
        try {
          const { data: matchedInv } = await supabase
            .from('inventory')
            .select('id, title, lot_number')
            .eq('lot_number', lotNumber)
            .limit(1);

          if (matchedInv && matchedInv.length > 0) {
            inventoryId = matchedInv[0].id;
            if (!lotTitle || lotTitle === lotNumber || lotTitle === `Lot #${lotNumber}`) {
              lotTitle = matchedInv[0].title;
            }
          }
        } catch {
          // If inventory lookup fails or is unavailable, proceed gracefully
        }
      }
    }

    // 3. Generate reference ID matching Supabase formula ('inq-' + 8 hex chars)
    const id = generateInquiryId();
    const referenceId = id.toUpperCase();

    // 4. Construct database payload strictly mapped to Supabase columns
    const dbInquiryType = mapToDbInquiryType(inquiryType);
    const dbRow = {
      id,
      inquirer_name: fullName,
      email,
      phone: phone || null,
      inquiry_type: dbInquiryType,
      lot_number: lotNumber || null,
      lot_title: lotTitle || null,
      inventory_id: inventoryId || null,
      message,
      status: 'New'
    };

    // 5. Insert directly into Supabase `inquiries` table
    const { error } = await supabase
      .from('inquiries')
      .insert([dbRow]);

    if (error) {
      console.error('[InquiryService] Supabase insert error:', error);
      throw new Error(error.message || 'Unable to save inquiry to database. Please try again.');
    }

    // 6. Generate mailto URL as client email fallback
    const subject = encodeURIComponent(
      `[${referenceId}] ${inquiryType}${lotTitle ? ` - ${lotTitle}` : ''} - ${fullName}`
    );
    const body = encodeURIComponent(
      `Hello Highlander Gold & Silver,\n\n` +
      `CUSTOMER INQUIRY (Ref: ${referenceId})\n` +
      `-----------------------------------------\n` +
      `From: ${fullName}\n` +
      `Email: ${email}\n` +
      `Phone: ${phone || 'Not provided'}\n` +
      `Inquiry Type: ${inquiryType}\n` +
      `Product/Item: ${lotTitle || 'Not specified'}\n\n` +
      `Message:\n${message}\n\n` +
      `-----------------------------------------\n` +
      `Submitted via highlandergoldandsilver.com`
    );
    const mailtoUrl = `mailto:${BUSINESS_INFO.email}?subject=${subject}&body=${body}`;

    const record: InquiryRecord = {
      id,
      referenceId,
      fullName,
      email,
      phone,
      inquiryType,
      productRef: lotTitle || undefined,
      message,
      createdAt: new Date().toISOString(),
      status: 'New',
      lotNumber: lotNumber || undefined,
      lotTitle: lotTitle || undefined
    };

    return {
      success: true,
      record,
      mailtoUrl
    };
  }
}
