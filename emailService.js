const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  // host: 'smtp.ethereal.email',
  // port: 587,
  service:"gmail",
  auth: {
    user: process.env.User,
    pass: process.env.Pass,
  },
});

const sendInvitation = (fromEmail, toEmail, invitationLink) => {
  const mailOptions = {
    from: fromEmail,
    to: toEmail,
    subject: 'Taskboard Invitation',
    html: `<p>You are invited to join our taskboard! Click <a href="${invitationLink}">here</a> to accept the invitation. from ${fromEmail}</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

module.exports = { sendInvitation };
