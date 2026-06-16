const asyncHandler = require('express-async-handler');
const Vehicle = require('../../models/vehicleModel');
const Customer = require('../../models/customerModel');

// @desc    Register a new vehicle
// @route   POST /api/vehicles
// @access  Private/Admin
const registerVehicle = asyncHandler(async (req, res) => {
  const { owner, registrationNumber, make, model, year, chassisNumber, engineNumber, color } = req.body;

  const vehicleExists = await Vehicle.findOne({ registrationNumber });

  if (vehicleExists) {
    res.status(400);
    throw new Error('Vehicle with this registration number already exists');
  }

  const vehicle = await Vehicle.create({
    owner,
    registrationNumber,
    make,
    model,
    year,
    chassisNumber,
    engineNumber,
    color,
  });

  res.status(201).json(vehicle);
});

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private/Admin
const getVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({}).populate('owner', 'name phone');
  res.json(vehicles);
});

// @desc    Get vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Private/Admin
const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id).populate('owner', 'name phone');

  if (vehicle) {
    res.json(vehicle);
  } else {
    res.status(404);
    throw new Error('Vehicle not found');
  }
});

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private/Admin
const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (vehicle) {
    vehicle.registrationNumber = req.body.registrationNumber || vehicle.registrationNumber;
    vehicle.make = req.body.make || vehicle.make;
    vehicle.model = req.body.model || vehicle.model;
    vehicle.year = req.body.year || vehicle.year;
    vehicle.chassisNumber = req.body.chassisNumber || vehicle.chassisNumber;
    vehicle.engineNumber = req.body.engineNumber || vehicle.engineNumber;
    vehicle.color = req.body.color || vehicle.color;

    const updatedVehicle = await vehicle.save();
    res.json(updatedVehicle);
  } else {
    res.status(404);
    throw new Error('Vehicle not found');
  }
});

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private/Admin
const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (vehicle) {
    await vehicle.deleteOne();
    res.json({ message: 'Vehicle removed' });
  } else {
    res.status(404);
    throw new Error('Vehicle not found');
  }
});

module.exports = {
  registerVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
