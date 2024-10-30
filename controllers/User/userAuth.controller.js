import dotenv from "dotenv";
dotenv.config();
import asyncHandler from "express-async-handler";
import User from "../../models/user.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/generateToken.js";
import crypto from "crypto";
import { transporter } from "../../utils/generateMail.js";
import TempUser from "../../models/TemporaryUser.model.js";
import jwt from "jsonwebtoken";
import firebaseApp from "../../config/firebase.js";
import { Admin } from "../../models/admin.model.js";

export const handleVerifySignup = asyncHandler(async (req, res, next) => {
  // This api is called after user typed the otp and enter it

  const { otp } = req.body;

  const user = await TempUser.findOne({ otp });

  if (!user) {
    return res.status(404).json({ success: false, message: "OTP is invalid" });
  }

  if (Date.now() > user.otpExpiry) {
    return res.status(400).json({ success: false, message: "Otp is expired" });
  }

  const { firstName, lastName, email, phone, password } = user;

  try {
    const RegisteredUser = await new User({
      firstName,
      lastName,
      email,
      phone,
      password,
    }).save();

    const data = {
      firstName: RegisteredUser.firstName,
      lastName: RegisteredUser.lastName,
      email: RegisteredUser.email,
    };

    res
      .status(201)
      .json({ success: true, message: "user created successfully", data });
  } catch (error) {
    console.log(error, "ERROR IN USER VERIFY SIGNUP");
    next(error);
  }
});

export const handleUserSignup = asyncHandler(async (req, res, next) => {
  //This api is called on when user click signup button
  const { firstName, lastName, email, password, phone } = req.body;

  // Basic manual validation
  if (!firstName || !lastName || !email || !password || !phone) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Validate password strength (min 6 characters)
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }

  // Validate phone number (basic numeric check)
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ message: "Invalid phone number" });
  }

  try {
    const user = await User.findOne({ email });

    if (user) {
      return res.status(409).json({
        success: false,
        message: "user already exist",
      });
    }

    //generate otp
    const otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
    const otpExpiry = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes

    const TemporaryUser = await new TempUser({
      firstName,
      lastName,
      email,
      password,
      phone,
      otp,
      otpExpiry,
    }).save();

    const mailOptions = {
      from: process.env.EMAIL_APP,
      to: TemporaryUser.email,
      subject: "Leaf and Loom OTP",
      text: `Hello ${firstName},your otp for signup on Leaf and Loom is ${otp}. This otp is valid for 15 minutes `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email address",
      email,
    });
  } catch (error) {
    console.log(error, "ERROR IN USER SIGNUP");
    next(error);
  }
});

export const handleUserLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  console.log(user);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "user is not registered",
    });
  }

  if (!user.isActive) {
    return res.status(409).json({ success: false, message: "user is blocked" });
  }

  if (!user && !(await user.matchPassword(password))) {
    return res.status(400).json({
      success: false,
      message: "Inavlid credentials",
    });
  }

  const accessToken = generateAccessToken(user._id, "user");
  const refreshToken = generateRefreshToken(user._id, "user");

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  res.status(200).json({
    _id: user._id,
    username: user.firstName,
    email: user.email,
    accessToken,
    role: "user",
    message: "user  sucessfully logined",
  });
});

//handling resent otp
export const handleResendOtp = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    console.log(email);

    // Check if the email is provided
    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required to resend OTP." });
    }

    // Find the user by email
    const user = await TempUser.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist." });
    }

    //generate otp
    const otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
    const otpExpiry = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes

    // Update the user's OTP and expiry time in the database
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_APP,
      to: user.email,
      subject: "Leaf and Loom  Resend  OTP",
      text: `Hello ${user.firstName},your otp for signup on Leaf and Loom is ${otp}. This otp is valid for 15 minutes `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP has been resent successfully." });
  } catch (error) {
    console.error("Error in resendOtpController:", error);
    return res
      .status(500)
      .json({
        message: "An error occurred while resending the OTP. Please try again.",
      });
  }
});

export const handleMakeAccessToken = asyncHandler(async (req, res) => {
  try {
    console.log(req.cookies);
    // Get the refresh token from the HTTP-only cookie
    const refreshTokenFromCookie = req.cookies.refreshToken;

    console.log("refreshToken", refreshTokenFromCookie);

    // Check if the refresh token exists
    if (!refreshTokenFromCookie) {
      return res.status(401).json({ message: "Refresh token not provided." });
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshTokenFromCookie,process.env.JWT_SECRET_REFRESH);

    console.log(decoded);
    // Find user or admin based on the decoded token role
    let user;
    if (decoded.role === "user") {
      user = await User.findById(decoded.userId).select("-password");
    } else if (decoded.role === "admin") {
      user = await Admin.findById(decoded.userId).select("-password");
    }

    console.log(user);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const newAccessToken = generateAccessToken(user._id,decoded.role);

    return res.status(200).json({ accessToken: newAccessToken, username:user.email ,role:decoded.role,user});
  } catch (error) {
    console.error("Error verifying refresh token:", error);
    return res.status(401).json({ message: "Refresh token is invalid." });
  }
});

