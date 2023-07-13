const nodemailer = require('nodemailer');
require("dotenv/config")

const sendMail = (status) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'baraiparth97@gmail.com',
            pass: process.env.Passkey
        }
    });

    const mailOptions = {
        from: 'baraiparth97@gmail.com',
        to: 'parthnbarai1234@gmail.com',
        subject: 'Status and Information on Your Submitted Code',
        text: `Hello Coder, Your code has ${status} and feedback has been provided. Please review the suggestions. Contact us with any questions. \nThank you.
        
Best regards,
Parth Barai`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            // do something useful
        }
    });
}

module.exports = sendMail;