const asyncHandler = require('express-async-handler');
const Inspection = require('../../models/inspectionModel');
const JobCard = require('../../models/jobCardModel');

// @desc    Get inspection by job card ID
// @route   GET /api/service/inspections/jobcard/:id
// @access  Private
const getInspectionByJobCard = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findOne({ jobCard: req.params.id });
  res.json(inspection);
});

// @desc    Create or Update inspection
// @route   POST /api/service/inspections
// @access  Private
const upsertInspection = asyncHandler(async (req, res) => {
  const { jobCard, categories, overallSummary, technicianSignature, customerSignature } = req.body;

  let inspection = await Inspection.findOne({ jobCard });

  if (inspection) {
    inspection.categories = categories || inspection.categories;
    inspection.overallSummary = overallSummary || inspection.overallSummary;
    inspection.technicianSignature = technicianSignature || inspection.technicianSignature;
    inspection.customerSignature = customerSignature || inspection.customerSignature;
    await inspection.save();
  } else {
    inspection = await Inspection.create({
      jobCard,
      categories,
      overallSummary,
      technicianSignature,
      customerSignature,
    });
    
    // Link to JobCard
    await JobCard.findByIdAndUpdate(jobCard, { inspectionResults: inspection._id });
  }

  res.status(201).json(inspection);
});

// @desc    Update customer approval for inspection
// @route   PUT /api/service/inspections/:id/approve
// @access  Private
const approveInspection = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findById(req.params.id);
  if (!inspection) {
    res.status(404);
    throw new Error('Inspection not found');
  }

  inspection.customerApproved = true;
  await inspection.save();

  res.json(inspection);
});

module.exports = {
  getInspectionByJobCard,
  upsertInspection,
  approveInspection,
};
