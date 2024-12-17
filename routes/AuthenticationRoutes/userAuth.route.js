import express from 'express'
import { getUser, googleAuth, handleForgotPassword, handleForgotResendOtp, handleLogout, handleMakeAccessToken, handleResendOtp, handleUserLogin, handleUserNewPassword, handleUserSignup, handleVerifyOtp, handleVerifySignup } from '../../controllers/User/userAuth.controller.js'
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



router.post("/forgotPassword",handleForgotPassword)
router.post('/forgotOtp',handleVerifyOtp)
router.post("/passwordChange",handleUserNewPassword)
router.post("/resendForgotOtp",handleForgotResendOtp)







export default router