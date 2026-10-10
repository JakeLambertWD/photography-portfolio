-- Sample spots so the /maps page has something to show before the "add spot" flow exists.
-- Run after 002_photo_spots.sql. Safe to delete these rows later:
--   delete from photo_spot where title like '[Sample]%';

with spots as (
  insert into photo_spot (title, notes, postcode, latitude, longitude, status, tags)
  values
    ('[Sample] London Bridge arches', 'Underneath the bridge from the Thames Path.', 'SE1 2PF', 51.5076, -0.0877, 'idea', '{"golden hour","silhouettes"}'),
    ('[Sample] Millennium Bridge', 'Leading lines towards St Paul''s.', 'EC4V 3QH', 51.5095, -0.0985, 'idea', '{"blue hour","leading lines"}'),
    ('[Sample] Tower Bridge from Shad Thames', null, 'SE1 2YD', 51.5039, -0.0727, 'shot', '{"long exposure"}'),
    ('[Sample] Leadenhall Market', 'Christmas lights in December.', 'EC3V 1LT', 51.5128, -0.0835, 'idea', '{"street"}'),
    ('[Sample] Sky Garden', 'Book a free slot two weeks ahead.', 'EC3M 8AF', 51.5111, -0.0835, 'idea', '{"cityscape"}'),
    ('[Sample] Borough Market', 'Early morning, before the crowds.', 'SE1 9AL', 51.5055, -0.0910, 'shot', '{"street"}'),
    ('[Sample] Southwark Cathedral', null, 'SE1 9DA', 51.5061, -0.0898, 'idea', '{"architecture"}'),
    ('[Sample] Hay''s Galleria', 'Reflections after rain.', 'SE1 2HD', 51.5054, -0.0833, 'idea', '{"reflections"}')
  returning id, title
)
insert into photo_spot_image (spot_id, image_url, caption, position)
select spots.id, '/pang-yuhao-ywFIm7uev64-unsplash.jpg', photo.caption, photo.position
from spots
cross join lateral (
  values
    (0, 'Reference shot. Replace this with your own inspiration photo.'),
    (1, case when spots.title = '[Sample] London Bridge arches'
          then 'Arches from below at golden hour. Wait for walkers to cross the light.' end),
    (2, case when spots.title = '[Sample] London Bridge arches'
          then 'Low tide from the Hay''s Wharf steps. 24mm, f/11, 2s with the ND.' end)
) as photo(position, caption)
where photo.position = 0 or spots.title = '[Sample] London Bridge arches';
