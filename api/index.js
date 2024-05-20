import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import postRoutes from './routes/post.route.js';
import commentRoutes from './routes/comment.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import User from './models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from './utils/error.js';

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

app.post("/api/verify", async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  const { recoveryCode, email } = req.body;

  if (
    !recoveryCode ||
    !email ||
    recoveryCode === '' ||
    email === ''
  ) {
    return next(errorHandler(400, 'All fields are required.'));
  }

  if (!user) {
    //res.status(400).json({ error: "Invalid email address." });
    return next(errorHandler(400, 'Invalid email address'));
  }

  if(req.body.recoveryCode == user.recoveryCode){
    //res.json({error: 'Verification Succeed'});
    //next(errorHandler(200, ''));
    return res.json({
      message: 'Verification Successful',
      success: true,
      statusCode: 200,
    });
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

app.post("/api/posted-by", async function (req, res, next) {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    
    if (!user) {
      //res.status(400).json({ error: "Invalid email address." });
      next(errorHandler(400, '[Deleted User]'));
    }

    return res.json({
      username: user.username,
      profilePicture: user.profilePicture,
      success: true,
      statusCode: 200,
    });    
    //res.status(200).json({ message: "Password reset successful." });
    //next(errorHandler(200, 'Password reset successful'));
  } catch (error) {
    console.error(error);
    //res.status(500).json({ error: "An error occurred while resetting password." });
    next(errorHandler(500, '[Some Error Occured]'));
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
