import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'user';

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded';

export interface CustomerProfile {
  id?: string;
  auth_user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  city?: string;
  state?: string;
  tier?: string;
  notes?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  role?: UserRole;
}

export interface AdminUserRecord {
  id: string;
  auth_user_id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  lot_number?: string;
  title: string;
  quantity: number;
  unit_price: number;
  featured_image?: string;
  created_at?: string;
}

export interface CustomerOrder {
  id: string;
  order_id?: string;
  order_number: string;
  customer_id?: string;
  customer_email?: string;
  total_amount: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: string;
  shipping_address?: string;
  shipping_amount?: number;
  notes?: string;
  tracking_number?: string;
  carrier?: string;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface CustomerPayment {
  id: string;
  order_id?: string;
  order_number?: string;
  customer_email?: string;
  amount: number;
  transaction_id: string;
  payment_method: string;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at?: string;
}

export interface SignupPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthContextType {
  user: User | null;
  profile: CustomerProfile | null;
  role: UserRole | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalView: 'login' | 'signup' | 'forgot_password';
  openAuthModal: (view?: 'login' | 'signup' | 'forgot_password') => void;
  closeAuthModal: () => void;
  setAuthModalView: (view: 'login' | 'signup' | 'forgot_password') => void;
  login: (payload: LoginPayload) => Promise<{ success: boolean; error?: string; unconfirmed?: boolean }>;
  signup: (payload: SignupPayload) => Promise<{ success: boolean; error?: string; needsEmailVerification?: boolean; isRateLimited?: boolean }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<CustomerProfile>) => Promise<{ success: boolean; error?: string }>;
  uploadAvatar: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}
