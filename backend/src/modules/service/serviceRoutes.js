const express = require('express');
const inspectionRoutes = require('./inspectionRoutes');
const {

  getInsurancePolicies,
  createInsurancePolicy,
  deleteInsurancePolicy,
  getWarrantyClaims,
  createWarrantyClaim,
  updateWarrantyClaim,
  deleteWarrantyClaim,
  getRepairList,
} = require('./serviceController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.route('/insurance').get(protect, getInsurancePolicies).post(protect, createInsurancePolicy);
router.route('/insurance/:id').delete(protect, deleteInsurancePolicy);
router.route('/warranty').get(protect, getWarrantyClaims).post(protect, createWarrantyClaim);
router.route('/warranty/:id').put(protect, updateWarrantyClaim).delete(protect, deleteWarrantyClaim);
router.route('/repairs').get(protect, getRepairList);

router.use('/inspections', inspectionRoutes);

module.exports = router;

