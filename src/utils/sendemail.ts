import Nodemailer from "nodemailer";
export async function sendEmail(to: string, subject: string, html: string) {
  try {
  
    const transporter = Nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, 
    auth: {
      user: 'shawna.schumm@ethereal.email', 
      pass: '4CvGZumtGjHZhvyXwb', 
    },
  });

    const sender = {
      name: process.env.MAIL_FROM_NAME || "CryptoPilot",
      address: process.env.MAIL_FROM_EMAIL || "hello@demomailtrap.co",
    };
    const recipients = [to];
    const mailOptions = {
      from: sender,
      to: recipients,
      subject: subject,
      html:html,
      text: html
    };

    const info = await transporter.sendMail(mailOptions);

  } catch (err) {
    console.log(err)
    throw new Error("Could not send email");
  }
}

