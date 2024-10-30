import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

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
      enum: ['admin', 'customer'],
      default: 'customer',
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
  
 
   
  },{timestamps:true});



  userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password)//comparison of hashedPass and pass we get on login time from user
    //return true or false
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


  const User = mongoose.model('Users',userSchema)

  export default User;