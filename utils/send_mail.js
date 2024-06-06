var nodemailer = require("nodemailer");
const fs = require("fs");

// const sendOtpCode = async (data) => {
//   console.log("data is email", data);
//   var transporter = nodemailer.createTransport({
//     host: process.env.MAIL_HOST, 
//     port: process.env.MAIL_PORT, 
//     auth: {
//       user: process.env.MAIL_FROM_ADDRESS,
//       pass: process.env.MAIL_PASSWORD,
//     },
//   });
//   var sendOtp = {
//     from: process.env.MAIL_FROM_ADDRESS,
//     to: data.emailAddress,
//     subject: "Level up",
//     html: `<!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1">
//       <title>OTP Email Template</title>
//       <link rel="preconnect" href="https://fonts.googleapis.com">
//         <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
//         <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;1,700&display=swap" rel="stylesheet">
//     </head>
//     <body style="margin: 0;font-family: 'Poppins', sans-serif;">
//       <div style="background: #000; border-radius: 20px; text-align: center; box-shadow: 0 6px 18px 0 rgba(0,0,0,.06);background-position: center; background-size: cover; max-width: 415px; margin: 0 auto; padding: 40px;">

//             <img src="${process.env.APP_LOGO}" alt="Logo Image" style="max-width: 50%;">

//         <div style="text-align: start; font-family: 'Urbanist', sans-serif;">
//           <h1 style="color: #D7D7D7; font-weight: 500; margin: 0; font-size: 17px;">Dear 
//             <span style="font-weight: 600">${data.name}</span>,
//           </h1>
//           <p style="font-size: 16px; line-height: 20px; color: #D7D7D7;">It seems you've requested to reset your password for Level Up. We're here to help you regain access to your account.</p>
//           <p style="font-size: 16px; line-height: 20px; color: #D7D7D7;">To complete the password reset process, please use the verification code below:</p>

//           <h2 style="margin-bottom: 40px;margin-top: 20px; font-size: 20px;font-weight: 500;line-height: 31px;color: #ffffff82; text-transform: uppercase; text-align:center;font-weight: 600; font-size: 20px; line-height: 34px; color: #ffffff82; border-radius: 5px; background-color: #f5a7bc33; padding: 15px; text-align: center;">Verification Code<br><span style="line-height: 50px;font-weight: 700;font-size: 54px;color: #EE5E86;">${data.otp}</span></h2>
//           <p style="font-size: 16px; line-height: 20px; color: #D7D7D7;">
//             Please enter this code on the password reset page within the next 24 hours to proceed with resetting your password. If you didn't initiate this request, please ignore this email or reach out to our support team immediately at <a href="#" style="text-decoration: none; font-weight:600; color:#fb7c9f;">${process.env.MAIL_FROM_ADDRESS}</a>
//           </p>
//           <p style="font-size: 16px; line-height: 20px; color: #D7D7D7;">
//             Remember to create a strong, unique password that you haven't used before to secure your account.
//           </p>
//           <p style="font-size: 16px; line-height: 20px; color: #D7D7D7;">
//             Thank you for using Level Up. If you have any questions or need further assistance, don't hesitate to contact us.
//           </p>
//           <h1 style="color: #D7D7D7; font-weight: 500; margin: 0; font-size: 17px; line-height: 25px;">Best regards, <br>
//             <span style="font-weight: 600">Level Up team</span>
//           </h1>
//         </div>

//       </div>

//     </body>
//     </html>`,
//   };
//   return await transporter.sendMail(sendOtp);
// };


