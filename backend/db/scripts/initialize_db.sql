-- 1. Create User table
CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL,
    name VARCHAR(50) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    profile_pic VARCHAR(255)
);


-- 2. Create Transportation table
CREATE TABLE IF NOT EXISTS "transportation" (
    mode VARCHAR(20) PRIMARY KEY,
    carbon_savings FLOAT NOT NULL
);


-- 3. Create Vehicle table
CREATE TABLE IF NOT EXISTS "vehicle" (
    id SERIAL PRIMARY KEY,
    driver_id INT NOT NULL,
    insurance BOOLEAN NOT NULL,
    license VARCHAR(20) NOT NULL,
    model VARCHAR(20) NOT NULL,
    make VARCHAR(20) NOT NULL,
    number_seats INT NOT NULL,
    e_v BOOLEAN NOT NULL,
    CONSTRAINT fk_driver FOREIGN KEY (driver_id) REFERENCES "user"(id)
);

-- 4. Create Event table
CREATE TABLE IF NOT EXISTS "event" (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    creator_id INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    verified BOOLEAN NOT NULL,
    need_approval BOOLEAN NOT NULL,
    description VARCHAR(255),
    rejection_reason VARCHAR(255),
    CONSTRAINT fk_event_creator FOREIGN KEY (creator_id) REFERENCES "user"(id)
);

-- 5. Create Route table
CREATE TABLE IF NOT EXISTS "route" (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    creator_id INT NOT NULL,
    transportation_mode VARCHAR(20) NOT NULL,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    distance FLOAT NOT NULL,
    depart_time TIMESTAMP NOT NULL,
    max_ppl INT NOT NULL,
    completed BOOLEAN NOT NULL,
    description VARCHAR(255),
    rejection_reason VARCHAR(255),
    path VARCHAR(1000) NOT NULL,
    CONSTRAINT fk_route_creator FOREIGN KEY (creator_id) REFERENCES "user"(id),
    CONSTRAINT fk_route_transport FOREIGN KEY (transportation_mode) REFERENCES "transportation"(mode)
);

-- 6. Junction Table: event_route
CREATE TABLE IF NOT EXISTS "event_route" (
    event_id INT NOT NULL,
    route_id INT NOT NULL,
    PRIMARY KEY (event_id, route_id),
    CONSTRAINT fk_er_event FOREIGN KEY (event_id) REFERENCES "event"(id),
    CONSTRAINT fk_er_route FOREIGN KEY (route_id) REFERENCES "route"(id)
);

-- 7. Junction Table: user_route
CREATE TABLE IF NOT EXISTS "user_route" (
    user_id INT NOT NULL,
    route_id INT NOT NULL,
    PRIMARY KEY (user_id, route_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES "user"(id),
    CONSTRAINT fk_ur_route FOREIGN KEY (route_id) REFERENCES "route"(id)
);

-- 8. Badge Table
CREATE TABLE IF NOT EXISTS "badge" (
    id SERIAL PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    icon VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description VARCHAR(255)
);

-- 9. Junction Table: user_badge
CREATE TABLE IF NOT EXISTS "user_badge" (
    user_id INT NOT NULL,
    badge_id INT NOT NULL,
    date_earned TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id),
    CONSTRAINT fk_ub_user FOREIGN KEY (user_id) REFERENCES "user"(id),
    CONSTRAINT fk_ub_badge FOREIGN KEY (badge_id) REFERENCES "badge"(id)
);
