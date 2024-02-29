// superadminRouter.js
const express = require("express");
const router = express.Router();

// Define routes for superadmin
router.get("/", (req, res) => {
  res.send("Superadmin Home Page");
});

router.get("/admin-management", (req, res) => {
  res.send("Superadmin Admin Management Page");
});

module.exports = router;
