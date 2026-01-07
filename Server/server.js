// CineGo / Server / server.js
import express from "express";
import "dotenv/config";
import cors from "cors";

/* -------- INITIALIZE EXPRESS -------- */
const app = express();

/* -------- CONNECT TO DATABASE -------- */

/* -------- MIDDLEWARE CONFIGURATION -------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extend: true }));

/* -------- ROUTES -------- */
app.get("/", (req, res) => res.send("API is Working!"));

/* -------- PORT -------- */
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
