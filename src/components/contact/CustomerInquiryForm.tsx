import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icons } from '../../utils/icons';
import { InquiryService, InquiryRecord } from '../../services/inquiryService';

interface FormDataState {
  fullName: string;
  email: string;
  phone: string;
  inquiryType: string;
  productRef: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  message?: string;
}

const INQUIRY_TOPICS = [
  {
    id: 'Product Inquiry',
    label: 'Product Inquiry',
    hint: 'Specify the coin title, lot number, certification (PCGS/NGC), or acquisition questions...'
  },
  {
    id: 'Coin Authentication or Grading Question',
    label: 'Authentication & Grading',
    hint: 'Provide details about the coin (year, mintmark, weight, strike clarity, or slab certification)...'
  },
  {
    id: 'Order or Payment Question',
    label: 'Order & Settlement',
    hint: 'Inquire about PayPal checkout, 15% settlement credit, bank wire transfer, or invoicing...'
  },
  {
    id: 'Shipping Question',
    label: 'Insured Shipping',
    hint: 'Ask about our in-house insured USPS Priority packaging, tracking, or signature delivery...'
  },
  {
    id: 'General Inquiry',
    label: 'General Inquiry',
    hint: 'How can our Bigfork, Montana numismatic specialists assist you today?'
  }
];

