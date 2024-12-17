import mongoose from "mongoose";
import bcrypt from 'bcryptjs';


function generateBrandedReferralCode(brand = 'LIFE', length = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let uniquePart = '';
  
  for (let i = 0; i < length; i++) {
      uniquePart += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return brand + uniquePart;
}

const userSchema = new mongoose.Schema({
    firstName: {
      type: String,
     
      trim: true,
    },
    lastName: {
      type: String,
    
      trim: true,
    },
    email: {
      type: String,
    
      unique: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
    },
    phone: {
      type: String,
    
      match: [/^\d{10,15}$/, 'Please provide a valid phone number'],
    },
    password: {
      type: String,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    otp:{
      type:String

    },
    otpExpiry:{
      type:Date,
    },
  
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    firebaseUid: {
       type: String,
       default: null 
      },
    refferalCode:{
      type:String,
      unique:true
    },
    seenRefferal:{
      type:Boolean,
      default:false
    }
  
 
   
  },{timestamps:true});



  userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password)

  }
  
  userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
  
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  });

  userSchema.pre('save', function (next) {
    if (this.isNew && !this.refferalCode) {
        this.refferalCode = generateBrandedReferralCode();
    }
    next();
});


  const User = mongoose.model('Users',userSchema)

  export default User;