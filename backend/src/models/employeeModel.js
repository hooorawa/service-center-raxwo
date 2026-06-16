const mongoose = require('mongoose');

const employeeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: 'Active',
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    employmentType: {
      type: String,
      default: 'Full-time',
    },
    contractType: {
      type: String,
      default: 'Permanent',
    },
    salaryGrade: {
      type: String,
    },
    bankDetails: {
      bankName: String,
      branch: String,
      accountNumber: String,
      accountHolderName: String,
    },
    taxInformation: {
      tin: String,
      epfNumber: String,
      etfNumber: String,
    },
    documents: [
      {
        title: String,
        documentType: String, // NIC, Contract, License, etc.
        fileUrl: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    performanceNotes: [
      {
        note: String,
        evaluationDate: Date,
        evaluatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Admin',
        },
      },
    ],
    salaryHistory: [
      {
        previousSalary: Number,
        newSalary: Number,
        effectiveDate: Date,
        reason: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
