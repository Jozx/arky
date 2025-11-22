-- Create Arquitecto table
CREATE TABLE IF NOT EXISTS Arquitecto (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
    numero_licencia VARCHAR(255)
);

-- Create Cliente table
CREATE TABLE IF NOT EXISTS Cliente (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
    cif_empresa VARCHAR(255)
);
