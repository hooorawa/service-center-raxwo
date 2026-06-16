const asyncHandler = require('express-async-handler');
const Service = require('../../models/serviceModel');

// @desc    Get all services
// @route   GET /api/services
// @access  Private
const getServices = asyncHandler(async (req, res) => {
  const services = await Service.find({}).sort({ name: 1 });
  res.json(services);
});

// @desc    Create a service
// @route   POST /api/services
// @access  Private/Admin
const createService = asyncHandler(async (req, res) => {
  const { name, serviceCode, category, duration, price, discount, description, status } = req.body;

  const service = await Service.create({
    name,
    serviceCode: serviceCode || undefined,
    category,
    duration: Number(duration) || 30,
    price: Number(price) || 0,
    discount: Number(discount) || 0,
    description,
    status: status || 'Active',
  });

  res.status(201).json(service);
});

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  const { name, serviceCode, category, duration, price, discount, description, status } = req.body;

  service.name = name ?? service.name;
  service.serviceCode = serviceCode ?? service.serviceCode;
  service.category = category ?? service.category;
  service.duration = duration != null ? Number(duration) : service.duration;
  service.price = price != null ? Number(price) : service.price;
  service.discount = discount != null ? Number(discount) : service.discount;
  service.description = description ?? service.description;
  service.status = status ?? service.status;

  const updated = await service.save();
  res.json(updated);
});

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Admin
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  await service.deleteOne();
  res.json({ message: 'Service removed' });
});

module.exports = {
  getServices,
  createService,
  updateService,
  deleteService,
};
