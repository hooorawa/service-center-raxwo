const mongoose = require('mongoose');

const inventoryMovementSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    type: {
      type: String,
      enum: ['Purchase', 'Service Usage', 'Adjustment', 'Damage', 'Return'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    beforeStock: {
      type: Number,
      required: true,
    },
    afterStock: {
      type: Number,
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      // Can refer to Purchase or Appointment
    },
    notes: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

const InventoryMovement = mongoose.model('InventoryMovement', inventoryMovementSchema);

module.exports = InventoryMovement;
