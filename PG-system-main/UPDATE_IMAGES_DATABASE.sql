-- Update all PG images in database to use the new downloaded images
UPDATE pgs SET image = '/pg-images/pg1-sunshine.jpg' WHERE pg_id = 1;
UPDATE pgs SET image = '/pg-images/pg2-greenvalley.jpg' WHERE pg_id = 2;
UPDATE pgs SET image = '/pg-images/pg3-citycomfort.jpg' WHERE pg_id = 3;
UPDATE pgs SET image = '/pg-images/pg4-royalstay.jpg' WHERE pg_id = 4;
UPDATE pgs SET image = '/pg-images/pg5-metroliving.jpg' WHERE pg_id = 5;
UPDATE pgs SET image = '/pg-images/pg6-capitalhomes.jpg' WHERE pg_id = 6;
UPDATE pgs SET image = '/pg-images/pg7-budgetstay.jpg' WHERE pg_id = 7;
UPDATE pgs SET image = '/pg-images/pg8-eliteliving.jpg' WHERE pg_id = 8;
UPDATE pgs SET image = '/pg-images/pg9-luxury.jpg' WHERE pg_id = 9;

-- Verify the updates
SELECT pg_id, pg_name, image FROM pgs ORDER BY pg_id;
