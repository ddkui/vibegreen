-- Run this in your Neon SQL Editor to create the community table

CREATE TABLE community_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    submitted_by VARCHAR(100),
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Create an index to make fetching approved locations faster
CREATE INDEX idx_approved_locations ON community_locations(approved, created_at DESC);
