const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'Gmail', // or use your SMTP service provider
  auth: {
    user: process.env.SMTP_EMAIL, // your email
    pass: process.env.SMTP_PASSWORD, // your email password or app password
  },
});

module.exports = transporter;