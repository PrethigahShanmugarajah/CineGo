import jwt from "jsonwebtoken";

/* -------- Validate Email -------- */
export const emailIsValid = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""));

/* -------- Clean Phone Number -------- */
export const extractCleanPhone = (phone) =>
  String(phone || "").replace(/\D/g, "");

/* -------- Validate Birth Date (YYYY-MM-DD) -------- */
export const birthRegex = /^\d{4}-\d{2}-\d{2}$/;

/* -------- Generate JWT Token -------- */
export const mkToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
