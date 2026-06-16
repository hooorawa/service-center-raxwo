const nodemailer = require('nodemailer');
const Product = require('../../models/productModel');
const Appointment = require('../../models/appointmentModel');
const { logEmail, logSMS } = require('./communicationController');

const sendEmail = async (to, subject, text, html) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Repair ERP Notifications" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
  
  // Log the email
  await logEmail({
    recipient: to,
    subject: subject,
    message: html || text,
    status: 'Sent',
    date: new Date()
  });
};

const sendSMS = async (to, message, event = 'Notification', referenceId = null) => {
    // Mock SMS sending logic
    console.log(`Sending SMS to ${to}: ${message}`);
    
    // Log the SMS
    await logSMS({
        recipient: to,
        message: message,
        event: event,
        status: 'Sent',
        date: new Date(),
        referenceId: referenceId
    });
};

// Check for low stock and notify admin
const checkLowStockAndNotify = async (adminEmail) => {
  const lowStockProducts = await Product.find({
    $expr: { $lte: ['$stockLevel', '$reorderLevel'] },
  });

  if (lowStockProducts.length > 0) {
    const productList = lowStockProducts.map(p => `- ${p.name} (SKU: ${p.sku}): ${p.stockLevel} ${p.unit} remaining`).join('\n');
    
    await sendEmail(
      adminEmail,
      'URGENT: Low Stock Alert',
      `The following products are below the reorder level:\n\n${productList}`,
      `<h3>Low Stock Alert</h3><p>The following products are below the reorder level:</p><ul>${lowStockProducts.map(p => `<li><strong>${p.name}</strong> (${p.sku}): ${p.stockLevel} ${p.unit}</li>`).join('')}</ul>`
    );
  }
};

// Notify customers of upcoming service appointments
const sendAppointmentReminders = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startOfDay = new Date(tomorrow.setHours(0, 0, 0, 0));
  const endOfDay = new Date(tomorrow.setHours(23, 59, 59, 999));

  const upcomingAppointments = await Appointment.find({
    dateTime: { $gte: startOfDay, $lte: endOfDay },
    status: 'Confirmed'
  }).populate('customer');

  for (const appointment of upcomingAppointments) {
    if (appointment.customer.email) {
      await sendEmail(
        appointment.customer.email,
        'Service Reminder: Your Vehicle Appointment Tomorrow',
        `Dear ${appointment.customer.name},\n\nThis is a reminder for your vehicle service appointment tomorrow at ${appointment.dateTime.toLocaleTimeString()}.\n\nVehicle: ${appointment.vehicle}\nService: ${appointment.serviceType}\n\nWe look forward to seeing you!`,
        `<h3>Service Reminder</h3><p>Dear ${appointment.customer.name},</p><p>This is a reminder for your vehicle service appointment tomorrow at <strong>${appointment.dateTime.toLocaleTimeString()}</strong>.</p><p>Vehicle: ${appointment.vehicle}<br/>Service: ${appointment.serviceType}</p><p>We look forward to seeing you!</p>`
      );
    }
  }
};

module.exports = {
  checkLowStockAndNotify,
  sendAppointmentReminders,
  sendEmail,
  sendSMS
};
