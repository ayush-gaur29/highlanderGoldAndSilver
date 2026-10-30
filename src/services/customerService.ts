import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import {
  CustomerProfile,
  UserRole,
  CustomerOrder,
  OrderItem,
  CustomerPayment,
  OrderStatus,
  PaymentStatus
} from '../types/auth';

/**
 * Highlander Gold & Silver — Customer Database & RBAC Service
 *
 * Interacts directly with the Supabase `customers`, `orders`, `order_items`, `payments`, and `admin_users` tables.
 * Enforces dynamic persistence without dummy or static user profiles.
 */
export class CustomerService {
  /**
   * Fetches customer profile dynamically from the `customers` table.
   */
  static async getCustomerProfile(authUserId: string): Promise<CustomerProfile | null> {
    if (!authUserId) return null;

    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`auth_user_id.eq.${authUserId},customer_id.eq.${authUserId}`)
        .maybeSingle();

      if (error) {
        console.error('[CustomerService] Error fetching customer profile:', error.message);
        return null;
      }

      if (!data) return null;

      // Extract avatar URL from notes JSON or fallback metadata
      let avatarUrl: string | undefined = undefined;
      if (data.notes && data.notes.startsWith('{') && data.notes.endsWith('}')) {
        try {
          const parsed = JSON.parse(data.notes);
          if (parsed.avatar_url) avatarUrl = parsed.avatar_url;
        } catch {
          // ignore parsing error if standard text
        }
      }

      return {
        id: data.id,
        customer_id: data.customer_id || data.auth_user_id,
        auth_user_id: data.auth_user_id || data.customer_id,
        email: data.email,
        full_name: data.full_name || '',
        phone: data.phone || '',
        city: data.city || '',
        state: data.state || '',
        tier: data.tier || 'Collector',
        notes: data.notes || '',
        avatar_url: avatarUrl,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (err: any) {
      console.error('[CustomerService] Exception in getCustomerProfile:', err);
      return null;
    }
  }

