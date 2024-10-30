import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/generateToken.js";
import { Admin } from "../../models/admin.model.js";
import User from "../../models/user.model.js";


export const handleAdminCreate = async(req,res) => {
  const {email,password} = req.body

  if(!email || !password){
    return res.status(400).json({
      success:false,
      message:"email or password not found"
    })
  }

      const admin = await new Admin({
        email,
        password
      }).save()

      res.status(201).json({
        success:true,
        message:"Admin created successFully",
        admin,
      })


}

export const handleAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("inside admin login");
    console.log(email, password);

    const admin = await Admin.findOne({ email });

    console.log("admin", admin);

    if (!admin && !(await admin.matchPassword(password))) {
      return res.status(400).json({
        success:false,
        message:"Inavlid credentials"
      })
    }
    




    if (!admin) {
      return res
        .status(404)
        .json({ status: "false", message: "Admin not found" });
    }


      await Admin.findByIdAndUpdate(admin._id, { lastLogin: Date.now() });

      // Generate access token
      const accessToken = generateAccessToken(admin._id, "admin");

      // Generate a new refresh token
      const adminRefreshToken = generateRefreshToken(admin._id, "admin");

      // Set the refresh token in a secure cookie
      res.cookie("refreshToken", adminRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      const data = {
        _id: admin._id,
        username: admin.firstName,
        email: admin.email,
        role: "admin",
        accessToken,
      };

      return res
        .status(200)
        .json({ message: "Admin logged in successfully", data });

   
  } catch (error) {
    // Handle errors gracefully without throwing another error
    return res.status(500).json({ message: "Failed to login as admin " });
  }
};

export const logout = async (req, res) => {
  req.clearCookie("refreshToken");
  return res.status(200).json({ message: "admin Logged out successfully" });
};


export const getAllUsers = async(req,res) => {
  try {

    const users  = await User.find({}).select("-password")

    return res.status(200).json({users, message:"fetched users successfully"})
    
  } catch (error) {
    res.status(500).json({message:"Error while getting all users"})
  }
}
