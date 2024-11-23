import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/generateToken.js";
import { Admin } from "../../models/admin.model.js";
import User from "../../models/user.model.js";

export const handleAdminCreate = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email or password not found",
      });
    }

    const admin = await new Admin({
      email,
      password,
    }).save();

    res.status(201).json({
      success: true,
      message: "Admin created successFully",
      admin,
    });
  } catch (error) {
    console.log("error while creating admin", error);
    next(error);
  }
};

export const handleAdminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log(email, password);

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res
        .status(404)
        .json({
           success: false,
           message: "Admin not found"
           });
    }

    if (!admin && !(await admin.matchPassword(password))) {
      return res.status(400).json({
        success: false,
        message: "Inavlid credentials",
      });
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
    console.log("error while admin login");
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;

    console.log(page, limit, "page,limit");

    const skip = (page - 1) * limit;

    const totalUsersCount = await User.countDocuments(
      {},
      {
        password: false,
      }
    );

    console.log(totalUsersCount, "total users count");

    const totalPages = Math.ceil(totalUsersCount / limit);

    const users = await User.find({})
      .select("-password")
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      page,
      totalPages,
      users,
      message: "fetched users successfully",
    });
  } catch (error) {
    console.log("Error while getting all users");
    next(error);
  }
};

export const handleLogout = async (req, res, next) => {
  console.log(req.cookies);
  try {
    const token = req.cookies.refreshToken;

    console.log(token, "token ");

    if (token) {
      res.clearCookie("refreshToken");
      // localStorage.removeItem("auth")
    }
    res.status(200).json({
      success: true,
      message: "logout successfully",
    });
  } catch (error) {
    console.log(error, "error while logging out admin");
    next(error);
  }
};
