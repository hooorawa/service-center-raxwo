const asyncHandler = require('express-async-handler');
const JobCard = require('../../models/jobCardModel');
const Vehicle = require('../../models/vehicleModel');

// @desc    Create a new job card
// @route   POST /api/jobcards
// @access  Private/Admin
const createJobCard = asyncHandler(async (req, res) => {
  const { vehicle, customer, status, technician, inspectionResults, tasks, estimatedCompletion } = req.body;

  const jobCard = await JobCard.create({
    vehicle,
    customer,
    status,
    technician,
    inspectionResults,
    tasks,
    estimatedCompletion,
  });

  res.status(201).json(jobCard);
});

// @desc    Get all job cards
// @route   GET /api/jobcards
// @access  Private/Admin
const getJobCards = asyncHandler(async (req, res) => {
  const jobCards = await JobCard.find({})
    .populate('customer', 'name phone')
    .populate('vehicle', 'registrationNumber make model')
    .populate('technician', 'name designation');
  res.json(jobCards);
});

// @desc    Get job card by ID
// @route   GET /api/jobcards/:id
// @access  Private/Admin
const getJobCardById = asyncHandler(async (req, res) => {
  const jobCard = await JobCard.findById(req.params.id)
    .populate('customer', 'name phone')
    .populate('vehicle', 'registrationNumber make model')
    .populate('technician', 'name designation')
    .populate('partsUsed.product', 'name price');

  if (jobCard) {
    res.json(jobCard);
  } else {
    res.status(404);
    throw new Error('Job card not found');
  }
});

// @desc    Update job card (status, tasks, parts)
// @route   PUT /api/jobcards/:id
// @access  Private/Admin
const updateJobCard = asyncHandler(async (req, res) => {
  const jobCard = await JobCard.findById(req.params.id);

  if (jobCard) {
    jobCard.status = req.body.status || jobCard.status;
    jobCard.technician = req.body.technician || jobCard.technician;
    jobCard.inspectionResults = req.body.inspectionResults || jobCard.inspectionResults;
    jobCard.tasks = req.body.tasks || jobCard.tasks;
    jobCard.partsUsed = req.body.partsUsed || jobCard.partsUsed;
    jobCard.estimatedCompletion = req.body.estimatedCompletion || jobCard.estimatedCompletion;

    const updatedJobCard = await jobCard.save();
    res.json(updatedJobCard);
  } else {
    res.status(404);
    throw new Error('Job card not found');
  }
});

// @desc    Delete job card
// @route   DELETE /api/jobcards/:id
// @access  Private/Admin
const deleteJobCard = asyncHandler(async (req, res) => {
  const jobCard = await JobCard.findById(req.params.id);
  if (jobCard) {
    await jobCard.deleteOne();
    res.json({ message: 'Job card removed' });
  } else {
    res.status(404);
    throw new Error('Job card not found');
  }
});

module.exports = {
  createJobCard,
  getJobCards,
  getJobCardById,
  updateJobCard,
  deleteJobCard,
};
