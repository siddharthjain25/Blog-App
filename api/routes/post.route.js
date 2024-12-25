import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { create, deletepost, getposts, updatepost, postedby, botPostCreate } from '../controllers/post.controller.js';

const router = express.Router();

router.post('/create', verifyToken, create)
router.post('/botcreate', botPostCreate)
router.get('/getposts', getposts)
router.delete('/deletepost/:postId/:userId', verifyToken, deletepost)
router.put('/updatepost/:postId/:userId', verifyToken, updatepost)
router.post('/posted-by', postedby)

export default router;