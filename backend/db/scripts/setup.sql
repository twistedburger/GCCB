CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. User
CREATE TABLE IF NOT EXISTS "user" (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    role        VARCHAR(20) NOT NULL,
    name        VARCHAR(50) NOT NULL,
    nickname    VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    profile_pic VARCHAR(255),
    last_login  TIMESTAMP,
    reported    INTEGER DEFAULT 0
);

-- 2. Transportation (static lookup)
CREATE TABLE IF NOT EXISTS "transportation" (
    mode           VARCHAR(20) PRIMARY KEY,
    carbon_savings FLOAT NOT NULL
);

-- 3. Vehicle
CREATE TABLE IF NOT EXISTS "vehicle" (
    id           SERIAL PRIMARY KEY,
    driver_id    INT NOT NULL,
    insurance    BOOLEAN NOT NULL,
    license      VARCHAR(20) NOT NULL,
    model        VARCHAR(20) NOT NULL,
    make         VARCHAR(20) NOT NULL,
    number_seats INT NOT NULL,
    e_v          BOOLEAN NOT NULL,
    CONSTRAINT fk_driver FOREIGN KEY (driver_id) REFERENCES "user"(id)
);

-- 4. Event
CREATE TABLE IF NOT EXISTS "event" (
    id               SERIAL PRIMARY KEY,
    title            VARCHAR(255) NOT NULL,
    creator_id       INT NOT NULL,
    event_time       TIMESTAMP NOT NULL,
    location         VARCHAR(255) NOT NULL,
    verified         BOOLEAN NOT NULL,
    need_approval    BOOLEAN NOT NULL,
    description      VARCHAR(255),
    rejection_reason VARCHAR(255),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reported         INTEGER DEFAULT 0,
    banner_url       TEXT,
    place_id         VARCHAR(50),
    location_geog    geography(POINT, 4326),
    CONSTRAINT fk_event_creator FOREIGN KEY (creator_id) REFERENCES "user"(id)
);

-- 5. Route
CREATE TABLE IF NOT EXISTS "route" (
    id                  SERIAL PRIMARY KEY,
    title               VARCHAR(255) NOT NULL,
    creator_id          INT NOT NULL,
    transportation_mode VARCHAR(20) NOT NULL,
    origin              VARCHAR(255) NOT NULL,
    destination         VARCHAR(255) NOT NULL,
    distance            FLOAT NOT NULL,
    depart_time         TIMESTAMP NOT NULL,
    max_ppl             INT NOT NULL,
    completed           BOOLEAN NOT NULL,
    description         VARCHAR(255),
    rejection_reason    VARCHAR(255),
    path                JSONB NOT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reported            INTEGER DEFAULT 0,
    origin_geog         geography(POINT, 4326),
    CONSTRAINT fk_route_creator    FOREIGN KEY (creator_id) REFERENCES "user"(id),
    CONSTRAINT fk_route_transport  FOREIGN KEY (transportation_mode) REFERENCES "transportation"(mode)
);

-- 6. Junction: event_route
CREATE TABLE IF NOT EXISTS "event_route" (
    event_id INT NOT NULL,
    route_id INT NOT NULL,
    PRIMARY KEY (event_id, route_id),
    CONSTRAINT fk_er_event FOREIGN KEY (event_id) REFERENCES "event"(id),
    CONSTRAINT fk_er_route FOREIGN KEY (route_id) REFERENCES "route"(id)
);

-- 7. Junction: user_route
CREATE TABLE IF NOT EXISTS "user_route" (
    user_id  INT NOT NULL,
    route_id INT NOT NULL,
    PRIMARY KEY (user_id, route_id),
    CONSTRAINT fk_ur_user  FOREIGN KEY (user_id)  REFERENCES "user"(id),
    CONSTRAINT fk_ur_route FOREIGN KEY (route_id) REFERENCES "route"(id)
);

