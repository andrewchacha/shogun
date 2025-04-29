CREATE TABLE shogun.user (
    id BIGINT NOT NULL DEFAULT shogun.next_id() PRIMARY KEY,
    name CITEXT CHECK ( LENGTH(name) <= 50 ) NOT NULL DEFAULT '',
    username CITEXT UNIQUE CHECK (LENGTH(username) >= 1 AND LENGTH(username) <= 18),
    thumbnail JSONB NOT NULL DEFAULT '{}',
    bio TEXT CHECK ( LENGTH(bio) <= 300 ) NOT NULL DEFAULT '',
    meta JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);