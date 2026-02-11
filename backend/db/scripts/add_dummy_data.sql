-- 1. Transportation (Static Data)
INSERT INTO "transportation" (mode, carbon_savings) VALUES
('Bus', 0.85),
('Car', 0.00),
('Bicycle', 1.0),
('Walk', 1.0);

-- 2. Users
INSERT INTO "user" (email, role, name, nickname, active) VALUES
('jamie@test.com', 'user', 'Jamie Kim', 'justJam', true),
('claudia@test.com', 'moderator', 'Claudia Le', 'cloudia', true),
('aaron@test.com', 'admin', 'Aaron Tsang', 'masked_man', true),
('dylan@test.com', 'user', 'Dylan Reimer', 'dartFrog', true);

-- 3. Vehicles
INSERT INTO "vehicle" (driver_id, insurance, license, model, make, number_seats, e_v) VALUES 
(2, true, 'VAN-123', 'Model 3', 'Tesla', 4, true),
(3, true, 'DRV-789', 'Civic', 'Honda', 4, false),
(4, false, 'DART-456', '320i', 'BMW', 4, true);

-- 4. Events
INSERT INTO "event" (title, creator_id, event_time, location, verified, need_approval, description) VALUES
('BCIT Tech Mixer', 3, '2026-04-10 17:30:00', '555 Seymour St, Vancouver, BC V6B 3H6', true, false, 'Networking for computing students.'),
('Earth Day Clean-up', 2, '2026-04-22 09:00:00', 'Science World', true, true, 'Join us for a morning of eco-action!'),
('Late Night Hackathon', 1, '2026-05-15 20:00:00', 'BCIT Burnaby Campus', false, false, 'Coding until the sun comes up.');

-- 5. Routes ("path" column uses GeoJSON format)
INSERT INTO "route" (title, creator_id, transportation_mode, origin, destination, distance, depart_time, max_ppl, completed, path) VALUES
('Morning BCIT Commute', 1, 'Bus', '49.2662,-123.1558', '555 Seymour St, Vancouver, BC', 6.5, '2026-04-10 08:30:00', 0, true, 
 '{"type": "LineString", "coordinates": [[-123.1558, 49.2662], [-123.1322, 49.2785], [-123.1156, 49.2845]]}'),

('Carpool to Tech Mixer', 2, 'Car', '3768 Welwyn St, Vancouver, BC V5N 3Y8', '555 Seymour St, Vancouver, BC V6B 3H6', 12.2, '2026-04-10 16:45:00', 3, false, 
 '{"type": "LineString", "coordinates": [[-122.9921, 49.2432], [-123.0567, 49.2611], [-123.1156, 49.2845]]}'),

('Eco-Walk to Park', 3, 'Walk', 'Waterfront Station, Vancouver', 'Science World, Vancouver', 3.5, '2026-04-22 08:15:00', 10, false, 
 '{"type": "LineString", "coordinates": [[-123.1115, 49.2859], [-123.1088, 49.2798], [-123.1031, 49.2733]]}'),

('Midnight Bike Run', 4, 'Bicycle', '49.2276,-123.0034', '49.2827,-123.1207', 11.5, '2026-04-11 23:00:00', 0, false, 
 '{"type": "LineString", "coordinates": [[-123.0034, 49.2276], [-123.0500, 49.2500], [-123.1207, 49.2827]]}');
 
-- 6. Event-Route Junction
INSERT INTO "event_route" (event_id, route_id) VALUES
(1, 1), 
(1, 2), 
(2, 3); 

-- 7. User-Route Junction
INSERT INTO "user_route" (user_id, route_id) VALUES
(1, 1), 
(2, 2), 
(1, 2), 
(4, 2), 
(3, 3); 

-- 8. Badges
INSERT INTO "badge" (title, icon, category, description) VALUES
('Carbon Warrior', 'leaf-icon', 'Environmental', 'Saved 100kg of CO2!'),
('Frequent Flyer', 'train-icon', 'Activity', 'Took 50 SkyTrain trips!'),
('Safety First', 'shield-icon', 'Verification', 'Verified driver license.'),
('Early Bird', 'sun-icon', 'Behavior', 'Joined 5 commutes before 7 AM!');

-- 9. User Badges
INSERT INTO "user_badge" (user_id, badge_id, date_earned) VALUES
(2, 1, '2026-01-15 10:00:00'),
(2, 3, '2026-01-20 14:30:00'),
(1, 2, '2026-02-01 09:15:00'),
(3, 4, '2026-02-05 08:00:00');