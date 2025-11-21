-- arky-api/setup.sql
fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Comentario (
id SERIAL PRIMARY KEY,
rubro_id INTEGER REFERENCES Rubro(id) ON DELETE CASCADE NOT NULL,
user_id INTEGER REFERENCES "User"(id) NOT NULL,
texto TEXT NOT NULL,
fecha_comentario TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tablas de Gestión Financiera y Evidencia

CREATE TABLE Pago (
id SERIAL PRIMARY KEY,
obra_id INTEGER REFERENCES Obra(id) ON DELETE CASCADE NOT NULL,
monto NUMERIC(15, 2) NOT NULL,
fecha_pago DATE NOT NULL,
metodo VARCHAR(50),
recibo_url TEXT
);

CREATE TABLE PagoRubro (
pago_id INTEGER REFERENCES Pago(id) ON DELETE CASCADE,
rubro_id INTEGER REFERENCES Rubro(id) ON DELETE CASCADE,
monto_asignado NUMERIC(15, 2) NOT NULL,
PRIMARY KEY (pago_id, rubro_id)
);

CREATE TABLE Media (
id SERIAL PRIMARY KEY,
obra_id INTEGER REFERENCES Obra(id) ON DELETE CASCADE NOT NULL,
rubro_id INTEGER REFERENCES Rubro(id) ON DELETE SET NULL, -- Se permite que el rubro sea NULL si el rubro se elimina
tipo media_tipo NOT NULL,
url_archivo TEXT NOT NULL,
descripcion TEXT,
fecha_subida TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);