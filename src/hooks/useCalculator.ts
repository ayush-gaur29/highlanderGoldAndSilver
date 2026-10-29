import { useState, useMemo } from 'react';
import { calculateSettlement, generatePayPalPaymentUrl } from '../utils/payment';
import { BUSINESS_INFO } from '../data/businessInfo';

export function useCalculator(initialAmount: string = '') {
  const [amountInput, setAmountInput] = useState<string>(initialAmount);

  const numericValue = useMemo(() => {
    const val = parseFloat(amountInput);
    return isNaN(val) ? 0 : Math.max(0, val);
  }, [amountInput]);

  const settlement = useMemo(() => {
    return calculateSettlement(numericValue, BUSINESS_INFO.terms.buyersPremiumPercent);
  }, [numericValue]);

  const payPalUrl = useMemo(() => {
    return generatePayPalPaymentUrl(BUSINESS_INFO.payPalUrl, settlement.totalSettlement > 0 ? settlement.totalSettlement : undefined);
  }, [settlement.totalSettlement]);

  return {
    amountInput,
    setAmountInput,
    numericValue,
    buyersPremium: settlement.buyersPremium,
    totalSettlement: settlement.totalSettlement,
    payPalUrl
  };
}
