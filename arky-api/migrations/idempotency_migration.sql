-- Create idempotency_keys table
CREATE TABLE IF NOT EXISTS idempotency_keys (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL UNIQUE,
    user_id INTEGER REFERENCES "User"(id),
    path VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    params TEXT, -- JSON string of query/body params for validation
    response_code INTEGER,
    response_body TEXT, -- JSON string of the response
    created_at TIMESTAMP DEFAULT NOW(),
    locked_at TIMESTAMP -- To handle concurrent requests with same key
);

CREATE INDEX idx_idempotency_key ON idempotency_keys(key);
CREATE INDEX idx_idempotency_user ON idempotency_keys(user_id);
