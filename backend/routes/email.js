import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Department email mapping
const departmentEmails = {
  'Maintenance': process.env.DEPT_MAINTENANCE_EMAIL,
  'IT': process.env.DEPT_IT_EMAIL,
  'HR': process.env.DEPT_HR_EMAIL,
  'Admin': process.env.DEPT_ADMIN_EMAIL,
  'Security': process.env.DEPT_SECURITY_EMAIL,
  'Facilities': process.env.DEPT_FACILITIES_EMAIL
};

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send complaint email
router.post('/send', async (req, res) => {
  try {
    const { 
      department, 
      summary, 
      location, 
      datetime, 
      severity, 
      details,
      userEmail 
    } = req.body;

    if (!department || !summary) {
      return res.status(400).json({ error: 'Department and summary are required' });
    }

    const departmentEmail = departmentEmails[department];
    
    if (!departmentEmail) {
      return res.status(400).json({ error: 'Invalid department' });
    }

    const transporter = createTransporter();

    // Email content
    const emailSubject = `New Complaint - ${department} Department [${severity || 'Medium'} Priority]`;
    
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4F46E5; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #4F46E5; }
    .severity-high { color: #dc2626; font-weight: bold; }
    .severity-critical { color: #991b1b; font-weight: bold; }
    .severity-medium { color: #f59e0b; font-weight: bold; }
    .severity-low { color: #059669; font-weight: bold; }
    .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>New Complaint Received</h2>
    </div>
    <div class="content">
      <div class="field">
        <span class="label">Department:</span> ${department}
      </div>
      <div class="field">
        <span class="label">Severity:</span> 
        <span class="severity-${(severity || 'medium').toLowerCase()}">${severity || 'Medium'}</span>
      </div>
      ${userEmail ? `<div class="field"><span class="label">User Email:</span> ${userEmail}</div>` : ''}
      ${location && location !== 'Not specified' ? `<div class="field"><span class="label">Location:</span> ${location}</div>` : ''}
      ${datetime && datetime !== 'Not specified' ? `<div class="field"><span class="label">Date/Time:</span> ${datetime}</div>` : ''}
      <div class="field">
        <span class="label">Summary:</span><br/>
        ${summary}
      </div>
      ${details ? `
      <div class="field">
        <span class="label">Detailed Conversation:</span><br/>
        <div style="background-color: white; padding: 15px; border-radius: 5px; margin-top: 10px;">
          ${details.replace(/\n/g, '<br/>')}
        </div>
      </div>
      ` : ''}
    </div>
    <div class="footer">
      <p>This is an automated email from the Complaint Management System</p>
      <p>Timestamp: ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: departmentEmail,
      subject: emailSubject,
      html: emailBody
    };

    const info = await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: info.messageId,
      department,
      departmentEmail
    });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

// Test email configuration
router.get('/test', async (req, res) => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    res.json({ success: true, message: 'Email configuration is valid' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
