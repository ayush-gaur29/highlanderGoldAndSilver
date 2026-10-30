import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Icons } from '../utils/icons';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '6rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <div className="auth-card" style={{ maxWidth: 460 }}>
        <div className="auth-card-header">
          <img
            src="/assets/brand/highlander_logo_original.png"
            alt="Highlander Gold & Silver"
            className="auth-brand-emblem"
            width={180}
            height={60}
          />
          <h2 className="auth-card-title">Set New Password</h2>
          <p className="auth-card-subtitle">
            Enter a strong password to protect your Highlander collector account.
          </p>
        </div>

        {errorMsg && (
          <div className="auth-alert error" role="alert">
            <Icons.AlertCircle size={18} className="auth-alert-icon" />
            <span>{errorMsg}</span>
          </div>
        )}

        {success ? (
          <div className="auth-forgot-success">
            <div className="verification-icon-wrap">
              <Icons.CheckCircle size={36} />
            </div>
            <h3 className="verification-heading">Password Updated</h3>
            <p className="verification-text">
              Your password has been securely updated. You can now log in with your new credentials.
            </p>
            <button
              type="button"
              className="btn btn-gold btn-full"
              onClick={() => navigate('/')}
            >
              Return to Storefront
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetSubmit} className="auth-form" noValidate>
            <div className="auth-form-group">
              <label htmlFor="resetPasswordInput" className="auth-label">
                New Password
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Icons.Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="resetPasswordInput"
                  required
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="auth-form-group">
              <label htmlFor="resetConfirmPasswordInput" className="auth-label">
                Confirm New Password
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Icons.Shield size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="resetConfirmPasswordInput"
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <span>Updating Password...</span>
                </span>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

