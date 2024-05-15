import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import postRoutes from './routes/post.route.js';
import commentRoutes from './routes/comment.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import nodemailer from 'nodemailer';
import otpGenerator from 'otp-generator';
import User from './models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from './utils/error.js';

const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });


dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log('MongoDb is connected');
  })
  .catch((err) => {
    console.log(err);
  });

const __dirname = path.resolve();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.listen(3000, () => {
  console.log('Server is running on port 3000!');
});

app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/post', postRoutes);
app.use('/api/comment', commentRoutes);

app.use(express.static(path.join(__dirname, '/client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.post("/api/email", async (req, res, next) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASSWORD,
    },
});

const mailConfigurations = {
    from: "Thousand Winters",
    to: req.body.email,
    subject: 'Email Verification',
    text: `Hi! There, your verification code is ${otp}`,
};

const info = await transporter.sendMail(mailConfigurations);

next(errorHandler(200, 'Email Sent Successfully'));
console.log('Email Sent Successfully');
//console.log(info);
});

app.post("/api/verify", async (req, res, next) => {
  if(req.body.otp == otp){
    //res.json({error: 'Verification Succeed'});
    next(errorHandler(200, 'Verification Succeed'));
  }
  else{
    //res.json({error: 'Verification Failed'});
    next(errorHandler(403, 'Verification Failed'));
  }
})

app.post("/api/reset-password", async function (req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      //res.status(400).json({ error: "Invalid email address." });
      next(errorHandler(400, 'Invalid email address'));
    }

    // Generate a secure password hash
    user.password = await bcryptjs.hash(req.body.password, 10); // Use bcrypt for hashing

    await user.save();

    //res.status(200).json({ message: "Password reset successful." });
    next(errorHandler(200, 'Password reset successful'));
  } catch (error) {
    console.error(error);
    //res.status(500).json({ error: "An error occurred while resetting password." });
    next(errorHandler(500, 'An error occurred while resetting password.'));
  }
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
