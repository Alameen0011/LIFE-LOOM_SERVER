import mongoose from "mongoose";
import bcrypt from 'bcryptjs'


const TempUserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
      },
      phone: {
        type: String,
        required: true,
        match: [/^\d{10,15}$/, 'Please provide a valid phone number'],
      },
      password: {
        type: String,
        required: true,
        minlength: 6,
      },
      otp:{
        type:String
  
      },
      otpExpiry:{
        type:Date,
      },
},{timestamps:true})

// Created a TTL index on the 'createdAt' field with a lifespan of 15 minutes
TempUserSchema.index({createdAt:1},{expireAfterSeconds:240})

const TempUser = mongoose.model('Tempuser',TempUserSchema)

export default TempUser