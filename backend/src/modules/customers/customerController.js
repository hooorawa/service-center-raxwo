const asyncHandler = require('express-async-handler');
const Customer = require('../../models/customerModel');
const Vehicle = require('../../models/vehicleModel');

// @desc    Create a new customer
// @route   POST /api/customers
// @access  Private/Admin
const createCustomer = asyncHandler(async (req, res) => {
  const { name, email, phone, address } = req.body;

  const customerExists = await Customer.findOne({ phone });

  if (customerExists) {
    res.status(400);
    throw new Error('Customer already exists with this phone number');
  }

  const customer = await Customer.create({
    name,
    email,
    phone,
    address,
  });

  res.status(201).json(customer);
});

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private/Admin
const getCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find({});
  res.json(customers);
});

// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Private/Admin
const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (customer) {
    const vehicles = await Vehicle.find({ owner: customer._id });
    res.json({ ...customer._doc, vehicles });
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
});

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private/Admin
const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (customer) {
    customer.name = req.body.name || customer.name;
    customer.email = req.body.email || customer.email;
    customer.phone = req.body.phone || customer.phone;
    customer.address = req.body.address || customer.address;

    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
});

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (customer) {
    await Vehicle.deleteMany({ owner: customer._id });
    await customer.deleteOne();
    res.json({ message: 'Customer and associated vehicles removed' });
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
});

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
