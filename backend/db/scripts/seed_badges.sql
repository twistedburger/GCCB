INSERT INTO badge (key, title, category, icon_key, metric, metric_arg, threshold, tier)
VALUES

  -- Eco Impact Badges
  ('first_step',        'First Step',        'eco_impact', 'leaf',    'co2_saved_kg', NULL,      1,   1),
  ('carbon_cutter',     'Carbon Cutter',     'eco_impact', 'leaf',    'co2_saved_kg', NULL,      10,  1),
  ('goin_green',        'Goin'' Green',       'eco_impact', 'leaf',    'co2_saved_kg', NULL,      50,  2),
  ('eco_enforcer',      'Eco Enforcer',      'eco_impact', 'star',    'co2_saved_kg', NULL,      100, 3),
  ('planet_protector',  'Planet Protector',  'eco_impact', 'globe',   'co2_saved_kg', NULL,      500, 3),

  -- Trip Milestones Badges
  ('first_ride',         'First Ride',         'trips', 'bicycle',  'trip_count', NULL, 1,   1),
  ('routes_regular',     'Routes Regular',     'trips', 'calendar', 'trip_count', NULL, 10,  1),
  ('frequent_flyer',     'Frequent Flyer',     'trips', 'repeat',   'trip_count', NULL, 25,  2),
  ('route_runner',       'Route Runner',       'trips', 'repeat',   'trip_count', NULL, 50,  2),
  ('commute_conqueror',  'Commute Conqueror',  'trips', 'award',    'trip_count', NULL, 100, 3),

  --Mode Explorer — Bicycle Badges
  ('pedal_pioneer',   'Pedal Pioneer',   'modes', 'bicycle', 'mode_trips', 'bicycle', 3,  1),
  ('cycle_champion',  'Cycle Champion',  'modes', 'bicycle', 'mode_trips', 'bicycle', 10, 2),
  ('bicycle_baron',   'Bicycle Baron',   'modes', 'bicycle', 'mode_trips', 'bicycle', 25, 3),

  -- Mode Explorer — Transit Badges
  ('transit_trekker',     'Transit Trekker',     'modes', 'bus', 'mode_trips', 'transit', 3,  1),
  ('transit_traveler',    'Transit Traveler',    'modes', 'bus', 'mode_trips', 'transit', 10, 2),
  ('transit_trailblazer', 'Transit Trailblazer', 'modes', 'bus', 'mode_trips', 'transit', 25, 3),

  -- Mode Explorer Carpool Badges
  ('carpool_comrade',   'Carpool Comrade',   'modes', 'car', 'mode_trips', 'car', 3,  1),
  ('carpool_commander', 'Carpool Commander', 'modes', 'car', 'mode_trips', 'car', 10, 2),
  ('carpool_champion',  'Carpool Champion',  'modes', 'car', 'mode_trips', 'car', 25, 3),

  -- Mode Explorer  Walk Badges 
  ('wandering_walker', 'Wandering Walker', 'modes', 'walking', 'mode_trips', 'walk', 3,  1),
  ('pavement_pounder', 'Pavement Pounder', 'modes', 'walking', 'mode_trips', 'walk', 10, 2),
  ('trek_titan',       'Trek Titan',       'modes', 'walking', 'mode_trips', 'walk', 25, 3),

  -- Social Badges
  ('route_rookie',       'Route Rookie',       'social', 'plus-circle', 'routes_created', NULL, 1,  1),
  ('reliable_router',    'Reliable Router',    'social', 'map',         'routes_created', NULL, 10, 2),
  ('community_champion', 'Community Champion', 'social', 'users',       'routes_created', NULL, 25, 3);