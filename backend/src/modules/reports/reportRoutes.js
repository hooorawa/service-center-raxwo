const express = require('express');
const {
  downloadInvoicePDF,
  exportCustomersExcel,
  exportInventoryExcel,
  exportRevenueExcel,
  exportProductivityExcel,
  exportWorkshopExcel,
  exportExpensesExcel,
  exportPayrollExcel,
  exportTransactionsExcel,
  exportCashReportsExcel,
  downloadCashReceiptPDF,
  downloadInspectionPDF,
} = require('./reportController');



const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/invoice/:id/pdf', protect, downloadInvoicePDF);
router.get('/cash/receipt/:id/pdf', protect, downloadCashReceiptPDF);
router.route('/customers/excel').get(protect, exportCustomersExcel);
router.route('/inventory/excel').get(protect, exportInventoryExcel);
router.route('/finance/revenue/excel').get(protect, exportRevenueExcel);
router.route('/hr/productivity/excel').get(protect, exportProductivityExcel);
router.route('/service/workshop/excel').get(protect, exportWorkshopExcel);
router.get('/finance/expenses/excel', protect, exportExpensesExcel);
router.get('/finance/cash/excel', protect, exportCashReportsExcel);
router.get('/payroll/:id/excel', protect, exportPayrollExcel);

router.get('/finance/transactions/excel', protect, exportTransactionsExcel);
router.get('/inspection/:id/pdf', protect, downloadInspectionPDF);

module.exports = router;

