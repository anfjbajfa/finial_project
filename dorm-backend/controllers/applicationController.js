const pool = require("../models/db");
const applyApplicationQuery = require("../querys/applyApplicationquery");

// student submit application
exports.applicationhandler = async (req, res) => {
  const { student_id, hall_id, room_type } = req.body;

  try {
    const result = await pool.query(applyApplicationQuery, [
      student_id,
      hall_id,
      room_type,
    ]);

    if (result.rowCount === 1) {
      return res
        .status(200)
        .json({ message: "Application submitted successfully" });
    } else {
      return res.status(400).json({ error: "Insert failed" });
    }
  } catch (err) {
    console.error("Application insert error:", err.message);
    return res.status(500).json({
      error: "Server error: failed to submit application",
    });
  }
};

// review applications
// get current login student id
exports.getStudentApplications = async (req, res) => {
  const { studentId } = req.params;

  try {
    console.log(studentId);
    const result = await pool.query(
      `
      SELECT 
  a.id AS application_id,
  a.student_id,
  u.first_name || ' ' || u.last_name AS student_name,
  h.name AS hall_name,
  r.room_type,
  a.status,
  a.apply_time,
  a.update_time,
  a.reason
FROM applications a
JOIN rooms r ON a.room_id = r.id
JOIN halls h ON r.hall_id = h.id
JOIN users u ON a.student_id = u.id
WHERE a.student_id = $1;
       `,
      [studentId]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("Error fetching student applications:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
};

// get all application records
exports.getAllApplications = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT 
  a.id AS application_id,
  a.student_id,
  u.first_name || ' ' || u.last_name AS student_name,
  h.name AS hall_name,
  r.room_type,
  a.status,
  a.apply_time,
  u.email,
  u.age,
  u.university,
  u.nationality,
  u.home_address,
  u.ssn,
  a.update_time,
  a.reason
FROM applications a
JOIN rooms r ON a.room_id = r.id
JOIN halls h ON r.hall_id = h.id
JOIN users u ON a.student_id = u.id;
      `
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("Error fetching all applications:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.deleteStudentApplication = async (req, res) => {
  const { student_id } = req.body;
  try {
    const result = await pool.query(
      `
      DELETE FROM applications WHERE student_id = $1;

      `,
      [student_id]
    );
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No application found to delete" });
    }

    return res.status(200).json({ message: "Application deleted" });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

exports.acceptApplication = async (req, res) => {
  const { application_id } = req.body;
  try {
    const result = await pool.query(
      `
      UPDATE applications SET 
        status = 'accept',
        reason = NULL,
        update_time = NOW()
      WHERE id = $1; 
      `,
      [application_id]
    );
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No application found to accept" });
    }
    return res.status(200).json({ message: "Application updated" });
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
};

exports.rejectApplication = async (req, res) => {
  const { application_id, reason } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE applications SET
        status = 'reject',
        reason = $2,
        update_time = NOW() 
      WHERE id = $1; 
      `,
      [application_id, reason]
    );
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No application found to reject" });
    }
    return res.status(200).json({ message: "Application updated" });
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
};