export const googleAuth = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;

  console.log(idToken, "Id token");

  if (!idToken || typeof idToken !== "string") {
    return res.status(400).json({ message: "invalid id token" });
  }
  const decodedToken = await firebaseApp.auth().verifyIdToken(idToken);

  const name = decodedToken.name;
  const uid = decodedToken.uid;
  const email = decodedToken.email;

  console.log("inside google auth controller");
  console.log(uid, email, name);

  //finding the user
  let user = await User.findOne({ email });

  console.log(user);

  let updatedUser = null;
  let newUser = null;
  if (user) {
    console.log(user);
    updatedUser = await User.findOneAndUpdate(
      { email },
      { firstName: name, email, firebaseUid: uid }
    );
  } else {
    console.log("flsjd");
    console.log(name, email, uid);
    try {
      newUser = await User.create({
        firstName: name,
        email,
        firebaseUid: uid,
      });
      console.log(newUser);
    } catch (error) {
      console.log(error);
    }
    console.log(newUser);
  }

  console.log(newUser, "new user");
  if (updatedUser || newUser) {
    const user = updatedUser || newUser;
    const id = user._id.toString(user._id);

    console.log(id, "id of new user or updating user");

    if (!user) {
      //handling case where neither user is available
      return res.status(404).json({ message: "User not found" });
    }

    //generate refreshToken
    const userRefreshToken = await generateRefreshToken(id);
    //generate accessToken
    res.cookie("refreshToken", userRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    const accessToken = generateAccessToken(id);
    return res.status(201).json({
      message: "user created successfully",
      _id: user._id,
      name: user.firstName,
      email: user.email,
      role: user.role,
      accessToken,
    });
  }

  const error = new Error("Please Retry Login");
  error.statusCode = 400;
  return next(error);
});

export const handleLogout = asyncHandler(async (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (token) {
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "logout successfully" });
  } else {
    const error = new Error("No refreshToken found");
    error.status = 400;
    next(error);
  }
});

export const getUser = async (req, res) => {
  console.log("user", req.user);
  let mainUser = await User.find(req.user._id);

  if (mainUser) {
    return res.status(200).json(mainUser);
  } else {
    return res.status(400).json({ message: "something went wrong" });
  }
};

//NExt- week

// export const handleSendOtp = asyncHandler(async (req,res) => {
//   //user will enter email and onclick we send api with data - email
//   const {email} = req.body

//   //check if user exist!
//   const user = await User.findOne({email})

//   if(!user){
//     return res.status(404).json({success:false,  message:"user not found"})
//   }

//   //generate otp
//   const otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP

//   //put the otp in userDocument - with this we have to verify that the user entered is same as userotp
//   user.otp = otp
//   user.otpExpiry = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes

//   await user.save()

//   const mailOptions = {
//     from:process.env.EMAIL_APP,
//     to:user.email,
//     subject:'Leaf and Loom OTP',
//     text:`Hello ${user.firstName},your otp for signup on Leaf and Loom is ${otp}. This otp is valid for 15 minutes `
//   };

// try {

//   await transporter.sendMail(mailOptions);
//     res.status(200).json({success:true, message: 'OTP sent to your email address' });

// } catch (error) {
//   console.log('error in sendimg mail')
//   res.status(500).json({ message: 'Error sending OTP, please try again later.' });

// }

// })

// export const handleVerifyOtp = asyncHandler(async (req, res ) => {
//   try {
//       // Extracting OTP from the request body
//       const { otp } = req.body;

//       // Find the user by OTP
//       const user = await User.findOne({ otp });

//       // If the user with the provided OTP doesn't exist, return a 404 error
//       if (!user) {
//           return res.status(404).json({ message: 'Invalid OTP or expired' });
//       }

//       // Check if the OTP is expired
//       if (Date.now() > user.otpExpiry) {
//           return res.status(400).json({ message: 'OTP expired' }); // Return directly if OTP is expired
//       }

//       // Clear the OTP and expiration fields in the user model
//       user.otp = null;
//       user.otpExpiry = null;

//       // Save the updated user data to the database
//       await user.save();

//       // // Store the email in the session
//       // req.session.email = user.email;

//       // Respond with success once OTP is verified
//       return res.status(200).json({ success: true, message: 'OTP verified successfully!' });
//   } catch (error) {
//     console.log("Error in verify otp")
//     error.statusCode = 400; // Set the status code
//     throw error; // Throw the error
//   }
// });

// export const handleUserResetPassword = asyncHandler(async () => {

//   const {newPassword} = req.body
//   const email = req.session.email

//   if (!email) {
//     return res.status(400).json({ message: 'Session expired. Please request a new OTP.' });
//   }

//   const user = await User.findOne({email})

//   if (!user) {
//     return res.status(404).json({ message: 'User not found.' });
//   }

//   user.password = await bcrypt.hash(newPassword, 10);//i have to manually handle this , schema methods doesnot handle this

//   await user.save()

//       // Clear the session data for security
//       req.session.email = null; // Clear the stored email

//       res.status(200).json({ message: 'Password reset successfully!' });

// });