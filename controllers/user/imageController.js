const multer = require("multer");
const path = require("path");

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  },
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("image");

// Check file type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check MIME type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images only!");
  }
}

// Upload image
const uploadImage = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err });
    } else {
      if (req.file === undefined) {
        res.status(400).json({ error: "No file selected" });
      } else {
        const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
          req.file.filename
        }`;
        res.status(200).json({ imageUrl });
      }
    }
  });
};

module.exports = { uploadImage };
