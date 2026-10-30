import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CustomerService } from '../services/customerService';
import { CustomerOrder, CustomerPayment, OrderStatus, PaymentStatus } from '../types/auth';
import { Icons } from '../utils/icons';

type ActiveTab = 'overview' | 'personal' | 'orders' | 'payments';

export const ProfilePage: React.FC = () => {
  const { user, profile, isAdmin, isLoading, updateProfile, uploadAvatar, logout, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Form edit state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Orders and Payments state
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Selected order for detailed modal view
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);

  // Handle URL hash or state to navigate to specific tab
  useEffect(() => {
    if (location.hash === '#orders') setActiveTab('orders');
    else if (location.hash === '#payments') setActiveTab('payments');
    else if (location.hash === '#personal') setActiveTab('personal');
  }, [location.hash]);

  // Synchronize form when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
      setState(profile.state || '');
    }
  }, [profile]);

  // Fetch actual orders and payments dynamically from Supabase
  useEffect(() => {
    const fetchCustomerRecords = async () => {
      if (!user) return;
      setIsDataLoading(true);
      try {
        const customerId = profile?.id || user.id;
        const fetchedOrders = await CustomerService.getCustomerOrders(customerId, user.email || undefined);
        setOrders(fetchedOrders);

        const orderIds = fetchedOrders.map((o) => o.order_id || o.id || o.order_number).filter(Boolean);
        const fetchedPayments = await CustomerService.getCustomerPayments(user.email || undefined, orderIds);
        setPayments(fetchedPayments);
      } catch (err) {
        console.error('Error fetching customer orders and payments:', err);
      } finally {
        setIsDataLoading(false);
      }
    };

    if (user) {
      fetchCustomerRecords();
    }
  }, [user, profile?.id]);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!isLoading && !user) {
      openAuthModal('login');
      navigate('/');
    }
  }, [isLoading, user, navigate, openAuthModal]);

  if (isLoading) {
    return (
      <div className="profile-loading-screen">
        <div className="auth-spinner" style={{ width: 44, height: 44, borderWidth: 3 }} />
        <p className="profile-loading-text">Loading collector profile...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  // Handle personal info save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!fullName.trim()) {
      setStatusMessage({ type: 'error', text: 'Full Name is required.' });
      return;
    }

    setIsSaving(true);
    const res = await updateProfile({
      full_name: fullName.trim(),
      phone: phone.trim(),
      city: city.trim(),
      state: state.trim()
    });
    setIsSaving(false);

    if (res.success) {
      setIsEditing(false);
      setStatusMessage({ type: 'success', text: 'Your personal information has been saved successfully.' });
      setTimeout(() => setStatusMessage(null), 5000);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Failed to update personal information.' });
    }
  };

  // Reset form to current profile
  const handleCancelEdit = () => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
      setState(profile.state || '');
    }
    setIsEditing(false);
    setStatusMessage(null);
  };

  // Handle avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMessage(null);
    setIsUploading(true);

    const res = await uploadAvatar(file);
    setIsUploading(false);

    if (res.success) {
      setStatusMessage({ type: 'success', text: 'Profile picture updated successfully.' });
      setTimeout(() => setStatusMessage(null), 5000);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Failed to upload image.' });
    }
  };

  // Calculations for Overview Dashboard (Calculated directly from actual database records)
  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter(
    (o) => o.order_status === 'Pending' || o.order_status === 'Processing' || o.order_status === 'Shipped'
  ).length;
  const completedOrdersCount = orders.filter(
    (o) => o.order_status === 'Delivered'
  ).length;

  const totalSpentAmount = payments
    .filter((p) => p.payment_status === 'Paid')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const formattedTotalSpent = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(totalSpentAmount);

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      })
    : '2026';

  const initials = (profile.full_name || user.email || 'H G')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('');

  // Helper for order status badge styling
  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return <span className="order-badge status-delivered"><Icons.CheckCircle size={13} /> Delivered</span>;
      case 'Shipped':
        return <span className="order-badge status-shipped"><Icons.Truck size={13} /> Shipped</span>;
      case 'Processing':
        return <span className="order-badge status-processing"><Icons.Clock size={13} /> Processing</span>;
      case 'Pending':
        return <span className="order-badge status-pending"><Icons.Clock size={13} /> Pending</span>;
      case 'Cancelled':
        return <span className="order-badge status-cancelled"><Icons.Close size={13} /> Cancelled</span>;
      default:
        return <span className="order-badge">{status}</span>;
    }
  };

  // Helper for payment status badge styling
  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Paid':
        return <span className="payment-badge status-paid"><Icons.Check size={12} /> Paid</span>;
      case 'Pending':
        return <span className="payment-badge status-pending"><Icons.Clock size={12} /> Pending</span>;
      case 'Failed':
        return <span className="payment-badge status-failed"><Icons.AlertCircle size={12} /> Failed</span>;
      case 'Refunded':
        return <span className="payment-badge status-refunded"><Icons.Refresh size={12} /> Refunded</span>;
      default:
        return <span className="payment-badge">{status}</span>;
    }
  };

  return (
    <div className="account-dashboard-wrapper">
      <div className="container account-container">
        {/* Navigation Breadcrumb / Return */}
        <div className="account-top-bar">
          <button
            type="button"
            className="account-back-btn"
            onClick={() => navigate('/')}
            aria-label="Return to Storefront"
          >
            <Icons.ArrowLeft size={16} />
            <span>Return to Storefront</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              className="btn btn-gold btn-sm"
              onClick={() => navigate('/admin')}
            >
              <Icons.Shield size={14} />
              <span>Staff Admin Dashboard</span>
            </button>
          )}
        </div>

        {/* 1. Customer Profile Overview Banner */}
        <div className="account-header-card">
          <div className="account-header-main">
            {/* Avatar & Photo Upload Trigger */}
            <div className="account-avatar-wrapper">
              <div className="account-avatar-circle">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Customer'}
                    className="account-avatar-img"
                  />
                ) : (
                  <span className="account-avatar-initials">{initials}</span>
                )}
                {isUploading && (
                  <div className="avatar-uploading-overlay">
                    <span className="auth-spinner" />
                  </div>
                )}
              </div>

              <button
                type="button"
                className="account-avatar-edit-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Change Profile Photo"
                aria-label="Change Profile Photo"
              >
                <Icons.Camera size={13} />
                <span>Photo</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
            </div>

            {/* Profile Identity Details */}
            <div className="account-identity-text">
              <div className="account-name-badge-row">
                <h1 className="account-customer-name">
                  {profile.full_name || 'Highlander Collector'}
                </h1>
                <span className="account-tier-pill">
                  {isAdmin ? 'Staff Administrator' : (profile.tier || 'Collector Member')}
                </span>
              </div>
              <p className="account-customer-email">{user.email}</p>
              <p className="account-member-date">
                <Icons.Clock size={13} />
                <span>Customer since {memberSince}</span>
              </p>
            </div>
          </div>

          {/* Quick Header Actions: Edit Profile & Logout */}
          <div className="account-header-actions">
            <button
              type="button"
              className={`account-action-btn ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('personal');
                setIsEditing(true);
              }}
            >
              <Icons.Edit size={15} />
              <span>Edit Profile</span>
            </button>

            <button
              type="button"
              className="account-action-btn logout-btn"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
            >
              <Icons.LogOut size={15} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Global Toast Alert */}
        {statusMessage && (
          <div className={`auth-alert ${statusMessage.type}`} role="alert">
            {statusMessage.type === 'success' ? (
              <Icons.CheckCircle size={18} className="auth-alert-icon" />
            ) : (
              <Icons.AlertCircle size={18} className="auth-alert-icon" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* 2. Account Navigation Tabs */}
        <div className="account-nav-tabs" role="tablist" aria-label="Account Sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overview'}
            className={`account-nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Icons.Sliders size={16} />
            <span>Overview</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'personal'}
            className={`account-nav-tab ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <Icons.User size={16} />
            <span>Personal Information</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'orders'}
            className={`account-nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Icons.ShoppingBag size={16} />
            <span>My Orders</span>
            {orders.length > 0 && <span className="tab-count-badge">{orders.length}</span>}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'payments'}
            className={`account-nav-tab ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <Icons.CreditCard size={16} />
            <span>Payment History</span>
            {payments.length > 0 && <span className="tab-count-badge">{payments.length}</span>}
          </button>
        </div>

        {/* 3. Account Tab Contents */}
        <div className="account-tab-content">
          {/* ==============================================================
              TAB 1: DASHBOARD OVERVIEW
             ============================================================== */}
          {activeTab === 'overview' && (
            <div className="overview-tab-view">
              {/* Compact Metric Summary Cards */}
              <div className="overview-metrics-grid">
                <div className="overview-metric-card" onClick={() => setActiveTab('orders')}>
                  <div className="metric-icon-bubble gold">
                    <Icons.ShoppingBag size={20} />
                  </div>
                  <div className="metric-details">
                    <span className="metric-title">Total Orders</span>
                    <strong className="metric-value">{totalOrdersCount}</strong>
                    <span className="metric-footer-text">All lifetime purchases</span>
                  </div>
                </div>

                <div className="overview-metric-card" onClick={() => setActiveTab('orders')}>
                  <div className="metric-icon-bubble blue">
                    <Icons.Package size={20} />
                  </div>
                  <div className="metric-details">
                    <span className="metric-title">Active Orders</span>
                    <strong className="metric-value">{activeOrdersCount}</strong>
                    <span className="metric-footer-text">Processing &amp; in transit</span>
                  </div>
                </div>

                <div className="overview-metric-card" onClick={() => setActiveTab('orders')}>
                  <div className="metric-icon-bubble green">
                    <Icons.CheckCircle size={20} />
                  </div>
                  <div className="metric-details">
                    <span className="metric-title">Completed Orders</span>
                    <strong className="metric-value">{completedOrdersCount}</strong>
                    <span className="metric-footer-text">Delivered to armory</span>
                  </div>
                </div>

                <div className="overview-metric-card" onClick={() => setActiveTab('payments')}>
                  <div className="metric-icon-bubble navy">
                    <Icons.DollarSign size={20} />
                  </div>
                  <div className="metric-details">
                    <span className="metric-title">Payment Activity</span>
                    <strong className="metric-value">{formattedTotalSpent}</strong>
                    <span className="metric-footer-text">Settled across orders</span>
                  </div>
                </div>
              </div>

              {/* Two Column Layout: Recent Orders & Recent Payments */}
              <div className="overview-sections-grid">
                {/* Recent Orders Preview Card */}
                <div className="account-card">
                  <div className="account-card-header">
                    <div>
                      <h3 className="account-card-title">Recent Orders</h3>
                      <p className="account-card-desc">Your latest rare specimen acquisitions</p>
                    </div>
                    <button
                      type="button"
                      className="account-link-btn"
                      onClick={() => setActiveTab('orders')}
                    >
                      <span>View All Orders</span>
                      <Icons.ArrowRight size={14} />
                    </button>
                  </div>

                  {isDataLoading ? (
                    <div className="card-loading-placeholder">
                      <span className="auth-spinner" />
                      <span>Loading recent orders...</span>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="account-empty-state">
                      <div className="empty-state-icon">
                        <Icons.ShoppingBag size={28} />
                      </div>
                      <h4>No orders placed yet</h4>
                      <p>Browse our curated numismatic collection of certified gold and silver coinage.</p>
                      <button
                        type="button"
                        className="btn btn-gold btn-sm"
                        onClick={() => navigate('/collection')}
                      >
                        Explore Collection
                      </button>
                    </div>
                  ) : (
                    <div className="recent-orders-list">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="recent-order-item">
                          <div className="recent-order-info">
                            <span className="recent-order-num">{order.order_number}</span>
                            <span className="recent-order-date">
                              {new Date(order.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>

                          <div className="recent-order-status">
                            {getOrderStatusBadge(order.order_status)}
                          </div>

                          <div className="recent-order-amount">
                            <strong>${order.total_amount.toFixed(2)}</strong>
                          </div>

                          <button
                            type="button"
                            className="btn-detail-link"
                            onClick={() => setSelectedOrder(order)}
                            aria-label={`View details for ${order.order_number}`}
                          >
                            <Icons.Eye size={15} />
                            <span>Details</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Payments Preview Card */}
                <div className="account-card">
                  <div className="account-card-header">
                    <div>
                      <h3 className="account-card-title">Recent Payments</h3>
                      <p className="account-card-desc">Settlements and transaction receipts</p>
                    </div>
                    <button
                      type="button"
                      className="account-link-btn"
                      onClick={() => setActiveTab('payments')}
                    >
                      <span>View Payment History</span>
                      <Icons.ArrowRight size={14} />
                    </button>
                  </div>

                  {isDataLoading ? (
                    <div className="card-loading-placeholder">
                      <span className="auth-spinner" />
                      <span>Loading payment records...</span>
                    </div>
                  ) : payments.length === 0 ? (
                    <div className="account-empty-state">
                      <div className="empty-state-icon">
                        <Icons.CreditCard size={28} />
                      </div>
                      <h4>No payment records found</h4>
                      <p>Payments made for direct storefront purchases and settlements will appear here.</p>
                    </div>
                  ) : (
                    <div className="recent-payments-list">
                      {payments.slice(0, 3).map((payment) => (
                        <div key={payment.id} className="recent-payment-item">
                          <div className="recent-payment-info">
                            <span className="recent-payment-ref">{payment.transaction_id}</span>
                            <span className="recent-payment-method">{payment.payment_method}</span>
                          </div>

                          <div className="recent-payment-status">
                            {getPaymentStatusBadge(payment.payment_status)}
                          </div>

                          <div className="recent-payment-amount">
                            <strong>${payment.amount.toFixed(2)}</strong>
                            <span className="recent-payment-date">
                              {new Date(payment.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Collector Guarantee Note */}
              <div className="account-guarantee-card">
                <div className="guarantee-icon-wrap">
                  <Icons.ShieldCheck size={24} />
                </div>
                <div className="guarantee-text">
                  <h4>Highlander Fair Market Guarantee &amp; Montana Tax Exemption</h4>
                  <p>
                    All acquisitions from Highlander Gold &amp; Silver are backed by our Fair Market Value protection
                    and benefit from 0% Montana State Sales Tax. Domestic parcels ship fully insured via USPS Priority.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==============================================================
              TAB 2: PERSONAL INFORMATION
             ============================================================== */}
          {activeTab === 'personal' && (
            <div className="personal-info-tab-view">
              <div className="account-card">
                <div className="account-card-header">
                  <div>
                    <h3 className="account-card-title">Personal Information</h3>
                    <p className="account-card-desc">
                      Manage your contact details used for insured delivery fulfillment and order communications.
                    </p>
                  </div>
                  {!isEditing && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Icons.Edit size={14} />
                      <span>Edit Information</span>
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveProfile} className="personal-info-form">
                  <div className="form-fields-grid">
                    {/* Full Name */}
                    <div className="auth-form-group">
                      <label htmlFor="accountFullName" className="auth-label">
                        Full Name *
                      </label>
                      <div className="auth-input-wrapper">
                        <span className="auth-input-icon">
                          <Icons.User size={16} />
                        </span>
                        <input
                          type="text"
                          id="accountFullName"
                          required
                          disabled={!isEditing}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className={`auth-input ${!isEditing ? 'input-view-only' : ''}`}
                          placeholder="e.g. Eleanor Vance"
                        />
                      </div>
                    </div>

                    {/* Email (Read-only for account integrity) */}
                    <div className="auth-form-group">
                      <label htmlFor="accountEmail" className="auth-label">
                        Registered Email Address
                      </label>
                      <div className="auth-input-wrapper disabled">
                        <span className="auth-input-icon">
                          <Icons.Mail size={16} />
                        </span>
                        <input
                          type="email"
                          id="accountEmail"
                          disabled
                          value={user.email || ''}
                          className="auth-input disabled"
                        />
                      </div>
                      <span className="auth-field-hint">Primary login email address</span>
                    </div>

                    {/* Phone Number */}
                    <div className="auth-form-group">
                      <label htmlFor="accountPhone" className="auth-label">
                        Phone Number
                      </label>
                      <div className="auth-input-wrapper">
                        <span className="auth-input-icon">
                          <Icons.Phone size={16} />
                        </span>
                        <input
                          type="tel"
                          id="accountPhone"
                          disabled={!isEditing}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={`auth-input ${!isEditing ? 'input-view-only' : ''}`}
                          placeholder="(406) 555-0199"
                        />
                      </div>
                      <span className="auth-field-hint">Required for insured package delivery confirmation</span>
                    </div>

                    {/* City & State */}
                    <div className="form-city-state-row">
                      <div className="auth-form-group">
                        <label htmlFor="accountCity" className="auth-label">
                          City
                        </label>
                        <div className="auth-input-wrapper">
                          <span className="auth-input-icon">
                            <Icons.MapPin size={16} />
                          </span>
                          <input
                            type="text"
                            id="accountCity"
                            disabled={!isEditing}
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className={`auth-input ${!isEditing ? 'input-view-only' : ''}`}
                            placeholder="e.g. Bigfork"
                          />
                        </div>
                      </div>

                      <div className="auth-form-group">
                        <label htmlFor="accountState" className="auth-label">
                          State / Province
                        </label>
                        <div className="auth-input-wrapper">
                          <input
                            type="text"
                            id="accountState"
                            disabled={!isEditing}
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className={`auth-input ${!isEditing ? 'input-view-only' : ''}`}
                            placeholder="MT"
                            maxLength={50}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Action Buttons */}
                  {isEditing && (
                    <div className="form-actions-row">
                      <button
                        type="button"
                        className="btn btn-outline btn-md"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="btn btn-gold btn-md"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <span className="auth-btn-spinner-wrap">
                            <span className="auth-spinner" />
                            <span>Saving Changes...</span>
                          </span>
                        ) : (
                          <>
                            <Icons.Check size={16} />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* ==============================================================
              TAB 3: MY ORDERS
             ============================================================== */}
          {activeTab === 'orders' && (
            <div className="orders-tab-view">
              <div className="account-card">
                <div className="account-card-header">
                  <div>
                    <h3 className="account-card-title">Order History</h3>
                    <p className="account-card-desc">Review your current shipments and past acquisitions</p>
                  </div>
                  <span className="order-count-badge">
                    {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                  </span>
                </div>

                {isDataLoading ? (
                  <div className="card-loading-placeholder" style={{ padding: '3rem 0' }}>
                    <span className="auth-spinner" style={{ width: 32, height: 32 }} />
                    <span style={{ marginTop: '0.75rem' }}>Loading order history...</span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="account-empty-state large">
                    <div className="empty-state-icon">
                      <Icons.ShoppingBag size={40} />
                    </div>
                    <h4>No Orders Found</h4>
                    <p>
                      You haven't placed any orders yet. Discover rare American coinage, sovereign bullion,
                      and ancient numismatic treasures in our collection.
                    </p>
                    <button
                      type="button"
                      className="btn btn-gold btn-md"
                      onClick={() => navigate('/collection')}
                    >
                      Browse Storefront Catalog
                    </button>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orders.map((order) => (
                      <div key={order.id} className="order-card-item">
                        {/* Order Card Top Bar */}
                        <div className="order-item-header">
                          <div className="order-meta-group">
                            <span className="order-number-label">Order</span>
                            <strong className="order-number-text">{order.order_number}</strong>
                            <span className="order-date-text">
                              Placed on{' '}
                              {new Date(order.created_at).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>

                          <div className="order-status-group">
                            {getOrderStatusBadge(order.order_status)}
                            {getPaymentStatusBadge(order.payment_status)}
                          </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="order-items-preview">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, idx) => (
                              <div key={item.id || idx} className="order-sub-item">
                                <div className="order-item-icon-wrap">
                                  <Icons.Package size={18} />
                                </div>
                                <div className="order-item-desc">
                                  <strong className="order-item-name">{item.title}</strong>
                                  <span className="order-item-qty-price">
                                    Qty: {item.quantity} &times; ${item.unit_price.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="order-sub-item">
                              <div className="order-item-icon-wrap">
                                <Icons.Package size={18} />
                              </div>
                              <div className="order-item-desc">
                                <strong className="order-item-name">Highlander Numismatic Acquisition</strong>
                                <span className="order-item-qty-price">Standard Storefront Lot</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Order Card Footer */}
                        <div className="order-card-footer">
                          <div className="order-total-block">
                            <span className="order-total-label">Total Amount:</span>
                            <strong className="order-total-price">${order.total_amount.toFixed(2)}</strong>
                            <span className="order-tax-note">(0% MT Sales Tax)</span>
                          </div>

                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Icons.FileText size={14} />
                            <span>View Order Details</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==============================================================
              TAB 4: PAYMENT HISTORY
             ============================================================== */}
          {activeTab === 'payments' && (
            <div className="payments-tab-view">
              <div className="account-card">
                <div className="account-card-header">
                  <div>
                    <h3 className="account-card-title">Payment History</h3>
                    <p className="account-card-desc">Complete record of invoice settlements and payment transactions</p>
                  </div>
                  <span className="order-count-badge">
                    {payments.length} {payments.length === 1 ? 'Record' : 'Records'}
                  </span>
                </div>

                {isDataLoading ? (
                  <div className="card-loading-placeholder" style={{ padding: '3rem 0' }}>
                    <span className="auth-spinner" style={{ width: 32, height: 32 }} />
                    <span style={{ marginTop: '0.75rem' }}>Loading payment history...</span>
                  </div>
                ) : payments.length === 0 ? (
                  <div className="account-empty-state large">
                    <div className="empty-state-icon">
                      <Icons.CreditCard size={40} />
                    </div>
                    <h4>No Payment Records</h4>
                    <p>
                      Transactions settled via PayPal or wire transfer will be listed here with reference IDs and confirmation receipts.
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="payments-table">
                      <thead>
                        <tr>
                          <th>Transaction ID</th>
                          <th>Order Reference</th>
                          <th>Date</th>
                          <th>Payment Method</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.id}>
                            <td>
                              <strong className="payment-txn-text">{payment.transaction_id}</strong>
                            </td>
                            <td>
                              <span className="payment-order-ref">{payment.order_number || payment.order_id || '—'}</span>
                            </td>
                            <td>
                              {new Date(payment.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </td>
                            <td>
                              <span className="payment-method-text">{payment.payment_method}</span>
                            </td>
                            <td>
                              <strong className="payment-amount-text">${payment.amount.toFixed(2)}</strong>
                            </td>
                            <td>
                              {getPaymentStatusBadge(payment.payment_status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==============================================================
          ORDER DETAILS MODAL DIALOG
         ============================================================== */}
      {selectedOrder && (
        <div
          className="auth-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOrder(null);
          }}
          aria-modal="true"
          role="dialog"
        >
          <div className="auth-card order-details-modal">
            <button
              type="button"
              className="auth-modal-close"
              onClick={() => setSelectedOrder(null)}
              aria-label="Close order details"
            >
              <Icons.Close size={18} />
            </button>

            {/* Modal Header */}
            <div className="order-modal-header">
              <span className="order-modal-pretitle">Highlander Order Summary</span>
              <h2 className="order-modal-title">{selectedOrder.order_number}</h2>
              <p className="order-modal-date">
                Placed on{' '}
                {new Date(selectedOrder.created_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              <div className="order-modal-status-pills">
                {getOrderStatusBadge(selectedOrder.order_status)}
                {getPaymentStatusBadge(selectedOrder.payment_status)}
              </div>
            </div>

            <div className="order-modal-divider" />

            {/* Items Purchased List */}
            <div className="order-modal-section">
              <h4 className="order-modal-section-title">Purchased Specimens</h4>
              <div className="order-modal-items-list">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, idx) => (
                    <div key={item.id || idx} className="order-modal-item-row">
                      <div className="order-modal-item-info">
                        <strong>{item.title}</strong>
                        {item.lot_number && <span className="lot-tag">Lot #{item.lot_number}</span>}
                        <span className="order-modal-qty">Quantity: {item.quantity}</span>
                      </div>
                      <div className="order-modal-item-price">
                        ${(item.unit_price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="order-modal-item-row">
                    <div className="order-modal-item-info">
                      <strong>Highlander Certified Numismatic Specimen</strong>
                      <span className="order-modal-qty">Quantity: 1</span>
                    </div>
                    <div className="order-modal-item-price">
                      ${selectedOrder.total_amount.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="order-modal-divider" />

            {/* Shipping & Delivery Information */}
            <div className="order-modal-section">
              <h4 className="order-modal-section-title">Fulfillment &amp; Dispatch</h4>
              <div className="order-modal-info-grid">
                <div>
                  <span className="info-grid-label">Carrier &amp; Method:</span>
                  <span className="info-grid-val">{selectedOrder.carrier || 'USPS Priority Mail (Insured)'}</span>
                </div>
                {selectedOrder.tracking_number && (
                  <div>
                    <span className="info-grid-label">Postal Tracking:</span>
                    <strong className="info-grid-val tracking-code">{selectedOrder.tracking_number}</strong>
                  </div>
                )}
                {selectedOrder.shipping_address && (
                  <div>
                    <span className="info-grid-label">Delivery Destination:</span>
                    <span className="info-grid-val">{selectedOrder.shipping_address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="order-modal-divider" />

            {/* Order Price Breakdown */}
            <div className="order-modal-section">
              <h4 className="order-modal-section-title">Settlement Summary</h4>
              <div className="order-modal-totals">
                <div className="totals-row">
                  <span>Subtotal</span>
                  <span>${(selectedOrder.total_amount - (selectedOrder.shipping_amount || 0)).toFixed(2)}</span>
                </div>
                <div className="totals-row">
                  <span>Montana State Sales Tax</span>
                  <span className="tax-exempt-tag">$0.00 (0% Tax-Exempt)</span>
                </div>
                <div className="totals-row">
                  <span>Insured Domestic Shipping</span>
                  <span>
                    {selectedOrder.shipping_amount && selectedOrder.shipping_amount > 0
                      ? `$${selectedOrder.shipping_amount.toFixed(2)}`
                      : 'Included / Free'}
                  </span>
                </div>
                <div className="totals-row final-total">
                  <strong>Total Settlement</strong>
                  <strong>${selectedOrder.total_amount.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="order-modal-footer">
              <button
                type="button"
                className="btn btn-gold btn-full"
                onClick={() => setSelectedOrder(null)}
              >
                Close Order Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
