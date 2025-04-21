const applyApplicationquery = `
  INSERT INTO application (student_id, room_id)
  VALUES (
    $1,
    (
      SELECT id FROM rooms
      WHERE hall_id = $2 AND room_type = $3
      LIMIT 1
    )
  )
`;
module.exports = applyApplicationquery;
