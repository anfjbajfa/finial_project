const getDormsRankQuery = (weights) => `
WITH target_building AS (
  SELECT geom
  FROM academic_buildings
  WHERE department ILIKE '%' || $1 || '%'
  LIMIT 1
)
SELECT
  h.id     AS hall_id,
  h.name,
  h.lat,
  h.lng,
  r.room_type,
  r.price_year,

  ST_DistanceSphere(h.geom, tb.geom) AS distance_meters,

  (
    $5::float8 * GREATEST(0, 1 - (r.price_year / $2::float))
    + $6::float8 * (CASE WHEN r.room_type = $3 THEN 1 ELSE 0 END)
    + $7::float8 * (CASE WHEN h.gender_inclusive = $4 THEN 1 ELSE 0 END)
    + $8::float8 * (1 / (ST_DistanceSphere(h.geom, tb.geom) + 1))
  ) AS match_score

FROM halls h
JOIN rooms r ON r.hall_id = h.id
CROSS JOIN target_building tb
ORDER BY match_score DESC;

`;

module.exports = {
  getDormsRankQuery,
};
