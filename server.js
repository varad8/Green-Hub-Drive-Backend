require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());

// Import routers
const userRouter = require("./router/userRouter");
const adminRouter = require("./router/adminRouter");
const superadminRouter = require("./router/superadminRouter");

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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port \x1b[34m${PORT}\x1b[0m`);
  console.log(`Click here: \x1b[34mhttp://localhost:${PORT}\x1b[0m`);
});
