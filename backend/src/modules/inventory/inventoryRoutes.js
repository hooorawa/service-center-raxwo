const express = require('express');
const {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  updateStock,
  addSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
  createPurchase,
  getPurchases,
  deletePurchase,
  addCategory,
  getCategories,
  getInventoryMovements,
  runProcurementAudit,
} = require('./inventoryController');

const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.route('/products').post(protect, addProduct).get(protect, getProducts);
router.route('/products/:id').put(protect, updateProduct).delete(protect, deleteProduct);
router.route('/products/:id/stock').put(protect, updateStock);
router.route('/suppliers').post(protect, addSupplier).get(protect, getSuppliers);
router.route('/suppliers/:id').put(protect, updateSupplier).delete(protect, deleteSupplier);
router.route('/categories').post(protect, addCategory).get(protect, getCategories);
router.route('/movements').get(protect, getInventoryMovements);
router.route('/movements/:productId').get(protect, getInventoryMovements);
router.route('/procurement/audit').post(protect, runProcurementAudit);
router.route('/purchases/:id').delete(protect, deletePurchase);


module.exports = router;
