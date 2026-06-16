const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');
const { notFound, errorHandler } = require('./src/middleware/errorMiddleware');

const authRoutes = require('./src/modules/auth/authRoutes');
const dashboardRoutes = require('./src/modules/dashboard/dashboardRoutes');
const customerRoutes = require('./src/modules/customers/customerRoutes');
const vehicleRoutes = require('./src/modules/vehicles/vehicleRoutes');
const appointmentRoutes = require('./src/modules/appointments/appointmentRoutes');
const jobCardRoutes = require('./src/modules/jobcards/jobCardRoutes');
const inventoryRoutes = require('./src/modules/inventory/inventoryRoutes');
const hrRoutes = require('./src/modules/hr/hrRoutes');
const financeRoutes = require('./src/modules/finance/financeRoutes');
const reportRoutes = require('./src/modules/reports/reportRoutes');
const serviceRoutes = require('./src/modules/service/serviceRoutes');
const payrollRoutes = require('./src/modules/hr/payrollRoutes');
const communicationRoutes = require('./src/modules/notifications/communicationRoutes');

const servicesRoutes = require('./src/modules/services/servicesRoutes');
const cashRoutes = require('./src/modules/cash/cashRoutes');
const portalRoutes = require('./src/modules/customers/portalRoutes');



dotenv.config();

connectDB();

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/jobcards', jobCardRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/service', serviceRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/cash', cashRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/inventory/warehouses', require('./src/modules/inventory/warehouseRoutes'));




// Scheduled Jobs
const cron = require('node-cron');
const { checkLowStockAndNotify, sendAppointmentReminders } = require('./src/modules/notifications/notificationService');

// Daily low stock check at 9 AM
cron.schedule('0 9 * * *', () => {
  checkLowStockAndNotify(process.env.ADMIN_EMAIL || 'admin@example.com');
});

// Daily appointment reminders at 8 AM
cron.schedule('0 8 * * *', () => {
  sendAppointmentReminders();
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get('/api/test-route', (req, res) => {
  res.json({ message: 'Server is updating correctly' });
});

// Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
