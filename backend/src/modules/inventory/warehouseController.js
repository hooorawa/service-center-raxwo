const asyncHandler = require('express-async-handler');
const Warehouse = require('../../models/warehouseModel');

// @desc    Get all warehouses
// @route   GET /api/inventory/warehouses
// @access  Private/Admin
const getWarehouses = asyncHandler(async (req, res) => {
  const warehouses = await Warehouse.find({});
  res.json(warehouses);
});

// @desc    Create a warehouse
// @route   POST /api/inventory/warehouses
// @access  Private/Admin
const createWarehouse = asyncHandler(async (req, res) => {
  const { name, location, manager, isDefault } = req.body;

  const warehouseExists = await Warehouse.findOne({ name });
  if (warehouseExists) {
    res.status(400);
    throw new Error('Warehouse already exists');
  }

  if (isDefault) {
    await Warehouse.updateMany({}, { isDefault: false });
  }

  const warehouse = await Warehouse.create({
    name,
    location,
    manager,
    isDefault,
  });

  res.status(201).json(warehouse);
});

// @desc    Update a warehouse
// @route   PUT /api/inventory/warehouses/:id
// @access  Private/Admin
const updateWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await Warehouse.findById(req.params.id);

  if (warehouse) {
    if (req.body.isDefault) {
      await Warehouse.updateMany({}, { isDefault: false });
    }
    warehouse.name = req.body.name || warehouse.name;
    warehouse.location = req.body.location || warehouse.location;
    warehouse.manager = req.body.manager || warehouse.manager;
    warehouse.status = req.body.status || warehouse.status;
    warehouse.isDefault = req.body.isDefault !== undefined ? req.body.isDefault : warehouse.isDefault;

    const updatedWarehouse = await warehouse.save();
    res.json(updatedWarehouse);
  } else {
    res.status(404);
    throw new Error('Warehouse not found');
  }
});

module.exports = {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
};
