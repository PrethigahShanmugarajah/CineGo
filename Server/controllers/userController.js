import User from "../models/userModel.js";
import {
  birthRegex,
  emailIsValid,
  extractCleanPhone,
  mkToken,
} from "../utils/validators.js";
import bcrypt from "bcryptjs";

/* -------- User Register -------- */
export const registerUser = async (req, res) => {
  try {
    const { fullName, username, email, phone, birthDate, password } =
      req.body || {};

    if (!fullName || !username || !email || !phone || !birthDate || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    if (typeof fullName !== "string" || fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Full name must be at least 2 characters.",
      });
    }

    if (typeof username !== "string" || username.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Username must be at least 3 characters.",
      });
    }

    if (!emailIsValid(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Email is invalid." });
    }

    const cleanedPhone = extractCleanPhone(phone);
    if (cleanedPhone.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number seems invalid." });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    if (!birthRegex.test(birthDate)) {
      return res.status(400).json({
        success: false,
        message: "Birth date must be in YYYY-MM-DD format.",
      });
    }

    const parsedBirth = new Date(birthDate);
    if (Number.isNaN(parsedBirth.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Birth date is invalid." });
    }

    const existingByEmail = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingByEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists." });
    }

    const existingByUsername = await User.findOne({
      username: username.trim().toLowerCase(),
    });
    if (existingByUsername) {
      return res
        .status(400)
        .json({ success: false, message: "Username is already in use." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName: fullName.trim(),
      username: username.trim(),
      email: email.toLowerCase().trim(),
      phone: phone,
      birthDate: parsedBirth,
      password: hashedPassword,
    });

    const token = mkToken({ id: newUser._id });

    const userToReturn = {
      id: newUser._id,
      fullName: newUser.fullName,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      birthDate: newUser.birthDate,
    };

    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
      token,
      user: userToReturn,
    });
  } catch (error) {
    console.error("User Register Error:", error.message);

    if (error.code === 11000) {
      const dubKey = Object.keys(error.keyValue || {})[0];
      return res
        .status(400)
        .json({ success: false, message: `${dubKey} already exists.` });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to register user.",
      error: `User Register Error: ${error.message}`,
    });
  }
};

/* -------- User Login -------- */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    const token = mkToken({ id: user._id.toString() });
    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("User Login Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to login user.",
      error: `User Login Error: ${error.message}`,
    });
  }
};

/* -------- Get All Users -------- */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: users.length ? "Users fetched successfully." : "No users found.",
      length: users.length,
      items: users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
      error: `Get All Users Error: ${error.message}`,
    });
  }
};
