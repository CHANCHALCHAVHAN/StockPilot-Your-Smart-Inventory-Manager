CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100)        NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255)        NOT NULL,
  role       VARCHAR(50)         NOT NULL CHECK (role IN ('Inventory Manager', 'Warehouse Staff')),
  reset_token VARCHAR(64),
  reset_token_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id         SERIAL PRIMARY KEY,
  sku        VARCHAR(50) UNIQUE NOT NULL,
  name       VARCHAR(255)       NOT NULL,
  category   VARCHAR(100)       NOT NULL,
  unit_of_measure VARCHAR(50)   NOT NULL,
  stock      INTEGER             DEFAULT 0,
  location   VARCHAR(100),
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_user ON products(user_id);
CREATE INDEX idx_products_category ON products(category);
