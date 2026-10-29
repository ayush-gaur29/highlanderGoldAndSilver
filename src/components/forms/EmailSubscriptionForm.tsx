import React, { useState, useEffect } from 'react';
import { Icons } from '../../utils/icons';

export const EmailSubscriptionForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [interests, setInterests] = useState<string[]>(['gold', 'morgans', 'bullion']);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('hgs_registered_email');
    if (savedEmail) {
      setRegisteredEmail(savedEmail);
      setIsRegistered(true);
    }

    const savedInterests = localStorage.getItem('hgs_interests');
    if (savedInterests) {
      try {
        const parsed = JSON.parse(savedInterests);
        if (Array.isArray(parsed)) {
          setInterests(parsed);
        }
      } catch {
        // Fallback to default
      }
    }
  }, []);

  const handleInterestToggle = (value: string) => {
    setInterests(prev =>
      prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    localStorage.setItem('hgs_registered_email', cleanEmail);
    localStorage.setItem('hgs_interests', JSON.stringify(interests));

    setRegisteredEmail(cleanEmail);
    setIsRegistered(true);
    setEmail('');
  };

  return (
    <>
      {/* Collecting Interests Selection */}
      <div className="email-interests-label">
        Select Your Collecting Interests:
      </div>
      <div className="interest-pills" id="interestPillsGroup">
        <label className="interest-pill">
          <input
            type="checkbox"
            name="interest"
            value="gold"
            checked={interests.includes('gold')}
            onChange={() => handleInterestToggle('gold')}
          />
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>{' '}
            Sovereign Gold
          </span>
        </label>
        <label className="interest-pill">
          <input
            type="checkbox"
            name="interest"
            value="morgans"
            checked={interests.includes('morgans')}
            onChange={() => handleInterestToggle('morgans')}
          />
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>{' '}
            Morgan Silver Dollars
          </span>
        </label>
        <label className="interest-pill">
          <input
            type="checkbox"
            name="interest"
            value="bullion"
            checked={interests.includes('bullion')}
            onChange={() => handleInterestToggle('bullion')}
          />
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>{' '}
            Bullion &amp; Stacker Bars
          </span>
        </label>
        <label className="interest-pill">
          <input
            type="checkbox"
            name="interest"
            value="ancient"
            checked={interests.includes('ancient')}
            onChange={() => handleInterestToggle('ancient')}
          />
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>{' '}
            Ancient Coinage
          </span>
        </label>
      </div>

      {/* Email Signup Form */}
      <form id="emailRegistryForm" className="email-form-row" onSubmit={handleSubmit}>
        <div className="email-input-wrapper">
          <Icons.Mail className="email-input-icon" size={18} />
          <input
            type="email"
            id="registryEmailInput"
            className="email-input-field"
            placeholder="Enter your email address..."
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="email-submit-btn"
          id="registrySubmitBtn"
          disabled={isRegistered && !email}
          style={
            isRegistered && !email
              ? { background: '#28a745', color: '#FFFFFF' }
              : undefined
          }
        >
          {isRegistered && !email ? (
            <span>✓ Registered</span>
          ) : (
            <>
              <span>Join Email List</span>
              <Icons.ArrowRight size={14} strokeWidth={2.5} />
            </>
          )}
        </button>
      </form>

      {/* Success Feedback Banner */}
      {isRegistered && (
        <div className="email-success-message" id="registrySuccessMsg" style={{ display: 'flex' }}>
          <Icons.Check size={20} strokeWidth={2.5} />
          <div>
            <strong>You are registered for Highlander drop alerts!</strong>
            <div style={{ fontSize: '0.82rem', opacity: 0.9, marginTop: '0.2rem' }}>
              We will notify you at{' '}
              <span id="registeredEmailEcho" style={{ textDecoration: 'underline' }}>
                {registeredEmail}
              </span>{' '}
              before the next precious-metals release.
            </div>
          </div>
        </div>
      )}

      <p className="email-privacy-note">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        Strict privacy guarantee: Zero spam. Your contact details are stored securely and never shared.
        Unsubscribe anytime.
      </p>
    </>
  );
};
