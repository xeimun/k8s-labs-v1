
CREATE DATABASE tododb;

\c tododb;

CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE
);
