import express from 'express';
import {
  deleteUser,
  getUser,
  getUsers,
  signout,
  checkSession,
  updateUser,
  verifyUser,
} from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/checkSession', verifyToken, checkSession);
router.put('/update/:userId', verifyToken, updateUser);
router.delete('/delete/:userId', verifyToken, deleteUser);
router.post('/signout', signout);
router.get('/getusers', verifyToken, getUsers);
router.get('/:userId', getUser);
router.post('/verify', verifyUser);

export default router;
