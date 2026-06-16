const mongoose = require('mongoose');

const inspectionItemSchema = mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ['Green', 'Yellow', 'Red', 'N/A'], default: 'Green' },
  notes: String,
  media: [String], // Array of URLs (Photos/Videos)
});

const inspectionSchema = mongoose.Schema(
  {
    jobCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobCard',
      required: true,
    },
    customerApproved: {
      type: Boolean,
      default: false,
    },
    categories: {
      engine: [inspectionItemSchema],
      battery: [inspectionItemSchema],
      brakes: [inspectionItemSchema],
      suspension: [inspectionItemSchema],
      tires: [inspectionItemSchema],
      lights: [inspectionItemSchema],
      fluids: [inspectionItemSchema],
      ac: [inspectionItemSchema],
      interior: [inspectionItemSchema],
      exterior: [inspectionItemSchema],
    },
    overallSummary: String,
    technicianSignature: String,
    customerSignature: String,
  },
  {
    timestamps: true,
  }
);

const Inspection = mongoose.model('Inspection', inspectionSchema);

module.exports = Inspection;
