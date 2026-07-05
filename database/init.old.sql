CREATE TABLE IF NOT EXISTS Users (
    user_id UUID PRIMARY KEY DEFAULT uuidv7(),
    display_name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS Roles (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS User_Roles (
    user_id UUID NOT NULL REFERENCES Users(user_id),
    role_id INT NOT NULL REFERENCES Roles(id),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS Permissions (
    resource VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    PRIMARY KEY (resource, action)
);

CREATE TABLE IF NOT EXISTS Role_Permissions (
    role_id INT REFERENCES Roles(id),
    resource VARCHAR(255),
    action VARCHAR(255),
    PRIMARY KEY (role_id, resource, action),
    FOREIGN KEY (resource, action)
        REFERENCES Permissions(resource, action)
);


CREATE TABLE IF NOT EXISTS Messages (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES Users(user_id),
    message_text TEXT
);

CREATE TABLE IF NOT EXISTS Attachments (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    message_id INT NOT NULL REFERENCES Messages(id),
    filename VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL
);

-- Users
INSERT INTO Users (display_name, password_hash, email)
VALUES('Noah', 'loplop123', 'noahgames99@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Roles
INSERT INTO Roles (name, description)
VALUES('admin', 'God')
ON CONFLICT (name) DO NOTHING;

INSERT INTO Roles (name, description)
VALUES('moderator', 'Angel')
ON CONFLICT (name) DO NOTHING;

INSERT INTO Roles (name, description)
VALUES('member', 'Peasant')
ON CONFLICT (name) DO NOTHING;

-- Permissions
INSERT INTO Permissions (resource, action)
VALUES
    ('messages', 'create'),
    ('messages', 'read'),
    ('messages', 'update'),
    ('messages', 'delete'),
    ('users', 'read'),
    ('users', 'update'),
    ('users', 'delete')
ON CONFLICT (resource, action) DO NOTHING;

-- Role Permissions
INSERT INTO Role_Permissions (role_id, resource, action)
SELECT r.id, p.resource, p.action
FROM Roles r
CROSS JOIN Permissions p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO Role_Permissions (role_id, resource, action)
SELECT r.id, p.resource, p.action
FROM Roles r
CROSS JOIN Permissions p
WHERE r.name = 'moderator'
    AND p.resource = 'messages'
ON CONFLICT DO NOTHING;


