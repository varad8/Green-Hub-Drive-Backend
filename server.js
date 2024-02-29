const express = require("express");
const app = express();

// Import routers
const userRouter = require("./router/userRouter");
const adminRouter = require("./router/adminRouter");
const superadminRouter = require("./router/superadminRouter");

// Use routers
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/superadmin", superadminRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
