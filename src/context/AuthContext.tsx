import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { CustomerService } from '../services/customerService';
import {
  AuthContextType,
  CustomerProfile,
  UserRole,
  LoginPayload,
  SignupPayload
} from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Authentication Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup' | 'forgot_password'>('login');

  const openAuthModal = useCallback((view: 'login' | 'signup' | 'forgot_password' = 'login') => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  /**
   * Initializes session, role, and customer profile in the database.
   */
  const initUserSession = useCallback(
    async (authUser: User, additionalData?: { fullName?: string; phone?: string }) => {
      try {
        setUser(authUser);

        // 1. Check user role against database `admin_users` table
        const detectedRole = await CustomerService.checkUserRole(authUser.id, authUser.email);
        setRole(detectedRole);

        // 2. Ensure customer record exists in `customers` table
        const customerProfile = await CustomerService.ensureCustomerRecord(authUser, additionalData);
        setProfile({
          ...customerProfile,
          city: customerProfile.city || authUser.user_metadata?.city || '',
          state: customerProfile.state || authUser.user_metadata?.state || '',
          role: detectedRole
        });
      } catch (err) {
        console.error('[AuthContext] Error loading user session details:', err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Refreshes customer profile from database.
   */
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      const refreshed = await CustomerService.getCustomerProfile(user.id);
      if (refreshed) {
        setProfile({
          ...refreshed,
          city: refreshed.city || user.user_metadata?.city || '',
          state: refreshed.state || user.user_metadata?.state || '',
          role: role || 'user'
        });
      }
    } catch (err) {
      console.error('[AuthContext] Error refreshing profile:', err);
    }
  }, [user, role]);

  /**
   * Set up Supabase Auth session listener on mount.
   */
  useEffect(() => {
    let isMounted = true;

    // Check existing persisted session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      if (error) {
        console.error('[AuthContext] getSession error:', error.message);
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        initUserSession(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth state transitions (SIGN IN, SIGN OUT, REFRESH)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            await initUserSession(session.user);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setRole(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [initUserSession]);

  /**
   * Customer Login with Supabase Auth.
   */
  const login = async (
    payload: LoginPayload
  ): Promise<{ success: boolean; error?: string; unconfirmed?: boolean }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: payload.email.trim(),
        password: payload.password
      });

      if (error) {
        const errorMsg = error.message || '';
        const isUnconfirmed =
          errorMsg.toLowerCase().includes('email not confirmed') ||
          (error as any).code === 'email_not_confirmed';

        return {
          success: false,
          error: isUnconfirmed
            ? 'Your email address has not been confirmed yet. Please verify your email via the link sent to your inbox, or request a new verification link below.'
            : errorMsg,
          unconfirmed: isUnconfirmed
        };
      }

      if (data.user) {
        await initUserSession(data.user);
        closeAuthModal();
        return { success: true };
      }

      return { success: false, error: 'Authentication failed. Please verify credentials.' };
    } catch (err: any) {
      console.error('[AuthContext] Login error:', err);
      return { success: false, error: err.message || 'An unexpected error occurred during login.' };
    }
  };

  /**
   * Customer Signup with Supabase Auth and database synchronization.
   */
  const signup = async (
    payload: SignupPayload
  ): Promise<{ success: boolean; error?: string; needsEmailVerification?: boolean; isRateLimited?: boolean }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: payload.email.trim(),
        password: payload.password,
        options: {
          data: {
            full_name: payload.fullName.trim(),
            phone: payload.phone.trim()
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        let msg = error.message;
        const isRateLimited =
          error.status === 429 ||
          error.message?.toLowerCase().includes('rate limit') ||
          (error as any).code === 'over_email_send_rate_limit';

        if (isRateLimited) {
          msg =
            'Supabase hourly verification email rate limit reached (HTTP 429). The default Supabase email service limits outgoing verification emails to 3–4 per hour on the free tier.';
        }
        return { success: false, error: msg, isRateLimited };
      }

      if (data.user) {
        // If email confirmation is enabled on Supabase, no active session is returned immediately
        if (!data.session) {
          // Check if user was already registered
          if (data.user.identities && data.user.identities.length === 0) {
            return {
              success: false,
              error: 'An account with this email address already exists. Please sign in instead.'
            };
          }

          return { success: true, needsEmailVerification: true };
        }

        // Active session granted immediately (email confirmation disabled or instant)
        await initUserSession(data.user, {
          fullName: payload.fullName,
          phone: payload.phone
        });
        closeAuthModal();
        return { success: true, needsEmailVerification: false };
      }

      return { success: false, error: 'Registration failed. Please check form values.' };
    } catch (err: any) {
      console.error('[AuthContext] Signup error:', err);
      return { success: false, error: err.message || 'Registration error occurred.' };
    }
  };

  /**
   * Customer Logout.
   */
  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[AuthContext] Logout error:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setRole(null);
      closeAuthModal();
    }
  };

  /**
   * Updates customer profile in `customers` table.
   */
  const updateProfile = async (
    updates: Partial<CustomerProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'You must be signed in to update your profile.' };
    }

    const res = await CustomerService.updateCustomerProfile(user.id, updates, user.email || undefined);
    if (res.success && res.data) {
      setProfile((prev) => ({
        ...prev,
        ...res.data,
        city: res.data?.city !== undefined && res.data.city !== '' ? res.data.city : (updates.city ?? prev?.city ?? ''),
        state: res.data?.state !== undefined && res.data.state !== '' ? res.data.state : (updates.state ?? prev?.state ?? ''),
        role: role || 'user'
      }));
      return { success: true };
    }

    return { success: false, error: res.error || 'Failed to update profile.' };
  };

  /**
   * Uploads customer avatar image.
   */
  const uploadAvatar = async (
    file: File
  ): Promise<{ success: boolean; url?: string; error?: string }> => {
    if (!user) {
      return { success: false, error: 'You must be logged in to upload an avatar.' };
    }

    const res = await CustomerService.uploadAvatarImage(user.id, file);
    if (res.success && res.url) {
      setProfile((prev) => (prev ? { ...prev, avatar_url: res.url } : prev));
      return { success: true, url: res.url };
    }

    return { success: false, error: res.error || 'Failed to upload profile image.' };
  };

  /**
   * Sends password reset instructions.
   */
  const resetPassword = async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to request password reset.' };
    }
  };

  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin,
        isLoading,
        isAuthModalOpen,
        authModalView,
        openAuthModal,
        closeAuthModal,
        setAuthModalView,
        login,
        signup,
        logout,
        updateProfile,
        uploadAvatar,
        resetPassword,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

