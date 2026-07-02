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
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNum = process.env.TWILIO_PHONE_NUMBER;

    let status = 'Sent';

    if (!accountSid || !authToken || !fromNum) {
        console.log(`[SMS Gateway Mock] Sending SMS to ${to}: ${message}`);
    } else {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
        const params = new URLSearchParams();
        params.append('To', to);
        params.append('From', fromNum);
        params.append('Body', message);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });
            const resData = await response.json();
            if (!response.ok) {
                status = 'Failed';
                console.error('Twilio SMS Failed:', resData.message);
            } else {
                console.log('SMS sent successfully via Twilio:', resData.sid);
            }
        } catch (error) {
            status = 'Failed';
            console.error('Twilio SMS Error:', error.message);
        }
    }
    
    // Log the SMS
    await logSMS({
        recipient: to,
        message: message,
        event: event,
        status: status,
        date: new Date(),
        referenceId: referenceId
    });
};

const sendWhatsApp = async (to, message) => {
  const wsToken = process.env.WHATSAPP_TOKEN;
  const wsPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!wsToken || !wsPhoneId) {
    console.log(`[WhatsApp Gateway Mock] Sending WhatsApp to ${to}: ${message}`);
    return;
  }

  const url = `https://graph.facebook.com/v17.0/${wsPhoneId}/messages`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${wsToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      })
    });
    const resData = await response.json();
    if (response.ok) {
      console.log('WhatsApp message sent:', resData.messages?.[0]?.id);
    } else {
      console.error('WhatsApp API Error:', resData.error?.message);
    }
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error.message);
  }
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

// Predictive service maintenance check based on historical mileage increase rate
const checkPredictiveMaintenance = async () => {
  const JobCard = require('../../models/jobCardModel');
  const Vehicle = require('../../models/vehicleModel');
  const Customer = require('../../models/customerModel');

  const vehicles = await Vehicle.find({}).populate('owner');

  for (const vehicle of vehicles) {
    if (!vehicle.owner) continue;

    // Find all job cards for this vehicle sorted by date
    const jobs = await JobCard.find({ vehicle: vehicle._id }).sort({ createdAt: 1 });
    if (jobs.length < 2) continue; // Need at least 2 points to calculate rate of mileage increase

    let totalDays = 0;
    let totalMileageDiff = 0;

    for (let i = 1; i < jobs.length; i++) {
      const prevJob = jobs[i - 1];
      const currJob = jobs[i];

      if (prevJob.mileage && currJob.mileage && currJob.mileage > prevJob.mileage) {
        const days = (new Date(currJob.createdAt) - new Date(prevJob.createdAt)) / (1000 * 60 * 60 * 24);
        if (days > 0) {
          totalDays += days;
          totalMileageDiff += (currJob.mileage - prevJob.mileage);
        }
      }
    }

    if (totalDays === 0 || totalMileageDiff === 0) continue;

    const dailyMileageIncrease = totalMileageDiff / totalDays;
    const lastJob = jobs[jobs.length - 1];
    const lastMileage = lastJob.mileage || vehicle.mileage || 0;

    // Standard oil/service interval is 5000 KM
    const nextServiceMileage = lastMileage + 5000;
    const remainingKm = nextServiceMileage - (vehicle.mileage || lastMileage);

    if (remainingKm > 0 && dailyMileageIncrease > 0) {
      const daysToNextService = remainingKm / dailyMileageIncrease;
      const forecastDate = new Date();
      forecastDate.setDate(forecastDate.getDate() + Math.round(daysToNextService));

      const daysUntil = Math.round(daysToNextService);
      if (daysUntil <= 7 && daysUntil > 0) {
        const message = `Hi ${vehicle.owner.name}, based on your driving history, your vehicle ${vehicle.registrationNumber} is due for its next service in approx. ${daysUntil} days (around ${forecastDate.toDateString()}). Book your appointment now!`;
        
        if (vehicle.owner.phone) {
          await sendSMS(vehicle.owner.phone, message, 'Service Recall', vehicle._id);
        }
      }
    }
  }
};

module.exports = {
  checkLowStockAndNotify,
  sendAppointmentReminders,
  checkPredictiveMaintenance,
  sendEmail,
  sendSMS,
  sendWhatsApp
};
