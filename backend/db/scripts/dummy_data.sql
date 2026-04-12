DO $$
DECLARE
  userOne      INT := 1;  -- dylan@gccb.com   (user)
  userTwo      INT := 2;  -- jamie@gccb.com   (user)
  adminUser    INT := 3;  -- aaron@gccb.com   (admin)
  modUser      INT := 4;  -- claudia@gccb.com (moderator)
  firstRouteId INT;
BEGIN

-- Update profiles
INSERT INTO "user" (email, role, name, nickname, active) VALUES
  ('dylan@gccb.com', 'user', 'Dylan Reimer', 'dartFrog', true),
  ('jamie@gccb.com', 'user', 'Jamie Kim', 'justJam', true),
  ('aaron@gccb.com', 'admin', 'Aaron Tsang', 'masked_man', true),
  ('claudia@gccb.com', 'moderator', 'Claudia Le', 'cloudia', true);

  INSERT INTO "vehicle" (driver_id, insurance, license, model, make, number_seats, e_v) VALUES
  (adminUser, true,  'DRV-789',  'Civic',   'Honda', 4, false),
  (modUser,   true,  'VAN-123',  'Model 3', 'Tesla', 4, true),
  (userTwo,   false, 'DART-456', '320i',    'BMW',   4, true);

-- Events
  INSERT INTO "event" (title, creator_id, event_time, location, verified, need_approval, description, location_geog) VALUES
  ('BCIT Tech Mixer',
   adminUser, '2026-06-10 17:30:00',
   '555 Seymour St, Vancouver, BC V6B 3H6',
   true, false,
   'Networking for computing students.',
   ST_SetSRID(ST_MakePoint(-123.11528, 49.28341), 4326)),

  ('Earth Day Clean-up',
   modUser, '2026-06-22 09:00:00',
   'Science World, Vancouver',
   true, true,
   'Join us for a morning of eco-action!',
   ST_SetSRID(ST_MakePoint(-123.10376, 49.27325), 4326)),

  ('Late Night Hackathon',
   userOne, '2026-07-15 20:00:00',
   'BCIT Burnaby Campus',
   false, false,
   'Coding until the sun comes up.',
   ST_SetSRID(ST_MakePoint(-123.0017, 49.2505), 4326));


  -- Routes (7 completed routes, 3 rejected)
  -- Modes: Transit, Walk, Bicycle, Car
  SELECT COALESCE(MAX(id), 0) + 1 INTO firstRouteId FROM route;

  INSERT INTO "route" (title, creator_id, transportation_mode, origin, destination, distance, depart_time, max_ppl, completed, rejection_reason, path, origin_geog, created_at) VALUES

  -- Oct 2025 — Transit (user1)
  ('Morning Transit Commute',
   userOne, 'Transit',
   'W 4th Ave & Yew St, Vancouver', 'BCIT Burnaby Campus',
   8.2, '2026-03-15 08:15:00', 5, true, NULL,
   '{"legs":[{"steps":[{"distanceMeters":8200,"transitDetails":{"transitLine":{"vehicle":{"type":"Transit"}}},"travelMode":"TRANSIT"}]}]}',
   ST_SetSRID(ST_MakePoint(-123.1545, 49.2681), 4326),
   '2026-03-15 07:50:00'),

  -- Nov 2025 — Carpool (user2 driving, user1 passenger)
  ('Carpool to Tech Mixer',
   userTwo, 'Car',
   '3768 Welwyn St, Vancouver, BC', '555 Seymour St, Vancouver, BC',
   12.2, '2026-03-22 16:45:00', 3, true, NULL,
   '{"legs":[{"steps":[{"distanceMeters":12200,"travelMode":"DRIVE"}]}]}',
   ST_SetSRID(ST_MakePoint(-123.0565, 49.2458), 4326),
   '2026-03-22 16:20:00'),

  -- Dec 2025 — Walk (user1)
  ('Eco-Walk to Science World',
   userOne, 'Walk',
   'Waterfront Station, Vancouver', 'Science World, Vancouver',
   1.9, '2026-03-28 08:15:00', 10, true, NULL,
   '{"legs":[{"steps":[{"distanceMeters":1900,"travelMode":"WALKING"}]}]}',
   ST_SetSRID(ST_MakePoint(-123.1115, 49.2856), 4326),
   '2026-03-28 07:50:00'),

  -- Jan 2026 — Carpool (user1 driving, user2 passenger)
  ('Carpool to Hackathon',
   userOne, 'Car',
   'Burnaby, BC', 'BCIT Burnaby Campus',
   6.5, '2026-04-01 19:30:00', 3, true, NULL,
   '{"legs":[{"steps":[{"distanceMeters":6500,"travelMode":"DRIVE"}]}]}',
   ST_SetSRID(ST_MakePoint(-122.9921, 49.2432), 4326),
   '2026-04-01 19:00:00'),

  -- Apr 3 — Rejected route (user2)
  ('Late Night Drive',
   userTwo, 'Car',
   'Surrey, BC', 'Vancouver, BC',
   28.0, '2026-04-03 23:00:00', 2, false, 'Dangerous Activity',
   '{"legs":[{"steps":[{"distanceMeters":28000,"travelMode":"DRIVE"}]}]}',
   ST_SetSRID(ST_MakePoint(-122.8490, 49.1913), 4326),
   '2026-04-03 22:30:00'),

  -- Apr 05 — Rejected route (user1)
  ('BCIT Carpool',
   userOne, 'Car',
   'Richmond, BC', 'BCIT Burnaby Campus',
   14.0, '2026-04-05 07:00:00', 4, false, 'Spam or Misleading Information',
   '{"legs":[{"steps":[{"distanceMeters":14000,"travelMode":"DRIVE"}]}]}',
   ST_SetSRID(ST_MakePoint(-123.1366, 49.1666), 4326),
   '2026-04-05 06:30:00'),

  -- Apr 07 — Rejected route (user2)
  ('Weekend Ride',
   userTwo, 'Bicycle',
   'Coquitlam, BC', 'Vancouver, BC',
   22.0, '2026-04-07 06:00:00', 3, false, 'Inappropriate Content',
   '{"legs":[{"steps":[{"distanceMeters":22000,"travelMode":"BICYCLING"}]}]}',
   ST_SetSRID(ST_MakePoint(-122.7932, 49.2838), 4326),
   '2026-04-07 05:30:00'),

  -- Feb 2026 — Bicycle (user2)
  ('Bike to Burnaby',
   userTwo, 'Bicycle',
   'New Westminster, BC', 'BCIT Burnaby Campus',
   9.7, '2026-04-05 07:45:00', 4, true, NULL,
   '{"legs":[{"steps":[{"distanceMeters":9700,"travelMode":"BICYCLING"}]}]}',
   ST_SetSRID(ST_MakePoint(-122.9110, 49.2057), 4326),
   '2026-04-05 07:20:00'),

  -- Feb 2026 — Carpool (user2 driving, user1 passenger)
  ('Evening Carpool Home',
   userTwo, 'Car',
   'BCIT Burnaby Campus', 'Richmond, BC',
   18.4, '2026-04-07 17:00:00', 3, true, NULL,
   '{"legs":[{"steps":[{"distanceMeters":18400,"travelMode":"DRIVE"}]}]}',
   ST_SetSRID(ST_MakePoint(-123.0017, 49.2505), 4326),
   '2026-04-07 16:35:00'),

  -- Mar 2026 — Transit (user1)
  ('Transit to Downtown',
   userOne, 'Transit',
   'Burnaby, BC', 'Downtown Vancouver',
   10.2, '2026-04-09 09:00:00', 5, true, NULL,
   '{"legs":[{"steps":[{"distanceMeters":10200,"transitDetails":{"transitLine":{"vehicle":{"type":"Transit"}}},"travelMode":"TRANSIT"}]}]}',
   ST_SetSRID(ST_MakePoint(-123.0200, 49.2488), 4326),
   '2026-04-09 08:35:00');

-- Route Participation
  INSERT INTO "user_route" (user_id, route_id) VALUES
  -- Transit commute: user1 creator + user2 joins
  (userOne, firstRouteId),
  (userTwo, firstRouteId),
  -- Carpool Nov: user2 driving, user1 passenger
  (userTwo, firstRouteId + 1),
  (userOne, firstRouteId + 1),
  -- Walk: user1 only
  (userOne, firstRouteId + 2),
  -- Carpool Jan: user1 driving, user2 passenger
  (userOne, firstRouteId + 3),
  (userTwo, firstRouteId + 3),
  -- Rejected routes: creator only, no passengers
  (userTwo, firstRouteId + 4),
  (userOne, firstRouteId + 5),
  (userTwo, firstRouteId + 6),
  -- Bike: user2 only
  (userTwo, firstRouteId + 7),
  -- Carpool Feb: user2 driving, user1 passenger
  (userTwo, firstRouteId + 8),
  (userOne, firstRouteId + 8),
  -- Transit Mar: user1 creator + user2 joins
  (userOne, firstRouteId + 9),
  (userTwo, firstRouteId + 9);

END $$;
