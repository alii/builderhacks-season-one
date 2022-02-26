SELECT "Ticket".id, distance FROM "Ticket"
  INNER JOIN "Collection" C on C.id = "Ticket".collection_id
  LEFT JOIN LATERAL (
    SELECT ( 3959 * acos( cos( radians(latitude) ) * cos( radians( :lat ) ) * cos( radians( :lng ) - radians(longitude) )
        + sin( radians(latitude) ) * sin( radians( :lat ) ) ) ) AS distance
    ) AS calculated_distance ON TRUE
WHERE user_id IS NULL
  AND releases_at < NOW() AND closes_at > NOW()
  AND distance < 1
  AND (
    SELECT count(*) FROM "Ticket"
    WHERE user_id = :user_id
      AND collection_id = C.id
  ) = 0
LIMIT 1