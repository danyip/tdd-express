const transporter = require('../config/emailTransporter');
const nodemailer = require('nodemailer');
const logger = require('../shared/logger');

const sendAccountActivation = async (email, token) => {
  const info = await transporter.sendMail({
    from: 'info@my-app.com',
    to: email,
    subject: 'Account Activation',
    html: `
    <div>
      <b>Please click below link to activate your account</b>
    </div>
    <div>
      <a href="http://localhost:8080/#/login?token=${token}">Activate<a/>
    </div>
    `,
  });

  logger.info('url: ' + nodemailer.getTestMessageUrl(info));
};

const sendPasswordReset = async (email, token) => {
  const info = await transporter.sendMail({
    from: 'info@my-app.com',
    to: email,
    subject: 'Password Reset',
    html: `
    <div>
      <b>Please click below link to to reset your passoword</b>
    </div>
    <div>
      <a href="http://localhost:8080/#/password-reset?reset=${token}">Reset<a/>
    </div>
    `,
  });
  logger.info('url: ' + nodemailer.getTestMessageUrl(info));
};

module.exports = { sendAccountActivation, sendPasswordReset };
