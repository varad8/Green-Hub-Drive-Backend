const {
  express,
  bcrypt,
  uuidv4,
  hashPassword,
  generateUniqueEvid,
  pool,
  path,
  checkUserExistence,
  checkEvAdminExistence,
  multer,
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

// EV User Registration

//Owner Registration
const adminRegister = async (req, res) => {
  const { email, password } = req.body;

  // Check if email or password is empty
  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }
  if (!password) {
    return res.status(400).json({ error: "Password required" });
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
    const emailExistsQuery = "SELECT * FROM ev_registration WHERE email = ?";
    pool.query(emailExistsQuery, [email], async (error, results) => {
      if (error) {
        console.error("Error checking email existence:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (results.length > 0) {
        return res.status(409).json({ error: "Email is already registered" });
      }

      // Generate unique evid (EV ID)
      const evid = await generateUniqueEvid();

      // If email is not already registered and password is valid, proceed with user registration
      const userid = uuidv4();
      const hashedPassword = await hashPassword(password);
      const insertUserQuery =
        "INSERT INTO ev_registration (email, password, userid) VALUES (?, ?, ?)";
      const insertProfileQuery =
        "INSERT INTO ev_profile (evid, userid, accountType, accountStatus, profile) VALUES (?, ?, ?, ?, ?)";

      // Construct the account status data JSON object
      const accountStatus = {
        approvedBy: "",
        updatedAt: "",
        adminID: "",
        status: "NOT ACTIVE",
        remark: "not approved",
      };

      // Construct the profile data JSON object
      const profileData = {
        firstname: "",
        lastName: "",
        dob: "",
        mobile: "",
        email: email,
        profilepic: "",
        dateofjoining: new Date(),
      };

      // Insert EV admin registration
      pool.query(
        insertUserQuery,
        [email, hashedPassword, userid],
        (error, results) => {
          if (error) {
            console.error("Error registering EV admin:", error);
            return res.status(500).json({ error: "Internal server error" });
          }

          // Insert EV admin profile with generated evid, userid, accountType, accountStatus, and profile data
          pool.query(
            insertProfileQuery,
            [
              evid,
              userid,
              "EV Admin",
              JSON.stringify(accountStatus),
              JSON.stringify(profileData),
            ],
            (error, results) => {
              if (error) {
                console.error("Error creating EV admin profile:", error);
                return res.status(500).json({ error: "Internal server error" });
              }
              res
                .status(201)
                .json({ message: "EV admin registered successfully", userid });
            }
          );
        }
      );
    });
  } catch (error) {
    console.error("Error registering EV admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Owner Login
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  // Check if email or password is empty
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const query = "SELECT * FROM ev_registration WHERE email = ?";
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
      const profileQuery = "SELECT * FROM ev_profile WHERE userid = ?";
      pool.query(profileQuery, [userId], (profileError, profileResults) => {
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return res.status(500).json({ error: "Internal server error" });
        }
        const userProfile = profileResults[0];

        // Parse JSON fields
        userProfile.location = JSON.parse(userProfile.location);
        userProfile.coordinates = JSON.parse(userProfile.coordinates);
        userProfile.evTimings = JSON.parse(userProfile.evTimings);
        userProfile.profile = JSON.parse(userProfile.profile);
        userProfile.accountStatus = JSON.parse(userProfile.accountStatus);

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

//Owner Update Profile
const updateAdminProfile = async (req, res) => {
  const { userid } = req.params;
  const { firstname, lastname, mobile, address } = req.body;

  // Validate request body
  if (!firstname || !lastname || !mobile || !address) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if the user exists
    const userExists = await checkEvAdminExistence(userid);
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Retrieve existing profile data
    const getProfileQuery = "SELECT profile FROM ev_profile WHERE userid = ?";
    pool.query(getProfileQuery, [userid], (error, results) => {
      if (error) {
        console.error("Error retrieving profile:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const existingProfile = JSON.parse(results[0].profile);

      // Construct the update query
      const updateQuery = `
        UPDATE ev_profile 
        SET 
          profile = ?,
          address = ?
        WHERE userid = ?
      `;

      // Construct the profile data with existing profilepic and dateofjoining
      const profile = {
        ...existingProfile,
        firstname,
        lastname,
        mobile,
      };
      const profileJson = JSON.stringify(profile);

      // Execute the update query
      pool.query(
        updateQuery,
        [profileJson, address, userid],
        (error, results) => {
          if (error) {
            console.error("Error updating profile:", error);
            return res.status(500).json({ error: "Internal server error" });
          }
          res.status(200).json({ message: "Profile updated successfully" });
        }
      );
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// const updateAdminProfile = async (req, res) => {
//   const { userid } = req.params;
//   const {
//     evTimings,
//     profile,
//     location,
//     title,
//     rate,
//     description,
//     coordinates,
//     imageUrl,
//   } = req.body;

//   try {
//     // Construct the update query
//     const updateQuery = `
//       UPDATE ev_profile
//       SET
//         evTimings = ?,
//         profile = ?,
//         location = ?,
//         title = ?,
//         rate = ?,
//         description = ?,
//         coordinates = ?,
//         imageUrl = ?
//       WHERE userid = ?
//     `;

//     // Execute the update query
//     pool.query(
//       updateQuery,
//       [
//         JSON.stringify(evTimings),
//         JSON.stringify(profile),
//         JSON.stringify(location),
//         title,
//         rate,
//         description,
//         JSON.stringify(coordinates),
//         imageUrl,
//         userid,
//       ],
//       (error, results, fields) => {
//         if (error) {
//           console.error("Error updating profile:", error);
//           return res.status(500).json({ error: "Internal server error" });
//         }
//         res.status(200).json({ message: "Profile updated successfully" });
//       }
//     );
//   } catch (error) {
//     console.error("Error updating profile:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// Get Owner Profile by userid
const getAdminProfile = async (req, res) => {
  const { userid } = req.params;

  try {
    // Construct the SELECT query
    const selectQuery = `
      SELECT * FROM ev_profile 
      WHERE userid = ?
    `;

    // Execute the SELECT query
    pool.query(selectQuery, [userid], (error, results, fields) => {
      if (error) {
        console.error("Error retrieving profile:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const profile = results[0]; // Assuming there's only one profile with the given userid

      // Parse JSON fields
      profile.evTimings = JSON.parse(profile.evTimings);
      profile.profile = JSON.parse(profile.profile);
      profile.location = JSON.parse(profile.location);
      profile.coordinates = JSON.parse(profile.coordinates);
      profile.accountStatus = JSON.parse(profile.accountStatus);

      res.status(200).json(profile);
    });
  } catch (error) {
    console.error("Error retrieving profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update owner profilepic-->  i.e. profile.profilepic json
const updateAdminProfilePic = async (req, res) => {
  try {
    // Check if userid and file are provided
    if (!req.params.userid) {
      return res.status(400).json({ error: "User ID is required" });
    }

    upload(req, res, (err) => {
      if (err) {
        console.error("Error uploading file:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "File is required" });
      }

      const fileName = req.file.filename;
      const userId = req.params.userid;

      // Check if the userid exists in the ev_registration table
      const userQuery = "SELECT * FROM ev_registration WHERE userid = ?";
      pool.query(userQuery, [userId], (error, results) => {
        if (error) {
          console.error("Error checking user:", error);
          return res.status(500).json({ error: "Internal server error" });
        }

        // Check if user exists
        if (!results || results.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        // Get the user's profile from the ev_profile table
        const profileQuery = "SELECT profile FROM ev_profile WHERE userid = ?";
        pool.query(profileQuery, [userId], (error, profileResults) => {
          if (error) {
            console.error("Error getting user profile:", error);
            return res.status(500).json({ error: "Internal server error" });
          }

          try {
            let profile = {};
            if (profileResults && profileResults.length > 0) {
              const storedProfile = profileResults[0].profile;
              if (storedProfile) {
                // Parse stored profile JSON
                profile = JSON.parse(storedProfile);

                // Check if there is an existing profile picture
                if (profile.profilepic) {
                  // Delete the existing profile picture
                  const existingProfilePicPath = path.join(
                    __dirname,
                    `../../uploads/${profile.profilepic}`
                  );
                  fs.unlink(existingProfilePicPath, (err) => {
                    if (err) {
                      console.error(
                        "Error deleting existing profile picture:",
                        err
                      );
                    }
                  });
                }
              }
            }

            // Update profilepic field in profile JSON object
            profile.profilepic = fileName;

            // Update profile JSON object in ev_profile table
            const updateProfileQuery =
              "UPDATE ev_profile SET profile = ? WHERE userid = ?";
            pool.query(
              updateProfileQuery,
              [JSON.stringify(profile), userId],
              (error, updateResults) => {
                if (error) {
                  console.error("Error updating profile:", error);
                  return res
                    .status(500)
                    .json({ error: "Internal server error" });
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
          } catch (parseError) {
            console.error("Error parsing stored profile:");
            return res.status(500).json({ error: "Internal server error" });
          }
        });
      });
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get owner profilepic
const getAdminProfilePic = async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, `../../uploads/${filename}`);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("Error retrieving file:");
      return res.status(404).json({ error: "File not found" });
    }

    // Send the file as a response
    res.sendFile(filePath);
  });
};

//Delete Owner profile pic
const deleteAdminProfilePic = async (req, res) => {
  const { userid, filename } = req.params;

  // Check if the user exists in the ev_registration table
  const userQuery = "SELECT * FROM ev_registration WHERE userid = ?";
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

        // Update profilepic field in profile JSON object
        const profileUpdateQuery =
          "UPDATE ev_profile SET profile = JSON_SET(profile, '$.profilepic', ?) WHERE userid = ?";
        pool.query(profileUpdateQuery, ["", userid], (error, updateResults) => {
          if (error) {
            console.error("Error updating profile:", error);
            return res.status(500).json({ error: "Internal server error" });
          }
          res.json({ message: "File deleted successfully", filename });
        });
      });
    });
  });
};

// Update ImageUrl --> Station Image
const updateImageUrl = async (req, res) => {
  try {
    // Check if userid and file are provided
    if (!req.params.userid) {
      return res.status(400).json({ error: "User ID is required" });
    }

    upload(req, res, (err) => {
      if (err) {
        console.error("Error uploading file:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "File is required" });
      }

      const fileName = req.file.filename;
      const userId = req.params.userid;

      // Check if the userid exists in the ev_registration table
      const userQuery = "SELECT * FROM ev_registration WHERE userid = ?";
      pool.query(userQuery, [userId], (error, results) => {
        if (error) {
          console.error("Error checking user:", error);
          return res.status(500).json({ error: "Internal server error" });
        }

        // Check if user exists
        if (!results || results.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        // Get the user's imageUrl from the ev_profile table
        const imageUrlQuery =
          "SELECT imageUrl FROM ev_profile WHERE userid = ?";
        pool.query(imageUrlQuery, [userId], (error, imageUrlResults) => {
          if (error) {
            console.error("Error getting user imageUrl:", error);
            return res.status(500).json({ error: "Internal server error" });
          }

          // Delete previous image if it exists
          const previousImageUrl = imageUrlResults[0].imageUrl;
          if (previousImageUrl) {
            fs.unlink(
              path.join(__dirname, `../../uploads/${previousImageUrl}`),
              (err) => {
                if (err) {
                  console.error("Error deleting previous image:", err);
                }
              }
            );
          }

          // Update imageUrl field in ev_profile table
          const updateImageUrlQuery =
            "UPDATE ev_profile SET imageUrl = ? WHERE userid = ?";
          pool.query(
            updateImageUrlQuery,
            [fileName, userId],
            (error, updateResults) => {
              if (error) {
                console.error("Error updating imageUrl:", error);
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
    console.error("Error uploading file for imageUrl:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get ImageUel --> station Image
const getImageUrl = async (req, res) => {
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

// Delete ImageUrl --> station Image
const deleteImageUrl = async (req, res) => {
  const { userid, filename } = req.params;

  // Check if the user exists in the ev_registration table
  const userQuery = "SELECT * FROM ev_registration WHERE userid = ?";
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
        console.error("Error deleting file:", err);
        return res.status(404).json({ error: "File not found" });
      }

      // Delete the file
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
          return res.status(500).json({ error: "Internal server error" });
        }

        // Update imageUrl field to empty string ("") in ev_profile table
        const updateImageUrlQuery =
          "UPDATE ev_profile SET imageUrl = '' WHERE userid = ?";
        pool.query(updateImageUrlQuery, [userid], (error, updateResults) => {
          if (error) {
            console.error("Error updating imageUrl:", error);
            return res.status(500).json({ error: "Internal server error" });
          }
          res.json({ message: "File deleted successfully", filename });
        });
      });
    });
  });
};

module.exports = {
  adminRegister,
  adminLogin,
  updateAdminProfile,
  getAdminProfile,
  updateAdminProfilePic,
  getAdminProfilePic,
  deleteAdminProfilePic,
  updateImageUrl,
  getImageUrl,
  deleteImageUrl,
};
