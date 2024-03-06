const { pool } = require("./dependencies");

const getAllRatingsByStationId = async (req, res) => {
  const stationId = req.params.stationId;

  if (!stationId) {
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
      "SELECT * FROM rating WHERE stationId = ?",
      [stationId],
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
            .json({ error: "No ratings found for the station ID" });
        }

        // Send the response with the retrieved ratings
        res.status(200).json({ ratings: results });
      }
    );
  });
};

module.exports = {
  getAllRatingsByStationId,
};