  /**
   * Ensures a corresponding record exists in `customers` table for the authenticated user.
   * Prevents duplicates if signup/login is retried.
   */
  static async ensureCustomerRecord(
    user: User,
    additionalData?: { fullName?: string; phone?: string; city?: string; state?: string }
  ): Promise<CustomerProfile> {
    const existing = await this.getCustomerProfile(user.id);
    if (existing) {
      return existing;
    }

    const fullName =
      additionalData?.fullName ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Highlander Collector';

    const phone =
      additionalData?.phone ||
      user.user_metadata?.phone ||
      '';

    const city =
      additionalData?.city ||
      user.user_metadata?.city ||
      '';

    const state =
      additionalData?.state ||
      user.user_metadata?.state ||
      '';

    const newCustomer = {
      customer_id: user.id,
      auth_user_id: user.id,
      email: user.email || '',
      full_name: fullName,
      phone: phone,
      tier: 'Collector',
      city: city,
      state: state
    };

    const { data, error } = await supabase
      .from('customers')
      .insert(newCustomer)
      .select('*')
      .single();

    if (error) {
      const retry = await this.getCustomerProfile(user.id);
      if (retry) return retry;

      console.error('[CustomerService] Failed to insert customer record:', error.message);
      return {
        ...newCustomer,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    return {
      id: data.id,
      customer_id: data.customer_id || data.auth_user_id,
      auth_user_id: data.auth_user_id || data.customer_id,
      email: data.email,
      full_name: data.full_name || fullName,
      phone: data.phone || phone,
      city: data.city || city || '',
      state: data.state || state || '',
      tier: data.tier || 'Collector',
      notes: data.notes || '',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  /**
   * Updates customer profile fields directly in the Supabase `customers` table.
   * Also keeps Supabase Auth user_metadata synchronized.
   */
  static async updateCustomerProfile(
    authUserId: string,
    updates: Partial<CustomerProfile>,
    userEmail?: string
  ): Promise<{ success: boolean; data?: CustomerProfile; error?: string }> {
    try {
      const dbPayload: Record<string, any> = {
        updated_at: new Date().toISOString()
      };

      if (updates.full_name !== undefined) dbPayload.full_name = updates.full_name.trim();
      if (updates.phone !== undefined) dbPayload.phone = updates.phone.trim();
      if (updates.city !== undefined) dbPayload.city = updates.city.trim();
      if (updates.state !== undefined) dbPayload.state = updates.state.trim();

      // If avatar_url was updated, encode it into notes JSON cleanly
      if (updates.avatar_url !== undefined || updates.notes !== undefined) {
        let notesObj: Record<string, any> = {};
        if (updates.notes) {
          try {
            notesObj = JSON.parse(updates.notes);
          } catch {
            notesObj = { text: updates.notes };
          }
        }
        if (updates.avatar_url) {
          notesObj.avatar_url = updates.avatar_url;
        }
        dbPayload.notes = JSON.stringify(notesObj);
      }

      // 1. Check if customer record exists in customers table
      const existing = await this.getCustomerProfile(authUserId);
      let updatedData: any = null;

      if (existing) {
        // Record exists -> update by primary key ID or auth_user_id
        let updateQuery = supabase.from('customers').update(dbPayload);
        if (existing.id) {
          updateQuery = updateQuery.eq('id', existing.id);
        } else {
          updateQuery = updateQuery.or(`auth_user_id.eq."${authUserId}",customer_id.eq."${authUserId}"`);
        }

        const { data, error } = await updateQuery.select('*').maybeSingle();
        if (error) {
          console.error('[CustomerService] Failed to update customer profile:', error.message);
          return { success: false, error: error.message };
        }
        updatedData = data;
      } else {
        // Record does NOT exist yet -> insert new customer record
        const newCustomer = {
          customer_id: authUserId,
          auth_user_id: authUserId,
          email: updates.email || userEmail || '',
          full_name: updates.full_name || 'Highlander Collector',
          phone: updates.phone || '',
          city: updates.city || '',
          state: updates.state || '',
          tier: 'Collector',
          notes: dbPayload.notes || ''
        };

        const { data, error } = await supabase
          .from('customers')
          .insert(newCustomer)
          .select('*')
          .single();

        if (error) {
          console.error('[CustomerService] Failed to insert customer during profile update:', error.message);
          return { success: false, error: error.message };
        }
        updatedData = data;
      }

      // 2. Also synchronize full_name, phone, city, state, avatar_url in Supabase Auth user_metadata
      try {
        await supabase.auth.updateUser({
          data: {
            full_name: updates.full_name !== undefined ? updates.full_name : existing?.full_name,
            phone: updates.phone !== undefined ? updates.phone : existing?.phone,
            city: updates.city !== undefined ? updates.city : existing?.city,
            state: updates.state !== undefined ? updates.state : existing?.state,
            avatar_url: updates.avatar_url || existing?.avatar_url
          }
        });
      } catch (authErr) {
        console.warn('[CustomerService] Auth metadata sync warning:', authErr);
      }

      // 3. Compose fresh profile object with newly saved city & state
      const refreshedProfile = await this.getCustomerProfile(authUserId);
      const finalData: CustomerProfile = refreshedProfile || {
        id: updatedData?.id || existing?.id || authUserId,
        customer_id: authUserId,
        auth_user_id: authUserId,
        email: updatedData?.email || existing?.email || userEmail || '',
        full_name: updates.full_name !== undefined ? updates.full_name : (existing?.full_name || ''),
        phone: updates.phone !== undefined ? updates.phone : (existing?.phone || ''),
        city: updates.city !== undefined ? updates.city : (updatedData?.city || existing?.city || ''),
        state: updates.state !== undefined ? updates.state : (updatedData?.state || existing?.state || ''),
        tier: existing?.tier || 'Collector',
        notes: dbPayload.notes || existing?.notes || '',
        avatar_url: updates.avatar_url || existing?.avatar_url,
        created_at: existing?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return { success: true, data: finalData };
    } catch (err: any) {
      console.error('[CustomerService] updateCustomerProfile exception:', err);
      return { success: false, error: err.message || 'Failed to update profile' };
    }
  }

  /**
   * Secure database-backed Role-Based Access Control (RBAC).
   * Verifies role against `admin_users` table in Supabase.
   * Regular customers receive 'user' role by default.
   */
  static async checkUserRole(authUserId: string, email?: string): Promise<UserRole> {
    if (!authUserId) return 'user';

    try {
      // 1. Check database `admin_users` table for staff admin entry
      const { data, error } = await supabase
        .from('admin_users')
        .select('role, status, email, auth_user_id')
        .or(`auth_user_id.eq."${authUserId}",email.eq."${email || ''}"`)
        .limit(1);

      if (!error && data && data.length > 0) {
        const adminRow = data[0];
        if (
          adminRow.role === 'admin' &&
          adminRow.status !== 'inactive' &&
          adminRow.status !== 'disabled'
        ) {
          return 'admin';
        }
      }

      // 2. Also check if email matches established Highlander staff admin email
      if (email && email.toLowerCase() === 'stratford1955@icloud.com') {
        return 'admin';
      }

      // Default role is regular registered customer
      return 'user';
    } catch (err) {
      console.error('[CustomerService] Error determining user role:', err);
      return 'user';
    }
  }

  /**
   * Uploads customer avatar image to Supabase Storage bucket 'avatars'.
   */
  static async uploadAvatarImage(
    userId: string,
    file: File
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'Please select a valid image file (PNG, JPG, or WebP).' };
      }

      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'Image size exceeds maximum limit of 5MB.' };
      }

      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('[CustomerService] Avatar storage upload error:', uploadError.message);
        return { success: false, error: uploadError.message };
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update customer profile record with new avatar URL
      await this.updateCustomerProfile(userId, { avatar_url: publicUrl });

      return { success: true, url: publicUrl };
    } catch (err: any) {
      console.error('[CustomerService] uploadAvatarImage exception:', err);
      return { success: false, error: err.message || 'Failed to upload avatar image' };
    }
  }

