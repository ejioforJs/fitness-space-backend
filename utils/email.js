const nodemailer = require("nodemailer");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Fitness Space <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport({
        host: process.env.BREVO_HOST,
        port: process.env.BREVO_PORT,
        secure: true,
        auth: {
          user: process.env.BREVO_EMAIL,
          pass: process.env.BREVO_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    try {
      const emailTemplate = this.generateEmailTemplate(template, subject);

      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html: emailTemplate,
        text: htmlToText.convert(emailTemplate),
      };

      await this.newTransport().sendMail(mailOptions);

      console.log(`Email sent successfully to ${this.to}`);
    } catch (error) {
      console.error(`Error sending email to ${this.to}: ${error.message}`);
    }
  }

  generateEmailTemplate(template, subject) {
    switch (template) {
      case "welcome":
        return `
          <html>
          <head>
            <title>${subject}</title>
          </head>
          <body>
            <h1>Hi, ${this.firstName}!</h1>
            <p>Welcome to Fitness Space, we are glad to be your partner on this amazing to journey to good health 🎉🙏 Click <a href="${this.url}">here</a> to verify your email.</p>
            
            <p>We're all a big family here, so feel free to express yourself in our online communities!</p>
           
            <p>If you need any help with payments or the next step from here, please don't hesitate to contact me!</p>
            
             <p>Precious, Kadiri | Head Coach</p>
          </body>
          </html>
        `;
      case "passwordReset":
        return `
          <html>
          <head>
            <title>${subject}</title>
          </head>
          <body>
            <h1>Hi ${this.firstName}</h1>
            <p>Forgot your password? Click on this link <a href="${this.url}">here</a> to reset your password.</p>
            <p>If you didn't forget your password, please ignore this email!</p>
          </body>
          </html>
        `;

      default:
        throw new Error("Invalid email template");
    }
  }

  async sendWelcomeEmail() {
    await this.send("welcome", "Welcome to the Fitness Space family!");
  }

  async sendPasswordResetEmail() {
    await this.send(
      "passwordReset",
      "Your password reset link (valid for only 10 minutes)"
    );
  }
};
