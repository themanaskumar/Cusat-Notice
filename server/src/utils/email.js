const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendVerificationEmail = async (email, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Verify Your Email - CUSAT Notice Board',
        html: `
            <h1>Welcome to CUSAT Notice Board!</h1>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationUrl}">${verificationUrl}</a>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};

const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Email Verification OTP - CUSAT Notice Board',
        html: `
            <h1>Email Verification</h1>
            <p>Your OTP for email verification is: <strong>${otp}</strong></p>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this OTP, please ignore this email.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};

const sendFacultyVerificationEmail = async (email, facultyName) => {
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: process.env.ADMIN_EMAIL,
        subject: 'New Faculty Registration - CUSAT Notice Board',
        html: `
            <h1>New Faculty Registration</h1>
            <p>A new faculty member has registered:</p>
            <p>Name: ${facultyName}</p>
            <p>Email: ${email}</p>
            <p>Please verify their account in the admin dashboard.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = {
    sendVerificationEmail,
    sendOTP,
    sendFacultyVerificationEmail
}; 