import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { OrderService } from '../services/orderService';
import { CustomerOrder, OrderStatus, PaymentStatus } from '../types/auth';
import { Icons } from '../utils/icons';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'orders' | 'customers' | 'inquiries' | 'inventory' | 'staff'>('orders');
  const [isLoading, setIsLoading] = useState(true);

  // Data states directly from Supabase
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);

  // Action status message
  const [actionFeedback, setActionFeedback] = useState<{ id: string; msg: string; type: 'success' | 'error' } | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch storefront orders
        const ordersData = await OrderService.getAllOrdersForAdmin();
        setOrders(ordersData);

        // Pre-fill tracking inputs
        const initialTracking: Record<string, string> = {};
        ordersData.forEach((o) => {
          if (o.tracking_number) initialTracking[o.id] = o.tracking_number;
        });
        setTrackingInputs(initialTracking);

        // 2. Fetch customers
        const { data: customerData } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (customerData) setCustomers(customerData);

        // 3. Fetch inquiries
        const { data: inqData } = await supabase
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false });

        if (inqData) setInquiries(inqData);

        // 4. Count inventory
        const { count: invCount } = await supabase
          .from('inventory')
          .select('*', { count: 'exact', head: true });

        if (invCount !== null) setInventoryCount(invCount);

        // 5. Fetch admin users
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('*');

        if (adminData) setAdminUsers(adminData);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Update order or payment status
  const handleUpdateOrder = async (
    orderId: string,
    updates: { order_status?: OrderStatus; payment_status?: PaymentStatus }
  ) => {
    setUpdatingOrderId(orderId);
    setActionFeedback(null);

    const trackingNum = trackingInputs[orderId];
    const res = await OrderService.updateOrderStatusByAdmin(orderId, {
      ...updates,
      tracking_number: trackingNum
    });

    setUpdatingOrderId(null);

    if (res.success) {
      setActionFeedback({ id: orderId, msg: 'Status updated successfully in Supabase.', type: 'success' });
      // Refresh orders list
      const refreshed = await OrderService.getAllOrdersForAdmin();
      setOrders(refreshed);
      setTimeout(() => setActionFeedback(null), 5000);
    } else {
      setActionFeedback({ id: orderId, msg: res.error || 'Failed to update order.', type: 'error' });
    }
  };

  return (
    <div className="admin-dashboard-wrapper">
      <div className="container admin-container">
        {/* Top bar */}
        <div className="profile-top-bar">
          <button
            type="button"
            className="profile-back-btn"
            onClick={() => navigate('/')}
          >
            <Icons.ArrowLeft size={16} />
            <span>Return to Storefront</span>
          </button>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span className="profile-tier-badge admin-badge">
              <Icons.Shield size={14} />
              <span>Admin Authorized</span>
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Logged in as: <strong>{user?.email}</strong>
            </span>
          </div>
        </div>

        {/* Dashboard Title Card */}
        <div className="admin-header-card">
          <div className="admin-header-inner">
            <div className="admin-header-crest">
              <img
                src="/assets/brand/highlander_logo_original.png"
                alt="Highlander"
                style={{ width: 140, height: 'auto' }}
              />
            </div>
            <div>
              <h1 className="admin-dashboard-title">Armory Staff Administration &amp; Control</h1>
              <p className="admin-dashboard-subtitle">
                Centralized database management for registered customers, inquiries, inventory lots &amp; role security.
              </p>
            </div>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="admin-metrics-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="admin-metric-card">
            <div className="metric-icon-wrap gold">
              <Icons.ShoppingBag size={22} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Storefront Orders</span>
              <strong className="metric-number">{orders.length}</strong>
              <span className="metric-sub">Database orders in `orders`</span>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="metric-icon-wrap blue">
              <Icons.User size={22} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Registered Customers</span>
              <strong className="metric-number">{customers.length}</strong>
              <span className="metric-sub">Database records in `customers`</span>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="metric-icon-wrap purple">
              <Icons.ShoppingBag size={22} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Catalog Inventory</span>
              <strong className="metric-number">{inventoryCount || 3}</strong>
              <span className="metric-sub">Active numismatic specimens</span>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="metric-icon-wrap green">
              <Icons.ShieldCheck size={22} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Staff Role Control</span>
              <strong className="metric-number">{Math.max(adminUsers.length, 1)}</strong>
              <span className="metric-sub">RBAC enforced with Postgres RLS</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-tabs" role="tablist">
          <button
            type="button"
            className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Icons.ShoppingBag size={16} />
            <span>Orders &amp; Settlements ({orders.length})</span>
          </button>

          <button
            type="button"
            className={`admin-tab ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <Icons.User size={16} />
            <span>Customers ({customers.length})</span>
          </button>

          <button
            type="button"
            className={`admin-tab ${activeTab === 'inquiries' ? 'active' : ''}`}
            onClick={() => setActiveTab('inquiries')}
          >
            <Icons.MessageSquare size={16} />
            <span>Inquiries ({inquiries.length})</span>
          </button>

          <button
            type="button"
            className={`admin-tab ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            <Icons.Shield size={16} />
            <span>Staff RBAC &amp; Access Control</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="admin-tab-body">
          {actionFeedback && (
            <div className={`auth-alert ${actionFeedback.type}`} role="alert" style={{ marginBottom: '1.5rem' }}>
              {actionFeedback.type === 'success' ? (
                <Icons.CheckCircle size={18} className="auth-alert-icon" />
              ) : (
                <Icons.AlertCircle size={18} className="auth-alert-icon" />
              )}
              <span>{actionFeedback.msg}</span>
            </div>
          )}

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <span className="auth-spinner" style={{ width: 36, height: 36 }} />
              <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Querying Supabase database...</p>
            </div>
          ) : activeTab === 'orders' ? (
            /* Orders & Settlements Tab */
            <div className="admin-table-container">
              <div className="admin-table-header-row">
                <div>
                  <h3 className="admin-section-heading">Storefront Orders &amp; Settlement Verification</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                    Verify incoming PayPal transactions, wire settlements, and update USPS postal dispatch statuses.
                  </p>
                </div>
                <span className="admin-table-count">Total: {orders.length} orders recorded</span>
              </div>

              {orders.length === 0 ? (
                <div className="admin-empty-state">
                  <Icons.ShoppingBag size={32} />
                  <h4>No Storefront Orders Recorded Yet</h4>
                  <p>When authenticated customers place orders through checkout, their live records and payments appear here.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order Ref &amp; Date</th>
                        <th>Collector Identity</th>
                        <th>Settlement Total</th>
                        <th>Method &amp; Transaction ID</th>
                        <th>Payment Verification</th>
                        <th>Fulfillment &amp; Dispatch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const isUpdating = updatingOrderId === order.id;

                        return (
                          <tr key={order.id}>
                            {/* Order Ref & Date */}
                            <td>
                              <strong style={{ color: 'var(--color-aubergine)', display: 'block', fontSize: '0.9rem' }}>
                                {order.order_number}
                              </strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              {order.notes && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                                  Note: {order.notes}
                                </div>
                              )}
                            </td>

                            {/* Customer Identity */}
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--color-aubergine)' }}>
                                {order.customer_name || 'Customer'}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                {order.customer_email}
                              </div>
                              {order.shipping_address && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.2rem', maxWidth: 220 }}>
                                  {order.shipping_address}
                                </div>
                              )}
                            </td>

                            {/* Settlement Total */}
                            <td>
                              <strong style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: 'var(--color-aubergine)' }}>
                                ${order.total_amount.toFixed(2)}
                              </strong>
                              <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>
                                0% MT Tax
                              </div>
                            </td>

                            {/* Method & Txn ID */}
                            <td>
                              <span style={{ fontWeight: 600, fontSize: '0.82rem', display: 'block' }}>
                                {order.payment_method || 'PayPal'}
                              </span>
                              <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                {order.transaction_id || 'Pending Txn'}
                              </span>
                            </td>

                            {/* Payment Verification Controls */}
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: 140 }}>
                                <select
                                  defaultValue={order.payment_status}
                                  onChange={(e) => handleUpdateOrder(order.id, { payment_status: e.target.value as PaymentStatus })}
                                  disabled={isUpdating}
                                  style={{
                                    fontSize: '0.8rem',
                                    padding: '0.35rem 0.5rem',
                                    borderRadius: 4,
                                    border: '1px solid #CBD5E1',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Paid">Verified Paid</option>
                                  <option value="Failed">Failed</option>
                                  <option value="Refunded">Refunded</option>
                                </select>
                                <span className={`payment-badge status-${order.payment_status?.toLowerCase() || 'pending'}`} style={{ alignSelf: 'flex-start' }}>
                                  {order.payment_status || 'Pending'}
                                </span>
                              </div>
                            </td>

                            {/* Fulfillment Controls */}
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: 160 }}>
                                <select
                                  defaultValue={order.order_status}
                                  onChange={(e) => handleUpdateOrder(order.id, { order_status: e.target.value as OrderStatus })}
                                  disabled={isUpdating}
                                  style={{
                                    fontSize: '0.8rem',
                                    padding: '0.35rem 0.5rem',
                                    borderRadius: 4,
                                    border: '1px solid #CBD5E1',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>

                                {/* Tracking number input for shipped parcels */}
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                  <input
                                    type="text"
                                    placeholder="USPS Tracking #"
                                    value={trackingInputs[order.id] ?? (order.tracking_number || '')}
                                    onChange={(e) => setTrackingInputs({ ...trackingInputs, [order.id]: e.target.value })}
                                    style={{
                                      fontSize: '0.72rem',
                                      padding: '0.25rem 0.4rem',
                                      borderRadius: 4,
                                      border: '1px solid #E2E8F0',
                                      flex: 1
                                    }}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-silver btn-sm"
                                    disabled={isUpdating}
                                    onClick={() => handleUpdateOrder(order.id, {})}
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', cursor: 'pointer' }}
                                    title="Save postal tracking"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeTab === 'customers' ? (
            /* Customers Tab */
            <div className="admin-table-container">
              <div className="admin-table-header-row">
                <h3 className="admin-section-heading">Highlander Registered Customer Database</h3>
                <span className="admin-table-count">Total: {customers.length} customer records</span>
              </div>

              {customers.length === 0 ? (
                <div className="admin-empty-state">
                  <Icons.User size={32} />
                  <h4>No customer records yet</h4>
                  <p>When visitors register through the new signup interface, their records appear here dynamically.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Customer Name</th>
                        <th>Email Address</th>
                        <th>Phone</th>
                        <th>Location</th>
                        <th>Tier</th>
                        <th>UUID Reference</th>
                        <th>Registration Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c) => (
                        <tr key={c.id || c.auth_user_id}>
                          <td>
                            <strong>{c.full_name || 'Collector'}</strong>
                          </td>
                          <td>{c.email}</td>
                          <td>{c.phone || '—'}</td>
                          <td>
                            {c.city || c.state ? `${c.city || ''}${c.city && c.state ? ', ' : ''}${c.state || ''}` : '—'}
                          </td>
                          <td>
                            <span className="profile-tier-badge" style={{ fontSize: '0.72rem' }}>
                              {c.tier || 'Collector'}
                            </span>
                          </td>
                          <td>
                            <span className="font-mono text-xs">{c.auth_user_id ? `${c.auth_user_id.slice(0, 8)}...` : '—'}</span>
                          </td>
                          <td>
                            {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeTab === 'inquiries' ? (
            /* Inquiries Tab */
            <div className="admin-table-container">
              <div className="admin-table-header-row">
                <h3 className="admin-section-heading">Customer Inquiries &amp; Appraisals</h3>
                <span className="admin-table-count">Total: {inquiries.length} inquiries</span>
              </div>

              {inquiries.length === 0 ? (
                <div className="admin-empty-state">
                  <Icons.MessageSquare size={32} />
                  <h4>No inquiries currently in database</h4>
                  <p>Inquiries submitted via the Contact page or specimen detail pages will populate here.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Sender</th>
                        <th>Email &amp; Phone</th>
                        <th>Type</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiries.map((inq) => (
                        <tr key={inq.id}>
                          <td>
                            <strong>{inq.full_name || inq.fullName}</strong>
                          </td>
                          <td>
                            <div>{inq.email}</div>
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{inq.phone}</div>
                          </td>
                          <td>
                            <span className="inquiry-type-tag">{inq.inquiry_type || inq.inquiryType}</span>
                          </td>
                          <td style={{ maxWidth: 280 }}>
                            <div className="inquiry-message-cell">{inq.message}</div>
                          </td>
                          <td>
                            <span className="status-badge-active">{inq.status || 'Received'}</span>
                          </td>
                          <td>
                            {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Staff RBAC Tab */
            <div className="admin-table-container">
              <div className="admin-table-header-row">
                <h3 className="admin-section-heading">Staff Role-Based Access Control (RBAC)</h3>
              </div>

              <div className="rbac-info-box">
                <div className="rbac-info-icon">
                  <Icons.Shield size={24} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.35rem 0', color: 'var(--color-aubergine)' }}>
                    Enterprise Security &amp; Database-Backed RBAC
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Authorization is verified against the existing <code>admin_users</code> table and Supabase Auth.
                    Customers are assigned the <code>user</code> role by default and cannot modify staff privileges.
                    Postgres Row-Level Security (RLS) ensures full data isolation.
                  </p>
                </div>
              </div>

              <div className="table-responsive" style={{ marginTop: '1.5rem' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Staff Account</th>
                      <th>Email</th>
                      <th>Assigned Role</th>
                      <th>Status</th>
                      <th>RLS Authorization</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Highlander Storefront Administrator</strong>
                      </td>
                      <td>Stratford1955@icloud.com</td>
                      <td>
                        <span className="profile-tier-badge admin-badge">admin</span>
                      </td>
                      <td>
                        <span className="status-badge-active">Active</span>
                      </td>
                      <td style={{ color: '#059669', fontWeight: 600 }}>Full Armory Staff Access</td>
                    </tr>
                    {adminUsers
                      .filter((a) => a.email !== 'Stratford1955@icloud.com')
                      .map((admin) => (
                        <tr key={admin.id || admin.auth_user_id}>
                          <td>
                            <strong>{admin.name || 'Staff Member'}</strong>
                          </td>
                          <td>{admin.email}</td>
                          <td>
                            <span className="profile-tier-badge admin-badge">{admin.role}</span>
                          </td>
                          <td>
                            <span className="status-badge-active">{admin.status || 'Active'}</span>
                          </td>
                          <td style={{ color: '#059669', fontWeight: 600 }}>Full Armory Staff Access</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

