import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

const adminSchema = new mongoose.Schema({
    email:{
        type:String,        
    },
    password:{
        type:String
    },
    lastLogin:{
        type:Date
    }
})





adminSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password)//comparison of hashedPass and pass we get on login time from user
    //return true or false
  }
  
  adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
  
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  });

const Admin = mongoose.model('Admin',adminSchema)

export {Admin}