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
  referenceId: string;
  createdAt: string;
  status: 'received' | 'processed';
}

export class InquiryService {
  private static STORAGE_KEY = 'hgs_customer_inquiries';

  /**
   * Generates a unique numismatic reference identifier
   * e.g., HGS-INQ-482910
   */
  static generateReferenceId(): string {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    return `HGS-INQ-${randomSuffix}`;
  }

  /**
   * Submits a customer inquiry: persists locally to browser storage,
   * generates mailto fallback, and provides structured response.
   */
  static async submitInquiry(
    payload: CustomerInquiryPayload
  ): Promise<{ success: boolean; record: InquiryRecord; mailtoUrl: string }> {
    // Validate required fields
    if (!payload.fullName.trim()) {
      throw new Error('Full Name is required.');
    }
    if (!payload.email.trim() || !payload.email.includes('@')) {
      throw new Error('A valid email address is required.');
    }
    if (!payload.message.trim()) {
      throw new Error('Inquiry message is required.');
    }

    const referenceId = this.generateReferenceId();
    const record: InquiryRecord = {
      ...payload,
      fullName: payload.fullName.trim(),
      email: payload.email.trim(),
      phone: payload.phone?.trim() || undefined,
      productRef: payload.productRef?.trim() || undefined,
      message: payload.message.trim(),
      referenceId,
      createdAt: new Date().toISOString(),
      status: 'received'
    };

    // Persist to localStorage
    try {
      const existing = localStorage.getItem(this.STORAGE_KEY);
      const inquiries: InquiryRecord[] = existing ? JSON.parse(existing) : [];
      inquiries.unshift(record);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(inquiries));
    } catch (e) {
      console.warn('Unable to persist inquiry to localStorage', e);
    }

    // Generate mailto link for direct client transmission
    const subject = encodeURIComponent(
      `[${referenceId}] ${payload.inquiryType}${payload.productRef ? ` - ${payload.productRef}` : ''} - ${payload.fullName}`
    );
    const body = encodeURIComponent(
      `Hello Highlander Gold & Silver,\n\n` +
      `CUSTOMER INQUIRY (Ref: ${referenceId})\n` +
      `-----------------------------------------\n` +
      `From: ${payload.fullName}\n` +
      `Email: ${payload.email}\n` +
      `Phone: ${payload.phone || 'Not provided'}\n` +
      `Inquiry Type: ${payload.inquiryType}\n` +
      `Product/Item: ${payload.productRef || 'Not specified'}\n\n` +
      `Message:\n${payload.message}\n\n` +
      `-----------------------------------------\n` +
      `Submitted via highlandergoldandsilver.com`
    );
    const mailtoUrl = `mailto:${BUSINESS_INFO.email}?subject=${subject}&body=${body}`;

    // Return structured result after brief async simulated network cycle (400ms)
    await new Promise((resolve) => setTimeout(resolve, 400));

    return {
      success: true,
      record,
      mailtoUrl
    };
  }
}
