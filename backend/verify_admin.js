const mongoose = require('mongoose');
const Admin = require('./src/models/adminModel');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const verifyAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const admin = await Admin.findOne({ email: 'admin@example.com' });
        if (!admin) {
            console.log('Admin not found');
        } else {
            console.log('Admin found:', admin.email);
            const isMatch = await admin.matchPassword('admin123');
            console.log('Password match:', isMatch);
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyAdmin();
