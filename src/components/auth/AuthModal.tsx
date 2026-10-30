import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../../utils/icons';
import { supabase } from '../../services/supabase';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalView,
    closeAuthModal,
    setAuthModalView,
    login,
    signup,
    resetPassword
  } = useAuth();
  const navigate = useNavigate();

  // Check if opened due to checkout requirement
  const isCheckoutIntent = typeof window !== 'undefined' && Boolean(sessionStorage.getItem('hgs_paypal_redirect'));

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRemember, setLoginRemember] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Verification state (shown when Supabase Auth sends verification email)
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isUnconfirmedUser, setIsUnconfirmedUser] = useState(false);
  const [isRateLimitActive, setIsRateLimitActive] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Reset errors when view changes
  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsUnconfirmedUser(false);
    setIsRateLimitActive(false);
    setNeedsVerification(false);
    setForgotSubmitted(false);
  }, [authModalView, isAuthModalOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isAuthModalOpen, closeAuthModal]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  if (!isAuthModalOpen) return null;

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsUnconfirmedUser(false);

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    const result = await login({
      email: loginEmail,
      password: loginPassword,
      rememberMe: loginRemember
    });
    setIsLoading(false);

    if (result.success) {
      const paypalUrl = sessionStorage.getItem('hgs_paypal_redirect');
      if (paypalUrl) {
        sessionStorage.removeItem('hgs_paypal_redirect');
        closeAuthModal();
        window.open(paypalUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      setErrorMsg(result.error || 'Login failed. Please check your credentials.');
      if (result.unconfirmed) {
        setIsUnconfirmedUser(true);
      }
    }
  };

  // Handle Signup submission
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!signupFullName.trim()) {
      setErrorMsg('Please enter your full legal or collector name.');
      return;
    }

    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters in length.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    const result = await signup({
      fullName: signupFullName,
      email: signupEmail,
      phone: signupPhone,
      password: signupPassword,
      confirmPassword: signupConfirmPassword
    });
    setIsLoading(false);

    if (result.success) {
      if (result.needsEmailVerification) {
        setVerificationEmail(signupEmail);
        setNeedsVerification(true);
      } else {
        setSuccessMsg('Account created successfully! Welcome to Highlander Gold & Silver.');
        const paypalUrl = sessionStorage.getItem('hgs_paypal_redirect');
        if (paypalUrl) {
          sessionStorage.removeItem('hgs_paypal_redirect');
          closeAuthModal();
          window.open(paypalUrl, '_blank', 'noopener,noreferrer');
        }
      }
    } else {
      setIsRateLimitActive(Boolean(result.isRateLimited));
      setErrorMsg(result.error || 'Failed to create account. Please try again.');
    }
  };

  // Handle Forgot Password submission
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!forgotEmail.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(forgotEmail);
    setIsLoading(false);

    if (result.success) {
      setForgotSubmitted(true);
    } else {
      setErrorMsg(result.error || 'Unable to send reset email. Please try again.');
    }
  };

  // Resend verification email
  const handleResendVerification = async (targetEmail: string) => {
    if (resendCooldown > 0) return;
    try {
      setResendCooldown(60);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: targetEmail.trim()
      });
      if (error) {
        setErrorMsg(`Unable to resend email: ${error.message}`);
      } else {
        setSuccessMsg(`Verification email resent to ${targetEmail}. Please check your inbox and spam folder.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Resend failed.');
    }
  };

  return (
    <div
      className="auth-modal-overlay"
      id="authModalOverlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
      aria-modal="true"
      role="dialog"
    >
      <div className="auth-card" id="authCard">
        {/* Modal Close Button */}
        <button
          type="button"
          className="auth-modal-close"
          onClick={closeAuthModal}
          aria-label="Close authentication modal"
        >
          <Icons.Close size={18} />
        </button>

        {/* Card Header Branding */}
        <div className="auth-card-header">
          <img
            src="/assets/brand/highlander_logo_original.png"
            alt="Highlander Gold & Silver"
            className="auth-brand-emblem"
            width={180}
            height={60}
          />
          <h2 className="auth-card-title">
            {needsVerification
              ? 'Email Verification'
              : authModalView === 'login'
              ? 'Collector Sign In'
              : authModalView === 'signup'
              ? 'Private Membership Registration'
              : 'Reset Your Password'}
          </h2>
          <p className="auth-card-subtitle">
            {needsVerification
              ? 'Highlander Gold & Silver Security Verification'
              : authModalView === 'login'
              ? 'Access your customer account, private invoices & acquisition records'
              : authModalView === 'signup'
              ? 'Enjoy direct Montana tax-exempt purchasing & guaranteed valuations'
              : 'Enter your registered email to receive secure recovery instructions'}
          </p>

          {isCheckoutIntent && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(212, 175, 55, 0.12)',
              color: '#8A6400',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              borderRadius: 'var(--radius-full)',
              padding: '0.3rem 0.85rem',
              fontSize: '0.76rem',
              fontWeight: 600,
              marginTop: '0.65rem'
            }}>
              <Icons.ShieldCheck size={14} />
              <span>Sign in required to finalize your order</span>
            </div>
          )}
        </div>

        {/* View Switcher Tabs (Only visible when not in verification or forgot password mode) */}
        {!needsVerification && authModalView !== 'forgot_password' && (
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={authModalView === 'login'}
              className={`auth-tab ${authModalView === 'login' ? 'active' : ''}`}
              onClick={() => {
                setAuthModalView('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
            >
              <Icons.Lock size={15} />
              <span>Log In</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authModalView === 'signup'}
              className={`auth-tab ${authModalView === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setAuthModalView('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
            >
              <Icons.Sparkles size={15} />
              <span>Create Account</span>
            </button>
          </div>
        )}

        {/* Alerts: Success or Error */}
        {errorMsg && (
          <div className="auth-alert error" role="alert">
            <Icons.AlertCircle size={18} className="auth-alert-icon" />
            <div className="auth-alert-content">
              <span>{errorMsg}</span>
              {isRateLimitActive && (
                <div className="auth-rate-limit-help" style={{ marginTop: '0.65rem', borderTop: '1px solid rgba(220, 38, 38, 0.2)', paddingTop: '0.65rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.82rem', lineHeight: 1.45 }}>
                    <strong>Why this happens:</strong> Supabase's default email service imposes a strict rate limit of 3–4 verification emails per hour per project.
                  </p>
                  <button
                    type="button"
                    className="btn btn-gold btn-sm"
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem', width: 'auto' }}
                    onClick={() => {
                      setLoginEmail(signupEmail);
                      setAuthModalView('login');
                    }}
                  >
                    <span>Switch to Log In with this Email</span>
                  </button>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.74rem', color: '#7F1D1D', lineHeight: 1.4 }}>
                    <em>Tip for project administrator:</em> You can turn off <strong>Confirm email</strong> in your Supabase Dashboard under <strong>Authentication &rarr; Providers &rarr; Email</strong> to allow instant registrations without email sending limits.
                  </p>
                </div>
              )}
              {isUnconfirmedUser && (
                <button
                  type="button"
                  className="auth-resend-link"
                  onClick={() => handleResendVerification(loginEmail)}
                  disabled={resendCooldown > 0}
                >
                  {resendCooldown > 0
                    ? `Resend available in ${resendCooldown}s`
                    : 'Resend Verification Link'}
                </button>
              )}
            </div>
          </div>
        )}

        {successMsg && (
          <div className="auth-alert success" role="status">
            <Icons.CheckCircle size={18} className="auth-alert-icon" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* --- VIEW: EMAIL VERIFICATION NOTICE --- */}
        {needsVerification ? (
          <div className="auth-verification-view">
            <div className="verification-icon-wrap">
              <Icons.Mail size={36} />
            </div>
            <h3 className="verification-heading">Check Your Inbox</h3>
            <p className="verification-text">
              We have dispatched a verification email to{' '}
              <strong className="verification-email">{verificationEmail}</strong>.
            </p>
            <p className="verification-subtext">
              Please click the link inside to activate your Highlander Gold &amp; Silver account.
              Once confirmed, you will be able to log in immediately.
            </p>

            <div className="verification-actions">
              <button
                type="button"
                className="btn btn-gold btn-full"
                onClick={() => {
                  setNeedsVerification(false);
                  setAuthModalView('login');
                  setLoginEmail(verificationEmail);
                }}
              >
                Proceed to Sign In
              </button>

              <button
                type="button"
                className="auth-secondary-action-btn"
                onClick={() => handleResendVerification(verificationEmail)}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? `Wait ${resendCooldown}s to resend`
                  : 'Did not receive? Resend email'}
              </button>
            </div>
          </div>
        ) : authModalView === 'login' ? (
          /* --- VIEW: LOGIN FORM --- */
          <form onSubmit={handleLoginSubmit} className="auth-form" noValidate>
            <div className="auth-form-group">
              <label htmlFor="loginEmail" className="auth-label">
                Email Address
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Icons.Mail size={16} />
                </span>
                <input
                  type="email"
                  id="loginEmail"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="collector@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-form-group">
              <div className="auth-label-row">
                <label htmlFor="loginPassword" className="auth-label">
                  Password
                </label>
                <button
                  type="button"
                  className="auth-forgot-link"
                  onClick={() => {
                    setForgotEmail(loginEmail);
                    setAuthModalView('forgot_password');
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Icons.Lock size={16} />
                </span>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  id="loginPassword"
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="auth-input"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="auth-remember-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={loginRemember}
                  onChange={(e) => setLoginRemember(e.target.checked)}
                  className="auth-checkbox"
                />
                <span className="auth-checkbox-text">Remember me on this trusted device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-gold btn-full auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="auth-btn-spinner-wrap">
                  <span className="auth-spinner" />
                  <span>Verifying Credentials...</span>
                </span>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <Icons.ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Switch to Signup */}
            <div className="auth-footer-prompt">
              <span>New collector to Highlander Gold &amp; Silver?</span>{' '}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => {
                  setAuthModalView('signup');
                  setErrorMsg(null);
                }}
              >
                Create Account
              </button>
            </div>
          </form>
        ) : authModalView === 'signup' ? (
          /* --- VIEW: SIGNUP FORM --- */
          <form onSubmit={handleSignupSubmit} className="auth-form" noValidate>
            <div className="auth-form-group">
              <label htmlFor="signupFullName" className="auth-label">
                Full Name
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Icons.User size={16} />
                </span>
                <input
                  type="text"
                  id="signupFullName"
                  name="name"
                  autoComplete="name"
                  required
                  placeholder="Alexander Sterling"
                  value={signupFullName}
                  onChange={(e) => setSignupFullName(e.target.value)}
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label htmlFor="signupEmail" className="auth-label">
                Email Address
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Icons.Mail size={16} />
                </span>
                <input
                  type="email"
                  id="signupEmail"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="collector@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label htmlFor="signupPhone" className="auth-label">
                Phone Number <span className="auth-label-opt">(For insured dispatch updates)</span>
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Icons.Phone size={16} />
                </span>
                <input
                  type="tel"
                  id="signupPhone"
                  name="phone"
                  autoComplete="tel"
                  placeholder="(406) 555-0199"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-form-row">
              <div className="auth-form-group">
                <label htmlFor="signupPassword" className="auth-label">
                  Password
                </label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    <Icons.Lock size={16} />
                  </span>
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    id="signupPassword"
                    name="new-password"
                    autoComplete="new-password"
                    required
                    placeholder="Min. 6 chars"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="auth-input"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignupPassword ? <Icons.EyeOff size={15} /> : <Icons.Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="auth-form-group">
                <label htmlFor="signupConfirmPassword" className="auth-label">
                  Confirm Password
                </label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    <Icons.Shield size={16} />
                  </span>
                  <input
                    type={showSignupConfirmPassword ? 'text' : 'password'}
                    id="signupConfirmPassword"
                    name="confirm-password"
                    autoComplete="new-password"
                    required
                    placeholder="Repeat password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    className="auth-input"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                    aria-label={showSignupConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignupConfirmPassword ? <Icons.EyeOff size={15} /> : <Icons.Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms note */}
            <p className="auth-legal-note">
              By creating an account, you agree to Highlander Gold &amp; Silver's 15% settlement terms,
              Montana tax-exempt privileges, and fair market value guarantees.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-gold btn-full auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="auth-btn-spinner-wrap">
                  <span className="auth-spinner" />
                  <span>Registering Member...</span>
                </span>
              ) : (
                <>
                  <span>Create Account</span>
                  <Icons.ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Switch to Login */}
            <div className="auth-footer-prompt">
              <span>Already registered as a collector?</span>{' '}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => {
                  setAuthModalView('login');
                  setErrorMsg(null);
                }}
              >
                Log In
              </button>
            </div>
          </form>
        ) : (
          /* --- VIEW: FORGOT PASSWORD FORM --- */
          <div className="auth-forgot-view">
            {forgotSubmitted ? (
              <div className="auth-forgot-success">
                <div className="verification-icon-wrap">
                  <Icons.CheckCircle size={36} />
                </div>
                <h3 className="verification-heading">Recovery Link Dispatched</h3>
                <p className="verification-text">
                  If an account exists for <strong>{forgotEmail}</strong>, we have sent instructions to
                  reset your password.
                </p>
                <button
                  type="button"
                  className="btn btn-gold btn-full"
                  onClick={() => {
                    setAuthModalView('login');
                    setForgotSubmitted(false);
                  }}
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="auth-form" noValidate>
                <div className="auth-form-group">
                  <label htmlFor="forgotEmail" className="auth-label">
                    Your Registered Email
                  </label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">
                      <Icons.Mail size={16} />
                    </span>
                    <input
                      type="email"
                      id="forgotEmail"
                      name="email"
                      required
                      placeholder="collector@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="auth-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-gold btn-full auth-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="auth-btn-spinner-wrap">
                      <span className="auth-spinner" />
                      <span>Sending Instructions...</span>
                    </span>
                  ) : (
                    <span>Send Password Reset Link</span>
                  )}
                </button>

                <div className="auth-footer-prompt">
                  <button
                    type="button"
                    className="auth-back-link"
                    onClick={() => setAuthModalView('login')}
                  >
                    <Icons.ArrowLeft size={14} />
                    <span>Back to Log In</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

