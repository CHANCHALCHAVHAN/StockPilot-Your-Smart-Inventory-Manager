CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100)        NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255)        NOT NULL,
  role       VARCHAR(50)         NOT NULL CHECK (role IN ('Inventory Manager', 'Warehouse Staff')),
  created_at TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);
