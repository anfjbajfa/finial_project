const querydorminfo = `
  SELECT h.id, h.name,
    h.zip,
    h.lat,
    h.lng,
    h.gender_inclusive,
    h.infrastructure,
    h.pictures,
    json_agg(
      json_build_object(
        'room_id', r.id,
        'room_type', r.room_type,
        'price_year', r.price_year
      )
    ) AS rooms
  FROM halls h
  LEFT JOIN rooms r ON h.id = r.hall_id
  GROUP BY h.id, h.name, h.zip, h.gender_inclusive, h.infrastructure, h.pictures;
`;

module.exports = { querydorminfo };
