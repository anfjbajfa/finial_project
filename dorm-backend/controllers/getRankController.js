const pool = require("../models/db");
const { getDormsRankQuery } = require("../querys/getRankquery");

const getRank = async (req, res) => {
  try {
    const { department, max_budget, room_type, gender_inclusive, weights } =
      req.body;

    const parsedWeights =
      typeof weights === "string" ? JSON.parse(weights) : weights;

    const query = getDormsRankQuery(parsedWeights);

    const values = [
      department, // $1
      parseFloat(max_budget), // $2
      room_type, // $3 (string)
      gender_inclusive, // $4 (boolean)
      parseFloat(parsedWeights.max_budget), // $5
      parseFloat(parsedWeights.room_type), // $6
      parseFloat(parsedWeights.gender_inclusive), // $7
      parseFloat(parsedWeights.department), // $8
    ];

    const result = await pool.query(query, values);
    res.json({ success: true, rank: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = getRank;
