const express = require('express');
const {
  generateQuotation,
  getQuotations,
  deleteQuotation,
  generateInvoice,
  getInvoices,
  updateInvoice,
  deleteInvoice,
  getPayments,
  deletePayment,
  getBankAccounts,
  createBankAccount,
  getPettyCashFunds,
  createPettyCashFund,
  getPettyCashTransactions,
  recordPettyCashTransaction,
  getTransactions,
  getExpenses,
  createExpense,
  sendInvoiceEmail,
  sendInvoiceSMS,
  getCustomerStatement,
} = require('./financeController');

const {
  recordPayment,
  getAppointmentTransactions
} = require('./paymentController');
const {
  refundPayment,
  generatePaymentLink,
} = require('./paymentExtensionController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();


router.route('/quotations').post(protect, generateQuotation).get(protect, getQuotations);
router.route('/quotations/:id').delete(protect, deleteQuotation);
router.route('/invoices').post(protect, generateInvoice).get(protect, getInvoices);
router.route('/invoices/:id').put(protect, updateInvoice).delete(protect, deleteInvoice);
router.route('/payments').post(protect, getPayments);
router.route('/payments/:id').delete(protect, deletePayment);
router.route('/payments/transactions').post(protect, recordPayment);
router.route('/payments/transactions/:appointmentId').get(protect, getAppointmentTransactions);
router.route('/banking/accounts').get(protect, getBankAccounts).post(protect, createBankAccount);
router.route('/petty-cash').get(protect, getPettyCashFunds).post(protect, createPettyCashFund);
router.route('/petty-cash/transactions').post(protect, recordPettyCashTransaction);
router.route('/petty-cash/transactions/:fundId').get(protect, getPettyCashTransactions);
router.route('/transactions').get(protect, getTransactions);
router.route('/expenses').get(protect, getExpenses).post(protect, createExpense);
router.route('/invoices/:id/send-email').post(protect, sendInvoiceEmail);
router.route('/invoices/:id/send-sms').post(protect, sendInvoiceSMS);
router.get('/statement/:customerId', protect, getCustomerStatement);
router.post('/payments/:id/refund', protect, refundPayment);

router.post('/payments/:id/refund', protect, refundPayment);
router.post('/invoices/:id/payment-link', protect, generatePaymentLink);


module.exports = router;
