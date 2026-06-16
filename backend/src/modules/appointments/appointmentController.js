const asyncHandler = require('express-async-handler');
const Appointment = require('../../models/appointmentModel');
const Product = require('../../models/productModel');
const Service = require('../../models/serviceModel');
const { calculateBilling } = require('../finance/billingEngine');
const { deductStock } = require('../inventory/inventoryEngine');

// @desc    Book an appointment (Initial check-in)
// @route   POST /api/appointments
// @access  Private/Admin
const bookAppointment = asyncHandler(async (req, res) => {
  const { customer, vehicle, dateTime, services, parts, mechanic, mileage, fuelLevel, notes, tax, discount } = req.body;

  // Calculate initial billing
  const billingData = calculateBilling(services || [], parts || [], tax || 0, discount || 0);

  const appointment = await Appointment.create({
    customer,
    vehicle,
    dateTime,
    mechanic,
    mileage,
    fuelLevel,
    services: services || [],
    parts: parts || [],
    billing: {
      ...billingData,
      paidAmount: 0,
    },
    notes,
    status: 'Pending',
  });

  res.status(201).json(appointment);
});

// @desc    Get all appointments with detailed populations
// @route   GET /api/appointments
// @access  Private/Admin
const getAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({})
    .populate('customer', 'name phone')
    .populate('vehicle', 'registrationNumber make model')
    .populate('mechanic', 'name designation')
    .sort({ createdAt: -1 });
  res.json(appointments);
});

// @desc    Update appointment lifecycle, services, and parts
// @route   PUT /api/appointments/:id
// @access  Private/Admin
const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  const oldStatus = appointment.status;
  const { status, services, parts, tax, discount, mechanic, mileage, fuelLevel, notes, diagnostics } = req.body;

  // Update fields
  appointment.status = status || appointment.status;
  appointment.mechanic = mechanic || appointment.mechanic;
  appointment.mileage = mileage || appointment.mileage;
  appointment.fuelLevel = fuelLevel || appointment.fuelLevel;
  appointment.notes = notes || appointment.notes;
  appointment.diagnostics = diagnostics || appointment.diagnostics;

  if (services) appointment.services = services;
  if (parts) appointment.parts = parts;

  // Recalculate billing
  const billingData = calculateBilling(
    appointment.services,
    appointment.parts,
    tax !== undefined ? tax : appointment.billing.tax,
    discount !== undefined ? discount : appointment.billing.discount
  );

  appointment.billing = {
    ...appointment.billing,
    ...billingData,
    balance: billingData.grandTotal - appointment.billing.paidAmount
  };

  const updatedAppointment = await appointment.save();

  // Trigger inventory deduction ONLY when moving to 'Completed' for the first time
  if (oldStatus !== 'Completed' && status === 'Completed') {
    for (const part of appointment.parts) {
      if (part.product) {
        try {
          await deductStock(
            part.product,
            part.quantity,
            'Service Usage',
            appointment._id,
            req.user?._id,
            `Stock used in Appointment ${appointment.appointmentNumber}`
          );
        } catch (error) {
          console.error(`Failed to deduct stock for ${part.name}:`, error.message);
          // In a real app, we might want to rollback or notify admin
        }
      }
    }
  }

  res.json(updatedAppointment);
});

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private/Admin
const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (appointment) {
    // Optional: if status was 'Completed', maybe we shouldn't allow delete without stock return
    await appointment.deleteOne();
    res.json({ message: 'Appointment removed' });
  } else {
    res.status(404);
    throw new Error('Appointment not found');
  }
});

module.exports = {
  bookAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment,
};
