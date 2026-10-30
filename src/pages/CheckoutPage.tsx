import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { OrderService, ValidatedCheckoutData } from '../services/orderService';
import { CustomerOrder } from '../types/auth';
import { BUSINESS_INFO } from '../data/businessInfo';
import { Icons } from '../utils/icons';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading, openAuthModal } = useAuth();
  const { cartItems, clearCart } = useCart();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'PayPal' | 'Bank Wire'>('PayPal');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Validation & Checkout Processing State
  const [validation, setValidation] = useState<ValidatedCheckoutData | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Completed Order State
  const [placedOrder, setPlacedOrder] = useState<CustomerOrder | null>(null);
  const [paypalTxnInput, setPaypalTxnInput] = useState('');
  const [isAttachingTxn, setIsAttachingTxn] = useState(false);
  const [txnSuccessMsg, setTxnSuccessMsg] = useState<string | null>(null);

  // Pre-fill fields from customer profile
  useEffect(() => {
    if (profile) {
      if (profile.full_name && !fullName) setFullName(profile.full_name);
      if (profile.phone && !phone) setPhone(profile.phone);
      if (profile.city && !city) setCity(profile.city);
      if (profile.state && !state) setState(profile.state);
    }
  }, [profile]);

  // Recalculate and validate prices against authoritative Supabase database
  useEffect(() => {
    let isMounted = true;
    if (cartItems.length === 0) {
      setIsValidating(false);
      return;
    }

    setIsValidating(true);
    setErrorMessage(null);

    OrderService.validateCartItems(cartItems)
      .then((data) => {
        if (!isMounted) return;
        setValidation(data);
        if (!data.isValid && data.errors.length > 0) {
          setErrorMessage(data.errors.join(' '));
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('[CheckoutPage] Validation error:', err);
        setErrorMessage('Failed to verify inventory prices with the database.');
      })
      .finally(() => {
        if (isMounted) setIsValidating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [cartItems]);

  // Redirect or prompt if not authenticated
  if (!authLoading && !user) {
    return (
      <main className="checkout-page-main" style={{ background: '#F8FAFD', minHeight: '80vh', padding: '3.5rem 0' }}>
        <div className="container" style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <div className="account-card" style={{ padding: '3.5rem 2rem' }}>
            <div className="empty-state-icon" style={{ margin: '0 auto 1.5rem auto' }}>
              <Icons.Shield size={36} style={{ color: 'var(--color-gold)' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', color: 'var(--color-aubergine)', marginBottom: '0.75rem' }}>
              Authentication Required for Checkout
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', maxWidth: 460, margin: '0 auto 1.75rem auto' }}>
              In accordance with Highlander Gold &amp; Silver security protocols and Montana tax-exemption verification,
              all numismatic acquisitions require an authenticated customer account.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-gold btn-md"
                onClick={() => {
                  sessionStorage.setItem('hgs_checkout_redirect', 'true');
                  openAuthModal('login');
                }}
              >
                <Icons.Lock size={16} />
                <span>Sign In to Continue Checkout</span>
              </button>
              <button
                type="button"
                className="btn btn-silver btn-md"
                onClick={() => {
                  sessionStorage.setItem('hgs_checkout_redirect', 'true');
                  openAuthModal('signup');
                }}
              >
                <span>Create Collector Account</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Handle Order Placement
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user) {
      setErrorMessage('You must be logged in to place an order.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('Recipient full name is required for insured dispatch.');
      return;
    }

    if (!address.trim() || !city.trim() || !state.trim() || !zip.trim()) {
      setErrorMessage('Complete shipping address (street, city, state, postal code) is required.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Contact telephone number is required for USPS Priority delivery confirmation.');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage('Please acknowledge the Highlander terms and Montana sales tax agreement.');
      return;
    }

    if (!validation || !validation.isValid || validation.items.length === 0) {
      setErrorMessage('Cannot place order: inventory verification failed. Please return to catalog.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await OrderService.createOrder(
        {
          fullName: fullName.trim(),
          email: user.email || '',
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          zip: zip.trim(),
          notes: notes.trim() || undefined,
          paymentMethod
        },
        cartItems
      );

      if (res.success && res.order) {
        setPlacedOrder(res.order);
        clearCart();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMessage(res.error || 'Failed to place order. Please review your details.');
      }
    } catch (err: any) {
      console.error('[CheckoutPage] Exception placing order:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while placing order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle customer attaching their PayPal transaction reference
  const handleAttachTransactionId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placedOrder || !paypalTxnInput.trim()) return;

    setIsAttachingTxn(true);
    setTxnSuccessMsg(null);

    const res = await OrderService.attachPaymentReference(
      placedOrder.order_number,
      paypalTxnInput.trim()
    );

    setIsAttachingTxn(false);

    if (res.success) {
      setTxnSuccessMsg('Payment reference saved! Armory staff will verify and process fulfillment.');
      setTimeout(() => setTxnSuccessMsg(null), 7000);
    } else {
      setErrorMessage(res.error || 'Failed to attach payment reference.');
    }
  };

  // ==============================================================
  // VIEW: ORDER CONFIRMATION STATE (AFTER SUCCESSFUL PLACEMENT)
  // ==============================================================
  if (placedOrder) {
    const paypalUrl = `${BUSINESS_INFO.payPalUrl}/${placedOrder.total_amount.toFixed(2)}`;

    return (
      <main className="checkout-page-main" style={{ background: '#F8FAFD', minHeight: '80vh', padding: '3.5rem 0 5rem' }}>
        <div className="container" style={{ maxWidth: 840, margin: '0 auto' }}>
          <div className="account-card" style={{ padding: '2.5rem 2.25rem' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'rgba(212, 175, 55, 0.15)',
                  color: 'var(--color-gold-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                  border: '2px solid var(--color-gold)'
                }}
              >
                <Icons.CheckCircle size={38} />
              </div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-gold-dark)', fontWeight: 700 }}>
                Highlander Order Recorded
              </span>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-aubergine)', margin: '0.35rem 0' }}>
                Acquisition Order Placed Successfully
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Your order reference is <strong style={{ color: 'var(--color-aubergine)' }}>{placedOrder.order_number}</strong>.
                A confirmation has been recorded in your Collector Profile.
              </p>
            </div>

            {/* Order Overview Summary Box */}
            <div
              style={{
                background: '#FAFBFD',
                border: '1px solid #E2E8F0',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, display: 'block' }}>
                    Order Number
                  </span>
                  <strong style={{ fontFamily: 'var(--font-sans)', fontSize: '1.05rem', color: 'var(--color-aubergine)' }}>
                    {placedOrder.order_number}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, display: 'block' }}>
                    Date &amp; Time
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-aubergine)', fontWeight: 600 }}>
                    {new Date(placedOrder.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, display: 'block' }}>
                    Total Settlement
                  </span>
                  <strong style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-aubergine)' }}>
                    ${placedOrder.total_amount.toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, display: 'block' }}>
                    Payment Status
                  </span>
                  <span className="payment-badge status-pending" style={{ marginTop: '0.2rem' }}>
                    <Icons.Clock size={12} /> Pending Verification
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Next Steps Action Box */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(1, 33, 74, 0.04) 100%)',
                border: '1.5px solid rgba(212, 175, 55, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem',
                marginBottom: '2rem'
              }}
            >
              {placedOrder.payment_method === 'PayPal' ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                    <Icons.CreditCard size={20} style={{ color: 'var(--color-gold-dark)' }} />
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-aubergine)', margin: 0 }}>
                      Complete Settlement via PayPal
                    </h3>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                    To finalize your acquisition, send the exact verified settlement amount of{' '}
                    <strong>${placedOrder.total_amount.toFixed(2)}</strong> to Highlander Gold &amp; Silver.
                    Please include your order reference <strong>{placedOrder.order_number}</strong> in the payment memo.
                  </p>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <a
                      href={paypalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-gold btn-md"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Icons.CreditCard size={18} />
                      <span>Proceed to Official PayPal Payment (${placedOrder.total_amount.toFixed(2)})</span>
                      <Icons.ExternalLink size={14} />
                    </a>
                  </div>

                  {/* Customer Transaction Reference Input */}
                  <form onSubmit={handleAttachTransactionId} style={{ borderTop: '1px solid rgba(212, 175, 55, 0.25)', paddingTop: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-aubergine)', marginBottom: '0.35rem' }}>
                      Already completed payment? Attach your PayPal Transaction ID / Receipt Code:
                    </label>
                    <div style={{ display: 'flex', gap: '0.65rem', maxWidth: 480 }}>
                      <input
                        type="text"
                        value={paypalTxnInput}
                        onChange={(e) => setPaypalTxnInput(e.target.value)}
                        placeholder="e.g. 9XX1234567890123L"
                        className="auth-input"
                        style={{ background: '#FFFFFF' }}
                      />
                      <button
                        type="submit"
                        className="btn btn-silver btn-sm"
                        disabled={isAttachingTxn || !paypalTxnInput.trim()}
                        style={{ whiteSpace: 'nowrap', cursor: 'pointer' }}
                      >
                        {isAttachingTxn ? 'Saving...' : 'Save Receipt'}
                      </button>
                    </div>
                    {txnSuccessMsg && (
                      <p style={{ color: '#065F46', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.5rem' }}>
                        {txnSuccessMsg}
                      </p>
                    )}
                  </form>
                </div>
              ) : (
                /* Bank Wire Settlement View */
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                    <Icons.ShieldCheck size={20} style={{ color: 'var(--color-gold-dark)' }} />
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-aubergine)', margin: 0 }}>
                      Direct Domestic Bank Wire Instructions
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                    High-value bullion transactions qualify for incoming wire fee credit. Please remit settlement to:
                  </p>
                  <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0', fontSize: '0.85rem', color: 'var(--color-aubergine)', lineHeight: '1.6', marginBottom: '1rem' }}>
                    <div><strong>Beneficiary:</strong> Highlander Gold &amp; Silver LLC</div>
                    <div><strong>Facility Location:</strong> 119 Jewel Basin Ct. B3, Bigfork, MT 59911</div>
                    <div><strong>Wire Reference / Memo:</strong> {placedOrder.order_number}</div>
                    <div><strong>Settlement Amount:</strong> ${placedOrder.total_amount.toFixed(2)} USD</div>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
                    For specific wire routing or confirmation, contact our Bigfork armory at{' '}
                    <a href={`mailto:${BUSINESS_INFO.email}`}>{BUSINESS_INFO.email}</a> or call {BUSINESS_INFO.phoneFormatted}.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid #EDF2F7', paddingTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-silver btn-md"
                onClick={() => navigate('/collection')}
              >
                <span>Continue Browsing Catalog</span>
              </button>

              <button
                type="button"
                className="btn btn-gold btn-md"
                onClick={() => navigate('/profile#orders')}
              >
                <Icons.ShoppingBag size={16} />
                <span>Track in My Orders</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ==============================================================
  // VIEW: CHECKOUT FORM & SETTLEMENT BREAKDOWN
  // ==============================================================
  return (
    <main className="checkout-page-main" style={{ background: '#F8FAFD', minHeight: '85vh', padding: '2.5rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: 1140, margin: '0 auto' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            type="button"
            className="account-back-btn"
            onClick={() => navigate('/cart')}
            aria-label="Return to Shopping Cart"
          >
            <Icons.ArrowLeft size={16} />
            <span>Return to Cart</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <Icons.ShieldCheck size={16} style={{ color: 'var(--color-gold-dark)' }} />
            <span>256-Bit SSL Insured Armory Checkout</span>
          </div>
        </div>

        {/* Page Banner Title */}
        <div style={{ marginBottom: '2rem' }}>
          <span className="eyebrow-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
            <Icons.ShoppingBag size={12} />
            Final Settlement Fulfillment
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', color: 'var(--color-aubergine)', margin: 0 }}>
            Secure Storefront Checkout
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Verify shipping destination, select settlement method, and place your order with Montana 0% state sales tax.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="auth-alert error" role="alert" style={{ marginBottom: '1.5rem' }}>
            <Icons.AlertCircle size={18} className="auth-alert-icon" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 2-Column Checkout Layout */}
        <div className="checkout-grid">
          {/* Left Column: Form Details */}
          <form onSubmit={handlePlaceOrder} className="checkout-form-column">
            {/* 1. Customer Authenticated Identity */}
            <div className="account-card" style={{ marginBottom: '1.5rem' }}>
              <div className="account-card-header" style={{ marginBottom: '1rem', paddingBottom: '0.75rem' }}>
                <h3 className="account-card-title" style={{ fontSize: '1.15rem' }}>
                  1. Collector Account Identity
                </h3>
                <span className="account-tier-pill">
                  <Icons.User size={12} style={{ marginRight: 4 }} />
                  Authenticated Customer
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#F8FAFD', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #EDF2F7' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-aubergine)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {(profile?.full_name || user?.email || 'H')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-aubergine)' }}>
                    {profile?.full_name || 'Highlander Collector'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Insured Shipping Details */}
            <div className="account-card" style={{ marginBottom: '1.5rem' }}>
              <div className="account-card-header" style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem' }}>
                <div>
                  <h3 className="account-card-title" style={{ fontSize: '1.15rem' }}>
                    2. Insured Delivery Destination
                  </h3>
                  <p className="account-card-desc">
                    Parcels ship in-house via USPS Priority Mail with signature confirmation and full postal insurance.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                {/* Full Name */}
                <div className="auth-form-group">
                  <label htmlFor="chkFullName" className="auth-label">Recipient Full Legal Name *</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><Icons.User size={16} /></span>
                    <input
                      type="text"
                      id="chkFullName"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="auth-input"
                      placeholder="e.g. Eleanor Vance"
                    />
                  </div>
                </div>

                {/* Street Address */}
                <div className="auth-form-group">
                  <label htmlFor="chkAddress" className="auth-label">Delivery Street Address *</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><Icons.MapPin size={16} /></span>
                    <input
                      type="text"
                      id="chkAddress"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="auth-input"
                      placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                    />
                  </div>
                </div>

                {/* City, State, Zip Row */}
                <div className="checkout-city-state-row">
                  <div className="auth-form-group">
                    <label htmlFor="chkCity" className="auth-label">City *</label>
                    <input
                      type="text"
                      id="chkCity"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="auth-input"
                      placeholder="Bigfork"
                    />
                  </div>

                  <div className="auth-form-group">
                    <label htmlFor="chkState" className="auth-label">State *</label>
                    <input
                      type="text"
                      id="chkState"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="auth-input"
                      placeholder="MT"
                      maxLength={50}
                    />
                  </div>

                  <div className="auth-form-group">
                    <label htmlFor="chkZip" className="auth-label">Postal Zip *</label>
                    <input
                      type="text"
                      id="chkZip"
                      required
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="auth-input"
                      placeholder="59911"
                    />
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="auth-form-group">
                  <label htmlFor="chkPhone" className="auth-label">Delivery Contact Phone *</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><Icons.Phone size={16} /></span>
                    <input
                      type="tel"
                      id="chkPhone"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="auth-input"
                      placeholder="(406) 555-0199"
                    />
                  </div>
                  <span className="auth-field-hint">Required for courier parcel tracking and signature dispatch.</span>
                </div>

                {/* Numismatic Notes */}
                <div className="auth-form-group">
                  <label htmlFor="chkNotes" className="auth-label">Special Delivery / Armory Holding Notes (Optional)</label>
                  <textarea
                    id="chkNotes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="auth-input"
                    placeholder="e.g. Leave with building doorman, require adult signature, or hold for pickup..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment Method Selection */}
            <div className="account-card" style={{ marginBottom: '1.5rem' }}>
              <div className="account-card-header" style={{ marginBottom: '1rem', paddingBottom: '0.75rem' }}>
                <h3 className="account-card-title" style={{ fontSize: '1.15rem' }}>
                  3. Select Settlement Method
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Method Option: PayPal */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: paymentMethod === 'PayPal' ? '2px solid var(--color-gold)' : '1px solid #E2E8F0',
                    background: paymentMethod === 'PayPal' ? '#FAFBFD' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="PayPal"
                    checked={paymentMethod === 'PayPal'}
                    onChange={() => setPaymentMethod('PayPal')}
                    style={{ marginTop: '0.2rem' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--color-aubergine)' }}>
                        PayPal Instant Settlement
                      </strong>
                      <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: 4, background: '#EFF6FF', color: '#1E40AF', fontWeight: 700 }}>
                        Recommended
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', lineHeight: '1.4' }}>
                      Instant confirmation via Highlander's official PayPal business receiver (HighlanderGoldSilver).
                      Buyer protection and Montana 0% sales tax applied.
                    </p>
                  </div>
                </label>

                {/* Method Option: Bank Wire */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: paymentMethod === 'Bank Wire' ? '2px solid var(--color-gold)' : '1px solid #E2E8F0',
                    background: paymentMethod === 'Bank Wire' ? '#FAFBFD' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Bank Wire"
                    checked={paymentMethod === 'Bank Wire'}
                    onChange={() => setPaymentMethod('Bank Wire')}
                    style={{ marginTop: '0.2rem' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--color-aubergine)' }}>
                        Direct Domestic Bank Wire Transfer
                      </strong>
                      <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: 4, background: '#FEF9C3', color: '#854D0E', fontWeight: 700 }}>
                        Wire Fee Credit
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', lineHeight: '1.4' }}>
                      Preferred for high-dollar bullion acquisitions over $5,000. Full wire settlement details and credit applied upon invoice issuance.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* 4. Terms Acceptance Checkbox */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <input
                type="checkbox"
                id="chkTerms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={{ marginTop: '0.25rem' }}
              />
              <label htmlFor="chkTerms" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45', cursor: 'pointer' }}>
                I agree to the transparent 15% Settlement terms of Highlander Gold &amp; Silver LLC.
                I understand parcels ship fully insured via USPS Priority Mail from Bigfork, Montana with 0% state sales tax.
              </label>
            </div>

            {/* Submit Order Action Button */}
            <button
              type="submit"
              className="btn btn-gold btn-md"
              disabled={isSubmitting || isValidating || (validation && !validation.isValid)}
              style={{ width: '100%', padding: '0.95rem 1.5rem', fontSize: '1rem', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            >
              {isSubmitting ? (
                <span className="auth-btn-spinner-wrap">
                  <span className="auth-spinner" />
                  <span>Recording Order in Armory Database...</span>
                </span>
              ) : (
                <>
                  <Icons.ShieldCheck size={20} />
                  <span>
                    Place Order &amp; Proceed to Settlement •{' '}
                    {validation ? `$${validation.totalSettlement.toFixed(2)}` : 'Calculating...'}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Right Column: Order Summary & Live Recalculation */}
          <aside className="checkout-summary-column">
            <div className="cart-summary-card" style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0', position: 'sticky', top: 'calc(var(--header-height) + 1.5rem)' }}>
              <h3 className="summary-card-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-aubergine)', marginBottom: '1rem', borderBottom: '1px solid #EDF2F7', paddingBottom: '0.65rem' }}>
                Order Settlement Review
              </h3>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                {cartItems.map(({ item, quantity }) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <img
                      src={item.featuredImage}
                      alt={item.title}
                      style={{ width: 44, height: 44, borderRadius: 4, objectFit: 'cover', border: '1px solid #E2E8F0' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-aubergine)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                        Lot #{item.lotNumber} &bull; Qty: {quantity} &times; ${item.price.toFixed(2)}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-aubergine)' }}>
                      ${(item.price * quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-divider" style={{ height: 1, background: '#EDF2F7', margin: '1rem 0' }} />

              {/* Settlement Breakdown List */}
              {isValidating ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                  <span className="auth-spinner" style={{ margin: '0 auto 0.5rem auto' }} />
                  <div>Verifying prices with database...</div>
                </div>
              ) : validation ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Catalog Product Subtotal:</span>
                    <strong style={{ color: 'var(--color-aubergine)' }}>${validation.subtotal.toFixed(2)}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Settlement Fee (15% Buyer's Premium):</span>
                    <strong style={{ color: '#AA8010' }}>+${validation.buyersPremium.toFixed(2)}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Montana State Sales Tax:</span>
                    <span style={{ color: '#059669', fontWeight: 600 }}>$0.00 (0% Tax-Exempt)</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>USPS Insured Shipping:</span>
                    <span style={{ color: '#059669', fontWeight: 600 }}>Included (Free Domestic)</span>
                  </div>

                  <div style={{ height: 1, background: '#E2E8F0', margin: '0.5rem 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--color-aubergine)' }}>
                    <span>Total Settlement:</span>
                    <strong>${validation.totalSettlement.toFixed(2)}</strong>
                  </div>
                </div>
              ) : null}

              {/* Montana Tax Advantage Callout */}
              <div style={{ background: '#F8FAFD', borderRadius: 'var(--radius-xs)', padding: '0.85rem', marginTop: '1.5rem', border: '1px solid #EDF2F7', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                <Icons.Check size={16} style={{ color: '#059669', flexShrink: 0, marginTop: 2 }} />
                <span>
                  <strong>Montana State Law:</strong> Zero state sales tax applies to all rare coin, bullion, and sovereign pattern acquisitions.
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};
