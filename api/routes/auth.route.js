import express from 'express';
import { google, signin, signup, resetPassword } from '../controllers/auth.controller.js';

const router = express.Router();


router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google', google);
router.post('/reset-password', resetPassword);

export default router;