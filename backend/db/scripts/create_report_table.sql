CREATE TABLE report (
  id SERIAL PRIMARY KEY,
  reporter_id INT REFERENCES "user"(id),
  reason VARCHAR(255),
  explanation TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE report_user (
  report_id INT PRIMARY KEY REFERENCES report(id),
  user_id INT NOT NULL REFERENCES "user"(id)
);

CREATE TABLE report_event (
  report_id INT PRIMARY KEY REFERENCES report(id),
  event_id INT NOT NULL REFERENCES event(id)
);

CREATE TABLE report_route (
  report_id INT PRIMARY KEY REFERENCES report(id),
  route_id INT NOT NULL REFERENCES route(id)
);