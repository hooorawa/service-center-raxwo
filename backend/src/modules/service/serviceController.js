const asyncHandler = require('express-async-handler');
const InsurancePolicy = require('../../models/insuranceModel');
const WarrantyClaim = require('../../models/warrantyModel');
const JobCard = require('../../models/jobCardModel');

// Insurance Controllers
const getInsurancePolicies = asyncHandler(async (req, res) => {
  const policies = await InsurancePolicy.find({}).populate('vehicle', 'registrationNumber make model');
  res.json(policies);
});

const createInsurancePolicy = asyncHandler(async (req, res) => {
  console.log('Creating insurance policy with data:', req.body);
  try {
    const { vehicle, policyNumber, provider, startDate, endDate, coverageDetails } = req.body;
    const policy = await InsurancePolicy.create({ vehicle, policyNumber, provider, startDate, endDate, coverageDetails });
    res.status(201).json(policy);
  } catch (error) {
    console.error('Mongoose Policy Creation Error:', error);
    res.status(400);
    throw new Error(error.message);
  }
});

const deleteInsurancePolicy = asyncHandler(async (req, res) => {
  const policy = await InsurancePolicy.findById(req.params.id);
  if (policy) {
    await policy.deleteOne();
    res.json({ message: 'Policy removed' });
  } else {
    res.status(404);
    throw new Error('Policy not found');
  }
});

// Warranty Controllers
const getWarrantyClaims = asyncHandler(async (req, res) => {
  const claims = await WarrantyClaim.find({}).populate('vehicle', 'registrationNumber make model').populate('invoice', 'invoiceNumber');
  res.json(claims);
});

const createWarrantyClaim = asyncHandler(async (req, res) => {
  const { vehicle, invoice, claimType, description, status } = req.body;
  const claim = await WarrantyClaim.create({ 
    vehicle, 
    invoice: invoice === '' ? null : invoice, 
    claimType, 
    description, 
    status 
  });
  res.status(201).json(claim);
});

const updateWarrantyClaim = asyncHandler(async (req, res) => {
  const claim = await WarrantyClaim.findById(req.params.id);
  if (claim) {
    claim.status = req.body.status || claim.status;
    const updatedClaim = await claim.save();
    res.json(updatedClaim);
  } else {
    res.status(404);
    throw new Error('Claim not found');
  }
});

const deleteWarrantyClaim = asyncHandler(async (req, res) => {
  const claim = await WarrantyClaim.findById(req.params.id);
  if (claim) {
    await claim.deleteOne();
    res.json({ message: 'Claim removed' });
  } else {
    res.status(404);
    throw new Error('Claim not found');
  }
});

// Repair List (Reference from JobCards)
const getRepairList = asyncHandler(async (req, res) => {
  const repairs = await JobCard.find({}).populate('customer', 'name').populate('vehicle', 'registrationNumber make model');
  res.json(repairs);
});

module.exports = {
  getInsurancePolicies,
  createInsurancePolicy,
  deleteInsurancePolicy,
  getWarrantyClaims,
  createWarrantyClaim,
  updateWarrantyClaim,
  deleteWarrantyClaim,
  getRepairList,
};
