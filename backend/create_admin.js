const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./src/models/adminModel');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Remove any existing admin with this email
        await Admin.deleteMany({ email: 'admin@servicecenter.com' });

        // Create fresh admin - model pre-save hook will hash the password
        const admin = await Admin.create({
            name: 'Admin',
            email: 'admin@servicecenter.com',
            password: 'Admin@1234',
        });

        console.log('Admin created successfully!');
        console.log('Email:', admin.email);

        // Verify the password works
        const match = await admin.matchPassword('Admin@1234');
        console.log('Password verification:', match ? 'SUCCESS ✓' : 'FAILED ✗');

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

createAdmin();