-- 8. Badge
CREATE TABLE IF NOT EXISTS "badge" (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(50) NOT NULL,
    icon        VARCHAR(255) NOT NULL,
    category    VARCHAR(50) NOT NULL,
    description VARCHAR(255)
);

-- 9. Junction: user_badge
CREATE TABLE IF NOT EXISTS "user_badge" (
    user_id     INT NOT NULL,
    badge_id    INT NOT NULL,
    date_earned TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id),
    CONSTRAINT fk_ub_user  FOREIGN KEY (user_id)  REFERENCES "user"(id),
    CONSTRAINT fk_ub_badge FOREIGN KEY (badge_id) REFERENCES "badge"(id)
);

-- 10. SSO providers
CREATE TABLE IF NOT EXISTS "sso" (
    sso_id          SERIAL PRIMARY KEY,
    school_name     VARCHAR(255) UNIQUE NOT NULL,
    school_nickname VARCHAR(63),
    sso_connection  VARCHAR(63) NOT NULL
);

-- 11. Report
CREATE TABLE IF NOT EXISTS "report" (
    id              SERIAL PRIMARY KEY,
    reporter_id     INT REFERENCES "user"(id),
    reason          VARCHAR(255),
    explanation     TEXT,
    status          VARCHAR(20) DEFAULT 'pending',
    created_at      TIMESTAMP DEFAULT NOW(),
    rejection_reason VARCHAR(50),
    rejection_detail VARCHAR(100),
    report_target   VARCHAR(10),
    target_id       INTEGER,
    CONSTRAINT unique_report UNIQUE (reporter_id, report_target, target_id)
);

-- 12. Event verification
CREATE TABLE IF NOT EXISTS "event_verification" (
    id               SERIAL PRIMARY KEY,
    event_id         INT NOT NULL,
    verified_by      INT,
    status           VARCHAR(20) NOT NULL DEFAULT 'pending',
    rejection_reason VARCHAR(50),
    rejection_detail VARCHAR(100),
    verified_at      TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_ev_event       FOREIGN KEY (event_id)    REFERENCES "event"(id),
    CONSTRAINT fk_ev_verified_by FOREIGN KEY (verified_by) REFERENCES "user"(id)
);

CREATE INDEX IF NOT EXISTS event_geog_idx ON "event" USING gist(location_geog);
CREATE INDEX IF NOT EXISTS route_geog_idx ON "route" USING gist(origin_geog);

INSERT INTO "transportation" (mode, carbon_savings) VALUES
('Bus',     0.85),
('Transit', 0.85),
('Car',     0.00),
('Bicycle', 1.0),
('Walk',    1.0)
ON CONFLICT (mode) DO NOTHING;

INSERT INTO "sso" (school_name, school_nickname, sso_connection) VALUES
('British Columbia Institute of Technology', 'BCIT', 'Username-Password-Authentication'),
('Karel de Grote',                           'KdG',  'Username-Password-Authentication'),
('University of British Columbia',           'UBC',  'Username-Password-Authentication'),
('Simon Fraser University',                  'SFU',  'Username-Password-Authentication')
ON CONFLICT (school_name) DO NOTHING;

CREATE ROLE main_user WITH LOGIN PASSWORD '';

\set app_role main_user

GRANT SELECT, INSERT, UPDATE ON TABLE "user"             TO :app_role;
GRANT SELECT, INSERT, UPDATE ON TABLE event              TO :app_role;
GRANT SELECT, INSERT, UPDATE ON TABLE route              TO :app_role;
GRANT SELECT, INSERT, DELETE ON TABLE user_route         TO :app_role;
GRANT INSERT                 ON TABLE event_route        TO :app_role;
GRANT SELECT, INSERT, UPDATE ON TABLE report             TO :app_role;
GRANT SELECT, UPDATE         ON TABLE event_verification TO :app_role;
GRANT SELECT                 ON TABLE sso                TO :app_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO :app_role;