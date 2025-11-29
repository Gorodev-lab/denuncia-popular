-- ==========================================
-- GEOSPATIAL HOTSPOT ANALYSIS
-- Find areas with high report density
-- ==========================================

-- This query divides the geographic area into a grid and counts reports in each cell
-- Cell size: 0.01 degrees (approximately 1.1 km at the equator)

WITH grid_cells AS (
  SELECT 
    -- Round coordinates to create grid cells
    ROUND(lat::numeric, 2) as grid_lat,
    ROUND(lng::numeric, 2) as grid_lng,
    
    -- Count reports in each cell
    COUNT(*) as report_count,
    
    -- Calculate cell center coordinates
    ROUND(lat::numeric, 2) as center_lat,
    ROUND(lng::numeric, 2) as center_lng,
    
    -- Aggregate additional info
    array_agg(DISTINCT category) FILTER (WHERE category IS NOT NULL) as categories,
    array_agg(folio ORDER BY created_at DESC) as recent_folios
    
  FROM denuncias
  WHERE 
    lat IS NOT NULL 
    AND lng IS NOT NULL
    
  GROUP BY 
    ROUND(lat::numeric, 2),
    ROUND(lng::numeric, 2)
)

SELECT 
  grid_lat,
  grid_lng,
  report_count,
  center_lat,
  center_lng,
  categories,
  recent_folios[1:5] as top_5_recent_folios, -- Get 5 most recent
  
  -- Classify density
  CASE 
    WHEN report_count >= 10 THEN 'CRITICAL'
    WHEN report_count >= 5 THEN 'HIGH'
    WHEN report_count >= 2 THEN 'MEDIUM'
    ELSE 'LOW'
  END as density_level
  
FROM grid_cells

-- Order by hottest spots first
ORDER BY report_count DESC, grid_lat, grid_lng

-- Limit to top 100 hotspots
LIMIT 100;

-- ==========================================
-- ALTERNATIVE: Using PostGIS for more precise analysis
-- ==========================================
-- If PostGIS is enabled, you can use this more advanced query:

/*
WITH grid_cells AS (
  SELECT 
    ST_SnapToGrid(ST_SetSRID(ST_MakePoint(lng, lat), 4326), 0.01) as cell_geom,
    COUNT(*) as report_count,
    array_agg(DISTINCT category) FILTER (WHERE category IS NOT NULL) as categories
  FROM denuncias
  WHERE lat IS NOT NULL AND lng IS NOT NULL
  GROUP BY ST_SnapToGrid(ST_SetSRID(ST_MakePoint(lng, lat), 4326), 0.01)
)
SELECT 
  ST_Y(cell_geom) as center_lat,
  ST_X(cell_geom) as center_lng,
  report_count,
  categories,
  CASE 
    WHEN report_count >= 10 THEN 'CRITICAL'
    WHEN report_count >= 5 THEN 'HIGH'
    WHEN report_count >= 2 THEN 'MEDIUM'
    ELSE 'LOW'
  END as density_level
FROM grid_cells
ORDER BY report_count DESC
LIMIT 100;
*/
