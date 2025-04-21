const pool = require("../models/db");
const { querydorminfo } = require("../querys/getdorminfoquery");
exports.getdorminfo = async (req, res) => {
  try {
    const result = await pool.query(querydorminfo);
    res.json({
      success: true,
      data: result.rows.map((d) => ({
        ...d,
        infrastructure:
          typeof d.infrastructure === "string"
            ? JSON.parse(d.infrastructure.replace(/'/g, '"'))
            : d.infrastructure,
      })),
    });
  } catch (err) {
    console.error("Error getting dorm info:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};