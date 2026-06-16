const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const dropIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        // This will drop the collection and its indexes
        await mongoose.connection.db.dropCollection('customers');
        console.log('Dropped customers collection');
        
        process.exit();
    } catch (err) {
        console.log('Error dropping collection (perhaps it does not exist):', err.message);
        process.exit(0);
    }
};

dropIndexes();
