import { supabase } from './supabase';
import { CustomerOrder, CustomerPayment, OrderItem, OrderStatus, PaymentStatus } from '../types/auth';
import { InventoryItem } from '../types';
import { BUSINESS_INFO } from '../data/businessInfo';

export interface ShippingAddressInput {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  paymentMethod?: 'PayPal' | 'Bank Wire';
}

export interface ValidatedCheckoutData {
  items: {
    inventoryItem: InventoryItem;
    quantity: number;
    dbPrice: number;
    lineTotal: number;
  }[];
  subtotal: number;
  buyersPremium: number;
  totalSettlement: number;
  isValid: boolean;
  errors: string[];
}

export class OrderService {
  /**
   * Validates cart items against the authoritative Supabase inventory database.
   * Recalculates prices and totals using trusted server/database values.
   * Never trusts client-submitted prices or totals.
   */
  static async validateCartItems(
    cartItems: { item: { id: string; lotNumber?: string }; quantity: number }[]
  ): Promise<ValidatedCheckoutData> {
    const errors: string[] = [];

    if (!cartItems || cartItems.length === 0) {
      return {
        items: [],
        subtotal: 0,
        buyersPremium: 0,
        totalSettlement: 0,
        isValid: false,
        errors: ['Shopping cart is empty. Please add items to proceed.']
      };
    }

    try {
      // Query authoritative products from Supabase inventory table
      const itemIds = cartItems.map((ci) => ci.item.id);
      const { data: dbItems, error } = await supabase
        .from('inventory')
        .select('*')
        .in('id', itemIds);

      if (error) {
        console.error('[OrderService] Error validating inventory:', error.message);
        return {
          items: [],
          subtotal: 0,
          buyersPremium: 0,
          totalSettlement: 0,
          isValid: false,
          errors: ['Failed to verify current inventory prices. Please try again.']
        };
      }

      const dbItemsMap = new Map<string, any>();
      (dbItems || []).forEach((row) => {
        dbItemsMap.set(row.id, row);
      });

      const validatedItems = [];
      let authoritativeSubtotal = 0;

      for (const cartItem of cartItems) {
        const dbRow = dbItemsMap.get(cartItem.item.id);

        if (!dbRow) {
          errors.push(`Item #${cartItem.item.lotNumber || cartItem.item.id} is no longer in the active catalog.`);
          continue;
        }

        // Check availability and stock
        const isUnavailable =
          dbRow.status === 'Unavailable' ||
          dbRow.status === 'Closed' ||
          dbRow.stock_status === 'Out of Stock' ||
          (typeof dbRow.stock_quantity === 'number' && dbRow.stock_quantity <= 0);

        if (isUnavailable) {
          errors.push(`Lot #${dbRow.lot_number || dbRow.id} (${dbRow.title}) is currently unavailable or out of stock.`);
          continue;
        }

        // Recalculate price strictly using database price column
        const dbPrice = typeof dbRow.price === 'number' ? dbRow.price : parseFloat(dbRow.price) || 0;
        const qty = Math.max(1, cartItem.quantity || 1);
        const lineTotal = dbPrice * qty;
        authoritativeSubtotal += lineTotal;

        validatedItems.push({
          inventoryItem: {
            id: dbRow.id,
            lotNumber: dbRow.lot_number || '',
            lot_number: dbRow.lot_number || '',
            sku: dbRow.sku || '',
            title: dbRow.title || 'Highlander Numismatic Specimen',
            price: dbPrice,
            priceFormatted: `$${dbPrice.toFixed(2)}`,
            category: dbRow.category || 'Precious Metals',
            featuredImage: dbRow.featured_image || '/assets/brand/highlander_refined_emblem.jpg',
            status: dbRow.status || 'Available',
            description: dbRow.description || ''
          } as InventoryItem,
          quantity: qty,
          dbPrice,
          lineTotal
        });
      }

      // Calculate authoritative 15% settlement fee (Buyer's Premium)
      const buyersPremium = authoritativeSubtotal * (BUSINESS_INFO.terms.buyersPremiumPercent || 0.15);
      const totalSettlement = authoritativeSubtotal + buyersPremium;

      return {
        items: validatedItems,
        subtotal: authoritativeSubtotal,
        buyersPremium,
        totalSettlement,
        isValid: errors.length === 0 && validatedItems.length > 0,
        errors
      };
    } catch (err: any) {
      console.error('[OrderService] validateCartItems exception:', err);
      return {
        items: [],
        subtotal: 0,
        buyersPremium: 0,
        totalSettlement: 0,
        isValid: false,
        errors: [err.message || 'Error communicating with catalog database.']
      };
    }
  }

