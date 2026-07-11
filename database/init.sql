CREATE TABLE IF NOT EXISTS Users (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    display_name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS Roles (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Permissions (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    resource VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    UNIQUE (resource, action)
);

CREATE TABLE IF NOT EXISTS Role_Permissions (
    role_id INT REFERENCES Roles(id) ON DELETE CASCADE,
    permission_id INT REFERENCES Permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS User_Roles (
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    role_id INT REFERENCES Roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS Messages (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES Users(id),
    message_text TEXT
);

CREATE TABLE IF NOT EXISTS Attachments (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    message_id INT NOT NULL REFERENCES Messages(id),
    filename VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

---

INSERT INTO Roles (name)
VALUES 
    ('admin'),
    ('moderator'),
    ('peasant')
ON CONFLICT DO NOTHING;

INSERT INTO Permissions (resource, action)
VALUES
    ('messages', 'read'),
    ('messages', 'create'),
    ('messages', 'update_self'),
    ('messages', 'update_other'),
    ('messages', 'delete_self'),
    ('messages', 'delete_other'),
    ('users', 'read'),
    ('users', 'manage'),
    ('users', 'delete')
ON CONFLICT DO NOTHING;

INSERT INTO Role_Permissions (role_id, permission_id)
SELECT r.id, p.id
FROM Roles r, Permissions p
WHERE r.name = 'admin'
    AND p.resource IN ('messages', 'users');

INSERT INTO Role_Permissions (role_id, permission_id)
SELECT r.id, p.id
FROM Roles r, Permissions p
WHERE r.name = 'moderator'
    AND p.resource = 'messages'
    AND p.action <> 'update_other';

INSERT INTO Role_Permissions (role_id, permission_id)
SELECT r.id, p.id
FROM Roles r, Permissions p
WHERE r.name = 'peasant'
    AND p.resource = 'messages'
    AND p.action IN ('read', 'create', 'update_self', 'delete_self');

SELECT * FROM Role_Permissions;







