const Mailgen = require("mailgen");
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    // Mailgen instance
    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "FlowDesk",
        link: "https://FlowDesk.com",
      },
    });

    // Generate email body
    const emailTextual = mailGenerator.generatePlaintext(
      options.mailGenContent,
    );
    const emailHTML = mailGenerator.generate(options.mailGenContent);

    // Setup transporter
    const port = Number(process.env.MAIL_TRAP_PORT) || 2525;
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_TRAP_HOST,
      port,
      secure: port === 465, // SSL true agar port 465 hai
      auth: {
        user: process.env.MAIL_TRAP_USERNAME,
        pass: process.env.MAIL_TRAP_PASSWORD,
      },
    });

    // Send mail
    const info = await transporter.sendMail({
      from: '"FlowDesk"<no-reply@FlowDesk.com>',
      to: options.email,
      subject: options.subject,
      text: emailTextual,
      html: emailHTML,
    });

    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

// Email content generators
const EmailVerificationMailGenContent = function (username, verificationUrl) {
  return {
    body: {
      name: `${username}`,
      intro: "Welcome to FlowDesk! We're very excited to have you on board.",
      action: {
        instructions: "To get started with FlowDesk, please click here:",
        button: {
          color: "#22BC66",
          text: "Confirm your account",
          link: `${verificationUrl}`,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

const generateResetPasswordEmail = function (username, verificationUrl) {
  return {
    body: {
      name: `${username}`,
      intro:
        "You have received this email because a password reset request for your account was received.",
      action: {
        instructions: "Click the button below to reset your password:",
        button: {
          color: "#DC4D2F",
          text: "Reset your password",
          link: `${verificationUrl}`,
        },
      },
      outro:
        "If you did not request a password reset, no further action is required on your part.",
    },
  };
};

module.exports = {
  EmailVerificationMailGenContent,
  generateResetPasswordEmail,
  sendEmail,
};