const sendOtpCode = async (data) => {
  console.log("data is email", data);
  var transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_FROM_ADDRESS,
      pass: process.env.MAIL_PASSWORD,
    },
  });
  var sendOtp = {
    from: process.env.MAIL_FROM_ADDRESS,
    to: data.emailAddress,
    subject: "PURPUS",
    html: `<!DOCTYPE html>
    <html>
    
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title></title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;1,700&display=swap"
        rel="stylesheet">
    </head>
    
    <body style="margin: 0;font-family: 'Poppins', sans-serif;">
      <div
        style="background: #fff; max-width: 415px; margin: 0 auto; padding: 40px;background-size: cover; background-position: center;border: 4px solid rgba(255, 255, 255, 0.40); box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.12); border-radius: 20px;">
    
        <div style="text-align: center;">
          <img src="${process.env.APP_LOGO}" alt="Logo Image" style="max-width: 250px;">
        </div>
    
        <p style="font-size: 17px; font-weight: 600; color: #3E555B;">Dear ${data.name},</p>
    
        <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #1a1a1a;margin: 0 0 15px 0;">
          It seems you've requested to reset your password for Purpus. We're here to help you regain access to your
          account.
        </p>
    
        <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #1a1a1a;margin: 0 0 15px 0;">
          To complete the password reset process, please use the verification code below:
        </p>
    
        <h1 style="text-align: center; font-size: 15px; color: #9271ab; text-transform: uppercase; background-color: #8207e01f; padding: 15px; max-width: 220px;
          width: 100%; margin: auto; border-radius: 10px;">
          Verification Code<br>
          <span style="font-size: 35px; line-height: 50px; color: #8207E0;">${data.otp}</span>
        </h1>
    
        <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #1a1a1a;">
          Please enter this code on the password reset page within the next 24 hours to proceed with resetting your
          password. If you didn't initiate this request, please ignore this email or reach out to our support team
          immediately at
          <a href="#" style="text-decoration: none;font-weight: 600;color: #8207e0;">${process.env.MAIL_FROM_ADDRESS}</a>
        </p>
    
        <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #1a1a1a;margin: 0 0 15px 0;">
          Remember to create a strong, unique password that you haven't used before to secure your account.
        </p>
    
        <p style="font-weight: 400;font-size: 15px;line-height: 22px;color: #1a1a1a;margin: 0 0 15px 0;">
          Thank you for using Purpus. If you have any questions or need further assistance, don't hesitate to contact us.
        </p>
    
        <div style="margin-top: 30px;font-weight: 500;font-size: 15px;color: #000000;">
          Best regards,<br> Purpus
        </div>
    
      </div>
    </body>
    
    </html>`,
  };
  return await transporter.sendMail(sendOtp);
};
const sendleandingPagecontact = async (data) => {
  console.log("data is email", data);
  var transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_FROM_ADDRESS,
      pass: process.env.MAIL_PASSWORD,
    },
  });
  var sendOtp = {
    from: data.email,
    to: 'srgohil.weapplinse@gmail.com',
    subject: "Level up",
    html: `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>OTP Email Template</title>
    </head>
    <body style="margin: 50px; background-color: #000000;">
    
      <div style="background: #000; border-radius: 3px; text-align: center; box-shadow: 0 6px 18px 0 rgba(0,0,0,.06);background-position: center; background-size: cover; max-width: 570px; margin: 0 auto; padding: 50px;">
    
        <div style="text-align:center;"><img src='${process.env.APP_LOGO}' style="width: 250px;"></div>
        <div style="text-align: start; font-family: 'Urbanist', sans-serif;">
          <h1 style="color: #D7D7D7; font-weight: 500; margin: 0; font-size: 17px;">Dear Admin,
          </h1>
          <p style="font-size: 16px; line-height: 20px; color: #D7D7D7;">I hope this email finds you well.</p>
    
          <p style="font-size: 16px; line-height: 20px; color: #D7D7D7;">I wanted to reach out regarding user's recent inquiry. They have provided the following details:</p>
    
          <ul style="font-size: 16px; line-height: 20px; color: #D7D7D7;">
            <li style="padding-bottom: 10px;">Name: <span>${data.name}</span></li>
            <li style="padding-bottom: 10px;">Email: <span>${data.email}</span></li>
            <li>Message: <span>${data.message}</span></li>
          </ul>
    
          <p style="font-size: 16px; line-height: 20px; color: #D7D7D7;">Could you please assist them with their inquiry at your earliest convenience?</p>
          <p style="font-size: 16px; line-height: 20px; color: #D7D7D7;">Thank you for your attention to this matter.</p>
          <h1 style="color: #D7D7D7; font-weight: 500; margin: 0; font-size: 17px; line-height: 25px;">Best regards, <br>
            <span style="font-weight: 600">Level Up</span>
          </h1>
        </div>
    
      </div>
    
    </body>
    </html>`,
  };
  return await transporter.sendMail(sendOtp);
};

module.exports = { sendOtpCode, sendleandingPagecontact };