-- Optional: removes older demo/fake catalog listings from Supabase while keeping real uploaded products.
-- Safe to run if old products like Combine Harvester Main Pulley / Straw Reaper Bearing Housing still appear from database.
delete from public.products
where lower(coalesce(title,'')) in (
  lower('Combine Harvester Main Pulley'),
  lower('Straw Reaper Bearing Housing'),
  lower('Harvester Gear Drum Plate'),
  lower('Harvester Main Pulley'),
  lower('Bearing Housing')
)
or id::text like 'factory-%'
or id::text like 'demo-%'
or id::text like 'fake-%';
