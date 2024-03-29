const {
  pool,
  checkUserExistence,
  checkEvAdminExistence,
  checkOrderExistence,
} = require("./dependencies");

const getAllRatingsByUserId = async (req, res) => {
  const userId = req.params.userid;

  if (!userId) {
    return res.status(400).json({ error: "Missing fields" });
  }
  pool.getConnection((err, connection) => {
    if (err) {
      // If an error occurs, send an error response
      return res
        .status(500)
        .json({ error: "Error connecting to the database" });
    }

    // Perform the query to retrieve ratings by user ID
    connection.query(
      "SELECT * FROM rating WHERE userId = ?",
      [userId],
      (error, results) => {
        // Release the connection back to the pool
        connection.release();

        if (error) {
          // If an error occurs, send an error response
          return res.status(500).json({ error: "Error querying the database" });
        }

        // Check if ratings for the given user ID exist
        if (results.length === 0) {
          return res
            .status(404)
            .json({ error: "No ratings found for the user ID" });
        }

        // Send the response with the retrieved ratings
        res.status(200).json({ ratings: results });
      }
    );
  });
};

const getRatingByOrderId = async (req, res) => {
  const orderId = req.params.orderid;

  if (!orderId) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      // If an error occurs, send an error response
      return res
        .status(500)
        .json({ error: "Error connecting to the database" });
    }

    // Perform the query to retrieve rating by order ID
    connection.query(
      "SELECT * FROM rating WHERE orderid = ?",
      [orderId],
      (error, results) => {
        // Release the connection back to the pool
        connection.release();

        if (error) {
          // If an error occurs, send an error response
          return res.status(500).json({ error: "Error querying the database" });
        }

        // Check if rating for the given order ID exists
        if (results.length === 0) {
          return res
            .status(404)
            .json({ error: "Rating not found for the order ID" });
        }

        // Send the response with the retrieved rating
        res.status(200).json({ rating: results[0] });
      }
    );
  });
};

const saveRating = async (req, res) => {
  try {
    // Extract rating data from the request body
    const { stationId, userId, rating, feedbackMsg, orderId } = req.body;

    // Validate input parameters
    if (!stationId || !userId || !rating || !orderId) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Check if the user exists
    const userExists = await checkUserExistence(userId);
    if (!userExists) {
      return res.status(400).json({ error: "User not found" });
    }

    // Check if the station exists
    const stationExists = await checkEvAdminExistence(stationId);
    if (!stationExists) {
      return res.status(400).json({ error: "Station not found" });
    }

    // Check if a rating with the given orderId already exists
    const orderExists = await checkOrderExistence(orderId);
    if (orderExists) {
      return res
        .status(400)
        .json({ error: "Rating already exists for the order ID" });
    }

    // Validate rating value
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Invalid rating value. Rating must be between 1 and 5",
      });
    }

    // Save the rating data to the database
    const query =
      "INSERT INTO Rating (stationId, userId, rating, feedbackMsg, orderId) VALUES (?, ?, ?, ?, ?)";
    await pool.query(query, [stationId, userId, rating, feedbackMsg, orderId]);

    // Send a success response
    return res.status(200).json({
      success: true,
      message: "Rating saved successfully",
    });
  } catch (error) {
    // Handle errors
    console.error("Error saving rating:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

const updateRating = async (req, res) => {
  const { ratingId, stationId, userId, rating, feedbackMsg, orderId } =
    req.body;

  console.log(req.body);

  if (
    !orderId ||
    !ratingId ||
    !stationId ||
    !userId ||
    !feedbackMsg ||
    !orderId
  ) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Validate rating value
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({
      error: "Invalid rating value. Rating must be between 1 and 5",
    });
  }

  pool.getConnection((err, connection) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error connecting to the database" });
    }

    connection.query(
      "SELECT * FROM rating WHERE orderId = ? AND ratingId = ?",
      [orderId, ratingId],
      (error, results) => {
        if (error) {
          connection.release();
          return res.status(500).json({ error: "Error querying the database" });
        }

        if (results.length === 0) {
          connection.release();
          return res.status(404).json({ error: "Rating not found" });
        }

        // Update the feedbackMsg and rating
        const updateQuery =
          "UPDATE rating SET feedbackMsg = ?, rating = ? WHERE orderId = ? AND ratingId = ?";
        connection.query(
          updateQuery,
          [feedbackMsg, rating, orderId, ratingId],
          (updateError) => {
            connection.release();
            if (updateError) {
              return res.status(500).json({ error: "Error updating rating" });
            }
            return res
              .status(200)
              .json({ success: true, message: "Rating updated successfully" });
          }
        );
      }
    );
  });
};

const getRatingsofStation = async (req, res) => {
  const stationid = req.params.stationid;

  if (!stationid) {
    return res.status(400).json({ error: "Missing fields" });
  }

  pool.getConnection((err, connection) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error connecting to the database" });
    }

    connection.query(
      "SELECT * FROM rating WHERE stationId = ?",
      [stationid],
      (error, results) => {
        connection.release();

        if (error) {
          return res.status(500).json({ error: "Error querying the database" });
        }

        if (results.length === 0) {
          return res
            .status(404)
            .json({ error: "No ratings found for the user ID" });
        }

        // Calculate average rating
        const totalRatings = results.length;
        const totalRatingValue = results.reduce(
          (acc, cur) => acc + cur.rating,
          0
        );
        const averageRating = totalRatingValue / totalRatings;

        // Send the response with the average rating
        res.status(200).json({ averageRating });
      }
    );
  });
};

const getAllRatings = async (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      // If an error occurs, send an error response
      return res
        .status(500)
        .json({ error: "Error connecting to the database" });
    }

    // Perform the query to retrieve all ratings
    connection.query("SELECT * FROM rating", (error, results) => {
      // Release the connection back to the pool
      connection.release();

      if (error) {
        // If an error occurs, send an error response
        return res.status(500).json({ error: "Error querying the database" });
      }

      // Check if any ratings exist
      if (results.length === 0) {
        return res.status(404).json({ error: "No ratings found" });
      }

      // Send the response with the retrieved ratings
      res.status(200).json(results);
    });
  });
};

module.exports = {
  getAllRatingsByUserId,
  getRatingByOrderId,
  saveRating,
  updateRating,
  getRatingsofStation,
  getAllRatings,
};
