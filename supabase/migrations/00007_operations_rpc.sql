-- Helper for route performance
CREATE OR REPLACE FUNCTION get_route_performance()
RETURNS TABLE (
  pickup_location TEXT,
  destination TEXT,
  booking_count BIGINT,
  total_revenue DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tr.pickup_location, 
    tr.destination, 
    COUNT(tr.id) as booking_count,
    SUM(COALESCE(tr.price_quoted, 0)) as total_revenue
  FROM transfer_requests tr
  WHERE tr.status = 'completed'
  GROUP BY tr.pickup_location, tr.destination
  ORDER BY booking_count DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
