import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

//middle ware for checking the user authenticaton
export const userAuth = (req, res,next) => {
  console.log("inside user authenticate");
  //checking the access token , decoding user, success case pass to controller else error

  let token;

  //lets assume axios will put token there!
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    //extract token from that we get unique userid which can refer to db to get user information
    token = req.headers.authorization.split(" ")[1];

    

    if (!token) {
      return res.status(401).json({ message: "unauthorized" });
    }

    jwt.verify(token, process.env.JWT_SECRET_ACCESS, async (err, decoded) => {
      console.log(decoded,"decoded thing from token")
      try {
        const user = await User.findOne({ _id: decoded?.id })
        console.log(user,"user in auth part")
        if (user?.isActive === false) {
            return res.status(401).json({ message: 'Account has been blocked' })
        }
    } catch (error) {
      next(error)
    }


      if (err) {
        console.log("inside token forbidden error")
        return res.status(403).json({ message: "Forbidden token expired" });
      } else if (decoded.role !== "user") {
        console.log("inside role error why ? error")
        return res.status(401).json({ message: "Unauthorized" });
      }

      req.id = decoded?.id;
      req.role = decoded?.role;
      next();
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "not authorized no token",
    });
  }
};

export const adminAuth = (req, res, next) => {
  const authHeader = req.headers.Authorization || req.headers.authorization;
  const adminToken = authHeader?.split(" ")[1];
  console.log(
    adminToken,
    "inside adminAuthorization & authentication block way"
  );
  if (!adminToken) {
    return res.status(401).json({ message: "Unauthorized " });
  }
  jwt.verify(adminToken, process.env.JWT_SECRET_ACCESS, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden token expired" });
    } else if (decoded.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log(decoded.id,"decoded id")
    console.log(decoded.role,"decoded role")
    req.id = decoded.id;
    req.role = decoded?.role;
    next();
  });
};
