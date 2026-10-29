import React from 'react';
import { useCalculator } from '../../hooks/useCalculator';
import { Icons } from '../../utils/icons';

export const SettlementCalculator: React.FC = () => {
  const {
    amountInput,
    setAmountInput,
    buyersPremium,
    totalSettlement,
    payPalUrl
  } = useCalculator();

  return (
    <div className="calculator-panel">
      <div className="calculator-title">Calculate Your Total</div>
      <p className="calculator-desc">
        Enter your item price to calculate settlement with the standard 15% Buyer's Premium:
      </p>

      <div className="calc-input-row">
        <div className="calc-input-wrapper">
          <span className="calc-currency-symbol">$</span>
          <input
            type="number"
            id="calcAmountInput"
            placeholder="e.g. 500.00"
            step="0.01"
            className="calc-input"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
          />
        </div>
        <div className="calc-summary-box">
          <div className="calc-bp-line">
            15% Buyer's Premium:{' '}
            <span
              id="calcBpAmount"
              style={{ fontWeight: 600, color: 'var(--color-aubergine)' }}
            >
              ${buyersPremium.toFixed(2)}
            </span>
          </div>
          <div className="calc-total-line">
            Total: <span id="calcTotalAmount">${totalSettlement.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Refined, Proportionate CTA Button */}
      <a
        href={payPalUrl}
        target="_blank"
        rel="noopener noreferrer"
        id="calcPayBtn"
        className="btn-payment-cta"
      >
        <span>Continue to PayPal</span>
        <Icons.ArrowRight size={15} strokeWidth={2.5} />
      </a>
    </div>
  );
};
