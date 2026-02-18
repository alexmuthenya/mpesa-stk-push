import express from 'express'
import { initiateSTKPush, stkPushCallback } from '../controller/initiatePayment.js';
import { accessToken } from '../middleware/generateAccessToken.js';
const router = express.Router()


router.post('/stkPush', accessToken, initiateSTKPush)
router.post('/stkPushCallback/:Order_ID', stkPushCallback)

export default router