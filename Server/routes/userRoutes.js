// CineGo / Server / routes / userRoutes.js
import express from "express";
import { loginUser, registerUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/user-register", registerUser);
userRouter.post("/user-login", loginUser);

export default userRouter;
