CREATE TABLE IF NOT EXISTS "sso" (
    sso_id SERIAL PRIMARY KEY,
    school_name VARCHAR(255) UNIQUE NOT NULL,
    school_nickname VARCHAR(63),
    sso_connection VARCHAR(63) NOT NULL
);

INSERT INTO "sso" (school_name, school_nickname, sso_connection) VALUES
('British Columbia Institute of Technology', 'BCIT', 'Username-Password-Authentication'),
('Karel de Grote', 'KdG', 'Username-Password-Authentication'),
('University of British Columbia', 'UBC', 'Username-Password-Authentication'),
('Simon Fraser University', 'SFU', 'Username-Password-Authentication');