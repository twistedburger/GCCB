CREATE TABLE IF NOT EXISTS event_verification (
  id SERIAL PRIMARY KEY,
  event_id INT NOT NULL,
  verified_by INT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  rejection_reason VARCHAR(50),
  rejection_detail VARCHAR(100),
  verified_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES "event"(id),
  CONSTRAINT fk_verified_by FOREIGN KEY (verified_by) REFERENCES "user"(id)
);

-- Add event verification rows from event table (those that need approval)
INSERT INTO event_verification (event_id, status)
SELECT id
FROM "event"
WHERE need_approval = true;