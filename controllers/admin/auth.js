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
  moment,
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
  const { email, password, confirmpassword } = req.body;

  // Check if email or password is empty
  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }
  if (!password) {
    return res.status(400).json({ error: "Password required" });
  }

  if (!confirmpassword) {
    return res.status(400).json({ error: "Confirm Password required" });
  }

  // Password validation
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{6,}$/;
  if (!passwordRegex.test(password) || !passwordRegex.test(confirmpassword)) {
    return res.status(400).json({
      error:
        "Password must be at least 6 characters long and contain at least one uppercase letter, one number, and one special symbol",
    });
  }

  if (password !== confirmpassword) {
    return res.status(400).json({
      error: "Password and Confirm Password does not march",
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

  console.log("Im Call");

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
  const { firstname, lastname, mobile, address, dob } = req.body;

  console.log("Im Call");

  // Validate request body
  if (!firstname || !lastname || !mobile || !address || !dob) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Validate mobile number format
  const mobileRegex = /^\d{10}$/;
  if (!mobileRegex.test(mobile)) {
    return res.status(400).json({ error: "Mobile number must be 10 digits" });
  }

  // Validate date of birth format (yyyy-mm-dd)
  if (!moment(dob, "YYYY-MM-DD", true).isValid()) {
    return res
      .status(400)
      .json({ error: "Invalid date of birth format. Please use yyyy-mm-dd" });
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
        dob,
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
  const userid = req.params.userid;

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      // If an error occurs, send an error response
      return res
        .status(500)
        .json({ error: "Error connecting to the database" });
    }

    // Perform the query to retrieve EV station by userid
    connection.query(
      "SELECT * FROM ev_profile WHERE userid = ?",
      [userid],
      (error, results) => {
        // Release the connection back to the pool
        connection.release();

        if (error) {
          // If an error occurs, send an error response
          return res.status(500).json({ error: "Error querying the database" });
        }

        // Check if station with the given userid exists
        if (results.length === 0) {
          return res.status(404).json({ error: "EV station not found" });
        }

        // Parse the JSON strings into JSON objects
        const evStation = results.map((station) => {
          // Parse evTimings
          const evTimings = JSON.parse(station.evTimings);
          for (const day in evTimings) {
            // Check if openingTime and closingTime are strings
            if (typeof evTimings[day].openingTime === "string") {
              // Convert string to object
              evTimings[day].openingTime = parseTimeString(
                evTimings[day].openingTime
              );
            }
            if (typeof evTimings[day].closingTime === "string") {
              // Convert string to object
              evTimings[day].closingTime = parseTimeString(
                evTimings[day].closingTime
              );
            }
          }

          return {
            evid: station.evid,
            accountType: station.accountType,
            evTimings: evTimings,
            title: station.title,
            address: station.address,
            coordinates: JSON.parse(station.coordinates),
            location: JSON.parse(station.location),
            updatedAt: station.updatedAt,
            profile: JSON.parse(station.profile),
            accountStatus: JSON.parse(station.accountStatus),
            imageUrl: station.imageUrl,
            description: station.description,
            id: station.id,
            rate: station.rate,
            userid: station.userid,
          };
        });

        // Send the response with the retrieved and formatted EV station
        res.status(200).json(evStation);
      }
    );
  });
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

//Get Ev Details [rate,title,description,state,city,coordinates,evTimings]
const updateStationDetails = async (req, res) => {
  const userid = req.params.userid;
  const { rate, title, description, coordinates, evTimings, location } =
    req.body;

  if (
    !rate ||
    !title ||
    !description ||
    !coordinates ||
    !evTimings ||
    !location ||
    !userid
  ) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    // Execute the SQL update query
    await pool.query(
      "UPDATE ev_profile SET rate = ?, title = ?, description = ?, coordinates = ?, evTimings = ? WHERE userid = ?",
      [
        rate,
        title,
        description,
        JSON.stringify(coordinates),
        JSON.stringify(evTimings),
        userid,
      ]
    );

    res.status(200).json({ message: "Station details updated successfully" });
  } catch (error) {
    console.error("Error updating station details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to parse time strings into objects
function parseTimeString(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return { hours, minutes };
}

module.exports = {
  updateStationDetails,
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
