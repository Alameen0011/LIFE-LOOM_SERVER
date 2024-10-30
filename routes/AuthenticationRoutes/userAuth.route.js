import express from 'express'
import { getUser, googleAuth, handleLogout, handleMakeAccessToken, handleResendOtp, handleUserLogin, handleUserSignup, handleVerifySignup } from '../../controllers/User/userAuth.controller.js'
import { loginValidationRules,validate } from '../../middlewares/validationMiddleware.js'

const router = express.Router()

console.log("Inside userAuth Route")
router.post('/signup',handleUserSignup)
router.post('/verify-signup',handleVerifySignup)
router.post('/login',loginValidationRules(),validate,handleUserLogin)
router.post('/resend-otp',handleResendOtp)
router.post('/googleAuth', googleAuth)
router.get('/access',handleMakeAccessToken)
router.post('/logout',handleLogout)







// router.post('/reset-password',handleUserResetPassword)
// router.post('/send-otp',handleSendOtp)
// router.post('/verify-otp',handleVerifyOtp)
// router.post('/signup',signupValidationRules(),validate, handleUserSignup)



export default router