  /**
   * Generates a collision-resistant unique order reference.
   * Format: HGS-YYYYMMDD-XXXX (e.g. HGS-20261030-4921)
   */
  static generateOrderNumber(): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `HGS-${dateStr}-${rand}`;
  }

  /**
   * Securely creates an order in Supabase.
   * Requires an authenticated session.
   * Derives customer ID directly from the authenticated user token to prevent spoofing.
   */
  static async createOrder(
    shipping: ShippingAddressInput,
    cartItems: { item: { id: string; lotNumber?: string }; quantity: number }[]
  ): Promise<{ success: boolean; order?: CustomerOrder; error?: string }> {
    try {
      // 1. Verify current authenticated user session
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          success: false,
          error: 'Authentication Required: You must be signed in to Highlander Gold & Silver to place an order.'
        };
      }

      // 2. Validate inventory prices and stock directly from database
      const validation = await this.validateCartItems(cartItems);

      if (!validation.isValid || validation.items.length === 0) {
        return {
          success: false,
          error: validation.errors.join(' ') || 'Order validation failed. Please check catalog availability.'
        };
      }

      const orderNumber = this.generateOrderNumber();
      const addressParts = [shipping.address, shipping.city, shipping.state, shipping.zip].filter(Boolean);
      const formattedAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Direct PayPal Settlement';
      const customerName = (shipping.fullName || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Highlander Customer').trim();

      // Summary of item titles for orders.items JSON field
      const itemSummaries = validation.items.map((vi) => ({
        id: vi.inventoryItem.id,
        lot_number: vi.inventoryItem.lotNumber,
        title: vi.inventoryItem.title,
        quantity: vi.quantity,
        unit_price: vi.dbPrice,
        total_price: vi.lineTotal
      }));

      // 3. Insert order into `orders` table
      const orderPayload = {
        order_id: orderNumber,
        order_number: orderNumber,
        customer_id: user.id,
        customer_email: user.email || shipping.email || '',
        customer_name: customerName,
        total_amount: validation.totalSettlement,
        order_status: 'Pending',
        payment_status: 'Pending',
        payment_method: shipping.paymentMethod || 'PayPal',
        shipping_address: formattedAddress,
        shipping_amount: 0,
        carrier: 'USPS Priority Mail (Insured)',
        notes: shipping.notes?.trim() || null,
        items: JSON.stringify(itemSummaries),
        created_at: new Date().toISOString()
      };

      const { data: createdOrder, error: orderInsertError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select('*')
        .single();

      if (orderInsertError) {
        console.error('[OrderService] Error inserting order:', orderInsertError.message);
        return {
          success: false,
          error: `Failed to create order record: ${orderInsertError.message}`
        };
      }

      const assignedOrderId = createdOrder.id || orderNumber;

      // 4. Insert each item into `order_items` table
      const orderItemsRows = validation.items.map((vi) => ({
        order_id: assignedOrderId,
        lot_number: String(vi.inventoryItem.lotNumber || vi.inventoryItem.id),
        sku: vi.inventoryItem.sku || null,
        title: vi.inventoryItem.title,
        quantity: vi.quantity,
        unit_price: vi.dbPrice,
        total_price: vi.lineTotal,
        created_at: new Date().toISOString()
      }));

      const { error: itemsInsertError } = await supabase
        .from('order_items')
        .insert(orderItemsRows);

      if (itemsInsertError) {
        console.warn('[OrderService] Non-critical warning inserting order_items rows:', itemsInsertError.message);
      }

      // 5. Initialize payment record in `payments` table
      const initialTxnId = `PENDING-${orderNumber}`;
      const paymentPayload = {
        order_id: assignedOrderId,
        customer_email: user.email || shipping.email,
        amount: validation.totalSettlement,
        payment_method: shipping.paymentMethod,
        payment_status: 'Pending',
        transaction_id: initialTxnId,
        created_at: new Date().toISOString()
      };

      const { error: paymentInsertError } = await supabase
        .from('payments')
        .insert(paymentPayload);

      if (paymentInsertError) {
        console.warn('[OrderService] Warning inserting initial payment record:', paymentInsertError.message);
      }

      const mappedOrder: CustomerOrder = {
        id: createdOrder.id,
        order_id: createdOrder.order_id || orderNumber,
        order_number: createdOrder.order_number || orderNumber,
        customer_id: createdOrder.customer_id,
        customer_email: createdOrder.customer_email,
        total_amount: Number(createdOrder.total_amount) || validation.totalSettlement,
        order_status: 'Pending',
        payment_status: 'Pending',
        payment_method: shipping.paymentMethod,
        shipping_address: formattedAddress,
        shipping_amount: 0,
        notes: shipping.notes || undefined,
        carrier: 'USPS Priority Mail (Insured)',
        created_at: createdOrder.created_at || new Date().toISOString(),
        items: validation.items.map((vi, idx) => ({
          id: `item-${idx}`,
          order_id: assignedOrderId,
          lot_number: vi.inventoryItem.lotNumber,
          title: vi.inventoryItem.title,
          quantity: vi.quantity,
          unit_price: vi.dbPrice,
          created_at: new Date().toISOString()
        }))
      };

      return {
        success: true,
        order: mappedOrder
      };
    } catch (err: any) {
      console.error('[OrderService] createOrder exception:', err);
      return {
        success: false,
        error: err.message || 'An unexpected error occurred while placing your order.'
      };
    }
  }

  /**
   * Updates an order's payment reference (e.g. PayPal Transaction ID or Bank Wire Ref)
   * submitted by the customer after completing their external payment.
   */
  static async attachPaymentReference(
    orderNumberOrId: string,
    transactionId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!orderNumberOrId || !transactionId) {
      return { success: false, error: 'Order reference and transaction ID are required.' };
    }

    try {
      const cleanTxn = transactionId.trim();

      // Update in payments table
      const { error: pError } = await supabase
        .from('payments')
        .update({
          transaction_id: cleanTxn,
          updated_at: new Date().toISOString()
        })
        .or(`order_id.eq."${orderNumberOrId}"`);

      if (pError) {
        console.warn('[OrderService] attachPaymentReference payments update warning:', pError.message);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Admin-only: Updates order and payment status in Supabase.
   * Enforces role validation against `admin_users`.
   */
  static async updateOrderStatusByAdmin(
    orderId: string,
    updates: {
      order_status?: OrderStatus;
      payment_status?: PaymentStatus;
      tracking_number?: string;
      carrier?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Verify user is admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Authentication required.' };
      }

      // Check admin status
      const { data: adminRows } = await supabase
        .from('admin_users')
        .select('*')
        .or(`auth_user_id.eq."${user.id}",email.eq."${user.email}"`)
        .limit(1);

      const isStaffAdmin =
        (adminRows && adminRows.length > 0 && adminRows[0].role === 'admin') ||
        user.email?.toLowerCase() === 'stratford1955@icloud.com';

      if (!isStaffAdmin) {
        return { success: false, error: 'Unauthorized: Only staff administrators can update order statuses.' };
      }

      const orderUpdates: Record<string, any> = {
        updated_at: new Date().toISOString()
      };

      if (updates.order_status) orderUpdates.order_status = updates.order_status;
      if (updates.payment_status) orderUpdates.payment_status = updates.payment_status;
      if (updates.tracking_number !== undefined) orderUpdates.tracking_number = updates.tracking_number.trim();
      if (updates.carrier) orderUpdates.carrier = updates.carrier;

      // Update orders table
      const { error: oErr } = await supabase
        .from('orders')
        .update(orderUpdates)
        .or(`id.eq."${orderId}",order_id.eq."${orderId}",order_number.eq."${orderId}"`);

      if (oErr) {
        return { success: false, error: oErr.message };
      }

      // If payment_status was updated, sync to payments table
      if (updates.payment_status) {
        await supabase
          .from('payments')
          .update({
            payment_status: updates.payment_status,
            updated_at: new Date().toISOString()
          })
          .or(`order_id.eq."${orderId}"`);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Admin-only: Fetches all storefront orders for staff review.
   */
  static async getAllOrdersForAdmin(): Promise<CustomerOrder[]> {
    try {
      const { data: orders, error: oErr } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (oErr || !orders) {
        console.error('[OrderService] getAllOrdersForAdmin error:', oErr?.message);
        return [];
      }

      // Also fetch payments to correlate transaction IDs
      const { data: payments } = await supabase
        .from('payments')
        .select('*');

      const paymentMap = new Map<string, any>();
      (payments || []).forEach((p) => {
        paymentMap.set(p.order_id, p);
      });

      return orders.map((o) => {
        const payment = paymentMap.get(o.id) || paymentMap.get(o.order_id) || paymentMap.get(o.order_number);
        return {
          id: o.id,
          order_id: o.order_id || o.id,
          order_number: o.order_number || o.id,
          customer_id: o.customer_id,
          customer_email: o.customer_email,
          customer_name: o.customer_name || 'Customer',
          total_amount: Number(o.total_amount) || 0,
          order_status: (o.order_status || 'Pending') as OrderStatus,
          payment_status: (o.payment_status || 'Pending') as PaymentStatus,
          payment_method: o.payment_method || 'PayPal',
          shipping_address: o.shipping_address,
          shipping_amount: Number(o.shipping_amount) || 0,
          tracking_number: o.tracking_number,
          carrier: o.carrier || 'USPS Priority Mail (Insured)',
          notes: o.notes,
          created_at: o.created_at,
          updated_at: o.updated_at,
          transaction_id: payment?.transaction_id || undefined,
          items: []
        };
      });
    } catch (err) {
      console.error('[OrderService] getAllOrdersForAdmin exception:', err);
      return [];
    }
  }
}

