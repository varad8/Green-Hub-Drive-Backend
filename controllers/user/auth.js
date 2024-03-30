const {
  express,
  bcrypt,
  uuidv4,
  pool,
  path,
  nodemailer,
  moment,
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
  const { email, password, confirmpassword } = req.body;

  // Check if email or password is empty
  if (!email || !password || !confirmpassword) {
    return res
      .status(400)
      .json({ error: "Email and password,confirmpassword are required" });
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
        "INSERT INTO user_profile (userid,email,accountType) VALUES (?,?,?)";

      // Insert user registration
      pool.query(
        insertUserQuery,
        [email, hashedPassword, userid],
        (error, results) => {
          if (error) {
            console.error("Error registering user:", error);
            return res.status(500).json({ error: "Internal server error" });
          }

          // Insert user profile with only userid and e mail
          pool.query(
            insertProfileQuery,
            [userid, email, "user"],
            (error, results) => {
              if (error) {
                console.error("Error creating user profile:", error);
                return res.status(500).json({ error: "Internal server error" });
              }
              res.status(201).json({
                message: "User registered successfully",
                userid,
              });
            }
          );
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
  const { firstname, lastname, mobile, dob, address, city, state, gender } =
    req.body;

  // Check if profileData is empty
  if (
    !firstname ||
    !lastname ||
    !mobile ||
    !dob ||
    !address ||
    !city ||
    !state ||
    !gender
  ) {
    return res.status(400).json({ error: "All profile fields are required" });
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

  const profileData = {
    firstname,
    lastname,
    mobile,
    dob,
    address,
    city,
    state,
    gender,
  };

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

//Get All Ev Stations [ev_profile]
const getAllEvStations = (req, res) => {
  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      // If an error occurs, send an error response
      return res
        .status(500)
        .json({ error: "Error connecting to the database" });
    }

    // Perform the query to retrieve all EV stations
    connection.query("SELECT * FROM ev_profile", (error, results) => {
      // Release the connection back to the pool
      connection.release();

      if (error) {
        // If an error occurs, send an error response
        return res.status(500).json({ error: "Error querying the database" });
      }

      // Parse the JSON strings into JSON objects
      const evStations = results.map((station) => {
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

      // Send the response with the retrieved and formatted EV stations
      res.json(evStations);
    });
  });
};

//Get Ev Station by userid
const getEvStationByUserid = async (req, res) => {
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
        res.json(evStation);
      }
    );
  });
};

// Function to parse time strings into objects
function parseTimeString(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return { hours, minutes };
}

module.exports = {
  getEvStationByUserid,
  userRegister,
  userLogin,
  updateUserProfile,
  uploadProfileImage,
  getProfileImage,
  deleteProfileImage,
  getUserProfileByUserId,
  getAllEvStations,
};
