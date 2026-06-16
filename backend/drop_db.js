const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const dropDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        await mongoose.connection.db.dropDatabase();
        console.log('Dropped database');
        
        process.exit();
    } catch (err) {
        console.error('Error dropping database:', err.message);
        process.exit(1);
    }
};

dropDB();
