import express from 'express'
import { initiateSTKPush } from '../controller/initiatePayment.js';
import { accessToken } from '../middleware/generateAccessToken.js';
const router = express.Router()


router.post('/stkPush', accessToken, initiateSTKPush)

export default router