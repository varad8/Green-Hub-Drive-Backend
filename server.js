require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());

// Import routers
const userRouter = require("./router/userRouter");
const adminRouter = require("./router/adminRouter");
const superadminRouter = require("./router/superadminRouter");
const { fs } = require("./controllers/user/dependencies");

app.use(
  cors({
    origin: "http://localhost:4200", // Only allow requests from http://example.com
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  })
);

// Use routers
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/superadmin", superadminRouter);

// Define the route to return JSON data
app.get("/api/cities", (req, res) => {
  // Read the JSON file
  fs.readFile("./city.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    // Parse the JSON data
    const cities = JSON.parse(data);
    // Return the JSON data
    res.json(cities);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port \x1b[34m${PORT}\x1b[0m`);
  console.log(`Click here: \x1b[34mhttp://localhost:${PORT}\x1b[0m`);
});
