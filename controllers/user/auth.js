const {
  express,
  bcrypt,
  uuidv4,
  pool,
  path,
  checkUserExistence,
  multer,
  hashPassword,
  fs,
} = require("./dependencies");

// Define multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination folder for file uploads
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: function (req, file, cb) {
    // Generate a timestamp
    const timestamp = Date.now();
    // Get the file extension
    const ext = path.extname(file.originalname);
    // Set the filename to be the timestamp, underscore, and file extension
    const filename = `${timestamp}_${file.originalname}`;
    cb(null, filename);
  },
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage }).single("file");

// User Registration
const userRegister = async (req, res) => {
  const { email, password } = req.body;

  // Check if email or password is empty
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  // Password validation
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{6,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 6 characters long and contain at least one uppercase letter, one number, and one special symbol",
    });
  }

  try {
    // Check if the email is already registered
    const emailExistsQuery = "SELECT * FROM user_registration WHERE email = ?";
    pool.query(emailExistsQuery, [email], async (error, results) => {
      if (error) {
        console.error("Error checking email existence:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (results.length > 0) {
        return res.status(409).json({ error: "Email is already registered" });
      }

      // If email is not already registered and password is valid, proceed with user registration
      const userid = uuidv4();
      const hashedPassword = await hashPassword(password);
      const insertUserQuery =
        "INSERT INTO user_registration (email, password, userid) VALUES (?, ?, ?)";
      const insertProfileQuery =
        "INSERT INTO user_profile (userid,email) VALUES (?,?)";

      // Insert user registration
      pool.query(
        insertUserQuery,
        [email, hashedPassword, userid],
        (error, results) => {
          if (error) {
            console.error("Error registering user:", error);
            return res.status(500).json({ error: "Internal server error" });
          }

          // Insert user profile with only userid and email
          pool.query(insertProfileQuery, [userid, email], (error, results) => {
            if (error) {
              console.error("Error creating user profile:", error);
              return res.status(500).json({ error: "Internal server error" });
            }
            res.status(201).json({
              message: "User registered successfully",
              userid,
            });
          });
        }
      );
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//User Login
const userLogin = async (req, res) => {
  const { email, password } = req.body;

  // Check if email or password is empty
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const query = "SELECT * FROM user_registration WHERE email = ?";
    pool.query(query, [email], async (error, results, fields) => {
      if (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid password" });
      }

      // User found, now fetch corresponding profile data
      const userId = user.userid;
      const profileQuery = "SELECT * FROM user_profile WHERE userid = ?";
      pool.query(profileQuery, [userId], (profileError, profileResults) => {
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          return res.status(500).json({ error: "Internal server error" });
        }
        const userProfile = profileResults[0];

        // Combine user and profile data and send as response
        res.json({
          message: "Login successful",
          profile: userProfile,
        });
      });
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get User Profile by userid from [user_profile]
const getUserProfileByUserId = async (req, res) => {
  const { userid } = req.params;
  if (!userid) {
    return res.status(400).json({ error: "Userid required" });
  }

  try {
    const query = "SELECT * FROM user_registration WHERE userid = ?";
    pool.query(query, [userid], async (error, results, fields) => {
      if (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = results[0];

      // User found, now fetch corresponding profile data
      const userId = user.userid;
      const profileQuery = "SELECT * FROM user_profile WHERE userid = ?";
      pool.query(profileQuery, [userId], (profileError, profileResults) => {
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          return res.status(500).json({ error: "Internal server error" });
        }
        const userProfile = profileResults[0];

        // Combine user and profile data and send as response
        res.json({
          profile: userProfile,
        });
      });
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update Profile [user_profile]
const updateUserProfile = async (req, res) => {
  const { userid } = req.params;
  const profileData = req.body;

  // Check if profileData is empty
  if (Object.keys(profileData).length === 0) {
    return res.status(400).json({ error: "Profile data cannot be empty" });
  }

  try {
    // Check if the user profile already exists
    const profileExistsQuery = "SELECT * FROM user_profile WHERE userid = ?";
    pool.query(profileExistsQuery, [userid], async (error, results, fields) => {
      if (error) {
        console.error("Error checking profile existence:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

      // If profile exists, update it
      if (results.length > 0) {
        const updateQuery = "UPDATE user_profile SET ? WHERE userid = ?";
        pool.query(
          updateQuery,
          [profileData, userid],
          (error, results, fields) => {
            if (error) {
              console.error("Error updating profile:", error);
              return res.status(500).json({ error: "Internal server error" });
            }
            res
              .status(200)
              .json({ message: "User profile updated successfully" });
          }
        );
      } else {
        // If profile does not exist, return error as profile should be created first
        return res.status(400).json({
          error: "User profile does not exist. Please create a profile first.",
        });
      }
    });
  } catch (error) {
    console.error("Error saving or updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update profile image and delete profile image
const uploadProfileImage = async (req, res) => {
  try {
    // Check if userid is provided
    if (!req.params.userid) {
      return res.status(400).json({ error: "User ID is required" });
    }

    upload(req, res, (err) => {
      if (err) {
        console.error("Error uploading file:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Check if a file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: "File is required" });
      }

      const fileName = req.file.filename;
      const userId = req.params.userid;

      // Check if the userid exists in the user_registration table
      const userQuery = "SELECT * FROM user_registration WHERE userid = ?";
      pool.query(userQuery, [userId], (error, results) => {
        if (error) {
          console.error("Error checking user:", error);
          return res.status(500).json({ error: "Internal server error" });
        }

        // Check if user exists
        if (!results || results.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        // Get the user's profile pic from the user_profile table
        const profilePicQuery =
          "SELECT profilepic FROM user_profile WHERE userid = ?";
        pool.query(profilePicQuery, [userId], (error, profileResults) => {
          if (error) {
            console.error("Error getting user profile:", error);
            return res.status(500).json({ error: "Internal server error" });
          }

          // Delete previous profile picture if it exists
          const previousProfilePic = profileResults[0].profilepic;
          if (previousProfilePic) {
            fs.unlink(
              path.join(__dirname, `../../uploads/${previousProfilePic}`),
              (err) => {
                if (err) {
                  console.error(
                    "Error deleting previous profile picture:",
                    err
                  );
                }
              }
            );
          }

          // Update profilepic field in user_profile table
          const updateProfilePicQuery =
            "UPDATE user_profile SET profilepic = ? WHERE userid = ?";
          pool.query(
            updateProfilePicQuery,
            [fileName, userId],
            (error, updateResults) => {
              if (error) {
                console.error("Error updating profile picture:", error);
                return res.status(500).json({ error: "Internal server error" });
              }

              // Construct the URL of the uploaded file
              const fileUrl = `${req.protocol}://${req.get(
                "host"
              )}/uploads/${fileName}`;

              // Send the response with the file URL
              res.json({
                message: "File uploaded successfully",
                fileName,
                fileUrl,
              });
            }
          );
        });
      });
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Get Profile image by filename
const getProfileImage = async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, `../../uploads/${filename}`);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("Error retrieving file:", err);
      return res.status(404).json({ error: "File not found" });
    }

    // Send the file as a response
    res.sendFile(filePath);
  });
};

//Delete profile image by filename and userid
const deleteProfileImage = async (req, res) => {
  const { userid, filename } = req.params;

  // Check if the user exists in the user_registration table
  const userQuery = "SELECT * FROM user_registration WHERE userid = ?";
  pool.query(userQuery, [userid], (error, results) => {
    if (error) {
      console.error("Error checking user:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (results.length === 0) {
      // If user does not exist, return an error
      return res.status(404).json({ error: "User not found" });
    }

    // If user exists, proceed to delete the image
    const filePath = path.join(__dirname, `../../uploads/${filename}`);

    // Check if the file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error("Error deleting file:");
        return res.status(404).json({ error: "File not found" });
      }

      // Delete the file
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
          return res.status(500).json({ error: "Internal server error" });
        }

        // Update profilepic field to empty string ("") in user_profile table
        const updateProfilePicQuery =
          "UPDATE user_profile SET profilepic = '' WHERE userid = ?";
        pool.query(updateProfilePicQuery, [userid], (error, updateResults) => {
          if (error) {
            console.error("Error updating profile picture:", error);
            return res.status(500).json({ error: "Internal server error" });
          }
          res.json({ message: "File deleted successfully", filename });
        });
      });
    });
  });
};

module.exports = {
  userRegister,
  userLogin,
  updateUserProfile,
  uploadProfileImage,
  getProfileImage,
  deleteProfileImage,
  getUserProfileByUserId,
};
