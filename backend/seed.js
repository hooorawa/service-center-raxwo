const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./src/models/adminModel');
const Customer = require('./src/models/customerModel');
const Vehicle = require('./src/models/vehicleModel');
const Product = require('./src/models/productModel');
const Category = require('./src/models/categoryModel');
const Supplier = require('./src/models/supplierModel');
const Appointment = require('./src/models/appointmentModel');
const JobCard = require('./src/models/jobCardModel');
const Employee = require('./src/models/employeeModel');
const Invoice = require('./src/models/invoiceModel');
const bcrypt = require('bcryptjs');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://chrishan2002aloka_db_user:uHfPrFyv9XLi04a7@rmsforgoldencafe.2du4jen.mongodb.net/?retryWrites=true&w=majority&appName=RMSFORGOLDENCAFE');

const seedData = async () => {
  try {
    // Clear existing data
    await Admin.deleteMany();
    await Customer.deleteMany();
    await Vehicle.deleteMany();
    await Category.deleteMany();
    await Supplier.deleteMany();
    await Product.deleteMany();
    await Appointment.deleteMany();
    await JobCard.deleteMany();
    await Employee.deleteMany();
    await Invoice.deleteMany();

    console.log('Data cleared...');

    // Seed Admin
    await Admin.create({
      name: 'Super Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });

    // Seed Categories
    const categories = await Category.insertMany([
      { name: 'Lubricants', description: 'Oils and fluids' },
      { name: 'Brakes', description: 'Brake pads, discs, and fluid' },
      { name: 'Filters', description: 'Air, oil, and cabin filters' }
    ]);

    // Seed Suppliers
    const suppliers = await Supplier.insertMany([
      { name: 'Global Spares', phone: '0112223344', email: 'sales@globalspares.com' },
      { name: 'City Auto Parts', phone: '0115556677', email: 'info@cityauto.com' }
    ]);

    // Seed Customers
    const customers = await Customer.insertMany([
      { name: 'John Doe', email: 'john@example.com', phone: '0771234567', address: '123 Main St, Colombo' },
      { name: 'Jane Smith', email: 'jane@example.com', phone: '0777654321', address: '456 Park Rd, Kandy' }
    ]);

    // Seed Vehicles
    const vehicles = await Vehicle.insertMany([
      { registrationNumber: 'WP CAB-1234', make: 'Toyota', model: 'Prius', year: 2018, owner: customers[0]._id, chassisNumber: 'CHAS123456', engineNumber: 'ENG123456' },
      { registrationNumber: 'CP BBD-5678', make: 'Honda', model: 'Civic', year: 2020, owner: customers[1]._id, chassisNumber: 'CHAS789012', engineNumber: 'ENG789012' }
    ]);

    // Seed Products (Inventory)
    const seededProducts = await Product.insertMany([
      { sku: 'OIL-SYN-5W30', name: 'Synthetic Oil 5W30', category: categories[0]._id, supplier: suppliers[0]._id, stockLevel: 5, reorderLevel: 10, unit: 'Liters', price: 15, cost: 10 },
      { sku: 'BRK-PAD-FR', name: 'Front Brake Pads', category: categories[1]._id, supplier: suppliers[1]._id, stockLevel: 20, reorderLevel: 5, unit: 'Sets', price: 45, cost: 30 },
      { sku: 'AIR-FLT-T01', name: 'Air Filter Toyota', category: categories[2]._id, supplier: suppliers[0]._id, stockLevel: 3, reorderLevel: 5, unit: 'Pcs', price: 25, cost: 15 }
    ]);

    // Seed Employees
    const seededEmployees = await Employee.insertMany([
      { name: 'Saman Kumara', email: 'saman@example.com', phone: '0711111111', designation: 'Senior Technician', department: 'Mechanical', salary: 50000 },
      { name: 'Nimal Perera', email: 'nimal@example.com', phone: '0722222222', designation: 'General Technician', department: 'Mechanical', salary: 35000 }
    ]);

    // Seed Job Cards
    const jobCards = await JobCard.insertMany([
      { 
        vehicle: vehicles[0]._id, 
        customer: customers[0]._id, 
        technician: seededEmployees[0]._id,
        status: 'Repairing',
        issueDescription: 'Oil change and brake noise check',
        estimatedCompletion: new Date(Date.now() + 86400000)
      },
      { 
        vehicle: vehicles[1]._id, 
        customer: customers[1]._id, 
        technician: seededEmployees[1]._id,
        status: 'Received',
        issueDescription: 'General service',
        estimatedCompletion: new Date(Date.now() + 172800000)
      }
    ]);

    console.log('Seed data inserted successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
