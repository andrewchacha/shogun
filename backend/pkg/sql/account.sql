
CREATE TABLE shogun.account (
    id BIGINT NOT NULL DEFAULT shogun.next_id() PRIMARY KEY,
    address VARCHAR(80) NOT NULL,
    user_id BIGINT NOT NULL,
    chain VARCHAR(10) NOT NULL,
    signature TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (address, chain),
    FOREIGN KEY (user_id) REFERENCES shogun.user(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_user_id ON shogun.account(user_id);