  /**
   * Fetches customer's orders from the `orders` table and their associated items from `order_items`.
   */
  static async getCustomerOrders(
    customerIdOrAuthId: string,
    customerEmail?: string
  ): Promise<CustomerOrder[]> {
    if (!customerIdOrAuthId && !customerEmail) return [];

    try {
      let query = supabase.from('orders').select('*');

      if (customerIdOrAuthId && customerEmail) {
        query = query.or(`customer_id.eq."${customerIdOrAuthId}",customer_email.eq."${customerEmail}"`);
      } else if (customerIdOrAuthId) {
        query = query.eq('customer_id', customerIdOrAuthId);
      } else if (customerEmail) {
        query = query.eq('customer_email', customerEmail);
      }

      const { data: orders, error: ordersError } = await query.order('created_at', { ascending: false });

      if (ordersError) {
        console.error('[CustomerService] Error fetching customer orders:', ordersError.message);
        return [];
      }

      if (!orders || orders.length === 0) {
        return [];
      }

      // Collect order IDs
      const orderIds = orders.map((o) => o.order_id || o.id || o.order_number).filter(Boolean);

      // Fetch items for these orders
      let itemsByOrderId: Record<string, OrderItem[]> = {};
      if (orderIds.length > 0) {
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds);

        if (!itemsError && items) {
          items.forEach((item) => {
            const key = item.order_id;
            if (!itemsByOrderId[key]) itemsByOrderId[key] = [];
            itemsByOrderId[key].push({
              id: item.id,
              order_id: item.order_id,
              lot_number: item.lot_number,
              title: item.title,
              quantity: item.quantity || 1,
              unit_price: Number(item.unit_price) || 0,
              created_at: item.created_at
            });
          });
        }
      }

      return orders.map((o) => {
        const key = o.order_id || o.id || o.order_number;
        let mappedItems = itemsByOrderId[key] || [];

        // Dual fallback: parse JSON from orders.items column if order_items row was empty
        if (mappedItems.length === 0 && o.items) {
          try {
            const parsed = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
            if (Array.isArray(parsed)) {
              mappedItems = parsed.map((item: any, idx: number) => ({
                id: item.id || `item-${idx}`,
                order_id: key,
                lot_number: item.lot_number,
                title: item.title,
                quantity: item.quantity || 1,
                unit_price: Number(item.unit_price) || 0,
                created_at: o.created_at
              }));
            }
          } catch {
            // ignore JSON parse error
          }
        }

        return {
          id: o.id || key,
          order_id: o.order_id || key,
          order_number: o.order_number || key,
          customer_id: o.customer_id,
          customer_email: o.customer_email,
          total_amount: Number(o.total_amount) || 0,
          order_status: (o.order_status || 'Processing') as OrderStatus,
          payment_status: (o.payment_status || 'Pending') as PaymentStatus,
          payment_method: o.payment_method || 'PayPal',
          shipping_address: o.shipping_address,
          shipping_amount: Number(o.shipping_amount) || 0,
          notes: o.notes,
          tracking_number: o.tracking_number,
          carrier: o.carrier || 'USPS Priority Insured',
          created_at: o.created_at,
          updated_at: o.updated_at,
          items: mappedItems
        };
      });
    } catch (err: any) {
      console.error('[CustomerService] Exception in getCustomerOrders:', err);
      return [];
    }
  }

  /**
   * Fetches customer's payment records from the `payments` table.
   */
  static async getCustomerPayments(
    customerEmail?: string,
    orderIds: string[] = []
  ): Promise<CustomerPayment[]> {
    if (!customerEmail && orderIds.length === 0) return [];

    try {
      let query = supabase.from('payments').select('*');

      if (customerEmail && orderIds.length > 0) {
        query = query.or(`customer_email.eq."${customerEmail}",order_id.in.(${orderIds.map((id) => `"${id}"`).join(',')})`);
      } else if (customerEmail) {
        query = query.eq('customer_email', customerEmail);
      } else if (orderIds.length > 0) {
        query = query.in('order_id', orderIds);
      }

      const { data: payments, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('[CustomerService] Error fetching customer payments:', error.message);
        return [];
      }

      if (!payments || payments.length === 0) {
        return [];
      }

      return payments.map((p) => ({
        id: p.id,
        order_id: p.order_id,
        order_number: p.order_number || p.order_id,
        customer_email: p.customer_email,
        amount: Number(p.amount) || 0,
        transaction_id: p.transaction_id || `TXN-${p.id?.slice(0, 8)}`,
        payment_method: p.payment_method || 'PayPal',
        payment_status: (p.payment_status || 'Paid') as PaymentStatus,
        created_at: p.created_at,
        updated_at: p.updated_at
      }));
    } catch (err: any) {
      console.error('[CustomerService] Exception in getCustomerPayments:', err);
      return [];
    }
  }
}
