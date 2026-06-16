/**
 * Billing Engine for Automotive ERP
 * Centralizes calculation logic for consistency across Appointments, JobCards, and Invoices.
 */

const calculateBilling = (services = [], parts = [], taxRate = 0, discount = 0) => {
  const serviceTotal = services.reduce((sum, s) => sum + (Number(s.subtotal) || 0), 0);
  const partsTotal = parts.reduce((sum, p) => sum + (Number(p.subtotal) || 0), 0);
  
  const subtotal = serviceTotal + partsTotal;
  const discountAmount = Number(discount) || 0;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (Number(taxRate) / 100);
  const grandTotal = taxableAmount + taxAmount;

  return {
    serviceTotal,
    partsTotal,
    subtotal,
    taxAmount,
    discountAmount,
    grandTotal,
    balance: grandTotal // Note: caller should subtract paidAmount
  };
};

module.exports = {
  calculateBilling,
};
