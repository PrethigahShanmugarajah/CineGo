import express from "express";
import {
  getUsers,
  loginUser,
  registerUser,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/user-register", registerUser);
userRouter.post("/user-login", loginUser);
userRouter.get("/user-get", getUsers);

export default userRouter;