export const CustomerInquiryForm: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState<FormDataState>({
    fullName: '',
    email: '',
    phone: '',
    inquiryType: 'Product Inquiry',
    productRef: '',
    message: ''
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    record: InquiryRecord;
    mailtoUrl: string;
  } | null>(null);

  // Pre-populate product reference if passed in query string (e.g., /contact?product=Lot+101)
  useEffect(() => {
    const productParam = searchParams.get('product') || searchParams.get('lot');
    if (productParam) {
      setFormData((prev) => ({
        ...prev,
        productRef: productParam,
        inquiryType: 'Product Inquiry'
      }));
    }
  }, [searchParams]);

  // Field validation
  const validateField = (name: keyof FormDataState, value: string): string | undefined => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required.';
        if (value.trim().length < 2) return 'Please enter at least 2 characters.';
        return undefined;
      case 'email':
        if (!value.trim()) return 'Email address is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return 'Please enter a valid email address.';
        }
        return undefined;
      case 'message':
        if (!value.trim()) return 'Please enter your message.';
        if (value.trim().length < 10) return 'Message must be at least 10 characters.';
        return undefined;
      default:
        return undefined;
    }
  };

  const validateAll = (): FormErrors => {
    const newErrors: FormErrors = {};
    const nameErr = validateField('fullName', formData.fullName);
    if (nameErr) newErrors.fullName = nameErr;

    const emailErr = validateField('email', formData.email);
    if (emailErr) newErrors.email = emailErr;

    const msgErr = validateField('message', formData.message);
    if (msgErr) newErrors.message = msgErr;

    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (submitError) setSubmitError(null);

    if (touched[name]) {
      const err = validateField(name as keyof FormDataState, value);
      setErrors((prev) => ({
        ...prev,
        [name]: err
      }));
    }
  };

  const handleTopicSelect = (topicId: string) => {
    setFormData((prev) => ({ ...prev, inquiryType: topicId }));
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name as keyof FormDataState, value);
    setErrors((prev) => ({
      ...prev,
      [name]: err
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      fullName: true,
      email: true,
      message: true
    });

    const currentErrors = validateAll();
    setErrors(currentErrors);

    if (Object.keys(currentErrors).length > 0) {
      const firstErrorField = Object.keys(currentErrors)[0];
      const el = document.getElementById(`inquiry-${firstErrorField}`);
      if (el) el.focus();
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await InquiryService.submitInquiry({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        inquiryType: formData.inquiryType,
        productRef: formData.productRef,
        message: formData.message
      });

      setSubmissionResult({
        record: response.record,
        mailtoUrl: response.mailtoUrl
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to submit inquiry at this moment. Please verify your details or contact us directly.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyRef = (refId: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(refId);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2200);
    }
  };

  const handleResetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      inquiryType: 'Product Inquiry',
      productRef: '',
      message: ''
    });
    setTouched({});
    setErrors({});
    setSubmitError(null);
    setSubmissionResult(null);
  };

  // Find active topic hint for dynamic placeholder
  const activeTopic = INQUIRY_TOPICS.find((t) => t.id === formData.inquiryType);
  const activeTopicHint = activeTopic?.hint || 'Tell us what you are looking for or how we can assist you...';

  // SUCCESS STATE VIEW
  if (submissionResult) {
    const { record, mailtoUrl } = submissionResult;
    return (
      <div className="modern-inquiry-card inquiry-success-state" aria-live="polite">
        <div className="success-header">
          <div className="success-icon-badge">
            <Icons.Check size={22} strokeWidth={2.5} />
          </div>
          <h2 className="modern-form-title">Inquiry Sent Successfully</h2>
          <p className="modern-form-subtitle">
            Thank you, {record.fullName}. Your message is in our Bigfork queue and our specialists will respond within 1 business day.
          </p>
        </div>

        {/* Interactive Click-to-Copy Ref Banner */}
        <div
          className="success-ref-interactive-card"
          onClick={() => handleCopyRef(record.referenceId)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCopyRef(record.referenceId); }}
          title="Click to copy Reference ID"
        >
          <div className="success-ref-left">
            <span className="success-ref-label">Official Reference</span>
            <span className="success-ref-code">{record.referenceId}</span>
          </div>
          <div className="success-copy-action">
            {copiedRef ? (
              <span className="copy-status copied">
                <Icons.Check size={14} />
                <span>Copied</span>
              </span>
            ) : (
              <span className="copy-status">
                <Icons.Copy size={14} />
                <span>Copy ID</span>
              </span>
            )}
          </div>
        </div>

        <div className="success-details-card">
          <div className="success-detail-row">
            <span className="success-label">Category:</span>
            <span className="success-value">{record.inquiryType}</span>
          </div>
          {record.productRef && (
            <div className="success-detail-row">
              <span className="success-label">Listing Ref:</span>
              <span className="success-value">{record.productRef}</span>
            </div>
          )}
          <div className="success-detail-row">
            <span className="success-label">Reply Email:</span>
            <span className="success-value">{record.email}</span>
          </div>
        </div>

        <div className="success-actions-row">
          <a
            href={mailtoUrl}
            className="btn btn-gold success-btn"
            title="Open an email draft in your email client"
          >
            <Icons.Mail size={16} />
            <span>Open Email Copy</span>
          </a>

          <button
            type="button"
            onClick={handleResetForm}
            className="btn btn-silver success-btn"
          >
            <Icons.Refresh size={15} />
            <span>Send Another Inquiry</span>
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE MODERN INTERACTIVE FORM VIEW
  return (
    <div className="modern-inquiry-card">
      {/* Clean, unboxed header */}
      <div className="modern-form-header">
        <h2 className="modern-form-title">How Can We Help You?</h2>
        <p className="modern-form-subtitle">
          Send our numismatic team an inquiry and we will get back to you promptly.
        </p>
      </div>

      {/* Interactive Quick Category Selector Chips */}
      <div className="inquiry-category-chips-wrap">
        <span className="category-chips-label">Quick Select Category:</span>
        <div className="category-chips-list" role="radiogroup" aria-label="Quick Select Category">
          {INQUIRY_TOPICS.map((topic) => {
            const isSelected = formData.inquiryType === topic.id;
            return (
              <button
                key={topic.id}
                type="button"
                className={`category-chip ${isSelected ? 'category-chip-active' : ''}`}
                onClick={() => handleTopicSelect(topic.id)}
                role="radio"
                aria-checked={isSelected}
                disabled={isSubmitting}
              >
                <span>{topic.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submission error alert */}
      {submitError && (
        <div className="modern-error-banner" role="alert">
          <Icons.AlertCircle size={18} className="modern-error-icon" />
          <div className="modern-error-text">
            <span>{submitError}</span>
          </div>
        </div>
      )}

      {/* Modern Form */}
      <form
        onSubmit={handleSubmit}
        className="modern-form"
        noValidate
        aria-label="Customer Inquiry Form"
      >
        {/* Row 1: Full Name & Email Address */}
        <div className="modern-form-row">
          <div className="modern-form-field">
            <label htmlFor="inquiry-fullName" className="modern-field-label">
              <span>Full Name</span>
              <span className="required-star" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id="inquiry-fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Johnathan Vance"
              className={`modern-input ${touched.fullName && errors.fullName ? 'modern-input-error' : ''}`}
              aria-required="true"
              aria-invalid={touched.fullName && !!errors.fullName}
              aria-describedby={touched.fullName && errors.fullName ? 'fullName-error' : undefined}
              disabled={isSubmitting}
              autoComplete="name"
            />
            {touched.fullName && errors.fullName && (
              <span className="modern-field-error" id="fullName-error" role="alert">
                {errors.fullName}
              </span>
            )}
          </div>

          <div className="modern-form-field">
            <label htmlFor="inquiry-email" className="modern-field-label">
              <span>Email Address</span>
              <span className="required-star" aria-hidden="true">*</span>
            </label>
            <input
              type="email"
              id="inquiry-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="name@example.com"
              className={`modern-input ${touched.email && errors.email ? 'modern-input-error' : ''}`}
              aria-required="true"
              aria-invalid={touched.email && !!errors.email}
              aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
              disabled={isSubmitting}
              autoComplete="email"
            />
            {touched.email && errors.email && (
              <span className="modern-field-error" id="email-error" role="alert">
                {errors.email}
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Phone Number & Inquiry Type */}
        <div className="modern-form-row">
          <div className="modern-form-field">
            <label htmlFor="inquiry-phone" className="modern-field-label">
              <span>Phone Number</span>
              <span className="optional-tag">(Optional)</span>
            </label>
            <input
              type="tel"
              id="inquiry-phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="(406) 555-0199"
              className="modern-input"
              disabled={isSubmitting}
              autoComplete="tel"
            />
          </div>

          <div className="modern-form-field">
            <label htmlFor="inquiry-type" className="modern-field-label">
              <span>Inquiry Type</span>
              <span className="required-star" aria-hidden="true">*</span>
            </label>
            <div className="modern-select-wrap">
              <select
                id="inquiry-type"
                name="inquiryType"
                value={formData.inquiryType}
                onChange={handleChange}
                className="modern-select"
                disabled={isSubmitting}
              >
                {INQUIRY_TOPICS.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.id}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Row 3: Product Name or Item Number */}
        <div className="modern-form-field full-width">
          <label htmlFor="inquiry-productRef" className="modern-field-label">
            <span>Product Name or Item Number</span>
            <span className="optional-tag">(Optional)</span>
          </label>
          <input
            type="text"
            id="inquiry-productRef"
            name="productRef"
            value={formData.productRef}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Lot #101 or 1881-S Morgan Dollar"
            className="modern-input"
            disabled={isSubmitting}
          />
        </div>

        {/* Row 4: Message with Live Character Indicator */}
        <div className="modern-form-field full-width">
          <label htmlFor="inquiry-message" className="modern-field-label">
            <span>Message</span>
            <div className="message-counter-tag">
              <span className={`char-indicator ${formData.message.trim().length >= 10 ? 'char-valid' : ''}`}>
                {formData.message.length} chars {formData.message.trim().length >= 10 ? '✓' : ''}
              </span>
              <span className="required-star" aria-hidden="true">*</span>
            </div>
          </label>
          <textarea
            id="inquiry-message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={3}
            placeholder={activeTopicHint}
            className={`modern-textarea ${touched.message && errors.message ? 'modern-input-error' : ''}`}
            aria-required="true"
            aria-invalid={touched.message && !!errors.message}
            aria-describedby={touched.message && errors.message ? 'message-error' : undefined}
            disabled={isSubmitting}
          />
          {touched.message && errors.message && (
            <span className="modern-field-error" id="message-error" role="alert">
              {errors.message}
            </span>
          )}
        </div>

        {/* Action Row */}
        <div className="modern-form-submit-wrap">
          <button
            type="submit"
            id="btn-send-inquiry"
            className="btn btn-gold modern-submit-btn"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Icons.Refresh size={16} className="modern-spinner" />
                <span>Sending Inquiry...</span>
              </>
            ) : (
              <>
                <Icons.Send size={15} className="btn-send-icon" />
                <span>Send Inquiry</span>
              </>
            )}
          </button>
        </div>

        {/* Interactive Trust & Response Assurance Micro-Strip */}
        <div className="inquiry-trust-strip">
          <div className="trust-pill-item">
            <Icons.Clock size={13} className="trust-pill-icon" />
            <span>&lt; 24h Response</span>
          </div>
          <div className="trust-pill-item">
            <Icons.ShieldCheck size={13} className="trust-pill-icon" />
            <span>Confidential Intake</span>
          </div>
          <div className="trust-pill-item">
            <Icons.MapPin size={13} className="trust-pill-icon" />
            <span>Direct Armory Vault</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CustomerInquiryForm;
