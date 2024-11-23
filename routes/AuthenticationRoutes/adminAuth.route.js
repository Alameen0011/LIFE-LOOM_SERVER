import express from "express";
import {
  getAllUsers,
  handleAdminCreate,
  handleAdminLogin,
  handleLogout,
} from "../../controllers/Admin/adminAuth.controller.js";
import { adminAuth } from "../../middlewares/authMiddleware.js";

const router = express.Router();

console.log("inside admin auth route");

router.post("/login", handleAdminLogin);

router.post("/createAdmin", handleAdminCreate);

router.use(adminAuth);
router.post("/logout", handleLogout);
router.get("/getUsers", getAllUsers);
// router.post('/logout',)

export default router;
