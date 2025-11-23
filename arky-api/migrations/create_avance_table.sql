CREATE TABLE IF NOT EXISTS Avance (
    id SERIAL PRIMARY KEY,
    rubro_id INTEGER REFERENCES Rubro(id) ON DELETE CASCADE,
    obra_id INTEGER REFERENCES Obra(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT NOW(),
    uploaded_by INTEGER REFERENCES "User"(id),
    descripcion TEXT
);
